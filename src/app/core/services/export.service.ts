import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

@Injectable({
    providedIn: 'root',
})
export class ExportService {
    exportToExcel(
        data: Array<Record<string, unknown>>,
        fileName = 'export'
    ): void {
        if (!data?.length) {
            return;
        }

        const timestamp = new Date()
            .toISOString()
            .slice(0, 19)
            .replace(/[:T]/g, '-');
        const formattedData = data.map((item) => {
            const formattedItem: Record<string, string> = {};
            Object.keys(item).forEach((key) => {
                formattedItem[key] = this._formatValue(item[key]);
            });
            return formattedItem;
        });

        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        worksheet['!cols'] = this._getColumnWidths(formattedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');
        XLSX.writeFile(workbook, `${fileName}-${timestamp}.xlsx`);
    }

    private _getColumnWidths(
        data: Array<Record<string, string>>
    ): Array<{ wch: number }> {
        const headers = data.length ? Object.keys(data[0]) : [];
        const widths = headers.map((header) => header.length);

        data.forEach((row) => {
            headers.forEach((header, index) => {
                const cellValue = row[header] ?? '';
                widths[index] = Math.max(widths[index], String(cellValue).length);
            });
        });

        return widths.map((wch) => ({ wch: Math.min(Math.max(wch + 2, 10), 60) }));
    }

    private _formatValue(value: unknown): string {
        if (value === null || value === undefined) {
            return '';
        }

        if (value instanceof Date) {
            return value.toLocaleString('es-MX');
        }

        return String(value);
    }
}
