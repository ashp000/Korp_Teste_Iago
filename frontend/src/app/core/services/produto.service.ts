import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AtualizarProdutoPayload, CriarProdutoPayload, Produto } from '../models/produto.model';

@Injectable({ providedIn: 'root' })
export class ProdutoService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.estoqueApiUrl}/api/produtos`;

  // Incrementa a cada criação/edição/exclusão de produto — outras partes do app (ex: o badge
  // de estoque baixo na shell) observam esse signal pra saber quando revalidar seus próprios
  // dados, mesmo sem uma navegação de rota acontecer no meio (ex: editar o saldo sem sair da
  // tela de Produtos).
  private readonly _alterado = signal(0);
  readonly alterado = this._alterado.asReadonly();

  listar(): Observable<Produto[]> {
    return this.http.get<Produto[]>(this.baseUrl);
  }

  criar(payload: CriarProdutoPayload): Observable<Produto> {
    return this.http.post<Produto>(this.baseUrl, payload).pipe(tap(() => this._alterado.update((n) => n + 1)));
  }

  atualizar(id: number, payload: AtualizarProdutoPayload): Observable<Produto> {
    return this.http
      .put<Produto>(`${this.baseUrl}/${id}`, payload)
      .pipe(tap(() => this._alterado.update((n) => n + 1)));
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(tap(() => this._alterado.update((n) => n + 1)));
  }

  sugerirDescricao(codigo: string): Observable<{ descricao: string }> {
    return this.http.post<{ descricao: string }>(`${this.baseUrl}/sugerir-descricao`, { codigo });
  }
}
