import { Chamada } from './componentes/Chamada';
import { Hero } from './componentes/Hero';
import { Menu } from './componentes/Menu';
import { Rodape } from './componentes/Rodape';
import { Vitrine } from './componentes/Vitrine';

export default function App() {
  return (
    <>
      <Menu />
      <main>
        <Hero />
        <Vitrine />
        <Chamada />
      </main>
      <Rodape />
    </>
  );
}
