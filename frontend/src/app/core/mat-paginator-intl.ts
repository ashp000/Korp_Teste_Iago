import { effect } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslationService } from './services/translation.service';

// Formato "página atual de total de páginas" (ex: "1 de 5"), em vez do padrão do
// Material que mostra o intervalo de itens (ex: "1 – 10 de 47"). Reage a mudanças de
// idioma via effect() + intl.changes.next(), que é a API pública do MatPaginatorIntl
// pra avisar os paginadores já montados que precisam re-renderizar os rótulos.
export function criarMatPaginatorIntl(i18n: TranslationService): MatPaginatorIntl {
  const intl = new MatPaginatorIntl();

  intl.getRangeLabel = (page: number, pageSize: number, length: number): string => {
    if (length === 0 || pageSize === 0) {
      return i18n.t('paginator.rangeVazio');
    }

    const totalPaginas = Math.ceil(length / pageSize);
    return i18n.t('paginator.rangeLabel', { pagina: page + 1, total: totalPaginas });
  };

  effect(() => {
    intl.itemsPerPageLabel = i18n.t('paginator.itensPorPagina');
    intl.nextPageLabel = i18n.t('paginator.proximaPagina');
    intl.previousPageLabel = i18n.t('paginator.paginaAnterior');
    intl.firstPageLabel = i18n.t('paginator.primeiraPagina');
    intl.lastPageLabel = i18n.t('paginator.ultimaPagina');
    intl.changes.next();
  });

  return intl;
}
