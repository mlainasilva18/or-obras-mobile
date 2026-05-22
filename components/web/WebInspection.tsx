import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  TextInput, Modal, Platform, useWindowDimensions,
} from 'react-native';
import { useResponsive } from '@/hooks/use-breakpoint';
import { MaterialIcons } from '@expo/vector-icons';
import { useData } from '@/lib/data-context';
import { useAuth } from '@/lib/auth-context';
import type { InspectionStatus, InspectionCell, EtapaServico, Local } from '@/lib/types';
import { STATUS_CONFIG } from '@/lib/types';

const STATUS_LIST = Object.entries(STATUS_CONFIG) as [InspectionStatus, typeof STATUS_CONFIG[InspectionStatus]][];

function uuid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ---- Cell Drawer (web version) ----
interface DrawerProps {
  cell: InspectionCell | null;
  local: Local | null;
  etapa: EtapaServico | null;
  onClose: () => void;
  onSave: (cell: InspectionCell) => void;
}

function CellDrawer({ cell, local, etapa, onClose, onSave }: DrawerProps) {
  const [status, setStatus] = useState<InspectionStatus>(cell?.status ?? 'nao_avaliado');
  const [obs, setObs] = useState(cell?.observation ?? '');
  const [treatment, setTreatment] = useState(cell?.treatmentObservation ?? '');
  const { user } = useAuth();

  if (!cell) return null;

  const handleSave = () => {
    onSave({
      ...cell,
      status,
      observation: obs,
      treatmentObservation: treatment,
      inspectedBy: user?.name,
      inspectedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <View style={drawerStyles.overlay}>
      <TouchableOpacity style={drawerStyles.backdrop} onPress={onClose} activeOpacity={1} />
      <View style={drawerStyles.drawer}>
        {/* Header */}
        <View style={drawerStyles.header}>
          <View>
            <Text style={drawerStyles.title}>{local?.name ?? '—'}</Text>
            <Text style={drawerStyles.subtitle}>{etapa?.description ?? '—'}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={drawerStyles.closeBtn} activeOpacity={0.7}>
            <MaterialIcons name="close" size={22} color="#424242" />
          </TouchableOpacity>
        </View>

        <ScrollView style={drawerStyles.body} showsVerticalScrollIndicator={false}>
          {/* Etapa info */}
          {etapa && (
            <View style={drawerStyles.infoBox}>
              <View style={drawerStyles.infoRow}>
                <Text style={drawerStyles.infoLabel}>Método de Verificação:</Text>
                <Text style={drawerStyles.infoValue}>{etapa.verificationMethod}</Text>
              </View>
              <View style={drawerStyles.infoRow}>
                <Text style={drawerStyles.infoLabel}>Tolerância:</Text>
                <Text style={drawerStyles.infoValue}>{etapa.tolerance}</Text>
              </View>
            </View>
          )}

          {/* Status selector */}
          <Text style={drawerStyles.sectionLabel}>Status da Inspeção</Text>
          <View style={drawerStyles.statusGrid}>
            {STATUS_LIST.map(([key, cfg]) => (
              <TouchableOpacity
                key={key}
                style={[
                  drawerStyles.statusOption,
                  status === key && { borderColor: cfg.color, backgroundColor: cfg.color + '15' },
                ]}
                onPress={() => setStatus(key)}
                activeOpacity={0.8}
              >
                <View style={[drawerStyles.statusDot, { backgroundColor: cfg.color }]} />
                <Text style={[drawerStyles.statusLabel, status === key && { color: cfg.color, fontWeight: '700' }]}>
                  {cfg.label}
                </Text>
                {status === key && <MaterialIcons name="check" size={14} color={cfg.color} />}
              </TouchableOpacity>
            ))}
          </View>

          {/* Observation */}
          <Text style={drawerStyles.sectionLabel}>Observação</Text>
          <TextInput
            style={drawerStyles.textArea}
            value={obs}
            onChangeText={setObs}
            placeholder="Descreva o resultado da inspeção..."
            placeholderTextColor="#BDBDBD"
            multiline
            numberOfLines={3}
          />

          {/* Treatment observation */}
          <Text style={drawerStyles.sectionLabel}>Observação de Tratamento</Text>
          <TextInput
            style={drawerStyles.textArea}
            value={treatment}
            onChangeText={setTreatment}
            placeholder="Descreva a ação corretiva aplicada..."
            placeholderTextColor="#BDBDBD"
            multiline
            numberOfLines={3}
          />

          {/* Upload placeholder */}
          <Text style={drawerStyles.sectionLabel}>Anexos</Text>
          <TouchableOpacity style={drawerStyles.uploadArea} activeOpacity={0.7}>
            <MaterialIcons name="cloud-upload" size={24} color="#9E9E9E" />
            <Text style={drawerStyles.uploadText}>Arraste fotos ou PDFs aqui</Text>
            <Text style={drawerStyles.uploadHint}>ou clique para selecionar</Text>
          </TouchableOpacity>

          {/* Inspector info */}
          {cell.inspectedBy && (
            <View style={drawerStyles.infoBox}>
              <Text style={drawerStyles.infoLabel}>Inspecionado por: {cell.inspectedBy}</Text>
              {cell.inspectedAt && (
                <Text style={drawerStyles.infoLabel}>
                  Em: {new Date(cell.inspectedAt).toLocaleString('pt-BR')}
                </Text>
              )}
            </View>
          )}
        </ScrollView>

        <View style={drawerStyles.footer}>
          <TouchableOpacity style={drawerStyles.cancelBtn} onPress={onClose} activeOpacity={0.7}>
            <Text style={drawerStyles.cancelBtnText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={drawerStyles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
            <MaterialIcons name="save" size={16} color="#FFFFFF" />
            <Text style={drawerStyles.saveBtnText}>Salvar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const drawerStyles = StyleSheet.create({
  overlay: { position: 'absolute' as any, inset: 0, zIndex: 1000, flexDirection: 'row' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  drawer: { width: 420, maxWidth: '100%' as any, backgroundColor: '#FFFFFF', borderLeftWidth: 1, borderLeftColor: '#E0E0E0', flexDirection: 'column' },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  title: { fontSize: 16, fontWeight: '700', color: '#1C1C1C' },
  subtitle: { fontSize: 13, color: '#9E9E9E', marginTop: 2 },
  closeBtn: { padding: 4 },
  body: { flex: 1, padding: 20 },
  infoBox: { backgroundColor: '#F5F5F5', borderRadius: 8, padding: 12, gap: 4, marginBottom: 16 },
  infoRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  infoLabel: { fontSize: 12, fontWeight: '600', color: '#616161' },
  infoValue: { fontSize: 12, color: '#1C1C1C' },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: '#424242', textTransform: 'uppercase', marginBottom: 8, marginTop: 4 },
  statusGrid: { gap: 6, marginBottom: 16 },
  statusOption: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 8, borderWidth: 1.5, borderColor: '#E0E0E0' },
  statusDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  statusLabel: { flex: 1, fontSize: 13, color: '#424242' },
  textArea: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, padding: 10, fontSize: 13, color: '#1C1C1C', minHeight: 72, textAlignVertical: 'top', marginBottom: 16, backgroundColor: '#FAFAFA' },
  uploadArea: { borderWidth: 2, borderColor: '#E0E0E0', borderStyle: 'dashed', borderRadius: 8, padding: 20, alignItems: 'center', gap: 4, marginBottom: 16 },
  uploadText: { fontSize: 13, color: '#9E9E9E', fontWeight: '600' },
  uploadHint: { fontSize: 11, color: '#BDBDBD' },
  footer: { flexDirection: 'row', gap: 10, padding: 16, borderTopWidth: 1, borderTopColor: '#E0E0E0' },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  cancelBtnText: { fontSize: 14, fontWeight: '600', color: '#424242' },
  saveBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#2E7D32', borderRadius: 8, paddingVertical: 10 },
  saveBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
});

// ---- Bulk Action Modal ----
function BulkActionModal({ count, onClose, onApply }: {
  count: number;
  onClose: () => void;
  onApply: (status: InspectionStatus) => void;
}) {
  const [selected, setSelected] = useState<InspectionStatus>('conforme');
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={bulkStyles.overlay}>
        <View style={bulkStyles.modal}>
          <Text style={bulkStyles.title}>Ação em Lote — {count} locais</Text>
          <Text style={bulkStyles.sub}>Alterar status de todos os locais selecionados:</Text>
          <View style={bulkStyles.list}>
            {STATUS_LIST.map(([key, cfg]) => (
              <TouchableOpacity
                key={key}
                style={[bulkStyles.option, selected === key && { backgroundColor: cfg.color + '15', borderColor: cfg.color }]}
                onPress={() => setSelected(key)}
                activeOpacity={0.8}
              >
                <View style={[bulkStyles.dot, { backgroundColor: cfg.color }]} />
                <Text style={[bulkStyles.optLabel, selected === key && { color: cfg.color, fontWeight: '700' }]}>{cfg.label}</Text>
                {selected === key && <MaterialIcons name="check" size={14} color={cfg.color} />}
              </TouchableOpacity>
            ))}
          </View>
          <View style={bulkStyles.footer}>
            <TouchableOpacity style={bulkStyles.cancelBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={bulkStyles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={bulkStyles.applyBtn} onPress={() => onApply(selected)} activeOpacity={0.85}>
              <Text style={bulkStyles.applyText}>Aplicar a {count} locais</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const bulkStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  modal: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 24, width: '90%' as any, maxWidth: 400, gap: 12 },
  title: { fontSize: 16, fontWeight: '700', color: '#1C1C1C' },
  sub: { fontSize: 13, color: '#9E9E9E' },
  list: { gap: 6 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 8, borderWidth: 1.5, borderColor: '#E0E0E0' },
  dot: { width: 10, height: 10, borderRadius: 5 },
  optLabel: { flex: 1, fontSize: 13, color: '#424242' },
  footer: { flexDirection: 'row', gap: 10, marginTop: 8 },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  cancelText: { fontSize: 14, fontWeight: '600', color: '#424242' },
  applyBtn: { flex: 2, backgroundColor: '#2E7D32', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  applyText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
});

// ---- Main WebInspection ----
export function WebInspection() {
  const { obras, torres, pavimentos, locais, servicos, inspections, saveInspection, createLocaisMassa } = useData();
  const { user } = useAuth();

  const [obraId, setObraId] = useState('');
  const [torreId, setTorreId] = useState('');
  const [pavimentoId, setPavimentoId] = useState('');
  const [servicoId, setServicoId] = useState('');
  const [activeFilters, setActiveFilters] = useState<Set<InspectionStatus>>(new Set());
  const [hideReviewed, setHideReviewed] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(true);
  const [drawerCell, setDrawerCell] = useState<InspectionCell | null>(null);
  const [selectedLocais, setSelectedLocais] = useState<Set<string>>(new Set());
  const [bulkModal, setBulkModal] = useState(false);
  const [massModal, setMassModal] = useState(false);
  const [massPrefix, setMassPrefix] = useState('APTO');
  const [massStart, setMassStart] = useState('101');
  const [massEnd, setMassEnd] = useState('110');
  const [tooltip, setTooltip] = useState<{ cell: InspectionCell; x: number; y: number } | null>(null);

  const filteredTorres = torres.filter(t => t.obraId === obraId);
  const filteredPavimentos = pavimentos.filter(p => p.torreId === torreId);
  const filteredLocais = locais.filter(l => l.pavimentoId === pavimentoId);
  const servico = servicos.find(s => s.id === servicoId);
  const etapas = useMemo(() => {
    if (!servico) return [];
    let list = servico.etapas;
    if (hideReviewed) {
      list = list.filter(e => {
        const cell = inspections.find(c => c.etapaId === e.id && c.servicoId === servicoId && c.obraId === obraId);
        return !cell || cell.status === 'nao_avaliado';
      });
    }
    return list;
  }, [servico, hideReviewed, inspections, servicoId, obraId]);

  const visibleLocais = useMemo(() => {
    if (activeFilters.size === 0) return filteredLocais;
    return filteredLocais.filter(local => {
      return etapas.some(etapa => {
        const cell = inspections.find(c =>
          c.localId === local.id && c.etapaId === etapa.id && c.servicoId === servicoId
        );
        const status: InspectionStatus = cell?.status ?? 'nao_avaliado';
        return activeFilters.has(status);
      });
    });
  }, [filteredLocais, etapas, inspections, servicoId, activeFilters]);

  const getCell = useCallback((localId: string, etapaId: string): InspectionCell | undefined => {
    return inspections.find(c =>
      c.localId === localId && c.etapaId === etapaId &&
      c.servicoId === servicoId && c.obraId === obraId
    );
  }, [inspections, servicoId, obraId]);

  const handleCellClick = (localId: string, etapa: EtapaServico) => {
    const existing = getCell(localId, etapa.id);
    const cell: InspectionCell = existing ?? {
      id: uuid(),
      obraId,
      torreId,
      pavimentoId,
      localId,
      servicoId,
      etapaId: etapa.id,
      status: 'nao_avaliado',
      updatedAt: new Date().toISOString(),
    };
    setDrawerCell(cell);
  };

  const handleSaveCell = async (cell: InspectionCell) => {
    await saveInspection(cell);
    setDrawerCell(null);
  };

  const handleBulkApply = async (status: InspectionStatus) => {
    for (const localId of selectedLocais) {
      for (const etapa of etapas) {
        const existing = getCell(localId, etapa.id);
        const cell: InspectionCell = existing ?? {
          id: uuid(),
          obraId, torreId, pavimentoId, localId,
          servicoId, etapaId: etapa.id,
          status: 'nao_avaliado',
          updatedAt: new Date().toISOString(),
        };
        await saveInspection({ ...cell, status, inspectedBy: user?.name, inspectedAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      }
    }
    setSelectedLocais(new Set());
    setBulkModal(false);
  };

  const handleMassAdd = async () => {
    const start = parseInt(massStart);
    const end = parseInt(massEnd);
    if (isNaN(start) || isNaN(end) || start > end || !pavimentoId) return;
    await createLocaisMassa(massPrefix, start, end, pavimentoId, torreId, obraId);
    setMassModal(false);
  };

  const summary = useMemo(() => {
    const cells = inspections.filter(c => c.obraId === obraId && c.servicoId === servicoId);
    const total = cells.length;
    const counts: Record<InspectionStatus, number> = {} as any;
    STATUS_LIST.forEach(([k]) => { counts[k] = 0; });
    cells.forEach(c => { counts[c.status] = (counts[c.status] ?? 0) + 1; });
    return { total, counts };
  }, [inspections, obraId, servicoId]);

  const toggleLocalSelect = (localId: string) => {
    setSelectedLocais(prev => {
      const next = new Set(prev);
      if (next.has(localId)) next.delete(localId);
      else next.add(localId);
      return next;
    });
  };

  const toggleFilter = (status: InspectionStatus) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  };

  const { isMobile, isTablet, isDesktop } = useResponsive();
  const { width: screenWidth } = useWindowDimensions();

  return (
    <View style={styles.root}>
      {/* Top toolbar */}
      <View style={[styles.toolbar, isMobile && styles.toolbarMobile]}>
        <View style={styles.selectors}>
          {/* Obra */}
          <View style={styles.selectorGroup}>
            <Text style={styles.selectorLabel}>Obra</Text>
            <View style={styles.selectWrap}>
              <select
                style={webSelectStyle}
                value={obraId}
                onChange={e => { setObraId(e.target.value); setTorreId(''); setPavimentoId(''); setServicoId(''); }}
              >
                <option value="">Selecione...</option>
                {obras.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </View>
          </View>
          {/* Torre */}
          <View style={styles.selectorGroup}>
            <Text style={styles.selectorLabel}>Torre / Bloco</Text>
            <View style={styles.selectWrap}>
              <select
                style={webSelectStyle}
                value={torreId}
                onChange={e => { setTorreId(e.target.value); setPavimentoId(''); }}
                disabled={!obraId}
              >
                <option value="">Selecione...</option>
                {filteredTorres.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </View>
          </View>
          {/* Pavimento */}
          <View style={styles.selectorGroup}>
            <Text style={styles.selectorLabel}>Pavimento</Text>
            <View style={styles.selectWrap}>
              <select
                style={webSelectStyle}
                value={pavimentoId}
                onChange={e => setPavimentoId(e.target.value)}
                disabled={!torreId}
              >
                <option value="">Selecione...</option>
                {filteredPavimentos.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </View>
          </View>
          {/* Serviço */}
          <View style={styles.selectorGroup}>
            <Text style={styles.selectorLabel}>Serviço</Text>
            <View style={styles.selectWrap}>
              <select
                style={webSelectStyle}
                value={servicoId}
                onChange={e => setServicoId(e.target.value)}
                disabled={!obraId}
              >
                <option value="">Selecione...</option>
                {servicos.map(s => <option key={s.id} value={s.id}>[{s.code}] {s.name}</option>)}
              </select>
            </View>
          </View>
        </View>

        <View style={styles.toolbarActions}>
          <TouchableOpacity
            style={styles.toolBtn}
            onPress={() => setMassModal(true)}
            activeOpacity={0.8}
            disabled={!pavimentoId}
          >
            <MaterialIcons name="playlist-add" size={16} color={pavimentoId ? '#2E7D32' : '#BDBDBD'} />
            <Text style={[styles.toolBtnText, !pavimentoId && { color: '#BDBDBD' }]}>Locais em Massa</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toolBtn}
            onPress={() => setHideReviewed(!hideReviewed)}
            activeOpacity={0.8}
          >
            <MaterialIcons name={hideReviewed ? 'visibility' : 'visibility-off'} size={16} color="#616161" />
            <Text style={styles.toolBtnText}>{hideReviewed ? 'Mostrar Revisadas' : 'Ocultar Revisadas'}</Text>
          </TouchableOpacity>
          {selectedLocais.size > 0 && (
            <TouchableOpacity
              style={[styles.toolBtn, { backgroundColor: '#2E7D32' }]}
              onPress={() => setBulkModal(true)}
              activeOpacity={0.85}
            >
              <MaterialIcons name="edit" size={16} color="#FFFFFF" />
              <Text style={[styles.toolBtnText, { color: '#FFFFFF' }]}>Ação em Lote ({selectedLocais.size})</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Status filters */}
      <View style={styles.filters}>
        <Text style={styles.filterLabel}>Filtrar por status:</Text>
        <View style={styles.filterChips}>
          {STATUS_LIST.map(([key, cfg]) => (
            <TouchableOpacity
              key={key}
              style={[styles.filterChip, activeFilters.has(key) && { backgroundColor: cfg.color, borderColor: cfg.color }]}
              onPress={() => toggleFilter(key)}
              activeOpacity={0.8}
            >
              <View style={[styles.filterDot, { backgroundColor: activeFilters.has(key) ? '#FFFFFF' : cfg.color }]} />
              <Text style={[styles.filterChipText, activeFilters.has(key) && { color: '#FFFFFF' }]}>{cfg.shortLabel}</Text>
            </TouchableOpacity>
          ))}
          {activeFilters.size > 0 && (
            <TouchableOpacity style={styles.clearFilters} onPress={() => setActiveFilters(new Set())} activeOpacity={0.7}>
              <Text style={styles.clearFiltersText}>Limpar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Matrix */}
      {(!obraId || !servicoId) ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="fact-check" size={48} color="#E0E0E0" />
          <Text style={styles.emptyTitle}>Selecione uma obra e um serviço</Text>
          <Text style={styles.emptyText}>Use os seletores acima para começar a inspecionar</Text>
        </View>
      ) : (
        <ScrollView style={styles.matrixScroll} horizontal>
          <ScrollView>
            <View>
              {/* Header row */}
              <View style={styles.matrixHeaderRow}>
                <View style={[styles.cornerCell]}>
                  <TouchableOpacity
                    style={styles.selectAllBtn}
                    onPress={() => {
                      if (selectedLocais.size === visibleLocais.length) {
                        setSelectedLocais(new Set());
                      } else {
                        setSelectedLocais(new Set(visibleLocais.map(l => l.id)));
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons
                      name={selectedLocais.size === visibleLocais.length && visibleLocais.length > 0 ? 'check-box' : 'check-box-outline-blank'}
                      size={16}
                      color="#9E9E9E"
                    />
                  </TouchableOpacity>
                  <Text style={styles.cornerText}>Etapas / Locais</Text>
                </View>
                {visibleLocais.map(local => (
                  <TouchableOpacity
                    key={local.id}
                    style={[styles.colHeader, selectedLocais.has(local.id) && styles.colHeaderSelected]}
                    onPress={() => toggleLocalSelect(local.id)}
                    activeOpacity={0.8}
                  >
                    <MaterialIcons
                      name={selectedLocais.has(local.id) ? 'check-box' : 'check-box-outline-blank'}
                      size={12}
                      color={selectedLocais.has(local.id) ? '#2E7D32' : '#BDBDBD'}
                    />
                    <Text style={[styles.colHeaderText, selectedLocais.has(local.id) && { color: '#2E7D32' }]} numberOfLines={2}>
                      {local.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Data rows */}
              {etapas.map((etapa, rowIdx) => (
                <View key={etapa.id} style={[styles.matrixRow, rowIdx % 2 === 0 && styles.matrixRowEven]}>
                  <View style={styles.rowHeader}>
                    <Text style={styles.rowHeaderOrder}>{etapa.order}</Text>
                    <Text style={styles.rowHeaderText} numberOfLines={2}>{etapa.description}</Text>
                  </View>
                  {visibleLocais.map(local => {
                    const cell = getCell(local.id, etapa.id);
                    const status: InspectionStatus = cell?.status ?? 'nao_avaliado';
                    const cfg = STATUS_CONFIG[status];
                    return (
                      <TouchableOpacity
                        key={local.id}
                        style={[styles.cell, { backgroundColor: cfg.color + '20', borderColor: cfg.color + '40' }]}
                        onPress={() => handleCellClick(local.id, etapa)}
                        activeOpacity={0.75}
                      >
                        <Text style={[styles.cellText, { color: cfg.color }]}>{cfg.shortLabel}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
          </ScrollView>
        </ScrollView>
      )}

      {/* Summary panel */}
      {obraId && servicoId && (
        <View style={styles.summaryPanel}>
          <TouchableOpacity
            style={styles.summaryHeader}
            onPress={() => setSummaryOpen(!summaryOpen)}
            activeOpacity={0.8}
          >
            <Text style={styles.summaryTitle}>Resumo da Seleção</Text>
            <MaterialIcons name={summaryOpen ? 'expand-more' : 'expand-less'} size={20} color="#616161" />
          </TouchableOpacity>
          {summaryOpen && (
            <View style={styles.summaryContent}>
              <Text style={styles.summaryTotal}>Total: {summary.total} células</Text>
              <View style={styles.summaryChips}>
                {STATUS_LIST.filter(([k]) => summary.counts[k] > 0).map(([key, cfg]) => (
                  <View key={key} style={[styles.summaryChip, { backgroundColor: cfg.color + '15' }]}>
                    <View style={[styles.summaryDot, { backgroundColor: cfg.color }]} />
                    <Text style={[styles.summaryChipText, { color: cfg.color }]}>
                      {cfg.label}: {summary.counts[key]}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      )}

      {/* Cell Drawer */}
      {drawerCell && (
        <CellDrawer
          cell={drawerCell}
          local={locais.find(l => l.id === drawerCell.localId) ?? null}
          etapa={servico?.etapas.find(e => e.id === drawerCell.etapaId) ?? null}
          onClose={() => setDrawerCell(null)}
          onSave={handleSaveCell}
        />
      )}

      {/* Bulk action modal */}
      {bulkModal && (
        <BulkActionModal
          count={selectedLocais.size}
          onClose={() => setBulkModal(false)}
          onApply={handleBulkApply}
        />
      )}

      {/* Mass add modal */}
      <Modal visible={massModal} transparent animationType="fade" onRequestClose={() => setMassModal(false)}>
        <View style={massStyles.overlay}>
          <View style={massStyles.modal}>
            <Text style={massStyles.title}>Adicionar Locais em Massa</Text>
            <Text style={massStyles.label}>Prefixo</Text>
            <TextInput style={massStyles.input} value={massPrefix} onChangeText={setMassPrefix} placeholder="APTO" />
            <View style={massStyles.row}>
              <View style={{ flex: 1 }}>
                <Text style={massStyles.label}>Número inicial</Text>
                <TextInput style={massStyles.input} value={massStart} onChangeText={setMassStart} keyboardType="numeric" placeholder="101" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={massStyles.label}>Número final</Text>
                <TextInput style={massStyles.input} value={massEnd} onChangeText={setMassEnd} keyboardType="numeric" placeholder="110" />
              </View>
            </View>
            <View style={massStyles.preview}>
              <Text style={massStyles.previewText}>
                Prévia: {massPrefix} {massStart.padStart(2, '0')} → {massPrefix} {massEnd.padStart(2, '0')}
                {' '}({Math.max(0, parseInt(massEnd) - parseInt(massStart) + 1)} locais)
              </Text>
            </View>
            <View style={massStyles.footer}>
              <TouchableOpacity style={massStyles.cancelBtn} onPress={() => setMassModal(false)} activeOpacity={0.7}>
                <Text style={massStyles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={massStyles.addBtn} onPress={handleMassAdd} activeOpacity={0.85}>
                <Text style={massStyles.addText}>Adicionar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const webSelectStyle: any = {
  width: '100%',
  padding: '6px 10px',
  fontSize: 13,
  border: '1px solid #E0E0E0',
  borderRadius: 8,
  backgroundColor: '#FAFAFA',
  color: '#1C1C1C',
  outline: 'none',
  cursor: 'pointer',
};

const massStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  modal: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 24, width: 380, gap: 10 },
  title: { fontSize: 16, fontWeight: '700', color: '#1C1C1C', marginBottom: 4 },
  label: { fontSize: 12, fontWeight: '600', color: '#424242', marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, padding: 10, fontSize: 13, color: '#1C1C1C', backgroundColor: '#FAFAFA' },
  row: { flexDirection: 'row', gap: 10 },
  preview: { backgroundColor: '#E8F5E9', borderRadius: 8, padding: 10 },
  previewText: { fontSize: 12, color: '#2E7D32', fontWeight: '600' },
  footer: { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  cancelText: { fontSize: 14, fontWeight: '600', color: '#424242' },
  addBtn: { flex: 2, backgroundColor: '#2E7D32', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  addText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
});

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'column', backgroundColor: '#F5F5F5', position: 'relative' as any },
  toolbar: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', padding: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E0E0E0', flexWrap: 'wrap', gap: 12 },
  toolbarMobile: { flexDirection: 'column', alignItems: 'stretch' },
  selectors: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', flex: 1 },
  selectorGroup: { minWidth: 160, flex: 1 },
  selectorLabel: { fontSize: 11, fontWeight: '700', color: '#9E9E9E', textTransform: 'uppercase', marginBottom: 4 },
  selectWrap: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, overflow: 'hidden' },
  toolbarActions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', alignItems: 'center' },
  toolBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7, backgroundColor: '#FFFFFF' },
  toolBtnText: { fontSize: 12, fontWeight: '600', color: '#616161' },
  filters: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0', flexWrap: 'wrap' },
  filterLabel: { fontSize: 12, fontWeight: '600', color: '#9E9E9E' },
  filterChips: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  filterDot: { width: 6, height: 6, borderRadius: 3 },
  filterChipText: { fontSize: 11, fontWeight: '700', color: '#424242' },
  clearFilters: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  clearFiltersText: { fontSize: 11, color: '#9E9E9E' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#9E9E9E' },
  emptyText: { fontSize: 13, color: '#BDBDBD', textAlign: 'center' },
  matrixScroll: { flex: 1 },
  matrixHeaderRow: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderBottomWidth: 2, borderBottomColor: '#E0E0E0', position: 'sticky' as any, top: 0, zIndex: 10 },
  cornerCell: { width: 200, minWidth: 200, padding: 10, borderRightWidth: 1, borderRightColor: '#E0E0E0', flexDirection: 'row', alignItems: 'center', gap: 6 },
  selectAllBtn: { padding: 2 },
  cornerText: { fontSize: 11, fontWeight: '700', color: '#9E9E9E', textTransform: 'uppercase' },
  colHeader: { width: 80, minWidth: 80, padding: 8, borderRightWidth: 1, borderRightColor: '#F0F0F0', alignItems: 'center', gap: 3 },
  colHeaderSelected: { backgroundColor: '#E8F5E9' },
  colHeaderText: { fontSize: 11, fontWeight: '600', color: '#424242', textAlign: 'center' },
  matrixRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  matrixRowEven: { backgroundColor: '#FAFAFA' },
  rowHeader: { width: 200, minWidth: 200, padding: 10, borderRightWidth: 1, borderRightColor: '#E0E0E0', flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  rowHeaderOrder: { fontSize: 11, fontWeight: '800', color: '#BDBDBD', minWidth: 16 },
  rowHeaderText: { flex: 1, fontSize: 12, color: '#424242', lineHeight: 16 },
  cell: { width: 80, minWidth: 80, height: 44, borderRightWidth: 1, borderRightColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  cellText: { fontSize: 11, fontWeight: '800' },
  summaryPanel: { backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E0E0E0' },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10 },
  summaryTitle: { fontSize: 13, fontWeight: '700', color: '#424242' },
  summaryContent: { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  summaryTotal: { fontSize: 13, color: '#9E9E9E' },
  summaryChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  summaryChip: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  summaryDot: { width: 6, height: 6, borderRadius: 3 },
  summaryChipText: { fontSize: 11, fontWeight: '700' },
});
