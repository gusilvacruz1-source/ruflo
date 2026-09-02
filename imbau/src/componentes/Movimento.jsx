import { useEffect, useRef, useState } from 'react';

const semMovimento = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Revela o bloco quando ele entra na tela: sobe alguns pixels e aparece.
 * Acontece uma vez só — nada de elemento piscando quando a pessoa volta.
 */
export function Revelar({
  as: Tag = 'div',
  atraso = 0,
  distancia = 26,
  className = '',
  children,
  ...resto
}) {
  const alvo = useRef(null);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const el = alvo.current;
    if (!el) return;
    if (semMovimento()) {
      setVisivel(true);
      return;
    }
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setVisivel(true);
          observador.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    );
    observador.observe(el);
    return () => observador.disconnect();
  }, []);

  return (
    <Tag
      ref={alvo}
      data-visivel={visivel}
      className={`revelar ${className}`}
      style={{ '--revelar-atraso': `${atraso}ms`, '--revelar-y': `${distancia}px` }}
      {...resto}
    >
      {children}
    </Tag>
  );
}

/**
 * Efeito magnético: o elemento acompanha o cursor de leve e volta ao lugar
 * com uma saída longa. Só em ponteiro fino — no toque não existe hover, e
 * arrastar um botão pelo dedo seria só atrapalho.
 */
export function Magnetico({ forca = 0.3, className = '', children, ...resto }) {
  const alvo = useRef(null);
  const [ativo, setAtivo] = useState(false);

  useEffect(() => {
    setAtivo(
      window.matchMedia('(hover: hover) and (pointer: fine)').matches && !semMovimento()
    );
  }, []);

  const acompanhar = (evento) => {
    const el = alvo.current;
    if (!el || !ativo) return;
    const area = el.getBoundingClientRect();
    const x = (evento.clientX - (area.left + area.width / 2)) * forca;
    const y = (evento.clientY - (area.top + area.height / 2)) * forca;
    el.style.transitionDuration = '150ms';
    el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
  };

  const soltar = () => {
    const el = alvo.current;
    if (!el) return;
    el.style.transitionDuration = '';
    el.style.transform = 'translate3d(0, 0, 0)';
  };

  return (
    <span
      ref={alvo}
      onPointerMove={acompanhar}
      onPointerLeave={soltar}
      onBlur={soltar}
      className={`magnetico inline-flex ${className}`}
      {...resto}
    >
      {children}
    </span>
  );
}
