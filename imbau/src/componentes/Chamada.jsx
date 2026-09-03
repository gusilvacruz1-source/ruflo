import { chamada, mensagens, zap } from '../conteudo';
import { Botao, IconeBeneficio, Selo } from './Interface';
import { Folio } from './Livro';
import { Revelar } from './Movimento';
import { ImagemProfunda } from './Profundidade';

export function Chamada() {
  return (
    <section id="avaliacao-gratuita" data-tom="claro" className="relative bg-osso-200 py-20 sm:py-28">
      <div className="site-container">
        <Folio id="avaliacao-gratuita" />

        <Revelar
          distancia={34}
          className="relative overflow-hidden rounded-[2rem] border border-noite-900/8 bg-osso-100 shadow-[0_40px_90px_-60px_rgba(10,14,23,0.55)]"
        >
          {/* Círculos creme, quase imperceptíveis — só quebram a chapada do fundo. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-ouro-500/10 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 left-1/4 h-96 w-96 rounded-full bg-ouro-500/8 blur-3xl"
          />

          <div className="relative grid lg:grid-cols-[1.02fr_0.98fr]">
            <div className="flex flex-col justify-between p-8 sm:p-12 lg:p-16">
              <div>
                <Revelar>
                  <Selo claro={false}>{chamada.selo}</Selo>
                </Revelar>

                <Revelar atraso={90}>
                  <h2 className="titulo mt-7 text-[clamp(2.1rem,4.4vw,3.6rem)] leading-[1.02] text-noite-900">
                    {chamada.titulo}
                  </h2>
                </Revelar>

                <Revelar atraso={170}>
                  <p className="mt-5 max-w-md text-[0.95rem] leading-relaxed text-noite-900/65">
                    {chamada.texto}
                  </p>
                </Revelar>

                <Revelar atraso={250} className="mt-9 flex flex-wrap items-center gap-3">
                  <Botao href="#imoveis" variante="escuro">
                    {chamada.botaoSecundario}
                  </Botao>
                  <Botao href={zap(mensagens.avaliacao)} variante="ouro" icone="whatsapp">
                    {chamada.botaoPrincipal}
                  </Botao>
                </Revelar>
              </div>

              <Revelar atraso={330} className="mt-14 lg:mt-20">
                <div className="fio h-px w-full text-noite-900" />
                <ul className="mt-7 grid gap-7 sm:grid-cols-3 sm:gap-4">
                  {chamada.beneficios.map((b) => (
                    <li key={b.titulo} className="sm:border-l sm:border-noite-900/10 sm:pl-5 sm:first:border-l-0 sm:first:pl-0">
                      <span className="flex items-center gap-2 text-noite-900">
                        <IconeBeneficio nome={b.icone} />
                        <span className="text-sm font-medium">{b.titulo}</span>
                      </span>
                      <p className="mt-1.5 text-[0.78rem] leading-relaxed text-noite-900/50">
                        {b.texto}
                      </p>
                    </li>
                  ))}
                </ul>
              </Revelar>
            </div>

            <div className="relative min-h-[340px] overflow-hidden lg:min-h-[640px]">
              <ImagemProfunda
                src={chamada.imagem}
                alt={chamada.imagemAlt}
                loading="lazy"
                decoding="async"
                forca={36}
                escala={1.14}
              />
            </div>
          </div>
        </Revelar>
      </div>
    </section>
  );
}
