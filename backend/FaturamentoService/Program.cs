using FaturamentoService.Clients;
using FaturamentoService.Data;
using FaturamentoService.Handlers;
using FaturamentoService.Services;
using Microsoft.EntityFrameworkCore;
using Polly;

var builder = WebApplication.CreateBuilder(args);

const string AngularDevOrigin = "AngularDev";

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<FaturamentoDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<INotaFiscalService, NotaFiscalService>();

builder.Services
    .AddHttpClient<IEstoqueClient, EstoqueClient>(client =>
    {
        var baseUrl = builder.Configuration["Servicos:EstoqueBaseUrl"]
            ?? throw new InvalidOperationException("Configuração 'Servicos:EstoqueBaseUrl' não definida.");
        client.BaseAddress = new Uri(baseUrl);
    })
    // Timeouts padrão do AddStandardResilienceHandler somam ~30s até desistir (bom pra produção,
    // ruim pra demonstrar "falha e recuperação" ao vivo). Encurtado para a chamada falhar rápido
    // e o usuário ver o botão "Tentar novamente" em poucos segundos, não meio minuto.
    .AddStandardResilienceHandler(options =>
    {
        options.AttemptTimeout.Timeout = TimeSpan.FromSeconds(2);
        options.Retry.MaxRetryAttempts = 2;
        options.Retry.Delay = TimeSpan.FromMilliseconds(300);
        options.Retry.BackoffType = DelayBackoffType.Exponential;
        options.CircuitBreaker.SamplingDuration = TimeSpan.FromSeconds(4);
        options.TotalRequestTimeout.Timeout = TimeSpan.FromSeconds(6);
    });

builder.Services.AddExceptionHandler<AppExceptionHandler>();
builder.Services.AddProblemDetails();

builder.Services.AddCors(options =>
{
    options.AddPolicy(AngularDevOrigin, policy =>
        // SetIsOriginAllowed substitui a checagem padrão do WithOrigins, então a comparação
        // com localhost precisa entrar no mesmo predicado — libera o Angular dev server local
        // e os deploys de teste do frontend na Vercel (a URL muda a cada deploy, por isso o
        // match é pelo domínio do projeto, não por uma URL fixa).
        policy.SetIsOriginAllowed(origin =>
                  origin == "http://localhost:4200" ||
                  (Uri.TryCreate(origin, UriKind.Absolute, out var uri) &&
                   uri.Host.EndsWith(".vercel.app") &&
                   uri.Host.StartsWith("korp-teste-iago")))
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

// Aplica migrations automaticamente na subida (simplificação deliberada para o teste técnico:
// evita passo manual de `dotnet ef database update` ao rodar via docker-compose).
using (var scope = app.Services.CreateScope())
{
    scope.ServiceProvider.GetRequiredService<FaturamentoDbContext>().Database.Migrate();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseExceptionHandler();

app.UseCors(AngularDevOrigin);

app.UseAuthorization();

app.MapControllers();

app.Run();
