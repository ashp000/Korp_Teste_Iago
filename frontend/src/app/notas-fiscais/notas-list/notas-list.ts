import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
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
    MatChipsModule
  ],
  templateUrl: './notas-list.html',
  styleUrl: './notas-list.scss'
})
export class NotasListComponent implements OnInit {
  private notaFiscalService = inject(NotaFiscalService);

  readonly displayedColumns = ['numero', 'status', 'dataAbertura', 'itens'];
  readonly buscaControl = new FormControl('', { nonNullable: true });

  carregando = signal(true);
  notas = signal<NotaFiscal[]>([]);
  filtroStatus = signal<FiltroStatus>('Todas');

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

  ngOnInit(): void {
    this.notaFiscalService
      .listar()
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe((notas) => this.notas.set(notas));
  }
}
