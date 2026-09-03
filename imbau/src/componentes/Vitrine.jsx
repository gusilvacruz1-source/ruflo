import { imoveis, mensagens, vitrine, zap } from '../conteudo';
import { Selo, Seta, Whatsapp } from './Interface';
import { Revelar } from './Movimento';
import { Folio } from './Livro';
import { ImagemProfunda } from './Profundidade';

function Cartao({ imovel, indice }) {
  return (
    <Revelar
      as="article"
      atraso={indice * 90}
      distancia={34}
      className="group relative rounded-[2rem] border border-ouro-500/30 bg-noite-800/70 p-1.5 transition-colors duration-700 hover:border-ouro-500/60"
    >
      {/* A foto fica na frente do plano: moldura por fora, imagem encaixada dentro. */}
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[calc(2rem-0.375rem)] sm:aspect-[16/10] lg:aspect-[16/9]">
        {/* A foto anda mais devagar que o cartão; o hover aproxima a moldura
            inteira, sem brigar com a transformação da parallaxe. */}
        <div className="absolute inset-0 transition-transform duration-[1400ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.04]">
          <ImagemProfunda
            src={imovel.imagem}
            alt={imovel.alt ?? imovel.nome}
            loading="lazy"
            decoding="async"
            forca={30}
            escala={1.12}
          />
        </div>
        {/* Escurece o pé da foto para o nome do imóvel ficar legível em qualquer imagem. */}
        <div className="absolute inset-0 bg-gradient-to-t from-noite-900 via-noite-900/62 to-noite-900/10" />
        <div className="absolute inset-0 bg-noite-900/15 transition-colors duration-700 group-hover:bg-noite-900/0" />

        {/* Ficha técnica no topo, discreta */}
        <ul className="absolute left-5 top-5 flex flex-wrap gap-2 sm:left-7 sm:top-7">
          {imovel.ficha.map((item) => (
            <li
              key={item}
              className="rounded-full border border-white/15 bg-noite-900/45 px-3 py-1 text-[0.68rem] tracking-wide text-osso-100/85 backdrop-blur-sm"
            >
              {item}
            </li>
          ))}
        </ul>

        {/* Nome e local centralizados na base, como na referência */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center px-5 pb-7 text-center sm:pb-9">
          <p className="sobretexto text-ouro-400">{imovel.local}</p>
          <h3 className="titulo mt-3 text-[clamp(1.5rem,3.4vw,2.6rem)] text-osso-100">
            {imovel.nome}
          </h3>
          <p className="mt-2 max-w-md text-[0.85rem] leading-relaxed text-osso-100/70">
            {imovel.resumo}
          </p>

          <a
            href={zap(mensagens.imovel(imovel.nome))}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-noite-900/40 px-5 py-2 text-sm text-osso-100 backdrop-blur-sm transition-all duration-500 ease-[cubic-bezier(.16,1,.3,1)] hover:border-transparent hover:bg-osso-100 hover:text-noite-900"
          >
            <Whatsapp className="h-4 w-4" />
            Tenho interesse
          </a>
        </div>
      </div>
    </Revelar>
  );
}

export function Vitrine() {
  return (
    <section id="imoveis" data-tom="claro" className="bg-osso-100 px-3 py-6 sm:px-6 sm:py-10">
      {/* A vitrine é o bloco escuro da página — o resto respira no claro. */}
      <div
        data-tom="escuro"
        className="relative isolate mx-auto max-w-[1440px] overflow-hidden rounded-[1.75rem] secao bg-noite-900 lg:rounded-[2.25rem]"
      >
        <div className="site-container relative">
          <Folio id="imoveis" claro />

        <header className="mx-auto max-w-2xl text-center">
          <Revelar>
            <Selo>{vitrine.selo}</Selo>
          </Revelar>
          <Revelar atraso={100}>
            <h2 className="titulo mt-7 text-[clamp(2.1rem,5vw,3.9rem)] leading-[1.02] text-osso-100">
              {vitrine.titulo}
            </h2>
          </Revelar>
          <Revelar atraso={190}>
            <p className="mx-auto mt-5 max-w-lg text-[0.95rem] leading-relaxed text-osso-100/60">
              {vitrine.texto}
            </p>
          </Revelar>
        </header>

        <div className="mt-16 flex flex-col gap-6 sm:mt-20 sm:gap-8">
          {imoveis.map((imovel, i) => (
            <Cartao key={imovel.id} imovel={imovel} indice={i} />
          ))}
        </div>

        <Revelar atraso={120} className="mt-14 flex justify-center">
          <a
            href={zap(mensagens.menu)}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 text-sm text-osso-100/65 transition-colors duration-300 hover:text-osso-100"
          >
            {vitrine.botao}
            <span className="grid h-8 w-8 place-items-center rounded-full border border-white/15 transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:rotate-45">
              <Seta className="h-3.5 w-3.5" />
            </span>
          </a>
        </Revelar>
        </div>
      </div>
    </section>
  );
}
