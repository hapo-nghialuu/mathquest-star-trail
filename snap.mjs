import { chromium } from 'playwright';

const screens = ['map', 'lesson', 'reward'];
const out = process.argv[2] || '/tmp/snaps';

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 800, height: 900 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  for (const s of screens) {
    await page.goto(`http://localhost:4173/?screen=${s}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    const stage = await page.$('.phone-stage');
    await stage.screenshot({ path: `${out}/${s}.png` });
    console.log(`saved ${s}.png`);
  }
  await browser.close();
})();
