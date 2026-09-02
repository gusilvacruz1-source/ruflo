import { useMemo, useState } from 'react';
import { contato, marca, montarMensagem } from '../conteudo';
import { Instagram, Whatsapp } from './Interface';
import { Revelar } from './Movimento';

/** Pastilha de escolha única. Botão de verdade, para funcionar no teclado. */
function Pastilha({ ativo, children, ...resto }) {
  return (
    <button
      type="button"
      aria-pressed={ativo}
      className={`rounded-full border px-4 py-2 text-sm transition-all duration-500 ease-[cubic-bezier(.16,1,.3,1)] ${
        ativo
          ? 'border-noite-900 bg-noite-900 text-osso-100'
          : 'border-noite-900/15 text-noite-900/70 hover:border-noite-900/45 hover:text-noite-900'
      }`}
      {...resto}
    >
      {children}
    </button>
  );
}

const campo =
  'w-full rounded-2xl border border-noite-900/15 bg-white px-4 py-3 text-sm text-noite-900 placeholder:text-noite-900/40 transition-colors duration-300 hover:border-noite-900/30 focus:border-noite-900 focus:outline-none';

export function Contato() {
  const [objetivo, setObjetivo] = useState(contato.objetivos[0]);
  const [tipo, setTipo] = useState(contato.tipos[0]);
  const [nome, setNome] = useState('');
  const [detalhe, setDetalhe] = useState('');

  const texto = useMemo(
    () => montarMensagem({ nome, objetivo, tipo, detalhe }),
    [nome, objetivo, tipo, detalhe]
  );
  const link = `https://wa.me/${marca.whatsapp}?text=${encodeURIComponent(texto)}`;

  return (
    <section id="contato" data-tom="claro" className="relative bg-osso-100 pb-24 pt-4 sm:pb-32">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <Revelar>
              <h2 className="titulo text-[clamp(2.1rem,4.6vw,3.4rem)] leading-[1.02] text-noite-900">
                {contato.titulo}
              </h2>
            </Revelar>
            <Revelar atraso={180}>
              <p className="mt-5 max-w-md text-[0.95rem] leading-relaxed text-noite-900/65">
                {contato.texto}
              </p>
            </Revelar>

            <Revelar atraso={260} className="mt-10 flex flex-col gap-4">
              <a
                href={`https://wa.me/${marca.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 text-noite-900"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-noite-900/15 text-noite-900 transition-colors duration-500 group-hover:border-noite-900/45">
                  <Whatsapp className="h-4.5 w-4.5" />
                </span>
                <span>
                  <span className="block text-[1.05rem] leading-tight">
                    {marca.telefoneExibicao}
                  </span>
                  <span className="block text-[0.78rem] text-noite-900/50">{contato.horario}</span>
                </span>
              </a>

              <a
                href={marca.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 text-noite-900"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-noite-900/15 text-noite-900 transition-colors duration-500 group-hover:border-noite-900/45">
                  <Instagram className="h-4.5 w-4.5" />
                </span>
                <span>
                  <span className="block text-[1.05rem] leading-tight">
                    {marca.instagramExibicao}
                  </span>
                  <span className="block text-[0.78rem] text-noite-900/50">
                    Imóveis novos toda semana
                  </span>
                </span>
              </a>
              <p className="mt-4 max-w-sm border-t border-noite-900/10 pt-6 text-[0.85rem] leading-relaxed text-noite-900/55">
                {contato.regiao}
              </p>
            </Revelar>
          </div>

          {/* Montador: o plano de trás segura o formulário na frente. */}
          <Revelar
            atraso={140}
            distancia={30}
            className="rounded-[2rem] border border-noite-900/10 bg-osso-200 p-1.5"
          >
            <div className="rounded-[calc(2rem-0.375rem)] border border-noite-900/8 bg-osso-100 p-6 sm:p-8">
              <fieldset>
                <legend className="sobretexto text-noite-900/45">{contato.rotulos.objetivo}</legend>
                <div className="mt-4 flex flex-wrap gap-2">
                  {contato.objetivos.map((o) => (
                    <Pastilha key={o} ativo={objetivo === o} onClick={() => setObjetivo(o)}>
                      {o}
                    </Pastilha>
                  ))}
                </div>
              </fieldset>

              <fieldset className="mt-8">
                <legend className="sobretexto text-noite-900/45">{contato.rotulos.tipo}</legend>
                <div className="mt-4 flex flex-wrap gap-2">
                  {contato.tipos.map((t) => (
                    <Pastilha key={t} ativo={tipo === t} onClick={() => setTipo(t)}>
                      {t}
                    </Pastilha>
                  ))}
                </div>
              </fieldset>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="sobretexto block text-noite-900/45">
                    {contato.rotulos.nome}
                  </span>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder={contato.rotulos.nomePlaceholder}
                    className={`mt-3 ${campo}`}
                  />
                </label>
                <label className="block">
                  <span className="sobretexto block text-noite-900/45">
                    {contato.rotulos.detalhe}
                  </span>
                  <input
                    type="text"
                    value={detalhe}
                    onChange={(e) => setDetalhe(e.target.value)}
                    placeholder={contato.rotulos.detalhePlaceholder}
                    className={`mt-3 ${campo}`}
                  />
                </label>
              </div>

              {/* Prévia: a pessoa vê exatamente o que vai enviar. */}
              <div className="mt-8 rounded-2xl border border-noite-900/10 bg-osso-200 p-5">
                <p className="sobretexto text-noite-900/45">{contato.rotulos.previa}</p>
                <p className="mt-3 text-[0.92rem] leading-relaxed text-noite-900/80">{texto}</p>
              </div>

              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-6 flex items-center justify-between gap-3 rounded-full bg-ouro-500 py-2 pl-6 pr-2 font-medium text-noite-900 transition-colors duration-300 hover:bg-ouro-400"
              >
                <span className="text-sm">{contato.botao}</span>
                <span className="grid h-10 w-10 place-items-center rounded-full bg-noite-900 text-ouro-500 transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-110">
                  <Whatsapp className="h-4.5 w-4.5" />
                </span>
              </a>
            </div>
          </Revelar>
        </div>
      </div>
    </section>
  );
}
