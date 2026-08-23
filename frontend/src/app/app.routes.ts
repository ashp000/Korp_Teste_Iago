import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'title.inicio',
    loadComponent: () => import('./dashboard/dashboard').then((m) => m.DashboardComponent)
  },
  {
    path: 'produtos',
    title: 'title.produtos',
    loadComponent: () => import('./produtos/produtos-list/produtos-list').then((m) => m.ProdutosListComponent)
  },
  {
    path: 'notas-fiscais',
    title: 'title.notasFiscais',
    loadComponent: () => import('./notas-fiscais/notas-list/notas-list').then((m) => m.NotasListComponent)
  },
  {
    path: 'notas-fiscais/nova',
    title: 'title.novaNotaFiscal',
    loadComponent: () => import('./notas-fiscais/nota-form/nota-form').then((m) => m.NotaFormComponent)
  },
  {
    path: 'notas-fiscais/:id',
    title: 'title.detalheNota',
    loadComponent: () => import('./notas-fiscais/nota-detail/nota-detail').then((m) => m.NotaDetailComponent)
  }
];
