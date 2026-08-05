'use client';
import { useState, useEffect } from 'react';
import {
  type Transaction, type TransactionType, type ExpenseKind, type PaymentMethod,
  PAYMENT_METHODS, categoriesForType, generateId,
} from '../lib/finance';

interface Props {
  open: boolean;
  initial?: Transaction | null;
  onSave: (t: Transaction) => void;
  onClose: () => void;
}

function emptyForm(): Omit<Transaction, 'id'> {
  return {
    date: new Date().toISOString().slice(0,10),
    description: '', type: 'despesa', expenseKind: 'variavel',
    category: 'Outros (variável)', amount: 0,
    paymentMethod: 'PIX', notes: '',
  };
}

export default function TransactionModal({ open, initial, onSave, onClose }: Props) {
  const [form, setForm] = useState(emptyForm());

  useEffect(() => {
    setForm(initial ? { ...initial } : emptyForm());
  }, [initial, open]);

  function setType(type: TransactionType) {
    const kind: ExpenseKind | undefined = type === 'despesa' ? 'variavel' : undefined;
    const cats = categoriesForType(type, kind);
    setForm(f => ({ ...f, type, expenseKind: kind, category: cats[0] }));
  }

  function setKind(expenseKind: ExpenseKind) {
    const cats = categoriesForType('despesa', expenseKind);
    setForm(f => ({ ...f, expenseKind, category: cats[0] }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.description.trim() || form.amount <= 0) return;
    onSave({ ...form, id: initial?.id ?? generateId(), amount: Number(form.amount) });
  }

  if (!open) return null;

  const cats = categoriesForType(form.type, form.expenseKind);

  const TYPE_OPTIONS: { value: TransactionType; label: string; color: string; bg: string }[] = [
    { value: 'receita',      label: '↑ Receita',      color: '#16a34a', bg: '#f0fdf4' },
    { value: 'despesa',      label: '↓ Despesa',      color: '#dc2626', bg: '#fef2f2' },
    { value: 'investimento', label: '📈 Invest.',      color: '#7c3aed', bg: '#f5f3ff' },
  ];

  return (
    <div onClick={e => { if(e.target === e.currentTarget) onClose(); }} style={{
      position:'fixed', inset:0, zIndex:50, background:'rgba(15,23,42,0.45)',
      display:'flex', alignItems:'flex-end', justifyContent:'center',
    }}>
      <div style={{
        background:'#fff', borderRadius:'20px 20px 0 0',
        padding:'1.25rem 1.25rem 2rem', width:'100%', maxWidth:520,
        maxHeight:'94vh', overflowY:'auto',
      }}>
        <div style={{ width:40, height:4, background:'#e2e8f0', borderRadius:99, margin:'0 auto 1.1rem' }} />

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
          <h2 style={{ margin:0, fontSize:16, fontWeight:800, color:'#1e293b' }}>
            {initial ? 'Editar' : 'Nova transação'}
          </h2>
          <button onClick={onClose} style={{
            background:'#f1f5f9', border:'none', cursor:'pointer',
            color:'#64748b', width:30, height:30, borderRadius:'50%', fontSize:15,
          }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'0.85rem' }}>
          {/* Type */}
          <div style={{ display:'flex', gap:6, background:'#f8fafc', padding:4, borderRadius:10 }}>
            {TYPE_OPTIONS.map(o => (
              <button key={o.value} type="button" onClick={() => setType(o.value)} style={{
                flex:1, padding:'0.5rem 0', borderRadius:8, border:'none', cursor:'pointer',
                fontWeight:700, fontSize:13,
                background: form.type === o.value ? o.color : 'transparent',
                color: form.type === o.value ? '#fff' : '#94a3b8',
              }}>{o.label}</button>
            ))}
          </div>

          {/* Expense kind (fixed / variable) */}
          {form.type === 'despesa' && (
            <div style={{ display:'flex', gap:6 }}>
              {([['fixo','🔒 Fixo'],['variavel','🎲 Variável']] as [ExpenseKind, string][]).map(([k,l]) => (
                <button key={k} type="button" onClick={() => setKind(k)} style={{
                  flex:1, padding:'0.5rem', borderRadius:8, border:'1.5px solid',
                  cursor:'pointer', fontWeight:700, fontSize:13,
                  borderColor: form.expenseKind === k ? '#2563eb' : '#e2e8f0',
                  background: form.expenseKind === k ? '#eff6ff' : '#f8fafc',
                  color: form.expenseKind === k ? '#2563eb' : '#94a3b8',
                }}>{l}</button>
              ))}
            </div>
          )}

          {/* Date + Amount */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div>
              <label style={L}>Data</label>
              <input type="date" value={form.date} required style={I}
                onChange={e => setForm(f => ({...f, date: e.target.value}))} />
            </div>
            <div>
              <label style={L}>Valor (R$)</label>
              <input type="number" min="0.01" step="0.01" placeholder="0,00"
                value={form.amount || ''} required style={I}
                onChange={e => setForm(f => ({...f, amount: parseFloat(e.target.value)}))} />
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={L}>Descrição</label>
            <input type="text" placeholder="Ex: Aluguel, Supermercado..." required style={I}
              value={form.description}
              onChange={e => setForm(f => ({...f, description: e.target.value}))} />
          </div>

          {/* Category + Payment */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div>
              <label style={L}>Categoria</label>
              <select value={form.category} style={I}
                onChange={e => setForm(f => ({...f, category: e.target.value as Transaction['category']}))}>
                {cats.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={L}>Pagamento</label>
              <select value={form.paymentMethod} style={I}
                onChange={e => setForm(f => ({...f, paymentMethod: e.target.value as PaymentMethod}))}>
                {PAYMENT_METHODS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label style={L}>Observações (opcional)</label>
            <input type="text" placeholder="Nota adicional..." style={I}
              value={form.notes ?? ''}
              onChange={e => setForm(f => ({...f, notes: e.target.value}))} />
          </div>

          <div style={{ display:'flex', gap:8, marginTop:4 }}>
            <button type="button" onClick={onClose} style={{
              flex:1, padding:'0.8rem', borderRadius:10,
              border:'1.5px solid #e2e8f0', background:'#f8fafc',
              color:'#64748b', fontWeight:700, cursor:'pointer', fontSize:14,
            }}>Cancelar</button>
            <button type="submit" style={{
              flex:2, padding:'0.8rem', borderRadius:10,
              border:'none', background:'#2563eb',
              color:'#fff', fontWeight:800, cursor:'pointer', fontSize:14,
            }}>{initial ? 'Salvar' : 'Adicionar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const L: React.CSSProperties = {
  display:'block', fontSize:11, fontWeight:700, color:'#64748b',
  marginBottom:4, textTransform:'uppercase', letterSpacing:'0.05em',
};
const I: React.CSSProperties = {
  width:'100%', padding:'0.6rem 0.75rem', borderRadius:8,
  border:'1.5px solid #e2e8f0', fontSize:14, color:'#1e293b',
  background:'#f8fafc', outline:'none', boxSizing:'border-box',
};
