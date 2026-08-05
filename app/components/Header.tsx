'use client';
import { Bell, Search } from 'lucide-react';

export default function Header({ page }: { page: string }) {
  const titles: Record<string, string> = {
    dashboard: 'Dashboard',
    investments: 'Investimentos',
    transactions: 'Transações',
    budgets: 'Orçamentos',
    goals: 'Metas',
  };

  return (
    <header style={{
      height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 32px', borderBottom: '1px solid var(--border)',
      background: 'var(--bg-secondary)', position: 'sticky', top: 0, zIndex: 50
    }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)' }}>
        {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--bg-card)', borderRadius: 10, padding: '7px 14px',
          border: '1px solid var(--border)', cursor: 'text'
        }}>
          <Search size={15} color="var(--text-muted)" />
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Buscar... ⌘K</span>
        </div>
        <button style={{
          width: 38, height: 38, borderRadius: 10, background: 'var(--bg-card)',
          border: '1px solid var(--border)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', cursor: 'pointer', position: 'relative'
        }}>
          <Bell size={16} color="var(--text-secondary)" />
          <div style={{
            position: 'absolute', top: 7, right: 7, width: 7, height: 7,
            borderRadius: '50%', background: 'var(--accent-red)',
            border: '2px solid var(--bg-secondary)'
          }} />
        </button>
      </div>
    </header>
  );
}
