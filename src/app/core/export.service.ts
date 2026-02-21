import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ExportColumn<T> {
  header: string;
  key: keyof T;
}

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  exportExcel<T extends object>(fileName: string, rows: T[], columns: ExportColumn<T>[]) {
    const exportRows = rows.map((row) => {
      const result: Record<string, string | number | boolean> = {};
      for (const col of columns) {
        result[col.header] = this.cellValue((row as Record<keyof T, unknown>)[col.key]);
      }
      return result;
    });

    const sheet = XLSX.utils.json_to_sheet(exportRows);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, 'Report');
    XLSX.writeFile(book, `${fileName}.xlsx`);
  }

  exportPdf<T extends object>(title: string, fileName: string, rows: T[], columns: ExportColumn<T>[]) {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(title, 14, 16);

    autoTable(doc, {
      head: [columns.map((col) => col.header)],
      body: rows.map((row) => columns.map((col) => this.cellValue((row as Record<keyof T, unknown>)[col.key]))),
      startY: 22,
      styles: { fontSize: 9 }
    });

    doc.save(`${fileName}.pdf`);
  }

  printTable<T extends object>(title: string, rows: T[], columns: ExportColumn<T>[]) {
    const tableHead = columns.map((col) => `<th>${col.header}</th>`).join('');
    const tableBody = rows
      .map((row) => `<tr>${columns.map((col) => `<td>${this.escapeHtml(String(this.cellValue((row as Record<keyof T, unknown>)[col.key])))}</td>`).join('')}</tr>`)
      .join('');

    const html = `
      <html>
      <head>
        <title>${this.escapeHtml(title)}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 16px; }
          h2 { margin-bottom: 14px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #bbb; padding: 8px; text-align: left; font-size: 12px; }
          th { background: #f0f0f0; }
        </style>
      </head>
      <body>
        <h2>${this.escapeHtml(title)}</h2>
        <table>
          <thead><tr>${tableHead}</tr></thead>
          <tbody>${tableBody}</tbody>
        </table>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=1000,height=700');
    if (!printWindow) return;
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  private cellValue(value: unknown): string | number | boolean {
    if (value === undefined || value === null) return '';
    if (typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string') return value;
    return JSON.stringify(value);
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
