import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import {
    LogsAdminResponse,
    LogsPaginadoResponse,
} from '../interfaces/logs.interface';
import { CommonFunctionsService } from './commonFunctions';

@Injectable({
    providedIn: 'root',
})
export class LogsAdminService {
    private _service = inject(CommonFunctionsService);
    private _httpClient = inject(HttpClient);

    constructor() {}

    getLogsAuditStatistics(): Observable<LogsAdminResponse> {
        return this._httpClient
            .get<LogsAdminResponse>(
                `${environment.apiUrl}/admin/audit-logs/stats`
            )
            .pipe(
                retry(2),
                catchError(
                    this._service.handleError<LogsAdminResponse>(
                        'getLogsAudit',
                        undefined
                    )
                )
            );
    }

    getAuditLogs(filters?: {
        action?: string;
        adminId?: string;
        affectedUserId?: string;
        limit?: number;
        offset?: number;
        page?: number;
    }): Observable<LogsPaginadoResponse> {
        let params = new HttpParams();

        if (filters?.action?.trim()) {
            params = params.set('action', filters.action.trim());
        }

        if (filters?.adminId?.trim()) {
            params = params.set('adminId', filters.adminId.trim());
        }

        if (filters?.affectedUserId?.trim()) {
            params = params.set(
                'affectedUserId',
                filters.affectedUserId.trim()
            );
        }

        if (typeof filters?.limit === 'number' && filters.limit > 0) {
            params = params.set('limit', String(filters.limit));
        }

        if (typeof filters?.page === 'number' && filters.page > 0) {
            params = params.set('page', String(filters.page));
        } else if (typeof filters?.offset === 'number' && filters.offset >= 0) {
            const limit = filters?.limit ?? 50;
            const page = Math.floor(filters.offset / limit) + 1;
            params = params.set('page', String(page));
        }

        return this._httpClient
            .get<LogsPaginadoResponse>(
                `${environment.apiUrl}/admin/audit-logs`,
                {
                    params,
                }
            )
            .pipe(
                retry(2),
                catchError(
                    this._service.handleError<LogsPaginadoResponse>(
                        'getAuditLogs',
                        undefined
                    )
                )
            );
    }
}
