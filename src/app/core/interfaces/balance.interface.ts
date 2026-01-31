export interface AdjustBalancePayload {
    amount: number;
    type: 'DEPOSIT' | 'WITHDRAWAL' | 'YIELD' | 'ADJUSTMENT' | string;
    description?: string;
    createdAt?: string; // ISO date
}
