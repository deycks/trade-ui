import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import {
    AbstractControl,
    FormsModule,
    NgForm,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import { PortadaBienvenidaComponent } from '../portada-bienvenida/portada-bienvenida.component';

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
        PortadaBienvenidaComponent,
    ],
})
export class AuthSignUpComponent implements OnInit {
    @ViewChild('signUpNgForm') signUpNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };

    signUpForm: UntypedFormGroup;
    showAlert = false;

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
        this.signUpForm = this._formBuilder.group({
            // Requeridos
            name: [
                '',
                [
                    Validators.required,
                    Validators.minLength(3),
                    Validators.maxLength(30),
                ],
            ],
            email: ['', [Validators.required, Validators.email]],
            phone: [
                '',
                [
                    Validators.required,
                    Validators.minLength(10),
                    Validators.maxLength(15),
                    Validators.pattern(this.PHONE_REGEX),
                ],
            ],
            curp: [
                '',
                [Validators.required, Validators.pattern(this.CURP_REGEX)],
            ],
            rfc: [
                '',
                [Validators.required, Validators.pattern(this.RFC_REGEX)],
            ],
            address: [
                '',
                [
                    Validators.required,
                    Validators.minLength(10),
                    Validators.maxLength(120),
                ],
            ],
            password: [
                '',
                [
                    Validators.required,
                    Validators.minLength(8),
                    Validators.pattern(this.PASSWORD_REGEX),
                ],
            ],

            // Checkbox
            agreements: [false, [Validators.requiredTrue]],
        });
    }

    /** Helper para template: c('name').hasError(...) */
    c(name: string): AbstractControl {
        return this.signUpForm.get(name)!;
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
        const payload = {
            password: (v.password ?? '').trim(),
            name: (v.name ?? '').trim(),
            email: (v.email ?? '').trim(),
            phone: (v.phone ?? '').trim(),
            address: (v.address ?? '').trim(),
            curp: (v.curp ?? '').toUpperCase().trim(),
            rfc: (v.rfc ?? '').toUpperCase().trim(),
        };

        this._authService.signUp(payload).subscribe(
            () => {
                this._router.navigateByUrl('/confirmation-required');
            },
            () => {
                this.signUpForm.enable();
                this.signUpNgForm.resetForm();

                this.alert = {
                    type: 'error',
                    message: 'Ocurrió un error. Por favor, inténtalo de nuevo.',
                };
                this.showAlert = true;
            }
        );
    }
}
