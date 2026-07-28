import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
const output = path.resolve(
  root,
  process.env.PORTFOLIO_SCREENSHOT_DIR || "output/screenshots/portfolio-live",
);
const base =
  process.env.PORTFOLIO_BASE_URL ||
  "http://127.0.0.1:4173/stylist-mini-app/portfolio/";
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
  if (!response?.ok()) throw new Error(`Portfolio response: ${response?.status()}`);

  const h1 = page.locator("h1");
  await h1.waitFor({ state: "visible" });
  await page.locator(".hero-object").waitFor({ state: "visible" });

  const isMobile = viewport.width < 1120;
  if (isMobile) {
    await page.locator("[data-menu]").click();
    await page.locator("[data-nav]").waitFor({ state: "visible" });
  }

  const initialLanguage = await page.locator("html").getAttribute("lang");
  const initialH1 = await h1.innerText();
  const englishToggle = page.locator('[data-language="en"]:visible').first();
  await englishToggle.click();
  const englishH1 = await h1.innerText();
  const englishLanguage = await page.locator("html").getAttribute("lang");
  await page.locator('[data-language="ru"]:visible').first().click();
  const restoredH1 = await h1.innerText();

  if (isMobile) {
    await page.locator("[data-menu]").click();
  }

  await page.locator("#experiences").scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);

  await page.evaluate(async () => {
    const pause = (milliseconds) =>
      new Promise((resolve) => setTimeout(resolve, milliseconds));
    for (
      let y = 0;
      y < document.body.scrollHeight;
      y += Math.max(window.innerHeight * 0.72, 420)
    ) {
      window.scrollTo(0, y);
      await pause(65);
    }
    window.scrollTo(0, 0);
    await pause(180);
  });

  const checks = {
    title: await page.title(),
    initialLanguage,
    initialH1,
    englishLanguage,
    englishH1,
    restoredH1,
    serviceCards: await page.locator(".service-card").count(),
    projectCards: await page.locator(".project-card").count(),
    mainCases: await page.locator("#products .case-card").count(),
    bots: await page.locator("#products .bot-card").count(),
    experiences: await page.locator("#experiences .experience-card").count(),
    floatingBoxes: await page.locator(".hero-scene .floating-box").count(),
    brandbookLinks: await page
      .locator('a[href$="dimkoff-brandbook-2026-visual-v2.pdf"]')
      .count(),
    brandbookDownloadLinks: await page
      .locator('a[download][href$="dimkoff-brandbook-2026-visual-v2.pdf"]')
      .count(),
    telegramLinks: await page
      .locator('a[href="https://t.me/AIStudioDimkoFF"]')
      .count(),
    phoneLinks: await page.locator('a[href="tel:+79999357608"]').count(),
    imageFailures: await page
      .locator("img")
      .evaluateAll((images) =>
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
    overflowOffenders: await page.evaluate(() =>
      [...document.querySelectorAll("body *")]
        .map((element) => {
          const bounds = element.getBoundingClientRect();
          return {
            element: `${element.tagName.toLowerCase()}.${[...element.classList].join(".")}`,
            left: Math.round(bounds.left),
            right: Math.round(bounds.right),
          };
        })
        .filter(
          ({ left, right }) => left < -1 || right > document.documentElement.clientWidth + 1,
        )
        .slice(0, 8),
    ),
    headerPosition: await page.locator("[data-header]").evaluate(
      (element) => getComputedStyle(element).position,
    ),
  };

  if (!checks.title.includes("DimkoFF")) throw new Error("Missing DimkoFF title");
  if (checks.initialLanguage !== "ru") {
    throw new Error(`Expected default RU language, got ${checks.initialLanguage}`);
  }
  if (!checks.initialH1.includes("AI-продукты")) {
    throw new Error(`Russian hero is missing: ${checks.initialH1}`);
  }
  if (checks.englishLanguage !== "en" || !checks.englishH1.includes("AI products")) {
    throw new Error(`RU/EN toggle failed: ${checks.englishH1}`);
  }
  if (!checks.restoredH1.includes("AI-продукты")) {
    throw new Error("RU language did not restore");
  }
  if (checks.serviceCards !== 4) {
    throw new Error(`Expected 4 service cards, got ${checks.serviceCards}`);
  }
  if (checks.projectCards !== 4) {
    throw new Error(`Expected 4 project cards, got ${checks.projectCards}`);
  }
  if (checks.mainCases !== 2) {
    throw new Error(`Expected 2 main cases, got ${checks.mainCases}`);
  }
  if (checks.bots !== 3) {
    throw new Error(`Expected 3 bot cards, got ${checks.bots}`);
  }
  if (checks.experiences !== 3) {
    throw new Error(`Expected 3 experiences, got ${checks.experiences}`);
  }
  if (checks.floatingBoxes !== 3) {
    throw new Error(`Expected 3 floating boxes, got ${checks.floatingBoxes}`);
  }
  if (checks.brandbookLinks < 3 || checks.brandbookDownloadLinks !== 1) {
    throw new Error("Brandbook open/download routes are incomplete");
  }
  if (checks.telegramLinks < 3 || checks.phoneLinks < 2) {
    throw new Error("Telegram or phone CTA is incomplete");
  }
  if (checks.imageFailures.length) {
    throw new Error(`Images failed to load: ${checks.imageFailures.join(", ")}`);
  }
  if (checks.bodyLength < 2200) {
    throw new Error(`Main UI did not render enough content: ${checks.bodyLength}`);
  }
  if (checks.horizontalOverflow > 1) {
    throw new Error(
      `Horizontal overflow: ${checks.horizontalOverflow}px; ${JSON.stringify(checks.overflowOffenders)}`,
    );
  }
  if (checks.headerPosition !== "fixed") {
    throw new Error(`Header is not fixed: ${checks.headerPosition}`);
  }
  if (errors.length) throw new Error(`Runtime errors: ${errors.join(" | ")}`);

  const pdfResponse = await page.request.head(
    new URL("dimkoff-brandbook-2026-visual-v2.pdf", base).href,
  );
  if (!pdfResponse.ok()) {
    throw new Error(`Visual Brandbook response: ${pdfResponse.status()}`);
  }
  if (!pdfResponse.headers()["content-type"]?.includes("application/pdf")) {
    throw new Error(
      `Visual Brandbook content-type: ${pdfResponse.headers()["content-type"]}`,
    );
  }

  await page.screenshot({ path: path.join(output, filename), fullPage: true });
  await context.close();
  return checks;
}

await mkdir(output, { recursive: true });
const desktop = await verify({ width: 1440, height: 1000 }, "portfolio-desktop.png");
const mobile = await verify({ width: 390, height: 844 }, "portfolio-mobile.png");
console.log(JSON.stringify({ base, desktop, mobile }, null, 2));
await browser.close();
