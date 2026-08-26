<#
.SYNOPSIS
    Aponta os dois microsservicos para um Postgres Neon.

.DESCRIPTION
    Recebe a connection URL do Neon (postgresql://usuario:senha@host/banco?sslmode=require),
    converte para o formato do Npgsql e grava os appsettings.Development.json de cada servico,
    preservando as demais chaves ja existentes no arquivo.

    Cada servico continua com o seu proprio banco (korp_estoque e korp_faturamento), entao
    os dois precisam existir no projeto Neon antes de subir os servicos. As tabelas sao
    criadas sozinhas: os dois Program.cs chamam Database.Migrate() na subida.

.EXAMPLE
    .\scripts\configurar-banco-neon.ps1 -Url "postgresql://neondb_owner:senha@ep-xxx.sa-east-1.aws.neon.tech/neondb?sslmode=require"
#>
[CmdletBinding()]
param(
    # Connection URL copiada do painel do Neon. Se omitida, usa $env:NEON_DATABASE_URL.
    [string]$Url = $env:NEON_DATABASE_URL,

    [string]$BancoEstoque = 'korp_estoque',
    [string]$BancoFaturamento = 'korp_faturamento'
)

$ErrorActionPreference = 'Stop'

if ([string]::IsNullOrWhiteSpace($Url)) {
    throw 'Informe a connection URL do Neon em -Url ou na variavel de ambiente NEON_DATABASE_URL.'
}

$uri = [System.Uri]$Url
if ($uri.Scheme -notin @('postgres', 'postgresql')) {
    throw "URL invalida: esperado um postgresql://..., recebido '$($uri.Scheme)://'."
}

$credenciais = $uri.UserInfo -split ':', 2
if ($credenciais.Count -ne 2) {
    throw 'A URL precisa conter usuario e senha (postgresql://usuario:senha@host/banco).'
}

$usuario = [System.Uri]::UnescapeDataString($credenciais[0])
$senha = [System.Uri]::UnescapeDataString($credenciais[1])
$porta = if ($uri.Port -gt 0) { $uri.Port } else { 5432 }

function New-ConnectionString([string]$banco) {
    # Trust Server Certificate evita depender da cadeia de CA da maquina; o Neon so aceita TLS.
    "Host=$($uri.Host);Port=$porta;Database=$banco;Username=$usuario;Password=$senha;SSL Mode=Require;Trust Server Certificate=true"
}

$raiz = Split-Path -Parent $PSScriptRoot

$alvos = @(
    @{ Arquivo = Join-Path $raiz 'backend\EstoqueService\appsettings.Development.json'; Banco = $BancoEstoque },
    @{ Arquivo = Join-Path $raiz 'backend\FaturamentoService\appsettings.Development.json'; Banco = $BancoFaturamento }
)

foreach ($alvo in $alvos) {
    if (-not (Test-Path $alvo.Arquivo)) {
        throw "Arquivo nao encontrado: $($alvo.Arquivo)"
    }

    # Backup do arquivo atual (a connection string local costuma ser a unica copia dela,
    # porque appsettings.Development.json e gitignored).
    Copy-Item $alvo.Arquivo "$($alvo.Arquivo).bak" -Force

    $json = Get-Content $alvo.Arquivo -Raw | ConvertFrom-Json

    if ($null -eq $json.ConnectionStrings) {
        $json | Add-Member -MemberType NoteProperty -Name ConnectionStrings -Value ([pscustomobject]@{})
    }

    $conexao = New-ConnectionString $alvo.Banco
    if ($null -eq $json.ConnectionStrings.DefaultConnection) {
        $json.ConnectionStrings | Add-Member -MemberType NoteProperty -Name DefaultConnection -Value $conexao
    }
    else {
        $json.ConnectionStrings.DefaultConnection = $conexao
    }

    $json | ConvertTo-Json -Depth 10 | Set-Content $alvo.Arquivo -Encoding utf8
    Write-Host "OK  $($alvo.Arquivo) -> banco '$($alvo.Banco)' em $($uri.Host)"
}

Write-Host ''
Write-Host 'Pronto. Confirme que os bancos existem no projeto Neon e suba os servicos:'
Write-Host '  dotnet run --project backend/EstoqueService --urls "http://localhost:5001"'
Write-Host '  dotnet run --project backend/FaturamentoService --urls "http://localhost:5002"'
