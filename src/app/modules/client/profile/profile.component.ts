import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Client } from 'app/core/interfaces/user.interface';
import { ClientService } from 'app/core/services/client.service';
import { LoadingComponent } from 'app/layout/common/loading/loading.component';
import { catchError, of, Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-profile',
    imports: [CommonModule, LoadingComponent],
    templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit, OnDestroy {
    profile: Client | null = null;
    isLoading = true;

    private _unsubscribeAll = new Subject<void>();

    constructor(private _clientService: ClientService) {}

    ngOnInit(): void {
        this.isLoading = true;
        this._clientService
            .getProfileClient()
            .pipe(
                takeUntil(this._unsubscribeAll),
                catchError((err) => {
                    console.error('Error loading profile:', err);
                    return of(null);
                })
            )
            .subscribe((profile) => {
                this.profile = profile;
                this.isLoading = false;
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}
