import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { catchError, Observable } from 'rxjs';
import {
    InputSimulator,
    ResponseSimulator,
} from '../interfaces/inputSimulator.interface';
import { CommonFunctionsService } from './commonFunctions';

@Injectable({
    providedIn: 'root',
})
export class SimulatorService {
    private _service = inject(CommonFunctionsService);
    private _httpClient = inject(HttpClient);
    constructor() {}

    generateSimulation(input: InputSimulator): Observable<ResponseSimulator> {
        return this._httpClient
            .post<ResponseSimulator>(
                `${environment.apiUrl}/client/simulate-investment`,
                input
            )
            .pipe(
                catchError(
                    this._service.handleError<ResponseSimulator>(
                        'generateSimulation',
                        undefined
                    )
                )
            );
    }
}
