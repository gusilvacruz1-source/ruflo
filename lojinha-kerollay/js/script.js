/* =====================================================================
   LOJINHA KEROLLAY — catálogo + carrinho + checkout no WhatsApp
   Mude os dados da loja em CONFIG (logo abaixo).
   ===================================================================== */

const CONFIG = {
  whatsapp: '5542988084236',          // 55 + DDD + número, só dígitos
  nomeLoja: 'Lojinha Kerollay',
  chaveStorage: 'carrinho-kerollay'
};

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const $  = (sel) => document.querySelector(sel);

const el = {
  filtros:    $('#filtros'),
  grid:       $('#gridProdutos'),
  gridVazio:  $('#gridVazio'),
  cartBtn:    $('#cartBtn'),
  cartCount:  $('#cartCount'),
  drawer:     $('#drawer'),
  overlay:    $('#drawerOverlay'),
  fechar:     $('#drawerFechar'),
  lista:      $('#cartLista'),
  vazio:      $('#drawerVazio'),
  total:      $('#cartTotal'),
  aviso:      $('#drawerAviso'),
  finalizar:  $('#btnFinalizar'),
  limpar:     $('#btnLimpar'),
  nome:       $('#campoNome'),
  entrega:    $('#campoEntrega'),
  toast:      $('#toast'),
  header:     $('#header'),
  navToggle:  $('#navToggle')
};

/* ---------------------------------------------------------------
   ESTADO
   --------------------------------------------------------------- */

let carrinho = carregarCarrinho();
let timerToast;
let categoriaAtiva = 'todos';
let ultimoFoco = null;

function carregarCarrinho() {
  try {
    const salvo = JSON.parse(localStorage.getItem(CONFIG.chaveStorage) || '[]');
    if (!Array.isArray(salvo)) return [];
    // descarta itens que não existem mais no catálogo
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

  const foto = document.createElement('div');
  foto.className = 'produto__foto';

  // Desenho de reserva: fica na tela ate uma foto de verdade carregar.
  const inicial = document.createElement('span');
  inicial.className = 'produto__inicial';
  inicial.textContent = p.nome.trim().charAt(0).toUpperCase();
  inicial.setAttribute('aria-hidden', 'true');

  const marca = document.createElement('span');
  marca.className = 'produto__marca';
  marca.textContent = CONFIG.nomeLoja;

  foto.append(inicial, marca);

  // A foto e procurada pelo id do produto: basta salvar o arquivo como
  // img/<id>.jpg (ou .png, .jpeg, .webp) que ela aparece sozinha. O campo
  // 'img' do produto, quando preenchido, tem prioridade sobre isso.
  const candidatas = p.img
    ? [p.img]
    : ['jpg', 'png', 'jpeg', 'webp'].map((ext) => `img/${p.id}.${ext}`);

  const img = document.createElement('img');
  img.alt = p.nome;
  img.loading = 'lazy';
  // Nada de hidden aqui: imagem em display:none com loading="lazy" nunca
  // chega a ser buscada. Ela nasce transparente e aparece ao carregar.

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
  nome.className = 'produto__nome';
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

  const rodape = document.createElement('div');
  rodape.className = 'produto__rodape';

  const preco = document.createElement('div');
  if (typeof p.preco === 'number') {
    preco.className = 'produto__preco';
    preco.innerHTML = `${brl.format(p.preco)}<small>à vista</small>`;
  } else {
    preco.className = 'produto__preco produto__preco--consultar';
    preco.textContent = 'Sob encomenda';
  }

  const add = document.createElement('button');
  add.type = 'button';
  add.className = 'produto__add' + (typeof p.preco === 'number' ? '' : ' produto__add--orcamento');
  add.textContent = typeof p.preco === 'number' ? 'Adicionar' : 'Fazer orçamento';
  add.addEventListener('click', () => adicionar(p.id));

  rodape.append(preco, add);
  corpo.appendChild(rodape);
  card.append(foto, corpo);

  return card;
}

/* ---------------------------------------------------------------
   CARRINHO
   --------------------------------------------------------------- */

function adicionar(id) {
  const item = carrinho.find((i) => i.id === id);
  if (item) item.qtd += 1;
  else carrinho.push({ id, qtd: 1 });

  salvarCarrinho();
  renderCarrinho();

  el.cartBtn.classList.remove('pulou');
  void el.cartBtn.offsetWidth;      // reinicia a animação
  el.cartBtn.classList.add('pulou');

  mostrarToast(`${acharProduto(id).nome} foi para o carrinho 💕`);
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

function temSobEncomenda() {
  return carrinho.some((item) => typeof acharProduto(item.id).preco !== 'number');
}

function renderCarrinho() {
  const totalItens = carrinho.reduce((s, i) => s + i.qtd, 0);

  el.cartCount.textContent = totalItens;
  el.cartCount.hidden = totalItens === 0;
  el.cartBtn.setAttribute('aria-label', `Abrir carrinho (${totalItens} ${totalItens === 1 ? 'item' : 'itens'})`);

  el.vazio.hidden = carrinho.length > 0;
  el.limpar.hidden = carrinho.length === 0;

  el.aviso.hidden = !temSobEncomenda();

  el.lista.innerHTML = '';

  carrinho.forEach((item) => {
    const p = acharProduto(item.id);
    const temPreco = typeof p.preco === 'number';

    const li = document.createElement('li');
    li.className = 'cart-item';

    const info = document.createElement('div');
    const nome = document.createElement('p');
    nome.className = 'cart-item__nome';
    nome.textContent = p.nome;

    const preco = document.createElement('p');
    preco.className = 'cart-item__preco';
    preco.textContent = temPreco ? `${brl.format(p.preco)} cada` : 'Valor a combinar';
    info.append(nome, preco);

    const btnRemover = document.createElement('button');
    btnRemover.type = 'button';
    btnRemover.className = 'cart-item__remover';
    btnRemover.innerHTML = '&times;';
    btnRemover.setAttribute('aria-label', `Remover ${p.nome} do carrinho`);
    btnRemover.addEventListener('click', () => remover(p.id));

    const qtd = document.createElement('div');
    qtd.className = 'qtd';

    const menos = document.createElement('button');
    menos.type = 'button';
    menos.textContent = '−';
    menos.setAttribute('aria-label', `Diminuir quantidade de ${p.nome}`);
    menos.addEventListener('click', () => mudarQtd(p.id, -1));

    const valor = document.createElement('span');
    valor.textContent = item.qtd;

    const mais = document.createElement('button');
    mais.type = 'button';
    mais.textContent = '+';
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
  const linhas = [`Olá, Kerollay! 💕 Vim pelo site e quero fazer um pedido:`, ''];

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

  if (temSobEncomenda()) {
    linhas.push('_Os itens sob encomenda entram no orçamento._');
  }

  const nome = el.nome.value.trim();
  linhas.push('');
  if (nome) linhas.push(`Meu nome: ${nome}`);
  linhas.push(`Entrega: ${el.entrega.value}`);

  return linhas.join('\n');
}

// O botao e um link de verdade, com o href refeito a cada mudanca do
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
   DRAWER, MENU E TOAST
   --------------------------------------------------------------- */

function abrirDrawer() {
  // esconde um aviso que ainda esteja na tela: no celular ele cobre
  // o botão de finalizar assim que o carrinho abre
  clearTimeout(timerToast);
  el.toast.classList.remove('aparece');

  ultimoFoco = document.activeElement;
  el.overlay.hidden = false;
  requestAnimationFrame(() => el.overlay.classList.add('aberto'));
  el.drawer.classList.add('aberto');
  el.drawer.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  el.fechar.focus();
}

function fecharDrawer() {
  el.overlay.classList.remove('aberto');
  el.drawer.classList.remove('aberto');
  el.drawer.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';

  setTimeout(() => { el.overlay.hidden = true; }, 300);
  if (ultimoFoco) ultimoFoco.focus();
}

function mostrarToast(texto) {
  // com o carrinho aberto o item já aparece na lista: o aviso só atrapalharia
  // (no celular ele cobre o botão de finalizar)
  if (el.drawer.classList.contains('aberto')) return;

  el.toast.textContent = texto;
  el.toast.classList.add('aparece');
  clearTimeout(timerToast);
  timerToast = setTimeout(() => el.toast.classList.remove('aparece'), 2600);
}

/* ---------------------------------------------------------------
   START
   --------------------------------------------------------------- */

el.cartBtn.addEventListener('click', abrirDrawer);
el.fechar.addEventListener('click', fecharDrawer);
el.overlay.addEventListener('click', fecharDrawer);
el.finalizar.addEventListener('click', (e) => {
  if (el.finalizar.getAttribute('aria-disabled') === 'true') e.preventDefault();
});

// nome e entrega entram na mensagem: o href precisa acompanhar
el.nome.addEventListener('input', atualizarLinkFinalizar);
el.entrega.addEventListener('change', atualizarLinkFinalizar);

el.limpar.addEventListener('click', () => {
  carrinho = [];
  salvarCarrinho();
  renderCarrinho();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && el.drawer.classList.contains('aberto')) fecharDrawer();
});

el.navToggle.addEventListener('click', () => {
  const aberto = el.header.classList.toggle('nav-aberto');
  el.navToggle.setAttribute('aria-expanded', String(aberto));
});

document.querySelectorAll('.nav a').forEach((link) => {
  link.addEventListener('click', () => {
    el.header.classList.remove('nav-aberto');
    el.navToggle.setAttribute('aria-expanded', 'false');
  });
});

$('#year').textContent = new Date().getFullYear();

montarFiltros();
montarGrid();
renderCarrinho();
