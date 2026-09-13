/* ============================================================================
   SPACE PERSONALIZADOS — cup3d.js
   Copo gerado por código. WebGL puro, sem three.js, sem biblioteca nenhuma.
   ----------------------------------------------------------------------------
   O copo é uma SUPERFÍCIE DE REVOLUÇÃO: um perfil 2D (parede externa, lábio da
   borda, parede interna, fundo) girado em torno do eixo Y. Aço e revestimento
   vermelho são decididos pela altura no shader, e o estúdio — luz principal,
   preenchimento e rebote quente do chão — é procedural, então não há HDR para
   baixar: o metal reflete um ambiente que existe só como matemática.
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
const PROFILE_IN = [
  [0.307, 0.956], [0.301, 0.900], [0.288, 0.620], [0.267, 0.300],
  [0.249, 0.078], [0.234, 0.054], [0.180, 0.044], [0.090, 0.041],
  [0.052, 0.050], [0.022, 0.058], [0.000, 0.061]   // calota central do fundo
];

const SEG = 168;                    // divisões ao redor do eixo
const BAND_TOP = 0.800;             // acima disto: aço
const BAND_BOT = 0.072;             // abaixo disto: aço

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
    // não costura o salto entre o fim do perfil externo e o início do interno
    for (let s = 0; s < SEG; s++) {
      const a = i * W + s, b = a + 1, c = a + W, d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
  }
  return {
    pos: new Float32Array(pos), nrm: new Float32Array(nrm),
    att: new Float32Array(att), idx: new Uint32Array(idx)
  };
}

/* --- textura da gravação a laser ----------------------------------------- */
function engravingTexture() {
  const c = document.createElement('canvas');
  c.width = 2048; c.height = 512;
  const g = c.getContext('2d');
  g.fillStyle = '#000'; g.fillRect(0, 0, c.width, c.height);
  g.translate(c.width / 2, c.height / 2);
  g.fillStyle = '#fff'; g.strokeStyle = '#fff'; g.textAlign = 'center';

  /* A marca dá a volta no copo, mas quem olha de frente enxerga só um
     terço da circunferência — então ela tem que caber nessa janela. */
  g.font = '700 96px Manrope, system-ui, sans-serif';
  g.fillText('SPACE', 0, 4);
  g.font = '600 27px Manrope, system-ui, sans-serif';
  g.letterSpacing = '8px';
  g.fillText('PERSONALIZADOS', 4, 46);

  g.lineWidth = 4;
  g.beginPath(); g.arc(0, -78, 30, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.ellipse(0, -78, 46, 16, -0.42, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.arc(0, -78, 9, 0, Math.PI * 2); g.fill();
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

/* Estúdio procedural: o que o aço reflete. Uma softbox grande em cima à
   esquerda, um preenchimento frio do outro lado e um rebote quente do chão —
   é a iluminação de mesa de produto, escrita como função. */
vec3 studio(vec3 d) {
  d = normalize(d);
  float up = d.y * 0.5 + 0.5;
  vec3 col = mix(vec3(0.035, 0.036, 0.042), vec3(0.20, 0.205, 0.225), smoothstep(0.18, 1.0, up));

  /* softbox principal: estreita e forte — é o que desenha a faixa branca que
     corre pelo inox e dá a leitura de metal em vez de plástico cinza */
  vec3 keyDir = normalize(vec3(-0.42, 0.80, 0.43));
  col += vec3(1.0, 0.98, 0.95) * smoothstep(0.80, 0.999, dot(d, keyDir)) * 7.0;
  col += vec3(1.0, 0.97, 0.92) * smoothstep(0.30, 0.92, dot(d, keyDir)) * 1.15;

  vec3 key2 = normalize(vec3(-0.10, 0.55, 0.83));
  col += vec3(0.95, 0.95, 1.0) * smoothstep(0.55, 0.98, dot(d, key2)) * 1.3;

  /* preenchimento frio do lado oposto, para o lado escuro não morrer */
  vec3 fillDir = normalize(vec3(0.88, 0.10, -0.46));
  col += vec3(0.42, 0.52, 0.72) * smoothstep(0.55, 1.0, dot(d, fillDir)) * 0.75;

  /* recorte quente vindo de trás: separa o copo do fundo escuro */
  vec3 rimDir = normalize(vec3(0.10, 0.42, -0.90));
  col += vec3(1.0, 0.84, 0.52) * smoothstep(0.72, 1.0, dot(d, rimDir)) * 1.9;

  col += vec3(0.92, 0.76, 0.46) * smoothstep(0.42, -0.1, up) * 0.30;  // rebote do chão
  return col;
}

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

void main() {
  float h = vA.x, inside = vA.y, ang = vA.z;
  vec3 N = normalize(vN);
  vec3 V = normalize(uCam - vW);
  if (dot(N, V) < 0.0) N = -N;                       // faces internas
  vec3 R = reflect(-V, N);
  float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 4.0);

  bool steel = (h > uBandTop) || (h < uBandBot) || inside > 0.5;

  vec3 col;
  if (steel) {
    /* escovado: perturba a reflexão em faixas circunferenciais */
    /* O copo é torneado: as estrias dão a volta na peça, então na silhueta
       elas aparecem HORIZONTAIS. Perturbar por ângulo dava estria vertical,
       que é o que fazia o metal parecer plástico escovado errado. */
    float band  = hash(vec2(floor(h * 460.0), 7.0)) - 0.5;
    float band2 = hash(vec2(floor(h * 120.0), 3.0)) - 0.5;
    vec3 Rb = normalize(R + N * (band * 0.085 + band2 * 0.035));
    vec3 env = studio(Rb) * 0.62 + studio(R) * 0.38;
    col = env * vec3(0.93, 0.945, 0.97);
    col += vec3(1.0) * fres * 0.9;
    col *= mix(0.34, 1.18, smoothstep(-0.55, 0.75, N.y));   // oclusão vertical
    if (inside > 0.5) col *= 0.40;                          // dentro é mais escuro
  } else {
    /* revestimento vermelho fosco */
    vec3 base = vec3(0.78, 0.038, 0.105);
    vec3 L = normalize(vec3(-0.42, 0.80, 0.43));
    float diff = clamp(dot(N, L), 0.0, 1.0);
    float wrap = clamp((dot(N, L) + 0.55) / 1.55, 0.0, 1.0);
    col = base * (0.13 + 1.30 * diff + 0.42 * wrap * wrap);
    col *= mix(0.74, 1.04, smoothstep(-0.25, 0.95, N.y));   // escurece para a base
    vec3 H = normalize(L + V);
    col += vec3(1.0, 0.94, 0.90) * pow(clamp(dot(N, H), 0.0, 1.0), 14.0) * 0.30;
    col += vec3(1.0, 0.90, 0.84) * pow(clamp(dot(N, H), 0.0, 1.0), 90.0) * 0.55;
    col += studio(R) * 0.018;
    col += vec3(1.0, 0.62, 0.42) * fres * 0.30;             // recorte quente na borda

    /* gravação a laser: some o revestimento e aparece o aço por baixo */
    float v = clamp((h - uBandBot) / (uBandTop - uBandBot), 0.0, 1.0);
    float e = texture2D(uEtch, vec2(1.25 - ang, 1.0 - (v - 0.26) / 0.46)).r;
    e *= step(0.26, v) * step(v, 0.72);
    vec3 etched = studio(R) * vec3(0.72, 0.70, 0.68) * 0.55 + vec3(0.06);
    col = mix(col, etched, e * 0.92);
  }

  col = col / (col + vec3(0.72));                      // tonemap
  col = pow(col, vec3(1.0 / 2.2));
  gl_FragColor = vec4(col, 1.0);
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
    const gl = canvas.getContext('webgl', {
      alpha: true, antialias: true, premultipliedAlpha: false,
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
      uBandBot: gl.getUniformLocation(prog, 'uBandBot')
    };
    this.bufs = { bPos, bNrm, bAtt, bIdx, tex };

    // A marca é desenhada num canvas 2D e virou textura. Se a Manrope ainda
    // estiver a caminho, essa textura sai na fonte do sistema e ficaria
    // assim para sempre — então reassa quando a fonte chegar.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => this.rebakeEtch()).catch(() => {});
    }

    gl.enable(gl.DEPTH_TEST);
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
      height = 0.78 + 0.09 * Math.sin(t * Math.PI * 4);
      targetY = 0.47;
    } else {
      const close = sstep(0.02, 0.62, t);
      const rise  = sstep(0.00, 0.46, t);
      const drop  = sstep(0.42, 1.00, t);
      ang = Math.PI * 2 - Math.PI * 0.35 + t * 1.05;
      radius  = mix(base, 0.0, close) + 0.0001;
      height  = 0.78 + 1.55 * rise - 1.90 * drop;
      targetY = mix(0.47, 0.06, drop);
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

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufs.bIdx);
    gl.drawElements(gl.TRIANGLES, this.count, this.idxType, 0);
  }
};

global.Cup3D = Cup3D;
})(window);
