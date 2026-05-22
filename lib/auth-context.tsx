import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUser, saveUser, clearUser } from './storage';
import type { User, UserRole } from './types';

// ============================================================
// Chaves de armazenamento
// ============================================================
const ACCOUNTS_KEY = '@or_obras:accounts';
const OWNER_EMAIL = 'orengenharia.ce@gmail.com';

// ============================================================
// Tipos
// ============================================================
interface StoredAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // Armazenado como texto simples (app local sem servidor)
  role: UserRole;
  position?: string;
  phone?: string;
  active: boolean;
  createdAt: string;
  lastAccess?: string;
  invitedBy?: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  needsFirstSetup: boolean; // true se o Dono ainda não cadastrou senha
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  setupOwnerPassword: (name: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  // Gerenciamento de usuários (apenas owner/admin)
  getAccounts: () => Promise<StoredAccount[]>;
  inviteUser: (email: string, name: string, role: UserRole, position?: string) => Promise<{ success: boolean; tempPassword?: string; error?: string }>;
  removeUser: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ============================================================
// Helpers
// ============================================================
function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

async function getAccounts(): Promise<StoredAccount[]> {
  try {
    const raw = await AsyncStorage.getItem(ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function saveAccounts(accounts: StoredAccount[]) {
  await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

// ============================================================
// Provider
// ============================================================
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsFirstSetup, setNeedsFirstSetup] = useState(false);

  useEffect(() => {
    (async () => {
      // Verificar se o Dono da Conta já cadastrou senha
      const accounts = await getAccounts();
      const ownerAccount = accounts.find(a => a.email.toLowerCase() === OWNER_EMAIL.toLowerCase());

      if (!ownerAccount) {
        // Primeiro acesso: Dono ainda não configurou senha
        setNeedsFirstSetup(true);
      }

      // Restaurar sessão salva
      const stored = await getUser();
      if (stored) {
        setUser(stored);
      }
      setIsLoading(false);
    })();
  }, []);

  // Configurar senha do Dono no primeiro acesso
  const setupOwnerPassword = async (name: string, password: string) => {
    if (!name.trim()) return { success: false, error: 'Informe seu nome completo.' };
    if (password.length < 6) return { success: false, error: 'A senha deve ter pelo menos 6 caracteres.' };

    const accounts = await getAccounts();
    const existing = accounts.find(a => a.email.toLowerCase() === OWNER_EMAIL.toLowerCase());
    if (existing) return { success: false, error: 'Conta já configurada.' };

    const ownerAccount: StoredAccount = {
      id: 'owner_' + generateId(),
      name: name.trim(),
      email: OWNER_EMAIL,
      passwordHash: password, // App local — sem hash criptográfico
      role: 'owner',
      active: true,
      createdAt: new Date().toISOString(),
      lastAccess: new Date().toISOString(),
    };

    await saveAccounts([...accounts, ownerAccount]);

    const userToSave: User = {
      id: ownerAccount.id,
      name: ownerAccount.name,
      email: ownerAccount.email,
      role: ownerAccount.role,
      position: ownerAccount.position,
      phone: ownerAccount.phone,
      active: true,
      createdAt: ownerAccount.createdAt,
      lastAccess: ownerAccount.lastAccess,
    };

    await saveUser(userToSave);
    setUser(userToSave);
    setNeedsFirstSetup(false);
    return { success: true };
  };

  const login = async (email: string, password: string) => {
    const accounts = await getAccounts();
    const found = accounts.find(
      a => a.email.toLowerCase() === email.toLowerCase() && a.passwordHash === password && a.active
    );

    if (!found) {
      // Verificar se é o Dono tentando acessar antes de configurar senha
      if (email.toLowerCase() === OWNER_EMAIL.toLowerCase()) {
        const ownerExists = accounts.find(a => a.email.toLowerCase() === OWNER_EMAIL.toLowerCase());
        if (!ownerExists) {
          return { success: false, error: 'Configure sua senha no primeiro acesso.' };
        }
      }
      return { success: false, error: 'E-mail ou senha incorretos.' };
    }

    const userToSave: User = {
      id: found.id,
      name: found.name,
      email: found.email,
      role: found.role,
      position: found.position,
      phone: found.phone,
      active: found.active,
      createdAt: found.createdAt,
      lastAccess: new Date().toISOString(),
    };

    // Atualizar lastAccess na conta
    const updatedAccounts = accounts.map(a =>
      a.id === found.id ? { ...a, lastAccess: new Date().toISOString() } : a
    );
    await saveAccounts(updatedAccounts);
    await saveUser(userToSave);
    setUser(userToSave);
    return { success: true };
  };

  const logout = async () => {
    await clearUser();
    setUser(null);
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    await saveUser(updated);
    // Atualizar também na lista de contas
    const accounts = await getAccounts();
    const updatedAccounts = accounts.map(a =>
      a.id === user.id
        ? { ...a, name: updates.name ?? a.name, position: updates.position ?? a.position, phone: updates.phone ?? a.phone }
        : a
    );
    await saveAccounts(updatedAccounts);
    setUser(updated);
  };

  const getAccountsList = async () => {
    return getAccounts();
  };

  const inviteUser = async (email: string, name: string, role: UserRole, position?: string) => {
    if (!user || (user.role !== 'owner' && user.role !== 'admin')) {
      return { success: false, error: 'Sem permissão para convidar usuários.' };
    }
    const accounts = await getAccounts();
    const exists = accounts.find(a => a.email.toLowerCase() === email.toLowerCase());
    if (exists) return { success: false, error: 'E-mail já cadastrado.' };

    // Gerar senha temporária
    const tempPassword = Math.random().toString(36).substring(2, 8).toUpperCase();

    const newAccount: StoredAccount = {
      id: generateId(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash: tempPassword,
      role,
      position,
      active: true,
      createdAt: new Date().toISOString(),
      invitedBy: user.id,
    };

    await saveAccounts([...accounts, newAccount]);
    return { success: true, tempPassword };
  };

  const removeUser = async (userId: string) => {
    if (!user || user.role !== 'owner') return;
    const accounts = await getAccounts();
    const updated = accounts.filter(a => a.id !== userId);
    await saveAccounts(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        needsFirstSetup,
        login,
        setupOwnerPassword,
        logout,
        updateProfile,
        getAccounts: getAccountsList,
        inviteUser,
        removeUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
