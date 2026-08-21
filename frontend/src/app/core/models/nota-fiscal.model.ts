export type StatusNotaFiscal = 'Aberta' | 'Fechada';

export interface ItemNotaFiscal {
  produtoId: number;
  produtoCodigo: string;
  quantidade: number;
}

export interface NotaFiscal {
  id: number;
  numero: number;
  status: StatusNotaFiscal;
  dataAbertura: string;
  dataFechamento: string | null;
  itens: ItemNotaFiscal[];
}

export interface CriarNotaFiscalPayload {
  itens: ItemNotaFiscal[];
}
