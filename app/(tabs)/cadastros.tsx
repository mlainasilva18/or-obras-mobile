import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Modal, Alert,
} from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useData } from '@/lib/data-context';
import { MaterialIcons } from '@expo/vector-icons';
import type { Obra, Servico, EtapaServico, Responsavel } from '@/lib/types';

type Tab = 'obras' | 'servicos' | 'responsaveis';

// ---- Obra Form Modal ----
function ObraFormModal({
  visible, onClose, initial, onSave,
}: {
  visible: boolean;
  onClose: () => void;
  initial?: Obra;
  onSave: (data: Omit<Obra, 'id' | 'createdAt'>) => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [address, setAddress] = useState(initial?.address ?? '');
  const [startDate, setStartDate] = useState(initial?.startDate ?? '');
  const [status, setStatus] = useState<Obra['status']>(initial?.status ?? 'active');

  React.useEffect(() => {
    if (visible) {
      setName(initial?.name ?? '');
      setAddress(initial?.address ?? '');
      setStartDate(initial?.startDate ?? '');
      setStatus(initial?.status ?? 'active');
    }
  }, [visible, initial]);

  const handleSave = () => {
    if (!name.trim()) { Alert.alert('Atenção', 'Informe o nome da obra.'); return; }
    onSave({ name: name.trim(), address: address.trim(), startDate, status });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={modalStyles.container}>
        <View style={modalStyles.header}>
          <Text style={modalStyles.title}>{initial ? 'Editar Obra' : 'Nova Obra'}</Text>
          <TouchableOpacity onPress={onClose} style={modalStyles.closeBtn}>
            <MaterialIcons name="close" size={24} color="#424242" />
          </TouchableOpacity>
        </View>
        <ScrollView style={modalStyles.body} keyboardShouldPersistTaps="handled">
          <Text style={modalStyles.label}>Nome da Obra *</Text>
          <TextInput style={modalStyles.input} value={name} onChangeText={setName} placeholder="Ex: Residencial Parque Verde" placeholderTextColor="#9E9E9E" />
          <Text style={modalStyles.label}>Endereço</Text>
          <TextInput style={modalStyles.input} value={address} onChangeText={setAddress} placeholder="Av. das Flores, 1200 - São Paulo, SP" placeholderTextColor="#9E9E9E" />
          <Text style={modalStyles.label}>Data de Início</Text>
          <TextInput style={modalStyles.input} value={startDate} onChangeText={setStartDate} placeholder="2024-01-15" placeholderTextColor="#9E9E9E" />
          <Text style={modalStyles.label}>Status</Text>
          <View style={modalStyles.statusRow}>
            {(['active', 'paused', 'completed'] as Obra['status'][]).map(s => (
              <TouchableOpacity
                key={s}
                style={[modalStyles.statusOpt, status === s && modalStyles.statusOptActive]}
                onPress={() => setStatus(s)}
                activeOpacity={0.7}
              >
                <Text style={[modalStyles.statusOptText, status === s && modalStyles.statusOptTextActive]}>
                  {s === 'active' ? 'Em andamento' : s === 'paused' ? 'Pausada' : 'Concluída'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
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

// ---- Torre/Pavimento/Local sub-section ----
function ObraDetailSection({ obra }: { obra: Obra }) {
  const { torres, pavimentos, locais, createTorre, createPavimento, createLocal, createLocaisMassa, removeTorre, removePavimento, removeLocal } = useData();
  const obraTorres = torres.filter(t => t.obraId === obra.id);
  const [expandedTorre, setExpandedTorre] = useState<string | null>(null);
  const [expandedPav, setExpandedPav] = useState<string | null>(null);
  const [addingTorre, setAddingTorre] = useState(false);
  const [newTorreName, setNewTorreName] = useState('');
  const [addingPav, setAddingPav] = useState<string | null>(null);
  const [newPavName, setNewPavName] = useState('');
  const [addingLocal, setAddingLocal] = useState<string | null>(null);
  const [newLocalName, setNewLocalName] = useState('');
  const [massaModal, setMassaModal] = useState<string | null>(null);
  const [massaPrefix, setMassaPrefix] = useState('APTO');
  const [massaStart, setMassaStart] = useState('1');
  const [massaEnd, setMassaEnd] = useState('10');

  const handleAddTorre = async () => {
    if (!newTorreName.trim()) return;
    await createTorre({ obraId: obra.id, name: newTorreName.trim() });
    setNewTorreName('');
    setAddingTorre(false);
  };

  const handleAddPav = async (torreId: string) => {
    if (!newPavName.trim()) return;
    const pavs = pavimentos.filter(p => p.torreId === torreId);
    await createPavimento({ torreId, obraId: obra.id, name: newPavName.trim(), order: pavs.length + 1 });
    setNewPavName('');
    setAddingPav(null);
  };

  const handleAddLocal = async (pavimentoId: string, torreId: string) => {
    if (!newLocalName.trim()) return;
    const locs = locais.filter(l => l.pavimentoId === pavimentoId);
    await createLocal({ pavimentoId, torreId, obraId: obra.id, name: newLocalName.trim(), order: locs.length + 1 });
    setNewLocalName('');
    setAddingLocal(null);
  };

  const handleMassa = async (pavimentoId: string, torreId: string) => {
    const start = parseInt(massaStart);
    const end = parseInt(massaEnd);
    if (isNaN(start) || isNaN(end) || start > end) {
      Alert.alert('Atenção', 'Intervalo inválido.');
      return;
    }
    await createLocaisMassa(massaPrefix, start, end, pavimentoId, torreId, obra.id);
    setMassaModal(null);
  };

  return (
    <View style={detailStyles.container}>
      <Text style={detailStyles.sectionTitle}>Torres / Blocos</Text>
      {obraTorres.map(torre => {
        const tPavs = pavimentos.filter(p => p.torreId === torre.id);
        const isExpanded = expandedTorre === torre.id;
        return (
          <View key={torre.id} style={detailStyles.torreCard}>
            <TouchableOpacity
              style={detailStyles.torreHeader}
              onPress={() => setExpandedTorre(isExpanded ? null : torre.id)}
              activeOpacity={0.8}
            >
              <MaterialIcons name={isExpanded ? 'expand-less' : 'expand-more'} size={20} color="#424242" />
              <Text style={detailStyles.torreName}>{torre.name}</Text>
              <Text style={detailStyles.torreCount}>{tPavs.length} pav.</Text>
              <TouchableOpacity onPress={() => { Alert.alert('Remover', `Remover "${torre.name}"?`, [{ text: 'Cancelar' }, { text: 'Remover', style: 'destructive', onPress: () => removeTorre(torre.id) }]); }} style={detailStyles.deleteBtn}>
                <MaterialIcons name="delete-outline" size={18} color="#E53935" />
              </TouchableOpacity>
            </TouchableOpacity>

            {isExpanded && (
              <View style={detailStyles.pavList}>
                {tPavs.map(pav => {
                  const pLocais = locais.filter(l => l.pavimentoId === pav.id);
                  const isPavExpanded = expandedPav === pav.id;
                  return (
                    <View key={pav.id} style={detailStyles.pavCard}>
                      <TouchableOpacity
                        style={detailStyles.pavHeader}
                        onPress={() => setExpandedPav(isPavExpanded ? null : pav.id)}
                        activeOpacity={0.8}
                      >
                        <MaterialIcons name={isPavExpanded ? 'expand-less' : 'expand-more'} size={16} color="#9E9E9E" />
                        <Text style={detailStyles.pavName}>{pav.name}</Text>
                        <Text style={detailStyles.localCount}>{pLocais.length} locais</Text>
                        <TouchableOpacity onPress={() => removePavimento(pav.id)} style={detailStyles.deleteBtn}>
                          <MaterialIcons name="delete-outline" size={16} color="#E53935" />
                        </TouchableOpacity>
                      </TouchableOpacity>

                      {isPavExpanded && (
                        <View style={detailStyles.localList}>
                          {pLocais.map(local => (
                            <View key={local.id} style={detailStyles.localItem}>
                              <Text style={detailStyles.localName}>{local.name}</Text>
                              <TouchableOpacity onPress={() => removeLocal(local.id)}>
                                <MaterialIcons name="close" size={14} color="#E53935" />
                              </TouchableOpacity>
                            </View>
                          ))}
                          {addingLocal === pav.id ? (
                            <View style={detailStyles.addRow}>
                              <TextInput
                                style={detailStyles.addInput}
                                value={newLocalName}
                                onChangeText={setNewLocalName}
                                placeholder="Nome do local"
                                placeholderTextColor="#9E9E9E"
                                autoFocus
                              />
                              <TouchableOpacity onPress={() => handleAddLocal(pav.id, torre.id)} style={detailStyles.addConfirmBtn}>
                                <MaterialIcons name="check" size={16} color="#fff" />
                              </TouchableOpacity>
                              <TouchableOpacity onPress={() => setAddingLocal(null)} style={detailStyles.addCancelBtn}>
                                <MaterialIcons name="close" size={16} color="#424242" />
                              </TouchableOpacity>
                            </View>
                          ) : (
                            <View style={detailStyles.localActions}>
                              <TouchableOpacity style={detailStyles.addLocalBtn} onPress={() => setAddingLocal(pav.id)} activeOpacity={0.7}>
                                <MaterialIcons name="add" size={14} color="#2E7D32" />
                                <Text style={detailStyles.addLocalBtnText}>Adicionar</Text>
                              </TouchableOpacity>
                              <TouchableOpacity style={detailStyles.addLocalBtn} onPress={() => setMassaModal(pav.id)} activeOpacity={0.7}>
                                <MaterialIcons name="format-list-numbered" size={14} color="#1565C0" />
                                <Text style={[detailStyles.addLocalBtnText, { color: '#1565C0' }]}>Em Massa</Text>
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                      )}
                    </View>
                  );
                })}

                {addingPav === torre.id ? (
                  <View style={detailStyles.addRow}>
                    <TextInput
                      style={detailStyles.addInput}
                      value={newPavName}
                      onChangeText={setNewPavName}
                      placeholder="Nome do pavimento"
                      placeholderTextColor="#9E9E9E"
                      autoFocus
                    />
                    <TouchableOpacity onPress={() => handleAddPav(torre.id)} style={detailStyles.addConfirmBtn}>
                      <MaterialIcons name="check" size={16} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setAddingPav(null)} style={detailStyles.addCancelBtn}>
                      <MaterialIcons name="close" size={16} color="#424242" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={detailStyles.addPavBtn} onPress={() => setAddingPav(torre.id)} activeOpacity={0.7}>
                    <MaterialIcons name="add" size={16} color="#2E7D32" />
                    <Text style={detailStyles.addPavBtnText}>Adicionar Pavimento</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        );
      })}

      {addingTorre ? (
        <View style={detailStyles.addRow}>
          <TextInput
            style={detailStyles.addInput}
            value={newTorreName}
            onChangeText={setNewTorreName}
            placeholder="Nome da torre/bloco"
            placeholderTextColor="#9E9E9E"
            autoFocus
          />
          <TouchableOpacity onPress={handleAddTorre} style={detailStyles.addConfirmBtn}>
            <MaterialIcons name="check" size={16} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setAddingTorre(false)} style={detailStyles.addCancelBtn}>
            <MaterialIcons name="close" size={16} color="#424242" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={detailStyles.addTorreBtn} onPress={() => setAddingTorre(true)} activeOpacity={0.7}>
          <MaterialIcons name="add" size={16} color="#2E7D32" />
          <Text style={detailStyles.addTorreBtnText}>Adicionar Torre/Bloco</Text>
        </TouchableOpacity>
      )}

      {/* Modal locais em massa */}
      <Modal visible={!!massaModal} animationType="fade" transparent onRequestClose={() => setMassaModal(null)}>
        <View style={massaStyles.overlay}>
          <View style={massaStyles.card}>
            <Text style={massaStyles.title}>Adicionar Locais em Massa</Text>
            <Text style={massaStyles.label}>Prefixo</Text>
            <TextInput style={massaStyles.input} value={massaPrefix} onChangeText={setMassaPrefix} placeholder="APTO" placeholderTextColor="#9E9E9E" />
            <View style={massaStyles.row}>
              <View style={massaStyles.half}>
                <Text style={massaStyles.label}>De</Text>
                <TextInput style={massaStyles.input} value={massaStart} onChangeText={setMassaStart} keyboardType="numeric" placeholder="1" placeholderTextColor="#9E9E9E" />
              </View>
              <View style={massaStyles.half}>
                <Text style={massaStyles.label}>Até</Text>
                <TextInput style={massaStyles.input} value={massaEnd} onChangeText={setMassaEnd} keyboardType="numeric" placeholder="20" placeholderTextColor="#9E9E9E" />
              </View>
            </View>
            <Text style={massaStyles.preview}>
              Serão criados: {massaPrefix} {massaStart.padStart(2, '0')} até {massaPrefix} {massaEnd.padStart(2, '0')}
            </Text>
            <View style={massaStyles.btnRow}>
              <TouchableOpacity style={massaStyles.cancelBtn} onPress={() => setMassaModal(null)} activeOpacity={0.7}>
                <Text style={massaStyles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={massaStyles.confirmBtn}
                onPress={() => {
                  const pavId = massaModal!;
                  const torre = pavimentos.find(p => p.id === pavId);
                  if (torre) handleMassa(pavId, torre.torreId);
                }}
                activeOpacity={0.85}
              >
                <Text style={massaStyles.confirmBtnText}>Criar Locais</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ---- Serviço Form Modal ----
function ServicoFormModal({
  visible, onClose, initial, onSave,
}: {
  visible: boolean;
  onClose: () => void;
  initial?: Servico;
  onSave: (data: Omit<Servico, 'id' | 'createdAt'>) => void;
}) {
  const [code, setCode] = useState(initial?.code ?? '');
  const [name, setName] = useState(initial?.name ?? '');
  const [etapas, setEtapas] = useState<Omit<EtapaServico, 'id' | 'servicoId'>[]>(
    initial?.etapas.map(e => ({ description: e.description, verificationMethod: e.verificationMethod, tolerance: e.tolerance, order: e.order })) ?? []
  );

  React.useEffect(() => {
    if (visible) {
      setCode(initial?.code ?? '');
      setName(initial?.name ?? '');
      setEtapas(initial?.etapas.map(e => ({ description: e.description, verificationMethod: e.verificationMethod, tolerance: e.tolerance, order: e.order })) ?? []);
    }
  }, [visible, initial]);

  const addEtapa = () => setEtapas(prev => [...prev, { description: '', verificationMethod: '', tolerance: '', order: prev.length + 1 }]);
  const removeEtapa = (idx: number) => setEtapas(prev => prev.filter((_, i) => i !== idx));
  const updateEtapa = (idx: number, field: string, value: string) => {
    setEtapas(prev => prev.map((e, i) => i === idx ? { ...e, [field]: value } : e));
  };

  const handleSave = () => {
    if (!code.trim() || !name.trim()) { Alert.alert('Atenção', 'Informe o código e o nome do serviço.'); return; }
    const etapasWithIds: EtapaServico[] = etapas.map((e, i) => ({
      ...e,
      id: `et_${Date.now()}_${i}`,
      servicoId: initial?.id ?? '',
    }));
    onSave({ code: code.trim(), name: name.trim(), etapas: etapasWithIds });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={modalStyles.container}>
        <View style={modalStyles.header}>
          <Text style={modalStyles.title}>{initial ? 'Editar Serviço' : 'Novo Serviço'}</Text>
          <TouchableOpacity onPress={onClose} style={modalStyles.closeBtn}>
            <MaterialIcons name="close" size={24} color="#424242" />
          </TouchableOpacity>
        </View>
        <ScrollView style={modalStyles.body} keyboardShouldPersistTaps="handled">
          <Text style={modalStyles.label}>Código *</Text>
          <TextInput style={modalStyles.input} value={code} onChangeText={setCode} placeholder="CS 01.01" placeholderTextColor="#9E9E9E" />
          <Text style={modalStyles.label}>Nome do Serviço *</Text>
          <TextInput style={modalStyles.input} value={name} onChangeText={setName} placeholder="COMPACTAÇÃO DE ATERRO" placeholderTextColor="#9E9E9E" />

          <View style={modalStyles.etapaHeader}>
            <Text style={modalStyles.label}>Etapas</Text>
            <TouchableOpacity onPress={addEtapa} style={modalStyles.addEtapaBtn} activeOpacity={0.7}>
              <MaterialIcons name="add" size={16} color="#2E7D32" />
              <Text style={modalStyles.addEtapaBtnText}>Adicionar</Text>
            </TouchableOpacity>
          </View>

          {etapas.map((etapa, idx) => (
            <View key={idx} style={modalStyles.etapaCard}>
              <View style={modalStyles.etapaCardHeader}>
                <Text style={modalStyles.etapaNum}>Etapa {idx + 1}</Text>
                <TouchableOpacity onPress={() => removeEtapa(idx)}>
                  <MaterialIcons name="delete-outline" size={18} color="#E53935" />
                </TouchableOpacity>
              </View>
              <Text style={modalStyles.sublabel}>Descrição</Text>
              <TextInput
                style={modalStyles.input}
                value={etapa.description}
                onChangeText={v => updateEtapa(idx, 'description', v)}
                placeholder="Descrição da etapa"
                placeholderTextColor="#9E9E9E"
                multiline
              />
              <Text style={modalStyles.sublabel}>Método de Verificação</Text>
              <TextInput
                style={modalStyles.input}
                value={etapa.verificationMethod}
                onChangeText={v => updateEtapa(idx, 'verificationMethod', v)}
                placeholder="Ex: Ensaio Proctor"
                placeholderTextColor="#9E9E9E"
              />
              <Text style={modalStyles.sublabel}>Tolerância</Text>
              <TextInput
                style={modalStyles.input}
                value={etapa.tolerance}
                onChangeText={v => updateEtapa(idx, 'tolerance', v)}
                placeholder="Ex: ±2% da umidade ótima"
                placeholderTextColor="#9E9E9E"
              />
            </View>
          ))}
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

// ---- Responsável Form Modal ----
function ResponsavelFormModal({
  visible, onClose, initial, onSave, obras,
}: {
  visible: boolean;
  onClose: () => void;
  initial?: Responsavel;
  onSave: (data: Omit<Responsavel, 'id' | 'createdAt'>) => void;
  obras: Obra[];
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [position, setPosition] = useState(initial?.position ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [selectedObras, setSelectedObras] = useState<string[]>(initial?.obraIds ?? []);

  React.useEffect(() => {
    if (visible) {
      setName(initial?.name ?? '');
      setPosition(initial?.position ?? '');
      setEmail(initial?.email ?? '');
      setPhone(initial?.phone ?? '');
      setSelectedObras(initial?.obraIds ?? []);
    }
  }, [visible, initial]);

  const toggleObra = (id: string) => {
    setSelectedObras(prev => prev.includes(id) ? prev.filter(o => o !== id) : [...prev, id]);
  };

  const handleSave = () => {
    if (!name.trim()) { Alert.alert('Atenção', 'Informe o nome do responsável.'); return; }
    onSave({ name: name.trim(), position: position.trim(), email: email.trim(), phone: phone.trim(), obraIds: selectedObras });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={modalStyles.container}>
        <View style={modalStyles.header}>
          <Text style={modalStyles.title}>{initial ? 'Editar Responsável' : 'Novo Responsável'}</Text>
          <TouchableOpacity onPress={onClose} style={modalStyles.closeBtn}>
            <MaterialIcons name="close" size={24} color="#424242" />
          </TouchableOpacity>
        </View>
        <ScrollView style={modalStyles.body} keyboardShouldPersistTaps="handled">
          <Text style={modalStyles.label}>Nome *</Text>
          <TextInput style={modalStyles.input} value={name} onChangeText={setName} placeholder="Nome completo" placeholderTextColor="#9E9E9E" />
          <Text style={modalStyles.label}>Cargo/Função</Text>
          <TextInput style={modalStyles.input} value={position} onChangeText={setPosition} placeholder="Engenheiro de Qualidade" placeholderTextColor="#9E9E9E" />
          <Text style={modalStyles.label}>E-mail</Text>
          <TextInput style={modalStyles.input} value={email} onChangeText={setEmail} placeholder="email@empresa.com.br" placeholderTextColor="#9E9E9E" keyboardType="email-address" autoCapitalize="none" />
          <Text style={modalStyles.label}>Telefone</Text>
          <TextInput style={modalStyles.input} value={phone} onChangeText={setPhone} placeholder="(11) 99999-0000" placeholderTextColor="#9E9E9E" keyboardType="phone-pad" />
          <Text style={modalStyles.label}>Obras Vinculadas</Text>
          {obras.map(obra => (
            <TouchableOpacity
              key={obra.id}
              style={[modalStyles.obraChip, selectedObras.includes(obra.id) && modalStyles.obraChipActive]}
              onPress={() => toggleObra(obra.id)}
              activeOpacity={0.7}
            >
              <MaterialIcons
                name={selectedObras.includes(obra.id) ? 'check-box' : 'check-box-outline-blank'}
                size={18}
                color={selectedObras.includes(obra.id) ? '#2E7D32' : '#9E9E9E'}
              />
              <Text style={[modalStyles.obraChipText, selectedObras.includes(obra.id) && modalStyles.obraChipTextActive]}>
                {obra.name}
              </Text>
            </TouchableOpacity>
          ))}
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

// ---- Main Screen ----
export default function CadastrosScreen() {
  const { obras, servicos, responsaveis, createObra, editObra, removeObra, createServico, editServico, removeServico, createResponsavel, editResponsavel, removeResponsavel } = useData();
  const [activeTab, setActiveTab] = useState<Tab>('obras');
  const [obraModal, setObraModal] = useState(false);
  const [editingObra, setEditingObra] = useState<Obra | undefined>();
  const [expandedObra, setExpandedObra] = useState<string | null>(null);
  const [servicoModal, setServicoModal] = useState(false);
  const [editingServico, setEditingServico] = useState<Servico | undefined>();
  const [respModal, setRespModal] = useState(false);
  const [editingResp, setEditingResp] = useState<Responsavel | undefined>();

  const handleSaveObra = async (data: Omit<Obra, 'id' | 'createdAt'>) => {
    if (editingObra) {
      await editObra({ ...editingObra, ...data });
    } else {
      await createObra(data);
    }
    setEditingObra(undefined);
  };

  const handleSaveServico = async (data: Omit<Servico, 'id' | 'createdAt'>) => {
    if (editingServico) {
      await editServico({ ...editingServico, ...data });
    } else {
      await createServico(data);
    }
    setEditingServico(undefined);
  };

  const handleSaveResp = async (data: Omit<Responsavel, 'id' | 'createdAt'>) => {
    if (editingResp) {
      await editResponsavel({ ...editingResp, ...data });
    } else {
      await createResponsavel(data);
    }
    setEditingResp(undefined);
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cadastros</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => {
            if (activeTab === 'obras') { setEditingObra(undefined); setObraModal(true); }
            else if (activeTab === 'servicos') { setEditingServico(undefined); setServicoModal(true); }
            else { setEditingResp(undefined); setRespModal(true); }
          }}
          activeOpacity={0.85}
        >
          <MaterialIcons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {(['obras', 'servicos', 'responsaveis'] as Tab[]).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'obras' ? 'Obras' : tab === 'servicos' ? 'Serviços' : 'Responsáveis'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Obras Tab */}
        {activeTab === 'obras' && (
          obras.length === 0 ? (
            <View style={styles.emptyBox}>
              <MaterialIcons name="construction" size={40} color="#E0E0E0" />
              <Text style={styles.emptyText}>Nenhuma obra cadastrada.</Text>
            </View>
          ) : obras.map(obra => (
            <View key={obra.id} style={styles.itemCard}>
              <TouchableOpacity
                style={styles.itemHeader}
                onPress={() => setExpandedObra(expandedObra === obra.id ? null : obra.id)}
                activeOpacity={0.8}
              >
                <View style={styles.itemLeft}>
                  <Text style={styles.itemName}>{obra.name}</Text>
                  <Text style={styles.itemSub}>{obra.address}</Text>
                </View>
                <View style={styles.itemActions}>
                  <TouchableOpacity onPress={() => { setEditingObra(obra); setObraModal(true); }} style={styles.iconBtn}>
                    <MaterialIcons name="edit" size={18} color="#1565C0" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => Alert.alert('Remover', `Remover "${obra.name}"?`, [{ text: 'Cancelar' }, { text: 'Remover', style: 'destructive', onPress: () => removeObra(obra.id) }])} style={styles.iconBtn}>
                    <MaterialIcons name="delete-outline" size={18} color="#E53935" />
                  </TouchableOpacity>
                  <MaterialIcons name={expandedObra === obra.id ? 'expand-less' : 'expand-more'} size={20} color="#9E9E9E" />
                </View>
              </TouchableOpacity>
              {expandedObra === obra.id && <ObraDetailSection obra={obra} />}
            </View>
          ))
        )}

        {/* Serviços Tab */}
        {activeTab === 'servicos' && (
          servicos.length === 0 ? (
            <View style={styles.emptyBox}>
              <MaterialIcons name="engineering" size={40} color="#E0E0E0" />
              <Text style={styles.emptyText}>Nenhum serviço cadastrado.</Text>
            </View>
          ) : servicos.map(servico => (
            <View key={servico.id} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <View style={styles.itemLeft}>
                  <View style={styles.codeRow}>
                    <Text style={styles.codeTag}>{servico.code}</Text>
                    <Text style={styles.itemName}>{servico.name}</Text>
                  </View>
                  <Text style={styles.itemSub}>{servico.etapas.length} etapa{servico.etapas.length !== 1 ? 's' : ''}</Text>
                </View>
                <View style={styles.itemActions}>
                  <TouchableOpacity onPress={() => { setEditingServico(servico); setServicoModal(true); }} style={styles.iconBtn}>
                    <MaterialIcons name="edit" size={18} color="#1565C0" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => Alert.alert('Remover', `Remover "${servico.name}"?`, [{ text: 'Cancelar' }, { text: 'Remover', style: 'destructive', onPress: () => removeServico(servico.id) }])} style={styles.iconBtn}>
                    <MaterialIcons name="delete-outline" size={18} color="#E53935" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}

        {/* Responsáveis Tab */}
        {activeTab === 'responsaveis' && (
          responsaveis.length === 0 ? (
            <View style={styles.emptyBox}>
              <MaterialIcons name="people" size={40} color="#E0E0E0" />
              <Text style={styles.emptyText}>Nenhum responsável cadastrado.</Text>
            </View>
          ) : responsaveis.map(resp => (
            <View key={resp.id} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <View style={styles.itemLeft}>
                  <Text style={styles.itemName}>{resp.name}</Text>
                  <Text style={styles.itemSub}>{resp.position} · {resp.email}</Text>
                </View>
                <View style={styles.itemActions}>
                  <TouchableOpacity onPress={() => { setEditingResp(resp); setRespModal(true); }} style={styles.iconBtn}>
                    <MaterialIcons name="edit" size={18} color="#1565C0" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => Alert.alert('Remover', `Remover "${resp.name}"?`, [{ text: 'Cancelar' }, { text: 'Remover', style: 'destructive', onPress: () => removeResponsavel(resp.id) }])} style={styles.iconBtn}>
                    <MaterialIcons name="delete-outline" size={18} color="#E53935" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <ObraFormModal visible={obraModal} onClose={() => { setObraModal(false); setEditingObra(undefined); }} initial={editingObra} onSave={handleSaveObra} />
      <ServicoFormModal visible={servicoModal} onClose={() => { setServicoModal(false); setEditingServico(undefined); }} initial={editingServico} onSave={handleSaveServico} />
      <ResponsavelFormModal visible={respModal} onClose={() => { setRespModal(false); setEditingResp(undefined); }} initial={editingResp} onSave={handleSaveResp} obras={obras} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#E0E0E0', backgroundColor: '#FFFFFF' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1C1C1C' },
  addBtn: { backgroundColor: '#2E7D32', borderRadius: 10, padding: 8 },
  tabBar: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#2E7D32' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#9E9E9E' },
  tabTextActive: { color: '#2E7D32' },
  scroll: { flex: 1, backgroundColor: '#FAFAFA' },
  content: { padding: 16, paddingBottom: 32 },
  emptyBox: { alignItems: 'center', paddingVertical: 48, gap: 10 },
  emptyText: { fontSize: 14, color: '#9E9E9E' },
  itemCard: { backgroundColor: '#FFFFFF', borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#E0E0E0', overflow: 'hidden' },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  itemLeft: { flex: 1, marginRight: 8 },
  itemName: { fontSize: 14, fontWeight: '700', color: '#1C1C1C' },
  itemSub: { fontSize: 12, color: '#9E9E9E', marginTop: 2 },
  itemActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  iconBtn: { padding: 4 },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  codeTag: { backgroundColor: '#E8F5E9', color: '#2E7D32', fontSize: 11, fontWeight: '700', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
});

const modalStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  title: { fontSize: 18, fontWeight: '700', color: '#1C1C1C' },
  closeBtn: { padding: 4 },
  body: { flex: 1, padding: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#424242', marginBottom: 4, marginTop: 12 },
  sublabel: { fontSize: 12, color: '#9E9E9E', marginBottom: 3, marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#1C1C1C', backgroundColor: '#FAFAFA' },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: '#E0E0E0' },
  saveBtn: { backgroundColor: '#2E7D32', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  statusRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  statusOpt: { flex: 1, borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  statusOptActive: { borderColor: '#2E7D32', backgroundColor: '#E8F5E9' },
  statusOptText: { fontSize: 12, color: '#9E9E9E', fontWeight: '600' },
  statusOptTextActive: { color: '#2E7D32' },
  etapaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  addEtapaBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addEtapaBtnText: { color: '#2E7D32', fontSize: 13, fontWeight: '600' },
  etapaCard: { backgroundColor: '#F5F5F5', borderRadius: 8, padding: 12, marginTop: 8 },
  etapaCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  etapaNum: { fontSize: 13, fontWeight: '700', color: '#424242' },
  obraChip: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E0E0E0', marginTop: 6 },
  obraChipActive: { borderColor: '#2E7D32', backgroundColor: '#E8F5E9' },
  obraChipText: { fontSize: 13, color: '#9E9E9E' },
  obraChipTextActive: { color: '#2E7D32', fontWeight: '600' },
});

const detailStyles = StyleSheet.create({
  container: { padding: 12, borderTopWidth: 1, borderTopColor: '#F0F0F0', backgroundColor: '#FAFAFA' },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#9E9E9E', textTransform: 'uppercase', marginBottom: 8 },
  torreCard: { backgroundColor: '#FFFFFF', borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#E0E0E0', overflow: 'hidden' },
  torreHeader: { flexDirection: 'row', alignItems: 'center', padding: 10, gap: 6 },
  torreName: { flex: 1, fontSize: 14, fontWeight: '600', color: '#1C1C1C' },
  torreCount: { fontSize: 12, color: '#9E9E9E' },
  deleteBtn: { padding: 4 },
  pavList: { paddingHorizontal: 10, paddingBottom: 10 },
  pavCard: { backgroundColor: '#F5F5F5', borderRadius: 6, marginBottom: 6, overflow: 'hidden' },
  pavHeader: { flexDirection: 'row', alignItems: 'center', padding: 8, gap: 4 },
  pavName: { flex: 1, fontSize: 13, fontWeight: '600', color: '#424242' },
  localCount: { fontSize: 11, color: '#9E9E9E' },
  localList: { paddingHorizontal: 8, paddingBottom: 8 },
  localItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#EEEEEE' },
  localName: { fontSize: 12, color: '#424242' },
  localActions: { flexDirection: 'row', gap: 8, marginTop: 6 },
  addLocalBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4 },
  addLocalBtnText: { fontSize: 12, color: '#2E7D32', fontWeight: '600' },
  addPavBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6 },
  addPavBtnText: { fontSize: 12, color: '#2E7D32', fontWeight: '600' },
  addTorreBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 8 },
  addTorreBtnText: { fontSize: 13, color: '#2E7D32', fontWeight: '600' },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  addInput: { flex: 1, borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6, fontSize: 13, color: '#1C1C1C', backgroundColor: '#FFFFFF' },
  addConfirmBtn: { backgroundColor: '#2E7D32', borderRadius: 6, padding: 6 },
  addCancelBtn: { backgroundColor: '#F5F5F5', borderRadius: 6, padding: 6, borderWidth: 1, borderColor: '#E0E0E0' },
});

const massaStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, width: '100%' },
  title: { fontSize: 16, fontWeight: '700', color: '#1C1C1C', marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', color: '#424242', marginBottom: 4, marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#1C1C1C', backgroundColor: '#FAFAFA' },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  preview: { fontSize: 12, color: '#9E9E9E', marginTop: 10, textAlign: 'center' },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  cancelBtnText: { fontSize: 14, color: '#424242', fontWeight: '600' },
  confirmBtn: { flex: 1, backgroundColor: '#2E7D32', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  confirmBtnText: { fontSize: 14, color: '#FFFFFF', fontWeight: '700' },
});
