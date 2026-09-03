import { Avaliacoes } from './componentes/Avaliacoes';
import { Chamada } from './componentes/Chamada';
import { Contato } from './componentes/Contato';
import { Hero } from './componentes/Hero';
import { Menu } from './componentes/Menu';
import { Perguntas } from './componentes/Perguntas';
import { Rolagem } from './componentes/Rolagem';
import { Rodape } from './componentes/Rodape';
import { Servicos } from './componentes/Servicos';
import { Sobre } from './componentes/Sobre';
import { Visita } from './componentes/Visita';
import { Vitrine } from './componentes/Vitrine';

export default function App() {
  return (
    <>
      <Rolagem />
      <Menu />

      {/* O site inteiro é uma placa apoiada no fundo claro da página. */}
      <div className="placa p-0 sm:p-4 lg:p-5">
        <div className="overflow-clip bg-osso-100 sm:rounded-[2rem] sm:shadow-[0_30px_80px_-45px_rgba(10,14,23,0.5)] lg:rounded-[2.5rem]">
          <main className="relative">
            {/* A capa fica onde está; as folhas do livro passam por cima dela. */}
            <div className="sticky top-0 z-0">
              <Hero />
            </div>

            <div className="relative z-10 shadow-[0_-30px_60px_-25px_rgba(5,8,14,0.75)]">
              <Servicos />
              <Vitrine />
              <Visita />
              <Sobre />
              <Avaliacoes />
              <Chamada />
              <Perguntas />
              <Contato />
            </div>
          </main>
          <Rodape />
        </div>
      </div>
    </>
  );
}
