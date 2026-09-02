import { hero, marca, mensagens, zap } from '../conteudo';
import { Botao } from './Interface';
import { Revelar } from './Movimento';

export function Hero() {
  return (
    <section
      id="inicio"
      data-tom="escuro"
      className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden bg-noite-900 sm:min-h-[calc(100svh-2rem)] lg:min-h-[calc(100svh-2.5rem)]"
    >
      <img
        src={hero.imagem}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Véus: legibilidade do menu em cima, do texto no meio e dos números embaixo. */}
      <div className="absolute inset-0 bg-gradient-to-b from-noite-900/85 via-noite-900/15 to-noite-900/92 sm:to-noite-900/80" />
      <div className="absolute inset-0 bg-gradient-to-r from-noite-900/80 via-noite-900/20 to-transparent" />

      <div className="relative mx-auto w-full max-w-[1280px] px-5 pb-10 pt-28 sm:px-8 sm:pb-14 sm:pt-32">
        <div className="max-w-4xl">
          <Revelar className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
            <p className="sobretexto text-ouro-400">{hero.sobretexto}</p>
            <p className="text-[0.7rem] uppercase tracking-[0.2em] text-osso-100/45">
              {marca.corretora} · {marca.creci}
            </p>
          </Revelar>

          <Revelar atraso={110}>
            <h1 className="titulo-hero mt-6 text-[clamp(2.6rem,6.2vw,5.6rem)] leading-[1.02] text-osso-100">
              {hero.titulo}
            </h1>
          </Revelar>

          <Revelar atraso={210}>
            <p className="mt-6 max-w-xl text-[0.95rem] leading-relaxed text-osso-100/75">
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

        {/* Pilares soltos sobre a foto, sem moldura — como na referência. */}
        <Revelar
          atraso={430}
          className="mt-14 grid grid-cols-1 gap-8 text-center sm:mt-20 sm:grid-cols-3 sm:gap-6"
        >
          {hero.pilares.map((p) => (
            <div key={p.valor}>
              <p className="text-[clamp(1.6rem,2.8vw,2.3rem)] font-medium leading-none tracking-[-0.02em] text-osso-100">
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
