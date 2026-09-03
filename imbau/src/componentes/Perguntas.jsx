import { useState } from 'react';
import { mensagens, perguntas, zap } from '../conteudo';
import { Whatsapp } from './Interface';
import { Folio } from './Livro';
import { Revelar } from './Movimento';

/** Uma pergunta. Abre e fecha com altura animada, sem pulo de layout. */
function Item({ item, aberto, aoAbrir, indice }) {
  const id = `resposta-${indice}`;
  return (
    <Revelar as="div" atraso={indice * 60} distancia={18} className="border-t border-noite-900/10">
      <h3>
        <button
          type="button"
          onClick={aoAbrir}
          aria-expanded={aberto}
          aria-controls={id}
          className="group flex w-full items-start justify-between gap-6 py-6 text-left"
        >
          <span
            className={`text-[1.05rem] leading-snug transition-colors duration-500 sm:text-[1.15rem] ${
              aberto ? 'text-noite-900' : 'text-noite-900/75 group-hover:text-noite-900'
            }`}
          >
            {item.pergunta}
          </span>

          {/* Cruz que vira menos: gira 45° quando abre. */}
          <span
            aria-hidden="true"
            className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-all duration-700 ease-[cubic-bezier(.16,1,.3,1)] ${
              aberto
                ? 'rotate-45 border-noite-900 bg-noite-900 text-osso-100'
                : 'border-noite-900/15 text-noite-900/60 group-hover:border-noite-900/40'
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </span>
        </button>
      </h3>

      <div
        id={id}
        className="grid transition-[grid-template-rows] duration-700 ease-[cubic-bezier(.16,1,.3,1)]"
        style={{ gridTemplateRows: aberto ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <p
            className={`medida pb-7 pr-12 text-[0.92rem] leading-relaxed text-noite-900/65 transition-opacity duration-500 ${
              aberto ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {item.resposta}
          </p>
        </div>
      </div>
    </Revelar>
  );
}

export function Perguntas() {
  const [abertoEm, setAbertoEm] = useState(0);

  return (
    <section id="perguntas" data-tom="claro" className="secao relative bg-osso-100">
      <div className="site-container">
        <Folio id="perguntas" />

        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <Revelar>
              <h2 className="titulo text-[clamp(1.9rem,3.8vw,2.7rem)] leading-[1.03] text-noite-900">
                {perguntas.titulo}
              </h2>
            </Revelar>
            <Revelar atraso={110}>
              <p className="medida-curta mt-5 text-[0.95rem] leading-relaxed text-noite-900/65">
                {perguntas.texto}
              </p>
            </Revelar>
            <Revelar atraso={190} className="mt-7">
              <a
                href={zap(mensagens.menu)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 text-sm text-noite-900 underline decoration-noite-900/25 underline-offset-8 transition-colors duration-300 hover:decoration-noite-900"
              >
                <Whatsapp className="h-4 w-4 text-ouro-700" />
                Perguntar direto no WhatsApp
              </a>
            </Revelar>
          </div>

          <div className="border-b border-noite-900/10">
            {perguntas.itens.map((item, i) => (
              <Item
                key={item.pergunta}
                item={item}
                indice={i}
                aberto={abertoEm === i}
                aoAbrir={() => setAbertoEm(abertoEm === i ? -1 : i)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
