export interface Transaction {
    id: string;
    amount: string;
    type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | string;
    description: string;
    userId: string;
    createdAt: string;
}
