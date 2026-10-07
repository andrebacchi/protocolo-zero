# Protocolo Zero: guia de manutenção

App do BACCHI LAB (seção "Jogos e sátiras"). Leia também o `CLAUDE.md` do repositório `bacchilab`, que traz as regras gerais dos apps do André.
Publicação: GitHub Pages, branch `main`, raiz. Endereço: https://andrebacchi.github.io/protocolo-zero/

## Estrutura

- `src/` é a fonte. `sh build.sh` gera `index.html` e `sw.js` na raiz (os dois são arquivos gerados: não edite à mão).
  `sh build.sh artifact` gera `dist/artifact.html`, para pré-visualizar como artefato (sem instalação nem service worker; publique junto `cards/`, `regioes/` e `icons/icone.webp`).
- `cards/`: 25 cartas, verso e capa (600 × 840, WebP; capa em 1600 px). `regioes/`: paisagem de cada região (N, NE, CO, SE, S). `icons/`: ícones do app.
- `kit/Protocolo-Zero-kit-de-sala.pdf`: material impresso. A fonte é `tools/kit.html`; `tools/kit-pdf.mjs` gera o PDF (instruções no próprio arquivo).
- `src/qr.svg`: QR code do endereço do app, embutido pelo build (botão "QR code" da capa). É fixo; `tools/qr.cjs` mostra como foi gerado com o `qrcode.js` do repositório `bacchilab`.
- `tools/mapa.py`: gerou os contornos dos estados a partir de um GeoJSON aberto (Code for America, click_that_hood), simplificado com mapshaper.

## Toda atualização

- Aumente `VERSAO` no `build.py`: ela aparece no rodapé e dá nome ao cache do app (`protocolo-zero-app-<versão>`).
  O cache das imagens e fontes (`FIXOS`) só muda se as imagens mudarem.
- Rode `sh build.sh` e publique `index.html` e `sw.js` junto com a fonte.
- Teste em 390 px e em 1280 px, sem rolagem horizontal. O proxy da sessão bloqueia `fonts.googleapis.com` e `github.io`:
  teste com um servidor local + Playwright (as fontes podem ser instaladas pelos pacotes `@fontsource/*`) e peça ao André para conferir o site no ar.
- Commits com autor "André Demambre Bacchi".

## Regras do jogo (decisões do André)

- Regras do Incan Gold: 15 coletas (1, 2, 3, 4, 5, 5, 7, 7, 9, 11, 11, 13, 14, 15, 17), 15 perigos (5 tipos × 3) e descobertas que entram uma por expedição,
  em ordem fixa: Paciente 0 (5), Fonte da exposição (7), Via de transmissão (10), Agente isolado (12), Genoma sequenciado (15).
- Vocabulário: "coleta de dados", "descoberta importante", "dados provisórios" (o que a equipe juntou e ainda pode perder) e "dados pendentes" (o resto das divisões).
  Escreva "probabilidade", não "chance".
- A primeira carta de cada expedição nunca é um perigo (sorteada entre coletas e descobertas); o resto do monte é aleatório. Vale também na simulação.
- Cinco expedições, uma por região do Brasil, em ordem sorteada. As regiões são só cenário: não mudam baralho nem regras.
- Placar oculto por padrão. O risco real nunca aparece durante a partida, só no relatório final, para as equipes não calibrarem os palpites pelo resultado anterior.
- Palpite de risco: todas as equipes respondem a cada perigo novo (alerta), inclusive as que já retornaram. Bônus de 5, 3 e 1 ponto (`PREMIO`) para os menores erros absolutos médios;
  só entra no ranking quem respondeu a pelo menos metade das pausas.
- Probabilidade de vencer: declarada ao fim das expedições 1 a 4. A referência é uma simulação (`simular`, 3.000 partidas) que supõe que todas as equipes joguem do mesmo jeito; é uma estimativa.
- A carta "Paciente 0" explica o erro de leitura do "paciente O" e não cita o nome da pessoa.
- Gerador de nomes do agente (`gerarAgente`): sem lugar, pessoa ou animal (OMS, 2015); `BLOQUEIO` é uma lista inicial de radicais barrados.

## Como as coisas funcionam

- **Visual:** mesa de operações de campo em azul-marinho; coleta em verde-água, perigo em vermelho-alaranjado, descoberta em dourado.
  Fontes: Saira Condensed (títulos), Saira Stencil One (carimbos), Public Sans (texto), IBM Plex Mono (rótulos e números).
- **Estado:** tudo em `G` (`src/app.js`). `salvar()` empilha o estado para o Desfazer; `gravarPartida()` grava no aparelho a cada jogada
  (localStorage, prefixo `protocolo-zero:`), e a capa oferece "Continuar a partida". `G.v` é a versão do formato: aumente se mudar a estrutura, para descartar partidas salvas antigas.
- **Revelar carta (`apresentar`):** não use `fill: 'forwards'` encadeado; a posição de palco vai no estilo da carta e é limpa no fim (com fill, a carta às vezes ficava presa ampliada).
- **Service worker:** apaga só os caches com prefixo `protocolo-zero-` (todos os apps dividem a origem `andrebacchi.github.io`). As 33 imagens são guardadas em segundo plano na primeira visita.

## Pendências

- Os textos históricos das descobertas (John Snow, aids em 1983, Carlos Chagas, SARS-CoV-2) aguardam revisão do André.
- O jogo ainda não foi testado com uma turma: ritmo das animações e duração da partida são suposições.
- Ideias em aberto: partida curta (3 expedições), exportar o relatório em formato de planilha, explicar o nome "Protocolo Zero" na abertura.
