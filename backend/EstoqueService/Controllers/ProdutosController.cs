using EstoqueService.Dtos;
using EstoqueService.Services;
using Microsoft.AspNetCore.Mvc;

namespace EstoqueService.Controllers
{
    [ApiController]
    [Route("api/produtos")]
    public class ProdutosController : ControllerBase
    {
        private readonly IProdutoService _produtoService;
        private readonly IDescricaoIaService _descricaoIaService;

        public ProdutosController(IProdutoService produtoService, IDescricaoIaService descricaoIaService)
        {
            _produtoService = produtoService;
            _descricaoIaService = descricaoIaService;
        }

        [HttpGet]
        public async Task<ActionResult<List<ProdutoResponse>>> Listar() =>
            Ok(await _produtoService.ListarAsync());

        [HttpGet("{id:int}")]
        public async Task<ActionResult<ProdutoResponse>> Obter(int id) =>
            Ok(await _produtoService.ObterAsync(id));

        [HttpPost]
        public async Task<ActionResult<ProdutoResponse>> Criar([FromBody] CriarProdutoRequest request)
        {
            var produto = await _produtoService.CriarAsync(request);
            return CreatedAtAction(nameof(Obter), new { id = produto.Id }, produto);
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult<ProdutoResponse>> Atualizar(int id, [FromBody] AtualizarProdutoRequest request) =>
            Ok(await _produtoService.AtualizarAsync(id, request));

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Excluir(int id)
        {
            await _produtoService.ExcluirAsync(id);
            return NoContent();
        }

        [HttpPost("baixar-saldo")]
        public async Task<ActionResult<BaixarSaldoResponse>> BaixarSaldo([FromBody] BaixarSaldoRequest request) =>
            Ok(await _produtoService.BaixarSaldoAsync(request));

        [HttpPost("sugerir-descricao")]
        public async Task<ActionResult<SugerirDescricaoResponse>> SugerirDescricao([FromBody] SugerirDescricaoRequest request)
        {
            var descricao = await _descricaoIaService.SugerirDescricaoAsync(request.Codigo);
            return Ok(new SugerirDescricaoResponse(descricao));
        }
    }
}
