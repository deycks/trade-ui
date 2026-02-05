import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Transaction } from 'app/core/interfaces/transaction.interface';
import { TransactionTypePipe } from 'app/shared/pipes/transaction-type.pipe';

@Component({
    selector: 'app-transactions-table',
    standalone: true,
    imports: [CommonModule, TransactionTypePipe],
    templateUrl: './transactions-table.component.html',
})
export class TransactionsTableComponent {
    @Input() transactions: Transaction[] = [];
}
