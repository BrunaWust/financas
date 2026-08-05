'use client';
import { LayoutDashboard, PlusCircle, List, BarChart2, Download, Upload, ChevronRight, Wallet } from 'lucide-react';

const nav = [
  { id: 'dashboard', label: 'Visão geral', icon: LayoutDashboard },
  { id: 'lancar', label: 'Lançar gasto', icon: PlusCircle },
  { id: 'historico', label: 'Histórico', icon: List },
  { id: 'relatorios', label: 'Relatórios', icon: BarChart2 },
];

interface Props {
  active: string;
  setActive: (id: string) => void;
  onExport: () => void;
  onImport: (f: File) => void;
}

export default function Sidebar({ active, setActive, onExport, onImport }: Props) {
  return (
    <aside style={{
      width: 220, minHeight: '100vh', background: '#fff',
      borderRight: '1px solid var(--border)', display: 'flex',
      flexDirection: 'column', padding: '20px 0', position: 'fixed',
      top: 0, left: 0, bottom: 0, zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: '0 20px 28px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 9,
          background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Wallet size={16} color="white" />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.2px' }}>Minhas Finanças</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>controle pessoal</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {nav.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button key={id} onClick={() => setActive(id)} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 9, border: 'none',
              cursor: 'pointer', textAlign: 'left', width: '100%',
              background: isActive ? 'var(--accent-light)' : 'transparent',
              color: isActive ? 'var(--accent)' : 'var(--text-2)',
              fontSize: 13.5, fontWeight: isActive ? 600 : 400,
              transition: 'all 0.12s',
            }}>
              <Icon size={16} />
              <span style={{ flex: 1 }}>{label}</span>
              {isActive && <ChevronRight size={13} />}
            </button>
          );
        })}
      </nav>

      {/* Import / Export */}
      <div style={{ padding: '16px 10px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button onClick={onExport} style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
          borderRadius: 8, border: '1px solid var(--border)', background: '#fff',
          color: 'var(--text-2)', fontSize: 13, cursor: 'pointer', width: '100%',
        }}>
          <Download size={14} color="var(--green)" />
          Exportar .xlsx
        </button>
        <label style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
          borderRadius: 8, border: '1px solid var(--border)', background: '#fff',
          color: 'var(--text-2)', fontSize: 13, cursor: 'pointer',
        }}>
          <Upload size={14} color="var(--accent)" />
          Importar .xlsx
          <input type="file" accept=".xlsx" style={{ display: 'none' }} onChange={e => {
            const f = e.target.files?.[0];
            if (f) onImport(f);
            e.target.value = '';
          }} />
        </label>
      </div>
    </aside>
  );
}
