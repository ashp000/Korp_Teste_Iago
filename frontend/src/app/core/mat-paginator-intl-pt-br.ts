import { MatPaginatorIntl } from '@angular/material/paginator';

export function criarMatPaginatorIntlPtBr(): MatPaginatorIntl {
  const intl = new MatPaginatorIntl();

  intl.itemsPerPageLabel = 'Itens por página:';
  intl.nextPageLabel = 'Próxima página';
  intl.previousPageLabel = 'Página anterior';
  intl.firstPageLabel = 'Primeira página';
  intl.lastPageLabel = 'Última página';

  intl.getRangeLabel = (page: number, pageSize: number, length: number): string => {
    if (length === 0 || pageSize === 0) {
      return `0 de ${length}`;
    }

    const totalPaginas = Math.ceil(length / pageSize);
    const paginaAtual = Math.min(page, totalPaginas - 1);
    const inicio = paginaAtual * pageSize + 1;
    const fim = Math.min(inicio + pageSize - 1, length);
    return `${inicio} – ${fim} de ${length}`;
  };

  return intl;
}
