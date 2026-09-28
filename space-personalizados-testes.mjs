/* ============================================================================
   SPACE PERSONALIZADOS — suíte de regressão
   ----------------------------------------------------------------------------
   Mora FORA de space-personalizados/ de propósito: aquela pasta vai inteira
   para o GitHub Pages, e teste não é coisa de publicar.

   Cada bug que já apareceu no site virou uma asserção numerada. O número
   aparece nos comentários do js/script.js e do README, para dar para achar
   o porquê de cada trecho.

   Rodar:
     cd space-personalizados && python3 -m http.server 8099 &
     node space-personalizados-testes.mjs

   Precisa do pacote `playwright` com Chromium. Variáveis opcionais:
     SITE_URL        outro endereço (ex.: uma cópia antiga, para ver o teste falhar)
     CHROMIUM_PATH   Chromium fora do lugar padrão do Playwright

   Sai com código 1 se alguma asserção falhar.
   ========================================================================== */
import { chromium } from 'playwright';
const URL=process.env.SITE_URL || 'http://localhost:8099/index.html';
const b = await chromium.launch({
  // CHROMIUM_PATH aponta para um Chromium fora do lugar padrão do Playwright
  ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
  args:['--no-sandbox']
});
const errs=[]; const ok=[], bad=[];
const T=(n,c)=> c?ok.push(n):bad.push(n);

const p = await b.newPage({ viewport:{width:1440,height:900} });
p.on('pageerror', e=>errs.push(e.message));

// [1] carrinho com id morto no localStorage
await p.goto(URL,{waitUntil:'domcontentloaded'});
await p.evaluate(()=>localStorage.setItem('space.cart', JSON.stringify([{id:'produto-que-nao-existe',qty:10},{id:'copo-473',qty:20}])));
await p.reload({waitUntil:'domcontentloaded'});
await p.waitForFunction(()=>document.querySelector('#preloader')?.classList.contains('is-done'),{timeout:40000});
T('[1] carrinho com id morto nao trava', await p.evaluate(()=>!document.body.classList.contains('is-locked')));
T('[1] item valido sobrevive', await p.evaluate(()=>document.querySelector('#cartCount').textContent==='1'));
await p.evaluate(()=>localStorage.clear());

// [3] preco em destaque = o da primeira faixa (10 pecas), nao o do melhor lote
await p.reload({waitUntil:'domcontentloaded'});
await p.waitForFunction(()=>document.querySelector('#preloader')?.classList.contains('is-done'),{timeout:40000});
await p.waitForTimeout(400);
const chav = await p.evaluate(()=>{
  const c=[...document.querySelectorAll('#catalogGrid .ccard')].find(x=>x.dataset.id==='chaveiro-abridor');
  return { preco:c.querySelector('.ccard__price').textContent, nota:c.querySelector('.ccard__min').textContent };
});
T('[3] chaveiro mostra R$ 4,00 de 10 pecas, nao R$ 2,25 de 500', chav.preco.includes('4,00'));
T('[3] volume vira nota, nao manchete', chav.nota.includes('2,25'));

// [4] link de categoria do rodape cai no catalogo ja filtrado
// ([6][8][12] eram da vitrine "Novos Brindes", que saiu do site)
await p.evaluate(()=>document.querySelector('.footer [data-cjump="garrafas"]').click());
await p.waitForTimeout(600);
const filtro = await p.evaluate(()=>({
  aba: document.querySelector('#catalogFilters [data-cfilter="garrafas"]').getAttribute('aria-selected'),
  cats: [...new Set([...document.querySelectorAll('#catalogGrid .ccard')].map(c=>c.dataset.cat))]
}));
T('[4] rodape filtra o catalogo ('+filtro.cats.join(',')+')', filtro.aba==='true' && filtro.cats.length===1 && filtro.cats[0]==='garrafas');
await p.evaluate(()=>document.querySelector('#catalogFilters [data-cfilter="todos"]').click());
await p.waitForTimeout(400);

// [7] stepper com campo vazio
const st = await p.evaluate(()=>{
  const c=document.querySelector('#catalogGrid .ccard'); const i=c.querySelector('input');
  i.value=''; c.querySelector('[data-step="1"]').click();
  return i.value;
});
T('[7] stepper sobrevive a campo vazio (='+st+')', st!=='' && !isNaN(+st));

// [5] contador dispara uma vez so quando a secao entra em cena
await p.evaluate(()=>document.querySelector('#historia').scrollIntoView({block:'center'}));
let contou=true;
try{ await p.waitForFunction(()=>document.querySelector('#contaProdutos').dataset.counted==='1',{timeout:8000}); }
catch(e){ contou=false; }
T('[5] contador marcado uma vez', contou);


// [13] scroll-spy: o link acende conforme a secao, e volta ao subir
await p.evaluate(()=>document.querySelector('#historia').scrollIntoView({block:'start'}));
let foi=true;
try{ await p.waitForFunction(()=>document.querySelector('#navMenu a[href="#historia"]').classList.contains('is-active'),{timeout:8000}); }
catch(e){ foi=false; }
T('[13] NOSSA HISTORIA acende na secao dela', foi);
await p.evaluate(()=>document.querySelector('#catalogo').scrollIntoView({block:'start'}));
let voltou=true;
try{ await p.waitForFunction(()=>document.querySelector('#navMenu a[href="#catalogo"]').classList.contains('is-active'),{timeout:8000}); }
catch(e){ voltou=false; }
T('[13] CATALOGO reacende ao voltar', voltou);

// [17] o contador de produtos chega ao tamanho do catalogo
await p.evaluate(async()=>{ for(let y=0;y<document.body.scrollHeight;y+=400){ scrollTo(0,y); await new Promise(r=>setTimeout(r,60)); } });
await p.waitForTimeout(1800);
const cont = await p.evaluate(()=>({ txt:document.querySelector('#contaProdutos').textContent, n:SPACE.PRODUCTS.length }));
T('[17] contador de produtos chega a '+cont.n+' (mostra '+cont.txt+')', cont.txt===String(cont.n));
// [18] foto de produto nao pode ladrilhar (o atalho background: zera o no-repeat)
const rep = await p.evaluate(()=>[...document.querySelectorAll('.has-photo')]
  .map(e=>getComputedStyle(e).backgroundRepeat).filter(v=>!v.startsWith('no-repeat')));
T('[18] nenhuma foto ladrilhada ('+rep.length+' com repeat)', rep.length===0);

// [19] o menu de tela cheia tem que ficar FORA da tela quando fechado
const mm = await b.newPage({ viewport:{width:390,height:844} });
await mm.goto(URL,{waitUntil:'domcontentloaded'});
await mm.waitForFunction(()=>document.querySelector('#preloader')?.classList.contains('is-done'),{timeout:40000});
await mm.evaluate(()=>scrollTo(0,3000)); await mm.waitForTimeout(600);
const menu = await mm.evaluate(()=>{
  const m=document.querySelector('#navMenu');
  return { top:Math.round(m.getBoundingClientRect().top), vh:innerHeight };
});
T('[19] menu fechado sai da tela (top='+menu.top+')', menu.top <= -menu.vh + 2);
// [20] e o botao de menu continua clicavel
T('[20] botao de menu visivel no estreito', await mm.evaluate(()=>{
  const r=document.querySelector('#burger').getBoundingClientRect();
  return r.width>0 && r.right <= innerWidth + 1 && r.left >= 0;
}));
await mm.close();

// [21] nenhum painel de foto pode passar da largura do proprio card
const vaza = await p.evaluate(()=>{
  const sels=['#catalogGrid .ccard'];
  const fora=[];
  for (const s of sels) for (const c of document.querySelectorAll(s)){
    const m=c.querySelector('.ccard__media'); if(!m) continue;
    const a=c.getBoundingClientRect(), b=m.getBoundingClientRect();
    if (b.width > a.width + 1) fora.push(s+' '+Math.round(b.width-a.width)+'px');
  }
  return fora;
});
T('[21] painel nao estoura o card ('+vaza.length+' casos)', vaza.length===0);

// [22] preco unitario nao pode ser lido como total de lote
const pu = await p.evaluate(()=>{
  const c=[...document.querySelectorAll('#catalogGrid .ccard')].find(x=>x.dataset.id==='copo-473');
  return { rotulo:c.querySelector('.ccard__from').textContent.trim(),
           preco:c.querySelector('.ccard__price').textContent.trim(),
           nota:c.querySelector('.ccard__min').textContent.trim() };
});
T('[22] o rotulo diz a partir de quantas pecas ('+pu.rotulo+')', /a partir de 10 pe/i.test(pu.rotulo));
T('[22] o preco carrega /un colado', pu.preco.includes('/un'));
T('[22] o volume vira nota embaixo', /22,90/.test(pu.nota));
// e a conta do orcamento continua batendo. Pagina limpa: os testes
// anteriores ja deixaram itens no carrinho desta sessao.
await p.evaluate(()=>localStorage.clear());
await p.reload({waitUntil:'domcontentloaded'});
await p.waitForFunction(()=>document.querySelector('#preloader')?.classList.contains('is-done'),{timeout:40000});
await p.waitForTimeout(500);
await p.evaluate(()=>[...document.querySelectorAll('#catalogGrid .ccard')].find(x=>x.dataset.id==='copo-473').querySelector('[data-add]').click());
await p.waitForTimeout(500);
const soma = await p.evaluate(()=>document.querySelector('#drawerTotal').textContent);
T('[22] ADICIONAR poe 10 pecas a 24,90, nao o preco de lote (deu '+soma+')', soma.includes('249,00'));

// [23] o campo comeca em 10, anda de um em um e ainda desce abaixo de 10
// (menos de 10 pecas nao tem preco no site, mas continua dando para pedir)
const un = await p.evaluate(async ()=>{
  const c=[...document.querySelectorAll('#catalogGrid .ccard')].find(x=>x.dataset.id==='copo-473');
  const inp=c.querySelector('input[type=number]');
  const partida = inp.value;
  c.querySelector('[data-step="1"]').click();          // 10 -> 11, nao 10 -> 20
  const subiu = inp.value;
  for (let k=0;k<12;k++) c.querySelector('[data-step="-1"]').click();   // nao pode passar de 1
  return { partida, subiu, piso: inp.value, minAttr: inp.getAttribute('min') };
});
T('[23] o campo comeca em 10 (veio '+un.partida+')', un.partida === '10');
T('[23] o + anda de um em um (10 -> '+un.subiu+')', un.subiu === '11');
T('[23] o - desce ate 1 e para (parou em '+un.piso+')', un.piso === '1');
T('[23] o campo aceita 1 como minimo', un.minAttr === '1');

// [24] a abertura e a nebulosa com a marca no meio, e o copo saiu de verdade
await p.evaluate(()=>scrollTo(0,0));
await p.waitForTimeout(600);
const cap = await p.evaluate(()=>{
  const sec = document.querySelector('#cup'), m = document.querySelector('#cupMarca');
  const r = m ? m.getBoundingClientRect() : null;
  return {
    canvas: document.querySelectorAll('#cup canvas').length,
    motor: typeof window.Cup3D,
    marcaCarregou: !!(m && m.naturalWidth > 0),
    larguraMarca: r ? Math.round(r.width) : 0,
    // desvio do centro horizontal, em px
    fora: r ? Math.round(Math.abs((r.left + r.right) / 2 - innerWidth / 2)) : 999,
    telas: sec ? +(sec.offsetHeight / innerHeight).toFixed(2) : 0,
    fundo: /fundo-copo/.test(getComputedStyle(document.querySelector('#cupStage')).backgroundImage)
  };
});
T('[24] nao sobrou canvas na abertura ('+cap.canvas+')', cap.canvas === 0);
T('[24] o motor do copo nao e mais carregado ('+cap.motor+')', cap.motor === 'undefined');
T('[24] a marca carregou ('+cap.larguraMarca+'px)', cap.marcaCarregou && cap.larguraMarca > 120);
T('[24] a marca esta no meio (desvio '+cap.fora+'px)', cap.fora <= 2);
T('[24] o papel de parede continua', cap.fundo);
T('[24] a abertura e uma tela, nao quatro e meia ('+cap.telas+')', cap.telas > 0.9 && cap.telas <= 1.05);

// [25] seletor de cor. O produto e injetado so na memoria da pagina: nao ha
// item inventado no catalogo de verdade so para o teste existir.
await p.evaluate(()=>{
  // limpar o localStorage nao esvazia o carrinho em memoria desta sessao:
  // os testes anteriores ja deixaram itens la, e eles entrariam na soma
  [...SPACE.Cart.items].forEach(i => SPACE.Cart.remove(i.cor ? i.id+'|'+i.cor : i.id));
  localStorage.clear();
  SPACE.PRODUCTS.push({ id:'teste-cor', name:'Produto de Teste', cat:'escritorio', ph:'caneta',
    desc:'Injetado so para o teste do seletor de cor.',
    cores:[{id:'preto',nome:'Preto',hex:'#26262a'},{id:'azul',nome:'Azul',hex:'#2b4a6f'}],
    tiers:[[10,10.00]] });
  SPACE.renderCatalog('todos');
});
await p.waitForTimeout(400);
const c0 = await p.evaluate(()=>{
  const c=document.querySelector('.ccard[data-id="teste-cor"]');
  return { bolinhas:c.querySelectorAll('.swatch').length, cor:c.dataset.cor,
           foto:c.querySelector('.ccard__media').dataset.src,
           rotulo:c.querySelector('.ccard__corNome').textContent };
});
T('[25] as bolinhas aparecem ('+c0.bolinhas+')', c0.bolinhas === 2);
T('[25] comeca na primeira cor ('+c0.cor+')', c0.cor === 'preto');
T('[25] a foto segue a cor', c0.foto === 'assets/produtos/teste-cor-preto.webp');
await p.evaluate(()=>document.querySelector('.ccard[data-id="teste-cor"] .swatch[data-cor="azul"]').click());
await p.waitForTimeout(300);
const c1 = await p.evaluate(()=>{
  const c=document.querySelector('.ccard[data-id="teste-cor"]');
  return { cor:c.dataset.cor, foto:c.querySelector('.ccard__media').dataset.src,
           rotulo:c.querySelector('.ccard__corNome').textContent,
           marcadas:[...c.querySelectorAll('.swatch')].filter(b=>b.getAttribute('aria-pressed')==='true').length };
});
T('[25] clicar troca a cor e a foto', c1.cor==='azul' && c1.foto==='assets/produtos/teste-cor-azul.webp');
T('[25] o nome da cor acompanha ('+c1.rotulo+')', c1.rotulo === 'Azul');
T('[25] so uma bolinha fica marcada ('+c1.marcadas+')', c1.marcadas === 1);
// duas cores do mesmo produto sao DUAS linhas, nao uma com o dobro
await p.evaluate(()=>document.querySelector('.ccard[data-id="teste-cor"] [data-add]').click());
await p.waitForTimeout(250);
await p.evaluate(()=>document.querySelector('.ccard[data-id="teste-cor"] .swatch[data-cor="preto"]').click());
await p.waitForTimeout(200);
await p.evaluate(()=>document.querySelector('.ccard[data-id="teste-cor"] [data-add]').click());
await p.waitForTimeout(400);
const c2 = await p.evaluate(()=>({
  chaves:[...document.querySelectorAll('.ditem')].map(d=>d.dataset.chave),
  total:document.querySelector('#drawerTotal').textContent,
  zap:decodeURIComponent(document.querySelector('#drawerSend').href.split('text=')[1]||'')
}));
T('[25] cada cor vira sua linha ('+c2.chaves.join(', ')+')',
  c2.chaves.includes('teste-cor|azul') && c2.chaves.includes('teste-cor|preto'));
T('[25] a soma nao junta as duas ('+c2.total+')', c2.total.includes('200,00'));
T('[25] a cor vai na mensagem do WhatsApp',
  /Produto de Teste · Azul/.test(c2.zap) && /Produto de Teste · Preto/.test(c2.zap));
// e mexer numa nao pode mexer na outra
await p.evaluate(()=>document.querySelector('.ditem[data-chave="teste-cor|azul"] [data-q="1"]').click());
await p.waitForTimeout(350);
const c3 = await p.evaluate(()=>({
  azul:document.querySelector('.ditem[data-chave="teste-cor|azul"] .ditem__qty b').textContent,
  preto:document.querySelector('.ditem[data-chave="teste-cor|preto"] .ditem__qty b').textContent
}));
T('[25] mexer numa cor nao mexe na outra (azul '+c3.azul+', preto '+c3.preto+')',
  c3.azul === '11' && c3.preto === '10');

// [26] produto sem preco: sai por orcamento, sem virar R$ 0,00 em lugar nenhum
await p.evaluate(()=>{
  [...SPACE.Cart.items].forEach(i => SPACE.Cart.remove(i.cor ? i.id+'|'+i.cor : i.id));
  localStorage.clear();
  SPACE.PRODUCTS.push({ id:'teste-consulta', name:'Produto Sob Consulta', cat:'copos', ph:'copo',
    desc:'Injetado so para o teste de produto sem preco.' });   // sem tiers
  SPACE.renderCatalog('todos');
});
await p.waitForTimeout(400);
const sc = await p.evaluate(()=>{
  const c=document.querySelector('.ccard[data-id="teste-consulta"]');
  return { preco:c.querySelector('.ccard__price').textContent.trim(),
           nota:c.querySelector('.ccard__min').textContent.trim(),
           faixas:c.querySelectorAll('li').length,
           selo:c.querySelector('.tag')?.textContent||'' };
});
T('[26] o card diz sob consulta ('+sc.preco+')', /sob consulta/i.test(sc.preco));
T('[26] manda para o WhatsApp', /whatsapp/i.test(sc.nota));
T('[26] nao inventa tabela de faixas ('+sc.faixas+')', sc.faixas === 0);
T('[26] nao inventa selo de desconto', sc.selo === '');
// no orcamento: entra, mas nao vira zero reais
await p.evaluate(()=>document.querySelector('.ccard[data-id="teste-consulta"] [data-add]').click());
await p.waitForTimeout(300);
await p.evaluate(()=>[...document.querySelectorAll('#catalogGrid .ccard')].find(x=>x.dataset.id==='copo-473').querySelector('[data-add]').click());
await p.waitForTimeout(400);
const orc = await p.evaluate(()=>({
  linha:document.querySelector('.ditem[data-chave="teste-consulta"] .ditem__price').textContent.trim(),
  meta:document.querySelector('.ditem[data-chave="teste-consulta"] .ditem__meta').textContent.trim(),
  total:document.querySelector('#drawerTotal').textContent.trim(),
  nota:document.querySelector('#drawerNota').textContent.trim(),
  zap:decodeURIComponent(document.querySelector('#drawerSend').href.split('text=')[1]||'')
}));
T('[26] a linha nao mostra R$ 0,00 ('+orc.linha+')', /combinar/i.test(orc.linha));
T('[26] o unitario tambem nao ('+orc.meta+')', /sob consulta/i.test(orc.meta));
T('[26] o total soma so o que tem preco ('+orc.total+')', orc.total.includes('249,00'));
T('[26] e avisa do item sob consulta ('+orc.nota+')', /sob consulta/i.test(orc.nota));
T('[26] a mensagem marca o item como a combinar',
  /Produto Sob Consulta: 10 uni × a combinar/.test(orc.zap));
T('[26] a mensagem separa a estimativa do que fica para orcamento',
  /itens com preço em tabela/i.test(orc.zap) && /fica para orçamento/i.test(orc.zap));

// [27] foto de detalhe: existe, so baixa quando alguem abre, e alterna
await p.evaluate(()=>{
  SPACE.PRODUCTS.push({ id:'caneca-termica-350', name:'Caneca de Teste com Detalhe', cat:'copos', ph:'caneca',
    desc:'Injetada so para o teste da foto de detalhe.', detalhe:true, tiers:[[1,59.90]] });
  SPACE.renderCatalog('todos');
});
await p.waitForTimeout(400);
const d0 = await p.evaluate(()=>{
  const c=document.querySelector('.ccard[data-id="caneca-termica-350"]');
  const capa=c.querySelector('.ccard__detalhe');
  return { botao:!!c.querySelector('[data-detalhe]'),
           semImagem:!capa.style.backgroundImage,
           naoBaixou:!capa.dataset.pronta,
           aberto:capa.classList.contains('is-on') };
});
T('[27] o card ganha o botao de detalhe', d0.botao);
T('[27] a camada nasce vazia', d0.semImagem && d0.aberto === false);
T('[27] e nada foi baixado antes de abrir', d0.naoBaixou);
// um produto SEM detalhe nao pode ganhar botao
T('[27] produto sem detalhe nao ganha botao',
  await p.evaluate(()=>!document.querySelector('.ccard[data-id="copo-473"] [data-detalhe]')));
await p.evaluate(()=>document.querySelector('.ccard[data-id="caneca-termica-350"] [data-detalhe]').click());
await p.waitForTimeout(900);
const d1 = await p.evaluate(()=>{
  const c=document.querySelector('.ccard[data-id="caneca-termica-350"]');
  const capa=c.querySelector('.ccard__detalhe');
  return { aberto:capa.classList.contains('is-on'),
           temImagem:/detalhe\.webp/.test(capa.style.backgroundImage||''),
           pressed:c.querySelector('[data-detalhe]').getAttribute('aria-pressed') };
});
T('[27] abrir mostra a camada', d1.aberto);
T('[27] e ai sim a imagem entra', d1.temImagem);
T('[27] o botao anuncia o estado', d1.pressed === 'true');
await p.evaluate(()=>document.querySelector('.ccard[data-id="caneca-termica-350"] [data-detalhe]').click());
await p.waitForTimeout(300);
const d2 = await p.evaluate(()=>{
  const c=document.querySelector('.ccard[data-id="caneca-termica-350"]');
  return { aberto:c.querySelector('.ccard__detalhe').classList.contains('is-on'),
           pressed:c.querySelector('[data-detalhe]').getAttribute('aria-pressed') };
});
T('[27] clicar de novo fecha', !d2.aberto && d2.pressed === 'false');


// [28] catalogo: produto COM COR tem que pedir <id>-<cor>.webp, e nenhuma
// foto pode dar 404. ([29] era das abas de "Mais desejados", que saiu.)
{
  const q = await b.newPage({ viewport:{width:1440,height:900} });
  const f404=[]; q.on('response', r=>{ if(r.status()>=400) f404.push(r.url().split('/').pop()); });
  await q.goto(URL,{waitUntil:'domcontentloaded'});
  await q.waitForFunction(()=>document.querySelector('#preloader')?.classList.contains('is-done'),{timeout:40000});
  await q.evaluate(()=>document.querySelector('#catalogo').scrollIntoView());
  for(let i=0;i<14;i++){ await q.mouse.wheel(0,900); await q.waitForTimeout(150); }
  await q.waitForTimeout(800);
  const vistos = await q.evaluate(()=>[...document.querySelectorAll('#catalogGrid .ccard__media')].map(m=>m.dataset.src));
  const semArquivo = await q.evaluate(async lst=>{
    const out=[]; for (const u of lst){ const r=await fetch(u,{method:'HEAD'}); if(!r.ok) out.push(u); } return out;
  }, vistos);
  T('[28] catalogo pede fotos que existem ('+vistos.length+' cards, '+semArquivo.length+' faltando)', semArquivo.length===0);
  T('[28] canecas com cor aparecem no catalogo', vistos.some(u=>/caneca-termica-350-/.test(u)));
  T('[28] nenhum 404 de foto', !f404.some(x=>/\.webp/.test(x)));

  // [30] WhatsApp direto de item sob consulta
  const zap = await q.evaluate(()=>{
    const a=document.querySelector('.ccard[data-id="caderneta"] [data-wa]');
    a.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));
    return decodeURIComponent(a.href.split('text=')[1]||'');
  });
  T('[30] WhatsApp de item sob consulta nao manda R$ 0,00', !/0,00/.test(zap) && /Caderneta/.test(zap));

  // [31] layout: icone do orcamento e item da gaveta tinham 0x0
  await q.evaluate(()=>{ SPACE.Cart.add('copo-473', 3); });
  T('[31] icone do orcamento tem tamanho', await q.evaluate(()=>document.querySelector('#cartBtn svg').getBoundingClientRect().width>0));
  await q.evaluate(()=>document.querySelector('#catalogo').scrollIntoView());
  await q.keyboard.press('Tab');
  await q.evaluate(()=>document.querySelector('#cartBtn').focus());
  await q.keyboard.press('Enter');
  await q.waitForTimeout(800);
  const gav = await q.evaluate(()=>{
    const t=document.querySelector('.ditem__thumb').getBoundingClientRect(); const qq=document.querySelector('.ditem__qty');
    return { thumb:t.width, cabe: qq.scrollWidth <= qq.clientWidth + 1,
             foco: document.activeElement.getAttribute('aria-label'), mainInert: document.querySelector('#top').inert,
             navInert: document.querySelector('#nav').inert };
  });
  T('[31] miniatura da gaveta aparece', gav.thumb > 0);
  T('[31] seletor de quantidade cabe na pilula', gav.cabe);
  // [32] foco da gaveta
  T('[32] abrir leva o foco para o X', gav.foco === 'Fechar');
  T('[32] o resto da pagina fica inerte', gav.mainInert && gav.navInert);
  await q.keyboard.press('Escape'); await q.waitForTimeout(300);
  T('[32] Esc devolve o foco ao botao', await q.evaluate(()=>document.activeElement.id==='cartBtn' && !document.querySelector('#top').inert));
  T('[32] gaveta fechada nao recebe Tab', await q.evaluate(()=>document.querySelector('#drawer').inert));

  // [33] numeros do texto saem do catalogo
  const txt = await q.evaluate(()=>{
    const n=SPACE.PRODUCTS.length;
    const conta=[...document.querySelectorAll('[data-conta]')].every(el=>{
      const k=el.dataset.conta; const esp = k==='produtos'? n : SPACE.PRODUCTS.filter(p=>p.cat===k).length;
      return parseInt(el.textContent,10)===esp; });
    return { conta, n, corpo: document.body.innerText,
             minimo: [...document.querySelectorAll('[data-minimo]')].map(el=>el.textContent) };
  });
  T('[33] toda contagem no texto bate com o catalogo', txt.conta);
  T('[33] o "a partir de" do texto sai da configuracao ('+txt.minimo.join(',')+')',
    txt.minimo.length>0 && txt.minimo.every(x=>x==='10'));
  T('[33] nenhum texto promete "sem pedido minimo" ou "uma peca so"', !/sem pedido m[ií]nimo|uma pe[çc]a s[óo]/i.test(txt.corpo));
  T('[33] sumiram "Dezoito", "18 ITENS" e o copo a 29,90', !/Dezoito|18 ITENS|R\$ 29,90 a unidade/i.test(txt.corpo));

  // [34] previa de link: endereco absoluto e arquivo existe
  const og = await q.evaluate(async()=>{
    const m=document.querySelector('meta[property="og:image"]');
    if (!m) return { absoluto:false, existe:false };
    const u=m.content;
    // tanto faz o endereco (Netlify ou GitHub Pages): o que importa e o
    // caminho do arquivo dentro do site existir
    const local = u.replace(/^https:\/\/[^/]+\/(ruflo\/space-personalizados\/)?/,'');
    const r = await fetch(local,{method:'HEAD'});
    return { absoluto: /^https:\/\//.test(u), existe: r.ok };
  });
  T('[34] og:image e absoluto', og.absoluto);
  T('[34] e o arquivo existe', og.existe);
  await q.close();
}


// [35] cor com foto compartilhada (campo `foto`): as duas bolinhas mostram a
// mesma foto, que existe, e a cor escolhida continua indo para o orcamento
{
  const q = await b.newPage({ viewport:{width:1440,height:900} });
  await q.goto(URL,{waitUntil:'domcontentloaded'});
  await q.waitForFunction(()=>document.querySelector('#preloader')?.classList.contains('is-done'),{timeout:40000});
  const r = await q.evaluate(async()=>{
    localStorage.clear();
    const alvo = SPACE.PRODUCTS.find(p=>p.cores && p.cores.some(c=>c.foto));
    if (!alvo) return { semProduto:true };
    const card=document.querySelector(`.ccard[data-id="${alvo.id}"]`);
    const fotos=[];
    for (const b of card.querySelectorAll('.swatch')) { b.click(); fotos.push(card.querySelector('.ccard__media').dataset.src); }
    const ult=alvo.cores[alvo.cores.length-1];
    card.querySelector('[data-add]').click();
    const it=SPACE.Cart.items[0];
    const ok=(await fetch(fotos[0],{method:'HEAD'})).ok;
    return { fotos, ok, cor: it && it.cor, esperada: ult.id, msg: SPACE.Cart.message() , nomeCor: ult.nome };
  });
  if (r.semProduto) T('[35] ha produto com foto compartilhada', false);
  else {
    T('[35] todas as cores apontam para a mesma foto', new Set(r.fotos).size===1);
    T('[35] e a foto existe', r.ok);
    T('[35] a cor escolhida vai para o orcamento ('+r.cor+')', r.cor===r.esperada);
    T('[35] e para a mensagem do WhatsApp', r.msg.includes(r.nomeCor));
  }
  await q.close();
}


// [36] trocar de cor nao pode deixar o card sem foto nem por um quadro: a
// foto antiga fica ate a nova estar pronta (e, com foto compartilhada, fica)
{
  const q = await b.newPage({ viewport:{width:1440,height:900} });
  await q.goto(URL,{waitUntil:'domcontentloaded'});
  await q.waitForFunction(()=>document.querySelector('#preloader')?.classList.contains('is-done'),{timeout:40000});
  const alvos = await q.evaluate(()=>SPACE.PRODUCTS.filter(p=>p.cores&&p.cores.length>1).map(p=>p.id).slice(0,3));
  let vazios=0, erradas=0;
  for (const id of alvos) {
    const c=q.locator(`.ccard[data-id="${id}"]`); await c.scrollIntoViewIfNeeded(); await q.waitForTimeout(900);
    const r = await c.evaluate(async el=>{
      const m=el.querySelector('.ccard__media'); let vazio=0;
      const mo=new MutationObserver(()=>{ if(!m.style.backgroundImage) vazio++; }); mo.observe(m,{attributes:true});
      const bs=el.querySelectorAll('.swatch'); const ult=bs[bs.length-1]; ult.click();
      if(!m.style.backgroundImage) vazio++;
      await new Promise(r=>setTimeout(r,900)); mo.disconnect();
      return { vazio, certa: m.style.backgroundImage.includes(m.dataset.src) };
    });
    vazios+=r.vazio; if(!r.certa) erradas++;
  }
  T('[36] trocar de cor nao deixa o card sem foto ('+vazios+' momentos vazios em '+alvos.length+' produtos)', vazios===0);
  T('[36] e a foto pintada e a da cor escolhida', erradas===0);
  await q.close();
}


// [37] versao nos enderecos: foto trocada com o mesmo nome nao chegava a quem
// ja tinha visitado (cache). CSS, JS e toda foto tem que sair com ?v=
{
  const q = await b.newPage({ viewport:{width:1440,height:900} });
  const fotos=[];
  q.on('request', r=>{ const u=r.url(); if(/assets\/produtos\/.+\.webp/.test(u)) fotos.push(u); });
  await q.goto(URL,{waitUntil:'domcontentloaded'});
  await q.waitForFunction(()=>document.querySelector('#preloader')?.classList.contains('is-done'),{timeout:40000});
  await q.evaluate(()=>document.querySelector('#catalogo').scrollIntoView());
  for(let i=0;i<8;i++){ await q.mouse.wheel(0,900); await q.waitForTimeout(200); }
  await q.waitForTimeout(800);
  const v = await q.evaluate(()=>{
    const js=document.querySelector('script[src*="js/script.js"]').getAttribute('src');
    const css=document.querySelector('link[href*="css/style.css"]').getAttribute('href');
    return { js, css, v: new URL(js, location.href).searchParams.get('v') };
  });
  T('[37] CSS e JS saem com versao ('+v.v+')', !!v.v && v.css.includes('v='+v.v));
  const sem = fotos.filter(u=>!u.includes('v='+v.v));
  T('[37] toda foto sai com a mesma versao ('+fotos.length+' fotos, '+sem.length+' sem)', fotos.length>0 && sem.length===0);
  await q.close();
}

// [38] sem preco de 1 a 9 unidades (pedido da dona, 28/09): a tabela comeca
// em 10, o preco avulso nao aparece em lugar nenhum, e abaixo de 10 pecas o
// orcamento fica "a combinar" em vez de inventar um valor
{
  const q = await b.newPage({ viewport:{width:1440,height:900} });
  await q.goto(URL,{waitUntil:'domcontentloaded'});
  await q.waitForFunction(()=>document.querySelector('#preloader')?.classList.contains('is-done'),{timeout:40000});
  const r = await q.evaluate(()=>{
    const cards=[...document.querySelectorAll('#catalogGrid .ccard')];
    const faixas=cards.flatMap(c=>[...c.querySelectorAll('.ccard__tiers li span')].map(s=>s.textContent));
    const comPreco=cards.filter(c=>!c.querySelector('.ccard__price--consulta'));
    const copo=cards.find(c=>c.dataset.id==='copo-473');
    return {
      primeiras: cards.map(c=>c.querySelector('.ccard__tiers li span')).filter(Boolean).map(s=>s.textContent),
      abaixo10: faixas.filter(t=>/^[1-9] a /.test(t)),
      rotulos: comPreco.map(c=>c.querySelector('.ccard__from').textContent),
      copo: copo.querySelector('.ccard__price').textContent,
      corpo: document.body.innerText,
      primeiraFaixa: SPACE.PRODUCTS.filter(p=>p.tiers).map(p=>p.tiers[0][0])
    };
  });
  T('[38] nenhuma faixa comeca abaixo de 10 ('+r.abaixo10.length+')', r.abaixo10.length===0);
  T('[38] toda tabela abre em "10 a ..." ou "10 pecas" ('+r.primeiras.length+' tabelas)', r.primeiras.every(t=>/^10 /.test(t)));
  T('[38] todo preco diz "a partir de 10 pecas" ('+r.rotulos.length+')', r.rotulos.length>0 && r.rotulos.every(t=>/a partir de 10 pe/i.test(t)));
  T('[38] o copo 473 mostra 24,90, nao os 49,99 da peca avulsa', r.copo.includes('24,90') && !/49,99/.test(r.corpo));
  T('[38] todo produto com preco comeca em 10', r.primeiraFaixa.every(x=>x===10));
  // 5 pecas: entra no orcamento, mas sem preco inventado
  const o = await q.evaluate(()=>{
    localStorage.clear(); [...SPACE.Cart.items].forEach(i=>SPACE.Cart.remove(i.cor?i.id+'|'+i.cor:i.id));
    const c=document.querySelector('.ccard[data-id="garrafa-500"]');
    c.querySelector('input').value='5'; c.querySelector('[data-add]').click();
    const wa=c.querySelector('[data-wa]'); wa.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));
    return { linha:document.querySelector('.ditem[data-chave="garrafa-500"] .ditem__price').textContent,
             meta:document.querySelector('.ditem[data-chave="garrafa-500"] .ditem__meta').textContent,
             total:document.querySelector('#drawerTotal').textContent,
             msg:SPACE.Cart.message(), zap:decodeURIComponent(wa.href.split('text=')[1]||'') };
  });
  T('[38] 5 pecas ficam a combinar no orcamento ('+o.linha+')', /combinar/i.test(o.linha) && o.total.includes('0,00'));
  T('[38] e o item diz de onde o preco comeca ('+o.meta+')', /a partir de 10/.test(o.meta));
  T('[38] a mensagem nao inventa valor para 5 pecas', /5 uni × a combinar/.test(o.msg));
  T('[38] o WhatsApp direto com 5 pecas nao manda valor de referencia', !/refer[êe]ncia/i.test(o.zap) && /Quantidade: 5 uni/.test(o.zap));
  await q.close();
}

// [39] do logo direto para o catalogo (pedido da dona, 28/09): sairam o
// destaque "Nao e tinta", os diferenciais, "Novos Brindes" e "Mais desejados"
{
  const q = await b.newPage({ viewport:{width:1440,height:900} });
  await q.goto(URL,{waitUntil:'domcontentloaded'});
  await q.waitForFunction(()=>document.querySelector('#preloader')?.classList.contains('is-done'),{timeout:40000});
  const r = await q.evaluate(()=>({
    sairam: ['.hero','#novidades','#produtos','#desejados','#showcase','#dealCard'].filter(s=>document.querySelector(s)),
    primeira: document.querySelector('main > section')?.id,
    depoisDaCapa: document.querySelector('#cup').nextElementSibling.nextElementSibling?.id, // capa, barra, main
    links: [...document.querySelectorAll('#navMenu a, .footer a[href^="#"]')].map(a=>a.getAttribute('href')),
    h1: document.querySelectorAll('h1').length
  }));
  T('[39] as secoes pedidas sairam ('+(r.sairam.join(',')||'nenhuma sobrou')+')', r.sairam.length===0);
  T('[39] a primeira secao depois do logo e o catalogo ('+r.primeira+')', r.primeira==='catalogo');
  const mortos = await q.evaluate(ls=>ls.filter(h=>!document.querySelector(h)), r.links);
  T('[39] nenhum link do menu ou do rodape aponta para secao que saiu ('+mortos.join(',')+')', mortos.length===0);
  T('[39] a pagina continua com um h1 ('+r.h1+')', r.h1===1);
  await q.close();
}

console.log('PASSOU:'); ok.forEach(x=>console.log('  ✔',x));
if(bad.length){ console.log('FALHOU:'); bad.forEach(x=>console.log('  ✘',x)); }
console.log('ERROS JS:', errs.length? errs.join('\n'):'nenhum');
await b.close();
process.exit(bad.length?1:0);
