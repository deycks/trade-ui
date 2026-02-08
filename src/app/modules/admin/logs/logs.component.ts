import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import {
    MatPaginatorIntl,
    MatPaginatorModule,
    PageEvent,
} from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import {
    LogsAdminResponse,
    LogsPaginadoResponse,
    RecentLog,
} from 'app/core/interfaces/logs.interface';
import { Client } from 'app/core/interfaces/user.interface';
import { DashboardAdminService } from 'app/core/services/dashboardAdmin.service';
import { ExportService } from 'app/core/services/export.service';
import { LogsAdminService } from 'app/core/services/logs.service';
import { LoadingComponent } from 'app/shared/components/loading/loading.component';
import {
    catchError,
    debounceTime,
    distinctUntilChanged,
    forkJoin,
    of,
    Subject,
    takeUntil,
} from 'rxjs';
import { LogDetailDialogComponent } from './log-detail-dialog.component';

@Component({
    selector: 'app-logs',
    imports: [
        CommonModule,
        FormsModule,
        LoadingComponent,
        MatTableModule,
        MatPaginatorModule,
    ],
    templateUrl: './logs.component.html',
    styleUrls: ['./logs.component.scss'],
    providers: [
        {
            provide: MatPaginatorIntl,
            useFactory: () => {
                const intl = new MatPaginatorIntl();
                intl.itemsPerPageLabel = 'Filas por página';
                intl.nextPageLabel = 'Página siguiente';
                intl.previousPageLabel = 'Página anterior';
                intl.firstPageLabel = 'Primera página';
                intl.lastPageLabel = 'Última página';
                intl.getRangeLabel = (page, pageSize, length) => {
                    if (length === 0 || pageSize === 0) {
                        return `0 de ${length}`;
                    }
                    const startIndex = page * pageSize;
                    const endIndex =
                        startIndex < length
                            ? Math.min(startIndex + pageSize, length)
                            : startIndex + pageSize;
                    return `${startIndex + 1}-${endIndex} de ${length}`;
                };
                return intl;
            },
        },
    ],
})
export class LogsComponent implements OnInit, OnDestroy {
    logs: LogsAdminResponse | null = null;
    logsPaginado: LogsPaginadoResponse | null = null;
    adminUsers: Client[] = [];
    clientProspectUsers: Client[] = [];

    isLoading = true;
    isTableLoading = false;
    displayedColumnsRecent: string[] = [
        'action',
        'admin',
        'affectedUser',
        'amount',
        'date',
    ];
    displayedColumnsSummary: string[] = ['action', 'total'];
    pageSize = 10;
    pageIndex = 0;
    totalLogs = 0;
    totalPages = 0;
    selectedAdminId = '';
    selectedAffectedUserId = '';
    selectedAction = '';

    private _unsubscribeAll = new Subject<void>();
    private _filtersChange$ = new Subject<{
        action: string;
        adminId: string;
        affectedUserId: string;
    }>();

    constructor(
        private _logsAdminService: LogsAdminService,
        private _exportService: ExportService,
        private _dashboardAdminService: DashboardAdminService,
        private _matDialog: MatDialog
    ) {}

    ngOnInit(): void {
        this._loadInitialData();
        this._filtersChange$
            .pipe(
                debounceTime(300),
                distinctUntilChanged(
                    (prev, curr) =>
                        prev.action === curr.action &&
                        prev.adminId === curr.adminId &&
                        prev.affectedUserId === curr.affectedUserId
                ),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(() => {
                this.pageIndex = 0;
                this._loadAuditLogsPage();
            });
    }

    onPageChange(event: PageEvent): void {
        this.pageSize = event.pageSize;
        this.pageIndex = event.pageIndex;
        this._loadAuditLogsPage();
    }

    onFiltersChange(): void {
        this._filtersChange$.next({
            action: this.selectedAction,
            adminId: this.selectedAdminId,
            affectedUserId: this.selectedAffectedUserId,
        });
    }

    setActionFilter(action: string): void {
        this.selectedAction = this.selectedAction === action ? '' : action;
        this.onFiltersChange();
    }

    onLogSelect(log: RecentLog): void {
        if (!log) {
            return;
        }

        this._matDialog.open(LogDetailDialogComponent, {
            data: log,
            width: '720px',
            maxWidth: '95vw',
        });
    }

    private _loadInitialData(): void {
        this.isLoading = true;
        this.isTableLoading = true;
        const limit = this.pageSize;
        const page = this.pageIndex + 1;

        forkJoin({
            stats: this._logsAdminService.getLogsAuditStatistics().pipe(
                catchError((err) => {
                    console.error('Error loading audit stats:', err);
                    return of(null);
                })
            ),
            logs: this._logsAdminService
                .getAuditLogs({
                    limit,
                    page,
                    action: this.selectedAction || undefined,
                    adminId: this.selectedAdminId || undefined,
                    affectedUserId: this.selectedAffectedUserId || undefined,
                })
                .pipe(
                    catchError((err) => {
                        console.error('Error loading audit logs:', err);
                        return of(null);
                    })
                ),
            users: this._dashboardAdminService.getListUsers().pipe(
                catchError((err) => {
                    console.error('Error loading users:', err);
                    return of([] as Client[]);
                })
            ),
        })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ stats, logs, users }) => {
                this.logs = stats;
                this.logsPaginado = logs;
                this._splitUsers(users);
                this._syncPagination(logs);
                this.isLoading = false;
                this.isTableLoading = false;
            });
    }

    private _loadAuditLogsPage(): void {
        this.isTableLoading = true;
        const limit = this.pageSize;
        const page = this.pageIndex + 1;

        this._logsAdminService
            .getAuditLogs({
                limit,
                page,
                action: this.selectedAction || undefined,
                adminId: this.selectedAdminId || undefined,
                affectedUserId: this.selectedAffectedUserId || undefined,
            })
            .pipe(
                takeUntil(this._unsubscribeAll),
                catchError((err) => {
                    console.error('Error loading audit logs:', err);
                    return of(null);
                })
            )
            .subscribe((logs) => {
                this.logsPaginado = logs;
                this._syncPagination(logs);
                this.isTableLoading = false;
            });
    }

    private _syncPagination(logs: LogsPaginadoResponse | null): void {
        if (logs?.pagination) {
            this.pageSize = logs.pagination.limit ?? this.pageSize;
            this.pageIndex = Math.max((logs.pagination.page ?? 1) - 1, 0);
            this.totalLogs = logs.pagination.total ?? 0;
            this.totalPages = logs.pagination.totalPages ?? 0;
            return;
        }

        this.totalLogs = logs?.data?.length ?? 0;
    }

    private _splitUsers(users: Client[]): void {
        this.adminUsers = users.filter((user) => user.role === 'ADMIN');
        this.clientProspectUsers = users.filter(
            (user) => user.role === 'CLIENT' || user.role === 'PROSPECT'
        );
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    exportLogs(): void {
        if (!this.logsPaginado?.data?.length) {
            return;
        }

        const exportData = this.logsPaginado.data.map((log) => ({
            Id: log.id ?? '',
            Accion: log.action ?? '',
            Detalles: log.details ?? '',
            AdminId: log.adminId ?? '',
            AdminNombre: log.admin?.name ?? 'N/A',
            AdminEmail: log.admin?.email ?? 'N/A',
            AdminIp: log.adminIp ?? '',
            UsuarioAfectadoId: log.affectedUserId ?? '',
            UsuarioAfectadoNombre: log.affectedUser?.name ?? 'N/A',
            UsuarioAfectadoEmail: log.affectedUser?.email ?? 'N/A',
            TransaccionId: log.transactionId ?? '',
            Monto: log.amount ?? '',
            BalanceAntes: log.balanceBefore ?? '',
            BalanceDespues: log.balanceAfter ?? '',
            Fecha: log.createdAt
                ? new Date(log.createdAt).toLocaleString('es-MX')
                : '',
        }));

        this._exportService.exportToExcel(exportData, 'logs-auditoria');
    }
}
