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
    ['.chapa__tela img',  30],
    ['.secao__fundo img', 22],
    ['.repetida__peca',   36]
  ];
  var LINHAS_REPETIDA = [-82, 108, -54];

  function menosMovimento() {
    return window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function animarEntrada() {
    if (!('IntersectionObserver' in window)) return;

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
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

      observados.forEach(function (n) { obs.observe(n); });
    } catch (erro) {
      raiz.classList.remove('js-anima');
      alvos.forEach(function (el) { el.removeAttribute('data-entra'); });
    }
  }

  function deslocarNaRolagem() {
    if (menosMovimento()) return;

    var itens = [];
    DESLOCAMENTO.forEach(function (par) {
      Array.prototype.forEach.call(document.querySelectorAll(par[0]), function (el) {
        itens.push({ el: el, forca: par[1], eixo: 'y' });
      });
    });
    Array.prototype.forEach.call(document.querySelectorAll('.repetida__linha'),
      function (el, n) {
        itens.push({ el: el, forca: LINHAS_REPETIDA[n % LINHAS_REPETIDA.length], eixo: 'x' });
      });
    if (!itens.length) return;

    var pedido = false;

    function atualizar() {
      pedido = false;
      var alturaJanela = window.innerHeight || document.documentElement.clientHeight;
      var meio = alturaJanela / 2;
      itens.forEach(function (it) {
        var r = it.el.getBoundingClientRect();
        // fora de vista com folga: nao gasta conta com o que ninguem ve
        if (r.bottom < -300 || r.top > alturaJanela + 300) return;
        // -1 quando a peca esta chegando por baixo, +1 quando ja subiu
        var pos = (r.top + r.height / 2 - meio) / (meio + r.height / 2);
        if (pos < -1) pos = -1; else if (pos > 1) pos = 1;
        it.el.style.setProperty('--paralaxe', (pos * it.forca).toFixed(1) + 'px');
      });
    }

    function pedir() {
      if (!pedido) { pedido = true; window.requestAnimationFrame(atualizar); }
    }

    window.addEventListener('scroll', pedir, { passive: true });
    window.addEventListener('resize', pedir, { passive: true });
    atualizar();
  }

  checarVagas();
  window.ROCHA_UI = { checarVagas: checarVagas, animarEntrada: animarEntrada };

  montarAoVivo();
  montarAgenda();
  montarVideos();
  montarContato();

  // depois de montar as listas, senao nao haveria o que observar
  animarEntrada();
  deslocarNaRolagem();
})();
