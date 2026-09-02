import { hero, marca, mensagens, zap } from '../conteudo';
import { Botao } from './Interface';
import { Revelar } from './Movimento';

export function Hero() {
  return (
    <section
      id="inicio"
      className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden bg-noite-900"
    >
      <img
        src={hero.imagem}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Véus: legibilidade do menu em cima, do texto no meio e dos pilares embaixo. */}
      <div className="absolute inset-0 bg-gradient-to-b from-noite-900/85 via-noite-900/20 to-noite-900" />
      <div className="absolute inset-0 bg-gradient-to-r from-noite-900/80 via-noite-900/20 to-transparent" />

      <div className="relative mx-auto w-full max-w-[1280px] px-5 pb-10 pt-28 sm:px-8 sm:pb-12 sm:pt-32">
        <div className="max-w-4xl">
          <Revelar className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
            <p className="sobretexto text-ouro-400">{hero.sobretexto}</p>
            <p className="text-[0.7rem] uppercase tracking-[0.2em] text-osso-100/40">
              {marca.corretora} · {marca.creci}
            </p>
          </Revelar>

          <Revelar atraso={110}>
            <h1 className="texto-fino mt-6 text-[clamp(2.5rem,6vw,5.4rem)] leading-[1] text-osso-100">
              {hero.titulo}
            </h1>
          </Revelar>

          <Revelar atraso={210}>
            <p className="mt-6 max-w-xl text-[0.95rem] leading-relaxed text-osso-100/70">
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

        {/* Faixa de pilares, encostada na base da tela */}
        <Revelar
          atraso={430}
          className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:mt-16 sm:grid-cols-3"
        >
          {hero.pilares.map((p) => (
            <div key={p.valor} className="bg-noite-900/45 px-6 py-5 backdrop-blur-md">
              <p className="texto-fino text-[clamp(1.45rem,2.4vw,2rem)] text-osso-100">
                {p.valor}
              </p>
              <p className="mt-1 text-[0.7rem] uppercase tracking-[0.18em] text-osso-100/45">
                {p.rotulo}
              </p>
            </div>
          ))}
        </Revelar>
      </div>
    </section>
  );
}
