import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { DashboardClientService } from 'app/services/dashboard-client.service';
import { ClientComponent } from './client.component';

export default [
    {
        path: '',
        component: ClientComponent,
        resolve: {
            data: () => inject(DashboardClientService).getData(),
        },
    },
] as Routes;
