# Mantém no ar o painel de controle dos dados da ANAC (http://localhost:3200). Reinicia em 10 s se cair.
# Roda pela tarefa agendada via "conhost.exe --headless" (sem janela e sem virar aba do Windows Terminal).
$raiz = Split-Path $PSScriptRoot -Parent
$env:Path = "C:\Program Files\nodejs;C:\Program Files\Git\cmd;" + $env:Path
$log = Join-Path $raiz "logs\painel_anac.log"
New-Item -ItemType Directory -Force (Split-Path $log) | Out-Null
while ($true) {
  & "C:\Program Files\nodejs\node.exe" (Join-Path $PSScriptRoot "painel_anac.js") *>> $log
  Add-Content $log "$(Get-Date -Format s) painel_anac.js saiu com código $LASTEXITCODE; reinicia em 10 s"
  Start-Sleep 10
}
