import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { LogsAdminResponse } from 'app/core/interfaces/logs.interface';
import { ExportService } from 'app/core/services/export.service';
import { LogsAdminService } from 'app/core/services/logs.service';
import { LoadingComponent } from 'app/shared/components/loading/loading.component';
import { catchError, of, Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-logs',
    imports: [CommonModule, LoadingComponent, MatTableModule],
    templateUrl: './logs.component.html',
})
export class LogsComponent implements OnInit, OnDestroy {
    logs: LogsAdminResponse | null = null;
    isLoading = true;
    displayedColumnsRecent: string[] = [
        'action',
        'admin',
        'affectedUser',
        'operation',
        'details',
        'date',
    ];
    displayedColumnsSummary: string[] = ['action', 'total'];

    private _unsubscribeAll = new Subject<void>();

    constructor(
        private _logsAdminService: LogsAdminService,
        private _exportService: ExportService
    ) {}

    ngOnInit(): void {
        this.isLoading = true;
        this._logsAdminService
            .getLogsAudit()
            .pipe(
                takeUntil(this._unsubscribeAll),
                catchError((err) => {
                    console.error('Error loading audit logs:', err);
                    return of(null);
                })
            )
            .subscribe((data) => {
                this.logs = data;
                this.isLoading = false;
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    exportLogs(): void {
        if (!this.logs?.recentLogs?.length) {
            return;
        }

        const exportData = this.logs.recentLogs.map((log) => ({
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
