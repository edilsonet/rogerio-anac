// Rota /status: resumo da última execução e estado das cargas.

import { run } from './db.js';

// Monta o status de uma carga individual.
function statusCarga(c) {
  return {
    arquivo: c.arquivo,
    pasta: c.pasta,
    nome: c.nome,
    data_carga: c.data_carga,
    linhas: c.linhas,
    hash: c.hash,
    status: c.status,
    erro: c.erro,
    ultima_modificacao: c.ultima_modificacao,
    ultima_verificacao: c.ultima_verificacao,
  };
}

// Retorna o status geral do sistema.
export async function getStatus(env, db) {
  const cargas = await run(db, `SELECT * FROM anac_cargas ORDER BY ultima_verificacao DESC LIMIT 50`);
  const conjuntos = await run(db, `SELECT * FROM anac_conjuntos ORDER BY pasta, nome`);

  const total = cargas.rows.length;
  const ok = cargas.rows.filter((c) => c.status === 'ok').length;
  const erro = cargas.rows.filter((c) => c.status === 'erro').length;
  const pendente = cargas.rows.filter((c) => c.status === 'pendente').length;

  // Alertas: cargas com erro ou paradas de mudar há > 45 dias.
  const alertas = [];
  const agora = Date.now();
  const dias45 = 45 * 24 * 60 * 60 * 1000;

  for (const c of cargas.rows) {
    if (c.status === 'erro') {
      alertas.push({ tipo: 'erro', arquivo: c.arquivo, erro: c.erro });
    }
    if (c.ultima_modificacao) {
      const ult = Date.parse(c.ultima_modificacao);
      if (!isNaN(ult) && agora - ult > dias45) {
        alertas.push({ tipo: 'parado', arquivo: c.arquivo, dias_parado: Math.floor((agora - ult) / dias45) });
      }
    }
  }

  return {
    agora: new Date().toISOString(),
    cargas: {
      total,
      ok,
      erro,
      pendente,
      itens: cargas.rows.map(statusCarga),
    },
    conjuntos: conjuntos.rows.map((c) => ({
      id: c.id,
      nome: c.nome,
      pasta: c.pasta,
      tem_vetor: c.tem_vetor,
      ultima_verificacao: c.ultima_verificacao,
    })),
    alertas,
  };
}
