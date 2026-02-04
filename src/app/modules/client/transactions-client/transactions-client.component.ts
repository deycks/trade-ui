import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Transaction } from 'app/core/interfaces/transaction.interface';
import { ClientService } from 'app/core/services/client.service';
import { ExportService } from 'app/core/services/export.service';
import { LoadingComponent } from 'app/layout/common/loading/loading.component';
import {
    BehaviorSubject,
    combineLatest,
    map,
    Observable,
    shareReplay,
    Subject,
    takeUntil,
} from 'rxjs';

@Component({
    selector: 'app-transactions-client',
    imports: [CommonModule, FormsModule, LoadingComponent],
    templateUrl: './transactions-client.component.html',
})
export class TransactionsClientComponent implements OnInit, OnDestroy {
    transactions$!: Observable<Transaction[]>;
    filteredTransactions$!: Observable<Transaction[]>;
    searchTerm = '';
    selectedType = '';
    filteredTransactions: Transaction[] = [];
    totalTransactions = 0;

    private _searchTerm$ = new BehaviorSubject<string>('');
    private _type$ = new BehaviorSubject<string>('');
    private _unsubscribeAll = new Subject<void>();

    constructor(
        private _clientService: ClientService,
        private _exportService: ExportService
    ) {}

    ngOnInit(): void {
        this.transactions$ = this._clientService
            .getTransactions()
            .pipe(shareReplay(1));
        this.filteredTransactions$ = combineLatest([
            this.transactions$,
            this._searchTerm$,
            this._type$,
        ]).pipe(
            map(([transactions, term, type]) => {
                const normalized = term.trim().toLowerCase();
                const normalizedType = type.trim().toLowerCase();

                return transactions.filter((t) => {
                    const description = (t.description ?? '')
                        .toString()
                        .toLowerCase();
                    const amount = (t.amount ?? '').toString().toLowerCase();
                    const txType = (t.type ?? '').toString().toLowerCase();

                    const matchesSearch = normalized
                        ? description.includes(normalized) ||
                          amount.includes(normalized) ||
                          txType.includes(normalized)
                        : true;

                    const matchesType = normalizedType
                        ? txType === normalizedType
                        : true;

                    return matchesSearch && matchesType;
                });
            })
        );

        this.transactions$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((transactions) => {
                this.totalTransactions = transactions?.length ?? 0;
            });

        this.filteredTransactions$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((transactions) => {
                this.filteredTransactions = transactions;
            });
    }

    onSearch(term: string): void {
        this.searchTerm = term;
        this._searchTerm$.next(term);
    }

    onTypeChange(type: string): void {
        this.selectedType = type;
        this._type$.next(type);
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

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}
