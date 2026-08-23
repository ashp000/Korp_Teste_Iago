import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { finalize } from 'rxjs';
import { ProdutoService } from '../../core/services/produto.service';
import { NotaFiscalService } from '../../core/services/nota-fiscal.service';
import { NotificationService } from '../../core/services/notification.service';
import { Produto } from '../../core/models/produto.model';
import { CriarNotaFiscalPayload } from '../../core/models/nota-fiscal.model';
import { HelpIconComponent } from '../../shared/help-icon/help-icon';
import { TranslationService } from '../../core/services/translation.service';

@Component({
  selector: 'app-nota-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    HelpIconComponent
  ],
  templateUrl: './nota-form.html',
  styleUrl: './nota-form.scss'
})
export class NotaFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private produtoService = inject(ProdutoService);
  private notaFiscalService = inject(NotaFiscalService);
  private notification = inject(NotificationService);
  private router = inject(Router);
  protected i18n = inject(TranslationService);

  produtos = signal<Produto[]>([]);
  salvando = signal(false);

  form = this.fb.group({
    itens: this.fb.array([this.criarItem()])
  });

  get itens(): FormArray {
    return this.form.get('itens') as FormArray;
  }

  ngOnInit(): void {
    this.produtoService.listar().subscribe((produtos) => this.produtos.set(produtos));
  }

  criarItem() {
    const group = this.fb.group({
      produtoId: [null as number | null, Validators.required],
      // Campo auxiliar só pra digitação/exibição do autocomplete — guarda o produto
      // selecionado (objeto) ou o texto digitado (string), nunca vai no payload.
      produtoBusca: [null as Produto | string | null],
      // Campo vazio representa "sem valor digitado ainda" (mostra o placeholder "1" em vez
      // de um 1 de verdade escrito no input) — e vazio no envio conta como quantidade 1.
      quantidade: [null as number | null, Validators.min(1)]
    });

    // Se o usuário digitar de novo depois de escolher um produto, o produtoId antigo
    // não pode continuar valendo — senão a nota poderia sair com um produto errado.
    group.controls.produtoBusca.valueChanges.subscribe((valor) => {
      if (typeof valor === 'string') {
        group.controls.produtoId.setValue(null);
      }
    });

    return group;
  }

  adicionarItem(): void {
    this.itens.push(this.criarItem());
  }

  removerItem(index: number): void {
    this.itens.removeAt(index);
  }

  produtosFiltrados(index: number): Produto[] {
    const valor = (this.itens.at(index) as FormGroup).get('produtoBusca')?.value;
    const termo = typeof valor === 'string' ? valor.trim().toLowerCase() : '';
    const produtos = this.produtos();
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

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: CriarNotaFiscalPayload = {
      itens: this.itens.value.map((item: { produtoId: number; quantidade: number | null }) => {
        const produto = this.produtos().find((p) => p.id === item.produtoId);
        return { produtoId: item.produtoId, produtoCodigo: produto?.codigo ?? '', quantidade: item.quantidade ?? 1 };
      })
    };

    this.salvando.set(true);
    this.notaFiscalService
      .criar(payload)
      .pipe(finalize(() => this.salvando.set(false)))
      .subscribe((nota) => {
        this.notification.success(this.i18n.t('notaForm.notaCriadaSucesso', { numero: nota.numero }));
        this.router.navigate(['/notas-fiscais', nota.id]);
      });
  }
}
