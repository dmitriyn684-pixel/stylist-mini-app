import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
const output = path.resolve(
  root,
  process.env.MAIN_LANDING_SCREENSHOT_DIR || "output/screenshots/main-landing",
);
const base =
  process.env.MAIN_LANDING_BASE_URL ||
  "http://127.0.0.1:4173/stylist-mini-app/";
const browser = await chromium.launch({ headless: true });

async function verify(viewport, filename) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const errors = [];

  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  const response = await page.goto(base, {
    waitUntil: "networkidle",
    timeout: 45_000,
  });
  if (!response?.ok()) throw new Error(`Main landing response: ${response?.status()}`);

  const landing = page.locator('[data-testid="dimkoff-main-landing"]');
  await landing.waitFor({ state: "visible" });
  const h1 = landing.locator("h1");
  await h1.waitFor({ state: "visible" });

  const isMobile = viewport.width < 1120;
  if (isMobile) {
    await page.locator('button[aria-controls="dimkoff-main-nav"]').click();
    await page.locator("#dimkoff-main-nav").waitFor({ state: "visible" });
  }

  const initialLanguage = await page.locator("html").getAttribute("lang");
  const initialH1 = await h1.innerText();
  await page.locator('button[aria-pressed="false"]:visible').first().click();
  const englishH1 = await h1.innerText();
  const englishLanguage = await page.locator("html").getAttribute("lang");
  await page.locator('button[aria-pressed="false"]:visible').first().click();
  const restoredH1 = await h1.innerText();

  if (isMobile) {
    await page.locator('button[aria-controls="dimkoff-main-nav"]').click();
  }

  await page.locator("#contact").scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.locator("#products").scrollIntoViewIfNeeded();
  await page.waitForTimeout(350);

  const checks = {
    title: await page.title(),
    initialLanguage,
    initialH1,
    englishLanguage,
    englishH1,
    restoredH1,
    serviceCards: await page.locator("#capabilities article").count(),
    benefits: await page.locator("#value ol li").count(),
    realProducts: await page.locator("#products article").evaluateAll(
      (cards) => cards.filter((card) => card.querySelector("img")).length + cards.filter((card) => card.textContent?.includes("AI Bot Portfolio") || card.textContent?.includes("Visual Brandbook")).length,
    ),
    concepts: await page.locator("#products article").evaluateAll(
      (cards) => cards.filter((card) => card.textContent?.includes("/ CONCEPT")).length,
    ),
    audiences: await page.locator('[class*="audienceGrid"] > span').count(),
    processSteps: await page.locator("#process ol li").count(),
    heroImages: await page.locator('[class*="heroScene"] > img').count(),
    heroAsset: await page.locator('[class*="heroScene"] > img').getAttribute("src"),
    marqueeGroups: await page.locator('[data-testid="seamless-marquee"] [class*="marqueeGroup"]').count(),
    marqueeItems: await page.locator('[data-testid="seamless-marquee"] [class*="marqueeGroup"] > span').count(),
    marquee: await page.locator('[data-testid="seamless-marquee"] [class*="marqueeTrack"]').evaluate((track) => {
      const groups = [...track.children];
      const style = getComputedStyle(track);
      return {
        animationName: style.animationName,
        groupWidthDelta: groups.length === 2
          ? Math.abs(groups[0].getBoundingClientRect().width - groups[1].getBoundingClientRect().width)
          : -1,
      };
    }),
    productDescriptions: await page.locator('#products [class*="productGrid"] article p').count(),
    portfolioLinks: await page.locator('a[href$="/portfolio/"]').count(),
    brandbookLinks: await page.locator('a[href$="dimkoff-brandbook-2026-visual-v2.pdf"]').count(),
    telegramLinks: await page.locator('a[href="https://t.me/AIStudioDimkoFF"]').count(),
    phoneLinks: await page.locator('a[href="tel:+79999357608"]').count(),
    imageFailures: await page.locator("img").evaluateAll((images) =>
      images
        .filter((image) => !image.complete || image.naturalWidth === 0)
        .map((image) => image.currentSrc || image.src),
    ),
    bodyLength: (await page.locator("body").innerText()).trim().length,
    horizontalOverflow: await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    ),
    headerPosition: await page.locator("header").evaluate(
      (element) => getComputedStyle(element).position,
    ),
    heroTypography: await h1.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        fontSize: Number.parseFloat(style.fontSize),
        lineHeight: Number.parseFloat(style.lineHeight),
        width: element.getBoundingClientRect().width,
      };
    }),
  };

  if (!checks.title.includes("DimkoFF")) throw new Error("Missing DimkoFF title");
  if (checks.initialLanguage !== "ru") {
    throw new Error(`Expected default RU, got ${checks.initialLanguage}`);
  }
  if (!checks.initialH1.includes("AI-продукты и Telegram Mini Apps")) {
    throw new Error(`Russian commercial hero is missing: ${checks.initialH1}`);
  }
  if (checks.englishLanguage !== "en" || !checks.englishH1.includes("AI products and Telegram Mini Apps")) {
    throw new Error(`RU/EN toggle failed: ${checks.englishH1}`);
  }
  if (!checks.restoredH1.includes("AI-продукты и Telegram Mini Apps")) {
    throw new Error("Russian language did not restore");
  }
  if (checks.serviceCards !== 5) throw new Error(`Expected 5 services, got ${checks.serviceCards}`);
  if (checks.benefits !== 6) throw new Error(`Expected 6 benefits, got ${checks.benefits}`);
  if (checks.realProducts !== 4) throw new Error(`Expected 4 real products, got ${checks.realProducts}`);
  if (checks.concepts !== 6) throw new Error(`Expected 6 concepts, got ${checks.concepts}`);
  if (checks.audiences !== 8) throw new Error(`Expected 8 audiences, got ${checks.audiences}`);
  if (checks.processSteps !== 5) throw new Error(`Expected 5 process steps, got ${checks.processSteps}`);
  if (checks.heroImages !== 1) throw new Error("3D hero object is missing");
  if (!checks.heroAsset?.includes("dimkoff-hero-monolith-v2.webp")) {
    throw new Error(`Premium hero asset is missing: ${checks.heroAsset}`);
  }
  if (checks.marqueeGroups !== 2 || checks.marqueeItems !== 24) {
    throw new Error(`Seamless marquee is incomplete: ${checks.marqueeGroups} groups / ${checks.marqueeItems} items`);
  }
  if (checks.marquee.animationName === "none" || checks.marquee.groupWidthDelta > 1) {
    throw new Error(`Seamless marquee motion failed: ${JSON.stringify(checks.marquee)}`);
  }
  if (checks.productDescriptions !== 4) {
    throw new Error(`Product proof lacks depth: ${checks.productDescriptions} descriptions`);
  }
  if (checks.heroTypography.lineHeight < checks.heroTypography.fontSize) {
    throw new Error(`Hero typography overlaps: ${JSON.stringify(checks.heroTypography)}`);
  }
  if (checks.heroTypography.width > 720) {
    throw new Error(`Hero copy is too wide: ${checks.heroTypography.width}px`);
  }
  if (checks.portfolioLinks < 2 || checks.brandbookLinks < 2) {
    throw new Error("Portfolio or brandbook routes are incomplete");
  }
  if (checks.telegramLinks < 4 || checks.phoneLinks !== 1) {
    throw new Error("Telegram or phone CTA is incomplete");
  }
  if (checks.imageFailures.length) {
    throw new Error(`Images failed to load: ${checks.imageFailures.join(", ")}`);
  }
  if (checks.bodyLength < 3000) {
    throw new Error(`Main landing content is too short: ${checks.bodyLength}`);
  }
  if (checks.horizontalOverflow > 1) {
    throw new Error(`Horizontal overflow: ${checks.horizontalOverflow}px`);
  }
  if (checks.headerPosition !== "fixed") {
    throw new Error(`Header is not fixed: ${checks.headerPosition}`);
  }
  const criticalErrors = errors.filter(
    (error) => !error.includes("ERR_NETWORK_ACCESS_DENIED"),
  );
  if (criticalErrors.length) {
    throw new Error(`Runtime errors: ${criticalErrors.join(" | ")}`);
  }

  const portfolioResponse = await page.request.head(new URL("portfolio/", base).href);
  if (!portfolioResponse.ok()) {
    throw new Error(`Portfolio response: ${portfolioResponse.status()}`);
  }
  const brandbookResponse = await page.request.head(
    new URL("portfolio/dimkoff-brandbook-2026-visual-v2.pdf", base).href,
  );
  if (!brandbookResponse.ok()) {
    throw new Error(`Brandbook response: ${brandbookResponse.status()}`);
  }
  if (!brandbookResponse.headers()["content-type"]?.includes("application/pdf")) {
    throw new Error(`Brandbook content-type: ${brandbookResponse.headers()["content-type"]}`);
  }

  await page.evaluate(async () => {
    const pause = (milliseconds) =>
      new Promise((resolve) => setTimeout(resolve, milliseconds));
    for (
      let y = 0;
      y < document.body.scrollHeight;
      y += Math.max(window.innerHeight * 0.75, 430)
    ) {
      window.scrollTo(0, y);
      await pause(60);
    }
    window.scrollTo(0, 0);
    await pause(180);
  });

  await page.screenshot({ path: path.join(output, filename), fullPage: true });

  const appPage = await context.newPage();
  await appPage.goto(base, { waitUntil: "domcontentloaded" });
  await appPage.evaluate(() => localStorage.setItem("onboarding_seen", "1"));
  await appPage.goto(new URL("app", base).href, {
    waitUntil: "networkidle",
    timeout: 45_000,
  });
  await appPage.locator("#home-hero-title").waitFor({ state: "visible" });
  const stylistAppPreserved = await appPage.locator(".bottom-nav").isVisible();
  await appPage.close();
  await context.close();

  if (!stylistAppPreserved) throw new Error("Stylist AI app route is not preserved");
  return { ...checks, stylistAppPreserved };
}

await mkdir(output, { recursive: true });
const desktop = await verify({ width: 1440, height: 1000 }, "main-desktop.png");
const mobile = await verify({ width: 390, height: 844 }, "main-mobile.png");
console.log(JSON.stringify({ base, desktop, mobile }, null, 2));
await browser.close();
