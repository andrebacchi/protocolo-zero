#!/usr/bin/env python3
"""Monta o app a partir de src/.
  python3 build.py            -> index.html e sw.js (site completo, para o GitHub Pages)
  python3 build.py artifact   -> dist/artifact.html (página para publicar como artefato, sem instalação)
As imagens ficam em cards/ e regioes/ e são referenciadas por caminho relativo.
A cada atualização publicada, aumente VERSAO: ela aparece no rodapé e renova o cache de quem instalou o app."""
import glob, json, os, re, sys

RAIZ = os.path.dirname(os.path.abspath(__file__))
VERSAO = '1.3'
FIXOS = 'protocolo-zero-fixos-v1'   # cache das imagens e fontes; só mude se as imagens mudarem
SITE = 'https://andrebacchi.github.io/protocolo-zero/'
HUB = 'https://andrebacchi.github.io/bacchilab/'
FONTES = 'https://fonts.googleapis.com/css2?family=Saira+Condensed:wght@500;600;700&family=Saira+Stencil+One&family=Public+Sans:ital,wght@0,400;0,500;0,700;1,400&family=IBM+Plex+Mono:wght@400;500;600&display=swap'
TITULO = 'Protocolo Zero'
DESCRICAO = 'Jogo de sala de aula sobre probabilidade e decisão sob risco: uma investigação epidemiológica para quem sabe a hora de voltar.'
ARTEFATO = len(sys.argv) > 1 and sys.argv[1] == 'artifact'

def ler(nome):
    with open(os.path.join(RAIZ, 'src', nome), encoding='utf-8') as f:
        return f.read()

def gravar(caminho, texto):
    with open(caminho, 'w', encoding='utf-8') as f:
        f.write(texto)
    print(os.path.relpath(caminho, RAIZ), f'{len(texto.encode()) / 1024:.0f} KB')

imagens = sorted(os.path.relpath(f, RAIZ).replace(os.sep, '/') for pasta in ('cards', 'regioes') for f in glob.glob(os.path.join(RAIZ, pasta, '*.webp')))
assert len(imagens) == 32, f'esperava 32 imagens (25 cartas, verso, capa e 5 regiões); achei {len(imagens)}'

css = ler('app.css')
js = (ler('app.js')
      .replace('__PWA__', 'false' if ARTEFATO else 'true')
      .replace('__FIXOS__', FIXOS)
      .replace('__IMAGENS__', json.dumps(imagens)))
corpo = (ler('body.html')
         .replace('__VERSAO__', VERSAO)
         .replace('__QR__', re.sub(r'>\s+<', '><', ler('qr.svg').strip()).replace('<svg ', '<svg role="img" aria-label="QR code para andrebacchi.github.io/protocolo-zero" '))
         .replace('__QR_EQUIPE__', re.sub(r'>\s+<', '><', ler('qr-equipe.svg').strip()).replace('<svg ', '<svg role="img" aria-label="QR code para a ficha da equipe" '))
         .replace('__HUB__', HUB)
         .replace('__HUB_ALVO__', ' target="_blank" rel="noopener"' if ARTEFATO else ''))
assert '__' not in corpo.replace('__proto__', ''), 'sobrou marcador sem substituir em body.html'

miolo = f'''<title>{TITULO}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="{FONTES}">
<style>
{css}</style>

{corpo}<script>
{js}</script>
'''

if ARTEFATO:
    os.makedirs(os.path.join(RAIZ, 'dist'), exist_ok=True)
    gravar(os.path.join(RAIZ, 'dist', 'artifact.html'), miolo)
else:
    cabeca, resto = miolo.split('<style>', 1)
    estilo, resto = resto.split('</style>', 1)
    gravar(os.path.join(RAIZ, 'index.html'), f'''<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="description" content="{DESCRICAO}">
<meta name="theme-color" content="#10223a">
<meta property="og:title" content="{TITULO}">
<meta property="og:description" content="{DESCRICAO}">
<meta property="og:image" content="{SITE}icons/icon-512.png">
<link rel="manifest" href="manifest.json">
<link rel="icon" type="image/png" href="icons/favicon-64.png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="{TITULO}">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
{cabeca}<style>
:root{{padding:env(safe-area-inset-top,0px) 0 env(safe-area-inset-bottom,0px)}}
[hidden]{{display:none!important}}
img{{max-width:100%}}
{estilo}</style>
</head>
<body>
{resto}</body>
</html>
''')
    gravar(os.path.join(RAIZ, 'sw.js'), ler('sw.js').replace('__VERSAO__', VERSAO).replace('__FIXOS__', FIXOS))
