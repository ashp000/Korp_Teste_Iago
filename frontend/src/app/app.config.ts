import { ApplicationConfig, provideBrowserGlobalErrorListeners, inject } from '@angular/core';
import { provideRouter, TitleStrategy } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { routes } from './app.routes';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { ngrokBypassInterceptor } from './core/interceptors/ngrok-bypass.interceptor';
import { criarMatPaginatorIntl } from './core/mat-paginator-intl';
import { AppTitleStrategy } from './core/app-title-strategy';
import { TranslationService } from './core/services/translation.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([ngrokBypassInterceptor, errorInterceptor])),
    { provide: MatPaginatorIntl, useFactory: () => criarMatPaginatorIntl(inject(TranslationService)) },
    { provide: TitleStrategy, useClass: AppTitleStrategy }
  ]
};
