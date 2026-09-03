import { useCallback, useEffect, useRef } from 'react';
import { hero, mensagens, zap } from '../conteudo';
import { Botao } from './Interface';
import { useCena } from './Profundidade';

export function Hero() {
  const interior = useRef(null);
  const titulos = useRef(null);
  const foto = useRef(null);
  const corte = useRef(null);
  const veu = useRef(null);
  const pe = useRef(null);

  /**
   * O recorte da cópia do título.
   *
   * O arco passa por cima das letras. A cópia recortada é desenhada acima do
   * arco, mostrando só o que fica abaixo da cúpula — assim as letras
   * reaparecem por cima da foto sem precisar de duas imagens sincronizadas.
   * `--corte` é a distância do topo do título até a base da cúpula, e ela
   * depende da largura da tela: por isso é medida, não fixada.
   */
  const medirCorte = useCallback(() => {
    const alvo = corte.current;
    const titulo = titulos.current;
    const arco = foto.current;
    if (!alvo || !titulo || !arco) return;

    const areaTitulo = titulo.getBoundingClientRect();
    const areaArco = arco.getBoundingClientRect();
    if (!areaTitulo.height) return;

    // A cúpula é meia circunferência: a base dela fica a um raio do topo.
    const baseDaCupula = areaArco.top + areaArco.width / 2;
    const distancia = ((baseDaCupula - areaTitulo.top) / areaTitulo.height) * 100;
    alvo.style.setProperty('--corte', `${Math.min(100, Math.max(0, distancia)).toFixed(2)}%`);
  }, []);

  useEffect(() => {
    medirCorte();
    const observador = new ResizeObserver(medirCorte);
    if (titulos.current) observador.observe(titulos.current);
    window.addEventListener('resize', medirCorte);
    // As fontes mudam a altura do título quando chegam.
    document.fonts?.ready.then(medirCorte);
    return () => {
      observador.disconnect();
      window.removeEventListener('resize', medirCorte);
    };
  }, [medirCorte]);

  // A capa recua enquanto a primeira seção sobe por cima dela.
  useCena(
    useCallback((rolagem, altura) => {
      const avanco = Math.min(1, rolagem / (altura * 0.9));
      if (interior.current) {
        interior.current.style.transform = `translate3d(0, ${(-avanco * 56).toFixed(1)}px, 0)`;
        interior.current.style.opacity = String(Math.max(0, 1 - avanco * 1.25));
      }
      if (veu.current) veu.current.style.opacity = String(0.55 + avanco * 0.4);
    }, [])
  );

  const linhas = hero.titulo.map((palavra) => (
    <span className="linha" key={palavra}>
      <span>{palavra}</span>
    </span>
  ));

  return (
    <section id="inicio" data-tom="escuro" className="capa">
      {/* Fundo da seção inteira: o vídeo da visita, em laço e sem som. */}
      <div className="capa__fundo" aria-hidden="true">
        <video
          className="foto capa__video"
          poster={hero.poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          tabIndex={-1}
        >
          <source src={hero.video} type="video/mp4" />
        </video>
        <div ref={veu} className="capa__veu" />
      </div>

      <div ref={interior} className="site-container capa__interior">
        <p className="sobretexto capa__micro">{hero.sobretexto}</p>

        <div ref={titulos} className="capa__titulos">
          <h1 className="capa__titulo">{linhas}</h1>

          {/* Cópia recortada, desenhada por cima do arco. Sem JavaScript ela
              fica escondida (--corte começa em 100%) e o arco simplesmente
              cobre as letras — nada quebra. */}
          <p ref={corte} className="capa__titulo capa__titulo--corte" aria-hidden="true">
            {linhas}
          </p>
        </div>

        <div ref={foto} className="capa__foto">
          <figure className="media media--arco">
            <img
              src={hero.arco}
              alt={hero.arcoAlt}
              width="620"
              height="828"
              fetchPriority="high"
              decoding="async"
              className="foto"
            />
          </figure>
        </div>

        <div ref={pe} className="capa__pe">
          <p className="capa__lead">{hero.texto}</p>
          <div className="capa__acoes">
            <Botao href={zap(mensagens.hero)} variante="claro" icone="whatsapp">
              {hero.botao}
            </Botao>
            <a className="link-sublinhado" href="#imoveis">
              {hero.ver}
            </a>
          </div>
        </div>

        <div className="rolagem" aria-hidden="true">
          <span className="sobretexto">role</span>
          <span className="fio-rolagem rolagem__fio" />
        </div>
      </div>
    </section>
  );
}
