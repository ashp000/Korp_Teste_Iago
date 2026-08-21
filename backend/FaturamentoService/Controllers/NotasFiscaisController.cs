using FaturamentoService.Dtos;
using FaturamentoService.Services;
using Microsoft.AspNetCore.Mvc;

namespace FaturamentoService.Controllers
{
    [ApiController]
    [Route("api/notas-fiscais")]
    public class NotasFiscaisController : ControllerBase
    {
        private readonly INotaFiscalService _notaFiscalService;

        public NotasFiscaisController(INotaFiscalService notaFiscalService)
        {
            _notaFiscalService = notaFiscalService;
        }

        [HttpGet]
        public async Task<ActionResult<List<NotaFiscalResponse>>> Listar() =>
            Ok(await _notaFiscalService.ListarAsync());

        [HttpGet("{id:int}")]
        public async Task<ActionResult<NotaFiscalResponse>> Obter(int id) =>
            Ok(await _notaFiscalService.ObterAsync(id));

        [HttpPost]
        public async Task<ActionResult<NotaFiscalResponse>> Criar([FromBody] CriarNotaFiscalRequest request)
        {
            var nota = await _notaFiscalService.CriarAsync(request);
            return CreatedAtAction(nameof(Obter), new { id = nota.Id }, nota);
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult<NotaFiscalResponse>> AtualizarItens(int id, [FromBody] AtualizarNotaFiscalRequest request) =>
            Ok(await _notaFiscalService.AtualizarItensAsync(id, request));

        [HttpPost("{id:int}/imprimir")]
        public async Task<ActionResult<NotaFiscalResponse>> Imprimir(int id) =>
            Ok(await _notaFiscalService.ImprimirAsync(id));
    }
}
