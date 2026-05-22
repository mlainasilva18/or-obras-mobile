import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Modal, TextInput, Platform,
  Pressable,
} from 'react-native';
import { WebInspection } from '@/components/web/WebInspection';
import { ScreenContainer } from '@/components/screen-container';
import { useData } from '@/lib/data-context';
import { useAuth } from '@/lib/auth-context';
import { MaterialIcons } from '@expo/vector-icons';
import type { InspectionStatus, InspectionCell, EtapaServico, Local } from '@/lib/types';
import { STATUS_CONFIG } from '@/lib/types';

const CELL_W = 64;
const CELL_H = 52;
const LABEL_W = 180;

// ---- Status Picker ----
const ALL_STATUSES: InspectionStatus[] = [
  'conforme', 'nao_conforme', 'excecao', 'nao_avaliado',
  'liberado_concessao', 'conforme_reinspeção', 'nao_conforme_reinspeção',
];

function StatusDot({ status, size = 12 }: { status: InspectionStatus; size?: number }) {
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: STATUS_CONFIG[status].color,
    }} />
  );
}

// ---- Cell Component ----
function InspectionCellView({
  cell, etapa, local, onPress, onLongPress,
}: {
  cell?: InspectionCell;
  etapa: EtapaServico;
  local: Local;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const status = cell?.status ?? 'nao_avaliado';
  const cfg = STATUS_CONFIG[status];
  const hasData = !!cell && status !== 'nao_avaliado';

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        cellStyles.cell,
        { backgroundColor: cfg.color + (hasData ? 'FF' : '22') },
        pressed && { opacity: 0.7 },
      ]}
    >
      <Text style={[cellStyles.cellText, { color: hasData ? '#FFFFFF' : cfg.color }]}>
        {cfg.shortLabel}
      </Text>
      {cell?.observation && (
        <View style={cellStyles.obsDot} />
      )}
    </Pressable>
  );
}

// ---- Cell Action Modal ----
function CellActionModal({
  visible, onClose, etapa, local, cell, onSave,
}: {
  visible: boolean;
  onClose: () => void;
  etapa?: EtapaServico;
  local?: Local;
  cell?: InspectionCell;
  onSave: (status: InspectionStatus, obs: string, treatObs: string) => void;
}) {
  const [selectedStatus, setSelectedStatus] = useState<InspectionStatus>(cell?.status ?? 'nao_avaliado');
  const [obs, setObs] = useState(cell?.observation ?? '');
  const [treatObs, setTreatObs] = useState(cell?.treatmentObservation ?? '');
  const [tab, setTab] = useState<'status' | 'obs'>('status');

  React.useEffect(() => {
    if (visible) {
      setSelectedStatus(cell?.status ?? 'nao_avaliado');
      setObs(cell?.observation ?? '');
      setTreatObs(cell?.treatmentObservation ?? '');
      setTab('status');
    }
  }, [visible, cell]);

  if (!etapa || !local) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={actionStyles.container}>
        <View style={actionStyles.header}>
          <View style={actionStyles.headerLeft}>
            <Text style={actionStyles.localName}>{local.name}</Text>
            <Text style={actionStyles.etapaName} numberOfLines={2}>{etapa.description}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={actionStyles.closeBtn}>
            <MaterialIcons name="close" size={24} color="#424242" />
          </TouchableOpacity>
        </View>

        <View style={actionStyles.tabBar}>
          <TouchableOpacity
            style={[actionStyles.tab, tab === 'status' && actionStyles.tabActive]}
            onPress={() => setTab('status')}
            activeOpacity={0.7}
          >
            <Text style={[actionStyles.tabText, tab === 'status' && actionStyles.tabTextActive]}>Status</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[actionStyles.tab, tab === 'obs' && actionStyles.tabActive]}
            onPress={() => setTab('obs')}
            activeOpacity={0.7}
          >
            <Text style={[actionStyles.tabText, tab === 'obs' && actionStyles.tabTextActive]}>Observações</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={actionStyles.body} keyboardShouldPersistTaps="handled">
          {tab === 'status' && (
            <View>
              <Text style={actionStyles.sectionLabel}>Selecionar Status</Text>
              {ALL_STATUSES.map(s => {
                const cfg = STATUS_CONFIG[s];
                const isSelected = selectedStatus === s;
                return (
                  <TouchableOpacity
                    key={s}
                    style={[actionStyles.statusRow, isSelected && { backgroundColor: cfg.color + '15', borderColor: cfg.color }]}
                    onPress={() => setSelectedStatus(s)}
                    activeOpacity={0.8}
                  >
                    <View style={[actionStyles.statusDot, { backgroundColor: cfg.color }]} />
                    <Text style={[actionStyles.statusLabel, isSelected && { color: cfg.color, fontWeight: '700' }]}>{cfg.label}</Text>
                    {isSelected && <MaterialIcons name="check-circle" size={20} color={cfg.color} />}
                  </TouchableOpacity>
                );
              })}

              <View style={actionStyles.etapaInfo}>
                <Text style={actionStyles.etapaInfoTitle}>Informações da Etapa</Text>
                <Text style={actionStyles.etapaInfoLabel}>Método de Verificação</Text>
                <Text style={actionStyles.etapaInfoValue}>{etapa.verificationMethod}</Text>
                <Text style={actionStyles.etapaInfoLabel}>Tolerância</Text>
                <Text style={actionStyles.etapaInfoValue}>{etapa.tolerance}</Text>
              </View>
            </View>
          )}

          {tab === 'obs' && (
            <View>
              <Text style={actionStyles.sectionLabel}>Observação</Text>
              <TextInput
                style={actionStyles.obsInput}
                value={obs}
                onChangeText={setObs}
                placeholder="Registre uma observação sobre esta inspeção..."
                placeholderTextColor="#9E9E9E"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <Text style={actionStyles.sectionLabel}>Observação de Tratamento</Text>
              <TextInput
                style={actionStyles.obsInput}
                value={treatObs}
                onChangeText={setTreatObs}
                placeholder="Registre a ação de tratamento para não conformidades..."
                placeholderTextColor="#9E9E9E"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          )}
        </ScrollView>

        <View style={actionStyles.footer}>
          <TouchableOpacity
            style={[actionStyles.saveBtn, { backgroundColor: STATUS_CONFIG[selectedStatus].color }]}
            onPress={() => { onSave(selectedStatus, obs, treatObs); onClose(); }}
            activeOpacity={0.85}
          >
            <Text style={actionStyles.saveBtnText}>Salvar — {STATUS_CONFIG[selectedStatus].label}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ---- Cell Tooltip Modal ----
function CellTooltipModal({
  visible, onClose, cell, etapa, local,
}: {
  visible: boolean;
  onClose: () => void;
  cell?: InspectionCell;
  etapa?: EtapaServico;
  local?: Local;
}) {
  if (!cell || !etapa || !local) return null;
  const cfg = STATUS_CONFIG[cell.status];
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable style={tooltipStyles.overlay} onPress={onClose}>
        <View style={tooltipStyles.card}>
          <View style={[tooltipStyles.statusBar, { backgroundColor: cfg.color }]}>
            <Text style={tooltipStyles.statusText}>{cfg.label}</Text>
          </View>
          <View style={tooltipStyles.body}>
            <View style={tooltipStyles.row}>
              <Text style={tooltipStyles.label}>Local:</Text>
              <Text style={tooltipStyles.value}>{local.name}</Text>
            </View>
            <View style={tooltipStyles.row}>
              <Text style={tooltipStyles.label}>Etapa:</Text>
              <Text style={tooltipStyles.value} numberOfLines={2}>{etapa.description}</Text>
            </View>
            <View style={tooltipStyles.row}>
              <Text style={tooltipStyles.label}>Verificação:</Text>
              <Text style={tooltipStyles.value}>{etapa.verificationMethod}</Text>
            </View>
            {cell.inspectedBy && (
              <View style={tooltipStyles.row}>
                <Text style={tooltipStyles.label}>Inspetor:</Text>
                <Text style={tooltipStyles.value}>{cell.inspectedBy}</Text>
              </View>
            )}
            {cell.inspectedAt && (
              <View style={tooltipStyles.row}>
                <Text style={tooltipStyles.label}>Data/Hora:</Text>
                <Text style={tooltipStyles.value}>{new Date(cell.inspectedAt).toLocaleString('pt-BR')}</Text>
              </View>
            )}
            {cell.observation && (
              <View style={tooltipStyles.obsBox}>
                <Text style={tooltipStyles.obsLabel}>Observação:</Text>
                <Text style={tooltipStyles.obsValue}>{cell.observation}</Text>
              </View>
            )}
            {cell.treatmentObservation && (
              <View style={tooltipStyles.obsBox}>
                <Text style={tooltipStyles.obsLabel}>Tratamento:</Text>
                <Text style={tooltipStyles.obsValue}>{cell.treatmentObservation}</Text>
              </View>
            )}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

// ---- Main Inspection Screen ----
export default function InspectionScreen() {
  if (Platform.OS === 'web') return <WebInspection />;

  const { obras, torres, pavimentos, locais, servicos, inspections, saveInspection, edificacoes } = useData();
  const { user } = useAuth();

  const [selectedObraId, setSelectedObraId] = useState<string | null>(null);
  const [selectedTorreId, setSelectedTorreId] = useState<string | null>(null);
  const [selectedPavId, setSelectedPavId] = useState<string | null>(null);
  const [selectedServId, setSelectedServId] = useState<string | null>(null);
  // Edificação → Local → Elemento (opcionais, para contexto adicional)
  const [selectedEdifId, setSelectedEdifId] = useState<string | null>(null);
  const [selectedLocalEdifId, setSelectedLocalEdifId] = useState<string | null>(null);
  const [selectedElementoId, setSelectedElementoId] = useState<string | null>(null);

  const [activeCell, setActiveCell] = useState<{ etapaId: string; localId: string } | null>(null);
  const [tooltipCell, setTooltipCell] = useState<{ etapaId: string; localId: string } | null>(null);
  const [filterStatuses, setFilterStatuses] = useState<Set<InspectionStatus>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [hideReviewed, setHideReviewed] = useState(false);

  // Derived data
  const obraTorres = useMemo(() => torres.filter(t => t.obraId === selectedObraId), [torres, selectedObraId]);
  const selectedEdif = useMemo(() => edificacoes.find(e => e.id === selectedEdifId), [edificacoes, selectedEdifId]);
  const edifLocais = useMemo(() => selectedEdif?.locais ?? [], [selectedEdif]);
  const edifElementos = useMemo(() => {
    if (!selectedEdif) return [];
    if (!selectedLocalEdifId) return selectedEdif.elementos;
    return selectedEdif.elementos; // elementos não são filtrados por local — todos pertencem à edificação
  }, [selectedEdif, selectedLocalEdifId]);
  const torrePavs = useMemo(() => pavimentos.filter(p => p.torreId === selectedTorreId), [pavimentos, selectedTorreId]);
  const pavLocais = useMemo(() => locais.filter(l => l.pavimentoId === selectedPavId).sort((a, b) => a.order - b.order), [locais, selectedPavId]);
  const selectedServico = useMemo(() => servicos.find(s => s.id === selectedServId), [servicos, selectedServId]);

  const visibleEtapas = useMemo(() => {
    if (!selectedServico) return [];
    if (!hideReviewed) return selectedServico.etapas;
    return selectedServico.etapas.filter(e => {
      const cells = inspections.filter(c => c.etapaId === e.id && c.pavimentoId === selectedPavId);
      return cells.some(c => c.status === 'nao_avaliado' || !c);
    });
  }, [selectedServico, hideReviewed, inspections, selectedPavId]);

  const filteredLocais = useMemo(() => {
    if (filterStatuses.size === 0) return pavLocais;
    return pavLocais.filter(local => {
      if (!selectedServico) return true;
      return selectedServico.etapas.some(e => {
        const cell = inspections.find(c => c.etapaId === e.id && c.localId === local.id);
        const status = cell?.status ?? 'nao_avaliado';
        return filterStatuses.has(status);
      });
    });
  }, [pavLocais, filterStatuses, selectedServico, inspections]);

  const getCell = useCallback((etapaId: string, localId: string) =>
    inspections.find(c => c.etapaId === etapaId && c.localId === localId),
    [inspections]);

  const handleSaveCell = async (status: InspectionStatus, obs: string, treatObs: string) => {
    if (!activeCell || !selectedObraId || !selectedTorreId || !selectedPavId || !selectedServId) return;
    const existing = getCell(activeCell.etapaId, activeCell.localId);
    const cell: InspectionCell = {
      id: existing?.id ?? `cell_${activeCell.etapaId}_${activeCell.localId}`,
      obraId: selectedObraId,
      torreId: selectedTorreId,
      pavimentoId: selectedPavId,
      localId: activeCell.localId,
      servicoId: selectedServId,
      etapaId: activeCell.etapaId,
      status,
      observation: obs || undefined,
      treatmentObservation: treatObs || undefined,
      inspectedBy: user?.name,
      inspectedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await saveInspection(cell);
  };

  const toggleFilter = (s: InspectionStatus) => {
    setFilterStatuses(prev => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s); else next.add(s);
      return next;
    });
  };

  // Summary stats
  const summaryStats = useMemo(() => {
    if (!selectedServico || filteredLocais.length === 0) return null;
    const cells = inspections.filter(c => c.servicoId === selectedServId && c.pavimentoId === selectedPavId);
    const total = selectedServico.etapas.length * filteredLocais.length;
    const counts: Record<InspectionStatus, number> = {
      conforme: 0, nao_conforme: 0, excecao: 0, nao_avaliado: 0,
      liberado_concessao: 0, conforme_reinspeção: 0, nao_conforme_reinspeção: 0,
    };
    cells.forEach(c => { counts[c.status] = (counts[c.status] ?? 0) + 1; });
    counts.nao_avaliado = total - (cells.length);
    return { total, counts };
  }, [inspections, selectedServId, selectedPavId, selectedServico, filteredLocais]);

  const activeCellData = activeCell ? getCell(activeCell.etapaId, activeCell.localId) : undefined;
  const activeEtapa = activeCell ? selectedServico?.etapas.find(e => e.id === activeCell.etapaId) : undefined;
  const activeLocal = activeCell ? filteredLocais.find(l => l.id === activeCell.localId) : undefined;

  const tooltipCellData = tooltipCell ? getCell(tooltipCell.etapaId, tooltipCell.localId) : undefined;
  const tooltipEtapa = tooltipCell ? selectedServico?.etapas.find(e => e.id === tooltipCell.etapaId) : undefined;
  const tooltipLocal = tooltipCell ? filteredLocais.find(l => l.id === tooltipCell.localId) : undefined;

  const isReady = selectedObraId && selectedTorreId && selectedPavId && selectedServId && selectedServico;

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inspeção FVS</Text>
        {isReady && (
          <TouchableOpacity onPress={() => setShowFilters(!showFilters)} style={styles.filterBtn} activeOpacity={0.7}>
            <MaterialIcons name="filter-list" size={22} color={filterStatuses.size > 0 ? '#2E7D32' : '#424242'} />
            {filterStatuses.size > 0 && <View style={styles.filterBadge}><Text style={styles.filterBadgeText}>{filterStatuses.size}</Text></View>}
          </TouchableOpacity>
        )}
      </View>

      {/* Selectors */}
      <View style={styles.selectors}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectorRow}>
          {/* Obra */}
          <View style={styles.selectorGroup}>
            <Text style={styles.selectorLabel}>Obra</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.selectorChips}>
                {obras.map(o => (
                  <TouchableOpacity
                    key={o.id}
                    style={[styles.chip, selectedObraId === o.id && styles.chipActive]}
                    onPress={() => { setSelectedObraId(o.id); setSelectedTorreId(null); setSelectedPavId(null); setSelectedServId(null); }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chipText, selectedObraId === o.id && styles.chipTextActive]} numberOfLines={1}>{o.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </ScrollView>
      </View>

      {selectedObraId && (
        <View style={styles.subSelectors}>
          {/* Torre */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subRow}>
            <Text style={styles.subLabel}>Torre:</Text>
            {obraTorres.map(t => (
              <TouchableOpacity
                key={t.id}
                style={[styles.subChip, selectedTorreId === t.id && styles.subChipActive]}
                onPress={() => { setSelectedTorreId(t.id); setSelectedPavId(null); setSelectedServId(null); }}
                activeOpacity={0.7}
              >
                <Text style={[styles.subChipText, selectedTorreId === t.id && styles.subChipTextActive]}>{t.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {selectedTorreId && (
        <View style={styles.subSelectors}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subRow}>
            <Text style={styles.subLabel}>Pavimento:</Text>
            {torrePavs.map(p => (
              <TouchableOpacity
                key={p.id}
                style={[styles.subChip, selectedPavId === p.id && styles.subChipActive]}
                onPress={() => { setSelectedPavId(p.id); setSelectedServId(null); }}
                activeOpacity={0.7}
              >
                <Text style={[styles.subChipText, selectedPavId === p.id && styles.subChipTextActive]}>{p.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {selectedPavId && (
        <View style={styles.subSelectors}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subRow}>
            <Text style={styles.subLabel}>Serviço:</Text>
            {servicos.map(s => (
              <TouchableOpacity
                key={s.id}
                style={[styles.subChip, selectedServId === s.id && styles.subChipActive]}
                onPress={() => setSelectedServId(s.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.subChipText, selectedServId === s.id && styles.subChipTextActive]}>{s.code} — {s.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Edificação (opcional) */}
      {edificacoes.length > 0 && (
        <View style={styles.subSelectors}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subRow}>
            <Text style={styles.subLabel}>Edificação:</Text>
            <TouchableOpacity
              style={[styles.subChip, selectedEdifId === null && styles.subChipActive]}
              onPress={() => { setSelectedEdifId(null); setSelectedLocalEdifId(null); setSelectedElementoId(null); }}
              activeOpacity={0.7}
            >
              <Text style={[styles.subChipText, selectedEdifId === null && styles.subChipTextActive]}>Todas</Text>
            </TouchableOpacity>
            {edificacoes.map(e => (
              <TouchableOpacity
                key={e.id}
                style={[styles.subChip, selectedEdifId === e.id && styles.subChipActive]}
                onPress={() => { setSelectedEdifId(e.id); setSelectedLocalEdifId(null); setSelectedElementoId(null); }}
                activeOpacity={0.7}
              >
                <Text style={[styles.subChipText, selectedEdifId === e.id && styles.subChipTextActive]}>{e.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Local da Edificação */}
      {selectedEdifId && edifLocais.length > 0 && (
        <View style={styles.subSelectors}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subRow}>
            <Text style={styles.subLabel}>Local:</Text>
            <TouchableOpacity
              style={[styles.subChip, selectedLocalEdifId === null && styles.subChipActive]}
              onPress={() => { setSelectedLocalEdifId(null); setSelectedElementoId(null); }}
              activeOpacity={0.7}
            >
              <Text style={[styles.subChipText, selectedLocalEdifId === null && styles.subChipTextActive]}>Todos</Text>
            </TouchableOpacity>
            {edifLocais.map(l => (
              <TouchableOpacity
                key={l.id}
                style={[styles.subChip, selectedLocalEdifId === l.id && styles.subChipActive]}
                onPress={() => { setSelectedLocalEdifId(l.id); setSelectedElementoId(null); }}
                activeOpacity={0.7}
              >
                <Text style={[styles.subChipText, selectedLocalEdifId === l.id && styles.subChipTextActive]}>{l.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Elemento da Edificação */}
      {selectedEdifId && edifElementos.length > 0 && (
        <View style={styles.subSelectors}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subRow}>
            <Text style={styles.subLabel}>Elemento:</Text>
            <TouchableOpacity
              style={[styles.subChip, selectedElementoId === null && styles.subChipActive]}
              onPress={() => setSelectedElementoId(null)}
              activeOpacity={0.7}
            >
              <Text style={[styles.subChipText, selectedElementoId === null && styles.subChipTextActive]}>Todos</Text>
            </TouchableOpacity>
            {edifElementos.map(el => (
              <TouchableOpacity
                key={el.id}
                style={[styles.subChip, selectedElementoId === el.id && styles.subChipActive]}
                onPress={() => setSelectedElementoId(el.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.subChipText, selectedElementoId === el.id && styles.subChipTextActive]}>{el.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Filter bar */}
      {showFilters && isReady && (
        <View style={styles.filterBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {ALL_STATUSES.map(s => {
              const cfg = STATUS_CONFIG[s];
              const active = filterStatuses.has(s);
              return (
                <TouchableOpacity
                  key={s}
                  style={[styles.filterChip, active && { backgroundColor: cfg.color, borderColor: cfg.color }]}
                  onPress={() => toggleFilter(s)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.filterDot, { backgroundColor: active ? '#fff' : cfg.color }]} />
                  <Text style={[styles.filterChipText, active && { color: '#fff' }]}>{cfg.shortLabel}</Text>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              style={styles.filterChip}
              onPress={() => setHideReviewed(!hideReviewed)}
              activeOpacity={0.7}
            >
              <MaterialIcons name={hideReviewed ? 'visibility-off' : 'visibility'} size={14} color="#424242" />
              <Text style={styles.filterChipText}>{hideReviewed ? 'Mostrar revisadas' : 'Ocultar revisadas'}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* Matrix */}
      {!isReady ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="fact-check" size={56} color="#E0E0E0" />
          <Text style={styles.emptyTitle}>Selecione os filtros</Text>
          <Text style={styles.emptyText}>Escolha a Obra, Torre, Pavimento e Serviço para iniciar a inspeção.</Text>
        </View>
      ) : filteredLocais.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="location-off" size={48} color="#E0E0E0" />
          <Text style={styles.emptyTitle}>Nenhum local encontrado</Text>
          <Text style={styles.emptyText}>Cadastre locais neste pavimento para iniciar a inspeção.</Text>
        </View>
      ) : (
        <View style={styles.matrixContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator>
            <View>
              {/* Header row: locais */}
              <View style={styles.matrixHeaderRow}>
                <View style={[styles.matrixCorner]} />
                {filteredLocais.map(local => (
                  <View key={local.id} style={[styles.matrixHeaderCell, { width: CELL_W }]}>
                    <Text style={styles.matrixHeaderText} numberOfLines={2}>{local.name}</Text>
                  </View>
                ))}
              </View>

              {/* Data rows: etapas */}
              <ScrollView showsVerticalScrollIndicator>
                {visibleEtapas.map((etapa, rowIdx) => (
                  <View key={etapa.id} style={[styles.matrixRow, rowIdx % 2 === 0 && styles.matrixRowAlt]}>
                    {/* Etapa label */}
                    <View style={styles.matrixRowLabel}>
                      <Text style={styles.matrixRowLabelText} numberOfLines={2}>{etapa.description}</Text>
                      <Text style={styles.matrixRowSubText} numberOfLines={1}>{etapa.verificationMethod}</Text>
                    </View>
                    {/* Cells */}
                    {filteredLocais.map(local => {
                      const cell = getCell(etapa.id, local.id);
                      return (
                        <InspectionCellView
                          key={local.id}
                          cell={cell}
                          etapa={etapa}
                          local={local}
                          onPress={() => setActiveCell({ etapaId: etapa.id, localId: local.id })}
                          onLongPress={() => {
                            if (cell) setTooltipCell({ etapaId: etapa.id, localId: local.id });
                          }}
                        />
                      );
                    })}
                  </View>
                ))}
              </ScrollView>
            </View>
          </ScrollView>
        </View>
      )}

      {/* Summary panel */}
      {isReady && summaryStats && (
        <View style={styles.summaryPanel}>
          <TouchableOpacity
            style={styles.summaryToggle}
            onPress={() => setShowSummary(!showSummary)}
            activeOpacity={0.7}
          >
            <Text style={styles.summaryToggleText}>Resumo da Seleção</Text>
            <MaterialIcons name={showSummary ? 'expand-more' : 'expand-less'} size={20} color="#424242" />
          </TouchableOpacity>
          {showSummary && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.summaryContent}>
              {ALL_STATUSES.map(s => {
                const count = summaryStats.counts[s] ?? 0;
                if (count === 0) return null;
                const cfg = STATUS_CONFIG[s];
                return (
                  <View key={s} style={styles.summaryItem}>
                    <View style={[styles.summaryDot, { backgroundColor: cfg.color }]} />
                    <Text style={styles.summaryCount}>{count}</Text>
                    <Text style={styles.summaryLabel}>{cfg.shortLabel}</Text>
                  </View>
                );
              })}
              <View style={styles.summaryItem}>
                <MaterialIcons name="grid-on" size={14} color="#9E9E9E" />
                <Text style={styles.summaryCount}>{summaryStats.total}</Text>
                <Text style={styles.summaryLabel}>Total</Text>
              </View>
            </ScrollView>
          )}
        </View>
      )}

      {/* Modals */}
      <CellActionModal
        visible={!!activeCell}
        onClose={() => setActiveCell(null)}
        etapa={activeEtapa}
        local={activeLocal}
        cell={activeCellData}
        onSave={handleSaveCell}
      />
      <CellTooltipModal
        visible={!!tooltipCell}
        onClose={() => setTooltipCell(null)}
        cell={tooltipCellData}
        etapa={tooltipEtapa}
        local={tooltipLocal}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#E0E0E0', backgroundColor: '#FFFFFF' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1C1C1C' },
  filterBtn: { padding: 4, position: 'relative' },
  filterBadge: { position: 'absolute', top: 0, right: 0, backgroundColor: '#2E7D32', borderRadius: 8, width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  filterBadgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  selectors: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  selectorRow: { padding: 10 },
  selectorGroup: {},
  selectorLabel: { fontSize: 11, fontWeight: '700', color: '#9E9E9E', textTransform: 'uppercase', marginBottom: 6 },
  selectorChips: { flexDirection: 'row', gap: 8 },
  chip: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: '#FAFAFA', maxWidth: 200 },
  chipActive: { borderColor: '#2E7D32', backgroundColor: '#E8F5E9' },
  chipText: { fontSize: 13, color: '#424242', fontWeight: '500' },
  chipTextActive: { color: '#2E7D32', fontWeight: '700' },
  subSelectors: { backgroundColor: '#F9F9F9', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  subRow: { paddingHorizontal: 12, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 6 },
  subLabel: { fontSize: 11, fontWeight: '700', color: '#9E9E9E', marginRight: 4 },
  subChip: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 16, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: '#FFFFFF' },
  subChipActive: { borderColor: '#2E7D32', backgroundColor: '#E8F5E9' },
  subChipText: { fontSize: 12, color: '#424242' },
  subChipTextActive: { color: '#2E7D32', fontWeight: '700' },
  filterBar: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  filterRow: { paddingHorizontal: 12, paddingVertical: 8, gap: 6 },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 16, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: '#FAFAFA' },
  filterDot: { width: 8, height: 8, borderRadius: 4 },
  filterChipText: { fontSize: 11, color: '#424242', fontWeight: '600' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#424242' },
  emptyText: { fontSize: 14, color: '#9E9E9E', textAlign: 'center', lineHeight: 20 },
  matrixContainer: { flex: 1, backgroundColor: '#FAFAFA' },
  matrixHeaderRow: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderBottomWidth: 2, borderBottomColor: '#E0E0E0' },
  matrixCorner: { width: LABEL_W, height: CELL_H, backgroundColor: '#FFFFFF', borderRightWidth: 1, borderRightColor: '#E0E0E0' },
  matrixHeaderCell: { height: CELL_H, alignItems: 'center', justifyContent: 'center', borderRightWidth: 1, borderRightColor: '#E0E0E0', paddingHorizontal: 4 },
  matrixHeaderText: { fontSize: 11, fontWeight: '700', color: '#1C1C1C', textAlign: 'center' },
  matrixRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  matrixRowAlt: { backgroundColor: '#FAFAFA' },
  matrixRowLabel: { width: LABEL_W, minHeight: CELL_H, justifyContent: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRightWidth: 2, borderRightColor: '#E0E0E0', backgroundColor: '#FFFFFF' },
  matrixRowLabelText: { fontSize: 12, fontWeight: '600', color: '#1C1C1C' },
  matrixRowSubText: { fontSize: 10, color: '#9E9E9E', marginTop: 2 },
  summaryPanel: { backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E0E0E0' },
  summaryToggle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 },
  summaryToggleText: { fontSize: 13, fontWeight: '700', color: '#424242' },
  summaryContent: { paddingHorizontal: 16, paddingBottom: 12, gap: 16 },
  summaryItem: { alignItems: 'center', gap: 3 },
  summaryDot: { width: 12, height: 12, borderRadius: 6 },
  summaryCount: { fontSize: 16, fontWeight: '800', color: '#1C1C1C' },
  summaryLabel: { fontSize: 10, color: '#9E9E9E', fontWeight: '600' },
});

const cellStyles = StyleSheet.create({
  cell: {
    width: CELL_W,
    height: CELL_H,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
    position: 'relative',
  },
  cellText: { fontSize: 11, fontWeight: '800' },
  obsDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
  },
});

const actionStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  headerLeft: { flex: 1, marginRight: 8 },
  localName: { fontSize: 16, fontWeight: '800', color: '#2E7D32' },
  etapaName: { fontSize: 13, color: '#424242', marginTop: 2 },
  closeBtn: { padding: 4 },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#2E7D32' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#9E9E9E' },
  tabTextActive: { color: '#2E7D32' },
  body: { flex: 1, padding: 16 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#424242', marginBottom: 8, marginTop: 4 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#E0E0E0', marginBottom: 6 },
  statusDot: { width: 16, height: 16, borderRadius: 8 },
  statusLabel: { flex: 1, fontSize: 14, color: '#1C1C1C' },
  etapaInfo: { backgroundColor: '#F5F5F5', borderRadius: 10, padding: 14, marginTop: 16 },
  etapaInfoTitle: { fontSize: 13, fontWeight: '700', color: '#424242', marginBottom: 8 },
  etapaInfoLabel: { fontSize: 11, color: '#9E9E9E', marginBottom: 2 },
  etapaInfoValue: { fontSize: 13, color: '#1C1C1C', marginBottom: 8 },
  obsInput: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, padding: 12, fontSize: 14, color: '#1C1C1C', backgroundColor: '#FAFAFA', minHeight: 100, marginBottom: 16 },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: '#E0E0E0' },
  saveBtn: { borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  saveBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});

const tooltipStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'hidden', width: '100%', maxWidth: 360 },
  statusBar: { paddingHorizontal: 16, paddingVertical: 10 },
  statusText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  body: { padding: 16 },
  row: { flexDirection: 'row', marginBottom: 8, gap: 8 },
  label: { fontSize: 12, fontWeight: '700', color: '#9E9E9E', minWidth: 80 },
  value: { flex: 1, fontSize: 13, color: '#1C1C1C' },
  obsBox: { backgroundColor: '#F5F5F5', borderRadius: 8, padding: 10, marginTop: 8 },
  obsLabel: { fontSize: 11, fontWeight: '700', color: '#9E9E9E', marginBottom: 4 },
  obsValue: { fontSize: 13, color: '#1C1C1C' },
});
