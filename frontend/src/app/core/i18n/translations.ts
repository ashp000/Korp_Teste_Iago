export type Idioma = 'pt' | 'en' | 'es';

// Chaves em notação de ponto (ex: "produtos.novoProduto"), agrupadas por área da
// aplicação. Strings repetidas entre telas (ex: "Cancelar", "Descrição") usam uma
// chave só (common.*/campo.*) reaproveitada nos vários lugares.
export const TRANSLATIONS: Record<Idioma, Record<string, string>> = {
  pt: {
    // Comuns
    'common.cancelar': 'Cancelar',
    'common.salvar': 'Salvar',
    'common.editar': 'Editar',
    'common.excluir': 'Excluir',
    'common.acoes': 'Ações',
    'common.voltar': 'Voltar',
    'common.fechar': 'Fechar',
    'common.un': 'un',

    // Campos reaproveitados
    'campo.codigo': 'Código',
    'campo.descricao': 'Descrição',
    'campo.saldo': 'Saldo',
    'campo.quantidade': 'Quantidade',
    'campo.produto': 'Produto',

    // Navegação (sidebar)
    'nav.dashboard': 'Dashboard',
    'nav.produtos': 'Produtos',
    'nav.notasFiscais': 'Notas Fiscais',
    'nav.configuracoes': 'Configurações',

    // Títulos de rota (topbar + aba do navegador)
    'title.inicio': 'Início',
    'title.produtos': 'Produtos',
    'title.notasFiscais': 'Notas Fiscais',
    'title.novaNotaFiscal': 'Nova Nota Fiscal',
    'title.detalheNota': 'Detalhe da Nota',

    // Shell do app
    'app.emissorFiscal': 'Emissor Fiscal',
    'app.sistemaOnline': 'Sistema Online',
    'app.abrirMenu': 'Abrir menu',
    'app.produtosEstoqueBaixo': 'Produtos com estoque baixo',
    'app.estoqueBaixoPrefixo': 'Estoque baixo: ',

    // Status
    'status.aberta': 'Aberta',
    'status.fechada': 'Fechada',

    // Dashboard
    'dashboard.produtosCadastrados': 'Produtos cadastrados',
    'dashboard.saldoBaixo': 'Saldo baixo (< {limite})',
    'dashboard.notasAbertas': 'Notas abertas',
    'dashboard.notasEmitidas': 'Notas emitidas',
    'dashboard.verProdutos': 'Ver produtos',
    'dashboard.novaNotaFiscal': 'Nova nota fiscal',
    'dashboard.notasRecentes': 'Notas recentes',
    'dashboard.itens': 'item(ns)',

    // Produtos
    'produtos.novoProduto': 'Novo produto',
    'produtos.ajudaCodigo': 'Identificador único do produto, como um SKU ou código de barras.',
    'produtos.erroCodigo': 'Informe o código do produto',
    'produtos.ajudaDescricao': 'Nome do produto que vai aparecer nas notas fiscais.',
    'produtos.erroDescricao': 'Informe a descrição do produto',
    'produtos.sugerirIaTooltip': 'Sugerir descrição com IA a partir do código',
    'produtos.ajudaSaldo': 'Quantidade inicial em estoque. Deixe em branco para começar com 0.',
    'produtos.erroSaldoNegativo': 'Saldo não pode ser negativo',
    'produtos.buscarPlaceholder': 'Buscar por código ou descrição',
    'produtos.nenhumProdutoCadastrado': 'Nenhum produto cadastrado ainda.',
    'produtos.avisoSemCodigo': 'Informe o código antes de pedir uma sugestão.',
    'produtos.cadastradoSucesso': 'Produto cadastrado com sucesso.',
    'produtos.atualizadoSucesso': 'Produto {codigo} atualizado.',
    'produtos.excluidoSucesso': 'Produto {codigo} excluído.',
    'produtos.confirmarExclusaoTitulo': 'Excluir produto',
    'produtos.confirmarExclusaoMensagem':
      'Tem certeza que deseja excluir o produto "{codigo}"? Esta ação não pode ser desfeita.',

    // Editar produto (diálogo)
    'produtoEdit.titulo': 'Editar produto {codigo}',
    'produtoEdit.ajudaSaldo': 'Quantidade disponível em estoque.',

    // Notas fiscais (listagem)
    'notas.filtrarStatus': 'Filtrar por status',
    'notas.todas': 'Todas',
    'notas.abertas': 'Abertas',
    'notas.fechadas': 'Fechadas',
    'notas.buscarNumero': 'Buscar por número',
    'notas.numero': 'Número',
    'notas.dataAbertura': 'Abertura',
    'notas.itens': 'Itens',
    'notas.nenhumaNota': 'Nenhuma nota fiscal cadastrada ainda.',
    'notas.nenhumaComFiltro': 'Nenhuma nota encontrada com esse filtro.',

    // Nova nota fiscal
    'notaForm.titulo': 'Nova nota fiscal',
    'notaForm.produtoPlaceholder': 'Digite o código ou a descrição...',
    'notaForm.produtoOpcao': '{codigo} — {descricao} (saldo: {saldo})',
    'notaForm.nenhumProdutoEncontrado': 'Nenhum produto encontrado',
    'notaForm.ajudaProdutoBusca': 'Digite pra buscar o produto que será incluído nesta nota fiscal.',
    'notaForm.ajudaQuantidade': 'Quantidade que será baixada do estoque ao imprimir a nota.',
    'notaForm.removerItem': 'Remover item',
    'notaForm.adicionarProduto': 'Adicionar produto',
    'notaForm.criarNota': 'Criar nota',
    'notaForm.notaCriadaSucesso': 'Nota {numero} criada com sucesso.',

    // Detalhe da nota
    'notaDetail.emitenteNome': 'KORP ERP',
    'notaDetail.emitenteSub': 'Sistema de Emissão de Notas Fiscais',
    'notaDetail.tipoDocumento': 'Nota Fiscal',
    'notaDetail.numeroPrefixo': 'Nº {numero}',
    'notaDetail.dataAberturaLabel': 'Data de abertura',
    'notaDetail.dataFechamentoLabel': 'Data de fechamento',
    'notaDetail.totalItens': 'Total de itens: {total}',
    'notaDetail.semValorFiscal': 'Sem valor fiscal — documento de teste.',
    'notaDetail.salvarItens': 'Salvar itens',
    'notaDetail.editarItens': 'Editar itens',
    'notaDetail.baixarPdf': 'Baixar PDF',
    'notaDetail.imprimindo': 'Imprimindo...',
    'notaDetail.tentarNovamente': 'Tentar novamente',
    'notaDetail.imprimirNovamente': 'Imprimir novamente',
    'notaDetail.imprimir': 'Imprimir',
    'notaDetail.notaImpressaSucesso': 'Nota {numero} impressa e fechada com sucesso.',
    'notaDetail.itensAtualizados': 'Itens da nota atualizados.',
    'notaDetail.erro503': 'Estoque indisponível no momento. Tente novamente em instantes.',
    'notaDetail.erro400': 'Saldo insuficiente para um ou mais produtos desta nota.',
    'notaDetail.erro409': 'Esta nota já está fechada.',
    'notaDetail.erroGenerico': 'Não foi possível imprimir a nota. Tente novamente.',
    'notaDetail.pdfCodigo': 'CÓDIGO',
    'notaDetail.pdfDescricao': 'DESCRIÇÃO',
    'notaDetail.pdfQuantidade': 'QUANTIDADE',
    'notaDetail.pdfNotaFiscal': 'NOTA FISCAL',
    'notaDetail.pdfStatusPrefixo': 'Status: {status}',
    'notaDetail.pdfDataAbertura': 'Data de abertura: {data}',
    'notaDetail.pdfDataFechamento': 'Data de fechamento: {data}',

    // Paginador (Angular Material)
    'paginator.itensPorPagina': 'Itens por página:',
    'paginator.proximaPagina': 'Próxima página',
    'paginator.paginaAnterior': 'Página anterior',
    'paginator.primeiraPagina': 'Primeira página',
    'paginator.ultimaPagina': 'Última página',
    'paginator.rangeVazio': '0 de 0',
    'paginator.rangeLabel': '{pagina} de {total}',

    // Erros globais
    'erros.generico': 'Ocorreu um erro inesperado. Tente novamente.',

    // Configurações
    'configuracoes.titulo': 'Configurações',
    'configuracoes.tamanhoFonte': 'Tamanho da fonte',
    'configuracoes.pequena': 'Pequena',
    'configuracoes.media': 'Média',
    'configuracoes.grande': 'Grande',
    'configuracoes.tema': 'Tema',
    'configuracoes.claro': 'Claro',
    'configuracoes.escuro': 'Escuro',
    'configuracoes.idioma': 'Idioma'
  },
  en: {
    // Common
    'common.cancelar': 'Cancel',
    'common.salvar': 'Save',
    'common.editar': 'Edit',
    'common.excluir': 'Delete',
    'common.acoes': 'Actions',
    'common.voltar': 'Back',
    'common.fechar': 'Close',
    'common.un': 'units',

    // Shared fields
    'campo.codigo': 'Code',
    'campo.descricao': 'Description',
    'campo.saldo': 'Balance',
    'campo.quantidade': 'Quantity',
    'campo.produto': 'Product',

    // Navigation (sidebar)
    'nav.dashboard': 'Dashboard',
    'nav.produtos': 'Products',
    'nav.notasFiscais': 'Invoices',
    'nav.configuracoes': 'Settings',

    // Route titles (topbar + browser tab)
    'title.inicio': 'Home',
    'title.produtos': 'Products',
    'title.notasFiscais': 'Invoices',
    'title.novaNotaFiscal': 'New Invoice',
    'title.detalheNota': 'Invoice Details',

    // App shell
    'app.emissorFiscal': 'Invoice Issuer',
    'app.sistemaOnline': 'System Online',
    'app.abrirMenu': 'Open menu',
    'app.produtosEstoqueBaixo': 'Products with low stock',
    'app.estoqueBaixoPrefixo': 'Low stock: ',

    // Status
    'status.aberta': 'Open',
    'status.fechada': 'Closed',

    // Dashboard
    'dashboard.produtosCadastrados': 'Registered products',
    'dashboard.saldoBaixo': 'Low stock (< {limite})',
    'dashboard.notasAbertas': 'Open invoices',
    'dashboard.notasEmitidas': 'Issued invoices',
    'dashboard.verProdutos': 'View products',
    'dashboard.novaNotaFiscal': 'New invoice',
    'dashboard.notasRecentes': 'Recent invoices',
    'dashboard.itens': 'item(s)',

    // Products
    'produtos.novoProduto': 'New product',
    'produtos.ajudaCodigo': 'Unique product identifier, like a SKU or barcode.',
    'produtos.erroCodigo': 'Enter the product code',
    'produtos.ajudaDescricao': 'Product name that will appear on invoices.',
    'produtos.erroDescricao': 'Enter the product description',
    'produtos.sugerirIaTooltip': 'Suggest description with AI from the code',
    'produtos.ajudaSaldo': 'Initial stock quantity. Leave blank to start at 0.',
    'produtos.erroSaldoNegativo': 'Balance cannot be negative',
    'produtos.buscarPlaceholder': 'Search by code or description',
    'produtos.nenhumProdutoCadastrado': 'No products registered yet.',
    'produtos.avisoSemCodigo': 'Enter the code before requesting a suggestion.',
    'produtos.cadastradoSucesso': 'Product registered successfully.',
    'produtos.atualizadoSucesso': 'Product {codigo} updated.',
    'produtos.excluidoSucesso': 'Product {codigo} deleted.',
    'produtos.confirmarExclusaoTitulo': 'Delete product',
    'produtos.confirmarExclusaoMensagem':
      'Are you sure you want to delete product "{codigo}"? This action cannot be undone.',

    // Edit product (dialog)
    'produtoEdit.titulo': 'Edit product {codigo}',
    'produtoEdit.ajudaSaldo': 'Available stock quantity.',

    // Invoices (list)
    'notas.filtrarStatus': 'Filter by status',
    'notas.todas': 'All',
    'notas.abertas': 'Open',
    'notas.fechadas': 'Closed',
    'notas.buscarNumero': 'Search by number',
    'notas.numero': 'Number',
    'notas.dataAbertura': 'Opened',
    'notas.itens': 'Items',
    'notas.nenhumaNota': 'No invoices registered yet.',
    'notas.nenhumaComFiltro': 'No invoices found with this filter.',

    // New invoice
    'notaForm.titulo': 'New invoice',
    'notaForm.produtoPlaceholder': 'Type the code or description...',
    'notaForm.produtoOpcao': '{codigo} — {descricao} (stock: {saldo})',
    'notaForm.nenhumProdutoEncontrado': 'No products found',
    'notaForm.ajudaProdutoBusca': 'Type to search for the product to include in this invoice.',
    'notaForm.ajudaQuantidade': 'Quantity that will be deducted from stock when the invoice is printed.',
    'notaForm.removerItem': 'Remove item',
    'notaForm.adicionarProduto': 'Add product',
    'notaForm.criarNota': 'Create invoice',
    'notaForm.notaCriadaSucesso': 'Invoice {numero} created successfully.',

    // Invoice detail
    'notaDetail.emitenteNome': 'KORP ERP',
    'notaDetail.emitenteSub': 'Invoice Issuing System',
    'notaDetail.tipoDocumento': 'Invoice',
    'notaDetail.numeroPrefixo': 'No. {numero}',
    'notaDetail.dataAberturaLabel': 'Opening date',
    'notaDetail.dataFechamentoLabel': 'Closing date',
    'notaDetail.totalItens': 'Total items: {total}',
    'notaDetail.semValorFiscal': 'No fiscal value — test document.',
    'notaDetail.salvarItens': 'Save items',
    'notaDetail.editarItens': 'Edit items',
    'notaDetail.baixarPdf': 'Download PDF',
    'notaDetail.imprimindo': 'Printing...',
    'notaDetail.tentarNovamente': 'Try again',
    'notaDetail.imprimirNovamente': 'Print again',
    'notaDetail.imprimir': 'Print',
    'notaDetail.notaImpressaSucesso': 'Invoice {numero} printed and closed successfully.',
    'notaDetail.itensAtualizados': 'Invoice items updated.',
    'notaDetail.erro503': 'Stock service unavailable right now. Try again shortly.',
    'notaDetail.erro400': 'Insufficient stock for one or more products in this invoice.',
    'notaDetail.erro409': 'This invoice is already closed.',
    'notaDetail.erroGenerico': 'Could not print the invoice. Try again.',
    'notaDetail.pdfCodigo': 'CODE',
    'notaDetail.pdfDescricao': 'DESCRIPTION',
    'notaDetail.pdfQuantidade': 'QUANTITY',
    'notaDetail.pdfNotaFiscal': 'INVOICE',
    'notaDetail.pdfStatusPrefixo': 'Status: {status}',
    'notaDetail.pdfDataAbertura': 'Opening date: {data}',
    'notaDetail.pdfDataFechamento': 'Closing date: {data}',

    // Paginator (Angular Material)
    'paginator.itensPorPagina': 'Items per page:',
    'paginator.proximaPagina': 'Next page',
    'paginator.paginaAnterior': 'Previous page',
    'paginator.primeiraPagina': 'First page',
    'paginator.ultimaPagina': 'Last page',
    'paginator.rangeVazio': '0 of 0',
    'paginator.rangeLabel': '{pagina} of {total}',

    // Global errors
    'erros.generico': 'An unexpected error occurred. Try again.',

    // Settings
    'configuracoes.titulo': 'Settings',
    'configuracoes.tamanhoFonte': 'Font size',
    'configuracoes.pequena': 'Small',
    'configuracoes.media': 'Medium',
    'configuracoes.grande': 'Large',
    'configuracoes.tema': 'Theme',
    'configuracoes.claro': 'Light',
    'configuracoes.escuro': 'Dark',
    'configuracoes.idioma': 'Language'
  },
  es: {
    // Comunes
    'common.cancelar': 'Cancelar',
    'common.salvar': 'Guardar',
    'common.editar': 'Editar',
    'common.excluir': 'Eliminar',
    'common.acoes': 'Acciones',
    'common.voltar': 'Volver',
    'common.fechar': 'Cerrar',
    'common.un': 'un',

    // Campos compartidos
    'campo.codigo': 'Código',
    'campo.descricao': 'Descripción',
    'campo.saldo': 'Saldo',
    'campo.quantidade': 'Cantidad',
    'campo.produto': 'Producto',

    // Navegación (barra lateral)
    'nav.dashboard': 'Panel',
    'nav.produtos': 'Productos',
    'nav.notasFiscais': 'Facturas',
    'nav.configuracoes': 'Configuración',

    // Títulos de ruta (barra superior + pestaña del navegador)
    'title.inicio': 'Inicio',
    'title.produtos': 'Productos',
    'title.notasFiscais': 'Facturas',
    'title.novaNotaFiscal': 'Nueva Factura',
    'title.detalheNota': 'Detalle de la Factura',

    // Shell de la app
    'app.emissorFiscal': 'Emisor Fiscal',
    'app.sistemaOnline': 'Sistema en Línea',
    'app.abrirMenu': 'Abrir menú',
    'app.produtosEstoqueBaixo': 'Productos con poco stock',
    'app.estoqueBaixoPrefixo': 'Poco stock: ',

    // Estado
    'status.aberta': 'Abierta',
    'status.fechada': 'Cerrada',

    // Panel
    'dashboard.produtosCadastrados': 'Productos registrados',
    'dashboard.saldoBaixo': 'Poco stock (< {limite})',
    'dashboard.notasAbertas': 'Facturas abiertas',
    'dashboard.notasEmitidas': 'Facturas emitidas',
    'dashboard.verProdutos': 'Ver productos',
    'dashboard.novaNotaFiscal': 'Nueva factura',
    'dashboard.notasRecentes': 'Facturas recientes',
    'dashboard.itens': 'artículo(s)',

    // Productos
    'produtos.novoProduto': 'Nuevo producto',
    'produtos.ajudaCodigo': 'Identificador único del producto, como un SKU o código de barras.',
    'produtos.erroCodigo': 'Indique el código del producto',
    'produtos.ajudaDescricao': 'Nombre del producto que aparecerá en las facturas.',
    'produtos.erroDescricao': 'Indique la descripción del producto',
    'produtos.sugerirIaTooltip': 'Sugerir descripción con IA a partir del código',
    'produtos.ajudaSaldo': 'Cantidad inicial en stock. Déjelo en blanco para empezar en 0.',
    'produtos.erroSaldoNegativo': 'El saldo no puede ser negativo',
    'produtos.buscarPlaceholder': 'Buscar por código o descripción',
    'produtos.nenhumProdutoCadastrado': 'Aún no hay productos registrados.',
    'produtos.avisoSemCodigo': 'Indique el código antes de pedir una sugerencia.',
    'produtos.cadastradoSucesso': 'Producto registrado con éxito.',
    'produtos.atualizadoSucesso': 'Producto {codigo} actualizado.',
    'produtos.excluidoSucesso': 'Producto {codigo} eliminado.',
    'produtos.confirmarExclusaoTitulo': 'Eliminar producto',
    'produtos.confirmarExclusaoMensagem':
      '¿Seguro que desea eliminar el producto "{codigo}"? Esta acción no se puede deshacer.',

    // Editar producto (diálogo)
    'produtoEdit.titulo': 'Editar producto {codigo}',
    'produtoEdit.ajudaSaldo': 'Cantidad disponible en stock.',

    // Facturas (listado)
    'notas.filtrarStatus': 'Filtrar por estado',
    'notas.todas': 'Todas',
    'notas.abertas': 'Abiertas',
    'notas.fechadas': 'Cerradas',
    'notas.buscarNumero': 'Buscar por número',
    'notas.numero': 'Número',
    'notas.dataAbertura': 'Apertura',
    'notas.itens': 'Artículos',
    'notas.nenhumaNota': 'Aún no hay facturas registradas.',
    'notas.nenhumaComFiltro': 'No se encontró ninguna factura con ese filtro.',

    // Nueva factura
    'notaForm.titulo': 'Nueva factura',
    'notaForm.produtoPlaceholder': 'Escriba el código o la descripción...',
    'notaForm.produtoOpcao': '{codigo} — {descricao} (saldo: {saldo})',
    'notaForm.nenhumProdutoEncontrado': 'Ningún producto encontrado',
    'notaForm.ajudaProdutoBusca': 'Escriba para buscar el producto que se incluirá en esta factura.',
    'notaForm.ajudaQuantidade': 'Cantidad que se descontará del stock al imprimir la factura.',
    'notaForm.removerItem': 'Quitar artículo',
    'notaForm.adicionarProduto': 'Agregar producto',
    'notaForm.criarNota': 'Crear factura',
    'notaForm.notaCriadaSucesso': 'Factura {numero} creada con éxito.',

    // Detalle de la factura
    'notaDetail.emitenteNome': 'KORP ERP',
    'notaDetail.emitenteSub': 'Sistema de Emisión de Facturas',
    'notaDetail.tipoDocumento': 'Factura',
    'notaDetail.numeroPrefixo': 'N.º {numero}',
    'notaDetail.dataAberturaLabel': 'Fecha de apertura',
    'notaDetail.dataFechamentoLabel': 'Fecha de cierre',
    'notaDetail.totalItens': 'Total de artículos: {total}',
    'notaDetail.semValorFiscal': 'Sin valor fiscal — documento de prueba.',
    'notaDetail.salvarItens': 'Guardar artículos',
    'notaDetail.editarItens': 'Editar artículos',
    'notaDetail.baixarPdf': 'Descargar PDF',
    'notaDetail.imprimindo': 'Imprimiendo...',
    'notaDetail.tentarNovamente': 'Intentar de nuevo',
    'notaDetail.imprimirNovamente': 'Imprimir de nuevo',
    'notaDetail.imprimir': 'Imprimir',
    'notaDetail.notaImpressaSucesso': 'Factura {numero} impresa y cerrada con éxito.',
    'notaDetail.itensAtualizados': 'Artículos de la factura actualizados.',
    'notaDetail.erro503': 'Stock no disponible en este momento. Intente de nuevo en breve.',
    'notaDetail.erro400': 'Saldo insuficiente para uno o más productos de esta factura.',
    'notaDetail.erro409': 'Esta factura ya está cerrada.',
    'notaDetail.erroGenerico': 'No se pudo imprimir la factura. Intente de nuevo.',
    'notaDetail.pdfCodigo': 'CÓDIGO',
    'notaDetail.pdfDescricao': 'DESCRIPCIÓN',
    'notaDetail.pdfQuantidade': 'CANTIDAD',
    'notaDetail.pdfNotaFiscal': 'FACTURA',
    'notaDetail.pdfStatusPrefixo': 'Estado: {status}',
    'notaDetail.pdfDataAbertura': 'Fecha de apertura: {data}',
    'notaDetail.pdfDataFechamento': 'Fecha de cierre: {data}',

    // Paginador (Angular Material)
    'paginator.itensPorPagina': 'Artículos por página:',
    'paginator.proximaPagina': 'Página siguiente',
    'paginator.paginaAnterior': 'Página anterior',
    'paginator.primeiraPagina': 'Primera página',
    'paginator.ultimaPagina': 'Última página',
    'paginator.rangeVazio': '0 de 0',
    'paginator.rangeLabel': '{pagina} de {total}',

    // Errores globales
    'erros.generico': 'Ocurrió un error inesperado. Intente de nuevo.',

    // Configuración
    'configuracoes.titulo': 'Configuración',
    'configuracoes.tamanhoFonte': 'Tamaño de fuente',
    'configuracoes.pequena': 'Pequeña',
    'configuracoes.media': 'Media',
    'configuracoes.grande': 'Grande',
    'configuracoes.tema': 'Tema',
    'configuracoes.claro': 'Claro',
    'configuracoes.escuro': 'Oscuro',
    'configuracoes.idioma': 'Idioma'
  }
};
