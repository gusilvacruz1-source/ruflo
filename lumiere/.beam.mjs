import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await (await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2})).newPage();
await p.goto('http://localhost:8899/index.html',{waitUntil:'networkidle'});
await p.evaluate(()=>document.querySelectorAll('.js-rise,.js-open').forEach(e=>e.classList.add('is-in')));
await p.locator('#grid').scrollIntoViewIfNeeded();
await p.waitForTimeout(600);
const g = await p.locator('#grid').boundingBox();
await p.mouse.move(g.x + g.width*0.30, g.y + g.height*0.30);
await p.waitForTimeout(800);
console.log('facho:', JSON.stringify(await p.evaluate(()=>{
  const l = document.getElementById('lamp');
  return { aceso: l.classList.contains('is-on'), transform: l.style.transform,
           opacidade: getComputedStyle(l).opacity, blend: getComputedStyle(l).mixBlendMode };
})));
await p.screenshot({ path: process.argv[2]+'/beam.png' });
await b.close();
