import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await (await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1})).newPage();
await p.goto('http://localhost:8899/lumiere/index.html',{waitUntil:'networkidle'});
await p.waitForTimeout(1000);
const box = await p.locator('.hero__line').boundingBox();
// recorta uma faixa logo abaixo do texto, ainda dentro do miolo escurecido
await p.screenshot({ path: process.argv[2]+'/bg-sample.png',
  clip: { x: Math.round(box.x+box.width/2-30), y: Math.round(box.y+box.height+6), width: 60, height: 10 } });
console.log('cor do texto:', await p.evaluate(()=>getComputedStyle(document.querySelector('.hero__line')).color));
await b.close();
