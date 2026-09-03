import { useCallback, useEffect, useRef, useState } from 'react';
import { visita } from '../conteudo';
import { useCena } from './Profundidade';

/**
 * A visita: a filmagem percorrida pela rolagem.
 *
 * Não é um <video> com currentTime — Safari e iOS não fazem busca exata de
 * quadro sob rolagem e devolvem um vídeo que engasga e pula. A sequência de
 * frames desenhada em canvas é exata por construção.
 *
 * O prender da seção é `position: sticky`, e o percorrer é o mesmo laço de
 * requestAnimationFrame que já move as fotos da página. Dava para usar GSAP
 * ScrollTrigger com Lenis, como manda o manual do efeito; aqui seriam ~50 KB
 * para repetir uma engrenagem que o site já tem.
 */
export function Visita() {
  const trilho = useRef(null);
  const tela = useRef(null);
  const contexto = useRef(null);
  const quadros = useRef([]);
  const desenhado = useRef(-1);
  const ultima = useRef(null);
  const alvo = useRef(0);
  const atual = useRef(0);

  const [conjunto, setConjunto] = useState(null);
  const [parado, setParado] = useState(false);
  // A visita fica três telas abaixo da capa. Baixar os 80 quadros dela na
  // abertura da página era 92% do peso total competindo com a primeira dobra
  // — numa rede lenta, a pessoa esperava a visita para ver a capa.
  const [perto, setPerto] = useState(false);

  // Qual conjunto: no celular o limite não é a banda, é a memória — um frame
  // decodificado custa largura × altura × 4 bytes, comprima-se o quanto for.
  useEffect(() => {
    const estreito = window.matchMedia('(max-width: 820px)').matches;
    // A prévia empacotada num arquivo só carrega os quadros embutidos e diz
    // qual conjunto usar; no site normal, quem decide é a largura da tela.
    const embutido = globalThis.__CONJUNTO__;
    setConjunto(
      visita.conjuntos[embutido] ??
        (estreito ? visita.conjuntos.mobile : visita.conjuntos.desktop)
    );
    setParado(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  const endereco = useCallback(
    (i) => {
      const caminho = `${conjunto.caminho}/${String(i + 1).padStart(4, '0')}.webp`;
      // Quando a página é empacotada num arquivo só, os quadros vêm embutidos
      // aqui em vez de virem da pasta public/.
      return globalThis.__QUADROS__?.[caminho] ?? caminho;
    },
    [conjunto]
  );

  const maisProximo = useCallback(
    (i) => {
      const lista = quadros.current;
      if (lista[i]) return lista[i];
      for (let d = 1; d < lista.length; d++) {
        if (lista[i - d]) return lista[i - d];
        if (lista[i + d]) return lista[i + d];
      }
      return null;
    },
    []
  );

  const desenha = useCallback(
    (i, forcar = false) => {
      const ctx = contexto.current;
      const img = maisProximo(i);
      if (!ctx || !img || (!forcar && img === ultima.current)) return;
      ultima.current = img;

      const { width: l, height: a } = ctx.canvas;
      const escala = Math.max(l / img.naturalWidth, a / img.naturalHeight);
      const w = img.naturalWidth * escala;
      const h = img.naturalHeight * escala;
      ctx.drawImage(img, (l - w) / 2, (a - h) / 2, w, h);
    },
    [maisProximo]
  );

  const dimensiona = useCallback(() => {
    const canvas = tela.current;
    if (!canvas || !conjunto) return;
    const area = canvas.getBoundingClientRect();
    const densidade = Math.min(window.devicePixelRatio || 1, 2);
    // Nunca pinte mais pixels do que o frame tem: ampliar não acrescenta
    // nitidez e multiplica o custo de cada quadro.
    const teto = Math.max(1, conjunto.largura / area.width);
    const fator = Math.min(densidade, teto);
    canvas.width = Math.round(area.width * fator);
    canvas.height = Math.round(area.height * fator);
    desenha(Math.max(0, desenhado.current), true);
  }, [conjunto, desenha]);

  // Duas telas de antecedência: tempo de sobra para o primeiro quadro estar
  // pronto quando a seção aparecer, e nenhum byte gasto por quem nunca
  // chegar até aqui.
  useEffect(() => {
    const el = trilho.current;
    if (!el) return;
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return;
        setPerto(true);
        observador.disconnect();
      },
      { rootMargin: '200% 0px' }
    );
    observador.observe(el);
    return () => observador.disconnect();
  }, []);

  // Pré-carga: o primeiro quadro na tela antes de tudo, o resto em fila com
  // limite de simultâneas — em ordem, que é a ordem em que serão usados.
  useEffect(() => {
    if (!conjunto || !perto) return;
    const canvas = tela.current;
    if (!canvas) return;

    contexto.current = canvas.getContext('2d', { alpha: false });
    quadros.current = new Array(conjunto.total);
    dimensiona();

    let vivo = true;
    const carrega = (i) =>
      new Promise((pronto) => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () =>
          img
            .decode()
            .catch(() => {})
            .finally(() => {
              quadros.current[i] = img;
              pronto();
            });
        img.onerror = () => pronto(); // um quadro faltando não derruba a cena
        // Prioridade baixa: se ainda houver algo da primeira dobra na fila,
        // a visita espera. Ela tem duas telas de antecedência para isso.
        img.fetchPriority = 'low';
        img.src = endereco(i);
      });

    (async () => {
      await carrega(0);
      if (!vivo) return;
      desenha(0, true);
      if (parado) return;

      let proximo = 1;
      const fila = async () => {
        while (vivo && proximo < conjunto.total) await carrega(proximo++);
      };
      await Promise.all(Array.from({ length: 6 }, fila));
    })();

    window.addEventListener('resize', dimensiona);
    return () => {
      vivo = false;
      window.removeEventListener('resize', dimensiona);
    };
  }, [conjunto, perto, parado, endereco, desenha, dimensiona]);

  const percorre = useCallback(
    (_, altura) => {
      const el = trilho.current;
      if (!el || !conjunto) return;
      const area = el.getBoundingClientRect();
      const util = area.height - altura;
      if (util <= 0) return;

      const avanco = Math.min(1, Math.max(0, -area.top / util));
      alvo.current = avanco * (conjunto.total - 1);

      // Persegue o alvo em vez de saltar até ele. A perseguição é mais
      // direta do que parece necessário porque a rolagem com inércia já
      // suavizou a entrada: dois amortecimentos em série viram atraso.
      atual.current += (alvo.current - atual.current) * 0.32;
      const i = Math.round(atual.current);
      if (i !== desenhado.current) {
        desenhado.current = i;
        desenha(i);
      }
    },
    [conjunto, desenha]
  );

  useCena(percorre, Boolean(conjunto) && !parado);

  return (
    <section id="visita" data-tom="escuro" className="relative bg-noite-900">
      {/* A altura daqui é a distância de rolagem da visita: uma tela para o
          palco e duas para percorrer os 160 quadros — uns 10 px por quadro. */}
      <div ref={trilho} className={parado ? '' : 'h-[300svh]'}>
        <div className="sticky top-0 h-[100svh] overflow-hidden bg-noite-900">
          <canvas
            ref={tela}
            role="img"
            aria-label={visita.alt}
            className="foto block h-full w-full"
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-noite-900 via-transparent to-noite-900/70" />

          <div className="site-container pointer-events-none absolute inset-x-0 bottom-0 pb-14 sm:pb-20">
            <p className="sobretexto text-ouro-400">{visita.sobretexto}</p>
            <h2 className="titulo mt-4 max-w-2xl text-[clamp(1.9rem,4vw,3rem)] leading-[1.04] text-osso-100">
              {visita.titulo}
            </h2>
            <p className="mt-4 max-w-md text-[0.92rem] leading-relaxed text-osso-100/70">
              {visita.texto}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
