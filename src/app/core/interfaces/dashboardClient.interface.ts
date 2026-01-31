export interface ResponseDashboardClient {
    uiHints: UIHints;
    kpis: Kpis;
    chart: Chart;
}

export interface Chart {
    title: string;
    unit: string;
    granularity: string;
    series: ChartSeries[];
}

export interface PeriodValue {
    period: string; // formato: "YYYY-MM"
    value: number;
}

export interface ChartSeries {
    key: string; // ej: "balance"
    label: string; // ej: "Saldo por mes"
    data: PeriodValue[];
}

export interface Kpis {
    asOf: Date;
    investedCapital: number;
    currentBalance: number;
    totalProfit: number;
    monthlyRate: number;
    profitThisMonth: number;
    sinceStartReturnPct: number;
}

export interface UIHints {
    state: string;
    emptyState: EmptyState;
}

export interface EmptyState {
    title: string;
    message: string;
}
