import { useCallback, useRef } from 'react';
import { capitulos } from '../conteudo';
import { useCena } from './Profundidade';

/**
 * A lombada: a borda do livro, encostada na margem esquerda.
 *
 * Mostra os algarismos dos capítulos, acende o que está sendo lido — só nele
 * o nome aparece — e preenche um fio conforme a leitura avança. Clicar leva
 * ao capítulo.
 *
 * Escreve direto no DOM a cada quadro, de propósito: repintar o React
 * sessenta vezes por segundo para mover um fio de um pixel seria desperdício.
 */
export function Lombada() {
  const rail = useRef(null);
  const fita = useRef(null);

  const desenhar = useCallback((rolagem, altura) => {
    const nav = rail.current;
    if (!nav) return;

    const total = document.documentElement.scrollHeight - altura;
    if (fita.current) {
      fita.current.style.transform = `scaleY(${total > 0 ? Math.min(1, rolagem / total) : 0})`;
    }

    // O capítulo aberto é o último cujo início já passou do primeiro terço.
    let aberto = '';
    for (const c of capitulos) {
      const secao = document.getElementById(c.id);
      if (secao && secao.getBoundingClientRect().top <= altura * 0.34) aberto = c.id;
    }

    // A lombada é alta e atravessa a costura entre a capa e a folha, então
    // cada algarismo pergunta por si mesmo o que tem atrás dele.
    const blocos = [...document.querySelectorAll('[data-tom]')].map((b) => [
      b.getBoundingClientRect(),
      b.dataset.tom,
    ]);

    for (const marca of nav.querySelectorAll('[data-capitulo]')) {
      marca.dataset.aberto = String(marca.dataset.capitulo === aberto);

      const area = marca.getBoundingClientRect();
      const meio = area.top + area.height / 2;
      let fundo = 'escuro';
      for (const [caixa, dele] of blocos) {
        if (caixa.top <= meio && caixa.bottom > meio) fundo = dele;
      }
      marca.dataset.fundo = fundo;
    }
  }, []);

  useCena(desenhar);

  return (
    <nav
      ref={rail}
      aria-label="Capítulos"
      className="fixed left-7 top-1/2 z-40 hidden -translate-y-1/2 min-[1400px]:block"
    >
      <div className="relative pl-5">
        {/* Trilho e o quanto já foi lido. */}
        {/* Corte das folhas e a fita marcadora, que desce com a leitura.
            Cinza neutro e ouro se leem tanto no creme quanto no escuro, então
            o trilho não precisa trocar de cor no meio do caminho. */}
        <span
          aria-hidden="true"
          className="absolute bottom-2 left-0 top-2 w-px bg-[rgba(140,133,120,0.45)]"
        >
          <span
            ref={fita}
            className="block h-full w-px origin-top bg-ouro-600"
            style={{ transform: 'scaleY(0)' }}
          />
        </span>

        <ol className="flex flex-col gap-4">
          {capitulos.map((c) => (
            <li key={c.id}>
              <a
                href={`#${c.id}`}
                data-capitulo={c.id}
                data-aberto="false"
                className="group flex items-center gap-3 py-0.5 opacity-45 transition-[opacity,color] duration-500 hover:opacity-100 data-[aberto=true]:opacity-100 data-[fundo=claro]:text-noite-900 data-[fundo=escuro]:text-osso-100"
              >
                <span className="w-7 text-[0.62rem] font-medium tracking-[0.18em]">
                  {c.numero}
                </span>
                <span className="-translate-x-1 text-[0.68rem] tracking-[0.14em] opacity-0 transition-all duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-0 group-hover:opacity-100 group-data-[aberto=true]:translate-x-0 group-data-[aberto=true]:opacity-100">
                  {c.nome}
                </span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}

/**
 * O fólio: a linha de cima da folha, com o algarismo e o nome do capítulo.
 * É a mesma repetição que um livro faz no alto de cada página — quem abre no
 * meio sabe onde está.
 */
export function Folio({ id, claro = false }) {
  const capitulo = capitulos.find((c) => c.id === id);
  if (!capitulo) return null;

  return (
    <div
      className={`mb-12 flex items-center gap-5 sm:mb-16 ${
        claro ? 'text-osso-100' : 'text-noite-900'
      }`}
    >
      <span className="fio h-px flex-1 text-current" />
      <span className="sobretexto whitespace-nowrap opacity-45">
        {capitulo.numero} · {capitulo.nome}
      </span>
    </div>
  );
}
