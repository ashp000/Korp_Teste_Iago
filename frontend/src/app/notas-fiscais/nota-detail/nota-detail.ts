import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { finalize } from 'rxjs';
import { NotaFiscalService } from '../../core/services/nota-fiscal.service';
import { ProdutoService } from '../../core/services/produto.service';
import { NotificationService } from '../../core/services/notification.service';
import { NotaFiscal } from '../../core/models/nota-fiscal.model';
import { Produto } from '../../core/models/produto.model';
import { HelpIconComponent } from '../../shared/help-icon/help-icon';
import { TranslationService } from '../../core/services/translation.service';

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
    MatFormFieldModule,
    MatAutocompleteModule,
    MatInputModule,
    MatTooltipModule,
    HelpIconComponent
  ],
  templateUrl: './nota-detail.html',
  styleUrl: './nota-detail.scss'
})
export class NotaDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private notaFiscalService = inject(NotaFiscalService);
  private produtoService = inject(ProdutoService);
  private notification = inject(NotificationService);
  protected i18n = inject(TranslationService);

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
          this.notification.success(this.i18n.t('notaDetail.notaImpressaSucesso', { numero: nota.numero }));
          // window.print() abre o diálogo nativo de impressão do navegador (imprimir na
          // impressora física ou "Salvar como PDF"), com o layout de src/styles.css
          // (@media print) escondendo o restante da aplicação e mostrando só a nota.
          setTimeout(() => window.print());
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 503) {
            this.estoqueIndisponivel.set(true);
            this.erroImpressao.set(err.error?.detail ?? this.i18n.t('notaDetail.erro503'));
          } else if (err.status === 400) {
            this.erroImpressao.set(err.error?.detail ?? this.i18n.t('notaDetail.erro400'));
          } else if (err.status === 409) {
            this.erroImpressao.set(err.error?.detail ?? this.i18n.t('notaDetail.erro409'));
            this.carregar();
          } else {
            this.erroImpressao.set(this.i18n.t('notaDetail.erroGenerico'));
          }
        }
      });
  }

  formatarNumero(numero: number): string {
    return String(numero).padStart(6, '0');
  }

  descricaoDoProduto(produtoId: number): string {
    return this.produtos().find((p) => p.id === produtoId)?.descricao ?? '—';
  }

  criarItem(produtoId: number | null = null, quantidade: number | null = null) {
    const produtoInicial = produtoId ? (this.produtos().find((p) => p.id === produtoId) ?? null) : null;
    const group = this.fb.group({
      produtoId: [produtoId, Validators.required],
      // Campo auxiliar só pra digitação/exibição do autocomplete — guarda o produto
      // selecionado (objeto) ou o texto digitado (string), nunca vai no payload.
      produtoBusca: [produtoInicial as Produto | string | null],
      // Campo vazio representa "sem valor digitado ainda" (mostra o placeholder "1" em vez
      // de um 1 de verdade escrito no input) — e vazio no envio conta como quantidade 1.
      quantidade: [quantidade, Validators.min(1)]
    });

    // Se o usuário digitar de novo depois de escolher um produto, o produtoId antigo não pode
    // continuar valendo — senão a nota poderia sair com um produto errado. Checagem sem estado
    // (não compara com a seleção anterior, que já pode ter sido zerada num evento anterior):
    // sempre que o texto atual bater exatamente com o formato "código — descrição" de algum
    // produto, o produtoId é restaurado pra aquele produto; senão fica null até uma nova seleção.
    // Isso cobre o caso de digitar uma letra e apagar, voltando ao texto original.
    group.controls.produtoBusca.valueChanges.subscribe((valor) => {
      if (typeof valor !== 'string') return;
      const match = this.produtos().find((p) => this.displayProduto(p) === valor);
      group.controls.produtoId.setValue(match?.id ?? null);
    });

    return group;
  }

  produtosFiltrados(index: number): Produto[] {
    const item = this.itens.at(index) as FormGroup;
    const valor = item.get('produtoBusca')?.value;
    const produtos = this.produtos();

    // Texto batendo exatamente com o formato "código — descrição" de um produto (ex: acabou de
    // selecionar, ou digitou uma letra e apagou) — mostra ele mesmo em vez de "nenhum produto
    // encontrado", já que esse texto representa uma seleção válida.
    const matchExato = typeof valor === 'string' && produtos.find((p) => this.displayProduto(p) === valor);
    if (matchExato) return [matchExato];

    const termo = typeof valor === 'string' ? valor.trim().toLowerCase() : '';
    if (!termo) return produtos;
    return produtos.filter(
      (p) => p.codigo.toLowerCase().includes(termo) || p.descricao.toLowerCase().includes(termo)
    );
  }

  displayProduto(produto: Produto | string | null): string {
    if (!produto || typeof produto === 'string') return produto ?? '';
    return `${produto.codigo} — ${produto.descricao}`;
  }

  onProdutoSelecionado(index: number, event: MatAutocompleteSelectedEvent): void {
    const produto = event.option.value as Produto;
    (this.itens.at(index) as FormGroup).get('produtoId')?.setValue(produto.id);
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
      itens: this.itens.value.map((item: { produtoId: number; quantidade: number | null }) => {
        const produto = this.produtos().find((p) => p.id === item.produtoId);
        return { produtoId: item.produtoId, produtoCodigo: produto?.codigo ?? '', quantidade: item.quantidade ?? 1 };
      })
    };

    this.salvandoEdicao.set(true);
    this.notaFiscalService
      .atualizarItens(this.notaId, payload)
      .pipe(finalize(() => this.salvandoEdicao.set(false)))
      .subscribe((nota) => {
        this.nota.set(nota);
        this.editando.set(false);
        this.notification.success(this.i18n.t('notaDetail.itensAtualizados'));
      });
  }

  // Import dinâmico: jsPDF só é baixado quando alguém realmente imprime/baixa uma nota,
  // em vez de inflar o bundle inicial de todas as telas.
  async baixarPdf(nota: NotaFiscal): Promise<void> {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    const margemEsquerda = 14;
    const margemDireita = 196;

    // Cabeçalho: emitente à esquerda, caixa com número/status à direita — mesmo layout
    // visual da tela/impressão, pra manter consistência entre os dois formatos de saída.
    doc.setFontSize(16);
    doc.text(this.i18n.t('notaDetail.emitenteNome'), margemEsquerda, 20);
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(this.i18n.t('notaDetail.emitenteSub'), margemEsquerda, 26);

    doc.setTextColor(0);
    doc.setDrawColor(150);
    doc.rect(140, 12, 56, 18);
    doc.setFontSize(8);
    doc.text(this.i18n.t('notaDetail.pdfNotaFiscal'), 144, 17);
    doc.setFontSize(11);
    doc.text(this.i18n.t('notaDetail.numeroPrefixo', { numero: this.formatarNumero(nota.numero) }), 144, 23);
    doc.setFontSize(9);
    doc.text(this.i18n.t('notaDetail.pdfStatusPrefixo', { status: this.i18n.statusLabel(nota.status) }), 144, 28);

    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.6);
    doc.line(margemEsquerda, 34, margemDireita, 34);
    doc.setLineWidth(0.2);

    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(
      this.i18n.t('notaDetail.pdfDataAbertura', { data: this.i18n.formatDate(nota.dataAbertura) }),
      margemEsquerda,
      42
    );
    if (nota.dataFechamento) {
      doc.text(
        this.i18n.t('notaDetail.pdfDataFechamento', { data: this.i18n.formatDate(nota.dataFechamento) }),
        margemEsquerda,
        48
      );
    }

    let y = 60;
    doc.setFillColor(241, 245, 249);
    doc.rect(margemEsquerda, y - 5, margemDireita - margemEsquerda, 8, 'F');
    doc.setFontSize(9);
    doc.text(this.i18n.t('notaDetail.pdfCodigo'), margemEsquerda + 2, y);
    doc.text(this.i18n.t('notaDetail.pdfDescricao'), margemEsquerda + 32, y);
    doc.text(this.i18n.t('notaDetail.pdfQuantidade'), margemDireita - 2, y, { align: 'right' });
    y += 9;

    doc.setFontSize(10);
    for (const item of nota.itens) {
      doc.text(item.produtoCodigo, margemEsquerda + 2, y);
      doc.text(this.descricaoDoProduto(item.produtoId), margemEsquerda + 32, y);
      doc.text(String(item.quantidade), margemDireita - 2, y, { align: 'right' });
      doc.setDrawColor(226, 232, 240);
      doc.line(margemEsquerda, y + 3, margemDireita, y + 3);
      y += 9;
    }

    y += 6;
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(this.i18n.t('notaDetail.totalItens', { total: nota.itens.length }), margemEsquerda, y);
    y += 6;
    doc.setFontSize(7);
    doc.text(this.i18n.t('notaDetail.semValorFiscal'), margemEsquerda, y);

    doc.save(`nota-fiscal-${this.formatarNumero(nota.numero)}.pdf`);
  }
}
