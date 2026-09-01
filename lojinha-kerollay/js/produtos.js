/* =====================================================================
   CATÁLOGO DA LOJINHA KEROLLAY
   ---------------------------------------------------------------------
   Para adicionar / editar produtos, mexa SÓ neste arquivo.

   Campos de cada produto:
     id        -> texto único, sem espaço (usado pelo carrinho)
     nome      -> nome que aparece no card
     categoria -> "makes" | "kits" | "victoria" | "personalizados"
     preco     -> número (ex.: 64.99). Use null quando for sob encomenda:
                  o card troca o botão por "Fazer orçamento".
     desc      -> descrição curta
     detalhes  -> lista de bullets mostrada no card
     tag       -> selo opcional no canto da foto (ex.: "Mais vendido")
     img       -> caminho da foto (ex.: "img/cherry-bomb.jpg").
                  Deixe null para usar o desenho automático.
     video     -> opcional. Normalmente não precisa: o site procura
                  img/<id>.mp4 sozinho e, se achar, põe um botão de play
                  sobre a foto. Preencha só para apontar outro caminho.
   ===================================================================== */

const PRODUTOS = [
  {
    id: 'bruma-soft-matte',
    nome: 'Bruma Fixadora Soft Matte',
    categoria: 'makes',
    preco: 14.99,
    desc: 'Love Rain • 120ml. Prolonga a duração da maquiagem e mantém sua make perfeita por muito mais tempo.',
    detalhes: ['Fixa a maquiagem', 'Hidrata e refresca', 'Tonifica a pele', 'Controla a oleosidade'],
    tag: 'Queridinha',
    img: null
  },
  {
    id: 'gloss-cherry-bomb',
    nome: 'Gloss Cherry Bomb',
    categoria: 'makes',
    preco: 19.99,
    desc: 'Gloss labial 5g com cor, sabor e aroma de cereja. Acompanha mosquetão para pendurar na bolsa.',
    detalhes: ['Super hidratante', 'Aroma e sabor de cereja', 'Brilho laqueado', 'Ação antioxidante'],
    tag: 'Com mosquetão',
    img: null
  },
  {
    id: 'lip-bunny-triple',
    nome: 'Lip Bunny Triple',
    categoria: 'makes',
    preco: 19.99,
    desc: 'Gloss de chocolate com 3 camadas que vão te conquistar: branco com brilho, marrom médio e marrom intenso.',
    detalhes: ['3 cores em 1', 'Hidratação profunda', 'Brilho espelhado', 'Embalagem exclusiva'],
    tag: 'Novidade',
    img: null
  },
  {
    id: 'kit-wepink-framboesa',
    nome: 'Kit Body Splash WePink + Gloss de Framboesa',
    categoria: 'kits',
    preco: 64.99,
    desc: 'Tudo que você precisa para arrasar: body splash WePink com o gloss de framboesa.',
    detalhes: ['Fragrância deliciosa e marcante', 'Hidratação e perfumação', 'Perfeito para o dia a dia'],
    tag: 'Combo',
    img: null
  },

  /* --- Kits Victoria's Secret (body splash 250ml + hidratante 236ml) --- */
  {
    id: 'vs-bare-vanilla',
    nome: "Kit Victoria's Secret — Bare Vanilla",
    categoria: 'victoria',
    preco: 65.00,
    desc: 'Body splash 250ml + hidratante corporal 236ml. Baunilha delicada, quentinha e envolvente.',
    detalhes: ['Body splash 250ml', 'Hidratante 236ml', 'Partículas de brilho'],
    tag: null,
    img: null
  },
  {
    id: 'vs-love-spell',
    nome: "Kit Victoria's Secret — Love Spell",
    categoria: 'victoria',
    preco: 65.00,
    desc: 'Body splash 250ml + hidratante corporal 236ml. Frutas vermelhas com toque floral.',
    detalhes: ['Body splash 250ml', 'Hidratante 236ml', 'Fragrância marcante'],
    tag: 'Mais pedido',
    img: null
  },
  {
    id: 'vs-strawberries',
    nome: "Kit Victoria's Secret — Strawberries & Champagne",
    categoria: 'victoria',
    preco: 65.00,
    desc: 'Body splash 250ml + hidratante corporal 236ml. Morango com champanhe, doce e sofisticado.',
    detalhes: ['Body splash 250ml', 'Hidratante 236ml', 'Pele macia e perfumada'],
    tag: null,
    img: null
  },
  {
    id: 'vs-coconut-passion',
    nome: "Kit Victoria's Secret — Coconut Passion",
    categoria: 'victoria',
    preco: 65.00,
    desc: 'Body splash 250ml + hidratante corporal 236ml. Coco cremoso com baunilha.',
    detalhes: ['Body splash 250ml', 'Hidratante 236ml', 'Hidratação e perfumação'],
    tag: null,
    img: null
  },
  {
    id: 'vs-amber-romance',
    nome: "Kit Victoria's Secret — Amber Romance",
    categoria: 'victoria',
    preco: 65.00,
    desc: 'Body splash 250ml + hidratante corporal 236ml. Âmbar com frutas, quente e romântico.',
    detalhes: ['Body splash 250ml', 'Hidratante 236ml', 'Pele radiante'],
    tag: null,
    img: null
  },
  {
    id: 'vs-pure-seduction',
    nome: "Kit Victoria's Secret — Pure Seduction",
    categoria: 'victoria',
    preco: 65.00,
    desc: 'Body splash 250ml + hidratante corporal 236ml. Ameixa vermelha com fresia.',
    detalhes: ['Body splash 250ml', 'Hidratante 236ml', 'Fragrância marcante'],
    tag: null,
    img: null
  },

  /* --- Kits completos (confirme os preços antes de publicar) --- */
  {
    id: 'kit-nelo-puro-leite',
    nome: 'Kit Nelô Completo — Puro Leite',
    categoria: 'kits',
    preco: null,
    desc: 'Linha completa Puro Leite para deixar a pele macia e cheirosa da cabeça aos pés.',
    detalhes: ['1 Hidratante corporal 200g', '1 Sabonete corporal 200ml', '1 Esfoliante corporal 200g'],
    tag: 'Kit completo',
    img: null
  },
  {
    id: 'kit-nelo-doce-de-leite',
    nome: 'Kit Nelô Completo — Doce de Leite',
    categoria: 'kits',
    preco: null,
    desc: 'Linha completa Doce de Leite, com aquele cheirinho doce que fica o dia todo.',
    detalhes: ['1 Hidratante corporal 200g', '1 Sabonete corporal 200ml', '1 Esfoliante corporal 200g'],
    tag: 'Kit completo',
    img: null
  },
  {
    id: 'kit-carolina-herrera',
    nome: 'Kit Carolina Herrera — 212 VIP Black',
    categoria: 'kits',
    preco: null,
    desc: 'Kit completo com perfume, body splash e hidratante. Fragrância marcante e sofisticada.',
    detalhes: ['1 Hidratante corporal 250ml', '1 Body splash 100ml', '1 Perfume'],
    tag: 'Kit completo',
    img: null
  },
  {
    id: 'kit-asad-bourbon',
    nome: 'Kit Asad Bourbon',
    categoria: 'kits',
    preco: null,
    desc: 'Kit completo com perfume, body splash e hidratante. Amadeirado intenso e duradouro.',
    detalhes: ['1 Hidratante corporal 230ml', '1 Body splash 100ml', '1 Perfume'],
    tag: 'Kit completo',
    img: null
  },
  {
    id: 'kit-boticario-malbec',
    nome: 'Kit O Boticário — Malbec',
    categoria: 'kits',
    preco: null,
    desc: 'Kit completo Malbec com perfume, body splash e hidratante corporal.',
    detalhes: ['1 Hidratante corporal', '1 Body splash 100ml', '1 Perfume'],
    tag: 'Kit completo',
    img: null
  },

  /* --- Sob encomenda --- */
  {
    id: 'personalizados',
    nome: 'Personalizados para todas as ocasiões',
    categoria: 'personalizados',
    preco: null,
    desc: 'Canecas, garrafinhas, caixinhas e muito mais — com o nome, a cor e o tema que você escolher.',
    detalhes: ['Aniversário, casamento, chá', 'Nome e cores à sua escolha', 'Feito sob encomenda'],
    tag: 'Sob encomenda',
    img: null
  },
  {
    id: 'lembrancinhas',
    nome: 'Lembrancinhas',
    categoria: 'personalizados',
    preco: null,
    desc: 'Lembrancinhas criativas para a sua festa, do jeitinho que você imaginou.',
    detalhes: ['Quantidade sob consulta', 'Embalagem caprichada', 'Combinamos o prazo pelo WhatsApp'],
    tag: 'Sob encomenda',
    img: null
  },
  {
    id: 'acessorios',
    nome: 'Acessórios',
    categoria: 'personalizados',
    preco: null,
    desc: 'Acessórios e presentes criativos que sempre estão chegando. Chama no WhatsApp para ver as novidades.',
    detalhes: ['Novidades toda semana', 'Presentes criativos', 'Peças limitadas'],
    tag: null,
    img: null
  }
];

const CATEGORIAS = [
  { id: 'todos',          nome: 'Todos' },
  { id: 'makes',          nome: 'Makes' },
  { id: 'victoria',       nome: "Victoria's Secret" },
  { id: 'kits',           nome: 'Kits & Perfumaria' },
  { id: 'personalizados', nome: 'Personalizados' }
];
