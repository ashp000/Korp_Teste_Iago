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
- **Idempotência:** cada baixa de saldo grava uma `MovimentacaoEstoque` com índice único em `(NotaFiscalId, NotaFiscalItemId)` — a chave é o item da nota, não o produto, então o mesmo produto pode aparecer em duas linhas da mesma nota e cada uma baixa estoque separadamente. Reenviar a mesma nota (retry de rede, duplo clique, etc.) é detectado antes de decrementar de novo. A numeração de notas fiscais também usa uma `SEQUENCE` nativa do Postgres, atômica por natureza.
- **Uso de IA:** `POST /api/produtos/sugerir-descricao` no EstoqueService chama a API da Anthropic (SDK oficial `Anthropic` para C#, modelo `claude-opus-5`) para sugerir uma descrição de produto a partir do código digitado. Sem `ANTHROPIC_API_KEY` configurada, ou em caso de falha da IA, o endpoint nunca derruba o cadastro — retorna uma mensagem de fallback para preenchimento manual. O botão que chamava esse endpoint foi removido da tela de Produtos para esta entrega: a API da Anthropic é paga e não há uma chave disponível para o ambiente de teste, então o endpoint fica implementado e testável diretamente (Swagger/Postman), mas sem um atalho na UI.
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

## Variáveis de ambiente

Ver `.env.example` na raiz. A única necessária é `ANTHROPIC_API_KEY` (opcional — sem ela, a sugestão de descrição por IA sempre cai no fallback).
