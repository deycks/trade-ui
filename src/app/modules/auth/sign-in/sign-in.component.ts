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
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import { PortadaBienvenidaComponent } from '../../../shared/components/portada-bienvenida/portada-bienvenida.component';

@Component({
    selector: 'auth-sign-in',
    templateUrl: './sign-in.component.html',
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
export class AuthSignInComponent implements OnInit {
    @ViewChild('signInNgForm') signInNgForm!: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };
    signInForm!: UntypedFormGroup;
    showAlert: boolean = false;

    private readonly _rememberEmailKey = 'auth.rememberEmail';

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Create the form with custom validator for email or phone
        this.signInForm = this._formBuilder.group({
            email: [
                '',
                [
                    Validators.required,
                    AuthSignInComponent.emailOrPhoneValidator,
                ],
            ],
            password: ['', Validators.required],
            rememberMe: [''],
        });

        const rememberedEmail = localStorage.getItem(this._rememberEmailKey);
        if (rememberedEmail) {
            this.signInForm.patchValue({
                email: rememberedEmail,
                rememberMe: true,
            });
        }
    }

    /**
     * Custom validator to accept email or phone number
     */
    static emailOrPhoneValidator(
        control: AbstractControl
    ): { [key: string]: any } | null {
        const value = control.value;
        if (!value) return null;
        // Email regex (simple)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // Phone regex: accepts +, digits, spaces, parentheses, hyphens
        const phoneRegex = /^\+?[0-9\s\-()]{7,}$/;
        if (emailRegex.test(value) || phoneRegex.test(value)) {
            return null;
        }
        return { emailOrPhone: true };
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign in
     */
    signIn(): void {
        // Return if the form is invalid
        if (this.signInForm.invalid) {
            return;
        }
        console.log(this.signInForm);

        // Disable the form
        this.signInForm.disable();

        // Hide the alert
        this.showAlert = false;

        // Sign in
        const { rememberMe, email, password } = this.signInForm.value;
        // Email regex (simple)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        let payload: any = { password: (password ?? '').trim() };
        if (emailRegex.test(email)) {
            payload.email = (email ?? '').trim();
        } else {
            // Preservar el signo + si está presente
            let phoneValue = (email ?? '').trim();
            if (phoneValue.startsWith('+')) {
                payload.phone = '+' + phoneValue.slice(1).replace(/[^0-9]/g, '');
            } else {
                payload.phone = phoneValue.replace(/[^0-9]/g, '');
            }
        }
        this._authService.signIn(payload).subscribe(
            () => {
                if (rememberMe && payload.email) {
                    localStorage.setItem(this._rememberEmailKey, payload.email);
                } else {
                    localStorage.removeItem(this._rememberEmailKey);
                }

                // Navigate to dashboard
                this._router.navigateByUrl('/inicio');
            },
            (response) => {
                console.log(response);
                // Re-enable the form
                this.signInForm.enable();

                // Reset the form
                this.signInNgForm.resetForm();

                // Set the alert
                this.alert = {
                    type: 'error',
                    message:
                        'El correo electrónico, teléfono o la contraseña son incorrectos',
                };

                // Show the alert
                this.showAlert = true;
            }
        );
    }
}
