import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { ResponseDashboardClient } from '../interfaces/dashboardClient.interface';
import { Transaction } from '../interfaces/transaction.interface';
import { Client } from '../interfaces/user.interface';
import { CommonFunctionsService } from './commonFunctions';

@Injectable({
    providedIn: 'root',
})
export class ClientService {
    private _service = inject(CommonFunctionsService);
    private _httpClient = inject(HttpClient);

    constructor() {}

    getDashboardData(): Observable<ResponseDashboardClient> {
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

    getProfileClient(): Observable<Client> {
        return this._httpClient
            .get<Client>(`${environment.apiUrl}/client/profile`)
            .pipe(
                retry(2),
                catchError(
                    this._service.handleError<Client>(
                        'getProfileClient',
                        undefined
                    )
                )
            );
    }

    updateAdminUserClient(
        id: string,
        payload: Partial<Client>
    ): Observable<Client> {
        return this._httpClient
            .patch<Client>(`${environment.apiUrl}/admin/users/${id}`, payload)
            .pipe(
                retry(2),
                catchError(
                    this._service.handleError<Client>(
                        'updateAdminUserClient',
                        undefined
                    )
                )
            );
    }
}
