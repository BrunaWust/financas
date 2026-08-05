import ExcelJS from 'exceljs';

export async function exportToExcel(data: Array<Record<string, unknown>>) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Transações');

  if (data.length > 0) {
    worksheet.columns = Object.keys(data[0]).map((key) => ({
      header: key,
      key: key,
    }));
    worksheet.addRows(data);
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}