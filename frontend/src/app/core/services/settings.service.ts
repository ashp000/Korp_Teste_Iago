import { Injectable, effect, signal } from '@angular/core';

export type TamanhoFonte = 'pequena' | 'media' | 'grande';
export type Tema = 'claro' | 'escuro';

const STORAGE_KEY_FONTE = 'korp.fontSize';
const STORAGE_KEY_TEMA = 'korp.tema';

const TAMANHOS_PX: Record<TamanhoFonte, string> = {
  pequena: '14px',
  media: '16px',
  grande: '18px'
};

function fonteInicial(): TamanhoFonte {
  const salvo = localStorage.getItem(STORAGE_KEY_FONTE);
  return salvo === 'pequena' || salvo === 'media' || salvo === 'grande' ? salvo : 'media';
}

function temaInicial(): Tema {
  const salvo = localStorage.getItem(STORAGE_KEY_TEMA);
  return salvo === 'claro' || salvo === 'escuro' ? salvo : 'claro';
}

@Injectable({ providedIn: 'root' })
export class SettingsService {
  fontSize = signal<TamanhoFonte>(fonteInicial());
  tema = signal<Tema>(temaInicial());

  constructor() {
    effect(() => {
      const tamanho = this.fontSize();
      document.documentElement.style.fontSize = TAMANHOS_PX[tamanho];
      localStorage.setItem(STORAGE_KEY_FONTE, tamanho);
    });

    effect(() => {
      const tema = this.tema();
      document.documentElement.classList.toggle('dark-theme', tema === 'escuro');
      localStorage.setItem(STORAGE_KEY_TEMA, tema);
    });
  }

  setFontSize(tamanho: TamanhoFonte): void {
    this.fontSize.set(tamanho);
  }

  setTema(tema: Tema): void {
    this.tema.set(tema);
  }
}
