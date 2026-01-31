import { inject } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanActivateChildFn,
    CanActivateFn,
    Router,
} from '@angular/router';
import { UserService } from 'app/core/services/user.service';
import { map, take } from 'rxjs/operators';

function checkRole(route: ActivatedRouteSnapshot) {
    const router = inject(Router);
    const userService = inject(UserService);

    const allowedRoles = route.data['roles'] as
        | Array<'ADMIN' | 'CLIENT' | 'PROSPECT'>
        | undefined;

    return userService.user$.pipe(
        take(1),
        map((user) => {
            const role = user?.role as
                | 'ADMIN'
                | 'CLIENT'
                | 'PROSPECT'
                | undefined;

            const ok =
                !allowedRoles?.length ||
                (!!role && allowedRoles.includes(role));

            return ok ? true : router.createUrlTree(['/inicio']);
        })
    );
}

export const RoleGuard: CanActivateFn | CanActivateChildFn = (route) =>
    checkRole(route);
