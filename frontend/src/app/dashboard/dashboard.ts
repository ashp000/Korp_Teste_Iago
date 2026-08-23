import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { finalize, forkJoin } from 'rxjs';
import { ProdutoService } from '../core/services/produto.service';
import { NotaFiscalService } from '../core/services/nota-fiscal.service';
import { Produto } from '../core/models/produto.model';
import { NotaFiscal } from '../core/models/nota-fiscal.model';
import { TranslationService } from '../core/services/translation.service';

const SALDO_BAIXO_LIMITE = 5;

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {
  private produtoService = inject(ProdutoService);
  private notaFiscalService = inject(NotaFiscalService);
  protected i18n = inject(TranslationService);

  readonly limiteSaldoBaixo = SALDO_BAIXO_LIMITE;

  carregando = signal(true);
  totalProdutos = signal(0);
  produtosSaldoBaixo = signal<Produto[]>([]);
  notasAbertas = signal(0);
  notasFechadas = signal(0);
  notasRecentes = signal<NotaFiscal[]>([]);

  ngOnInit(): void {
    // forkJoin dispara as duas listagens em paralelo e só emite quando ambas responderem —
    // a home carrega no tempo da mais lenta das duas, não da soma das duas.
    forkJoin([this.produtoService.listar(), this.notaFiscalService.listar()])
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe(([produtos, notas]: [Produto[], NotaFiscal[]]) => {
        this.totalProdutos.set(produtos.length);
        this.produtosSaldoBaixo.set(produtos.filter((p) => p.saldo < SALDO_BAIXO_LIMITE));
        this.notasAbertas.set(notas.filter((n) => n.status === 'Aberta').length);
        this.notasFechadas.set(notas.filter((n) => n.status === 'Fechada').length);

        const porDataDesc = [...notas].sort(
          (a, b) => new Date(b.dataAbertura).getTime() - new Date(a.dataAbertura).getTime()
        );
        this.notasRecentes.set(porDataDesc.slice(0, 5));
      });
  }
}
