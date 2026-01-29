import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/core/user/user.service';
import { environment } from 'environments/environment';
import { catchError, Observable, of, switchMap, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private _authenticated: boolean = false;
    private _httpClient = inject(HttpClient);
    private _userService = inject(UserService);

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string) {
        localStorage.setItem('accessToken', token);
    }

    get accessToken(): string {
        return localStorage.getItem('accessToken') ?? '';
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Forgot password
     *
     * @param email
     */
    forgotPassword(email: string): Observable<any> {
        return this._httpClient.post('api/auth/forgot-password', email);
    }

    /**
     * Reset password
     *
     * @param password
     */
    resetPassword(password: string): Observable<any> {
        return this._httpClient.post('api/auth/reset-password', password);
    }

    /**
     * Sign in
     *
     * @param credentials
     */
    signIn(credentials: { email: string; password: string }): Observable<any> {
        if (this._authenticated) {
            return throwError(() => 'User is already logged in.');
        }

        return this._httpClient
            .post<{
                access_token: string;
            }>(`${environment.apiUrl}/auth/login`, credentials)
            .pipe(
                switchMap((loginResponse) => {
                    // 1️⃣ Guardar token
                    this.accessToken = loginResponse.access_token;
                    this._authenticated = true;

                    // 2️⃣ Obtener perfil con token
                    return this._userService.get();
                }),
                switchMap((user) => {
                    console.log(user);
                    // 3️⃣ Guardar usuario en UserService (Fuse)
                    this._userService.user = user;

                    // 4️⃣ Devolver algo útil
                    return of(user);
                })
            );
    }

    /**
     * Sign out
     */
    signOut(): Observable<any> {
        // Remove the access token from the local storage
        localStorage.removeItem('accessToken');

        // Set the authenticated flag to false
        this._authenticated = false;

        // Return the observable
        return of(true);
    }

    /**
     * Sign up
     *
     * @param user
     */
    signUp(user: {
        password: string;
        name: string;
        email: string;
        phone: string;
        curp: string;
        rfc: string;
        address: string;
    }): Observable<any> {
        return this._httpClient.post(
            `${environment.apiUrl}/auth/register`,
            user
        );
    }

    /**
     * Unlock session
     *
     * @param credentials
     */
    unlockSession(credentials: {
        email: string;
        password: string;
    }): Observable<any> {
        return this._httpClient.post('api/auth/unlock-session', credentials);
    }

    /**
     * Check the authentication status
     */
    check(): Observable<boolean> {
        // 1) Si ya está autenticado en memoria
        if (this._authenticated) {
            return of(true);
        }

        // 2) Si no hay token
        const token = this.accessToken;
        if (!token) {
            return of(false);
        }

        // 3) Si expiró
        if (AuthUtils.isTokenExpired(token)) {
            localStorage.removeItem('accessToken');
            this._authenticated = false;
            return of(false);
        }

        // 4) Token válido -> marcar autenticado y cargar perfil real
        this._authenticated = true;

        return this._userService.get().pipe(
            switchMap(() => of(true)),
            catchError(() => {
                // Si falla /auth/profile, el token no sirve o la sesión no es válida
                localStorage.removeItem('accessToken');
                this._authenticated = false;
                return of(false);
            })
        );
    }
}
