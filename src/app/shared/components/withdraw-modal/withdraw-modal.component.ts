import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';

@Component({
    selector: 'app-withdraw-modal',
    imports: [ReactiveFormsModule, CommonModule],
    templateUrl: './withdraw-modal.component.html',
    styleUrls: ['./withdraw-modal.component.scss'],
})
export class WithdrawModalComponent implements OnInit {
    rememberBankDetails = false;
    private readonly STORAGE_KEY_PREFIX = 'withdrawBankDetails_';
    private get STORAGE_KEY(): string {
        // Reemplaza esto por el método real para obtener el ID único del usuario
        const userId = this.getCurrentUserId();
        return `${this.STORAGE_KEY_PREFIX}${userId}`;
    }

    // Método simulado para obtener el ID del usuario
    private getCurrentUserId(): string {
        // Reemplaza esto por la lógica real de tu app
        // Ejemplo: return this.authService.currentUser.id;
        return localStorage.getItem('currentUserId') || 'default';
    }
    @Output() submitTransfer = new EventEmitter<any>();
    @Output() close = new EventEmitter<void>();

    form: FormGroup;

    constructor(private fb: FormBuilder) {
        this.form = this.fb.group({
            amount: [
                null,
                [
                    Validators.required,
                    Validators.min(1),
                    Validators.pattern(/^\d+(\.\d{1,2})?$/),
                ],
            ],
            bankClabe: [
                '',
                [Validators.required, Validators.pattern(/^\d{18}$/)],
            ],
            bankName: [
                '',
                [
                    Validators.required,
                    Validators.minLength(3),
                    Validators.maxLength(50),
                ],
            ],
            beneficiary: [
                '',
                [
                    Validators.required,
                    Validators.minLength(3),
                    Validators.maxLength(50),
                ],
            ],
        });
    }

    ngOnInit(): void {
        // Load saved bank details if present
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.form.patchValue({
                    bankClabe: data.bankClabe || '',
                    bankName: data.bankName || '',
                    beneficiary: data.beneficiary || '',
                });
                this.rememberBankDetails = true;
            } catch {}
        }

        // Watch for changes in the three fields
        this.form
            .get('bankClabe')
            ?.valueChanges.subscribe(() => this.handleBankFieldsChange());
        this.form
            .get('bankName')
            ?.valueChanges.subscribe(() => this.handleBankFieldsChange());
        this.form
            .get('beneficiary')
            ?.valueChanges.subscribe(() => this.handleBankFieldsChange());
    }

    handleBankFieldsChange() {
        if (this.rememberBankDetails) {
            const { bankClabe, bankName, beneficiary } = this.form.value;
            localStorage.setItem(
                this.STORAGE_KEY,
                JSON.stringify({ bankClabe, bankName, beneficiary })
            );
        }
    }

    onSubmit() {
        if (this.form.valid) {
            if (!this.rememberBankDetails) {
                localStorage.removeItem(this.STORAGE_KEY);
            } else {
                // Save current values in case user checked after editing
                const { bankClabe, bankName, beneficiary } = this.form.value;
                localStorage.setItem(
                    this.STORAGE_KEY,
                    JSON.stringify({ bankClabe, bankName, beneficiary })
                );
            }
            this.submitTransfer.emit(this.form.value);
        } else {
            this.form.markAllAsTouched();
        }
    }

    onClose() {
        this.close.emit();
    }
}
