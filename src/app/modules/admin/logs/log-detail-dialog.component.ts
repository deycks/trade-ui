import { CommonModule, DatePipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { RecentLog } from 'app/core/interfaces/logs.interface';

@Component({
    selector: 'app-log-detail-dialog',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatDialogModule],
    templateUrl: './log-detail-dialog.component.html',
    providers: [DatePipe],
})
export class LogDetailDialogComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public data: RecentLog) {}
}
