import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import {
    AbstractControl,
    FormsModule,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import { Subject, takeUntil } from 'rxjs';
import { PortadaBienvenidaComponent } from '../../../shared/components/portada-bienvenida/portada-bienvenida.component';

@Component({
    selector: 'auth-sign-up',
    templateUrl: './sign-up.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    imports: [
        RouterLink,
        FuseAlertComponent,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatCheckboxModule,
        MatProgressSpinnerModule,
        MatButtonToggleModule,
        PortadaBienvenidaComponent,
    ],
})
export class AuthSignUpComponent implements OnInit, OnDestroy {
    // ...existing code...

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };

    signUpForm!: UntypedFormGroup;
    showAlert = false;

    passwordStrength = {
        score: 0,
        percent: 0,
        label: 'Débil',
        colorClass: 'bg-red-500',
        rules: {
            minLength: false,
            upper: false,
            lower: false,
            number: false,
            special: false,
        },
    };

    private _unsubscribeAll = new Subject<void>();

    // Regex (MX)
    private readonly CURP_REGEX = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/;
    // RFC con homoclave: persona física (13) o moral (12)
    private readonly RFC_REGEX = /^([A-ZÑ&]{3,4})\d{6}([A-Z0-9]{3})$/;
    // Tel: + opcional, y 10 a 15 dígitos
    private readonly PHONE_REGEX = /^\+?\d{10,15}$/;
    // Password: min 8, may/min/número/especial
    private readonly PASSWORD_REGEX =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

    constructor(
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router
    ) {}

    ngOnInit(): void {
        this.signUpForm = this._formBuilder.group(
            {
                // Requeridos
                name: ['', [Validators.required]],
                email: ['', [Validators.required, Validators.email]],
                phone: [
                    '',
                    [
                        Validators.minLength(10),
                        Validators.maxLength(15),
                        Validators.pattern(this.PHONE_REGEX),
                    ],
                ],
                curp: ['', [Validators.pattern(this.CURP_REGEX)]],
                rfc: ['', [Validators.pattern(this.RFC_REGEX)]],
                address: [
                    '',
                    [Validators.minLength(10), Validators.maxLength(120)],
                ],
                password: [
                    '',
                    [
                        Validators.required,
                        Validators.minLength(8),
                        Validators.pattern(this.PASSWORD_REGEX),
                    ],
                ],
                confirmPassword: [
                    '',
                    [Validators.required, Validators.minLength(8)],
                ],

                // Checkbox
                agreements: [false, [Validators.requiredTrue]],
                // Selector de método de registro
                registrationMethod: ['email'],
            },
            { validators: [this._passwordsMatchValidator] }
        );

        this._updatePasswordStrength('');

        this.signUpForm
            .get('password')
            ?.valueChanges.pipe(takeUntil(this._unsubscribeAll))
            .subscribe((value) =>
                this._updatePasswordStrength((value ?? '').toString())
            );

        // registrationMethod ya está incluido en el FormGroup

        // Suscribirse a cambios y actualizar validaciones
        this.signUpForm
            .get('registrationMethod')!
            .valueChanges.subscribe((method) => {
                this._updateRegistrationValidators(method);
            });

        // Inicializar validaciones
        this._updateRegistrationValidators(
            this.signUpForm.get('registrationMethod')!.value
        );
    }

    /** Helper para template: c('name').hasError(...) */
    c(name: string): AbstractControl {
        return this.signUpForm.get(name)!;
    }

    private _passwordsMatchValidator(
        form: AbstractControl
    ): { passwordMismatch: boolean } | null {
        const passwordControl = form.get('password');
        const confirmControl = form.get('confirmPassword');
        const password = passwordControl?.value;
        const confirmPassword = confirmControl?.value;

        if (!password || !confirmPassword) {
            if (confirmControl?.hasError('passwordMismatch')) {
                const { passwordMismatch, ...errors } =
                    confirmControl.errors || {};
                confirmControl.setErrors(
                    Object.keys(errors).length ? errors : null
                );
            }
            return null;
        }

        if (password !== confirmPassword) {
            confirmControl?.setErrors({
                ...(confirmControl?.errors || {}),
                passwordMismatch: true,
            });
            return { passwordMismatch: true };
        }

        if (confirmControl?.hasError('passwordMismatch')) {
            const { passwordMismatch, ...errors } = confirmControl.errors || {};
            confirmControl.setErrors(
                Object.keys(errors).length ? errors : null
            );
        }

        return null;
    }

    private _updatePasswordStrength(password: string): void {
        const rules = {
            minLength: password.length >= 8,
            upper: /[A-Z]/.test(password),
            lower: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[^A-Za-z0-9]/.test(password),
        };

        const score = Object.values(rules).filter(Boolean).length;
        const percent = Math.round((score / 5) * 100);

        let label = 'Débil';
        let colorClass = 'bg-red-500';

        if (score >= 5) {
            label = 'Muy fuerte';
            colorClass = 'bg-emerald-500';
        } else if (score === 4) {
            label = 'Fuerte';
            colorClass = 'bg-green-500';
        } else if (score >= 2) {
            label = 'Media';
            colorClass = 'bg-amber-500';
        }

        this.passwordStrength = {
            score,
            percent,
            label,
            colorClass,
            rules,
        };
    }

    private _updateRegistrationValidators(method: 'email' | 'phone'): void {
        const emailControl = this.signUpForm.get('email');
        const phoneControl = this.signUpForm.get('phone');

        if (method === 'email') {
            emailControl?.setValidators([
                Validators.required,
                Validators.email,
            ]);
            phoneControl?.clearValidators();
        } else {
            phoneControl?.setValidators([
                Validators.required,
                Validators.pattern(/^\+?\d{10,15}$/),
            ]);
            emailControl?.clearValidators();
        }

        emailControl?.updateValueAndValidity();
        phoneControl?.updateValueAndValidity();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    signUp(): void {
        // Mostrar errores si hay
        this.signUpForm.markAllAsTouched();

        if (this.signUpForm.invalid) {
            return;
        }

        this.signUpForm.disable();
        this.showAlert = false;

        // Payload normalizado (CURP/RFC mayúsculas, trims)
        const v = this.signUpForm.getRawValue();
        let payload: any = {
            password: (v.password ?? '').trim(),
        };
        // Solo enviar email o phone según método
        if (v.registrationMethod === 'email') {
            payload.email = (v.email ?? '').trim();
        } else {
            payload.phone = (v.phone ?? '').trim();
        }
        // Campos adicionales
        payload.name = (v.name ?? '').trim();
        payload.address = (v.address ?? '').trim();
        payload.curp = (v.curp ?? '').toUpperCase().trim();
        payload.rfc = (v.rfc ?? '').toUpperCase().trim();

        this._authService.signUp(payload).subscribe(
            () => {
                this._router.navigateByUrl('/confirmacion-requerida');
            },
            () => {
                this.signUpForm.enable();
                this.signUpForm.reset();

                this.alert = {
                    type: 'error',
                    message: 'Ocurrió un error. Por favor, inténtalo de nuevo.',
                };
                this.showAlert = true;
            }
        );
    }
}
