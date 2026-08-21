using FaturamentoService.Exceptions;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace FaturamentoService.Handlers
{
    public class AppExceptionHandler : IExceptionHandler
    {
        private readonly ILogger<AppExceptionHandler> _logger;

        public AppExceptionHandler(ILogger<AppExceptionHandler> logger)
        {
            _logger = logger;
        }

        public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
        {
            var (status, title) = exception switch
            {
                NotaFiscalNaoEncontradaException => (StatusCodes.Status404NotFound, "Nota fiscal não encontrada"),
                NotaFiscalJaFechadaException => (StatusCodes.Status409Conflict, "Nota fiscal já fechada"),
                NotaFiscalSemItensException => (StatusCodes.Status400BadRequest, "Nota fiscal sem itens"),
                SaldoInsuficienteException => (StatusCodes.Status400BadRequest, "Saldo insuficiente"),
                EstoqueIndisponivelException => (StatusCodes.Status503ServiceUnavailable, "Estoque indisponível"),
                _ => (StatusCodes.Status500InternalServerError, "Erro interno")
            };

            if (status == StatusCodes.Status500InternalServerError)
                _logger.LogError(exception, "Erro não tratado em {Path}", httpContext.Request.Path);

            httpContext.Response.StatusCode = status;
            await httpContext.Response.WriteAsJsonAsync(new ProblemDetails
            {
                Status = status,
                Title = title,
                Detail = exception.Message
            }, cancellationToken);

            return true;
        }
    }
}
