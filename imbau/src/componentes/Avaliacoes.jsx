import { avaliacoes, marca } from '../conteudo';
import { EstrelaCheia, Seta } from './Interface';
import { Revelar } from './Movimento';

function Estrelas({ className = 'h-3.5 w-3.5' }) {
  return (
    <span className="flex gap-0.5 text-ouro-600" role="img" aria-label="cinco de cinco estrelas">
      {[0, 1, 2, 3, 4].map((i) => (
        <EstrelaCheia key={i} className={className} />
      ))}
    </span>
  );
}

export function Avaliacoes() {
  return (
    <section
      data-tom="claro"
      className="border-t border-noite-900/10 bg-osso-100 px-5 py-24 sm:px-8 sm:py-28"
    >
      <div className="mx-auto max-w-[1280px]">
        <Revelar className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="titulo text-[clamp(1.8rem,3.6vw,2.7rem)] leading-[1.05] text-noite-900">
              {avaliacoes.titulo}
            </h2>
            <p className="mt-4 flex flex-wrap items-center gap-3 text-sm text-noite-900/60">
              <span className="titulo text-[1.6rem] leading-none text-noite-900">
                {avaliacoes.nota}
              </span>
              <Estrelas />
              {avaliacoes.quantidade}
            </p>
          </div>

          <a
            href={marca.mapa}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 self-start text-sm text-noite-900 sm:self-auto"
          >
            {avaliacoes.botao}
            <span className="grid h-8 w-8 place-items-center rounded-full border border-noite-900/20 transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:rotate-45">
              <Seta className="h-3.5 w-3.5" />
            </span>
          </a>
        </Revelar>

        {/* Três colunas separadas por fio — texto de gente, não cartão. */}
        <ul className="mt-14 grid gap-10 sm:mt-16 lg:grid-cols-3 lg:gap-0">
          {avaliacoes.itens.map((item, i) => (
            <Revelar
              as="li"
              key={item.nome}
              atraso={i * 110}
              distancia={24}
              className="border-t border-noite-900/10 pt-7 lg:border-l lg:border-t-0 lg:px-8 lg:pt-0 lg:first:border-l-0 lg:first:pl-0 lg:last:pr-0"
            >
              <Estrelas className="h-3 w-3" />
              <blockquote className="mt-5 text-[0.95rem] leading-relaxed text-noite-900/80">
                {item.texto}
              </blockquote>
              <p className="mt-5 text-sm text-noite-900">{item.nome}</p>
            </Revelar>
          ))}
        </ul>
      </div>
    </section>
  );
}
