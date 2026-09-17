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
  sobretexto: 'Corretora de imóveis · Imbaú, PR',
  /** O nome, em duas palavras: elas ficam lado a lado e quebram sozinhas. */
  titulo: ['Imbaú', 'Imobiliária'],
  texto:
    'Compra, venda e locação com avaliação honesta e documentação em ordem. A Imbaú acompanha cada etapa — do primeiro contato à entrega das chaves.',
  botao: 'Falar no WhatsApp',
  ver: 'Ver os imóveis',
  // Um imóvel da carteira, em laço e sem som: o terreno arborizado da
  // Charqueada de Baixo, o mesmo que a seção da visita percorre. O laço é
  // ida e volta — sem isso a emenda dá um tranco justo onde o olho está.
  // O poster cobre o intervalo até o vídeo tocar e fica no lugar dele se
  // não tocar.
  video: 'imagens/capa-fundo.mp4',
  poster: 'imagens/capa-fundo.webp',
  arco: 'imagens/capa-arco.webp',
  arcoAlt: 'Fachada de arcos da casa de 210 m² na Rua Otávio Borges',
};


/**
 * A visita: a filmagem que a pessoa percorre rolando a página.
 *
 * Os frames saem de `tools/` com o script da skill video-to-website:
 *   extrai-frames.sh entrada.mov public/visita 160
 * `total` precisa bater com o número de arquivos de cada pasta — o script
 * imprime os dois no fim.
 *
 * ⚠️ Confirmar com a Raquel de qual imóvel é a filmagem antes de publicar,
 * e se ele segue disponível.
 */
export const visita = {
  sobretexto: 'A visita',
  titulo: 'Role para entrar no terreno',
  texto:
    'O passo é seu: a chegada avança no ritmo em que você rola a página. Do portão na Avenida Paraná até a casa, pelos 1.723 m² arborizados da Charqueada de Baixo.',
  alt: 'Caminhada do portão da Avenida Paraná até a casa, pelo terreno arborizado de 1.723 m² na Charqueada de Baixo',
  // A filmagem é de celular, na vertical. Os quadros ficam na proporção em
  // que ela foi feita: cortar 9:16 para caber num palco panorâmico jogaria
  // fora dois terços da altura e deixaria uma tira fina de assunto.
  conjuntos: {
    desktop: { caminho: 'visita/desktop', total: 96, largura: 480 },
    mobile: { caminho: 'visita/mobile', total: 48, largura: 360 },
  },
};

export const vitrine = {
  selo: 'Novas oportunidades',
  titulo: 'Imóveis em destaque',
  texto:
    'Uma seleção curta e atualizada. Cada imóvel passa por avaliação e conferência de documentação antes de entrar aqui.',
  botao: 'Ver todos os imóveis',
};

/**
 * Imóveis da carteira. Os dados vêm dos anúncios que a Raquel escreve, e as
 * fotos são as que ela mandou — conferidas uma por uma antes de entrar aqui.
 *
 * Para publicar um novo: copie um bloco, troque os textos e aponte cada
 * entrada de `fotos` para um arquivo em public/imagens/imoveis/. Quantas
 * quiser — a primeira é a capa do cartão, as outras entram no visualizador.
 * Arquivo terminado em .mp4 entra como vídeo, sem precisar dizer nada.
 *
 * `destaque: true` em UM imóvel: é ele que ganha o cartão grande no topo da
 * vitrine. Para mudar a vitrine de dono, mova essa linha — nada mais.
 *
 * A capa pede foto na horizontal: o cartão corta em 4:3 e uma foto em pé
 * perde o telhado e o chão.
 *
 * Sem foto ainda, não publique o imóvel: uma ilustração de reserva no lugar
 * de uma casa real é o que faz um site de imobiliária parecer catálogo.
 *
 * ⚠️ Confirme com a Raquel antes de publicar: se os sete seguem disponíveis
 * e se os valores continuam de pé.
 */
export const imoveis = [
  {
    id: 'casa-120m2-pedra-do-sol',
    destaque: true,
    nome: 'Casa 120 m²',
    local: 'Rua Pedra do Sol · Loteamento São Pedro · Cidade Alta',
    preco: 'R$ 320 mil',
    resumo:
      'Varanda ampla na frente, edícula com churrasqueira no fundo e garagem coberta. Dois quartos mais suíte, em terreno de 375 m² com portão eletrônico e canil.',
    ficha: [
      '120 m² construídos',
      '375 m² de terreno',
      '2 quartos + 1 suíte',
      'Varanda',
      'Edícula com churrasqueira',
      'Portão eletrônico',
    ],
    fotos: [
      { arquivo: 'imagens/imoveis/casa-120m2-pedra-do-sol-14.webp', alt: 'Fachada da casa, cinza-azulada com telhado de cerâmica, e pátio de piso queimado na frente' },
      { arquivo: 'imagens/imoveis/casa-120m2-pedra-do-sol-02.webp', alt: 'A varanda coberta sobre colunas, que corre pela frente inteira da casa' },
      { arquivo: 'imagens/imoveis/casa-120m2-pedra-do-sol-12.webp', alt: 'A casa no fim da tarde, com a varanda e o pátio iluminados de lado' },
      { arquivo: 'imagens/imoveis/casa-120m2-pedra-do-sol-07.webp', alt: 'A casa vista de lado, mostrando o comprimento do telhado e o quintal' },
      { arquivo: 'imagens/imoveis/casa-120m2-pedra-do-sol-01.webp', alt: 'A varanda por dentro: piso frio, bancada com pia e espaço para mesa' },
      { arquivo: 'imagens/imoveis/casa-120m2-pedra-do-sol-11.webp', alt: 'Edícula com churrasqueira de tijolo e poltronas de vime' },
      { arquivo: 'imagens/imoveis/casa-120m2-pedra-do-sol-06.webp', alt: 'Quintal com piso na frente, canteiro novo e muro ao fundo' },
      { arquivo: 'imagens/imoveis/casa-120m2-pedra-do-sol-15.webp', alt: 'Lateral da casa com a garagem coberta e o terreno em declive' },
      { arquivo: 'imagens/imoveis/casa-120m2-pedra-do-sol-10.webp', alt: 'Garagem coberta, com piso de concreto e espaço para carro e moto' },
      { arquivo: 'imagens/imoveis/casa-120m2-pedra-do-sol-04.webp', alt: 'Cozinha e sala de jantar juntas, com armários de madeira clara e mesa posta' },
      { arquivo: 'imagens/imoveis/casa-120m2-pedra-do-sol-08.webp', alt: 'A mesma cozinha do outro lado, com geladeira e bancada' },
      { arquivo: 'imagens/imoveis/casa-120m2-pedra-do-sol-03.webp', alt: 'Quarto com cama de casal, guarda-roupa embutido e recamier no pé da cama' },
      { arquivo: 'imagens/imoveis/casa-120m2-pedra-do-sol-09.webp', alt: 'Segundo quarto, com guarda-roupa de duas cores e duas camas' },
      { arquivo: 'imagens/imoveis/casa-120m2-pedra-do-sol-13.webp', alt: 'Banheiro com box de vidro, cuba de apoio e espelho' },
      { arquivo: 'imagens/imoveis/casa-120m2-pedra-do-sol-05.webp', alt: 'Banheiro da suíte, com box e banheira' },
    ],
  },
  {
    id: 'casa-210m2',
    nome: 'Casa 210 m²',
    local: 'Rua Otávio Borges · Cidade Alta',
    preco: 'R$ 900 mil',
    resumo:
      'Fachada de arcos e jardim na frente, sala de estar e sala de jantar separadas, três quartos sendo um suíte, e garagem com área gourmet. Terreno de 275 m² em esquina.',
    ficha: [
      '210 m² construídos',
      '275 m² de terreno',
      '3 quartos + 1 suíte',
      'Sala de estar e de jantar',
      'Garagem com área gourmet',
      'Esquina',
    ],
    fotos: [
      { arquivo: 'imagens/imoveis/casa-210m2-07.webp', alt: 'Fachada branca com arcos, jardim e caminho de pedra até a entrada' },
      { arquivo: 'imagens/imoveis/casa-210m2-06.webp', alt: 'A varanda de arcos vista de perto, com o pátio calçado' },
      { arquivo: 'imagens/imoveis/casa-210m2-09.webp', alt: 'A casa vista da rua de paralelepípedo, na esquina' },
      { arquivo: 'imagens/imoveis/casa-210m2-10.webp', alt: 'A esquina, com o muro de faixas escuras e a placa de trânsito' },
      { arquivo: 'imagens/imoveis/casa-210m2-12.webp', alt: 'Vista da rua mostrando o volume mais alto da casa' },
      { arquivo: 'imagens/imoveis/casa-210m2-13.webp', alt: 'O mesmo volume mais alto, de perto' },
      { arquivo: 'imagens/imoveis/casa-210m2-08.webp', alt: 'Jardim lateral com sebe, caminho calçado e muro' },
      { arquivo: 'imagens/imoveis/casa-210m2-11.webp', alt: 'Terraço com guarda-corpo e vista para a cidade' },
      { arquivo: 'imagens/imoveis/casa-210m2-02.webp', alt: 'Sala de jantar com janelas do chão ao teto e mesa para seis' },
      { arquivo: 'imagens/imoveis/casa-210m2-17.webp', alt: 'Sala de jantar e cozinha, com a escada de madeira ao lado' },
      { arquivo: 'imagens/imoveis/casa-210m2-05.webp', alt: 'A mesa de jantar com a escada ao fundo' },
      { arquivo: 'imagens/imoveis/casa-210m2-03.webp', alt: 'Sala de estar com teto trabalhado, lustre e sofá de canto' },
      { arquivo: 'imagens/imoveis/casa-210m2-01.webp', alt: 'Cozinha com ilha, bancada de granito e revestimento de mosaico' },
      { arquivo: 'imagens/imoveis/casa-210m2-15.webp', alt: 'A cozinha do outro lado, com banquetas na bancada' },
      { arquivo: 'imagens/imoveis/casa-210m2-14.webp', alt: 'Quarto amplo com janela larga' },
      { arquivo: 'imagens/imoveis/casa-210m2-16.webp', alt: 'Quarto com guarda-roupa branco e penteadeira com espelho' },
      { arquivo: 'imagens/imoveis/casa-210m2-19.webp', alt: 'Quarto de parede verde, com cama e armário embutido' },
      { arquivo: 'imagens/imoveis/casa-210m2-18.webp', alt: 'Banheiro com box de vidro e paredes verde e amarela' },
      { arquivo: 'imagens/imoveis/casa-210m2-04.webp', alt: 'Lavabo com parede de tijolo de vidro' },
    ],
  },
  {
    id: 'casa-325m2-comercial',
    nome: 'Casa 325 m² com frente comercial',
    local: 'Rua Laura Vieira Jangada · Cidade Alta',
    preco: 'R$ 450 mil',
    resumo:
      'Cinco quartos sendo um suíte, garagem para três carros e edícula com churrasqueira — mais uma frente comercial de 50 m² com porta para a rua, pronta para alugar ou trabalhar.',
    ficha: [
      '325 m² construídos',
      '385 m² de terreno',
      '5 quartos + 1 suíte',
      'Frente comercial de 50 m²',
      'Garagem para 3 carros',
      'Edícula com churrasqueira',
    ],
    fotos: [
      { arquivo: 'imagens/imoveis/casa-325m2-comercial-12.webp', alt: 'Fachada rosa com a frente comercial fechada e o portão de madeira da garagem' },
      { arquivo: 'imagens/imoveis/casa-325m2-comercial-13.webp', alt: 'A mesma fachada do outro lado da rua' },
      { arquivo: 'imagens/imoveis/casa-325m2-comercial-10.webp', alt: 'A frente inteira do imóvel, em ângulo, mostrando a extensão do terreno' },
      { arquivo: 'imagens/imoveis/casa-325m2-comercial-09.webp', alt: 'A sala comercial vazia, de paredes vermelhas e piso frio' },
      { arquivo: 'imagens/imoveis/casa-325m2-comercial-07.webp', alt: 'Passagem lateral coberta, com muro de pedra' },
      { arquivo: 'imagens/imoveis/casa-325m2-comercial-08.webp', alt: 'Área coberta nos fundos, com piso xadrez e churrasqueira' },
      { arquivo: 'imagens/imoveis/casa-325m2-comercial-06.webp', alt: 'Passagem interna ligando os ambientes' },
      { arquivo: 'imagens/imoveis/casa-325m2-comercial-01.webp', alt: 'Cozinha e sala de jantar, com armários claros e mesa posta' },
      { arquivo: 'imagens/imoveis/casa-325m2-comercial-02.webp', alt: 'O mesmo ambiente, mais aberto' },
      { arquivo: 'imagens/imoveis/casa-325m2-comercial-03.webp', alt: 'Cozinha com cooktop, armários e bancada' },
      { arquivo: 'imagens/imoveis/casa-325m2-comercial-04.webp', alt: 'Quarto de parede verde, com cama de casal' },
      { arquivo: 'imagens/imoveis/casa-325m2-comercial-11.webp', alt: 'Corredor com um dos quartos ao fundo' },
      { arquivo: 'imagens/imoveis/casa-325m2-comercial-05.webp', alt: 'Banheiro com revestimento de mosaico, cuba e vaso' },
      { arquivo: 'imagens/imoveis/casa-325m2-comercial-14.mp4', alt: 'Vídeo percorrendo a casa e a frente comercial' },
    ],
  },
  {
    id: 'casa-122m2',
    nome: 'Casa 122 m²',
    local: 'Rua Jacutinga · Bairro São Cristóvão',
    preco: 'R$ 300 mil',
    resumo:
      'Casa térrea com garagem coberta e frente para rua calçada, em terreno de 220 m². Na negociação, aceita terreno no Cidade Alta ou no Bela Vista como parte do pagamento.',
    ficha: [
      '122 m² construídos',
      '220 m² de terreno',
      '3 quartos',
      'Garagem coberta',
      'Aceita terreno na troca',
    ],
    fotos: [
      { arquivo: 'imagens/imoveis/casa-122m2-02.webp', alt: 'Fachada cinza com acabamento escuro, vista da rua de paralelepípedo, com carro na garagem' },
      { arquivo: 'imagens/imoveis/casa-122m2-12.webp', alt: 'A frente da casa com o portão aberto e o pátio de concreto' },
      { arquivo: 'imagens/imoveis/casa-122m2-01.webp', alt: 'A garagem coberta vista de dentro do terreno' },
      { arquivo: 'imagens/imoveis/casa-122m2-03.webp', alt: 'Passagem coberta ao lado da casa, com piso frio' },
      { arquivo: 'imagens/imoveis/casa-122m2-04.webp', alt: 'Cozinha com armários brancos, mesa e geladeira' },
      { arquivo: 'imagens/imoveis/casa-122m2-11.webp', alt: 'A cozinha do outro lado' },
      { arquivo: 'imagens/imoveis/casa-122m2-05.webp', alt: 'Sala de estar de parede cinza, com sofá e janela ampla' },
      { arquivo: 'imagens/imoveis/casa-122m2-06.webp', alt: 'A sala com a televisão na parede' },
      { arquivo: 'imagens/imoveis/casa-122m2-07.webp', alt: 'Quarto vazio, com janela alta' },
      { arquivo: 'imagens/imoveis/casa-122m2-09.webp', alt: 'Quarto com cama de casal' },
      { arquivo: 'imagens/imoveis/casa-122m2-10.webp', alt: 'Quarto com guarda-roupa embutido' },
      { arquivo: 'imagens/imoveis/casa-122m2-08.webp', alt: 'Banheiro com cuba de apoio e box' },
    ],
  },
  {
    id: 'imovel-rural-1723m2',
    nome: 'Casa 130 m² em terreno de 1.723 m²',
    local: 'Avenida Paraná · Charqueada de Baixo',
    preco: 'R$ 400 mil',
    resumo:
      'Terreno de 1.723 m², arborizado, com casa de 130 m² a terminar os acabamentos: sala de estar e de jantar, três quartos e dois banheiros. Aceita casa ou carro na negociação.',
    ficha: [
      '1.723 m² de terreno',
      '130 m² construídos',
      '3 quartos',
      '2 banheiros',
      'A terminar acabamentos',
      'Aceita casa ou carro',
    ],
    fotos: [
      { arquivo: 'imagens/imoveis/imovel-rural-1723m2-01.webp', alt: 'O terreno arborizado, com a casa aparecendo no fundo entre as árvores' },
      { arquivo: 'imagens/imoveis/imovel-rural-1723m2-02.webp', alt: 'Sala de estar com forro de madeira e janelas corridas' },
      { arquivo: 'imagens/imoveis/imovel-rural-1723m2-04.mp4', alt: 'Vídeo percorrendo o terreno e a casa' },
      { arquivo: 'imagens/imoveis/imovel-rural-1723m2-03.mp4', alt: 'Vídeo da frente da casa e da área arborizada' },
    ],
  },
  {
    id: 'casa-80m2-bela-vista',
    nome: 'Casa 80 m²',
    local: 'Rua Tenente Armando da Costa Moreira · Bela Vista',
    preco: 'R$ 150 mil',
    resumo:
      'Casa habitada e conservada, de piso de cerâmica e telhado de barro, em terreno de 330 m² com vaga na frente.',
    ficha: ['80 m² construídos', '330 m² de terreno', 'Bairro Bela Vista'],
    fotos: [
      { arquivo: 'imagens/imoveis/casa-80m2-bela-vista-01.webp', alt: 'Fachada com telhado de barro, vista da rua, com carro estacionado na frente' },
      { arquivo: 'imagens/imoveis/casa-80m2-bela-vista-05.webp', alt: 'Cozinha com armários brancos, mesa de quatro lugares e janela' },
      { arquivo: 'imagens/imoveis/casa-80m2-bela-vista-06.webp', alt: 'Corredor com aparador e tapete' },
      { arquivo: 'imagens/imoveis/casa-80m2-bela-vista-02.webp', alt: 'Quarto com cama de casal e cortina na janela' },
      { arquivo: 'imagens/imoveis/casa-80m2-bela-vista-04.webp', alt: 'Segundo quarto, com cama de casal e janela para o quintal' },
      { arquivo: 'imagens/imoveis/casa-80m2-bela-vista-03.webp', alt: 'Banheiro com box, cuba e vaso' },
      { arquivo: 'imagens/imoveis/casa-80m2-bela-vista-07.mp4', alt: 'Vídeo percorrendo os ambientes da casa' },
    ],
  },
  {
    id: 'casa-70m2-bela-vista',
    nome: 'Casa 70 m²',
    local: 'Rua Tenente Arnaldo Costa Moreira · Bela Vista',
    preco: 'R$ 150 mil',
    resumo:
      'Casa vazia e pronta para entrar, com piso granilite e quintal de terra nos fundos, em terreno de 330 m².',
    ficha: ['70 m² construídos', '330 m² de terreno', 'Desocupada'],
    fotos: [
      { arquivo: 'imagens/imoveis/casa-70m2-bela-vista-08.webp', alt: 'Fachada azul e branca com telhado metálico, vista da rua, com a placa de venda no gradil' },
      { arquivo: 'imagens/imoveis/casa-70m2-bela-vista-09.webp', alt: 'A mesma fachada em ângulo, mostrando a lateral' },
      { arquivo: 'imagens/imoveis/casa-70m2-bela-vista-01.webp', alt: 'Sala vazia, com piso granilite e porta azul na entrada' },
      { arquivo: 'imagens/imoveis/casa-70m2-bela-vista-10.webp', alt: 'Segundo ambiente vazio, com piso granilite' },
      { arquivo: 'imagens/imoveis/casa-70m2-bela-vista-02.webp', alt: 'Quarto vazio, com janela gradeada' },
      { arquivo: 'imagens/imoveis/casa-70m2-bela-vista-03.webp', alt: 'Quarto vazio com porta de madeira' },
      { arquivo: 'imagens/imoveis/casa-70m2-bela-vista-05.webp', alt: 'Ambiente de parede verde-escura e porta de madeira' },
      { arquivo: 'imagens/imoveis/casa-70m2-bela-vista-04.webp', alt: 'Banheiro pequeno, com box e vaso' },
      { arquivo: 'imagens/imoveis/casa-70m2-bela-vista-06.webp', alt: 'Área de serviço nos fundos, com tanque e vista para o quintal' },
      { arquivo: 'imagens/imoveis/casa-70m2-bela-vista-07.webp', alt: 'Quintal de terra nos fundos, com árvores e sol entrando' },
      { arquivo: 'imagens/imoveis/casa-70m2-bela-vista-11.mp4', alt: 'Vídeo percorrendo a casa desocupada' },
    ],
  },
];


export const chamada = {
  selo: 'Hora de mudar de endereço',
  titulo: 'Realize seus sonhos',
  texto:
    'Peça a avaliação gratuita do seu imóvel ou conte para a gente o que você procura. A Imbaú cuida da negociação, dos contratos e da regularização do começo ao fim.',
  botaoSecundario: 'Ver imóveis',
  botaoPrincipal: 'Falar no WhatsApp',
  imagem: 'imagens/imoveis/casa-210m2-06-capa.webp',
  imagemAlt: 'Varanda de arcos e pátio calçado de uma casa da carteira da Imbaú',
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
  nota: 5,
  quantidade: 3,
  fonte: 'avaliações no Google',
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
