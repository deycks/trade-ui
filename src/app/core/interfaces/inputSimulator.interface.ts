import { Chart } from './dashboardClient.interface';

export interface InputSimulator {
    initialAmount: number;
    months: number;
    investmentRate: number;
}

export interface ResponseSimulator {
    chart: Chart;
    simulation?: Simulation;
    monthlyProjection?: MonthlyProjectionItem[];
}

export interface Simulation {
    initialAmount: number;
    months: number;
    monthlyRate: number;
    totalProfit: number;
    finalBalance: number;
    effectiveAnnualRate: number;
}

export interface MonthlyProjectionItem {
    month: number;
    period: string;
    balance: number;
    profit: number;
    accumulatedProfit: number;
}
