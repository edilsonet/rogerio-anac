# Checa o plano da conta Cloudflare via API de subscriptions.
# Uso: powershell -ExecutionPolicy Bypass -File ferramentas\check_plano.ps1
$ErrorActionPreference = "Stop"

# Puxa o token OAuth do wrangler
$tok = & npx --yes wrangler@4.133.0 auth token 2>&1 |
  Select-String -Pattern 'cfoat_' |
  ForEach-Object { $_.Line.Trim() }
if (-not $tok) { throw "token nao encontrado" }
Write-Host "token: $($tok.Substring(0,8))... (len=$($tok.Length))" -ForegroundColor Yellow

$acc = "fe5ce1026f3713c2e492e134e20831d7"
$uri = "https://api.cloudflare.com/client/v4/accounts/$acc/subscriptions"
$resp = Invoke-RestMethod -Method Get -Uri $uri -Headers @{ Authorization = "Bearer $tok" }

if ($resp.success) {
  Write-Host "success: TRUE" -ForegroundColor Green
  foreach ($p in $resp.results) {
    Write-Host ("  plano: {0}  price_group: {1}  product: {2}  status: {3}" -f $p.plan.name, $p.plan.price_group, $p.plan.product.slug, $p.status)
  }
} else {
  Write-Host "success: FALSE" -ForegroundColor Red
  if ($resp.errors) { $resp.errors | ForEach-Object { Write-Host "  erro: $($_.message)" } }
}
