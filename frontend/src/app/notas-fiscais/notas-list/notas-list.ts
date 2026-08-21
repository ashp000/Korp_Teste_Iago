import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs';
import { NotaFiscalService } from '../../core/services/nota-fiscal.service';
import { NotaFiscal } from '../../core/models/nota-fiscal.model';

type FiltroStatus = 'Todas' | 'Aberta' | 'Fechada';

@Component({
  selector: 'app-notas-list',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatTableModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatPaginatorModule
  ],
  templateUrl: './notas-list.html',
  styleUrl: './notas-list.scss'
})
export class NotasListComponent implements OnInit {
  private notaFiscalService = inject(NotaFiscalService);
  private destroyRef = inject(DestroyRef);

  readonly displayedColumns = ['numero', 'status', 'dataAbertura', 'itens'];
  readonly buscaControl = new FormControl('', { nonNullable: true });

  carregando = signal(true);
  notas = signal<NotaFiscal[]>([]);
  filtroStatus = signal<FiltroStatus>('Todas');
  pageIndex = signal(0);
  readonly pageSize = 10;

  private busca = toSignal(
    this.buscaControl.valueChanges.pipe(debounceTime(200), distinctUntilChanged()),
    { initialValue: '' }
  );

  notasFiltradas = computed(() => {
    const status = this.filtroStatus();
    const termo = this.busca().trim();

    return this.notas().filter((nota) => {
      const statusOk = status === 'Todas' || nota.status === status;
      const buscaOk = !termo || String(nota.numero).includes(termo);
      return statusOk && buscaOk;
    });
  });

  notasPaginadas = computed(() => {
    const inicio = this.pageIndex() * this.pageSize;
    return this.notasFiltradas().slice(inicio, inicio + this.pageSize);
  });

  ngOnInit(): void {
    this.notaFiscalService
      .listar()
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe((notas) => this.notas.set(notas));

    // Sempre que o filtro/busca muda o resultado, volta pra primeira página — evita
    // ficar numa página vazia depois de um filtro mais restritivo.
    this.buscaControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.pageIndex.set(0));
  }

  onFiltroStatusChange(status: FiltroStatus): void {
    this.filtroStatus.set(status);
    this.pageIndex.set(0);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
  }
}
