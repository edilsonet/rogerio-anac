//crawler do índice da ANAC — percorre todas as pastas de
// https://sistemas.anac.gov.br/dadosabertos/ e grava em anac_indice.
// Máximo 4 conexões em paralelo, com repetição.

const MAX_PARALELO = 4;
const MAX_TENTATIVAS = 3;
const AGENTE = 'anac-sync/1.0 (https://anac-sync.rocha-eng.workers.dev)';

// Extrai links de um HTML de listagem de pastas da ANAC.
// Cada entrada vira { link, nome, pasta, isPasta } para visitar ou gravar.
function extrairLinks(html) {
  const resultados = [];
  const regex = /href="([^"]+)"[^>]*>\s*([^<]+?)\s*<\/a>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const href = match[1];
    const nome = match[2].trim();
    if (!href || href.startsWith('#')) continue;
    const ePasta = href.endsWith('/');
    const nomeArquivo = ePasta ? '/' : href.split('/').pop();
    const pasta = ePasta ? href : href.substring(0, href.lastIndexOf('/') + 1);
    resultados.push({ link: href, nome: nomeArquivo, pasta, isPasta: ePasta });
  }
  return resultados;
}

// Baixa uma URL com repetição; retorna { html, status } ou lança erro.
async function baixarComTentativa(url) {
  let ultimaErro;
  for (let tentativa = 1; tentativa <= MAX_TENTATIVAS; tentativa++) {
    try {
      const resp = await fetch(url, { headers: { 'user-agent': AGENTE } });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const html = await resp.text();
      return { html, status: resp.status };
    } catch (err) {
      ultimaErro = err;
      await new Promise((resolve) => setTimeout(resolve, 1000 * tentativa));
    }
  }
  throw new Error(`Falha ao baixar ${url}: ${ultimaErro.message}`);
}

// Visita um link: se é pasta, explora; se é arquivo, grava no índice.
async function visitar(link, db, visitados, fila) {
  if (visitados.has(link)) return;
  visitados.add(link);

  const { html } = await baixarComTentativa(link);
  const entradas = extrairLinks(html);

  for (const entrada of entradas) {
    if (entrada.isPasta) {
      const subLink = link.replace(/\/$/, '') + '/' + entrada.href;
      if (!visitados.has(subLink)) {
        fila.push(subLink);
      }
    } else {
      const linkCompleto = link.replace(/\/$/, '') + '/' + entrada.href;
      await gravarIndice(db, {
        link: linkCompleto,
        nome: entrada.nome,
        pasta: link.replace(/\/$/, '') + '/',
      });
      total.arquivos++;
    }
  }
}

// Grava um arquivo no índice, com repetição.
async function gravarIndice(db, registro) {
  let ultimaErro;
  for (let tentativa = 1; tentativa <= MAX_TENTATIVAS; tentativa++) {
    try {
      await upsertIndice(db, registro);
      return;
    } catch (err) {
      ultimaErro = err;
      await new Promise((resolve) => setTimeout(resolve, 500 * tentativa));
    }
  }
  throw new Error(`Falha ao gravar índice ${registro.link}: ${ultimaErro.message}`);
}

// Executa o crawler: percorre a raiz e todas as pastas.
export async function percorrerIndice(env) {
  const raiz = env.ANAC_BASE.replace(/\/$/, '');
  const visitados = new Set();
  const fila = [raiz];
  const total = { pastas: 0, arquivos: 0 };

  while (fila.length > 0) {
    const link = fila.shift();
    total.pastas++;

    // Limita o número de conexões simultâneas.
    const lotes = [];
    for (let i = 0; i < MAX_PARALELO && fila.length > 0; i++) {
      const proximo = fila.shift();
      visitados.add(proximo);
      lotes.push(visitar(proximo, env.DB, visitados, fila));
    }
    await Promise.all(lotes);
  }

  console.log(`Índice percorrido: ${total.pastas} pastas`);
  return total;
}
