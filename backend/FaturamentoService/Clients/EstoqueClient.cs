using System.Net;
using System.Net.Http.Json;
using FaturamentoService.Exceptions;
using Microsoft.AspNetCore.Mvc;
using Polly.CircuitBreaker;
using Polly.Timeout;

namespace FaturamentoService.Clients
{
    public record BaixarSaldoItemRequest(int ProdutoId, int Quantidade);

    public record BaixarSaldoRequest(int NotaFiscalId, List<BaixarSaldoItemRequest> Itens);

    public record BaixarSaldoItemResultado(int ProdutoId, int Quantidade, bool JaProcessado);

    public record BaixarSaldoResponse(int NotaFiscalId, List<BaixarSaldoItemResultado> Itens);

    public interface IEstoqueClient
    {
        Task<BaixarSaldoResponse> BaixarSaldoAsync(BaixarSaldoRequest request);
    }

    // HttpClient tipado apontando para o EstoqueService, com o resilience handler padrao do
    // .NET 8 (retry + circuit breaker + timeout) registrado em Program.cs via AddStandardResilienceHandler.
    // Isso cobre o requisito de "tratamento de falhas": se o EstoqueService cair, as tentativas
    // automaticas do Polly rodam primeiro; se ainda assim falhar, vira EstoqueIndisponivelException (503)
    // para o frontend mostrar feedback e permitir nova tentativa.
    public class EstoqueClient : IEstoqueClient
    {
        private readonly HttpClient _httpClient;

        public EstoqueClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<BaixarSaldoResponse> BaixarSaldoAsync(BaixarSaldoRequest request)
        {
            HttpResponseMessage response;
            try
            {
                response = await _httpClient.PostAsJsonAsync("api/produtos/baixar-saldo", request);
            }
            catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException or BrokenCircuitException or TimeoutRejectedException)
            {
                throw new EstoqueIndisponivelException("Estoque indisponível no momento. Tente novamente em instantes.");
            }

            if (response.StatusCode == HttpStatusCode.Conflict)
            {
                var problema = await response.Content.ReadFromJsonAsync<ProblemDetails>();
                throw new SaldoInsuficienteException(problema?.Detail ?? "Saldo insuficiente para um ou mais produtos.");
            }

            if (!response.IsSuccessStatusCode)
                throw new EstoqueIndisponivelException("Estoque indisponível no momento. Tente novamente em instantes.");

            var resultado = await response.Content.ReadFromJsonAsync<BaixarSaldoResponse>();
            return resultado!;
        }
    }
}
