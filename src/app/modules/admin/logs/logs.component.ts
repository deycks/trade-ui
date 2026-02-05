import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { LogsAdminResponse } from 'app/core/interfaces/logs.interface';
import { ExportService } from 'app/core/services/export.service';
import { LogsAdminService } from 'app/core/services/logs.service';
import { LoadingComponent } from 'app/shared/components/loading/loading.component';
import { catchError, of, Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-logs',
    imports: [CommonModule, LoadingComponent],
    templateUrl: './logs.component.html',
})
export class LogsComponent implements OnInit, OnDestroy {
    logs: LogsAdminResponse | null = null;
    isLoading = true;

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
            Accion: log.action ?? '',
            Admin: log.admin?.name ?? 'N/A',
            EmailAdmin: log.admin?.email ?? 'N/A',
            Detalles: log.details ?? '',
            Fecha: log.createdAt
                ? new Date(log.createdAt).toLocaleString('es-MX')
                : '',
        }));

        this._exportService.exportToExcel(exportData, 'logs-auditoria');
    }
}
