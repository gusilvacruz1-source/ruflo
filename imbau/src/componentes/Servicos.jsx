import { mensagens, servicos, zap } from '../conteudo';
import { Selo, Whatsapp } from './Interface';
import { Revelar } from './Movimento';

/**
 * Uma linha por serviço — índice editorial, não grade de cartõezinhos.
 * No desktop o nome desliza e um fio mostarda se abre por baixo no hover.
 */
function Linha({ servico, indice }) {
  return (
    <Revelar
      as="li"
      atraso={indice * 70}
      distancia={20}
      className="group relative border-t border-white/8 first:border-t-0"
    >
      <div className="relative flex flex-col gap-2 py-7 transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] sm:flex-row sm:items-baseline sm:gap-10 lg:group-hover:translate-x-2">
        <h3 className="titulo shrink-0 text-[1.45rem] leading-none text-osso-100 sm:w-56 sm:text-[1.7rem]">
          {servico.nome}
        </h3>
        <p className="max-w-xl text-[0.92rem] leading-relaxed text-osso-100/60 transition-colors duration-500 lg:group-hover:text-osso-100/80">
          {servico.texto}
        </p>
      </div>

      {/* Fio que se abre da esquerda no hover — só onde existe cursor. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-px origin-left scale-x-0 bg-gradient-to-r from-ouro-500 via-ouro-500/40 to-transparent transition-transform duration-[900ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-x-100 lg:block"
      />
    </Revelar>
  );
}

export function Servicos() {
  return (
    <section
      id="servicos"
      className="relative border-t border-white/8 bg-noite-900 py-24 sm:py-32 lg:py-40"
    >
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          {/* Cabeçalho fica parado enquanto a lista passa. */}
          <div className="lg:sticky lg:top-32 lg:self-start">
            <Revelar>
              <Selo>{servicos.selo}</Selo>
            </Revelar>
            <Revelar atraso={100}>
              <h2 className="titulo mt-7 text-[clamp(2.1rem,4.6vw,3.5rem)] leading-[1.02] text-osso-100">
                {servicos.titulo}
              </h2>
            </Revelar>
            <Revelar atraso={190}>
              <p className="mt-5 max-w-md text-[0.95rem] leading-relaxed text-osso-100/60">
                {servicos.texto}
              </p>
            </Revelar>
            <Revelar atraso={270} className="mt-8">
              <a
                href={zap(mensagens.avaliacao)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 text-sm text-ouro-400 underline-offset-8 transition-colors duration-300 hover:text-ouro-500 hover:underline"
              >
                <Whatsapp className="h-4 w-4" />
                Pedir avaliação gratuita
              </a>
            </Revelar>
          </div>

          <ul className="lg:pt-2">
            {servicos.lista.map((servico, i) => (
              <Linha key={servico.nome} servico={servico} indice={i} />
            ))}
          </ul>
        </div>

        {/* Etapas: aqui o número conta, porque a ordem é a informação. */}
        <div className="mt-24 sm:mt-32">
          <Revelar className="flex items-center gap-6">
            <h3 className="sobretexto shrink-0 text-osso-100/40">{servicos.etapasTitulo}</h3>
            <span className="fio h-px flex-1 text-osso-100" />
          </Revelar>

          <ol className="mt-10 grid gap-px overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {servicos.etapas.map((etapa, i) => (
              <Revelar
                as="li"
                key={etapa.numero}
                atraso={i * 110}
                distancia={22}
                className="group bg-noite-900 px-7 py-8 transition-colors duration-700 hover:bg-noite-800"
              >
                <span className="sobretexto block text-ouro-500/80">
                  {etapa.numero}
                </span>
                <h4 className="titulo mt-5 text-[1.35rem] leading-none text-osso-100">
                  {etapa.titulo}
                </h4>
                <p className="mt-3 text-[0.85rem] leading-relaxed text-osso-100/60">
                  {etapa.texto}
                </p>
              </Revelar>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
