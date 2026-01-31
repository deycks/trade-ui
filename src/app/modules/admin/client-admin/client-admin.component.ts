import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdjustBalancePayload } from 'app/core/interfaces/balance.interface';
import { Client } from 'app/core/interfaces/user.interface';
import { DashboardAdminService } from 'app/core/services/dashboardAdmin.service';
import {
    Subject,
    debounceTime,
    distinctUntilChanged,
    switchMap,
    takeUntil,
} from 'rxjs';

@Component({
    selector: 'app-client-admin',
    imports: [CommonModule, FormsModule],
    templateUrl: './client-admin.component.html',
})
export class ClientAdminComponent implements OnInit, OnDestroy {
    clients: Client[] = [];
    isLoading = true;
    searchTerm = '';

    private _searchSubject = new Subject<string>();
    private _unsubscribeAll = new Subject<void>();

    constructor(private _dashboardAdminService: DashboardAdminService) {}

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

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    showAdjustModal = false;
    selectedClient: Client | null = null;

    adjustForm = {
        amount: null as number | null,
        type: '',
        description: '',
        createdAt: '',
    };

    private _getLocalDateTime(): string {
        const now = new Date();
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
    }

    openAdjustBalance(client: Client): void {
        this.selectedClient = client;
        // reset limpio al abrir
        this.adjustForm = {
            amount: null,
            type: '',
            description: '',
            createdAt: this._getLocalDateTime(),
        };
        this.showAdjustModal = true;
    }

    closeAdjustBalance(): void {
        this.showAdjustModal = false;
        this.selectedClient = null;
    }

    submitAdjustBalance(): void {
        if (!this.selectedClient?.id) {
            return;
        }

        const payload: AdjustBalancePayload = {
            amount: this.adjustForm.amount ?? 0,
            type: this.adjustForm.type,
            description: this.adjustForm.description,
            createdAt: this.adjustForm.createdAt
                ? new Date(this.adjustForm.createdAt).toISOString()
                : undefined,
        };

        this._dashboardAdminService
            .adjustUserBalance(this.selectedClient.id, payload)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: () => {
                    this.closeAdjustBalance();
                    this.loadClients(); // recarga tabla con el balance actualizado
                },
                error: (err) => {
                    console.error('Error ajustando balance:', err);
                },
            });
    }
}
