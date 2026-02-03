import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { LogsAdminResponse } from '../interfaces/logs.interface';
import { CommonFunctionsService } from './commonFunctions';

@Injectable({
    providedIn: 'root',
})
export class LogsAdminService {
    private _service = inject(CommonFunctionsService);
    private _httpClient = inject(HttpClient);

    constructor() {}

    getLogsAudit(): Observable<LogsAdminResponse> {
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
}
