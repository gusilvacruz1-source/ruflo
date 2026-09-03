import { useCallback, useRef } from 'react';
import { hero, marca, mensagens, zap } from '../conteudo';
import { Botao } from './Interface';
import { Revelar } from './Movimento';
import { Multiplano } from './Multiplano';
import { useCena } from './Profundidade';

export function Hero() {
  const conteudo = useRef(null);
  const veu = useRef(null);

  // Quanto mais a folha cobre a capa, mais a capa se afasta e escurece.
  useCena(
    useCallback((rolagem, altura) => {
      const avanco = Math.min(1, rolagem / (altura * 0.9));
      if (conteudo.current) {
        conteudo.current.style.transform = `translate3d(0, ${(-avanco * 64).toFixed(1)}px, 0)`;
        conteudo.current.style.opacity = String(Math.max(0, 1 - avanco * 1.25));
      }
      if (veu.current) veu.current.style.opacity = String(avanco * 0.8);
    }, [])
  );

  return (
    <section
      id="inicio"
      data-tom="escuro"
      className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden bg-noite-900 sm:min-h-[calc(100svh-2rem)] lg:min-h-[calc(100svh-2.5rem)]"
    >
      <div className="assentar absolute inset-0">
        <Multiplano />
      </div>

      {/* Véus: legibilidade do menu em cima, do texto no meio e dos números embaixo. */}
      <div className="absolute inset-0 bg-gradient-to-b from-noite-900/85 via-noite-900/15 to-noite-900/92 sm:to-noite-900/80" />
      <div className="absolute inset-0 bg-gradient-to-r from-noite-900/80 via-noite-900/20 to-transparent" />

      {/* Véu que fecha a capa quando o livro é aberto. */}
      <div
        ref={veu}
        aria-hidden="true"
        className="absolute inset-0 bg-noite-900 opacity-0"
      />

      <div
        ref={conteudo}
        className="site-container relative pb-10 pt-28 sm:pb-14 sm:pt-32"
      >
        <div className="max-w-4xl">
          <Revelar className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
            <p className="sobretexto text-ouro-400">{hero.sobretexto}</p>
            <p className="text-[0.7rem] uppercase tracking-[0.2em] text-osso-100/60">
              {marca.corretora} · {marca.creci}
            </p>
          </Revelar>

          <div className="mascara" style={{ animationDelay: '260ms' }}>
            <h1 className="titulo-hero mt-6 text-[clamp(3rem,8.4vw,7.4rem)] leading-[0.92] text-osso-100">
              {hero.titulo}
            </h1>
          </div>

          <Revelar atraso={210}>
            <p className="medida-curta mt-7 text-[0.98rem] leading-relaxed text-osso-100/75">
              {hero.texto}
            </p>
          </Revelar>

          <Revelar atraso={310} className="mt-8 flex flex-wrap items-center gap-4">
            <Botao href={zap(mensagens.hero)} variante="claro" icone="whatsapp">
              {hero.botao}
            </Botao>
            <a
              href="#imoveis"
              className="text-sm text-osso-100/70 underline-offset-8 transition-colors duration-300 hover:text-osso-100 hover:underline"
            >
              Ver imóveis disponíveis
            </a>
          </Revelar>
        </div>

        {/* Indicador de rolagem na borda: o site inteiro se lê rolando, e a
            visita do capítulo III se percorre assim. */}
        <div
          aria-hidden="true"
          className="absolute bottom-10 right-6 hidden flex-col items-center gap-4 text-osso-100/60 lg:flex"
        >
          <span className="sobretexto [writing-mode:vertical-rl]">role</span>
          <span className="fio-rolagem h-16 w-px bg-osso-100/15" />
        </div>

        {/* Pilares soltos sobre a foto, sem moldura — como na referência. */}
        <Revelar
          atraso={430}
          className="mt-14 grid grid-cols-1 gap-8 text-center sm:mt-20 sm:grid-cols-3 sm:gap-6"
        >
          {hero.pilares.map((p) => (
            <div key={p.valor}>
              <p className="titulo-hero text-[clamp(1.7rem,3vw,2.5rem)] leading-none text-osso-100">
                {p.valor}
              </p>
              <p className="mt-2 text-[0.72rem] uppercase tracking-[0.18em] text-osso-100/55">
                {p.rotulo}
              </p>
            </div>
          ))}
        </Revelar>
      </div>
    </section>
  );
}
