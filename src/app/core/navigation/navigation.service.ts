import { inject, Injectable } from '@angular/core';
import { FuseNavigationItem } from '@fuse/components/navigation/public-api';
import { Navigation } from 'app/core/navigation/navigation.types';
import { filter, map, Observable, ReplaySubject, take, tap } from 'rxjs';
import { User } from '../interfaces/user.interface';
import { UserService } from '../services/user.service';

export const clientNavigation: FuseNavigationItem[] = [
    {
        id: 'inicio',
        title: 'Inicio',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/dashboard',
    },
    {
        id: 'movimientos',
        title: 'Movimientos',
        type: 'basic',
        icon: 'heroicons_outline:list-bullet',
        link: '/movimientos',
    },
];

export const adminNavigation: FuseNavigationItem[] = [
    {
        id: 'inicio',
        title: 'Inicio',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/admin',
    },
    {
        id: 'clientes',
        title: 'Clientes',
        type: 'basic',
        icon: 'heroicons_outline:user-group',
        link: '/clientes',
    },
    {
        id: 'logs',
        title: 'Logs de auditoría',
        type: 'basic',
        icon: 'heroicons_outline:presentation-chart-bar',
        link: '/logs',
    },
];

@Injectable({ providedIn: 'root' })
export class NavigationService {
    private _userService = inject(UserService);
    private _navigation: ReplaySubject<Navigation> =
        new ReplaySubject<Navigation>(1);

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for navigation
     */
    get navigation$(): Observable<Navigation> {
        return this._navigation.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get all navigation data
     */
    get(): Observable<Navigation> {
        return this._userService.user$.pipe(
            filter((user: User | null | undefined): user is User => !!user),
            take(1),
            map((user: User) => {
                let navigationItems: FuseNavigationItem[] = [];

                if (user.role === 'CLIENT' || user.role === 'PROSPECT') {
                    navigationItems = clientNavigation;
                } else if (user.role === 'ADMIN') {
                    navigationItems = adminNavigation;
                }

                const navigation: Navigation = { default: navigationItems };

                return navigation;
            }),
            tap((navigation) => this._navigation.next(navigation))
        );
    }
}
