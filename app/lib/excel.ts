import * as XLSX from 'xlsx';
import type { Transaction, FinanceData, PaymentMethod, ExpenseKind, TransactionType, Category } from './finance';

const SHEET = 'Transações';
const HEADERS = ['ID','Data','Descrição','Tipo','Subtipo','Categoria','Valor (R$)','Forma de Pagamento','Observações'];

export function exportToExcel(data: FinanceData): void {
  const wb = XLSX.utils.book_new();
  const rows = data.transactions.map(t => [
    t.id, t.date, t.description,
    t.type === 'receita' ? 'Receita' : t.type === 'investimento' ? 'Investimento' : 'Despesa',
    t.expenseKind === 'fixo' ? 'Fixo' : t.expenseKind === 'variavel' ? 'Variável' : '',
    t.category, t.amount, t.paymentMethod, t.notes ?? '',
  ]);
  const ws = XLSX.utils.aoa_to_sheet([HEADERS, ...rows]);
  ws['!cols'] = [
    {wch:22},{wch:12},{wch:32},{wch:13},{wch:10},
    {wch:24},{wch:14},{wch:20},{wch:28},
  ];
  XLSX.utils.book_append_sheet(wb, ws, SHEET);
  XLSX.writeFile(wb, 'wust-financas.xlsx');
}

export function importFromExcel(file: File): Promise<Transaction[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[SHEET] ?? wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1 }) as unknown as (string|number)[][];
        const txs: Transaction[] = rows.slice(1).filter(r => r.length >= 6 && r[0]).map(r => {
          const rawType = String(r[3]).toLowerCase();
          const type: TransactionType =
            rawType === 'receita' ? 'receita' :
            rawType === 'investimento' ? 'investimento' : 'despesa';
          const rawKind = String(r[4] ?? '').toLowerCase();
          const expenseKind: ExpenseKind | undefined =
            type !== 'despesa' ? undefined :
            rawKind === 'fixo' ? 'fixo' : 'variavel';
          return {
            id: String(r[0]), date: String(r[1]), description: String(r[2]),
            type, expenseKind, category: String(r[5]) as Category,
            amount: Number(r[6]),
            paymentMethod: (r[7] ? String(r[7]) : 'Outro') as PaymentMethod,
            notes: r[8] ? String(r[8]) : undefined,
          };
        });
        resolve(txs);
      } catch(err) { reject(err); }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}
