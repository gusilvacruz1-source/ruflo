import { marca } from '../conteudo';
import { Magnetico } from './Movimento';

/* ---------- ícones ---------- */

export function Seta({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M7 17 17 7M9 7h8v8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Whatsapp({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.04 2c-5.5 0-9.97 4.47-9.97 9.97 0 1.76.46 3.48 1.34 5L2 22l5.15-1.35a9.94 9.94 0 0 0 4.89 1.28h.01c5.5 0 9.97-4.47 9.97-9.97 0-2.66-1.04-5.17-2.92-7.05A9.9 9.9 0 0 0 12.04 2m0 1.82c2.18 0 4.23.85 5.77 2.39a8.1 8.1 0 0 1 2.39 5.77c0 4.5-3.66 8.15-8.16 8.15a8.2 8.2 0 0 1-4.16-1.14l-.3-.18-3.06.8.82-2.98-.2-.31a8.1 8.1 0 0 1-1.26-4.35c0-4.5 3.66-8.15 8.16-8.15M8.53 7.33c-.16 0-.42.06-.64.3-.22.24-.85.83-.85 2.02s.87 2.34.99 2.5c.12.16 1.7 2.6 4.14 3.64.58.25 1.03.4 1.38.51.58.19 1.11.16 1.53.1.47-.07 1.44-.59 1.64-1.16.2-.57.2-1.05.14-1.16-.06-.1-.22-.16-.46-.28-.24-.12-1.44-.71-1.66-.79-.22-.08-.39-.12-.55.12-.16.24-.63.79-.77.95-.14.16-.28.18-.52.06-.24-.12-1.03-.38-1.96-1.21-.72-.65-1.21-1.44-1.35-1.68-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.32-.76-1.8-.18-.4-.37-.4-.54-.41z" />
    </svg>
  );
}

export function Estrela({ className = 'h-3 w-3' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2c.5 4.6 5.4 9.5 10 10-4.6.5-9.5 5.4-10 10-.5-4.6-5.4-9.5-10-10 4.6-.5 9.5-5.4 10-10Z" />
    </svg>
  );
}

export function EstrelaCheia({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="m12 2.6 2.9 5.9 6.5.95-4.7 4.58 1.1 6.47L12 17.44 6.2 20.5l1.1-6.47L2.6 9.45l6.5-.95z" />
    </svg>
  );
}

export function Instagram({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" />
    </svg>
  );
}

const beneficios = {
  local: (
    <>
      <path
        d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    </>
  ),
  preco: (
    <>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 7v10M14.6 9.4c-.4-.9-1.3-1.4-2.6-1.4-1.5 0-2.5.7-2.5 1.9 0 2.7 5.2 1.4 5.2 4.2 0 1.3-1.1 2-2.7 2-1.4 0-2.4-.5-2.8-1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </>
  ),
  documento: (
    <>
      <path
        d="M6 3.8h7.5L18 8.3V20a.8.8 0 0 1-.8.8H6a.8.8 0 0 1-.8-.8V4.6a.8.8 0 0 1 .8-.8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M13.2 4v4.6H18" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path
        d="m8.6 14.4 1.9 1.9 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
};

export function Local({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function IconeBeneficio({ nome, className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      {beneficios[nome]}
    </svg>
  );
}

/* ---------- marca ---------- */

export function Marca({ className = '', tamanho = 'h-9 w-9', claro = true }) {
  return (
    <span className={`flex items-center gap-3 ${className}`}>
      <img
        src={marca.simbolo}
        alt=""
        className={`${tamanho} shrink-0 object-contain`}
        width="360"
        height="367"
      />
      <span
        className="flex flex-col leading-none"
        style={{
          textShadow: claro
            ? '0 1px 14px rgba(5, 8, 14, 0.55)'
            : '0 1px 14px rgba(246, 243, 236, 0.75)',
        }}
      >
        <span
          className={`text-[1.05rem] font-medium tracking-tight transition-colors duration-500 ${
            claro ? 'text-osso-100' : 'text-noite-900'
          }`}
        >
          {marca.nome.toLowerCase()}
        </span>
        <span
          className={`mt-1 text-[0.55rem] font-medium uppercase tracking-[0.3em] transition-colors duration-500 ${
            claro ? 'text-osso-100/50' : 'text-noite-900/45'
          }`}
        >
          {marca.sobrenome}
        </span>
      </span>
    </span>
  );
}

/* ---------- botões ---------- */

const estilos = {
  claro: 'bg-osso-100 text-noite-900 hover:bg-white',
  ouro: 'bg-ouro-500 text-noite-900 hover:bg-ouro-400',
  escuro: 'bg-noite-900 text-osso-100 hover:bg-noite-700',
  contorno:
    'border border-osso-100/25 text-osso-100 hover:border-osso-100/60 hover:bg-osso-100/5',
};

const badge = {
  claro: 'bg-noite-900 text-osso-100',
  ouro: 'bg-noite-900 text-ouro-500',
  escuro: 'bg-osso-100 text-noite-900',
  contorno: 'bg-osso-100/10 text-osso-100',
};

/**
 * Botão-pílula com a bolinha do ícone à direita, como no design de referência.
 * Fica magnético no desktop: acompanha o cursor de leve e volta ao lugar.
 */
export function Botao({
  href,
  variante = 'claro',
  icone = 'seta',
  children,
  className = '',
  ...resto
}) {
  const externo = href?.startsWith('http');
  return (
    <Magnetico className={className}>
      <a
        href={href}
        target={externo ? '_blank' : undefined}
        rel={externo ? 'noopener noreferrer' : undefined}
        className={`group inline-flex items-center gap-3 rounded-full py-2 pl-6 pr-2 text-sm font-medium transition-colors duration-300 ${estilos[variante]}`}
        {...resto}
      >
        <span>{children}</span>
        <span
          className={`grid h-9 w-9 place-items-center rounded-full transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:rotate-45 ${badge[variante]} ${
            icone === 'whatsapp' ? 'group-hover:rotate-0 group-hover:scale-110' : ''
          }`}
        >
          {icone === 'whatsapp' ? <Whatsapp /> : <Seta />}
        </span>
      </a>
    </Magnetico>
  );
}

/** Selo pequeno, contorno mostarda — abre as seções. */
export function Selo({ children, claro = true }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[0.72rem] font-medium tracking-wide ${
        claro
          ? 'border-ouro-500/55 bg-ouro-500/8 text-ouro-400'
          : 'border-ouro-500 bg-white text-noite-900'
      }`}
    >
      <Estrela className={claro ? 'h-3 w-3 text-ouro-500' : 'h-3 w-3 text-noite-900'} />
      {children}
    </span>
  );
}
