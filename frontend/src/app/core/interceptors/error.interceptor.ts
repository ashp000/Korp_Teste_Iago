import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import { TranslationService } from '../services/translation.service';

// Requests que tratam o próprio erro (ex: imprimir nota, com UI dedicada para 409/400/503)
// usam este token para pular o toast genérico do interceptor e evitar mensagem duplicada.
export const SKIP_GLOBAL_ERROR = new HttpContextToken<boolean>(() => false);

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notification = inject(NotificationService);
  const i18n = inject(TranslationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (!req.context.get(SKIP_GLOBAL_ERROR)) {
        const mensagem = error.error?.detail ?? i18n.t('erros.generico');
        notification.error(mensagem);
      }
      return throwError(() => error);
    })
  );
};
