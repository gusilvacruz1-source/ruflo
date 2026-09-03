import { mensagens, servicos, zap } from '../conteudo';
import { Whatsapp } from './Interface';
import { Caixa } from './Caixa';
import { Revelar } from './Movimento';

/**
 * Uma linha por serviço — índice editorial, não grade de cartõezinhos.
 * No desktop o nome desliza e um fio se abre por baixo dele no hover.
 */
function Linha({ servico, indice }) {
  return (
    <Revelar
      as="li"
      atraso={indice * 70}
      distancia={20}
      className="group relative border-t border-noite-900/10 first:border-t-0"
    >
      <div className="relative flex flex-col gap-2 py-7 transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] sm:flex-row sm:items-baseline sm:gap-10 lg:group-hover:translate-x-2">
        <h3 className="titulo shrink-0 text-[1.45rem] leading-none text-noite-900 sm:w-56 sm:text-[1.7rem]">
          {servico.nome}
        </h3>
        <p className="medida text-[0.92rem] leading-relaxed text-noite-900/65">
          {servico.texto}
        </p>
      </div>

      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-px origin-left scale-x-0 bg-gradient-to-r from-ouro-600 via-ouro-600/40 to-transparent transition-transform duration-[900ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-x-100 lg:block"
      />
    </Revelar>
  );
}

export function Servicos() {
  return (
    <section id="servicos" data-tom="claro" className="secao relative bg-osso-100">
      <div className="site-container">

        <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          {/* Cabeçalho fica parado enquanto a lista passa. */}
          <div className="lg:sticky lg:top-[22vh] lg:self-start">
            <Revelar>
              <h2 className="titulo text-[clamp(2.1rem,4.6vw,3.5rem)] leading-[1.02] text-noite-900">
                {servicos.titulo}
              </h2>
            </Revelar>
            <Revelar atraso={190}>
              <p className="medida-curta mt-5 text-[0.95rem] leading-relaxed text-noite-900/65">
                {servicos.texto}
              </p>
            </Revelar>
            <Revelar atraso={270} className="mt-8">
              <a
                href={zap(mensagens.avaliacao)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 text-sm text-noite-900 underline decoration-noite-900/25 underline-offset-8 transition-colors duration-300 hover:decoration-noite-900"
              >
                <Whatsapp className="h-4 w-4 text-ouro-700" />
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
            <h3 className="sobretexto shrink-0 text-noite-900/60">{servicos.etapasTitulo}</h3>
            <span className="fio h-px flex-1 text-noite-900" />
          </Revelar>

          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {servicos.etapas.map((etapa, i) => (
              <Revelar as="li" key={etapa.numero} atraso={i * 110} distancia={22}>
                <Caixa className="h-full rounded-[1.25rem] border border-noite-900/12 bg-osso-100 px-7 py-8 hover:border-noite-900/30">
                  <span className="sobretexto block text-ouro-700">{etapa.numero}</span>
                  <h4 className="titulo mt-5 text-[1.35rem] leading-none text-noite-900">
                    {etapa.titulo}
                  </h4>
                  <p className="mt-3 text-[0.85rem] leading-relaxed text-noite-900/60">
                    {etapa.texto}
                  </p>
                </Caixa>
              </Revelar>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
