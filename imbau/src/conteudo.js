/**
 * Todo o conteúdo editável da página fica aqui.
 * Textos, contatos, imóveis e imagens — nenhum componente precisa ser aberto
 * para trocar o que aparece na tela.
 */

export const marca = {
  nome: 'Imbaú',
  sobrenome: 'Imobiliária',
  corretora: 'Raquel Domingues',
  cargo: 'Corretora de Imóveis',
  creci: 'CRECI 27892',
  regiao: 'Imbaú · Paraná',
  telefoneExibicao: '(42) 98836-9168',
  whatsapp: '5542988369168',
  instagram: 'https://www.instagram.com/imobiliaria.imbau/',
  instagramExibicao: '@imobiliaria.imbau',
  site: 'imobiliariaimbau.com.br',
  simbolo: 'marca/imbau-simbolo.png',
};

/** Monta o link do WhatsApp já com a mensagem escrita para a pessoa enviar. */
export const zap = (mensagem) =>
  `https://wa.me/${marca.whatsapp}?text=${encodeURIComponent(mensagem)}`;

/**
 * Cada botão abre o WhatsApp com um texto diferente — quem atende já sabe
 * de onde veio o contato e sobre o que a conversa é.
 */
export const mensagens = {
  menu: 'Olá! Vim pelo site da Imbaú Imobiliária e gostaria de falar com um corretor.',
  hero: 'Olá, Raquel! Vim pelo site e quero encontrar o meu próximo imóvel.',
  avaliacao:
    'Olá, Raquel! Vim pelo site e gostaria de uma avaliação gratuita do meu imóvel.',
  imovel: (nome) =>
    `Olá! Vim pelo site e me interessei pelo imóvel "${nome}". Pode me passar mais detalhes?`,
};

export const hero = {
  sobretexto: 'Imbaú · Paraná',
  titulo: 'Seu imóvel no caminho certo',
  texto:
    'Compra, venda e locação com avaliação honesta e documentação em ordem. A Imbaú acompanha cada etapa — do primeiro contato à entrega das chaves.',
  botao: 'Quero meu imóvel',
  /**
   * A faixa de baixo. São os três pilares do atendimento, tirados da própria
   * comunicação da Imbaú — nada de número inventado.
   *
   * Se um dia quiser números reais ("+120 famílias atendidas"), é só trocar
   * `valor` e `rotulo` aqui.
   */
  pilares: [
    { valor: 'Vendas', rotulo: 'Compra, venda e locação' },
    { valor: 'Avaliações', rotulo: 'Preço justo, sem achismo' },
    { valor: 'Regularizações', rotulo: 'Documentação em dia' },
  ],
  imagem: 'imagens/hero-lago.svg',
};

export const vitrine = {
  selo: 'Novas oportunidades',
  titulo: 'Imóveis em destaque',
  texto:
    'Uma seleção curta e atualizada. Cada imóvel passa por avaliação e conferência de documentação antes de entrar aqui.',
  botao: 'Ver todos os imóveis',
};

/**
 * Imóveis da carteira, tirados dos anúncios do próprio perfil.
 * Para publicar um novo: copie um bloco, troque os textos e aponte `imagem`
 * para a foto em public/imagens/. Sem foto ainda? Use 'imagens/imovel-sem-foto.svg'.
 *
 * ⚠️ Confirme com a Raquel se os três seguem disponíveis antes de publicar.
 */
export const imoveis = [
  {
    id: 'casa-210m2',
    nome: 'Casa 210 m²',
    local: 'Imbaú · PR',
    resumo: 'Cozinha, sala de estar e sala de jantar, com área externa em volta',
    ficha: ['210 m² construídos', '3 quartos', '1 suíte'],
    imagem: 'imagens/casa-210m2-fachada.webp',
    alt: 'Fachada da casa de 210 m² em esquina, com muro claro e rua de paralelepípedo',
  },
  {
    id: 'imovel-rural',
    nome: 'Imóvel com terreno de 1.723 m²',
    local: 'Imbaú · PR',
    resumo: 'Casa de 130 m² em terreno amplo e arborizado, com espaço para ampliar',
    ficha: ['1.723 m² de terreno', '130 m² construídos', 'Área verde'],
    imagem: 'imagens/imovel-rural-1723m2.webp',
    alt: 'Casa térrea com telhado de cerâmica em terreno amplo com árvores',
  },
  {
    id: 'casa-122m2',
    nome: 'Casa 122 m²',
    local: 'Imbaú · PR',
    resumo: 'Terreno de 220 m² com garagem coberta e frente para rua calçada',
    ficha: ['122 m² construídos', '220 m² de terreno', 'Garagem coberta'],
    imagem: 'imagens/casa-122m2.webp',
    alt: 'Casa com garagem coberta e portão, vista da rua de paralelepípedo',
  },
];

export const chamada = {
  selo: 'Hora de mudar de endereço',
  titulo: 'Realize seus sonhos',
  texto:
    'Peça a avaliação gratuita do seu imóvel ou conte para a gente o que você procura. A Imbaú cuida da negociação, dos contratos e da regularização do começo ao fim.',
  botaoSecundario: 'Ver imóveis',
  botaoPrincipal: 'Falar no WhatsApp',
  imagem: 'imagens/casa-210m2-varanda.webp',
  imagemAlt: 'Varanda com arcos e jardim de uma casa da carteira da Imbaú',
  beneficios: [
    { icone: 'local', titulo: 'Imbaú e região', texto: 'Quem conhece cada rua' },
    { icone: 'preco', titulo: 'Avaliação justa', texto: 'Valor com base em dados' },
    { icone: 'documento', titulo: 'Documentação', texto: 'Regularizada e segura' },
  ],
};

export const rodape = {
  frase: 'Seu imóvel no caminho certo.',
  // Serviços listados na própria placa da imobiliária.
  servicos: [
    'Venda',
    'Locação',
    'Administração',
    'Avaliação',
    'Regularização',
    'Contratos',
    'Prestação de serviços',
  ],
};
