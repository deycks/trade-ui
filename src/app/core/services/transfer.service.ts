import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { catchError, Observable, retry } from 'rxjs';
import { Transfer } from '../interfaces/transfer.interface';
import { CommonFunctionsService } from './commonFunctions';

@Injectable({
    providedIn: 'root',
})
export class TransferService {
    private _service = inject(CommonFunctionsService);
    private _httpClient = inject(HttpClient);

    constructor() {}

    approveTransfer(transferId: string, reason: string): Observable<any> {
        return this._httpClient
            .post(
                `${environment.apiUrl}/admin/transfers/${transferId}/approve`,
                { reason }
            )
            .pipe(
                retry(2),
                catchError(
                    this._service.handleError<any>('approveTransfer', undefined)
                )
            );
    }

    rejectTransfer(transferId: string, reason: string): Observable<any> {
        return this._httpClient
            .post(
                `${environment.apiUrl}/admin/transfers/${transferId}/reject`,
                { reason }
            )
            .pipe(
                retry(2),
                catchError(
                    this._service.handleError<any>('rejectTransfer', undefined)
                )
            );
    }

    transfer(payload: Transfer): Observable<any> {
        return this._httpClient
            .post<any>(`${environment.apiUrl}/client/transfer`, payload)
            .pipe(
                retry(2),
                catchError(
                    this._service.handleError<any>('transfer', undefined)
                )
            );
    }
}
