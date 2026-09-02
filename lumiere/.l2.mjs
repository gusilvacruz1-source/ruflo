import { chromium } from 'playwright';
const URL='http://localhost:8899/lumiere/index.html';
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const out=process.argv[2]; const errs=[];
for (const [w,h,tag] of [[1440,900,'desktop'],[390,844,'mobile']]) {
  const p = await (await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:2})).newPage();
  p.on('pageerror', e=>errs.push(tag+': '+e));
  p.on('response', r=>{ if(r.status()>=400 && r.url().includes('/img/')) errs.push('IMG '+r.status()+' '+r.url().split('/').pop()); });
  await p.goto(URL,{waitUntil:'networkidle'});
  await p.evaluate(()=>document.querySelectorAll('.js-rise,.js-open').forEach(e=>e.classList.add('is-in')));
  await p.waitForTimeout(1600);
  await p.screenshot({path:`${out}/l2-${tag}.png`, fullPage:true});
  const r = await p.evaluate(()=>({over:document.documentElement.scrollWidth-document.documentElement.clientWidth,
    ok:[...document.querySelectorAll('.shot img')].filter(i=>i.complete&&i.naturalWidth>0).length,
    total:document.querySelectorAll('.shot img').length}));
  console.log(tag,'| overflow:',r.over,'| fotos:',r.ok+'/'+r.total);
  await p.close();
}
const p = await (await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2})).newPage();
await p.goto(URL,{waitUntil:'networkidle'});
await p.evaluate(()=>document.querySelectorAll('.js-rise,.js-open').forEach(e=>e.classList.add('is-in')));
await p.locator('#grid').scrollIntoViewIfNeeded(); await p.waitForTimeout(1000);
await p.locator('#grid').screenshot({ path: out+'/l2-grade.png' });
for (const c of ['casacos','alfaiataria','saias']) {
  await p.locator(`.nav__link[data-cat="${c}"]`).click(); await p.waitForTimeout(250);
  console.log(c+':', await p.evaluate(()=>[...document.querySelectorAll('.card')].filter(x=>!x.hidden).map(x=>x.dataset.nome)));
}
console.log('ERROS:', errs.length?errs:'nenhum');
await b.close();
