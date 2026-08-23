import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { filter, map } from 'rxjs';
import { ProdutoService } from './core/services/produto.service';
import { Produto } from './core/models/produto.model';
import { TranslationService } from './core/services/translation.service';
import { SettingsService } from './core/services/settings.service';
import { SettingsDialogComponent } from './shared/settings-dialog/settings-dialog';

const SALDO_BAIXO_LIMITE = 5;

@Component({
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatTooltipModule,
    MatDialogModule
  ],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html'
})
export class App {
  private breakpointObserver = inject(BreakpointObserver);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private produtoService = inject(ProdutoService);
  private dialog = inject(MatDialog);
  protected i18n = inject(TranslationService);
  // Injetado aqui (não só no diálogo de configurações) pra forçar a criação do service e
  // rodar seu effect() de aplicação de fonte/tema já no bootstrap — senão tema/fonte salvos
  // no localStorage só voltam a valer depois que o usuário abre o diálogo de novo.
  private settings = inject(SettingsService);

  // Observable -> signal: o template reage à largura da tela sem subscribe/unsubscribe manual
  // (toSignal cuida do unsubscribe sozinho quando o componente é destruído).
  isMobile = toSignal(
    this.breakpointObserver.observe('(max-width: 768px)').pipe(map((result) => result.matches)),
    { initialValue: false }
  );

  sidebarOpen = signal(false);
  produtosSaldoBaixo = signal<Produto[]>([]);

  // Guarda a *chave* de tradução da rota atual (não o texto já traduzido), pra o título
  // reagir tanto a navegação quanto a troca de idioma sem precisar navegar de novo.
  private routeTitleKey = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => this.resolveTitleKey())
    ),
    { initialValue: this.resolveTitleKey() }
  );

  pageTitle = computed(() => {
    const chave = this.routeTitleKey();
    return chave ? this.i18n.t(chave) : 'KORP';
  });

  constructor() {
    this.carregarSaldoBaixo();
    // Refaz a checagem a cada navegação — assim o badge reflete mudanças de saldo feitas
    // em outra tela (ex: imprimir uma nota abate estoque) sem precisar de um store global.
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => this.carregarSaldoBaixo());
  }

  tooltipSaldoBaixo(): string {
    return (
      this.i18n.t('app.estoqueBaixoPrefixo') +
      this.produtosSaldoBaixo()
        .map((p) => `${p.codigo} (${p.saldo})`)
        .join(', ')
    );
  }

  toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }

  closeSidebarIfMobile(): void {
    if (this.isMobile()) this.sidebarOpen.set(false);
  }

  abrirConfiguracoes(): void {
    this.dialog.open(SettingsDialogComponent, { width: '24rem' });
    this.closeSidebarIfMobile();
  }

  private carregarSaldoBaixo(): void {
    this.produtoService
      .listar()
      .subscribe((produtos) => this.produtosSaldoBaixo.set(produtos.filter((p) => p.saldo < SALDO_BAIXO_LIMITE)));
  }

  private resolveTitleKey(): string | undefined {
    let route = this.activatedRoute;
    while (route.firstChild) route = route.firstChild;
    return route.snapshot.title;
  }
}
