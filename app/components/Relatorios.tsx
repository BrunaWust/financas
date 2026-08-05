'use client';
import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { AppData, formatBRL, formatMes, getMeses, getMesAtual } from '../lib/types';

interface Props { data: AppData; }

export default function Relatorios({ data }: Props) {
  const meses = getMeses(data.lancamentos, data.configuracoes);
  const [mesSel, setMesSel] = useState(getMesAtual());

  // Evolução mensal (todos os meses)
  const evolucao = [...meses].reverse().map(mes => {
    const ls = data.lancamentos.filter(l => l.mes === mes);
    const cfg = data.configuracoes.find(c => c.mes === mes);
    const receitas = ls.filter(l => l.tipo === 'receita').reduce((s, l) => s + l.valor, 0);
    const fixos = ls.filter(l => l.tipo === 'gasto_fixo').reduce((s, l) => s + l.valor, 0);
    const variaveis = ls.filter(l => l.tipo === 'gasto_variavel').reduce((s, l) => s + l.valor, 0);
    return {
      mes: formatMes(mes),
      Receitas: receitas,
      Fixos: fixos,
      Variáveis: variaveis,
      Saldo: receitas - fixos - variaveis,
      salario: cfg?.salario || 0,
    };
  });

  // Por categoria no mês selecionado
  const lancMes = data.lancamentos.filter(l => l.mes === mesSel && l.tipo !== 'receita');
  const porCategoria: Record<string, { fixo: number; variavel: number }> = {};
  lancMes.forEach(l => {
    if (!porCategoria[l.categoria]) porCategoria[l.categoria] = { fixo: 0, variavel: 0 };
    if (l.tipo === 'gasto_fixo') porCategoria[l.categoria].fixo += l.valor;
    else porCategoria[l.categoria].variavel += l.valor;
  });
  const catData = Object.entries(porCategoria)
    .map(([cat, v]) => ({ cat, Fixo: v.fixo, Variável: v.variavel, total: v.fixo + v.variavel }))
    .sort((a, b) => b.total - a.total);

  const tooltip = { background: '#fff', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.4px', color: 'var(--text)' }}>Relatórios</h1>
        <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 2 }}>Análise detalhada das suas finanças</p>
      </div>

      {/* Evolução mensal */}
      <div style={{
        background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--border)',
        boxShadow: 'var(--shadow)', padding: '22px', marginBottom: 20
      }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Evolução — todos os meses</h2>
        <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 20 }}>Receitas, gastos e saldo acumulado</p>
        {evolucao.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={evolucao}>
              <defs>
                {[['g','#16a34a'],['r','#dc2626'],['s','#2563eb']].map(([id,c]) => (
                  <linearGradient key={id} id={`g${id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={c} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={c} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <XAxis dataKey="mes" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={tooltip} formatter={(v: any) => formatBRL(Number(v))} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="Receitas" stroke="#16a34a" fill="url(#gg)" strokeWidth={2} />
              <Area type="monotone" dataKey="Fixos" stroke="#2563eb" fill="url(#gs)" strokeWidth={2} />
              <Area type="monotone" dataKey="Variáveis" stroke="#d97706" fill="url(#gr)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontSize: 14 }}>
            Sem dados ainda. Comece lançando suas receitas e gastos!
          </div>
        )}
      </div>

      {/* Saldo mês a mês */}
      {evolucao.length > 0 && (
        <div style={{
          background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--border)',
          boxShadow: 'var(--shadow)', padding: '22px', marginBottom: 20
        }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Saldo mensal</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={evolucao}>
              <XAxis dataKey="mes" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={tooltip} formatter={(v: any) => formatBRL(Number(v))} />
              <Bar dataKey="Saldo" radius={[4,4,0,0]}>
                {evolucao.map((e, i) => (
                  <rect key={i} fill={e.Saldo >= 0 ? '#16a34a' : '#dc2626'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Gastos por categoria */}
      <div style={{
        background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--border)',
        boxShadow: 'var(--shadow)', padding: '22px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600 }}>Gastos por categoria</h2>
          <select value={mesSel} onChange={e => setMesSel(e.target.value)} style={{
            padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)',
            fontSize: 13, background: '#fff', cursor: 'pointer'
          }}>
            {meses.map(m => <option key={m} value={m}>{formatMes(m)}</option>)}
          </select>
        </div>

        {catData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={catData} layout="vertical" barCategoryGap="25%">
                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(1)}k`} />
                <YAxis type="category" dataKey="cat" tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} width={140} />
                <Tooltip contentStyle={tooltip} formatter={(v: any) => formatBRL(Number(v))} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Fixo" stackId="a" fill="#2563eb" radius={[0,0,0,0]} />
                <Bar dataKey="Variável" stackId="a" fill="#d97706" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>

            {/* Tabela resumo */}
            <div style={{ marginTop: 20 }}>
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 110px 110px 110px',
                padding: '8px 12px', fontSize: 12, fontWeight: 600, color: 'var(--text-3)',
                borderBottom: '1px solid var(--border)'
              }}>
                <span>Categoria</span><span style={{ textAlign: 'right' }}>Fixo</span><span style={{ textAlign: 'right' }}>Variável</span><span style={{ textAlign: 'right' }}>Total</span>
              </div>
              {catData.map(c => (
                <div key={c.cat} style={{
                  display: 'grid', gridTemplateColumns: '1fr 110px 110px 110px',
                  padding: '10px 12px', borderBottom: '1px solid var(--border)',
                  fontSize: 13, alignItems: 'center'
                }}>
                  <span style={{ color: 'var(--text)' }}>{c.cat}</span>
                  <span style={{ textAlign: 'right', color: c.Fixo ? 'var(--accent)' : 'var(--text-3)' }}>{c.Fixo ? formatBRL(c.Fixo) : '—'}</span>
                  <span style={{ textAlign: 'right', color: c.Variável ? 'var(--yellow)' : 'var(--text-3)' }}>{c.Variável ? formatBRL(c.Variável) : '—'}</span>
                  <span style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text)' }}>{formatBRL(c.total)}</span>
                </div>
              ))}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 110px 110px 110px',
                padding: '10px 12px', fontSize: 13, fontWeight: 700, background: 'var(--bg)'
              }}>
                <span>Total</span>
                <span style={{ textAlign: 'right', color: 'var(--accent)' }}>{formatBRL(catData.reduce((s,c)=>s+c.Fixo,0))}</span>
                <span style={{ textAlign: 'right', color: 'var(--yellow)' }}>{formatBRL(catData.reduce((s,c)=>s+c.Variável,0))}</span>
                <span style={{ textAlign: 'right' }}>{formatBRL(catData.reduce((s,c)=>s+c.total,0))}</span>
              </div>
            </div>
          </>
        ) : (
          <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontSize: 14 }}>
            Sem gastos registrados em {formatMes(mesSel)}
          </div>
        )}
      </div>
    </div>
  );
}
