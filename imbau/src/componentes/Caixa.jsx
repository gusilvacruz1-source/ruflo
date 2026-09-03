import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Caixa que responde ao cursor: inclina na direção dele e sobe um pouco.
 *
 * A inclinação é pequena de propósito — 6 graus no máximo. O suficiente para
 * a caixa parecer um objeto com espessura, e não tanto que o texto dentro
 * comece a distorcer e ficar difícil de ler.
 *
 * Só em ponteiro fino: no toque não existe cursor a seguir, e o dedo já cobre
 * a caixa. E nada disso acontece para quem pede menos movimento.
 */
export function Caixa({
  as: Tag = 'div',
  inclinacao = 6,
  eleva = 6,
  className = '',
  children,
  ...resto
}) {
  const alvo = useRef(null);
  const quadro = useRef(0);
  const [ativo, setAtivo] = useState(false);

  useEffect(() => {
    setAtivo(
      window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }, []);

  const acompanhar = useCallback(
    (evento) => {
      const el = alvo.current;
      if (!el || !ativo) return;
      const area = el.getBoundingClientRect();
      // -0.5 a 0.5 a partir do centro da caixa.
      const x = (evento.clientX - area.left) / area.width - 0.5;
      const y = (evento.clientY - area.top) / area.height - 0.5;

      if (quadro.current) return;
      quadro.current = requestAnimationFrame(() => {
        quadro.current = 0;
        el.style.transform =
          `perspective(1100px) rotateX(${(-y * inclinacao).toFixed(2)}deg) ` +
          `rotateY(${(x * inclinacao).toFixed(2)}deg) translate3d(0, ${-eleva}px, 0)`;
      });
    },
    [ativo, inclinacao, eleva]
  );

  const soltar = useCallback(() => {
    const el = alvo.current;
    if (!el) return;
    cancelAnimationFrame(quadro.current);
    quadro.current = 0;
    el.style.transform = '';
  }, []);

  return (
    <Tag
      ref={alvo}
      onPointerMove={acompanhar}
      onPointerLeave={soltar}
      onBlur={soltar}
      className={`caixa ${className}`}
      {...resto}
    >
      {children}
    </Tag>
  );
}
