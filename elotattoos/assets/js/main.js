/* =====================================================================
   MAIN.JS · Lenis + GSAP + inicializações
   Nada aqui pode esconder conteúdo pelo CSS: os elementos nascem
   visíveis e só são escondidos por JS, logo antes de animar.
   ===================================================================== */

(function () {
  'use strict';

  /* ---------------------------------------------------------------
     0. CONFIGURAÇÃO DO WHATSAPP
     CONFIRMAR: preencha `numero` com DDD + número, só dígitos, com o
     55 na frente (ex.: '5542988084236'). Enquanto estiver vazio, todos
     os botões usam o link curto da bio do Instagram — que funciona,
     mas NÃO aceita mensagem pré-preenchida.
     --------------------------------------------------------------- */
  var WA = {
    numero: '',
    atalho: 'https://wa.me/message/GSIOOPZYE2W7G1',
    msgPadrao: 'Oi, Eloize! Vi o site e queria falar sobre uma tatuagem.',
    msgArte: 'Oi, Eloize! Vi o site e queria reservar a arte "{arte}".'
  };

  function linkWhatsapp(texto) {
    if (!WA.numero) return WA.atalho;
    return 'https://wa.me/' + WA.numero + '?text=' + encodeURIComponent(texto);
  }

  var reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var temGsap = typeof window.gsap !== 'undefined';
  if (temGsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ---------------------------------------------------------------
     1. LINKS DE WHATSAPP
     --------------------------------------------------------------- */
  document.querySelectorAll('[data-wa]').forEach(function (a) {
    var arte = a.getAttribute('data-arte');
    var texto = arte ? WA.msgArte.replace('{arte}', arte) : WA.msgPadrao;
    a.href = linkWhatsapp(texto);
    a.target = '_blank';
    a.rel = 'noopener';
  });

  /* ---------------------------------------------------------------
     2. PLACEHOLDER DE IMAGEM
     Se a foto real ainda não existe, o retângulo em --paper-deep com
     o nome do arquivo assume o lugar.
     --------------------------------------------------------------- */
  function marcarFalta(img) {
    var fig = img.closest('.media');
    if (fig) fig.classList.add('is-missing');
  }
  function checarImagens(raiz) {
    (raiz || document).querySelectorAll('.media img').forEach(function (img) {
      if (img.complete) {
        if (!img.naturalWidth) marcarFalta(img);
      } else {
        img.addEventListener('error', function () { marcarFalta(img); }, { once: true });
        img.addEventListener('load', function () { if (!img.naturalWidth) marcarFalta(img); }, { once: true });
      }
    });
  }
  checarImagens();
  window.EB = window.EB || {};
  window.EB.checarImagens = checarImagens;

  /* ---------------------------------------------------------------
     3. LENIS — scroll suave
     --------------------------------------------------------------- */
  var lenis = null;
  if (!reduzido && typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.1,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }
    });

    if (temGsap) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (tempo) { lenis.raf(tempo * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      requestAnimationFrame(function loop(t) { lenis.raf(t); requestAnimationFrame(loop); });
    }
  }

  function travarScroll() { if (lenis) lenis.stop(); document.body.style.overflow = 'hidden'; }
  function soltarScroll() { if (lenis) lenis.start(); document.body.style.overflow = ''; }
  window.EB.travarScroll = travarScroll;
  window.EB.soltarScroll = soltarScroll;
  window.EB.reduzido = reduzido;

  /* Âncoras internas passam pelo Lenis */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var alvo = document.querySelector(a.getAttribute('href'));
      if (!alvo) return;
      e.preventDefault();
      fecharDrawer();
      if (lenis) lenis.scrollTo(alvo, { offset: -70 });
      else alvo.scrollIntoView({ behavior: reduzido ? 'auto' : 'smooth' });
    });
  });

  /* ---------------------------------------------------------------
     4. PRELOADER — só na primeira visita da sessão, máx. 1.2s
     --------------------------------------------------------------- */
  var preloader = document.getElementById('preloader');

  /* sessionStorage pode simplesmente lançar erro: aba anônima, dados de
     site bloqueados, página dentro de iframe. Nunca deixar isso derrubar
     o resto do JS. */
  function lembrar(chave, valor) {
    try {
      if (valor === undefined) return sessionStorage.getItem(chave);
      sessionStorage.setItem(chave, valor);
    } catch (e) { return null; }
  }

  var jaVisto = lembrar('eb-preloader') === '1';

  function encerrarPreloader() {
    if (!preloader) return;
    preloader.classList.add('is-done');
    setTimeout(function () { preloader.remove(); }, 520);
    lembrar('eb-preloader', '1');
    entradaDoHero();
  }

  if (jaVisto || reduzido) {
    if (preloader) preloader.remove();
    entradaDoHero();
  } else {
    /* Fallback: se as fontes demorarem, a página libera assim mesmo. */
    var fontes = document.fonts ? document.fonts.ready : Promise.resolve();
    var teto = new Promise(function (ok) { setTimeout(ok, 1200); });
    Promise.race([Promise.all([fontes, new Promise(function (ok) { setTimeout(ok, 1000); })]), teto])
      .then(encerrarPreloader);
  }

  /* ---------------------------------------------------------------
     5. ENTRADA DO HERO — sequência única no load
     --------------------------------------------------------------- */
  function entradaDoHero() {
    if (!temGsap || reduzido) return;

    var linhas = document.querySelectorAll('#hero-title .line > span');
    var linhasCopia = document.querySelectorAll('.hero__title--corte .line > span');
    var arco = document.querySelector('.hero__photo .media');
    var header = document.getElementById('header');
    var resto = ['.hero__micro', '.hero__foot', '.scroll-cue'];

    var tl = gsap.timeline({ defaults: { duration: 0.9, ease: 'power3.out' } });

    /* Título e cópia entram em dois tweens iguais começando no mesmo
       instante — num stagger único a cópia atrasaria e ficaria fantasma. */
    tl.from(linhas, { yPercent: 115, stagger: 0.08 }, 0);
    if (linhasCopia.length) tl.from(linhasCopia, { yPercent: 115, stagger: 0.08 }, 0);

    if (arco) {
      tl.from(arco, { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.1 }, 0.15)
        .from(arco.querySelector('img'), { scale: 1.06, duration: 1.2 }, 0.15);
    }

    tl.from(resto.map(function (s) { return document.querySelector(s); }).filter(Boolean),
      { y: 24, opacity: 0, stagger: 0.08, duration: 0.7 }, 0.35);

    if (header) tl.from(header, { y: -30, opacity: 0, duration: 0.7 }, 0.2);
  }

  /* ---------------------------------------------------------------
     6. HEADER — encolhe ao rolar e inverte a cor sobre o claro
     --------------------------------------------------------------- */
  var header = document.getElementById('header');

  function atualizarHeader() {
    if (!header) return;
    header.classList.toggle('is-stuck', window.scrollY > 80);
  }
  window.addEventListener('scroll', atualizarHeader, { passive: true });
  atualizarHeader();

  /* Tema da seção ativa: controla a cor do header e o grão */
  function aplicarTema(tema) {
    var claro = tema !== 'ink';
    document.documentElement.setAttribute('data-nav', claro ? 'light' : 'dark');
    if (header) header.classList.toggle('is-light', claro);
  }
  aplicarTema('ink');

  /* Sem GSAP de propósito: se o CDN falhar, o header não pode ficar
     escuro em cima de uma seção clara — ficaria ilegível. */
  var secoes = Array.prototype.slice.call(document.querySelectorAll('[data-theme]'));
  var agendado = false;

  function conferirTema() {
    agendado = false;
    var linha = 72;                            /* altura do header */
    var atual = null;
    for (var i = 0; i < secoes.length; i++) {
      var r = secoes[i].getBoundingClientRect();
      if (r.top <= linha && r.bottom > linha) atual = secoes[i];
    }
    aplicarTema(atual ? atual.dataset.theme : 'ink');
  }

  window.addEventListener('scroll', function () {
    if (agendado) return;
    agendado = true;
    requestAnimationFrame(conferirTema);
  }, { passive: true });
  window.addEventListener('resize', conferirTema);
  conferirTema();

  /* ---------------------------------------------------------------
     7. DRAWER MOBILE
     --------------------------------------------------------------- */
  var burger = document.getElementById('burger');
  var drawer = document.getElementById('drawer');

  function abrirDrawer() {
    if (!drawer) return;
    drawer.hidden = false;
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Fechar menu');
    travarScroll();
    var primeiro = drawer.querySelector('a');
    if (primeiro) primeiro.focus();
  }
  function fecharDrawer() {
    if (!drawer || drawer.hidden) return;
    drawer.hidden = true;
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Abrir menu');
    soltarScroll();
  }
  if (burger) {
    burger.addEventListener('click', function () {
      drawer.hidden ? abrirDrawer() : fecharDrawer();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') fecharDrawer();
  });

  /* ---------------------------------------------------------------
     8. ACCORDION acessível (cuidados + FAQ, mesmo componente)
     --------------------------------------------------------------- */
  document.querySelectorAll('[data-accordion]').forEach(function (grupo) {
    var botoes = grupo.querySelectorAll('.acc__btn');

    botoes.forEach(function (btn) {
      var painel = document.getElementById(btn.getAttribute('aria-controls'));
      painel.style.height = '0px';

      btn.addEventListener('click', function () {
        var aberto = btn.getAttribute('aria-expanded') === 'true';

        /* Um item aberto por vez */
        botoes.forEach(function (outro) {
          if (outro === btn) return;
          var p = document.getElementById(outro.getAttribute('aria-controls'));
          outro.setAttribute('aria-expanded', 'false');
          animarAltura(p, 0);
        });

        btn.setAttribute('aria-expanded', aberto ? 'false' : 'true');
        animarAltura(painel, aberto ? 0 : painel.scrollHeight);
      });
    });
  });

  function animarAltura(el, alvo) {
    if (!el) return;
    if (reduzido || !temGsap) { el.style.height = alvo ? 'auto' : '0px'; return; }
    gsap.to(el, {
      height: alvo,
      duration: 0.55,
      ease: 'power3.inOut',
      onComplete: function () { if (alvo) el.style.height = 'auto'; }
    });
  }

  /* ---------------------------------------------------------------
     9. REVELAÇÕES DE SCROLL (só onde o briefing pede)
     --------------------------------------------------------------- */
  if (temGsap && window.ScrollTrigger && !reduzido) {

    /* 9.1 Títulos em Bodoni: máscara por linha, uma vez só */
    document.querySelectorAll('.h2.reveal').forEach(function (titulo) {
      var linhas = titulo.querySelectorAll('.line > span');
      gsap.from(linhas, {
        yPercent: 115,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.08,
        scrollTrigger: { trigger: titulo, start: 'top 85%', once: true }
      });
    });

    /* 9.2 Imagens: clip-path de baixo para cima + escala interna. Sem fade. */
    document.querySelectorAll('.media').forEach(function (fig) {
      if (fig.closest('.hero__photo') || fig.closest('.lightbox')) return;
      var img = fig.querySelector('img');
      var tl = gsap.timeline({
        scrollTrigger: { trigger: fig, start: 'top 88%', once: true }
      });
      tl.from(fig, { clipPath: 'inset(100% 0% 0% 0%)', duration: 1, ease: 'power3.out' }, 0);
      if (img) tl.from(img, { scale: 1.06, duration: 1.2, ease: 'power3.out' }, 0);
    });

    /* 9.3 Parallax discreto — só hero e CTA final */
    document.querySelectorAll('[data-parallax]').forEach(function (el) {
      var v = parseFloat(el.getAttribute('data-parallax'));
      gsap.fromTo(el, { yPercent: v }, {
        yPercent: -v,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });

    /* 9.4 Count-up dos números */
    document.querySelectorAll('[data-count]').forEach(function (el) {
      var bruto = el.getAttribute('data-count');
      var alvo = parseFloat(bruto);
      if (isNaN(alvo)) return;                       /* [CONFIRMAR] fica como está */
      var sufixo = el.getAttribute('data-suffix') || '';
      var decimais = (bruto.split('.')[1] || '').length;
      var obj = { n: 0 };

      gsap.to(obj, {
        n: alvo,
        duration: 1.4,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 80%', once: true },
        onUpdate: function () { el.textContent = obj.n.toFixed(decimais) + sufixo; }
      });
    });

    /* 9.5 Rabiscos: stroke-dashoffset de 100% a 0 */
    document.querySelectorAll('.scribble path').forEach(function (p) {
      var comp = p.getTotalLength();
      gsap.set(p, { strokeDasharray: comp, strokeDashoffset: comp });
      gsap.to(p, {
        strokeDashoffset: 0,
        duration: 1,
        ease: 'power2.inOut',
        scrollTrigger: { trigger: p.closest('svg').parentElement, start: 'top 78%', once: true }
      });
    });
  }

  /* ---------------------------------------------------------------
     10. HOVER MAGNÉTICO — máx. 8px, retorno elástico
     --------------------------------------------------------------- */
  if (temGsap && !reduzido && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('[data-magnetic], .navlink').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) / (r.width / 2);
        var y = (e.clientY - r.top - r.height / 2) / (r.height / 2);
        gsap.to(el, { x: x * 8, y: y * 8, duration: 0.4, ease: 'power3.out' });
      });
      el.addEventListener('mouseleave', function () {
        gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
      });
    });
  }

  /* ---------------------------------------------------------------
     11. CURSOR CUSTOMIZADO (desligado em touch e em reduced motion)
     --------------------------------------------------------------- */
  var cursor = document.querySelector('.cursor');
  if (cursor && !reduzido && window.matchMedia('(hover: hover)').matches) {
    var px = 0, py = 0, cx = 0, cy = 0;

    document.addEventListener('mousemove', function (e) {
      px = e.clientX; py = e.clientY;
      cursor.classList.add('is-on');
    });

    (function seguir() {
      cx += (px - cx) * 0.18;
      cy += (py - cy) * 0.18;
      cursor.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)';
      requestAnimationFrame(seguir);
    })();

    document.addEventListener('mouseover', function (e) {
      var naFoto = e.target.closest('.shot');
      cursor.classList.toggle('is-big', !!naFoto);
    });
    document.addEventListener('mouseleave', function () { cursor.classList.remove('is-on'); });
  } else if (cursor) {
    cursor.remove();
  }

  /* ---------------------------------------------------------------
     12. VÍDEO DE FUNDO DO HERO + RECORTE DO TÍTULO
     O vídeo é o fundo da seção. O arco por cima é o retrato da Eloize, e
     a cópia recortada do título devolve as letras na frente do arco,
     abaixo da cúpula.
     --------------------------------------------------------------- */
  var videoHero = document.querySelector('.hero__video');
  var tituloHero = document.getElementById('hero-title');
  var copiaTitulo = document.querySelector('.hero__title--corte');

  /* Onde a cúpula do arco termina, medido do topo do título. 0.36 é a
     fração da altura do arco ocupada pela cúpula. */
  function medirCorte() {
    var arco = document.querySelector('.hero__photo');
    if (!copiaTitulo || !arco || !tituloHero) return;

    var foto = arco.getBoundingClientRect();
    var titulo = tituloHero.getBoundingClientRect();
    if (!foto.height || !titulo.height) return;

    var baseDaCupula = foto.top + foto.height * 0.36;
    var corte = baseDaCupula - titulo.top;

    /* Fora do intervalo do título não há sobreposição: esconde a cópia. */
    if (corte <= 0 || corte >= titulo.height) {
      copiaTitulo.style.setProperty('--corte', '100%');
    } else {
      copiaTitulo.style.setProperty('--corte', corte + 'px');
    }
  }

  if (videoHero) {
    if (reduzido) {
      /* Movimento reduzido: fica no poster, sem tocar nada. */
      videoHero.removeAttribute('autoplay');
    } else if ('IntersectionObserver' in window) {
      /* Só toca enquanto está na tela — poupa bateria e dados no celular. */
      new IntersectionObserver(function (entradas) {
        entradas.forEach(function (e) {
          if (e.isIntersecting) {
            var p = videoHero.play();
            if (p && p.catch) p.catch(function () {});
          } else {
            videoHero.pause();
          }
        });
      }, { threshold: 0.15 }).observe(videoHero);
    } else {
      var p = videoHero.play();
      if (p && p.catch) p.catch(function () {});
    }
  }

  medirCorte();
  window.addEventListener('resize', medirCorte);
  window.addEventListener('load', medirCorte);
  if (document.fonts) document.fonts.ready.then(medirCorte);

  /* Recalcula os gatilhos quando as fontes chegam (evita salto de layout) */
  if (document.fonts && temGsap && window.ScrollTrigger) {
    document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }
})();
