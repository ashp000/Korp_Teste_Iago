import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { TranslationService } from './services/translation.service';

// Os `title` das rotas em app.routes.ts são chaves de tradução (ex: 'title.produtos'),
// não texto literal — aqui traduzimos a chave antes de setar o título da aba do
// navegador, pra ele também reagir a troca de idioma.
@Injectable({ providedIn: 'root' })
export class AppTitleStrategy extends TitleStrategy {
  private i18n = inject(TranslationService);
  private titleService = inject(Title);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const chave = this.buildTitle(snapshot);
    if (chave) {
      this.titleService.setTitle(`${this.i18n.t(chave)} · KORP ERP`);
    }
  }
}
