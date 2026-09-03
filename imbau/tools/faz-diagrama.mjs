/**
 * Gera docs/estrutura.excalidraw — o mapa da página: a capa que fica presa e
 * as seções que passam por cima dela, com o tom de cada uma.
 *
 * Gerado por script de propósito: montar o JSON à mão é como se esquece um
 * boundElements e a seta descola da caixa no primeiro arrasto.
 *
 *   node tools/faz-diagrama.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../docs');

let semente = 7;
const sorteia = () => (semente = (semente * 1103515245 + 12345) % 2147483647);

const base = (extra) => ({
  angle: 0,
  strokeColor: '#1e1e1e',
  backgroundColor: 'transparent',
  fillStyle: 'solid',
  strokeWidth: 2,
  strokeStyle: 'solid',
  roughness: 1,
  opacity: 100,
  groupIds: [],
  frameId: null,
  roundness: { type: 3 },
  seed: sorteia(),
  version: 1,
  versionNonce: sorteia(),
  isDeleted: false,
  boundElements: [],
  updated: 1,
  link: null,
  locked: false,
  ...extra,
});

const elementos = [];

/** Caixa com o texto já ancorado dentro — a ligação vai nos dois sentidos. */
function caixa(id, x, y, largura, altura, texto, cores = {}) {
  const idTexto = `${id}-txt`;
  elementos.push(
    base({
      id,
      type: 'rectangle',
      x,
      y,
      width: largura,
      height: altura,
      boundElements: [{ id: idTexto, type: 'text' }],
      ...cores,
    }),
    base({
      id: idTexto,
      type: 'text',
      x: x + 12,
      y: y + altura / 2 - 12,
      width: largura - 24,
      height: 25,
      text: texto,
      originalText: texto,
      fontSize: 20,
      fontFamily: 1,
      textAlign: 'center',
      verticalAlign: 'middle',
      containerId: id,
      lineHeight: 1.25,
      baseline: 18,
      roundness: null,
      strokeColor: cores.strokeColor ?? '#1e1e1e',
    })
  );
  return { id, x, y, largura, altura };
}

/** Seta ligada nas duas pontas: arrastar a caixa leva a seta junto. */
function seta(id, de, para) {
  const x = de.x + de.largura / 2;
  const y = de.y + de.altura;
  const dy = para.y - y;
  elementos.push(
    base({
      id,
      type: 'arrow',
      x,
      y,
      width: 0,
      height: dy,
      points: [
        [0, 0],
        [0, dy],
      ],
      roundness: { type: 2 },
      startBinding: { elementId: de.id, focus: 0, gap: 8 },
      endBinding: { elementId: para.id, focus: 0, gap: 8 },
      startArrowhead: null,
      endArrowhead: 'arrow',
    })
  );
  for (const alvo of [de.id, para.id]) {
    const el = elementos.find((e) => e.id === alvo);
    el.boundElements = [...el.boundElements, { id, type: 'arrow' }];
  }
}

function rotulo(x, y, texto, cor = '#868e96') {
  elementos.push(
    base({
      id: `rot-${sorteia()}`,
      type: 'text',
      x,
      y,
      width: 260,
      height: 22,
      text: texto,
      originalText: texto,
      fontSize: 16,
      fontFamily: 1,
      textAlign: 'left',
      verticalAlign: 'top',
      containerId: null,
      lineHeight: 1.25,
      baseline: 15,
      roundness: null,
      strokeColor: cor,
    })
  );
}

/* ---------- o mapa ---------- */

const COL = 420;
const LARG = 300;
const ALT = 70;

const capa = caixa('capa', COL, 60, LARG, 90, 'Capa — fica presa', {
  strokeColor: '#1e1e1e',
  backgroundColor: '#ced4da',
  fillStyle: 'hachure',
});
rotulo(COL + LARG + 30, 85, 'sticky top-0, z-0');
rotulo(COL + LARG + 30, 110, 'quadro da filmagem, 1440 px');

// [nome, escura?] — o tom de cada seção, que é o que o menu lê para
// trocar de roupa ao passar por cima.
const capitulos = [
  ['Serviços', false],
  ['Imóveis', true],
  ['A visita', true],
  ['A corretora', false],
  ['Avaliações', false],
  ['Avaliação gratuita', false],
  ['Dúvidas', false],
  ['Contato', false],
];

let anterior = capa;
capitulos.forEach(([nome, escura], i) => {
  const atual = caixa(
    `cap-${i}`,
    COL,
    210 + i * 110,
    LARG,
    ALT,
    nome,
    escura
      ? { strokeColor: '#1e1e1e', backgroundColor: '#868e96', fillStyle: 'solid' }
      : {}
  );
  seta(`seta-${i}`, anterior, atual);
  anterior = atual;
});

const rodape = caixa('rodape', COL, 210 + capitulos.length * 110, LARG, ALT, 'Rodapé');
seta('seta-fim', anterior, rodape);

rotulo(COL - 300, 210, 'As seções passam por cima');
rotulo(COL - 300, 235, 'da capa: z-10 + sombra');
rotulo(COL - 300, 260, 'da costura no alto.');
rotulo(COL + LARG + 30, 320, 'blocos escuros');
rotulo(COL + LARG + 30, 345, 'no meio do claro');

const arquivo = {
  type: 'excalidraw',
  version: 2,
  source: 'https://excalidraw.com',
  elements: elementos,
  appState: { gridSize: null, viewBackgroundColor: '#ffffff' },
  files: {},
};

mkdirSync(OUT, { recursive: true });
writeFileSync(resolve(OUT, 'estrutura.excalidraw'), JSON.stringify(arquivo, null, 2));
console.log(`gerado: docs/estrutura.excalidraw · ${elementos.length} elementos`);
