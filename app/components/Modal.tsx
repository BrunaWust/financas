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

function blank(): Omit<Transaction, 'id'> {
  return {
    date: new Date().toISOString().slice(0, 10),
    description: '', type: 'despesa', expenseKind: 'variavel',
    category: 'Outros (variável)', amount: 0, paymentMethod: 'PIX', notes: '',
  };
}

export default function Modal({ open, initial, onSave, onClose }: Props) {
  const [form, setForm] = useState(blank());

  useEffect(() => { setForm(initial ? { ...initial } : blank()); }, [initial, open]);

  function setType(type: TransactionType) {
    const kind: ExpenseKind | undefined = type === 'despesa' ? 'variavel' : undefined;
    setForm(f => ({ ...f, type, expenseKind: kind, category: categoriesForType(type, kind)[0] }));
  }

  function setKind(k: ExpenseKind) {
    setForm(f => ({ ...f, expenseKind: k, category: categoriesForType('despesa', k)[0] }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.description.trim() || form.amount <= 0) return;
    onSave({ ...form, id: initial?.id ?? generateId(), amount: Number(form.amount) });
  }

  if (!open) return null;

  const cats = categoriesForType(form.type, form.expenseKind);

  const types: { v: TransactionType; label: string; accent: string }[] = [
    { v: 'receita',       label: 'Receita',      accent: '#16A34A' },
    { v: 'despesa',       label: 'Despesa',       accent: '#EF4444' },
    { v: 'investimento',  label: 'Investimento',  accent: '#6366F1' },
  ];

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(15,23,42,0.3)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
    >
      <div style={{
        background: '#fff', width: '100%', maxWidth: 480,
        borderRadius: '24px 24px 0 0',
        padding: '0 1.5rem 2.5rem',
        maxHeight: '96vh', overflowY: 'auto',
        animation: 'slideUp 0.22s ease',
      }}>
        <style>{`@keyframes slideUp { from { transform: translateY(40px); opacity:0; } to { transform: translateY(0); opacity:1; } }`}</style>

        {/* Handle */}
        <div style={{ width: 36, height: 4, background: '#E2E8F0', borderRadius: 99, margin: '14px auto 20px' }} />

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>
            {initial ? 'Editar' : 'Nova transação'}
          </h2>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: '50%', border: 'none',
            background: '#F1F5F9', cursor: 'pointer', fontSize: 16, color: '#64748B',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Type selector */}
          <div style={{ display: 'flex', gap: 8 }}>
            {types.map(t => (
              <button key={t.v} type="button" onClick={() => setType(t.v)} style={{
                flex: 1, padding: '10px 0', borderRadius: 12, border: '2px solid',
                cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.15s',
                borderColor: form.type === t.v ? t.accent : '#F1F5F9',
                background: form.type === t.v ? t.accent : '#F8FAFC',
                color: form.type === t.v ? '#fff' : '#94A3B8',
              }}>{t.label}</button>
            ))}
          </div>

          {/* Fixed / Variable for despesa */}
          {form.type === 'despesa' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {([['fixo', 'Gasto Fixo'], ['variavel', 'Gasto Variável']] as [ExpenseKind, string][]).map(([k, l]) => (
                <button key={k} type="button" onClick={() => setKind(k)} style={{
                  padding: '9px', borderRadius: 10, border: '1.5px solid',
                  cursor: 'pointer', fontSize: 13, fontWeight: 600,
                  borderColor: form.expenseKind === k ? '#0F172A' : '#E2E8F0',
                  background: form.expenseKind === k ? '#0F172A' : '#F8FAFC',
                  color: form.expenseKind === k ? '#fff' : '#94A3B8',
                }}>{l}</button>
              ))}
            </div>
          )}

          {/* Amount — big and prominent */}
          <div>
            <label style={lbl}>Valor</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 18, fontWeight: 700, color: '#94A3B8' }}>R$</span>
              <input
                type="number" min="0.01" step="0.01" placeholder="0,00" required
                value={form.amount || ''} onChange={e => setForm(f => ({ ...f, amount: parseFloat(e.target.value) }))}
                style={{ ...inp, paddingLeft: 52, fontSize: 22, fontWeight: 700, height: 56 }}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={lbl}>Descrição</label>
            <input type="text" placeholder="Ex: Aluguel, Supermercado, Salário..." required
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              style={inp} />
          </div>

          {/* Date + Category */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={lbl}>Data</label>
              <input type="date" required value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={inp} />
            </div>
            <div>
              <label style={lbl}>Categoria</label>
              <select value={form.category} style={inp}
                onChange={e => setForm(f => ({ ...f, category: e.target.value as Transaction['category'] }))}>
                {cats.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Payment */}
          <div>
            <label style={lbl}>Forma de pagamento</label>
            <select value={form.paymentMethod} style={inp}
              onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value as PaymentMethod }))}>
              {PAYMENT_METHODS.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label style={lbl}>Observação <span style={{ color: '#CBD5E1', fontWeight: 400 }}>(opcional)</span></label>
            <input type="text" placeholder="Nota adicional..."
              value={form.notes ?? ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={inp} />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button type="button" onClick={onClose} style={{
              flex: 1, padding: '14px', borderRadius: 12, border: '1.5px solid #E2E8F0',
              background: '#F8FAFC', color: '#64748B', fontWeight: 600, fontSize: 15, cursor: 'pointer',
            }}>Cancelar</button>
            <button type="submit" style={{
              flex: 2, padding: '14px', borderRadius: 12, border: 'none',
              background: '#0F172A', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer',
            }}>{initial ? 'Salvar' : 'Adicionar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const lbl: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 600, color: '#94A3B8',
  letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6,
};
const inp: React.CSSProperties = {
  width: '100%', padding: '12px 14px', borderRadius: 10,
  border: '1.5px solid #E2E8F0', fontSize: 15, color: '#0F172A',
  background: '#F8FAFC', outline: 'none',
};
