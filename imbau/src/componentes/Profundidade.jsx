import { useEffect, useRef } from 'react';

const semMovimento = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- parallaxe ---------- */

/**
 * Um só laço para todas as fotos da página. Cada uma se registra aqui e o
 * scroll recalcula todo mundo de uma vez, dentro de um requestAnimationFrame —
 * nada de um listener por imagem.
 */
const registrados = new Set();
let agendado = false;
let ouvindo = false;

function desenhar() {
  agendado = false;
  const altura = window.innerHeight;

  for (const alvo of registrados) {
    const moldura = alvo.el.parentElement;
    if (!moldura) continue;
    const area = moldura.getBoundingClientRect();
    if (area.bottom < -200 || area.top > altura + 200) continue;

    // -1 quando a moldura está entrando por baixo, +1 quando já saiu por cima.
    const centro = area.top + area.height / 2;
    const avanco = (centro - altura / 2) / ((altura + area.height) / 2);
    const y = Math.max(-1, Math.min(1, avanco)) * alvo.forca;
    alvo.el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0) scale(${alvo.escala})`;
  }
}

function agendar() {
  if (agendado) return;
  agendado = true;
  requestAnimationFrame(desenhar);
}

function registrar(alvo) {
  registrados.add(alvo);
  if (!ouvindo) {
    window.addEventListener('scroll', agendar, { passive: true });
    window.addEventListener('resize', agendar);
    ouvindo = true;
  }
  agendar();
  return () => {
    registrados.delete(alvo);
    if (registrados.size === 0 && ouvindo) {
      window.removeEventListener('scroll', agendar);
      window.removeEventListener('resize', agendar);
      ouvindo = false;
    }
  };
}

/**
 * Foto que anda mais devagar que a página. A imagem entra maior que a moldura
 * — a sobra é justamente o que ela usa para se mover sem mostrar borda.
 *
 * O elemento pai precisa ser `relative` e cortar o que sobra.
 */
export function ImagemProfunda({ forca = 34, escala = 1.14, className = '', ...resto }) {
  const alvo = useRef(null);

  useEffect(() => {
    const el = alvo.current;
    if (!el) return;
    if (semMovimento()) {
      el.style.transform = 'none';
      return;
    }
    return registrar({ el, forca, escala });
  }, [forca, escala]);

  return (
    <img
      ref={alvo}
      className={`absolute inset-0 h-full w-full object-cover ${className}`}
      style={{ transform: `translate3d(0,0,0) scale(${escala})`, willChange: 'transform' }}
      {...resto}
    />
  );
}

/* ---------- luz do ponteiro ---------- */

/**
 * Um facho macio que segue o cursor dentro do bloco escuro. Acende ao entrar,
 * apaga ao sair. Só onde existe ponteiro fino: no toque não há cursor para
 * seguir, e acender no dedo só atrapalharia a leitura.
 */
export function LuzDoPonteiro({ className = '' }) {
  const alvo = useRef(null);

  useEffect(() => {
    const luz = alvo.current;
    const bloco = luz?.parentElement;
    if (!bloco) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches || semMovimento()) {
      return;
    }

    let pendente = null;
    let quadro = 0;

    const pintar = () => {
      quadro = 0;
      if (!pendente) return;
      luz.style.setProperty('--x', `${pendente.x}px`);
      luz.style.setProperty('--y', `${pendente.y}px`);
    };

    const mover = (evento) => {
      const area = bloco.getBoundingClientRect();
      pendente = { x: evento.clientX - area.left, y: evento.clientY - area.top };
      if (!quadro) quadro = requestAnimationFrame(pintar);
    };

    const acender = () => (luz.style.opacity = '1');
    const apagar = () => (luz.style.opacity = '0');

    bloco.addEventListener('pointermove', mover);
    bloco.addEventListener('pointerenter', acender);
    bloco.addEventListener('pointerleave', apagar);
    return () => {
      bloco.removeEventListener('pointermove', mover);
      bloco.removeEventListener('pointerenter', acender);
      bloco.removeEventListener('pointerleave', apagar);
      cancelAnimationFrame(quadro);
    };
  }, []);

  return (
    <div
      ref={alvo}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-1000 ${className}`}
      style={{
        background:
          'radial-gradient(420px circle at var(--x, 50%) var(--y, 0px), color-mix(in srgb, var(--color-ouro-500) 12%, transparent), transparent 70%)',
      }}
    />
  );
}
