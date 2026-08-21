import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { finalize } from 'rxjs';
import { NotaFiscalService } from '../../core/services/nota-fiscal.service';
import { ProdutoService } from '../../core/services/produto.service';
import { NotificationService } from '../../core/services/notification.service';
import { NotaFiscal } from '../../core/models/nota-fiscal.model';
import { Produto } from '../../core/models/produto.model';

@Component({
  selector: 'app-nota-detail',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatTooltipModule
  ],
  templateUrl: './nota-detail.html',
  styleUrl: './nota-detail.scss'
})
export class NotaDetailComponent implements OnInit {
  readonly displayedColumns = ['produtoCodigo', 'quantidade'];
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private notaFiscalService = inject(NotaFiscalService);
  private produtoService = inject(ProdutoService);
  private notification = inject(NotificationService);

  nota = signal<NotaFiscal | null>(null);
  carregando = signal(true);
  imprimindo = signal(false);
  erroImpressao = signal<string | null>(null);
  estoqueIndisponivel = signal(false);

  editando = signal(false);
  salvandoEdicao = signal(false);
  produtos = signal<Produto[]>([]);

  form = this.fb.group({
    itens: this.fb.array([] as ReturnType<typeof this.criarItem>[])
  });

  get itens(): FormArray {
    return this.form.get('itens') as FormArray;
  }

  private notaId!: number;

  ngOnInit(): void {
    this.notaId = Number(this.route.snapshot.paramMap.get('id'));
    this.carregar();
    this.produtoService.listar().subscribe((produtos) => this.produtos.set(produtos));
  }

  carregar(): void {
    this.carregando.set(true);
    this.notaFiscalService
      .obter(this.notaId)
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe((nota) => this.nota.set(nota));
  }

  // Botão único: numa nota Aberta, fecha via API e então imprime; numa nota já Fechada,
  // só reabre o diálogo de impressão (reimpressão de segunda via não deve chamar a API
  // de novo — a nota já foi fechada e o saldo já foi abatido).
  onImprimirClick(): void {
    const nota = this.nota();
    if (!nota) return;

    if (nota.status === 'Aberta') {
      this.imprimir();
    } else {
      window.print();
    }
  }

  // Estados de erro tratados individualmente porque cada um pede uma ação diferente do
  // usuário: 503 (estoque fora do ar) permite tentar de novo sem recarregar nada; 400
  // (saldo insuficiente) é definitivo para os itens atuais; 409 (nota já fechada, ex.:
  // impressão concorrente em outra aba) recarrega a nota para refletir o estado real.
  private imprimir(): void {
    this.imprimindo.set(true);
    this.erroImpressao.set(null);
    this.estoqueIndisponivel.set(false);

    this.notaFiscalService
      .imprimir(this.notaId)
      .pipe(finalize(() => this.imprimindo.set(false)))
      .subscribe({
        next: (nota) => {
          this.nota.set(nota);
          this.notification.success(`Nota ${nota.numero} impressa e fechada com sucesso.`);
          // window.print() abre o diálogo nativo de impressão do navegador (imprimir na
          // impressora física ou "Salvar como PDF"), com o layout de src/styles.css
          // (@media print) escondendo o restante da aplicação e mostrando só a nota.
          setTimeout(() => window.print());
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 503) {
            this.estoqueIndisponivel.set(true);
            this.erroImpressao.set(err.error?.detail ?? 'Estoque indisponível no momento. Tente novamente em instantes.');
          } else if (err.status === 400) {
            this.erroImpressao.set(err.error?.detail ?? 'Saldo insuficiente para um ou mais produtos desta nota.');
          } else if (err.status === 409) {
            this.erroImpressao.set(err.error?.detail ?? 'Esta nota já está fechada.');
            this.carregar();
          } else {
            this.erroImpressao.set('Não foi possível imprimir a nota. Tente novamente.');
          }
        }
      });
  }

  criarItem(produtoId: number | null = null, quantidade = 1) {
    return this.fb.group({
      produtoId: [produtoId, Validators.required],
      quantidade: [quantidade, [Validators.required, Validators.min(1)]]
    });
  }

  // Só faz sentido editar itens de uma nota ainda Aberta — depois de Fechada, os itens já
  // viraram baixa de estoque de verdade (mesma regra de negócio do backend).
  iniciarEdicao(): void {
    const nota = this.nota();
    if (!nota) return;

    this.itens.clear();
    for (const item of nota.itens) {
      this.itens.push(this.criarItem(item.produtoId, item.quantidade));
    }
    this.editando.set(true);
  }

  cancelarEdicao(): void {
    this.editando.set(false);
  }

  adicionarItem(): void {
    this.itens.push(this.criarItem());
  }

  removerItem(index: number): void {
    this.itens.removeAt(index);
  }

  salvarEdicao(): void {
    if (this.form.invalid || this.itens.length === 0) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = {
      itens: this.itens.value.map((item: { produtoId: number; quantidade: number }) => {
        const produto = this.produtos().find((p) => p.id === item.produtoId);
        return { produtoId: item.produtoId, produtoCodigo: produto?.codigo ?? '', quantidade: item.quantidade };
      })
    };

    this.salvandoEdicao.set(true);
    this.notaFiscalService
      .atualizarItens(this.notaId, payload)
      .pipe(finalize(() => this.salvandoEdicao.set(false)))
      .subscribe((nota) => {
        this.nota.set(nota);
        this.editando.set(false);
        this.notification.success('Itens da nota atualizados.');
      });
  }

  // Import dinâmico: jsPDF só é baixado quando alguém realmente imprime/baixa uma nota,
  // em vez de inflar o bundle inicial de todas as telas.
  async baixarPdf(nota: NotaFiscal): Promise<void> {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('KORP ERP — Nota Fiscal', 14, 18);

    doc.setFontSize(11);
    doc.text(`Número: ${nota.numero}`, 14, 30);
    doc.text(`Status: ${nota.status}`, 14, 37);
    doc.text(`Aberta em: ${new Date(nota.dataAbertura).toLocaleString('pt-BR')}`, 14, 44);
    if (nota.dataFechamento) {
      doc.text(`Fechada em: ${new Date(nota.dataFechamento).toLocaleString('pt-BR')}`, 14, 51);
    }

    let y = 65;
    doc.setFontSize(12);
    doc.text('Produto', 14, y);
    doc.text('Quantidade', 140, y);
    doc.line(14, y + 2, 196, y + 2);
    y += 10;

    doc.setFontSize(11);
    for (const item of nota.itens) {
      doc.text(item.produtoCodigo, 14, y);
      doc.text(String(item.quantidade), 140, y);
      y += 8;
    }

    doc.save(`nota-fiscal-${nota.numero}.pdf`);
  }
}
