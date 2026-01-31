import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable, of } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { ResponseDashboardClient } from '../interfaces/dashboardClient.interface';
import { Transaction } from '../interfaces/transaction.interface';
import { CommonFunctionsService } from './commonFunctions';
import dashboardMock from './data.json';

@Injectable({
    providedIn: 'root',
})
export class ClientService {
    private _service = inject(CommonFunctionsService);
    private _httpClient = inject(HttpClient);

    constructor() {}

    getDashboardData(): Observable<ResponseDashboardClient> {
        if (true) {
            const mock: any = dashboardMock;
            const mapped: ResponseDashboardClient = {
                ...mock,
                kpis: {
                    ...(mock.kpis ?? {}),
                    asOf: mock.kpis?.asOf
                        ? new Date(mock.kpis.asOf)
                        : undefined,
                },
            };

            return of(mapped);
        }

        return this._httpClient
            .get<ResponseDashboardClient>(
                `${environment.apiUrl}/client/dashboard`
            )
            .pipe(
                retry(2),
                catchError(
                    this._service.handleError<ResponseDashboardClient>(
                        'getDashboardData',
                        undefined
                    )
                )
            );
    }
    getTransactions(): Observable<Transaction[]> {
        return this._httpClient
            .get<Transaction[]>(`${environment.apiUrl}/client/transactions`)
            .pipe(
                retry(2),
                catchError(
                    this._service.handleError<Transaction[]>(
                        'getTransactions',
                        []
                    )
                )
            );
    }
}
