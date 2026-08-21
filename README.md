# Korp_Teste_Iago

Sistema de Emissão de Notas Fiscais — Teste técnico KORP ERP.

## Stack

- **Frontend:** Angular 22 (standalone components) + Angular Material (tema customizado) + Angular CDK (`BreakpointObserver`)
- **Backend:** C# / .NET 8, dois microsserviços independentes
  - **EstoqueService** — cadastro de produtos e baixa de saldo (porta `5001`)
  - **FaturamentoService** — emissão e impressão de notas fiscais (porta `5002`)
- **Banco de dados:** PostgreSQL 16 (um banco por serviço: `korp_estoque` e `korp_faturamento`)
- **Comunicação entre serviços:** REST, com `HttpClient` tipado + resilience handler padrão do .NET 8 (retry, circuit breaker e timeout via Polly)

## Telas

- **Início:** dashboard com total de produtos, produtos com saldo baixo, notas abertas/fechadas e atalhos.
- **Produtos:** cadastro, edição e exclusão (bloqueada se o produto já tem histórico de movimentação), busca e paginação.
- **Notas fiscais:** listagem com filtro por status e busca por número; criação com múltiplos itens; edição dos itens enquanto a nota está Aberta; impressão com PDF automático.
- Layout responsivo (sidebar vira um menu retrátil em telas pequenas, tabelas com scroll horizontal, formulários empilham em telas estreitas).

## Diferenciais implementados

- **Concorrência:** a baixa de saldo (`POST /api/produtos/baixar-saldo` no EstoqueService) usa `ExecuteUpdateAsync` do EF Core para gerar um `UPDATE ... WHERE Saldo >= quantidade` atômico no próprio banco — sem carregar a entidade em memória. Quando duas notas disputam o último saldo, apenas uma linha é afetada; a outra chamada recebe 0 linhas afetadas e retorna "saldo insuficiente".
- **Idempotência:** cada baixa de saldo grava uma `MovimentacaoEstoque` com índice único em `(NotaFiscalId, ProdutoId)`. Reenviar a mesma nota (retry de rede, duplo clique, etc.) é detectado antes de decrementar de novo. A numeração de notas fiscais também usa uma `SEQUENCE` nativa do Postgres, atômica por natureza.
- **Uso de IA:** `POST /api/produtos/sugerir-descricao` no EstoqueService chama a API da Anthropic (SDK oficial `Anthropic` para C#, modelo `claude-opus-5`) para sugerir uma descrição de produto a partir do código digitado. Sem `ANTHROPIC_API_KEY` configurada, ou em caso de falha da IA, o endpoint nunca derruba o cadastro — retorna uma mensagem de fallback para preenchimento manual.
- **Tratamento de falhas:** se o EstoqueService cair, o resilience handler do FaturamentoService tenta novamente automaticamente; se ainda assim falhar, a API retorna `503` e o frontend mostra um estado de erro com botão "Tentar novamente" — sem duplicar a baixa de estoque graças à idempotência acima.

## Como rodar

### Opção 1 — Docker Compose

```bash
cp .env.example .env   # opcional: preencha ANTHROPIC_API_KEY para habilitar a sugestão por IA
docker-compose up --build
```

Sobe Postgres, os dois serviços .NET (com migrations aplicadas automaticamente na subida) e o frontend Angular (Nginx). Portas: `5001` (Estoque), `5002` (Faturamento), `4200` (frontend), `5432` (Postgres).

> Este `docker-compose.yml` e os `Dockerfile`s foram escritos e revisados, mas não puderam ser testados nesta máquina de desenvolvimento por falta do Docker instalado — vale um `docker-compose up --build` antes de gravar o vídeo.

### Opção 2 — Local (sem Docker)

Pré-requisitos: .NET 8 SDK, Node 22+, PostgreSQL rodando localmente.

```bash
# 1. Backend — em cada serviço (backend/EstoqueService e backend/FaturamentoService):
#    crie um appsettings.Development.json (gitignored) com sua connection string local,
#    e no FaturamentoService aponte "Servicos:EstoqueBaseUrl" para http://localhost:5001.
cd backend/EstoqueService
dotnet ef database update
dotnet run --urls "http://localhost:5001"

cd backend/FaturamentoService
dotnet ef database update
dotnet run --urls "http://localhost:5002"

# 2. Frontend
cd frontend
npm install
npm start   # http://localhost:4200
```

O fluxo completo (cadastro de produto → criação de nota → impressão → baixa de saldo → idempotência → concorrência) foi validado ponta a ponta desta forma durante o desenvolvimento, direto contra os endpoints da API.

## Roteiro sugerido para o vídeo

1. **Cadastro de produtos** — criar produto, usar o botão de sugestão de descrição por IA.
2. **Emissão de nota** — criar nota com múltiplos produtos e quantidades; mostrar a numeração sequencial.
3. **Impressão** — imprimir a nota (botão com spinner), mostrar status virando "Fechada", o PDF sendo baixado automaticamente (gerado no navegador com `jsPDF`) e o saldo abatido na tela de produtos. Tentar imprimir de novo → erro 409 (idempotência da regra de negócio). O botão "Baixar PDF" permite baixar de novo a qualquer momento depois.
4. **Falha e recuperação:** com os serviços rodando via Docker, pare o container do EstoqueService (`docker stop korp_estoque_service`), tente imprimir uma nota aberta → a UI mostra erro e botão "Tentar novamente"; suba o container de novo (`docker start korp_estoque_service`) e clique em "Tentar novamente" → sucesso.
5. **Concorrência:** com um produto de saldo 1, criar duas notas para o mesmo produto e disparar a impressão das duas ao mesmo tempo (duas abas, ou dois `curl`/Postman em paralelo) → só uma fecha, a outra recebe "saldo insuficiente".
6. **Detalhamento técnico** (falar sobre, com base no código):
   - **Ciclos de vida Angular usados:** `ngOnInit` (carga inicial de dados em todas as telas), `ngAfterViewChecked` (associação do `MatSort`/`MatPaginator` à tabela de produtos — eles só existem no DOM depois que os produtos carregam, então a conexão precisa ser feita a cada checagem da view, não só uma vez).
   - **RxJS:** `finalize` (liga/desliga spinners independente de sucesso/erro — inclusive no botão Imprimir), `catchError`/interceptor HTTP funcional para toasts de erro globais, `HttpContext` para a tela de impressão pular o toast genérico e tratar 409/400/503 com UI própria, `debounceTime`/`distinctUntilChanged` nos campos de busca.
   - **Bibliotecas:** Angular Material (sidenav, tabelas, formulários, diálogos, spinners, chips de status — com tema e CSS customizados pra fugir do visual padrão) + Reactive Forms (`FormArray` para os itens da nota) + `jsPDF` (geração do PDF da nota fiscal no navegador, carregado sob demanda via `import()` dinâmico só quando o usuário imprime/baixa).
   - **Backend (.NET/C#):** LINQ + `ExecuteUpdateAsync` do EF Core para o decremento atômico; `IExceptionHandler` global mapeando exceções de domínio para `ProblemDetails` com status HTTP corretos (404/409/400/503); `HttpClient` tipado com `AddStandardResilienceHandler` (Polly) para chamada entre microsserviços; SDK oficial da Anthropic para a sugestão por IA.

## Variáveis de ambiente

Ver `.env.example` na raiz. A única necessária é `ANTHROPIC_API_KEY` (opcional — sem ela, a sugestão de descrição por IA sempre cai no fallback).
