import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class CommonFunctionsService {
    /**
     * Manejo genérico de errores: loggea y devuelve un valor por defecto para no romper la UI.
     */
    public handleError<T>(operation = 'operation', result?: T) {
        return (error: any): Observable<T> => {
            console.error(`${operation} failed:`, error);
            return of(result as T);
        };
    }
}
