# Tenta mais endpoints de plano/subscription da Cloudflare.
# Uso: powershell -ExecutionPolicy Bypass -File ferramentas\check_plano2.ps1
$ErrorActionPreference = "Stop"

$tok = & npx --yes wrangler@4.133.0 auth token 2>&1 |
  Select-String -Pattern 'cfoat_' |
  ForEach-Object { $_.Line.Trim() }
if (-not $tok) { throw "token nao encontrado" }

$acc = "fe5ce1026f3713c2e492e134e20831d7"
$hdr = @{ Authorization = "Bearer $tok" }

$uris = @(
  "https://api.cloudflare.com/client/v4/accounts/$acc/subscriptions",
  "https://api.cloudflare.com/client/v4/accounts/$acc",
  "https://api.cloudflare.com/client/v4/user/tokens/verify"
)

foreach ($uri in $uris) {
  Write-Host "`nGET $uri" -ForegroundColor Cyan
  try {
    $resp = Invoke-RestMethod -Method Get -Uri $uri -Headers $hdr
    if ($resp.success) {
      Write-Host "success: TRUE" -ForegroundColor Green
      if ($uri -match 'tokens/verify' -and $resp.result) {
        $r = $resp.result
        $r.PSObject.Properties | ForEach-Object { Write-Host ("  {0}: {1}" -f $_.Name, $_.Value) }
      }
      if ($uri -match 'subscriptions' -and $resp.results) {
        foreach ($p in $resp.results) {
          Write-Host ("  plano: {0}  price_group: {1}  product: {2}  status: {3}" -f $p.plan.name, $p.plan.price_group, $p.plan.product.slug, $p.status)
        }
      }
    } else {
      Write-Host "success: FALSE" -ForegroundColor Red
      if ($resp.errors) { $resp.errors | ForEach-Object { Write-Host "  erro: $($_.message)" } }
    }
  } catch {
    Write-Host "EXCECAO: $($_.Exception.Message)" -ForegroundColor Red
  }
}
