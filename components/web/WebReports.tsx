import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useData } from '@/lib/data-context';
import { STATUS_CONFIG } from '@/lib/types';
import type { InspectionStatus } from '@/lib/types';

const STATUS_LIST = Object.entries(STATUS_CONFIG) as [InspectionStatus, typeof STATUS_CONFIG[InspectionStatus]][];

// ---- SVG Pie Chart (web only) ----
function PieChart({ data, size = 160 }: {
  data: { label: string; value: number; color: string }[];
  size?: number;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) {
    return (
      <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 12, color: '#BDBDBD' }}>Sem dados</Text>
      </View>
    );
  }

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 8;

  let startAngle = -Math.PI / 2;
  const slices = data.filter(d => d.value > 0).map(d => {
    const angle = (d.value / total) * 2 * Math.PI;
    const endAngle = startAngle + angle;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = angle > Math.PI ? 1 : 0;
    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    const slice = { ...d, path };
    startAngle = endAngle;
    return slice;
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((s, i) => (
        <path key={i} d={s.path} fill={s.color} stroke="#FFFFFF" strokeWidth={2} />
      ))}
      <circle cx={cx} cy={cy} r={r * 0.5} fill="#FFFFFF" />
    </svg>
  ) as any;
}

// ---- Gauge (conformidade) ----
function GaugeChart({ pct, size = 140 }: { pct: number; size?: number }) {
  const cx = size / 2;
  const cy = size * 0.65;
  const r = size * 0.38;
  const startAngle = Math.PI;
  const endAngle = 2 * Math.PI;
  const totalAngle = endAngle - startAngle;
  const fillAngle = startAngle + (pct / 100) * totalAngle;

  const bgX1 = cx + r * Math.cos(startAngle);
  const bgY1 = cy + r * Math.sin(startAngle);
  const bgX2 = cx + r * Math.cos(endAngle);
  const bgY2 = cy + r * Math.sin(endAngle);
  const bgPath = `M ${bgX1} ${bgY1} A ${r} ${r} 0 1 1 ${bgX2} ${bgY2}`;

  const fgX2 = cx + r * Math.cos(fillAngle);
  const fgY2 = cy + r * Math.sin(fillAngle);
  const largeArc = (pct / 100) * totalAngle > Math.PI ? 1 : 0;
  const fgPath = pct > 0
    ? `M ${bgX1} ${bgY1} A ${r} ${r} 0 ${largeArc} 1 ${fgX2} ${fgY2}`
    : '';

  const color = pct >= 80 ? '#2E7D32' : pct >= 50 ? '#F9A825' : '#E53935';

  return (
    <View style={{ alignItems: 'center' }}>
      <svg width={size} height={size * 0.7} viewBox={`0 0 ${size} ${size * 0.7}`}>
        <path d={bgPath} fill="none" stroke="#E0E0E0" strokeWidth={14} strokeLinecap="round" />
        {fgPath && <path d={fgPath} fill="none" stroke={color} strokeWidth={14} strokeLinecap="round" />}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize={24} fontWeight="900" fill={color}>{pct}%</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize={11} fill="#9E9E9E">conformidade</text>
      </svg>
    </View>
  ) as any;
}

// ---- Bar Chart ----
function BarChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <View style={barStyles.container}>
      {data.map((d, i) => (
        <View key={i} style={barStyles.row}>
          <Text style={barStyles.label} numberOfLines={1}>{d.label}</Text>
          <View style={barStyles.barBg}>
            <View style={[barStyles.bar, { width: `${(d.value / max) * 100}%` as any, backgroundColor: d.color }]} />
          </View>
          <Text style={[barStyles.value, { color: d.color }]}>{d.value}</Text>
        </View>
      ))}
    </View>
  );
}

const barStyles = StyleSheet.create({
  container: { gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  label: { width: 120, fontSize: 12, color: '#424242', fontWeight: '500' },
  barBg: { flex: 1, height: 10, backgroundColor: '#F0F0F0', borderRadius: 5, overflow: 'hidden' },
  bar: { height: 10, borderRadius: 5 },
  value: { width: 32, fontSize: 12, fontWeight: '700', textAlign: 'right' },
});

export function WebReports() {
  const { obras, inspections, servicos, locais, torres } = useData();
  const [selectedObraId, setSelectedObraId] = useState('');

  const obraInspections = useMemo(() => {
    if (!selectedObraId) return inspections;
    return inspections.filter(i => i.obraId === selectedObraId);
  }, [inspections, selectedObraId]);

  const statusCounts = useMemo(() => {
    const counts: Record<InspectionStatus, number> = {} as any;
    STATUS_LIST.forEach(([k]) => { counts[k] = 0; });
    obraInspections.forEach(c => { counts[c.status] = (counts[c.status] ?? 0) + 1; });
    return counts;
  }, [obraInspections]);

  const total = obraInspections.length;
  const conforme = (statusCounts['conforme'] ?? 0) + (statusCounts['conforme_reinspeção'] ?? 0) + (statusCounts['liberado_concessao'] ?? 0);
  const naoConforme = (statusCounts['nao_conforme'] ?? 0) + (statusCounts['nao_conforme_reinspeção'] ?? 0);
  const conformPct = total > 0 ? Math.round((conforme / total) * 100) : 0;

  const pieData = STATUS_LIST
    .filter(([k]) => statusCounts[k] > 0)
    .map(([k, cfg]) => ({ label: cfg.label, value: statusCounts[k], color: cfg.color }));

  const nonConformidades = useMemo(() => {
    return obraInspections
      .filter(i => i.status === 'nao_conforme' || i.status === 'nao_conforme_reinspeção')
      .map(i => {
        const obra = obras.find(o => o.id === i.obraId);
        const servico = servicos.find(s => s.id === i.servicoId);
        const local = locais.find(l => l.id === i.localId);
        const etapa = servico?.etapas.find(e => e.id === i.etapaId);
        return { ...i, obraName: obra?.name, servicoName: servico?.name, localName: local?.name, etapaDesc: etapa?.description };
      });
  }, [obraInspections, obras, servicos, locais]);

  const byServico = useMemo(() => {
    const map: Record<string, { name: string; total: number; nc: number }> = {};
    obraInspections.forEach(i => {
      const s = servicos.find(x => x.id === i.servicoId);
      if (!s) return;
      if (!map[s.id]) map[s.id] = { name: s.name, total: 0, nc: 0 };
      map[s.id].total++;
      if (i.status === 'nao_conforme' || i.status === 'nao_conforme_reinspeção') map[s.id].nc++;
    });
    return Object.values(map).sort((a, b) => b.nc - a.nc);
  }, [obraInspections, servicos]);

  const handlePrint = () => {
    if (typeof window !== 'undefined') window.print();
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {/* Toolbar */}
      <View style={styles.toolbar}>
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Filtrar por obra:</Text>
          <View style={styles.selectWrap}>
            <select
              style={webSelectStyle}
              value={selectedObraId}
              onChange={(e: any) => setSelectedObraId(e.target.value)}
            >
              <option value="">Todas as obras</option>
              {obras.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </View>
        </View>
        <TouchableOpacity style={styles.printBtn} onPress={handlePrint} activeOpacity={0.85}>
          <MaterialIcons name="print" size={16} color="#616161" />
          <Text style={styles.printBtnText}>Imprimir</Text>
        </TouchableOpacity>
      </View>

      {/* KPI row */}
      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiValue}>{total}</Text>
          <Text style={styles.kpiLabel}>Total de Inspeções</Text>
        </View>
        <View style={[styles.kpiCard, { borderTopWidth: 3, borderTopColor: '#2E7D32' }]}>
          <Text style={[styles.kpiValue, { color: '#2E7D32' }]}>{conforme}</Text>
          <Text style={styles.kpiLabel}>Conformes</Text>
        </View>
        <View style={[styles.kpiCard, { borderTopWidth: 3, borderTopColor: '#E53935' }]}>
          <Text style={[styles.kpiValue, { color: '#E53935' }]}>{naoConforme}</Text>
          <Text style={styles.kpiLabel}>Não Conformes</Text>
        </View>
        <View style={[styles.kpiCard, { borderTopWidth: 3, borderTopColor: '#9E9E9E' }]}>
          <Text style={[styles.kpiValue, { color: '#9E9E9E' }]}>{statusCounts['nao_avaliado'] ?? 0}</Text>
          <Text style={styles.kpiLabel}>Não Avaliados</Text>
        </View>
      </View>

      {/* Charts row */}
      <View style={styles.chartsRow}>
        {/* Gauge */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Índice de Conformidade</Text>
          <View style={styles.gaugeWrap}>
            <GaugeChart pct={conformPct} size={180} />
          </View>
          <View style={styles.gaugeLegend}>
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: '#2E7D32' }]} />
              <Text style={styles.legendText}>≥ 80% — Excelente</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: '#F9A825' }]} />
              <Text style={styles.legendText}>50–79% — Atenção</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: '#E53935' }]} />
              <Text style={styles.legendText}>{'< 50% — Crítico'}</Text>
            </View>
          </View>
        </View>

        {/* Pie */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Distribuição por Status</Text>
          <View style={styles.pieWrap}>
            <PieChart data={pieData} size={160} />
          </View>
          <View style={styles.pieLegend}>
            {pieData.map((d, i) => (
              <View key={i} style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: d.color }]} />
                <Text style={styles.legendText}>{d.label}: {d.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Bar by servico */}
        <View style={[styles.chartCard, { flex: 2 }]}>
          <Text style={styles.chartTitle}>Não Conformidades por Serviço</Text>
          {byServico.length === 0 ? (
            <View style={styles.emptyChart}>
              <Text style={styles.emptyChartText}>Nenhuma não conformidade registrada</Text>
            </View>
          ) : (
            <BarChart
              data={byServico.slice(0, 8).map(s => ({
                label: s.name,
                value: s.nc,
                color: s.nc === 0 ? '#2E7D32' : s.nc < 3 ? '#F9A825' : '#E53935',
              }))}
            />
          )}
        </View>
      </View>

      {/* Non-conformidades table */}
      <View style={styles.tableCard}>
        <View style={styles.tableHeader}>
          <Text style={styles.chartTitle}>Lista de Não Conformidades</Text>
          <View style={[styles.badge, { backgroundColor: '#FFEBEE' }]}>
            <Text style={[styles.badgeText, { color: '#E53935' }]}>{nonConformidades.length} itens</Text>
          </View>
        </View>
        {nonConformidades.length === 0 ? (
          <View style={styles.emptyChart}>
            <MaterialIcons name="check-circle" size={32} color="#2E7D32" />
            <Text style={[styles.emptyChartText, { color: '#2E7D32' }]}>Nenhuma não conformidade!</Text>
          </View>
        ) : (
          <View>
            {/* Table header */}
            <View style={styles.tableRowHeader}>
              <Text style={[styles.tableCell, styles.tableCellHeader, { flex: 2 }]}>Obra</Text>
              <Text style={[styles.tableCell, styles.tableCellHeader, { flex: 2 }]}>Serviço</Text>
              <Text style={[styles.tableCell, styles.tableCellHeader, { flex: 1 }]}>Local</Text>
              <Text style={[styles.tableCell, styles.tableCellHeader, { flex: 2 }]}>Etapa</Text>
              <Text style={[styles.tableCell, styles.tableCellHeader, { flex: 1 }]}>Status</Text>
              <Text style={[styles.tableCell, styles.tableCellHeader, { flex: 1 }]}>Inspetor</Text>
              <Text style={[styles.tableCell, styles.tableCellHeader, { flex: 1 }]}>Data</Text>
            </View>
            {nonConformidades.map((nc, i) => {
              const cfg = STATUS_CONFIG[nc.status];
              return (
                <View key={nc.id} style={[styles.tableRow, i % 2 === 0 && styles.tableRowEven]}>
                  <Text style={[styles.tableCell, { flex: 2 }]} numberOfLines={1}>{nc.obraName ?? '—'}</Text>
                  <Text style={[styles.tableCell, { flex: 2 }]} numberOfLines={1}>{nc.servicoName ?? '—'}</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]} numberOfLines={1}>{nc.localName ?? '—'}</Text>
                  <Text style={[styles.tableCell, { flex: 2 }]} numberOfLines={1}>{nc.etapaDesc ?? '—'}</Text>
                  <View style={{ flex: 1 }}>
                    <View style={[styles.statusBadge, { backgroundColor: cfg.color + '18' }]}>
                      <Text style={[styles.statusBadgeText, { color: cfg.color }]}>{cfg.shortLabel}</Text>
                    </View>
                  </View>
                  <Text style={[styles.tableCell, { flex: 1 }]} numberOfLines={1}>{nc.inspectedBy ?? '—'}</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]} numberOfLines={1}>
                    {nc.inspectedAt ? new Date(nc.inspectedAt).toLocaleDateString('pt-BR') : '—'}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const webSelectStyle: any = {
  padding: '6px 10px',
  fontSize: 13,
  border: '1px solid #E0E0E0',
  borderRadius: 8,
  backgroundColor: '#FAFAFA',
  color: '#1C1C1C',
  outline: 'none',
  cursor: 'pointer',
  minWidth: 200,
};

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 24, gap: 20 },
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 },
  filterGroup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  filterLabel: { fontSize: 13, fontWeight: '600', color: '#424242' },
  selectWrap: {},
  printBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#FFFFFF' },
  printBtnText: { fontSize: 13, fontWeight: '600', color: '#424242' },
  kpiRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  kpiCard: { flex: 1, minWidth: 120, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E0E0E0', gap: 4 },
  kpiValue: { fontSize: 28, fontWeight: '900', color: '#1C1C1C' },
  kpiLabel: { fontSize: 12, color: '#9E9E9E', fontWeight: '500' },
  chartsRow: { flexDirection: 'row', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' },
  chartCard: { flex: 1, minWidth: 220, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#E0E0E0', gap: 12 },
  chartTitle: { fontSize: 14, fontWeight: '700', color: '#1C1C1C' },
  gaugeWrap: { alignItems: 'center' },
  gaugeLegend: { gap: 4 },
  pieWrap: { alignItems: 'center' },
  pieLegend: { gap: 4 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12, color: '#424242' },
  emptyChart: { alignItems: 'center', padding: 24, gap: 8 },
  emptyChartText: { fontSize: 13, color: '#BDBDBD' },
  tableCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#E0E0E0', gap: 12 },
  tableHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  tableRowHeader: { flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: '#E0E0E0', paddingBottom: 8, marginBottom: 4 },
  tableRow: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  tableRowEven: { backgroundColor: '#FAFAFA' },
  tableCell: { fontSize: 12, color: '#424242', paddingHorizontal: 4 },
  tableCellHeader: { fontSize: 11, fontWeight: '700', color: '#9E9E9E', textTransform: 'uppercase' },
  statusBadge: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start' },
  statusBadgeText: { fontSize: 10, fontWeight: '700' },
});
