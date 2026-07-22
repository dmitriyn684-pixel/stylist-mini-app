import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const root = process.cwd();
const output = path.join(root, 'brandbook', 'assets', 'portfolio');
const base = process.env.PORTFOLIO_BASE_URL || 'http://127.0.0.1:4173/stylist-mini-app/portfolio/';
const browser = await chromium.launch({ headless: true });

async function verify(viewport, filename) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });

  const response = await page.goto(base, { waitUntil: 'networkidle', timeout: 45_000 });
  if (!response?.ok()) throw new Error(`Portfolio response: ${response?.status()}`);
  await page.locator('h1').waitFor({ state: 'visible' });

  const checks = {
    title: await page.title(),
    h1: await page.locator('h1').innerText(),
    mainCases: await page.locator('#cases .case-card').count(),
    bots: await page.locator('#bots .bot-card').count(),
    imagesLoaded: await page.locator('img').evaluateAll((images) => images.every((image) => image.complete && image.naturalWidth > 0)),
    bodyLength: (await page.locator('body').innerText()).trim().length,
  };
  if (!checks.title.includes('DimkoFF')) throw new Error('Missing DimkoFF title');
  if (checks.mainCases !== 2) throw new Error(`Expected 2 main cases, got ${checks.mainCases}`);
  if (checks.bots !== 3) throw new Error(`Expected 3 bot cards, got ${checks.bots}`);
  if (!checks.imagesLoaded) throw new Error('One or more portfolio images failed to load');
  if (checks.bodyLength < 1000) throw new Error('Main UI did not render enough content');
  if (errors.length) throw new Error(`Runtime errors: ${errors.join(' | ')}`);

  const pdfResponse = await page.request.get(new URL('dimkoff-brandbook-2026.pdf', base).href);
  if (!pdfResponse.ok()) throw new Error(`PDF response: ${pdfResponse.status()}`);

  await page.evaluate(async () => {
    const pause = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
    for (let y = 0; y < document.body.scrollHeight; y += Math.max(window.innerHeight * 0.72, 420)) {
      window.scrollTo(0, y);
      await pause(70);
    }
    window.scrollTo(0, 0);
    await pause(180);
  });
  await page.screenshot({ path: path.join(output, filename), fullPage: true });
  await context.close();
  return checks;
}

await mkdir(output, { recursive: true });
const desktop = await verify({ width: 1440, height: 1000 }, 'portfolio-desktop.png');
const mobile = await verify({ width: 390, height: 844 }, 'portfolio-mobile.png');
console.log(JSON.stringify({ desktop, mobile }, null, 2));
await browser.close();
