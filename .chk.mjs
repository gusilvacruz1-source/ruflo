import { chromium } from 'playwright';
const URL = 'http://localhost:8899/lumiere/index.html';
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const out = process.argv[2];
const errs = [];
for (const [w,h,tag] of [[1440,900,'desktop'],[390,844,'mobile'],[820,1180,'tablet']]) {
  const p = await (await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:2})).newPage();
  p.on('pageerror', e=>errs.push(tag+': '+e));
  await p.goto(URL,{waitUntil:'networkidle'});
  await p.evaluate(()=>document.querySelectorAll('.js-rise,.js-open').forEach(e=>e.classList.add('is-in')));
  await p.waitForTimeout(1200);
  await p.screenshot({path:`${out}/j-${tag}.png`, fullPage:true});
  const r = await p.evaluate(()=>{
    const de=document.documentElement, small=[];
    document.querySelectorAll('a,button,span,li,p').forEach(el=>{
      if(el.children.length||!el.textContent.trim())return;
      const fs=parseFloat(getComputedStyle(el).fontSize);
      if(fs<11) small.push(el.textContent.trim().slice(0,24)+' @'+fs.toFixed(1));
    });
    return {over:de.scrollWidth-de.clientWidth, under11:small};
  });
  console.log(tag, w+'x'+h, 'overflow:', r.over, r.under11.length?('| <11px: '+r.under11.join(', ')):'');
  await p.close();
}
const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.goto(URL,{waitUntil:'networkidle'});
await p.locator('.nav__link[data-cat="tricot"]').click();
await p.waitForTimeout(250);
console.log('\nfiltro Tricot:  ', await p.evaluate(()=>[...document.querySelectorAll('.card')].filter(c=>!c.hidden).map(c=>c.dataset.nome)));
await p.locator('#searchBtn').click();
await p.locator('#searchInput').fill('lia');
await p.waitForTimeout(250);
console.log('Tricot + "lia": ', await p.evaluate(()=>[...document.querySelectorAll('.card')].filter(c=>!c.hidden).map(c=>c.dataset.nome)));
await p.locator('.nav__link[data-cat="todas"]').click();
await p.waitForTimeout(250);
console.log('Tudo + "lia":   ', await p.evaluate(()=>[...document.querySelectorAll('.card')].filter(c=>!c.hidden).map(c=>c.dataset.nome)));
console.log('\nERROS:', errs.length?errs:'nenhum');
await b.close();
