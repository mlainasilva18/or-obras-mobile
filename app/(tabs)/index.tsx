import React, { useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform,
} from 'react-native';
import { WebDashboard } from '@/components/web/WebDashboard';
import { ScreenContainer } from '@/components/screen-container';
import { useAuth } from '@/lib/auth-context';
import { useData } from '@/lib/data-context';
import { useNetwork } from '@/lib/network-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { Obra } from '@/lib/types';
import { STATUS_CONFIG } from '@/lib/types';

const STATUS_LABELS: Record<string, string> = {
  active: 'Em andamento',
  completed: 'Concluída',
  paused: 'Pausada',
};
const STATUS_COLORS: Record<string, string> = {
  active: '#2E7D32',
  completed: '#1565C0',
  paused: '#F9A825',
};

function ObraCard({ obra }: { obra: Obra }) {
  const { inspections, torres } = useData();
  const router = useRouter();

  const stats = useMemo(() => {
    const obraInspections = inspections.filter(i => i.obraId === obra.id);
    const total = obraInspections.length;
    if (total === 0) return { conforme: 0, naoConforme: 0, naoAvaliado: 0, total: 0 };
    const conforme = obraInspections.filter(i => i.status === 'conforme' || i.status === 'conforme_reinspeção' || i.status === 'liberado_concessao').length;
    const naoConforme = obraInspections.filter(i => i.status === 'nao_conforme' || i.status === 'nao_conforme_reinspeção').length;
    const naoAvaliado = obraInspections.filter(i => i.status === 'nao_avaliado').length;
    return { conforme, naoConforme, naoAvaliado, total };
  }, [inspections, obra.id]);

  const torreCount = torres.filter(t => t.obraId === obra.id).length;
  const pct = stats.total > 0 ? Math.round((stats.conforme / stats.total) * 100) : 0;

  return (
    <TouchableOpacity
      style={styles.obraCard}
      onPress={() => router.push({ pathname: '/(tabs)/inspection', params: { obraId: obra.id } })}
      activeOpacity={0.85}
    >
      <View style={styles.obraCardHeader}>
        <View style={styles.obraCardLeft}>
          <Text style={styles.obraName} numberOfLines={1}>{obra.name}</Text>
          <Text style={styles.obraAddress} numberOfLines={1}>{obra.address}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[obra.status] + '20', borderColor: STATUS_COLORS[obra.status] }]}>
          <Text style={[styles.statusText, { color: STATUS_COLORS[obra.status] }]}>{STATUS_LABELS[obra.status]}</Text>
        </View>
      </View>

      <View style={styles.obraStats}>
        <View style={styles.statItem}>
          <MaterialIcons name="apartment" size={14} color="#9E9E9E" />
          <Text style={styles.statText}>{torreCount} {torreCount === 1 ? 'torre' : 'torres'}</Text>
        </View>
        {stats.total > 0 && (
          <>
            <View style={styles.statItem}>
              <View style={[styles.dot, { backgroundColor: '#2E7D32' }]} />
              <Text style={styles.statText}>{stats.conforme} conformes</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.dot, { backgroundColor: '#E53935' }]} />
              <Text style={styles.statText}>{stats.naoConforme} NC</Text>
            </View>
          </>
        )}
      </View>

      {stats.total > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${pct}%` as any }]} />
          </View>
          <Text style={styles.progressText}>{pct}% conforme</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function DashboardScreen() {
  if (Platform.OS === 'web') return <WebDashboard />;

  const { user } = useAuth();
  const { obras, inspections, isLoading } = useData();
  const { isOnline, pendingSync } = useNetwork();
  const router = useRouter();

  const activeObras = obras.filter(o => o.status === 'active');
  const totalInspections = inspections.length;
  const totalNC = inspections.filter(i => i.status === 'nao_conforme' || i.status === 'nao_conforme_reinspeção').length;

  const roleLabel: Record<string, string> = {
    owner: 'Dono da Conta',
    admin: 'Administrador',
    inspector: 'Inspetor',
    viewer: 'Visualizador',
  };

  return (
    <ScreenContainer>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá, {user?.name?.split(' ')[0] ?? 'Usuário'}</Text>
            <Text style={styles.role}>{roleLabel[user?.role ?? 'inspector']}</Text>
          </View>
          <View style={styles.headerRight}>
            {!isOnline && (
              <View style={styles.offlineBadge}>
                <MaterialIcons name="wifi-off" size={12} color="#fff" />
                <Text style={styles.offlineText}>Offline</Text>
              </View>
            )}
            {isOnline && pendingSync && (
              <View style={[styles.offlineBadge, { backgroundColor: '#F9A825' }]}>
                <MaterialIcons name="sync" size={12} color="#fff" />
                <Text style={styles.offlineText}>Sincronizando</Text>
              </View>
            )}
          </View>
        </View>

        {/* Summary cards */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { borderLeftColor: '#2E7D32' }]}>
            <Text style={styles.summaryValue}>{activeObras.length}</Text>
            <Text style={styles.summaryLabel}>Obras ativas</Text>
          </View>
          <View style={[styles.summaryCard, { borderLeftColor: '#1565C0' }]}>
            <Text style={styles.summaryValue}>{totalInspections}</Text>
            <Text style={styles.summaryLabel}>Inspeções</Text>
          </View>
          <View style={[styles.summaryCard, { borderLeftColor: '#E53935' }]}>
            <Text style={styles.summaryValue}>{totalNC}</Text>
            <Text style={styles.summaryLabel}>Não Conf.</Text>
          </View>
        </View>

        {/* Quick actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickBtn}
              onPress={() => router.push('/(tabs)/inspection')}
              activeOpacity={0.8}
            >
              <MaterialIcons name="fact-check" size={24} color="#2E7D32" />
              <Text style={styles.quickBtnText}>Nova Inspeção</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickBtn}
              onPress={() => router.push('/(tabs)/reports')}
              activeOpacity={0.8}
            >
              <MaterialIcons name="bar-chart" size={24} color="#2E7D32" />
              <Text style={styles.quickBtnText}>Relatórios</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickBtn}
              onPress={() => router.push('/(tabs)/cadastros')}
              activeOpacity={0.8}
            >
              <MaterialIcons name="add-business" size={24} color="#2E7D32" />
              <Text style={styles.quickBtnText}>Cadastros</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Obras list */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Obras em Andamento</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/cadastros')} activeOpacity={0.7}>
              <Text style={styles.seeAll}>Ver todas</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <Text style={styles.emptyText}>Carregando...</Text>
          ) : activeObras.length === 0 ? (
            <View style={styles.emptyBox}>
              <MaterialIcons name="construction" size={40} color="#E0E0E0" />
              <Text style={styles.emptyText}>Nenhuma obra ativa.</Text>
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => router.push('/(tabs)/cadastros')}
                activeOpacity={0.8}
              >
                <Text style={styles.emptyBtnText}>Cadastrar Obra</Text>
              </TouchableOpacity>
            </View>
          ) : (
            activeObras.map(obra => <ObraCard key={obra.id} obra={obra} />)
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 16, paddingBottom: 32 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingTop: 8,
  },
  greeting: { fontSize: 22, fontWeight: '700', color: '#1C1C1C' },
  role: { fontSize: 13, color: '#9E9E9E', marginTop: 2 },
  headerRight: { alignItems: 'flex-end', gap: 4 },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E53935',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  offlineText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  summaryCard: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 4,
  },
  summaryValue: { fontSize: 24, fontWeight: '800', color: '#1C1C1C' },
  summaryLabel: { fontSize: 11, color: '#9E9E9E', marginTop: 2 },
  section: { marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1C1C1C' },
  seeAll: { fontSize: 13, color: '#2E7D32', fontWeight: '600' },
  quickActions: { flexDirection: 'row', gap: 10 },
  quickBtn: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  quickBtnText: { fontSize: 11, fontWeight: '600', color: '#1C1C1C', textAlign: 'center' },
  obraCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  obraCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  obraCardLeft: { flex: 1, marginRight: 8 },
  obraName: { fontSize: 15, fontWeight: '700', color: '#1C1C1C' },
  obraAddress: { fontSize: 12, color: '#9E9E9E', marginTop: 2 },
  statusBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
  },
  statusText: { fontSize: 11, fontWeight: '600' },
  obraStats: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: 12, color: '#424242' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  progressContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#2E7D32', borderRadius: 3 },
  progressText: { fontSize: 11, color: '#424242', fontWeight: '600', minWidth: 70 },
  emptyBox: { alignItems: 'center', paddingVertical: 32, gap: 10 },
  emptyText: { fontSize: 14, color: '#9E9E9E', textAlign: 'center' },
  emptyBtn: {
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 4,
  },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
