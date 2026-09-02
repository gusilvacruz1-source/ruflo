import { Chamada } from './componentes/Chamada';
import { Contato } from './componentes/Contato';
import { Hero } from './componentes/Hero';
import { Menu } from './componentes/Menu';
import { Perguntas } from './componentes/Perguntas';
import { Rodape } from './componentes/Rodape';
import { Servicos } from './componentes/Servicos';
import { Sobre } from './componentes/Sobre';
import { Vitrine } from './componentes/Vitrine';
import { pagina } from './conteudo';

/**
 * Plano do fundo: a mesma cena da primeira dobra, desfocada e escurecida.
 * Fica parada enquanto a página passa por cima — é a mesa onde o site pousa.
 */
function Fundo() {
  return (
    <div aria-hidden="true" className="fixed inset-0 -z-10 overflow-hidden bg-noite-900">
      <img
        src={pagina.fundo}
        alt=""
        className="h-full w-full scale-105 object-cover object-[center_68%] blur-[14px] brightness-110"
      />
      <div className="absolute inset-0 bg-noite-900/25" />
    </div>
  );
}

export default function App() {
  return (
    <>
      <Fundo />
      <Menu />

      {/* O site inteiro é uma placa apoiada sobre o plano do fundo. */}
      <div className="mx-auto max-w-[1520px] px-0 pb-0 pt-0 sm:px-6 sm:pb-8 sm:pt-6 lg:px-14 lg:pb-14 lg:pt-10">
        <div className="overflow-clip bg-noite-900 shadow-[0_50px_140px_-50px_rgba(0,0,0,0.95)] sm:rounded-[2.25rem] sm:border sm:border-white/15 lg:rounded-[2.75rem]">
          <main>
            <Hero />
            <Servicos />
            <Vitrine />
            <Sobre />
            <Chamada />
            <Perguntas />
            <Contato />
          </main>
          <Rodape />
        </div>
      </div>
    </>
  );
}
