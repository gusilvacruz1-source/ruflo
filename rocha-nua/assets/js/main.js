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
    var caixa = el('div', 'vazio moldura moldura--forte');
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
        'Os vídeos estão no canal.',
        'Para trazer os vídeos para dentro do site, coloque o ID de cada um na lista de vídeos em assets/js/dados.js.'
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

  checarVagas();
  window.ROCHA_UI = { checarVagas: checarVagas };

  montarAutorais();
  montarAgenda();
  montarVideos();
  montarContato();
})();
