/* ============================================================================
   SPACE PERSONALIZADOS — cup3d.js
   Copo gerado por código. WebGL puro, sem three.js, sem biblioteca nenhuma.
   ----------------------------------------------------------------------------
   O copo é uma SUPERFÍCIE DE REVOLUÇÃO: um perfil 2D (parede externa, lábio da
   borda, parede interna, fundo) girado em torno do eixo Y.

   O corpo é inox com REVESTIMENTO ANODIZADO azul: pigmento fosco por baixo,
   verniz por cima. Quem devolve a forma da luz é o verniz, via Fresnel. Só o
   aro da boca e o pé ficam com o metal cru à mostra.

   O estúdio é procedural: não há HDR para baixar. Mas as luzes são PAINÉIS
   retangulares, não pontos — é o que faz a parede curva devolver uma listra
   comprida em vez de um borrão redondo. Junto com o horizonte refletido, o
   grão do acabamento e o tonemap filmico, é o que separa "foto de produto"
   de "render".
   ========================================================================== */

(function (global) {
'use strict';

/* --- PERFIL DO COPO (raio, altura) — edite aqui a forma ------------------ */
const PROFILE_OUT = [
  [0.000, 0.000], [0.212, 0.000], [0.250, 0.004], [0.264, 0.020],
  [0.270, 0.055], [0.286, 0.300], [0.306, 0.620], [0.318, 0.820],
  [0.326, 0.910], [0.329, 0.945]
];
const LIP = [
  [0.329, 0.945], [0.327, 0.957], [0.317, 0.962], [0.307, 0.956]
];
/* Parede mais grossa e base pesada: é o que separa um copo de vidro de um
   cilindro oco. A espessura é o que dá a lente na borda e o brilho no fundo. */
const PROFILE_IN = [
  [0.307, 0.956], [0.299, 0.900], [0.283, 0.620], [0.259, 0.300],
  [0.242, 0.150], [0.231, 0.124], [0.180, 0.115], [0.090, 0.112],
  [0.052, 0.117], [0.022, 0.122], [0.000, 0.124]   // calota central do fundo
];

const SEG = 128;                    // divisões ao redor do eixo (em 168 não
                                    // havia diferença visível na silhueta)
const BAND_TOP = 0.938;             // acima disto: aro de aço da boca
const BAND_BOT = 0.017;             // abaixo disto: pé de aço

/* --- matemática mínima de matriz ----------------------------------------- */
const M4 = {
  mul(a, b) {
    const o = new Float32Array(16);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
      let s = 0;
      for (let k = 0; k < 4; k++) s += a[k * 4 + j] * b[i * 4 + k];
      o[i * 4 + j] = s;
    }
    return o;
  },
  perspective(fovy, aspect, near, far) {
    const f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
    return new Float32Array([
      f / aspect, 0, 0, 0,  0, f, 0, 0,
      0, 0, (far + near) * nf, -1,  0, 0, 2 * far * near * nf, 0
    ]);
  },
  lookAt(eye, center, up) {
    const z = norm(sub(eye, center));
    const x = norm(cross(up, z));
    const y = cross(z, x);
    return new Float32Array([
      x[0], y[0], z[0], 0,  x[1], y[1], z[1], 0,  x[2], y[2], z[2], 0,
      -dot(x, eye), -dot(y, eye), -dot(z, eye), 1
    ]);
  }
};
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const mix = (a, b, t) => a + (b - a) * t;
const sstep = (e0, e1, x) => { const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };

/* --- geometria: revolve o perfil ----------------------------------------- */
function buildGeometry() {
  const rings = [];
  const push = (pts, inside) => {
    for (let i = 0; i < pts.length; i++) {
      const [r, y] = pts[i];
      // normal do perfil pela tangente entre vizinhos
      const p = pts[Math.max(0, i - 1)], n = pts[Math.min(pts.length - 1, i + 1)];
      let tx = n[0] - p[0], ty = n[1] - p[1];
      const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
      // Gira a tangente 90°. O perfil externo sobe e o interno desce, então
      // a mesma rotação já produz normal para fora e para dentro — inverter
      // de novo no caso interno só criava normal errada escondida pelo flip
      // de duas faces do shader.
      rings.push({ r, y, nr: ty, ny: -tx, inside: inside ? 1 : 0 });
    }
  };
  push(PROFILE_OUT, false);
  push(LIP, false);
  push(PROFILE_IN, true);
  const anelSombra = rings.length;          // onde a casca acaba

  const pos = [], nrm = [], att = [], idx = [];
  for (let i = 0; i < rings.length; i++) {
    const R = rings[i];
    for (let s = 0; s <= SEG; s++) {
      const a = s / SEG * Math.PI * 2;
      const ca = Math.cos(a), sa = Math.sin(a);
      pos.push(R.r * ca, R.y, R.r * sa);
      nrm.push(R.nr * ca, R.ny, R.nr * sa);
      att.push(R.y, R.inside, s / SEG);       // altura, dentro/fora, ângulo
    }
  }
  const W = SEG + 1;
  for (let i = 0; i < rings.length - 1; i++) {
    // o último ponto do lábio e o primeiro do perfil interno são o mesmo:
    // a faixa entre eles nasce degenerada e não desenha nada
    for (let s = 0; s < SEG; s++) {
      const a = i * W + s, b = a + 1, c = a + W, d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
  }
  /* Chão: um disco no plano y=0 que só existe para receber a sombra de
     contato. Sem ele o copo flutua — é a sombra que informa ao olho onde a
     peça está apoiada, e é o que mais acrescenta volume. */
  const baseSombra = pos.length / 3;
  const RS = 0.92;
  pos.push(0, 0.0004, 0); nrm.push(0, 1, 0); att.push(0, 2, 0);   // centro
  for (let s2 = 0; s2 <= SEG; s2++) {
    const a2 = s2 / SEG * Math.PI * 2;
    pos.push(Math.cos(a2) * RS, 0.0004, Math.sin(a2) * RS);
    nrm.push(0, 1, 0);
    att.push(1, 2, s2 / SEG);                 // aAtt.x = 1 na borda do disco
  }
  const iniSombra = idx.length;
  for (let s2 = 0; s2 < SEG; s2++) {
    idx.push(baseSombra, baseSombra + 1 + s2, baseSombra + 2 + s2);
  }

  return {
    pos: new Float32Array(pos), nrm: new Float32Array(nrm),
    att: new Float32Array(att), idx: new Uint32Array(idx),
    iniSombra
  };
}

/* --- textura da gravação a laser ----------------------------------------- */
/* A marca real da empresa, em PNG com alfa, extraída do material dela. Ela é
   carregada de fora, então a textura nasce com um desenho de reserva e é
   reassada quando o arquivo chega — nada depende de a imagem existir. */
const MARCA_SRC = 'assets/marca.webp';
let marcaImg = null;

function engravingTexture() {
  const c = document.createElement('canvas');
  c.width = 2048; c.height = 512;
  const g = c.getContext('2d');
  g.fillStyle = '#000'; g.fillRect(0, 0, c.width, c.height);

  if (marcaImg && marcaImg.complete && marcaImg.naturalWidth) {
    /* A marca dá a volta no copo, mas quem olha de frente enxerga só um terço
       da circunferência — então ela tem que caber nessa janela. */
    const h = c.height * 0.90;
    const w = h * (marcaImg.naturalWidth / marcaImg.naturalHeight);
    g.drawImage(marcaImg, (c.width - w) / 2, (c.height - h) / 2, w, h);
    return c;
  }

  // reserva: só o nome, até o arquivo da marca chegar
  g.translate(c.width / 2, c.height / 2);
  g.fillStyle = '#fff'; g.textAlign = 'center';
  g.font = '700 120px Archivo, system-ui, sans-serif';
  g.fillText('SPACE', 0, 20);
  g.font = '600 34px Archivo, system-ui, sans-serif';
  g.letterSpacing = '10px';
  g.fillText('PERSONALIZADOS', 5, 74);
  return c;
}

/* --- shaders -------------------------------------------------------------- */
const VERT = `
attribute vec3 aPos;
attribute vec3 aNrm;
attribute vec3 aAtt;          // y, dentro/fora, ângulo 0..1
uniform mat4 uProj, uView;
varying vec3 vW, vN;
varying vec3 vA;
void main() {
  vW = aPos;
  vN = normalize(aNrm);
  vA = aAtt;
  gl_Position = uProj * uView * vec4(aPos, 1.0);
}`;

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec3 vW, vN, vA;
uniform vec3 uCam;
uniform sampler2D uEtch;
uniform float uBandTop, uBandBot;
uniform float uPass;        // 0 = o copo · 2 = sombra de contato
uniform float uSombra;      // força da sombra de contato
uniform float uRuido;       // semente do grão de sensor
uniform vec2  uRig;         // cosseno/seno do azimute da câmera

/* MESA GIRATÓRIA. Antes as luzes ficavam paradas no mundo e a câmera é que
   dava a volta: a peça passava de quase branca a quase preta ao longo do
   giro, o que nenhum packshot faz. Num estúdio de verdade quem gira é a peça;
   a softbox, a tira de recorte e o preenchimento ficam onde estão em relação
   à câmera. Esta rotação leva a normal e o reflexo para o referencial do rig,
   com a câmera fixa em +X. O grão e a gravação continuam presos à superfície
   — é a peça que roda, e é isso que se vê. */
vec3 paraRig(vec3 v) {
  return vec3(v.x * uRig.x + v.z * uRig.y, v.y, uRig.x * v.z - uRig.y * v.x);
}

/* ---------------------------------------------------------------------------
   ESTÚDIO PROCEDURAL
   Antes cada luz era um PONTO: smoothstep(dot(d, dir)) devolve um borrão
   redondo, e borrão redondo refletido em parede cilíndrica vira degradê. Era
   por isso que o copo lia como plástico — de perfil não havia nada na parede
   além de um gradiente perfeito.
   Numa mesa de produto de verdade a luz é um PAINEL: alto, estreito, de borda
   definida. Refletido na curva ele vira uma listra comprida que corre pela
   peça — a assinatura de foto de produto. E o cenário tem um HORIZONTE, que a
   parede reflete como uma faixa escura atravessando o copo. Sem essas duas
   coisas nenhuma difusa, por mais correta, salva o render.
--------------------------------------------------------------------------- */

/* Painel retangular como fonte de área: projeta a direção no plano do painel
   e testa se caiu dentro do retângulo. 'suave' é a borda do difusor. */
float painel(vec3 d, vec3 c, vec3 rt, vec3 up, vec2 meia, float suave) {
  float dd = dot(d, c);
  if (dd < 0.08) return 0.0;
  vec3 p = d / dd - c;
  return (1.0 - smoothstep(meia.x - suave, meia.x + suave, abs(dot(p, rt))))
       * (1.0 - smoothstep(meia.y - suave, meia.y + suave, abs(dot(p, up))));
}

vec3 studio(vec3 d) {
  d = normalize(d);

  /* Mesa embaixo, ciclorama atrás. O horizonte é uma LINHA, não um degradê:
     é ele que a parede curva devolve como faixa escura, e é essa faixa que
     faz o olho ler "peça apoiada num lugar" em vez de "peça num vazio". */
  vec3 mesa  = vec3(0.022, 0.022, 0.026);
  vec3 ciclo = mix(vec3(0.050, 0.053, 0.064), vec3(0.150, 0.158, 0.188),
                   smoothstep(0.0, 0.72, d.y));
  vec3 col = mix(mesa, ciclo, smoothstep(-0.030, 0.040, d.y));

  /* softbox principal: alta, estreita, em cima à esquerda. Os eixos são
     constantes — o compilador dobra estas contas. */
  vec3 kc = normalize(vec3(0.38, 0.64, 0.67));      // softbox: alto, ~60° à esquerda
  vec3 kr = normalize(cross(vec3(0.0, 1.0, 0.0), kc));
  vec3 ku = cross(kc, kr);
  col += vec3(1.0, 0.985, 0.955) * painel(d, kc, kr, ku, vec2(0.150, 2.10), 0.130) * 4.6;
  col += vec3(1.0, 0.970, 0.930) * painel(d, kc, kr, ku, vec2(0.82, 3.20), 1.05) * 0.62;

  /* tira estreita à direita e atrás: é ela que acende o recorte da silhueta */
  vec3 rc = normalize(vec3(-0.62, 0.38, -0.70));   // tira de recorte: atrás, à direita
  vec3 rr = normalize(cross(vec3(0.0, 1.0, 0.0), rc));
  vec3 ru = cross(rc, rr);
  col += vec3(1.0, 0.86, 0.60) * painel(d, rc, rr, ru, vec2(0.105, 1.65), 0.130) * 3.2;

  /* preenchimento frio do lado oposto: largo e fraco, sem forma nenhuma */
  col += vec3(0.40, 0.50, 0.72) * smoothstep(0.30, 1.0, dot(d, vec3(0.49, 0.16, -0.86))) * 0.62;
  col += vec3(0.34, 0.28, 0.20) * smoothstep(0.10, -0.55, d.y) * 0.50;  // rebote do chão
  return col;
}

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

/* ruído de valor, suave — serve à casca de laranja do revestimento */
float ruido(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i),               hash(i + vec2(1.0, 0.0)), f.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}

/* Tonemap filmico (ACES aproximado). O Reinhard simples levava todo realce a
   um cinza lavado; este rola para o branco com a curva em S do filme, que é
   como uma câmera de verdade responde à luz. */
vec3 filmico(vec3 x) {
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}

void main() {
  float h = vA.x, inside = vA.y, ang = vA.z;
  vec3 N = normalize(vN);
  vec3 V = normalize(uCam - vW);
  float ny = N.y;                                    // antes de virar a normal
  if (dot(N, V) < 0.0) N = -N;                       // faces internas

  /* Sombra de contato: o disco do chão entra marcado com inside == 2. */
  if (inside > 1.5) {
    if (uPass < 1.5) discard;
    float r = clamp(h, 0.0, 1.0);                 // 0 no centro, 1 na borda
    float nucleo = 1.0 - smoothstep(0.0, 0.46, r);
    float halo   = 1.0 - smoothstep(0.10, 1.0, r);
    float a = (nucleo * 0.80 + halo * 0.38) * uSombra;
    gl_FragColor = vec4(vec3(0.0), clamp(a, 0.0, 1.0));
    return;
  }
  if (uPass > 1.5) discard;

  /* O aço do aro e do pé; o resto é revestimento. O pé é o ANEL da parede,
     não o disco de baixo — a normal apontando para baixo separa os dois. */
  bool steel = (h > uBandTop) || (h < uBandBot && ny > -0.55);

  /* Tangentes da superfície de revolução: uma dá a volta na peça, a outra
     sobe. São elas que orientam o grão do acabamento. */
  vec3 Tc = cross(vec3(0.0, 1.0, 0.0), N);
  float lt = length(Tc);
  Tc = (lt > 0.001) ? Tc / lt : vec3(1.0, 0.0, 0.0);
  vec3 Tv = cross(N, Tc);

  vec3 col; float alpha = 1.0;

  if (steel) {
    /* aço escovado do aro e do pé. A peça é torneada: as estrias dão a volta
       nela, então na silhueta aparecem HORIZONTAIS. */
    float band  = hash(vec2(floor(h * 1600.0), 7.0)) - 0.5;
    float band2 = hash(vec2(floor(h * 380.0), 3.0)) - 0.5;
    vec3 Ns = normalize(N + Tv * (band * 0.075 + band2 * 0.030));
    vec3 Rs = paraRig(reflect(-V, Ns));
    float ndvS = clamp(dot(Ns, V), 0.0, 1.0);
    /* metal cru: F0 alto e colorido, quase sem difusa */
    vec3 F = vec3(0.91, 0.92, 0.94) + (1.0 - vec3(0.91, 0.92, 0.94)) * pow(1.0 - ndvS, 5.0);
    col = studio(Rs) * F * 0.46;
    col *= mix(0.30, 1.12, smoothstep(-0.55, 0.75, ny));      // oclusão vertical
    if (inside > 0.5) col *= 0.26;
  } else {
    /* -------------------- REVESTIMENTO AZUL ANODIZADO ------------------ */
    /* Duas camadas: o pigmento, que é fosco, e o verniz por cima, que é o que
       reflete o estúdio. Antes existia só a primeira, e superfície sem verniz
       não tem como devolver a forma da luz — daí o aspecto de plástico. */

    /* Grão do acabamento. Anéis finos do torno (variam rápido na altura,
       nada ao redor) mais a casca de laranja da pintura em pó. É pouco: 2%
       de inclinação na normal. Mas degradê matematicamente perfeito é
       exatamente o que o olho lê como CGI, e isto quebra a perfeição. */
    float anel  = hash(vec2(floor(h * 150.0), 11.0)) - 0.5;
    float casca = ruido(vec2(ang * 11.0, h * 26.0)) - 0.5;

    /* A gravação tem PROFUNDIDADE: o laser cava o revestimento até o inox.
       Duas amostras vizinhas dão a inclinação da parede do sulco, e é ela que
       acende a borda da letra de um lado e apaga do outro. Sem isso a marca
       lê como adesivo colado — o erro mais comum de mockup. Por isso ela entra
       aqui, antes da luz, e não como uma cor pintada por cima no fim. */
    float v = clamp((h - uBandBot) / (uBandTop - uBandBot), 0.0, 1.0);
    vec2 uvE = vec2(1.25 - ang, 1.0 - (v - 0.30) / 0.42);
    float dentro = step(0.30, v) * step(v, 0.72) * (1.0 - inside);
    float e  = texture2D(uEtch, uvE).r * dentro;
    float eu = texture2D(uEtch, uvE + vec2(0.0020, 0.0)).r * dentro;
    float ev = texture2D(uEtch, uvE + vec2(0.0, 0.0030)).r * dentro;

    N = normalize(N + Tv * (anel * 0.015 + casca * 0.026 + (e - ev) * 0.40)
                    + Tc * (casca * 0.010 + (e - eu) * 0.40));

    float ndv = clamp(dot(N, V), 0.0, 1.0);
    /* para o referencial do rig: daqui para baixo a peça é que girou */
    vec3 Nr = paraRig(N);
    vec3 R  = paraRig(reflect(-V, N));

    vec3 base = vec3(0.038, 0.118, 0.395);
    vec3 L1 = normalize(vec3(0.38, 0.64, 0.67));       // softbox principal
    vec3 L2 = normalize(vec3(-0.62, 0.38, -0.70));     // tira quente de trás
    vec3 L3 = normalize(vec3(0.49, 0.16, -0.86));      // preenchimento frio

    float d1 = clamp(dot(Nr, L1), 0.0, 1.0);
    /* difusa envolvente: a luz vaza um pouco além do terminador, que é o que
       impede a lateral de cair num azul chapado */
    float wrap = clamp((dot(Nr, L1) + 0.58) / 1.58, 0.0, 1.0);

    col  = base * (0.070 + 1.55 * d1 + 0.16 * wrap * wrap);
    col += base * vec3(0.50, 0.74, 1.22) * clamp(dot(Nr, L3), 0.0, 1.0) * 0.17;
    col += base * vec3(2.30, 1.55, 0.80) * clamp(dot(Nr, L2), 0.0, 1.0) * 0.18;

    /* oclusão de ambiente: onde a parede encontra o pé e no degrau do aro
       chega menos luz. Canto que não escurece é o erro clássico de render. */
    col *= mix(0.52, 1.0, smoothstep(uBandBot, uBandBot + 0.13, h));
    col *= 1.0 - 0.26 * (1.0 - smoothstep(0.0, 0.050, uBandTop - h));
    col *= mix(0.64, 1.06, smoothstep(0.02, 0.86, h));   // degradê vertical

    /* VERNIZ. Fresnel manda: quase nada de frente, quase tudo na silhueta.
       É esta conta — e não um brilho desenhado à mão — que põe a listra da
       softbox correndo pela parede e acende a borda com a cor certa. */
    vec3 amb = studio(R);
    float F = 0.042 + 0.958 * pow(1.0 - ndv, 5.0);
    col += amb * F * 0.95;

    /* Micro-riscos de manuseio. Nenhuma peça que saiu da caixa é impecável, e
       superfície impecável é meio caminho da cara de CGI. Só aparecem no lado
       que pega a luz — no escuro não existem, como na vida. */
    float linha = floor(ang * 430.0 + h * 165.0);              // levemente inclinadas
    float trecho = floor(h * 8.0 + hash(vec2(linha, 2.0)) * 6.0);  // quebradas em trechos
    float risco = smoothstep(0.955, 1.0, hash(vec2(linha, trecho)));
    col += vec3(0.88, 0.92, 1.0) * risco * d1 * 0.034;

    /* Onde o feixe passou fica inox cru à mostra: claro, fosco e obedecendo
       à mesma luz da parede. */
    vec3 exposto = vec3(0.60, 0.635, 0.685) * (0.26 + 1.30 * d1) + amb * F * 0.85;
    exposto *= mix(0.52, 1.0, smoothstep(uBandBot, uBandBot + 0.13, h));
    col = mix(col, exposto, e * 0.97);

    /* por dentro é o mesmo revestimento, sem luz direta e com o fundo
       ocluindo o que sobra */
    if (inside > 0.5) col *= 0.30 + 0.26 * smoothstep(0.12, 0.85, h);
  }

  col = filmico(col);
  col = pow(col, vec3(1.0 / 2.2));

  /* Grão de sensor. Nenhuma foto tem ruído zero; render tem — e ruído zero é
     metade do que o olho chama de "cara de CGI". Meio nível em 255. */
  col += (hash(gl_FragCoord.xy + vec2(uRuido)) - 0.5) * 0.018;

  /* alfa pré-multiplicado: é o que compõe o copo sobre a página sem halo */
  gl_FragColor = vec4(clamp(col, 0.0, 1.0) * alpha, alpha);
}`;

/* --- renderizador --------------------------------------------------------- */
function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src); gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error('[cup3d]', gl.getShaderInfoLog(s));
    return null;
  }
  return s;
}

const UP = [0, 1, 0];

const Cup3D = {
  ok: false,

  init(canvas) {
    // alfa PRÉ-MULTIPLICADO: o shader já devolve col*alpha, e é assim que o
    // navegador compõe o vidro sobre o fundo da página sem halo escuro
    const gl = canvas.getContext('webgl', {
      alpha: true, antialias: true, premultipliedAlpha: true,
      preserveDrawingBuffer: false, powerPreference: 'high-performance'
    });
    if (!gl) return false;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return false;
    const prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('[cup3d]', gl.getProgramInfoLog(prog));
      return false;
    }

    const g = buildGeometry();
    const ext = gl.getExtension('OES_element_index_uint');
    let idx = g.idx, idxType = gl.UNSIGNED_INT;
    if (!ext) {                                    // sem índices de 32 bits
      idx = new Uint16Array(g.idx); idxType = gl.UNSIGNED_SHORT;
    }

    const buf = (data, target) => {
      const b = gl.createBuffer();
      gl.bindBuffer(target, b); gl.bufferData(target, data, gl.STATIC_DRAW);
      return b;
    };
    const bPos = buf(g.pos, gl.ARRAY_BUFFER);
    const bNrm = buf(g.nrm, gl.ARRAY_BUFFER);
    const bAtt = buf(g.att, gl.ARRAY_BUFFER);
    const bIdx = buf(idx, gl.ELEMENT_ARRAY_BUFFER);

    const tex = gl.createTexture();
    this.bufs = this.bufs || {};
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, engravingTexture());
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.generateMipmap(gl.TEXTURE_2D);

    this.gl = gl; this.prog = prog; this.count = idx.length; this.idxType = idxType;
    this.iniSombra = g.iniSombra;
    this.bytesIdx = (idxType === gl.UNSIGNED_INT) ? 4 : 2;
    this._proj = new Float32Array(16);
    this._view = new Float32Array(16);
    this._eye  = new Float32Array(3);
    this.loc = {
      aPos: gl.getAttribLocation(prog, 'aPos'),
      aNrm: gl.getAttribLocation(prog, 'aNrm'),
      aAtt: gl.getAttribLocation(prog, 'aAtt'),
      uProj: gl.getUniformLocation(prog, 'uProj'),
      uView: gl.getUniformLocation(prog, 'uView'),
      uCam: gl.getUniformLocation(prog, 'uCam'),
      uEtch: gl.getUniformLocation(prog, 'uEtch'),
      uBandTop: gl.getUniformLocation(prog, 'uBandTop'),
      uBandBot: gl.getUniformLocation(prog, 'uBandBot'),
      uPass: gl.getUniformLocation(prog, 'uPass'),
      uSombra: gl.getUniformLocation(prog, 'uSombra'),
      uRuido: gl.getUniformLocation(prog, 'uRuido'),
      uRig: gl.getUniformLocation(prog, 'uRig')
    };
    this.bufs = { bPos, bNrm, bAtt, bIdx, tex };

    // A marca real vem de um arquivo. Enquanto ele não chega, a textura sai
    // com o desenho de reserva; quando chega, é reassada. Se o arquivo
    // faltar, o copo continua gravado — com o nome, sem o planeta.
    if (!marcaImg) {
      marcaImg = new Image();
      marcaImg.onload = () => Cup3D.rebakeEtch();
      marcaImg.onerror = () => { marcaImg = null; };
      marcaImg.src = MARCA_SRC;
    } else if (marcaImg.complete) {
      this.rebakeEtch();
    }
    // o desenho de reserva usa a fonte da interface: reassa quando ela chegar
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => this.rebakeEtch()).catch(() => {});
    }

    gl.enable(gl.DEPTH_TEST);
    // a mistura só serve à sombra de contato; o copo é opaco
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);   // pré-multiplicado
    // sem culling: no mergulho a câmera fica DENTRO da geometria
    gl.disable(gl.CULL_FACE);
    gl.clearColor(0, 0, 0, 0);

    // (3) contexto de WebGL se perde quando a aba vai para segundo plano ou
    // o driver reseta — sem isto o palco ficaria vazio para sempre
    canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); this.ok = false; }, false);
    canvas.addEventListener('webglcontextrestored', () => { this.ok = this.init(canvas); }, false);
    this.ok = true;
    return true;
  },

  rebakeEtch() {
    if (!this.ok) return;
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.bufs.tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, engravingTexture());
    gl.generateMipmap(gl.TEXTURE_2D);
  },

  resize(w, h) {
    if (!this.ok) return;
    this.gl.viewport(0, 0, w, h);
    this.w = w; this.h = h;
  },

  /* Caminho da câmera. giro: órbita de 360°. mergulho: sobe acima da boca,
     inclina para olhar para dentro e desce até o fundo encher a tela. */
  /* Distância que enquadra o copo inteiro NA PROPORÇÃO ATUAL. Numa tela de
     celular (alta e estreita) o campo horizontal é bem menor que o vertical,
     então a mesma distância do desktop estoura o copo para fora da tela. */
  fitDistance(fov) {
    const aspect = Math.max(0.2, (this.w || 16) / (this.h || 9));
    const half = Math.tan(fov * 0.5);
    const fitV = 0.56 / half;                 // metade da altura do copo
    const fitH = 0.36 / (half * aspect);      // metade da largura
    return Math.max(fitV, fitH) * 1.06;
  },

  camera(phase, t) {
    let ang, radius, height, targetY, fov = 0.58;
    const base = this.fitDistance(fov);
    if (phase === 'giro') {
      ang = t * Math.PI * 2 - Math.PI * 0.35;
      radius = base * (1.0 - 0.037 * Math.sin(t * Math.PI * 2));
      height = 1.02 + 0.10 * Math.sin(t * Math.PI * 4);
      targetY = 0.40;
    } else {
      const close = sstep(0.02, 0.62, t);
      const rise  = sstep(0.00, 0.46, t);
      const drop  = sstep(0.42, 1.00, t);
      ang = Math.PI * 2 - Math.PI * 0.35 + t * 1.05;
      radius  = mix(base, 0.0, close) + 0.0001;
      height  = 1.02 + 1.34 * rise - 1.90 * drop;
      targetY = mix(0.40, 0.06, drop);
      fov = mix(0.58, 1.30, drop);
    }
    const eye = [Math.cos(ang) * radius, height, Math.sin(ang) * radius];
    return { eye, target: [0, targetY, 0], fov, ang };
  },

  bind(buffer, loc) {
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, 0);
  },

  /* A câmera está dentro do copo? Vale para o fim do mergulho: ali não dá
     para separar "parede de trás" de "parede da frente", então o vidro sai
     numa passada só. */
  dentroDoCopo(eye) {
    const raio = Math.hypot(eye[0], eye[2]);
    return raio < 0.31 && eye[1] < 0.95 && eye[1] > 0.05;
  },

  /* A sombra só existe enquanto a peça está apoiada e vista de fora. No
     mergulho a câmera sobe e entra: ali ela some, senão vira um borrão
     escuro atravessando a boca do copo. */
  forcaDaSombra(phase, t, eye) {
    if (eye[1] > 1.9) return 0;
    const alto = 1 - sstep(1.20, 1.85, eye[1]);
    const dentro = this.dentroDoCopo(eye) ? 0 : 1;
    return alto * dentro * (phase === 'giro' ? 1 : 1 - sstep(0.0, 0.34, t));
  },

  desenha(de, ate) {
    const gl = this.gl;
    const ini = de || 0, fim = (ate === undefined ? this.iniSombra : ate);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufs.bIdx);
    gl.drawElements(gl.TRIANGLES, fim - ini, this.idxType, ini * this.bytesIdx);
  },

  render(phase, t) {
    if (!this.ok) return;
    const gl = this.gl, L = this.loc;
    const { eye, target, fov, ang } = this.camera(phase, t);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(this.prog);

    this._proj.set(M4.perspective(fov, this.w / this.h, 0.01, 40));
    this._view.set(M4.lookAt(eye, target, UP));
    this._eye[0] = eye[0]; this._eye[1] = eye[1]; this._eye[2] = eye[2];
    gl.uniformMatrix4fv(L.uProj, false, this._proj);
    gl.uniformMatrix4fv(L.uView, false, this._view);
    gl.uniform3fv(L.uCam, this._eye);
    gl.uniform1f(L.uBandTop, BAND_TOP);
    gl.uniform1f(L.uBandBot, BAND_BOT);
    /* Semente do grão. Troca 24 vezes ao longo da rolagem, como os 24 quadros
       por segundo de um filme: mexe o bastante para não virar sujeira fixa na
       tela e fica parado quando a rolagem para. */
    gl.uniform1f(L.uRuido, Math.floor(t * 24) * 137.0);
    /* O rig acompanha o azimute da câmera, mas só 94% dele: travado em 100%
       o realce ficaria cravado no mesmo pixel o giro inteiro. Os 6% que
       sobram fazem a listra varrer a peça devagar, como a mesa giratória que
       nunca está perfeitamente centrada. */
    const aRig = ang * 0.94;
    gl.uniform2f(L.uRig, Math.cos(aRig), Math.sin(aRig));

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.bufs.tex);
    gl.uniform1i(L.uEtch, 0);

    this.bind(this.bufs.bPos, L.aPos);
    this.bind(this.bufs.bNrm, L.aNrm);
    this.bind(this.bufs.bAtt, L.aAtt);

    /* O copo é opaco: o teste de profundidade resolve sozinho quem está na
       frente. Não há ordem para respeitar, então é uma passada só — as
       quatro do vidro (externa de trás, interna de trás, interna da frente,
       externa da frente) existiam para o alfa e saíram junto com ele. */

    // 1) sombra de contato: mora no chão, atrás de tudo, e é o único
    //    fragmento que ainda usa mistura
    gl.depthMask(false);
    const sombra = this.forcaDaSombra(phase, t, eye);
    if (sombra > 0.004) {
      gl.uniform1f(L.uPass, 2);
      gl.uniform1f(L.uSombra, sombra);
      this.desenha(this.iniSombra, this.count);
    }

    // 2) o copo. Sem culling: no mergulho a câmera fica DENTRO da peça.
    gl.depthMask(true);
    gl.uniform1f(L.uPass, 0);
    this.desenha();

    gl.depthMask(true);
  }
};

global.Cup3D = Cup3D;
})(window);
