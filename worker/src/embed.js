// Embeddings via Workers AI (bge-m3) e rerank (bge-reranker-base).
// Nunca envia campos com dados de pessoa (RAB, CPF de clínica).

// Embed de um único texto (retorna array de 1024 floats).
export async function embed(AI, texto) {
  const res = await AI.run('@cf/baai/bge-m3', { input: texto });
  return res.data[0].embedding;
}

// Embed em lote de até 100 textos (bge-m3 aceita batch).
export async function embedMany(AI, textos) {
  const chunks = [];
  for (let i = 0; i < textos.length; i += 100) {
    chunks.push(textos.slice(i, i + 100));
  }

  const resultados = [];
  for (const chunk of chunks) {
    const res = await AI.run('@cf/baai/bge-m3', { input: chunk });
    for (const d of res.data) {
      resultados.push(d.embedding);
    }
  }
  return resultados;
}

// Rerank de resultados usando bge-reranker-base.
// query: texto da busca; docs: array de {id, texto, fonte}.
// Retorna array ordenada por relevância com score.
export async function rerank(AI, query, docs) {
  if (docs.length === 0) return [];

  const pairs = docs.map((d) => ({ query, passage: d.texto }));
  const res = await AI.run('@cf/baai/bge-reranker-base', {
    model: '@cf/baai/bge-reranker-base',
    query,
    passages: docs.map((d) => d.texto),
  });

  const ordenados = (res.data || [])
    .map((r, i) => ({ ...docs[i], score: r.score }))
    .sort((a, b) => (b.score || 0) - (a.score || 0));

  return ordenados;
}
