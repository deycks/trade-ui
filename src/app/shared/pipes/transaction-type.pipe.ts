import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
    name: 'transactionType',
    standalone: true,
})
export class TransactionTypePipe implements PipeTransform {
    constructor(private _sanitizer: DomSanitizer) {}

    transform(type: string | null | undefined, status?: string): SafeHtml {
        if (!type) {
            return '';
        }

        let label = '';
        let classes = 'bg-gray-100 text-gray-800';
        let icon = '';

        switch (type) {
            case 'DEPOSIT':
                label = 'Depósito';
                classes = 'bg-blue-100 text-blue-800';
                icon =
                    '<svg class="inline w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>';
                break;
            case 'WITHDRAWAL':
                label = 'Retiro';
                classes = 'bg-red-100 text-red-800';
                icon =
                    '<svg class="inline w-4 h-4 mr-1 text-red-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="2"/></svg>';
                break;
            case 'YIELD':
                label = 'Rendimiento';
                classes = 'bg-green-100 text-green-800';
                icon =
                    '<svg class="inline w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 12l5 5l10-10"/></svg>';
                break;
            case 'ADJUSTMENT':
                label = 'Ajuste';
                classes = 'bg-yellow-100 text-yellow-800';
                icon =
                    '<svg class="inline w-4 h-4 mr-1 text-yellow-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 15.5a3.5 3.5 0 1 1 0-7a3.5 3.5 0 0 1 0 7zm7.5-3.5a1 1 0 0 1-1 1h-1.09a5.5 5.5 0 0 1-1.32 2.27l.77.77a1 1 0 0 1-1.41 1.41l-.77-.77A5.5 5.5 0 0 1 13.5 18.09V19a1 1 0 0 1-2 0v-1.09a5.5 5.5 0 0 1-2.27-1.32l-.77.77a1 1 0 0 1-1.41-1.41l.77-.77A5.5 5.5 0 0 1 5.91 13.5H5a1 1 0 0 1 0-2h1.09a5.5 5.5 0 0 1 1.32-2.27l-.77-.77a1 1 0 0 1 1.41-1.41l.77.77A5.5 5.5 0 0 1 10.5 5.91V5a1 1 0 0 1 2 0v1.09a5.5 5.5 0 0 1 2.27 1.32l.77-.77a1 1 0 0 1 1.41 1.41l-.77.77A5.5 5.5 0 0 1 18.09 10.5H19a1 1 0 0 1 0 2z"/></svg>';
                break;
            case 'TRANSFER':
                if (status === 'APPROVED') {
                    label = 'Transferencia aprobada';
                    classes = 'bg-green-100 text-green-800';
                    icon = '<svg class="inline w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 12l5 5l10-10"/></svg>';
                } else if (status === 'REJECTED') {
                    label = 'Transferencia rechazada';
                    classes = 'bg-red-100 text-red-800';
                    icon = '<svg class="inline w-4 h-4 mr-1 text-red-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/><line x1="6" y1="18" x2="18" y2="6" stroke="currentColor" stroke-width="2"/></svg>';
                } else {
                    label = 'Transferencia pendiente';
                    classes = 'bg-purple-100 text-purple-800';
                    icon = '<svg class="inline w-4 h-4 mr-1 text-purple-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6l4 2"/></svg>';
                }
                break;
            default:
                label = type;
        }

        const html = `<span class="px-2 py-1 text-xm rounded-full ${classes}">${icon}${label}</span>`;
        return this._sanitizer.bypassSecurityTrustHtml(html);
    }
}
