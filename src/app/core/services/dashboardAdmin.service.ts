import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { AdminDashboardSummary } from '../interfaces/dashboardAdmin.interface';
import { Client } from '../interfaces/user.interface';
import { CommonFunctionsService } from './commonFunctions';

export interface AdjustBalancePayload {
    amount: number;
    type: 'DEPOSIT' | 'WITHDRAWAL' | 'YIELD' | 'ADJUSTMENT' | string;
    description?: string;
    createdAt?: string; // ISO date
}

@Injectable({
    providedIn: 'root',
})
export class DashboardAdminService {
    private _service = inject(CommonFunctionsService);
    private _httpClient = inject(HttpClient);

    constructor() {}

    getDashboardAdminData(): Observable<AdminDashboardSummary> {
        return this._httpClient
            .get<AdminDashboardSummary>(`${environment.apiUrl}/admin/dashboard`)
            .pipe(
                retry(2),
                catchError(
                    this._service.handleError<AdminDashboardSummary>(
                        'getDashboardAdminData',
                        undefined
                    )
                )
            );
    }

    getListClients(): Observable<Client[]> {
        return this._httpClient
            .get<Client[]>(`${environment.apiUrl}/admin/users`)
            .pipe(
                retry(2),
                catchError(
                    this._service.handleError<Client[]>('getListClients', [])
                )
            );
    }

    searchUsers(search: string): Observable<Client[]> {
        const params = new HttpParams().set('search', search);

        return this._httpClient
            .get<Client[]>(`${environment.apiUrl}/admin/users`, { params })
            .pipe(
                retry(2),
                catchError(
                    this._service.handleError<Client[]>('searchUsers', [])
                )
            );
    }

    getUserDetail(userId: string): Observable<Client> {
        return this._httpClient
            .get<Client>(`${environment.apiUrl}/admin/users/${userId}`)
            .pipe(
                retry(2),
                catchError(
                    this._service.handleError<Client>(
                        'getUserDetail',
                        undefined
                    )
                )
            );
    }

    adjustUserBalance(userId: string, payload: AdjustBalancePayload): Observable<any> {
        return this._httpClient
            .post<any>(`${environment.apiUrl}/admin/users/${userId}/balance`, payload)
            .pipe(
                retry(2),
                catchError(
                    this._service.handleError<any>('adjustUserBalance', undefined)
                )
            );
    }
}
