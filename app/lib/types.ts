export type TipoLancamento = 'receita' | 'gasto_fixo' | 'gasto_variavel';

export interface Lancamento {
  id: string;
  data: string;         // YYYY-MM-DD
  descricao: string;
  categoria: string;
  tipo: TipoLancamento;
  valor: number;        // positivo para receita, positivo para gastos (sign fica no tipo)
  mes: string;          // YYYY-MM derived
  observacao?: string;
}

export interface ConfiguracaoMes {
  mes: string;          // YYYY-MM
  salario: number;
  metaPoupanca: number;
}

export interface AppData {
  lancamentos: Lancamento[];
  configuracoes: ConfiguracaoMes[];
}

export const CATEGORIAS_FIXAS = [
  'Aluguel / Financiamento',
  'Condomínio',
  'Internet / TV / Telefone',
  'Escola / Faculdade',
  'Plano de saúde',
  'Academia',
  'Assinaturas',
  'Outros fixos',
];

export const CATEGORIAS_VARIAVEIS = [
  'Alimentação',
  'Mercado',
  'Restaurante',
  'Transporte',
  'Combustível',
  'Uber / Táxi',
  'Saúde / Farmácia',
  'Lazer',
  'Roupas / Calçados',
  'Eletrônicos',
  'Casa / Decoração',
  'Presentes',
  'Viagem',
  'Outros variáveis',
];

export const CATEGORIAS_RECEITA = [
  'Salário',
  'Freelance',
  'Aluguel recebido',
  'Dividendos',
  'Bônus',
  'Décimo terceiro',
  'Outros rendimentos',
];

export function getMesAtual(): string {
  return new Date().toISOString().slice(0, 7);
}

export function formatMes(mes: string): string {
  const [ano, m] = mes.split('-');
  const nomes = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  return `${nomes[parseInt(m) - 1]}/${ano}`;
}

export function formatBRL(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function getMeses(lancamentos: Lancamento[], configuracoes: ConfiguracaoMes[]): string[] {
  const set = new Set<string>();
  lancamentos.forEach(l => set.add(l.mes));
  configuracoes.forEach(c => set.add(c.mes));
  // always include current month
  set.add(getMesAtual());
  return Array.from(set).sort().reverse();
}
