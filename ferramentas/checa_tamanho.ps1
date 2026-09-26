# Regra do projeto Vortex: NENHUM arquivo de projeto pode passar de 20 KB (20480 bytes).
# Uso: powershell -File ferramentas\checa_tamanho.ps1   (sai com codigo 1 se algum arquivo passar)
# Ignora: .git, node_modules, ambientes virtuais Python, caches, a pasta .qwen/.claude,
# saidas de build geradas (.next, .next-export, .playwright-mcp) e package-lock.json (gerado pelo npm)
param([string]$Raiz = (Split-Path $PSScriptRoot -Parent), [int]$Limite = 20480)
$ign = '\\(\.git|node_modules|\.venv|venv|__pycache__|\.qwen|\.claude|dist|build|\.next|\.next-export|\.playwright-mcp)\\|\\package-lock\.json$'
$grandes = Get-ChildItem $Raiz -Recurse -File -Force -ErrorAction SilentlyContinue |
  Where-Object { $_.FullName -notmatch $ign -and $_.Length -gt $Limite } | Sort-Object Length -Descending
if ($grandes) {
  Write-Host "ACIMA DE 20 KB (dividir em arquivos menores):" -ForegroundColor Red
  $grandes | ForEach-Object { Write-Host ("  {0,8:N0} bytes  {1}" -f $_.Length, $_.FullName.Substring($Raiz.Length + 1)) }
  exit 1
}
Write-Host "OK: nenhum arquivo acima de 20 KB." -ForegroundColor Green
exit 0
