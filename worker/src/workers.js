// anac-sync — sincronização diária dos dados abertos da ANAC.
// Worker single-script: roteamento + Workflow + cron + /status.

import { getStatus } from './status.js';
import { busca } from './search.js';
import { percorrerIndice } from './index.js';

// Roteamento básico de rotas HTTP.
async function handleRequest(req, env, ctx) {
  const url = new URL(req.url);
  const path = url.pathname;

  // Rota de saúde / status.
  if (path === '/status' && req.method === 'GET') {
    const status = await getStatus(env, env.DB);
    return Response.json(status);
  }

  // Rota de busca semântica.
  if (path === '/busca' && req.method === 'GET') {
    const query = url.searchParams.get('q');
    if (!query) {
      return Response.json({ erro: 'parâmetro "q" obrigatório' }, { status: 400 });
    }
    const resultado = await busca(env, query, {
      filtro: url.searchParams.get('filtro') ? JSON.parse(url.searchParams.get('filtro')) : undefined,
      topK: Number(url.searchParams.get('topk') || 50),
      limite: Number(url.searchParams.get('limite') || 10),
    });
    return Response.json(resultado);
  }

  // Rota padrão (raiz).
  if (path === '/' && req.method === 'GET') {
    return Response.json({
      nome: 'anac-sync',
      descricao: 'Sincronização diária dos dados abertos da ANAC',
      rotas: ['/status', '/busca'],
    });
  }

  return Response.json({ erro: 'rota não encontrada' }, { status: 404 });
}

// Handler principal do Worker.
export default {
  async fetch(req, env, ctx) {
    try {
      return await handleRequest(req, env, ctx);
    } catch (err) {
      console.error('Erro no handler:', err);
      return Response.json({ erro: 'erro interno do servidor', detail: err.message }, { status: 500 });
    }
  },
};

// Handler do cron trigger (executado diariamente às 06:00 UTC).
export const cron = async (req, env, ctx) => {
  ctx.waitUntil(sincronizar(env));
  return Response.json({ status: 'sync iniciado' });
};

// Função de sincronização (será implementada nas próximas etapas).
async function sincronizar(env) {
  console.log('Sincronização iniciada...');
  await percorrerIndice(env);
  console.log('Índice da ANAC percorrido.');
}

// Definição do Workflow (será expandida nas próximas etapas).
export const ANAC_SYNC = {
  initial: 'verificar',
  steps: {
    verificar: async (input) => {
      // Etapa 2: percorrer o índice da ANAC (crawler em worker/src/index.js).
      await percorrerIndice(input);
      return { acoes: ['indice_anac'] };
    },
  },
};
