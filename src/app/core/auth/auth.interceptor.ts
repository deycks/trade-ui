import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandlerFn,
    HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from 'app/core/auth/auth.service';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { Observable, catchError, switchMap, throwError } from 'rxjs';

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
            if (
                error instanceof HttpErrorResponse &&
                error.status === 401 &&
                !isPublicAuthEndpoint &&
                !req.headers.has('x-refresh')
            ) {
                return authService.refreshToken().pipe(
                    switchMap(() => {
                        const retriedReq = req.clone({
                            setHeaders: {
                                Authorization: `Bearer ${authService.accessToken}`,
                                'x-refresh': 'true',
                            },
                        });

                        return next(retriedReq);
                    }),
                    catchError((refreshError) => {
                        authService.signOut().subscribe();
                        location.reload();
                        return throwError(() => refreshError);
                    })
                );
            }

            return throwError(() => error);
        })
    );
};
