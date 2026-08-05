'use client';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Minus, AlertCircle, Settings } from 'lucide-react';
import { AppData, ConfiguracaoMes, formatBRL, formatMes, getMeses, getMesAtual } from '../lib/types';

interface Props {
  data: AppData;
  setConfigMes: (c: ConfiguracaoMes) => void;
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--border)',
      boxShadow: 'var(--shadow)', padding: '20px 22px', ...style
    }}>
      {children}
    </div>
  );
}

function KPI({ label, value, sub, color, icon: Icon }: any) {
  return (
    <div style={{
      background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--border)',
      boxShadow: 'var(--shadow)', padding: '18px 20px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>{label}</span>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: color + '18',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Icon size={15} color={color} />
        </div>
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.5px' }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default function Dashboard({ data, setConfigMes }: Props) {
  const meses = getMeses(data.lancamentos, data.configuracoes);
  const [mesSel, setMesSel] = useState(getMesAtual());
  const [editando, setEditando] = useState(false);
  const [salarioInput, setSalarioInput] = useState('');
  const [metaInput, setMetaInput] = useState('');

  const cfg = data.configuracoes.find(c => c.mes === mesSel);
  const lancMes = data.lancamentos.filter(l => l.mes === mesSel);
  const receitas = lancMes.filter(l => l.tipo === 'receita').reduce((s, l) => s + l.valor, 0);
  const fixos = lancMes.filter(l => l.tipo === 'gasto_fixo').reduce((s, l) => s + l.valor, 0);
  const variaveis = lancMes.filter(l => l.tipo === 'gasto_variavel').reduce((s, l) => s + l.valor, 0);
  const totalGastos = fixos + variaveis;
  const saldo = receitas - totalGastos;
  const salario = cfg?.salario || 0;
  const meta = cfg?.metaPoupanca || 0;

  // Chart data: últimos 6 meses
  const ultimos6 = [...meses].reverse().slice(-6);
  const barData = ultimos6.map(mes => {
    const ls = data.lancamentos.filter(l => l.mes === mes);
    return {
      mes: formatMes(mes),
      Receitas: ls.filter(l => l.tipo === 'receita').reduce((s, l) => s + l.valor, 0),
      'G. Fixos': ls.filter(l => l.tipo === 'gasto_fixo').reduce((s, l) => s + l.valor, 0),
      'G. Variáveis': ls.filter(l => l.tipo === 'gasto_variavel').reduce((s, l) => s + l.valor, 0),
    };
  });

  // Pie: gastos por categoria no mês
  const catMap: Record<string, number> = {};
  lancMes.filter(l => l.tipo !== 'receita').forEach(l => {
    catMap[l.categoria] = (catMap[l.categoria] || 0) + l.valor;
  });
  const pieData = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 7).map(([name, value]) => ({ name, value }));
  const PIE_COLORS = ['#2563eb','#16a34a','#dc2626','#d97706','#7c3aed','#0891b2','#db2777'];

  function salvarConfig() {
    setConfigMes({ mes: mesSel, salario: parseFloat(salarioInput) || 0, metaPoupanca: parseFloat(metaInput) || 0 });
    setEditando(false);
  }

  const tooltipStyle = { background: '#fff', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 };

  return (
    <div>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.4px', color: 'var(--text)' }}>Visão geral</h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 2 }}>Acompanhe suas finanças mês a mês</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <select
            value={mesSel}
            onChange={e => setMesSel(e.target.value)}
            style={{
              padding: '7px 12px', borderRadius: 8, border: '1px solid var(--border)',
              background: '#fff', fontSize: 13, color: 'var(--text)', cursor: 'pointer'
            }}
          >
            {meses.map(m => <option key={m} value={m}>{formatMes(m)}</option>)}
          </select>
          <button onClick={() => {
            setEditando(true);
            setSalarioInput(String(cfg?.salario || ''));
            setMetaInput(String(cfg?.metaPoupanca || ''));
          }} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
            borderRadius: 8, border: '1px solid var(--border)', background: '#fff',
            fontSize: 13, color: 'var(--text-2)',
          }}>
            <Settings size={14} /> Configurar mês
          </button>
        </div>
      </div>

      {/* Modal config */}
      {editando && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999
        }}>
          <div style={{
            background: '#fff', borderRadius: 16, padding: 28, width: 360,
            boxShadow: '0 20px 40px rgba(0,0,0,0.12)'
          }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Configurar {formatMes(mesSel)}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>Salário / receita esperada (R$)</label>
                <input
                  type="number" value={salarioInput} onChange={e => setSalarioInput(e.target.value)}
                  placeholder="ex: 5000"
                  style={{
                    width: '100%', padding: '9px 12px', borderRadius: 8,
                    border: '1px solid var(--border)', fontSize: 14
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 13, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>Meta de poupança (R$)</label>
                <input
                  type="number" value={metaInput} onChange={e => setMetaInput(e.target.value)}
                  placeholder="ex: 1000"
                  style={{
                    width: '100%', padding: '9px 12px', borderRadius: 8,
                    border: '1px solid var(--border)', fontSize: 14
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <button onClick={() => setEditando(false)} style={{
                  flex: 1, padding: '9px', borderRadius: 8, border: '1px solid var(--border)',
                  background: '#fff', fontSize: 14, color: 'var(--text-2)'
                }}>Cancelar</button>
                <button onClick={salvarConfig} style={{
                  flex: 1, padding: '9px', borderRadius: 8, border: 'none',
                  background: 'var(--accent)', fontSize: 14, color: '#fff', fontWeight: 600
                }}>Salvar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alerta sem config */}
      {!cfg && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
          borderRadius: 10, background: 'var(--yellow-light)', border: '1px solid #fde68a',
          marginBottom: 20, fontSize: 13, color: 'var(--yellow)'
        }}>
          <AlertCircle size={16} />
          Configure seu salário e meta para este mês clicando em "Configurar mês"
        </div>
      )}

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        <KPI label="Receitas do mês" value={formatBRL(receitas)} sub={salario ? `Salário: ${formatBRL(salario)}` : undefined} color="var(--green)" icon={TrendingUp} />
        <KPI label="Gastos fixos" value={formatBRL(fixos)} sub={`${lancMes.filter(l=>l.tipo==='gasto_fixo').length} lançamentos`} color="var(--accent)" icon={Minus} />
        <KPI label="Gastos variáveis" value={formatBRL(variaveis)} sub={`${lancMes.filter(l=>l.tipo==='gasto_variavel').length} lançamentos`} color="var(--yellow)" icon={TrendingDown} />
        <KPI
          label="Saldo do mês"
          value={formatBRL(saldo)}
          sub={meta ? `Meta poupança: ${formatBRL(meta)}` : undefined}
          color={saldo >= 0 ? 'var(--green)' : 'var(--red)'}
          icon={saldo >= 0 ? TrendingUp : TrendingDown}
        />
      </div>

      {/* Barra de saúde financeira */}
      {salario > 0 && (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>Saúde financeira do mês</span>
            <span style={{ fontSize: 13, color: 'var(--text-3)' }}>
              {formatBRL(totalGastos)} gastos de {formatBRL(salario)} disponíveis
            </span>
          </div>
          {/* Barra fixa + variável */}
          <div style={{ height: 16, borderRadius: 8, background: 'var(--bg)', overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: `${Math.min((fixos/salario)*100, 100)}%`, background: 'var(--accent)', transition: 'width 0.4s' }} />
            <div style={{ width: `${Math.min((variaveis/salario)*100, 100-(fixos/salario)*100)}%`, background: 'var(--yellow)', transition: 'width 0.4s' }} />
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
            {[
              { label: 'Fixos', val: fixos, color: 'var(--accent)' },
              { label: 'Variáveis', val: variaveis, color: 'var(--yellow)' },
              { label: 'Restante', val: Math.max(salario - totalGastos, 0), color: 'var(--green)' },
            ].map(i => (
              <div key={i.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: i.color }} />
                <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{i.label}: <b>{formatBRL(i.val)}</b></span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 16, marginBottom: 20 }}>
        <Card>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 18 }}>Comparativo mensal (últimos 6 meses)</div>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} barCategoryGap="30%">
                <XAxis dataKey="mes" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => formatBRL(Number(v))} />
                <Bar dataKey="Receitas" fill="#16a34a" radius={[4,4,0,0]} />
                <Bar dataKey="G. Fixos" fill="#2563eb" radius={[4,4,0,0]} />
                <Bar dataKey="G. Variáveis" fill="#d97706" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontSize: 14 }}>
              Nenhum dado ainda. Comece lançando seus gastos!
            </div>
          )}
        </Card>

        <Card>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 18 }}>Gastos por categoria — {formatMes(mesSel)}</div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="45%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => formatBRL(Number(v))} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontSize: 14 }}>
              Sem gastos neste mês
            </div>
          )}
        </Card>
      </div>

      {/* Top gastos */}
      {pieData.length > 0 && (
        <Card>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Top categorias — {formatMes(mesSel)}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Object.entries(catMap).sort((a,b) => b[1]-a[1]).map(([cat, val], i) => (
              <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, color: 'var(--text-3)', width: 20, textAlign: 'right' }}>{i+1}</span>
                <span style={{ fontSize: 14, flex: 1, color: 'var(--text)' }}>{cat}</span>
                <div style={{ flex: 2, height: 6, background: 'var(--bg)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 3,
                    width: `${(val / Math.max(...Object.values(catMap))) * 100}%`,
                    background: PIE_COLORS[i % PIE_COLORS.length]
                  }} />
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, width: 90, textAlign: 'right', color: 'var(--text)' }}>{formatBRL(val)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
