import { marca, mensagens, rodape, zap } from '../conteudo';
import { Botao, Instagram, Local, Marca, Whatsapp } from './Interface';
import { Revelar } from './Movimento';

export function Rodape() {
  return (
    <footer data-tom="escuro" className="border-t border-white/8 bg-noite-900 pb-10 pt-20 sm:pt-24">
      <div className="site-container">
        <Revelar className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Marca tamanho="h-11 w-11" />
            <p className="titulo mt-8 max-w-md text-[clamp(1.7rem,3.4vw,2.7rem)] leading-[1.06] text-osso-100">
              {rodape.frase}
            </p>
          </div>
          <Botao href={zap(mensagens.menu)} variante="claro" icone="whatsapp">
            {marca.telefoneExibicao}
          </Botao>
        </Revelar>

        <div className="fio mt-14 h-px w-full text-osso-100" />

        <Revelar
          atraso={100}
          className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3"
        >
          <div>
            <h2 className="sobretexto text-osso-100/55">Atendimento</h2>
            <ul className="mt-5 space-y-3 text-sm text-osso-100/70">
              <li>
                <a
                  href={zap(mensagens.menu)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 transition-colors duration-300 hover:text-osso-100"
                >
                  <Whatsapp className="h-4 w-4 text-osso-100/60" />
                  {marca.telefoneExibicao}
                </a>
              </li>
              <li>
                <a
                  href={marca.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 transition-colors duration-300 hover:text-osso-100"
                >
                  <Instagram className="h-4 w-4 text-osso-100/60" />
                  {marca.instagramExibicao}
                </a>
              </li>
              <li>
                <a
                  href={marca.mapa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-start gap-2.5 transition-colors duration-300 hover:text-osso-100"
                >
                  <Local className="mt-0.5 h-4 w-4 shrink-0 text-osso-100/60" />
                  <span>
                    {marca.endereco}
                    <span className="block text-osso-100/60">
                      {marca.bairro} · {marca.cidade}
                    </span>
                  </span>
                </a>
              </li>
              <li className="text-osso-100/60">{marca.site}</li>
            </ul>
          </div>

          <div>
            <h2 className="sobretexto text-osso-100/55">Serviços</h2>
            <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm text-osso-100/70">
              {rodape.servicos.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="sobretexto text-osso-100/55">Responsável</h2>
            <p className="mt-5 text-sm text-osso-100/70">
              {marca.corretora}
              <span className="block text-osso-100/60">{marca.cargo}</span>
              <span className="mt-2 block text-osso-100/60">{marca.creci}</span>
              <span className="mt-2 block text-osso-100/60">{marca.regiao}</span>
            </p>
          </div>
        </Revelar>

        <div className="fio mt-14 h-px w-full text-osso-100" />

        <p className="mt-6 flex flex-col gap-1 text-[0.72rem] text-osso-100/55 sm:flex-row sm:justify-between">
          <span>
            © {new Date().getFullYear()} {marca.nome} {marca.sobrenome}. Todos os direitos
            reservados.
          </span>
          <span>{marca.creci}</span>
        </p>
      </div>
    </footer>
  );
}
