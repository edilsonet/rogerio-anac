// Parser de CSV da ANAC — semântica por conjunto.
// Dado gravado como veio; normalização fica em coluna separada.

// Separa um CSV em linhas considerando ';' como separador padrão,
// aspas como delimitador, aspas duplicadas como aspa literal,
// e ignora uma linha "Atualizado em: ..." antes do cabeçalho.
export function parseCSV(text, { sep = ';' } = {}) {
  const rows = [];
  let field = '';
  let record = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"') {
        if (next === '"') { field += '"'; i++; continue; }
        inQuotes = false; continue;
      }
      field += ch; continue;
    }

    if (ch === '"') { inQuotes = true; continue; }
    if (ch === sep) { record.push(field); field = ''; continue; }
    if (ch === '\r') { continue; }
    if (ch === '\n') { record.push(field); rows.push(record); record = []; field = ''; continue; }
    field += ch;
  }
  if (field || record.length) { record.push(field); rows.push(record); }

  return rows;
}

// Remove linha "Atualizado em: ..." que antecede o cabeçalho.
export function limpaLinhaAtualizado(lines) {
  while (lines.length && /^Atualizado\s?em:\s/i.test(lines[0].trim())) {
    lines.shift();
  }
  return lines;
}

// Normalização leve (só para colunas de consulta, nunca para substituir o valor original).
export function normalizaUf(c) {
  if (!c) return '';
  const m = String(c).trim().match(/^([A-Z]{2})\b/);
  return m ? m[1].toUpperCase() : '';
}

// Valida o cabeçalho esperado. Se não bater, lança erro (não gravar).
export function validaCabecalho(cabecalho, esperado) {
  const a = cabecalho.map((c) => String(c).trim().toLowerCase());
  const b = esperado.map((c) => String(c).trim().toLowerCase());
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}
