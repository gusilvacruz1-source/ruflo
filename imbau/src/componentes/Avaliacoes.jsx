import { avaliacoes, marca } from '../conteudo';
import { Contagem } from './Contagem';
import { EstrelaCheia, Seta } from './Interface';
import { Caixa } from './Caixa';
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
      id="avaliacoes"
      data-tom="claro"
      className="secao border-t border-noite-900/10 bg-osso-100"
    >
      <div className="site-container">

        <Revelar className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-wrap items-end gap-x-10 gap-y-6">
            {/* A nota é o argumento da seção, então ela é que fica grande. */}
            <p className="flex flex-col gap-3">
              <Contagem
                ate={avaliacoes.nota}
                casas={1}
                className="titulo text-[clamp(4rem,8vw,6.5rem)] leading-[0.85] text-noite-900"
              />
              <span className="flex items-center gap-3 text-sm text-noite-900/65">
                <Estrelas />
                <span>
                  <Contagem ate={avaliacoes.quantidade} /> {avaliacoes.fonte}
                </span>
              </span>
            </p>

            <h2 className="titulo max-w-sm text-[clamp(1.7rem,3.2vw,2.4rem)] leading-[1.05] text-noite-900">
              {avaliacoes.titulo}
            </h2>
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
        <ul className="mt-14 grid gap-4 sm:mt-16 lg:grid-cols-3">
          {avaliacoes.itens.map((item, i) => (
            <Revelar as="li" key={item.nome} atraso={i * 110} distancia={24}>
              <Caixa className="flex h-full flex-col rounded-[1.25rem] border border-noite-900/12 bg-osso-200/50 p-7 hover:border-noite-900/30">
                <Estrelas className="h-3 w-3" />
                <blockquote className="mt-5 text-[0.95rem] leading-relaxed text-noite-900/80">
                  {item.texto}
                </blockquote>
                <p className="mt-auto pt-5 text-sm text-noite-900">{item.nome}</p>
              </Caixa>
            </Revelar>
          ))}
        </ul>
      </div>
    </section>
  );
}
