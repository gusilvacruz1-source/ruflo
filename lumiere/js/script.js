/* =========================================================
   Lumière | Moda & Estilo
   Sem dependências e sem build. Nada aqui escuta o evento de
   scroll: a revelação usa IntersectionObserver.

   O LINK DO WHATSAPP também aparece aqui, na constante ZAP.
   Se trocar no HTML, troque aqui também.
   ========================================================= */
(function () {
  "use strict";

  var ZAP = "https://chat.whatsapp.com/LsB4fxstlon49BFCeop9pT";
  var CHAVE = "lumiere:salvas";

  /* ---------------------------------------------------
     Guarda local. Pode falhar em aba anônima ou com
     cookies bloqueados, e nesse caso o site segue
     funcionando sem memória entre visitas.
     --------------------------------------------------- */
  function ler() {
    try {
      var cru = window.localStorage.getItem(CHAVE);
      var lista = cru ? JSON.parse(cru) : [];
      return Array.isArray(lista) ? lista : [];
    } catch (e) { return []; }
  }
  function gravar(lista) {
    try { window.localStorage.setItem(CHAVE, JSON.stringify(lista)); } catch (e) {}
  }

  var salvas = ler();

  /* ---------------------------------------------------
     1. Peças salvas
     A cliente marca o que gostou e leva a lista pronta
     para a conversa. É assim que a loja já vende hoje.
     --------------------------------------------------- */
  function nomeDe(id) {
    var card = document.querySelector('.card[data-id="' + id + '"]');
    return card ? card.getAttribute("data-nome") : id;
  }

  function pintarBandeja() {
    var tray = document.getElementById("tray");
    var txt = document.getElementById("trayTxt");
    var count = document.getElementById("favCount");
    if (!tray || !txt || !count) return;

    var n = salvas.length;
    tray.hidden = n === 0;
    count.hidden = n === 0;
    count.textContent = String(n);
    txt.textContent = n === 1 ? "1 peça salva" : n + " peças salvas";
  }

  function pintarCoracoes() {
    document.querySelectorAll(".card").forEach(function (card) {
      var botao = card.querySelector(".fav");
      if (!botao) return;
      var marcada = salvas.indexOf(card.getAttribute("data-id")) !== -1;
      var nome = card.getAttribute("data-nome");
      botao.setAttribute("aria-pressed", marcada ? "true" : "false");
      botao.setAttribute("aria-label", (marcada ? "Remover " : "Salvar ") + nome);
    });
  }

  function ligarCoracoes() {
    document.querySelectorAll(".card .fav").forEach(function (botao) {
      botao.addEventListener("click", function () {
        var id = botao.closest(".card").getAttribute("data-id");
        var i = salvas.indexOf(id);
        if (i === -1) { salvas.push(id); } else { salvas.splice(i, 1); }
        gravar(salvas);
        pintarCoracoes();
        pintarBandeja();
      });
    });
  }

  function ligarBandeja() {
    var enviar = document.getElementById("traySend");
    var limpar = document.getElementById("trayClear");
    var txt = document.getElementById("trayTxt");

    if (enviar) {
      enviar.addEventListener("click", function () {
        var recado = "Oi! Vim pelo site e gostei destas peças:\n"
          + salvas.map(function (id) { return "- " + nomeDe(id); }).join("\n");

        function abrir() { window.open(ZAP, "_blank", "noopener"); }

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(recado).then(function () {
            txt.textContent = "Lista copiada. É só colar na conversa.";
            abrir();
          }, abrir);
        } else {
          abrir();
        }
      });
    }

    if (limpar) {
      limpar.addEventListener("click", function () {
        salvas = [];
        gravar(salvas);
        pintarCoracoes();
        pintarBandeja();
      });
    }
  }

  /* ---------------------------------------------------
     2. Filtro: categoria da nav e busca por nome
     Os dois trabalham juntos. Escolher "Tricot" e digitar
     "lia" deixa so o cardiga, nao um ou outro.
     --------------------------------------------------- */
  var catAtual = "todas";
  var termoAtual = "";

  function limpaAcento(s) {
    return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  function aplicarFiltro() {
    var vistos = 0;
    document.querySelectorAll(".card").forEach(function (card) {
      var okCat = catAtual === "todas" || card.getAttribute("data-cat") === catAtual;
      var okTermo = !termoAtual || limpaAcento(card.getAttribute("data-nome")).indexOf(termoAtual) !== -1;
      var bate = okCat && okTermo;
      card.hidden = !bate;
      if (bate) vistos++;
    });

    var conta = document.getElementById("searchTally");
    var vazio = document.getElementById("empty");
    var filtrando = termoAtual || catAtual !== "todas";
    if (conta) conta.textContent = termoAtual ? (vistos === 1 ? "1 peça" : vistos + " peças") : "";
    if (vazio) vazio.hidden = !(filtrando && vistos === 0);
  }

  function ligarCategorias() {
    var links = document.querySelectorAll(".nav__link");
    links.forEach(function (link) {
      link.addEventListener("click", function () {
        catAtual = link.getAttribute("data-cat");
        links.forEach(function (o) { o.classList.toggle("is-on", o === link); });
        aplicarFiltro();
      });
    });
  }

  function ligarBusca() {
    var botao = document.getElementById("searchBtn");
    var caixa = document.getElementById("searchBox");
    var campo = document.getElementById("searchInput");
    if (!botao || !caixa || !campo) return;

    botao.addEventListener("click", function () {
      var aberta = caixa.hidden;
      caixa.hidden = !aberta;
      botao.setAttribute("aria-expanded", aberta ? "true" : "false");
      if (aberta) campo.focus();
    });

    campo.addEventListener("input", function () {
      termoAtual = limpaAcento(campo.value.trim());
      aplicarFiltro();
    });

    campo.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      campo.value = "";
      termoAtual = "";
      aplicarFiltro();
      caixa.hidden = true;
      botao.setAttribute("aria-expanded", "false");
      botao.focus();
    });
  }

  /* ---------------------------------------------------
     3. O facho sobre a grade
     A luz acompanha o cursor e acende a peça por onde passa.
     É o nome da marca virando comportamento.
     O transform vai direto no elemento: mexer numa variável
     CSS do pai recalcularia o estilo de todos os filhos.
     --------------------------------------------------- */
  function ligarFacho() {
    var lamp = document.getElementById("lamp");
    var grade = document.getElementById("grid");
    if (!lamp || !grade) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    var x = 0, y = 0, pedido = false;

    function pintar() {
      pedido = false;
      lamp.style.transform = "translate3d(" + x + "px," + y + "px,0)";
    }

    grade.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse") return;
      var caixa = grade.getBoundingClientRect();
      x = e.clientX - caixa.left;
      y = e.clientY - caixa.top;
      if (!lamp.classList.contains("is-on")) lamp.classList.add("is-on");
      if (!pedido) { pedido = true; requestAnimationFrame(pintar); }
    }, { passive: true });

    grade.addEventListener("pointerleave", function () {
      lamp.classList.remove("is-on");
    });
  }

  /* ---------------------------------------------------
     4. Revelação ao entrar na tela
     --------------------------------------------------- */
  function ligarRevelacao() {
    var alvos = [];
    var word = document.querySelector(".hero__line");
    if (word) { word.classList.add("js-open"); alvos.push(word); }
    document.querySelectorAll(".card, .rows, .wanted__title, .note, .band__line, .band__sub, .foot__line")
      .forEach(function (el) { el.classList.add("js-rise"); alvos.push(el); });

    if (!("IntersectionObserver" in window)) {
      alvos.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }

    var vigia = new IntersectionObserver(function (itens) {
      itens.forEach(function (item) {
        if (!item.isIntersecting) return;
        item.target.classList.add("is-in");
        vigia.unobserve(item.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

    /* a cascata só acontece entre irmãos da mesma grade:
       atrasos longos fazem a página parecer lenta */
    var passo = {};
    alvos.forEach(function (el) {
      var chave = el.parentNode ? el.parentNode.className : "raiz";
      passo[chave] = chave in passo ? passo[chave] + 1 : 0;
      var espera = Math.min(passo[chave], 5) * 55;
      if (espera) el.style.setProperty("--wait", espera + "ms");
      vigia.observe(el);
    });
  }

  function iniciar() {
    pintarCoracoes();
    pintarBandeja();
    ligarCoracoes();
    ligarBandeja();
    ligarCategorias();
    ligarBusca();
    ligarFacho();
    ligarRevelacao();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
