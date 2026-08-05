'use client';
import { goals } from '../lib/data';
import { Plus, Target } from 'lucide-react';

export default function Goals() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>Metas financeiras</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>Acompanhe seus objetivos de curto e longo prazo</p>
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px',
          background: 'var(--accent-blue)', color: 'white', border: 'none',
          borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer'
        }}>
          <Plus size={16} /> Nova meta
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
        {goals.map(goal => {
          const pct = (goal.current / goal.target) * 100;
          const remaining = goal.target - goal.current;
          return (
            <div key={goal.name} style={{
              background: 'var(--bg-card)', borderRadius: 18, padding: '24px',
              border: '1px solid var(--border)', position: 'relative', overflow: 'hidden'
            }}>
              {/* Background accent */}
              <div style={{
                position: 'absolute', top: -30, right: -30, width: 120, height: 120,
                borderRadius: '50%', background: `${goal.color}10`
              }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: `${goal.color}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22
                }}>{goal.icon}</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{goal.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Prazo: {goal.deadline}</div>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Acumulado</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
                      R$ {goal.current.toLocaleString('pt-BR')}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Meta</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '-0.5px' }}>
                      R$ {goal.target.toLocaleString('pt-BR')}
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ height: 8, borderRadius: 4, background: 'var(--bg-card-hover)', overflow: 'hidden', marginBottom: 8 }}>
                  <div style={{
                    height: '100%', borderRadius: 4, width: `${Math.min(pct, 100)}%`,
                    background: goal.color, transition: 'width 0.5s ease'
                  }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Faltam R$ {remaining.toLocaleString('pt-BR')}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: goal.color }}>
                    {pct.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Circular indicator */}
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
                <svg width="80" height="80" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="var(--bg-card-hover)" strokeWidth="6" />
                  <circle
                    cx="40" cy="40" r="34" fill="none" stroke={goal.color} strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 34}`}
                    strokeDashoffset={`${2 * Math.PI * 34 * (1 - pct / 100)}`}
                    transform="rotate(-90 40 40)"
                    style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                  />
                  <text x="40" y="40" textAnchor="middle" dy="5" fill={goal.color} fontSize="14" fontWeight="700">
                    {pct.toFixed(0)}%
                  </text>
                </svg>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
