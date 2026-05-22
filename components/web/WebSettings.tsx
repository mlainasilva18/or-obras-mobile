import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Switch, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth-context';
import { useData } from '@/lib/data-context';
import { usePWAInstall } from '@/hooks/use-pwa-install';

type Section = 'perfil' | 'integracoes' | 'plano' | 'sistema' | 'sobre';

export function WebSettings() {
  const { user, logout } = useAuth();
  const { obras, inspections, servicos, locais, torres, pavimentos, clearAllData } = useData();
  const { canInstall, isInstalled, install } = usePWAInstall();
  const [section, setSection] = useState<Section>('perfil');
  const [editName, setEditName] = useState(user?.name ?? '');
  const [editPosition, setEditPosition] = useState(user?.position ?? '');
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoSync, setAutoSync] = useState(false);

  const storageStats = {
    obras: obras.length,
    torres: torres.length,
    pavimentos: pavimentos.length,
    locais: locais.length,
    servicos: servicos.length,
    inspections: inspections.length,
  };

  const SECTIONS: { key: Section; label: string; icon: string }[] = [
    { key: 'perfil', label: 'Perfil', icon: 'person' },
    { key: 'integracoes', label: 'Integrações', icon: 'cloud' },
    { key: 'plano', label: 'Plano & Licença', icon: 'star' },
    { key: 'sistema', label: 'Sistema', icon: 'settings' },
    { key: 'sobre', label: 'Sobre', icon: 'info' },
  ];

  return (
    <View style={styles.root}>
      {/* Sidebar nav */}
      <View style={styles.sideNav}>
        {SECTIONS.map(s => (
          <TouchableOpacity
            key={s.key}
            style={[styles.navItem, section === s.key && styles.navItemActive]}
            onPress={() => setSection(s.key)}
            activeOpacity={0.8}
          >
            <MaterialIcons name={s.icon as any} size={18} color={section === s.key ? '#2E7D32' : '#9E9E9E'} />
            <Text style={[styles.navLabel, section === s.key && styles.navLabelActive]}>{s.label}</Text>
          </TouchableOpacity>
        ))}

        <View style={styles.navDivider} />

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => Alert.alert('Sair', 'Deseja encerrar a sessão?', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Sair', style: 'destructive', onPress: logout },
          ])}
          activeOpacity={0.8}
        >
          <MaterialIcons name="logout" size={18} color="#E53935" />
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        {/* PERFIL */}
        {section === 'perfil' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Perfil do Usuário</Text>

            <View style={styles.profileCard}>
              <View style={styles.avatarLarge}>
                <Text style={styles.avatarLargeText}>{user?.name?.charAt(0)?.toUpperCase() ?? 'U'}</Text>
              </View>
              <View>
                <Text style={styles.profileName}>{user?.name}</Text>
                <Text style={styles.profileRole}>{user?.position ?? user?.role}</Text>
                <Text style={styles.profileEmail}>{user?.email}</Text>
              </View>
            </View>

            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Editar Informações</Text>
              <Text style={styles.label}>Nome completo</Text>
              <TextInput style={styles.input} value={editName} onChangeText={setEditName} placeholder="Seu nome" placeholderTextColor="#BDBDBD" />
              <Text style={styles.label}>Cargo / Função</Text>
              <TextInput style={styles.input} value={editPosition} onChangeText={setEditPosition} placeholder="Ex: Engenheiro de Qualidade" placeholderTextColor="#BDBDBD" />
              <TouchableOpacity style={styles.saveBtn} activeOpacity={0.85}>
                <Text style={styles.saveBtnText}>Salvar Alterações</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* INTEGRAÇÕES */}
        {section === 'integracoes' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Integrações em Nuvem</Text>
            <Text style={styles.sectionSub}>Conecte o OR Obras a serviços externos para sincronização automática de dados.</Text>

            {[
              { name: 'Google Drive', icon: 'cloud', color: '#4285F4', desc: 'Sincronize relatórios e fotos automaticamente com o Google Drive.' },
              { name: 'Microsoft SharePoint', icon: 'cloud-queue', color: '#0078D4', desc: 'Integre com o SharePoint da sua empresa para gestão documental.' },
              { name: 'Autodesk BIM 360', icon: 'architecture', color: '#E67E22', desc: 'Vincule inspeções FVS diretamente ao modelo BIM do projeto.' },
              { name: 'Totvs Construção', icon: 'business-center', color: '#C0392B', desc: 'Exporte dados de conformidade para o ERP da sua construtora.' },
            ].map((integ, i) => (
              <View key={i} style={styles.integCard}>
                <View style={[styles.integIcon, { backgroundColor: integ.color + '15' }]}>
                  <MaterialIcons name={integ.icon as any} size={24} color={integ.color} />
                </View>
                <View style={styles.integInfo}>
                  <Text style={styles.integName}>{integ.name}</Text>
                  <Text style={styles.integDesc}>{integ.desc}</Text>
                </View>
                <TouchableOpacity style={styles.connectBtn} activeOpacity={0.85}>
                  <Text style={styles.connectBtnText}>Conectar</Text>
                </TouchableOpacity>
              </View>
            ))}

            <View style={styles.infoBox}>
              <MaterialIcons name="info-outline" size={16} color="#1565C0" />
              <Text style={styles.infoText}>As integrações em nuvem estarão disponíveis no plano Profissional.</Text>
            </View>
          </View>
        )}

        {/* PLANO */}
        {section === 'plano' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Plano & Licença</Text>

            <View style={styles.currentPlan}>
              <View style={styles.planBadge}>
                <MaterialIcons name="star" size={16} color="#F9A825" />
                <Text style={styles.planBadgeText}>Plano Gratuito</Text>
              </View>
              <Text style={styles.planDesc}>Você está usando a versão gratuita do OR Obras.</Text>
            </View>

            <View style={styles.plansRow}>
              {[
                {
                  name: 'Gratuito', price: 'R$ 0', period: '/mês', current: true,
                  features: ['1 obra ativa', 'Até 5 serviços', 'Armazenamento local', 'Exportação PDF básica'],
                },
                {
                  name: 'Profissional', price: 'R$ 89', period: '/mês', current: false,
                  features: ['Obras ilimitadas', 'Serviços ilimitados', 'Integrações em nuvem', 'Relatórios avançados', 'Suporte prioritário'],
                },
                {
                  name: 'Empresarial', price: 'R$ 249', period: '/mês', current: false,
                  features: ['Tudo do Profissional', 'Multi-usuários', 'BIM 360 + ERP', 'API REST', 'SLA garantido'],
                },
              ].map((plan, i) => (
                <View key={i} style={[styles.planCard, plan.current && styles.planCardCurrent]}>
                  {plan.current && (
                    <View style={styles.currentTag}>
                      <Text style={styles.currentTagText}>Plano atual</Text>
                    </View>
                  )}
                  <Text style={styles.planName}>{plan.name}</Text>
                  <View style={styles.planPriceRow}>
                    <Text style={styles.planPrice}>{plan.price}</Text>
                    <Text style={styles.planPeriod}>{plan.period}</Text>
                  </View>
                  {plan.features.map((f, j) => (
                    <View key={j} style={styles.featureRow}>
                      <MaterialIcons name="check" size={14} color="#2E7D32" />
                      <Text style={styles.featureText}>{f}</Text>
                    </View>
                  ))}
                  {!plan.current && (
                    <TouchableOpacity style={styles.upgradeBtn} activeOpacity={0.85}>
                      <Text style={styles.upgradeBtnText}>Assinar {plan.name}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* SISTEMA */}
        {section === 'sistema' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Configurações do Sistema</Text>

            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Aparência</Text>
              <View style={styles.switchRow}>
                <View>
                  <Text style={styles.switchLabel}>Modo Escuro</Text>
                  <Text style={styles.switchSub}>Alterna entre tema claro e escuro</Text>
                </View>
                <Switch value={darkMode} onValueChange={setDarkMode} trackColor={{ true: '#2E7D32' }} />
              </View>
            </View>

            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Notificações</Text>
              <View style={styles.switchRow}>
                <View>
                  <Text style={styles.switchLabel}>Alertas de Não Conformidade</Text>
                  <Text style={styles.switchSub}>Notificar quando uma NC for registrada</Text>
                </View>
                <Switch value={notifications} onValueChange={setNotifications} trackColor={{ true: '#2E7D32' }} />
              </View>
              <View style={styles.switchRow}>
                <View>
                  <Text style={styles.switchLabel}>Sincronização Automática</Text>
                  <Text style={styles.switchSub}>Sincronizar dados ao reconectar</Text>
                </View>
                <Switch value={autoSync} onValueChange={setAutoSync} trackColor={{ true: '#2E7D32' }} />
              </View>
            </View>

            {/* PWA Install */}
            {(canInstall || !isInstalled) && (
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>Instalar como Aplicativo</Text>
                <Text style={styles.sectionSub}>Instale o OR Obras como um app na área de trabalho para acesso rápido sem o navegador.</Text>
                {isInstalled ? (
                  <View style={styles.installedBadge}>
                    <MaterialIcons name="check-circle" size={16} color="#2E7D32" />
                    <Text style={styles.installedText}>App instalado com sucesso!</Text>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.installBtn} onPress={install} activeOpacity={0.85} disabled={!canInstall}>
                    <MaterialIcons name="download" size={16} color="#FFFFFF" />
                    <Text style={styles.installBtnText}>Instalar OR Obras</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Storage */}
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Dados Armazenados</Text>
              <View style={styles.storageGrid}>
                {Object.entries(storageStats).map(([key, val]) => (
                  <View key={key} style={styles.storageItem}>
                    <Text style={styles.storageVal}>{val}</Text>
                    <Text style={styles.storageKey}>{key}</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity
                style={styles.dangerBtn}
                onPress={() => Alert.alert(
                  'Limpar Dados',
                  'Esta ação removerá TODOS os dados locais permanentemente. Continuar?',
                  [{ text: 'Cancelar', style: 'cancel' }, { text: 'Limpar Tudo', style: 'destructive', onPress: clearAllData }]
                )}
                activeOpacity={0.85}
              >
                <MaterialIcons name="delete-forever" size={16} color="#E53935" />
                <Text style={styles.dangerBtnText}>Limpar Todos os Dados</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* SOBRE */}
        {section === 'sobre' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sobre o OR Obras</Text>
            <View style={styles.aboutCard}>
              <View style={styles.aboutLogo}>
                <Text style={styles.aboutLogoOR}>OR</Text>
              </View>
              <Text style={styles.aboutTitle}>OR Obras</Text>
              <Text style={styles.aboutVersion}>Versão 1.0.0</Text>
              <Text style={styles.aboutDesc}>
                Sistema de Ficha de Verificação de Serviço (FVS) para construtoras.
                Gerencie inspeções de qualidade, controle não conformidades e acompanhe
                o progresso das suas obras em tempo real.
              </Text>
            </View>

            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Tecnologia</Text>
              {[
                { label: 'Plataforma', value: 'React Native + Expo' },
                { label: 'Armazenamento', value: 'AsyncStorage (offline-first)' },
                { label: 'Compatibilidade', value: 'iOS, Android, Web (PWA)' },
                { label: 'Norma de Referência', value: 'ABNT NBR 15575 / PBQP-H' },
              ].map((item, i) => (
                <View key={i} style={styles.aboutRow}>
                  <Text style={styles.aboutRowLabel}>{item.label}</Text>
                  <Text style={styles.aboutRowValue}>{item.value}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row', backgroundColor: '#F5F5F5' },
  sideNav: { width: 200, backgroundColor: '#FFFFFF', borderRightWidth: 1, borderRightColor: '#E0E0E0', paddingTop: 16, paddingHorizontal: 8 },
  navItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, marginBottom: 2 },
  navItemActive: { backgroundColor: '#E8F5E9' },
  navLabel: { fontSize: 13, fontWeight: '500', color: '#9E9E9E' },
  navLabelActive: { color: '#2E7D32', fontWeight: '700' },
  navDivider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 12 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8 },
  logoutText: { fontSize: 13, fontWeight: '600', color: '#E53935' },
  content: { flex: 1 },
  contentInner: { padding: 24, gap: 16 },
  section: { gap: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1C1C1C' },
  sectionSub: { fontSize: 13, color: '#9E9E9E', lineHeight: 20 },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#E0E0E0' },
  avatarLarge: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#2E7D32', alignItems: 'center', justifyContent: 'center' },
  avatarLargeText: { fontSize: 24, fontWeight: '900', color: '#FFFFFF' },
  profileName: { fontSize: 18, fontWeight: '700', color: '#1C1C1C' },
  profileRole: { fontSize: 13, color: '#2E7D32', fontWeight: '600', marginTop: 2 },
  profileEmail: { fontSize: 12, color: '#9E9E9E', marginTop: 2 },
  formCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#E0E0E0', gap: 10 },
  formTitle: { fontSize: 14, fontWeight: '700', color: '#1C1C1C', marginBottom: 4 },
  label: { fontSize: 12, fontWeight: '600', color: '#424242' },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 13, color: '#1C1C1C', backgroundColor: '#FAFAFA' },
  saveBtn: { backgroundColor: '#2E7D32', borderRadius: 8, paddingVertical: 10, alignItems: 'center', marginTop: 4 },
  saveBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  integCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E0E0E0' },
  integIcon: { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  integInfo: { flex: 1 },
  integName: { fontSize: 14, fontWeight: '700', color: '#1C1C1C' },
  integDesc: { fontSize: 12, color: '#9E9E9E', marginTop: 2 },
  connectBtn: { borderWidth: 1.5, borderColor: '#2E7D32', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7 },
  connectBtnText: { fontSize: 13, fontWeight: '700', color: '#2E7D32' },
  infoBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#E3F2FD', borderRadius: 8, padding: 12 },
  infoText: { flex: 1, fontSize: 12, color: '#1565C0' },
  currentPlan: { backgroundColor: '#E8F5E9', borderRadius: 12, padding: 16, gap: 6 },
  planBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  planBadgeText: { fontSize: 14, fontWeight: '700', color: '#F9A825' },
  planDesc: { fontSize: 13, color: '#424242' },
  plansRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  planCard: { flex: 1, minWidth: 200, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#E0E0E0', gap: 8 },
  planCardCurrent: { borderColor: '#2E7D32', borderWidth: 2 },
  currentTag: { backgroundColor: '#E8F5E9', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  currentTagText: { fontSize: 11, fontWeight: '700', color: '#2E7D32' },
  planName: { fontSize: 16, fontWeight: '800', color: '#1C1C1C' },
  planPriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  planPrice: { fontSize: 24, fontWeight: '900', color: '#1C1C1C' },
  planPeriod: { fontSize: 13, color: '#9E9E9E' },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  featureText: { fontSize: 12, color: '#424242' },
  upgradeBtn: { backgroundColor: '#2E7D32', borderRadius: 8, paddingVertical: 10, alignItems: 'center', marginTop: 4 },
  upgradeBtnText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
  switchLabel: { fontSize: 13, fontWeight: '600', color: '#1C1C1C' },
  switchSub: { fontSize: 11, color: '#9E9E9E', marginTop: 1 },
  installedBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#E8F5E9', borderRadius: 8, padding: 10 },
  installedText: { fontSize: 13, fontWeight: '600', color: '#2E7D32' },
  installBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#2E7D32', borderRadius: 8, paddingVertical: 10 },
  installBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  storageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  storageItem: { backgroundColor: '#F5F5F5', borderRadius: 8, padding: 10, alignItems: 'center', minWidth: 80 },
  storageVal: { fontSize: 20, fontWeight: '900', color: '#1C1C1C' },
  storageKey: { fontSize: 10, color: '#9E9E9E', textTransform: 'capitalize' },
  dangerBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1.5, borderColor: '#E53935', borderRadius: 8, paddingVertical: 10 },
  dangerBtnText: { fontSize: 13, fontWeight: '700', color: '#E53935' },
  aboutCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 24, borderWidth: 1, borderColor: '#E0E0E0', alignItems: 'center', gap: 8 },
  aboutLogo: { width: 64, height: 64, borderRadius: 14, backgroundColor: '#2E7D32', alignItems: 'center', justifyContent: 'center' },
  aboutLogoOR: { fontSize: 24, fontWeight: '900', color: '#FFFFFF' },
  aboutTitle: { fontSize: 20, fontWeight: '900', color: '#1C1C1C' },
  aboutVersion: { fontSize: 13, color: '#9E9E9E' },
  aboutDesc: { fontSize: 13, color: '#424242', textAlign: 'center', lineHeight: 20, maxWidth: 400 },
  aboutRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  aboutRowLabel: { fontSize: 13, fontWeight: '600', color: '#424242' },
  aboutRowValue: { fontSize: 13, color: '#9E9E9E' },
});
