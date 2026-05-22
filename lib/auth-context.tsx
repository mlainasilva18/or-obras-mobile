import React, { createContext, useContext, useEffect, useState } from 'react';
import { getUser, saveUser, clearUser, seedDemoData } from './storage';
import type { User, UserRole } from './types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Demo users for local auth
const DEMO_USERS: Array<User & { password: string }> = [
  {
    id: 'user1',
    name: 'Carlos Eduardo Silva',
    email: 'carlos@orengenharia.com.br',
    password: '123456',
    role: 'owner' as UserRole,
    position: 'Engenheiro de Qualidade',
    phone: '(11) 99999-0001',
    active: true,
    createdAt: new Date().toISOString(),
    lastAccess: new Date().toISOString(),
  },
  {
    id: 'user2',
    name: 'Ana Paula Ferreira',
    email: 'ana@orengenharia.com.br',
    password: '123456',
    role: 'inspector' as UserRole,
    position: 'Técnica de Edificações',
    phone: '(11) 99999-0002',
    active: true,
    createdAt: new Date().toISOString(),
    lastAccess: new Date().toISOString(),
  },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const stored = await getUser();
      if (stored) {
        setUser(stored);
        await seedDemoData(stored.id);
      }
      setIsLoading(false);
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const found = DEMO_USERS.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) {
      return { success: false, error: 'E-mail ou senha incorretos.' };
    }
    const { password: _, ...userWithoutPassword } = found;
    const userToSave: User = { ...userWithoutPassword, lastAccess: new Date().toISOString() };
    await saveUser(userToSave);
    await seedDemoData(userToSave.id);
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
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
