# Verifica o plano da conta Cloudflare via API (etapa 1 do loop).
# Uso: powershell -ExecutionPolicy Bypass -File ferramentas\verifica_plano.ps1
$ErrorActionPreference = "Stop"
$cfg = "C:\Users\edils\AppData\Roaming\xdg.config\.wrangler\config\default.toml"
if (-not (Test-Path $cfg)) { throw "sem config wrangler em $cfg" }
$linhas = Get-Content $cfg
$tok = $linhas | Where-Object { $_ -match "auth_token" } | ForEach-Object { ($_ -split '=', 2)[1].Trim().Trim('"') }
Write-Host "token: $($tok.Substring(0,[Math]::Min(6,$tok.Length)))... (len=$($tok.Length))"
if (-not $tok) { throw "auth_token nao encontrado" }
$acc = "fe5ce1026f3713c2e492e134e20831d7"
$headers = @{ Authorization = "Bearer $tok" }
$r = Invoke-RestMethod -Method Get -Uri "https://api.cloudflare.com/client/v4/accounts/$acc/subscriptions" -Headers $headers
Write-Host "success: $($r.success)"
foreach ($p in $r.results) {
  Write-Host ("plano: {0}  price_group: {1}  product: {2}  status: {3}" -f $p.plan.name, $p.plan.price_group, $p.plan.product.slug, $p.status)
}
if ($r.errors) { $r.errors | ForEach-Object { Write-Host "erro: $($_.message)" } }
