using Anthropic;
using Anthropic.Exceptions;
using Anthropic.Models.Messages;

namespace EstoqueService.Services
{
    public interface IDescricaoIaService
    {
        Task<string> SugerirDescricaoAsync(string codigo);
    }

    // Diferencial "uso de IA": sugere uma descricao de produto a partir do codigo,
    // via API da Anthropic (SDK oficial). Falha da IA nunca derruba o cadastro:
    // cai num fallback amigavel para o usuario preencher manualmente.
    public class DescricaoIaService : IDescricaoIaService
    {
        private const string FallbackMessage = "Não foi possível gerar uma sugestão agora. Preencha a descrição manualmente.";

        private readonly AnthropicClient _client;
        private readonly ILogger<DescricaoIaService> _logger;

        public DescricaoIaService(ILogger<DescricaoIaService> logger)
        {
            _logger = logger;
            _client = new AnthropicClient();
        }

        public async Task<string> SugerirDescricaoAsync(string codigo)
        {
            try
            {
                var response = await _client.Messages.Create(new MessageCreateParams
                {
                    Model = "claude-opus-5",
                    MaxTokens = 300,
                    Messages =
                    [
                        new()
                        {
                            Role = Role.User,
                            Content = $"Sugira uma descrição curta (máximo 12 palavras) e objetiva de produto de estoque " +
                                      $"para um ERP, a partir apenas deste código de produto: \"{codigo}\". " +
                                      "Responda somente com a descrição, sem aspas e sem explicações adicionais."
                        }
                    ]
                });

                var texto = response.Content
                    .Select(b => b.Value)
                    .OfType<TextBlock>()
                    .FirstOrDefault()?.Text;

                return string.IsNullOrWhiteSpace(texto) ? FallbackMessage : texto.Trim();
            }
            catch (AnthropicRateLimitException ex)
            {
                _logger.LogWarning(ex, "Rate limit ao sugerir descrição via IA para o código {Codigo}", codigo);
                return FallbackMessage;
            }
            catch (Anthropic5xxException ex)
            {
                _logger.LogWarning(ex, "Serviço de IA indisponível ao sugerir descrição para o código {Codigo}", codigo);
                return FallbackMessage;
            }
            catch (AnthropicIOException ex)
            {
                _logger.LogWarning(ex, "Falha de rede ao chamar a IA para o código {Codigo}", codigo);
                return FallbackMessage;
            }
            catch (AnthropicApiException ex)
            {
                _logger.LogWarning(ex, "Erro da API de IA ao sugerir descrição para o código {Codigo}", codigo);
                return FallbackMessage;
            }
        }
    }
}
