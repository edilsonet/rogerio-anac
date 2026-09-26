# Catálogo — dados abertos da ANAC úteis para o UBJET

> Levantamento de 24/09/2026. As 85 páginas da lista do gov.br foram visitadas, mas o gov.br **bloqueia acesso automático** ("Acesso Temporariamente Interrompido" com status 200). Os arquivos de verdade ficam em **https://sistemas.anac.gov.br/dadosabertos/** (índice aberto, sem bloqueio): foram percorridas todas as pastas — **24.082 arquivos**, 0 pastas com erro. Os links abaixo são diretos para o arquivo (usar esses no código, nunca a página do gov.br).

**Legenda:** nível **A** = usar já (impacto direto em cotação, frota ou confiança) · **B** = útil em módulos específicos (Hangar, Carreira, marketing) · **C** = desatualizado ou fora do escopo.

## A — Usar já

### 2.1 — RAB — aeronaves registradas
- **Onde:** [arquivo](https://sistemas.anac.gov.br/dadosabertos/Aeronaves/RAB/dados_aeronaves.csv) · 23759831 B · atualizado 24-Sep-2026
- **Campos-chave:** MARCAS, PROPRIETARIOS, OPERADORES, DS_MODELO, NM_FABRICANTE, CD_CLS (categoria, ex. TPX = táxi aéreo), NR_PASSAGEIROS_MAX, NR_ASSENTOS, NR_ANO_FABRICACAO, DT_VALIDADE_CA, DT_VALIDADE_CVA, CD_INTERDICAO, DS_GRAVAME
- **Uso no UBJET:** Validar a frota de cada operadora (matrícula existe, é TPX, CA e CVA válidos, sem interdição); mostrar "CA válido até" no card; Hangar: anunciar pela matrícula; assentos reais para a cotação
- **Situação no UBJET:** JÁ USA (hangar-rab, rab-excel)
- **Cuidado:** Nomes de proprietários/operadores: pessoa física = dado pessoal (LGPD) — exibir só para o próprio dono

### 7.3 — Empresas aéreas nacionais (inclui táxi aéreo)
- **Onde:** [arquivo](https://sistemas.anac.gov.br/dadosabertos/Operador%20A%C3%A9reo/pda_empresas_aereas_nacionais.csv) · 150933832 B · atualizado 24-Sep-2026
- **Campos-chave:** razao_social, cnpj, atividades_aereas, situacao, validade_operacional, decisao_operacional, email, telefone, endereco_sede, cidade, uf, icao/iata
- **Uso no UBJET:** Conferir as 160 operadoras (empresas_eo): certificado vigente, situação, validade; completar e-mail/telefone/endereço oficiais; bloquear cotação de operadora vencida/suspensa
- **Situação no UBJET:** NOVO
- **Cuidado:** Arquivo grande (≈150 MB): baixar 1×/dia e guardar só as colunas usadas

### 1.1.1 — Aeródromos públicos
- **Onde:** [arquivo](https://sistemas.anac.gov.br/dadosabertos/Aerodromos/Aer%C3%B3dromos%20P%C3%BAblicos/Lista%20de%20aer%C3%B3dromos%20p%C3%BAblicos/AerodromosPublicos.csv) · 101504 B · atualizado 15-Sep-2026
- **Campos-chave:** Código OACI, CIAD, Nome, Município, UF, Latitude, Longitude, Altitude, Operação Diurna/Noturna, Situação, Validade do Registro
- **Uso no UBJET:** Origem/destino da cotação, distância, pouso noturno permitido, registro vencido = não oferecer
- **Situação no UBJET:** JÁ USA

### 1.2.1 — Aeródromos privados
- **Onde:** [arquivo](https://sistemas.anac.gov.br/dadosabertos/Aerodromos/Aer%C3%B3dromos%20Privados/Lista%20de%20aer%C3%B3dromos%20privados/Aerodromos%20Privados/AerodromosPrivados.csv) · 917614 B · atualizado 24-Sep-2026
- **Campos-chave:** Código OACI, CIAD, Nome, Município, UF, Lat/Long, Operação Diurna/Noturna, Designação/Comprimento/Largura/Superfície das pistas 1 e 2
- **Uso no UBJET:** Fazendas e pistas particulares como destino; comprimento/superfície decidem que aeronave pode pousar (jato × turbo-hélice × pistão)
- **Situação no UBJET:** JÁ USA

### 1.2.2 — Helipontos privados
- **Onde:** [arquivo](https://sistemas.anac.gov.br/dadosabertos/Aerodromos/Aer%C3%B3dromos%20Privados/Lista%20de%20aer%C3%B3dromos%20privados/Heliponto/Helipontos.csv) · 392857 B · atualizado 24-Sep-2026
- **Campos-chave:** Código OACI, CIAD, Nome, Município, UF, Tipo, Lat/Long, Operação Diurna/Noturna, Dimensões, Resistência, Luzes
- **Uso no UBJET:** Destinos de helicóptero (prédios, hospitais, fazendas); noturno só onde há luzes
- **Situação no UBJET:** PARCIAL (1.612 inseridos em 13/09, sem atualização automática)
- **Cuidado:** Atualizado diariamente pela ANAC: automatizar

### 1.2.3 — Helidecks
- **Onde:** [arquivo](https://sistemas.anac.gov.br/dadosabertos/Aerodromos/Aer%C3%B3dromos%20Privados/Lista%20de%20aer%C3%B3dromos%20privados/Helideck/Helidecks.csv) · 29380 B · atualizado 24-Sep-2026
- **Campos-chave:** Código OACI, CIAD, Nome, Resistência, Comprimento do maior helicóptero, Validade do cadastro
- **Uso no UBJET:** Voos offshore (plataformas): só helicóptero compatível com o helideck
- **Situação no UBJET:** NOVO

### 1.1.8 — Áreas de pouso de helicóptero em aeródromos públicos
- **Onde:** [arquivo](https://sistemas.anac.gov.br/dadosabertos/Aerodromos/Aer%C3%B3dromos%20P%C3%BAblicos/%C3%81reas%20de%20Pouso%20e%20Decolagem%20de%20Helic%C3%B3pteros/Aerodromos%20Publicos%20Areas%20de%20Pouso%20e%20Decolagem%20de%20Helicopteros.csv) · 1422 B · atualizado 21-Sep-2026
- **Campos-chave:** CIAD, Identificação, Lat/Long, Tipo, Operação Diurna/Noturna, Superfície, Dimensões, Luzes
- **Uso no UBJET:** Complementa os helipontos
- **Situação no UBJET:** NOVO

### 2.10 — Livro RAB (gravames)
- **Onde:** [arquivo](https://sistemas.anac.gov.br/dadosabertos/Aeronaves/Livro%20RAB/livro_rab.csv) · 8810583 B · atualizado 29-Apr-2026
- **Campos-chave:** MARCA_AERONAVE, FABRICANTE, MODELO, NUMERO_SERIE, ANO_FABRICACAO, PMD, GRAVAME_ATUAL
- **Uso no UBJET:** Hangar/classificados: avisar se a aeronave à venda tem gravame (alienação, penhora)
- **Situação no UBJET:** NOVO
- **Cuidado:** Atualizado em 29/04/2026 (não é diário)

### 12.1 — Ocorrências aeronáuticas
- **Onde:** [arquivo](https://sistemas.anac.gov.br/dadosabertos/Seguranca%20Operacional/Ocorrencia/V_OCORRENCIA_AMPLA.csv) · 4186180 B · atualizado 24-Sep-2026
- **Campos-chave:** Numero_da_Ocorrencia, Classificacao, Data, Municipio, UF, ICAO, Matricula, Operador, Tipo_de_Ocorrencia, Fase_da_Operacao, Danos_a_Aeronave, Historico
- **Uso no UBJET:** Histórico de segurança por matrícula e por operadora (selo de confiança / alerta interno); Hangar: aeronave com histórico de acidente
- **Situação no UBJET:** NOVO
- **Cuidado:** Usar com cuidado na comunicação ao cliente (incidente ≠ culpa)

### 8.3 — Tarifas aeroportuárias
- **Onde:** [arquivo](https://sistemas.anac.gov.br/dadosabertos/Operador%20Aeroportu%C3%A1rio/Tarifas%20Aeroportu%C3%A1rias%20Tetos%20Tarif%C3%A1rios%20e%20Reajustes%20Tarif%C3%A1rios/Tarifas_Aeroportuarias.csv) · 849087 B · atualizado 17-Sep-2026
- **Campos-chave:** Perfil, Aeroporto, Normativo, Data, Tarifa, Teto Tarifário, Reajuste
- **Uso no UBJET:** Somar taxas de pouso/permanência na cotação para aeroportos concedidos (GRU, BSB, VCP, CNF…)
- **Situação no UBJET:** NOVO
- **Cuidado:** Só aeroportos concedidos

### 10.1 — Oficinas de manutenção (RBAC 145)
- **Onde:** [arquivo](https://sistemas.anac.gov.br/dadosabertos/Organiza%C3%A7%C3%B5es%20de%20Manuten%C3%A7%C3%A3o/Oficinas%20de%20Manuten%C3%A7%C3%A3o/OficinasManutencao.csv) · 591194 B · atualizado 21-Sep-2026
- **Campos-chave:** NUMERO_COM, COM, CNPJ_OM, RAZAO_SOCIAL, NOME_FANTASIA, SITUACAO_OM, CIDADE/UF, NOME_BASE, EO, SITUACAO_BASE, TIPO_BASE
- **Uso no UBJET:** Hangar: indicar oficina homologada para vistoria pré-compra; parceiros de manutenção
- **Situação no UBJET:** NOVO
- **Cuidado:** O arquivo vem em UTF-16 (texto com espaços entre letras): converter antes de ler

## B — Útil em módulos específicos

### 2.8 — Diretrizes de aeronavegabilidade (AD)
- **Onde:** [arquivo](https://sistemas.anac.gov.br/dadosabertos/Aeronaves/Diretrizes%20de%20Aeronavegabilidade/Diretrizes%20de%20Aeronavegabilidade.csv) · 1670485 B · atualizado 24-Sep-2026
- **Campos-chave:** Emenda, Número, Status, Produto, Efetividade, Ação, Sistema, Fabricante, Modelo
- **Uso no UBJET:** Hangar: listar ADs do modelo anunciado (due diligence do comprador)
- **Situação no UBJET:** NOVO (só citado na base de conhecimento)

### 13.2 — Dados estatísticos do transporte aéreo
- **Onde:** [arquivo](https://sistemas.anac.gov.br/dadosabertos/Voos%20e%20opera%C3%A7%C3%B5es%20a%C3%A9reas/Dados%20Estat%C3%ADsticos%20do%20Transporte%20A%C3%A9reo/Dados_Estatisticos.csv) · 359963089 B · atualizado 24-Sep-2026
- **Campos-chave:** Empresa, Ano, Mês, Aeroporto de origem/destino, passageiros, carga, distância, horas
- **Uso no UBJET:** Onde há demanda (rotas mais voadas) para marketing e preço dinâmico; rotas sem voo regular = oportunidade de fretamento
- **Situação no UBJET:** NOVO
- **Cuidado:** ≈360 MB: processar em lote, guardar só agregados

### 13.7 — Tarifas aéreas domésticas
- **Onde:** pasta `Voos e operações aéreas/Tarifas Aéreas Domésticas`
- **Campos-chave:** origem, destino, tarifa, assentos vendidos, mês
- **Uso no UBJET:** Comparar "fretamento dividido pelo grupo × passagem de linha aérea" na cotação
- **Situação no UBJET:** NOVO (pasta não apareceu no índice do repositório; baixar pela página)

### 2.3 — Produtos aeronáuticos certificados
- **Onde:** [arquivo](https://sistemas.anac.gov.br/dadosabertos/Aeronaves/ProdutosAeronauticosCertificadosnoBrasil/ProdutosAeronauticos.csv) · 92497 B · atualizado 01-Sep-2026
- **Campos-chave:** fabricante, modelo, tipo de certificado
- **Uso no UBJET:** Padronizar nomes de modelo/fabricante nos cadastros
- **Situação no UBJET:** NOVO

### 13.9 — Horas voadas por modelo
- **Onde:** [arquivo](https://sistemas.anac.gov.br/dadosabertos/Voos%20e%20opera%C3%A7%C3%B5es%20a%C3%A9reas/Horas%20Voadas%20de%20Aeronave/horas_voadas.csv) · 138003425 B · atualizado 03-Feb-2025
- **Campos-chave:** mes, horas_voadas, operacao, nr_decolagem, cd_tipo_icao, ds_modelo, RBAC
- **Uso no UBJET:** Referência de utilização por modelo (não é por matrícula)
- **Situação no UBJET:** NOVO
- **Cuidado:** Atualizado em 02/2025

### 8.1 — Movimentação aeroportuária
- **Onde:** pasta `Operador Aeroportuário/Dados de Movimentação Aeroportuárias`
- **Campos-chave:** aeroporto, mês, movimentos, passageiros
- **Uso no UBJET:** Aeroportos com mais movimento de aviação geral
- **Situação no UBJET:** NOVO
- **Cuidado:** Série parou em 03/2025

### 13.6 — Slots alocados
- **Onde:** pasta `Voos e operações aéreas/Slots Alocados`
- **Campos-chave:** aeroporto coordenado, temporada, horário
- **Uso no UBJET:** Alertar que CGH/SDU/GRU exigem slot para aviação executiva
- **Situação no UBJET:** NOVO

### 6.1 — Clínicas e médicos credenciados (CMA)
- **Onde:** [arquivo](https://sistemas.anac.gov.br/dadosabertos/Pessoal%20da%20Avia%C3%A7%C3%A3o%20Civil/Cl%C3%ADnicas%20e%20M%C3%A9dicos%20Credenciados/ClinicasMedicos.csv) · 34015 B · atualizado 01-Sep-2026
- **Campos-chave:** Nome, CRM, endereço, cidade, UF, telefone/e-mail públicos, validade
- **Uso no UBJET:** Carreira: indicar onde o piloto renova o CMA
- **Situação no UBJET:** NOVO
- **Cuidado:** Contém CPF/CRM de médicos: usar só campos públicos

### 9.2 — Escolas e aeroclubes (+ cursos, examinadores)
- **Onde:** [arquivo](https://sistemas.anac.gov.br/dadosabertos/Organiza%C3%A7%C3%B5es%20de%20Forma%C3%A7%C3%A3o/Escolas%20da%20Avia%C3%A7%C3%A3o%20Civil/Ciac.csv) · 115746 B · atualizado 24-Sep-2026
- **Campos-chave:** nome, CNPJ, site, e-mail, telefone, endereço; Ciac_cursos: cursos homologados
- **Uso no UBJET:** Carreira: validar formação declarada no currículo; parceiros de formação
- **Situação no UBJET:** NOVO
- **Cuidado:** Examinadores.csv tem nomes de pessoas

### 9.3 — Treinamentos de tipo
- **Onde:** [arquivo](https://sistemas.anac.gov.br/dadosabertos/Organiza%C3%A7%C3%B5es%20de%20Forma%C3%A7%C3%A3o/Lista%20de%20Treinamento%20de%20Tipo/Lista_Treinamento_Tipo_Periodico.csv) · 22116 B · atualizado 01-Sep-2025
- **Campos-chave:** modelo, tipo de treinamento
- **Uso no UBJET:** Carreira: validar habilitação de tipo declarada
- **Situação no UBJET:** NOVO

### 4.1 — Processos administrativos sancionadores
- **Onde:** [arquivo](https://sistemas.anac.gov.br/dadosabertos/fiscalizacao/Lista%20de%20processos%20administrativos%20sancionadores/ListaDeProcessosAdministrativosSancionadores.csv) · 60512 B · atualizado 01-Aug-2026
- **Campos-chave:** processo, auto de infração, concessionária, ementa, penalidade, valor
- **Uso no UBJET:** Só concessionárias de aeroporto; pouco uso direto
- **Situação no UBJET:** NOVO

## C — Desatualizado ou fora do escopo

### 1.1.4 — Pistas de pouso (públicos)
- **Onde:** [arquivo](https://sistemas.anac.gov.br/dadosabertos/Aerodromos/Aer%C3%B3dromos%20P%C3%BAblicos/Pistas%20de%20Pouso%20e%20Decolagem/pda_aerodromos_publicos_pistas_pouso_decolagem.csv) · 4767437 B · atualizado 05-Jan-2024
- **Campos-chave:** pista, comprimento, largura, resistência, superfície
- **Uso no UBJET:** Seria ótimo para comprimento de pista, mas está DESATUALIZADO (01/2024)
- **Situação no UBJET:** —
- **Cuidado:** Parado desde 2024

### 1.1.6 — Características gerais (públicos)
- **Onde:** [arquivo](https://sistemas.anac.gov.br/dadosabertos/Aerodromos/Aer%C3%B3dromos%20P%C3%BAblicos/Caracter%C3%ADsticas%20Gerais/pda_aerodromos_publicos_caracteristicas_gerais.csv) · 2520736 B · atualizado 06-Sep-2023
- **Campos-chave:** pistas, aeronave crítica, operação por cabeceira
- **Uso no UBJET:** O UBJET JÁ USA, mas o arquivo parou em 09/2023
- **Situação no UBJET:** JÁ USA — ATENÇÃO
- **Cuidado:** Conferir contra AerodromosPublicos.csv (2026) e AISWEB

### 2.4 — Drones cadastrados (SISANT)
- **Onde:** pasta `Aeronaves/drones cadastrados`
- **Campos-chave:** —
- **Uso no UBJET:** Fora do escopo
- **Situação no UBJET:** —
- **Cuidado:** 3,3 GB

### 3.x — Concessões, outorgas, contábeis, inventário de bens
- **Onde:** pasta `Certificação e Outorga`
- **Campos-chave:** —
- **Uso no UBJET:** Fora do escopo (gestão de concessões)
- **Situação no UBJET:** —

### 5.x — Gestão interna da ANAC
- **Onde:** pasta `Gestao Interna`
- **Campos-chave:** —
- **Uso no UBJET:** Fora do escopo
- **Situação no UBJET:** —

## Observações sobre a lista recebida

- Os links de índice das seções 9, 10, 11 e 12 estão trocados na lista: 9 aponta para "segurança operacional", 10 para "regulamentação", 11 para "organizações de manutenção" e 12 para "organizações de formação". Os links dos itens (9.1, 10.1, …) estão certos.
- A lista aparece duas vezes (mesmos links); foram verificados uma vez cada: 85 endereços distintos.
- O repositório tem conjuntos que não estão na lista: EVTEA (estudos de viabilidade de aeroportos, PDF), ProgramasCapacitacaoANAC, decisões monocráticas de 2ª instância e normas-homol.
- Formato: quase tudo existe em CSV e JSON; separador `;` na maioria. Alguns CSV vêm em UTF-16 ou com linha "Atualizado em" antes do cabeçalho.

## Ordem sugerida de integração

1. **Empresas aéreas nacionais** × 160 operadoras: bloquear operadora com certificado vencido/suspenso e completar contatos oficiais.
2. **RAB diário**: validade de CA/CVA e interdição por matrícula da frota cadastrada; alerta 30 dias antes de vencer.
3. **Helipontos + helidecks + áreas de helicóptero**: sincronização diária automática.
4. **Tarifas aeroportuárias** na composição do preço (aeroportos concedidos).
5. **Ocorrências** + **Livro RAB (gravame)** + **ADs** no Hangar (due diligence da aeronave à venda).
6. Rever o uso de **Características gerais (2023)**: substituir pela lista de 2026 + AISWEB.
