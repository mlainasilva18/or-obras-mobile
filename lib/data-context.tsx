import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  getObras, saveObras, addObra, updateObra, deleteObra,
  getTorres, addTorre, updateTorre, deleteTorre,
  getPavimentos, addPavimento, updatePavimento, deletePavimento,
  getLocais, addLocal, addLocaisMassa, updateLocal, deleteLocal,
  getServicos, addServico, updateServico, deleteServico,
  getResponsaveis, addResponsavel, updateResponsavel, deleteResponsavel,
  getInspections, upsertInspection,
} from './storage';
import type {
  Obra, Torre, Pavimento, Local, Servico, Responsavel, InspectionCell, EtapaServico
} from './types';

interface DataContextType {
  obras: Obra[];
  torres: Torre[];
  pavimentos: Pavimento[];
  locais: Local[];
  servicos: Servico[];
  responsaveis: Responsavel[];
  inspections: InspectionCell[];
  isLoading: boolean;
  reload: () => Promise<void>;
  // Obras
  createObra: (obra: Omit<Obra, 'id' | 'createdAt'>) => Promise<Obra>;
  editObra: (obra: Obra) => Promise<void>;
  removeObra: (id: string) => Promise<void>;
  // Torres
  createTorre: (torre: Omit<Torre, 'id' | 'createdAt'>) => Promise<Torre>;
  editTorre: (torre: Torre) => Promise<void>;
  removeTorre: (id: string) => Promise<void>;
  // Pavimentos
  createPavimento: (pav: Omit<Pavimento, 'id' | 'createdAt'>) => Promise<Pavimento>;
  editPavimento: (pav: Pavimento) => Promise<void>;
  removePavimento: (id: string) => Promise<void>;
  // Locais
  createLocal: (local: Omit<Local, 'id' | 'createdAt'>) => Promise<Local>;
  createLocaisMassa: (prefix: string, start: number, end: number, pavimentoId: string, torreId: string, obraId: string) => Promise<Local[]>;
  editLocal: (local: Local) => Promise<void>;
  removeLocal: (id: string) => Promise<void>;
  // Servicos
  createServico: (servico: Omit<Servico, 'id' | 'createdAt'>) => Promise<Servico>;
  editServico: (servico: Servico) => Promise<void>;
  removeServico: (id: string) => Promise<void>;
  // Responsaveis
  createResponsavel: (resp: Omit<Responsavel, 'id' | 'createdAt'>) => Promise<Responsavel>;
  editResponsavel: (resp: Responsavel) => Promise<void>;
  removeResponsavel: (id: string) => Promise<void>;
  // Inspections
  saveInspection: (cell: InspectionCell) => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

function uuid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [obras, setObras] = useState<Obra[]>([]);
  const [torres, setTorres] = useState<Torre[]>([]);
  const [pavimentos, setPavimentos] = useState<Pavimento[]>([]);
  const [locais, setLocais] = useState<Local[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);
  const [inspections, setInspections] = useState<InspectionCell[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    const [o, t, p, l, s, r, i] = await Promise.all([
      getObras(), getTorres(), getPavimentos(), getLocais(),
      getServicos(), getResponsaveis(), getInspections(),
    ]);
    setObras(o);
    setTorres(t);
    setPavimentos(p);
    setLocais(l);
    setServicos(s);
    setResponsaveis(r);
    setInspections(i);
    setIsLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  // Obras
  const createObra = async (data: Omit<Obra, 'id' | 'createdAt'>) => {
    const obra: Obra = { ...data, id: uuid(), createdAt: new Date().toISOString() };
    await addObra(obra);
    setObras(prev => [...prev, obra]);
    return obra;
  };
  const editObra = async (obra: Obra) => {
    await updateObra(obra);
    setObras(prev => prev.map(o => o.id === obra.id ? obra : o));
  };
  const removeObra = async (id: string) => {
    await deleteObra(id);
    setObras(prev => prev.filter(o => o.id !== id));
  };

  // Torres
  const createTorre = async (data: Omit<Torre, 'id' | 'createdAt'>) => {
    const torre: Torre = { ...data, id: uuid(), createdAt: new Date().toISOString() };
    await addTorre(torre);
    setTorres(prev => [...prev, torre]);
    return torre;
  };
  const editTorre = async (torre: Torre) => {
    await updateTorre(torre);
    setTorres(prev => prev.map(t => t.id === torre.id ? torre : t));
  };
  const removeTorre = async (id: string) => {
    await deleteTorre(id);
    setTorres(prev => prev.filter(t => t.id !== id));
  };

  // Pavimentos
  const createPavimento = async (data: Omit<Pavimento, 'id' | 'createdAt'>) => {
    const pav: Pavimento = { ...data, id: uuid(), createdAt: new Date().toISOString() };
    await addPavimento(pav);
    setPavimentos(prev => [...prev, pav]);
    return pav;
  };
  const editPavimento = async (pav: Pavimento) => {
    await updatePavimento(pav);
    setPavimentos(prev => prev.map(p => p.id === pav.id ? pav : p));
  };
  const removePavimento = async (id: string) => {
    await deletePavimento(id);
    setPavimentos(prev => prev.filter(p => p.id !== id));
  };

  // Locais
  const createLocal = async (data: Omit<Local, 'id' | 'createdAt'>) => {
    const local: Local = { ...data, id: uuid(), createdAt: new Date().toISOString() };
    await addLocal(local);
    setLocais(prev => [...prev, local]);
    return local;
  };
  const createLocaisMassa = async (prefix: string, start: number, end: number, pavimentoId: string, torreId: string, obraId: string) => {
    const now = new Date().toISOString();
    const novos: Local[] = [];
    for (let i = start; i <= end; i++) {
      const padded = String(i).padStart(2, '0');
      novos.push({ id: uuid(), pavimentoId, torreId, obraId, name: `${prefix} ${padded}`, order: i, createdAt: now });
    }
    await addLocaisMassa(novos);
    setLocais(prev => [...prev, ...novos]);
    return novos;
  };
  const editLocal = async (local: Local) => {
    await updateLocal(local);
    setLocais(prev => prev.map(l => l.id === local.id ? local : l));
  };
  const removeLocal = async (id: string) => {
    await deleteLocal(id);
    setLocais(prev => prev.filter(l => l.id !== id));
  };

  // Servicos
  const createServico = async (data: Omit<Servico, 'id' | 'createdAt'>) => {
    const servico: Servico = { ...data, id: uuid(), createdAt: new Date().toISOString() };
    await addServico(servico);
    setServicos(prev => [...prev, servico]);
    return servico;
  };
  const editServico = async (servico: Servico) => {
    await updateServico(servico);
    setServicos(prev => prev.map(s => s.id === servico.id ? servico : s));
  };
  const removeServico = async (id: string) => {
    await deleteServico(id);
    setServicos(prev => prev.filter(s => s.id !== id));
  };

  // Responsaveis
  const createResponsavel = async (data: Omit<Responsavel, 'id' | 'createdAt'>) => {
    const resp: Responsavel = { ...data, id: uuid(), createdAt: new Date().toISOString() };
    await addResponsavel(resp);
    setResponsaveis(prev => [...prev, resp]);
    return resp;
  };
  const editResponsavel = async (resp: Responsavel) => {
    await updateResponsavel(resp);
    setResponsaveis(prev => prev.map(r => r.id === resp.id ? resp : r));
  };
  const removeResponsavel = async (id: string) => {
    await deleteResponsavel(id);
    setResponsaveis(prev => prev.filter(r => r.id !== id));
  };

  // Inspections
  const saveInspection = async (cell: InspectionCell) => {
    await upsertInspection(cell);
    setInspections(prev => {
      const idx = prev.findIndex(c => c.id === cell.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = cell;
        return next;
      }
      return [...prev, cell];
    });
  };

  return (
    <DataContext.Provider value={{
      obras, torres, pavimentos, locais, servicos, responsaveis, inspections,
      isLoading, reload,
      createObra, editObra, removeObra,
      createTorre, editTorre, removeTorre,
      createPavimento, editPavimento, removePavimento,
      createLocal, createLocaisMassa, editLocal, removeLocal,
      createServico, editServico, removeServico,
      createResponsavel, editResponsavel, removeResponsavel,
      saveInspection,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
