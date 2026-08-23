import { Injectable, signal } from '@angular/core';
import { Idioma, TRANSLATIONS } from '../i18n/translations';

const STORAGE_KEY = 'korp.idioma';

const LOCALE_POR_IDIOMA: Record<Idioma, string> = {
  pt: 'pt-BR',
  en: 'en-US',
  es: 'es-ES'
};

function idiomaInicial(): Idioma {
  const salvo = localStorage.getItem(STORAGE_KEY);
  if (salvo === 'pt' || salvo === 'en' || salvo === 'es') return salvo;

  const navegador = navigator.language?.toLowerCase() ?? '';
  if (navegador.startsWith('en')) return 'en';
  if (navegador.startsWith('es')) return 'es';
  return 'pt';
}

@Injectable({ providedIn: 'root' })
export class TranslationService {
  idioma = signal<Idioma>(idiomaInicial());

  setIdioma(idioma: Idioma): void {
    this.idioma.set(idioma);
    localStorage.setItem(STORAGE_KEY, idioma);
  }

  t(chave: string, params?: Record<string, string | number>): string {
    const texto = TRANSLATIONS[this.idioma()][chave] ?? chave;
    if (!params) return texto;
    return Object.entries(params).reduce(
      (acc, [nome, valor]) => acc.replaceAll(`{${nome}}`, String(valor)),
      texto
    );
  }

  statusLabel(status: 'Aberta' | 'Fechada' | string): string {
    if (status === 'Aberta') return this.t('status.aberta');
    if (status === 'Fechada') return this.t('status.fechada');
    return status;
  }

  formatDate(iso: string | Date): string {
    const data = typeof iso === 'string' ? new Date(iso) : iso;
    const locale = LOCALE_POR_IDIOMA[this.idioma()];
    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(data);
  }
}
