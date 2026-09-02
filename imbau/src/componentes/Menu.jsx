import { useEffect, useState } from 'react';
import { marca, mensagens, zap } from '../conteudo';
import { Botao, Marca, Whatsapp } from './Interface';

const links = [
  { href: '#inicio', texto: 'Início' },
  { href: '#imoveis', texto: 'Imóveis' },
  { href: '#servicos', texto: 'Serviços' },
  { href: '#contato', texto: 'Contato' },
];

export function Menu() {
  const [rolou, setRolou] = useState(false);
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    const aoRolar = () => setRolou(window.scrollY > 24);
    aoRolar();
    window.addEventListener('scroll', aoRolar, { passive: true });
    return () => window.removeEventListener('scroll', aoRolar);
  }, []);

  // Com o menu aberto a página não rola atrás do painel.
  useEffect(() => {
    document.body.style.overflow = aberto ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [aberto]);

  useEffect(() => {
    const aoTeclar = (e) => e.key === 'Escape' && setAberto(false);
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-[cubic-bezier(.16,1,.3,1)] ${
        rolou ? 'py-3' : 'py-6'
      }`}
    >
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-6 px-5 sm:px-8">
        <a href="#inicio" aria-label={`${marca.nome} ${marca.sobrenome} — início`}>
          <Marca tamanho="h-9 w-9" />
        </a>

        {/* Pílula de vidro, só no desktop */}
        <nav className="hidden lg:block" aria-label="Navegação principal">
          <ul className="vidro flex items-center gap-1 rounded-full border border-white/10 p-1.5">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="block rounded-full px-5 py-2 text-sm text-osso-100/75 transition-colors duration-300 hover:bg-white/10 hover:text-osso-100"
                >
                  {l.texto}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden md:block">
          <Botao href={zap(mensagens.menu)} variante="claro" icone="whatsapp">
            Fale conosco
          </Botao>
        </div>

        <button
          type="button"
          onClick={() => setAberto(true)}
          aria-label="Abrir menu"
          aria-expanded={aberto}
          className="vidro grid h-11 w-11 place-items-center rounded-full border border-white/10 md:hidden"
        >
          <span className="flex flex-col gap-[5px]">
            <span className="block h-px w-5 bg-osso-100" />
            <span className="block h-px w-5 bg-osso-100" />
          </span>
        </button>
      </div>

      {/* Painel do celular */}
      <div
        className={`fixed inset-0 z-50 bg-noite-900/97 backdrop-blur-xl transition-opacity duration-400 md:hidden ${
          aberto ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-6">
          <Marca tamanho="h-9 w-9" />
          <button
            type="button"
            onClick={() => setAberto(false)}
            aria-label="Fechar menu"
            className="grid h-11 w-11 place-items-center rounded-full border border-white/10"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              <path
                d="m6 6 12 12M18 6 6 18"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <nav className="px-5 pt-6" aria-label="Navegação principal">
          <ul className="flex flex-col">
            {links.map((l, i) => (
              <li key={l.href} className="border-b border-white/8">
                <a
                  href={l.href}
                  onClick={() => setAberto(false)}
                  className="block py-5 text-3xl font-light tracking-tight text-osso-100"
                  style={{
                    transitionDelay: `${80 + i * 45}ms`,
                    opacity: aberto ? 1 : 0,
                    transform: aberto ? 'none' : 'translateY(12px)',
                    transitionProperty: 'opacity, transform',
                    transitionDuration: '600ms',
                    transitionTimingFunction: 'cubic-bezier(.16,1,.3,1)',
                  }}
                >
                  {l.texto}
                </a>
              </li>
            ))}
          </ul>

          <a
            href={zap(mensagens.menu)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 flex items-center justify-center gap-3 rounded-full bg-ouro-500 px-6 py-4 font-medium text-noite-900"
          >
            <Whatsapp className="h-5 w-5" />
            {marca.telefoneExibicao}
          </a>
        </nav>
      </div>
    </header>
  );
}
