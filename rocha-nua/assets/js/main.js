/* =====================================================================
   MAIN.JS · monta autorais, agenda, vídeos e os botões de contato a
   partir de dados.js

   Enquanto uma lista estiver vazia, a seção mostra um estado vazio de
   verdade, escrito para ser lido. Nada de exemplo inventado passando
   por conteúdo real.
   ===================================================================== */

(function () {
  'use strict';

  var D = (window.ROCHA || {});
  var autorais = D.autorais || [];
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

  /* ------------------------------------------------------------ autorais */

  function montarAutorais() {
    var alvo = document.getElementById('lista-autorais');
    if (!alvo) return;

    if (!autorais.length) {
      alvo.appendChild(vazio(
        'As autorais entram aqui.',
        'Assim que tiver gravação ou link, é só preencher a lista de autorais em assets/js/dados.js.'
      ));
      return;
    }

    autorais.forEach(function (musica, i) {
      var linha = el('div', 'faixa-musica');
      linha.appendChild(el('span', 'faixa-musica__num', String(i + 1).padStart(2, '0')));

      var meio = el('div');
      meio.appendChild(el('h3', 'faixa-musica__nome', musica.titulo || 'Sem título'));
      if (musica.ano) meio.appendChild(el('p', 'faixa-musica__ano', musica.ano));
      linha.appendChild(meio);

      if (musica.link) {
        linha.appendChild(link(musica.link, 'faixa-musica__ouvir', 'Ouvir', true));
      } else {
        linha.appendChild(el('span'));
      }
      alvo.appendChild(linha);
    });
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

    if (!bons.length) {
      alvo.appendChild(vazio(
        'Tem mais no canal.',
        'Para trazer outros vídeos para dentro do site, coloque o ID de cada um na lista de vídeos em assets/js/dados.js.'
      ));
      return;
    }

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

  /* ------------------------------------------- entrada por rolagem
     Cada faixa entra quando chega na tela, escalonada dentro do grupo
     que entra junto — e nao pela posicao na lista, senao uma faixa la
     embaixo herdaria um atraso enorme e pareceria travada.

     Entra uma vez so: depois de entrar, para de observar.

     Tudo dentro de try: se qualquer coisa aqui falhar, a marca sai da
     raiz e a lista volta a ser visivel. O pior defeito possivel neste
     trecho seria esconder as musicas e nao conseguir mostrar de volta. */

  function animarEntrada() {
    if (!('IntersectionObserver' in window)) return;

    var alvos = document.querySelectorAll('.faixa-musica, .show');
    if (!alvos.length) return;

    var raiz = document.documentElement;
    try {
      raiz.classList.add('js-anima');
      Array.prototype.forEach.call(alvos, function (el) { el.classList.add('entra'); });

      var obs = new IntersectionObserver(function (entradas) {
        var ordem = 0;
        entradas.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.style.setProperty('--atraso', Math.min(ordem, 6) * 70 + 'ms');
          e.target.classList.add('entrou');
          obs.unobserve(e.target);
          ordem++;
        });
      }, { rootMargin: '0px 0px -10% 0px', threshold: 0.2 });

      Array.prototype.forEach.call(alvos, function (el) { obs.observe(el); });
    } catch (erro) {
      raiz.classList.remove('js-anima');
    }
  }

  checarVagas();
  window.ROCHA_UI = { checarVagas: checarVagas, animarEntrada: animarEntrada };

  montarAutorais();
  montarAgenda();
  montarVideos();
  montarContato();

  // depois de montar as listas, senao nao haveria o que observar
  animarEntrada();
})();
