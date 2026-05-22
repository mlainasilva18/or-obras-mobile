import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth-context';
import { useData } from '@/lib/data-context';
import { STATUS_CONFIG } from '@/lib/types';
import type { Obra, InspectionCell } from '@/lib/types';

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

function MiniPieChart({ conforme, naoConforme, excecao, naoAvaliado }: {
  conforme: number; naoConforme: number; excecao: number; naoAvaliado: number;
}) {
  const total = conforme + naoConforme + excecao + naoAvaliado;
  if (total === 0) return (
    <View style={miniStyles.empty}>
      <Text style={miniStyles.emptyText}>Sem dados</Text>
    </View>
  );

  const segments = [
    { value: conforme, color: '#2E7D32' },
    { value: naoConforme, color: '#E53935' },
    { value: excecao, color: '#F9A825' },
    { value: naoAvaliado, color: '#9E9E9E' },
  ].filter(s => s.value > 0);

  const pct = Math.round((conforme / total) * 100);

  return (
    <View style={miniStyles.container}>
      <View style={miniStyles.bar}>
        {segments.map((seg, i) => (
          <View
            key={i}
            style={[
              miniStyles.segment,
              {
                flex: seg.value / total,
                backgroundColor: seg.color,
                borderTopLeftRadius: i === 0 ? 4 : 0,
                borderBottomLeftRadius: i === 0 ? 4 : 0,
                borderTopRightRadius: i === segments.length - 1 ? 4 : 0,
                borderBottomRightRadius: i === segments.length - 1 ? 4 : 0,
              },
            ]}
          />
        ))}
      </View>
      <Text style={miniStyles.pct}>{pct}% conforme</Text>
    </View>
  );
}

const miniStyles = StyleSheet.create({
  container: { gap: 4 },
  bar: { height: 8, flexDirection: 'row', borderRadius: 4, overflow: 'hidden', backgroundColor: '#E0E0E0' },
  segment: { height: 8 },
  pct: { fontSize: 11, color: '#9E9E9E', fontWeight: '600' },
  empty: { height: 8, backgroundColor: '#E0E0E0', borderRadius: 4 },
  emptyText: { fontSize: 11, color: '#BDBDBD', marginTop: 2 },
});

function ObraCard({ obra }: { obra: Obra }) {
  const { inspections, torres } = useData();
  const router = useRouter();

  const stats = useMemo(() => {
    const cells = inspections.filter(i => i.obraId === obra.id);
    const total = cells.length;
    const conforme = cells.filter(i => ['conforme', 'conforme_reinspeção', 'liberado_concessao'].includes(i.status)).length;
    const naoConforme = cells.filter(i => ['nao_conforme', 'nao_conforme_reinspeção'].includes(i.status)).length;
    const excecao = cells.filter(i => i.status === 'excecao').length;
    const naoAvaliado = cells.filter(i => i.status === 'nao_avaliado').length;
    return { total, conforme, naoConforme, excecao, naoAvaliado };
  }, [inspections, obra.id]);

  const torreCount = torres.filter(t => t.obraId === obra.id).length;
  const pct = stats.total > 0 ? Math.round((stats.conforme / stats.total) * 100) : 0;

  return (
    <TouchableOpacity
      style={cardStyles.card}
      onPress={() => router.push({ pathname: '/(tabs)/inspection', params: { obraId: obra.id } } as any)}
      activeOpacity={0.88}
    >
      <View style={cardStyles.header}>
        <View style={cardStyles.headerLeft}>
          <View style={[cardStyles.statusDot, { backgroundColor: STATUS_COLORS[obra.status] }]} />
          <View>
            <Text style={cardStyles.name} numberOfLines={1}>{obra.name}</Text>
            <Text style={cardStyles.address} numberOfLines={1}>{obra.address}</Text>
          </View>
        </View>
        <View style={[cardStyles.badge, { backgroundColor: STATUS_COLORS[obra.status] + '15' }]}>
          <Text style={[cardStyles.badgeText, { color: STATUS_COLORS[obra.status] }]}>
            {STATUS_LABELS[obra.status]}
          </Text>
        </View>
      </View>

      <View style={cardStyles.stats}>
        <View style={cardStyles.statItem}>
          <Text style={cardStyles.statValue}>{torreCount}</Text>
          <Text style={cardStyles.statLabel}>Torres</Text>
        </View>
        <View style={cardStyles.statItem}>
          <Text style={cardStyles.statValue}>{stats.total}</Text>
          <Text style={cardStyles.statLabel}>Inspeções</Text>
        </View>
        <View style={cardStyles.statItem}>
          <Text style={[cardStyles.statValue, { color: '#E53935' }]}>{stats.naoConforme}</Text>
          <Text style={cardStyles.statLabel}>Não Conf.</Text>
        </View>
        <View style={cardStyles.statItem}>
          <Text style={[cardStyles.statValue, { color: '#2E7D32' }]}>{pct}%</Text>
          <Text style={cardStyles.statLabel}>Conformidade</Text>
        </View>
      </View>

      <MiniPieChart
        conforme={stats.conforme}
        naoConforme={stats.naoConforme}
        excecao={stats.excecao}
        naoAvaliado={stats.naoAvaliado}
      />

      <View style={cardStyles.footer}>
        <Text style={cardStyles.footerText}>Início: {obra.startDate}</Text>
        {obra.expectedEndDate && (
          <Text style={cardStyles.footerText}>Previsão: {obra.expectedEndDate}</Text>
        )}
        <TouchableOpacity
          style={cardStyles.inspectBtn}
          onPress={() => router.push({ pathname: '/(tabs)/inspection', params: { obraId: obra.id } } as any)}
          activeOpacity={0.8}
        >
          <MaterialIcons name="fact-check" size={14} color="#2E7D32" />
          <Text style={cardStyles.inspectBtnText}>Inspecionar</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 14,
    flex: 1,
    minWidth: 280,
    maxWidth: 420,
  },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  headerLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, flex: 1 },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4, flexShrink: 0 },
  name: { fontSize: 15, fontWeight: '700', color: '#1C1C1C', flex: 1 },
  address: { fontSize: 12, color: '#9E9E9E', marginTop: 2 },
  badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, flexShrink: 0 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  stats: { flexDirection: 'row', gap: 0 },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 8, borderWidth: 1, borderColor: '#F0F0F0', borderRadius: 8, marginHorizontal: 2 },
  statValue: { fontSize: 18, fontWeight: '800', color: '#1C1C1C' },
  statLabel: { fontSize: 10, color: '#9E9E9E', fontWeight: '500', marginTop: 2 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 },
  footerText: { fontSize: 11, color: '#9E9E9E' },
  inspectBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#E8F5E9', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  inspectBtnText: { fontSize: 12, fontWeight: '700', color: '#2E7D32' },
});

function RecentInspectionRow({ cell }: { cell: InspectionCell }) {
  const { obras, servicos, locais } = useData();
  const obra = obras.find(o => o.id === cell.obraId);
  const servico = servicos.find(s => s.id === cell.servicoId);
  const local = locais.find(l => l.id === cell.localId);
  const cfg = STATUS_CONFIG[cell.status];

  return (
    <View style={recentStyles.row}>
      <View style={[recentStyles.statusDot, { backgroundColor: cfg.color }]} />
      <View style={recentStyles.info}>
        <Text style={recentStyles.obra} numberOfLines={1}>{obra?.name ?? '—'}</Text>
        <Text style={recentStyles.detail} numberOfLines={1}>
          {servico?.name ?? '—'} · {local?.name ?? '—'}
        </Text>
      </View>
      <View style={[recentStyles.badge, { backgroundColor: cfg.color + '18' }]}>
        <Text style={[recentStyles.badgeText, { color: cfg.color }]}>{cfg.shortLabel}</Text>
      </View>
      <Text style={recentStyles.date}>
        {cell.inspectedAt ? new Date(cell.inspectedAt).toLocaleDateString('pt-BR') : '—'}
      </Text>
    </View>
  );
}

const recentStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  statusDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  info: { flex: 1 },
  obra: { fontSize: 13, fontWeight: '600', color: '#1C1C1C' },
  detail: { fontSize: 11, color: '#9E9E9E', marginTop: 1 },
  badge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  date: { fontSize: 11, color: '#9E9E9E', minWidth: 70, textAlign: 'right' },
});

export function WebDashboard() {
  const { user } = useAuth();
  const { obras, inspections } = useData();
  const router = useRouter();

  const activeObras = obras.filter(o => o.status === 'active');

  const recentInspections = useMemo(() => {
    return [...inspections]
      .filter(i => i.inspectedAt)
      .sort((a, b) => new Date(b.inspectedAt!).getTime() - new Date(a.inspectedAt!).getTime())
      .slice(0, 8);
  }, [inspections]);

  const nonConformidades = useMemo(() => {
    return inspections.filter(i => i.status === 'nao_conforme' || i.status === 'nao_conforme_reinspeção');
  }, [inspections]);

  const totalInspections = inspections.length;
  const totalConforme = inspections.filter(i => ['conforme', 'conforme_reinspeção', 'liberado_concessao'].includes(i.status)).length;
  const conformPct = totalInspections > 0 ? Math.round((totalConforme / totalInspections) * 100) : 0;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {/* Welcome */}
      <View style={styles.welcomeRow}>
        <View>
          <Text style={styles.welcomeTitle}>Bom dia, {user?.name?.split(' ')[0] ?? 'Usuário'} 👋</Text>
          <Text style={styles.welcomeSub}>Aqui está o resumo das suas obras</Text>
        </View>
        <TouchableOpacity
          style={styles.newInspBtn}
          onPress={() => router.push('/(tabs)/inspection' as any)}
          activeOpacity={0.85}
        >
          <MaterialIcons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.newInspBtnText}>Nova Inspeção</Text>
        </TouchableOpacity>
      </View>

      {/* KPI Cards */}
      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}>
          <MaterialIcons name="business" size={24} color="#2E7D32" />
          <Text style={styles.kpiValue}>{activeObras.length}</Text>
          <Text style={styles.kpiLabel}>Obras Ativas</Text>
        </View>
        <View style={styles.kpiCard}>
          <MaterialIcons name="fact-check" size={24} color="#1565C0" />
          <Text style={styles.kpiValue}>{totalInspections}</Text>
          <Text style={styles.kpiLabel}>Inspeções</Text>
        </View>
        <View style={[styles.kpiCard, { borderLeftWidth: 3, borderLeftColor: '#2E7D32' }]}>
          <MaterialIcons name="check-circle" size={24} color="#2E7D32" />
          <Text style={[styles.kpiValue, { color: '#2E7D32' }]}>{conformPct}%</Text>
          <Text style={styles.kpiLabel}>Conformidade Geral</Text>
        </View>
        <View style={[styles.kpiCard, { borderLeftWidth: 3, borderLeftColor: '#E53935' }]}>
          <MaterialIcons name="warning" size={24} color="#E53935" />
          <Text style={[styles.kpiValue, { color: '#E53935' }]}>{nonConformidades.length}</Text>
          <Text style={styles.kpiLabel}>Não Conformidades</Text>
        </View>
      </View>

      {/* Main grid */}
      <View style={styles.grid}>
        {/* Obras cards */}
        <View style={styles.obrasSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Obras Ativas</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/cadastros' as any)} activeOpacity={0.7}>
              <Text style={styles.sectionLink}>Ver todas</Text>
            </TouchableOpacity>
          </View>
          {activeObras.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="business" size={40} color="#E0E0E0" />
              <Text style={styles.emptyText}>Nenhuma obra ativa</Text>
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => router.push('/(tabs)/cadastros' as any)}
                activeOpacity={0.85}
              >
                <Text style={styles.emptyBtnText}>Cadastrar Obra</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.obrasGrid}>
              {activeObras.map(obra => <ObraCard key={obra.id} obra={obra} />)}
            </View>
          )}
        </View>

        {/* Right column */}
        <View style={styles.rightCol}>
          {/* Recent inspections */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Últimas Inspeções</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/inspection' as any)} activeOpacity={0.7}>
                <Text style={styles.sectionLink}>Ver todas</Text>
              </TouchableOpacity>
            </View>
            {recentInspections.length === 0 ? (
              <View style={styles.emptySmall}>
                <Text style={styles.emptySmallText}>Nenhuma inspeção realizada</Text>
              </View>
            ) : (
              recentInspections.map((cell) => <RecentInspectionRow key={cell.id} cell={cell} />)
            )}
          </View>

          {/* Non-conformidades alert */}
          {nonConformidades.length > 0 && (
            <View style={[styles.card, { borderLeftWidth: 3, borderLeftColor: '#E53935' }]}>
              <View style={styles.alertHeader}>
                <MaterialIcons name="warning" size={18} color="#E53935" />
                <Text style={styles.alertTitle}>Alertas de Não Conformidade</Text>
              </View>
              <Text style={styles.alertBody}>
                {nonConformidades.length} {nonConformidades.length === 1 ? 'item requer' : 'itens requerem'} atenção imediata.
              </Text>
              <TouchableOpacity
                style={styles.alertBtn}
                onPress={() => router.push('/(tabs)/reports' as any)}
                activeOpacity={0.85}
              >
                <Text style={styles.alertBtnText}>Ver Relatório</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Quick actions */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Ações Rápidas</Text>
            <View style={styles.quickActions}>
              {[
                { icon: 'fact-check', label: 'Nova Inspeção', path: '/(tabs)/inspection' },
                { icon: 'bar-chart', label: 'Relatórios', path: '/(tabs)/reports' },
                { icon: 'folder-open', label: 'Cadastros', path: '/(tabs)/cadastros' },
                { icon: 'settings', label: 'Configurações', path: '/(tabs)/settings' },
              ].map((action) => (
                <TouchableOpacity
                  key={action.path}
                  style={styles.quickAction}
                  onPress={() => router.push(action.path as any)}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name={action.icon as any} size={20} color="#2E7D32" />
                  <Text style={styles.quickActionLabel}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 24, gap: 20 },
  welcomeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 },
  welcomeTitle: { fontSize: 22, fontWeight: '800', color: '#1C1C1C' },
  welcomeSub: { fontSize: 14, color: '#9E9E9E', marginTop: 2 },
  newInspBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#2E7D32', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  newInspBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  kpiRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  kpiCard: { flex: 1, minWidth: 140, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E0E0E0', gap: 6 },
  kpiValue: { fontSize: 28, fontWeight: '900', color: '#1C1C1C' },
  kpiLabel: { fontSize: 12, color: '#9E9E9E', fontWeight: '500' },
  grid: { flexDirection: 'row', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' },
  obrasSection: { flex: 2, minWidth: 320, gap: 12 },
  rightCol: { flex: 1, minWidth: 280, gap: 12 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E0E0E0', gap: 8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1C1C1C' },
  sectionLink: { fontSize: 13, color: '#2E7D32', fontWeight: '600' },
  obrasGrid: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  emptyState: { alignItems: 'center', padding: 32, gap: 12, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E0E0E0' },
  emptyText: { fontSize: 14, color: '#9E9E9E' },
  emptyBtn: { backgroundColor: '#2E7D32', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
  emptyBtnText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  emptySmall: { paddingVertical: 16, alignItems: 'center' },
  emptySmallText: { fontSize: 13, color: '#BDBDBD' },
  alertHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  alertTitle: { fontSize: 14, fontWeight: '700', color: '#E53935' },
  alertBody: { fontSize: 13, color: '#616161' },
  alertBtn: { backgroundColor: '#FFEBEE', borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  alertBtnText: { fontSize: 13, fontWeight: '700', color: '#E53935' },
  quickActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  quickAction: { flex: 1, minWidth: 100, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#E8F5E9', borderRadius: 10, padding: 10 },
  quickActionLabel: { fontSize: 12, fontWeight: '600', color: '#2E7D32' },
});
