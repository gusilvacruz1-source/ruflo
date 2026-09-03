import { useEffect, useRef } from 'react';

const semMovimento = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- parallaxe ---------- */

/**
 * Um só laço para tudo que reage à rolagem: as fotos com parallaxe e as cenas
 * que precisam de um número por quadro (a capa recuando, por exemplo). Cada
 * peça se registra aqui e o scroll recalcula o conjunto de uma vez, dentro de
 * um requestAnimationFrame — nada de um listener por elemento.
 */
const registrados = new Set();
const cenas = new Set();
let agendado = false;
let ouvindo = false;

function desenhar() {
  agendado = false;
  const altura = window.innerHeight;

  for (const cena of cenas) cena(window.scrollY, altura);

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

function ligar() {
  if (!ouvindo) {
    window.addEventListener('scroll', agendar, { passive: true });
    window.addEventListener('resize', agendar);
    ouvindo = true;
  }
  agendar();
}

function desligarSeVazio() {
  if (registrados.size === 0 && cenas.size === 0 && ouvindo) {
    window.removeEventListener('scroll', agendar);
    window.removeEventListener('resize', agendar);
    ouvindo = false;
  }
}

function registrar(alvo) {
  registrados.add(alvo);
  ligar();
  return () => {
    registrados.delete(alvo);
    desligarSeVazio();
  };
}

/**
 * Roda uma função a cada quadro de rolagem, no mesmo laço das fotos.
 * Recebe a posição da rolagem e a altura da janela.
 *
 * `sempre` distingue as duas coisas que passam por aqui: mexer a cena é
 * movimento, e desliga com prefers-reduced-motion; saber onde a pessoa está
 * na leitura não é movimento — se desligar, a lombada perde a cor e some.
 */
export function useCena(desenho, ativo = true, sempre = false) {
  useEffect(() => {
    if (!ativo || (!sempre && semMovimento())) return;
    cenas.add(desenho);
    ligar();
    return () => {
      cenas.delete(desenho);
      desligarSeVazio();
    };
  }, [desenho, ativo, sempre]);
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
      className={`foto absolute inset-0 h-full w-full object-cover ${className}`}
      style={{ transform: `translate3d(0,0,0) scale(${escala})`, willChange: 'transform' }}
      {...resto}
    />
  );
}
