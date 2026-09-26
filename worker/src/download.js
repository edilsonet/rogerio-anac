// Download streamado de arquivos da ANAC, com hash e gravação em R2.
// Nunca carrega arquivo inteiro em memória: lê em blocos e escreve no R2.

import { sha256 } from './db.js';

// Limite de memória para streaming (para não estourar o heap do Worker).
const BLOCO = 512 * 1024;

// Faz download de uma URL preservando o encoding declarado pelo servidor.
// Retorna { text, contentType, size, hash, lastModified }.
export async function download(url) {
  const resp = await fetch(url, { redirect: 'follow' });
  if (!resp.ok) {
    throw new Error(`HTTP ${resp.status} para ${url}`);
  }

  const contentType = resp.headers.get('content-type') || '';
  const lastModified = resp.headers.get('last-modified');
  const sizeHeader = resp.headers.get('content-length');
  const size = sizeHeader ? Number(sizeHeader) : null;

  if (!resp.body) {
    throw new Error(`Sem body para ${url}`);
  }

  const reader = resp.body.getReader();
  const chunks = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    total += value.length;
  }

  // Junta os blocos em um Uint8Array só.
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }

  // Detecta encoding pelo BOM (UTF-16LE da ANAC começa com FF FE).
  let encoding = 'utf-8';
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    encoding = 'utf-16le';
  }

  // Converte para texto conforme o encoding.
  const decoder = new TextDecoder(encoding);
  const text = decoder.decode(bytes);

  const hash = await sha256(text);

  return { text, contentType, size, hash, lastModified, encoding };
}

// Grava o conteúdo bruto em R2 no prefixo anac/<pasta>/<data>/<arquivo>.
export async function guardarR2(env, bucket, key, text) {
  await bucket.put(key, text);
  return key;
}
