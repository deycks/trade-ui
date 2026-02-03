export interface LogsAdminResponse {
    totalLogs: number;
    logsByAction: LogsByAction[];
    recentLogs: RecentLog[];
}

export interface LogsByAction {
    _count: Count;
    action: string;
}

export interface Count {
    action: number;
}

export interface RecentLog {
    id: string;
    action: string;
    details: string;
    adminId: string;
    adminIp: null | string;
    affectedUserId: null | string;
    transactionId: null | string;
    amount: number | null;
    balanceBefore: number | null;
    balanceAfter: number | null;
    createdAt: Date;
    admin: Admin;
    affectedUser: Admin | null;
}

export interface Admin {
    id: string;
    name: string;
    email: string;
}
