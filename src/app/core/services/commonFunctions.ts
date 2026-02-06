import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ChartSeries } from '../interfaces/dashboardClient.interface';
import { DataPoint } from '../interfaces/dataChartSeriesDashboard.interface';

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

    public _mapChartSeriesToApexSeries(input: ChartSeries[]): any {
        const result = input.map((s) => {
            const points: DataPoint[] = (s.data ?? [])
                .slice()
                // ordena por period (YYYY-MM) para que la línea no “brinque”
                .sort((a, b) => a.period.localeCompare(b.period))
                .map(({ period, value }) => {
                    const [yearStr, monthStr] = period.split('-');
                    const year = Number(yearStr);
                    const month = Number(monthStr) - 1; // Date month = 0..11

                    return {
                        x: new Date(year, month, 1),
                        y: value,
                    };
                });

            return {
                name: s.label, // o s.key si prefieres
                data: points,
            };
        });

        console.log('Mapped Apex Series:', result);
        return result;
    }
}
