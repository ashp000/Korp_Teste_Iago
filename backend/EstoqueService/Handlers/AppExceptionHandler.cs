using EstoqueService.Exceptions;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace EstoqueService.Handlers
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
                ProdutoNaoEncontradoException => (StatusCodes.Status404NotFound, "Produto não encontrado"),
                CodigoDuplicadoException => (StatusCodes.Status409Conflict, "Código duplicado"),
                ProdutoEmUsoException => (StatusCodes.Status409Conflict, "Produto em uso"),
                SaldoInsuficienteException => (StatusCodes.Status409Conflict, "Saldo insuficiente"),
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
