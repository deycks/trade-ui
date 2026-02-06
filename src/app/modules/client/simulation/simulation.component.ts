import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { ResponseSimulator } from 'app/core/interfaces/inputSimulator.interface';
import { CommonFunctionsService } from 'app/core/services/commonFunctions';
import { ExportService } from 'app/core/services/export.service';
import { SimulatorService } from 'app/core/services/simulator.service';
import { LoadingComponent } from 'app/shared/components/loading/loading.component';
import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';

@Component({
    selector: 'app-simulation',
    imports: [
        CommonModule,
        FormsModule,
        LoadingComponent,
        MatIconModule,
        MatTableModule,
        NgApexchartsModule,
    ],
    templateUrl: './simulation.component.html',
})
export class SimulationComponent {
    isLoading = false;
    result: ResponseSimulator = null;
    errorMessage = '';
    displayedColumns = ['period', 'balance', 'profit', 'accumulatedProfit'];
    chartVisitorsVsPageViews: ApexOptions;
    form = {
        initialAmount: 100,
        months: 36,
        investmentRate: 2,
    };

    constructor(
        private _simulatorService: SimulatorService,
        private _exportService: ExportService,
        private commonService: CommonFunctionsService
    ) {}

    submit(): void {
        if (this.form.months > 120) {
            this.errorMessage = 'El máximo es 120 meses.';
            return;
        }

        this.errorMessage = '';
        this.isLoading = true;
        this.result = null;

        this._simulatorService.generateSimulation(this.form).subscribe({
            next: (response) => {
                this.result = response;
                this._prepareChartData();
                this.isLoading = false;
            },
            error: (err) => {
                this.result = err;
                this.isLoading = false;
            },
        });
    }
    /**
     * Prepare the chart data from the data
     *
     * @private
     */
    private _prepareChartData(): void {
        // Visitors vs Page Views
        const series = this.result.chart.series.filter(
            (s) => s.key == 'balance'
        );

        const baseSeries = series[0];
        if (baseSeries?.data?.length) {
            series.push({
                key: 'initialAmount',
                label: 'Capital invertido',
                data: baseSeries.data.map((point) => ({
                    period: point.period,
                    value: this.form.initialAmount,
                })),
            });
        }
        const allValues = series.flatMap((s) =>
            (s.data ?? []).map((point) => point.value)
        );
        const minValue = allValues.length ? Math.min(...allValues) : 0;
        const maxValue = allValues.length ? Math.max(...allValues) : 0;
        const minRounded = 0;
        const maxRounded = Math.ceil((maxValue + 250) / 100) * 100;
        const tickAmount = Math.max(
            2,
            Math.round((maxRounded - minRounded) / 100) + 1
        );

        this.chartVisitorsVsPageViews = {
            chart: {
                animations: {
                    enabled: true,
                },
                fontFamily: 'inherit',
                foreColor: 'inherit',
                height: '100%',
                type: 'area',
                toolbar: {
                    show: true,
                },
                zoom: {
                    enabled: false,
                },
            },
            colors: ['green', 'yellow'],
            dataLabels: {
                enabled: false,
            },
            fill: {
                colors: ['green', 'yellow'],
                opacity: 0.5,
            },
            grid: {
                show: false,
                padding: {
                    bottom: 60,
                    left: 20,
                    right: 20,
                },
            },
            series: this.commonService._mapChartSeriesToApexSeries(series),
            stroke: {
                curve: 'smooth',
                width: 2,
            },
            tooltip: {
                followCursor: true,
                theme: 'light',
                x: {
                    format: 'MMM dd, yyyy',
                },
            },
            xaxis: {
                axisBorder: {
                    show: false,
                },
                labels: {
                    offsetY: 20,
                    rotate: 0,
                    style: {
                        colors: 'var(--fuse-text-secondary)',
                    },
                },
                tickAmount: 3,
                tooltip: {
                    enabled: false,
                },
                type: 'datetime',
            },
            yaxis: {
                labels: {
                    style: {
                        colors: 'var(--fuse-text-secondary)',
                    },
                },
                max: maxRounded,
                min: minRounded,
                show: true,
                tickAmount,
            },
        };
    }

    exportMonthlyProjection(): void {
        if (!this.result?.monthlyProjection?.length) {
            return;
        }

        const exportData = this.result.monthlyProjection.map((row) => ({
            Periodo: row.period ?? '',
            Balance: row.balance ?? '',
            Ganancia: row.profit ?? '',
            GananciaAcumulada: row.accumulatedProfit ?? '',
        }));

        this._exportService.exportToExcel(exportData, 'proyeccion-mensual');
    }
}
