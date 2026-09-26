// Painel de controle do projeto anac-dados: http://localhost:3200
// Mostra o loop do Qwen (etapas, ações, commits) e o pipeline na Cloudflare (R2, D1, Vectorize, Worker).
// Só dados reais: o que não existe ainda aparece como "ainda não criado".
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const RAIZ = path.resolve(__dirname, '..');
const PORTA = 3200;
const LIB = 'C:/Projetos/Vortex/vortex-v2/tools';
const { api, conta } = require(path.join(LIB, 'lib', 'cf'));
const WORKER = 'https://anac-sync.rocha-eng.workers.dev';
const CHATS = path.join(os.homedir(), '.qwen', 'projects', RAIZ.toLowerCase().replace(/[:\\]/g, '-'), 'chats');
const CAPACIDADE_DIM = 10000000; // Vectorize incluído no Workers Paid
const ETAPAS = ['Base (plano, D1, Vectorize, Worker)', 'Índice dos 24 mil arquivos', 'Aeródromos e helipontos',
  'Operadores (empresas aéreas)', 'Aeronaves (RAB, Livro RAB, ADs)', 'Manutenção e segurança', 'Formação e pessoal',
  'Custos e mercado', 'Busca com rerank', 'Vigilância'];

const ler = (rel) => { try { return fs.readFileSync(path.join(RAIZ, rel), 'utf8'); } catch { return null; } };
const novoPrimeiro = (a, b) => (Date.parse(b.quando) || 0) - (Date.parse(a.quando) || 0);
const git = (args) => execFileSync('git', args, { cwd: RAIZ, encoding: 'utf8' });

// ---------- loop ----------
function progresso() {
  const t = ler('docs/PROGRESSO.md');
  if (t === null) return { existe: false, status: 'loop ainda não iniciado', etapas: {} };
  const etapas = {};
  for (const l of t.split('\n')) { const m = l.match(/^\s*-?\s*\[( |x|X|~)\]\s*(\d+)\b(.*)$/); if (m) etapas[m[2]] = { marca: m[1].toLowerCase(), texto: m[3].trim() }; }
  return { existe: true, status: (t.split('\n')[0] || '').replace(/^STATUS:\s*/, '').trim(), etapas };
}
function linhaDoTempo() {
  const ev = [];
  for (const [arq, tipo] of [['logs/loop_qwen/resumo.log', 'loop'], ['logs/andamento.log', 'passo']]) {
    const t = ler(arq); if (!t) continue;
    for (const l of t.trim().split('\n')) { const m = l.match(/^(\S+)\s+(.*)$/); if (m) ev.push({ quando: m[1], tipo, texto: m[2] }); }
  }
  try { for (const l of git(['log', '--date=iso-strict', '--pretty=format:%cd|%h %s', '-n', '100']).split('\n').filter(Boolean)) { const i = l.indexOf('|'); ev.push({ quando: l.slice(0, i), tipo: 'commit', texto: l.slice(i + 1) }); } }
  catch (e) { ev.push({ quando: new Date().toISOString(), tipo: 'erro', texto: `git log falhou: ${e.message}` }); }
  const VERBO = { read_file: 'leu', write_file: 'escreveu', edit: 'editou', replace: 'editou', run_shell_command: 'rodou', list_directory: 'listou', glob: 'procurou', grep_search: 'buscou' };
  let ultimaQwen = null;
  try {
    for (const f of fs.readdirSync(CHATS).filter((x) => x.endsWith('.jsonl'))) {
      const p = path.join(CHATS, f); const st = fs.statSync(p);
      if (st.mtimeMs < Date.now() - 12 * 3600e3) continue;
      if (!ultimaQwen || st.mtime > ultimaQwen) ultimaQwen = st.mtime;
      for (const l of fs.readFileSync(p, 'utf8').split('\n')) {
        if (!l.includes('qwen-code.tool_call')) continue;
        let o; try { o = JSON.parse(l); } catch { continue; }
        const e = o.systemPayload && o.systemPayload.uiEvent; if (!e) continue;
        const a = e.function_args || {};
        let alvo = String(a.file_path || a.path || a.command || a.pattern || '').replace(/^C:\\Projetos\\anac-dados\\/i, '').replace(/\s+/g, ' ');
        if (alvo.length > 110) alvo = alvo.slice(0, 107) + '…';
        ev.push({ quando: o.timestamp, tipo: 'qwen', texto: `${VERBO[e.function_name] || e.function_name} ${alvo}${e.success === false ? ' (falhou)' : ''}` });
      }
    }
  } catch { /* o Qwen ainda não rodou neste projeto */ }
  return { eventos: ev.sort(novoPrimeiro).slice(0, 200), ultimaQwen: ultimaQwen && ultimaQwen.toISOString() };
}
// Os dois loops (Vortex e anac-dados) usam o mesmo comando; por isso o estado vem do log deste projeto:
// última linha "rodada N iniciada" sem "loop encerrado" depois = rodando.
function loopRodando() {
  const t = ler('logs/loop_qwen/resumo.log');
  if (!t) return false;
  const linhas = t.trim().split('\n');
  const iUlt = (re) => { for (let i = linhas.length - 1; i >= 0; i--) if (re.test(linhas[i])) return i; return -1; };
  return iUlt(/rodada \d+ iniciada/) > iUlt(/loop encerrado/);
}

// ---------- Cloudflare ----------
async function tenta(fn) { try { return await fn(); } catch (e) { return { erro: e.message.slice(0, 220) }; } }
async function nuvem() {
  const c = conta();
  const plano = await tenta(async () => {
    const s = await api('GET', `/accounts/${c}/subscriptions`);
    const workers = s.find((x) => /workers/i.test(`${x.rate_plan && x.rate_plan.id} ${x.product && x.product.name}`));
    return { assinaturas: s.map((x) => `${x.rate_plan && x.rate_plan.id}`), workersPago: s.some((x) => /workers_paid|paid/i.test(x.rate_plan && x.rate_plan.id || '') && !/r2/i.test(x.rate_plan.id)), workers: workers ? workers.rate_plan.id : null };
  });
  const vector = await tenta(async () => {
    const info = await api('GET', `/accounts/${c}/vectorize/v2/indexes/anac-bge-m3/info`);
    const cfg = await api('GET', `/accounts/${c}/vectorize/v2/indexes/anac-bge-m3`);
    const dims = (cfg.config && cfg.config.dimensions) || 1024;
    return { vetores: info.vectorCount, dimensoes: dims, usoPct: Math.round((info.vectorCount * dims / CAPACIDADE_DIM) * 1000) / 10, ultimaMudanca: info.processedUpToDatetime };
  });
  const d1 = await tenta(async () => {
    const db = (await api('GET', `/accounts/${c}/d1/database?name=anac`)).find((x) => x.name === 'anac');
    if (!db) return { naoExiste: true };
    const q = async (sql) => (await api('POST', `/accounts/${c}/d1/database/${db.uuid}/query`, { sql }))[0].results;
    const tabelas = (await q("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite%' AND name NOT LIKE 'd1_%' AND name NOT LIKE '\\_%' ESCAPE '\\' ORDER BY name")).map((x) => x.name);
    const contagem = [];
    for (const t of tabelas.slice(0, 60)) { const r = await tenta(() => q(`SELECT COUNT(*) AS n FROM "${t.replace(/"/g, '')}"`)); contagem.push({ tabela: t, linhas: r.erro ? null : r[0].n }); }
    let cargas = [];
    if (tabelas.includes('anac_cargas')) cargas = await tenta(() => q('SELECT * FROM anac_cargas ORDER BY rowid DESC LIMIT 40'));
    return { tamanhoKB: Math.round((db.file_size || 0) / 1024), tabelas: contagem, cargas };
  });
  const r2 = await tenta(async () => {
    const { S3Client, ListObjectsV2Command } = require(path.join(LIB, '..', 'node_modules', '@aws-sdk', 'client-s3'));
    const s3 = new S3Client({ region: 'auto', endpoint: `https://${c}.r2.cloudflarestorage.com`, credentials: { accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID, secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY } });
    let token; let n = 0; let bytes = 0; let ultimo = null; const pastas = {};
    do {
      const r = await s3.send(new ListObjectsV2Command({ Bucket: process.env.CLOUDFLARE_R2_BUCKET || 'vortex', Prefix: 'anac/', ContinuationToken: token }));
      for (const o of r.Contents || []) { n++; bytes += o.Size; if (!ultimo || o.LastModified > ultimo) ultimo = o.LastModified; const p = o.Key.split('/')[1] || '?'; pastas[p] = (pastas[p] || 0) + 1; }
      token = r.IsTruncated ? r.NextContinuationToken : undefined;
    } while (token && n < 50000);
    return { arquivos: n, mb: Math.round(bytes / 1e5) / 10, ultimo: ultimo && ultimo.toISOString(), pastas };
  });
  const worker = await tenta(async () => {
    const r = await fetch(`${WORKER}/status`, { signal: AbortSignal.timeout(15000) });
    if (r.status === 404 || r.status === 530) return { naoExiste: true, http: r.status };
    const t = await r.text(); let j = null; try { j = JSON.parse(t); } catch { /* texto */ }
    return { http: r.status, dados: j, texto: j ? null : t.slice(0, 300) };
  });
  return { plano, vector, d1, r2, worker };
}

let cacheNuvem = null; let cacheHora = 0;
async function dados() {
  if (!cacheNuvem || Date.now() - cacheHora > 60000) { cacheNuvem = await nuvem(); cacheHora = Date.now(); } // a nuvem no máximo 1×/min
  const tl = linhaDoTempo();
  return { gerado: new Date().toISOString(), etapas: ETAPAS, progresso: progresso(), loop: loopRodando(), tempo: tl.eventos, qwenUltima: tl.ultimaQwen, nuvem: cacheNuvem, nuvemHora: new Date(cacheHora).toISOString(), worker: WORKER };
}

http.createServer(async (req, res) => {
  try {
    const u = new URL(req.url, 'http://localhost');
    if (u.pathname === '/dados.json') { res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }); return res.end(JSON.stringify(await dados())); }
    if (u.pathname === '/busca') { // repassa a busca de teste para o Worker
      const r = await fetch(`${WORKER}/busca?${u.searchParams}`, { signal: AbortSignal.timeout(30000) });
      res.writeHead(r.status, { 'content-type': r.headers.get('content-type') || 'application/json' }); return res.end(await r.text());
    }
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
    res.end(fs.readFileSync(path.join(__dirname, 'painel_anac.html')));
  } catch (e) {
    console.error(new Date().toISOString(), 'ERRO no painel:', e.message);
    res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' }); res.end('erro no painel: ' + e.message);
  }
}).listen(PORTA, '127.0.0.1', () => console.log(new Date().toISOString(), `painel ANAC em http://localhost:${PORTA}`))
  .on('error', (e) => { console.error('ERRO ao abrir a porta', PORTA, e.message); process.exit(1); });
