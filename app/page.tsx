'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import {
  type Transaction, type FinanceData,
  calcSummary, groupByCategory, groupByMonth, getMonths,
  formatCurrency, formatDate, fmtMonth, PAYMENT_ICONS,
} from './lib/finance';
import { exportToExcel, importFromExcel } from './lib/excel';
import Modal from './components/Modal';

const KEY = 'wust_v4';

type View = 'resumo' | 'fixos' | 'variaveis' | 'investimentos' | 'historico';

const NAV: { v: View; icon: string; label: string }[] = [
  { v: 'resumo',        icon: '◈', label: 'Resumo'       },
  { v: 'fixos',         icon: '○', label: 'Fixos'         },
  { v: 'variaveis',     icon: '◎', label: 'Variáveis'     },
  { v: 'investimentos', icon: '△', label: 'Investimentos' },
  { v: 'historico',     icon: '⊞', label: 'Histórico'     },
];

function load(): FinanceData {
  if (typeof window === 'undefined') return { transactions: [], lastUpdated: '' };
  try { const r = localStorage.getItem(KEY); if (r) return JSON.parse(r); } catch {}
  return { transactions: [], lastUpdated: '' };
}
function persist(d: FinanceData) { localStorage.setItem(KEY, JSON.stringify(d)); }
function nowYM() { return new Date().toISOString().slice(0, 7); }

function useIsMobile() {
  const [m, setM] = useState(false);
  useEffect(() => {
    const fn = () => setM(window.innerWidth < 768);
    fn(); window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return m;
}

const ACCENT  = '#2563EB';
const GREEN   = '#16A34A';
const RED     = '#EF4444';
const PURPLE  = '#6366F1';
const ORANGE  = '#F97316';
const SURFACE = '#FFFFFF';
const BG      = '#FAFAFA';
const MUTED   = '#94A3B8';
const TEXT    = '#0F172A';
const BORDER  = '#F1F5F9';

const PIE = ['#2563EB','#6366F1','#F97316','#16A34A','#EF4444','#0891B2','#D97706','#BE185D'];

export default function App() {
  const [data, setData]           = useState<FinanceData>({ transactions: [], lastUpdated: '' });
  const [view, setView]           = useState<View>('resumo');
  const [month, setMonth]         = useState(nowYM());
  const [modal, setModal]         = useState(false);
  const [editing, setEditing]     = useState<Transaction | null>(null);
  const [toast, setToast]         = useState('');
  const [drawerOpen, setDrawer]   = useState(false);
  const [search, setSearch]       = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const mobile = useIsMobile();

  useEffect(() => { setData(load()); }, []);

  const save = useCallback((d: FinanceData) => { setData(d); persist(d); }, []);

  function showToast(m: string) { setToast(m); setTimeout(() => setToast(''), 2500); }

  function handleSave(t: Transaction) {
    setData(prev => {
      const exists = prev.transactions.find(x => x.id === t.id);
      const transactions = exists
        ? prev.transactions.map(x => x.id === t.id ? t : x)
        : [t, ...prev.transactions];
      const next = { transactions, lastUpdated: new Date().toISOString() };
      persist(next); return next;
    });
    setModal(false); setEditing(null);
    showToast(editing ? 'Atualizado ✓' : 'Adicionado ✓');
  }

  function del(id: string) {
    if (!confirm('Excluir esta transação?')) return;
    save({ transactions: data.transactions.filter(t => t.id !== id), lastUpdated: new Date().toISOString() });
    showToast('Excluído');
  }

  async function imp(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      const txs = await importFromExcel(file);
      save({ transactions: txs, lastUpdated: new Date().toISOString() });
      showToast(`${txs.length} transações importadas ✓`);
    } catch { showToast('Erro ao importar'); }
    e.target.value = '';
  }

  const allMonths = Array.from(new Set([nowYM(), ...getMonths(data.transactions)])).sort().reverse();
  const idx       = allMonths.indexOf(month);
  const mTxs      = data.transactions.filter(t => t.date.startsWith(month));
  const s         = calcSummary(mTxs);
  const byMo      = groupByMonth(data.transactions);

  const fixedTxs  = mTxs.filter(t => t.type === 'despesa' && t.expenseKind === 'fixo');
  const varTxs    = mTxs.filter(t => t.type === 'despesa' && t.expenseKind === 'variavel');
  const invTxs    = mTxs.filter(t => t.type === 'investimento');

  function openEdit(t: Transaction) { setEditing(t); setModal(true); }

  // ── Sidebar ────────────────────────────────────────────────
  const Sidebar = () => (
    <aside style={{
      width: 220, background: SURFACE, borderRight: `1px solid ${BORDER}`,
      display: 'flex', flexDirection: 'column', height: '100%',
    }}>
      {/* Brand */}
      <div style={{ padding: '28px 24px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Image src="/logo.svg" alt="W" width={34} height={34} />
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.02em', color: TEXT }}>Wust</div>
          <div style={{ fontSize: 11, color: MUTED, fontWeight: 500 }}>Finanças</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '4px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map(n => {
          const active = view === n.v;
          return (
            <button key={n.v} onClick={() => { setView(n.v); setDrawer(false); }} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 12px', borderRadius: 10, border: 'none',
              cursor: 'pointer', width: '100%', textAlign: 'left',
              background: active ? '#EFF6FF' : 'transparent',
              color: active ? ACCENT : MUTED,
              fontWeight: active ? 700 : 500, fontSize: 14,
              transition: 'all 0.12s',
            }}>
              <span style={{ fontSize: 16, fontWeight: 400, width: 20, textAlign: 'center', opacity: active ? 1 : 0.6 }}>{n.icon}</span>
              {n.label}
            </button>
          );
        })}
      </nav>

      {/* Tools */}
      <div style={{ padding: '12px', borderTop: `1px solid ${BORDER}`, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <ToolBtn label="Exportar Excel" onClick={() => { exportToExcel(data); showToast('Excel baixado ✓'); }} />
        <ToolBtn label="Importar Excel" onClick={() => fileRef.current?.click()} />
        <input ref={fileRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={imp} />
      </div>

      {/* User */}
      <div style={{ padding: '12px 12px 20px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px', borderRadius: 10, background: BG,
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%', background: ACCENT,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 12, fontWeight: 800,
          }}>W</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>Wust</div>
            <div style={{ fontSize: 11, color: MUTED }}>Conta pessoal</div>
          </div>
        </div>
      </div>
    </aside>
  );

  // ── Month bar ──────────────────────────────────────────────
  const MonthBar = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
      <button onClick={() => idx < allMonths.length - 1 && setMonth(allMonths[idx + 1])}
        disabled={idx >= allMonths.length - 1}
        style={{ ...navBtn, opacity: idx >= allMonths.length - 1 ? 0.3 : 1 }}>‹</button>
      <div style={{ textAlign: 'center', minWidth: 80 }}>
        <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em', color: TEXT }}>{fmtMonth(month)}</div>
        <div style={{ fontSize: 12, color: MUTED, marginTop: 1 }}>{mTxs.length} lançamento{mTxs.length !== 1 ? 's' : ''}</div>
      </div>
      <button onClick={() => idx > 0 && setMonth(allMonths[idx - 1])}
        disabled={idx <= 0}
        style={{ ...navBtn, opacity: idx <= 0 ? 0.3 : 1 }}>›</button>
      <div style={{ flex: 1 }} />
      {/* Quick balance pill */}
      <div style={{
        padding: '6px 14px', borderRadius: 99,
        background: s.balance >= 0 ? '#F0FDF4' : '#FEF2F2',
        color: s.balance >= 0 ? GREEN : RED,
        fontSize: 13, fontWeight: 700,
      }}>
        {s.balance >= 0 ? '+' : ''}{formatCurrency(s.balance)}
      </div>
    </div>
  );

  // ── RESUMO ─────────────────────────────────────────────────
  const ViewResumo = () => (
    <>
      <MonthBar />

      {/* 4 stat tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr 1fr' : 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
        <Tile label="Receitas"     value={s.totalIncome}   accent={GREEN}  />
        <Tile label="Fixos"        value={s.totalFixed}    accent={RED}    />
        <Tile label="Variáveis"    value={s.totalVariable} accent={ORANGE} />
        <Tile label="Investido"    value={s.totalInvested} accent={PURPLE} />
      </div>

      {mTxs.length === 0
        ? <Blank onAdd={() => setModal(true)} label={fmtMonth(month)} />
        : <>
            {/* Spend breakdown */}
            {(fixedTxs.length > 0 || varTxs.length > 0) && (
              <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: 16, marginBottom: 16 }}>
                {fixedTxs.length > 0 && (
                  <Card>
                    <SectionLabel>Fixos — por categoria</SectionLabel>
                    <Bars data={groupByCategory(fixedTxs)} color={RED} />
                  </Card>
                )}
                {varTxs.length > 0 && (
                  <Card>
                    <SectionLabel>Variáveis — por categoria</SectionLabel>
                    <Bars data={groupByCategory(varTxs)} color={ORANGE} />
                  </Card>
                )}
              </div>
            )}

            {/* Recent */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <SectionLabel style={{ marginBottom: 0 }}>Últimas transações</SectionLabel>
                <TextBtn onClick={() => setView('variaveis')}>ver todas →</TextBtn>
              </div>
              <TxList txs={mTxs.slice(0, 6)} onEdit={openEdit} onDel={del} mobile={mobile} />
            </Card>
          </>
      }
    </>
  );

  // ── FIXOS ──────────────────────────────────────────────────
  const ViewFixos = () => (
    <>
      <MonthBar />
      <SummaryRow items={[
        { label: 'Total fixos',    value: s.totalFixed,                                                     color: RED    },
        { label: '% da receita',   value: s.totalIncome > 0 ? (s.totalFixed / s.totalIncome * 100) : 0,     color: RED,  pct: true },
        { label: 'Lançamentos',    value: fixedTxs.length,                                                   color: MUTED, count: true },
      ]} />
      {fixedTxs.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <Card><SectionLabel>Por categoria</SectionLabel><Bars data={groupByCategory(fixedTxs)} color={RED} /></Card>
          <Card><SectionLabel>Detalhamento</SectionLabel><CatList items={groupByCategory(fixedTxs)} total={s.totalFixed} color={RED} /></Card>
        </div>
      )}
      <Card>
        <SectionLabel>Todos os lançamentos fixos</SectionLabel>
        {fixedTxs.length === 0
          ? <BlankInline label="Nenhum gasto fixo neste mês." />
          : <TxList txs={fixedTxs} onEdit={openEdit} onDel={del} mobile={mobile} />}
      </Card>
    </>
  );

  // ── VARIÁVEIS ──────────────────────────────────────────────
  const ViewVar = () => {
    const filtered = varTxs.filter(t =>
      !search || t.description.toLowerCase().includes(search.toLowerCase())
        || t.category.toLowerCase().includes(search.toLowerCase())
    );
    return (
      <>
        <MonthBar />
        <SummaryRow items={[
          { label: 'Total variáveis', value: s.totalVariable,                                                     color: ORANGE  },
          { label: '% da receita',    value: s.totalIncome > 0 ? (s.totalVariable / s.totalIncome * 100) : 0,     color: ORANGE, pct: true },
          { label: 'Lançamentos',     value: varTxs.length,                                                        color: MUTED, count: true },
        ]} />
        {varTxs.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <Card><SectionLabel>Por categoria</SectionLabel><Bars data={groupByCategory(varTxs)} color={ORANGE} /></Card>
            <Card><SectionLabel>Detalhamento</SectionLabel><CatList items={groupByCategory(varTxs)} total={s.totalVariable} color={ORANGE} /></Card>
          </div>
        )}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <SectionLabel style={{ marginBottom: 0 }}>Lançamentos variáveis</SectionLabel>
            <input placeholder="Buscar…" value={search} onChange={e => setSearch(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: 8, border: `1.5px solid ${BORDER}`, fontSize: 13, color: TEXT, background: BG, outline: 'none', width: 160 }} />
          </div>
          {filtered.length === 0
            ? <BlankInline label="Nenhum resultado." />
            : <TxList txs={filtered} onEdit={openEdit} onDel={del} mobile={mobile} />}
        </Card>
      </>
    );
  };

  // ── INVESTIMENTOS ──────────────────────────────────────────
  const ViewInv = () => (
    <>
      <MonthBar />
      <SummaryRow items={[
        { label: 'Total investido', value: s.totalInvested,                                                       color: PURPLE  },
        { label: '% da receita',    value: s.totalIncome > 0 ? (s.totalInvested / s.totalIncome * 100) : 0,       color: PURPLE, pct: true },
        { label: 'Aportes',         value: invTxs.length,                                                          color: MUTED, count: true },
      ]} />
      {invTxs.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <Card><SectionLabel>Por tipo</SectionLabel><Bars data={groupByCategory(invTxs)} color={PURPLE} /></Card>
          <Card><SectionLabel>Alocação</SectionLabel><CatList items={groupByCategory(invTxs)} total={s.totalInvested} color={PURPLE} /></Card>
        </div>
      )}
      <Card>
        <SectionLabel>Aportes do mês</SectionLabel>
        {invTxs.length === 0
          ? <BlankInline label="Nenhum investimento neste mês." />
          : <TxList txs={invTxs} onEdit={openEdit} onDel={del} mobile={mobile} />}
      </Card>
    </>
  );

  // ── HISTÓRICO ──────────────────────────────────────────────
  const ViewHist = () => (
    <>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: MUTED, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>
          Todos os meses
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', color: TEXT }}>
          {data.transactions.length} transações registradas
        </div>
      </div>

      {byMo.length === 0
        ? <Blank onAdd={() => setModal(true)} label="" />
        : <>
            {/* Bar chart */}
            <Card style={{ marginBottom: 16 }}>
              <SectionLabel>Evolução mensal</SectionLabel>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={byMo} barSize={mobile ? 8 : 12} barCategoryGap="30%">
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: MUTED }} axisLine={false} tickLine={false}
                    tickFormatter={v => `${(Number(v) / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ borderRadius: 10, border: `1px solid ${BORDER}`, fontSize: 13 }}
                    formatter={v => formatCurrency(Number(v))} />
                  <Bar dataKey="receita"      name="Receita"     fill={GREEN}  radius={[3, 3, 0, 0]} />
                  <Bar dataKey="fixo"         name="Fixos"       fill={RED}    radius={[3, 3, 0, 0]} />
                  <Bar dataKey="variavel"     name="Variáveis"   fill={ORANGE} radius={[3, 3, 0, 0]} />
                  <Bar dataKey="investimento" name="Investido"   fill={PURPLE} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
                {[['Receita', GREEN], ['Fixos', RED], ['Variáveis', ORANGE], ['Investido', PURPLE]].map(([l, c]) => (
                  <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: MUTED }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />{l}
                  </div>
                ))}
              </div>
            </Card>

            {/* Table */}
            <Card>
              <SectionLabel>Resumo por mês</SectionLabel>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr>
                      {['Mês', 'Receita', 'Fixos', 'Variáveis', 'Investido', 'Saldo'].map(h => (
                        <th key={h} style={{ padding: '8px 12px', textAlign: h === 'Mês' ? 'left' : 'right', color: MUTED, fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: `2px solid ${BORDER}`, whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {byMo.slice().reverse().map(m => {
                      const saldo = m.receita - m.fixo - m.variavel - m.investimento;
                      return (
                        <tr key={m.raw} style={{ cursor: 'pointer', transition: 'background 0.1s' }}
                          onClick={() => { setMonth(m.raw); setView('resumo'); }}
                          onMouseEnter={e => (e.currentTarget.style.background = BG)}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                          <td style={{ padding: '11px 12px', fontWeight: 700, color: TEXT, borderBottom: `1px solid ${BORDER}` }}>{m.month}</td>
                          <td style={{ padding: '11px 12px', textAlign: 'right', color: GREEN, fontWeight: 600, borderBottom: `1px solid ${BORDER}` }}>{formatCurrency(m.receita)}</td>
                          <td style={{ padding: '11px 12px', textAlign: 'right', color: RED, borderBottom: `1px solid ${BORDER}` }}>{formatCurrency(m.fixo)}</td>
                          <td style={{ padding: '11px 12px', textAlign: 'right', color: ORANGE, borderBottom: `1px solid ${BORDER}` }}>{formatCurrency(m.variavel)}</td>
                          <td style={{ padding: '11px 12px', textAlign: 'right', color: PURPLE, borderBottom: `1px solid ${BORDER}` }}>{formatCurrency(m.investimento)}</td>
                          <td style={{ padding: '11px 12px', textAlign: 'right', fontWeight: 800, color: saldo >= 0 ? GREEN : RED, borderBottom: `1px solid ${BORDER}` }}>{formatCurrency(saldo)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
      }
    </>
  );

  // ── Root render ────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: BG }}>

      {/* Desktop sidebar */}
      {!mobile && (
        <div style={{ width: 220, flexShrink: 0, height: '100vh', overflow: 'auto' }}>
          <Sidebar />
        </div>
      )}

      {/* Mobile drawer */}
      {mobile && drawerOpen && (
        <>
          <div onClick={() => setDrawer(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.25)', zIndex: 40, backdropFilter: 'blur(2px)' }} />
          <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 240, zIndex: 50, overflowY: 'auto' }}>
            <Sidebar />
          </div>
        </>
      )}

      {/* Scroll container */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

        {/* Mobile topbar */}
        {mobile && (
          <div style={{
            position: 'sticky', top: 0, zIndex: 30,
            background: SURFACE, borderBottom: `1px solid ${BORDER}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 16px', height: 52,
          }}>
            <button onClick={() => setDrawer(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: TEXT, padding: 4, lineHeight: 1 }}>☰</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Image src="/logo.svg" alt="W" width={24} height={24} />
              <span style={{ fontWeight: 800, fontSize: 14, letterSpacing: '-0.01em' }}>Wust Finanças</span>
            </div>
            <button onClick={() => { setEditing(null); setModal(true); }} style={{
              width: 30, height: 30, background: ACCENT, color: '#fff', border: 'none',
              borderRadius: 8, fontWeight: 700, fontSize: 18, cursor: 'pointer', lineHeight: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>+</button>
          </div>
        )}

        {/* Page */}
        <main style={{ flex: 1, padding: mobile ? '24px 16px 88px' : '36px 36px 36px' }}>

          {/* Desktop page header */}
          {!mobile && (
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: MUTED, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
                  {NAV.find(n => n.v === view)?.icon} {NAV.find(n => n.v === view)?.label}
                </div>
                <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: TEXT }}>
                  {view === 'historico' ? 'Histórico' : fmtMonth(month)}
                </h1>
              </div>
              <button onClick={() => { setEditing(null); setModal(true); }} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '11px 20px', borderRadius: 12, border: 'none',
                background: TEXT, color: '#fff', fontWeight: 700, fontSize: 14,
                cursor: 'pointer', letterSpacing: '-0.01em',
              }}>
                <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Nova transação
              </button>
            </div>
          )}

          {mobile && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: MUTED, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 3 }}>
                {NAV.find(n => n.v === view)?.label}
              </div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', color: TEXT }}>
                {view === 'historico' ? 'Histórico' : fmtMonth(month)}
              </h1>
            </div>
          )}

          {view === 'resumo'        && <ViewResumo />}
          {view === 'fixos'         && <ViewFixos />}
          {view === 'variaveis'     && <ViewVar />}
          {view === 'investimentos' && <ViewInv />}
          {view === 'historico'     && <ViewHist />}
        </main>
      </div>

      {/* Mobile bottom nav */}
      {mobile && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: SURFACE, borderTop: `1px solid ${BORDER}`,
          display: 'flex', zIndex: 30,
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}>
          {NAV.map(n => {
            const active = view === n.v;
            return (
              <button key={n.v} onClick={() => setView(n.v)} style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 3, padding: '10px 0 8px', background: 'none', border: 'none',
                cursor: 'pointer', color: active ? ACCENT : MUTED,
                fontSize: 9, fontWeight: active ? 700 : 500,
              }}>
                <span style={{ fontSize: 17 }}>{n.icon}</span>
                {n.label}
              </button>
            );
          })}
        </div>
      )}

      <Modal open={modal} initial={editing} onSave={handleSave}
        onClose={() => { setModal(false); setEditing(null); }} />

      {toast && (
        <div style={{
          position: 'fixed',
          bottom: mobile ? 76 : 28, left: '50%', transform: 'translateX(-50%)',
          background: TEXT, color: '#fff', padding: '10px 20px',
          borderRadius: 10, fontSize: 14, fontWeight: 600,
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)', zIndex: 200, whiteSpace: 'nowrap',
          animation: 'fadeIn 0.15s ease',
        }}>{toast}</div>
      )}
      <style>{`@keyframes fadeIn { from { opacity:0; transform: translateX(-50%) translateY(8px); } to { opacity:1; transform: translateX(-50%) translateY(0); } }`}</style>
    </div>
  );
}

// ── Reusable components ─────────────────────────────────────

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: SURFACE, borderRadius: 16, padding: '20px', border: `1px solid ${BORDER}`, ...style }}>
      {children}
    </div>
  );
}

function SectionLabel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ fontSize: 12, fontWeight: 700, color: MUTED, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 16, ...style }}>
      {children}
    </div>
  );
}

function Tile({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div style={{ background: SURFACE, borderRadius: 14, padding: '18px 20px', border: `1px solid ${BORDER}` }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color: accent, letterSpacing: '-0.02em' }}>{formatCurrency(value)}</div>
    </div>
  );
}

function SummaryRow({ items }: { items: { label: string; value: number; color: string; pct?: boolean; count?: boolean }[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${items.length}, 1fr)`, gap: 10, marginBottom: 20 }}>
      {items.map(item => (
        <div key={item.label} style={{ background: SURFACE, borderRadius: 12, padding: '14px 16px', border: `1px solid ${BORDER}` }}>
          <div style={{ fontSize: 11, color: MUTED, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{item.label}</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: item.color, letterSpacing: '-0.02em' }}>
            {item.count ? item.value : item.pct ? `${item.value.toFixed(1)}%` : formatCurrency(item.value)}
          </div>
        </div>
      ))}
    </div>
  );
}

function Bars({ data, color }: { data: { name: string; value: number }[]; color: string }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} layout="vertical" barSize={12} margin={{ left: 0, right: 8, top: 0, bottom: 0 }}>
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: MUTED }} width={110} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${BORDER}`, fontSize: 13 }} formatter={v => formatCurrency(Number(v))} />
        <Bar dataKey="value" radius={[0, 6, 6, 0]}>
          {data.map((_, i) => <Cell key={i} fill={i === 0 ? color : color + '80'} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function CatList({ items, total, color }: { items: { name: string; value: number }[]; total: number; color: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map(it => {
        const pct = total > 0 ? Math.round(it.value / total * 100) : 0;
        return (
          <div key={it.name}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: TEXT, fontWeight: 500 }}>{it.name}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: TEXT }}>{pct}%</span>
            </div>
            <div style={{ height: 4, background: BORDER, borderRadius: 99 }}>
              <div style={{ height: 4, width: `${pct}%`, background: color, borderRadius: 99, transition: 'width 0.3s ease' }} />
            </div>
            <div style={{ fontSize: 11, color: MUTED, marginTop: 3 }}>{formatCurrency(it.value)}</div>
          </div>
        );
      })}
    </div>
  );
}

function TxList({ txs, onEdit, onDel, mobile }: {
  txs: Transaction[]; onEdit: (t: Transaction) => void; onDel: (id: string) => void; mobile: boolean;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {txs.map(t => {
        const isIncome = t.type === 'receita';
        const isInv    = t.type === 'investimento';
        const color    = isIncome ? GREEN : isInv ? PURPLE : RED;
        const sign     = isIncome ? '+' : '';
        return (
          <div key={t.id} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 8px', borderRadius: 10,
            transition: 'background 0.1s', cursor: 'default',
          }}
            onMouseEnter={e => { if (!mobile) (e.currentTarget.style.background = BG); }}
            onMouseLeave={e => { if (!mobile) (e.currentTarget.style.background = 'transparent'); }}
          >
            {/* Icon */}
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, background: BORDER,
            }}>
              {PAYMENT_ICONS[t.paymentMethod] ?? '○'}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.description}</div>
              <div style={{ fontSize: 11, color: MUTED, marginTop: 1 }}>
                {t.category}
                {t.expenseKind && <span style={{ marginLeft: 6, padding: '1px 6px', background: BORDER, borderRadius: 4, fontSize: 10, fontWeight: 600 }}>{t.expenseKind === 'fixo' ? 'Fixo' : 'Variável'}</span>}
                {' · '}{formatDate(t.date)}
              </div>
            </div>

            {/* Amount */}
            <div style={{ fontWeight: 800, fontSize: 14, color, flexShrink: 0, letterSpacing: '-0.01em' }}>
              {sign}{formatCurrency(t.amount)}
            </div>

            {/* Actions */}
            {!mobile ? (
              <div style={{ display: 'flex', gap: 4, flexShrink: 0, opacity: 0 }} className="tx-actions"
                onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '0')}>
                <IcBtn onClick={() => onEdit(t)} title="Editar">✏</IcBtn>
                <IcBtn onClick={() => onDel(t.id)} title="Excluir">✕</IcBtn>
              </div>
            ) : (
              <button onClick={() => onEdit(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED, fontSize: 20, flexShrink: 0, lineHeight: 1 }}>›</button>
            )}
          </div>
        );
      })}
    </div>
  );
}

function IcBtn({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} title={title} style={{
      width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: BORDER, border: 'none', borderRadius: 7, cursor: 'pointer', fontSize: 12, color: MUTED,
    }}>{children}</button>
  );
}

function TextBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{ background: 'none', border: 'none', cursor: 'pointer', color: ACCENT, fontSize: 13, fontWeight: 600, padding: 0 }}>{children}</button>
  );
}

function ToolBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', padding: '8px 12px', borderRadius: 8,
      border: `1px solid ${BORDER}`, background: BG,
      color: MUTED, fontSize: 12, fontWeight: 600, cursor: 'pointer', textAlign: 'left',
    }}>{label}</button>
  );
}

function Blank({ onAdd, label }: { onAdd: () => void; label: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.3 }}>○</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: TEXT, marginBottom: 8 }}>
        {label ? `Sem dados em ${label}` : 'Nenhuma transação'}
      </div>
      <div style={{ fontSize: 14, color: MUTED, marginBottom: 24 }}>Adicione receitas, despesas ou investimentos.</div>
      <button onClick={onAdd} style={{
        padding: '12px 24px', borderRadius: 12, border: 'none',
        background: TEXT, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
      }}>+ Adicionar</button>
    </div>
  );
}

function BlankInline({ label }: { label: string }) {
  return <div style={{ textAlign: 'center', padding: '24px', fontSize: 13, color: MUTED }}>{label}</div>;
}

const navBtn: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  fontSize: 22, color: TEXT, padding: '4px 8px', fontWeight: 600, lineHeight: 1,
};
