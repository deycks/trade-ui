import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdjustBalancePayload } from 'app/core/interfaces/balance.interface';
import { Client } from 'app/core/interfaces/user.interface';
import { DashboardAdminService } from 'app/core/services/dashboardAdmin.service';
import { ExportService } from 'app/core/services/export.service';
import { LoadingComponent } from 'app/shared/components/loading/loading.component';
import { ModalAjusteBalanceComponent } from 'app/shared/components/modal-ajuste-balance/modal-ajuste-balance.component';
import { RoleBadgePipe } from 'app/shared/pipes/role-badge.pipe';

import {
    Subject,
    debounceTime,
    distinctUntilChanged,
    switchMap,
    takeUntil,
} from 'rxjs';

@Component({
    selector: 'app-client-admin',
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        LoadingComponent,
        ModalAjusteBalanceComponent,
        RoleBadgePipe,
    ],
    templateUrl: './client-admin.component.html',
})
export class ClientAdminComponent implements OnInit, OnDestroy {
    clients: Client[] = [];
    isLoading = true;
    searchTerm = '';

    private _searchSubject = new Subject<string>();
    private _unsubscribeAll = new Subject<void>();

    constructor(
        private _dashboardAdminService: DashboardAdminService,
        private _exportService: ExportService
    ) {}

    ngOnInit(): void {
        // Cargar lista completa inicial
        this.loadClients();

        // Configurar búsqueda con debounce
        this._searchSubject
            .pipe(
                debounceTime(300),
                distinctUntilChanged(),
                switchMap((term) => {
                    this.isLoading = true;
                    return term.trim()
                        ? this._dashboardAdminService.searchUsers(term)
                        : this._dashboardAdminService.getListClients();
                }),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe({
                next: (clients) => {
                    this.clients = clients;
                    this.isLoading = false;
                },
                error: (err) => {
                    console.error('Error loading clients:', err);
                    this.isLoading = false;
                },
            });
    }

    loadClients(): void {
        this.isLoading = true;
        this._dashboardAdminService
            .getListClients()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (clients) => {
                    this.clients = clients;
                    this.isLoading = false;
                },
                error: (err) => {
                    console.error('Error loading clients:', err);
                    this.isLoading = false;
                },
            });
    }

    onSearch(term: string): void {
        this.searchTerm = term;
        this._searchSubject.next(term);
    }

    exportClients(): void {
        if (!this.clients?.length) {
            return;
        }

        const exportData = this.clients.map((client) => ({
            Nombre: client.name ?? '',
            Email: client.email ?? '',
            Rol: client.role ?? '',
            Balance: client.balance ?? '',
            Tasa: client.investmentRate ?? '',
            Registro: client.createdAt
                ? new Date(client.createdAt).toLocaleString('es-MX')
                : '',
        }));

        this._exportService.exportToExcel(exportData, 'clientes');
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    showAdjustModal = false;
    isSaving = false;
    selectedClient: Client | null = null;

    openAdjustBalance(client: Client): void {
        this.selectedClient = client;
        this.showAdjustModal = true;
    }

    closeAdjustBalance(): void {
        this.showAdjustModal = false;
        this.selectedClient = null;
    }

    submitAdjustBalance(payload: AdjustBalancePayload): void {
        if (!this.selectedClient?.id) {
            return;
        }

        this.isSaving = true;

        this._dashboardAdminService
            .adjustUserBalance(this.selectedClient.id, payload)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: () => {
                    this.closeAdjustBalance();
                    this.isSaving = false;
                    this.loadClients(); // recarga tabla con el balance actualizado
                },
                error: (err) => {
                    console.error('Error ajustando balance:', err);
                    this.isSaving = false;
                },
            });
    }
}
