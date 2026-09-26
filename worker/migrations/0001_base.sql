-- anac-sync — schema base (etapa 1).

-- Registro de cada carga/arquivo processado.
CREATE TABLE IF NOT EXISTS anac_cargas (
  arquivo    TEXT PRIMARY KEY,
  pasta      TEXT NOT NULL,
  nome       TEXT NOT NULL,
  data_carga TIMESTAMP NOT NULL DEFAULT (datetime('now')),
  linhas     BIGINT NOT NULL DEFAULT 0,
  hash       TEXT,
  status     TEXT NOT NULL DEFAULT 'pendente', -- pendente, ok, erro, igual
  erro       TEXT,
  ultima_modificacao TEXT,
  ultima_verificacao TIMESTAMP NOT NULL DEFAULT (datetime('now'))
);

-- Índice dos arquivos da ANAC (nome, pasta, data, tamanho, link).
CREATE TABLE IF NOT EXISTS anac_indice (
  link         TEXT PRIMARY KEY,
  nome         TEXT NOT NULL,
  pasta        TEXT NOT NULL,
  data         TIMESTAMP,
  tamanho      TEXT,
  ultima_verificacao TIMESTAMP NOT NULL DEFAULT (datetime('now'))
);

-- Metadados de cada conjunto (para o /status e para guiar embeddings).
CREATE TABLE IF NOT EXISTS anac_conjuntos (
  id           TEXT PRIMARY KEY,
  nome         TEXT NOT NULL,
  pasta        TEXT NOT NULL,
  tem_vetor    BOOLEAN NOT NULL DEFAULT false,
  chave        TEXT NOT NULL DEFAULT '',
  cabecalho    TEXT,
  encoding       TEXT,
  ultima_verificacao TIMESTAMP NOT NULL DEFAULT (datetime('now'))
);

-- Índices de busca rápida.
CREATE INDEX IF NOT EXISTS idx_anac_cargas_pasta ON anac_cargas(pasta);
CREATE INDEX IF NOT EXISTS idx_anac_cargas_status ON anac_cargas(status);
CREATE INDEX IF NOT EXISTS idx_anac_indice_pasta ON anac_indice(pasta);
