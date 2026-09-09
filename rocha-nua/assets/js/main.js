/* =====================================================================
   MAIN.JS · monta o ao vivo, a agenda, os vídeos e os botões de contato a
   partir de dados.js

   Enquanto uma lista estiver vazia, a seção mostra um estado vazio de
   verdade, escrito para ser lido. Nada de exemplo inventado passando
   por conteúdo real.
   ===================================================================== */

(function () {
  'use strict';

  var D = (window.ROCHA || {});
  var aoVivo = D.aoVivo || [];
  var agenda = D.agenda || [];
  var videos = D.videos || [];
  var contato = D.contato || {};

  /* ---------------------------------------------------------- utilidades */

  function el(tag, classe, texto) {
    var n = document.createElement(tag);
    if (classe) n.className = classe;
    if (texto != null) n.textContent = texto;
    return n;
  }

  function vazio(frase, nota) {
    var caixa = el('div', 'vazio');
    caixa.appendChild(el('p', 'vazio__frase', frase));
    if (nota) caixa.appendChild(el('p', 'vazio__nota', nota));
    return caixa;
  }

  function link(href, classe, texto, externo) {
    var a = el('a', classe, texto);
    a.href = href;
    if (externo) {
      a.target = '_blank';
      a.rel = 'noopener';
    }
    return a;
  }

  /* Só aceita ID de vídeo do YouTube. Se alguém colar a URL inteira por
     engano, o vídeo é ignorado em vez de virar um iframe quebrado. */
  function idValido(id) {
    return typeof id === 'string' && /^[A-Za-z0-9_-]{11}$/.test(id);
  }

  var MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun',
               'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  var DIAS = ['domingo', 'segunda', 'terça', 'quarta',
              'quinta', 'sexta', 'sábado'];

  function lerData(iso) {
    if (typeof iso !== 'string') return null;
    var p = iso.split('-');
    if (p.length !== 3) return null;
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    return isNaN(d.getTime()) ? null : d;
  }

  /* -------------------------------------------------------------- ao vivo
     Um bloco por musica: o nome vai POR CIMA do video, sobre o cartaz.

     O selo do nome e pointer-events:none, senao cobriria os controles do
     video e ninguem conseguiria dar play. E ele some enquanto toca: nome
     grande em cima de gente tocando atrapalha quem veio ver. */

  function montarAoVivo() {
    var alvo = document.getElementById('lista-aovivo');
    if (!alvo) return;

    var bons = aoVivo.filter(function (c) { return c && c.musica && c.video; });
    if (!bons.length) {
      alvo.appendChild(vazio(
        'Os vídeos ao vivo entram aqui.',
        'É só preencher a lista "aoVivo" em assets/js/dados.js.'
      ));
      return;
    }

    var grade = el('div', 'aovivo-grade');

    bons.forEach(function (c) {
      var bloco = el('article', 'cancao');

      var quadro = el('div', 'cancao__quadro');

      var v = document.createElement('video');
      v.className = 'cancao__video';
      v.src = c.video;
      if (c.cartaz) v.poster = c.cartaz;
      v.controls = true;
      v.preload = 'none';          // os megabytes so saem se alguem apertar play
      v.playsInline = true;
      v.setAttribute('width', '576');
      v.setAttribute('height', '1024');
      quadro.appendChild(v);

      var selo = el('div', 'cancao__selo');
      selo.appendChild(el('h3', 'cancao__nome', c.musica));
      if (c.autoral) {
        selo.appendChild(el('p', 'cancao__autoral micro', 'Autoral'));
      } else if (c.artista) {
        selo.appendChild(el('p', 'cancao__artista micro', c.artista));
      }
      quadro.appendChild(selo);

      // some enquanto toca, volta quando pausa ou acaba
      v.addEventListener('play', function () { bloco.classList.add('tocando'); });
      v.addEventListener('pause', function () { bloco.classList.remove('tocando'); });
      v.addEventListener('ended', function () { bloco.classList.remove('tocando'); });

      bloco.appendChild(quadro);
      grade.appendChild(bloco);
    });

    alvo.appendChild(grade);
  }

  /* -------------------------------------------------------------- agenda */

  function montarAgenda() {
    var alvo = document.getElementById('lista-agenda');
    if (!alvo) return;

    var hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    var futuros = agenda
      .map(function (s) { return { dados: s, quando: lerData(s.data) }; })
      .filter(function (s) { return s.quando && s.quando >= hoje; })
      .sort(function (a, b) { return a.quando - b.quando; });

    if (!futuros.length) {
      alvo.appendChild(vazio(
        'Sem data marcada.',
        'Quando tiver show fechado, ele aparece aqui. Para chamar a banda, desce até o fim da página.'
      ));
      return;
    }

    futuros.forEach(function (item) {
      var s = item.dados;
      var d = item.quando;

      var linha = el('div', 'show');

      var data = el('div', 'show__data', d.getDate() + ' ' + MESES[d.getMonth()]);
      var sub = el('small', null, DIAS[d.getDay()] + (s.hora ? ', ' + s.hora : ''));
      data.appendChild(sub);
      linha.appendChild(data);

      var meio = el('div');
      meio.appendChild(el('h3', 'show__local', s.local || 'Local a confirmar'));
      if (s.cidade) meio.appendChild(el('p', 'show__cidade', s.cidade));
      linha.appendChild(meio);

      if (s.link) {
        linha.appendChild(link(s.link, 'btn btn--linha', 'Detalhes', true));
      } else {
        linha.appendChild(el('span'));
      }
      alvo.appendChild(linha);
    });
  }

  /* -------------------------------------------------------------- vídeos */

  function montarVideos() {
    var alvo = document.getElementById('lista-videos');
    if (!alvo) return;

    var bons = videos.filter(function (v) { return v && idValido(v.id); });
    if (!bons.length) return;   // a secao ja tem os videos proprios

    var grade = el('div', 'grade-videos');
    bons.forEach(function (v) {
      var caixa = el('article', 'video');
      var moldura = el('div', 'video__moldura');

      var frame = document.createElement('iframe');
      frame.src = 'https://www.youtube-nocookie.com/embed/' + v.id;
      frame.title = v.titulo || 'Vídeo da Rocha Nua';
      frame.loading = 'lazy';
      frame.allow = 'accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      frame.setAttribute('allowfullscreen', '');
      frame.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');

      moldura.appendChild(frame);
      caixa.appendChild(moldura);
      if (v.titulo) caixa.appendChild(el('h3', 'video__titulo', v.titulo));
      grade.appendChild(caixa);
    });
    alvo.appendChild(grade);
  }

  /* ------------------------------------------------------------ contato */

  function montarContato() {
    var alvo = document.getElementById('contato-acoes');
    if (!alvo) return;

    var msg = encodeURIComponent('Oi! Quero chamar a Rocha Nua pra tocar.');
    var principal = null;

    if (contato.whatsapp) {
      principal = link('https://wa.me/' + contato.whatsapp + '?text=' + msg,
                       'btn btn--branco', 'Chamar no WhatsApp', true);
    } else if (contato.email) {
      principal = link('mailto:' + contato.email + '?subject=Contratacao%20Rocha%20Nua',
                       'btn btn--branco', 'Mandar e-mail', true);
    } else if (contato.instagram) {
      // Sem telefone nem e-mail confirmados, o direct é o canal que existe.
      principal = link('https://instagram.com/' + contato.instagram,
                       'btn btn--branco', 'Chamar no direct', true);
    }
    if (principal) alvo.appendChild(principal);

    if (contato.instagram && principal && principal.href.indexOf('instagram.com') === -1) {
      alvo.appendChild(link('https://instagram.com/' + contato.instagram,
                            'btn btn--linha', 'Instagram', true));
    }
    if (contato.youtube) {
      alvo.appendChild(link(contato.youtube, 'btn btn--linha', 'YouTube', true));
    }
  }


  /* ------------------------------------------------------------- vagas
     Mesma ideia do site da Eloize: cada foto tem nome de arquivo fixo e
     dimensão reservada. Enquanto o arquivo não existe, o desenho que já
     está na página fica no lugar. Solte o arquivo em assets/img/ com o
     nome certo e ele assume sozinho, sem tocar em código.

     A vaga nasce marcada como vazia, então quem estiver sem JavaScript
     continua vendo o desenho, e não um buraco. */

  function checarVagas(raiz) {
    (raiz || document).querySelectorAll('[data-vaga]').forEach(function (vaga) {
      var real = vaga.querySelector('.vaga__real');
      if (!real) return;

      function chegou() {
        if (real.naturalWidth) vaga.classList.add('vaga--cheia');
      }
      if (real.complete) {
        chegou();
      } else {
        real.addEventListener('load', chegou, { once: true });
        real.addEventListener('error', function () {}, { once: true });
      }
    });
  }

  /* ----------------------------------------------------------- movimento

     Duas coisas, e as duas so existem quando o JS assume:

     1) ENTRADA. Cada peca ganha uma variante de entrada conforme o que
        ela e: palavra grande e varrida como tinta, bloco sobe, letra
        miuda so aparece, selo assenta como carimbo.

        O escalonamento e dentro do grupo que entra junto, nunca pelo
        indice no documento: pelo indice, uma peca la embaixo herdaria um
        atraso enorme e pareceria travada.

     2) DESLOCAMENTO. A foto da chapa anda menos que a pagina, e as tres
        linhas da faixa repetida andam em sentidos e velocidades
        diferentes, como chapa de impressao fora de registro.

     Tudo dentro de try: se qualquer coisa falhar, a marca sai da raiz e
     a pagina volta a aparecer inteira. O pior defeito possivel aqui
     seria esconder o conteudo e nao conseguir mostrar de volta. */

  var ENTRADAS = [
    ['.capa__nome',          'varre'],
    ['.capa__sub',           'sobe'],
    ['.capa__acoes',         'sobe'],
    ['.capa__ficha',         'sobe'],
    ['.marcas',              'surge'],
    ['.chapa__palavra',      'varre'],
    ['.banda__palavra',      'varre'],
    ['.banda__selo',         'carimbo'],
    ['.integrante',          'sobe'],
    ['.secao__etiqueta',     'sobe'],
    ['.cancao',              'sobe'],
    ['.faixa-musica',        'sobe'],
    ['.show',                'sobe'],
    ['.vazio',               'sobe'],
    ['.videos__rodape',      'sobe'],
    ['.fecho__titulo',       'varre'],
    ['.fecho__texto',        'sobe'],
    ['.contratacao__acoes',  'sobe']
  ];

  var DESLOCAMENTO = [
    ['.secao__fundo img', 24],
    ['.repetida__peca',   36]
  ];
  var LINHAS_REPETIDA = [-82, 108, -54];
  var FUNDO_REPETIDA = [-190, 40, 170];   // profundidade de cada linha na cena

  function menosMovimento() {
    return window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function animarEntrada() {
    if (!('IntersectionObserver' in window)) return;

    partirEmLetras(document.querySelector('.capa__nome'));

    var alvos = [];
    ENTRADAS.forEach(function (par) {
      Array.prototype.forEach.call(document.querySelectorAll(par[0]), function (el) {
        if (el.hasAttribute('data-entra')) return;   // ja marcado por outro seletor
        el.setAttribute('data-entra', par[1]);
        el.classList.add('entra');
        alvos.push(el);
      });
    });
    if (!alvos.length) return;

    /* A varredura NAO pode ser observada nela mesma. O clip-path que a
       esconde zera a area de intersecao: o navegador devolve
       intersectionRatio 0 para um elemento inteiramente na tela, o
       observador nunca dispara e a peca fica escondida para sempre.
       Medido: o titulo da capa, 1196x115 e visivel, dava area vista 0.

       Entao quem e observado e o PAI, que nao esta recortado, e ele
       carrega a lista de pecas que devem entrar junto. */
    var observados = [];
    alvos.forEach(function (el) {
      var alvo = (el.getAttribute('data-entra') === 'varre' && el.parentElement)
        ? el.parentElement : el;
      if (!alvo.__entradas) { alvo.__entradas = []; observados.push(alvo); }
      alvo.__entradas.push(el);
    });

    var raiz = document.documentElement;
    try {
      raiz.classList.add('js-anima');

      var obs = new IntersectionObserver(function (entradas) {
        var ordem = 0;
        entradas.forEach(function (e) {
          if (!e.isIntersecting) return;
          (e.target.__entradas || []).forEach(function (el) {
            el.style.setProperty('--atraso', Math.min(ordem, 7) * 65 + 'ms');
            el.classList.add('entrou');
            ordem++;
          });
          obs.unobserve(e.target);
        });
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });

      observados.forEach(function (n) { obs.observe(n); });

      /* Rede de seguranca. A margem negativa do observador exclui a
         ultima faixa da tela, e peca que vive no rodape do documento
         pode nunca cair na area observada: medido em 2560x1440, a letra
         miuda do fecho ficava escondida para sempre. Chegou ao fim da
         pagina, o que sobrou aparece. */
      var rede = function () {
        var fim = window.innerHeight + (window.pageYOffset || 0)
          >= document.documentElement.scrollHeight - 4;
        if (!fim) return;
        alvos.forEach(function (el) {
          if (!el.classList.contains('entrou')) el.classList.add('entrou');
        });
        window.removeEventListener('scroll', rede);
      };
      window.addEventListener('scroll', rede, { passive: true });
    } catch (erro) {
      raiz.classList.remove('js-anima');
      alvos.forEach(function (el) { el.removeAttribute('data-entra'); });
    }
  }

  /* Parte o nome em letras, para o tipo ser montado uma a uma. O texto
     inteiro fica no aria-label e as letras somem para o leitor de tela,
     senao ele soletraria a palavra. */
  function partirEmLetras(el) {
    if (!el || el.querySelector('.letra')) return;
    var texto = el.textContent;
    el.setAttribute('aria-label', texto);
    el.textContent = '';
    var n = 0;
    texto.split('').forEach(function (c) {
      var sp = document.createElement('span');
      sp.className = 'letra' + (c === ' ' ? ' letra--vao' : '');
      sp.setAttribute('aria-hidden', 'true');
      sp.textContent = c === ' ' ? '\u00a0' : c;
      if (c !== ' ') { sp.style.setProperty('--letra', (n * 42) + 'ms'); n++; }
      el.appendChild(sp);
    });
  }

  /* ------------------------------------------------- um laco para tudo

     Deslocamento, fora de registro, fio de progresso e a regua vivem no
     MESMO requestAnimationFrame. Separados, cada um leria a rolagem por
     conta e o navegador recalcularia o layout varias vezes por quadro.

     A regua sai do controle do CSS e passa para ca porque ela reage a
     VELOCIDADE da rolagem: rolou rapido, ela dispara junto e volta ao
     passo sozinha. Isso nao da para fazer com animation-duration, que
     salta quando muda no meio. */

  /* ----------------------------------------------------------- interacao

     A pagina responde ao ponteiro, e nao so a rolagem: a palavra da
     chapa e empurrada e vira em 3D, o botao vira ima, o clique deixa
     carimbo, a regua para e volta quando o ponteiro passa por ela.

     O 3D fica so na tipografia. Video, card e logo ficam planos: com
     tudo inclinando, a pagina ficava bamba.

     Os ouvintes so GUARDAM valores. Quem escreve no estilo e o mesmo
     requestAnimationFrame do resto: mexer em transform dentro do
     mousemove faria o navegador recalcular varias vezes por quadro.

     Nada disto entra em tela de toque nem em movimento reduzido. */

  var mao = {
    ativa: false,
    empurroes: [],   // palavras empurradas pelo ponteiro
    puxados: [],     // botoes puxados pelo ima
    reguaParada: false
  };

  function prepararInteracao() {
    if (menosMovimento()) return;
    if (!window.matchMedia
        || !window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    mao.ativa = true;
    document.documentElement.classList.add('mao');

    // a palavra da chapa e empurrada pelo ponteiro dentro da faixa
    Array.prototype.forEach.call(
      document.querySelectorAll('.chapa, .banda'), function (faixa) {
        var palavra = faixa.querySelector('.chapa__palavra, .banda__palavra, .fecho__titulo');
        if (!palavra) return;
        var item = { el: palavra, x: 0, y: 0, ax: 0, ay: 0 };
        mao.empurroes.push(item);
        faixa.addEventListener('mousemove', function (e) {
          var r = faixa.getBoundingClientRect();
          item.ax = ((e.clientX - r.left) / r.width - 0.5) * 26;
          item.ay = ((e.clientY - r.top) / r.height - 0.5) * 14;
        }, { passive: true });
        faixa.addEventListener('mouseleave', function () { item.ax = 0; item.ay = 0; });
      });

    // ima: o elemento inclina na direcao do ponteiro e volta sozinho
    function guiar(sel, forca) {
      Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) {
        var item = { el: el, x: 0, y: 0, ax: 0, ay: 0 };
        mao.puxados.push(item);
        el.addEventListener('mousemove', function (e) {
          var r = el.getBoundingClientRect();
          item.ax = ((e.clientX - r.left) / r.width - 0.5) * 2 * forca;
          item.ay = ((e.clientY - r.top) / r.height - 0.5) * 2 * forca;
          el.classList.add('puxado');
        }, { passive: true });
        el.addEventListener('mouseleave', function () {
          item.ax = 0; item.ay = 0; el.classList.remove('puxado');
        });
      });
    }
    // so o botao: video, card e logo ficam parados de proposito
    guiar('.btn', 9);

    // o ponteiro gira a cena 3D da faixa repetida
    var repetida = document.querySelector('.repetida');
    var linhas = document.querySelector('.repetida__linhas');
    if (repetida && linhas) {
      repetida.addEventListener('mousemove', function (e) {
        var r = repetida.getBoundingClientRect();
        var gx = ((e.clientY - r.top) / r.height - 0.5) * -13;
        var gy = ((e.clientX - r.left) / r.width - 0.5) * 17;
        linhas.style.setProperty('--giro-x', gx.toFixed(2) + 'deg');
        linhas.style.setProperty('--giro-y', gy.toFixed(2) + 'deg');
      }, { passive: true });
      repetida.addEventListener('mouseleave', function () {
        linhas.style.setProperty('--giro-x', '0deg');
        linhas.style.setProperty('--giro-y', '0deg');
      });
    }

    // a regua para quando o ponteiro passa por cima
    var regua = document.querySelector('.regua');
    if (regua) {
      regua.addEventListener('mouseenter', function () { mao.reguaParada = true; });
      regua.addEventListener('mouseleave', function () { mao.reguaParada = false; });
    }

    // carimbo do clique
    document.addEventListener('click', function (e) {
      if (!e.clientX && !e.clientY) return;    // clique por teclado nao carimba
      var c = document.createElement('span');
      c.className = 'carimbo';
      c.setAttribute('aria-hidden', 'true');
      c.style.transform = 'translate3d(' + e.clientX + 'px,' + e.clientY + 'px,0)';
      c.style.left = '0'; c.style.top = '0';
      c.style.marginLeft = '-13px'; c.style.marginTop = '-13px';
      document.body.appendChild(c);
      setTimeout(function () { if (c.parentNode) c.parentNode.removeChild(c); }, 600);
    }, { passive: true });
  }

  function moverNaRolagem() {
    if (menosMovimento()) return;

    var itens = [];
    DESLOCAMENTO.forEach(function (par) {
      Array.prototype.forEach.call(document.querySelectorAll(par[0]), function (el) {
        itens.push({ el: el, forca: par[1], eixo: 'y' });
      });
    });
    Array.prototype.forEach.call(document.querySelectorAll('.repetida__linha'),
      function (el, n) {
        itens.push({
          el: el,
          forca: LINHAS_REPETIDA[n % LINHAS_REPETIDA.length],
          fundo: FUNDO_REPETIDA[n % FUNDO_REPETIDA.length],
          eixo: 'x'
        });
      });

    // texto que entra em registro conforme sobe na tela
    var registros = [].slice.call(document.querySelectorAll(
      '.capa__nome, .chapa__palavra, .banda__palavra, .repetida__linha, .fecho__titulo'));

    /* O anel que segue a bolinha com atraso. So entra onde ha ponteiro
       de verdade: em tela de toque nao ha cursor e o anel ficaria parado
       num canto. O cursor em si e CSS e nao depende disto. */
    var anel = null, anelX = 0, anelY = 0, alvoX = 0, alvoY = 0, anelEsc = 1, alvoEsc = 1;
    var CLICAVEL = 'a, button, .btn, summary, [role="button"], video, .integrante__arroba';
    if (window.matchMedia && window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
      anel = document.createElement('div');
      anel.className = 'anel';
      anel.setAttribute('aria-hidden', 'true');
      document.body.appendChild(anel);
      window.addEventListener('mousemove', function (e) {
        alvoX = e.clientX; alvoY = e.clientY;
        if (!anel.classList.contains('anel--vendo')) {
          anelX = alvoX; anelY = alvoY;          // nasce no lugar, sem voar da origem
          anel.classList.add('anel--vendo');
        }
        var sobre = e.target && e.target.closest && e.target.closest(CLICAVEL);
        alvoEsc = sobre ? 1.7 : 1;
        anel.classList.toggle('anel--sobre', !!sobre);
      }, { passive: true });
      window.addEventListener('mouseleave', function () {
        anel.classList.remove('anel--vendo');
      });
    }

    var linhasRepetida = document.querySelector('.repetida__linhas');
    var fio = document.querySelector('.fio__tinta');
    var trilho = document.querySelector('.regua__trilho');
    var larguraTrilho = 0, posRegua = 0, velRegua = 0;
    if (trilho) {
      document.documentElement.classList.add('regua-js');
      larguraTrilho = trilho.scrollWidth / 2;
    }

    var ultimoY = window.pageYOffset || 0;
    var impulso = 0;
    var ultimoTempo = 0;
    var rodando = false;

    function quadro(agora) {
      var dt = ultimoTempo ? Math.min((agora - ultimoTempo) / 1000, 0.05) : 0.016;
      ultimoTempo = agora;

      var y = window.pageYOffset || 0;
      var alturaJanela = window.innerHeight || document.documentElement.clientHeight;
      var meio = alturaJanela / 2;

      // velocidade da rolagem, suavizada: entra rapido e volta devagar
      var delta = y - ultimoY;
      ultimoY = y;
      impulso += (Math.abs(delta) * 14 - impulso) * 0.18;
      if (impulso < 0.01) impulso = 0;

      // a faixa repetida torce com a velocidade da rolagem
      if (linhasRepetida) {
        var t = Math.max(-2.6, Math.min(2.6, delta * 0.05));
        linhasRepetida.style.setProperty('--torcao', t.toFixed(2) + 'deg');
      }

      // fio de progresso
      if (fio) {
        var rolavel = document.documentElement.scrollHeight - alturaJanela;
        fio.style.setProperty('--passou', rolavel > 0 ? (y / rolavel).toFixed(4) : '0');
      }

      // regua: passo base mais o impulso da rolagem
      if (trilho && larguraTrilho) {
        velRegua = (mao.reguaParada ? 0 : 58) + (mao.reguaParada ? 0 : Math.min(impulso, 900));
        posRegua = (posRegua + velRegua * dt) % larguraTrilho;
        trilho.style.transform = 'translate3d(' + (-posRegua).toFixed(1) + 'px,0,0)';
      }

      itens.forEach(function (it) {
        var r = it.el.getBoundingClientRect();
        if (r.bottom < -300 || r.top > alturaJanela + 300) return;
        var pos = (r.top + r.height / 2 - meio) / (meio + r.height / 2);
        if (pos < -1) pos = -1; else if (pos > 1) pos = 1;
        if (it.fundo !== undefined) {
          /* Linha da faixa repetida: anda no eixo X e vive numa
             profundidade propria dentro da cena. Como a cena tem
             perspectiva no pai e preserve-3d, o translateZ e de verdade:
             a linha do fundo anda menos e some para tras. */
          it.el.style.transform = 'translate3d(' + (pos * it.forca).toFixed(1)
            + 'px,0,' + it.fundo + 'px)';
        } else {
          it.el.style.setProperty('--paralaxe', (pos * it.forca).toFixed(1) + 'px');
        }
      });

      registros.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > alturaJanela + 200) return;
        var pos = (r.top + r.height / 2 - meio) / (meio + r.height / 2);
        if (pos < -1) pos = -1; else if (pos > 1) pos = 1;
        // longe do meio, desencontrado; no meio, em registro
        el.style.setProperty('--registro', (Math.abs(pos) * 7).toFixed(2) + 'px');
      });

      if (mao.ativa) {
        mao.empurroes.forEach(function (it) {
          if (Math.abs(it.ax - it.x) < 0.05 && Math.abs(it.ay - it.y) < 0.05) return;
          it.x += (it.ax - it.x) * 0.14;
          it.y += (it.ay - it.y) * 0.14;
          /* A palavra nao so desliza: ela VIRA. Angulos pequenos de
             proposito — texto muito girado perde nitidez. */
          it.el.style.transform = 'perspective(850px) translate3d('
            + it.x.toFixed(2) + 'px,' + it.y.toFixed(2) + 'px,'
            + (Math.abs(it.x) * 1.1).toFixed(1) + 'px)'
            + ' rotateY(' + (it.x * 0.34).toFixed(2) + 'deg)'
            + ' rotateX(' + (-it.y * 0.5).toFixed(2) + 'deg)';
        });
        mao.puxados.forEach(function (it) {
          if (Math.abs(it.ax - it.x) < 0.05 && Math.abs(it.ay - it.y) < 0.05) return;
          it.x += (it.ax - it.x) * 0.2;
          it.y += (it.ay - it.y) * 0.2;
          it.el.style.transform = 'translate3d(' + it.x.toFixed(2) + 'px,'
            + it.y.toFixed(2) + 'px,0)';
        });
      }

      if (anel) {
        // segue com atraso: quanto menor o fator, mais o anel arrasta
        anelX += (alvoX - anelX) * 0.18;
        anelY += (alvoY - anelY) * 0.18;
        anelEsc += (alvoEsc - anelEsc) * 0.16;
        anel.style.transform = 'translate3d(' + anelX.toFixed(1) + 'px,'
          + anelY.toFixed(1) + 'px,0) scale(' + anelEsc.toFixed(3) + ')';
      }

      // so continua enquanto houver o que mover: a regua nunca para, mas
      // se ela nao existir o laco dorme ate a proxima rolagem
      if (trilho || impulso > 0) {
        window.requestAnimationFrame(quadro);
      } else {
        rodando = false;
      }
    }

    function acordar() {
      if (!rodando) { rodando = true; ultimoTempo = 0; window.requestAnimationFrame(quadro); }
    }

    window.addEventListener('scroll', acordar, { passive: true });
    window.addEventListener('resize', function () {
      if (trilho) larguraTrilho = trilho.scrollWidth / 2;
      acordar();
    }, { passive: true });
    acordar();
  }

  checarVagas();
  window.ROCHA_UI = { checarVagas: checarVagas, animarEntrada: animarEntrada };

  montarAoVivo();
  montarAgenda();
  montarVideos();
  montarContato();

  // depois de montar as listas, senao nao haveria o que observar
  animarEntrada();
  prepararInteracao();
  moverNaRolagem();
})();
