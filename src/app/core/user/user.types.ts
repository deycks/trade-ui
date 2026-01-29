export type UserRole = 'ADMIN' | 'PROSPECT' | 'CLIENT';

export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    curp: string;
    rfc: string;
    address: string;
    balance?: number;
    createdAt?: string;
    role: UserRole;
    avatar?: string;
    status?: string;
}
