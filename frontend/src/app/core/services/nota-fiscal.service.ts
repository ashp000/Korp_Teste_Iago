import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CriarNotaFiscalPayload, NotaFiscal } from '../models/nota-fiscal.model';
import { SKIP_GLOBAL_ERROR } from '../interceptors/error.interceptor';

@Injectable({ providedIn: 'root' })
export class NotaFiscalService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.faturamentoApiUrl}/api/notas-fiscais`;

  // Incrementa quando uma nota é impressa (abate saldo de produtos) — a shell do app observa
  // esse signal pra revalidar o badge de estoque baixo mesmo sem trocar de rota.
  private readonly _estoqueAlterado = signal(0);
  readonly estoqueAlterado = this._estoqueAlterado.asReadonly();

  listar(): Observable<NotaFiscal[]> {
    return this.http.get<NotaFiscal[]>(this.baseUrl);
  }

  obter(id: number): Observable<NotaFiscal> {
    return this.http.get<NotaFiscal>(`${this.baseUrl}/${id}`);
  }

  criar(payload: CriarNotaFiscalPayload): Observable<NotaFiscal> {
    return this.http.post<NotaFiscal>(this.baseUrl, payload);
  }

  atualizarItens(id: number, payload: CriarNotaFiscalPayload): Observable<NotaFiscal> {
    return this.http.put<NotaFiscal>(`${this.baseUrl}/${id}`, payload);
  }

  // SKIP_GLOBAL_ERROR: a tela de detalhe trata 409 (já fechada), 400 (saldo insuficiente)
  // e 503 (estoque indisponível) com mensagens e ações específicas, então o interceptor
  // global não deve exibir um segundo toast genérico para esta chamada.
  imprimir(id: number): Observable<NotaFiscal> {
    return this.http
      .post<NotaFiscal>(
        `${this.baseUrl}/${id}/imprimir`,
        {},
        { context: new HttpContext().set(SKIP_GLOBAL_ERROR, true) }
      )
      .pipe(tap(() => this._estoqueAlterado.update((n) => n + 1)));
  }
}
