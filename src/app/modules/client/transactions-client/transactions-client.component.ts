import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Transaction } from 'app/core/interfaces/transaction.interface';
import { ClientService } from 'app/core/services/client.service';
import { EmptyStateComponent } from 'app/shared/components/empty-state/empty-state.component';
import { LoadingComponent } from 'app/shared/components/loading/loading.component';
import { TransactionsTableComponent } from 'app/shared/components/transactions-table/transactions-table.component';
import { Observable, shareReplay, Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-transactions-client',
    imports: [
        CommonModule,
        FormsModule,
        EmptyStateComponent,
        LoadingComponent,
        TransactionsTableComponent,
    ],
    templateUrl: './transactions-client.component.html',
})
export class TransactionsClientComponent implements OnInit, OnDestroy {
    transactions$!: Observable<Transaction[]>;
    private _unsubscribeAll = new Subject<void>();

    constructor(private _clientService: ClientService) {}

    ngOnInit(): void {
        this.transactions$ = this._clientService
            .getTransactions()
            .pipe(shareReplay(1));
        this.transactions$.pipe(takeUntil(this._unsubscribeAll)).subscribe();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}
