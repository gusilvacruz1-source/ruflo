import { useEffect } from 'react';
import Lenis from 'lenis';

/**
 * Rolagem com inércia no site inteiro.
 *
 * O navegador rola em degraus: cada giro da roda salta um bloco de pixels, e
 * a página chega ao destino em saltos. Aqui a posição persegue o destino a
 * cada quadro, com desaceleração — o mesmo princípio de um elevador que
 * encosta em vez de bater. É o que faz a capa, os planos da cena e a visita
 * parecerem uma coisa só em movimento, e não três coisas reagindo a saltos.
 *
 * Desligada para quem pede menos movimento no sistema: ali a rolagem nativa,
 * imediata e previsível, é a resposta certa.
 */
export function Rolagem() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      // 0.09 dá inércia perceptível sem atrasar a resposta ao gesto. Acima de
      // 0.12 a página começa a parecer que está pesada, não fluida.
      lerp: 0.09,
      wheelMultiplier: 1,
      // No toque a rolagem do próprio sistema já tem inércia — duplicar
      // atrapalha e briga com o gesto de voltar da borda.
      smoothWheel: true,
      syncTouch: false,
    });

    let quadro = 0;
    const passo = (tempo) => {
      lenis.raf(tempo);
      quadro = requestAnimationFrame(passo);
    };
    quadro = requestAnimationFrame(passo);

    // O menu e a lombada levam à seção por âncora; sem isto o salto seria
    // instantâneo e romperia justamente a continuidade que a inércia cria.
    const aoClicar = (evento) => {
      const link = evento.target.closest('a[href^="#"]');
      const alvo = link && document.querySelector(link.getAttribute('href'));
      if (!alvo) return;
      evento.preventDefault();
      lenis.scrollTo(alvo, { offset: -8, duration: 1.1 });
    };
    document.addEventListener('click', aoClicar);

    return () => {
      document.removeEventListener('click', aoClicar);
      cancelAnimationFrame(quadro);
      lenis.destroy();
    };
  }, []);

  return null;
}
