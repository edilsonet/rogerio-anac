Você vai construir, na Cloudflare do Edilson (conta do Vortex), um serviço que mantém os dados abertos
da ANAC salvos e atualizados todo dia, com busca por significado (vetores) e reordenação (rerank),
tudo dentro da Cloudflare. Projeto: C:\Projetos\anac-dados. Você roda em loop: cada rodada faz UMA
etapa (ou parte dela) e termina; a próxima rodada continua lendo docs/PROGRESSO.md.
Código e arquivos 100% profissionais; zoeira só no chat.

## 0. Regras do loop (leia antes de tudo)
- Leia primeiro `docs/ULTIMA_RODADA.md` (escrito pelo loop, nao por voce): diz o que a rodada anterior
  fez, se commitou, se terminou pelo limite de acoes e o resultado da checagem do projeto com os
  erros reais. Nao repita o que ja foi feito; se ha erro de checagem, corrija ele PRIMEIRO.
  Se a anterior terminou pelo limite de acoes, faca uma parte MENOR nesta.
- O shell do `run_shell_command` e o **cmd.exe** do Windows, nao o PowerShell. Para descartar
  saida use `>nul` e `2>nul`. NUNCA escreva `$null` num comando: no cmd isso cria um arquivo
  chamado `$null` dentro do projeto. Comando PowerShell so assim: `powershell -NoProfile -Command "..."`.
- Rodada curta: no maximo 40 acoes (ler, editar, rodar). Chegando perto disso, pare de
  explorar e feche a rodada com o que estiver testado.
- Commit parcial vale e e assim que o loop reconhece avanco:
  `git commit -m "etapa N (parcial): <o que ficou pronto e testado>"`. Nunca marque `[x]` sem
  commit. Nao deixe codigo que nao compila sem commit por mais de uma rodada: ou corrige, ou
  descarta com `git checkout -- <arquivo>` e anota o motivo no PROGRESSO.md.
- Nao rode `git add -A` se houver arquivo que nao deveria existir (`$null`, saidas de teste,
  `plano_out.txt`): apague antes. Nao crie arquivos na raiz do projeto.

- Se o ULTIMA_RODADA.md diz que a rodada anterior NAO editou nenhum arquivo (so leu), nesta rodada a sua
  PRIMEIRA acao depois de ler o ULTIMA_RODADA.md e o arquivo da etapa e ESCREVER codigo: crie ou edite
  o arquivo da etapa antes de ler qualquer outra coisa. Ler mais de 10 arquivos numa rodada e sinal de
  que voce esta enrolando.

## 1. Comece SEMPRE assim
1. Leia docs/PROGRESSO.md. Se não existir, crie com a primeira linha `STATUS: EM ANDAMENTO` e as
   etapas da seção 5, todas `[ ]`.
2. Primeira linha `STATUS: CONCLUIDO` ou `STATUS: PARADO` → não faça nada e encerre.
3. Pegue a PRIMEIRA etapa não `[x]` (se estiver `[~] parcial`, continue dela).
4. Contexto limitado: leia e escreva em pedaços de no máximo 20 KB. Arquivo maior:
   `powershell -ExecutionPolicy Bypass -File ferramentas\ler.ps1 <arquivo> [parte]`. No máximo ~60 KB
   lidos por rodada; passou disso, marque `[~] parcial` e termine. Nunca leia CSV da ANAC inteiro:
   só as primeiras linhas (`Get-Content arquivo -TotalCount 5`).
5. A cada parte pronta: `powershell -ExecutionPolicy Bypass -File ferramentas\andamento.ps1 "etapa N: <o que ficou pronto>"`.

## 2. Fonte dos dados (fatos já verificados — não refaça a pesquisa)
- Os arquivos ficam em https://sistemas.anac.gov.br/dadosabertos/ (índice de pastas aberto; 24.082
  arquivos em 24/09/2026). As páginas gov.br/anac/... NÃO servem: para acesso automático respondem 200
  com a página "Acesso Temporariamente Interrompido".
- Catálogo pronto com links diretos, colunas e utilidade: docs/CATALOGO_DADOS_ANAC.md (leia só a seção
  do conjunto da etapa).
- Muitas conexões simultâneas derrubam o servidor da ANAC: no máximo 4 em paralelo, com repetição.
- CSV com separador `;` na maioria; alguns em UTF-16 (OficinasManutencao.csv) ou com uma linha
  "Atualizado em: ..." antes do cabeçalho; o de empresas aéreas usa aspas duplicadas. Valide o
  cabeçalho esperado; se mudar, NÃO grave nada daquele arquivo e registre o erro (sem falha silenciosa).
- NÃO baixe o que não cabe e não serve: AeroportosConcedidos (≈148 GB de PDF/DWG), EVTEA, drones,
  séries históricas mensais (Registro de serviços aéreos, Atrasos e cancelamentos, VRA, Slots,
  Movimentação, consumidor.gov). Para esses, só o ÍNDICE (nome, pasta, data, tamanho, link) no D1.

## 3. Arquitetura (use exatamente esta)
- **Worker `anac-sync`** (não é o Pages do Vortex), criado com `npx --yes wrangler@4.133.0`, com:
  - Cron diário `0 6 * * *` (06:00 UTC = 03:00 Brasília) disparando um **Workflow** (passos
    duráveis que retomam sozinhos se cair) — um passo por arquivo.
  - Bindings: R2 `vortex` (prefixo `anac/`), D1 novo `anac` (NÃO use o D1 `vortex` do app),
    Vectorize `anac-bge-m3` (1024 dimensões, métrica cosine), Workers AI `AI`.
- **Por arquivo:** baixar com fetch em streaming → gravar o bruto no R2 (`anac/<pasta>/<data>/<arquivo>`)
  → calcular hash; se igual ao de ontem, parar ali → senão ler em blocos, gravar/atualizar as linhas no
  D1 (uma tabela por conjunto, chave natural: CIAD, OACI, marca, CNPJ, número…) e registrar em
  `anac_cargas` (arquivo, data, linhas, hash, status, erro).
- **Vetores:** só para os conjuntos marcados "vetor" na seção 5. Para cada linha nova/alterada, montar um
  texto curto em português com os campos principais (ex.: "Heliponto SJXV, Hospital X, São Paulo/SP,
  operação noturna: sim, dimensões 15x15"), gerar o vetor com `@cf/baai/bge-m3` em lotes de até 100
  textos e gravar no Vectorize com ID `<conjunto>:<chave>` e metadados pequenos (conjunto, uf, chave).
  Linha removida pela ANAC → apagar o vetor.
- **Busca:** rota `GET /busca?q=...&conjunto=...&uf=...` no próprio Worker: vetor da pergunta (bge-m3)
  → Vectorize topK 50 (com filtro de metadado se informado) → buscar os textos no D1 → rerank com
  `@cf/baai/bge-reranker-base` (query + contexts) → devolver os 10 melhores com a pontuação e a fonte
  (arquivo da ANAC e data da carga). Rota `GET /status`: última carga de cada arquivo e erros.
- Segredos só em `wrangler secret`/.env, nunca em código. Credenciais do .env do Vortex
  (C:\Projetos\Vortex\.env): CLOUDFLARE_API_TOKEN e CLOUDFLARE_ACCOUNT_ID.

## 4. Limites da Cloudflare (verificados em 24/09/2026 — respeite)
- Plano gratuito: Worker com 10 ms de CPU por execução (não processa CSV grande), 10.000 neurons de
  Workers AI por dia, Vectorize com 5 milhões de dimensões guardadas (~4.800 vetores de 1024).
- Workers Paid (US$ 5/mês): cron até 5 min de CPU, Workflow até 1 h por disparo, Vectorize com 10
  milhões de dimensões incluídas (~9.700 vetores) e centavos acima disso.
- A carga inicial dos conjuntos com "vetor" passa de 30 mil vetores. **Se a conta estiver no plano
  gratuito, na etapa 1 escreva `STATUS: PARADO — precisa ativar Workers Paid (US$ 5/mês) para o cron
  processar os CSV e guardar os vetores` e termine.** Não tente contornar com gambiarra.

## 5. Etapas
- [ ] 1 Base: confirmar plano da conta (API `GET /accounts/{id}/subscriptions`); criar D1 `anac`,
      índice Vectorize `anac-bge-m3` (1024, cosine), projeto do Worker com Workflow + cron + rota
      /status; migration 0001 com `anac_cargas` e `anac_indice`; deploy; testar /status na nuvem.
- [ ] 2 Índice completo: percorrer https://sistemas.anac.gov.br/dadosabertos/ (todas as pastas) e gravar
      em `anac_indice` nome, pasta, data, tamanho e link de cada arquivo (≈24 mil linhas). Diário.
- [ ] 3 Aeródromos (vetor): AerodromosPublicos, AerodromosPrivados, Helipontos, Helidecks, áreas de
      helicóptero, aeródromos excluídos (este só em tabela, sem vetor).
- [ ] 4 Operadores (vetor): pda_empresas_aereas_nacionais (≈150 MB: streaming + só colunas úteis) e
      empresas estrangeiras.
- [ ] 5 Aeronaves: RAB dados_aeronaves (tabela; vetor só por modelo/fabricante agregado, não por
      matrícula), Livro RAB (tabela), Diretrizes de Aeronavegabilidade (vetor), Produtos certificados.
- [ ] 6 Manutenção e segurança (vetor): Oficinas de manutenção (UTF-16), Ocorrências aeronáuticas,
      Recomendações de segurança, Dificuldades em serviço.
- [ ] 7 Formação e pessoal (tabela): escolas/cursos, treinamentos de tipo, simuladores, clínicas
      (NÃO guardar CPF), licenças emitidas.
- [ ] 8 Custos e mercado (tabela): tarifas aeroportuárias, dados estatísticos do transporte aéreo (só
      agregado por rota/mês — o arquivo tem ≈360 MB), horas voadas.
- [ ] 9 Busca com rerank: rota /busca completa + teste com 5 perguntas reais ("heliponto com operação
      noturna em Belém", "táxi aéreo aeromédico no Pará", "diretriz de aeronavegabilidade do King Air
      B200"...) mostrando que o rerank muda a ordem; documentar em docs/USO.md.
- [ ] 10 Vigilância: se uma carga falhar 2 dias seguidos ou o arquivo parar de mudar por mais de 45
      dias, marcar em /status como alerta.

## 6. Regras que valem sempre
- Nenhum arquivo acima de 20 KB; um arquivo por módulo (baixador, parser de cada conjunto, embeddings,
  busca, rotas).
- Dado da ANAC é gravado como veio (sem "corrigir" valor); normalização só em coluna separada.
- LGPD: RAB tem nome de proprietário/operador pessoa física e clínicas têm CPF — não vetorizar esses
  campos, não expor na /busca.
- Pacote novo só com versão publicada há mais de 7 dias (registre versão e data no PROGRESSO.md).

## 7. Feche SEMPRE a rodada assim
1. Tipos e build do Worker sem erro (`npx --yes wrangler@4.133.0 deploy --dry-run`).
2. Deploy real e teste da rota na nuvem (Invoke-WebRequest em https://anac-sync.rocha-eng.workers.dev/status).
3. Checagem de 20 KB: `powershell -ExecutionPolicy Bypass -File ferramentas\checa_tamanho.ps1`.
4. `git add -A` e `git commit -m "etapa N: <resumo>"`.
5. Atualize docs/PROGRESSO.md (3 linhas: feito, como testar, falta). Commit de novo se mudou.
- Falhou e não consegue corrigir nesta rodada: `git checkout -- .`, anote o erro no PROGRESSO.md e termine.
- Precisa de decisão/pagamento/acesso que você não tem: `STATUS: PARADO — <motivo>` e termine.
- Todas as etapas `[x]`: primeira linha `STATUS: CONCLUIDO`.
