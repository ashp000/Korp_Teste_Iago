import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize, forkJoin } from 'rxjs';
import { ProdutoService } from '../core/services/produto.service';
import { NotaFiscalService } from '../core/services/nota-fiscal.service';
import { Produto } from '../core/models/produto.model';
import { NotaFiscal } from '../core/models/nota-fiscal.model';

const SALDO_BAIXO_LIMITE = 5;

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {
  private produtoService = inject(ProdutoService);
  private notaFiscalService = inject(NotaFiscalService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  readonly limiteSaldoBaixo = SALDO_BAIXO_LIMITE;

  carregando = signal(true);
  totalProdutos = signal(0);
  produtosSaldoBaixo = signal<Produto[]>([]);
  notasAbertas = signal(0);
  notasFechadas = signal(0);

  ngOnInit(): void {
    // forkJoin dispara as duas listagens em paralelo e só emite quando ambas responderem —
    // a home carrega no tempo da mais lenta das duas, não da soma das duas.
    forkJoin([this.produtoService.listar(), this.notaFiscalService.listar()])
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe(([produtos, notas]: [Produto[], NotaFiscal[]]) => {
        this.totalProdutos.set(produtos.length);
        const saldoBaixo = produtos.filter((p) => p.saldo < SALDO_BAIXO_LIMITE);
        this.produtosSaldoBaixo.set(saldoBaixo);
        this.notasAbertas.set(notas.filter((n) => n.status === 'Aberta').length);
        this.notasFechadas.set(notas.filter((n) => n.status === 'Fechada').length);

        if (saldoBaixo.length > 0) {
          this.avisarSaldoBaixo(saldoBaixo);
        }
      });
  }

  // Notificação em toast no canto da tela em vez de um banner fixo no meio do dashboard —
  // avisa sobre o estoque baixo sem ocupar espaço permanente nem parecer um erro do sistema.
  private avisarSaldoBaixo(produtos: Produto[]): void {
    const codigos = produtos.map((p) => p.codigo).join(', ');
    const ref = this.snackBar.open(`Estoque baixo: ${codigos}`, 'Ver produtos', {
      duration: 8000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: 'snackbar-warning'
    });
    ref.onAction().subscribe(() => this.router.navigate(['/produtos']));
  }
}
