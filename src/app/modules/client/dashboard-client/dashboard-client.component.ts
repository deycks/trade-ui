import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import {
    ChartSeries,
    ResponseDashboardClient,
} from 'app/core/interfaces/dashboardClient.interface';
import { DataPoint } from 'app/core/interfaces/dataChartSeriesDashboard.interface';
import { ClientService } from 'app/core/services/client.service';
import { LoadingComponent } from 'app/layout/common/loading/loading.component';
import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-dashboard-client',
    templateUrl: './dashboard-client.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatButtonToggleModule,
        NgApexchartsModule,
        MatTooltipModule,
        LoadingComponent,
        CommonModule,
    ],
})
export class DashboardClientComponent implements OnInit, OnDestroy {
    chartVisitors: ApexOptions;
    chartConversions: ApexOptions;
    chartImpressions: ApexOptions;
    chartVisits: ApexOptions;
    chartVisitorsVsPageViews: ApexOptions;
    chartNewVsReturning: ApexOptions;
    chartGender: ApexOptions;
    chartAge: ApexOptions;
    chartLanguage: ApexOptions;
    data: any;
    dataDashboard?: ResponseDashboardClient;
    isLoading = true;
    selectedYear!: string;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _clientService: ClientService,
        private _router: Router,
        private _cdr: ChangeDetectorRef
    ) {}

    // Helpers para el template
    get showEmptyState(): boolean {
        return (
            !!this.dataDashboard &&
            this.dataDashboard.uiHints?.state === 'NO_INVESTMENT'
        );
    }

    get showDashboard(): boolean {
        return (
            !!this.dataDashboard &&
            this.dataDashboard.uiHints?.state === 'HAS_INVESTMENT'
        );
    }

    get investedCapitalDeltaPct(): number {
        const kpis = this.dataDashboard?.kpis;
        if (!kpis?.investedCapital) {
            return 0;
        }

        return (
            (((kpis.currentBalance ?? 0) - kpis.investedCapital) /
                kpis.investedCapital) *
            100
        );
    }

    get monthlyProfitPct(): number {
        const kpis = this.dataDashboard?.kpis;
        if (!kpis?.investedCapital) {
            return 0;
        }

        return ((kpis.profitThisMonth ?? 0) / kpis.investedCapital) * 100;
    }

    get totalProfitPct(): number {
        const kpis = this.dataDashboard?.kpis;
        if (!kpis?.investedCapital) {
            return 0;
        }

        return ((kpis.totalProfit ?? 0) / kpis.investedCapital) * 100;
    }

    getTrendIcon(pct: number): string {
        return pct >= 0
            ? 'heroicons_solid:arrow-up-circle'
            : 'heroicons_solid:arrow-down-circle';
    }

    getTrendMiniIcon(pct: number): string {
        return pct >= 0
            ? 'heroicons_mini:arrow-trending-up'
            : 'heroicons_mini:arrow-trending-down';
    }

    getTrendColorClass(pct: number): string {
        return pct >= 0 ? 'text-green-500' : 'text-red-500';
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Obtener datos del dashboard desde el servicio ClientService
        this._clientService
            .getDashboardData()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (resp) => {
                    // getDashboardData devuelve un array; tomar el primer elemento si existe
                    this.dataDashboard = Array.isArray(resp)
                        ? (resp[0] ?? resp)
                        : resp;
                    // Prepara los datos para los charts si corresponde
                    this._prepareChartData();
                    this.isLoading = false;

                    // Forzar check dado ChangeDetectionStrategy.OnPush
                    this._cdr.markForCheck();
                },
                error: (err) => {
                    console.error('Error cargando datos del dashboard:', err);
                    this.isLoading = false;
                    this._cdr.markForCheck();
                },
            });
        // Attach SVG fill fixer to all ApexCharts
        // window['Apex'] = {
        //     chart: {
        //         events: {
        //             mounted: (chart: any, options?: any): void => {
        //                 this._fixSvgFill(chart.el);
        //             },
        //             updated: (chart: any, options?: any): void => {
        //                 this._fixSvgFill(chart.el);
        //             },
        //         },
        //     },
        // };
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Fix the SVG fill references. This fix must be applied to all ApexCharts
     * charts in order to fix 'black color on gradient fills on certain browsers'
     * issue caused by the '<base>' tag.
     *
     * Fix based on https://gist.github.com/Kamshak/c84cdc175209d1a30f711abd6a81d472
     *
     * @param element
     * @private
     */
    private _fixSvgFill(element: Element): void {
        // Current URL
        const currentURL = this._router.url;

        // 1. Find all elements with 'fill' attribute within the element
        // 2. Filter out the ones that doesn't have cross reference so we only left with the ones that use the 'url(#id)' syntax
        // 3. Insert the 'currentURL' at the front of the 'fill' attribute value
        Array.from(element.querySelectorAll('*[fill]'))
            .filter((el) => el.getAttribute('fill').indexOf('url(') !== -1)
            .forEach((el) => {
                const attrVal = el.getAttribute('fill');
                el.setAttribute(
                    'fill',
                    `url(${currentURL}${attrVal.slice(attrVal.indexOf('#'))}`
                );
            });
    }

    /**
     * Prepare the chart data from the data
     *
     * @private
     */
    private _prepareChartData(): void {
        const _key: string = 'balance';
        const balanceAndInvestedCapital = this.dataDashboard.chart.series.slice(
            0,
            2
        );

        // Visitors vs Page Views
        this.chartVisitorsVsPageViews = {
            chart: {
                animations: {
                    enabled: false,
                },
                fontFamily: 'inherit',
                foreColor: 'inherit',
                height: '100%',
                type: 'area',
                toolbar: {
                    show: false,
                },
                zoom: {
                    enabled: false,
                },
            },
            colors: ['#64748B', '#94A3B8'],
            dataLabels: {
                enabled: false,
            },
            fill: {
                colors: ['#64748B', '#94A3B8'],
                opacity: 0.5,
            },
            grid: {
                show: false,
                padding: {
                    bottom: -40,
                    left: 0,
                    right: 0,
                },
            },
            legend: {
                show: false,
            },
            series: this._mapChartSeriesToApexSeries(balanceAndInvestedCapital),
            stroke: {
                curve: 'smooth',
                width: 2,
            },
            tooltip: {
                followCursor: true,
                theme: 'dark',
                x: {
                    format: 'MMM dd, yyyy',
                },
            },
            xaxis: {
                axisBorder: {
                    show: false,
                },
                labels: {
                    offsetY: -20,
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
                max: (max): number => max + 250,
                min: (min): number => min - 250,
                show: false,
                tickAmount: 5,
            },
        };

        /**
        // Conversions
        this.chartConversions = {
            chart: {
                animations: {
                    enabled: false,
                },
                fontFamily: 'inherit',
                foreColor: 'inherit',
                height: '100%',
                type: 'area',
                sparkline: {
                    enabled: true,
                },
            },
            colors: ['#38BDF8'],
            fill: {
                colors: ['#38BDF8'],
                opacity: 0.5,
            },
            series: this.data.conversions.series,
            stroke: {
                curve: 'smooth',
            },
            tooltip: {
                followCursor: true,
                theme: 'dark',
            },
            xaxis: {
                type: 'category',
                categories: this.data.conversions.labels,
            },
            yaxis: {
                labels: {
                    formatter: (val): string => val.toString(),
                },
            },
        };

        // Impressions
        this.chartImpressions = {
            chart: {
                animations: {
                    enabled: false,
                },
                fontFamily: 'inherit',
                foreColor: 'inherit',
                height: '100%',
                type: 'area',
                sparkline: {
                    enabled: true,
                },
            },
            colors: ['#34D399'],
            fill: {
                colors: ['#34D399'],
                opacity: 0.5,
            },
            series: this.data.impressions.series,
            stroke: {
                curve: 'smooth',
            },
            tooltip: {
                followCursor: true,
                theme: 'dark',
            },
            xaxis: {
                type: 'category',
                categories: this.data.impressions.labels,
            },
            yaxis: {
                labels: {
                    formatter: (val): string => val.toString(),
                },
            },
        };

        // Visits
        this.chartVisits = {
            chart: {
                animations: {
                    enabled: false,
                },
                fontFamily: 'inherit',
                foreColor: 'inherit',
                height: '100%',
                type: 'area',
                sparkline: {
                    enabled: true,
                },
            },
            colors: ['#FB7185'],
            fill: {
                colors: ['#FB7185'],
                opacity: 0.5,
            },
            series: this.data.visits.series,
            stroke: {
                curve: 'smooth',
            },
            tooltip: {
                followCursor: true,
                theme: 'dark',
            },
            xaxis: {
                type: 'category',
                categories: this.data.visits.labels,
            },
            yaxis: {
                labels: {
                    formatter: (val): string => val.toString(),
                },
            },
        };



        // New vs. returning
        this.chartNewVsReturning = {
            chart: {
                animations: {
                    speed: 400,
                    animateGradually: {
                        enabled: false,
                    },
                },
                fontFamily: 'inherit',
                foreColor: 'inherit',
                height: '100%',
                type: 'donut',
                sparkline: {
                    enabled: true,
                },
            },
            colors: ['#3182CE', '#63B3ED'],
            labels: this.data.newVsReturning.labels,
            plotOptions: {
                pie: {
                    customScale: 0.9,
                    expandOnClick: false,
                    donut: {
                        size: '70%',
                    },
                },
            },
            series: this.data.newVsReturning.series,
            states: {
                hover: {
                    filter: {
                        type: 'none',
                    },
                },
                active: {
                    filter: {
                        type: 'none',
                    },
                },
            },
            tooltip: {
                enabled: true,
                fillSeriesColor: false,
                theme: 'dark',
                custom: ({
                    seriesIndex,
                    w,
                }): string => `<div class="flex items-center h-8 min-h-8 max-h-8 px-3">
                                                    <div class="w-3 h-3 rounded-full" style="background-color: ${w.config.colors[seriesIndex]};"></div>
                                                    <div class="ml-2 text-md leading-none">${w.config.labels[seriesIndex]}:</div>
                                                    <div class="ml-2 text-md font-bold leading-none">${w.config.series[seriesIndex]}%</div>
                                                </div>`,
            },
        };

        // Gender
        this.chartGender = {
            chart: {
                animations: {
                    speed: 400,
                    animateGradually: {
                        enabled: false,
                    },
                },
                fontFamily: 'inherit',
                foreColor: 'inherit',
                height: '100%',
                type: 'donut',
                sparkline: {
                    enabled: true,
                },
            },
            colors: ['#319795', '#4FD1C5'],
            labels: this.data.gender.labels,
            plotOptions: {
                pie: {
                    customScale: 0.9,
                    expandOnClick: false,
                    donut: {
                        size: '70%',
                    },
                },
            },
            series: this.data.gender.series,
            states: {
                hover: {
                    filter: {
                        type: 'none',
                    },
                },
                active: {
                    filter: {
                        type: 'none',
                    },
                },
            },
            tooltip: {
                enabled: true,
                fillSeriesColor: false,
                theme: 'dark',
                custom: ({
                    seriesIndex,
                    w,
                }): string => `<div class="flex items-center h-8 min-h-8 max-h-8 px-3">
                                                     <div class="w-3 h-3 rounded-full" style="background-color: ${w.config.colors[seriesIndex]};"></div>
                                                     <div class="ml-2 text-md leading-none">${w.config.labels[seriesIndex]}:</div>
                                                     <div class="ml-2 text-md font-bold leading-none">${w.config.series[seriesIndex]}%</div>
                                                 </div>`,
            },
        };

        // Age
        this.chartAge = {
            chart: {
                animations: {
                    speed: 400,
                    animateGradually: {
                        enabled: false,
                    },
                },
                fontFamily: 'inherit',
                foreColor: 'inherit',
                height: '100%',
                type: 'donut',
                sparkline: {
                    enabled: true,
                },
            },
            colors: ['#DD6B20', '#F6AD55'],
            labels: this.data.age.labels,
            plotOptions: {
                pie: {
                    customScale: 0.9,
                    expandOnClick: false,
                    donut: {
                        size: '70%',
                    },
                },
            },
            series: this.data.age.series,
            states: {
                hover: {
                    filter: {
                        type: 'none',
                    },
                },
                active: {
                    filter: {
                        type: 'none',
                    },
                },
            },
            tooltip: {
                enabled: true,
                fillSeriesColor: false,
                theme: 'dark',
                custom: ({
                    seriesIndex,
                    w,
                }): string => `<div class="flex items-center h-8 min-h-8 max-h-8 px-3">
                                                    <div class="w-3 h-3 rounded-full" style="background-color: ${w.config.colors[seriesIndex]};"></div>
                                                    <div class="ml-2 text-md leading-none">${w.config.labels[seriesIndex]}:</div>
                                                    <div class="ml-2 text-md font-bold leading-none">${w.config.series[seriesIndex]}%</div>
                                                </div>`,
            },
        };

        // Language
        this.chartLanguage = {
            chart: {
                animations: {
                    speed: 400,
                    animateGradually: {
                        enabled: false,
                    },
                },
                fontFamily: 'inherit',
                foreColor: 'inherit',
                height: '100%',
                type: 'donut',
                sparkline: {
                    enabled: true,
                },
            },
            colors: ['#805AD5', '#B794F4'],
            labels: this.data.language.labels,
            plotOptions: {
                pie: {
                    customScale: 0.9,
                    expandOnClick: false,
                    donut: {
                        size: '70%',
                    },
                },
            },
            series: this.data.language.series,
            states: {
                hover: {
                    filter: {
                        type: 'none',
                    },
                },
                active: {
                    filter: {
                        type: 'none',
                    },
                },
            },
            tooltip: {
                enabled: true,
                fillSeriesColor: false,
                theme: 'dark',
                custom: ({
                    seriesIndex,
                    w,
                }): string => `<div class="flex items-center h-8 min-h-8 max-h-8 px-3">
                                                    <div class="w-3 h-3 rounded-full" style="background-color: ${w.config.colors[seriesIndex]};"></div>
                                                    <div class="ml-2 text-md leading-none">${w.config.labels[seriesIndex]}:</div>
                                                    <div class="ml-2 text-md font-bold leading-none">${w.config.series[seriesIndex]}%</div>
                                                </div>`,
            },
        };

         */
    }

    private _mapChartSeriesToApexSeries(input: ChartSeries[]): any {
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

        console.log(result);
        return result;
    }
}
