# Checa info da conta Cloudflare (plano) via API.
# Uso: powershell -ExecutionPolicy Bypass -File ferramentas\check_cuenta.ps1
$ErrorActionPreference = "Stop"

$tok = & npx --yes wrangler@4.133.0 auth token 2>&1 |
  Select-String -Pattern 'cfoat_' |
  ForEach-Object { $_.Line.Trim() }
if (-not $tok) { throw "token nao encontrado" }
Write-Host "token: $($tok.Substring(0,8))... (len=$($tok.Length))" -ForegroundColor Yellow

$acc = "fe5ce1026f3713c2e492e134e20831d7"
foreach ($path in @("accounts/$acc", "accounts/$acc/subscriptions")) {
  $uri = "https://api.cloudflare.com/client/v4/$path"
  Write-Host "`nGET $uri" -ForegroundColor Cyan
  try {
    $resp = Invoke-RestMethod -Method Get -Uri $uri -Headers @{ Authorization = "Bearer $tok" }
    if ($resp.success) {
      Write-Host "success: TRUE" -ForegroundColor Green
      if ($resp.result) {
        $r = $resp.result
        $r.PSObject.Properties | ForEach-Object { Write-Host ("  {0}: {1}" -f $_.Name, $_.Value) }
      }
    } else {
      Write-Host "success: FALSE" -ForegroundColor Red
      if ($resp.errors) { $resp.errors | ForEach-Object { Write-Host "  erro: $($_.message)" } }
    }
  } catch {
    Write-Host "EXCECAO: $($_.Exception.Message)" -ForegroundColor Red
  }
}
