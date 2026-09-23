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

// [3] preco em destaque = o da unidade avulsa, nao o do melhor lote
await p.reload({waitUntil:'domcontentloaded'});
await p.waitForFunction(()=>document.querySelector('#preloader')?.classList.contains('is-done'),{timeout:40000});
await p.waitForTimeout(400);
const chav = await p.evaluate(()=>{
  const c=[...document.querySelectorAll('#catalogGrid .ccard')].find(x=>x.dataset.id==='chaveiro-abridor');
  return { preco:c.querySelector('.ccard__price').textContent, nota:c.querySelector('.ccard__min').textContent };
});
T('[3] chaveiro mostra R$ 4,00 avulso, nao R$ 2,25 de 500 pecas', chav.preco.includes('4,00'));
T('[3] volume vira nota, nao manchete', chav.nota.includes('2,25'));

// [6][8][12] vitrine
await p.evaluate(()=>document.querySelector('[data-filter="canivetes"]').click());
await p.waitForTimeout(500);
T('[12] grid adapta a 2 cards', await p.evaluate(()=>document.querySelector('#showcase').dataset.count==='2'));
await p.evaluate(()=>document.querySelector('#showcaseNext').click());
await p.waitForTimeout(500);
T('[8] prev/next mantem o filtro ativo', await p.evaluate(()=>document.querySelector('[data-filter="canivetes"]').classList.contains('is-active') && document.querySelectorAll('#showcase .pcard').length===2));
await p.evaluate(()=>document.querySelector('[data-filter="todos"]').click());
await p.waitForTimeout(400);
const i1 = await p.evaluate(()=>document.querySelector('#showcaseIndex').textContent);
await p.evaluate(()=>document.querySelector('#showcaseNext').click());
await p.waitForTimeout(500);
const i2 = await p.evaluate(()=>document.querySelector('#showcaseIndex').textContent);
T('[6] contador anda ('+i1+' -> '+i2+')', i1!==i2);

// [4] saiba mais com catalogo filtrado noutra categoria
await p.evaluate(()=>document.querySelector('[data-cfilter="garrafas"]').click());
await p.waitForTimeout(500);
// os atalhos agora seguem a aba ativa dos mais desejados: pega o que houver,
// desde que NAO seja garrafa, para o reset do filtro ser de fato exercitado
const alvoJump = await p.evaluate(()=>{
  const v=[...document.querySelectorAll('.vcard[data-jump]')].find(x=>SPACE.PRODUCTS.find(q=>q.id===x.dataset.jump).cat!=='garrafas');
  v.click(); return v.dataset.jump;
});
await p.waitForTimeout(900);
T('[4] jump reseta o filtro e acha o card ('+alvoJump+')', await p.evaluate(id=>!!document.querySelector('#p-'+id), alvoJump));

// [7] stepper com campo vazio
const st = await p.evaluate(()=>{
  const c=document.querySelector('#catalogGrid .ccard'); const i=c.querySelector('input');
  i.value=''; c.querySelector('[data-step="1"]').click();
  return i.value;
});
T('[7] stepper sobrevive a campo vazio (='+st+')', st!=='' && !isNaN(+st));

// [5] contador dispara uma vez so quando a secao entra em cena
await p.evaluate(()=>document.querySelector('#desejados').scrollIntoView({block:'center'}));
let contou=true;
try{ await p.waitForFunction(()=>document.querySelector('[data-count-to="5000"]').dataset.counted==='1',{timeout:8000}); }
catch(e){ contou=false; }
T('[5] contador marcado uma vez', contou);


// [13] scroll-spy volta para INICIO
await p.evaluate(()=>document.querySelector('#produtos').scrollIntoView({block:'start'}));
await p.waitForTimeout(1200);
await p.evaluate(()=>document.querySelector('.hero').scrollIntoView({block:'start'}));
// espera pela condicao, nao por um prazo: o scroll-spy depende do rAF e o
// tempo ate acender varia com a maquina
let voltou=true;
try{ await p.waitForFunction(()=>document.querySelectorAll('#navMenu a')[0].classList.contains('is-active'),{timeout:8000}); }
catch(e){ voltou=false; }
T('[13] INICIO reacende ao voltar', voltou);

// [16] o contador animado NAO pode apagar a vitrine (#showcase usa data-count como layout)
await p.evaluate(async()=>{ for(let y=0;y<document.body.scrollHeight;y+=400){ scrollTo(0,y); await new Promise(r=>setTimeout(r,60)); } });
await p.waitForTimeout(1200);
const vit = await p.evaluate(()=>({ cards:document.querySelectorAll('#showcase .pcard').length, txt:document.querySelector('#showcase').textContent.trim().slice(0,12) }));
T('[16] vitrine sobrevive ao contador ('+vit.cards+' cards)', vit.cards>0);
T('[17] numero real conta ate 5.000+', (await p.evaluate(()=>document.querySelector('[data-count-to="5000"]').textContent)).includes('5.000'));
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
  const sels=['#showcase .pcard','#catalogGrid .ccard'];
  const fora=[];
  for (const s of sels) for (const c of document.querySelectorAll(s)){
    const m=c.querySelector('.pcard__media,.ccard__media'); if(!m) continue;
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
T('[22] o rotulo diz que o preco e por unidade', /por unidade/i.test(pu.rotulo));
T('[22] o preco carrega /un colado', pu.preco.includes('/un'));
T('[22] o card avisa que nao ha pedido minimo', /sem pedido m/i.test(pu.nota));
// e a conta do orcamento continua batendo. Pagina limpa: os testes
// anteriores ja deixaram itens no carrinho desta sessao.
await p.evaluate(()=>localStorage.clear());
await p.reload({waitUntil:'domcontentloaded'});
await p.waitForFunction(()=>document.querySelector('#preloader')?.classList.contains('is-done'),{timeout:40000});
await p.waitForTimeout(500);
await p.evaluate(()=>[...document.querySelectorAll('#catalogGrid .ccard')].find(x=>x.dataset.id==='copo-473').querySelector('[data-add]').click());
await p.waitForTimeout(500);
const soma = await p.evaluate(()=>document.querySelector('#drawerTotal').textContent);
T('[22] uma peca sozinha soma o preco de 1 un, nao o de lote (deu '+soma+')', soma.includes('49,99'));

// [23] da para comprar UMA peca: sem piso de quantidade e sem passo de 10
const un = await p.evaluate(async ()=>{
  const c=[...document.querySelectorAll('#catalogGrid .ccard')].find(x=>x.dataset.id==='copo-473');
  const inp=c.querySelector('input[type=number]');
  const partida = inp.value;
  c.querySelector('[data-step="1"]').click();          // 1 -> 2, nao 1 -> 11
  const subiu = inp.value;
  c.querySelector('[data-step="-1"]').click();
  c.querySelector('[data-step="-1"]').click();         // nao pode passar de 1
  return { partida, subiu, piso: inp.value, minAttr: inp.getAttribute('min') };
});
T('[23] o campo comeca em 1 (veio '+un.partida+')', un.partida === '1');
T('[23] o + anda de um em um (1 -> '+un.subiu+')', un.subiu === '2');
T('[23] o - para em 1, nao em 10 (parou em '+un.piso+')', un.piso === '1');
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
    tiers:[[1,10.00]] });
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
T('[25] a soma nao junta as duas ('+c2.total+')', c2.total.includes('20,00'));
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
  c3.azul === '2' && c3.preto === '1');

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
T('[26] o total soma so o que tem preco ('+orc.total+')', orc.total.includes('49,99'));
T('[26] e avisa do item sob consulta ('+orc.nota+')', /sob consulta/i.test(orc.nota));
T('[26] a mensagem marca o item como a combinar',
  /Produto Sob Consulta: 1 uni × a combinar/.test(orc.zap));
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


// [28] vitrine e card de destaque: produto COM COR tem que pedir <id>-<cor>.webp.
// Pediam <id>.webp, que nao existe, e as canecas com cor apareciam vazias.
{
  const q = await b.newPage({ viewport:{width:1440,height:900} });
  const f404=[]; q.on('response', r=>{ if(r.status()>=400) f404.push(r.url().split('/').pop()); });
  await q.goto(URL,{waitUntil:'domcontentloaded'});
  await q.waitForFunction(()=>document.querySelector('#preloader')?.classList.contains('is-done'),{timeout:40000});
  await q.evaluate(()=>document.querySelector('#produtos').scrollIntoView());
  const vistos = new Set();
  for (const cat of ['copos','garrafas','escritorio']) {
    await q.evaluate(c=>document.querySelector(`#filters [data-filter="${c}"]`).click(), cat);
    for (let k=0;k<3;k++){
      await q.waitForTimeout(350);
      (await q.evaluate(()=>[...document.querySelectorAll('#showcase .pcard__media')].map(m=>m.dataset.src))).forEach(x=>vistos.add(x));
      await q.evaluate(()=>document.querySelector('#showcaseNext').click());
    }
  }
  await q.waitForTimeout(800);
  const semArquivo = await q.evaluate(async lst=>{
    const out=[]; for (const u of lst){ const r=await fetch(u,{method:'HEAD'}); if(!r.ok) out.push(u); } return out;
  }, [...vistos]);
  T('[28] vitrine pede fotos que existem ('+vistos.size+' vistas, '+semArquivo.length+' faltando)', semArquivo.length===0);
  T('[28] canecas com cor aparecem na vitrine', [...vistos].some(u=>/caneca-termica-350-/.test(u)));
  T('[28] nenhum 404 de foto', !f404.some(x=>/\.webp$/.test(x)));

  // [29] abas que comparam preco nao podem abrir com item sem preco
  await q.evaluate(()=>document.querySelector('#desejados').scrollIntoView());
  const aba = async k => { await q.evaluate(k=>document.querySelector(`#dealFilters [data-deal="${k}"]`).click(), k); await q.waitForTimeout(250);
    return q.evaluate(()=>document.querySelector('#dealPrice').textContent); };
  T('[29] "Ate R$ 30" abre com item de preco', !/consulta/.test(await aba('ate30')));
  T('[29] "Kits churrasco" abre com item de preco', !/consulta/.test(await aba('churrasco')));
  T('[29] "Ate R$ 30" nao lista sob consulta',
    await q.evaluate(()=>SPACE.PRODUCTS.filter(p=>!p.tiers).every(p=>![...document.querySelectorAll('.vcard')].some(v=>v.dataset.jump===p.id))));
  T('[29] atalhos seguem a aba (nada de 17 e 18 fixos)',
    await q.evaluate(()=>[...document.querySelectorAll('.vcard b')].every(b=>/R\$|consulta/.test(b.textContent))));

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
    const soma=[...document.querySelectorAll('.idx__row [data-conta]')].reduce((a,el)=>a+parseInt(el.textContent,10),0);
    return { conta, soma, n, corpo: document.body.innerText };
  });
  T('[33] toda contagem no texto bate com o catalogo', txt.conta);
  T('[33] o indice soma o catalogo inteiro ('+txt.soma+'/'+txt.n+')', txt.soma===txt.n);
  T('[33] sumiram "Dezoito", "18 ITENS" e o copo a 29,90', !/Dezoito|18 ITENS|R\$ 29,90 a unidade/i.test(txt.corpo));

  // [34] previa de link: endereco absoluto e arquivo existe
  const og = await q.evaluate(async()=>{
    const m=document.querySelector('meta[property="og:image"]');
    if (!m) return { absoluto:false, existe:false };
    const u=m.content;
    const local = u.replace(/^https:\/\/[^/]+\/ruflo\/space-personalizados\//,'');
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

console.log('PASSOU:'); ok.forEach(x=>console.log('  ✔',x));
if(bad.length){ console.log('FALHOU:'); bad.forEach(x=>console.log('  ✘',x)); }
console.log('ERROS JS:', errs.length? errs.join('\n'):'nenhum');
await b.close();
process.exit(bad.length?1:0);
