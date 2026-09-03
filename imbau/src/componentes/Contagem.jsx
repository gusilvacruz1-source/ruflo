import { useEffect, useRef, useState } from 'react';

const formata = (valor, casas) =>
  new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  }).format(valor);

const suave = (t) => 1 - Math.pow(1 - t, 3); // desacelera no fim

/**
 * Número que conta até o valor quando entra na tela — uma vez só.
 *
 * `tabular-nums` não é detalhe: sem ele cada dígito tem uma largura diferente
 * e o número treme durante a contagem. Quem pede menos movimento recebe o
 * valor final direto, que é o que interessa.
 */
export function Contagem({ ate, casas = 0, duracao = 1400, className = '' }) {
  const alvo = useRef(null);
  const [valor, setValor] = useState(() => (casas ? 0 : 0));

  useEffect(() => {
    const el = alvo.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValor(ate);
      return;
    }

    let quadro = 0;
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return;
        observador.disconnect();

        let inicio = null;
        const passo = (agora) => {
          if (inicio === null) inicio = agora;
          const t = Math.min(1, (agora - inicio) / duracao);
          setValor(ate * suave(t));
          if (t < 1) quadro = requestAnimationFrame(passo);
        };
        quadro = requestAnimationFrame(passo);
      },
      { threshold: 0.5 }
    );

    observador.observe(el);
    return () => {
      observador.disconnect();
      cancelAnimationFrame(quadro);
    };
  }, [ate, duracao]);

  return (
    <span ref={alvo} className={className} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {formata(valor, casas)}
    </span>
  );
}
