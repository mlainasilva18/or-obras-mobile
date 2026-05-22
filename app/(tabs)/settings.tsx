import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Switch, Alert, Modal, TextInput, Platform,
} from 'react-native';
import { WebSettings } from '@/components/web/WebSettings';
import { ScreenContainer } from '@/components/screen-container';
import { useAuth } from '@/lib/auth-context';
import { useNetwork } from '@/lib/network-context';
import { MaterialIcons } from '@expo/vector-icons';

const ROLE_LABELS: Record<string, string> = {
  owner: 'Dono da Conta',
  admin: 'Administrador',
  inspector: 'Inspetor',
  viewer: 'Visualizador',
};

function SettingRow({
  icon, label, value, onPress, rightElement, color,
}: {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  color?: string;
}) {
  return (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={[styles.settingIcon, { backgroundColor: (color ?? '#2E7D32') + '15' }]}>
        <MaterialIcons name={icon as any} size={20} color={color ?? '#2E7D32'} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingLabel}>{label}</Text>
        {value && <Text style={styles.settingValue}>{value}</Text>}
      </View>
      {rightElement ?? (onPress && <MaterialIcons name="chevron-right" size={20} color="#9E9E9E" />)}
    </TouchableOpacity>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

// ---- Profile Edit Modal ----
function ProfileModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [position, setPosition] = useState(user?.position ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');

  const handleSave = async () => {
    await updateProfile({ name: name.trim(), position: position.trim(), phone: phone.trim() });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={modalStyles.container}>
        <View style={modalStyles.header}>
          <Text style={modalStyles.title}>Editar Perfil</Text>
          <TouchableOpacity onPress={onClose}><MaterialIcons name="close" size={24} color="#424242" /></TouchableOpacity>
        </View>
        <ScrollView style={modalStyles.body} keyboardShouldPersistTaps="handled">
          <Text style={modalStyles.label}>Nome</Text>
          <TextInput style={modalStyles.input} value={name} onChangeText={setName} placeholder="Seu nome completo" placeholderTextColor="#9E9E9E" />
          <Text style={modalStyles.label}>Cargo/Função</Text>
          <TextInput style={modalStyles.input} value={position} onChangeText={setPosition} placeholder="Engenheiro de Qualidade" placeholderTextColor="#9E9E9E" />
          <Text style={modalStyles.label}>Telefone</Text>
          <TextInput style={modalStyles.input} value={phone} onChangeText={setPhone} placeholder="(11) 99999-0000" placeholderTextColor="#9E9E9E" keyboardType="phone-pad" />
          <Text style={modalStyles.label}>E-mail</Text>
          <View style={[modalStyles.input, { backgroundColor: '#F5F5F5' }]}>
            <Text style={{ color: '#9E9E9E', fontSize: 14 }}>{user?.email}</Text>
          </View>
          <Text style={modalStyles.hint}>O e-mail não pode ser alterado.</Text>
        </ScrollView>
        <View style={modalStyles.footer}>
          <TouchableOpacity style={modalStyles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
            <Text style={modalStyles.saveBtnText}>Salvar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function SettingsScreen() {
  if (Platform.OS === 'web') return <WebSettings />;

  const { user, logout } = useAuth();
  const { isOnline, pendingSync } = useNetwork();
  const [autoSync, setAutoSync] = useState(false);
  const [profileModal, setProfileModal] = useState(false);
  const [driveConnected] = useState(false);
  const [sharepointConnected] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Deseja realmente sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: logout },
      ]
    );
  };

  const handleConnectDrive = () => {
    Alert.alert(
      'Google Drive',
      'A integração com Google Drive estará disponível na versão completa com autenticação OAuth 2.0.',
      [{ text: 'OK' }]
    );
  };

  const handleConnectSharepoint = () => {
    Alert.alert(
      'Microsoft SharePoint / OneDrive',
      'A integração com Microsoft Graph API estará disponível na versão completa.',
      [{ text: 'OK' }]
    );
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Configurações</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* User card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() ?? 'U'}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userRole}>{ROLE_LABELS[user?.role ?? 'inspector']}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
          <TouchableOpacity onPress={() => setProfileModal(true)} style={styles.editProfileBtn} activeOpacity={0.7}>
            <MaterialIcons name="edit" size={18} color="#2E7D32" />
          </TouchableOpacity>
        </View>

        {/* Connection status */}
        <View style={[styles.connectionBar, { backgroundColor: isOnline ? '#E8F5E9' : '#FFEBEE' }]}>
          <MaterialIcons name={isOnline ? 'wifi' : 'wifi-off'} size={16} color={isOnline ? '#2E7D32' : '#E53935'} />
          <Text style={[styles.connectionText, { color: isOnline ? '#2E7D32' : '#E53935' }]}>
            {isOnline ? 'Conectado à internet' : 'Sem conexão — modo offline'}
          </Text>
          {pendingSync && (
            <View style={styles.syncBadge}>
              <MaterialIcons name="sync" size={12} color="#F9A825" />
              <Text style={styles.syncText}>Sincronização pendente</Text>
            </View>
          )}
        </View>

        {/* Conta */}
        <SectionHeader title="Conta" />
        <View style={styles.card}>
          <SettingRow icon="person" label="Editar Perfil" value={user?.name} onPress={() => setProfileModal(true)} />
          <View style={styles.divider} />
          <SettingRow icon="security" label="Perfil de Acesso" value={ROLE_LABELS[user?.role ?? 'inspector']} />
          {user?.role === 'owner' && (
            <>
              <View style={styles.divider} />
              <SettingRow icon="group" label="Gerenciar Usuários" onPress={() => Alert.alert('Em breve', 'O painel de gerenciamento de usuários estará disponível na versão completa.')} />
            </>
          )}
        </View>

        {/* Armazenamento em Nuvem */}
        <SectionHeader title="Armazenamento em Nuvem" />
        <View style={styles.card}>
          <SettingRow
            icon="cloud"
            label="Google Drive"
            value={driveConnected ? 'Conectado ✓' : 'Desconectado'}
            color={driveConnected ? '#2E7D32' : '#9E9E9E'}
            onPress={handleConnectDrive}
            rightElement={
              <View style={[styles.statusBadge, { backgroundColor: driveConnected ? '#E8F5E9' : '#F5F5F5' }]}>
                <Text style={[styles.statusBadgeText, { color: driveConnected ? '#2E7D32' : '#9E9E9E' }]}>
                  {driveConnected ? 'Conectado' : 'Conectar'}
                </Text>
              </View>
            }
          />
          <View style={styles.divider} />
          <SettingRow
            icon="folder-shared"
            label="Microsoft SharePoint / OneDrive"
            value={sharepointConnected ? 'Conectado ✓' : 'Desconectado'}
            color={sharepointConnected ? '#1565C0' : '#9E9E9E'}
            onPress={handleConnectSharepoint}
            rightElement={
              <View style={[styles.statusBadge, { backgroundColor: sharepointConnected ? '#E3F2FD' : '#F5F5F5' }]}>
                <Text style={[styles.statusBadgeText, { color: sharepointConnected ? '#1565C0' : '#9E9E9E' }]}>
                  {sharepointConnected ? 'Conectado' : 'Conectar'}
                </Text>
              </View>
            }
          />
          <View style={styles.divider} />
          <SettingRow
            icon="sync"
            label="Sincronização Automática"
            rightElement={
              <Switch
                value={autoSync}
                onValueChange={setAutoSync}
                trackColor={{ false: '#E0E0E0', true: '#A5D6A7' }}
                thumbColor={autoSync ? '#2E7D32' : '#FFFFFF'}
              />
            }
          />
        </View>

        {/* Sobre */}
        <SectionHeader title="Sobre" />
        <View style={styles.card}>
          <View style={styles.aboutRow}>
            <View style={styles.miniLogo}>
              <Text style={styles.miniLogoOR}>OR</Text>
              <Text style={styles.miniLogoObras}>Obras</Text>
            </View>
            <View>
              <Text style={styles.appName}>OR Obras</Text>
              <Text style={styles.appTagline}>Qualidade e precisão em cada inspeção</Text>
              <Text style={styles.appVersion}>Versão 1.0.0</Text>
            </View>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <MaterialIcons name="logout" size={20} color="#E53935" />
          <Text style={styles.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>
      </ScrollView>

      <ProfileModal visible={profileModal} onClose={() => setProfileModal(false)} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#E0E0E0', backgroundColor: '#FFFFFF' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1C1C1C' },
  scroll: { flex: 1, backgroundColor: '#FAFAFA' },
  content: { padding: 16, paddingBottom: 40 },
  userCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E0E0E0', gap: 12 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#2E7D32', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: '700', color: '#1C1C1C' },
  userRole: { fontSize: 12, color: '#2E7D32', fontWeight: '600', marginTop: 1 },
  userEmail: { fontSize: 12, color: '#9E9E9E', marginTop: 2 },
  editProfileBtn: { padding: 6 },
  connectionBar: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, padding: 10, marginBottom: 16, flexWrap: 'wrap' },
  connectionText: { fontSize: 13, fontWeight: '600' },
  syncBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  syncText: { fontSize: 11, color: '#F9A825', fontWeight: '600' },
  sectionHeader: { fontSize: 11, fontWeight: '700', color: '#9E9E9E', textTransform: 'uppercase', marginBottom: 8, marginTop: 16, paddingHorizontal: 4 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E0E0E0', overflow: 'hidden', marginBottom: 4 },
  settingRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  settingIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  settingContent: { flex: 1 },
  settingLabel: { fontSize: 14, fontWeight: '600', color: '#1C1C1C' },
  settingValue: { fontSize: 12, color: '#9E9E9E', marginTop: 1 },
  divider: { height: 1, backgroundColor: '#F5F5F5', marginLeft: 62 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  statusBadgeText: { fontSize: 12, fontWeight: '700' },
  aboutRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 14 },
  miniLogo: { alignItems: 'center' },
  miniLogoOR: { fontSize: 20, fontWeight: '900', color: '#2E7D32', lineHeight: 22 },
  miniLogoObras: { fontSize: 11, fontWeight: '700', color: '#1C1C1C', lineHeight: 13 },
  appName: { fontSize: 15, fontWeight: '700', color: '#1C1C1C' },
  appTagline: { fontSize: 12, color: '#9E9E9E', marginTop: 1 },
  appVersion: { fontSize: 11, color: '#9E9E9E', marginTop: 4 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20, backgroundColor: '#FFEBEE', borderRadius: 12, paddingVertical: 14, borderWidth: 1, borderColor: '#FFCDD2' },
  logoutText: { fontSize: 15, fontWeight: '700', color: '#E53935' },
});

const modalStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  title: { fontSize: 18, fontWeight: '700', color: '#1C1C1C' },
  body: { flex: 1, padding: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#424242', marginBottom: 4, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#1C1C1C', backgroundColor: '#FAFAFA' },
  hint: { fontSize: 11, color: '#9E9E9E', marginTop: 4 },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: '#E0E0E0' },
  saveBtn: { backgroundColor: '#2E7D32', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
