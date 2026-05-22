import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Modal, Alert, FlatList, Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useData } from '@/lib/data-context';
import { useAuth } from '@/lib/auth-context';
import type { Edificacao, LocalEdificacao, ElementoEdificacao } from '@/lib/types';

// ─── Toast simples ────────────────────────────────────────────────────────────
function Toast({ visible, message }: { visible: boolean; message: string }) {
  if (!visible) return null;
  return (
    <View style={toastStyles.container}>
      <MaterialIcons name="check-circle" size={18} color="#fff" />
      <Text style={toastStyles.text}>{message}</Text>
    </View>
  );
}
const toastStyles = StyleSheet.create({
  container: {
    position: 'absolute', bottom: 90, left: 24, right: 24, zIndex: 999,
    backgroundColor: '#2E7D32', borderRadius: 10, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 6,
  },
  text: { color: '#fff', fontSize: 14, fontWeight: '600', flex: 1 },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
function uid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

// ─── Formulário de Edificação ─────────────────────────────────────────────────
function EdificacaoForm({
  visible,
  onClose,
  initial,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  initial?: Edificacao;
  onSave: (data: Omit<Edificacao, 'id' | 'createdAt' | 'updatedAt'>) => void;
}) {
  const [nome, setNome] = useState(initial?.name ?? '');
  const [locais, setLocais] = useState<LocalEdificacao[]>(initial?.locais ?? []);
  const [elementos, setElementos] = useState<ElementoEdificacao[]>(initial?.elementos ?? []);

  // Locais
  const [novoLocal, setNovoLocal] = useState('');

  // Modo grupo
  const [prefixo, setPrefixo] = useState('');
  const [de, setDe] = useState('');
  const [ate, setAte] = useState('');
  const [preview, setPreview] = useState<string | null>(null);

  // Modo unitário
  const [novoElemento, setNovoElemento] = useState('');

  React.useEffect(() => {
    if (visible) {
      setNome(initial?.name ?? '');
      setLocais(initial?.locais ?? []);
      setElementos(initial?.elementos ?? []);
      setNovoLocal('');
      setPrefixo(''); setDe(''); setAte(''); setPreview(null);
      setNovoElemento('');
    }
  }, [visible, initial]);

  // ── Locais ──
  const adicionarLocal = () => {
    const trimmed = novoLocal.trim();
    if (!trimmed) return;
    setLocais(prev => [...prev, { id: uid(), name: trimmed, order: prev.length + 1 }]);
    setNovoLocal('');
  };
  const removerLocal = (id: string) => setLocais(prev => prev.filter(l => l.id !== id));

  // ── Grupo ──
  const gerarPrevia = () => {
    const p = prefixo.trim();
    const d = parseInt(de, 10);
    const a = parseInt(ate, 10);
    if (!p) { Alert.alert('Atenção', 'Informe o prefixo.'); return; }
    if (isNaN(d) || isNaN(a) || d > a) { Alert.alert('Atenção', 'Intervalo inválido.'); return; }
    const count = a - d + 1;
    const first = `${p}${d}`;
    const last = `${p}${a}`;
    const mid = count > 2 ? ` ... ` : ', ';
    const preview = count === 1 ? `Será criado 1 elemento: ${first}` :
      `Serão criados ${count} elementos: ${first}${mid}${last}`;
    setPreview(preview);
  };
  const confirmarGrupo = () => {
    const p = prefixo.trim();
    const d = parseInt(de, 10);
    const a = parseInt(ate, 10);
    if (!p || isNaN(d) || isNaN(a) || d > a) return;
    const novos: ElementoEdificacao[] = [];
    for (let i = d; i <= a; i++) {
      novos.push({ id: uid(), name: `${p}${i}`, source: 'group' });
    }
    setElementos(prev => [...prev, ...novos]);
    setPrefixo(''); setDe(''); setAte(''); setPreview(null);
  };

  // ── Unitário ──
  const adicionarElemento = () => {
    const trimmed = novoElemento.trim();
    if (!trimmed) return;
    setElementos(prev => [...prev, { id: uid(), name: trimmed, source: 'unit' }]);
    setNovoElemento('');
  };
  const removerElemento = (id: string) => setElementos(prev => prev.filter(e => e.id !== id));

  const handleSave = () => {
    if (!nome.trim()) { Alert.alert('Atenção', 'Informe o nome da edificação.'); return; }
    onSave({ name: nome.trim(), locais, elementos });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={fStyles.root}>
        {/* Header */}
        <View style={fStyles.header}>
          <Text style={fStyles.title}>{initial ? 'Editar Edificação' : 'Nova Edificação'}</Text>
          <TouchableOpacity onPress={onClose} style={fStyles.closeBtn} activeOpacity={0.7}>
            <MaterialIcons name="close" size={24} color="#424242" />
          </TouchableOpacity>
        </View>

        <ScrollView style={fStyles.body} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 120 }}>

          {/* Nome */}
          <Text style={fStyles.label}>Nome da Edificação *</Text>
          <TextInput
            style={fStyles.input}
            value={nome}
            onChangeText={setNome}
            placeholder="Ex: Torre 1, Bloco A, Sede"
            placeholderTextColor="#9E9E9E"
            returnKeyType="done"
          />

          {/* ── Locais ── */}
          <View style={fStyles.sectionHeader}>
            <MaterialIcons name="place" size={18} color="#2E7D32" />
            <Text style={fStyles.sectionTitle}>Locais</Text>
          </View>
          <Text style={fStyles.hint}>Ex: Térreo, 1º Pavimento, Cobertura</Text>

          <View style={fStyles.addRow}>
            <TextInput
              style={[fStyles.input, { flex: 1, marginBottom: 0 }]}
              value={novoLocal}
              onChangeText={setNovoLocal}
              placeholder="Nome do local"
              placeholderTextColor="#9E9E9E"
              returnKeyType="done"
              onSubmitEditing={adicionarLocal}
            />
            <TouchableOpacity style={fStyles.addBtn} onPress={adicionarLocal} activeOpacity={0.8}>
              <MaterialIcons name="add" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          {locais.length > 0 && (
            <View style={fStyles.chipList}>
              {locais.map(l => (
                <View key={l.id} style={fStyles.chip}>
                  <Text style={fStyles.chipText}>{l.name}</Text>
                  <TouchableOpacity onPress={() => removerLocal(l.id)} activeOpacity={0.7}>
                    <MaterialIcons name="close" size={16} color="#E53935" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* ── Elementos ── */}
          <View style={[fStyles.sectionHeader, { marginTop: 20 }]}>
            <MaterialIcons name="view-list" size={18} color="#1565C0" />
            <Text style={fStyles.sectionTitle}>Elementos</Text>
          </View>

          {/* Modo Grupo */}
          <View style={fStyles.card}>
            <Text style={fStyles.cardTitle}>Adição em Grupo</Text>
            <Text style={fStyles.hint}>Gera automaticamente uma sequência de elementos</Text>

            <Text style={fStyles.label}>Prefixo</Text>
            <TextInput
              style={fStyles.input}
              value={prefixo}
              onChangeText={setPrefixo}
              placeholder="Ex: V, P, L, VG"
              placeholderTextColor="#9E9E9E"
              autoCapitalize="characters"
              returnKeyType="next"
            />

            <View style={fStyles.rangeRow}>
              <View style={{ flex: 1 }}>
                <Text style={fStyles.label}>De</Text>
                <TextInput
                  style={fStyles.input}
                  value={de}
                  onChangeText={setDe}
                  placeholder="1"
                  placeholderTextColor="#9E9E9E"
                  keyboardType="numeric"
                  returnKeyType="next"
                />
              </View>
              <View style={fStyles.rangeSep} />
              <View style={{ flex: 1 }}>
                <Text style={fStyles.label}>Até</Text>
                <TextInput
                  style={fStyles.input}
                  value={ate}
                  onChangeText={setAte}
                  placeholder="100"
                  placeholderTextColor="#9E9E9E"
                  keyboardType="numeric"
                  returnKeyType="done"
                />
              </View>
            </View>

            {preview && (
              <View style={fStyles.previewBox}>
                <MaterialIcons name="info-outline" size={16} color="#1565C0" />
                <Text style={fStyles.previewText}>{preview}</Text>
              </View>
            )}

            <View style={fStyles.groupBtns}>
              <TouchableOpacity style={fStyles.previewBtn} onPress={gerarPrevia} activeOpacity={0.8}>
                <Text style={fStyles.previewBtnText}>Ver prévia</Text>
              </TouchableOpacity>
              <TouchableOpacity style={fStyles.confirmBtn} onPress={confirmarGrupo} activeOpacity={0.8}>
                <MaterialIcons name="add" size={16} color="#fff" />
                <Text style={fStyles.confirmBtnText}>Adicionar grupo</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Modo Unitário */}
          <View style={[fStyles.card, { marginTop: 12 }]}>
            <Text style={fStyles.cardTitle}>Adição Unitária</Text>
            <Text style={fStyles.hint}>Adicione elementos individualmente</Text>
            <View style={fStyles.addRow}>
              <TextInput
                style={[fStyles.input, { flex: 1, marginBottom: 0 }]}
                value={novoElemento}
                onChangeText={setNovoElemento}
                placeholder="Ex: Viga Principal, Pilar Central"
                placeholderTextColor="#9E9E9E"
                returnKeyType="done"
                onSubmitEditing={adicionarElemento}
              />
              <TouchableOpacity style={fStyles.addBtn} onPress={adicionarElemento} activeOpacity={0.8}>
                <MaterialIcons name="add" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Lista unificada de elementos */}
          {elementos.length > 0 && (
            <View style={{ marginTop: 12 }}>
              <Text style={[fStyles.label, { marginBottom: 8 }]}>
                Elementos cadastrados ({elementos.length})
              </Text>
              <View style={fStyles.elementList}>
                {elementos.map(e => (
                  <View key={e.id} style={fStyles.elementItem}>
                    <View style={[fStyles.elementBadge, { backgroundColor: e.source === 'group' ? '#E3F2FD' : '#F3E5F5' }]}>
                      <Text style={[fStyles.elementBadgeText, { color: e.source === 'group' ? '#1565C0' : '#6A1B9A' }]}>
                        {e.source === 'group' ? 'G' : 'U'}
                      </Text>
                    </View>
                    <Text style={fStyles.elementName} numberOfLines={1}>{e.name}</Text>
                    <TouchableOpacity onPress={() => removerElemento(e.id)} activeOpacity={0.7} style={fStyles.removeBtn}>
                      <MaterialIcons name="close" size={16} color="#E53935" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Botão Salvar fixo */}
        <View style={fStyles.footer}>
          <TouchableOpacity style={fStyles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
            <MaterialIcons name="save" size={20} color="#fff" />
            <Text style={fStyles.saveBtnText}>Salvar Edificação</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Tela principal: lista de Edificações ─────────────────────────────────────
export function EdificacoesScreen() {
  const { edificacoes, createEdificacao, editEdificacao, removeEdificacao } = useData();
  const { user } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [editTarget, setEditTarget] = useState<Edificacao | undefined>(undefined);
  const [toastVisible, setToastVisible] = useState(false);

  const canManage = user?.role === 'owner' || user?.role === 'admin';

  const showToast = useCallback(() => {
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  }, []);

  const handleSave = async (data: Omit<Edificacao, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editTarget) {
      await editEdificacao({ ...editTarget, ...data });
    } else {
      await createEdificacao(data);
    }
    showToast();
  };

  const handleEdit = (ed: Edificacao) => {
    setEditTarget(ed);
    setModalVisible(true);
  };

  const handleDelete = (ed: Edificacao) => {
    Alert.alert(
      'Excluir Edificação',
      `Deseja excluir "${ed.name}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir', style: 'destructive',
          onPress: () => removeEdificacao(ed.id),
        },
      ]
    );
  };

  const handleNew = () => {
    setEditTarget(undefined);
    setModalVisible(true);
  };

  const renderItem = ({ item }: { item: Edificacao }) => (
    <View style={listStyles.card}>
      <View style={listStyles.cardLeft}>
        <View style={listStyles.iconWrap}>
          <MaterialIcons name="apartment" size={22} color="#2E7D32" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={listStyles.cardName} numberOfLines={1}>{item.name}</Text>
          <Text style={listStyles.cardSub}>
            {item.locais.length} {item.locais.length === 1 ? 'local' : 'locais'} · {item.elementos.length} {item.elementos.length === 1 ? 'elemento' : 'elementos'}
          </Text>
        </View>
      </View>
      {canManage && (
        <View style={listStyles.actions}>
          <TouchableOpacity onPress={() => handleEdit(item)} style={listStyles.actionBtn} activeOpacity={0.7}>
            <MaterialIcons name="edit" size={20} color="#1565C0" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item)} style={listStyles.actionBtn} activeOpacity={0.7}>
            <MaterialIcons name="delete" size={20} color="#E53935" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      {/* Header da seção */}
      <View style={listStyles.sectionHeader}>
        <Text style={listStyles.sectionTitle}>Edificações</Text>
        {canManage && (
          <TouchableOpacity style={listStyles.addBtn} onPress={handleNew} activeOpacity={0.85}>
            <MaterialIcons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {edificacoes.length === 0 ? (
        <View style={listStyles.empty}>
          <MaterialIcons name="apartment" size={48} color="#E0E0E0" />
          <Text style={listStyles.emptyTitle}>Nenhuma edificação cadastrada</Text>
          {canManage && (
            <Text style={listStyles.emptyHint}>Toque no + para adicionar a primeira edificação</Text>
          )}
        </View>
      ) : (
        <FlatList
          data={edificacoes}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {canManage && (
        <EdificacaoForm
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          initial={editTarget}
          onSave={handleSave}
        />
      )}

      <Toast visible={toastVisible} message="Edificação salva com sucesso" />
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const listStyles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1C1C1C' },
  addBtn: {
    backgroundColor: '#2E7D32', width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#2E7D32', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3,
  },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2,
    borderWidth: 1, borderColor: '#F0F0F0',
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  iconWrap: {
    width: 40, height: 40, borderRadius: 10, backgroundColor: '#E8F5E9',
    alignItems: 'center', justifyContent: 'center',
  },
  cardName: { fontSize: 15, fontWeight: '600', color: '#1C1C1C' },
  cardSub: { fontSize: 12, color: '#757575', marginTop: 2 },
  actions: { flexDirection: 'row', gap: 4 },
  actionBtn: { padding: 6 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 40 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#9E9E9E' },
  emptyHint: { fontSize: 13, color: '#BDBDBD', textAlign: 'center' },
});

const fStyles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
    paddingTop: Platform.OS === 'ios' ? 20 : 16,
  },
  title: { fontSize: 18, fontWeight: '700', color: '#1C1C1C' },
  closeBtn: { padding: 4 },
  body: { flex: 1, padding: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#424242', marginBottom: 6, marginTop: 12 },
  hint: { fontSize: 12, color: '#9E9E9E', marginBottom: 8 },
  input: {
    borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10,
    padding: 12, fontSize: 14, color: '#1C1C1C', backgroundColor: '#FAFAFA',
    marginBottom: 4,
  },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 20, marginBottom: 4,
    borderTopWidth: 1, borderTopColor: '#F5F5F5', paddingTop: 16,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1C1C1C' },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  addBtn: {
    backgroundColor: '#2E7D32', width: 44, height: 44, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  chipList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#E8F5E9', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
  },
  chipText: { fontSize: 13, color: '#2E7D32', fontWeight: '500' },
  card: {
    backgroundColor: '#F8F9FA', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#E8E8E8', marginTop: 8,
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#1C1C1C', marginBottom: 2 },
  rangeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  rangeSep: { width: 1, backgroundColor: '#E0E0E0', marginTop: 32, height: 20 },
  previewBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: '#E3F2FD', borderRadius: 8, padding: 10, marginTop: 8,
  },
  previewText: { fontSize: 13, color: '#1565C0', flex: 1, lineHeight: 18 },
  groupBtns: { flexDirection: 'row', gap: 8, marginTop: 12 },
  previewBtn: {
    flex: 1, borderWidth: 1.5, borderColor: '#1565C0', borderRadius: 8,
    paddingVertical: 10, alignItems: 'center',
  },
  previewBtnText: { color: '#1565C0', fontWeight: '600', fontSize: 13 },
  confirmBtn: {
    flex: 1, backgroundColor: '#1565C0', borderRadius: 8,
    paddingVertical: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 4,
  },
  confirmBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  elementList: {
    borderWidth: 1, borderColor: '#E8E8E8', borderRadius: 10, overflow: 'hidden',
  },
  elementItem: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0', gap: 10, backgroundColor: '#fff',
  },
  elementBadge: {
    width: 22, height: 22, borderRadius: 6, alignItems: 'center', justifyContent: 'center',
  },
  elementBadgeText: { fontSize: 10, fontWeight: '700' },
  elementName: { flex: 1, fontSize: 13, color: '#1C1C1C' },
  removeBtn: { padding: 4 },
  footer: {
    padding: 16, borderTopWidth: 1, borderTopColor: '#F0F0F0',
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  saveBtn: {
    backgroundColor: '#2E7D32', borderRadius: 12, paddingVertical: 15,
    alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8,
    shadowColor: '#2E7D32', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
