import { useEffect, useState } from 'react';

/**
 * Descobre se o que está atrás de um elemento fixo é claro ou escuro.
 *
 * Cada bloco da página declara `data-tom`. Aqui a gente mede a faixa que o
 * próprio elemento ocupa e pergunta, em duas alturas, quem está lá atrás.
 * O último bloco que cruza vence: assim uma folha escura encaixada dentro de
 * uma seção clara tem a última palavra sobre ela.
 */
export function useTomDoFundo(alvo) {
  const [tom, setTom] = useState('escuro');

  useEffect(() => {
    const blocos = [...document.querySelectorAll('[data-tom]')];
    if (!blocos.length) return;

    const aoRolar = () => {
      const faixa = alvo?.current?.getBoundingClientRect();
      const alturas = faixa
        ? [faixa.top + faixa.height * 0.25, faixa.top + faixa.height * 0.75]
        : [30, 46];

      const votos = { claro: 0, escuro: 0 };
      const areas = blocos.map((b) => [b.getBoundingClientRect(), b.dataset.tom]);

      for (const y of alturas) {
        let aqui = 'escuro';
        for (const [area, dele] of areas) {
          if (area.top <= y && area.bottom > y) aqui = dele;
        }
        votos[aqui] += 1;
      }

      // Empate (a borda cortando o elemento ao meio) fica com o claro: texto
      // escuro ainda se lê sobre a metade escura, o contrário não.
      setTom(votos.claro >= votos.escuro ? 'claro' : 'escuro');
    };

    aoRolar();
    window.addEventListener('scroll', aoRolar, { passive: true });
    window.addEventListener('resize', aoRolar);
    return () => {
      window.removeEventListener('scroll', aoRolar);
      window.removeEventListener('resize', aoRolar);
    };
  }, [alvo]);

  return tom;
}
