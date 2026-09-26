# Lê um arquivo em partes de até 20 KB (para caber no contexto limitado da LLM).
# Uso: powershell -ExecutionPolicy Bypass -File ferramentas\ler.ps1 <arquivo> [parte] [-Tamanho 20000]
#   sem [parte]: mostra só quantas partes o arquivo tem e o início de cada uma
#   com [parte]: mostra aquela parte (corta sempre em fim de linha, nunca no meio)
param([Parameter(Mandatory = $true)][string]$Arquivo, [int]$Parte = 0, [int]$Tamanho = 20000)
$ErrorActionPreference = "Stop"
if (-not (Test-Path $Arquivo)) { throw "arquivo não encontrado: $Arquivo" }
$utf8 = New-Object Text.UTF8Encoding($false)
$linhas = [IO.File]::ReadAllLines((Resolve-Path $Arquivo), $utf8)
$partes = @(); $ini = 0; $bytes = 0
for ($i = 0; $i -lt $linhas.Count; $i++) {
  $b = $utf8.GetByteCount($linhas[$i]) + 1
  if ($bytes -gt 0 -and $bytes + $b -gt $Tamanho) { $partes += , @($ini, ($i - 1)); $ini = $i; $bytes = 0 }
  $bytes += $b
}
$partes += , @($ini, ($linhas.Count - 1))
$total = $partes.Count
if ($Parte -lt 1) {
  "$Arquivo : $($linhas.Count) linhas, $total parte(s) de até $Tamanho bytes"
  for ($p = 0; $p -lt $total; $p++) { $a = $partes[$p][0]; "  parte $($p + 1): linhas $($a + 1)-$($partes[$p][1] + 1) · começa com: $($linhas[$a].Trim())" }
  exit 0
}
if ($Parte -gt $total) { throw "o arquivo só tem $total parte(s)" }
$a = $partes[$Parte - 1][0]; $z = $partes[$Parte - 1][1]
"=== $Arquivo · parte $Parte de $total · linhas $($a + 1)-$($z + 1) ==="
$linhas[$a..$z]
if ($Parte -lt $total) { "=== continua na parte $($Parte + 1) ===" } else { "=== fim do arquivo ===" }
