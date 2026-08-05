'use client';
import { useState } from 'react';
import { Trash2, Search } from 'lucide-react';
import { AppData, formatBRL, formatMes, getMeses, getMesAtual } from '../lib/types';

interface Props {
  data: AppData;
  onRemove: (id: string) => void;
}

const TIPO_LABEL: Record<string, string> = {
  receita: 'Receita',
  gasto_fixo: 'Fixo',
  gasto_variavel: 'Variável',
};
const TIPO_COLOR: Record<string, string> = {
  receita: 'var(--green)',
  gasto_fixo: 'var(--accent)',
  gasto_variavel: 'var(--yellow)',
};
const TIPO_BG: Record<string, string> = {
  receita: 'var(--green-light)',
  gasto_fixo: 'var(--accent-light)',
  gasto_variavel: 'var(--yellow-light)',
};

export default function Historico({ data, onRemove }: Props) {
  const meses = getMeses(data.lancamentos, data.configuracoes);
  const [mesSel, setMesSel] = useState(getMesAtual());
  const [search, setSearch] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('todos');
  const [confirmaId, setConfirmaId] = useState<string | null>(null);

  const lancMes = data.lancamentos
    .filter(l => l.mes === mesSel)
    .filter(l => tipoFiltro === 'todos' || l.tipo === tipoFiltro)
    .filter(l => l.descricao.toLowerCase().includes(search.toLowerCase()) || l.categoria.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.data.localeCompare(a.data));

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.4px', color: 'var(--text)' }}>Histórico</h1>
        <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 2 }}>Todos os seus lançamentos</p>
      </div>

      {/* Filtros */}
      <div style={{
        background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--border)',
        boxShadow: 'var(--shadow)', padding: '16px 18px', marginBottom: 16,
        display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap'
      }}>
        <select value={mesSel} onChange={e => setMesSel(e.target.value)} style={{
          padding: '7px 12px', borderRadius: 8, border: '1px solid var(--border)',
          fontSize: 13, background: '#fff', color: 'var(--text)', cursor: 'pointer'
        }}>
          {meses.map(m => <option key={m} value={m}>{formatMes(m)}</option>)}
        </select>

        <div style={{ display: 'flex', gap: 6 }}>
          {[['todos','Todos'],['receita','Receitas'],['gasto_fixo','Fixos'],['gasto_variavel','Variáveis']].map(([id, label]) => (
            <button key={id} onClick={() => setTipoFiltro(id)} style={{
              padding: '6px 12px', borderRadius: 20, fontSize: 13, fontWeight: 500,
              border: tipoFiltro === id ? 'none' : '1px solid var(--border)',
              background: tipoFiltro === id ? 'var(--accent)' : '#fff',
              color: tipoFiltro === id ? '#fff' : 'var(--text-2)', cursor: 'pointer',
            }}>{label}</button>
          ))}
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 180,
          padding: '7px 12px', borderRadius: 8, border: '1px solid var(--border)',
          background: 'var(--bg)'
        }}>
          <Search size={14} color="var(--text-3)" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar..."
            style={{ background: 'none', border: 'none', fontSize: 13, color: 'var(--text)', flex: 1 }} />
        </div>
      </div>

      {/* Lista */}
      <div style={{
        background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--border)',
        boxShadow: 'var(--shadow)', overflow: 'hidden'
      }}>
        {lancMes.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-3)', fontSize: 14 }}>
            Nenhum lançamento encontrado para este período.
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '90px 1fr 140px 100px 90px 40px',
              padding: '10px 16px', borderBottom: '1px solid var(--border)',
              fontSize: 12, fontWeight: 600, color: 'var(--text-3)'
            }}>
              <span>Data</span><span>Descrição</span><span>Categoria</span><span>Tipo</span><span style={{ textAlign: 'right' }}>Valor</span><span />
            </div>

            {lancMes.map((l, i) => (
              <div key={l.id}>
                {confirmaId === l.id && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 16px', background: 'var(--red-light)',
                    borderBottom: '1px solid #fecaca', fontSize: 13
                  }}>
                    <span style={{ flex: 1, color: 'var(--red)' }}>Remover "{l.descricao}"?</span>
                    <button onClick={() => { onRemove(l.id); setConfirmaId(null); }} style={{
                      padding: '5px 14px', borderRadius: 7, border: 'none',
                      background: 'var(--red)', color: '#fff', fontSize: 13, fontWeight: 600
                    }}>Confirmar</button>
                    <button onClick={() => setConfirmaId(null)} style={{
                      padding: '5px 14px', borderRadius: 7, border: '1px solid var(--border)',
                      background: '#fff', fontSize: 13
                    }}>Cancelar</button>
                  </div>
                )}
                <div style={{
                  display: 'grid', gridTemplateColumns: '90px 1fr 140px 100px 90px 40px',
                  padding: '12px 16px', alignItems: 'center',
                  borderBottom: i < lancMes.length - 1 ? '1px solid var(--border)' : 'none',
                  background: confirmaId === l.id ? 'var(--red-light)' : 'transparent',
                  transition: 'background 0.1s',
                }}>
                  <span style={{ fontSize: 13, color: 'var(--text-3)' }}>
                    {l.data.slice(8)}/{l.data.slice(5,7)}
                  </span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{l.descricao}</div>
                    {l.observacao && <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 1 }}>{l.observacao}</div>}
                  </div>
                  <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{l.categoria}</span>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', padding: '3px 9px',
                    borderRadius: 20, fontSize: 11, fontWeight: 600,
                    background: TIPO_BG[l.tipo], color: TIPO_COLOR[l.tipo]
                  }}>{TIPO_LABEL[l.tipo]}</span>
                  <span style={{
                    fontSize: 14, fontWeight: 700, textAlign: 'right',
                    color: l.tipo === 'receita' ? 'var(--green)' : 'var(--text)'
                  }}>
                    {l.tipo === 'receita' ? '+' : '-'}{formatBRL(l.valor)}
                  </span>
                  <button onClick={() => setConfirmaId(confirmaId === l.id ? null : l.id)} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 30, height: 30, borderRadius: 7, border: '1px solid var(--border)',
                    background: '#fff', cursor: 'pointer', marginLeft: 'auto'
                  }}>
                    <Trash2 size={13} color="var(--text-3)" />
                  </button>
                </div>
              </div>
            ))}

            {/* Totais rodapé */}
            <div style={{
              display: 'flex', justifyContent: 'flex-end', gap: 24,
              padding: '12px 16px', borderTop: '2px solid var(--border)',
              background: 'var(--bg)', fontSize: 13
            }}>
              {[
                { label: 'Receitas', val: lancMes.filter(l=>l.tipo==='receita').reduce((s,l)=>s+l.valor,0), color: 'var(--green)' },
                { label: 'Gastos', val: lancMes.filter(l=>l.tipo!=='receita').reduce((s,l)=>s+l.valor,0), color: 'var(--red)' },
              ].map(t => (
                <div key={t.label} style={{ display: 'flex', gap: 8 }}>
                  <span style={{ color: 'var(--text-3)' }}>{t.label}:</span>
                  <span style={{ fontWeight: 700, color: t.color }}>{formatBRL(t.val)}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
