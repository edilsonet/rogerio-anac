// Busca semântica com rerank: query -> Vectorize -> D1 -> rerank -> top 10.

import { embed, rerank } from './embed.js';

// Constrói a "snipeta" de texto buscável para um registro do Vectorize.
// Nunca inclui campos LGPD (nome de pessoa, CPF, matrícula).
function snipetaRegistro(reg) {
  const partes = [];
  if (reg.nome) partes.push(reg.nome);
  for (const col of ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10']) {
    const v = reg[col];
    if (v && typeof v === 'string' && v.trim().length > 0) {
      partes.push(v.trim());
    }
  }
  return partes.join(' | ');
}

// Busca no Vectorize e retorna os topK com metadata.
async function buscarVectorize(VECTOR, queryVector, filtro, topK = 50) {
  return VECTOR.query({
    data: queryVector,
    k: topK,
    filters: filtro || undefined,
    includeMetadata: true,
  });
}

// Busca completa: query -> Vectorize -> busca textos no D1 -> rerank.
export async function busca(env, query, opts = {}) {
  const { filtro, topK = 50, limite = 10 } = opts;

  const queryVector = await embed(env.AI, query);
  const matches = await buscarVectorize(env.VECTOR, queryVector, filtro, topK);

  const docs = (matches.matches || [])
    .slice(0, limite)
    .map((m) => ({
      id: m.id,
      score: m.distance,
      fonte: m.metadata?.fonte || m.id,
      texto: m.metadata?.snipeta || '',
    }));

  // Rerank para refinar a ordem (só se tiver mais de um candidato).
  const reranked = docs.length > 1 ? await rerank(env.AI, query, docs) : docs;

  return {
    query,
    resultados: reranked.slice(0, limite),
  };
}
