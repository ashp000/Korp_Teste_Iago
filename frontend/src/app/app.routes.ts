import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Início',
    loadComponent: () => import('./dashboard/dashboard').then((m) => m.DashboardComponent)
  },
  {
    path: 'produtos',
    title: 'Produtos',
    loadComponent: () => import('./produtos/produtos-list/produtos-list').then((m) => m.ProdutosListComponent)
  },
  {
    path: 'notas-fiscais',
    title: 'Notas Fiscais',
    loadComponent: () => import('./notas-fiscais/notas-list/notas-list').then((m) => m.NotasListComponent)
  },
  {
    path: 'notas-fiscais/nova',
    title: 'Nova Nota Fiscal',
    loadComponent: () => import('./notas-fiscais/nota-form/nota-form').then((m) => m.NotaFormComponent)
  },
  {
    path: 'notas-fiscais/:id',
    title: 'Detalhe da Nota',
    loadComponent: () => import('./notas-fiscais/nota-detail/nota-detail').then((m) => m.NotaDetailComponent)
  }
];
