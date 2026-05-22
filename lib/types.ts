// ============================================================
// OR Obras — Tipos e Modelos de Dados
// ============================================================

export type UserRole = 'owner' | 'admin' | 'inspector' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  position?: string;
  phone?: string;
  avatar?: string;
  active: boolean;
  createdAt: string;
  lastAccess?: string;
}

export type ObraStatus = 'active' | 'completed' | 'paused';

export interface Obra {
  id: string;
  name: string;
  address: string;
  startDate: string;
  expectedEndDate?: string;
  status: ObraStatus;
  createdAt: string;
}

export interface Torre {
  id: string;
  obraId: string;
  name: string;
  createdAt: string;
}

export interface Pavimento {
  id: string;
  torreId: string;
  obraId: string;
  name: string;
  order: number;
  createdAt: string;
}

export interface Local {
  id: string;
  pavimentoId: string;
  torreId: string;
  obraId: string;
  name: string;
  order: number;
  createdAt: string;
}

export interface EtapaServico {
  id: string;
  servicoId: string;
  description: string;
  verificationMethod: string;
  tolerance: string;
  order: number;
}

export interface Servico {
  id: string;
  code: string;
  name: string;
  etapas: EtapaServico[];
  createdAt: string;
}

export interface Responsavel {
  id: string;
  name: string;
  position: string;
  email: string;
  phone: string;
  obraIds: string[];
  createdAt: string;
}

export type InspectionStatus =
  | 'conforme'
  | 'nao_conforme'
  | 'excecao'
  | 'nao_avaliado'
  | 'liberado_concessao'
  | 'conforme_reinspeção'
  | 'nao_conforme_reinspeção';

export interface InspectionCell {
  id: string;
  obraId: string;
  torreId: string;
  pavimentoId: string;
  localId: string;
  servicoId: string;
  etapaId: string;
  status: InspectionStatus;
  observation?: string;
  treatmentObservation?: string;
  attachments?: string[];
  inspectedBy?: string;
  inspectedAt?: string;
  updatedAt: string;
}

// ---- Edificações ----

export interface LocalEdificacao {
  id: string;
  name: string; // ex: Térreo, 1º Pavimento, Cobertura
  order: number;
}

export interface ElementoEdificacao {
  id: string;
  name: string; // ex: V1, V2, Pilar Central
  source: 'group' | 'unit'; // origem: gerado em grupo ou adicionado unitariamente
}

export interface Edificacao {
  id: string;
  name: string; // ex: Torre 1, Bloco A, Sede
  locais: LocalEdificacao[];
  elementos: ElementoEdificacao[];
  createdAt: string;
  updatedAt: string;
}

export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isOnline: boolean;
  pendingSync: boolean;
  obras: Obra[];
  torres: Torre[];
  pavimentos: Pavimento[];
  locais: Local[];
  servicos: Servico[];
  responsaveis: Responsavel[];
  inspections: InspectionCell[];
  edificacoes: Edificacao[];
}

// Status display config
export const STATUS_CONFIG: Record<InspectionStatus, { label: string; color: string; shortLabel: string }> = {
  conforme: { label: 'Conforme', color: '#2E7D32', shortLabel: 'C' },
  nao_conforme: { label: 'Não Conforme', color: '#E53935', shortLabel: 'NC' },
  excecao: { label: 'Exceção', color: '#F9A825', shortLabel: 'EX' },
  nao_avaliado: { label: 'Não Avaliado', color: '#9E9E9E', shortLabel: 'NA' },
  liberado_concessao: { label: 'Liberado com Concessão', color: '#1565C0', shortLabel: 'LC' },
  conforme_reinspeção: { label: 'Conforme Após Reinspeção', color: '#2E7D32', shortLabel: 'CR' },
  nao_conforme_reinspeção: { label: 'Não Conforme Após Reinspeção', color: '#E53935', shortLabel: 'NR' },
};
