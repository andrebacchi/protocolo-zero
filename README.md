# Protocolo Zero

Uma investigação epidemiológica para quem sabe a hora de voltar. Jogo de sala de aula sobre probabilidade e decisão sob risco, de André Demambre Bacchi.

Endereço: **https://andrebacchi.github.io/protocolo-zero/** · faz parte do [BACCHI LAB](https://andrebacchi.github.io/bacchilab/), em "Jogos e sátiras".

## O que tem

- **Painel do professor:** de 3 a 8 equipes, tela projetada, decisão simultânea com cartões de CONTINUAR e RETORNAR. O placar fica oculto e cada equipe anota o seu.
- **Palpites de risco:** a cada perigo novo, cada equipe estima a probabilidade de a próxima carta encerrar a expedição. O risco real só aparece no relatório final.
- **Probabilidade de vencer:** declarada por equipe ao fim de cada expedição e comparada, no fim, com uma estimativa feita a partir do placar real.
- **Relatório final:** calibração dos palpites por equipe, ranking e bônus de palpites, risco real carta a carta e decisões com valor esperado negativo.
- **Expedição solo:** uma partida contra três equipes automáticas.
- **Kit de sala (PDF):** cartões de decisão no tamanho de carta padrão (63,5 × 88 mm) e ficha de campo, em `kit/`.

A mecânica de *push your luck* vem de *Diamant* / *Incan Gold* (Tesouro Inca), de Alan R. Moon e Bruno Faidutti. Tema, cartas, textos e artes são originais.

## Como atualizar

1. Edite os arquivos em `src/` (telas em `src/body.html`, visual em `src/app.css`, lógica e textos em `src/app.js`).
2. Aumente `VERSAO` no `build.py`.
3. Rode `sh build.sh` (gera `index.html` e `sw.js`) e publique na branch `main`.

Detalhes em `CLAUDE.md`.

© André Demambre Bacchi. Todos os direitos reservados. Uso educacional.
