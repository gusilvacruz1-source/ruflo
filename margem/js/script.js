/* =========================================================
   MARGEM
   Sem dependências e sem build. Nada aqui escuta o evento de
   scroll: o cabeçalho usa uma sentinela e a revelação usa
   IntersectionObserver.
   ========================================================= */
(function () {
  "use strict";

  /* ---------------------------------------------------
     1. Cabeçalho: claro sobre a campanha, escuro depois
     --------------------------------------------------- */
  function ligarTopo() {
    var topo = document.getElementById("topo");
    var campanha = document.getElementById("inicio");
    if (!topo || !campanha || !("IntersectionObserver" in window)) return;

    /* a sentinela fica um pouco antes do fim da campanha, para a
       barra trocar de cor enquanto a foto ainda cobre o fundo */
    new IntersectionObserver(function (itens) {
      topo.classList.toggle("pousado", !itens[0].isIntersecting);
    }, { rootMargin: "-72px 0px 0px 0px", threshold: 0 }).observe(campanha);
  }

  /* ---------------------------------------------------
     2. Revelação
     O título da campanha é o único momento coreografado, e
     acontece no carregamento. O resto apenas ganha presença
     ao entrar na tela.
     --------------------------------------------------- */
  function ligarRevelacao() {
    var titulo = document.querySelector(".campanha .titulo-grande");
    if (titulo) {
      titulo.classList.add("js-abre");
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { titulo.classList.add("dentro"); });
      });
    }

    var alvos = [];
    document.querySelectorAll(".peca, .rotulo, .editorial__linha, .prosa p, .rodape__marca")
      .forEach(function (el) { el.classList.add("js-sobe"); alvos.push(el); });

    if (!("IntersectionObserver" in window)) {
      alvos.forEach(function (el) { el.classList.add("dentro"); });
      return;
    }

    var vigia = new IntersectionObserver(function (itens) {
      itens.forEach(function (item) {
        if (!item.isIntersecting) return;
        item.target.classList.add("dentro");
        vigia.unobserve(item.target);
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -5% 0px" });

    /* a cascata só acontece entre irmãos: atraso longo faz a
       página parecer lenta, não elegante */
    var passo = {};
    alvos.forEach(function (el) {
      var chave = el.parentNode ? el.parentNode.className : "raiz";
      passo[chave] = chave in passo ? passo[chave] + 1 : 0;
      var espera = Math.min(passo[chave], 4) * 60;
      if (espera) el.style.setProperty("--espera", espera + "ms");
      vigia.observe(el);
    });
  }

  /* ---------------------------------------------------
     3. Menu no celular
     --------------------------------------------------- */
  function ligarMenu() {
    var botao = document.getElementById("abrirMenu");
    var menu = document.getElementById("menu");
    if (!botao || !menu) return;

    function fechar() {
      menu.classList.remove("aberto");
      botao.setAttribute("aria-expanded", "false");
      botao.setAttribute("aria-label", "Abrir menu");
      document.body.style.overflow = "";
    }

    botao.addEventListener("click", function () {
      var aberto = menu.classList.toggle("aberto");
      botao.setAttribute("aria-expanded", aberto ? "true" : "false");
      botao.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
      document.body.style.overflow = aberto ? "hidden" : "";
    });

    menu.addEventListener("click", function (e) {
      if (e.target.tagName === "A") fechar();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") fechar();
    });
  }

  function iniciar() {
    ligarTopo();
    ligarRevelacao();
    ligarMenu();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
