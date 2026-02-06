import { CommonModule } from '@angular/common';
import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdjustBalancePayload } from 'app/core/interfaces/balance.interface';
import { Client } from 'app/core/interfaces/user.interface';
import { FuseConfirmationService } from '@fuse/services/confirmation';

@Component({
    selector: 'app-modal-ajuste-balance',
    imports: [CommonModule, FormsModule],
    templateUrl: './modal-ajuste-balance.component.html',
})
export class ModalAjusteBalanceComponent implements OnChanges {
    @Input() isOpen = false;
    @Input() client: Client | null = null;
    @Input() isSaving = false;

    @Output() close = new EventEmitter<void>();
    @Output() save = new EventEmitter<AdjustBalancePayload>();

    adjustForm = {
        amount: null as number | null,
        type: '',
        description: '',
        createdAt: '',
    };

    constructor(private _fuseConfirmationService: FuseConfirmationService) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['isOpen']?.currentValue || changes['client']) {
            if (this.isOpen) {
                this._resetForm();
            }
        }
    }

    onClose(): void {
        this.close.emit();
    }

    onSubmit(): void {
        const dialogRef = this._fuseConfirmationService.open({
            title: 'Confirmar transacción',
            message: this._buildConfirmMessageHtml(),
            icon: {
                show: true,
                name: 'heroicons_outline:exclamation-triangle',
                color: 'warning',
            },
            actions: {
                confirm: {
                    show: true,
                    label: 'Guardar',
                    color: 'primary',
                },
                cancel: {
                    show: true,
                    label: 'Cancelar',
                },
            },
            dismissible: true,
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result !== 'confirmed') {
                return;
            }

            const payload: AdjustBalancePayload = {
                amount: this.adjustForm.amount ?? 0,
                type: this.adjustForm.type,
                description: this.adjustForm.description,
                createdAt: this.adjustForm.createdAt
                    ? new Date(this.adjustForm.createdAt).toISOString()
                    : undefined,
            };

            this.save.emit(payload);
        });
    }

    private _resetForm(): void {
        this.adjustForm = {
            amount: null,
            type: '',
            description: '',
            createdAt: this._getLocalDateTime(),
        };
    }

    private _getLocalDateTime(): string {
        const now = new Date();
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
    }

    private _buildConfirmMessageHtml(): string {
        const amount = this._formatCurrency(this.adjustForm.amount ?? 0);
        const typeLabel = this._getTypeLabel(this.adjustForm.type);
        const description = this.adjustForm.description?.trim() || 'Sin descripción';
        const dateLabel = this.adjustForm.createdAt
            ? new Date(this.adjustForm.createdAt).toLocaleString('es-MX')
            : 'Sin fecha';

        return (
            `<strong>Cliente:</strong> ${this.client?.name ?? 'N/A'}<br>` +
            `<strong>Tipo:</strong> ${typeLabel}<br>` +
            `<strong>Monto:</strong> ${amount}<br>` +
            `<strong>Fecha:</strong> ${dateLabel}<br>` +
            `<strong>Descripción:</strong> ${description}<br><br>` +
            `¿Deseas guardar esta transacción?`
        );
    }

    private _getTypeLabel(type: string): string {
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
                return 'Sin tipo';
        }
    }

    private _formatCurrency(amount: number): string {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    }
}
