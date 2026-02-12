import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Transaction } from 'app/core/interfaces/transaction.interface';
import { User } from 'app/core/interfaces/user.interface';
import { ExportService } from 'app/core/services/export.service';
import { TransferService } from 'app/core/services/transfer.service';
import { UserService } from 'app/core/services/user.service';
import { TransactionTypePipe } from 'app/shared/pipes/transaction-type.pipe';
import { TransactionDetailModalComponent } from '../transaction-detail-modal/transaction-detail-modal.component';

@Component({
    selector: 'app-transactions-table',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TransactionTypePipe,
        MatTableModule,
        MatTooltipModule,
    ],
    templateUrl: './transactions-table.component.html',
})
export class TransactionsTableComponent {
    @Input() transactions: Transaction[] = [];
    @Input() detailClientComponent?: any;
    selectedType = '';
    searchTerm = '';
    displayedColumns: string[] = [
        'date',
        'type',
        'description',
        'view',
        'amount',
    ];
    userRole: string | null = null;

    constructor(
        private _exportService: ExportService,
        private _userService: UserService,
        private dialog: MatDialog,
        private transferService: TransferService,
        private snackBar: MatSnackBar
    ) {
        this._userService.user$.subscribe((user: User) => {
            this.userRole = user?.role ?? null;
        });
    }
    isAdmin(): boolean {
        return this.userRole === 'ADMIN';
    }

    get filteredTransactions(): Transaction[] {
        const term = this.searchTerm.trim().toLowerCase();
        const normalizedType = this.selectedType.trim();

        return (this.transactions ?? []).filter((t) => {
            const description = (t.description ?? '').toString().toLowerCase();
            const amount = (t.amount ?? '').toString().toLowerCase();
            const txType = (t.type ?? '').toString();
            const txStatus = (t.status ?? '').toString();

            const matchesSearch = term
                ? description.includes(term) ||
                  amount.includes(term) ||
                  txType.toLowerCase().includes(term)
                : true;

            let matchesType = true;
            if (normalizedType) {
                if (normalizedType.startsWith('TRANSFER:')) {
                    const [, status] = normalizedType.split(':');
                    matchesType = txType === 'TRANSFER' && txStatus === status;
                } else {
                    matchesType = txType === normalizedType;
                }
            }

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

    openDetailModal(transaction: Transaction): void {
        const dialogRef = this.dialog.open(TransactionDetailModalComponent, {
            data: {
                id: transaction.id,
                amount: transaction.amount,
                description: transaction.description,
                createdAt: transaction.createdAt,
                bankClabe: transaction.bankClabe,
                bankName: transaction.bankName,
                beneficiary: transaction.beneficiary,
            },
            width: '400px',
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (result && result.action === 'accept') {
                this.transferService
                    .approveTransfer(transaction.id, result.reason)
                    .subscribe({
                        next: (res) => {
                            this.snackBar.open(
                                res.message || 'Transfer approved successfully',
                                '',
                                {
                                    duration: 3000,
                                    panelClass: ['bg-green-600', 'text-white'],
                                }
                            );
                            if (this.detailClientComponent) {
                                this.detailClientComponent.refreshUserDetail();
                            }
                        },
                        error: (err) => {
                            this.snackBar.open(
                                'Error al aprobar transferencia',
                                '',
                                {
                                    duration: 3000,
                                    panelClass: ['bg-red-600', 'text-white'],
                                }
                            );
                        },
                    });
            } else if (result && result.action === 'reject') {
                this.transferService
                    .rejectTransfer(transaction.id, result.reason)
                    .subscribe({
                        next: (res) => {
                            this.snackBar.open(
                                res.message || 'Transfer rejected successfully',
                                '',
                                {
                                    duration: 3000,
                                    panelClass: ['bg-red-600', 'text-white'],
                                }
                            );
                            if (this.detailClientComponent) {
                                this.detailClientComponent.refreshUserDetail();
                            }
                        },
                        error: (err) => {
                            this.snackBar.open(
                                'Error al rechazar transferencia',
                                '',
                                {
                                    duration: 3000,
                                    panelClass: ['bg-red-600', 'text-white'],
                                }
                            );
                        },
                    });
            }
        });
    }
}
