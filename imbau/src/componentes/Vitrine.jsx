import { useState } from 'react';
import { imoveis, mensagens, vitrine, zap } from '../conteudo';
import { Selo, Seta, Whatsapp } from './Interface';
import { Revelar } from './Movimento';
import { Galeria } from './Galeria';
import { ImagemProfunda } from './Profundidade';

/** A capa leve existe só para a primeira foto; as outras vão no tamanho cheio. */
const capaDe = (arquivo) => arquivo.replace(/\.webp$/, '-capa.webp');

/** Quantos arquivos há para ver, dito como se fala. */
function rotuloDoAlbum(fotos) {
  const videos = fotos.filter((f) => /\.mp4$/i.test(f.arquivo)).length;
  const imagens = fotos.length - videos;
  const partes = [];
  if (imagens) partes.push(`${imagens} ${imagens === 1 ? 'foto' : 'fotos'}`);
  if (videos) partes.push(`${videos} ${videos === 1 ? 'vídeo' : 'vídeos'}`);
  return partes.join(' e ');
}

/** Marca sobre a foto quando há vídeo no álbum: é o que faz a pessoa clicar. */
function Pastilha({ fotos }) {
  return (
    <span className="pointer-events-none absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full border border-osso-100/25 bg-noite-900/60 px-4 py-1.5 text-[0.72rem] text-osso-100 backdrop-blur-sm">
      {fotos.some((f) => /\.mp4$/i.test(f.arquivo)) && (
        <svg viewBox="0 0 24 24" className="h-3 w-3" aria-hidden="true">
          <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
        </svg>
      )}
      Ver {rotuloDoAlbum(fotos)}
    </span>
  );
}

/**
 * O cartão grande, do imóvel em destaque. Metade foto, metade ficha — é o
 * único que ganha esse espaço, e é por isso que ele lê como destaque.
 */
function CartaoDestaque({ imovel, aoAbrirFotos }) {
  return (
    <Revelar as="article" distancia={34}>
      <div className="group grid overflow-hidden rounded-[2rem] border border-ouro-500/30 bg-noite-800/70 p-1.5 transition-[transform,border-color] duration-700 ease-[cubic-bezier(.16,1,.3,1)] hover:-translate-y-1.5 hover:border-ouro-500/60 lg:grid-cols-[1.08fr_0.92fr]">
        <button
          type="button"
          onClick={() => aoAbrirFotos(imovel)}
          aria-label={`Ver as ${rotuloDoAlbum(imovel.fotos)} de ${imovel.nome}`}
          className="relative aspect-[4/3] overflow-hidden rounded-[calc(2rem-0.375rem)]"
        >
          <div className="absolute inset-0 transition-transform duration-[1400ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.03]">
            <ImagemProfunda
              src={capaDe(imovel.fotos[0].arquivo)}
              alt={imovel.fotos[0].alt}
              loading="lazy"
              decoding="async"
              forca={20}
              escala={1.1}
            />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-noite-900/45 to-transparent" />
          <Pastilha fotos={imovel.fotos} />
        </button>

        <div className="flex flex-col justify-center p-7 sm:p-10">
          <p className="sobretexto text-ouro-400">{imovel.local}</p>
          <h3 className="titulo mt-4 text-[clamp(1.7rem,2.8vw,2.5rem)] text-osso-100">
            {imovel.nome}
          </h3>
          <p className="mt-3 text-[1.35rem] text-osso-100">{imovel.preco}</p>
          <p className="medida-curta mt-4 text-[0.92rem] leading-relaxed text-osso-100/70">
            {imovel.resumo}
          </p>

          <ul className="mt-8 grid grid-cols-2 gap-y-3 border-t border-white/10 pt-6 sm:grid-cols-3">
            {imovel.ficha.map((item) => (
              <li key={item} className="pr-4 text-[0.78rem] leading-snug text-osso-100/75">
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

/**
 * Cartão da grade. Aqui a grade é a forma certa: são itens comparáveis, e
 * quem procura casa lê em paralelo — preço, metragem, quartos — em vez de
 * descer um por um.
 */
function CartaoDaGrade({ imovel, indice, aoAbrirFotos }) {
  return (
    <Revelar as="article" atraso={indice * 80} distancia={26} className="h-full">
      <div className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-ouro-500/25 bg-noite-800/70 p-1.5 transition-[transform,border-color] duration-700 ease-[cubic-bezier(.16,1,.3,1)] hover:-translate-y-1.5 hover:border-ouro-500/55">
        <button
          type="button"
          onClick={() => aoAbrirFotos(imovel)}
          aria-label={`Ver as ${rotuloDoAlbum(imovel.fotos)} de ${imovel.nome}`}
          className="relative aspect-[4/3] overflow-hidden rounded-[calc(1.5rem-0.375rem)]"
        >
          <img
            src={capaDe(imovel.fotos[0].arquivo)}
            alt={imovel.fotos[0].alt}
            loading="lazy"
            decoding="async"
            className="foto h-full w-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.04]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-noite-900/45 to-transparent" />
          <Pastilha fotos={imovel.fotos} />
        </button>

        <div className="flex flex-1 flex-col p-6">
          <p className="sobretexto flex min-h-[2.4em] items-start text-[0.62rem] text-ouro-400">
            {imovel.local}
          </p>
          <h3 className="titulo mt-3 flex min-h-[2.16em] items-start text-[1.45rem] text-osso-100">
            {imovel.nome}
          </h3>
          <p className="mt-2 text-[1.05rem] text-osso-100">{imovel.preco}</p>

          <ul className="mt-5 grid gap-1.5 border-t border-white/10 pt-4">
            {imovel.ficha.slice(0, 3).map((item) => (
              <li key={item} className="text-[0.76rem] leading-snug text-osso-100/70">
                {item}
              </li>
            ))}
          </ul>

          <a
            href={zap(mensagens.imovel(imovel.nome))}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto inline-flex w-fit items-center gap-2 pt-6 text-[0.82rem] text-osso-100/75 transition-colors duration-300 hover:text-osso-100"
          >
            <Whatsapp className="h-3.5 w-3.5" />
            <span className="border-b border-osso-100/25 pb-0.5">Tenho interesse</span>
          </a>
        </div>
      </div>
    </Revelar>
  );
}

export function Vitrine() {
  const [aberto, setAberto] = useState(null);

  // O destaque sai da lista e sobe para o cartão grande; se ninguém estiver
  // marcado, o primeiro assume — a vitrine nunca abre sem cabeça.
  const destaque = imoveis.find((i) => i.destaque) ?? imoveis[0];
  const restantes = imoveis.filter((i) => i !== destaque);

  return (
    <section id="imoveis" data-tom="claro" className="bg-osso-100 px-3 py-6 sm:px-6 sm:py-10">
      {/* A vitrine é o bloco escuro da página — o resto respira no claro. */}
      <div
        data-tom="escuro"
        className="relative isolate mx-auto max-w-[1440px] overflow-hidden rounded-[1.75rem] secao bg-noite-900 lg:rounded-[2.25rem]"
      >
        <div className="site-container relative">
          {/* Cabeçalho alinhado à esquerda, como o resto da página. */}
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

          <div className="mt-16 sm:mt-20">
            <CartaoDestaque imovel={destaque} aoAbrirFotos={setAberto} />
          </div>

          {/* Seis restantes em três colunas: duas fileiras cheias, sem um
              cartão sobrando sozinho no fim. */}
          <div className="mt-6 grid gap-5 sm:mt-8 sm:grid-cols-2 lg:grid-cols-3">
            {restantes.map((imovel, i) => (
              <CartaoDaGrade
                key={imovel.id}
                imovel={imovel}
                indice={i}
                aoAbrirFotos={setAberto}
              />
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

      {aberto && <Galeria fotos={aberto.fotos} aoFechar={() => setAberto(null)} />}
    </section>
  );
}
