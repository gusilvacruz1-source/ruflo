import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const out = process.argv[2];
for (const [w,h,tag] of [[1440,900,'desktop'],[390,844,'mobile'],[768,1024,'tablet']]) {
  const p = await (await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:2})).newPage();
  await p.goto('http://localhost:8899/index.html',{waitUntil:'networkidle'});
  await p.evaluate(()=>document.querySelectorAll('.js-rise,.js-open').forEach(e=>e.classList.add('is-in')));
  await p.waitForTimeout(1300);
  await p.screenshot({path:`${out}/f-${tag}.png`, fullPage:true});
  const r = await p.evaluate(()=>({over:document.documentElement.scrollWidth-document.documentElement.clientWidth}));
  console.log(tag, w+'x'+h, 'overflow-x:', r.over);
  await p.close();
}
await b.close();
