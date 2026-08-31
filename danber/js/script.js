/* =========================================================
   BARBEARIA DANBER — interações
   ========================================================= */
(function () {
  'use strict';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var WHATS   = '5542998356212';   // número principal (Adriel) — usado como reserva

  /* Horário de funcionamento: [abre, fecha] em horas. null = fechado.
     Domingo = 0 ... Sábado = 6                                        */
  var HOURS = { 0: null, 1: [9, 19], 2: [9, 19], 3: [9, 19], 4: [9, 19], 5: [9, 19], 6: [9, 18] };
  var SLOT_MIN = 40;   // duração de cada janela de atendimento
  var DAYS_AHEAD = 21; // quantos dias o calendário mostra

  /* Endereço do app da planilha do Google que guarda as marcações.
     Vazio = o site funciona como antes: mostra todos os horários e só
     abre o WhatsApp, sem reservar nada. Instruções em agenda/COMO-INSTALAR.md */
  var AGENDA_URL = 'https://script.google.com/macros/s/AKfycbyLKYqsRXp0A54YhTJEhJzj9s8Tbw28XqPYMguTaamBEb1w0ivcH9ptg3EzEHdM_kqw4Q/exec';

  /* =======================================================
     PRELOADER
     ======================================================= */
  var preloader = $('#preloader');
  function hidePreloader() {
    if (!preloader || preloader.classList.contains('is-done')) return;
    preloader.classList.add('is-done');
    setTimeout(function () { preloader.remove(); }, 700);
  }
  window.addEventListener('load', function () { setTimeout(hidePreloader, REDUCED ? 0 : 550); });
  setTimeout(hidePreloader, 3500); // rede lenta não pode travar o site

  /* =======================================================
     HEADER · MENU · PROGRESSO
     ======================================================= */
  var header  = $('#header');
  var nav     = $('#nav');
  var burger  = $('#burger');
  var progress = $('#scrollProgress');
  var fab     = $('#fab');

  $$('.nav__link', nav).forEach(function (el, i) { el.style.setProperty('--i', i); });

  function closeMenu() {
    if (!nav.classList.contains('is-open')) return;
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Abrir menu');
    document.body.classList.remove('is-locked');
  }

  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.body.classList.toggle('is-locked', open);
  });

  $$('.nav a', nav).forEach(function (a) { a.addEventListener('click', closeMenu); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  var ticking = false;
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;

    header.classList.toggle('is-stuck', y > 40);

    var max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';

    fab.classList.toggle('is-in', y > window.innerHeight * 0.6);

    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* Link ativo conforme a seção visível */
  var navLinks = $$('.nav__link');
  var sections = navLinks
    .map(function (l) { return $(l.getAttribute('href')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        navLinks.forEach(function (l) {
          l.classList.toggle('is-current', l.getAttribute('href') === '#' + en.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* =======================================================
     REVEAL AO ROLAR
     ======================================================= */
  var reveals = $$('.reveal');
  reveals.forEach(function (el) {
    var sibs = Array.prototype.indexOf.call(el.parentNode.children, el);
    el.style.setProperty('--i', sibs);
  });

  if ('IntersectionObserver' in window && !REDUCED) {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        obs.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* =======================================================
     HERO — parallax, holofote e leve 3D no texto
     ======================================================= */
  var heroMedia   = $('#heroMedia');
  var heroSpot    = $('#heroSpot');
  var heroContent = $('#heroContent');
  var hero        = $('.hero');

  if (!REDUCED && heroMedia) {
    var pTicking = false;
    window.addEventListener('scroll', function () {
      if (pTicking) return;
      pTicking = true;
      window.requestAnimationFrame(function () {
        var y = window.scrollY || window.pageYOffset;
        if (y < window.innerHeight * 1.2) {
          heroMedia.style.transform   = 'translate3d(0,' + (y * 0.28).toFixed(1) + 'px,0)';
          heroContent.style.transform = 'translate3d(0,' + (y * 0.10).toFixed(1) + 'px,0)';
          heroContent.style.opacity   = String(Math.max(0, 1 - y / (window.innerHeight * 0.85)));
        }
        pTicking = false;
      });
    }, { passive: true });

    if (window.matchMedia('(pointer: fine)').matches) {
      hero.addEventListener('pointermove', function (e) {
        var r = hero.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        heroSpot.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
        heroSpot.style.setProperty('--my', (py * 100).toFixed(1) + '%');
        heroMedia.style.setProperty('--tilt', '1');
        heroMedia.style.marginLeft = ((px - 0.5) * -22).toFixed(1) + 'px';
        heroMedia.style.marginTop  = ((py - 0.5) * -18).toFixed(1) + 'px';
      }, { passive: true });

      hero.addEventListener('pointerleave', function () {
        heroMedia.style.marginLeft = '0px';
        heroMedia.style.marginTop  = '0px';
      });
      heroMedia.style.transition = 'margin .6s cubic-bezier(.22,1,.36,1)';
    }
  }

  /* =======================================================
     MARQUEE — duplica o conteúdo para o loop ficar contínuo
     ======================================================= */
  var track = $('#marqueeTrack');
  if (track) track.innerHTML += track.innerHTML;

  /* =======================================================
     CARDS 3D
     ======================================================= */
  if (!REDUCED && window.matchMedia('(pointer: fine)').matches) {
    $$('.tilt').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        card.style.setProperty('--cx', (px * 100).toFixed(1) + '%');
        card.style.setProperty('--cy', (py * 100).toFixed(1) + '%');
        card.style.transform =
          'perspective(900px) rotateY(' + ((px - 0.5) * 9).toFixed(2) + 'deg) rotateX(' +
          ((0.5 - py) * 9).toFixed(2) + 'deg) translateY(-4px)';
      }, { passive: true });

      card.addEventListener('pointerleave', function () {
        card.style.transition = 'transform .55s cubic-bezier(.22,1,.36,1), border-color .35s, box-shadow .45s';
        card.style.transform = '';
        setTimeout(function () { card.style.transition = ''; }, 560);
      });
    });
  }

  /* =======================================================
     ABERTO / FECHADO AO VIVO
     ======================================================= */
  var DAY_NAMES = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function nextOpening(from) {
    for (var i = 1; i <= 7; i++) {
      var d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i);
      var h = HOURS[d.getDay()];
      if (h) return { date: d, open: h[0] };
    }
    return null;
  }

  function shopState(now) {
    var h = HOURS[now.getDay()];
    var mins = now.getHours() * 60 + now.getMinutes();

    if (h) {
      var openM = h[0] * 60, closeM = h[1] * 60;
      if (mins >= openM && mins < closeM) {
        var left = closeM - mins;
        return {
          open: true,
          label: left <= 60 ? 'Aberto · fecha em ' + left + ' min' : 'Aberto agora até ' + pad(h[1]) + 'h'
        };
      }
      if (mins < openM) return { open: false, label: 'Fechado · abre hoje às ' + pad(h[0]) + 'h' };
    }

    var nx = nextOpening(now);
    if (!nx) return { open: false, label: 'Fechado' };
    var isTomorrow = (nx.date - new Date(now.getFullYear(), now.getMonth(), now.getDate())) <= 86400000 * 1.5;
    return {
      open: false,
      label: 'Fechado · abre ' + (isTomorrow ? 'amanhã' : DAY_NAMES[nx.date.getDay()]) + ' às ' + pad(nx.open) + 'h'
    };
  }

  function paintStatus() {
    var st = shopState(new Date());
    $$('.status').forEach(function (el) {
      if (el.hidden) el.hidden = false;
      el.classList.toggle('is-open', st.open);
      el.classList.toggle('is-closed', !st.open);
      var b = $('b', el);
      if (b) b.textContent = el.classList.contains('status--sm')
        ? (st.open ? 'Aberto' : 'Fechado')
        : st.label;
    });
  }
  paintStatus();
  setInterval(paintStatus, 60000);

  /* Destaca o dia de hoje na tabela de horários */
  var todayRow = $('#hoursTable tr[data-day="' + new Date().getDay() + '"]');
  if (todayRow) todayRow.classList.add('is-today');

  /* =======================================================
     AGENDAMENTO
     ======================================================= */
  var svcChips = $('#svcChips');
  var proList  = $('#proList');
  var dayList  = $('#dayList');
  var slotList = $('#slotList');
  var slotNote = $('#slotNote');
  var nameInput = $('#nameInput');
  var nextBtn  = $('#nextBtn');
  var backBtn  = $('#backBtn');
  var stepsEl  = $$('#steps li');
  var stepPanes = $$('.step');

  var pick = { svc: null, pro: null, date: null, time: null };
  var step = 1;
  var LAST_STEP = 4;

  /* --- passo 1: os chips vêm do HTML, aqui só ligamos o clique --- */
  $$('.chip', svcChips).forEach(function (b) {
    b.addEventListener('click', function () {
      $$('.chip', svcChips).forEach(function (c) { c.classList.remove('is-on'); });
      b.classList.add('is-on');
      pick.svc = b.textContent.trim();
      syncUI();
    });
  });

  /* --- passo 2: barbeiro escolhido decide pra qual WhatsApp vai --- */
  $$('.pro', proList).forEach(function (b) {
    b.addEventListener('click', function () {
      $$('.pro', proList).forEach(function (c) { c.classList.remove('is-on'); });
      b.classList.add('is-on');
      pick.pro = { name: $('b', b).textContent.trim(), phone: b.dataset.phone };
      syncUI();
    });
  });

  /* --- passo 2: próximos dias abertos --- */
  function buildDays() {
    dayList.innerHTML = '';
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    for (var i = 0; i < DAYS_AHEAD; i++) {
      var d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
      var h = HOURS[d.getDay()];
      if (!h) continue;                                   // domingo: pula
      if (i === 0 && !slotsFor(d).length) continue;       // hoje já sem horário: pula

      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'day' + (i === 0 ? ' is-today' : '');
      b.dataset.iso = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
      b.innerHTML =
        '<em>' + (i === 0 ? 'hoje' : i === 1 ? 'amanhã' : DAY_NAMES[d.getDay()].slice(0, 3)) + '</em>' +
        '<b>' + pad(d.getDate()) + '</b>' +
        '<small>' + d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '') + '</small>';

      (function (dateObj, btn) {
        btn.addEventListener('click', function () {
          $$('.day', dayList).forEach(function (x) { x.classList.remove('is-on'); });
          btn.classList.add('is-on');
          pick.date = dateObj;
          pick.time = null;
          syncUI();
        });
      })(d, b);

      dayList.appendChild(b);
    }
  }

  /* --- passo 3: horários possíveis de um dia --- */
  function slotsFor(date) {
    var h = HOURS[date.getDay()];
    if (!h) return [];

    var now = new Date();
    var isToday = date.toDateString() === now.toDateString();
    var cutoff = now.getHours() * 60 + now.getMinutes() + 45; // margem para chegar

    var out = [];
    for (var m = h[0] * 60; m + SLOT_MIN <= h[1] * 60; m += SLOT_MIN) {
      if (isToday && m < cutoff) continue;
      out.push(pad(Math.floor(m / 60)) + ':' + pad(m % 60));
    }
    return out;
  }

  /* =======================================================
     AGENDA — conversa com a planilha
     ======================================================= */

  /* nome -> whatsapp, lido dos próprios botões do passo 2 */
  var TELEFONES = {};
  var NOMES = [];
  $$('.pro', proList).forEach(function (b) {
    var nome = $('b', b).textContent.trim();
    TELEFONES[nome] = b.dataset.phone;
    if (!b.classList.contains('pro--any')) NOMES.push(nome);
  });

  var agendaCache = {};   // 'aaaa-mm-dd' -> { 'hora|barbeiro': true }

  function iso(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  /* Devolve null quando não há planilha configurada ou a consulta falhou —
     nesse caso o site trata todos os horários como livres, que é o
     comportamento antigo. Melhor mostrar demais do que travar o cliente. */
  function buscarMarcados(dia, cb) {
    if (!AGENDA_URL) { cb(null); return; }
    if (agendaCache[dia]) { cb(agendaCache[dia]); return; }

    var url = AGENDA_URL + (AGENDA_URL.indexOf('?') === -1 ? '?' : '&') +
              'acao=ocupados&de=' + dia + '&ate=' + dia;

    fetch(url, { method: 'GET' })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d || !d.ok) { cb(null); return; }
        var mapa = {};
        (d.marcados || []).forEach(function (m) {
          var partes = m.split('|');          // data|hora|barbeiro
          if (partes[0] === dia) mapa[partes[1] + '|' + partes[2]] = true;
        });
        agendaCache[dia] = mapa;
        cb(mapa);
      })
      .catch(function () { cb(null); });
  }

  /* "Tanto faz" só está ocupado quando os três barbeiros estão. */
  function estaOcupado(mapa, hora) {
    if (!mapa) return false;
    var nome = pick.pro && pick.pro.name;
    if (nome && NOMES.indexOf(nome) !== -1) return !!mapa[hora + '|' + nome];
    return NOMES.every(function (n) { return !!mapa[hora + '|' + n]; });
  }

  function buildSlots(aviso) {
    slotList.innerHTML = '';
    if (!pick.date) return;

    var list = slotsFor(pick.date);
    if (!list.length) {
      slotNote.textContent = 'Não há mais janelas para este dia — escolha outra data.';
      slotNote.className = 'note note--warn';
      return;
    }

    var dia = iso(pick.date);
    slotNote.textContent = AGENDA_URL ? 'Consultando a agenda…' : ' ';
    slotNote.className = 'note';
    slotList.setAttribute('aria-busy', 'true');

    buscarMarcados(dia, function (mapa) {
      /* o cliente pode ter voltado e trocado de dia enquanto isso carregava */
      if (!pick.date || iso(pick.date) !== dia || step !== LAST_STEP) return;

      slotList.innerHTML = '';
      slotList.removeAttribute('aria-busy');
      var livres = 0;

      list.forEach(function (t) {
        var ocupado = estaOcupado(mapa, t);
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'slot' + (ocupado ? ' slot--off' : '');
        b.textContent = t;

        if (ocupado) {
          b.disabled = true;
          b.title = 'Horário já reservado';
        } else {
          livres++;
          b.addEventListener('click', function () {
            $$('.slot', slotList).forEach(function (x) { x.classList.remove('is-on'); });
            b.classList.add('is-on');
            pick.time = t;
            syncUI();
          });
        }
        slotList.appendChild(b);
      });

      /* o aviso de conflito é escrito aqui dentro, senão a consulta
         terminaria depois dele e apagaria a mensagem */
      if (aviso) {
        slotNote.textContent = aviso;
        slotNote.className = 'note note--warn';
      } else if (!livres && mapa) {
        slotNote.textContent = 'Este dia já está todo reservado — escolha outra data.';
        slotNote.className = 'note note--warn';
      } else if (mapa) {
        slotNote.textContent = 'Os horários riscados já foram reservados.';
        slotNote.className = 'note';
      } else {
        slotNote.textContent = 'Janelas de ' + SLOT_MIN + ' minutos. A confirmação final é feita pela equipe no WhatsApp.';
        slotNote.className = 'note';
      }
    });
  }

  /* --- navegação entre passos --- */
  function showStep(n) {
    step = n;
    stepPanes.forEach(function (p) { p.hidden = Number(p.dataset.step) !== n; });
    stepsEl.forEach(function (li, i) {
      li.classList.toggle('is-active', i + 1 === n);
      li.classList.toggle('is-done', i + 1 < n);
    });
    backBtn.hidden = n === 1;
    if (n === 3) buildDays();
    if (n === 4) buildSlots();
    syncUI();
  }

  function fmtDate(d) {
    return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
  }

  function syncUI() {
    var set = {
      svc:  pick.svc,
      pro:  pick.pro ? pick.pro.name : null,
      day:  pick.date ? fmtDate(pick.date) : null,
      time: pick.time
    };
    $$('.summary__item').forEach(function (el) {
      var v = set[el.dataset.k];
      el.classList.toggle('is-set', !!v);
      $('b', el).textContent = v || '—';
    });

    var ready = (step === 1 && pick.svc)  ||
                (step === 2 && pick.pro)  ||
                (step === 3 && pick.date) ||
                (step === 4 && pick.time);
    nextBtn.disabled = !ready;
    nextBtn.textContent = step === LAST_STEP ? 'Enviar no WhatsApp' : 'Continuar';
  }

  /* Abre a conversa já escrita com o barbeiro que ficou com o horário. */
  function abrirWhatsApp(comQuem) {
    var nome = (nameInput.value || '').trim();
    var fone = TELEFONES[comQuem] || (pick.pro && pick.pro.phone) || WHATS;

    var msg =
      'Olá, ' + comQuem + '! 👋\n' +
      'Acabei de reservar um horário pelo site:\n\n' +
      '• Serviço: ' + pick.svc + '\n' +
      '• Profissional: ' + comQuem + '\n' +
      '• Dia: ' + fmtDate(pick.date) + '\n' +
      '• Horário: ' + pick.time + '\n' +
      (nome ? '• Nome: ' + nome + '\n' : '') +
      '\nVim pelo site 💈';

    window.open('https://wa.me/' + fone + '?text=' + encodeURIComponent(msg),
                '_blank', 'noopener');
  }

  /* Sem planilha configurada a mensagem é um pedido, não uma reserva. */
  function abrirWhatsAppSemReserva() {
    var nome = (nameInput.value || '').trim();
    var pro  = pick.pro || {};
    var comQuem = (pro.name && NOMES.indexOf(pro.name) !== -1) ? pro.name : null;

    var msg =
      (comQuem ? 'Olá, ' + comQuem + '! 👋\n' : 'Olá, Barbearia Danber! 👋\n') +
      'Gostaria de agendar um horário:\n\n' +
      '• Serviço: ' + pick.svc + '\n' +
      (comQuem ? '• Profissional: ' + comQuem + '\n' : '• Profissional: quem estiver livre\n') +
      '• Dia: ' + fmtDate(pick.date) + '\n' +
      '• Horário: ' + pick.time + '\n' +
      (nome ? '• Nome: ' + nome + '\n' : '') +
      '\nVim pelo site 💈';

    window.open('https://wa.me/' + (pro.phone || WHATS) + '?text=' + encodeURIComponent(msg),
                '_blank', 'noopener');
  }

  nextBtn.addEventListener('click', function () {
    if (step < LAST_STEP) { showStep(step + 1); return; }

    if (!AGENDA_URL) { abrirWhatsAppSemReserva(); return; }

    var dia = iso(pick.date);
    nextBtn.disabled = true;
    nextBtn.textContent = 'Reservando…';

    fetch(AGENDA_URL, {
      method: 'POST',
      /* text/plain de propósito: evita a checagem prévia de CORS, que o
         Apps Script não responde. O corpo continua sendo JSON. */
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        data:     dia,
        hora:     pick.time,
        barbeiro: pick.pro && NOMES.indexOf(pick.pro.name) !== -1 ? pick.pro.name : '',
        cliente:  (nameInput.value || '').trim(),
        telefone: '',
        servico:  pick.svc
      })
    })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        nextBtn.textContent = 'Enviar no WhatsApp';

        if (d && d.ok) {
          delete agendaCache[dia];       // o horário que acabou de sair da lista
          abrirWhatsApp(d.barbeiro);
          nextBtn.disabled = false;
          return;
        }

        /* Alguém pegou o horário no meio do caminho: recarrega e avisa. */
        delete agendaCache[dia];
        pick.time = null;
        buildSlots(d && d.motivo === 'lotado'
          ? 'Esse horário acabou de lotar com os três barbeiros. Escolha outro.'
          : 'Esse horário acabou de ser reservado por outra pessoa. Escolha outro.');
        syncUI();
      })
      .catch(function () {
        /* Planilha fora do ar não pode impedir o cliente de agendar:
           segue pelo WhatsApp e o barbeiro confirma na mão. */
        nextBtn.textContent = 'Enviar no WhatsApp';
        nextBtn.disabled = false;
        abrirWhatsAppSemReserva();
      });
  });

  backBtn.addEventListener('click', function () { if (step > 1) showStep(step - 1); });

  showStep(1);

  /* Clicar num card de serviço já leva pro agendamento com ele marcado */
  $$('#serviceGrid .card').forEach(function (card) {
    card.addEventListener('click', function () {
      var name = card.dataset.svc;
      $$('.chip', svcChips).forEach(function (c) {
        var on = c.textContent.trim() === name;
        c.classList.toggle('is-on', on);
        if (on) pick.svc = name;
      });
      showStep(1);
      $('#agendar').scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });
    });
  });

  /* =======================================================
     CONTADORES
     ======================================================= */
  var counters = $$('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    var cIo = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        obs.unobserve(en.target);

        var el = en.target;
        var end = parseInt(el.dataset.count, 10) || 0;
        var suffix = el.dataset.suffix || '';

        /* o valor final já está no HTML — sem JS ele fica lá do mesmo jeito */
        if (REDUCED) { el.textContent = end + suffix; return; }

        var dur = 1400, t0 = performance.now();
        (function tick(t) {
          var p = Math.min((t - t0) / dur, 1);
          var e = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(end * e) + (p === 1 ? suffix : '');
          if (p < 1) requestAnimationFrame(tick);
        })(t0);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { cIo.observe(c); });
  }

  /* =======================================================
     LIGHTBOX
     ======================================================= */
  var lb      = $('#lightbox');
  var lbImg   = $('#lbImg');
  var lbCap   = $('#lbCap');
  var shots   = $$('.shot[data-src]');
  var lbIndex = 0;
  var lastFocus = null;

  function openLb(i) {
    lbIndex = (i + shots.length) % shots.length;
    var s = shots[lbIndex];
    lbImg.src = s.dataset.src;
    lbImg.alt = $('img', s) ? $('img', s).alt : '';
    lbCap.textContent = s.dataset.cap || '';
    lb.hidden = false;
    document.body.classList.add('is-locked');
    $('#lbClose').focus();
  }
  function closeLb() {
    lb.hidden = true;
    document.body.classList.remove('is-locked');
    if (lastFocus) lastFocus.focus();
  }

  shots.forEach(function (s, i) {
    s.addEventListener('click', function () { lastFocus = s; openLb(i); });
  });

  $('#lbClose').addEventListener('click', closeLb);
  $('#lbPrev').addEventListener('click', function () { openLb(lbIndex - 1); });
  $('#lbNext').addEventListener('click', function () { openLb(lbIndex + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });

  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') openLb(lbIndex - 1);
    if (e.key === 'ArrowRight') openLb(lbIndex + 1);
  });

  /* =======================================================
     MISC
     ======================================================= */
  var year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

})();
