import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  User, Obra, Torre, Pavimento, Local, Servico, Responsavel, InspectionCell, Edificacao
} from './types';

const KEYS = {
  EDIFICACOES: '@or_obras:edificacoes',
  USER: '@or_obras:user',
  OBRAS: '@or_obras:obras',
  TORRES: '@or_obras:torres',
  PAVIMENTOS: '@or_obras:pavimentos',
  LOCAIS: '@or_obras:locais',
  SERVICOS: '@or_obras:servicos',
  RESPONSAVEIS: '@or_obras:responsaveis',
  INSPECTIONS: '@or_obras:inspections',
  PENDING_SYNC: '@or_obras:pending_sync',
};

async function get<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function set<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage set error', e);
  }
}

// ---- User ----
export const getUser = () => get<User>(KEYS.USER);
export const saveUser = (user: User) => set(KEYS.USER, user);
export const clearUser = () => AsyncStorage.removeItem(KEYS.USER);

// ---- Obras ----
export const getObras = async (): Promise<Obra[]> => (await get<Obra[]>(KEYS.OBRAS)) ?? [];
export const saveObras = (obras: Obra[]) => set(KEYS.OBRAS, obras);
export const addObra = async (obra: Obra) => {
  const list = await getObras();
  await saveObras([...list, obra]);
};
export const updateObra = async (updated: Obra) => {
  const list = await getObras();
  await saveObras(list.map(o => o.id === updated.id ? updated : o));
};
export const deleteObra = async (id: string) => {
  const list = await getObras();
  await saveObras(list.filter(o => o.id !== id));
};

// ---- Torres ----
export const getTorres = async (): Promise<Torre[]> => (await get<Torre[]>(KEYS.TORRES)) ?? [];
export const saveTorres = (torres: Torre[]) => set(KEYS.TORRES, torres);
export const addTorre = async (torre: Torre) => {
  const list = await getTorres();
  await saveTorres([...list, torre]);
};
export const updateTorre = async (updated: Torre) => {
  const list = await getTorres();
  await saveTorres(list.map(t => t.id === updated.id ? updated : t));
};
export const deleteTorre = async (id: string) => {
  const list = await getTorres();
  await saveTorres(list.filter(t => t.id !== id));
};

// ---- Pavimentos ----
export const getPavimentos = async (): Promise<Pavimento[]> => (await get<Pavimento[]>(KEYS.PAVIMENTOS)) ?? [];
export const savePavimentos = (pavimentos: Pavimento[]) => set(KEYS.PAVIMENTOS, pavimentos);
export const addPavimento = async (pavimento: Pavimento) => {
  const list = await getPavimentos();
  await savePavimentos([...list, pavimento]);
};
export const updatePavimento = async (updated: Pavimento) => {
  const list = await getPavimentos();
  await savePavimentos(list.map(p => p.id === updated.id ? updated : p));
};
export const deletePavimento = async (id: string) => {
  const list = await getPavimentos();
  await savePavimentos(list.filter(p => p.id !== id));
};

// ---- Locais ----
export const getLocais = async (): Promise<Local[]> => (await get<Local[]>(KEYS.LOCAIS)) ?? [];
export const saveLocais = (locais: Local[]) => set(KEYS.LOCAIS, locais);
export const addLocal = async (local: Local) => {
  const list = await getLocais();
  await saveLocais([...list, local]);
};
export const addLocaisMassa = async (novos: Local[]) => {
  const list = await getLocais();
  await saveLocais([...list, ...novos]);
};
export const updateLocal = async (updated: Local) => {
  const list = await getLocais();
  await saveLocais(list.map(l => l.id === updated.id ? updated : l));
};
export const deleteLocal = async (id: string) => {
  const list = await getLocais();
  await saveLocais(list.filter(l => l.id !== id));
};

// ---- Servicos ----
export const getServicos = async (): Promise<Servico[]> => (await get<Servico[]>(KEYS.SERVICOS)) ?? [];
export const saveServicos = (servicos: Servico[]) => set(KEYS.SERVICOS, servicos);
export const addServico = async (servico: Servico) => {
  const list = await getServicos();
  await saveServicos([...list, servico]);
};
export const updateServico = async (updated: Servico) => {
  const list = await getServicos();
  await saveServicos(list.map(s => s.id === updated.id ? updated : s));
};
export const deleteServico = async (id: string) => {
  const list = await getServicos();
  await saveServicos(list.filter(s => s.id !== id));
};

// ---- Responsaveis ----
export const getResponsaveis = async (): Promise<Responsavel[]> => (await get<Responsavel[]>(KEYS.RESPONSAVEIS)) ?? [];
export const saveResponsaveis = (resp: Responsavel[]) => set(KEYS.RESPONSAVEIS, resp);
export const addResponsavel = async (resp: Responsavel) => {
  const list = await getResponsaveis();
  await saveResponsaveis([...list, resp]);
};
export const updateResponsavel = async (updated: Responsavel) => {
  const list = await getResponsaveis();
  await saveResponsaveis(list.map(r => r.id === updated.id ? updated : r));
};
export const deleteResponsavel = async (id: string) => {
  const list = await getResponsaveis();
  await saveResponsaveis(list.filter(r => r.id !== id));
};

// ---- Inspections ----
export const getInspections = async (): Promise<InspectionCell[]> => (await get<InspectionCell[]>(KEYS.INSPECTIONS)) ?? [];
export const saveInspections = (cells: InspectionCell[]) => set(KEYS.INSPECTIONS, cells);
export const upsertInspection = async (cell: InspectionCell) => {
  const list = await getInspections();
  const idx = list.findIndex(c => c.id === cell.id);
  if (idx >= 0) {
    list[idx] = cell;
  } else {
    list.push(cell);
  }
  await saveInspections(list);
};

// ---- Edificações ----
export const getEdificacoes = async (): Promise<Edificacao[]> => (await get<Edificacao[]>(KEYS.EDIFICACOES)) ?? [];
export const saveEdificacoes = (list: Edificacao[]) => set(KEYS.EDIFICACOES, list);
export const addEdificacao = async (e: Edificacao) => {
  const list = await getEdificacoes();
  await saveEdificacoes([...list, e]);
};
export const updateEdificacao = async (updated: Edificacao) => {
  const list = await getEdificacoes();
  await saveEdificacoes(list.map(e => e.id === updated.id ? updated : e));
};
export const deleteEdificacao = async (id: string) => {
  const list = await getEdificacoes();
  await saveEdificacoes(list.filter(e => e.id !== id));
};

// ---- Pending Sync ----
export const getPendingSync = async (): Promise<boolean> => (await get<boolean>(KEYS.PENDING_SYNC)) ?? false;
export const setPendingSync = (pending: boolean) => set(KEYS.PENDING_SYNC, pending);

// ---- Seed demo data ----
export async function seedDemoData(userId: string) {
  const obras = await getObras();
  if (obras.length > 0) return; // Already seeded

  const now = new Date().toISOString();

  const demoObras: Obra[] = [
    { id: 'obra1', name: 'Residencial Parque Verde', address: 'Av. das Flores, 1200 - São Paulo, SP', startDate: '2024-01-15', expectedEndDate: '2025-12-31', status: 'active', createdAt: now },
    { id: 'obra2', name: 'Edifício Comercial Centro', address: 'Rua do Comércio, 450 - São Paulo, SP', startDate: '2024-03-01', expectedEndDate: '2026-06-30', status: 'active', createdAt: now },
  ];

  const demoTorres: Torre[] = [
    { id: 'torre1', obraId: 'obra1', name: 'Torre A', createdAt: now },
    { id: 'torre2', obraId: 'obra1', name: 'Torre B', createdAt: now },
    { id: 'torre3', obraId: 'obra2', name: 'Bloco 1', createdAt: now },
  ];

  const demoPavimentos: Pavimento[] = [
    { id: 'pav1', torreId: 'torre1', obraId: 'obra1', name: '1º Pavimento', order: 1, createdAt: now },
    { id: 'pav2', torreId: 'torre1', obraId: 'obra1', name: '2º Pavimento', order: 2, createdAt: now },
    { id: 'pav3', torreId: 'torre2', obraId: 'obra1', name: '1º Pavimento', order: 1, createdAt: now },
    { id: 'pav4', torreId: 'torre3', obraId: 'obra2', name: 'Térreo', order: 0, createdAt: now },
  ];

  const demoLocais: Local[] = [
    { id: 'loc1', pavimentoId: 'pav1', torreId: 'torre1', obraId: 'obra1', name: 'APTO 101', order: 1, createdAt: now },
    { id: 'loc2', pavimentoId: 'pav1', torreId: 'torre1', obraId: 'obra1', name: 'APTO 102', order: 2, createdAt: now },
    { id: 'loc3', pavimentoId: 'pav1', torreId: 'torre1', obraId: 'obra1', name: 'APTO 103', order: 3, createdAt: now },
    { id: 'loc4', pavimentoId: 'pav1', torreId: 'torre1', obraId: 'obra1', name: 'HALL', order: 4, createdAt: now },
    { id: 'loc5', pavimentoId: 'pav1', torreId: 'torre1', obraId: 'obra1', name: 'ESCADA', order: 5, createdAt: now },
    { id: 'loc6', pavimentoId: 'pav2', torreId: 'torre1', obraId: 'obra1', name: 'APTO 201', order: 1, createdAt: now },
    { id: 'loc7', pavimentoId: 'pav2', torreId: 'torre1', obraId: 'obra1', name: 'APTO 202', order: 2, createdAt: now },
  ];

  const demoServicos: Servico[] = [
    {
      id: 'serv1', code: 'CS 01.01', name: 'COMPACTAÇÃO DE ATERRO', createdAt: now,
      etapas: [
        { id: 'et1', servicoId: 'serv1', description: 'Verificação da umidade do solo', verificationMethod: 'Ensaio Proctor', tolerance: '±2% da umidade ótima', order: 1 },
        { id: 'et2', servicoId: 'serv1', description: 'Grau de compactação', verificationMethod: 'Ensaio de densidade in situ', tolerance: 'Mínimo 95% do Proctor Normal', order: 2 },
        { id: 'et3', servicoId: 'serv1', description: 'Espessura da camada', verificationMethod: 'Medição direta', tolerance: '±5 cm', order: 3 },
      ]
    },
    {
      id: 'serv2', code: 'CS 02.01', name: 'ALVENARIA DE VEDAÇÃO', createdAt: now,
      etapas: [
        { id: 'et4', servicoId: 'serv2', description: 'Prumo das paredes', verificationMethod: 'Prumo de pedreiro', tolerance: '±5 mm por metro', order: 1 },
        { id: 'et5', servicoId: 'serv2', description: 'Nível das fiadas', verificationMethod: 'Nível de bolha', tolerance: '±3 mm', order: 2 },
        { id: 'et6', servicoId: 'serv2', description: 'Espessura das juntas', verificationMethod: 'Medição direta', tolerance: '10 a 15 mm', order: 3 },
        { id: 'et7', servicoId: 'serv2', description: 'Amarração dos blocos', verificationMethod: 'Inspeção visual', tolerance: 'Conforme projeto', order: 4 },
      ]
    },
    {
      id: 'serv3', code: 'CS 03.01', name: 'REVESTIMENTO CERÂMICO', createdAt: now,
      etapas: [
        { id: 'et8', servicoId: 'serv3', description: 'Planeza da superfície', verificationMethod: 'Régua de 2m', tolerance: '±3 mm', order: 1 },
        { id: 'et9', servicoId: 'serv3', description: 'Alinhamento das juntas', verificationMethod: 'Inspeção visual', tolerance: '±2 mm', order: 2 },
        { id: 'et10', servicoId: 'serv3', description: 'Aderência das peças', verificationMethod: 'Percussão', tolerance: 'Som cheio em 100% das peças', order: 3 },
      ]
    },
  ];

  const demoResponsaveis: Responsavel[] = [
    { id: 'resp1', name: 'Carlos Eduardo Silva', position: 'Engenheiro de Qualidade', email: 'carlos@orengenharia.com.br', phone: '(11) 99999-0001', obraIds: ['obra1', 'obra2'], createdAt: now },
    { id: 'resp2', name: 'Ana Paula Ferreira', position: 'Técnica de Edificações', email: 'ana@orengenharia.com.br', phone: '(11) 99999-0002', obraIds: ['obra1'], createdAt: now },
  ];

  await saveObras(demoObras);
  await saveTorres(demoTorres);
  await savePavimentos(demoPavimentos);
  await saveLocais(demoLocais);
  await saveServicos(demoServicos);
  await saveResponsaveis(demoResponsaveis);
}
