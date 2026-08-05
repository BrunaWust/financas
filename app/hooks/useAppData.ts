'use client';
import { useState, useEffect, useCallback } from 'react';
import { AppData, Lancamento, ConfiguracaoMes } from '../lib/types';
import * as XLSX from 'xlsx';

const STORAGE_KEY = 'financeapp_data';

const initialData: AppData = { lancamentos: [], configuracoes: [] };

function loadFromStorage(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialData;
    return JSON.parse(raw);
  } catch {
    return initialData;
  }
}

function saveToStorage(data: AppData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Erro ao salvar:', e);
  }
}

export function useAppData() {
  const [data, setData] = useState<AppData>(initialData);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setData(loadFromStorage());
    setLoaded(true);
  }, []);

  const update = useCallback((newData: AppData) => {
    setData(newData);
    saveToStorage(newData);
  }, []);

  const addLancamento = useCallback((l: Omit<Lancamento, 'id' | 'mes'>) => {
    const novo: Lancamento = {
      ...l,
      id: crypto.randomUUID(),
      mes: l.data.slice(0, 7),
    };
    setData(prev => {
      const next = { ...prev, lancamentos: [...prev.lancamentos, novo] };
      saveToStorage(next);
      return next;
    });
  }, []);

  const removeLancamento = useCallback((id: string) => {
    setData(prev => {
      const next = { ...prev, lancamentos: prev.lancamentos.filter(l => l.id !== id) };
      saveToStorage(next);
      return next;
    });
  }, []);

  const setConfigMes = useCallback((cfg: ConfiguracaoMes) => {
    setData(prev => {
      const outros = prev.configuracoes.filter(c => c.mes !== cfg.mes);
      const next = { ...prev, configuracoes: [...outros, cfg] };
      saveToStorage(next);
      return next;
    });
  }, []);

  // Export to XLSX
  const exportXLSX = useCallback(() => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Lançamentos
    const lancRows = data.lancamentos.map(l => ({
      ID: l.id,
      Data: l.data,
      Mês: l.mes,
      Descrição: l.descricao,
      Categoria: l.categoria,
      Tipo: l.tipo === 'receita' ? 'Receita' : l.tipo === 'gasto_fixo' ? 'Gasto Fixo' : 'Gasto Variável',
      'Valor (R$)': l.valor,
      Observação: l.observacao || '',
    }));
    const wsLanc = XLSX.utils.json_to_sheet(lancRows.length ? lancRows : [{ ID: '', Data: '', Mês: '', Descrição: '', Categoria: '', Tipo: '', 'Valor (R$)': '', Observação: '' }]);
    XLSX.utils.book_append_sheet(wb, wsLanc, 'Lançamentos');

    // Sheet 2: Configurações
    const cfgRows = data.configuracoes.map(c => ({
      Mês: c.mes,
      'Salário (R$)': c.salario,
      'Meta de Poupança (R$)': c.metaPoupanca,
    }));
    const wsCfg = XLSX.utils.json_to_sheet(cfgRows.length ? cfgRows : [{ Mês: '', 'Salário (R$)': '', 'Meta de Poupança (R$)': '' }]);
    XLSX.utils.book_append_sheet(wb, wsCfg, 'Configurações');

    // Sheet 3: Resumo por mês
    const meses = [...new Set(data.lancamentos.map(l => l.mes))].sort();
    const resumo = meses.map(mes => {
      const lsMes = data.lancamentos.filter(l => l.mes === mes);
      const cfg = data.configuracoes.find(c => c.mes === mes);
      const receitas = lsMes.filter(l => l.tipo === 'receita').reduce((s, l) => s + l.valor, 0);
      const fixos = lsMes.filter(l => l.tipo === 'gasto_fixo').reduce((s, l) => s + l.valor, 0);
      const variaveis = lsMes.filter(l => l.tipo === 'gasto_variavel').reduce((s, l) => s + l.valor, 0);
      return {
        Mês: mes,
        'Receitas (R$)': receitas,
        'Gastos Fixos (R$)': fixos,
        'Gastos Variáveis (R$)': variaveis,
        'Total Gastos (R$)': fixos + variaveis,
        'Saldo (R$)': receitas - fixos - variaveis,
        'Salário configurado': cfg?.salario || '',
        'Meta poupança': cfg?.metaPoupanca || '',
      };
    });
    const wsRes = XLSX.utils.json_to_sheet(resumo.length ? resumo : [{}]);
    XLSX.utils.book_append_sheet(wb, wsRes, 'Resumo por Mês');

    XLSX.writeFile(wb, `financas_${new Date().toISOString().slice(0,10)}.xlsx`);
  }, [data]);

  // Import from XLSX
  const importXLSX = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target?.result, { type: 'array' });

        // Parse lançamentos
        const wsLanc = wb.Sheets['Lançamentos'];
        const rawLanc: any[] = wsLanc ? XLSX.utils.sheet_to_json(wsLanc) : [];
        const lancamentos: Lancamento[] = rawLanc
          .filter(r => r.Data && r.Descrição)
          .map(r => ({
            id: r.ID || crypto.randomUUID(),
            data: String(r.Data),
            mes: String(r.Mês || String(r.Data).slice(0, 7)),
            descricao: String(r.Descrição),
            categoria: String(r.Categoria || ''),
            tipo: r.Tipo === 'Receita' ? 'receita' : r.Tipo === 'Gasto Fixo' ? 'gasto_fixo' : 'gasto_variavel',
            valor: Number(r['Valor (R$)']) || 0,
            observacao: String(r.Observação || ''),
          }));

        // Parse configurações
        const wsCfg = wb.Sheets['Configurações'];
        const rawCfg: any[] = wsCfg ? XLSX.utils.sheet_to_json(wsCfg) : [];
        const configuracoes: ConfiguracaoMes[] = rawCfg
          .filter(r => r.Mês)
          .map(r => ({
            mes: String(r.Mês),
            salario: Number(r['Salário (R$)']) || 0,
            metaPoupanca: Number(r['Meta de Poupança (R$)']) || 0,
          }));

        const newData = { lancamentos, configuracoes };
        update(newData);
        alert(`Importado com sucesso! ${lancamentos.length} lançamentos.`);
      } catch (err) {
        alert('Erro ao importar. Verifique se é uma planilha exportada por este app.');
      }
    };
    reader.readAsArrayBuffer(file);
  }, [update]);

  return { data, loaded, addLancamento, removeLancamento, setConfigMes, exportXLSX, importXLSX };
}
