import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
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

@Component({
  selector: 'app-nota-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule
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
    return this.fb.group({
      produtoId: [null as number | null, Validators.required],
      quantidade: [1, [Validators.required, Validators.min(1)]]
    });
  }

  adicionarItem(): void {
    this.itens.push(this.criarItem());
  }

  removerItem(index: number): void {
    this.itens.removeAt(index);
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: CriarNotaFiscalPayload = {
      itens: this.itens.value.map((item: { produtoId: number; quantidade: number }) => {
        const produto = this.produtos().find((p) => p.id === item.produtoId);
        return { produtoId: item.produtoId, produtoCodigo: produto?.codigo ?? '', quantidade: item.quantidade };
      })
    };

    this.salvando.set(true);
    this.notaFiscalService
      .criar(payload)
      .pipe(finalize(() => this.salvando.set(false)))
      .subscribe((nota) => {
        this.notification.success(`Nota ${nota.numero} criada com sucesso.`);
        this.router.navigate(['/notas-fiscais', nota.id]);
      });
  }
}
