import { marca, mensagens, sobre, zap } from '../conteudo';
import { Botao } from './Interface';
import { Folio } from './Livro';
import { Revelar } from './Movimento';

export function Sobre() {
  return (
    <section id="sobre" data-tom="claro" className="secao relative bg-osso-100">
      <div className="site-container relative">
        <Folio id="sobre" />

        <Revelar className="max-w-4xl">
          <p className="titulo-hero text-[clamp(1.65rem,3.8vw,2.8rem)] leading-[1.14] text-noite-900">
            <span aria-hidden="true" className="text-ouro-600">
              “
            </span>
            {sobre.frase}
            <span aria-hidden="true" className="text-ouro-600">
              ”
            </span>
          </p>
          <p className="mt-6 text-sm text-noite-900/50">
            {marca.corretora} · {marca.cargo}
          </p>
        </Revelar>

        <div className="fio mt-14 h-px w-full text-noite-900 sm:mt-16" />

        <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div>
            <Revelar>
              <h2 className="titulo text-[clamp(1.8rem,3.6vw,2.7rem)] leading-[1.05] text-noite-900">
                {sobre.titulo}
              </h2>
            </Revelar>
            <Revelar atraso={110}>
              <p className="medida mt-5 text-[0.95rem] leading-relaxed text-noite-900/65">
                {sobre.texto}
              </p>
            </Revelar>
            <Revelar atraso={200} className="mt-9">
              <Botao href={zap(mensagens.menu)} variante="escuro" icone="whatsapp">
                {sobre.botao}
              </Botao>
            </Revelar>
          </div>

          {/* Ficha da responsável: rótulo em cima, dado embaixo, fio entre linhas. */}
          <Revelar atraso={140} as="dl" className="grid gap-px self-start bg-noite-900/10 sm:grid-cols-2">
            {sobre.credenciais.map((c) => (
              <div key={c.rotulo} className="bg-osso-100 px-1 py-5 sm:px-6">
                <dt className="sobretexto text-noite-900/40">{c.rotulo}</dt>
                <dd className="mt-3 text-[1.05rem] leading-snug text-noite-900">{c.valor}</dd>
              </div>
            ))}
          </Revelar>
        </div>
      </div>
    </section>
  );
}
