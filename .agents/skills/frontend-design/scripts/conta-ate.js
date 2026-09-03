/**
 * Contagem crescente para estatísticas.
 *
 * Marque o elemento com data-conta-ate (e, opcionalmente, data-sufixo e
 * data-decimais). A contagem dispara uma vez, quando entra na tela.
 *
 *   <span data-conta-ate="1240" data-sufixo="+">0</span>
 */
const suave = (t) => 1 - Math.pow(1 - t, 3); // desacelera no fim

function conta(el) {
  const destino = Number(el.dataset.contaAte);
  const casas = Number(el.dataset.decimais ?? 0);
  const sufixo = el.dataset.sufixo ?? '';
  const prefixo = el.dataset.prefixo ?? '';
  const duracao = Number(el.dataset.duracao ?? 1400);
  const formata = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });

  let inicio = null;
  const passo = (agora) => {
    if (inicio === null) inicio = agora;
    const t = Math.min(1, (agora - inicio) / duracao);
    el.textContent = prefixo + formata.format(destino * suave(t)) + sufixo;
    if (t < 1) requestAnimationFrame(passo);
  };
  requestAnimationFrame(passo);
}

export function ligaContagens(raiz = document) {
  const alvos = raiz.querySelectorAll('[data-conta-ate]');
  if (!alvos.length) return;

  const parado = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mostraFinal = (el) => {
    const casas = Number(el.dataset.decimais ?? 0);
    el.textContent =
      (el.dataset.prefixo ?? '') +
      new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: casas,
        maximumFractionDigits: casas,
      }).format(Number(el.dataset.contaAte)) +
      (el.dataset.sufixo ?? '');
  };

  if (parado) {
    // Quem pede menos movimento recebe o número, que é o que interessa.
    alvos.forEach(mostraFinal);
    return;
  }

  const observador = new IntersectionObserver(
    (entradas) => {
      for (const entrada of entradas) {
        if (!entrada.isIntersecting) continue;
        conta(entrada.target);
        observador.unobserve(entrada.target);
      }
    },
    { threshold: 0.4 }
  );
  alvos.forEach((el) => observador.observe(el));
}
