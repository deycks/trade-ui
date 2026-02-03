import { registerLocaleData } from '@angular/common';
import localeEsMx from '@angular/common/locales/es-MX';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from 'app/app.component';
import { appConfig } from 'app/app.config';

registerLocaleData(localeEsMx);

bootstrapApplication(AppComponent, appConfig).catch((err) =>
    console.error(err)
);
