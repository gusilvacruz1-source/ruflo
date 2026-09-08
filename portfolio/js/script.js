/* =====================================================================
   Portfólio, comportamento

   Só existe uma coisa dinâmica nesta página: os blocos entram quando
   chegam à vez de serem lidos. É hierarquia, não enfeite, e acontece
   uma vez só por bloco.

   Nada de ouvir o evento de rolagem: IntersectionObserver avisa o
   navegador uma vez e não custa quadro nenhum enquanto a pessoa rola.
   ===================================================================== */

(function () {
  'use strict';

  var alvos = document.querySelectorAll('.revelar');
  if (!alvos.length) return;

  var semMovimento = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Sem IntersectionObserver (navegador antigo) ou com movimento reduzido,
  // o conteúdo simplesmente aparece. A classe .js do <head> é retirada para
  // que o CSS pare de esconder qualquer coisa.
  if (semMovimento || !('IntersectionObserver' in window)) {
    document.documentElement.classList.remove('js');
    return;
  }

  var observador = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (entrada) {
      if (!entrada.isIntersecting) return;
      entrada.target.classList.add('dentro');
      observador.unobserve(entrada.target);
    });
  }, {
    rootMargin: '0px 0px -12% 0px',
    threshold: 0.12
  });

  alvos.forEach(function (alvo) {
    observador.observe(alvo);
  });

  // Rede de segurança: se algo impedir o observador de disparar, nada fica
  // preso invisível depois de dois segundos.
  window.setTimeout(function () {
    alvos.forEach(function (alvo) {
      alvo.classList.add('dentro');
    });
  }, 2000);
})();
