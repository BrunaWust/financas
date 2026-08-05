export type TransactionType = 'receita' | 'despesa' | 'investimento';
export type ExpenseKind = 'fixo' | 'variavel'; // only for despesa
export type PaymentMethod =
  | 'PIX' | 'Cartão de Crédito' | 'Cartão de Débito'
  | 'Dinheiro' | 'Transferência' | 'Boleto' | 'Débito Automático' | 'Outro';

export const PAYMENT_METHODS: PaymentMethod[] = [
  'PIX', 'Cartão de Crédito', 'Cartão de Débito',
  'Dinheiro', 'Transferência', 'Boleto', 'Débito Automático', 'Outro',
];

export const PAYMENT_ICONS: Record<PaymentMethod, string> = {
  'PIX': '⚡', 'Cartão de Crédito': '💳', 'Cartão de Débito': '💳',
  'Dinheiro': '💵', 'Transferência': '🔄', 'Boleto': '📄',
  'Débito Automático': '🔁', 'Outro': '💰',
};

export type IncomeCategory = 'Salário' | 'Freelance' | 'Bônus' | 'Outros (receita)';
export type FixedExpenseCategory =
  | 'Aluguel / Financiamento' | 'Condomínio' | 'Plano de Saúde'
  | 'Internet' | 'Telefone' | 'Streaming' | 'Academia' | 'Seguro'
  | 'Escola / Faculdade' | 'Outros (fixo)';
export type VariableExpenseCategory =
  | 'Alimentação' | 'Supermercado' | 'Transporte' | 'Combustível'
  | 'Saúde / Farmácia' | 'Lazer' | 'Vestuário' | 'Restaurante'
  | 'Viagem' | 'Outros (variável)';
export type InvestmentCategory =
  | 'Renda Fixa' | 'Ações' | 'FIIs' | 'Criptomoedas'
  | 'Previdência' | 'Tesouro Direto' | 'Outros (investimento)';

export type Category =
  | IncomeCategory | FixedExpenseCategory | VariableExpenseCategory | InvestmentCategory;

export const INCOME_CATEGORIES: IncomeCategory[] = [
  'Salário', 'Freelance', 'Bônus', 'Outros (receita)',
];
export const FIXED_EXPENSE_CATEGORIES: FixedExpenseCategory[] = [
  'Aluguel / Financiamento', 'Condomínio', 'Plano de Saúde',
  'Internet', 'Telefone', 'Streaming', 'Academia', 'Seguro',
  'Escola / Faculdade', 'Outros (fixo)',
];
export const VARIABLE_EXPENSE_CATEGORIES: VariableExpenseCategory[] = [
  'Alimentação', 'Supermercado', 'Transporte', 'Combustível',
  'Saúde / Farmácia', 'Lazer', 'Vestuário', 'Restaurante',
  'Viagem', 'Outros (variável)',
];
export const INVESTMENT_CATEGORIES: InvestmentCategory[] = [
  'Renda Fixa', 'Ações', 'FIIs', 'Criptomoedas',
  'Previdência', 'Tesouro Direto', 'Outros (investimento)',
];

export interface Transaction {
  id: string;
  date: string;        // YYYY-MM-DD
  description: string;
  type: TransactionType;
  expenseKind?: ExpenseKind; // only when type === 'despesa'
  category: Category;
  amount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface FinanceData {
  transactions: Transaction[];
  lastUpdated: string;
}

// ─── helpers ───────────────────────────────────────────────

export function calcSummary(txs: Transaction[]) {
  const totalIncome   = sum(txs, 'receita');
  const totalFixed    = txs.filter(t => t.type === 'despesa' && t.expenseKind === 'fixo').reduce((s,t) => s + t.amount, 0);
  const totalVariable = txs.filter(t => t.type === 'despesa' && t.expenseKind === 'variavel').reduce((s,t) => s + t.amount, 0);
  const totalExpense  = totalFixed + totalVariable;
  const totalInvested = sum(txs, 'investimento');
  const balance       = totalIncome - totalExpense - totalInvested;
  return { totalIncome, totalFixed, totalVariable, totalExpense, totalInvested, balance };
}

function sum(txs: Transaction[], type: TransactionType) {
  return txs.filter(t => t.type === type).reduce((s,t) => s + t.amount, 0);
}

export function groupByCategory(txs: Transaction[]) {
  const map: Record<string, number> = {};
  for (const t of txs) map[t.category] = (map[t.category] ?? 0) + t.amount;
  return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
}

export function groupByMonth(txs: Transaction[]) {
  const map: Record<string, { receita: number; fixo: number; variavel: number; investimento: number }> = {};
  for (const t of txs) {
    const m = t.date.slice(0, 7);
    if (!map[m]) map[m] = { receita: 0, fixo: 0, variavel: 0, investimento: 0 };
    if (t.type === 'receita')      map[m].receita += t.amount;
    if (t.type === 'investimento') map[m].investimento += t.amount;
    if (t.type === 'despesa' && t.expenseKind === 'fixo')    map[m].fixo += t.amount;
    if (t.type === 'despesa' && t.expenseKind === 'variavel') map[m].variavel += t.amount;
  }
  return Object.entries(map).sort(([a],[b]) => a.localeCompare(b)).map(([month, v]) => ({
    month: fmtMonth(month), raw: month, ...v,
    despesa: v.fixo + v.variavel,
  }));
}

export function getMonths(txs: Transaction[]): string[] {
  return Array.from(new Set(txs.map(t => t.date.slice(0, 7)))).sort().reverse();
}

export function fmtMonth(ym: string) {
  const [y, m] = ym.split('-');
  const names = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  return `${names[parseInt(m)-1]}/${y.slice(2)}`;
}

export function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
export function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR');
}
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
}

export function categoriesForType(type: TransactionType, kind?: ExpenseKind): Category[] {
  if (type === 'receita')      return INCOME_CATEGORIES;
  if (type === 'investimento') return INVESTMENT_CATEGORIES;
  if (kind === 'fixo')         return FIXED_EXPENSE_CATEGORIES;
  return VARIABLE_EXPENSE_CATEGORIES;
}
