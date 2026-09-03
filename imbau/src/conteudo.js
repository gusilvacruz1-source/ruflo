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
  endereco: 'Tv. Pio XII, nº 93',
  bairro: 'Bairro Bela Vista',
  cidade: 'Imbaú · PR',
  cep: '84250-000',
  mapa: 'https://www.google.com/maps/search/?api=1&query=Imobili%C3%A1ria+Imba%C3%BA%2C+Tv.+Pio+XII%2C+93%2C+Imba%C3%BA+-+PR',
  telefoneExibicao: '(42) 98836-9168',
  whatsapp: '5542988369168',
  instagram: 'https://www.instagram.com/imobiliaria.imbau/',
  instagramExibicao: '@imobiliaria.imbau',
  site: 'imobiliariaimbau.com.br',
  simbolo: 'marca/imbau-simbolo.png',
};

/**
 * Os capítulos do livro, na ordem em que a pessoa os folheia.
 * A lombada à esquerda e o fólio no alto de cada folha leem esta lista —
 * o `id` tem de bater com o da seção correspondente.
 */
export const capitulos = [
  { id: 'servicos', numero: 'I', nome: 'Serviços' },
  { id: 'imoveis', numero: 'II', nome: 'Imóveis' },
  { id: 'sobre', numero: 'III', nome: 'A corretora' },
  { id: 'avaliacoes', numero: 'IV', nome: 'Avaliações' },
  { id: 'avaliacao-gratuita', numero: 'V', nome: 'Avaliação gratuita' },
  { id: 'perguntas', numero: 'VI', nome: 'Dúvidas' },
  { id: 'contato', numero: 'VII', nome: 'Contato' },
];

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
  endereco: 'Olá! Vim pelo site e queria confirmar o horário para passar no escritório.',
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

/**
 * Serviços da placa, agora com uma linha de explicação em cada um.
 * A ordem aqui é a ordem que aparece na tela.
 */
export const servicos = {
  titulo: 'Do anúncio à escritura',
  texto:
    'A Imbaú acompanha o caminho inteiro do imóvel — não só a parte da venda. Cada serviço abaixo é conduzido por quem conhece o cartório, o banco e a rua.',
  lista: [
    {
      nome: 'Venda',
      texto:
        'Anúncio, fotos, visitas e negociação. Você acompanha cada proposta antes de qualquer decisão.',
    },
    {
      nome: 'Locação',
      texto:
        'Análise de cadastro, vistoria de entrada e contrato assinado — para o proprietário dormir tranquilo.',
    },
    {
      nome: 'Administração',
      texto:
        'Cuidamos do imóvel alugado no dia a dia: recebimento, reajuste e a conversa com o inquilino.',
    },
    {
      nome: 'Avaliação',
      texto:
        'Preço com base em imóveis parecidos na região, no estado real da construção e no que o mercado paga hoje.',
    },
    {
      nome: 'Regularização',
      texto:
        'Escritura, matrícula e averbações encaminhadas junto ao cartório, com prazo e custo explicados antes.',
    },
    {
      nome: 'Contratos',
      texto:
        'Compra, venda e locação escritos com clareza e revisados linha a linha antes da assinatura.',
    },
    {
      nome: 'Prestação de serviços',
      texto:
        'Assessoria pontual: conferir uma documentação, acompanhar uma negociação ou orientar um financiamento.',
    },
  ],
  etapasTitulo: 'O caminho até a chave',
  etapas: [
    {
      numero: '01',
      titulo: 'Conversa',
      texto: 'Você conta o que precisa. A gente escuta antes de mostrar qualquer imóvel.',
    },
    {
      numero: '02',
      titulo: 'Avaliação',
      texto: 'Visita ao imóvel ou seleção do que realmente combina com o que você procura.',
    },
    {
      numero: '03',
      titulo: 'Negociação',
      texto: 'Proposta, contraproposta e ajustes com as duas partes sempre informadas.',
    },
    {
      numero: '04',
      titulo: 'Chaves',
      texto: 'Contrato assinado, documentação conferida e a chave na mão de quem comprou.',
    },
  ],
};

export const sobre = {
  titulo: 'Atendimento com nome, rosto e CRECI',
  texto:
    'Aqui não existe central de atendimento. Quem responde a mensagem é quem visita o imóvel, avalia o preço e senta na mesa da negociação — na cidade em que a gente mora.',
  frase:
    'Imóvel é a maior compra da vida da maioria das famílias. Merece conversa honesta e documento em ordem.',
  /** Ficha da responsável. Só dado que já está na placa e no perfil. */
  credenciais: [
    { rotulo: 'Responsável', valor: 'Raquel Domingues' },
    { rotulo: 'Registro', valor: 'CRECI 27892' },
    { rotulo: 'Base', valor: 'Imbaú · Paraná' },
    { rotulo: 'Atendimento', valor: 'WhatsApp e visita presencial' },
  ],
  botao: 'Conversar com a Raquel',
};

/**
 * Avaliações reais do perfil da imobiliária no Google.
 * As duas primeiras estão cortadas no Google ("… Mais"); aqui entra só o
 * trecho que dá para ler por inteiro — nada foi reescrito.
 *
 * Ao acrescentar uma avaliação nova, copie o texto do Google e atualize
 * também `nota` e `quantidade`.
 */
export const avaliacoes = {
  titulo: 'Quem já passou por aqui',
  nota: '5,0',
  quantidade: '3 avaliações no Google',
  botao: 'Ver no Google',
  itens: [
    {
      nome: 'Gedean Almeida',
      texto:
        'Excelente experiência! Equipe séria, transparente e muito profissional. Encontraram o imóvel ideal e facilitaram todo o processo burocrático. Recomendo de olhos fechados!',
    },
    {
      nome: 'Maria Clara Lemes',
      texto:
        'Quero deixar meu agradecimento à equipe da Imobiliária Imbaú pelo excelente atendimento. Fui muito bem orientada durante todo o processo de financiamento da minha casa, sempre com clareza, paciência e profissionalismo.',
    },
    {
      nome: 'Francieli Suchodolak Lima',
      texto:
        'Profissional competente e qualificada, comprometida com o cliente, dando todo o suporte necessário.',
    },
  ],
};

export const perguntas = {
  titulo: 'O que perguntam antes de começar',
  texto: 'Se a sua dúvida não estiver aqui, é só chamar no WhatsApp — a gente responde.',
  itens: [
    {
      pergunta: 'A avaliação do meu imóvel é cobrada?',
      resposta:
        'Não. A avaliação é gratuita e sem compromisso: visitamos o imóvel, comparamos com o que está sendo negociado na região e apresentamos uma faixa de preço realista. Você decide depois se quer anunciar.',
    },
    {
      pergunta: 'Como faço para anunciar meu imóvel?',
      resposta:
        'Mande uma mensagem com o endereço, o tamanho e algumas fotos. A partir daí agendamos a visita, combinamos o valor e o imóvel entra na carteira — inclusive aqui no site.',
    },
    {
      pergunta: 'Vocês atendem quem vai comprar financiado?',
      resposta:
        'Sim. Acompanhamos a documentação que o banco pede e organizamos a papelada do vendedor para o processo não travar. A aprovação do crédito e as condições, no entanto, são sempre decisão da instituição financeira.',
    },
    {
      pergunta: 'Meu imóvel não tem escritura. Dá para vender?',
      resposta:
        'Na maioria dos casos sim, mas antes é preciso regularizar. Verificamos a situação da matrícula, explicamos o que falta, quanto custa e quanto tempo leva — e só então o imóvel vai para a venda.',
    },
    {
      pergunta: 'O atendimento é só em Imbaú?',
      resposta:
        'A base é Imbaú, e também atendemos os municípios vizinhos. Se o imóvel estiver mais longe, pergunte antes: dizemos com sinceridade se conseguimos atender bem.',
    },
    {
      pergunta: 'Em quanto tempo meu imóvel vende?',
      resposta:
        'Depende do preço, do estado de conservação e da documentação. Não prometemos prazo: mostramos o movimento real dos imóveis parecidos e ajustamos a estratégia com você durante o anúncio.',
    },
  ],
};

/**
 * Seção de contato. As listas alimentam o montador de mensagem: a pessoa
 * escolhe as opções e o botão abre o WhatsApp com o texto já escrito.
 */
export const contato = {
  titulo: 'Comece pela conversa',
  texto:
    'Monte a sua mensagem em três toques. Ela abre no WhatsApp já escrita — você só confere e envia.',
  horario: 'Aberto a partir das 8h',
  regiao: 'Imbaú e municípios vizinhos, com visita presencial combinada antes.',
  enderecoRotulo: 'Escritório',
  rotulos: {
    objetivo: 'Eu quero',
    tipo: 'Tipo de imóvel',
    detalhe: 'Mais detalhes',
    detalhePlaceholder: 'Bairro, número de quartos, faixa de valor…',
    nome: 'Seu nome',
    nomePlaceholder: 'Como podemos te chamar?',
    previa: 'Sua mensagem',
  },
  objetivos: ['Comprar', 'Vender', 'Alugar', 'Avaliar', 'Regularizar'],
  tipos: ['Casa', 'Terreno', 'Apartamento', 'Chácara', 'Comercial', 'Outro'],
  botao: 'Abrir no WhatsApp',
};

/**
 * Monta o texto que vai para o WhatsApp a partir do que a pessoa escolheu.
 * Campo em branco simplesmente não entra na frase.
 */
export const montarMensagem = ({ nome, objetivo, tipo, detalhe }) => {
  const acoes = {
    Comprar: 'comprar',
    Vender: 'vender',
    Alugar: 'alugar',
    Avaliar: 'avaliar',
    Regularizar: 'regularizar',
  };
  const bens = {
    Casa: 'uma casa',
    Terreno: 'um terreno',
    Apartamento: 'um apartamento',
    Chácara: 'uma chácara',
    Comercial: 'um ponto comercial',
    Outro: 'um imóvel',
  };

  const partes = ['Olá, Raquel! Vim pelo site da Imbaú Imobiliária.'];
  if (nome?.trim()) partes.push(`Meu nome é ${nome.trim()}.`);
  partes.push(`Gostaria de ${acoes[objetivo] ?? 'falar sobre'} ${bens[tipo] ?? 'um imóvel'}.`);
  if (detalhe?.trim()) partes.push(detalhe.trim().replace(/\s+/g, ' '));
  return partes.join(' ');
};
