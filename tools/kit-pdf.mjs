// Gera kit/Protocolo-Zero-kit-de-sala.pdf a partir de tools/kit.html.
// Antes: cd tools && npm i playwright @fontsource/saira-condensed @fontsource/saira-stencil-one @fontsource/public-sans @fontsource/ibm-plex-mono
// Depois: node kit-pdf.mjs   (o Chromium do Playwright precisa estar instalado)
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
const aqui = path.dirname(fileURLToPath(import.meta.url));
const b = await chromium.launch();
const p = await b.newPage();
await p.goto('file://' + path.join(aqui, 'kit.html'));
await p.evaluate(() => document.fonts.ready);
await p.pdf({ path: path.join(aqui, '..', 'kit', 'Protocolo-Zero-kit-de-sala.pdf'), printBackground: true, preferCSSPageSize: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
await b.close();
