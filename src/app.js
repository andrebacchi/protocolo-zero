(() => {
'use strict';

const PWA = __PWA__;                 // falso na versão de artefato: sem instalação nem service worker
const FIXOS = '__FIXOS__';           // cache das imagens e fontes (o mesmo nome usado no sw.js)
const IMAGENS = __IMAGENS__;         // cartas, regiões e capa, para guardar no aparelho
/* Artes: quando as imagens chegarem, preencha IMG com { C01: 'cards/C01.webp', ... , VERSO: 'cards/verso.webp' }.
   Enquanto uma carta não tiver imagem, o app desenha a arte provisória. */
const IMG = { VERSO: 'cards/verso.webp', D1: 'cards/D1.webp', D2: 'cards/D2.webp', D3: 'cards/D3.webp', D4: 'cards/D4.webp', D5: 'cards/D5.webp',
  P1: 'cards/P1.webp', P2: 'cards/P2.webp', P3: 'cards/P3.webp', P4: 'cards/P4.webp', P5: 'cards/P5.webp',
  C01: 'cards/C01.webp', C02: 'cards/C02.webp', C03: 'cards/C03.webp', C04: 'cards/C04.webp', C05: 'cards/C05.webp', C06: 'cards/C06.webp', C07: 'cards/C07.webp', C08: 'cards/C08.webp', C09: 'cards/C09.webp', C10: 'cards/C10.webp', C11: 'cards/C11.webp', C12: 'cards/C12.webp', C13: 'cards/C13.webp', C14: 'cards/C14.webp', C15: 'cards/C15.webp' };

const DADOS = [
  ['C01', 1, 'Caderno de campo', 'Anotações soltas da primeira visita. É pouco, mas toda investigação começa assim.'],
  ['C02', 2, 'Entrevista domiciliar', 'Uma família conta quando os sintomas começaram e com quem teve contato.'],
  ['C03', 3, 'Prontuários', 'Os registros da unidade de saúde permitem conferir datas, sintomas e desfechos.'],
  ['C04', 4, 'Contagem de casos', 'A primeira contagem feita com uma definição de caso. Sem definição de caso, cada um conta uma coisa.'],
  ['C05', 5, 'Mapa de casos', 'Os casos marcados no mapa começam a se agrupar em torno de um ponto.'],
  ['C06', 5, 'Exame clínico', 'Sinais e sintomas descritos de forma padronizada, caso a caso.'],
  ['C07', 7, 'Swabs', 'Amostras de secreção coletadas e lacradas, prontas para o laboratório.'],
  ['C08', 7, 'Amostras de sangue', 'Tubos identificados para sorologia e para a pesquisa direta do agente.'],
  ['C09', 9, 'Água do poço', 'Amostra ambiental de uma fonte suspeita.'],
  ['C10', 11, 'Rede de contatos', 'Quem encontrou quem. O rastreamento de contatos desenha as cadeias de transmissão.'],
  ['C11', 11, 'Curva epidêmica', 'Casos por data de início dos sintomas. O formato da curva sugere o tipo de exposição.'],
  ['C12', 13, 'Armadilha de vetores', 'Mosquitos capturados na área, para identificar as espécies e procurar o agente.'],
  ['C13', 14, 'Microscopia de campo', 'Lâminas examinadas no laboratório de campanha.'],
  ['C14', 15, 'Banco de dados', 'Todos os registros digitados, conferidos e prontos para análise.'],
  ['C15', 17, 'Biobanco', 'Amostras catalogadas e armazenadas, disponíveis para qualquer exame futuro.']
].map(([id, v, nome, txt]) => ({ id, v, nome, txt, tipo: 'dado' }));

const PERIGOS = [
  ['P1', 'Contaminação de amostra', 'Contaminação', 'O material de uma amostra passou para outra. O resultado deixa de dizer de quem é o quê.'],
  ['P2', 'Perda de rastreabilidade', 'Rastreabilidade', 'Tubos sem etiqueta, fichas trocadas. Sem saber de quem é a amostra, o dado não serve.'],
  ['P3', 'Exposição da equipe', 'Exposição', 'O equipamento de proteção falhou. A equipe sai de campo e entra em monitoramento.'],
  ['P4', 'Falha na cadeia de frio', 'Cadeia de frio', 'A caixa térmica passou da temperatura. Amostra degradada dá resultado falso.'],
  ['P5', 'Onda de boatos', 'Boatos', 'Os boatos correm mais rápido que a doença. A comunidade para de receber a equipe.']
].map(([id, nome, curto, txt]) => ({ id, nome, curto, txt, tipo: 'perigo' }));

const ACHADOS = [
  ['D1', 5, 'Paciente 0', [
    'O primeiro caso identificado na investigação. O termo técnico é <i>caso índice</i>: o primeiro a ser detectado, não necessariamente o primeiro infectado.',
    '“Paciente zero” nasceu de um erro. Em um estudo de 1984 sobre a aids, um homem foi registrado como paciente “O”, de <i>Outside California</i>. A letra foi lida como zero, e ele acabou apontado injustamente como origem da epidemia. Em 2016, análises genéticas mostraram que o vírus já circulava nos Estados Unidos anos antes dele.']],
  ['D2', 7, 'Fonte da exposição', [
    'A origem comum dos casos: um alimento, um poço, um evento.',
    'Em 1854, em Londres, John Snow marcou no mapa as mortes por cólera do bairro do Soho e viu que elas se concentravam em torno da bomba d’água da Broad Street. Convenceu as autoridades a retirar a alavanca da bomba. O agente da cólera só seria aceito pela comunidade científica quase 30 anos depois, com Robert Koch. Um detalhe que costuma ficar de fora: o surto já estava em queda quando a alavanca foi retirada.']],
  ['D3', 10, 'Via de transmissão', [
    'Como o agente passa de uma pessoa a outra: água, ar, vetor, contato, sangue.',
    'A epidemiologia consegue inferir a via antes de alguém ver o agente. Em março de 1983, dois meses antes da publicação que descreveu o vírus da aids, as autoridades de saúde dos Estados Unidos já recomendavam medidas de prevenção com base no padrão dos casos: transmissão por contato sexual e por sangue.']],
  ['D4', 12, 'Agente isolado', [
    'O microrganismo é encontrado e reconhecido como causa da doença. A partir daqui, a “Doença X” ganha nome.',
    'Em 1909, em Lassance (MG), Carlos Chagas encontrou um protozoário no intestino do barbeiro e, depois, no sangue de uma criança doente. Descreveu o agente, o vetor e a doença, um feito raro na história da medicina.']],
  ['D5', 15, 'Genoma sequenciado', [
    'Com o genoma em mãos, dá para desenvolver testes, acompanhar variantes e reconstruir o caminho do surto.',
    'O vírus da aids levou cerca de quatro anos entre os primeiros casos descritos (1981) e o genoma completo (1985). Em janeiro de 2020, o genoma do SARS-CoV-2 foi divulgado menos de duas semanas depois do alerta à OMS. No Brasil, o genoma do primeiro caso confirmado foi sequenciado em 48 horas.']]
].map(([id, v, nome, txt]) => ({ id, v, nome, txt, tipo: 'achado' }));

const CARTAS = [...DADOS, ...PERIGOS, ...ACHADOS];
const porId = Object.fromEntries(CARTAS.map(c => [c.id, c]));
const carta = id => porId[id];
const ROTULO = { dado: 'Coleta de dados', perigo: 'Perigo', achado: 'Descoberta' };
/* Hífen opcional nas palavras longas, para o nome caber na carta sem cortar no meio da sílaba. */
const HIFENS = { Contaminação: 'Contami\u00ADnação', rastreabilidade: 'rastrea\u00ADbilidade', transmissão: 'transmis\u00ADsão', sequenciado: 'sequen\u00ADciado', Microscopia: 'Micros\u00ADcopia', domiciliar: 'domi\u00ADciliar', Prontuários: 'Prontuá\u00ADrios', Armadilha: 'Arma\u00ADdilha', epidêmica: 'epidê\u00ADmica', Exposição: 'Expo\u00ADsição', exposição: 'expo\u00ADsição' };
const naCarta = nome => esc(nome).replace(/[A-Za-zÀ-ÿ]+/g, w => HIFENS[w] || w);

/* Mapa: contornos reais dos 27 estados, simplificados e projetados para um viewBox de 100 de largura
   (gerados a partir de um GeoJSON aberto). 'c' é o ponto do rótulo de cada estado. */
const MAPA = {"w":100,"h":103.1,"ufs":{"AC":{"d":"M18.3 39.9l-5.1 -2.3l-4 -2.2l-5.9 -1.3l-2.9 -1.4l-0.4 0.7l0.1 0.6l0.6 0.5l-0.1 0.5l0.5 1l0.7 0.3l0.8 1.6l-0.7 0.9l1.3 0l1 0.3l0.4 1.3l2.4 -0.1l1.7 -1.4l-0.1 1l0 3.1l1 0.1l0.7 -0.3l1.3 0l1.3 0.3l0.5 0.3l1.2 -0.5l0.6 -0.8l0.8 0.1l0.3 -0.5l1 -0.4l1.5 -1.2z","c":[9.0,38.5]},"AL":{"d":"M99.1 37.5l-0.9 -0.3l-1.6 0.4l-0.4 0.6l-0.8 0.4l-1.2 -0.2l-1.8 -1.1l-1.2 1.3l0.6 0.5l2.7 1.2l0.1 0.4l1.3 1l1.5 -2.1l1.3 -1.4z","c":[95.3,39.1]},"AM":{"d":"M27.1 8.1l-1.2 0.6l-0.6 0.1l-0.1 0.8l-0.9 0.4l-1.5 1l-0.3 0.4l-1.5 -0.1l-1 0.7l-0.5 -0.1l-1.3 -1.2l-0.6 0.1l-0.1 -1.4l-0.4 -0.4l-0.3 -1l-2 1.4l-4.3 0l0 1.6l1.4 0l0.4 0.6l-0.1 0.7l-2.2 0.1l0 2l1.1 0.9l0 0.7l0.6 0.9l-0.8 4.7l-0.6 3.5l-0.2 0.3l-1.1 -0.6l-0.9 0.2l-0.4 0.5l-2.4 0.4l-0.5 0.5l-2 1.2l-0.3 1.4l-0.6 0.9l0.3 1l-0.3 0.4l-1 0.4l-0.5 1l2.9 1.4l5.9 1.3l4 2.2l5.1 2.3l0.8 -0.5l0.3 -0.5l1 -0.1l0.7 0.4l1.2 -0.8l0.5 0.4l0.4 -1.1l1.9 -0.1l0 -0.6l0.6 -0.4l0.7 -1.4l1.9 -0.2l0.6 0.7l0.7 0.4l0.7 1.1l1.3 0l3 0l4.9 0l0.5 -1.9l-0.2 -0.6l0.6 -1.3l-0.7 -1.2l0 -0.8l0.4 -0.4l1.8 -4.1l1.4 -2.9l1.6 -3.6l-1.7 -1.4l-2.4 -1.5l-1.1 -0.8l-1.2 -1.9l0 -1.6l-2.9 0l-1 2.1l0.3 0.5l-0.6 0.4l-1.4 -0.9l-1 0.4l-0.3 0.6l0 1.5l-0.8 -0.2l-0.3 -0.7l-0.7 -0.5l-0.2 -0.6l0.5 -1l-0.6 -1.1l-0.3 -1.1l0.2 -1.3l-0.4 -1.1l-0.5 -0.5l0.2 -0.9z","c":[23.7,25.0]},"AP":{"d":"M61 12.1l0.3 -0.8l0.1 -1.9l-0.8 -0.2l-0.6 -1.1l-0.5 0.1l-0.7 -1.7l-0.4 -1.5l0 -1.4l-0.4 -0.7l-0.8 -0.7l-0.2 1.1l-0.7 0.6l-1.1 1.9l-0.8 1.8l-0.8 0.6l-1 -0.4l-1.2 0l-0.9 0.4l-0.6 -0.1l-1.1 -0.6l0.2 0.6l0.1 1.1l1.1 0.1l0.8 0.6l1.2 0.5l0.3 1.1l0.7 0.6l-0.1 0.8l0.5 1l1.1 1.5l0.1 0.8l0.4 0.7l1.4 0.1l0.3 -1l1.2 -1.8l1.6 -1l0.4 -0.9z","c":[56.2,10.1]},"BA":{"d":"M91.2 38.6l-0.7 -1l-0.7 -0.4l-1.1 -0.3l-0.4 -0.4l-1.5 1.3l-0.8 0.1l-0.2 0.8l-0.7 0.3l-0.7 -1.7l-1.1 -0.4l-1.3 1.5l-1 0.1l-1.5 0.9l-0.4 -0.6l-0.7 0l-0.5 -0.4l-1 0.8l0.5 1.1l-1.1 1.6l-1.3 0.1l-0.9 0.8l-0.8 -0.3l-0.4 -0.5l0 -0.7l-0.8 -0.5l-0.1 0.5l-1.1 0.8l-0.2 0.7l-0.9 1l0.8 0.6l-0.1 2l0.3 0.4l-0.1 1l0.4 0.3l-0.5 0.8l0.3 0.4l-0.1 1.9l0.7 0.5l-0.2 1.5l0 0.7l0.7 0l3.1 -2.1l0.8 -0.2l1.2 0.2l-0.3 0.8l1 0.4l0.5 -0.3l0.9 0.1l1.8 1.1l1.1 -0.1l1.2 1.1l0 0.6l1.6 -0.2l0.4 0.4l0.9 0.1l0.9 0.7l-0.3 0.6l-0.8 0.6l-0.7 1.1l-0.1 1.1l1 0.9l0 0.7l1.4 0.9l0.4 -0.9l0.6 -0.3l0.1 -1.9l0.5 -2.4l0.4 -1.1l-0.1 -0.3l-0.4 -2.9l0.5 -2.7l-0.1 -1l1.4 -0.7l0.9 -1l1 -1.6l0.7 -1.4l-0.9 0.3l-0.7 -0.5l0 -0.5l-0.7 -0.7l1.1 -0.6l0.2 -1l-0.2 -0.8l-0.5 -0.6l0 -0.7z","c":[82.4,46.9]},"CE":{"d":"M86.7 21.4l-1.1 0l-2.2 0.2l0.1 0.5l-0.4 0.7l0.2 0.9l0.6 0.9l-0.4 2.2l0.9 0.8l-0.1 1.3l0.6 2.7l0.6 0.1l0.1 0.8l-0.3 1l0.8 0.1l1.5 -0.4l1.5 1.4l0.9 -0.5l0.5 -0.9l-0.6 -1l0.5 -1.5l0.3 -0.7l0.8 -0.5l1.2 -2.5l1 -0.3l-0.8 -0.5l-1.4 -1.3l-0.9 -1.2l-0.5 -0.1l-1.5 -1.2z","c":[87.7,27.4]},"ES":{"d":"M84.9 69l0.6 -0.5l0.7 -1.1l0.2 -0.8l0.8 -0.8l0.3 -0.8l-0.1 -1.3l0.2 -1.3l-1.4 -0.9l-0.8 -0.3l-0.6 0.6l-0.8 0.2l-0.3 0.7l0.7 0.9l-0.3 0.5l0.3 0.9l-0.7 0.9l-0.6 1.4l-0.9 0l-0.2 1.5l0.3 0.9l2 0.5z","c":[85.0,65.7]},"GO":{"d":"M71.1 48.1l-1.6 0.1l-1.7 0.8l-1.9 0.1l-0.8 -0.4l-1 -0.9l-0.7 -0.1l-0.6 1.3l-2.4 -1.2l-0.5 0.1l-0.3 1.2l-0.6 1.1l0.1 0.9l-0.7 2.1l-1.4 0.9l-0.1 0.8l-0.5 0.9l-0.9 0.1l-0.3 0.5l-0.8 0.6l0.1 0.7l-1 0.8l-0.5 1.2l-0.1 0.8l0.5 1.1l-0.1 0.7l0.7 1l0.9 0l2.1 1.2l1.5 0.5l0.3 0.4l1.6 -2l0.7 -0.3l1.6 0.1l1.2 -0.9l1.7 0.1l0.8 0.4l1.7 -1.1l0.1 -1.2l-0.7 -0.6l1 -1l-0.3 -0.9l-0.5 -0.4l0.4 -1.3l-2.5 0l0.2 -1.4l2 0l0.3 1.4l1.2 -0.4l-0.3 -0.9l0.4 -1.4l1.9 -0.4l0.2 -1.5l-0.7 -0.5l0.1 -1.9l-0.3 -0.4z","c":[62.2,56.3]},"MA":{"d":"M68.8 37.7l0.7 1l0.5 0.3l0.6 1.8l0.9 0.2l0.4 -2.2l-0.5 -1.3l0.7 -1.1l0.7 -2.1l0.3 -0.3l1.7 -0.5l0.9 -0.8l0.9 -1l0.8 0l0.5 0.3l1.2 -0.2l0.3 -1.3l-0.5 -0.4l0 -1.4l0.6 -0.6l-0.3 -1.6l0.2 -0.5l-0.3 -0.9l0.7 -0.8l0.5 -1.2l0.8 -0.1l1 -1.2l0 -0.6l-1.9 -0.2l-0.5 -0.3l-1.1 -0.5l-0.8 0l-0.3 -0.4l-0.8 0.8l-1 -0.1l-0.2 -0.7l-0.4 -1l-0.1 0l-0.1 -0.2l-0.3 0.1l0 -0.2l-0.1 0.1l0.1 -0.1l-0.1 -0.1l0.2 -0.3l-0.6 -0.2l-0.3 -0.1l0 0.1l0 -0.1l-0.1 0.1l0 -0.1l0 -0.1l0 -0.2l0 0.1l0 0.1l-0.1 0.1l-0.1 0.1l-0.5 0.5l0 -0.1l0.1 -0.4l0.1 -0.2l-0.1 -0.2l-0.2 0.3l-0.2 0.2l-0.1 -0.3l-0.1 -0.3l0.1 0l-0.5 0.1l0 -0.3l-0.1 0.1l-0.1 -0.1l-0.1 0.1l-0.6 -0.2l-0.5 2.5l-0.4 1l-0.6 0.5l0 0.8l-0.9 1.4l-0.2 0.8l-0.6 0.5l-0.6 1.3l-0.6 0.2l-2.4 2l0.6 -0.5l1.6 0.2l0.8 0.6l0.5 2.1l-0.5 2l0.2 1.2l1.2 1.5l1.1 -0.4l0.1 1.1l-0.6 0.2z","c":[73.3,27.3]},"MG":{"d":"M86.2 61.5l0 -0.7l-1 -0.9l0.1 -1.1l0.7 -1.1l0.8 -0.6l0.3 -0.6l-0.9 -0.7l-0.9 -0.1l-0.4 -0.4l-1.6 0.2l0 -0.6l-1.2 -1.1l-1.1 0.1l-1.8 -1.1l-0.9 -0.1l-0.5 0.3l-1 -0.4l0.3 -0.8l-1.2 -0.2l-0.8 0.2l-3.1 2.1l-0.7 0l0 -0.7l-1.9 0.4l-0.4 1.4l0.3 0.9l-1.2 0.4l-0.4 1.3l0.5 0.4l0.3 0.9l-1 1l0.7 0.6l-0.1 1.2l-1.7 1.1l-0.8 -0.4l-1.7 -0.1l-1.2 0.9l-1.6 -0.1l-0.7 0.3l-1.6 2l-0.3 0.7l0.1 0.9l1.4 -0.8l1.5 0.4l1.5 0.1l0.1 0.8l2.4 -0.4l1.1 0l1.1 -0.4l0.6 0.7l-0.2 0.6l0.5 0.5l-0.4 0.6l0.9 1.4l1 0.1l-0.5 1.1l0 1.2l0.7 0.5l0.2 1.1l1.5 -0.2l2.4 -1.2l2.7 -0.8l1.1 -0.2l0.7 0.2l2 -1l0.4 -2l0.7 -0.5l0.2 -1.5l0.9 0l0.6 -1.4l0.7 -0.9l-0.3 -0.9l0.3 -0.5l-0.7 -0.9l0.3 -0.7l0.8 -0.2l0.6 -0.6z","c":[74.8,62.7]},"MS":{"d":"M51.3 61.3l0.4 -0.7l-0.1 -1.1l-0.8 1l-0.7 0.1l-0.4 -0.5l-1.6 0.5l-2.3 -1.2l-1 0.3l-0.9 0l-0.9 1.2l-0.9 0.2l-0.7 -0.8l0.5 1.8l-0.6 2.1l-0.9 2l0.7 0.5l-0.6 0.4l0.2 1.3l0.4 0.4l0.1 1.5l-0.4 0.5l-0.1 1.4l1.8 0.5l1.6 0l0.8 -0.4l0.4 0.5l1 0l0.5 0.9l-0.1 0.7l0.4 2l0.5 0.9l1 0l0.7 -0.4l0.9 0.6l0.5 -0.2l0.3 -1.4l0.6 -0.2l0.4 -1.1l1.3 -0.9l1.5 -1.1l1.5 -2l0.1 -0.8l0.6 -0.5l0 -0.5l0.7 -1.1l0.9 -0.7l-0.1 -0.9l0.3 -0.7l-0.3 -0.4l-1.5 -0.5l-2.1 -1.2l-0.9 0l-0.7 -1l0.1 -0.7l-1.1 0z","c":[48.8,67.7]},"MT":{"d":"M34.7 49.1l0 0.4l-0.8 0.6l0.6 0.3l0 1.4l0.5 0.8l0.1 1.2l-0.9 0.1l0.9 0.9l0.1 2.1l4.5 0.2l-0.1 0.8l0.2 1.4l0.9 0.9l0.7 0.1l0.7 0.8l0.9 -0.2l0.9 -1.2l0.9 0l1 -0.3l2.3 1.2l1.6 -0.5l0.4 0.5l0.7 -0.1l0.8 -1l0.1 1.1l-0.4 0.7l1 0.3l1.1 0l-0.5 -1.1l0.1 -0.8l0.5 -1.2l1 -0.8l-0.1 -0.7l0.8 -0.6l0.3 -0.5l0.9 -0.1l0.5 -0.9l0.1 -0.8l1.4 -0.9l0.7 -2.1l-0.1 -0.9l0.6 -1.1l0.3 -1.2l-0.5 -0.6l0.1 -2.8l-0.2 -0.3l0.3 -1l0.1 -1.1l0.9 -2.2l-2.7 -0.1l-5.9 -0.5l-3.6 -0.2l-4.2 -0.4l-0.9 -0.4l-0.5 -0.8l-1 -0.4l-0.1 -1.5l-0.5 -0.6l-0.2 -0.8l-0.6 -0.8l-0.6 1.3l0.2 0.6l-0.5 1.9l-4.9 0l-3 0l0.3 0.3l-0.4 1.1l0.4 0.8l-0.3 1.4l0.3 0.7l-0.1 1.4l2.7 0.1l1.1 0.3l0.3 0.8l-0.5 0.4l0.8 2.1l-0.6 0.5l-0.1 0.9z","c":[46.1,48.2]},"PA":{"d":"M69 15.9l-1 -0.4l-1.7 0.2l-1.2 -0.4l0.2 -0.7l-1.3 -0.1l-1.5 -0.8l-0.5 -0.7l-1 0l0 -0.9l-0.9 0.2l-0.4 0.9l-1.6 1l-1.2 1.8l-0.3 1l-1.4 -0.1l-0.4 -0.7l-0.1 -0.8l-1.1 -1.5l-0.5 -1l0.1 -0.8l-0.7 -0.6l-0.3 -1.1l-1.2 -0.5l-0.8 -0.6l-1.1 -0.1l-0.1 -1.1l-0.2 -0.6l-0.4 -0.4l-1.9 0.5l-0.8 0.4l0.2 1.1l-1.2 -0.3l-0.9 0.2l-0.7 -0.4l-0.9 0.3l-0.2 0.5l-2 0.4l-0.5 0.8l-1 0.1l0 2.5l0 1.6l1.2 1.9l1.1 0.8l2.4 1.5l1.7 1.4l-1.6 3.6l-1.4 2.9l-1.8 4.1l-0.4 0.4l0 0.8l0.7 1.2l0.6 0.8l0.2 0.8l0.5 0.6l0.1 1.5l1 0.4l0.5 0.8l0.9 0.4l4.2 0.4l3.6 0.2l5.9 0.5l2.7 0.1l0.5 -1.4l1.1 -1.2l0.8 -1.2l0.3 -1.6l-0.5 -0.7l0.5 -0.8l-0.1 -0.8l1.4 -0.7l0.1 -0.5l0.9 -1l0 -0.7l0.3 -0.6l-0.6 -0.5l-0.9 -0.1l2.4 -2l0.6 -0.2l0.6 -1.3l0.6 -0.5l0.2 -0.8l0.9 -1.4l0 -0.8l0.6 -0.5l0.4 -1l0.5 -2.5l-0.2 -0.2l-1.1 -0.4z","c":[53.3,24.4]},"PB":{"d":"M99.6 31.1l-2.7 0l-1.2 -0.4l-0.3 1.6l-0.6 -0.6l-1.1 0.2l-0.5 -0.2l0.4 -1.8l-1 0.4l-0.4 0.5l-1 0.3l-0.8 -0.4l-0.5 1.5l0.6 1l-0.5 0.9l1.6 0.5l2.2 -1.5l0.5 0.4l-0.7 1.5l0.8 0.9l0.9 -0.5l0.5 -0.8l1.1 0l0.9 -0.3l1.1 -0.9l1 0.5l0.1 -0.9z","c":[94.8,32.8]},"PE":{"d":"M99.9 33.9l-1 -0.5l-1.1 0.9l-0.9 0.3l-1.1 0l-0.5 0.8l-0.9 0.5l-0.8 -0.9l0.7 -1.5l-0.5 -0.4l-2.2 1.5l-1.6 -0.5l-0.9 0.5l-1.5 -1.4l-1.5 0.4l-0.8 -0.1l-0.4 0.1l0.2 1.8l-1.8 1.5l1.1 0.4l0.7 1.7l0.7 -0.3l0.2 -0.8l0.8 -0.1l1.5 -1.3l0.4 0.4l1.1 0.3l0.7 0.4l0.7 1l1.2 -1.3l1.8 1.1l1.2 0.2l0.8 -0.4l0.4 -0.6l1.6 -0.4l0.9 0.3l0.8 -2.6z","c":[91.7,35.9]},"PI":{"d":"M83.4 21.6l-0.8 0l-0.5 -0.4l0 0.6l-1 1.2l-0.8 0.1l-0.5 1.2l-0.7 0.8l0.3 0.9l-0.2 0.5l0.3 1.6l-0.6 0.6l0 1.4l0.5 0.4l-0.3 1.3l-1.2 0.2l-0.5 -0.3l-0.8 0l-0.9 1l-0.9 0.8l-1.7 0.5l-0.3 0.3l-0.7 2.1l-0.7 1.1l0.5 1.3l-0.4 2.2l0.6 -0.2l0.8 0.5l0 0.7l0.4 0.5l0.8 0.3l0.9 -0.8l1.3 -0.1l1.1 -1.6l-0.5 -1.1l1 -0.8l0.5 0.4l0.7 0l0.4 0.6l1.5 -0.9l1 -0.1l1.3 -1.5l1.8 -1.5l-0.2 -1.8l0.4 -0.1l0.3 -1l-0.1 -0.8l-0.6 -0.1l-0.6 -2.7l0.1 -1.3l-0.9 -0.8l0.4 -2.2l-0.6 -0.9l-0.2 -0.9l0.4 -0.7z","c":[79.1,33.5]},"PR":{"d":"M66 80.8l-0.3 -0.6l-0.9 -0.3l-0.1 -0.8l-1.5 0.1l-0.1 -0.8l-0.7 -1.2l-0.2 -1.5l-0.9 -1.2l-2.1 0l-0.3 -0.3l-1.7 -0.3l-1.4 -0.5l-0.3 0.4l-0.9 -0.2l-1.3 0.1l-1.3 0.9l-0.4 1.1l-0.6 0.2l-0.3 1.4l-0.5 0.2l0.1 0.8l-0.8 2.8l0.4 0.6l0.8 -0.4l0.6 0.4l0.1 0.9l0.5 0.7l1.4 0.4l1.1 -0.1l3.1 0.9l0.6 -0.3l-0.1 -0.7l1.4 -0.4l0.3 -0.4l1.8 0l0.8 0.6l1 -0.7l1.5 0l0.5 -1z","c":[57.0,79.0]},"RJ":{"d":"M75.2 75.5l0.2 -0.9l0.8 0.2l0.7 -0.3l0.7 0.4l1 -0.4l-0.1 -0.2l0.5 0.4l2.4 -0.1l0.5 -0.5l-0.3 -0.4l0.8 -0.8l1.8 -0.9l-0.2 -1.3l0.3 -0.5l-2 -0.5l-0.3 -0.9l-0.7 0.5l-0.4 2l-2 1l-0.7 -0.2l-1.1 0.2l-2.7 0.8l0.5 0.6l0.6 -0.1l0.3 0.7l-1.2 0.3l-0.4 0.7l0.5 0.4z","c":[79.8,72.7]},"RN":{"d":"M99.6 31.1l-0.8 -2.7l-0.6 -0.8l-1.1 -0.4l-1.9 0.2l-1.5 -0.7l-1 0.3l-1.2 2.5l-0.8 0.5l-0.3 0.7l0.8 0.4l1 -0.3l0.4 -0.5l1 -0.4l-0.4 1.8l0.5 0.2l1.1 -0.2l0.6 0.6l0.3 -1.6l1.2 0.4z","c":[95.2,29.4]},"RO":{"d":"M19.2 40l1.4 -0.3l1.6 0.3l0 0.9l-0.4 0.7l0.5 1.3l-0.3 0.5l0.1 0.9l0.6 0.6l0.1 0.7l0.5 0.1l1.1 1.1l1.2 0.2l0.4 -0.2l1 0.6l0.8 0l0.5 0.5l1.2 0.7l0.8 0.1l0.6 0.9l1.5 0l1.5 0.5l0.8 -0.6l0 -0.4l0.8 -1.1l0.1 -0.9l0.6 -0.5l-0.8 -2.1l0.5 -0.4l-0.3 -0.8l-1.1 -0.3l-2.7 -0.1l0.1 -1.4l-0.3 -0.7l0.3 -1.4l-0.4 -0.8l0.4 -1.1l-0.3 -0.3l-1.3 0l-0.7 -1.1l-0.7 -0.4l-0.6 -0.7l-1.9 0.2l-0.7 1.4l-0.6 0.4l0 0.6l-1.9 0.1l-0.4 1.1l-0.5 -0.4l-1.2 0.8l-0.7 -0.4l-1 0.1l-0.3 0.5l-0.8 0.5l0.5 0.2z","c":[28.4,42.8]},"RR":{"d":"M35.9 5.6l0.1 -1.2l0.9 -1l-0.5 -0.5l-0.1 -0.7l-1 -0.2l0.3 -0.5l0 -1l-0.5 -0.5l-0.9 0.2l0 0.6l-1.1 1.2l-0.7 -0.1l-0.7 0.8l-1.5 0.4l-0.6 -0.2l-1 0.4l-0.5 1.1l-1.1 -1l-0.4 0.3l-1.2 -0.2l-0.7 -0.5l-0.7 0.1l0.3 0.8l0.7 0.6l-0.1 1.2l0.6 1l-0.2 0.6l0.7 0.3l0.8 -0.1l0.3 0.6l1.6 0.7l-0.2 0.9l0.5 0.5l0.4 1.1l-0.2 1.3l0.3 1.1l0.6 1.1l-0.5 1l0.2 0.6l0.7 0.5l0.3 0.7l0.8 0.2l0 -1.5l0.3 -0.6l1 -0.4l1.4 0.9l0.6 -0.4l-0.3 -0.5l1 -2.1l2.9 0l0 -2.5l-1 -0.5l-1.2 -1.2l0.1 -1l-0.5 -0.3l-0.2 -0.9z","c":[32.1,8.4]},"RS":{"d":"M56 97.4l0.3 -0.7l0.7 -0.1l0.4 -1l0.5 -0.4l0.4 -0.7l-0.1 -0.6l0.2 0l0.1 0.3l1.3 -0.3l-0.5 1.5l-0.9 0.7l-0.4 1l-0.5 0.2l-0.9 0.7l0.8 -0.2l1.8 -1.6l1.2 -1.8l0.5 -1.2l1 -1.8l-0.9 -0.2l0.3 -0.3l0 -0.1l0.1 -0.9l0.5 -0.6l-2.2 -0.3l-0.9 -1.1l-1.4 -1.1l-1.1 -0.2l-0.7 -0.4l-3.1 -0.5l-1.1 0l-1.5 0.6l-1.3 1l-0.7 0.3l-1.4 0.9l-0.3 0.7l-1.1 0.9l-0.3 0.7l-1.7 1.8l-0.6 0.3l-0.6 1l0.9 0.1l1 -0.5l2 1.8l0.4 0.7l0.7 -0.6l0.7 0.8l1.2 0.8l0.7 0.1l1.3 1.2l0.8 0.4l0.3 0.8l1.2 0.7l1 -0.5l0.5 0.2l-0.4 0.9l-0.7 -0.2l-1.2 1.2l0.3 1.3l1.4 -1.2l0.8 -1l0.5 -1.4l0.5 -0.6l-0.3 -1.1z","c":[52.7,92.4]},"SC":{"d":"M51.7 84.1l0.1 0.9l-0.4 0.7l1.1 0l3.1 0.5l0.7 0.4l1.1 0.2l1.4 1.1l0.9 1.1l2.2 0.3l-0.5 0.6l-0.1 0.9l0 0.1l-0.3 0.3l0.9 0.2l1.4 -1.4l0.9 -0.5l0.6 -1.9l0 -2.3l-0.3 -0.9l0.5 -1.1l-0.2 -0.7l-1.5 0l-1 0.7l-0.8 -0.6l-1.8 0l-0.3 0.4l-1.4 0.4l0.1 0.7l-0.6 0.3l-3.1 -0.9l-1.1 0.1l-1.4 -0.4z","c":[60.0,85.9]},"SE":{"d":"M95.9 41.7l-1.3 -1l-0.1 -0.4l-2.7 -1.2l0 0.7l0.5 0.6l0.2 0.8l-0.2 1l-1.1 0.6l0.7 0.7l0 0.5l0.7 0.5l0.9 -0.3l1 -1.6z","c":[93.3,41.9]},"SP":{"d":"M71.1 77l1.8 -0.5l1.3 -0.9l0.5 0.1l-0.5 -0.4l0.4 -0.7l1.2 -0.3l-0.3 -0.7l-0.6 0.1l-0.5 -0.6l-2.4 1.2l-1.5 0.2l-0.2 -1.1l-0.7 -0.5l0 -1.2l0.5 -1.1l-1 -0.1l-0.9 -1.4l0.4 -0.6l-0.5 -0.5l0.2 -0.6l-0.6 -0.7l-1.1 0.4l-1.1 0l-2.4 0.4l-0.1 -0.8l-1.5 -0.1l-1.5 -0.4l-1.4 0.8l-0.9 0.7l-0.7 1.1l0 0.5l-0.6 0.5l-0.1 0.8l-1.5 2l-1.5 1.1l1.3 -0.1l0.9 0.2l0.3 -0.4l1.4 0.5l1.7 0.3l0.3 0.3l2.1 0l0.9 1.2l0.2 1.5l0.7 1.2l0.1 0.8l1.5 -0.1l0.1 0.8l0.9 0.3l0.3 0.6l1.3 -1.4l1.6 -1.2z","c":[64.4,72.8]},"TO":{"d":"M68.8 37.7l0.6 -1.6l0.6 -0.2l-0.1 -1.1l-1.1 0.4l-1.2 -1.5l-0.2 -1.2l0.5 -2l-0.5 -2.1l-0.8 -0.6l-1.6 -0.2l-0.6 0.5l0.9 0.1l0.6 0.5l-0.3 0.6l0 0.7l-0.9 1l-0.1 0.5l-1.4 0.7l0.1 0.8l-0.5 0.8l0.5 0.7l-0.3 1.6l-0.8 1.2l-1.1 1.2l-0.5 1.4l-0.9 2.2l-0.1 1.1l-0.3 1l0.2 0.3l-0.1 2.8l0.5 0.6l0.5 -0.1l2.4 1.2l0.6 -1.3l0.7 0.1l1 0.9l0.8 0.4l1.9 -0.1l1.7 -0.8l1.6 -0.1l-0.4 -0.3l0.1 -1l-0.3 -0.4l0.1 -2l-0.8 -0.6l0.9 -1l0.2 -0.7l1.1 -0.8l0.1 -0.5l-0.6 0.2l-0.9 -0.2l-0.6 -1.8l-0.5 -0.3z","c":[65.5,40.8]},"DF":{"d":"M68.1 56.3l-0.3 -1.4l-2 0l-0.2 1.4z","c":[66.8,55.6]}}};
/* Estados pequenos: o rótulo vai para fora do contorno, ligado por um traço. */
const ROTULO_FORA = { RN: [102, 27.6], PB: [103.5, 31.6], PE: [103.5, 35.6], AL: [102, 39.8], SE: [99.6, 43.8], ES: [90.6, 67.2], RJ: [84.2, 77], DF: [71.6, 53] };
const ROTULO_DENTRO = { GO: [60.8, 59.2], PI: [78.4, 33], CE: [87.6, 26.6], SC: [59.4, 85.6], MA: [72.6, 26.6] };
const REGIOES = [
  { id: 'N', nome: 'Norte', ufs: ['RR', 'AP', 'AM', 'PA', 'AC', 'RO', 'TO'] },
  { id: 'NE', nome: 'Nordeste', ufs: ['MA', 'PI', 'CE', 'RN', 'PB', 'PE', 'AL', 'SE', 'BA'] },
  { id: 'CO', nome: 'Centro-Oeste', ufs: ['MT', 'MS', 'GO', 'DF'] },
  { id: 'SE', nome: 'Sudeste', ufs: ['MG', 'ES', 'RJ', 'SP'] },
  { id: 'S', nome: 'Sul', ufs: ['PR', 'SC', 'RS'] }
];
const regiao = id => REGIOES.find(r => r.id === id);
const EQUIPES = ['Equipe Snow', 'Equipe Chagas', 'Equipe Nightingale', 'Equipe Cruz', 'Equipe Lutz', 'Equipe Ribas', 'Equipe Semmelweis', 'Equipe Finlay'];
const PREMIO = [5, 3, 1]; // bônus das três equipes com os melhores palpites de risco
const BOTS = {
  cautela: ['Equipe Cautela', 'volta cedo, ao primeiro sinal de risco'],
  ousadia: ['Equipe Ousadia', 'só volta quando o risco é alto'],
  esperado: ['Equipe Valor Esperado', 'compara o ganho provável com o que pode perder']
};

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const calmo = matchMedia('(prefers-reduced-motion: reduce)').matches;
const T = ms => (calmo ? 1 : ms);
const espera = ms => new Promise(r => setTimeout(r, T(ms)));
const esc = s => String(s).replace(/[&<>"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
const nf = (x, d = 1) => x.toLocaleString('pt-BR', { maximumFractionDigits: d });
const pct = x => nf(x * 100) + '%';
const pl = (n, um, varios) => n + ' ' + (n === 1 ? um : varios);
function acaso(n) { const b = new Uint32Array(1); crypto.getRandomValues(b); return b[0] % n; }
function embaralhar(lista) {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) { const j = acaso(i + 1); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
const um = lista => lista[acaso(lista.length)];
const cofre = {
  ler(k) { try { return JSON.parse(localStorage.getItem('protocolo-zero:' + k)); } catch (_) { return null; } },
  gravar(k, v) { try { localStorage.setItem('protocolo-zero:' + k, JSON.stringify(v)); } catch (_) { /* sem armazenamento */ } }
};

/* ---------- gerador de nomes do agente e da doença ----------
   Gênero = sílaba inicial + sílaba do meio + sufixo do tipo de agente. Epíteto = raiz + terminação latina descritiva.
   Travas: nada de lugar, pessoa ou animal (recomendação da OMS, 2015), e uma lista de bloqueio para radicais que
   lembram gêneros reais, nomes próprios ou palavras indesejadas. A lista é inicial: acrescente o que aparecer. */
const SIL_A = ['Ta', 'Ze', 'Mi', 'Vo', 'Ka', 'Lu', 'Bre', 'Do', 'Ne', 'Sa', 'Gri', 'Pe'];
const SIL_B = ['vu', 'lu', 'ra', 'ri', 'mo', 'ne', 'bi', 'do', 'xa', 'pe', 'tu', 'ga'];
const AGENTES = {
  bacteria: { nome: 'bactéria', letra: 'B', suf: [['rella', 'relose'], ['bacter', 'bacteriose'], ['coccus', 'cocose'], ['spira', 'spirose'], ['bacillus', 'bacilose'], ['vibrio', 'vibriose']] },
  virus: { nome: 'vírus', letra: 'V', suf: [['virus', 'virose'], ['navirus', 'navirose'], ['rivirus', 'rivirose'], ['tovirus', 'tovirose'], ['lavirus', 'lavirose'], ['movirus', 'movirose']] },
  protozoario: { nome: 'protozoário', letra: 'P', suf: [['plasma', 'plasmose'], ['soma', 'somíase'], ['monas', 'moníase'], ['ridium', 'ridiose'], ['mania', 'maniose'], ['cystis', 'cistose']] },
  fungo: { nome: 'fungo', letra: 'F', suf: [['myces', 'micose'], ['sporium', 'sporiose'], ['phyton', 'fitose'], ['thrix', 'tricose'], ['gillus', 'gilose'], ['cladium', 'cladiose']] }
};
const EP_R = ['mir', 'pard', 'dorv', 'brun', 'calv', 'tern', 'vald', 'sorb', 'lind', 'garv', 'fosc', 'nimb'];
const EP_T = ['ans', 'alis', 'oides', 'ifer', 'ens'];
const QUADROS = ['síndrome febril aguda', 'síndrome respiratória aguda', 'síndrome diarreica aguda', 'síndrome febril exantemática', 'síndrome neurológica aguda'];
const BLOQUEIO = ['tatu', 'sabi', 'pega', 'pedo', 'mimo', 'sara', 'dora', 'kaga', 'nega', 'tara', 'sado', 'brega', 'gripe', 'dope', 'lulu', 'lupe', 'dodo', 'nemo', 'nene', 'peri', 'pene', 'pepe'];
const RADICAIS = SIL_A.flatMap(a => SIL_B.map(b => a + b)).filter(r => !BLOQUEIO.includes(r.toLowerCase()));
const COMBOS_BRUTO = SIL_A.length * SIL_B.length * 6 * EP_R.length * EP_T.length * 4;
const COMBOS = RADICAIS.length * 6 * EP_R.length * EP_T.length * 4;
function gerarAgente() {
  const tipo = um(Object.keys(AGENTES)), A = AGENTES[tipo];
  const rad = um(RADICAIS), [suf, mal] = um(A.suf);
  const genero = rad + suf;
  const ano = String(new Date().getFullYear()).slice(-2);
  return {
    tipo: A.nome, genero, especie: genero + ' ' + um(EP_R) + um(EP_T),
    doenca: rad.toLowerCase() + mal,
    sigla: rad.slice(0, 3).toUpperCase() + A.letra + '-' + ano,
    quadro: um(QUADROS)
  };
}
const nomeDoenca = () => (G && G.nomeRevelado ? G.agente.doenca.charAt(0).toUpperCase() + G.agente.doenca.slice(1) : 'Doença X');

/* ---------- partida ---------- */
let G = null;
const HIST = [];
let ocupado = false;
let telaAtual = 'capa';

function salvar() { HIST.push(JSON.stringify(G)); if (HIST.length > 80) HIST.shift(); }
/* A partida fica gravada neste aparelho a cada jogada: se a aba fechar ou a página recarregar, dá para continuar. */
function gravarPartida() { if (G) cofre.gravar('partida', { G, hist: HIST.slice(-12) }); }
let pendente = null;
function comecar(fn) {
  if (!G || G.fase === 'fim') return fn();
  pendente = fn;
  $('#trocar-info').textContent = `${G.modo === 'solo' ? 'Há uma partida solo' : 'Há uma partida com ' + G.equipes.length + ' equipes'} na expedição ${G.exp + 1} de 5. Ela está salva neste aparelho e será apagada se você começar outra.`;
  $('#trocar').showModal();
}
const emCampo = () => G.equipes.filter(e => e.st === 'campo');
function fatais() { let f = 0; for (const id of G.baralho) if (id[0] === 'P' && G.vistos[id]) f++; return f; }
const riscoReal = () => (G.baralho.length ? fatais() / G.baralho.length : 0);
function ganhoEsperado(n = emCampo().length) {
  if (!G.baralho.length || !n) return 0;
  let s = 0;
  for (const id of G.baralho) if (id[0] === 'C') s += Math.floor(carta(id).v / n);
  return s / G.baralho.length;
}
const passoAtual = () => { const p = G.reg[G.exp].passos; return p[p.length - 1]; };

function novaPartida(cfg) {
  G = {
    v: 3, modo: cfg.modo,
    equipes: cfg.nomes.map((nome, i) => ({ nome, bot: (cfg.bots || [])[i] || null, gar: 0, risco: 0, st: 'campo', achados: [], sozinha: 0 })),
    regioes: embaralhar(REGIOES.map(r => r.id)), agente: gerarAgente(), nomeRevelado: false,
    exp: 0, pool: { P1: 3, P2: 3, P3: 3, P4: 3, P5: 3 }, achPool: [], baralho: [], trilha: [], vistos: {}, sobras: 0,
    fase: 'briefing', sub: null, marc: [], reg: [], msg: '', conta: null, fim: null, verPlacar: !cfg.ocultar,
    opc: { palpites: !!cfg.palpites, vencer: !!cfg.vencer, bonus: !!cfg.bonus && !!cfg.palpites }
  };
  HIST.length = 0;
  prepararExp();
}
function prepararExp() {
  G.achPool.push(ACHADOS[G.exp].id);
  const b = DADOS.map(d => d.id);
  for (const p of PERIGOS) for (let i = 0; i < G.pool[p.id]; i++) b.push(p.id);
  b.push(...G.achPool);
  /* A primeira carta nunca é um perigo: ela é sorteada entre coletas e descobertas, e o resto do monte é embaralhado
     normalmente. As cartas saem do fim da lista, então a primeira vai por último. */
  const seguras = b.map((id, i) => (id[0] === 'P' ? -1 : i)).filter(i => i >= 0);
  const primeira = b.splice(um(seguras), 1)[0];
  G.baralho = [...embaralhar(b), primeira];
  G.comp = { perigos: { ...G.pool }, achados: [...G.achPool], total: b.length };
  G.trilha = []; G.vistos = {}; G.sobras = 0; G.marc = [];
  G.equipes.forEach(e => { e.risco = 0; e.st = 'campo'; e.perdido = 0; e.ult = 0; });
  G.fase = 'briefing'; G.sub = null; G.fim = null; G.msg = ''; G.conta = null;
  G.reg[G.exp] = { regiao: G.regioes[G.exp], passos: [], fim: null, pontos: null, sim: null, vencer: null };
}
/* Probabilidade de vencer, estimada a partir do placar real: joga o resto da partida milhares de vezes,
   com todas as equipes seguindo o mesmo comportamento (quanto maior o risco e os pontos provisórios, maior a
   probabilidade de retornar). É uma estimativa, e depende dessa suposição. */
function simular(n = 3000) {
  const k = G.equipes.length, vit = new Array(k).fill(0), base = DADOS.map(d => d.id);
  for (let s = 0; s < n; s++) {
    const gar = G.equipes.map(e => e.gar), pool = { ...G.pool };
    let ach = [...G.achPool];
    for (let e = G.exp + 1; e < 5; e++) {
      ach.push(ACHADOS[e].id);
      const deck = [...base, ...ach];
      for (const p of PERIGOS) for (let i = 0; i < pool[p.id]; i++) deck.push(p.id);
      const seg = []; for (let i = 0; i < deck.length; i++) if (deck[i][0] !== 'P') seg.push(i);
      const prim = deck.splice(seg[Math.floor(Math.random() * seg.length)], 1)[0];   // a primeira carta nunca é um perigo
      for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)), t = deck[i]; deck[i] = deck[j]; deck[j] = t; }
      deck.push(prim);
      const risco = new Array(k).fill(0), dentro = new Array(k).fill(true), vistos = {};
      let nDentro = k, aberto = 0, livres = [], fatal = false;
      while (deck.length && nDentro) {
        const id = deck.pop(), c = porId[id];
        if (c.tipo === 'dado') { const q = Math.floor(c.v / nDentro); for (let i = 0; i < k; i++) if (dentro[i]) risco[i] += q; aberto += c.v - q * nDentro; }
        else if (c.tipo === 'perigo') { vistos[id] = (vistos[id] || 0) + 1; if (vistos[id] === 2) { pool[id]--; fatal = true; break; } }
        else { livres.push(id); ach = ach.filter(x => x !== id); }
        let fat = 0;
        for (const x of deck) if (x[0] === 'P' && vistos[x]) fat++;
        const r = deck.length ? fat / deck.length : 1, sai = [];
        for (let i = 0; i < k; i++) if (dentro[i] && Math.random() < Math.min(0.95, 0.03 + 1.5 * r + (r > 0 ? 0.012 : 0.003) * risco[i])) sai.push(i);
        if (sai.length) {
          const q = Math.floor(aberto / sai.length); aberto -= q * sai.length;
          for (const i of sai) { gar[i] += risco[i] + q; dentro[i] = false; nDentro--; }
          if (sai.length === 1) { for (const a of livres) gar[sai[0]] += porId[a].v; livres = []; }
        }
      }
      if (!fatal) for (let i = 0; i < k; i++) if (dentro[i]) gar[i] += risco[i];
    }
    const max = Math.max(...gar), emp = gar.filter(g => g === max).length;
    for (let i = 0; i < k; i++) if (gar[i] === max) vit[i] += 1 / emp;
  }
  return vit.map(v => v / n);
}
function encerrar(como, id) {
  const r = G.reg[G.exp];
  G.fase = 'fimExp'; G.fim = { como, id: id || null };
  r.fim = { como, id: id || null, cartas: G.trilha.length };
  r.pontos = G.equipes.map(e => e.gar);
  G.trilha.forEach(t => { if (t.livre) { t.livre = false; t.perdida = true; } });
  if (G.exp < 4) r.sim = simular();
  G.sub = null;
}
function revelar() {
  salvar();
  const id = G.baralho.pop(), c = carta(id), campo = emCampo(), n = campo.length;
  const item = { id, n: G.trilha.length + 1 };
  G.conta = null;
  if (c.tipo === 'dado') {
    const q = Math.floor(c.v / n);
    item.cada = q; item.sobra = c.v - q * n;
    campo.forEach(e => { e.risco += q; });
    G.sobras += item.sobra;
    G.conta = { t: 'carta', nome: c.nome, v: c.v, n, q, sobra: item.sobra };
    G.msg = `<p><b>${esc(c.nome)}</b> rendeu ${pl(c.v, 'ponto', 'pontos')}. A divisão está na mesa.</p>`;
  } else if (c.tipo === 'perigo') {
    G.vistos[id] = (G.vistos[id] || 0) + 1;
    if (G.vistos[id] === 2) item.fatal = true; else item.alerta = true;
    const restam = G.baralho.filter(x => x === id).length;
    G.msg = item.fatal
      ? `<p><b>${esc(c.nome)}, pela segunda vez.</b> A expedição acabou: quem estava em campo perdeu os dados provisórios.</p>`
      : `<p><b>Alerta: ${esc(c.nome.toLowerCase())}.</b> Se outra carta deste tipo aparecer, a expedição acaba. ${restam ? `Ainda ${restam === 1 ? 'há 1' : 'há ' + restam} no monte.` : 'Não há outra no monte.'}</p>`;
  } else {
    item.livre = true;
    G.achPool = G.achPool.filter(x => x !== id);
    if (id === 'D4') G.nomeRevelado = true;
    G.msg = `<p><b>Descoberta importante: ${esc(c.nome)} (${c.v} pontos).</b> Fica livre na trilha. Só leva quem retornar sozinho.</p>`;
  }
  G.trilha.push(item);
  if (item.fatal) {
    G.pool[id]--;
    campo.forEach(e => { e.perdido = e.risco; e.risco = 0; e.st = 'perdeu'; });
    encerrar('perigo', id);
  } else {
    G.fase = 'decidir'; G.marc = [];
    const alguemPalpita = G.modo === 'sala' || G.equipes[0].st === 'campo';
    G.sub = G.opc.palpites && item.alerta && G.baralho.length && alguemPalpita ? 'palpite' : 'decisao';
    G.reg[G.exp].passos.push({ n: item.n, risco: riscoReal(), ganho: ganhoEsperado(), emRisco: G.equipes.map(e => (e.st === 'campo' ? e.risco : null)), palpites: null, saiu: [] });
    if (!G.baralho.length) { G.marc = G.equipes.map((e, i) => (e.st === 'campo' ? i : -1)).filter(i => i >= 0); confirmar(true); }
  }
  return item;
}
function confirmar(semSalvar) {
  if (!semSalvar) salvar();
  const sai = [...G.marc].sort((a, b) => a - b);
  passoAtual().saiu = sai;
  if (sai.length) {
    const antes = G.sobras, r0 = G.equipes[sai[0]].risco, q = Math.floor(antes / sai.length);
    G.sobras -= q * sai.length;
    sai.forEach(i => { const e = G.equipes[i]; e.gar += e.risco + q; e.risco = 0; e.st = 'retornou'; });
    const livres = G.trilha.filter(t => t.livre);
    let extra = '';
    if (sai.length === 1) {
      const e = G.equipes[sai[0]]; e.sozinha++;
      livres.forEach(t => { t.livre = false; t.dono = sai[0]; e.achados.push(t.id); e.gar += carta(t.id).v; });
      if (livres.length) extra = ` Voltou sozinha e registrou ${livres.map(t => `<b>${esc(carta(t.id).nome)}</b> (+${carta(t.id).v})`).join(' e ')}.`;
    } else if (livres.length) extra = ' Como voltaram juntas, ninguém levou a descoberta: ela continua livre.';
    G.conta = { t: 'retorno', aberto: antes, k: sai.length, q, resto: G.sobras };
    G.msg = `<p><b>${sai.length === 1 ? 'Retornou' : 'Retornaram'}:</b> ${sai.map(i => esc(G.equipes[i].nome)).join(', ')}. ${sai.length === 1 ? 'Garante' : 'Cada uma garante'} ${r0} ${r0 === 1 ? 'provisório' : 'provisórios'}${q ? ` + ${q} dos dados pendentes = <b>${r0 + q}</b>` : ''}.${extra}</p>`;
  } else G.msg = '<p>Todas as equipes continuam em campo.</p>';
  G.marc = [];
  if (!emCampo().length) encerrar('retorno'); else { G.fase = 'revelar'; G.sub = null; }
}
function proxima() {
  salvar();
  if (G.exp === 4) { G.fase = 'fim'; return; }
  G.exp++; prepararExp();
}
function decideBot(e) {
  const r = riscoReal(), g = ganhoEsperado(), u = Math.random();
  const naTrilha = G.sobras + G.trilha.filter(t => t.livre).reduce((s, t) => s + carta(t.id).v, 0);
  if (e.bot === 'cautela') return r >= 0.08 + u * 0.06 || e.risco >= 11 + u * 6;
  if (e.bot === 'ousadia') return r >= 0.24 + u * 0.1;
  return (r > 0 && r * e.risco > g) || (naTrilha >= 9 && r >= 0.1 && u < 0.45);
}
const botsQueSaem = () => G.equipes.map((e, i) => (e.st === 'campo' && e.bot && decideBot(e) ? i : -1)).filter(i => i >= 0);

/* ---------- cartas ---------- */
const TRACO = 'fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"';
const GLIFOS = {
  P1: '<circle cx="50" cy="56" r="26"/><path d="M38 38l10 14-7 9 12 16"/><circle cx="63" cy="48" r="3" fill="currentColor"/><circle cx="66" cy="64" r="2.5" fill="currentColor"/>',
  P2: '<rect x="30" y="38" width="40" height="36" rx="4" transform="rotate(-8 50 56)"/><path d="M44 53c0-9 13-9 13-1 0 5-7 5-7 11"/><circle cx="50" cy="69" r="1.4" fill="currentColor"/>',
  P3: '<path d="M50 28l24 9v19c0 15-11 24-24 29-13-5-24-14-24-29V37z"/><path d="M35 76l30-36"/>',
  P4: '<rect x="43" y="26" width="13" height="42" rx="6.5"/><circle cx="49.5" cy="74" r="11"/><path d="M49.5 72V44"/><path d="M67 36h8M67 47h8M67 58h8"/>',
  P5: '<path d="M27 32h32a6 6 0 0 1 6 6v14a6 6 0 0 1-6 6H44l-9 8v-8h-8a6 6 0 0 1-6-6V38a6 6 0 0 1 6-6z"/><path d="M52 68h18l8 7v-7a5 5 0 0 0 4-5V50"/>',
  D1: [34, 50, 66].flatMap(x => [38, 54, 70].map(y => `<circle cx="${x}" cy="${y}" r="5"${x === 50 && y === 54 ? ' fill="currentColor"' : ''}/>`)).join(''),
  D2: '<path d="M50 84c-12-16-18-24-18-33a18 18 0 0 1 36 0c0 9-6 17-18 33z"/><circle cx="50" cy="50" r="6" fill="currentColor"/>',
  D3: '<circle cx="30" cy="68" r="8"/><circle cx="50" cy="38" r="8"/><circle cx="72" cy="64" r="8"/><path d="M35 61l10-16M56 44l11 13"/>',
  D4: '<circle cx="50" cy="56" r="27"/><circle cx="50" cy="56" r="19" stroke-width="1.5"/><circle cx="57" cy="50" r="6" fill="currentColor"/>',
  D5: '<path d="M36 26c0 14 28 14 28 28s-28 14-28 28M64 26c0 14-28 14-28 28s28 14 28 28"/><path d="M41 33h18M41 75h18M43 47h14M43 61h14" stroke-width="2.5"/>'
};
function arteProvisoria(c) {
  if (c.tipo !== 'dado') return `<svg viewBox="0 0 100 140" aria-hidden="true"><g ${TRACO}>${GLIFOS[c.id]}</g></svg>`;
  const cols = c.v <= 4 ? 2 : c.v <= 9 ? 3 : c.v <= 12 ? 4 : 5, lin = Math.ceil(c.v / cols), passo = Math.min(15, 62 / cols, 62 / lin);
  let pts = '';
  for (let k = 0; k < c.v; k++) {
    const l = Math.floor(k / cols), naLinha = l === lin - 1 ? c.v - l * cols : cols;
    const x = 50 + ((k % cols) - (naLinha - 1) / 2) * passo, y = 58 + (l - (lin - 1) / 2) * passo;
    pts += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(passo * 0.3).toFixed(1)}" fill="currentColor"/>`;
  }
  return `<svg viewBox="0 0 100 140" aria-hidden="true">${pts}</svg>`;
}
function criarCarta(id, { virada = false, tag = 'button' } = {}) {
  const c = id ? carta(id) : null, e = document.createElement(tag);
  e.className = 'carta' + (c ? ' t-' + c.tipo : '') + (virada ? ' virada' : '');
  if (tag === 'button') e.type = 'button';
  let frente = '';
  if (c) {
    const arte = IMG[c.id] ? `<img src="${esc(IMG[c.id])}" alt="" draggable="false">` : arteProvisoria(c);
    frente = `<span class="face frente${IMG[c.id] ? ' com-arte' : ''}"><span class="arte">${arte}</span><span class="canto">${c.tipo === 'perigo' ? '!' : c.v}</span><span class="cod">${c.id}</span><span class="nome"><small>${ROTULO[c.tipo]}</small>${naCarta(c.nome)}</span></span>`;
    e.dataset.abrir = c.id;
    e.setAttribute('aria-label', `${ROTULO[c.tipo]}: ${c.nome}${c.v ? ', ' + c.v + ' pontos' : ''}`);
  }
  e.innerHTML = `<span class="giro"><span class="face verso"></span>${frente}</span>`;
  return e;
}
function marcarCarta(el, t) {
  const estado = t.fatal ? ['fatal', 'Encerrou'] : t.alerta ? ['alerta', 'Alerta'] : t.livre ? ['livre', 'Livre'] : t.dono != null ? ['levada', 'Registrada'] : t.perdida ? ['perdida', 'Perdida'] : null;
  el.classList.remove('fatal', 'alerta', 'livre', 'levada', 'perdida');
  const velha = $('.marca-c', el); if (velha) velha.remove();
  if (!estado) return;
  el.classList.add(estado[0]);
  const m = document.createElement('span'); m.className = 'marca-c'; m.textContent = estado[1];
  el.append(m);
}
function versoSvg() {
  const aneis = [10, 19, 28, 37].map((r, i) => `<circle cx="50" cy="66" r="${r}" fill="none" stroke="#2bb3a3" stroke-width="1.6" opacity="${0.9 - i * 0.2}"/>`).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 140"><rect width="100" height="140" fill="#0f1b2b"/><rect x="4.5" y="4.5" width="91" height="131" rx="5" fill="none" stroke="#2bb3a3" stroke-width="1.6"/><rect x="8.5" y="8.5" width="83" height="123" rx="3" fill="none" stroke="#2bb3a3" stroke-width=".6" opacity=".6"/>${aneis}<circle cx="46" cy="62" r="13" fill="#0f1b2b" stroke="#efe8d6" stroke-width="3"/><path d="M55.5 71.5L68 84" stroke="#efe8d6" stroke-width="4.5" stroke-linecap="round"/><circle cx="46" cy="62" r="3" fill="#f0603a"/><path d="M14 20h10M14 20v10M86 20H76M86 20v10M14 120h10M14 120v-10M86 120H76M86 120v-10" stroke="#e8b23e" stroke-width="1.6" fill="none"/></svg>`;
  return `url("${IMG.VERSO ? IMG.VERSO : 'data:image/svg+xml,' + encodeURIComponent(svg)}")`;
}
document.documentElement.style.setProperty('--verso', versoSvg());

/* ---------- navegação e diálogos ---------- */
function ir(nome) {
  $$('.tela').forEach(t => { t.hidden = t.id !== 'tela-' + nome; });
  telaAtual = nome;
  if (nome === 'capa') {
    const c = $('#continuar');
    c.hidden = !G;
    if (G) { c.dataset.ir = G.fase === 'fim' ? 'fim' : 'jogo'; c.textContent = G.fase === 'fim' ? 'Ver o último relatório' : `Continuar a partida · expedição ${G.exp + 1} de 5`; }
  }
  if (nome === 'jogo') pintar(true);
  if (nome === 'fim') pintarFim();
  if (nome === 'baralho') pintarGaleria();
  if (nome === 'equipe') pintarFichaEquipe();
  // o endereço com #equipe abre direto na ficha (é o que o QR code da ficha usa)
  try { history.replaceState(null, '', nome === 'equipe' ? '#equipe' : location.pathname + location.search); } catch (_) { /* sem acesso ao histórico */ }
  const t = $('#tela-' + nome); if (t) t.scrollTop = 0;
}
function abrirFicha(id) {
  const c = carta(id);
  let extra = '';
  if (c.tipo === 'dado') extra = `<p>Vale <b>${pl(c.v, 'ponto', 'pontos')}</b>, divididos igualmente entre as equipes que estão em campo. O que sobra da divisão fica pendente, para quem retornar.</p>`;
  if (c.tipo === 'perigo') extra = '<p>Há três cartas de cada perigo no baralho. A primeira é só um alerta. A segunda do mesmo tipo encerra a expedição, e quem está em campo perde os dados provisórios. Depois disso, uma carta desse perigo sai do jogo.</p>';
  if (c.tipo === 'achado') {
    extra = `<p>Vale <b>${c.v} pontos</b> para a equipe que retornar sozinha enquanto a carta estiver na trilha. Se ninguém levar até o fim da expedição, ela sai do jogo.</p>`;
    if (id === 'D4' && G && G.nomeRevelado) extra += `<p>Nesta partida, o agente é <i class="sp">${esc(G.agente.especie)}</i> (${G.agente.tipo}), e a doença passou a se chamar <b>${esc(G.agente.doenca)}</b>.</p>`;
  }
  const txt = (Array.isArray(c.txt) ? c.txt : [c.txt]).map(p => `<p>${p}</p>`).join('');
  $('#ficha-corpo').innerHTML = `<div class="ficha-carta"></div><div class="ficha-texto"><p class="chapa">${ROTULO[c.tipo]} · ${c.id}</p><h3>${esc(c.nome)}</h3>${txt}${extra}<p class="arte-nota">${IMG[c.id] ? 'Arte' : 'Arte provisória. A imagem definitiva entra com o código'} ${c.id}.</p></div>`;
  $('.ficha-carta').append(criarCarta(id, { virada: true, tag: 'span' }));
  const d = $('#ficha'); if (!d.open) d.showModal(); d.scrollTop = 0;
}

const REGRAS = [
  ['jogo', 'Como se joga', () => `
    <p>São cinco expedições, uma em cada região do Brasil, em ordem sorteada. Em cada uma, as equipes entram juntas em campo e as cartas são reveladas uma a uma.</p>
    <ol>
      <li><b>Revelar.</b> O Centro de Comando vira a próxima carta do monte.</li>
      <li><b>Decidir.</b> Todas as equipes em campo escolhem ao mesmo tempo: <b>continuar</b> ou <b>retornar</b>.</li>
      <li><b>Quem retorna</b> transforma os dados provisórios em pontos garantidos e divide os dados pendentes. Não joga mais até a próxima expedição.</li>
      <li><b>Quem continua</b> pode juntar mais dados provisórios, mas perde todos se um perigo encerrar a expedição.</li>
    </ol>
    <p>A primeira carta de cada expedição nunca é um perigo, para que toda equipe já tenha algo em jogo na primeira decisão. Daí em diante, a ordem das cartas é aleatória.</p>
    <p>A expedição termina quando um perigo aparece pela segunda vez ou quando todas as equipes retornaram. Vence quem tiver mais pontos garantidos ao fim das cinco, somado o bônus de palpites quando ele está ligado.</p>
    <p class="caixa"><b>Retornar sozinho compensa.</b> A equipe que volta sozinha fica com todos os dados pendentes e registra as descobertas importantes que estiverem livres. Se duas ou mais voltam juntas, dividem os dados pendentes e ninguém leva a descoberta.</p>`],
  ['cartas', 'As cartas', () => `
    <p>O baralho de cada expedição tem:</p>
    <ul>
      <li><b>15 coletas de dados</b>, que valem 1, 2, 3, 4, 5, 5, 7, 7, 9, 11, 11, 13, 14, 15 e 17 pontos. Os pontos são divididos entre as equipes em campo; o resto da divisão fica pendente, para quem retornar.</li>
      <li><b>15 perigos</b>, três de cada tipo: contaminação de amostra, perda de rastreabilidade, exposição da equipe, falha na cadeia de frio e onda de boatos. Quando um perigo encerra uma expedição, uma carta dele sai do jogo.</li>
      <li><b>Descobertas importantes</b>, que entram uma por expedição, na ordem de uma investigação: Paciente 0 (5), Fonte da exposição (7), Via de transmissão (10), Agente isolado (12) e Genoma sequenciado (15). Uma descoberta que não saiu do monte continua no baralho da expedição seguinte.</li>
    </ul>
    <p>Toque em qualquer carta revelada para ler a explicação. <button class="elo" type="button" data-ir="baralho">Ver as 35 cartas</button></p>`],
  ['conta', 'A conta da probabilidade', () => `
    <p>O risco de a próxima carta encerrar a expedição é uma contagem:</p>
    <p class="caixa"><code>risco = cartas fatais no monte ÷ cartas no monte</code><br>Carta fatal é a de um perigo que já apareceu uma vez nesta expedição.</p>
    <p>A regra de a primeira carta não ser um perigo não muda essa conta: depois que a primeira carta é revelada, o resto do monte está em ordem aleatória.</p>
    <p><b>Exemplo.</b> Primeira expedição, 31 cartas. Quatro foram reveladas, e entre elas apareceram dois perigos diferentes. Restam 27 cartas no monte, e 4 delas são fatais (duas de cada perigo já visto): 4 ÷ 27 = 14,8%.</p>
    <p>O baralho não tem reposição: cada carta revelada muda a composição do monte e, com ela, a probabilidade. A mesa mostra o que é preciso para contar: quantas cartas há no monte e quantas de cada perigo já saíram.</p>
    <p>O <b>ganho esperado</b> da próxima carta, para cada equipe em campo, é a soma do que cada carta do monte renderia para a equipe, dividida pelo número de cartas do monte.</p>`],
  ['percebido', 'Risco e benefício: percebido × real', () => `
    <p>O app calcula o risco real a cada carta e o mantém escondido. Nas <b>pausas de palpite</b>, que acontecem sempre que surge um perigo novo, todas as equipes estimam a probabilidade de a próxima carta encerrar a expedição, inclusive as que já retornaram. A conta só é revelada no relatório final, para as equipes não ajustarem os palpites seguintes pelo resultado dos anteriores.</p>
    <p>Ao fim de cada expedição, cada equipe também diz qual é a sua <b>probabilidade de vencer</b> a partida. Com o placar oculto, cada uma conhece só os próprios pontos. O relatório final compara as respostas com uma estimativa calculada a partir do placar real, e mostra quanto somam as probabilidades declaradas (deveriam somar 100%).</p>
    <p>O relatório final mostra o risco real de cada carta, os palpites de cada equipe contra esse valor, e quantas vezes cada equipe continuou em campo quando o valor esperado era negativo.</p>
    <p>O <b>ranking de palpites</b> ordena as equipes pelo erro absoluto médio, que é a distância média entre o palpite e o risco real. Com o bônus ligado, as três mais precisas ganham 5, 3 e 1 ponto no placar final. Só entra no ranking quem respondeu a pelo menos metade das pausas.</p>
    <p class="caixa"><b>Regra de bolso.</b> Continuar compensa quando <code>ganho esperado &gt; risco × dados provisórios</code>.</p>
    <p class="fonte">Limites: o risco da próxima carta é exato. O benefício só em parte, porque os dados pendentes e as descobertas dependem de quantas equipes retornam juntas. A probabilidade de vencer é uma estimativa por simulação, que supõe que todas as equipes joguem do mesmo jeito.</p>`],
  ['sala', 'Na sala de aula', () => `
    <p>Projete a tela e divida a turma em 3 a 8 equipes. Você é o Centro de Comando: revela as cartas e marca quem retorna.</p>
    <ul>
      <li><b>Decisão simultânea.</b> Cada equipe recebe dois cartões, um de CONTINUAR e um de RETORNAR. A equipe escolhe em segredo e segura o cartão virado para baixo. Use o botão “Contar 3, 2, 1” e peça que todas levantem ao mesmo tempo. Se as equipes anunciam uma de cada vez, a última leva vantagem.</li>
      <li><b>Palpites.</b> Nas pausas, pergunte a cada equipe e digite os valores. Peça que anotem o palpite na ficha de campo antes de responder, para ninguém se guiar pela resposta dos outros. A tecla Tab passa de uma equipe para a outra.</li>
      <li><b>Placar oculto.</b> A mesa mostra a divisão de cada carta, os dados provisórios e os dados pendentes, mas não o total de cada equipe. Cada equipe anota o seu. O botão “Mostrar placar” revela os totais quando você quiser.</li>
      <li><b>Sem impressão.</b> O botão “QR da ficha” mostra um QR code para as equipes abrirem, no celular ou tablet, a ficha de campo digital e os cartões de CONTINUAR e RETORNAR em tela cheia. A ficha fica só no aparelho da equipe; nada é enviado a você.</li>
      <li><b>Errou o toque?</b> “Desfazer” volta uma ação.</li>
      ${PWA ? '<li><b>Material impresso.</b> O <a href="kit/Protocolo-Zero-kit-de-sala.pdf" target="_blank" rel="noopener">kit de sala (PDF)</a> traz os cartões de CONTINUAR e RETORNAR, no tamanho de carta padrão, e a ficha de campo das equipes.</li>' : ''}
      <li><b>Fechou a aba sem querer?</b> A partida fica salva neste aparelho a cada jogada. Ao reabrir, use “Continuar a partida” na tela inicial.</li>
    </ul>
    <p>Roteiro sugerido: 5 minutos de história, 5 a 10 de regras, 20 a 30 de partida e o restante para o relatório e a formalização de probabilidade condicional, valor esperado e aversão à perda.</p>`],
  ['nomes', 'Os nomes do agente e da doença', () => `
    <p>Até o agente ser isolado, a doença é a “Doença X”, o nome que a OMS usa para um patógeno ainda desconhecido. Quando a carta <b>Agente isolado</b> é revelada, o app sorteia um agente e batiza a doença.</p>
    <p>O nome é montado por análise combinatória: gênero = sílaba inicial + sílaba do meio + sufixo do tipo de agente (bactéria, vírus, protozoário ou fungo); epíteto = raiz + terminação latina.</p>
    <p class="caixa"><code>12 × 12 × 6</code> gêneros <code>× 12 × 5</code> epítetos <code>× 4</code> tipos = <b>${nf(COMBOS_BRUTO, 0)}</b> combinações. Passam pelas travas <b>${nf(COMBOS, 0)}</b>.</p>
    <p><b>Travas.</b> Nenhum nome usa lugar, pessoa ou animal, como recomenda a OMS desde 2015 para evitar estigma. Uma lista de bloqueio barra radicais que lembram gêneros reais, nomes próprios ou palavrões.</p>
    <div class="sorteio"><button class="btn" type="button" id="sortear-nome">Sortear um exemplo</button><div class="saida" id="saida-nome"></div></div>`],
  ['origem', 'Origem do jogo', () => `
    <p>A mecânica de <i>push your luck</i> (forçar a sorte) vem de <cite>Diamant</cite> (2005), de Alan R. Moon e Bruno Faidutti, publicado também como <cite>Incan Gold</cite> e, no Brasil, <cite>Tesouro Inca</cite>. As regras de dividir os ganhos, deixar o resto da divisão para quem retorna e premiar quem volta sozinho são as do jogo original.</p>
    <p>O tema, as cartas, os textos, a contagem de probabilidade e o gerador de nomes são desta adaptação. Os valores das descobertas (5, 7, 10, 12 e 15) e a ordem fixa em que entram também.</p>`]
];
function fichaAgente(a) {
  return `<p class="nome-ag">${esc(a.especie)}</p><dl><dt>Tipo</dt><dd>${a.tipo}</dd><dt>Doença</dt><dd>${esc(a.doenca)} (${a.sigla})</dd><dt>Quadro</dt><dd>${a.quadro} por <i class="sp">${esc(a.genero)}</i></dd></dl>`;
}
function abrirRegras(id) {
  $('#regras-corpo').innerHTML = `<p class="chapa">Saiba mais</p><h3>Protocolo Zero</h3>
    <p>Um jogo de decisão sob incerteza para as aulas de probabilidade e estatística em epidemiologia. Toque em um item para abrir.</p>
    ${REGRAS.map(([k, titulo, html]) => `<details id="regra-${k}"${k === id ? ' open' : ''}><summary>${titulo}</summary><div class="regra">${html()}</div></details>`).join('')}`;
  const d = $('#regras'); if (!d.open) d.showModal();
  const aberto = id && $('#regra-' + id);
  d.scrollTop = aberto ? aberto.offsetTop - 60 : 0;
}
async function decifrar(el, texto) {
  const letras = 'abcdefghilmnoprstuvxz';
  for (let k = 0; k <= texto.length; k += 1) {
    el.textContent = texto.slice(0, k) + [...texto.slice(k)].map(ch => (ch === ' ' ? ' ' : um([...letras]))).join('');
    await espera(55);
  }
  el.textContent = texto;
}
async function abrirAgente() {
  const a = G.agente;
  $('#agente-corpo').innerHTML = `<p class="chapa">Agente isolado</p><h3>A Doença X tem nome</h3><p class="decifra" id="decifra">&nbsp;</p><div id="agente-resto" hidden>
    <div class="ficha-agente">${fichaAgente(a)}</div>
    <p class="fonte">Um entre ${nf(COMBOS, 0)} agentes possíveis. O nome foi sorteado no início da partida e não usa lugar, pessoa nem animal.</p></div>`;
  $('#agente').showModal();
  await decifrar($('#decifra'), a.especie);
  $('#agente-resto').hidden = false;
}

/* ---------- mapa ---------- */
function mapaHtml(ate, comRotulo) {
  const feitas = G.regioes.slice(0, ate), atual = G.regioes[ate];
  let formas = '', rotulos = '', k = 0;
  for (const r of REGIOES) for (const uf of r.ufs) {
    const m = MAPA.ufs[uf], cls = r.id === atual ? 'ativa' : feitas.includes(r.id) ? 'feita' : '';
    const ordem = cls === 'ativa' ? ` style="--k:${k++}"` : '';
    formas += `<path class="uf ${cls}" d="${m.d}"${ordem}/>`;
    if (!comRotulo) continue;
    const fora = ROTULO_FORA[uf], [x, y] = fora || ROTULO_DENTRO[uf] || m.c;
    if (fora) rotulos += `<line x1="${m.c[0]}" y1="${m.c[1]}" x2="${x - (x > m.c[0] ? 2.6 : 0)}" y2="${y}"/>`;
    rotulos += `<text class="${cls}${fora ? ' fora' : ''}" x="${x}" y="${y}"${ordem}>${uf}</text>`;
  }
  return `<svg viewBox="0 0 ${comRotulo ? 107 : MAPA.w} ${MAPA.h}" ${comRotulo ? `role="img" aria-label="Mapa do Brasil com a região ${regiao(atual).nome} em destaque"` : 'aria-hidden="true"'}>${formas}${rotulos}</svg>`;
}

/* ---------- gráficos: palpites × valor real ---------- */
const curto = nome => nome.replace(/^Equipe\s+/i, '');
const temPalpites = p => !!p.palpites && p.palpites.some(v => v != null);
function grafico(r, teto) {
  const P = r.passos, N = Math.max(2, r.fim ? r.fim.cartas : 0, P.length ? P[P.length - 1].n : 0), k = G.equipes.length;
  const W = 360, H = 186, ml = 36, mr = 14, mt = 14, mb = 30, iw = W - ml - mr, ih = H - mt - mb;
  const maior = Math.max(0.2, ...P.map(p => p.risco), ...P.flatMap(p => (p.palpites || []).filter(v => v != null)));
  const ymax = teto || Math.min(1, Math.ceil(maior * 10) / 10);
  const x = n => ml + ((n - 1) / (N - 1)) * iw, y = v => mt + ih - (Math.min(v, ymax) / ymax) * ih;
  let g = '';
  for (const v of [0, ymax / 2, ymax]) g += `<line x1="${ml}" x2="${W - mr}" y1="${y(v)}" y2="${y(v)}" stroke="var(--filete)" stroke-width="1"/><text x="${ml - 6}" y="${y(v) + 3.5}" text-anchor="end">${nf(v * 100, 0)}%</text>`;
  const marcas = [...new Set([1, ...Array.from({ length: Math.floor(N / 5) }, (_, i) => (i + 1) * 5), N])].filter(n => n === N || N - n >= 2 || n === 1);
  for (const n of marcas) g += `<text x="${x(n)}" y="${H - 12}" text-anchor="middle">${n}</text>`;
  g += `<text x="${ml + iw / 2}" y="${H - 1}" text-anchor="middle">carta</text>`;
  if (P.length) {
    let d = `M${x(P[0].n)} ${y(P[0].risco)}`;
    for (let i = 1; i < P.length; i++) d += `H${x(P[i].n)}V${y(P[i].risco)}`;
    d += `H${r.fim && r.fim.como === 'perigo' ? x(N) : x(P[P.length - 1].n)}`;
    g += `<path d="${d}" fill="none" stroke="var(--perigo)" stroke-width="2" stroke-linejoin="round"/>`;
    for (const p of P) g += `<circle cx="${x(p.n)}" cy="${y(p.risco)}" r="2.6" fill="var(--perigo)" stroke="var(--painel)" stroke-width="1.5"/>`;
    for (const p of P) if (temPalpites(p)) p.palpites.forEach((v, i) => {
      if (v != null) g += `<circle cx="${x(p.n) + (i - (k - 1) / 2) * 1.7}" cy="${y(v)}" r="3.6" fill="var(--serie-b)" stroke="var(--painel)" stroke-width="1.5"/>`;
    });
    if (r.fim && r.fim.como === 'perigo') g += `<path d="M${x(N) - 5} ${y(P[P.length - 1].risco) - 5}l10 10m0-10l-10 10" stroke="var(--papel)" stroke-width="2" stroke-linecap="round"/>`;
    const meio = iw / (N - 1);
    for (const p of P) {
      const ditos = temPalpites(p) ? ' · palpites: ' + p.palpites.map((v, i) => (v == null ? null : `${curto(G.equipes[i].nome)} ${pct(v)}`)).filter(Boolean).join(', ') : '';
      g += `<rect x="${x(p.n) - meio / 2}" y="${mt}" width="${meio}" height="${ih}" fill="transparent" data-dica="${esc(`Carta ${p.n} · risco real ${pct(p.risco)}${ditos}`)}"/>`;
    }
  }
  const tem = P.some(temPalpites);
  return `<div class="graf"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Risco real da próxima carta ao longo da expedição${tem ? ', com os palpites das equipes' : ''}">${g}</svg>
    <p class="legenda"><span><i></i>risco real da próxima carta</span>${tem ? '<span><i class="b"></i>palpite de uma equipe</span>' : ''}${r.fim && r.fim.como === 'perigo' ? '<span><i class="x">✕</i> perigo encerrou</span>' : ''}</p></div>`;
}
/* Calibração de uma equipe: cada ponto é um palpite. Na diagonal, palpite = risco real. */
function grafCalib(pts, max) {
  const W = 220, H = 200, ml = 38, mr = 12, mt = 12, mb = 34, iw = W - ml - mr, ih = H - mt - mb;
  const x = v => ml + (Math.min(v, max) / max) * iw, y = v => mt + ih - (Math.min(v, max) / max) * ih;
  let g = '';
  for (const v of [0, max / 2, max]) g += `<line x1="${ml}" x2="${W - mr}" y1="${y(v)}" y2="${y(v)}" stroke="var(--filete)" stroke-width="1"/><text x="${ml - 6}" y="${y(v) + 3.5}" text-anchor="end">${nf(v * 100, 0)}%</text><text x="${x(v)}" y="${H - 16}" text-anchor="middle">${nf(v * 100, 0)}%</text>`;
  g += `<text x="${ml + iw / 2}" y="${H - 3}" text-anchor="middle">risco real</text><text x="${ml + 5}" y="${mt + 9}">palpite acima</text><text x="${W - mr - 4}" y="${mt + ih - 6}" text-anchor="end">palpite abaixo</text>`;
  g += `<line x1="${x(0)}" y1="${y(0)}" x2="${x(max)}" y2="${y(max)}" stroke="var(--nevoa)" stroke-width="1.5" stroke-dasharray="4 4"/>`;
  for (const p of pts) g += `<circle cx="${x(p.real)}" cy="${y(p.pal)}" r="4.2" fill="var(--serie-b)" stroke="var(--painel)" stroke-width="2" data-dica="${esc(`Expedição ${p.e + 1}, carta ${p.n} · palpite ${pct(p.pal)} · risco real ${pct(p.real)}`)}"/>`;
  return `<div class="graf"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Palpites de risco comparados com o risco real">${g}</svg></div>`;
}
/* Probabilidade de vencer de uma equipe: declarada × estimada pelo placar real. O último ponto é o resultado. */
function grafVencer(i, final) {
  const W = 220, H = 180, ml = 38, mr = 14, mt = 12, mb = 34, iw = W - ml - mr, ih = H - mt - mb;
  const x = e => ml + (e / 4) * iw, y = v => mt + ih - v * ih;
  let g = '';
  for (const v of [0, 0.5, 1]) g += `<line x1="${ml}" x2="${W - mr}" y1="${y(v)}" y2="${y(v)}" stroke="var(--filete)" stroke-width="1"/><text x="${ml - 6}" y="${y(v) + 3.5}" text-anchor="end">${v * 100}%</text>`;
  ['1', '2', '3', '4', 'fim'].forEach((t, e) => { g += `<text x="${x(e)}" y="${H - 16}" text-anchor="middle">${t}</text>`; });
  g += `<text x="${ml + iw / 2}" y="${H - 3}" text-anchor="middle">após a expedição</text>`;
  const sim = [], dec = [];
  G.reg.forEach((r, e) => {
    if (!r || e > 3) return;
    if (r.sim) sim.push([e, r.sim[i]]);
    if (r.vencer && r.vencer[i] != null) dec.push([e, r.vencer[i]]);
  });
  sim.push([4, final]);
  const linha = pts => pts.map(([e, v], n) => `${n ? 'L' : 'M'}${x(e)} ${y(v)}`).join('');
  g += `<path d="${linha(sim)}" fill="none" stroke="var(--perigo)" stroke-width="2" stroke-linejoin="round"/>`;
  for (const [e, v] of sim) g += `<circle cx="${x(e)}" cy="${y(v)}" r="${e === 4 ? 4 : 2.6}" fill="var(--perigo)" stroke="var(--painel)" stroke-width="1.5"/>`;
  if (dec.length > 1) g += `<path d="${linha(dec)}" fill="none" stroke="var(--serie-b)" stroke-width="2" stroke-linejoin="round"/>`;
  for (const [e, v] of dec) g += `<circle cx="${x(e)}" cy="${y(v)}" r="4.2" fill="var(--serie-b)" stroke="var(--painel)" stroke-width="2"/>`;
  for (let e = 0; e <= 4; e++) {
    const r = G.reg[e]; let dica;
    if (e === 4) dica = `Resultado: ${final === 1 ? 'venceu' : final > 0 ? 'empatou em primeiro' : 'não venceu'}`;
    else if (!r || !r.sim) continue;
    else {
      const pos = r.pontos.filter(v => v > r.pontos[i]).length + 1, d = r.vencer && r.vencer[i] != null ? pct(r.vencer[i]) : 'sem resposta';
      dica = `Após a expedição ${e + 1} · declarada ${d} · estimada ${pct(r.sim[i])} · placar real: ${pos}º lugar, ${r.pontos[i]} pontos`;
    }
    g += `<rect x="${x(e) - iw / 8}" y="${mt}" width="${iw / 4}" height="${ih}" fill="transparent" data-dica="${esc(dica)}"/>`;
  }
  return `<div class="graf"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Probabilidade de vencer declarada e estimada">${g}</svg></div>`;
}

/* ---------- telas do jogo ---------- */
const mesa = $('#mesa'), trilha = $('#trilha');
function montarPilha() {
  const p = $('#monte .pilha'), n = Math.max(1, Math.min(7, Math.ceil(G.baralho.length / 4)));
  p.innerHTML = '';
  for (let k = 0; k < n; k++) { const s = document.createElement('span'); s.className = 'lamina'; s.style.setProperty('--k', k); p.append(s); }
}
function embaralharMonte() {
  const ls = $$('#monte .lamina');
  return Promise.all(ls.map((l, i) => {
    const d = i % 2 ? 1 : -1;
    return l.animate([
      { transform: 'none' },
      { transform: `translate(${d * 62}%,${-4 - i}%) rotate(${d * (7 + i)}deg)`, offset: 0.25 },
      { transform: `translate(${d * 8}%,0) rotate(${d * 1.5}deg)`, offset: 0.5 },
      { transform: `translate(${-d * 54}%,${3 + i}%) rotate(${-d * (6 + i)}deg)`, offset: 0.74 },
      { transform: 'none' }
    ], { duration: T(1100), delay: T(i * 45), easing: 'cubic-bezier(.45,0,.35,1)' }).finished.catch(() => {});
  }));
}
function pintarFaixa() {
  const r = regiao(G.regioes[G.exp]);
  $('#j-titulo').innerHTML = `Expedição ${G.exp + 1}<span class="so-largo"> de 5</span><span class="so-estreito">/5</span>`;
  $('#mapa-mini').innerHTML = mapaHtml(G.exp, false);
  $('#j-regiao').textContent = r.nome;
  $('#j-doenca').innerHTML = G.nomeRevelado ? `<b>${esc(nomeDoenca())}</b> · <i class="sp">${esc(G.agente.especie)}</i>` : '<b>Doença X</b> · agente ainda não identificado';
  $('#j-monte').textContent = G.baralho.length;
  montarPilha();
  $('#sinais').innerHTML = PERIGOS.map(p => {
    const total = G.comp.perigos[p.id], visto = G.vistos[p.id] || 0;
    return `<span class="sinal${visto ? ' visto' : ''}" title="${esc(p.nome)}: ${visto} de ${total} já saíram">${p.curto}<span class="pips">${Array.from({ length: total }, (_, i) => `<i${i < visto ? ' class="on"' : ''}></i>`).join('')}</span></span>`;
  }).join('');
  const livres = G.trilha.filter(t => t.livre), campo = emCampo();
  $('#pe-trilha').innerHTML = G.fase === 'briefing' ? '' : `<div class="tile"><small>Dados provisórios, por equipe em campo</small><b id="t-risco">${campo.length ? campo[0].risco : '–'}</b></div>
    <div class="tile aberto"><small>Dados pendentes</small><b id="t-aberto">${G.sobras}</b></div>
    ${livres.length ? `<div class="tile ouro"><small>${livres.length > 1 ? 'Descobertas livres' : 'Descoberta livre'}</small><b>${livres.map(t => `${esc(carta(t.id).nome)} (${carta(t.id).v})`).join(' · ')}</b></div>` : ''}${contaHtml()}`;
}
function contaHtml() {
  const c = G.conta;
  if (!c) return '';
  if (c.t === 'carta') return `<div class="conta"><small>${esc(c.nome)}</small><span><b>${c.v}</b> ÷ ${pl(c.n, 'equipe', 'equipes')} em campo = <b>${c.q} para cada</b> · ${c.sobra ? `<b>${c.sobra}</b> ${c.sobra === 1 ? 'fica pendente' : 'ficam pendentes'}` : 'nada fica pendente'}</span></div>`;
  return `<div class="conta"><small>Retorno</small><span>${c.aberto ? `<b>${c.aberto}</b> ${c.aberto === 1 ? 'pendente' : 'pendentes'} ÷ ${pl(c.k, 'equipe que retorna', 'equipes que retornam')} = <b>${c.q} para cada</b> · ${c.resto ? `<b>${c.resto}</b> ${c.resto === 1 ? 'continua pendente' : 'continuam pendentes'}` : 'nada fica pendente'}` : 'Não havia dados pendentes para dividir'}</span></div>`;
}
function pintarTrilha() {
  trilha.innerHTML = '';
  $$('.carimbo', mesa).forEach(c => c.remove());
  for (const t of G.trilha) { const el = criarCarta(t.id, { virada: true }); marcarCarta(el, t); trilha.append(el); }
  trilha.classList.toggle('encerrada', G.fase === 'fimExp' && G.fim.como === 'perigo');
  trilha.classList.toggle('guardada', G.fase === 'fimExp' && G.fim.como === 'retorno');
  if (G.fase === 'fimExp') carimbar(false);
}
function carimbar(animar) {
  $$('.carimbo', mesa).forEach(c => c.remove());
  const c = document.createElement('div');
  c.className = 'carimbo' + (G.fim.como === 'retorno' ? ' bom' : '');
  c.textContent = G.fim.como === 'retorno' ? 'Todas retornaram' : 'Expedição encerrada';
  if (!animar) c.style.animation = 'none';
  trilha.append(c);
}
function atualizarMarcas() { $$('.carta', trilha).forEach((el, i) => { if (G.trilha[i]) marcarCarta(el, G.trilha[i]); }); }
function pintarBriefing() {
  const b = $('#briefing'), r = regiao(G.regioes[G.exp]), c = G.comp;
  const nP = Object.values(c.perigos).reduce((a, v) => a + v, 0);
  const novo = carta(ACHADOS[G.exp].id);
  b.innerHTML = `<div class="mapa grande">${mapaHtml(G.exp, true)}</div>
    <div class="txt"><p class="chapa">Expedição ${G.exp + 1} de 5 · ${esc(nomeDoenca())}</p><h3>${esc(r.nome)}</h3>
    <p>${G.exp === 0 ? 'Os primeiros casos de uma doença desconhecida foram notificados em' : 'Novos casos foram notificados em'} ${r.ufs.join(', ')}. As equipes entram em campo juntas.</p>
    <div class="entra"><span id="entra-carta"></span><p>Entra no baralho a descoberta <b>${esc(novo.nome)}</b>, que vale ${novo.v} pontos.${c.achados.length > 1 ? ` ${c.achados.length - 1 === 1 ? 'Continua' : 'Continuam'} no baralho, de expedições anteriores: ${c.achados.filter(a => a !== novo.id).map(a => esc(carta(a).nome)).join(', ')}.` : ''}</p></div>
    <div class="comp"><span>Monte: <b>${c.total} cartas</b></span><span>Coletas: <b>15</b></span><span>Perigos: <b>${nP}</b></span><span>Descobertas: <b>${c.achados.length}</b></span>${PERIGOS.filter(p => c.perigos[p.id] < 3).map(p => `<span>${p.curto}: <b>${c.perigos[p.id]}</b></span>`).join('')}</div></div>`;
  $('#entra-carta').replaceWith(criarCarta(novo.id, { virada: true }));
}
function linhaEquipe(e, i) {
  const st = { campo: 'Em campo', retornou: 'Retornou', perdeu: 'Perdeu ' + (e.perdido || 0) }[e.st];
  const decidindo = G.fase === 'decidir' && G.sub === 'decisao' && e.st === 'campo' && G.modo === 'sala';
  const marcada = G.marc.includes(i);
  const estrelas = e.achados.length ? ` <span class="est" title="${e.achados.map(a => carta(a).nome).join(', ')}">${'★'.repeat(e.achados.length)}</span>` : '';
  const miolo = `<span class="eq-nome">${esc(e.nome)}<small>${st}${estrelas}</small></span>${G.verPlacar ? `<span class="eq-num"><b>${e.gar}</b>garantidos</span>` : '<span></span>'}`;
  const tipo = G.fase === 'decidir' && G.sub === 'palpite' ? 'pal' : G.fase === 'fimExp' && G.sub === 'vencer' ? 'ven' : null;
  if (tipo && !e.bot) return `<label class="eq ${e.st}" for="${tipo}-${i}">${miolo}<span class="perc"><input type="number" id="${tipo}-${i}" data-${tipo}="${i}" min="0" max="100" step="1" inputmode="numeric" placeholder="–" autocomplete="off">%</span></label>`;
  return decidindo
    ? `<button type="button" class="eq campo" data-eq="${i}" aria-pressed="${marcada}">${miolo}<span class="eq-vai">${marcada ? 'Retorna' : 'Continua'}</span></button>`
    : `<div class="eq ${e.st}${e.st !== 'campo' ? ' fora' : ''}">${miolo}<span></span></div>`;
}
function lerCampos(tipo) {
  const arr = G.equipes.map(() => null);
  $$(`[data-${tipo}]`).forEach(el => { const v = parseFloat(el.value); if (el.value.trim() !== '' && v >= 0 && v <= 100) arr[+el.dataset[tipo]] = v / 100; });
  return arr;
}
function pintarPainel() {
  const solo0 = G.modo === 'solo';
  let pergunta = '';
  if (G.fase === 'decidir' && G.sub === 'palpite') pergunta = `<div class="palpite"><h4>Pausa de palpite</h4><p>Qual é a probabilidade de a próxima carta encerrar a expedição?${solo0 ? '' : ' Todas as equipes dão o seu palpite, inclusive as que já retornaram.'}</p></div>`;
  if (G.fase === 'fimExp' && G.sub === 'vencer') pergunta = `<div class="palpite fim-exp"><h4>Fim da expedição ${G.exp + 1} · antes de seguir</h4><p>${G.exp === 3 ? 'Falta 1 expedição' : 'Faltam ' + (4 - G.exp) + ' expedições'}. Qual é a probabilidade de ${solo0 ? 'você' : 'a sua equipe'} <b>vencer a partida</b>?${solo0 || G.verPlacar ? '' : ' Cada equipe responde sem ver o placar das outras.'}</p></div>`;
  $('#equipes').innerHTML = pergunta + `<div class="eq-topo"><span class="chapa">Equipes</span><button class="btn-liso" type="button" id="ver-placar" aria-pressed="${G.verPlacar}">${G.verPlacar ? 'Ocultar placar' : 'Mostrar placar'}</button></div>` + G.equipes.map(linhaEquipe).join('');
  const fala = $('#fala'), acao = $('#acao'), solo = G.modo === 'solo', eu = G.equipes[0];
  let f = G.msg || '', a = '';
  if (G.fase === 'briefing') {
    f = solo && G.exp === 0
      ? `<h4>Suas adversárias</h4><p class="nota">${Object.values(BOTS).map(([n, d]) => `<b>${n}</b> ${d}`).join('; ')}.</p>`
      : `<p class="nota">${G.exp === 0 ? 'A ordem das regiões foi sorteada para esta partida. A primeira parada aparece no mapa.' : 'Todos os pontos garantidos estão a salvo. Os dados provisórios voltam a zero.'}</p>`;
    a = '<button class="btn principal" type="button" data-ato="entrar">Embaralhar e entrar em campo</button>';
  } else if (G.fase === 'revelar') {
    a = '<button class="btn principal" type="button" data-ato="revelar">Revelar carta</button>';
  } else if (G.fase === 'decidir' && G.sub === 'palpite') {
    a = '<button class="btn principal" type="button" data-ato="palpite" id="pal-ok" disabled>Registrar</button><button class="btn estreito" type="button" data-ato="pular">Pular</button>';
  } else if (G.fase === 'decidir') {
    if (solo) {
      if (eu.st === 'campo') {
        f += `<p class="nota">Você tem <b>${eu.risco}</b> ${eu.risco === 1 ? 'dado provisório' : 'dados provisórios'}. As outras equipes decidem ao mesmo tempo que você.</p>`;
        a = '<button class="btn principal" type="button" data-ato="fico">Continuar em campo</button><button class="btn alerta" type="button" data-ato="volto">Retornar</button>';
      } else a = '<button class="btn principal" type="button" data-ato="bots">Ver as decisões</button>';
    } else {
      f += '<p class="nota">Decisão simultânea. Toque nas equipes que retornam e confirme.</p>';
      const k = G.marc.length;
      a = `<button class="btn principal" type="button" data-ato="confirmar">${k ? `Confirmar: ${k === 1 ? '1 retorna' : k + ' retornam'}` : 'Todas continuam'}</button><button class="btn estreito" type="button" data-ato="contar">Contar 3, 2, 1</button>`;
    }
  } else if (G.fase === 'fimExp' && G.sub === 'vencer') {
    f = '';
    a = '<button class="btn principal" type="button" data-ato="vencer" id="pal-ok" disabled>Registrar e seguir</button><button class="btn estreito" type="button" data-ato="pular">Pular</button>';
  } else if (G.fase === 'fimExp') {
    if (G.opc.palpites) f += '<p class="nota">O risco real de cada carta e os palpites das equipes aparecem no relatório final.</p>';
    a = G.exp < 4 && G.opc.vencer
      ? '<button class="btn principal" type="button" data-ato="pedir-vencer">Continuar</button>'
      : `<button class="btn principal" type="button" data-ato="proxima">${G.exp === 4 ? 'Ver o relatório final' : 'Próxima expedição'}</button>`;
  }
  fala.innerHTML = f; acao.innerHTML = a;
  if (pergunta) { $('#rola').scrollTop = 0; const primeiro = $('#equipes input'); if (primeiro && matchMedia('(min-width:900px)').matches) primeiro.focus(); }
  $('#desfazer').disabled = !HIST.length;
  gravarPartida();
}
function pintar(refazer) {
  if (!G) return;
  if (G.fase === 'fim') { ir('fim'); return; }
  const br = G.fase === 'briefing';
  mesa.style.setProperty('--regiao', `url("regioes/${G.regioes[G.exp]}.webp")`);
  mesa.classList.toggle('brief', br);
  $('#tela-jogo').classList.toggle('em-brief', br);
  $('#briefing').hidden = !br; $('#faixa').hidden = br; trilha.hidden = br; $('#pe-trilha').hidden = br;
  if (br) { pintarBriefing(); $$('.carimbo', mesa).forEach(c => c.remove()); }
  pintarFaixa();
  if (refazer && !br) pintarTrilha();
  pintarPainel();
}

/* ---------- animações da mesa ---------- */
async function apresentar(el) {
  mesa.scrollTop = mesa.scrollHeight;
  const de = $('#monte .pilha').getBoundingClientRect(), m = mesa.getBoundingClientRect(), p = el.getBoundingClientRect();
  if (!p.width || calmo) { el.classList.add('virada'); return; }
  const S = Math.max(1.15, Math.min(2.6, (m.height * 0.74) / p.height, (m.width * 0.56) / p.width));
  const cx = m.left + m.width / 2 - (p.left + p.width / 2), cy = m.top + m.height / 2 - (p.top + p.height / 2);
  const dx = de.left + de.width / 2 - (p.left + p.width / 2), dy = de.top + de.height / 2 - (p.top + p.height / 2);
  const palco = `translate(${cx}px,${cy}px) scale(${S})`;
  /* Sem fill: a posição de palco fica no estilo da própria carta e é limpa no fim.
     (Com duas animações de fill encadeadas, o navegador às vezes deixava a carta presa no palco.) */
  el.style.zIndex = 60; el.style.transform = palco;
  await el.animate([{ transform: `translate(${dx}px,${dy}px) scale(${de.width / p.width}) rotate(0deg)` }, { transform: `translate(${(dx + cx) / 2}px,${(dy + cy) / 2 - 20}px) scale(${S * 0.7}) rotate(-7deg)`, offset: 0.55 }, { transform: palco + ' rotate(0deg)' }],
    { duration: 560, easing: 'cubic-bezier(.3,.6,.25,1)' }).finished.catch(() => {});
  el.classList.add('virada');
  await espera(1500);
  el.style.transform = '';
  await el.animate([{ transform: palco }, { transform: 'none' }], { duration: 460, easing: 'cubic-bezier(.4,0,.2,1)' }).finished.catch(() => {});
  el.style.zIndex = '';
}
function clarao(ouro) {
  mesa.classList.remove('clarao', 'ouro'); void mesa.offsetWidth;
  mesa.classList.add('clarao'); if (ouro) mesa.classList.add('ouro');
  setTimeout(() => mesa.classList.remove('clarao', 'ouro'), 1000);
}
const fotografar = () => { const c = emCampo(); return { risco: c.length ? c[0].risco : -1, aberto: G.sobras }; };
function pulsar(antes) {
  const d = fotografar(), r = $('#t-risco'), a = $('#t-aberto');
  if (r && d.risco > antes.risco) r.classList.add('subiu');
  if (a && d.aberto !== antes.aberto) a.classList.add('subiu');
}
async function aoRevelar() {
  if (ocupado || G.fase !== 'revelar') return;
  ocupado = true;
  try {
    const antes = fotografar();
    const item = revelar();
    $('#acao').innerHTML = ''; $('#j-monte').textContent = G.baralho.length;
    const el = criarCarta(item.id);
    trilha.append(el);
    await apresentar(el);
    atualizarMarcas();
    if (item.fatal) { clarao(false); trilha.classList.add('encerrada'); carimbar(true); }
    else if (item.alerta) el.classList.add('tremor');
    else if (item.livre) clarao(true);
    if (G.fase === 'fimExp' && G.fim.como === 'retorno') { trilha.classList.add('guardada'); carimbar(true); }
    pintar(false); pulsar(antes);
    if (item.id === 'D4') await abrirAgente();
  } finally { ocupado = false; }
}
function aoConfirmar() {
  if (ocupado || G.fase !== 'decidir') return;
  const antes = fotografar();
  confirmar();
  atualizarMarcas();
  if (G.fase === 'fimExp') { trilha.classList.add('guardada'); carimbar(true); }
  pintar(false); pulsar(antes);
}
async function contar() {
  if (ocupado) return;
  ocupado = true;
  const c = document.createElement('div'); c.className = 'contagem'; mesa.append(c);
  for (const n of ['3', '2', '1', 'Já']) { c.innerHTML = `<span>${n}</span>`; await espera(n === 'Já' ? 650 : 800); }
  c.remove(); ocupado = false;
}
async function entrar() {
  if (ocupado) return;
  ocupado = true;
  salvar();
  const nova = ACHADOS[G.exp].id, origem = $('#briefing .entra .carta'), de = origem ? origem.getBoundingClientRect() : null;
  G.fase = 'revelar'; G.msg = `<p><b>${esc(carta(nova).nome)}</b> entrou no baralho. As equipes estão em campo. Revele a primeira carta.</p>`;
  pintar(true);
  try { await inserirNoMonte(nova, de); await embaralharMonte(); } finally { ocupado = false; }
}
/* A descoberta da expedição sai da abertura, mostra a frente no centro da mesa, vira e entra no monte. */
async function inserirNoMonte(id, de) {
  if (calmo || !de || !de.width) return;
  const m = mesa.getBoundingClientRect(), alvo = $('#monte .pilha').getBoundingClientRect();
  const larg = Math.min(250, m.width * 0.36, (m.height * 0.62) / 1.4), alt = larg * 1.4;
  const x = m.left + (m.width - larg) / 2, y = m.top + (m.height - alt) / 2;
  const el = criarCarta(id, { virada: true, tag: 'span' });
  el.classList.add('voando', 'livre');
  el.style.cssText = `--cw:${larg}px;left:${x}px;top:${y}px`;
  const selo = document.createElement('span'); selo.className = 'marca-c'; selo.textContent = 'Entra no baralho'; el.append(selo);
  document.body.append(el);
  const centro = r => [r.left + r.width / 2 - (x + larg / 2), r.top + r.height / 2 - (y + alt / 2)];
  const [ox, oy] = centro(de), [ax, ay] = centro(alvo);
  await el.animate([{ transform: `translate(${ox}px,${oy}px) scale(${de.width / larg})` }, { transform: 'none' }], { duration: 520, easing: 'cubic-bezier(.3,.6,.25,1)' }).finished.catch(() => {});
  await espera(1300);
  selo.remove(); el.classList.remove('livre', 'virada');
  await espera(520);
  await el.animate([{ transform: 'none' }, { transform: `translate(${ax * 0.5}px,${ay * 0.5 - 24}px) scale(.6) rotate(8deg)`, offset: 0.5 }, { transform: `translate(${ax}px,${ay}px) scale(${alvo.width / larg})` }], { duration: 620, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' }).finished.catch(() => {});
  el.remove();
}

/* ---------- relatório final ---------- */
function pintarFim() {
  if (!G) return;
  const regs = G.reg.filter(Boolean), todos = regs.flatMap(r => r.passos), k = G.equipes.length;
  const sinal = (v, d = 1) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${nf(Math.abs(v), d)}`;

  /* risco: palpites de cada equipe e ranking de quem chegou mais perto do risco real */
  const porEquipe = G.equipes.map((e, i) => {
    const pts = [];
    regs.forEach((r, x) => r.passos.forEach(p => { const v = p.palpites && p.palpites[i]; if (v != null) pts.push({ pal: v, real: p.risco, e: x, n: p.n }); }));
    return pts;
  });
  const tudo = porEquipe.flat();
  const teto = Math.min(1, Math.ceil(Math.max(0.2, ...todos.map(p => p.risco), ...tudo.map(p => p.pal)) * 10) / 10);
  const comPalpite = G.equipes.map((e, i) => i).filter(i => porEquipe[i].length);
  const pausas = todos.filter(temPalpites).length, minimo = Math.max(1, Math.ceil(pausas / 2));
  const erro = porEquipe.map(p => (p.length ? p.reduce((s, q) => s + Math.abs(q.pal - q.real), 0) / p.length * 100 : null));
  const aptas = comPalpite.filter(i => porEquipe[i].length >= minimo).sort((a, b) => erro[a] - erro[b]);
  const posicao = G.equipes.map(() => null);
  aptas.forEach((i, n) => { posicao[i] = n && Math.abs(erro[i] - erro[aptas[n - 1]]) < 1e-9 ? posicao[aptas[n - 1]] : n + 1; });
  const bonus = G.equipes.map((e, i) => (G.opc.bonus && posicao[i] && posicao[i] <= PREMIO.length ? PREMIO[posicao[i] - 1] : 0));
  const total = G.equipes.map((e, i) => e.gar + bonus[i]);
  const ordem = G.equipes.map((e, i) => ({ e, i })).sort((a, b) => total[b.i] - total[a.i] || b.e.gar - a.e.gar);
  const melhor = total[ordem[0].i], empate = total.filter(t => t === melhor).length;
  const final = total.map(t => (t === melhor ? 1 / empate : 0));
  const topoCampo = Math.max(...G.equipes.map(e => e.gar));
  const virou = G.opc.bonus && G.equipes[ordem[0].i].gar < topoCampo;

  let risco = '<p>Nenhum palpite de risco foi registrado nesta partida.</p>';
  if (tudo.length) {
    const vies = tudo.reduce((s, p) => s + (p.pal - p.real), 0) / tudo.length * 100, acima = tudo.filter(p => p.pal > p.real).length;
    const fila = [...aptas, ...comPalpite.filter(i => !aptas.includes(i))];
    risco = `<p>Em ${pl(tudo.length, 'palpite', 'palpites')}, o risco estimado ficou em média <b>${nf(Math.abs(vies))} pontos percentuais ${vies >= 0 ? 'acima' : 'abaixo'}</b> do risco real (${acima} de ${tudo.length} acima).</p>
      ${aptas.length ? `<p><b>${esc(G.equipes[aptas[0]].nome)}</b> ${aptas.length > 1 && posicao[aptas[1]] === 1 ? 'divide o primeiro lugar' : 'teve os melhores palpites'}: errou em média ${nf(erro[aptas[0]])} pontos percentuais.${G.opc.bonus ? ` As três equipes mais precisas ganham ${PREMIO.join(', ').replace(/, (\d+)$/, ' e $1')} ${PREMIO[PREMIO.length - 1] === 1 ? 'ponto' : 'pontos'} de bônus.` : ''}</p>` : ''}
      <div class="tab-rola"><table><thead><tr><th>Posição</th><th>Equipe</th><th>Palpites</th><th>Erro absoluto médio (p.p.)</th><th>Erro médio (p.p.)</th><th>Acima do real</th>${G.opc.bonus ? '<th>Bônus</th>' : ''}</tr></thead><tbody>
      ${fila.map(i => { const p = porEquipe[i], m = p.reduce((s, q) => s + (q.pal - q.real), 0) / p.length * 100;
        return `<tr><td>${posicao[i] ? posicao[i] + 'º' : '–'}</td><td style="text-align:left">${esc(G.equipes[i].nome)}</td><td>${p.length}</td><td>${nf(erro[i])}</td><td>${sinal(m)}</td><td>${p.filter(q => q.pal > q.real).length} de ${p.length}</td>${G.opc.bonus ? `<td>${bonus[i] ? '+' + bonus[i] : '–'}</td>` : ''}</tr>`; }).join('')}
      </tbody></table></div>
      <p class="ajuda">O ranking usa o erro absoluto médio: a distância média, em pontos percentuais, entre o palpite e o risco real. O erro médio mostra a direção do desvio (positivo é superestimar). Entra no ranking quem respondeu a pelo menos ${minimo} das ${pl(pausas, 'pausa', 'pausas')} de palpite.</p>
      <p class="legenda"><span><i class="b"></i>um palpite da equipe</span><span><i class="d"></i>palpite = risco real</span></p>
      <div class="multiplos">${comPalpite.map(i => `<div><h5>${esc(G.equipes[i].nome)}</h5>${grafCalib(porEquipe[i], teto)}</div>`).join('')}</div>
      <p class="ajuda">Pontos acima da linha tracejada são palpites maiores que o risco real; abaixo, menores.</p>`;
  }

  /* probabilidade de vencer */
  const rodadas = regs.slice(0, 4).filter(r => r.sim);
  const declarou = rodadas.some(r => r.vencer && r.vencer.some(v => v != null));
  let vencer = '';
  if (rodadas.length) {
    const linhas = rodadas.map((r, e) => {
      const topo = Math.max(...r.pontos), lideres = G.equipes.filter((q, i) => r.pontos[i] === topo).map(q => esc(curto(q.nome)));
      const ditos = (r.vencer || []).filter(v => v != null), soma = ditos.reduce((s, v) => s + v, 0);
      return `<tr><td>${e + 1}</td><td>${lideres.join(', ')} (${topo})</td><td>${ditos.length ? ditos.length + ' de ' + k : '–'}</td><td class="${ditos.length === k && Math.abs(soma - 1) > 0.005 ? 'neg' : ''}">${ditos.length ? pct(soma) : '–'}</td></tr>`;
    }).join('');
    vencer = `<section><h4>Probabilidade de vencer: declarada × estimada</h4>
      <p>${declarou ? 'Ao fim de cada expedição, cada equipe disse qual era a sua probabilidade de vencer.' : 'Nenhuma equipe registrou sua probabilidade de vencer nesta partida.'} A linha laranja é a estimativa feita com o placar real daquele momento, e o último ponto é o resultado.</p>
      <p class="legenda"><span><i></i>estimada pelo placar real</span>${declarou ? '<span><i class="b"></i>declarada pela equipe</span>' : ''}</p>
      <div class="multiplos">${G.equipes.map((e, i) => `<div><h5>${esc(e.nome)} <small>${final[i] === 1 ? '· venceu' : final[i] > 0 ? '· empatou em primeiro' : ''}</small></h5>${grafVencer(i, final[i])}</div>`).join('')}</div>
      <div class="tab-rola"><table><thead><tr><th>Após a expedição</th><th>Na frente (pontos)</th><th>Respostas</th><th>Soma das declaradas</th></tr></thead><tbody>${linhas}</tbody></table></div>
      <p class="ajuda">As probabilidades de todas as equipes deveriam somar 100%, porque só uma vence. A estimativa vem de 3.000 simulações do resto da partida a partir do placar real, supondo que todas as equipes joguem do mesmo jeito dali em diante. Ela não é um valor exato: muda se as equipes jogarem de outro modo, e não considera o bônus de palpites.</p></section>`;
  }

  const linhasVe = G.equipes.map((e, i) => {
    let cont = 0, contNeg = 0, saiu = 0, saiuPos = 0;
    for (const p of todos) {
      if (p.emRisco[i] == null) continue;
      const ve = p.ganho - p.risco * p.emRisco[i];
      if (p.saiu.includes(i)) { saiu++; if (ve > 0) saiuPos++; } else { cont++; if (ve < 0) contNeg++; }
    }
    return `<tr><td>${esc(e.nome)}</td><td>${e.gar}</td><td>${cont}</td><td class="${contNeg ? 'neg' : ''}">${contNeg}</td><td>${saiu}</td><td>${saiuPos}</td><td>${e.sozinha}</td></tr>`;
  }).join('');
  $('#fim').innerHTML = `
    <section><p class="chapa">Cinco regiões investigadas${virou ? ' · o bônus de palpites mudou o primeiro lugar' : ''}</p><h3>${esc(ordem[0].e.nome)} ${empate > 1 ? 'divide a liderança' : 'fecha a investigação na frente'}</h3>
      <div class="podio">${ordem.map(({ e, i }, n) => `<div class="eq"><span class="pos">${n + 1}</span><span class="eq-nome">${esc(e.nome)}<small>${e.achados.length ? e.achados.map(a => esc(carta(a).nome)).join(' · ') : 'sem descobertas'}</small></span><span class="eq-num"><b>${total[i]}</b>${bonus[i] ? `${e.gar} de campo + ${bonus[i]} de bônus` : 'pontos'}</span></div>`).join('')}</div></section>
    <section><h4>O agente</h4><div class="ficha-agente">${fichaAgente(G.agente)}</div>
      ${G.nomeRevelado ? '' : '<p class="ajuda">A carta Agente isolado não chegou a ser revelada nesta partida. O agente só foi identificado depois do fim da investigação.</p>'}</section>
    <section><h4>Risco percebido × risco real, equipe por equipe</h4>${risco}</section>
    ${vencer}
    <section><h4>Risco real, expedição por expedição</h4>
      <div class="multiplos">${regs.map((r, e) => `<div><h5>${e + 1}. ${esc(regiao(r.regiao).nome)} <small>${r.fim ? (r.fim.como === 'perigo' ? '· ' + esc(carta(r.fim.id).nome.toLowerCase()) : '· todas retornaram') : ''}</small></h5>${grafico(r, teto)}</div>`).join('')}</div></section>
    <section><h4>Decisões e valor esperado</h4>
      <div class="tab-rola"><table><thead><tr><th>Equipe</th><th>Pontos de campo</th><th>Continuou</th><th>com VE negativo</th><th>Retornou</th><th>com VE positivo</th><th>Sozinha</th></tr></thead><tbody>${linhasVe}</tbody></table></div>
      <p class="ajuda">Valor esperado (VE) de continuar = ganho esperado da próxima carta − risco × dados provisórios. A conta não inclui os dados pendentes nem as descobertas, que dependem do que as outras equipes fazem. Uma decisão com VE negativo pode dar certo, e uma com VE positivo pode dar errado: o resultado de uma rodada não diz se a decisão foi boa.</p></section>
    <section><div class="abre-acoes"><button class="btn principal grande" type="button" data-ato="de-novo">Nova partida</button><button class="btn" type="button" data-ir="capa">Voltar ao início</button></div></section>`;
  gravarPartida();
}

/* ---------- baralho (galeria) ---------- */
function pintarGaleria() {
  const g = $('#galeria');
  if (g.childElementCount) return;
  g.innerHTML = '<p class="ajuda">Toque em uma carta para ler a explicação. O código no canto identifica a arte de cada carta.</p>';
  [['Coletas de dados · 15 cartas', DADOS], ['Perigos · 5 tipos, 3 cartas de cada', PERIGOS], ['Descobertas importantes · 5 cartas', ACHADOS]].forEach(([titulo, lista]) => {
    const h = document.createElement('h3'); h.textContent = titulo;
    const d = document.createElement('div'); d.className = 'grade';
    lista.forEach(c => d.append(criarCarta(c.id, { virada: true })));
    g.append(h, d);
  });
  const h = document.createElement('h3'); h.textContent = 'Verso';
  const d = document.createElement('div'); d.className = 'grade'; d.append(criarCarta(null, { tag: 'span' }));
  g.append(h, d);
}

/* ---------- preparo ---------- */
let nEquipes = 6;
function pintarNomes() {
  const guard = cofre.ler('nomes') || [], atuais = $$('#nomes input').map(i => i.value);
  $('#n-equipes').textContent = nEquipes;
  $('#nomes').innerHTML = Array.from({ length: nEquipes }, (_, i) => `<input type="text" id="eq-nome-${i}" maxlength="24" aria-label="Nome da equipe ${i + 1}" value="${esc(atuais[i] || guard[i] || EQUIPES[i])}">`).join('');
}
$('#menos').addEventListener('click', () => { nEquipes = Math.max(3, nEquipes - 1); pintarNomes(); });
$('#mais').addEventListener('click', () => { nEquipes = Math.min(8, nEquipes + 1); pintarNomes(); });
$('#preparo').addEventListener('submit', ev => {
  ev.preventDefault();
  const nomes = $$('#nomes input').map((i, k) => i.value.trim() || EQUIPES[k]);
  cofre.gravar('nomes', nomes);
  const cfg = { modo: 'sala', nomes, palpites: $('#op-palpites').checked, vencer: $('#op-vencer').checked, ocultar: $('#op-placar').checked, bonus: $('#op-bonus').checked };
  comecar(() => { novaPartida(cfg); ir('jogo'); });
});
function novoSolo() {
  novaPartida({ modo: 'solo', nomes: ['Você', BOTS.cautela[0], BOTS.ousadia[0], BOTS.esperado[0]], bots: [null, 'cautela', 'ousadia', 'esperado'], palpites: true, vencer: true, ocultar: false });
  ir('jogo');
}

/* ---------- eventos ---------- */
const ATOS = {
  entrar, revelar: aoRevelar, confirmar: aoConfirmar, contar,
  palpite() { salvar(); passoAtual().palpites = lerCampos('pal'); G.sub = 'decisao'; pintar(false); },
  'pedir-vencer'() { salvar(); G.sub = 'vencer'; pintar(false); },
  vencer() { G.reg[G.exp].vencer = lerCampos('ven'); ATOS.proxima(); },
  pular() { if (G.fase === 'fimExp') return ATOS.proxima(); salvar(); G.sub = 'decisao'; pintar(false); },
  fico() { G.marc = botsQueSaem(); aoConfirmar(); },
  volto() { G.marc = [0, ...botsQueSaem()]; aoConfirmar(); },
  bots() { G.marc = botsQueSaem(); aoConfirmar(); },
  proxima() { if (ocupado) return; proxima(); if (G.fase === 'fim') ir('fim'); else pintar(true); },
  'qr-equipe'() { $('#qr-equipe').showModal(); },
  'ficha-limpar'() {
    const b = $('#ficha-limpar');
    if (b.dataset.certeza) { cofre.gravar('ficha', null); FICHA = null; $('#ficha').innerHTML = ''; return pintarFichaEquipe(); }
    b.dataset.certeza = '1'; b.textContent = 'Toque de novo para apagar tudo';
    setTimeout(() => { if (b.isConnected) { delete b.dataset.certeza; b.textContent = 'Limpar a ficha'; } }, 3500);
  },
  'de-novo'() { if (G.modo === 'solo') novoSolo(); else ir('preparo'); },
  'trocar-ok'() { $('#trocar').close(); const f = pendente; pendente = null; if (f) f(); }
};
document.addEventListener('click', e => {
  const quer = s => e.target.closest(s);
  let el;
  if ((el = quer('[data-fechar]'))) return el.closest('dialog').close();
  if ((el = quer('[data-ir]'))) { const d = el.closest('dialog'); if (d) d.close(); return ir(el.dataset.ir); }
  if (quer('[data-solo]')) return comecar(novoSolo);
  if ((el = quer('[data-cartao]'))) return mostrarCartao(el.dataset.cartao);
  if ((el = quer('[data-regras]'))) return abrirRegras(el.dataset.regras);
  if ((el = quer('[data-ato]'))) return ATOS[el.dataset.ato]();
  if ((el = quer('[data-eq]'))) {
    const i = +el.dataset.eq;
    G.marc = G.marc.includes(i) ? G.marc.filter(x => x !== i) : [...G.marc, i];
    return pintarPainel();
  }
  if (quer('#ver-placar')) { G.verPlacar = !G.verPlacar; return pintarPainel(); }
  if (quer('#desfazer')) { if (ocupado || !HIST.length) return; G = JSON.parse(HIST.pop()); return pintar(true); }
  if (quer('#sortear-nome')) { const a = gerarAgente(); $('#saida-nome').innerHTML = `<div class="ficha-agente">${fichaAgente(a)}</div>`; return; }
  if ((el = quer('[data-abrir]')) && !ocupado) return abrirFicha(el.dataset.abrir);
});
document.addEventListener('input', e => {
  if (e.target.closest('#ficha')) return aoEditarFicha(e.target);
  if (e.target.matches('[data-pal],[data-ven]')) {
    const ok = $('#pal-ok');
    if (ok) ok.disabled = !$$('[data-pal],[data-ven]').some(el => el.value.trim() !== '' && +el.value >= 0 && +el.value <= 100);
  }
});
$$('dialog').forEach(d => d.addEventListener('click', e => { if (e.target === d) d.close(); }));
const dica = $('#dica');
function mostrarDica(e) {
  const alvo = e.target.closest && e.target.closest('[data-dica]');
  if (!alvo) { dica.hidden = true; return; }
  dica.textContent = alvo.dataset.dica; dica.hidden = false;
  const larg = dica.offsetWidth, x = Math.max(8, Math.min(e.clientX - larg / 2, innerWidth - larg - 8));
  dica.style.left = x + 'px'; dica.style.top = Math.max(8, e.clientY - dica.offsetHeight - 14) + 'px';
}
document.addEventListener('pointermove', mostrarDica);
document.addEventListener('pointerdown', mostrarDica);

/* ---------- ficha da equipe (celular ou tablet, quando não dá para imprimir) ----------
   É a ficha de campo do kit em versão digital: fica salva só no aparelho da equipe (nada vai para o professor)
   e soma os pontos sozinha. Os dois botões do rodapé mostram o cartão de decisão em tela cheia. */
let FICHA = null;
const fichaVazia = () => ({ equipe: '', bonus: '', exp: Array.from({ length: 5 }, () => ({ regiao: '', pal: ['', '', '', '', ''], prov: '', pend: '', desc: '', vencer: '' })) });
const numero = v => { const n = parseFloat(String(v).replace(',', '.')); return Number.isFinite(n) ? n : 0; };
function somasFicha() {
  let total = 0;
  const linhas = FICHA.exp.map(x => { const usado = [x.prov, x.pend, x.desc].some(v => String(v).trim() !== ''); const g = numero(x.prov) + numero(x.pend) + numero(x.desc); total += g; return { usado, g, total }; });
  return { linhas, final: total + numero(FICHA.bonus) };
}
function pintarSomasFicha() {
  const s = somasFicha();
  s.linhas.forEach((l, e) => {
    $(`#f-gar-${e}`).textContent = l.usado ? l.g : '–';
    $(`#f-tot-${e}`).textContent = l.total;
    $(`#f-res-${e}`).textContent = l.usado ? `${l.g} ${l.g === 1 ? 'ponto' : 'pontos'}` : '';
  });
  $('#f-tot-fim').textContent = s.linhas[4].total; $('#f-final').textContent = s.final;
}
function pintarFichaEquipe() {
  const f = $('#ficha');
  if (f.childElementCount) return;
  const salva = cofre.ler('ficha');
  FICHA = salva && Array.isArray(salva.exp) && salva.exp.length === 5 ? salva : fichaVazia();
  const v = x => esc(x == null ? '' : x);
  const aberta = Math.max(0, FICHA.exp.findIndex(x => ![x.prov, x.pend, x.desc].some(y => String(y).trim() !== '')));
  const num = (id, rot, campo, val, extra = '') => `<label class="f-num" for="${id}">${rot}<input type="number" id="${id}" data-f="${campo}" value="${v(val)}" min="0" inputmode="decimal" placeholder="–"${extra}></label>`;
  f.innerHTML = `<label class="f-campo" for="f-equipe">Nome da equipe<input type="text" id="f-equipe" data-f="equipe" maxlength="24" value="${v(FICHA.equipe)}" placeholder="Equipe"></label>
    ${FICHA.exp.map((x, e) => `<details class="f-exp"${e === aberta ? ' open' : ''}>
      <summary>Expedição ${e + 1}<small id="f-res-${e}"></small></summary>
      <div class="f-corpo">
        <label class="f-campo" for="f-reg-${e}">Região<select id="f-reg-${e}" data-f="exp.${e}.regiao"><option value="">–</option>${REGIOES.map(r => `<option${x.regiao === r.nome ? ' selected' : ''}>${r.nome}</option>`).join('')}</select></label>
        <div><p class="f-rot">Palpites de risco (%) · um a cada perigo novo</p>
          <div class="f-linha">${x.pal.map((p, k) => num(`f-pal-${e}-${k}`, `${k + 1}º alerta`, `exp.${e}.pal.${k}`, p, ' max="100"')).join('')}</div></div>
        <div><p class="f-rot">Pontos · preencha quando a equipe retornar</p>
          <div class="f-conta">${num(`f-prov-${e}`, 'Provisórios ao retornar', `exp.${e}.prov`, x.prov)}${num(`f-pend-${e}`, 'Pendentes', `exp.${e}.pend`, x.pend)}${num(`f-desc-${e}`, 'Descoberta', `exp.${e}.desc`, x.desc)}</div></div>
        <div class="f-saida"><div class="tile"><small>Garantidos</small><b id="f-gar-${e}">–</b></div><div class="tile total"><small>Total até aqui</small><b id="f-tot-${e}">0</b></div>
          ${e < 4 ? num(`f-ven-${e}`, 'Vencer (%)', `exp.${e}.vencer`, x.vencer, ' max="100"') : '<span></span>'}</div>
      </div></details>`).join('')}
    <div class="f-fim"><div class="tile total"><small>Total das 5 expedições</small><b id="f-tot-fim">0</b></div>${num('f-bonus', 'Bônus de palpites', 'bonus', FICHA.bonus)}</div>
    <div class="tile"><small>Pontuação final</small><b id="f-final">0</b></div>
    <p class="ajuda">Se um perigo encerrar a expedição com a equipe em campo, deixe os pontos em branco: os garantidos são 0. A ficha fica salva neste aparelho.</p>
    <button class="btn" type="button" id="ficha-limpar" data-ato="ficha-limpar">Limpar a ficha</button>`;
  pintarSomasFicha();
}
function aoEditarFicha(el) {
  const caminho = el.dataset.f; if (!caminho || !FICHA) return;
  const partes = caminho.split('.'); let alvo = FICHA;
  for (let i = 0; i < partes.length - 1; i++) alvo = alvo[partes[i]];
  alvo[partes[partes.length - 1]] = el.value;
  cofre.gravar('ficha', FICHA);
  pintarSomasFicha();
}
/* Cartão de decisão em tela cheia: a equipe escolhe em segredo, segura o aparelho virado e mostra no "já". */
let travaTela = null;
function mostrarCartao(tipo) {
  const [palavra, frase, seta] = tipo === 'c'
    ? ['Continuar', 'Ficamos em campo', '<path d="M8 30h42M34 12l18 18-18 18"/>']
    : ['Retornar', 'Garantimos os pontos', '<path d="M22 14L8 28l14 14"/><path d="M10 28h26a14 14 0 0 1 0 28H24"/>'];
  const nome = FICHA && FICHA.equipe.trim();
  const c = document.createElement('button');
  c.type = 'button'; c.className = 'cartao-cheio ' + tipo;
  c.setAttribute('aria-label', `Cartão ${palavra}. Toque para fechar.`);
  c.innerHTML = `<svg viewBox="0 0 60 60" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${seta}</svg><b>${palavra}</b><span>${nome ? esc(nome) : frase}</span><i>Toque para fechar</i>`;
  c.addEventListener('click', () => { c.remove(); if (travaTela) { travaTela.release().catch(() => {}); travaTela = null; } });
  document.body.append(c); c.focus();
  // a palavra sempre cabe na largura da tela, qualquer que seja a fonte carregada
  const b = c.querySelector('b'), limite = c.clientWidth * 0.88;
  if (b.scrollWidth > limite) b.style.fontSize = (parseFloat(getComputedStyle(b).fontSize) * limite / b.scrollWidth) + 'px';
  // mantém a tela acesa enquanto o cartão está no ar, quando o aparelho permite
  if (navigator.wakeLock) navigator.wakeLock.request('screen').then(t => { travaTela = t; }).catch(() => {});
}

/* ---------- QR code do app (padrão do BACCHI LAB) ---------- */
/* O desenho do QR é fixo (src/qr.svg, embutido pelo build): aponta para o endereço do app no ar, mesmo quando a página é aberta de outro lugar. */
const ENDERECO = 'https://andrebacchi.github.io/protocolo-zero/';
$('#qr-btn').addEventListener('click', () => { $('#qr-partilhar').hidden = !navigator.share; $('#qr').showModal(); });
$('#qr-copiar').addEventListener('click', async e => {
  const b = e.currentTarget;
  try { await navigator.clipboard.writeText(ENDERECO); b.textContent = 'Link copiado'; }
  catch (_) { const r = document.createRange(); r.selectNodeContents($('#qr-end')); const s = getSelection(); s.removeAllRanges(); s.addRange(r); b.textContent = 'Selecionado: copie'; }
  setTimeout(() => { b.textContent = 'Copiar link'; }, 2200);
});
$('#qr-partilhar').addEventListener('click', () => { navigator.share({ title: 'Protocolo Zero', url: ENDERECO }).catch(() => {}); });

/* ---------- instalar (padrão do BACCHI LAB) ---------- */
/* Janela em que o app está rodando: "navegador" (aba comum), "propria" (instalado, na janela dele) ou "outra"
   (aberto dentro de outro app instalado, como o BACCHI LAB). */
function janelaApp(k) {
  if (!(matchMedia('(display-mode: standalone)').matches || navigator.standalone === true)) return 'navegador';
  let fora = false, marca = false;
  try { const r = document.referrer && new URL(document.referrer); fora = !!r && r.origin === location.origin && !r.pathname.startsWith(new URL('./', location.href).pathname); } catch (e) { /* sem referrer */ }
  try { if (!document.referrer) localStorage.setItem(k, '1'); if (!fora) sessionStorage.setItem(k, '1'); marca = localStorage.getItem(k) === '1' || sessionStorage.getItem(k) === '1'; } catch (e) { /* sem armazenamento */ }
  return !fora || marca ? 'propria' : 'outra';
}
function appInstalado(k) {
  if (!navigator.getInstalledRelatedApps) return Promise.resolve(false);
  return navigator.getInstalledRelatedApps().then(l => { if (l.length) { try { localStorage.setItem(k, '1'); } catch (e) { /* sem armazenamento */ } } return l.length > 0; }).catch(() => false);
}
if (PWA) {
  $('#kit-linha').hidden = false;
  const botao = $('#instalar-btn');
  let adiado = null;
  const JAN_K = 'protocolo-zero:instalado'; let janela = janelaApp(JAN_K);
  addEventListener('beforeinstallprompt', e => { e.preventDefault(); adiado = e; });
  addEventListener('appinstalled', () => { try { localStorage.setItem(JAN_K, '1'); } catch (_) { /* sem armazenamento */ } botao.hidden = true; });
  botao.hidden = janela === 'propria';   // só some na janela do próprio app instalado
  if (janela === 'outra') appInstalado(JAN_K).then(ok => { if (ok) { janela = 'propria'; botao.hidden = true; } });
  const PASSOS = {
    ios: ['Abra esta página no <b>Safari</b>.', 'Toque em <b>Compartilhar</b> <kbd>⬆︎</kbd>.', 'Toque em <b>Adicionar à Tela de Início</b>.', 'Confirme o nome e toque em <b>Adicionar</b>.'],
    android: ['Abra esta página no <b>Chrome</b>.', 'Toque no menu <kbd>⋮</kbd>.', 'Toque em <b>Instalar app</b> ou <b>Adicionar à tela inicial</b>.', 'Confirme. O ícone aparece junto dos seus apps.'],
    desktop: ['<b>Chrome ou Edge:</b> use o ícone de instalar na barra de endereço, ou o menu <kbd>⋮</kbd> → <b>Transmitir, salvar e compartilhar</b> → <b>Instalar página como app</b>.', '<b>Safari (Mac):</b> menu <b>Arquivo</b> → <b>Adicionar ao Dock</b>.', '<b>Qualquer navegador:</b> salve nos favoritos com <kbd>Ctrl</kbd>+<kbd>D</kbd>.']
  };
  const ABAS = [['ios', 'iPhone e iPad'], ['android', 'Android'], ['desktop', 'Computador']];
  const plataforma = () => { const u = navigator.userAgent || ''; if (/iPhone|iPad|iPod/.test(u) || (/Macintosh/.test(u) && navigator.maxTouchPoints > 1)) return 'ios'; return /Android/.test(u) ? 'android' : 'desktop'; };
  const aba = k => {
    $('#abas').innerHTML = ABAS.map(([id, l]) => `<button class="chip" type="button" data-aba="${id}" aria-pressed="${id === k}">${l}</button>`).join('');
    $('#passos').innerHTML = PASSOS[k].map(p => `<li>${p}</li>`).join('');
  };
  $('#abas').addEventListener('click', e => { const b = e.target.closest('[data-aba]'); if (b) aba(b.dataset.aba); });
  botao.addEventListener('click', async () => {
    if (adiado) { try { adiado.prompt(); const r = await adiado.userChoice; adiado = null; if (r && r.outcome === 'accepted') return; } catch (_) { /* segue para as instruções */ } }
    $('#instalar-fora').hidden = janela !== 'outra';
    aba(plataforma());
    $('#instalar').showModal();
  });
  // Funciona sem internet: o service worker guarda o app, e as imagens são guardadas aos poucos, em segundo plano.
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
    const guardarImagens = async () => {
      try {
        const c = await caches.open(FIXOS);
        const tem = new Set((await c.keys()).map(r => new URL(r.url).pathname));
        for (const caminho of IMAGENS) { const u = new URL(caminho, location.href); if (!tem.has(u.pathname)) await c.add(u.href); }
      } catch (_) { /* sem rede ou sem espaço: tenta de novo na próxima visita */ }
    };
    if (document.readyState === 'complete') setTimeout(guardarImagens, 1500); else addEventListener('load', () => setTimeout(guardarImagens, 1500));
  }
}

/* ---------- capa e partida em andamento ---------- */
function iniciar(dados) {
  pintarNomes();
  const naFicha = location.hash === '#equipe' || (dados && dados.tela === 'equipe');
  if (dados && dados.G && dados.G.v === 3) { G = dados.G; ir(naFicha ? 'equipe' : dados.tela === 'fim' || G.fase === 'fim' ? 'fim' : dados.tela === 'jogo' ? 'jogo' : 'capa'); }
  else {
    const salvo = cofre.ler('partida');
    if (salvo && salvo.G && salvo.G.v === 3) { G = salvo.G; HIST.push(...(salvo.hist || [])); }
    ir(naFicha ? 'equipe' : 'capa');
  }
}
const quente = window.claude && window.claude.hot;
if (quente && quente.snapshot) quente.snapshot(() => ({ G, tela: telaAtual }));
if (quente && quente.ready) quente.ready(iniciar); else iniciar((quente && quente.data) || {});
})();
