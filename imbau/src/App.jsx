import { Avaliacoes } from './componentes/Avaliacoes';
import { Chamada } from './componentes/Chamada';
import { Contato } from './componentes/Contato';
import { Hero } from './componentes/Hero';
import { Menu } from './componentes/Menu';
import { Perguntas } from './componentes/Perguntas';
import { Rodape } from './componentes/Rodape';
import { Servicos } from './componentes/Servicos';
import { Sobre } from './componentes/Sobre';
import { Vitrine } from './componentes/Vitrine';

export default function App() {
  return (
    <>
      <Menu />

      {/* O site inteiro é uma placa apoiada no fundo claro da página. */}
      <div className="mx-auto max-w-[1520px] p-0 sm:p-4 lg:p-5">
        <div className="overflow-clip bg-osso-100 sm:rounded-[2rem] sm:shadow-[0_30px_80px_-45px_rgba(10,14,23,0.5)] lg:rounded-[2.5rem]">
          <main>
            <Hero />
            <Servicos />
            <Vitrine />
            <Sobre />
            <Avaliacoes />
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
