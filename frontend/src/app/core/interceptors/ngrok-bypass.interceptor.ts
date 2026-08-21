import { HttpInterceptorFn } from '@angular/common/http';

// O domínio grátis do ngrok (usado para expor o backend local durante testes de deploy)
// mostra uma página de aviso pro navegador antes de liberar a requisição, a menos que
// esse header esteja presente. Inofensivo contra qualquer outro host.
export const ngrokBypassInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req.clone({ setHeaders: { 'ngrok-skip-browser-warning': 'true' } }));
};
