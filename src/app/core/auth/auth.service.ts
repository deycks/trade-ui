import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/core/services/user.service';
import { environment } from 'environments/environment';
import { catchError, Observable, of, switchMap, tap, throwError } from 'rxjs';

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
        if (!token) {
            localStorage.removeItem('accessToken');
            return;
        }

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
            return throwError(() => new Error('User is already logged in.'));
        }

        return this._httpClient
            .post<{
                access_token: string;
            }>(`${environment.apiUrl}/auth/login`, credentials, {
                withCredentials: true,
            })
            .pipe(
                tap((loginResponse) => {
                    this.accessToken = loginResponse.access_token;
                    this._authenticated = true;
                }),
                switchMap(() => this._userService.get()),
                tap((user) => {
                    this._userService.user = user;
                }),
                catchError((err) => {
                    // rollback
                    this._authenticated = false;
                    this.accessToken = null as any;
                    return throwError(() => err);
                })
            );
    }

    /**
     * Refresh access token using HttpOnly cookie
     */
    refreshToken(): Observable<{ access_token: string }> {
        return this._httpClient
            .post<{
                access_token: string;
            }>(
                `${environment.apiUrl}/auth/refresh`,
                {},
                { withCredentials: true }
            )
            .pipe(
                tap((response) => {
                    this.accessToken = response.access_token;
                    this._authenticated = true;
                })
            );
    }

    /**
     * Sign out
     */
    signOut(): Observable<any> {
        try {
            const headers = this.accessToken
                ? new HttpHeaders({
                      Authorization: `Bearer ${this.accessToken}`,
                  })
                : undefined;

            return this._httpClient
                .post(
                    `${environment.apiUrl}/auth/logout`,
                    {},
                    { withCredentials: true, headers }
                )
                .pipe(
                    tap(() => {
                        localStorage.removeItem('accessToken');
                        this._authenticated = false;
                    }),
                    catchError(() => {
                        localStorage.removeItem('accessToken');
                        this._authenticated = false;
                        return of(true);
                    })
                );
        } catch (error) {
            console.log('Error during sign out:', error);
        }
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

        // 3) Si expiró, intentar refresh con la cookie HttpOnly
        if (AuthUtils.isTokenExpired(token)) {
            return this.refreshToken().pipe(
                switchMap(() => this._userService.get()),
                tap((user) => {
                    this._userService.user = user;
                }),
                switchMap(() => of(true)),
                catchError(() => {
                    localStorage.removeItem('accessToken');
                    this._authenticated = false;
                    return of(false);
                })
            );
        }

        // 4) Token válido -> marcar autenticado y cargar perfil real
        this._authenticated = true;

        return this._userService.get().pipe(
            tap((user) => {
                this._userService.user = user;
            }),
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
