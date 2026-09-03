/* =====================================================================
   GALLERY.JS · filtros com transição FLIP + lightbox próprio
   O FLIP é feito à mão (medir → aplicar → medir → animar a diferença),
   sem plugin extra: as fotos deslizam para a nova posição em vez de
   sumir e reaparecer.
   ===================================================================== */

(function () {
  'use strict';

  var grid = document.getElementById('galeria-grid');
  if (!grid) return;

  var fotos = Array.prototype.slice.call(grid.querySelectorAll('.shot'));
  var chips = Array.prototype.slice.call(document.querySelectorAll('.filtros .chip'));
  var temGsap = typeof window.gsap !== 'undefined';
  var reduzido = (window.EB && window.EB.reduzido) || false;

  /* Proporção fixa por foto: a altura do card não muda quando o filtro muda. */
  fotos.forEach(function (shot) {
    var r = shot.getAttribute('data-ratio');
    var media = shot.querySelector('.media');
    if (r && media) media.style.aspectRatio = r;
  });

  /* -------------------------------------------------------------
     1. FILTROS
     ------------------------------------------------------------- */
  function medir() {
    var mapa = new Map();
    fotos.forEach(function (f) {
      if (!f.hidden) mapa.set(f, f.getBoundingClientRect());
    });
    return mapa;
  }

  function filtrar(categoria) {
    var antes = medir();

    fotos.forEach(function (f) {
      f.hidden = !(categoria === 'todas' || f.getAttribute('data-cat') === categoria);
    });

    if (!temGsap || reduzido) return;

    var depois = medir();

    depois.forEach(function (novo, el) {
      var velho = antes.get(el);
      if (velho) {
        /* Já estava na tela: desliza da posição antiga para a nova. */
        var dx = velho.left - novo.left;
        var dy = velho.top - novo.top;
        if (dx || dy) {
          gsap.fromTo(el, { x: dx, y: dy }, {
            x: 0, y: 0, duration: 0.65, ease: 'power3.inOut'
          });
        }
      } else {
        /* Entrou agora. */
        gsap.fromTo(el, { opacity: 0, scale: 0.96 }, {
          opacity: 1, scale: 1, duration: 0.55, ease: 'power3.out'
        });
      }
    });

    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) {
        var ativo = c === chip;
        c.classList.toggle('is-active', ativo);
        c.setAttribute('aria-pressed', ativo ? 'true' : 'false');
      });
      filtrar(chip.getAttribute('data-filter'));
    });
  });

  /* -------------------------------------------------------------
     2. LIGHTBOX
     ------------------------------------------------------------- */
  var lb = document.getElementById('lightbox');
  var holder = document.getElementById('lb-holder');
  var cap = document.getElementById('lb-cap');
  var btnFechar = document.getElementById('lb-close');
  var btnAnt = document.getElementById('lb-prev');
  var btnProx = document.getElementById('lb-next');

  var visiveis = [];
  var indice = 0;
  var focoAnterior = null;

  function montar(i) {
    var shot = visiveis[i];
    if (!shot) return;

    var copia = shot.querySelector('.media').cloneNode(true);
    copia.classList.remove('is-missing');       /* o main.js reavalia a cópia */
    holder.innerHTML = '';
    holder.appendChild(copia);

    var img = copia.querySelector('img');
    cap.textContent = img ? img.alt : '';
    if (window.EB && window.EB.checarImagens) window.EB.checarImagens(holder);

    if (temGsap && !reduzido) {
      gsap.fromTo(copia, { opacity: 0, scale: 0.98 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'power3.out' });
    }
  }

  function abrir(shot) {
    visiveis = fotos.filter(function (f) { return !f.hidden; });
    indice = visiveis.indexOf(shot);
    if (indice < 0) return;

    focoAnterior = document.activeElement;
    lb.hidden = false;
    montar(indice);
    if (window.EB) window.EB.travarScroll();
    btnFechar.focus();
  }

  function fechar() {
    lb.hidden = true;
    holder.innerHTML = '';
    if (window.EB) window.EB.soltarScroll();
    if (focoAnterior) focoAnterior.focus();
  }

  function andar(passo) {
    indice = (indice + passo + visiveis.length) % visiveis.length;
    montar(indice);
  }

  fotos.forEach(function (shot) {
    shot.addEventListener('click', function () { abrir(shot); });
  });

  btnFechar.addEventListener('click', fechar);
  btnAnt.addEventListener('click', function () { andar(-1); });
  btnProx.addEventListener('click', function () { andar(1); });

  /* Clique no fundo fecha */
  lb.addEventListener('click', function (e) {
    if (e.target === lb) fechar();
  });

  /* Teclado: Esc fecha, setas navegam, Tab fica preso no modal */
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;

    if (e.key === 'Escape') { e.preventDefault(); fechar(); return; }
    if (e.key === 'ArrowRight') { e.preventDefault(); andar(1); return; }
    if (e.key === 'ArrowLeft') { e.preventDefault(); andar(-1); return; }

    if (e.key === 'Tab') {
      var focaveis = [btnFechar, btnAnt, btnProx];
      var atual = focaveis.indexOf(document.activeElement);
      e.preventDefault();
      var proximo = e.shiftKey ? atual - 1 : atual + 1;
      if (proximo < 0) proximo = focaveis.length - 1;
      if (proximo >= focaveis.length) proximo = 0;
      focaveis[proximo].focus();
    }
  });
})();
