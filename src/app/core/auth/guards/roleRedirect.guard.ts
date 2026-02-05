import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from 'app/core/services/user.service';
import { catchError, map, of, switchMap, take, tap } from 'rxjs';

export const RoleRedirectGuard: CanActivateFn = () => {
    const router = inject(Router);
    const userService = inject(UserService);

    return userService.user$.pipe(
        take(1),
        switchMap((user) => {
            // Si ya está en memoria, úsalo
            if (user) return of(user);

            // Si NO está, tráelo del backend
            return userService.get().pipe(
                tap((u) => (userService.user = u)),
                catchError(() => of(null))
            );
        }),
        map((user) => {
            const role = user?.role;

            if (role === 'ADMIN') return router.createUrlTree(['/admin']);
            if (role === 'CLIENT' || role === 'PROSPECT')
                return router.createUrlTree(['/dashboard']);

            // fallback: si no se pudo obtener user, a login (o a donde tú quieras)
            return router.createUrlTree(['/iniciar-sesion']);
        })
    );
};
