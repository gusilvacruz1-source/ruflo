import { useCallback, useEffect, useRef, useState } from 'react';
import { hero } from '../conteudo';
import { useCena } from './Profundidade';

/**
 * A cena da capa em planos separados.
 *
 * Uma foto que desliza inteira não tem profundidade: tudo se move junto, e o
 * olho lê como um papel andando. Aqui o céu quase não sai do lugar, as serras
 * andam pouco, o pavilhão e a água andam mais, e as árvores da frente correm —
 * a mesma coisa que a câmera multiplano fazia no cinema de animação.
 *
 * Custa 28 KB de SVG. A alternativa fotográfica — extrair a sequência de
 * quadros de um vídeo e percorrê-la com a rolagem — custaria uns 6 MB e só se
 * justifica com cena filmada de verdade; material vetorial se refaz em código.
 */
export function Multiplano({ className = '' }) {
  const planos = useRef([]);
  const [parado, setParado] = useState(false);

  useEffect(() => {
    setParado(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  const desenhar = useCallback((rolagem, altura) => {
    const avanco = Math.min(1, rolagem / altura);
    // A câmera também entra na cena, devagar: sem isso os planos parecem
    // deslizar em vez de se afastar.
    const aproxima = 1 + avanco * 0.05;

    hero.planos.forEach((plano, i) => {
      const el = planos.current[i];
      if (!el) return;
      const y = -avanco * plano.taxa * altura;
      el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0) scale(${(
        plano.escala * aproxima
      ).toFixed(4)})`;
    });
  }, []);

  useCena(desenhar, !parado);

  if (parado) {
    return (
      <div className={`absolute inset-0 overflow-hidden ${className}`}>
        <img
          src={hero.imagem}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {hero.planos.map((plano, i) => (
        <img
          key={plano.arquivo}
          ref={(el) => (planos.current[i] = el)}
          src={plano.arquivo}
          alt=""
          // O primeiro plano é o que segura a primeira impressão: vem junto
          // com a página. Os de trás podem chegar um quadro depois.
          fetchPriority={i <= 2 ? 'high' : 'auto'}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            transform: `translate3d(0,0,0) scale(${plano.escala})`,
            willChange: 'transform',
          }}
        />
      ))}
    </div>
  );
}
