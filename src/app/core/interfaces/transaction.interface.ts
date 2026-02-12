export interface Transaction {
    id: string;
    amount: string | number;
    type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | string;
    description: string;
    userId: string;
    createdAt: string;
    bankClabe?: string;
    bankName?: string;
    beneficiary?: string;
    status?: 'PENDING' | 'APPROVED' | 'REJECTED' | string;
}

