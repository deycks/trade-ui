import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { Transaction } from 'app/core/interfaces/transaction.interface';
import { ExportService } from 'app/core/services/export.service';
import { TransactionTypePipe } from 'app/shared/pipes/transaction-type.pipe';

@Component({
    selector: 'app-transactions-table',
    standalone: true,
    imports: [CommonModule, FormsModule, TransactionTypePipe, MatTableModule],
    templateUrl: './transactions-table.component.html',
})
export class TransactionsTableComponent {
    @Input() transactions: Transaction[] = [];
    selectedType = '';
    searchTerm = '';
    displayedColumns: string[] = ['date', 'type', 'description', 'amount'];

    constructor(private _exportService: ExportService) {}

    get filteredTransactions(): Transaction[] {
        const term = this.searchTerm.trim().toLowerCase();
        const normalizedType = this.selectedType.trim().toLowerCase();

        return (this.transactions ?? []).filter((t) => {
            const description = (t.description ?? '').toString().toLowerCase();
            const amount = (t.amount ?? '').toString().toLowerCase();
            const txType = (t.type ?? '').toString().toLowerCase();

            const matchesSearch = term
                ? description.includes(term) ||
                  amount.includes(term) ||
                  txType.includes(term)
                : true;

            const matchesType = normalizedType
                ? txType === normalizedType
                : true;

            return matchesSearch && matchesType;
        });
    }

    exportTransactions(): void {
        if (!this.filteredTransactions?.length) {
            return;
        }

        const exportData = this.filteredTransactions.map((t) => ({
            Fecha: t.createdAt
                ? new Date(t.createdAt).toLocaleString('es-MX')
                : '',
            Tipo: t.type ?? '',
            Descripcion: t.description ?? '',
            Monto: t.amount ?? '',
        }));

        this._exportService.exportToExcel(exportData, 'transacciones');
    }
}
