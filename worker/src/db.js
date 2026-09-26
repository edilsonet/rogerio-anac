// Helpers de banco (D1) e hash para detecção de alteração.

// Hash SHA-256 do conteúdo bruto (para comparar carga com carga).
export async function sha256(text) {
  const buf = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', buf);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function run(db, sql, params = []) {
  const stmt = await db.prepare(sql);
  return stmt.bind(params).run();
}

// Insere ou atualiza o registro de carga.
export async function upsertCarga(db, carga) {
  const sql = `
    INSERT INTO anac_cargas (arquivo, pasta, nome, data_carga, linhas, hash, status, erro, ultima_modificacao, ultima_verificacao)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(arquivo) DO UPDATE SET
      pasta = excluded.pasta,
      nome = excluded.nome,
      data_carga = excluded.data_carga,
      linhas = excluded.linhas,
      hash = excluded.hash,
      status = excluded.status,
      erro = excluded.erro,
      ultima_modificacao = excluded.ultima_modificacao,
      ultima_verificacao = excluded.ultima_verificacao
  `;
  return run(db, sql, [
    carga.arquivo, carga.pasta, carga.nome, carga.data_carga,
    carga.linhas, carga.hash, carga.status, carga.erro || null,
    carga.ultima_modificacao || null,
  ]);
}

// Grava/actualiza uma linha em uma tabela (insert OR REPLACE por chave natural).
export async function upsertLinha(db, tabela, colunas, chaves, valores) {
  const cols = colunas.map((c) => `"${c}"`).join(', ');
  const vals = colunas.map((_, i) => `$${i + 1}`).join(', ');
  const set = colunas
    .filter((c) => !chaves.includes(c))
    .map((c) => `"${c}" = EXCLUDED."${c}"`)
    .join(', ');
  const where = chaves.map((c) => `"${c}" = EXCLUDED."${c}"`).join(' AND ');
  const sql = `INSERT INTO "${tabela}" (${cols}) VALUES (${vals}) ON CONFLICT (${where}) DO UPDATE SET ${set}`;
  return run(db, sql, valores);
}

// Registra o índice de arquivos.
export async function upsertIndice(db, reg) {
  const sql = `
    INSERT INTO anac_indice (link, nome, pasta, data, tamanho, ultima_verificacao)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(link) DO UPDATE SET
      nome = excluded.nome, pasta = excluded.pasta,
      data = excluded.data, tamanho = excluded.tamanho,
      ultima_verificacao = excluded.ultima_verificacao
  `;
  return run(db, sql, [reg.link, reg.nome, reg.pasta, reg.data || null, reg.tamanho || null]);
}

// Registra metadados de conjunto.
export async function upsertConjunto(db, c) {
  const sql = `
    INSERT INTO anac_conjuntos (id, nome, pasta, tem_vetor, chave, cabecalho, encoding)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      nome = excluded.nome, pasta = excluded.pasta,
      tem_vetor = excluded.tem_vetor, chave = excluded.chave,
      cabecalho = excluded.cabecalho, encoding = excluded.encoding,
      ultima_verificacao = excluded.ultima_verificacao
  `;
  return run(db, sql, [c.id, c.nome, c.pasta, !!c.tem_vetor, c.chave || '', c.cabecalho || null, c.encoding || null]);
}
