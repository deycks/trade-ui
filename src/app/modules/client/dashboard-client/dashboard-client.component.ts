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
import { ResponseDashboardClient } from 'app/core/interfaces/dashboardClient.interface';
import { ClientService } from 'app/core/services/client.service';
import { CommonFunctionsService } from 'app/core/services/commonFunctions';
import { LoadingComponent } from 'app/shared/components/loading/loading.component';
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
        private _cdr: ChangeDetectorRef,
        private commonService: CommonFunctionsService
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
                    enabled: true,
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
            series: this.commonService._mapChartSeriesToApexSeries(
                balanceAndInvestedCapital
            ),
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
    }
}
