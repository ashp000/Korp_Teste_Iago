using EstoqueService.Data;
using EstoqueService.Handlers;
using EstoqueService.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

const string AngularDevOrigin = "AngularDev";

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<EstoqueDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IProdutoService, ProdutoService>();
builder.Services.AddSingleton<IDescricaoIaService, DescricaoIaService>();

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
    scope.ServiceProvider.GetRequiredService<EstoqueDbContext>().Database.Migrate();
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
