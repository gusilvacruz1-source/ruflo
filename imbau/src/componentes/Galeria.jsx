import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Seta } from './Interface';

/**
 * Visualizador das fotos de um imóvel.
 *
 * Segue o mesmo contrato do lightbox do estúdio Eloize: clique abre, setas
 * andam, Esc fecha, clique no fundo fecha, o foco entra no painel e volta
 * para onde estava ao sair. No celular também anda com o dedo.
 *
 * A legenda é o `alt` da foto — o mesmo texto que o leitor de tela recebe.
 * Escrever um alt preguiçoso aqui aparece duas vezes.
 */
export function Galeria({ fotos, inicial = 0, aoFechar }) {
  const [indice, setIndice] = useState(inicial);
  const painel = useRef(null);
  const focoAnterior = useRef(null);
  const toqueX = useRef(null);

  const andar = useCallback(
    (passo) => setIndice((i) => (i + passo + fotos.length) % fotos.length),
    [fotos.length]
  );

  useEffect(() => {
    focoAnterior.current = document.activeElement;
    painel.current?.focus();

    const anterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const aoTeclar = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        aoFechar();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        andar(1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        andar(-1);
      }
    };
    window.addEventListener('keydown', aoTeclar);

    return () => {
      window.removeEventListener('keydown', aoTeclar);
      document.body.style.overflow = anterior;
      focoAnterior.current?.focus?.();
    };
  }, [andar, aoFechar]);

  // Pré-carrega a vizinha: quem clica na seta não espera.
  useEffect(() => {
    for (const passo of [1, -1]) {
      const vizinha = fotos[(indice + passo + fotos.length) % fotos.length];
      if (vizinha) new Image().src = vizinha.arquivo;
    }
  }, [indice, fotos]);

  const foto = fotos[indice];

  // Vai para o corpo da página, e não onde foi chamado: o cartão está dentro
  // de um contexto de empilhamento, e ali nenhum z-index vence o menu fixo.
  return createPortal(
    <div
      ref={painel}
      role="dialog"
      aria-modal="true"
      aria-label={`Fotos — ${indice + 1} de ${fotos.length}`}
      tabIndex={-1}
      className="fixed inset-0 z-[60] flex flex-col bg-noite-900/97 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && aoFechar()}
      onTouchStart={(e) => (toqueX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (toqueX.current === null) return;
        const arrasto = e.changedTouches[0].clientX - toqueX.current;
        if (Math.abs(arrasto) > 50) andar(arrasto < 0 ? 1 : -1);
        toqueX.current = null;
      }}
    >
      <div className="site-container flex items-center justify-between py-5">
        <p className="sobretexto text-osso-100/60">
          {indice + 1} / {fotos.length}
        </p>
        <button
          type="button"
          onClick={aoFechar}
          aria-label="Fechar fotos"
          className="grid h-11 w-11 place-items-center rounded-full border border-osso-100/25 text-osso-100 transition-colors duration-400 hover:bg-osso-100 hover:text-noite-900"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
            <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <figure className="site-container flex min-h-0 flex-1 flex-col justify-center gap-5 pb-8">
        <img
          key={foto.arquivo}
          src={foto.arquivo}
          alt={foto.alt}
          className="foto mx-auto max-h-[70vh] w-auto max-w-full rounded-[20px] object-contain"
        />
        <figcaption className="text-center text-[0.85rem] text-osso-100/60">
          {foto.alt}
        </figcaption>
      </figure>

      {fotos.length > 1 && (
        <div className="site-container flex items-center justify-center gap-4 pb-8">
          <button
            type="button"
            onClick={() => andar(-1)}
            aria-label="Foto anterior"
            className="grid h-12 w-12 place-items-center rounded-full border border-osso-100/25 text-osso-100 transition-colors duration-400 hover:bg-osso-100 hover:text-noite-900"
          >
            <Seta className="h-4 w-4 -rotate-[135deg]" />
          </button>
          <button
            type="button"
            onClick={() => andar(1)}
            aria-label="Próxima foto"
            className="grid h-12 w-12 place-items-center rounded-full border border-osso-100/25 text-osso-100 transition-colors duration-400 hover:bg-osso-100 hover:text-noite-900"
          >
            <Seta className="h-4 w-4 rotate-45" />
          </button>
        </div>
      )}
    </div>,
    document.body
  );
}
