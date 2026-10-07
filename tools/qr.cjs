// Gera o desenho do QR code de cada app (mesma biblioteca e mesmo traço do hub: qrcode.js de Kazuhiko Arase, nível M, margem de 2 módulos).
// Uso: node qr.cjs caminho/para/bacchilab/qrcode.js
const qrcode = require(require('path').resolve(process.argv[2] || '../../bacchilab/qrcode.js'));
const fs = require('fs');
const out = {};
for (const repo of ['protocolo-zero', 'tarot-cetico', 'nomo-lab', 'stat-lab', 'farmaco-lab', '2-2-lab', 'bingo-picareta', 'gerador-pseudociencias', 'bacchilab']) {
  const url = `https://andrebacchi.github.io/${repo}/`;
  const q = qrcode(0, 'M'); q.addData(url); q.make();
  const n = q.getModuleCount(), m = 2, s = n + m * 2;
  let d = '';
  for (let r = 0; r < n; r++) { let c = 0; while (c < n) { if (!q.isDark(r, c)) { c++; continue; } let w = 1; while (c + w < n && q.isDark(r, c + w)) w++; d += `M${c + m} ${r + m}h${w}v1h-${w}z`; c += w; } }
  out[repo] = { url, s, d };
  fs.writeFileSync(`${repo}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s} ${s}" shape-rendering="crispEdges"><rect width="${s}" height="${s}" fill="#fff"/><path d="${d}" fill="#161a22"/></svg>\n`);
  console.log(repo, 'módulos', n, 'path', d.length, 'bytes');
}
fs.writeFileSync('qr.json', JSON.stringify(out));
