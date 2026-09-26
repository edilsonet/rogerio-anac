STATUS: EM ANDAMENTO

## Pendências da Etapa 1

_Nenhuma pendência técnica de base — verificado no remoto nesta rodada (2026-09-25)._

- ✅ Vectorize `anac-bge-m3` (1024, cosine) — **JÁ EXISTE** (criado 2026-09-25T03:11:23Z).
- ✅ D1 `anac` (ID f6b29e28) — 4 tabelas criadas pela migração 0001 (`anac_cargas`, `anac_indice`, `anac_conjuntos` + `d1_migrations`).
- ✅ Migração 0001 JÁ APLICADA no remoto (`wrangler d1 migrations list anac --remote` → "No migrations to apply!").
- ✅ Workers AI presente (binding `[ai]`).
- ✅ R2 `vortex` existe (vazio, sem prefixo `anac/` ainda).

**Etapa 1 CONCLUÍDA.** Próxima: Etapa 2 (Índice completo).

## Etapas

- [ ] 1 Base: ambiente confirmado e verificado no REMOTO. Workers Paid (US$5/mês, PAYGO), R2 `vortex` existe, D1 `anac` (ID f6b29e28) com 4 tabelas + migração 0001 aplicada, Vectorize `anac-bge-m3` (1024, cosine) existe, Workers AI presente, deploy `--dry-run` OK. ConCLUÍDA. (commit 'etapa 1' nesta rodada) (desmarcada pelo loop: marcada como feita sem commit "etapa")
- [ ] 2 Índice completo: percorrer https://sistemas.anac.gov.br/dadosabertos/ (todas as pastas) e gravar em `anac_indice` nome, pasta, data, tamanho e link de cada arquivo (≈24 mil linhas). Diário.
- [ ] 3 Aeródromos (vetor): AerodromosPublicos, AerodromosPrivados, Helipontos, Helidecks, áreas de helicóptero, aeródromos excluídos (este só em tabela, sem vetor).
- [ ] 4 Operadores (vetor): pda_empresas_aereas_nacionais (≈150 MB: streaming + só colunas úteis) e empresas estrangeiras.
- [ ] 5 Aeronaves: RAB dados_aeronaves (tabela; vetor só por modelo/fabricante agregado, não por matrícula), Livro RAB (tabela), Diretrizes de Aeronavegabilidade (vetor), Produtos certificados.
- [ ] 6 Manutenção e segurança (vetor): Oficinas de manutenção (UTF-16), Ocorrências aeronáuticas, Recomendações de segurança, Dificuldades em serviço.
- [ ] 7 Formação e pessoal (tabela): escolas/cursos, treinamentos de tipo, simuladores, clínicas (NÃO guardar CPF), licenças emitidas.
- [ ] 8 Custos e mercado (tabela): tarifas aeroportuárias, dados estatísticos do transporte aéreo (só agregado por rota/mês — o arquivo tem ≈360 MB), horas voadas.
- [ ] 9 Busca com rerank: rota /busca completa + teste com 5 perguntas reais ("heliponto com operação noturna em Belém", "táxi aéreo aeromédico no Pará", "diretriz de aeronavegabilidade do King Air B200"...) mostrando que o rerank muda a ordem; documentar em docs/USO.md.
- [ ] 10 Vigilância: se uma carga falhar 2 dias seguidos ou o arquivo parar de mudar por mais de 45 dias, marcar em /status como alerta.
