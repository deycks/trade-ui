import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { DashboardClientService } from 'app/services/dashboard-client.service';
import { DashboardClientComponent } from './dashboard-client.component';

export default [
    {
        path: '',
        component: DashboardClientComponent,
        resolve: {
            data: () => inject(DashboardClientService).getData(),
        },
    },
] as Routes;
