import { AfterViewInit, Component, DestroyRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
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
    MatChipsModule
  ],
  templateUrl: './produtos-list.html',
  styleUrl: './produtos-list.scss'
})
export class ProdutosListComponent implements OnInit, AfterViewInit {
  private produtoService = inject(ProdutoService);
  private notification = inject(NotificationService);
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private destroyRef = inject(DestroyRef);

  readonly displayedColumns = ['codigo', 'descricao', 'saldo', 'acoes'];
  readonly dataSource = new MatTableDataSource<Produto>([]);
  readonly busca = new FormControl('', { nonNullable: true });

  carregando = signal(true);
  salvando = signal(false);
  sugerindo = signal(false);

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  form = this.fb.nonNullable.group({
    codigo: ['', [Validators.required, Validators.maxLength(50)]],
    descricao: ['', [Validators.required, Validators.maxLength(200)]],
    saldo: [0, [Validators.required, Validators.min(0)]]
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

  // ViewChild só fica disponível após a view renderizar — por isso a associação
  // com o MatSort/MatPaginator acontece aqui, e não no ngOnInit.
  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
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
      this.notification.error('Informe o código antes de pedir uma sugestão.');
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

    this.salvando.set(true);
    this.produtoService
      .criar(this.form.getRawValue())
      .pipe(finalize(() => this.salvando.set(false)))
      .subscribe(() => {
        this.notification.success('Produto cadastrado com sucesso.');
        this.form.reset({ codigo: '', descricao: '', saldo: 0 });
        this.carregar();
      });
  }

  editar(produto: Produto): void {
    this.dialog
      .open(ProdutoEditDialogComponent, { data: produto })
      .afterClosed()
      .subscribe((payload) => {
        if (!payload) return;
        this.produtoService.atualizar(produto.id, payload).subscribe(() => {
          this.notification.success(`Produto ${produto.codigo} atualizado.`);
          this.carregar();
        });
      });
  }

  excluir(produto: Produto): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          titulo: 'Excluir produto',
          mensagem: `Tem certeza que deseja excluir o produto "${produto.codigo}"? Essa ação não pode ser desfeita.`
        }
      })
      .afterClosed()
      .subscribe((confirmado) => {
        if (!confirmado) return;
        this.produtoService.excluir(produto.id).subscribe(() => {
          this.notification.success(`Produto ${produto.codigo} excluído.`);
          this.carregar();
        });
      });
  }
}
