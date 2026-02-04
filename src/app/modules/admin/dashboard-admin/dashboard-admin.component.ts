import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { AdminDashboardSummary } from 'app/core/interfaces/dashboardAdmin.interface';
import { DashboardAdminService } from 'app/core/services/dashboardAdmin.service';
import { LoadingComponent } from 'app/layout/common/loading/loading.component';
import { catchError, Observable, of, Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-dashboard-admin',
    imports: [LoadingComponent, CommonModule],
    templateUrl: './dashboard-admin.component.html',
})
export class DashboardAdminComponent implements OnInit, OnDestroy {
    summary$!: Observable<AdminDashboardSummary>;
    summary: AdminDashboardSummary | null = null;
    isLoading = true;

    private _unsubscribeAll = new Subject<void>();

    constructor(
        private _dashboardAdminService: DashboardAdminService,
        private _cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this._dashboardAdminService
            .getDashboardAdminData()
            .pipe(
                takeUntil(this._unsubscribeAll),
                catchError((err) => {
                    console.error('Error loading dashboard:', err);
                    return of(null);
                })
            )
            .subscribe((data) => {
                this.summary = data;
                this.isLoading = false;
                this._cdr.markForCheck();
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}
