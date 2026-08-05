export const monthlyData = [
  { month: 'Jan', receitas: 12500, despesas: 8200, investimentos: 2000 },
  { month: 'Fev', receitas: 13200, despesas: 9100, investimentos: 2500 },
  { month: 'Mar', receitas: 11800, despesas: 7800, investimentos: 2200 },
  { month: 'Abr', receitas: 14500, despesas: 9800, investimentos: 3000 },
  { month: 'Mai', receitas: 15200, despesas: 10200, investimentos: 3200 },
  { month: 'Jun', receitas: 13900, despesas: 8900, investimentos: 2800 },
  { month: 'Jul', receitas: 16100, despesas: 11000, investimentos: 3500 },
  { month: 'Ago', receitas: 17500, despesas: 11800, investimentos: 4000 },
];

export const portfolioData = [
  { name: 'Ações BR', value: 35, amount: 42500, change: 8.3, color: '#4f7cff' },
  { name: 'FIIs', value: 20, amount: 24300, change: 4.1, color: '#00d68f' },
  { name: 'Renda Fixa', value: 25, amount: 30400, change: 1.2, color: '#a78bfa' },
  { name: 'Ações EUA', value: 12, amount: 14600, change: 12.5, color: '#ffc107' },
  { name: 'Cripto', value: 8, amount: 9720, change: -3.2, color: '#ff4d6d' },
];

export const transactions = [
  { id: 1, desc: 'Salário', category: 'Receita', amount: 12500, date: '01/08', type: 'income', icon: '💼' },
  { id: 2, desc: 'Supermercado Extra', category: 'Alimentação', amount: -650, date: '02/08', type: 'expense', icon: '🛒' },
  { id: 3, desc: 'Aporte IVVB11', category: 'Investimento', amount: -2000, date: '03/08', type: 'investment', icon: '📈' },
  { id: 4, desc: 'Netflix', category: 'Assinaturas', amount: -55, date: '04/08', type: 'expense', icon: '📺' },
  { id: 5, desc: 'Aluguel', category: 'Moradia', amount: -2200, date: '05/08', type: 'expense', icon: '🏠' },
  { id: 6, desc: 'Freelance Design', category: 'Receita', amount: 3500, date: '06/08', type: 'income', icon: '🎨' },
  { id: 7, desc: 'Combustível', category: 'Transporte', amount: -280, date: '07/08', type: 'expense', icon: '⛽' },
  { id: 8, desc: 'Dividendos FIIs', category: 'Investimento', amount: 420, date: '08/08', type: 'income', icon: '💰' },
  { id: 9, desc: 'Academia', category: 'Saúde', amount: -120, date: '08/08', type: 'expense', icon: '💪' },
  { id: 10, desc: 'Amazon', category: 'Compras', amount: -340, date: '08/08', type: 'expense', icon: '📦' },
];

export const budgets = [
  { category: 'Alimentação', spent: 1250, limit: 1500, icon: '🍔', color: '#4f7cff' },
  { category: 'Moradia', spent: 2200, limit: 2200, icon: '🏠', color: '#00d68f' },
  { category: 'Transporte', spent: 580, limit: 800, icon: '🚗', color: '#a78bfa' },
  { category: 'Lazer', spent: 430, limit: 600, icon: '🎮', color: '#ffc107' },
  { category: 'Saúde', spent: 290, limit: 500, icon: '💊', color: '#00d68f' },
  { category: 'Assinaturas', spent: 185, limit: 200, icon: '📱', color: '#ff4d6d' },
];

export const investments = [
  { ticker: 'PETR4', name: 'Petrobras', qty: 200, price: 38.50, avg: 32.10, total: 7700, change: 19.9, dayChange: 1.2 },
  { ticker: 'IVVB11', name: 'S&P 500 ETF', qty: 45, price: 312.80, avg: 280.00, total: 14076, change: 11.7, dayChange: -0.5 },
  { ticker: 'XPML11', name: 'XP Malls FII', qty: 120, price: 108.40, avg: 95.00, total: 13008, change: 14.1, dayChange: 0.8 },
  { ticker: 'MXRF11', name: 'Maxi Renda FII', qty: 500, price: 10.85, avg: 10.20, total: 5425, change: 6.4, dayChange: 0.2 },
  { ticker: 'BTC', name: 'Bitcoin', qty: 0.08, price: 298450, avg: 310000, total: 23876, change: -3.7, dayChange: 2.1 },
];

export const goals = [
  { name: 'Reserva de Emergência', current: 18000, target: 30000, deadline: 'Dez 2025', icon: '🛡️', color: '#00d68f' },
  { name: 'Viagem Europa', current: 5500, target: 15000, deadline: 'Jun 2026', icon: '✈️', color: '#4f7cff' },
  { name: 'Entrada Apartamento', current: 42000, target: 120000, deadline: 'Dez 2027', icon: '🏡', color: '#a78bfa' },
  { name: 'Aposentadoria', current: 85000, target: 500000, deadline: 'Dez 2045', icon: '🌴', color: '#ffc107' },
];
