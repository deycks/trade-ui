import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-back-link',
    standalone: true,
    imports: [RouterModule],
    templateUrl: './back-link.component.html',
})
export class BackLinkComponent {
    @Input() label = 'Volver';
    @Input() link: string | any[] = '/';
}
