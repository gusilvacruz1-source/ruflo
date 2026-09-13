/* ============================================================================
   SPACE PERSONALIZADOS — cup3d.js
   Copo gerado por código. WebGL puro, sem three.js, sem biblioteca nenhuma.
   ----------------------------------------------------------------------------
   O copo é uma SUPERFÍCIE DE REVOLUÇÃO: um perfil 2D (parede externa, lábio da
   borda, parede interna, fundo) girado em torno do eixo Y.

   O corpo é VIDRO: transparência de verdade, com Fresnel decidindo quanto
   reflete e quanto deixa passar, refração pela parede, absorção que escurece
   onde o vidro é mais espesso e a gravação a laser jateada. Só o aro da boca
   e o pé continuam em aço escovado. O estúdio — luz principal, preenchimento
   e rebote quente do chão — é procedural: não há HDR para baixar, o vidro
   reflete um ambiente que existe só como matemática.

   Vidro exige ordem de desenho. São três passadas: o aço opaco escreve
   profundidade, depois o vidro de trás, depois o vidro da frente.
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

/* Estúdio procedural: o que o vidro reflete e o que se vê através dele. Uma
   softbox grande em cima à esquerda, um preenchimento frio do outro lado e um
   rebote quente do chão — é a iluminação de mesa de produto, escrita como
   função. */
vec3 studio(vec3 d) {
  d = normalize(d);
  float up = d.y * 0.5 + 0.5;
  vec3 col = mix(vec3(0.030, 0.031, 0.037), vec3(0.19, 0.195, 0.215), smoothstep(0.18, 1.0, up));

  /* softbox principal: estreita e forte — é o que desenha a listra branca que
     corre pelo vidro e faz a parede aparecer */
  vec3 keyDir = normalize(vec3(-0.42, 0.80, 0.43));
  col += vec3(1.0, 0.98, 0.95) * smoothstep(0.80, 0.999, dot(d, keyDir)) * 9.0;
  col += vec3(1.0, 0.97, 0.92) * smoothstep(0.30, 0.92, dot(d, keyDir)) * 1.10;

  vec3 key2 = normalize(vec3(-0.10, 0.55, 0.83));
  col += vec3(0.95, 0.95, 1.0) * smoothstep(0.55, 0.98, dot(d, key2)) * 1.5;

  /* preenchimento frio do lado oposto, para o lado escuro não morrer */
  vec3 fillDir = normalize(vec3(0.88, 0.10, -0.46));
  col += vec3(0.42, 0.52, 0.72) * smoothstep(0.55, 1.0, dot(d, fillDir)) * 0.85;

  /* recorte quente vindo de trás: separa o copo do fundo escuro */
  vec3 rimDir = normalize(vec3(0.10, 0.42, -0.90));
  col += vec3(1.0, 0.84, 0.52) * smoothstep(0.72, 1.0, dot(d, rimDir)) * 2.2;

  col += vec3(0.92, 0.76, 0.46) * smoothstep(0.42, -0.1, up) * 0.30;  // rebote do chão
  return col;
}

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

void main() {
  float h = vA.x, inside = vA.y, ang = vA.z;
  vec3 N = normalize(vN);
  vec3 V = normalize(uCam - vW);
  /* de que lado do copo esta face está, antes de virar a normal para a câmera:
     serve para apagar a gravação da parede de trás, que o vidro da frente
     espalha e some quase toda */
  float frente = step(0.0, dot(N, V));
  float ny = N.y;                                    // antes de virar a normal
  if (dot(N, V) < 0.0) N = -N;                       // faces internas
  vec3 R = reflect(-V, N);
  float ndv  = clamp(dot(N, V), 0.0, 1.0);
  float graz = 1.0 - ndv;                            // 0 de frente, 1 na silhueta

  /* Sombra de contato: o disco do chão entra marcado com inside == 2. */
  if (inside > 1.5) {
    if (uPass < 1.5) discard;
    float r = clamp(h, 0.0, 1.0);                 // 0 no centro, 1 na borda
    float nucleo = 1.0 - smoothstep(0.0, 0.42, r);
    float halo   = 1.0 - smoothstep(0.12, 1.0, r);
    float a = (nucleo * 0.72 + halo * 0.26) * uSombra;
    gl_FragColor = vec4(vec3(0.0), clamp(a, 0.0, 1.0));
    return;
  }
  if (uPass > 1.5) discard;

  /* O aço do aro e do pé; o resto é revestimento. O pé é o ANEL da parede,
     não o disco de baixo — a normal apontando para baixo separa os dois. */
  bool steel = (h > uBandTop) || (h < uBandBot && ny > -0.55);

  vec3 col; float alpha;

  if (steel) {
    /* aço escovado do aro e do pé. O copo é torneado: as estrias dão a volta
       na peça, então na silhueta elas aparecem HORIZONTAIS. */
    float band  = hash(vec2(floor(h * 460.0), 7.0)) - 0.5;
    float band2 = hash(vec2(floor(h * 120.0), 3.0)) - 0.5;
    vec3 Rb = normalize(R + N * (band * 0.085 + band2 * 0.035));
    vec3 env = studio(Rb) * 0.62 + studio(R) * 0.38;
    col = env * vec3(0.93, 0.945, 0.97);
    col += vec3(1.0) * pow(graz, 4.0) * 0.9;
    col *= mix(0.34, 1.18, smoothstep(-0.55, 0.75, N.y));   // oclusão vertical
    if (inside > 0.5) col *= 0.40;
    alpha = 1.0;
  } else {
    /* -------------------- REVESTIMENTO AZUL, OPACO --------------------- */
    /* O copo é pintado, não é vidro: o corpo é sólido e o que dá volume são
       a difusa envolvente, dois realces e o recorte de borda. Nada aqui
       depende do que está atrás — o alfa é 1. */
    vec3 base = vec3(0.055, 0.165, 0.470);

    vec3 L1 = normalize(vec3(-0.42, 0.80, 0.43));
    vec3 L2 = normalize(vec3(-0.10, 0.55, 0.83));
    vec3 L3 = normalize(vec3(0.88, 0.10, -0.46));      // preenchimento frio

    float d1 = clamp(dot(N, L1), 0.0, 1.0);
    float d2 = clamp(dot(N, L2), 0.0, 1.0);
    /* difusa envolvente: a luz vaza um pouco para além do terminador, que é
       o que impede a lateral do copo de cair num preto chapado */
    float wrap = clamp((dot(N, L1) + 0.62) / 1.62, 0.0, 1.0);

    /* A envolvente tinha peso demais e o cilindro saía chapado: a lateral
       ficava quase tão clara quanto a frente. Menos envolvente e mais luz
       direcional é o que devolve a curvatura. */
    col  = base * (0.085 + 1.32 * d1 + 0.30 * d2 + 0.26 * wrap * wrap);
    col += base * vec3(0.55, 0.80, 1.25) * clamp(dot(N, L3), 0.0, 1.0) * 0.34;

    /* gradiente vertical: qualquer peça sob luz de cima escurece para a base */
    col *= mix(0.62, 1.10, smoothstep(0.02, 0.92, h));

    /* verniz: dois realces, um duro e um largo */
    vec3 H1 = normalize(L1 + V), H2 = normalize(L2 + V);
    float s1 = pow(clamp(dot(N, H1), 0.0, 1.0), 140.0);
    float s2 = pow(clamp(dot(N, H2), 0.0, 1.0), 26.0);
    col += vec3(1.0, 0.985, 0.96) * s1 * 1.55;
    col += vec3(0.80, 0.90, 1.0)  * s2 * 0.20;

    /* studio() é a conta mais cara deste shader. Uma chamada só, guardada:
       o ambiente e a gravação usavam o mesmo R e pediam duas. */
    vec3 amb = studio(R);
    /* o ambiente entra fraco: superfície pintada reflete pouco */
    col += amb * 0.038 * vec3(0.80, 0.92, 1.15);

    /* recorte de borda: separa o copo do fundo e arredonda a silhueta */
    col += vec3(0.46, 0.68, 1.0) * pow(graz, 3.0) * 0.58;

    /* escurece para a base, como qualquer cilindro sob luz de cima */
    col *= mix(0.78, 1.04, smoothstep(-0.30, 0.95, N.y));

    alpha = 1.0;

    /* Gravação a laser: o feixe queima o revestimento e aparece o inox por
       baixo. É por isso que a marca sai clara e fosca, não pintada. */
    float v = clamp((h - uBandBot) / (uBandTop - uBandBot), 0.0, 1.0);
    float e = texture2D(uEtch, vec2(1.25 - ang, 1.0 - (v - 0.30) / 0.42)).r;
    e *= step(0.30, v) * step(v, 0.72) * (1.0 - inside);
    vec3 exposto = vec3(0.80, 0.84, 0.88) * (0.46 + 0.82 * d1) + amb * 0.12;
    col = mix(col, exposto, e * 0.97);

    if (inside > 0.5) {
      /* por dentro é o mesmo revestimento, sem luz direta chegando */
      col *= 0.22;
    }
  }

  col = col / (col + vec3(0.72));                      // tonemap
  col = pow(col, vec3(1.0 / 2.2));
  /* alfa pré-multiplicado: o canvas compõe sobre a página, e é isto que faz o
     fundo do site aparecer de verdade através do vidro */
  gl_FragColor = vec4(col * alpha, alpha);
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
      uSombra: gl.getUniformLocation(prog, 'uSombra')
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
    return { eye, target: [0, targetY, 0], fov };
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
    const { eye, target, fov } = this.camera(phase, t);

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
