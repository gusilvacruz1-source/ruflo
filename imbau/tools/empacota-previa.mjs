/**
 * Junta o build num único HTML: CSS, JS e imagens embutidos em data: URI.
 * Serve para mandar a prévia para alguém sem subir nada — abre com dois
 * cliques, sem servidor e sem pasta de assets ao lado.
 *
 *   npm run build && node tools/empacota-previa.mjs . previa.html
 *
 * Da visita entra só o conjunto do celular: 80 quadros bastam para mostrar o
 * efeito e evitam um arquivo de dez megabytes.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { extname, resolve } from 'node:path';

const raiz = process.argv[2];
const destino = process.argv[3];
const dist = resolve(raiz, 'dist');

const tipos = {
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
};
const dataUri = (caminho) =>
  `data:${tipos[extname(caminho)]};base64,${readFileSync(caminho).toString('base64')}`;

const assets = readdirSync(resolve(dist, 'assets'));
let css = readFileSync(resolve(dist, 'assets', assets.find((f) => f.endsWith('.css'))), 'utf8');

// As fontes são arquivos do projeto e o CSS as pede por url(): sem embutir,
// a prévia cai na serifa do sistema e perde justamente a voz do site.
let fontes = 0;
for (const arquivo of assets.filter((f) => f.endsWith('.woff2'))) {
  if (!css.includes(arquivo)) continue;
  css = css.replaceAll(`./${arquivo}`, dataUri(resolve(dist, 'assets', arquivo)));
  fontes++;
}
let js = readFileSync(resolve(dist, 'assets', assets.find((f) => f.endsWith('.js'))), 'utf8');

// As imagens de public/ aparecem no bundle como texto: troca por data: URI.
const arquivos = [
  ...readdirSync(resolve(dist, 'imagens')).map((f) => [`imagens/${f}`, resolve(dist, 'imagens', f)]),
  ...readdirSync(resolve(dist, 'marca')).map((f) => [`marca/${f}`, resolve(dist, 'marca', f)]),
];
let trocadas = 0;
for (const [ref, caminho] of arquivos) {
  if (!js.includes(`"${ref}"`)) continue;
  js = js.replaceAll(`"${ref}"`, JSON.stringify(dataUri(caminho)));
  trocadas++;
}
js = js.replaceAll('</script', '<\\/script');

// Os quadros da visita são montados em tempo de execução, então não aparecem
// como texto no bundle: vão embutidos à parte. Só o conjunto do celular — 80
// quadros bastam para a prévia e evitam um arquivo de dez megabytes.
const quadros = {};
const pastaVisita = resolve(dist, 'visita', 'mobile');
for (const arquivo of readdirSync(pastaVisita).sort()) {
  quadros[`visita/mobile/${arquivo}`] = dataUri(resolve(pastaVisita, arquivo));
}

const html = `<title>Imbaú Imobiliária</title>
<script>
window.__CONJUNTO__ = 'mobile';
window.__QUADROS__ = ${JSON.stringify(quadros)};
</script>
<style>
${css}
</style>
<div id="root"></div>
<script type="module">
${js}
</script>
`;

writeFileSync(destino, html);
console.log(
  `fontes embutidas: ${fontes} · imagens embutidas: ${trocadas} · tamanho: ${(
    Buffer.byteLength(html) / 1024 / 1024
  ).toFixed(2)} MB`
);
