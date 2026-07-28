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

async function revealPage(page) {
  await page.evaluate(async () => {
    const pause = (milliseconds) =>
      new Promise((resolve) => setTimeout(resolve, milliseconds));
    const previousBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";
    for (const element of document.querySelectorAll("[data-agency-reveal]")) {
      element.scrollIntoView({ block: "center" });
      await pause(70);
    }
    window.scrollTo(0, 0);
    document.documentElement.style.scrollBehavior = previousBehavior;
    await pause(240);
  });
}

async function verify(viewport, filename) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const errors = [];

  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  const response = await page.goto(base, {
    waitUntil: "domcontentloaded",
    timeout: 45_000,
  });
  if (!response?.ok()) {
    throw new Error(`Main landing response: ${response?.status()}`);
  }

  const landing = page.locator('[data-testid="dimkoff-main-landing"]');
  await landing.waitFor({ state: "visible" });
  const loader = page.locator('[data-testid="dimkoff-loader"]');
  const loaderWasVisible = await loader.isVisible().catch(() => false);
  if (filename.includes("desktop") && loaderWasVisible) {
    await page.screenshot({
      path: path.join(output, "main-loader-desktop.png"),
      fullPage: false,
    });
  }
  await loader.waitFor({ state: "detached", timeout: 8_000 }).catch(() => {});
  await page.waitForLoadState("networkidle");

  const h1 = landing.locator("h1");
  await h1.waitFor({ state: "visible" });
  const isMobile = viewport.width < 900;
  if (isMobile) {
    await page.locator('button[aria-controls="agency-nav"]').click();
    await page.locator("#agency-nav").waitFor({ state: "visible" });
  }

  const initialLanguage = await page.locator("html").getAttribute("lang");
  const initialH1 = await h1.innerText();
  await page.locator('button[aria-pressed="false"]:visible').first().click();
  const englishH1 = await h1.innerText();
  const englishLanguage = await page.locator("html").getAttribute("lang");
  await page.locator('button[aria-pressed="false"]:visible').first().click();
  const restoredH1 = await h1.innerText();

  if (isMobile) {
    await page.locator('button[aria-controls="agency-nav"]').click();
  }

  await revealPage(page);
  await page.locator("img").evaluateAll(async (images) => {
    images.forEach((image) => {
      image.loading = "eager";
    });
    await Promise.all(
      images.map((image) => {
        if (image.complete) return Promise.resolve();
        return new Promise((resolve) => {
          image.addEventListener("load", resolve, { once: true });
          image.addEventListener("error", resolve, { once: true });
        });
      }),
    );
  });

  const checks = {
    title: await page.title(),
    loaderWasVisible,
    initialLanguage,
    initialH1,
    englishLanguage,
    englishH1,
    restoredH1,
    serviceCards: await page.locator("#services article").count(),
    projectCards: await page.locator("#projects article").count(),
    projectImages: await page.locator("#projects article img").count(),
    conceptCards: await page.locator("#concepts article").count(),
    aiDirectorDetails: await page.locator("#concepts article").first().locator("ul li").count(),
    experienceCards: await page.locator('[class*="experienceStage"] article').count(),
    experienceImages: await page.locator('[class*="experienceStage"] article img').count(),
    processSteps: await page.locator("#process ol li").count(),
    formatChips: await page.locator("#contact [class*='formatList'] span").count(),
    heroImages: await page.locator('[class*="heroScene"] > img').count(),
    heroAsset: await page.locator('[class*="heroScene"] > img').getAttribute("src"),
    portalMarks: await page.locator("header svg, footer svg").count(),
    marqueeGroups: await page
      .locator('[data-testid="seamless-marquee"] [class*="marqueeGroup"]')
      .count(),
    marqueeItems: await page
      .locator('[data-testid="seamless-marquee"] [class*="marqueeGroup"] > span')
      .count(),
    marquee: await page
      .locator('[data-testid="seamless-marquee"] [class*="marqueeTrack"]')
      .evaluate((track) => {
        const widths = [...track.children].map(
          (group) => group.getBoundingClientRect().width,
        );
        return {
          animationName: getComputedStyle(track).animationName,
          groupWidthDelta: Math.max(...widths) - Math.min(...widths),
        };
      }),
    portfolioLinks: await page
      .locator('a[href*="/portfolio/"]:not([href$=".pdf"])')
      .count(),
    brandbookLinks: await page
      .locator('a[href$="dimkoff-brandbook-2026-visual-v2.pdf"]')
      .count(),
    downloadLinks: await page.locator("a[download]").count(),
    telegramLinks: await page
      .locator('a[href="https://t.me/AIStudioDimkoFF"]')
      .count(),
    phoneLinks: await page.locator('a[href="tel:+79999357608"]').count(),
    imageFailures: await page.locator("img").evaluateAll((images) =>
      images
        .filter((image) => !image.complete || image.naturalWidth === 0)
        .map((image) => image.currentSrc || image.src),
    ),
    hiddenReveals: await page
      .locator("[data-agency-reveal]")
      .evaluateAll((elements) =>
        elements.filter((element) => getComputedStyle(element).opacity === "0")
          .length,
      ),
    bodyLength: (await page.locator("body").innerText()).trim().length,
    horizontalOverflow: await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    ),
    headerPosition: await page
      .locator("header")
      .evaluate((element) => getComputedStyle(element).position),
    heroTypography: await h1.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        fontSize: Number.parseFloat(style.fontSize),
        lineHeight: Number.parseFloat(style.lineHeight),
        width: element.getBoundingClientRect().width,
      };
    }),
    heroComposition: await page
      .locator('[class*="heroScene"]')
      .evaluate((scene) => {
        const hero = scene.closest("section");
        const image = scene.querySelector("img");
        const sceneRect = scene.getBoundingClientRect();
        const heroRect = hero?.getBoundingClientRect();
        return {
          position: getComputedStyle(scene).position,
          widthRatio: heroRect ? sceneRect.width / heroRect.width : 0,
          imageRadius: image
            ? Number.parseFloat(getComputedStyle(image).borderRadius)
            : -1,
        };
      }),
  };

  if (!checks.title.includes("DimkoFF")) throw new Error("Missing DimkoFF title");
  if (!checks.loaderWasVisible) throw new Error("Opening loader was not visible");
  if (checks.initialLanguage !== "ru" || !checks.initialH1.includes("AI-продукты")) {
    throw new Error(`Russian hero is missing: ${checks.initialH1}`);
  }
  if (
    checks.englishLanguage !== "en" ||
    !checks.englishH1.includes("AI products")
  ) {
    throw new Error(`RU/EN toggle failed: ${checks.englishH1}`);
  }
  if (!checks.restoredH1.includes("AI-продукты")) {
    throw new Error("Russian language did not restore");
  }
  if (checks.serviceCards !== 6) {
    throw new Error(`Expected 6 services, got ${checks.serviceCards}`);
  }
  if (checks.projectCards !== 6 || checks.projectImages !== 6) {
    throw new Error(
      `Expected 6 visual projects, got ${checks.projectCards}/${checks.projectImages}`,
    );
  }
  if (checks.conceptCards !== 6 || checks.aiDirectorDetails !== 3) {
    throw new Error(
      `Concept Lab is incomplete: ${checks.conceptCards}/${checks.aiDirectorDetails}`,
    );
  }
  if (checks.experienceCards !== 3 || checks.experienceImages !== 3) {
    throw new Error(
      `Digital Experiences is incomplete: ${checks.experienceCards}/${checks.experienceImages}`,
    );
  }
  if (checks.processSteps !== 5) {
    throw new Error(`Expected 5 process steps, got ${checks.processSteps}`);
  }
  if (checks.formatChips < 7) {
    throw new Error(`Project formats are incomplete: ${checks.formatChips}`);
  }
  if (
    checks.heroImages !== 1 ||
    !checks.heroAsset?.includes("dimkoff-digital-portal-v3.webp")
  ) {
    throw new Error(`Digital Portal hero is missing: ${checks.heroAsset}`);
  }
  if (checks.portalMarks < 2) {
    throw new Error(`2D Digital Portal identity is incomplete: ${checks.portalMarks}`);
  }
  if (checks.marqueeGroups !== 3 || checks.marqueeItems !== 36) {
    throw new Error(
      `Seamless marquee is incomplete: ${checks.marqueeGroups}/${checks.marqueeItems}`,
    );
  }
  if (
    checks.marquee.animationName === "none" ||
    checks.marquee.groupWidthDelta > 1
  ) {
    throw new Error(`Marquee motion failed: ${JSON.stringify(checks.marquee)}`);
  }
  if (checks.heroTypography.lineHeight < checks.heroTypography.fontSize) {
    throw new Error(
      `Hero typography overlaps: ${JSON.stringify(checks.heroTypography)}`,
    );
  }
  if (checks.heroComposition.position !== "absolute") {
    throw new Error(
      `Hero is not a monolithic scene: ${JSON.stringify(checks.heroComposition)}`,
    );
  }
  if (
    checks.portfolioLinks < 2 ||
    checks.brandbookLinks < 2 ||
    checks.downloadLinks < 1
  ) {
    throw new Error(
      `Portfolio or brandbook routes are incomplete: ${checks.portfolioLinks}/${checks.brandbookLinks}/${checks.downloadLinks}`,
    );
  }
  if (checks.telegramLinks < 4 || checks.phoneLinks !== 1) {
    throw new Error("Telegram or phone CTA is incomplete");
  }
  if (checks.imageFailures.length) {
    throw new Error(`Images failed to load: ${checks.imageFailures.join(", ")}`);
  }
  if (checks.hiddenReveals > 0) {
    throw new Error(`Scroll reveal left ${checks.hiddenReveals} blocks hidden`);
  }
  if (checks.bodyLength < 4_000) {
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

  const portfolioResponse = await page.request.head(
    new URL("portfolio/", base).href,
  );
  if (!portfolioResponse.ok()) {
    throw new Error(`Portfolio response: ${portfolioResponse.status()}`);
  }
  const brandbookResponse = await page.request.head(
    new URL("portfolio/dimkoff-brandbook-2026-visual-v2.pdf", base).href,
  );
  if (!brandbookResponse.ok()) {
    throw new Error(`Brandbook response: ${brandbookResponse.status()}`);
  }
  if (
    !brandbookResponse.headers()["content-type"]?.includes("application/pdf")
  ) {
    throw new Error(
      `Brandbook content-type: ${brandbookResponse.headers()["content-type"]}`,
    );
  }
  const faviconResponse = await page.request.get(
    new URL("favicon.svg", base).href,
  );
  if (!faviconResponse.ok()) {
    throw new Error(`Favicon response: ${faviconResponse.status()}`);
  }

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

  if (!stylistAppPreserved) {
    throw new Error("Stylist AI app route is not preserved");
  }
  return { ...checks, stylistAppPreserved };
}

await mkdir(output, { recursive: true });
const desktop = await verify({ width: 1440, height: 1000 }, "main-desktop.png");
const mobile = await verify({ width: 390, height: 844 }, "main-mobile.png");
console.log(JSON.stringify({ base, desktop, mobile }, null, 2));
await browser.close();
