# Registra um passo concluído na linha do tempo do painel (http://localhost:3100).
# Uso: powershell -ExecutionPolicy Bypass -File ferramentas\andamento.ps1 "etapa 1: tabela de clientes criada"
param([Parameter(Mandatory = $true)][string]$Texto)
$ErrorActionPreference = "Stop"
$pasta = Join-Path (Split-Path $PSScriptRoot -Parent) "logs"
New-Item -ItemType Directory -Force $pasta | Out-Null
$linha = "$(Get-Date -Format s) $($Texto -replace '[\r\n]+', ' ')"
[IO.File]::AppendAllText((Join-Path $pasta "andamento.log"), $linha + "`n", (New-Object Text.UTF8Encoding($false)))
"registrado: $linha"
