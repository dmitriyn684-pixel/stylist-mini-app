import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const root = process.cwd();
const outputDir = path.join(root, 'brandbook', 'assets', 'cases');
const browser = await chromium.launch({ headless: true });

async function captureLocal(name, route, action) {
  const context = await browser.newContext({
    viewport: { width: 430, height: 932 },
    deviceScaleFactor: 2,
    colorScheme: 'light',
  });
  await context.addInitScript(() => localStorage.setItem('onboarding_seen', '1'));
  const page = await context.newPage();
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().includes('ERR_NETWORK_ACCESS_DENIED')) {
      errors.push(message.text());
    }
  });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`http://127.0.0.1:4173/stylist-mini-app${route}`, { waitUntil: 'networkidle' });
  if (action) await action(page);
  await page.screenshot({ path: path.join(outputDir, `${name}.png`), fullPage: true });
  if (errors.length) throw new Error(`${name}: ${errors.join(' | ')}`);
  await context.close();
}

async function capturePublicCard(name, url) {
  const context = await browser.newContext({
    viewport: { width: 900, height: 900 },
    deviceScaleFactor: 1.5,
    colorScheme: 'dark',
  });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45_000 });
  await page.locator('.tgme_page').waitFor({ state: 'visible', timeout: 20_000 });
  await page.screenshot({ path: path.join(outputDir, `${name}.png`), fullPage: false });
  await context.close();
}

async function capturePublicProduct(name, url) {
  const context = await browser.newContext({
    viewport: { width: 430, height: 932 },
    deviceScaleFactor: 2,
    colorScheme: 'light',
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45_000 });
  await page.waitForTimeout(2_500);
  await page.screenshot({ path: path.join(outputDir, `${name}.png`), fullPage: false });
  await context.close();
}

await mkdir(outputDir, { recursive: true });

await captureLocal('stylist-ai-showcase', '/stylist');
await captureLocal('stylist-ai-rachel', '/stylist', async (page) => {
  await page.getByRole('button', { name: /Выбрать Rachel Zoe/i }).click();
  await page.waitForTimeout(450);
});
await captureLocal('stylist-ai-quick-chat', '/stylist', async (page) => {
  await page.getByRole('button', { name: /Начать диалог/i }).click();
  await page.waitForURL(/\/chat$/);
  await page.waitForTimeout(450);
});
await captureLocal('stylist-ai-palette', '/chat', async (page) => {
  await page.getByRole('button', { name: /Моя палитра/i }).click();
  await page.locator('#color-palette-drawer').waitFor({ state: 'visible' });
  await page.waitForTimeout(450);
});

await capturePublicCard('psy-mind-ai-card', 'https://t.me/psy_mind_rf_bot');
await capturePublicCard('businessmen-ai-card', 'https://t.me/businessmen_ai_bot');
await capturePublicCard('pulse-ai-coach-card', 'https://t.me/PulseAICoach_bot');
await capturePublicProduct('caloriept-ai-live', 'https://caloriept.ru/webapp.html');

await browser.close();
