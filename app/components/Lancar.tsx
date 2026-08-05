'use client';
import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import {
  Lancamento, TipoLancamento,
  CATEGORIAS_FIXAS, CATEGORIAS_VARIAVEIS, CATEGORIAS_RECEITA,
  getMesAtual
} from '../lib/types';

interface Props {
  onAdd: (l: Omit<Lancamento, 'id' | 'mes'>) => void;
}

const TIPOS: { id: TipoLancamento; label: string; color: string; bg: string }[] = [
  { id: 'receita', label: '💰 Receita', color: 'var(--green)', bg: 'var(--green-light)' },
  { id: 'gasto_fixo', label: '📌 Gasto fixo', color: 'var(--accent)', bg: 'var(--accent-light)' },
  { id: 'gasto_variavel', label: '🛒 Gasto variável', color: 'var(--yellow)', bg: 'var(--yellow-light)' },
];

export default function Lancar({ onAdd }: Props) {
  const hoje = new Date().toISOString().slice(0, 10);
  const [tipo, setTipo] = useState<TipoLancamento>('gasto_variavel');
  const [data, setData] = useState(hoje);
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('');
  const [valor, setValor] = useState('');
  const [obs, setObs] = useState('');
  const [sucesso, setSucesso] = useState(false);

  const categorias = tipo === 'receita' ? CATEGORIAS_RECEITA : tipo === 'gasto_fixo' ? CATEGORIAS_FIXAS : CATEGORIAS_VARIAVEIS;
  const tipoInfo = TIPOS.find(t => t.id === tipo)!;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!descricao || !valor || !categoria) return;
    onAdd({ tipo, data, descricao, categoria, valor: parseFloat(valor), observacao: obs });
    setDescricao(''); setValor(''); setObs(''); setCategoria('');
    setSucesso(true);
    setTimeout(() => setSucesso(false), 2500);
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 13px', borderRadius: 9,
    border: '1px solid var(--border)', fontSize: 14, color: 'var(--text)',
    background: '#fff', transition: 'border 0.15s',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 13, fontWeight: 500, color: 'var(--text-2)', display: 'block', marginBottom: 6
  };

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.4px', color: 'var(--text)' }}>Lançar</h1>
        <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 2 }}>Registre uma receita ou gasto</p>
      </div>

      {/* Tipo selector */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
        {TIPOS.map(t => (
          <button key={t.id} onClick={() => { setTipo(t.id); setCategoria(''); }} style={{
            flex: 1, padding: '12px 8px', borderRadius: 10, fontSize: 14, fontWeight: 600,
            border: tipo === t.id ? `2px solid ${t.color}` : '1px solid var(--border)',
            background: tipo === t.id ? t.bg : '#fff',
            color: tipo === t.id ? t.color : 'var(--text-3)',
            cursor: 'pointer', transition: 'all 0.15s',
          }}>{t.label}</button>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={{
        background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--border)',
        boxShadow: 'var(--shadow)', padding: '24px'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          {/* Data */}
          <div>
            <label style={labelStyle}>Data</label>
            <input type="date" value={data} onChange={e => setData(e.target.value)}
              style={inputStyle} required />
          </div>
          {/* Valor */}
          <div>
            <label style={labelStyle}>Valor (R$)</label>
            <input
              type="number" step="0.01" min="0" value={valor}
              onChange={e => setValor(e.target.value)}
              placeholder="0,00"
              style={{ ...inputStyle, fontWeight: 700, fontSize: 16 }}
              required
            />
          </div>
        </div>

        {/* Descrição */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Descrição</label>
          <input type="text" value={descricao} onChange={e => setDescricao(e.target.value)}
            placeholder={tipo === 'receita' ? 'ex: Salário maio, freelance site...' : 'ex: Mercado, conta de luz...'}
            style={inputStyle} required />
        </div>

        {/* Categoria */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Categoria</label>
          <select value={categoria} onChange={e => setCategoria(e.target.value)}
            style={{ ...inputStyle, cursor: 'pointer' }} required>
            <option value="">Selecione...</option>
            {categorias.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Observação */}
        <div style={{ marginBottom: 22 }}>
          <label style={labelStyle}>Observação <span style={{ fontWeight: 400, color: 'var(--text-3)' }}>(opcional)</span></label>
          <input type="text" value={obs} onChange={e => setObs(e.target.value)}
            placeholder="Detalhe extra..."
            style={inputStyle} />
        </div>

        <button type="submit" style={{
          width: '100%', padding: '12px', borderRadius: 9, border: 'none',
          background: tipoInfo.color, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
          transition: 'opacity 0.15s',
        }}>
          {tipo === 'receita' ? 'Registrar receita' : 'Registrar gasto'}
        </button>

        {sucesso && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            marginTop: 16, padding: '10px 14px', borderRadius: 9,
            background: 'var(--green-light)', border: '1px solid #bbf7d0',
            color: 'var(--green)', fontSize: 14, fontWeight: 500
          }}>
            <CheckCircle size={16} /> Lançamento salvo com sucesso!
          </div>
        )}
      </form>

      {/* Dicas */}
      <div style={{
        marginTop: 20, padding: '16px 18px', borderRadius: 'var(--radius)',
        background: 'var(--accent-light)', border: '1px solid #bfdbfe', fontSize: 13
      }}>
        <div style={{ fontWeight: 600, color: 'var(--accent)', marginBottom: 8 }}>💡 Dicas</div>
        <div style={{ color: 'var(--text-2)', lineHeight: 1.7 }}>
          <b>Gasto fixo</b> = valor que não muda: aluguel, escola, plano de saúde.<br />
          <b>Gasto variável</b> = dia a dia: mercado, restaurante, gasolina, lazer.<br />
          Exporte em .xlsx quando quiser fazer backup dos dados.
        </div>
      </div>
    </div>
  );
}
