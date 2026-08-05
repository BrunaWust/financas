'use client';
import { useState } from 'react';
import { Search, Filter, Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { transactions } from '../lib/data';

const categories = ['Todos', 'Receita', 'Alimentação', 'Moradia', 'Transporte', 'Investimento', 'Assinaturas', 'Saúde', 'Compras'];

export default function Transactions() {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('Todos');

  const filtered = transactions.filter(tx => {
    const matchSearch = tx.desc.toLowerCase().includes(search.toLowerCase()) || tx.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'Todos' || tx.category === catFilter;
    return matchSearch && matchCat;
  });

  const totalIn = transactions.filter(t => t.amount > 0 && t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalOut = transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>Transações</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>Histórico completo de movimentações</p>
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px',
          background: 'var(--accent-blue)', color: 'white', border: 'none',
          borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer'
        }}>
          <Plus size={16} /> Nova transação
        </button>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total de entradas', value: `R$ ${totalIn.toLocaleString('pt-BR')}`, color: '#00d68f', bg: 'rgba(0,214,143,0.1)' },
          { label: 'Total de saídas', value: `R$ ${totalOut.toLocaleString('pt-BR')}`, color: '#ff4d6d', bg: 'rgba(255,77,109,0.1)' },
          { label: 'Saldo do período', value: `R$ ${(totalIn - totalOut).toLocaleString('pt-BR')}`, color: '#4f7cff', bg: 'rgba(79,124,255,0.1)' },
        ].map(c => (
          <div key={c.label} style={{
            background: 'var(--bg-card)', borderRadius: 14, padding: '18px 20px', border: '1px solid var(--border)'
          }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>{c.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: c.color, letterSpacing: '-0.5px' }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: 24, border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--bg-card-hover)', borderRadius: 10, padding: '8px 14px',
            border: '1px solid var(--border)', flex: 1, maxWidth: 280
          }}>
            <Search size={16} color="var(--text-muted)" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar transação..."
              style={{
                background: 'none', border: 'none', outline: 'none',
                color: 'var(--text-primary)', fontSize: 14, flex: 1
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button key={cat} onClick={() => setCatFilter(cat)} style={{
                padding: '7px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500,
                cursor: 'pointer', transition: 'all 0.15s',
                background: catFilter === cat ? 'var(--accent-blue)' : 'var(--bg-card-hover)',
                color: catFilter === cat ? 'white' : 'var(--text-secondary)',
                border: catFilter === cat ? 'none' : '1px solid var(--border)',
              }}>{cat}</button>
            ))}
          </div>
        </div>

        {/* Transactions list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(tx => (
            <div key={tx.id} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px',
              borderRadius: 10, border: '1px solid var(--border)',
              background: 'rgba(255,255,255,0.02)',
              transition: 'background 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)'}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.02)'}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: 'var(--bg-card-hover)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
              }}>{tx.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{tx.desc}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{tx.category}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontSize: 15, fontWeight: 700,
                  color: tx.amount > 0 ? 'var(--accent-green)' : tx.type === 'investment' ? 'var(--accent-purple)' : 'var(--accent-red)'
                }}>
                  {tx.amount > 0 ? '+' : ''}R$ {Math.abs(tx.amount).toLocaleString('pt-BR')}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{tx.date}</div>
              </div>
              <div style={{
                padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                background: tx.type === 'income' ? 'rgba(0,214,143,0.1)' : tx.type === 'investment' ? 'rgba(167,139,250,0.1)' : 'rgba(255,77,109,0.1)',
                color: tx.type === 'income' ? 'var(--accent-green)' : tx.type === 'investment' ? 'var(--accent-purple)' : 'var(--accent-red)',
                display: 'flex', alignItems: 'center', gap: 4, marginLeft: 8
              }}>
                {tx.type === 'income' ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                {tx.type === 'income' ? 'Entrada' : tx.type === 'investment' ? 'Investimento' : 'Saída'}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: 14 }}>
              Nenhuma transação encontrada
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
