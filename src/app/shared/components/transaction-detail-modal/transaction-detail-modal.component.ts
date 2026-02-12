import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-transaction-detail-modal',
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './transaction-detail-modal.component.html',
})
export class TransactionDetailModalComponent {
    reason: string = '';
    reasonTouched = false;

    constructor(
        public dialogRef: MatDialogRef<TransactionDetailModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {}

    get reasonError(): string | null {
        if (!this.reasonTouched) return null;
        if (!this.reason || this.reason.trim().length < 10)
            return 'La razón es requerida y debe tener al menos 10 caracteres.';
        if (this.reason.length > 500)
            return 'La razón no puede exceder 500 caracteres.';
        return null;
    }

    isReasonValid(): boolean {
        return (
            !!this.reason &&
            this.reason.trim().length >= 10 &&
            this.reason.length <= 500
        );
    }

    onAccept(): void {
        this.reasonTouched = true;
        if (!this.isReasonValid()) return;
        this.dialogRef.close({
            action: 'accept',
            id: this.data.id,
            reason: this.reason,
        });
    }

    onReject(): void {
        this.reasonTouched = true;
        if (!this.isReasonValid()) return;
        this.dialogRef.close({
            action: 'reject',
            id: this.data.id,
            reason: this.reason,
        });
    }

    onClose(): void {
        this.dialogRef.close('close');
    }
}
