/* =====================================================================
   LOJINHA KEROLLAY — catálogo, carrinho e checkout no WhatsApp
   Dados da loja em CONFIG. Catálogo em js/produtos.js.
   ===================================================================== */

const CONFIG = {
  whatsapp: '5542988084236',          // 55 + DDD + número, só dígitos
  nomeLoja: 'Lojinha Kerollay',
  chaveStorage: 'carrinho-kerollay'
};

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const $ = (sel) => document.querySelector(sel);

const el = {
  filtros:   $('#filtros'),
  grid:      $('#gridProdutos'),
  gridVazio: $('#gridVazio'),
  cartBtn:   $('#cartBtn'),
  cartCount: $('#cartCount'),
  gaveta:    $('#drawer'),
  veu:       $('#drawerOverlay'),
  fechar:    $('#drawerFechar'),
  lista:     $('#cartLista'),
  vazio:     $('#drawerVazio'),
  total:     $('#cartTotal'),
  aviso:     $('#drawerAviso'),
  finalizar: $('#btnFinalizar'),
  limpar:    $('#btnLimpar'),
  nome:      $('#campoNome'),
  entrega:   $('#campoEntrega'),
  toast:     $('#toast')
};

let carrinho = carregarCarrinho();
let categoriaAtiva = 'todos';
let ultimoFoco = null;
let timerToast;

/* ---------------------------------------------------------------
   ÍCONES
   --------------------------------------------------------------- */

function icone(id, classe = 'ico') {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', classe);
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', `#${id}`);
  svg.appendChild(use);
  return svg;
}

/* ---------------------------------------------------------------
   CARRINHO: estado
   --------------------------------------------------------------- */

function carregarCarrinho() {
  try {
    const salvo = JSON.parse(localStorage.getItem(CONFIG.chaveStorage) || '[]');
    if (!Array.isArray(salvo)) return [];
    return salvo
      .filter((item) => PRODUTOS.some((p) => p.id === item.id))
      .map((item) => ({ id: item.id, qtd: Math.max(1, parseInt(item.qtd, 10) || 1) }));
  } catch {
    return [];
  }
}

function salvarCarrinho() {
  try {
    localStorage.setItem(CONFIG.chaveStorage, JSON.stringify(carrinho));
  } catch {
    /* navegação anônima ou storage bloqueado: o carrinho segue só na memória */
  }
}

const acharProduto = (id) => PRODUTOS.find((p) => p.id === id);

/* ---------------------------------------------------------------
   CATÁLOGO
   --------------------------------------------------------------- */

function montarFiltros() {
  el.filtros.innerHTML = '';

  CATEGORIAS.forEach((cat) => {
    const temProduto = cat.id === 'todos' || PRODUTOS.some((p) => p.categoria === cat.id);
    if (!temProduto) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'filtro' + (cat.id === categoriaAtiva ? ' ativo' : '');
    btn.textContent = cat.nome;
    btn.setAttribute('aria-pressed', String(cat.id === categoriaAtiva));
    btn.addEventListener('click', () => {
      categoriaAtiva = cat.id;
      montarFiltros();
      montarGrid();
    });
    el.filtros.appendChild(btn);
  });
}

function montarGrid() {
  const lista = categoriaAtiva === 'todos'
    ? PRODUTOS
    : PRODUTOS.filter((p) => p.categoria === categoriaAtiva);

  el.grid.innerHTML = '';
  el.gridVazio.hidden = lista.length > 0;
  lista.forEach((p) => el.grid.appendChild(criarCard(p)));
}

function criarCard(p) {
  const card = document.createElement('article');
  card.className = 'produto';

  // Envelope que vira duas colunas nos ladrilhos largos do bento.
  const interno = document.createElement('div');
  interno.className = 'produto__interno';

  const foto = document.createElement('div');
  foto.className = 'produto__foto';

  const inicial = document.createElement('span');
  inicial.className = 'produto__inicial';
  inicial.textContent = p.nome.trim().charAt(0).toUpperCase();
  inicial.setAttribute('aria-hidden', 'true');

  const marca = document.createElement('span');
  marca.className = 'produto__marca';
  marca.textContent = CONFIG.nomeLoja;

  foto.append(inicial, marca);

  // A foto é procurada pelo id do produto: basta salvar o arquivo como
  // img/<id>.jpg ou img/<id>.png que ela aparece sozinha. Só essas duas
  // extensões: cada uma que não existe custa uma requisição 404 no 4G da
  // cliente, e quatro delas por produto somavam 72 numa página de 18 itens.
  const candidatas = p.img
    ? [p.img]
    : ['jpg', 'png'].map((ext) => `img/${p.id}.${ext}`);

  const img = document.createElement('img');
  img.alt = p.nome;
  img.loading = 'lazy';

  let tentativa = 0;
  img.addEventListener('error', () => {
    tentativa += 1;
    if (tentativa < candidatas.length) img.src = candidatas[tentativa];
    else img.remove();
  });
  img.addEventListener('load', () => {
    img.classList.add('carregada');
    inicial.remove();
    marca.remove();
    prepararVideo(foto, img, p);
  });

  foto.appendChild(img);
  img.src = candidatas[0];

  if (p.tag) {
    const tag = document.createElement('span');
    tag.className = 'produto__tag';
    tag.textContent = p.tag;
    foto.appendChild(tag);
  }

  const corpo = document.createElement('div');
  corpo.className = 'produto__corpo';

  const nome = document.createElement('h3');
  nome.textContent = p.nome;

  const desc = document.createElement('p');
  desc.className = 'produto__desc';
  desc.textContent = p.desc;

  corpo.append(nome, desc);

  if (Array.isArray(p.detalhes) && p.detalhes.length) {
    const ul = document.createElement('ul');
    ul.className = 'produto__lista';
    p.detalhes.forEach((d) => {
      const li = document.createElement('li');
      li.textContent = d;
      ul.appendChild(li);
    });
    corpo.appendChild(ul);
  }

  const pe = document.createElement('div');
  pe.className = 'produto__pe';

  const preco = document.createElement('div');
  if (typeof p.preco === 'number') {
    preco.className = 'produto__preco';
    preco.textContent = brl.format(p.preco);
  } else {
    preco.className = 'produto__preco produto__preco--consultar';
    preco.textContent = 'Sob encomenda';
  }

  const add = document.createElement('button');
  add.type = 'button';
  add.className = 'produto__add' + (typeof p.preco === 'number' ? '' : ' produto__add--orcamento');
  add.textContent = typeof p.preco === 'number' ? 'Adicionar' : 'Fazer orçamento';
  add.addEventListener('click', () => adicionar(p.id));

  pe.append(preco, add);
  corpo.appendChild(pe);
  interno.append(foto, corpo);
  card.appendChild(interno);

  return card;
}

/* ---------------------------------------------------------------
   VÍDEO DO PRODUTO
   ---------------------------------------------------------------
   Salve img/<id>.mp4 e o card ganha um botão de play sobre a foto.
   A busca só acontece depois que a foto do produto carregou: produto
   sem foto não gera requisição nenhuma, então o catálogo vazio não
   paga por isso.
   --------------------------------------------------------------- */

function prepararVideo(foto, img, p) {
  const video = document.createElement('video');
  video.className = 'produto__video';
  video.src = p.video || `img/${p.id}.mp4`;
  video.preload = 'metadata';
  video.playsInline = true;
  video.controls = true;
  video.hidden = true;

  // Sem vídeo para este produto: some sem deixar rastro.
  video.addEventListener('error', () => video.remove(), { once: true });

  video.addEventListener('loadedmetadata', () => {
    const play = document.createElement('button');
    play.type = 'button';
    play.className = 'produto__play';
    play.setAttribute('aria-label', `Ver o vídeo de ${p.nome}`);
    play.appendChild(icone('i-play', 'ico'));

    const card = foto.closest('.produto');

    play.addEventListener('click', () => {
      img.hidden = true;
      play.hidden = true;
      video.hidden = false;
      card.classList.add('tocando');
      video.play().catch(() => {
        // Autoplay barrado: o vídeo fica visível com os controles.
      });
    });

    const voltarParaFoto = () => {
      video.hidden = true;
      img.hidden = false;
      play.hidden = false;
      card.classList.remove('tocando');
    };

    video.addEventListener('ended', voltarParaFoto);
    foto.appendChild(play);
  }, { once: true });

  foto.appendChild(video);
}

/* ---------------------------------------------------------------
   CARRINHO: ações
   --------------------------------------------------------------- */

function adicionar(id) {
  const item = carrinho.find((i) => i.id === id);
  if (item) item.qtd += 1;
  else carrinho.push({ id, qtd: 1 });

  salvarCarrinho();
  renderCarrinho();

  el.cartBtn.classList.remove('pulsa');
  void el.cartBtn.offsetWidth;      // reinicia a animação
  el.cartBtn.classList.add('pulsa');

  mostrarToast(`${acharProduto(id).nome} foi para o carrinho`);
}

function mudarQtd(id, delta) {
  const item = carrinho.find((i) => i.id === id);
  if (!item) return;

  item.qtd += delta;
  if (item.qtd < 1) carrinho = carrinho.filter((i) => i.id !== id);

  salvarCarrinho();
  renderCarrinho();
}

function remover(id) {
  carrinho = carrinho.filter((i) => i.id !== id);
  salvarCarrinho();
  renderCarrinho();
}

function totalCarrinho() {
  return carrinho.reduce((soma, item) => {
    const p = acharProduto(item.id);
    return soma + (typeof p.preco === 'number' ? p.preco * item.qtd : 0);
  }, 0);
}

const temSobEncomenda = () =>
  carrinho.some((item) => typeof acharProduto(item.id).preco !== 'number');

function renderCarrinho() {
  const totalItens = carrinho.reduce((s, i) => s + i.qtd, 0);

  el.cartCount.textContent = totalItens;
  el.cartCount.hidden = totalItens === 0;
  el.cartBtn.setAttribute('aria-label',
    `Abrir carrinho (${totalItens} ${totalItens === 1 ? 'item' : 'itens'})`);

  el.vazio.hidden = carrinho.length > 0;
  el.limpar.hidden = carrinho.length === 0;
  el.aviso.hidden = !temSobEncomenda();

  el.lista.innerHTML = '';

  carrinho.forEach((item) => {
    const p = acharProduto(item.id);
    const temPreco = typeof p.preco === 'number';

    const li = document.createElement('li');
    li.className = 'item';

    const info = document.createElement('div');
    const nome = document.createElement('p');
    nome.className = 'item__nome';
    nome.textContent = p.nome;

    const preco = document.createElement('p');
    preco.className = 'item__preco';
    preco.textContent = temPreco ? `${brl.format(p.preco)} cada` : 'Valor a combinar';
    info.append(nome, preco);

    const btnRemover = document.createElement('button');
    btnRemover.type = 'button';
    btnRemover.className = 'item__remover';
    btnRemover.appendChild(icone('i-x', 'ico ico--sm'));
    btnRemover.setAttribute('aria-label', `Remover ${p.nome} do carrinho`);
    btnRemover.addEventListener('click', () => remover(p.id));

    const qtd = document.createElement('div');
    qtd.className = 'qtd';

    const menos = document.createElement('button');
    menos.type = 'button';
    menos.appendChild(icone('i-menos', 'ico ico--sm'));
    menos.setAttribute('aria-label', `Diminuir quantidade de ${p.nome}`);
    menos.addEventListener('click', () => mudarQtd(p.id, -1));

    const valor = document.createElement('span');
    valor.textContent = item.qtd;

    const mais = document.createElement('button');
    mais.type = 'button';
    mais.appendChild(icone('i-mais', 'ico ico--sm'));
    mais.setAttribute('aria-label', `Aumentar quantidade de ${p.nome}`);
    mais.addEventListener('click', () => mudarQtd(p.id, 1));

    const subtotal = document.createElement('span');
    subtotal.className = 'qtd__subtotal';
    subtotal.textContent = temPreco ? brl.format(p.preco * item.qtd) : 'a combinar';

    qtd.append(menos, valor, mais, subtotal);
    li.append(info, btnRemover, qtd);
    el.lista.appendChild(li);
  });

  el.total.textContent = brl.format(totalCarrinho());
  atualizarLinkFinalizar();
}

/* ---------------------------------------------------------------
   CHECKOUT NO WHATSAPP
   --------------------------------------------------------------- */

function montarMensagem() {
  const linhas = ['Olá, Kerollay! 💕 Vim pelo site e quero fazer um pedido:', ''];

  carrinho.forEach((item, i) => {
    const p = acharProduto(item.id);
    const temPreco = typeof p.preco === 'number';

    linhas.push(`${i + 1}. ${p.nome}`);
    linhas.push(temPreco
      ? `   ${item.qtd} x ${brl.format(p.preco)} = ${brl.format(p.preco * item.qtd)}`
      : `   ${item.qtd} un. — sob encomenda (me passa o valor?)`);
  });

  linhas.push('');
  linhas.push(`*Total dos itens com preço: ${brl.format(totalCarrinho())}*`);
  if (temSobEncomenda()) linhas.push('_Os itens sob encomenda entram no orçamento._');

  const nome = el.nome.value.trim();
  linhas.push('');
  if (nome) linhas.push(`Meu nome: ${nome}`);
  linhas.push(`Entrega: ${el.entrega.value}`);

  return linhas.join('\n');
}

// O botão é um link de verdade, com o href refeito a cada mudança do
// carrinho: window.open cai em bloqueador de pop-up e dentro de iframe.
function atualizarLinkFinalizar() {
  if (!carrinho.length) {
    el.finalizar.removeAttribute('href');
    el.finalizar.setAttribute('aria-disabled', 'true');
    return;
  }
  el.finalizar.href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(montarMensagem())}`;
  el.finalizar.setAttribute('aria-disabled', 'false');
}

/* ---------------------------------------------------------------
   GAVETA E AVISO
   --------------------------------------------------------------- */

function abrirGaveta() {
  clearTimeout(timerToast);
  el.toast.classList.remove('aparece');

  ultimoFoco = document.activeElement;
  el.veu.hidden = false;
  requestAnimationFrame(() => el.veu.classList.add('aberto'));
  el.gaveta.classList.add('aberto');
  el.gaveta.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  el.fechar.focus();
}

function fecharGaveta() {
  el.veu.classList.remove('aberto');
  el.gaveta.classList.remove('aberto');
  el.gaveta.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';

  setTimeout(() => { el.veu.hidden = true; }, 340);
  if (ultimoFoco) ultimoFoco.focus();
}

function mostrarToast(texto) {
  if (el.gaveta.classList.contains('aberto')) return;

  el.toast.textContent = texto;
  el.toast.classList.add('aparece');
  clearTimeout(timerToast);
  timerToast = setTimeout(() => el.toast.classList.remove('aparece'), 2600);
}

/* ---------------------------------------------------------------
   START
   --------------------------------------------------------------- */

el.cartBtn.addEventListener('click', abrirGaveta);
el.fechar.addEventListener('click', fecharGaveta);
el.veu.addEventListener('click', fecharGaveta);

el.finalizar.addEventListener('click', (e) => {
  if (el.finalizar.getAttribute('aria-disabled') === 'true') e.preventDefault();
});

el.nome.addEventListener('input', atualizarLinkFinalizar);
el.entrega.addEventListener('change', atualizarLinkFinalizar);

el.limpar.addEventListener('click', () => {
  carrinho = [];
  salvarCarrinho();
  renderCarrinho();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && el.gaveta.classList.contains('aberto')) fecharGaveta();
});

$('#year').textContent = new Date().getFullYear();

montarFiltros();
montarGrid();
renderCarrinho();
