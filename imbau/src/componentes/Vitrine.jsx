import { imoveis, mensagens, vitrine, zap } from '../conteudo';
import { Selo, Seta, Whatsapp } from './Interface';
import { Revelar } from './Movimento';
import { Caixa } from './Caixa';
import { Folio } from './Livro';
import { ImagemProfunda } from './Profundidade';

function Cartao({ imovel, indice }) {
  // Alterna o lado da foto. Três cartões idênticos empilhados leem como
  // repetição; alternando, cada um parece uma página do catálogo.
  const invertido = indice % 2 === 1;

  return (
    <Revelar as="article" atraso={indice * 90} distancia={34}>
      <Caixa
        inclinacao={3}
        eleva={4}
        className="group grid overflow-hidden rounded-[2rem] border border-ouro-500/30 bg-noite-800/70 p-1.5 hover:border-ouro-500/60 lg:grid-cols-[1.05fr_0.95fr]"
      >
        {/* A foto ocupa metade do cartão, não o cartão inteiro. As imagens
            têm 828 px de largura: esticadas para os 1.190 px do cartão elas
            perdiam nitidez, e nenhum efeito devolve o que a ampliação come. */}
        <div
          className={`relative aspect-[4/3] overflow-hidden rounded-[calc(2rem-0.375rem)] ${
            invertido ? 'lg:order-2' : ''
          }`}
        >
          <div className="absolute inset-0 transition-transform duration-[1400ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.03]">
            <ImagemProfunda
              src={imovel.imagem}
              alt={imovel.alt ?? imovel.nome}
              loading="lazy"
              decoding="async"
              forca={20}
              escala={1.1}
            />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-noite-900/45 to-transparent" />
        </div>

        {/* O painel de dados. A ficha sai de cima da foto e vira informação
            de verdade, alinhada e legível. */}
        <div className="flex flex-col justify-center p-7 sm:p-10">
          <p className="sobretexto text-ouro-400">{imovel.local}</p>
          <h3 className="titulo mt-4 text-[clamp(1.7rem,2.8vw,2.5rem)] leading-[1.05] text-osso-100">
            {imovel.nome}
          </h3>
          <p className="medida-curta mt-4 text-[0.92rem] leading-relaxed text-osso-100/70">
            {imovel.resumo}
          </p>

          <ul className="mt-8 grid grid-cols-3 border-t border-white/10 pt-6">
            {imovel.ficha.map((item) => (
              <li
                key={item}
                className="border-l border-white/10 px-4 text-[0.78rem] leading-snug text-osso-100/75 first:border-l-0 first:pl-0"
              >
                {item}
              </li>
            ))}
          </ul>

          <a
            href={zap(mensagens.imovel(imovel.nome))}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-9 inline-flex w-fit items-center gap-2.5 rounded-full border border-white/25 px-5 py-2.5 text-sm text-osso-100 transition-all duration-500 ease-[cubic-bezier(.16,1,.3,1)] hover:border-transparent hover:bg-osso-100 hover:text-noite-900 active:scale-[0.98]"
          >
            <Whatsapp className="h-4 w-4" />
            Tenho interesse
          </a>
        </div>
      </Caixa>
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
            <p className="medida mx-auto mt-5 text-[0.95rem] leading-relaxed text-osso-100/60">
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
