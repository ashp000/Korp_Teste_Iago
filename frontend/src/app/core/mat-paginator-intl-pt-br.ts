import { MatPaginatorIntl } from '@angular/material/paginator';

export function criarMatPaginatorIntlPtBr(): MatPaginatorIntl {
  const intl = new MatPaginatorIntl();

  intl.itemsPerPageLabel = 'Itens por página:';
  intl.nextPageLabel = 'Próxima página';
  intl.previousPageLabel = 'Página anterior';
  intl.firstPageLabel = 'Primeira página';
  intl.lastPageLabel = 'Última página';

  // Formato "página atual de total de páginas" (ex: "1 de 5"), em vez do padrão do
  // Material que mostra o intervalo de itens (ex: "1 – 10 de 47").
  intl.getRangeLabel = (page: number, pageSize: number, length: number): string => {
    if (length === 0 || pageSize === 0) {
      return '0 de 0';
    }

    const totalPaginas = Math.ceil(length / pageSize);
    return `${page + 1} de ${totalPaginas}`;
  };

  return intl;
}
