import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandlerFn,
    HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from 'app/core/auth/auth.service';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { Observable, catchError, throwError } from 'rxjs';

export const authInterceptor = (
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
    const authService = inject(AuthService);

    // 1) Endpoints públicos donde NO se debe adjuntar token
    const isPublicAuthEndpoint =
        req.url.includes('/auth/login') ||
        req.url.includes('/auth/register') ||
        req.url.includes('/auth/refresh'); // por si luego lo agregas

    let newReq = req;

    // 2) Adjuntar token SOLO si:
    // - existe
    // - no expiró
    // - NO es un endpoint público
    if (
        !isPublicAuthEndpoint &&
        authService.accessToken &&
        !AuthUtils.isTokenExpired(authService.accessToken)
    ) {
        newReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${authService.accessToken}`,
            },
        });
    }

    return next(newReq).pipe(
        catchError((error: unknown) => {
            // 3) Si backend responde 401, se cierra sesión
            if (
                error instanceof HttpErrorResponse &&
                error.status === 401 &&
                !isPublicAuthEndpoint
            ) {
                authService.signOut();

                // Mejor que recargar a lo bestia: manda a sign-in (si tienes Router en AuthService)
                // Si no quieres tocar más, deja el reload:
                location.reload();
            }

            return throwError(() => error);
        })
    );
};
