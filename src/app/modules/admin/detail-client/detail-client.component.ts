import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Client } from 'app/core/interfaces/user.interface';
import { DashboardAdminService } from 'app/core/services/dashboardAdmin.service';
import { LoadingComponent } from 'app/layout/common/loading/loading.component';
import { of, Subject, switchMap, takeUntil } from 'rxjs';

@Component({
    selector: 'app-detail-client',
    imports: [CommonModule, LoadingComponent, RouterModule],
    templateUrl: './detail-client.component.html',
})
export class DetailClientComponent implements OnInit, OnDestroy {
    userId: string | null = null;
    user: Client | null = null;
    isLoading = true;

    private _unsubscribeAll = new Subject<void>();

    constructor(
        private _route: ActivatedRoute,
        private _dashboardAdminService: DashboardAdminService
    ) {}

    ngOnInit(): void {
        this._route.paramMap
            .pipe(
                takeUntil(this._unsubscribeAll),
                switchMap((params) => {
                    this.userId = params.get('id');
                    this.isLoading = true;
                    if (!this.userId) {
                        return of(null);
                    }
                    return this._dashboardAdminService.getUserDetail(
                        this.userId
                    );
                })
            )
            .subscribe((user) => {
                this.user = user;
                this.isLoading = false;
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}
