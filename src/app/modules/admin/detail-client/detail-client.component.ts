import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AdjustBalancePayload } from 'app/core/interfaces/balance.interface';
import { Client } from 'app/core/interfaces/user.interface';
import { ClientService } from 'app/core/services/client.service';
import { DashboardAdminService } from 'app/core/services/dashboardAdmin.service';
import { BackLinkComponent } from 'app/shared/components/back-link/back-link.component';
import { EmptyStateComponent } from 'app/shared/components/empty-state/empty-state.component';
import { LoadingComponent } from 'app/shared/components/loading/loading.component';
import { ModalAjusteBalanceComponent } from 'app/shared/components/modal-ajuste-balance/modal-ajuste-balance.component';
import { TransactionsTableComponent } from 'app/shared/components/transactions-table/transactions-table.component';
import { RoleBadgePipe } from 'app/shared/pipes/role-badge.pipe';
import { of, Subject, switchMap, takeUntil } from 'rxjs';

@Component({
    selector: 'app-detail-client',
    imports: [
        CommonModule,
        FormsModule,
        BackLinkComponent,
        LoadingComponent,
        RouterModule,
        ModalAjusteBalanceComponent,
        TransactionsTableComponent,
        RoleBadgePipe,
        EmptyStateComponent,
    ],
    templateUrl: './detail-client.component.html',
})
export class DetailClientComponent implements OnInit, OnDestroy {
    userId: string | null = null;
    user: Client | null = null;
    isLoading = true;
    isSaving = false;
    showEditModal = false;
    showAdjustModal = false;
    isAdjustingBalance = false;
    selectedClient: Client | null = null;

    editForm = {
        email: '',
        name: '',
        phone: '',
        curp: '',
        rfc: '',
        address: '',
        investmentRate: null as number | null,
    };

    private _unsubscribeAll = new Subject<void>();

    constructor(
        private _route: ActivatedRoute,
        private _dashboardAdminService: DashboardAdminService,
        private _clientService: ClientService
    ) {}

    ngOnInit(): void {
        this._route.paramMap
            .pipe(
                takeUntil(this._unsubscribeAll),
                switchMap((params) => {
                    this.userId = params.get('id');
                    this.isLoading = true;
                    if (!this.userId) {
                        return of(null);
                    }
                    return this._dashboardAdminService.getUserDetail(
                        this.userId
                    );
                })
            )
            .subscribe((user) => {
                this.user = user;
                this._setEditForm(user);
                this.isLoading = false;
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    openEditModal(): void {
        this._setEditForm(this.user);
        this.showEditModal = true;
    }

    closeEditModal(): void {
        this.showEditModal = false;
    }

    openAdjustBalance(): void {
        this.selectedClient = this.user;
        this.showAdjustModal = true;
    }

    closeAdjustBalance(): void {
        this.showAdjustModal = false;
        this.selectedClient = null;
    }

    submitAdjustBalance(payload: AdjustBalancePayload): void {
        if (!this.userId) {
            return;
        }

        this.isAdjustingBalance = true;
        this._dashboardAdminService
            .adjustUserBalance(this.userId, payload)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: () => {
                    this.isAdjustingBalance = false;
                    this.closeAdjustBalance();
                    this._refreshUserDetail();
                },
                error: (err) => {
                    console.error('Error ajustando balance:', err);
                    this.isAdjustingBalance = false;
                },
            });
    }

    saveProfile(): void {
        if (!this.userId) {
            return;
        }

        this.isSaving = true;
        this._clientService
            .updateAdminUserClient(this.userId, {
                email: this.editForm.email,
                name: this.editForm.name,
                phone: this.editForm.phone,
                curp: this.editForm.curp,
                rfc: this.editForm.rfc,
                address: this.editForm.address,
                investmentRate: this.editForm.investmentRate ?? 0,
            })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (updatedUser) => {
                    const currentUser = this.user;
                    this.user = {
                        ...(currentUser ?? {}),
                        ...(updatedUser ?? {}),
                        transactions: currentUser?.transactions ?? [],
                        auditLogs: currentUser?.auditLogs ?? [],
                    } as Client;
                    this._setEditForm(this.user);
                    this.isSaving = false;
                    this.closeEditModal();
                },
                error: (err) => {
                    console.error('Error updating client:', err);
                    this.isSaving = false;
                },
            });
    }

    private _setEditForm(user: Client | null): void {
        if (!user) {
            return;
        }

        this.editForm = {
            email: user.email ?? '',
            name: user.name ?? '',
            phone: user.phone ?? '',
            curp: user.curp ?? '',
            rfc: user.rfc ?? '',
            address: user.address ?? '',
            investmentRate:
                user.investmentRate !== null &&
                user.investmentRate !== undefined
                    ? Number(user.investmentRate)
                    : null,
        };
    }

    private _refreshUserDetail(): void {
        if (!this.userId) {
            return;
        }

        this._dashboardAdminService
            .getUserDetail(this.userId)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user) => {
                this.user = user;
                this._setEditForm(user);
            });
    }
}
