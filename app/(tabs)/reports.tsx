import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions,
} from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useData } from '@/lib/data-context';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { G, Path, Text as SvgText } from 'react-native-svg';
import type { InspectionStatus } from '@/lib/types';
import { STATUS_CONFIG } from '@/lib/types';

const { width: SCREEN_W } = Dimensions.get('window');
const PIE_SIZE = Math.min(SCREEN_W - 64, 220);
// ---- Simple Pie Chart ----
interface PieSlice {
  label: string;
  value: number;
  color: string;
  shortLabel: string;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
}

function PieChart({ slices, size }: { slices: PieSlice[]; size: number }) {
  const total = slices.reduce((s, p) => s + p.value, 0);
  if (total === 0) return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#9E9E9E', fontSize: 13 }}>Sem dados</Text>
    </View>
  );

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 4;

  let currentAngle = 0;
  const paths = slices
    .filter(s => s.value > 0)
    .map(slice => {
      const angle = (slice.value / total) * 360;
      const path = describeArc(cx, cy, r, currentAngle, currentAngle + angle);
      const midAngle = currentAngle + angle / 2;
      const labelPos = polarToCartesian(cx, cy, r * 0.65, midAngle);
      currentAngle += angle;
      return { ...slice, path, labelPos, angle };
    });

  return (
    <Svg width={size} height={size}>
      {paths.map((p, i) => (
        <G key={i}>
          <Path d={p.path} fill={p.color} />
          {p.angle > 20 && (
            <SvgText
              x={p.labelPos.x}
              y={p.labelPos.y}
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize={11}
              fontWeight="bold"
            >
              {Math.round((p.value / total) * 100)}%
            </SvgText>
          )}
        </G>
      ))}
    </Svg>
  );
}

// ---- Gauge Chart ----
function GaugeChart({ pct, size }: { pct: number; size: number }) {
  const cx = size / 2;
  const cy = size * 0.6;
  const r = size * 0.4;
  const startAngle = -180;
  const endAngle = 0;
  const filledAngle = startAngle + (pct / 100) * 180;

  const bgPath = describeArc(cx, cy, r, startAngle, endAngle);
  const fillPath = pct > 0 ? describeArc(cx, cy, r, startAngle, filledAngle) : null;

  return (
    <Svg width={size} height={size * 0.7}>
      <Path d={bgPath} fill="#E0E0E0" />
      {fillPath && <Path d={fillPath} fill="#2E7D32" />}
      <SvgText x={cx} y={cy - 10} textAnchor="middle" fill="#1C1C1C" fontSize={22} fontWeight="bold">
        {pct}%
      </SvgText>
      <SvgText x={cx} y={cy + 8} textAnchor="middle" fill="#9E9E9E" fontSize={11}>
        Conformidade
      </SvgText>
    </Svg>
  );
}

type ReportType = 'nonconformity' | 'progress';

export default function ReportsScreen() {
  const { obras, torres, inspections } = useData();
  const [reportType, setReportType] = useState<ReportType>('progress');
  const [selectedObraId, setSelectedObraId] = useState<string | null>(null);
  const [selectedTorreId, setSelectedTorreId] = useState<string | null>(null);
  const [hiddenStatuses, setHiddenStatuses] = useState<Set<InspectionStatus>>(new Set());

  const filteredInspections = useMemo(() => {
    let list = inspections;
    if (selectedObraId) list = list.filter(i => i.obraId === selectedObraId);
    if (selectedTorreId) list = list.filter(i => i.torreId === selectedTorreId);
    return list;
  }, [inspections, selectedObraId, selectedTorreId]);

  const statusCounts = useMemo(() => {
    const counts: Partial<Record<InspectionStatus, number>> = {};
    filteredInspections.forEach(i => {
      counts[i.status] = (counts[i.status] ?? 0) + 1;
    });
    return counts;
  }, [filteredInspections]);

  const pieSlices: PieSlice[] = useMemo(() => {
    return (Object.keys(STATUS_CONFIG) as InspectionStatus[])
      .filter(s => !hiddenStatuses.has(s))
      .map(s => ({
        label: STATUS_CONFIG[s].label,
        shortLabel: STATUS_CONFIG[s].shortLabel,
        value: statusCounts[s] ?? 0,
        color: STATUS_CONFIG[s].color,
      }))
      .filter(s => s.value > 0);
  }, [statusCounts, hiddenStatuses]);

  const conformePct = useMemo(() => {
    const total = filteredInspections.length;
    if (total === 0) return 0;
    const conforme = filteredInspections.filter(i =>
      i.status === 'conforme' || i.status === 'conforme_reinspeção' || i.status === 'liberado_concessao'
    ).length;
    return Math.round((conforme / total) * 100);
  }, [filteredInspections]);

  const progressSlices: PieSlice[] = useMemo(() => {
    const total = filteredInspections.length;
    if (total === 0) return [];
    const conforme = filteredInspections.filter(i => i.status === 'conforme' || i.status === 'conforme_reinspeção' || i.status === 'liberado_concessao').length;
    const naoConforme = filteredInspections.filter(i => i.status === 'nao_conforme' || i.status === 'nao_conforme_reinspeção').length;
    const excecao = filteredInspections.filter(i => i.status === 'excecao' || i.status === 'liberado_concessao').length;
    const naoAvaliado = filteredInspections.filter(i => i.status === 'nao_avaliado').length;
    return [
      { label: 'Conformes', shortLabel: 'C', value: conforme, color: '#2E7D32' },
      { label: 'Não Conformes', shortLabel: 'NC', value: naoConforme, color: '#E53935' },
      { label: 'Exceção', shortLabel: 'EX', value: excecao, color: '#F9A825' },
      { label: 'Não Avaliados', shortLabel: 'NA', value: naoAvaliado, color: '#9E9E9E' },
    ].filter(s => s.value > 0);
  }, [filteredInspections]);

  const obraTorres = useMemo(() => torres.filter(t => t.obraId === selectedObraId), [torres, selectedObraId]);

  const toggleStatus = (s: InspectionStatus) => {
    setHiddenStatuses(prev => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s); else next.add(s);
      return next;
    });
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Relatórios</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Report type selector */}
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[styles.typeBtn, reportType === 'progress' && styles.typeBtnActive]}
            onPress={() => setReportType('progress')}
            activeOpacity={0.7}
          >
            <MaterialIcons name="donut-large" size={18} color={reportType === 'progress' ? '#2E7D32' : '#9E9E9E'} />
            <Text style={[styles.typeBtnText, reportType === 'progress' && styles.typeBtnTextActive]}>Progresso</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeBtn, reportType === 'nonconformity' && styles.typeBtnActive]}
            onPress={() => setReportType('nonconformity')}
            activeOpacity={0.7}
          >
            <MaterialIcons name="pie-chart" size={18} color={reportType === 'nonconformity' ? '#2E7D32' : '#9E9E9E'} />
            <Text style={[styles.typeBtnText, reportType === 'nonconformity' && styles.typeBtnTextActive]}>Não Conformidades</Text>
          </TouchableOpacity>
        </View>

        {/* Filters */}
        <View style={styles.filtersCard}>
          <Text style={styles.filtersTitle}>Filtros</Text>
          <Text style={styles.filterLabel}>Obra</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChips}>
            <TouchableOpacity
              style={[styles.filterChip, !selectedObraId && styles.filterChipActive]}
              onPress={() => { setSelectedObraId(null); setSelectedTorreId(null); }}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterChipText, !selectedObraId && styles.filterChipTextActive]}>Todas</Text>
            </TouchableOpacity>
            {obras.map(o => (
              <TouchableOpacity
                key={o.id}
                style={[styles.filterChip, selectedObraId === o.id && styles.filterChipActive]}
                onPress={() => { setSelectedObraId(o.id); setSelectedTorreId(null); }}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterChipText, selectedObraId === o.id && styles.filterChipTextActive]} numberOfLines={1}>{o.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {selectedObraId && obraTorres.length > 0 && (
            <>
              <Text style={styles.filterLabel}>Torre</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChips}>
                <TouchableOpacity
                  style={[styles.filterChip, !selectedTorreId && styles.filterChipActive]}
                  onPress={() => setSelectedTorreId(null)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.filterChipText, !selectedTorreId && styles.filterChipTextActive]}>Todas</Text>
                </TouchableOpacity>
                {obraTorres.map(t => (
                  <TouchableOpacity
                    key={t.id}
                    style={[styles.filterChip, selectedTorreId === t.id && styles.filterChipActive]}
                    onPress={() => setSelectedTorreId(t.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.filterChipText, selectedTorreId === t.id && styles.filterChipTextActive]}>{t.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}
        </View>

        {/* Chart */}
        <View style={styles.chartCard}>
          {filteredInspections.length === 0 ? (
            <View style={styles.noData}>
              <MaterialIcons name="bar-chart" size={48} color="#E0E0E0" />
              <Text style={styles.noDataText}>Nenhuma inspeção registrada para os filtros selecionados.</Text>
            </View>
          ) : reportType === 'progress' ? (
            <>
              <Text style={styles.chartTitle}>Progresso da Obra</Text>
              <View style={styles.gaugeContainer}>
                <GaugeChart pct={conformePct} size={PIE_SIZE} />
              </View>
              <View style={styles.legend}>
                {progressSlices.map(s => (
                  <View key={s.label} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: s.color }]} />
                    <Text style={styles.legendLabel}>{s.label}</Text>
                    <Text style={styles.legendValue}>{s.value}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{filteredInspections.length}</Text>
                  <Text style={styles.statLabel}>Total</Text>
                </View>
                <View style={[styles.statBox, { borderLeftWidth: 1, borderLeftColor: '#E0E0E0' }]}>
                  <Text style={[styles.statValue, { color: '#2E7D32' }]}>{conformePct}%</Text>
                  <Text style={styles.statLabel}>Conformidade</Text>
                </View>
                <View style={[styles.statBox, { borderLeftWidth: 1, borderLeftColor: '#E0E0E0' }]}>
                  <Text style={[styles.statValue, { color: '#E53935' }]}>
                    {filteredInspections.filter(i => i.status === 'nao_conforme' || i.status === 'nao_conforme_reinspeção').length}
                  </Text>
                  <Text style={styles.statLabel}>Não Conf.</Text>
                </View>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.chartTitle}>Distribuição de Status</Text>
              <View style={styles.pieContainer}>
                <PieChart slices={pieSlices} size={PIE_SIZE} />
              </View>
              <Text style={styles.legendTitle}>Legenda (toque para ocultar/exibir)</Text>
              <View style={styles.legend}>
                {(Object.keys(STATUS_CONFIG) as InspectionStatus[]).map(s => {
                  const cfg = STATUS_CONFIG[s];
                  const count = statusCounts[s] ?? 0;
                  const hidden = hiddenStatuses.has(s);
                  return (
                    <TouchableOpacity
                      key={s}
                      style={[styles.legendItem, hidden && styles.legendItemHidden]}
                      onPress={() => toggleStatus(s)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.legendDot, { backgroundColor: hidden ? '#E0E0E0' : cfg.color }]} />
                      <Text style={[styles.legendLabel, hidden && styles.legendLabelHidden]}>{cfg.label}</Text>
                      <Text style={[styles.legendValue, hidden && styles.legendLabelHidden]}>{count}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}
        </View>

        {/* Export note */}
        <View style={styles.exportNote}>
          <MaterialIcons name="info-outline" size={16} color="#9E9E9E" />
          <Text style={styles.exportNoteText}>
            A exportação de PDF e PNG estará disponível na versão completa com integração ao servidor.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#E0E0E0', backgroundColor: '#FFFFFF' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1C1C1C' },
  scroll: { flex: 1, backgroundColor: '#FAFAFA' },
  content: { padding: 16, paddingBottom: 32 },
  typeSelector: { flexDirection: 'row', backgroundColor: '#F5F5F5', borderRadius: 12, padding: 4, marginBottom: 16 },
  typeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10 },
  typeBtnActive: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  typeBtnText: { fontSize: 13, fontWeight: '600', color: '#9E9E9E' },
  typeBtnTextActive: { color: '#2E7D32' },
  filtersCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#E0E0E0' },
  filtersTitle: { fontSize: 14, fontWeight: '700', color: '#1C1C1C', marginBottom: 10 },
  filterLabel: { fontSize: 11, fontWeight: '700', color: '#9E9E9E', textTransform: 'uppercase', marginBottom: 6, marginTop: 8 },
  filterChips: { flexDirection: 'row', gap: 8 },
  filterChip: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#FAFAFA', maxWidth: 160 },
  filterChipActive: { borderColor: '#2E7D32', backgroundColor: '#E8F5E9' },
  filterChipText: { fontSize: 12, color: '#424242' },
  filterChipTextActive: { color: '#2E7D32', fontWeight: '700' },
  chartCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E0E0E0' },
  chartTitle: { fontSize: 16, fontWeight: '700', color: '#1C1C1C', marginBottom: 16, textAlign: 'center' },
  pieContainer: { alignItems: 'center', marginBottom: 16 },
  gaugeContainer: { alignItems: 'center', marginBottom: 8 },
  legendTitle: { fontSize: 12, color: '#9E9E9E', marginBottom: 8, textAlign: 'center' },
  legend: { gap: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  legendItemHidden: { opacity: 0.4 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendLabel: { flex: 1, fontSize: 13, color: '#1C1C1C' },
  legendLabelHidden: { color: '#9E9E9E' },
  legendValue: { fontSize: 13, fontWeight: '700', color: '#1C1C1C' },
  statsRow: { flexDirection: 'row', marginTop: 16, borderTopWidth: 1, borderTopColor: '#E0E0E0', paddingTop: 12 },
  statBox: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { fontSize: 22, fontWeight: '800', color: '#1C1C1C' },
  statLabel: { fontSize: 11, color: '#9E9E9E' },
  noData: { alignItems: 'center', paddingVertical: 32, gap: 10 },
  noDataText: { fontSize: 13, color: '#9E9E9E', textAlign: 'center', lineHeight: 18 },
  exportNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#F5F5F5', borderRadius: 10, padding: 12 },
  exportNoteText: { flex: 1, fontSize: 12, color: '#9E9E9E', lineHeight: 16 },
});
