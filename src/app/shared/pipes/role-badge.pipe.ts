import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
    name: 'roleBadge',
    standalone: true,
})
export class RoleBadgePipe implements PipeTransform {
    constructor(private _sanitizer: DomSanitizer) {}

    transform(role: string | null | undefined): SafeHtml {
        const normalized = (role ?? '').toString();

        let label = normalized;
        let classes = 'bg-gray-100 text-gray-800';

        switch (normalized) {
            case 'CLIENT':
                label = 'Cliente';
                classes = 'bg-green-100 text-green-800';
                break;
            case 'PROSPECT':
                label = 'Prospecto';
                classes = 'bg-yellow-100 text-yellow-800';
                break;
            case 'ADMIN':
                label = 'Administrador';
                classes = 'bg-blue-100 text-blue-800';
                break;
            default:
                label = normalized;
        }

        const html = `<span class="px-2 py-1 text-xm rounded-full ${classes}">${label}</span>`;
        return this._sanitizer.bypassSecurityTrustHtml(html);
    }
}
