# Loop do Qwen Code (um script para os dois projetos: Vortex e anac-dados).
# Roda o prompt do projeto varias vezes, uma etapa (ou parte) por rodada, cada rodada com um
# Qwen novo. Entre as rodadas a memoria do modelo e zerada; o que sobrevive e o que o loop
# escreve em docs/.../ULTIMA_RODADA.md (o que a rodada fez, se commitou, se estourou o limite de
# acoes, o resultado da checagem de tipos/build) - e o Qwen le esse arquivo no inicio da proxima.
#
# Para sozinho quando: PROGRESSO.md comecar com "STATUS: CONCLUIDO" ou "STATUS: PARADO";
# N rodadas seguidas sem commit "etapa" (-MaxSemCommit); repetir o mesmo estado de arquivos
# sem commit (-MaxRepeticoes); atingir -MaxRodadas; ou Ctrl+C.
#
# Reescrito em 26/09/2026 (Heringer45, pedido do Rogerio) a partir da versao de 25/09. Correcoes:
#   - "loop ABORTADO ... usage: git diff": `git diff --stat $antes..$depois` sem aspas fazia o
#     PowerShell quebrar o intervalo; com $ErrorActionPreference=Stop, qualquer stderr do git
#     virava excecao. Agora todo git passa por Git() (stderr capturado, codigo de saida checado).
#   - arquivos "$null" no projeto: o Qwen escrevia `2>$null` (PowerShell) num shell que e o
#     cmd.exe; o loop apaga esses arquivos ao fim da rodada e avisa (o prompt tambem proibe).
#   - rodada sem memoria: ULTIMA_RODADA.md + checagem do projeto (tsc / wrangler dry-run) com os
#     erros reais, para a proxima rodada corrigir em vez de recomecar do zero.
#   - assinatura de repeticao passa a ser o estado real dos arquivos (git status + diff),
#     nao o texto do PROGRESSO.md (que o Qwen reescreve toda rodada e nunca repetia).
#   - (26/09 16:40) AUTO-COMMIT: medido nas rodadas 2-4, o Qwen ESCREVE codigo (modulo inteiro em
#     services/cavok-import, migracao 0002, worker/src/index.js) mas nao commita nunca - o loop
#     via "rodada sem commit", ia parar por MaxSemCommit e o trabalho ficava solto. Agora, no fim
#     de cada rodada (e uma vez no inicio do loop, para o que sobrou de rodadas anteriores), se a
#     checagem do projeto passa e ha mudanca real, o proprio loop commita ("etapa (auto, rodada N)").
#     Lixo fica de fora ($null*, tmp_*, *.tsbuildinfo, logs/, *.log) e arquivo NOVO vazio e apagado.
# Uso: powershell -ExecutionPolicy Bypass -File ferramentas\loop_qwen.ps1 [-MaxRodadas 30] [-TimeoutMin 90] [-MaxRepeticoes 3] [-MaxSemCommit 4]
param([int]$MaxRodadas = 30, [int]$TimeoutMin = 90, [int]$MaxRepeticoes = 3, [int]$MaxSemCommit = 4)
$ErrorActionPreference = "Stop"
try {
  Add-Type -Namespace Vx -Name Console -MemberDefinition '[DllImport("kernel32.dll")] public static extern IntPtr GetStdHandle(int h); [DllImport("kernel32.dll")] public static extern bool GetConsoleMode(IntPtr h, out uint m); [DllImport("kernel32.dll")] public static extern bool SetConsoleMode(IntPtr h, uint m);'
  $h = [Vx.Console]::GetStdHandle(-10); $m = 0
  if ([Vx.Console]::GetConsoleMode($h, [ref]$m)) { [void][Vx.Console]::SetConsoleMode($h, ($m -band (-bnot 0x40)) -bor 0x80) }
} catch { Write-Host "aviso: nao consegui desligar o modo de edicao rapida: $($_.Exception.Message)" }

$raiz = Split-Path $PSScriptRoot -Parent; Set-Location $raiz
$env:Path = "C:\Program Files\nodejs;C:\Program Files\Git\cmd;$env:APPDATA\npm;" + $env:Path
$env:QWEN_CODE_SUPPRESS_YOLO_WARNING = "1"
$utf8 = New-Object Text.UTF8Encoding($false)

# ── configuracao por projeto (detectada pela pasta) ────────────────────────────────────────
$nomeProj = (Split-Path $raiz -Leaf).ToLower()
switch ($nomeProj) {
  "vortex" {
    $docs = Join-Path $raiz "docs\cavok"; $promptRel = "docs/cavok/PROMPT_LOOP_QWEN.md"
    $painel = "http://localhost:3100/"
    $checagemNome = "tsc (functions)"; $checagemCmd = 'npx --yes -p typescript@5.6.3 tsc -p functions\tsconfig.json'
  }
  "anac-dados" {
    $docs = Join-Path $raiz "docs"; $promptRel = "docs/PROMPT_LOOP.md"
    $painel = $null
    $checagemNome = "wrangler deploy --dry-run"; $checagemCmd = 'cd /d worker && npx --yes wrangler@4.133.0 deploy --dry-run'
  }
  default { throw "projeto desconhecido: $nomeProj (esperado Vortex ou anac-dados)" }
}
$progresso = Join-Path $docs "PROGRESSO.md"
$ultima = Join-Path $docs "ULTIMA_RODADA.md"
$ultimaRel = ($ultima.Substring($raiz.Length + 1) -replace '\\', '/')
$pedido = "Leia o arquivo $promptRel e siga as instrucoes dele a risca nesta rodada. Antes de qualquer coisa, leia $ultimaRel (resumo da rodada anterior, escrito pelo loop)."
$logs = Join-Path $raiz "logs\loop_qwen"; New-Item -ItemType Directory -Force $logs | Out-Null
$resumo = Join-Path $logs "resumo.log"
$chats = Join-Path $env:USERPROFILE (".qwen\projects\" + ($raiz.ToLower() -replace "[:\\]", "-") + "\chats")

function Anota($m) { $l = "$(Get-Date -Format s) $m"; Add-Content -Path $resumo -Value $l -Encoding UTF8; Write-Host $l }

# git sem excecao por stderr: devolve as linhas (stdout+stderr) e guarda o codigo em $script:gitRc.
function Git {
  $prev = $ErrorActionPreference; $ErrorActionPreference = "Continue"
  try {
    $saida = @(& git.exe @args 2>&1 | ForEach-Object { if ($_ -is [Management.Automation.ErrorRecord]) { $_.Exception.Message } else { [string]$_ } })
    $script:gitRc = $LASTEXITCODE
  } finally { $ErrorActionPreference = $prev }
  # ",": devolve SEMPRE array. Sem isso, saida de 1 linha virava string e $c[0] era o 1o CARACTERE
  # do hash ("git log c..7 falhou (codigo 128)" no resumo.log de 26/09 16:41) - commit do Qwen nunca contava.
  return ,$saida
}
function Cabeca { if (Test-Path "$raiz\.git") { $c = @(Git rev-parse HEAD); if ($script:gitRc -eq 0 -and $c.Count -and "$($c[0])" -match '^[0-9a-f]{40}$') { return [string]$c[0] } }; return "" }
function EstadoArquivos {
  # assinatura do estado real do projeto: arquivos modificados/novos + tamanho da diferenca
  if (-not (Test-Path "$raiz\.git")) { return "" }
  # ignora o que o proprio loop reescreve toda rodada (logs e ULTIMA_RODADA.md), senao nunca repete
  $exc = @(":(exclude)logs/**", ":(exclude)**/ULTIMA_RODADA.md", ":(exclude)ULTIMA_RODADA.md")
  $st = (Git status --porcelain --untracked-files=all -- . @exc) -join ";"
  $df = (Git diff --shortstat -- . @exc) -join ";"
  return ("ST:{0}|DF:{1}" -f ($st -replace '\s+', ' '), ($df -replace '\s+', ' '))
}
function Feitas { if (Test-Path $progresso) { @(Select-String -Path $progresso -Pattern '^\s*-\s*\[x\]' -Encoding UTF8 | ForEach-Object { $_.Line.Trim() }) } else { @() } }

$verbo = @{ read_file = "leu"; read_many_files = "leu varios"; write_file = "escreveu"; edit = "editou"; replace = "editou";
  run_shell_command = "rodou"; list_directory = "listou"; glob = "procurou"; grep_search = "buscou"; search_file_content = "buscou" }
$prefixoRaiz = '^' + [regex]::Escape($raiz + '\')

# Le as acoes (tool calls) da conversa do Qwen desta rodada. Devolve objetos {verbo, alvo, ok}.
function AcoesDaRodada([datetime]$desde) {
  $chat = Get-ChildItem $chats -Filter *.jsonl -ErrorAction SilentlyContinue | Where-Object { $_.CreationTime -ge $desde } |
    Sort-Object CreationTime | Select-Object -First 1
  if (-not $chat) { return @() }
  $acoes = @()
  foreach ($linha in @(Get-Content $chat.FullName -Encoding UTF8 -ErrorAction SilentlyContinue)) {
    if ($linha -notmatch 'qwen-code\.tool_call') { continue }
    try { $ev = ($linha | ConvertFrom-Json).systemPayload.uiEvent } catch { continue }
    if (-not $ev) { continue }
    $a = $ev.function_args
    $alvo = "$($a.file_path)$($a.path)$($a.absolute_path)$($a.command)$($a.pattern)" -replace $prefixoRaiz, '' -replace '\s+', ' '
    if ($alvo.Length -gt 110) { $alvo = $alvo.Substring(0, 107) + "..." }
    $v = if ($verbo.ContainsKey([string]$ev.function_name)) { $verbo[[string]$ev.function_name] } else { [string]$ev.function_name }
    $acoes += [pscustomobject]@{ verbo = $v; alvo = $alvo; ok = ($ev.success -ne $false) }
  }
  return $acoes
}
function MostraAcoes([datetime]$desde, [ref]$vistas) {
  $acoes = @(AcoesDaRodada $desde)
  for ($i = $vistas.Value; $i -lt $acoes.Count; $i++) {
    $x = $acoes[$i]; $falha = if ($x.ok) { "" } else { "  (falhou)" }
    Write-Host ("   {0}  {1} {2}{3}" -f (Get-Date -Format HH:mm:ss), $x.verbo, $x.alvo, $falha) -ForegroundColor DarkCyan
  }
  $vistas.Value = $acoes.Count
}
# Roda a checagem do projeto (tipos/build) e devolve rc + primeiras linhas.
function Checagem {
  $prev = $ErrorActionPreference; $ErrorActionPreference = "Continue"
  try { $out = @(cmd /c "$checagemCmd 2>&1"); $rc = $LASTEXITCODE } finally { $ErrorActionPreference = $prev }
  return [pscustomobject]@{ rc = $rc; linhas = @($out | ForEach-Object { [string]$_ } | Where-Object { $_ -match '\S' } | Select-Object -First 15) }
}
# Arquivos chamados "$null" (Qwen usando sintaxe PowerShell no cmd.exe): apaga e avisa.
function LimpaNull {
  $lixo = @(Get-ChildItem $raiz -Recurse -Force -File -ErrorAction SilentlyContinue | Where-Object { $_.Name -like '$null*' -and $_.FullName -notmatch '\\node_modules\\|\\\.git\\' })
  foreach ($f in $lixo) { Remove-Item -LiteralPath $f.FullName -Force -ErrorAction SilentlyContinue }
  return $lixo.Count
}
# Mata o que sobrou da rodada: descendentes do conhost da rodada e qwen/node criados depois do inicio dela.
function MataSobras([int]$pidRaiz, [datetime]$desde) {
  $todos = @(Get-CimInstance Win32_Process -ErrorAction SilentlyContinue)
  $filhos = @{}; foreach ($x in $todos) { if (-not $filhos.ContainsKey([int]$x.ParentProcessId)) { $filhos[[int]$x.ParentProcessId] = @() }; $filhos[[int]$x.ParentProcessId] += [int]$x.ProcessId }
  $alvos = @{}; $fila = @($pidRaiz)
  while ($fila.Count) { $c = $fila[0]; $fila = @($fila | Select-Object -Skip 1); if ($filhos.ContainsKey($c)) { foreach ($f in $filhos[$c]) { if (-not $alvos.ContainsKey($f)) { $alvos[$f] = 1; $fila += $f } } } }
  foreach ($x in $todos) {
    if ($x.ProcessId -eq $PID) { continue }
    $ehQwen = ($x.CommandLine -match 'qwen-code|cli-entry\.js')
    $novo = $false; try { $novo = ($x.CreationDate -ge $desde) } catch { }
    if ($alvos.ContainsKey([int]$x.ProcessId) -or ($ehQwen -and $novo)) { Stop-Process -Id $x.ProcessId -Force -ErrorAction SilentlyContinue; $alvos[[int]$x.ProcessId] = 1 }
  }
  return $alvos.Count
}
# Auto-commit do trabalho que passou na checagem (ver cabecalho). Devolve as mensagens commitadas.
# Nao mexe em nada quando a checagem falhou: codigo que nao compila nao vira commit, e a rodada
# seguinte recebe os erros pelo ULTIMA_RODADA.md.
function AutoCommit([int]$n, $chk, [string]$rotulo, [datetime]$desde) {
  if (-not (Test-Path "$raiz\.git")) { return @() }
  if ($chk.rc -ne 0) { Anota "  auto-commit: pulado, a checagem ($checagemNome) falhou"; return @() }
  $exc = @(":(exclude)logs/**", ":(exclude)**/ULTIMA_RODADA.md", ":(exclude)ULTIMA_RODADA.md")
  # core.quotepath=false: nome com acento sairia entre aspas com escapes octais e o add falharia
  $linhas = @(Git -c core.quotepath=false status --porcelain --untracked-files=all -- . @exc)
  if ($script:gitRc -ne 0) { Anota "  auto-commit: git status falhou (codigo $($script:gitRc)): $($linhas -join ' ')"; return @() }
  $inclui = @(); $lixo = @(); $vazios = @(); $foraJanela = @(); $esvaziados = @()
  foreach ($ln in $linhas) {
    if ($ln.Length -lt 4) { continue }
    $arq = $ln.Substring(3).Trim().Trim('"')
    $arqAntigo = $null
    if ($ln -match '^R') { $partes = $arq -split ' -> '; $arqAntigo = $partes[0].Trim('"'); $arq = $partes[-1].Trim('"') }
    $nome = Split-Path $arq -Leaf
    # lixo em qualquer nivel (node_modules/dist de um modulo novo que o Qwen criou tambem conta)
    $ehLixo = ($nome -like '$null*' -or $nome -like 'tmp_*' -or $nome -like '*.tsbuildinfo' -or $nome -like 'plano_out*' -or
               $nome -like '*.log' -or $nome -like '*.bak_*' -or $arq -match '(^|/)(logs|\.wrangler|node_modules|dist)/')
    if ($ehLixo) { $lixo += $arq; continue }
    $full = Join-Path $raiz ($arq -replace '/', '\')
    $existe = Test-Path -LiteralPath $full
    # so o que foi tocado nesta janela (rodada, ou 24h no inicio): edicao manual de outra pessoa nao entra
    if ($existe -and (Get-Item -LiteralPath $full).LastWriteTime -lt $desde) { $foraJanela += $arq; continue }
    if ($existe -and (Get-Item -LiteralPath $full).Length -eq 0) {
      if ($ln -match '^\?\?') { Remove-Item -LiteralPath $full -Force -ErrorAction SilentlyContinue; $vazios += $arq; continue }
      # arquivo rastreado ESVAZIADO: quase sempre write_file errado do Qwen - nao commitar a perda
      $esvaziados += $arq; continue
    }
    if ($arqAntigo) { $inclui += $arqAntigo }   # renome: o caminho antigo entra para o git registrar a remocao
    $inclui += $arq
  }
  if ($vazios.Count) { Anota "  auto-commit: apagado(s) $($vazios.Count) arquivo(s) novo(s) VAZIO(s) que o Qwen deixou: $($vazios -join ', ')" }
  if ($esvaziados.Count) { Anota "  auto-commit: ATENCAO - arquivo(s) rastreado(s) ficaram VAZIOS e ficaram FORA do commit (provavel write_file errado): $($esvaziados -join ', ') - confira com git diff" }
  if ($lixo.Count) { Anota "  auto-commit: fora do commit (lixo/temporario): $($lixo -join ', ')" }
  if ($foraJanela.Count) { Anota "  auto-commit: fora do commit por nao terem sido tocados nesta janela (edicao de fora do loop?): $($foraJanela -join ', ')" }
  if (-not $inclui.Count) { return @() }
  if ($inclui.Count -gt 40) { Anota "  auto-commit: ABORTADO - $($inclui.Count) arquivos de uma vez e anormal (dependencias? saida de build?); confira o git status a mao"; return @() }
  # ":(literal)" - nomes como functions/api/base/[id].ts seriam lidos pelo git como glob
  $spec = @($inclui | ForEach-Object { ":(literal)" + $_ })
  $saida = Git add -- @spec
  if ($script:gitRc -ne 0) { Anota "  auto-commit: git add falhou (codigo $($script:gitRc)): $($saida -join ' ')"; return @() }
  $msg = "etapa (auto, rodada ${n}): $rotulo - " + (($inclui | Select-Object -First 6) -join ', ') + $(if ($inclui.Count -gt 6) { " (+$($inclui.Count - 6))" } else { "" })
  $saida = Git commit -q -m $msg
  if ($script:gitRc -ne 0) { Anota "  auto-commit: git commit falhou (codigo $($script:gitRc)): $($saida -join ' ')"; return @() }
  Anota "  auto-commit: $msg"
  return @($msg)
}
function EscreveUltima($n, $inicio, $fim, $codigo, $estourou, $commits, $acoes, $chk, $nulls, $textoQwen, $obs) {
  $dur = [int]($fim - $inicio).TotalMinutes
  $porVerbo = @($acoes | Group-Object verbo | Sort-Object Count -Descending | ForEach-Object { "$($_.Count)x $($_.Name)" }) -join ", "
  $arquivos = @($acoes | Where-Object { $_.verbo -in @("escreveu", "editou") } | ForEach-Object { $_.alvo } | Select-Object -Unique)
  $falhas = @($acoes | Where-Object { -not $_.ok } | ForEach-Object { "$($_.verbo) $($_.alvo)" } | Select-Object -Unique | Select-Object -First 8)
  $l = @()
  $l += "# Ultima rodada do loop (escrito automaticamente por ferramentas/loop_qwen.ps1 - nao edite)"
  $l += ""
  $l += "- Rodada $n de $(Get-Date $inicio -Format 'dd/MM HH:mm') a $(Get-Date $fim -Format 'HH:mm') ($dur min), qwen saiu com codigo $codigo."
  if ($estourou) { $l += "- ATENCAO: a rodada terminou pelo LIMITE DE ACOES do Qwen (loop de chamadas). Nesta rodada faca uma parte MENOR e feche com commit." }
  if (@($commits | Where-Object { $_ -match '^etapa \(auto' }).Count) { $l += "- O LOOP commitou por voce o que passou na checagem (auto-commit). NAO refaca esse trabalho: siga para o proximo item do PROGRESSO.md e commite voce mesmo ao terminar." }
  if ($commits.Count) { $l += "- Commits feitos: " + ($commits -join " | ") } else { $l += "- NENHUM commit 'etapa' foi feito. O que ficou pronto e testado deve ser commitado nesta rodada (commit parcial vale)." }
  $l += "- Acoes: $($acoes.Count) ($porVerbo)."
  if ($arquivos.Count) { $l += "- Arquivos escritos/editados: " + (($arquivos | Select-Object -First 15) -join ", ") + $(if ($arquivos.Count -gt 15) { " (+$($arquivos.Count - 15))" } else { "" }) }
  if ($falhas.Count) { $l += "- Acoes que FALHARAM: " + ($falhas -join " | ") }
  if ($nulls) { $l += "- O loop apagou $nulls arquivo(s) chamados `$null: o shell e o cmd.exe, use >nul e 2>nul, nunca `$null." }
  $l += "- Checagem do projeto ($checagemNome) ao fim da rodada: " + $(if ($chk.rc -eq 0) { "OK" } else { "FALHOU (codigo $($chk.rc)) - corrija isto primeiro:" })
  if ($chk.rc -ne 0) { foreach ($x in $chk.linhas) { $l += "    " + $x } }
  if ($obs) { $l += "- Loop: $obs" }
  if ($textoQwen) { $l += ""; $l += "## Ultima resposta do Qwen (resumo)"; $l += ($textoQwen -split "`n" | Select-Object -Last 12) }
  [IO.File]::WriteAllText($ultima, (($l -join "`n") + "`n"), $utf8)
}

if (-not (Get-Command qwen -ErrorAction SilentlyContinue)) { throw "qwen nao encontrado no PATH" }
if (-not (Test-Path (Join-Path $raiz ($promptRel -replace '/', '\')))) { throw "falta $promptRel" }
if (-not (Test-Path $ultima)) { [IO.File]::WriteAllText($ultima, "# Ultima rodada do loop`n`n- Primeira rodada: nao ha rodada anterior.`n", $utf8) }

$assinaturas = @(); $repeticoes = 0; $semCommit = 0; $p = $null
if ($painel) { try { Start-Process $painel } catch { Write-Host "aviso: nao abri o painel: $($_.Exception.Message)" } }
Anota "loop iniciado ($nomeProj): MaxRodadas=$MaxRodadas TimeoutMin=$TimeoutMin MaxRepeticoes=$MaxRepeticoes MaxSemCommit=$MaxSemCommit"
try {
# trabalho solto de rodadas anteriores (loop interrompido no meio): commita se a checagem passar
$chk0 = Checagem
$pendentes = @(AutoCommit 0 $chk0 "trabalho pendente de rodadas anteriores" (Get-Date).AddHours(-24))
if ($pendentes.Count) { Anota "trabalho pendente commitado antes da rodada 1: $($pendentes -join ' | ')" }
elseif ($chk0.rc -ne 0) { Anota "aviso: a checagem ($checagemNome) ja FALHA antes da rodada 1 - o Qwen vai receber os erros pelo ULTIMA_RODADA.md na proxima escrita" }
for ($n = 1; $n -le $MaxRodadas; $n++) {
  if (Test-Path $progresso) {
    $status = (Get-Content $progresso -TotalCount 1 -Encoding UTF8)
    if ($status -match '^STATUS:\s*(CONCLUIDO|PARADO)') { Anota "fim: $status"; break }
  }
  $antes = Cabeca; $feitasAntes = Feitas
  $log = Join-Path $logs ("rodada_{0}_{1:D2}.log" -f (Get-Date -Format "yyyyMMdd_HHmm"), $n)
  Anota "rodada $n iniciada (log: $log)"
  $inicioRodada = Get-Date
  # conhost --headless: o Qwen roda sem janela e nao vira aba do Windows Terminal
  $p = Start-Process conhost.exe -ArgumentList "--headless cmd.exe /c qwen -y -p `"$pedido`" > `"$log`" 2>&1" -PassThru -WindowStyle Hidden
  $desde = $inicioRodada.AddSeconds(-5); $vistas = 0
  Write-Host "   (acoes do Qwen ao vivo$(if ($painel) { ' - painel em ' + $painel } else { '' }))" -ForegroundColor DarkGray
  while (-not $p.HasExited -and ((Get-Date) - $inicioRodada).TotalMinutes -lt $TimeoutMin) {
    Start-Sleep 8
    try { MostraAcoes $desde ([ref]$vistas) } catch { Write-Host "   (nao consegui ler as acoes do Qwen: $($_.Exception.Message))" -ForegroundColor DarkYellow }
  }
  try { MostraAcoes $desde ([ref]$vistas) } catch { }
  $obs = ""
  if (-not $p.WaitForExit(1000)) {
    & taskkill /PID $p.Id /T /F 2>&1 | Out-Null
    $codigo = "encerrado por tempo"; $obs = "rodada passou de $TimeoutMin min e foi encerrada pelo loop"
    Anota "rodada $n passou de $TimeoutMin min e foi encerrada"
    Start-Sleep 3
    $sobras = MataSobras $p.Id $inicioRodada
    if ($sobras) { Anota "  encerrados $sobras processo(s) da rodada que sobraram" }
  } else {
    $p.WaitForExit(); $codigo = $p.ExitCode
    Anota "rodada ${n}: qwen saiu com codigo $codigo"
    if ($codigo -ne 0) { Anota "  ATENCAO: codigo diferente de 0 costuma ser erro do qwen/modelo (veja $log)" }
  }
  $fimRodada = Get-Date
  $textoLog = if (Test-Path $log) { (Get-Content $log -Encoding UTF8 -ErrorAction SilentlyContinue) -join "`n" } else { "" }
  $estourou = ($textoLog -match 'Loop detection halted|turn_tool_call_cap|maxToolCallsPerTurn')
  if ($estourou) { Anota "  rodada $n terminou pelo limite de acoes do Qwen (andou em circulo dentro da rodada)" }
  $textoQwen = ($textoLog -split "`n" | Where-Object { $_ -notmatch '^Warning: running headless|^Loop detection halted' }) -join "`n"
  $acoes = @(); try { $acoes = @(AcoesDaRodada $desde) } catch { Anota "  aviso: nao li as acoes da conversa ($($_.Exception.Message))" }
  $nulls = LimpaNull; if ($nulls) { Anota "  apagados $nulls arquivo(s) '`$null' criados pelo Qwen (sintaxe PowerShell no cmd.exe)" }

  $depois = Cabeca
  $novos = @()
  if ($antes -and $depois -and $depois -ne $antes) {
    $novos = @(Git log --format=%s "$antes..$depois" | Where-Object { $_ -match '^etapa' })
    if ($script:gitRc -ne 0) { Anota "  aviso: git log $antes..$depois falhou (codigo $($script:gitRc)); commits desta rodada nao contados" }
  }
  $chk = Checagem
  Anota ("  checagem ${checagemNome}: " + $(if ($chk.rc -eq 0) { "OK" } else { "FALHOU (codigo $($chk.rc))" }))
  $auto = @(AutoCommit $n $chk "trabalho da rodada que passou na checagem" $inicioRodada)
  if ($auto.Count) { $novos = @($novos) + $auto; $obs = ($obs + " o loop commitou o trabalho da rodada (auto-commit)").Trim() }
  # trava: etapa marcada [x] sem NENHUM commit (nem do Qwen, nem auto) = conclusao falsa -> desfaz a marca.
  # Fica DEPOIS do auto-commit de proposito: se o trabalho passou na checagem e foi commitado, a marca vale.
  $feitasDepois = Feitas
  $novasMarcas = @($feitasDepois | Where-Object { $feitasAntes -notcontains $_ })
  if ($novasMarcas.Count -gt 0 -and $novos.Count -eq 0) {
    $txt = [IO.File]::ReadAllText($progresso, [Text.Encoding]::UTF8)
    $linhas = $txt -split "`n"; $marcadas = 0
    for ($k = 0; $k -lt $linhas.Count; $k++) {
      if ($novasMarcas -contains $linhas[$k].Trim()) { $linhas[$k] = $linhas[$k] -replace '\[x\]', '[ ]'; $linhas[$k] += ' (desmarcada pelo loop: marcada como feita sem commit "etapa")'; $marcadas++ }
    }
    [IO.File]::WriteAllText($progresso, ($linhas -join "`n"), $utf8)
    Anota "  ATENCAO: o Qwen marcou $marcadas etapa(s) como feita(s) sem commit; marca desfeita no PROGRESSO.md"
    $obs = ($obs + " marcou etapa como feita sem commit; a marca foi desfeita").Trim()
  }

  if ($novos.Count -gt 0) {
    $repeticoes = 0; $semCommit = 0; $assinaturas = @()
    Anota ("rodada {0} terminou com {1} commit(s) (Qwen ou auto-commit do loop): {2}" -f $n, $novos.Count, ($novos -join ' | '))
  } else {
    $semCommit++
    $assinatura = EstadoArquivos
    if ($assinaturas -contains $assinatura) {
      $repeticoes++
      Anota "rodada $n sem commit e sem mudar nada nos arquivos em relacao a uma rodada anterior (repeticao $repeticoes)"
    } else {
      $repeticoes = 0
      Anota "rodada $n terminou SEM commit novo ($semCommit seguida(s)); arquivos mudaram, o Qwen esta tentando"
    }
    $assinaturas += $assinatura
    if ($assinaturas.Count -gt 10) { $assinaturas = $assinaturas[1..($assinaturas.Count - 1)] }
  }
  EscreveUltima $n $inicioRodada $fimRodada $codigo $estourou $novos $acoes $chk $nulls $textoQwen $obs
  if ($repeticoes -ge $MaxRepeticoes) {
    Anota "parado: $repeticoes rodadas seguidas sem commit e sem mudar arquivo nenhum (loop sem avanco). Confira $log e o PROGRESSO.md."; break
  }
  if ($semCommit -ge $MaxSemCommit) {
    Anota "parado: $semCommit rodadas seguidas sem commit 'etapa'. O Qwen nao esta conseguindo fechar a etapa; veja ULTIMA_RODADA.md (erros da checagem) e ajuste o prompt ou a etapa."; break
  }
  Start-Sleep 10
}
} catch {
  Anota "loop ABORTADO por erro inesperado: $($_.Exception.Message) (linha $($_.InvocationInfo.ScriptLineNumber))"
  throw
} finally {
  if ($p -and -not $p.HasExited) {
    & taskkill /PID $p.Id /T /F 2>&1 | Out-Null
    Start-Sleep 2
    $sobras = 0; try { $sobras = MataSobras $p.Id $inicioRodada } catch { }
    Anota "Qwen da rodada em andamento encerrado junto com o loop ($sobras processo(s))"
  }
  Anota "loop encerrado. Situacao: $(if (Test-Path $progresso) { Get-Content $progresso -TotalCount 1 -Encoding UTF8 } else { 'sem PROGRESSO.md' })"
}
