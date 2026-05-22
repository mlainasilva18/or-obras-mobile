import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  TextInput, Modal, Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useData } from '@/lib/data-context';
import type { Obra, Torre, Pavimento, Local, Servico, EtapaServico, Responsavel } from '@/lib/types';

type Tab = 'obras' | 'servicos' | 'responsaveis';

function uuid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ---- Obra Form Modal ----
function ObraModal({ obra, onClose, onSave }: {
  obra?: Obra; onClose: () => void; onSave: (data: Omit<Obra, 'id' | 'createdAt'>) => void;
}) {
  const [name, setName] = useState(obra?.name ?? '');
  const [address, setAddress] = useState(obra?.address ?? '');
  const [startDate, setStartDate] = useState(obra?.startDate ?? '');
  const [endDate, setEndDate] = useState(obra?.expectedEndDate ?? '');
  const [status, setStatus] = useState<Obra['status']>(obra?.status ?? 'active');

  const handleSave = () => {
    if (!name.trim() || !address.trim() || !startDate.trim()) {
      Alert.alert('Campos obrigatórios', 'Preencha nome, endereço e data de início.');
      return;
    }
    onSave({ name: name.trim(), address: address.trim(), startDate, expectedEndDate: endDate || undefined, status });
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.modal}>
          <View style={modalStyles.header}>
            <Text style={modalStyles.title}>{obra ? 'Editar Obra' : 'Nova Obra'}</Text>
            <TouchableOpacity onPress={onClose}><MaterialIcons name="close" size={22} color="#424242" /></TouchableOpacity>
          </View>
          <ScrollView style={modalStyles.body}>
            <Text style={modalStyles.label}>Nome da Obra *</Text>
            <TextInput style={modalStyles.input} value={name} onChangeText={setName} placeholder="Ex: Residencial Parque Verde" placeholderTextColor="#BDBDBD" />
            <Text style={modalStyles.label}>Endereço *</Text>
            <TextInput style={modalStyles.input} value={address} onChangeText={setAddress} placeholder="Rua, número, cidade" placeholderTextColor="#BDBDBD" />
            <View style={modalStyles.row}>
              <View style={{ flex: 1 }}>
                <Text style={modalStyles.label}>Data de Início *</Text>
                <TextInput style={modalStyles.input} value={startDate} onChangeText={setStartDate} placeholder="AAAA-MM-DD" placeholderTextColor="#BDBDBD" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={modalStyles.label}>Previsão de Término</Text>
                <TextInput style={modalStyles.input} value={endDate} onChangeText={setEndDate} placeholder="AAAA-MM-DD" placeholderTextColor="#BDBDBD" />
              </View>
            </View>
            <Text style={modalStyles.label}>Status</Text>
            <View style={modalStyles.statusRow}>
              {(['active', 'paused', 'completed'] as Obra['status'][]).map(s => (
                <TouchableOpacity
                  key={s}
                  style={[modalStyles.statusOpt, status === s && modalStyles.statusOptActive]}
                  onPress={() => setStatus(s)}
                  activeOpacity={0.8}
                >
                  <Text style={[modalStyles.statusOptText, status === s && modalStyles.statusOptTextActive]}>
                    {s === 'active' ? 'Em andamento' : s === 'paused' ? 'Pausada' : 'Concluída'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <View style={modalStyles.footer}>
            <TouchableOpacity style={modalStyles.cancelBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={modalStyles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={modalStyles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
              <Text style={modalStyles.saveText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ---- Torre/Pavimento/Local inline forms ----
function InlineAddForm({ placeholder, onAdd, onCancel }: {
  placeholder: string; onAdd: (name: string) => void; onCancel: () => void;
}) {
  const [val, setVal] = useState('');
  return (
    <View style={inlineStyles.row}>
      <TextInput
        style={inlineStyles.input}
        value={val}
        onChangeText={setVal}
        placeholder={placeholder}
        placeholderTextColor="#BDBDBD"
        autoFocus
        returnKeyType="done"
        onSubmitEditing={() => { if (val.trim()) { onAdd(val.trim()); } }}
      />
      <TouchableOpacity style={inlineStyles.addBtn} onPress={() => { if (val.trim()) onAdd(val.trim()); }} activeOpacity={0.85}>
        <MaterialIcons name="check" size={16} color="#FFFFFF" />
      </TouchableOpacity>
      <TouchableOpacity style={inlineStyles.cancelBtn} onPress={onCancel} activeOpacity={0.7}>
        <MaterialIcons name="close" size={16} color="#9E9E9E" />
      </TouchableOpacity>
    </View>
  );
}

const inlineStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4 },
  input: { flex: 1, borderWidth: 1, borderColor: '#2E7D32', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 6, fontSize: 13, color: '#1C1C1C', backgroundColor: '#FAFAFA' },
  addBtn: { backgroundColor: '#2E7D32', borderRadius: 6, padding: 7 },
  cancelBtn: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 6, padding: 7 },
});

// ---- Serviço Form Modal ----
function ServicoModal({ servico, onClose, onSave }: {
  servico?: Servico; onClose: () => void; onSave: (data: Omit<Servico, 'id' | 'createdAt'>) => void;
}) {
  const [code, setCode] = useState(servico?.code ?? '');
  const [name, setName] = useState(servico?.name ?? '');
  const [etapas, setEtapas] = useState<EtapaServico[]>(servico?.etapas ?? []);

  const addEtapa = () => {
    setEtapas(prev => [...prev, {
      id: uuid(), servicoId: servico?.id ?? '',
      description: '', verificationMethod: '', tolerance: '', order: prev.length + 1,
    }]);
  };

  const updateEtapa = (idx: number, field: keyof EtapaServico, value: string) => {
    setEtapas(prev => prev.map((e, i) => i === idx ? { ...e, [field]: value } : e));
  };

  const removeEtapa = (idx: number) => {
    setEtapas(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    if (!code.trim() || !name.trim()) {
      Alert.alert('Campos obrigatórios', 'Preencha código e nome do serviço.');
      return;
    }
    onSave({ code: code.trim(), name: name.trim(), etapas });
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <View style={[modalStyles.modal, { width: 600, maxWidth: '90%' as any }]}>
          <View style={modalStyles.header}>
            <Text style={modalStyles.title}>{servico ? 'Editar Serviço' : 'Novo Serviço'}</Text>
            <TouchableOpacity onPress={onClose}><MaterialIcons name="close" size={22} color="#424242" /></TouchableOpacity>
          </View>
          <ScrollView style={modalStyles.body}>
            <View style={modalStyles.row}>
              <View style={{ width: 120 }}>
                <Text style={modalStyles.label}>Código *</Text>
                <TextInput style={modalStyles.input} value={code} onChangeText={setCode} placeholder="CS 01.01" placeholderTextColor="#BDBDBD" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={modalStyles.label}>Nome do Serviço *</Text>
                <TextInput style={modalStyles.input} value={name} onChangeText={setName} placeholder="Ex: Alvenaria de Vedação" placeholderTextColor="#BDBDBD" />
              </View>
            </View>

            <View style={modalStyles.etapasHeader}>
              <Text style={modalStyles.label}>Etapas de Verificação</Text>
              <TouchableOpacity style={modalStyles.addEtapaBtn} onPress={addEtapa} activeOpacity={0.85}>
                <MaterialIcons name="add" size={14} color="#2E7D32" />
                <Text style={modalStyles.addEtapaBtnText}>Adicionar Etapa</Text>
              </TouchableOpacity>
            </View>

            {etapas.map((etapa, idx) => (
              <View key={etapa.id} style={modalStyles.etapaCard}>
                <View style={modalStyles.etapaHeader}>
                  <View style={modalStyles.etapaNum}>
                    <Text style={modalStyles.etapaNumText}>{idx + 1}</Text>
                  </View>
                  <Text style={modalStyles.etapaTitle}>Etapa {idx + 1}</Text>
                  <TouchableOpacity onPress={() => removeEtapa(idx)} activeOpacity={0.7}>
                    <MaterialIcons name="delete-outline" size={18} color="#E53935" />
                  </TouchableOpacity>
                </View>
                <Text style={modalStyles.label}>Descrição</Text>
                <TextInput style={modalStyles.input} value={etapa.description} onChangeText={v => updateEtapa(idx, 'description', v)} placeholder="O que verificar..." placeholderTextColor="#BDBDBD" />
                <View style={modalStyles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={modalStyles.label}>Método de Verificação</Text>
                    <TextInput style={modalStyles.input} value={etapa.verificationMethod} onChangeText={v => updateEtapa(idx, 'verificationMethod', v)} placeholder="Ex: Régua de 2m" placeholderTextColor="#BDBDBD" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={modalStyles.label}>Tolerância</Text>
                    <TextInput style={modalStyles.input} value={etapa.tolerance} onChangeText={v => updateEtapa(idx, 'tolerance', v)} placeholder="Ex: ±3 mm" placeholderTextColor="#BDBDBD" />
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
          <View style={modalStyles.footer}>
            <TouchableOpacity style={modalStyles.cancelBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={modalStyles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={modalStyles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
              <Text style={modalStyles.saveText}>Salvar Serviço</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ---- Responsável Form Modal ----
function ResponsavelModal({ resp, obras, onClose, onSave }: {
  resp?: Responsavel; obras: Obra[]; onClose: () => void;
  onSave: (data: Omit<Responsavel, 'id' | 'createdAt'>) => void;
}) {
  const [name, setName] = useState(resp?.name ?? '');
  const [position, setPosition] = useState(resp?.position ?? '');
  const [email, setEmail] = useState(resp?.email ?? '');
  const [phone, setPhone] = useState(resp?.phone ?? '');
  const [obraIds, setObraIds] = useState<string[]>(resp?.obraIds ?? []);

  const toggleObra = (id: string) => {
    setObraIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSave = () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Campos obrigatórios', 'Preencha nome e e-mail.');
      return;
    }
    onSave({ name: name.trim(), position: position.trim(), email: email.trim(), phone: phone.trim(), obraIds });
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.modal}>
          <View style={modalStyles.header}>
            <Text style={modalStyles.title}>{resp ? 'Editar Responsável' : 'Novo Responsável'}</Text>
            <TouchableOpacity onPress={onClose}><MaterialIcons name="close" size={22} color="#424242" /></TouchableOpacity>
          </View>
          <ScrollView style={modalStyles.body}>
            <Text style={modalStyles.label}>Nome *</Text>
            <TextInput style={modalStyles.input} value={name} onChangeText={setName} placeholder="Nome completo" placeholderTextColor="#BDBDBD" />
            <Text style={modalStyles.label}>Cargo/Função</Text>
            <TextInput style={modalStyles.input} value={position} onChangeText={setPosition} placeholder="Ex: Engenheiro de Qualidade" placeholderTextColor="#BDBDBD" />
            <View style={modalStyles.row}>
              <View style={{ flex: 1 }}>
                <Text style={modalStyles.label}>E-mail *</Text>
                <TextInput style={modalStyles.input} value={email} onChangeText={setEmail} placeholder="email@empresa.com" placeholderTextColor="#BDBDBD" keyboardType="email-address" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={modalStyles.label}>Telefone</Text>
                <TextInput style={modalStyles.input} value={phone} onChangeText={setPhone} placeholder="(11) 99999-0000" placeholderTextColor="#BDBDBD" keyboardType="phone-pad" />
              </View>
            </View>
            <Text style={modalStyles.label}>Obras vinculadas</Text>
            {obras.map(o => (
              <TouchableOpacity key={o.id} style={modalStyles.checkRow} onPress={() => toggleObra(o.id)} activeOpacity={0.8}>
                <MaterialIcons
                  name={obraIds.includes(o.id) ? 'check-box' : 'check-box-outline-blank'}
                  size={20}
                  color={obraIds.includes(o.id) ? '#2E7D32' : '#9E9E9E'}
                />
                <Text style={modalStyles.checkLabel}>{o.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={modalStyles.footer}>
            <TouchableOpacity style={modalStyles.cancelBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={modalStyles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={modalStyles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
              <Text style={modalStyles.saveText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ---- Hierarchy Tree ----
function ObraTree({ obra }: { obra: Obra }) {
  const { torres, pavimentos, locais, createTorre, editTorre, removeTorre,
    createPavimento, removePavimento, createLocal, removeLocal, createLocaisMassa } = useData();
  const [expandedTorres, setExpandedTorres] = useState<Set<string>>(new Set());
  const [expandedPavs, setExpandedPavs] = useState<Set<string>>(new Set());
  const [addingTorre, setAddingTorre] = useState(false);
  const [addingPavId, setAddingPavId] = useState<string | null>(null);
  const [addingLocalId, setAddingLocalId] = useState<string | null>(null);

  const obraTorres = torres.filter(t => t.obraId === obra.id);

  const toggleTorre = (id: string) => {
    setExpandedTorres(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const togglePav = (id: string) => {
    setExpandedPavs(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  return (
    <View style={treeStyles.container}>
      {obraTorres.map(torre => {
        const tPavs = pavimentos.filter(p => p.torreId === torre.id);
        const expanded = expandedTorres.has(torre.id);
        return (
          <View key={torre.id} style={treeStyles.torreBlock}>
            <View style={treeStyles.torreRow}>
              <TouchableOpacity onPress={() => toggleTorre(torre.id)} style={treeStyles.expandBtn} activeOpacity={0.7}>
                <MaterialIcons name={expanded ? 'expand-more' : 'chevron-right'} size={18} color="#616161" />
              </TouchableOpacity>
              <MaterialIcons name="apartment" size={16} color="#2E7D32" />
              <Text style={treeStyles.torreName}>{torre.name}</Text>
              <Text style={treeStyles.treeCount}>{tPavs.length} pavimentos</Text>
              <TouchableOpacity onPress={() => { Alert.alert('Remover Torre', `Remover "${torre.name}"?`, [{ text: 'Cancelar', style: 'cancel' }, { text: 'Remover', style: 'destructive', onPress: () => removeTorre(torre.id) }]); }} activeOpacity={0.7}>
                <MaterialIcons name="delete-outline" size={16} color="#E53935" />
              </TouchableOpacity>
            </View>

            {expanded && (
              <View style={treeStyles.pavBlock}>
                {tPavs.map(pav => {
                  const pLocais = locais.filter(l => l.pavimentoId === pav.id);
                  const pavExpanded = expandedPavs.has(pav.id);
                  return (
                    <View key={pav.id} style={treeStyles.pavRow}>
                      <TouchableOpacity onPress={() => togglePav(pav.id)} style={treeStyles.expandBtn} activeOpacity={0.7}>
                        <MaterialIcons name={pavExpanded ? 'expand-more' : 'chevron-right'} size={16} color="#9E9E9E" />
                      </TouchableOpacity>
                      <MaterialIcons name="layers" size={14} color="#1565C0" />
                      <Text style={treeStyles.pavName}>{pav.name}</Text>
                      <Text style={treeStyles.treeCount}>{pLocais.length} locais</Text>
                      <TouchableOpacity onPress={() => setAddingLocalId(pav.id)} activeOpacity={0.7}>
                        <MaterialIcons name="add" size={14} color="#2E7D32" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => removePavimento(pav.id)} activeOpacity={0.7}>
                        <MaterialIcons name="delete-outline" size={14} color="#E53935" />
                      </TouchableOpacity>

                      {pavExpanded && (
                        <View style={treeStyles.locaisBlock}>
                          {pLocais.map(local => (
                            <View key={local.id} style={treeStyles.localRow}>
                              <MaterialIcons name="meeting-room" size={12} color="#9E9E9E" />
                              <Text style={treeStyles.localName}>{local.name}</Text>
                              <TouchableOpacity onPress={() => removeLocal(local.id)} activeOpacity={0.7}>
                                <MaterialIcons name="close" size={12} color="#BDBDBD" />
                              </TouchableOpacity>
                            </View>
                          ))}
                          {addingLocalId === pav.id && (
                            <InlineAddForm
                              placeholder="Nome do local (ex: APTO 101)"
                              onAdd={async (name) => {
                                await createLocal({ name, pavimentoId: pav.id, torreId: torre.id, obraId: obra.id, order: pLocais.length + 1 });
                                setAddingLocalId(null);
                              }}
                              onCancel={() => setAddingLocalId(null)}
                            />
                          )}
                        </View>
                      )}
                    </View>
                  );
                })}

                {addingPavId === torre.id ? (
                  <InlineAddForm
                    placeholder="Nome do pavimento (ex: 2º Pavimento)"
                    onAdd={async (name) => {
                      await createPavimento({ name, torreId: torre.id, obraId: obra.id, order: tPavs.length + 1 });
                      setAddingPavId(null);
                    }}
                    onCancel={() => setAddingPavId(null)}
                  />
                ) : (
                  <TouchableOpacity style={treeStyles.addBtn} onPress={() => setAddingPavId(torre.id)} activeOpacity={0.7}>
                    <MaterialIcons name="add" size={14} color="#2E7D32" />
                    <Text style={treeStyles.addBtnText}>Adicionar Pavimento</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        );
      })}

      {addingTorre ? (
        <InlineAddForm
          placeholder="Nome da torre (ex: Torre A)"
          onAdd={async (name) => {
            await createTorre({ name, obraId: obra.id });
            setAddingTorre(false);
          }}
          onCancel={() => setAddingTorre(false)}
        />
      ) : (
        <TouchableOpacity style={treeStyles.addTorreBtn} onPress={() => setAddingTorre(true)} activeOpacity={0.8}>
          <MaterialIcons name="add" size={16} color="#2E7D32" />
          <Text style={treeStyles.addTorreBtnText}>Adicionar Torre / Bloco</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const treeStyles = StyleSheet.create({
  container: { gap: 4 },
  torreBlock: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, overflow: 'hidden' },
  torreRow: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, backgroundColor: '#F9F9F9' },
  expandBtn: { padding: 2 },
  torreName: { flex: 1, fontSize: 14, fontWeight: '700', color: '#1C1C1C' },
  treeCount: { fontSize: 11, color: '#9E9E9E' },
  pavBlock: { paddingLeft: 24, paddingRight: 8, paddingBottom: 8, gap: 2 },
  pavRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, flexWrap: 'wrap' },
  pavName: { flex: 1, fontSize: 13, color: '#424242', fontWeight: '600' },
  locaisBlock: { width: '100%' as any, paddingLeft: 24, paddingTop: 4, gap: 2 },
  localRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 3 },
  localName: { flex: 1, fontSize: 12, color: '#616161' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6, paddingLeft: 4 },
  addBtnText: { fontSize: 12, color: '#2E7D32', fontWeight: '600' },
  addTorreBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1.5, borderColor: '#2E7D32', borderStyle: 'dashed', borderRadius: 8, padding: 10, marginTop: 4 },
  addTorreBtnText: { fontSize: 13, color: '#2E7D32', fontWeight: '600' },
});

// ---- Main WebCadastros ----
export function WebCadastros() {
  const { obras, servicos, responsaveis, createObra, editObra, removeObra,
    createServico, editServico, removeServico, createResponsavel, editResponsavel, removeResponsavel } = useData();
  const [tab, setTab] = useState<Tab>('obras');
  const [obraModal, setObraModal] = useState<{ open: boolean; obra?: Obra }>({ open: false });
  const [servicoModal, setServicoModal] = useState<{ open: boolean; servico?: Servico }>({ open: false });
  const [respModal, setRespModal] = useState<{ open: boolean; resp?: Responsavel }>({ open: false });
  const [expandedObra, setExpandedObra] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const STATUS_LABELS: Record<string, string> = { active: 'Em andamento', completed: 'Concluída', paused: 'Pausada' };
  const STATUS_COLORS: Record<string, string> = { active: '#2E7D32', completed: '#1565C0', paused: '#F9A825' };

  const filteredObras = obras.filter(o => o.name.toLowerCase().includes(search.toLowerCase()));
  const filteredServicos = servicos.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.code.toLowerCase().includes(search.toLowerCase()));
  const filteredResps = responsaveis.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <View style={styles.root}>
      {/* Tabs */}
      <View style={styles.tabBar}>
        {(['obras', 'servicos', 'responsaveis'] as Tab[]).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => { setTab(t); setSearch(''); }}
            activeOpacity={0.8}
          >
            <MaterialIcons
              name={t === 'obras' ? 'business' : t === 'servicos' ? 'build' : 'people'}
              size={16}
              color={tab === t ? '#2E7D32' : '#9E9E9E'}
            />
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'obras' ? 'Obras' : t === 'servicos' ? 'Serviços' : 'Responsáveis'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Toolbar */}
      <View style={styles.toolbar}>
        <View style={styles.searchWrap}>
          <MaterialIcons name="search" size={18} color="#9E9E9E" />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar..."
            placeholderTextColor="#BDBDBD"
          />
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => {
            if (tab === 'obras') setObraModal({ open: true });
            else if (tab === 'servicos') setServicoModal({ open: true });
            else setRespModal({ open: true });
          }}
          activeOpacity={0.85}
        >
          <MaterialIcons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.addBtnText}>
            {tab === 'obras' ? 'Nova Obra' : tab === 'servicos' ? 'Novo Serviço' : 'Novo Responsável'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* OBRAS */}
        {tab === 'obras' && (
          <View style={styles.list}>
            {filteredObras.length === 0 && (
              <View style={styles.empty}>
                <MaterialIcons name="business" size={40} color="#E0E0E0" />
                <Text style={styles.emptyText}>Nenhuma obra cadastrada</Text>
              </View>
            )}
            {filteredObras.map(obra => (
              <View key={obra.id} style={styles.obraCard}>
                <TouchableOpacity
                  style={styles.obraCardHeader}
                  onPress={() => setExpandedObra(expandedObra === obra.id ? null : obra.id)}
                  activeOpacity={0.85}
                >
                  <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[obra.status] }]} />
                  <View style={styles.obraInfo}>
                    <Text style={styles.obraName}>{obra.name}</Text>
                    <Text style={styles.obraAddress}>{obra.address}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: STATUS_COLORS[obra.status] + '15' }]}>
                    <Text style={[styles.badgeText, { color: STATUS_COLORS[obra.status] }]}>{STATUS_LABELS[obra.status]}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setObraModal({ open: true, obra })} activeOpacity={0.7} style={styles.iconBtn}>
                    <MaterialIcons name="edit" size={16} color="#616161" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => Alert.alert('Remover Obra', `Remover "${obra.name}"?`, [{ text: 'Cancelar', style: 'cancel' }, { text: 'Remover', style: 'destructive', onPress: () => removeObra(obra.id) }])}
                    activeOpacity={0.7}
                    style={styles.iconBtn}
                  >
                    <MaterialIcons name="delete-outline" size={16} color="#E53935" />
                  </TouchableOpacity>
                  <MaterialIcons name={expandedObra === obra.id ? 'expand-less' : 'expand-more'} size={20} color="#9E9E9E" />
                </TouchableOpacity>

                {expandedObra === obra.id && (
                  <View style={styles.obraTree}>
                    <Text style={styles.treeTitle}>Estrutura Hierárquica</Text>
                    <ObraTree obra={obra} />
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* SERVIÇOS */}
        {tab === 'servicos' && (
          <View style={styles.list}>
            {filteredServicos.length === 0 && (
              <View style={styles.empty}>
                <MaterialIcons name="build" size={40} color="#E0E0E0" />
                <Text style={styles.emptyText}>Nenhum serviço cadastrado</Text>
              </View>
            )}
            {filteredServicos.map(s => (
              <View key={s.id} style={styles.servicoCard}>
                <View style={styles.servicoHeader}>
                  <View style={styles.codeTag}>
                    <Text style={styles.codeText}>{s.code}</Text>
                  </View>
                  <Text style={styles.servicoName}>{s.name}</Text>
                  <Text style={styles.etapaCount}>{s.etapas.length} etapas</Text>
                  <TouchableOpacity onPress={() => setServicoModal({ open: true, servico: s })} activeOpacity={0.7} style={styles.iconBtn}>
                    <MaterialIcons name="edit" size={16} color="#616161" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => Alert.alert('Remover Serviço', `Remover "${s.name}"?`, [{ text: 'Cancelar', style: 'cancel' }, { text: 'Remover', style: 'destructive', onPress: () => removeServico(s.id) }])}
                    activeOpacity={0.7}
                    style={styles.iconBtn}
                  >
                    <MaterialIcons name="delete-outline" size={16} color="#E53935" />
                  </TouchableOpacity>
                </View>
                <View style={styles.etapasList}>
                  {s.etapas.map((e, i) => (
                    <View key={e.id} style={styles.etapaRow}>
                      <Text style={styles.etapaNum}>{i + 1}</Text>
                      <Text style={styles.etapaDesc}>{e.description}</Text>
                      <Text style={styles.etapaTol}>{e.tolerance}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* RESPONSÁVEIS */}
        {tab === 'responsaveis' && (
          <View style={styles.list}>
            {filteredResps.length === 0 && (
              <View style={styles.empty}>
                <MaterialIcons name="people" size={40} color="#E0E0E0" />
                <Text style={styles.emptyText}>Nenhum responsável cadastrado</Text>
              </View>
            )}
            {filteredResps.map(r => (
              <View key={r.id} style={styles.respCard}>
                <View style={styles.respAvatar}>
                  <Text style={styles.respAvatarText}>{r.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.respInfo}>
                  <Text style={styles.respName}>{r.name}</Text>
                  <Text style={styles.respPosition}>{r.position}</Text>
                  <Text style={styles.respContact}>{r.email} · {r.phone}</Text>
                  <View style={styles.respObras}>
                    {r.obraIds.map(id => {
                      const o = obras.find(x => x.id === id);
                      return o ? (
                        <View key={id} style={styles.respObraBadge}>
                          <Text style={styles.respObraBadgeText}>{o.name}</Text>
                        </View>
                      ) : null;
                    })}
                  </View>
                </View>
                <TouchableOpacity onPress={() => setRespModal({ open: true, resp: r })} activeOpacity={0.7} style={styles.iconBtn}>
                  <MaterialIcons name="edit" size={16} color="#616161" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => Alert.alert('Remover Responsável', `Remover "${r.name}"?`, [{ text: 'Cancelar', style: 'cancel' }, { text: 'Remover', style: 'destructive', onPress: () => removeResponsavel(r.id) }])}
                  activeOpacity={0.7}
                  style={styles.iconBtn}
                >
                  <MaterialIcons name="delete-outline" size={16} color="#E53935" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Modals */}
      {obraModal.open && (
        <ObraModal
          obra={obraModal.obra}
          onClose={() => setObraModal({ open: false })}
          onSave={async (data) => {
            if (obraModal.obra) await editObra({ ...obraModal.obra, ...data });
            else await createObra(data);
            setObraModal({ open: false });
          }}
        />
      )}
      {servicoModal.open && (
        <ServicoModal
          servico={servicoModal.servico}
          onClose={() => setServicoModal({ open: false })}
          onSave={async (data) => {
            if (servicoModal.servico) await editServico({ ...servicoModal.servico, ...data });
            else await createServico(data);
            setServicoModal({ open: false });
          }}
        />
      )}
      {respModal.open && (
        <ResponsavelModal
          resp={respModal.resp}
          obras={obras}
          onClose={() => setRespModal({ open: false })}
          onSave={async (data) => {
            if (respModal.resp) await editResponsavel({ ...respModal.resp, ...data });
            else await createResponsavel(data);
            setRespModal({ open: false });
          }}
        />
      )}
    </View>
  );
}

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  modal: { backgroundColor: '#FFFFFF', borderRadius: 14, width: 480, maxWidth: '90%' as any, maxHeight: '85vh' as any, flexDirection: 'column' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  title: { fontSize: 17, fontWeight: '700', color: '#1C1C1C' },
  body: { flex: 1, padding: 20 },
  label: { fontSize: 12, fontWeight: '600', color: '#424242', marginBottom: 4, marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 13, color: '#1C1C1C', backgroundColor: '#FAFAFA' },
  row: { flexDirection: 'row', gap: 12 },
  statusRow: { flexDirection: 'row', gap: 8 },
  statusOpt: { flex: 1, borderWidth: 1.5, borderColor: '#E0E0E0', borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  statusOptActive: { borderColor: '#2E7D32', backgroundColor: '#E8F5E9' },
  statusOptText: { fontSize: 12, fontWeight: '600', color: '#9E9E9E' },
  statusOptTextActive: { color: '#2E7D32' },
  etapasHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 },
  addEtapaBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: '#2E7D32', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  addEtapaBtnText: { fontSize: 12, fontWeight: '700', color: '#2E7D32' },
  etapaCard: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, padding: 12, marginTop: 8, backgroundColor: '#FAFAFA' },
  etapaHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  etapaNum: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#2E7D32', alignItems: 'center', justifyContent: 'center' },
  etapaNumText: { fontSize: 11, fontWeight: '800', color: '#FFFFFF' },
  etapaTitle: { flex: 1, fontSize: 13, fontWeight: '700', color: '#424242' },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  checkLabel: { fontSize: 13, color: '#424242' },
  footer: { flexDirection: 'row', gap: 10, padding: 16, borderTopWidth: 1, borderTopColor: '#E0E0E0' },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  cancelText: { fontSize: 14, fontWeight: '600', color: '#424242' },
  saveBtn: { flex: 2, backgroundColor: '#2E7D32', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  saveText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F5F5' },
  tabBar: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E0E0E0', paddingHorizontal: 16 },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#2E7D32' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#9E9E9E' },
  tabTextActive: { color: '#2E7D32' },
  toolbar: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  searchWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7, backgroundColor: '#FAFAFA' },
  searchInput: { flex: 1, fontSize: 13, color: '#1C1C1C' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#2E7D32', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 9 },
  addBtnText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  content: { flex: 1, padding: 16 },
  list: { gap: 10 },
  empty: { alignItems: 'center', padding: 48, gap: 12 },
  emptyText: { fontSize: 14, color: '#BDBDBD' },
  obraCard: { backgroundColor: '#FFFFFF', borderRadius: 10, borderWidth: 1, borderColor: '#E0E0E0', overflow: 'hidden' },
  obraCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
  statusDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  obraInfo: { flex: 1 },
  obraName: { fontSize: 14, fontWeight: '700', color: '#1C1C1C' },
  obraAddress: { fontSize: 12, color: '#9E9E9E', marginTop: 1 },
  badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  iconBtn: { padding: 4 },
  obraTree: { padding: 14, borderTopWidth: 1, borderTopColor: '#F0F0F0', backgroundColor: '#FAFAFA' },
  treeTitle: { fontSize: 12, fontWeight: '700', color: '#9E9E9E', textTransform: 'uppercase', marginBottom: 10 },
  servicoCard: { backgroundColor: '#FFFFFF', borderRadius: 10, borderWidth: 1, borderColor: '#E0E0E0', overflow: 'hidden' },
  servicoHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
  codeTag: { backgroundColor: '#E8F5E9', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  codeText: { fontSize: 11, fontWeight: '800', color: '#2E7D32' },
  servicoName: { flex: 1, fontSize: 14, fontWeight: '700', color: '#1C1C1C' },
  etapaCount: { fontSize: 12, color: '#9E9E9E' },
  etapasList: { paddingHorizontal: 14, paddingBottom: 10, gap: 4 },
  etapaRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 4, borderTopWidth: 1, borderTopColor: '#F5F5F5' },
  etapaNum: { fontSize: 11, fontWeight: '800', color: '#BDBDBD', minWidth: 16 },
  etapaDesc: { flex: 1, fontSize: 12, color: '#424242' },
  etapaTol: { fontSize: 11, color: '#9E9E9E', minWidth: 80, textAlign: 'right' },
  respCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: '#FFFFFF', borderRadius: 10, padding: 14, borderWidth: 1, borderColor: '#E0E0E0' },
  respAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#2E7D32', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  respAvatarText: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  respInfo: { flex: 1, gap: 2 },
  respName: { fontSize: 14, fontWeight: '700', color: '#1C1C1C' },
  respPosition: { fontSize: 12, color: '#2E7D32', fontWeight: '600' },
  respContact: { fontSize: 12, color: '#9E9E9E' },
  respObras: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  respObraBadge: { backgroundColor: '#E8F5E9', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  respObraBadgeText: { fontSize: 10, fontWeight: '600', color: '#2E7D32' },
});
