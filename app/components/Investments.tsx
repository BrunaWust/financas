'use client';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Plus } from 'lucide-react';
import { investments, portfolioData, monthlyData } from '../lib/data';

const patrimonioData = monthlyData.map((m, i) => ({
  month: m.month,
  patrimonio: 45000 + (i * 2800) + Math.random() * 1000,
}));

export default function Investments() {
  const totalInvested = investments.reduce((s, i) => s + i.total, 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>Investimentos</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>Acompanhe seu portfólio em tempo real</p>
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px',
          background: 'var(--accent-blue)', color: 'white', border: 'none',
          borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer'
        }}>
          <Plus size={16} /> Adicionar ativo
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Patrimônio total', value: `R$ ${totalInvested.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`, sub: '+18.7% no ano', color: '#4f7cff', positive: true },
          { label: 'Rentabilidade mês', value: '+R$ 2.840', sub: '+4.6% este mês', color: '#00d68f', positive: true },
          { label: 'Dividendos recebidos', value: 'R$ 420', sub: 'Agosto 2026', color: '#a78bfa', positive: true },
          { label: 'Ativos na carteira', value: String(investments.length), sub: '3 classes de ativos', color: '#ffc107', positive: true },
        ].map(c => (
          <div key={c.label} style={{
            background: 'var(--bg-card)', borderRadius: 14, padding: '18px 20px', border: '1px solid var(--border)'
          }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>{c.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>{c.value}</div>
            <div style={{ fontSize: 12, color: c.positive ? 'var(--accent-green)' : 'var(--accent-red)', marginTop: 4 }}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: 24, border: '1px solid var(--border)', marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 20 }}>Evolução do patrimônio</h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={patrimonioData}>
            <XAxis dataKey="month" tick={{ fill: '#8892b0', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#8892b0', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: any) => [`R$ ${Number(v).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`, 'Patrimônio']} />
            <Line type="monotone" dataKey="patrimonio" stroke="#4f7cff" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Assets Table */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: 24, border: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 20 }}>Ativos da carteira</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Ativo', 'Quantidade', 'Preço atual', 'Preço médio', 'Total', 'Rentabilidade', 'Variação dia'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '0 12px 14px',
                    fontSize: 12, fontWeight: 600, color: 'var(--text-muted)',
                    borderBottom: '1px solid var(--border)'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {investments.map((inv, i) => (
                <tr key={inv.ticker} style={{ borderBottom: i < investments.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <td style={{ padding: '14px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 8,
                        background: 'var(--bg-card-hover)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700, color: 'var(--accent-blue)'
                      }}>{inv.ticker.slice(0,4)}</div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{inv.ticker}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{inv.name}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 12px', fontSize: 14, color: 'var(--text-secondary)' }}>{inv.qty}</td>
                  <td style={{ padding: '14px 12px', fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
                    R$ {inv.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: '14px 12px', fontSize: 14, color: 'var(--text-secondary)' }}>
                    R$ {inv.avg.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: '14px 12px', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                    R$ {inv.total.toLocaleString('pt-BR')}
                  </td>
                  <td style={{ padding: '14px 12px' }}>
                    <span style={{
                      fontSize: 13, fontWeight: 600, padding: '4px 8px', borderRadius: 6,
                      background: inv.change > 0 ? 'rgba(0, 214, 143, 0.1)' : 'rgba(255, 77, 109, 0.1)',
                      color: inv.change > 0 ? 'var(--accent-green)' : 'var(--accent-red)',
                      display: 'inline-flex', alignItems: 'center', gap: 2
                    }}>
                      {inv.change > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {inv.change > 0 ? '+' : ''}{inv.change}%
                    </span>
                  </td>
                  <td style={{ padding: '14px 12px' }}>
                    <span style={{
                      fontSize: 13, fontWeight: 600,
                      color: inv.dayChange > 0 ? 'var(--accent-green)' : 'var(--accent-red)'
                    }}>
                      {inv.dayChange > 0 ? '+' : ''}{inv.dayChange}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
