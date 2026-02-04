import { Transaction } from './transaction.interface';

export type UserRole = 'ADMIN' | 'PROSPECT' | 'CLIENT';

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    avatar?: string;
}

export interface Client extends User {
    balance: string | number;
    createdAt: string;
    updatedAt: string;
    phone: string;
    curp: string;
    rfc: string;
    address: string;
    transactions: Transaction[];
    auditLogs: any[];
    investmentRate: string | number;
}
