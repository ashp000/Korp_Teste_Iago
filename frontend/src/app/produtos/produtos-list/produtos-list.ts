import { AfterViewChecked, Component, DestroyRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroupDirective, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs';
import { ProdutoService } from '../../core/services/produto.service';
import { NotificationService } from '../../core/services/notification.service';
import { Produto } from '../../core/models/produto.model';
import { ProdutoEditDialogComponent } from '../produto-edit-dialog/produto-edit-dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog';
import { HelpIconComponent } from '../../shared/help-icon/help-icon';
import { TranslationService } from '../../core/services/translation.service';

@Component({
  selector: 'app-produtos-list',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    MatChipsModule,
    HelpIconComponent
  ],
  templateUrl: './produtos-list.html',
  styleUrl: './produtos-list.scss'
})
export class ProdutosListComponent implements OnInit, AfterViewChecked {
  private produtoService = inject(ProdutoService);
  private notification = inject(NotificationService);
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private destroyRef = inject(DestroyRef);
  protected i18n = inject(TranslationService);

  readonly displayedColumns = ['codigo', 'descricao', 'saldo', 'acoes'];
  readonly dataSource = new MatTableDataSource<Produto>([]);
  readonly busca = new FormControl('', { nonNullable: true });

  carregando = signal(true);
  salvando = signal(false);
  sugerindo = signal(false);

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(FormGroupDirective) formDirective!: FormGroupDirective;

  // Saldo fica como controle nullable (o resto do form é non-nullable): campo vazio no
  // formulário representa "sem valor digitado ainda", mostrando o placeholder "0" em vez
  // de um zero de verdade escrito no input — e some vazio conta como saldo 0 no envio.
  form = this.fb.group({
    codigo: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(50)]),
    descricao: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(200)]),
    saldo: this.fb.control<number | null>(null, [Validators.min(0)])
  });

  constructor() {
    this.dataSource.filterPredicate = (produto, filtro) =>
      produto.codigo.toLowerCase().includes(filtro) || produto.descricao.toLowerCase().includes(filtro);
  }

  ngOnInit(): void {
    this.carregar();

    // debounceTime evita filtrar a cada tecla; distinctUntilChanged evita refiltrar quando
    // o valor não mudou de fato (ex: digitar e apagar rápido demais).
    this.busca.valueChanges
      .pipe(debounceTime(200), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((valor) => (this.dataSource.filter = valor.trim().toLowerCase()));
  }

  // O MatSort/MatPaginator só existem no DOM depois que os produtos carregam (ficam atrás
  // de um @if de loading/vazio no template), então na primeira checagem de ngAfterViewInit
  // eles ainda não existem. ngAfterViewChecked roda a cada verificação da view, então pega
  // o momento em que os elementos realmente aparecem — o guard evita reatribuir à toa.
  ngAfterViewChecked(): void {
    if (this.sort && this.dataSource.sort !== this.sort) {
      this.dataSource.sort = this.sort;
    }
    if (this.paginator && this.dataSource.paginator !== this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  carregar(): void {
    this.carregando.set(true);
    this.produtoService
      .listar()
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe((produtos) => (this.dataSource.data = produtos));
  }

  sugerirDescricao(): void {
    const codigo = this.form.controls.codigo.value;
    if (!codigo) {
      this.notification.error(this.i18n.t('produtos.avisoSemCodigo'));
      return;
    }

    this.sugerindo.set(true);
    this.produtoService
      .sugerirDescricao(codigo)
      .pipe(finalize(() => this.sugerindo.set(false)))
      .subscribe((resposta) => this.form.controls.descricao.setValue(resposta.descricao));
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { codigo, descricao, saldo } = this.form.getRawValue();

    this.salvando.set(true);
    this.produtoService
      .criar({ codigo, descricao, saldo: saldo ?? 0 })
      .pipe(finalize(() => this.salvando.set(false)))
      .subscribe(() => {
        this.notification.success(this.i18n.t('produtos.cadastradoSucesso'));
        // resetForm() (não form.reset()) também limpa o estado "submitted" do <form>,
        // senão o Material continua mostrando erro nos campos obrigatórios vazios mesmo
        // resetados, porque o formulário já foi submetido uma vez.
        this.formDirective.resetForm({ codigo: '', descricao: '', saldo: null });
        this.carregar();
      });
  }

  editar(produto: Produto): void {
    // autoFocus: false — o foco automático do CDK no primeiro campo, disparado no meio da
    // animação de abertura do diálogo, corria com o cálculo interno do Material Design pra
    // posicionar o rótulo flutuante daquele campo, deixando o texto ("Descrição*") sobreposto
    // à borda só nele (o campo "Saldo", que nunca recebia foco automático, sempre ficou certo).
    this.dialog
      .open(ProdutoEditDialogComponent, { data: produto, autoFocus: false })
      .afterClosed()
      .subscribe((payload) => {
        if (!payload) return;
        this.produtoService.atualizar(produto.id, payload).subscribe(() => {
          this.notification.success(this.i18n.t('produtos.atualizadoSucesso', { codigo: produto.codigo }));
          this.carregar();
        });
      });
  }

  excluir(produto: Produto): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          titulo: this.i18n.t('produtos.confirmarExclusaoTitulo'),
          mensagem: this.i18n.t('produtos.confirmarExclusaoMensagem', { codigo: produto.codigo })
        }
      })
      .afterClosed()
      .subscribe((confirmado) => {
        if (!confirmado) return;
        this.produtoService.excluir(produto.id).subscribe(() => {
          this.notification.success(this.i18n.t('produtos.excluidoSucesso', { codigo: produto.codigo }));
          this.carregar();
        });
      });
  }
}
