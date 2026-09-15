import { useState } from 'react';
import { imoveis, mensagens, vitrine, zap } from '../conteudo';
import { Selo, Seta, Whatsapp } from './Interface';
import { Revelar } from './Movimento';
import { Galeria } from './Galeria';
import { ImagemProfunda } from './Profundidade';

function Cartao({ imovel, indice, aoAbrirFotos }) {
  // Alterna o lado da foto. Três cartões idênticos empilhados leem como
  // repetição; alternando, cada um parece uma página do catálogo.
  const invertido = indice % 2 === 1;

  return (
    <Revelar as="article" atraso={indice * 90} distancia={34}>
      {/* O cartão sobe no hover, sem inclinar. A 1.190 px de largura, três
          graus de inclinação não leem como espessura — leem como a borda
          reta empenando, e é justamente a borda que segura este cartão. */}
      <div className="group grid overflow-hidden rounded-[2rem] border border-ouro-500/30 bg-noite-800/70 p-1.5 transition-[transform,border-color] duration-700 ease-[cubic-bezier(.16,1,.3,1)] hover:-translate-y-1.5 hover:border-ouro-500/60 lg:grid-cols-[1.05fr_0.95fr]">
        {/* A foto ocupa metade do cartão, não o cartão inteiro. As imagens
            têm 828 px de largura: esticadas para os 1.190 px do cartão elas
            perdiam nitidez, e nenhum efeito devolve o que a ampliação come. */}
        <button
          type="button"
          onClick={() => aoAbrirFotos(imovel)}
          aria-label={`Ver as ${imovel.fotos.length} fotos de ${imovel.nome}`}
          className={`relative aspect-[4/3] overflow-hidden rounded-[calc(2rem-0.375rem)] ${
            invertido ? 'lg:order-2' : ''
          }`}
        >
          <div className="absolute inset-0 transition-transform duration-[1400ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.03]">
            <ImagemProfunda
              src={imovel.fotos[0].arquivo}
              alt={imovel.fotos[0].alt}
              loading="lazy"
              decoding="async"
              forca={20}
              escala={1.1}
            />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-noite-900/45 to-transparent" />

          {/* O contador só aparece quando há o que ver: um imóvel com uma
              foto só não promete um álbum que não existe. */}
          <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full border border-osso-100/25 bg-noite-900/55 px-4 py-1.5 text-[0.72rem] text-osso-100 backdrop-blur-sm">
            {imovel.fotos.length > 1
              ? `Ver ${imovel.fotos.length} fotos`
              : 'Ver a foto'}
          </span>
        </button>

        {/* O painel de dados. A ficha sai de cima da foto e vira informação
            de verdade, alinhada e legível. */}
        <div className="flex flex-col justify-center p-7 sm:p-10">
          <p className="sobretexto text-ouro-400">{imovel.local}</p>
          <h3 className="titulo mt-4 text-[clamp(1.7rem,2.8vw,2.5rem)] text-osso-100">
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
      </div>
    </Revelar>
  );
}

export function Vitrine() {
  const [aberto, setAberto] = useState(null);

  return (
    <section id="imoveis" data-tom="claro" className="bg-osso-100 px-3 py-6 sm:px-6 sm:py-10">
      {/* A vitrine é o bloco escuro da página — o resto respira no claro. */}
      <div
        data-tom="escuro"
        className="relative isolate mx-auto max-w-[1440px] overflow-hidden rounded-[1.75rem] secao bg-noite-900 lg:rounded-[2.25rem]"
      >
        <div className="site-container relative">

        {/* Cabeçalho alinhado à esquerda, como o resto da página. Centralizar
            só este bloco quebrava o eixo que o site segue de ponta a ponta —
            e era a única coisa aqui que não tinha decidido nada. */}
        <header className="grid gap-8 lg:grid-cols-[1.25fr_1fr] lg:items-end lg:gap-16">
          <div>
            <Revelar>
              <Selo>{vitrine.selo}</Selo>
            </Revelar>
            <Revelar atraso={100}>
              <h2 className="titulo mt-7 text-[clamp(2.1rem,5vw,3.9rem)] text-osso-100">
                {vitrine.titulo}
              </h2>
            </Revelar>
          </div>
          <Revelar atraso={190} className="lg:pb-2">
            <p className="medida text-[0.95rem] leading-relaxed text-osso-100/60">
              {vitrine.texto}
            </p>
          </Revelar>
        </header>

        <div className="mt-16 flex flex-col gap-6 sm:mt-20 sm:gap-8">
          {imoveis.map((imovel, i) => (
            <Cartao key={imovel.id} imovel={imovel} indice={i} aoAbrirFotos={setAberto} />
          ))}
        </div>

        {/* Fecho da vitrine: uma linha só, com o fio se desenhando até o
            link. O mesmo gesto das etapas, do outro lado do tom. */}
        <Revelar atraso={120} className="mt-16 flex items-center gap-6 sm:gap-10">
          <span
            aria-hidden="true"
            className="fio-desenho h-px flex-1 bg-white/15"
            style={{ '--fio-atraso': '280ms' }}
          />
          <a
            href={zap(mensagens.menu)}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex shrink-0 items-center gap-3 text-sm text-osso-100/65 transition-colors duration-300 hover:text-osso-100"
          >
            {vitrine.botao}
            <span className="grid h-8 w-8 place-items-center rounded-full border border-white/15 transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:rotate-45">
              <Seta className="h-3.5 w-3.5" />
            </span>
          </a>
        </Revelar>
        </div>
      </div>

      {aberto && (
        <Galeria fotos={aberto.fotos} aoFechar={() => setAberto(null)} />
      )}
    </section>
  );
}
