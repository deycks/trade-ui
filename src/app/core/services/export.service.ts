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
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');
        XLSX.writeFile(workbook, `${fileName}-${timestamp}.xlsx`);
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
