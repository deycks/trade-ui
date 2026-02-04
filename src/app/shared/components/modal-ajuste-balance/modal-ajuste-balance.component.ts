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
        const payload: AdjustBalancePayload = {
            amount: this.adjustForm.amount ?? 0,
            type: this.adjustForm.type,
            description: this.adjustForm.description,
            createdAt: this.adjustForm.createdAt
                ? new Date(this.adjustForm.createdAt).toISOString()
                : undefined,
        };

        this.save.emit(payload);
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
}
