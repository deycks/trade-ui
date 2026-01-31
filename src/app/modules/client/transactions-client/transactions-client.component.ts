import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Transaction } from 'app/core/interfaces/transaction.interface';
import { ClientService } from 'app/core/services/client.service';
import { LoadingComponent } from 'app/layout/common/loading/loading.component';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-transactions-client',
    imports: [CommonModule, LoadingComponent],
    templateUrl: './transactions-client.component.html',
})
export class TransactionsClientComponent implements OnInit {
    transactions$!: Observable<Transaction[]>;

    constructor(private _clientService: ClientService) {}

    ngOnInit(): void {
        this.transactions$ = this._clientService.getTransactions();
    }
}
