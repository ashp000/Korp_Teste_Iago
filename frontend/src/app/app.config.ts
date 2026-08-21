import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { routes } from './app.routes';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { ngrokBypassInterceptor } from './core/interceptors/ngrok-bypass.interceptor';
import { criarMatPaginatorIntlPtBr } from './core/mat-paginator-intl-pt-br';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([ngrokBypassInterceptor, errorInterceptor])),
    { provide: MatPaginatorIntl, useFactory: criarMatPaginatorIntlPtBr }
  ]
};
