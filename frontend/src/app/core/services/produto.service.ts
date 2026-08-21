import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AtualizarProdutoPayload, CriarProdutoPayload, Produto } from '../models/produto.model';

@Injectable({ providedIn: 'root' })
export class ProdutoService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.estoqueApiUrl}/api/produtos`;

  listar(): Observable<Produto[]> {
    return this.http.get<Produto[]>(this.baseUrl);
  }

  criar(payload: CriarProdutoPayload): Observable<Produto> {
    return this.http.post<Produto>(this.baseUrl, payload);
  }

  atualizar(id: number, payload: AtualizarProdutoPayload): Observable<Produto> {
    return this.http.put<Produto>(`${this.baseUrl}/${id}`, payload);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  sugerirDescricao(codigo: string): Observable<{ descricao: string }> {
    return this.http.post<{ descricao: string }>(`${this.baseUrl}/sugerir-descricao`, { codigo });
  }
}
