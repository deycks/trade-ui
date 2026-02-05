import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'transactionType',
    standalone: true,
})
export class TransactionTypePipe implements PipeTransform {
    transform(type: string | null | undefined): string {
        if (!type) {
            return '';
        }

        switch (type) {
            case 'DEPOSIT':
                return 'Depósito';
            case 'WITHDRAWAL':
                return 'Retiro';
            case 'YIELD':
                return 'Rendimiento';
            case 'ADJUSTMENT':
                return 'Ajuste';
            default:
                return type;
        }
    }
}
