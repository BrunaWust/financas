'use client';
import { budgets } from '../lib/data';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Budgets() {
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const totalLimit = budgets.reduce((s, b) => s + b.limit, 0);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>Orçamentos</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>Controle seus gastos por categoria</p>
      </div>

      {/* Summary */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: 24, border: '1px solid var(--border)', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Gasto total do mês</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
              R$ {totalSpent.toLocaleString('pt-BR')}
              <span style={{ fontSize: 16, color: 'var(--text-muted)', fontWeight: 400 }}> / R$ {totalLimit.toLocaleString('pt-BR')}</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Utilizado</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: totalSpent / totalLimit > 0.85 ? 'var(--accent-red)' : 'var(--accent-green)' }}>
              {((totalSpent / totalLimit) * 100).toFixed(1)}%
            </div>
          </div>
        </div>
        <div style={{ height: 8, borderRadius: 4, background: 'var(--bg-card-hover)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 4,
            width: `${(totalSpent / totalLimit) * 100}%`,
            background: 'linear-gradient(90deg, #4f7cff, #00d68f)',
            transition: 'width 0.5s ease'
          }} />
        </div>
      </div>

      {/* Budget cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 24 }}>
        {budgets.map(budget => {
          const pct = (budget.spent / budget.limit) * 100;
          const over = pct >= 100;
          const warning = pct >= 85;
          const barColor = over ? '#ff4d6d' : warning ? '#ffc107' : budget.color;
          return (
            <div key={budget.category} style={{
              background: 'var(--bg-card)', borderRadius: 16, padding: '20px 22px',
              border: `1px solid ${over ? 'rgba(255,77,109,0.3)' : 'var(--border)'}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 22 }}>{budget.icon}</span>
                  <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{budget.category}</span>
                </div>
                {over && (
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                    background: 'rgba(255,77,109,0.15)', color: 'var(--accent-red)'
                  }}>Estourado</span>
                )}
                {warning && !over && (
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                    background: 'rgba(255,193,7,0.15)', color: 'var(--accent-yellow)'
                  }}>Atenção</span>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
                  R$ {budget.spent.toLocaleString('pt-BR')}
                </span>
                <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                  / R$ {budget.limit.toLocaleString('pt-BR')}
                </span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'var(--bg-card-hover)', overflow: 'hidden', marginBottom: 8 }}>
                <div style={{
                  height: '100%', borderRadius: 3,
                  width: `${Math.min(pct, 100)}%`,
                  background: barColor, transition: 'width 0.5s ease'
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Restam R$ {Math.max(budget.limit - budget.spent, 0).toLocaleString('pt-BR')}
                </span>
                <span style={{ fontSize: 12, fontWeight: 600, color: over ? 'var(--accent-red)' : warning ? 'var(--accent-yellow)' : 'var(--accent-green)' }}>
                  {pct.toFixed(0)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bar chart */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: 24, border: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 20 }}>Gasto vs limite por categoria</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={budgets} barCategoryGap="30%">
            <XAxis dataKey="category" tick={{ fill: '#8892b0', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#8892b0', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v/1000}k`} />
            <Tooltip formatter={(v: any, name: any) => [`R$ ${Number(v).toLocaleString('pt-BR')}`, name === 'spent' ? 'Gasto' : 'Limite']} />
            <Bar dataKey="limit" fill="rgba(79,124,255,0.15)" radius={[4, 4, 0, 0]} name="Limite" />
            <Bar dataKey="spent" radius={[4, 4, 0, 0]} name="Gasto">
              {budgets.map((entry, index) => {
                const pct = entry.spent / entry.limit;
                return <Cell key={index} fill={pct >= 1 ? '#ff4d6d' : pct >= 0.85 ? '#ffc107' : '#4f7cff'} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
