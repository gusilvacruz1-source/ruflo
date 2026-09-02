import { chromium } from 'playwright';
const URL='http://localhost:8899/margem/index.html';
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const out = process.argv[2]; const errs=[];
for (const [w,h,tag] of [[1440,900,'desktop'],[390,844,'mobile'],[820,1180,'tablet']]) {
  const p = await (await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:2})).newPage();
  p.on('pageerror', e=>errs.push(tag+': '+e));
  await p.goto(URL,{waitUntil:'networkidle'});
  await p.evaluate(()=>document.querySelectorAll('.js-sobe,.js-abre').forEach(e=>e.classList.add('dentro')));
  await p.waitForTimeout(1400);
  await p.screenshot({path:`${out}/m-${tag}.png`, fullPage:true});
  const r = await p.evaluate(()=>{
    const de=document.documentElement, small=[];
    document.querySelectorAll('a,button,span,p,h1,h2').forEach(el=>{
      if(el.children.length||!el.textContent.trim())return;
      const fs=parseFloat(getComputedStyle(el).fontSize);
      if(fs<11) small.push(el.textContent.trim().slice(0,22)+' @'+fs.toFixed(1));
    });
    const t=[...new Set([...document.querySelectorAll('h1,h2,p,a,span')].filter(e=>!e.children.length&&e.textContent.trim()).map(e=>Math.round(parseFloat(getComputedStyle(e).fontSize)*10)/10))].sort((a,b)=>a-b);
    return {over:de.scrollWidth-de.clientWidth, under11:small, tamanhos:t};
  });
  console.log(tag, w+'x'+h, '| overflow:', r.over, r.under11.length?('| <11px: '+r.under11.join(', ')):'');
  if(tag==='desktop') console.log('  escala tipográfica:', r.tamanhos.join(', '));
  await p.close();
}
// troca de foto no hover
const p = await (await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2})).newPage();
await p.goto(URL,{waitUntil:'networkidle'});
await p.evaluate(()=>document.querySelectorAll('.js-sobe,.js-abre').forEach(e=>e.classList.add('dentro')));
await p.locator('.peca--a').scrollIntoViewIfNeeded();
await p.waitForTimeout(700);
const antes = await p.evaluate(()=>getComputedStyle(document.querySelector('.peca--a .chapa--b')).opacity);
await p.locator('.peca--a').hover();
await p.waitForTimeout(900);
const depois = await p.evaluate(()=>getComputedStyle(document.querySelector('.peca--a .chapa--b')).opacity);
console.log('\ntroca de foto no hover: opacidade da 2a foto', antes, '->', depois);
await p.locator('.peca--a').screenshot({ path: out+'/m-hover.png' });
console.log('ERROS JS:', errs.length?errs:'nenhum');
await b.close();
