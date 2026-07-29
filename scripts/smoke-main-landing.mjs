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

async function scrollScene(page, testId, progress) {
  await page.locator(`[data-testid="${testId}"]`).evaluate(
    (element, value) => {
      const top = element.getBoundingClientRect().top + window.scrollY;
      const distance = Math.max(1, element.clientHeight - window.innerHeight);
      window.scrollTo(0, top + distance * value);
    },
    progress,
  );
  await page.waitForTimeout(420);
}

async function captureStage(page, filename) {
  await page.screenshot({
    path: path.join(output, filename),
    fullPage: false,
  });
}

async function revealInformation(page) {
  for (const selector of [
    "#services",
    "#projects",
    "#concepts",
    '[class*="experienceSection"]',
    "#process",
    "#brandbook",
    "#contact",
  ]) {
    await page.evaluate((target) => {
      document.querySelector(target)?.scrollIntoView({ block: "center" });
    }, selector);
    await page.waitForTimeout(180);
  }
  await page.waitForTimeout(900);
}

async function captureHeroMotion() {
  const videoDir = path.join(output, "video-temp");
  await mkdir(videoDir, { recursive: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: videoDir,
      size: { width: 1440, height: 900 },
    },
  });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: "domcontentloaded", timeout: 45_000 });
  await page
    .locator('[data-testid="dimkoff-loader"]')
    .waitFor({ state: "detached", timeout: 8_000 })
    .catch(() => {});
  await page.waitForTimeout(1_000);
  await scrollScene(page, "portal-intro-scene", 0.18);
  await page.waitForTimeout(2_200);
  await scrollScene(page, "portal-intro-scene", 0.48);
  await page.waitForTimeout(2_200);
  await scrollScene(page, "portal-intro-scene", 0.08);
  await page.waitForTimeout(2_200);
  const video = page.video();
  await page.close();
  if (video) {
    await video.saveAs(path.join(output, "dimkoff-hero-motion-12s.webm"));
  }
  await context.close();
}

async function verify(viewport, filename) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const errors = [];
  const isMobile = viewport.width < 900;

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
    await captureStage(page, "main-loader-desktop.png");
  }
  await loader.waitFor({ state: "detached", timeout: 8_000 }).catch(() => {});
  await page.waitForLoadState("networkidle");
  await page.addStyleTag({
    content: "html{scroll-behavior:auto!important}",
  });

  const h1 = page.locator("#top h1");
  await h1.waitFor({ state: "visible" });
  const initialLanguage = await page.locator("html").getAttribute("lang");
  const initialH1 = await h1.innerText();
  if (filename.includes("desktop")) {
    await captureStage(page, "scene-01-portal-dimkoff.png");
  }

  if (isMobile) {
    await page.locator('button[aria-controls="agency-nav"]').click();
    await page.locator("#agency-nav").waitFor({ state: "visible" });
  }
  await page.locator('button[aria-pressed="false"]:visible').first().click();
  const englishLanguage = await page.locator("html").getAttribute("lang");
  const englishCopy = await page
    .locator('[data-testid="portal-intro-scene"]')
    .innerText();
  await page.locator('button[aria-pressed="false"]:visible').first().click();
  if (isMobile) {
    await page.locator('button[aria-controls="agency-nav"]').click();
  }

  const heroGeometry = await h1.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    return {
      width: bounds.width,
      height: bounds.height,
      scrollWidth: element.scrollWidth,
      scrollHeight: element.scrollHeight,
      fontSize: Number.parseFloat(getComputedStyle(element).fontSize),
    };
  });

  await scrollScene(page, "crystal-shatter-scene", 0.08);
  if (filename.includes("desktop")) {
    await captureStage(page, "scene-02-crystal-assembled.png");
  }
  await scrollScene(page, "crystal-shatter-scene", 0.82);
  const crystalCount = Number(
    (
      await page
        .locator('[data-testid="crystal-shatter-scene"] strong')
        .last()
        .innerText()
    ).replace(/\D/g, ""),
  );
  if (filename.includes("desktop")) {
    await captureStage(page, "scene-02-crystal-scattered.png");
  }

  await scrollScene(page, "fold-screen-scene", 0.04);
  const foldBefore = await page
    .locator('[data-testid="fold-screen-scene"] [class*="foldDarkLayer"]')
    .evaluate((element) => getComputedStyle(element).clipPath);
  await scrollScene(page, "fold-screen-scene", 0.82);
  const foldAfter = await page
    .locator('[data-testid="fold-screen-scene"] [class*="foldDarkLayer"]')
    .evaluate((element) => getComputedStyle(element).clipPath);
  const foldBands = await page
    .locator('[data-testid="fold-screen-scene"] [class*="foldShutters"] i')
    .count();
  if (filename.includes("desktop")) {
    await captureStage(page, "scene-03-fold-transition.png");
  }
  await scrollScene(page, "fold-screen-scene", 0.04);
  const foldReversed = await page
    .locator('[data-testid="fold-screen-scene"] [class*="foldDarkLayer"]')
    .evaluate((element) => getComputedStyle(element).clipPath);

  await scrollScene(page, "phone-showcase-scene", 0.14);
  const phoneBefore = await page
    .locator('[data-testid="phone-showcase-scene"]')
    .evaluate((section) => {
      const phones = section.querySelectorAll('[class*="phone_"]');
      const left = section.querySelector('[class*="phoneLeft"]');
      const center = section.querySelector('[class*="phoneCenterWrap"]');
      return {
        phoneCount: phones.length,
        left: left ? getComputedStyle(left).transform : "",
        center: center ? getComputedStyle(center).transform : "",
      };
    });
  await scrollScene(page, "phone-showcase-scene", 0.7);
  const phoneAfter = await page
    .locator('[data-testid="phone-showcase-scene"]')
    .evaluate((section) => {
      const left = section.querySelector('[class*="phoneLeft"]');
      const center = section.querySelector('[class*="phoneCenterWrap"]');
      return {
        left: left ? getComputedStyle(left).transform : "",
        center: center ? getComputedStyle(center).transform : "",
      };
    });
  if (filename.includes("desktop")) {
    await captureStage(page, "scene-04-phones.png");
  }

  await scrollScene(page, "card-stack-scene", 0.14);
  const stackBefore = await page
    .locator('[data-testid="card-stack-scene"] article')
    .nth(2)
    .evaluate((element) => getComputedStyle(element).transform);
  await scrollScene(page, "card-stack-scene", 0.66);
  const stackAfter = await page
    .locator('[data-testid="card-stack-scene"] article')
    .nth(2)
    .evaluate((element) => getComputedStyle(element).transform);
  const stackOverflow = await page
    .locator('[data-testid="card-stack-scene"] [class*="stackFrame"]')
    .evaluate((element) => getComputedStyle(element).overflow);
  if (filename.includes("desktop")) {
    await captureStage(page, "scene-05-card-stack.png");
  }

  await scrollScene(page, "collage-scatter-scene", 0.05);
  const collageAssembled = await page
    .locator('[data-testid="collage-scatter-scene"] figure')
    .first()
    .evaluate((element) => getComputedStyle(element).transform);
  await scrollScene(page, "collage-scatter-scene", 0.82);
  const collageScattered = await page
    .locator('[data-testid="collage-scatter-scene"] figure')
    .first()
    .evaluate((element) => getComputedStyle(element).transform);
  if (filename.includes("desktop")) {
    await captureStage(page, "scene-06-collage-scattered.png");
  }
  await scrollScene(page, "collage-scatter-scene", 0.05);
  const collageReassembled = await page
    .locator('[data-testid="collage-scatter-scene"] figure')
    .first()
    .evaluate((element) => getComputedStyle(element).transform);

  console.log(`[smoke] ${filename}: interactive stages verified`);
  await revealInformation(page);
  console.log(`[smoke] ${filename}: information floors revealed`);

  const checks = {
    title: await page.title(),
    loaderWasVisible,
    initialLanguage,
    initialH1,
    englishLanguage,
    englishCopy,
    heroGeometry,
    heroSquareFallbacks: await page.locator("#top img").count(),
    sceneCount: await page.locator("section[data-testid$='scene']").count(),
    canvases: await page.locator("canvas").count(),
    canvasSizes: await page.locator("canvas").evaluateAll((canvases) =>
      canvases.map((canvas) => ({
        width: canvas.width,
        height: canvas.height,
      })),
    ),
    crystalCount,
    foldBefore,
    foldAfter,
    foldReversed,
    foldBands,
    phoneBefore,
    phoneAfter,
    phoneChassis: await page
      .locator('[data-testid="phone-showcase-scene"] [class*="phoneChassis"]')
      .count(),
    phoneGlass: await page
      .locator('[data-testid="phone-showcase-scene"] [class*="phoneGlass"]')
      .count(),
    stackCards: await page
      .locator('[data-testid="card-stack-scene"] article')
      .count(),
    stackBefore,
    stackAfter,
    stackOverflow,
    stackObjects: await page
      .locator('[data-testid="card-stack-scene"] [class*="serviceObject_"]')
      .count(),
    stackGlassStrips: await page
      .locator('[data-testid="card-stack-scene"] [class*="stackGlassStrip"]')
      .count(),
    collageTiles: await page
      .locator('[data-testid="collage-scatter-scene"] figure')
      .count(),
    collageAssembled,
    collageScattered,
    collageReassembled,
    serviceCards: await page.locator("#services article").count(),
    projectCards: await page.locator("#projects article").count(),
    conceptCards: await page.locator("#concepts article").count(),
    experienceCards: await page
      .locator('[class*="experienceStage"] article')
      .count(),
    processSteps: await page.locator("#process ol li").count(),
    marqueeGroups: await page
      .locator('[data-testid="seamless-marquee"] [class*="marqueeGroup"]')
      .count(),
    marqueeDuration: await page
      .locator('[data-testid="seamless-marquee"] [class*="marqueeTrack"]')
      .evaluate((element) => getComputedStyle(element).animationDuration),
    portfolioLinks: await page
      .locator('a[href*="/portfolio/"]:not([href$=".pdf"])')
      .count(),
    brandbookLinks: await page
      .locator('a[href$="dimkoff-brandbook-2026-visual-v2.pdf"]')
      .count(),
    telegramLinks: await page
      .locator('a[href="https://t.me/AIStudioDimkoFF"]')
      .count(),
    imageFailures: await page.locator("img").evaluateAll((images) =>
      images
        .filter(
          (image) =>
            image.offsetParent !== null &&
            image.currentSrc &&
            (!image.complete || image.naturalWidth === 0),
        )
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
  };

  if (!checks.title.includes("DimkoFF")) throw new Error("Missing DimkoFF title");
  if (!checks.loaderWasVisible) throw new Error("Opening loader was not visible");
  if (
    checks.initialLanguage !== "ru" ||
    !checks.initialH1.includes("AI-продукты") ||
    !checks.initialH1.includes("для роста бизнеса")
  ) {
    throw new Error(`Opening title is incorrect: ${checks.initialH1}`);
  }
  if (
    checks.englishLanguage !== "en" ||
    !checks.englishCopy.includes("DimkoFF connects SMM")
  ) {
    throw new Error("RU/EN toggle failed in the portal scene");
  }
  if (
    checks.heroGeometry.scrollWidth > checks.heroGeometry.width + 2 ||
    checks.heroGeometry.scrollHeight > checks.heroGeometry.height + 16 ||
    checks.heroSquareFallbacks !== 0
  ) {
    throw new Error(`Hero typography or square fallback failed: ${JSON.stringify(checks.heroGeometry)}`);
  }
  if (checks.sceneCount !== 6 || checks.canvases !== 2) {
    throw new Error(
      `Interactive scenes are incomplete: ${checks.sceneCount}/${checks.canvases}`,
    );
  }
  if (
    checks.canvasSizes.some(
      (canvas) =>
        canvas.width < (isMobile ? 260 : 300) ||
        canvas.height < (isMobile ? 520 : 300),
    )
  ) {
    throw new Error(`WebGL canvas is undersized: ${JSON.stringify(checks.canvasSizes)}`);
  }
  if (checks.crystalCount < 1_000) {
    throw new Error(`Crystal field did not unfold: ${checks.crystalCount}`);
  }
  if (
    checks.foldBands !== 6 ||
    checks.foldBefore === checks.foldAfter ||
    checks.foldBefore !== checks.foldReversed
  ) {
    throw new Error("Reversible folding screen failed");
  }
  if (
    checks.phoneBefore.left !== checks.phoneAfter.left ||
    checks.phoneBefore.center === checks.phoneAfter.center ||
    checks.phoneChassis !== 3 ||
    checks.phoneGlass !== 3
  ) {
    throw new Error("Phone scene motion contract failed");
  }
  if (
    checks.stackCards !== 5 ||
    checks.stackBefore === checks.stackAfter ||
    checks.stackOverflow !== "hidden" ||
    checks.stackObjects !== 5 ||
    checks.stackGlassStrips !== 5
  ) {
    throw new Error("Card stack does not move inside the fixed frame");
  }
  if (
    checks.collageTiles !== 7 ||
    checks.collageAssembled === checks.collageScattered ||
    checks.collageAssembled !== checks.collageReassembled
  ) {
    throw new Error("Reversible scatter collage failed");
  }
  if (
    checks.serviceCards !== 6 ||
    checks.projectCards !== 6 ||
    checks.conceptCards !== 6 ||
    checks.experienceCards !== 3 ||
    checks.processSteps !== 5
  ) {
    throw new Error("An informational floor is incomplete");
  }
  if (checks.marqueeGroups !== 3 || checks.marqueeDuration !== "36s") {
    throw new Error(`Marquee is incomplete: ${checks.marqueeGroups}/${checks.marqueeDuration}`);
  }
  if (checks.portfolioLinks < 2 || checks.brandbookLinks < 2) {
    throw new Error("Portfolio or brandbook routes are incomplete");
  }
  if (checks.telegramLinks < 4) throw new Error("Telegram CTA is incomplete");
  if (checks.imageFailures.length) {
    throw new Error(`Images failed to load: ${checks.imageFailures.join(", ")}`);
  }
  if (!isMobile && checks.hiddenReveals > 0) {
    throw new Error(`Scroll reveal left ${checks.hiddenReveals} blocks hidden`);
  }
  if (checks.bodyLength < 5_500) {
    throw new Error(`Main landing content is too short: ${checks.bodyLength}`);
  }
  if (checks.horizontalOverflow > 1) {
    throw new Error(`Horizontal overflow: ${checks.horizontalOverflow}px`);
  }
  if (checks.headerPosition !== "fixed") {
    throw new Error(`Header is not fixed: ${checks.headerPosition}`);
  }

  const criticalErrors = errors.filter(
    (error) =>
      !error.includes("ERR_NETWORK_ACCESS_DENIED") &&
      !error.includes("THREE.WebGLRenderer"),
  );
  if (criticalErrors.length) {
    throw new Error(`Runtime errors: ${criticalErrors.join(" | ")}`);
  }
  console.log(`[smoke] ${filename}: assertions passed`);

  const portfolioResponse = await page.request.head(
    new URL("portfolio/", base).href,
  );
  const brandbookResponse = await page.request.head(
    new URL("portfolio/dimkoff-brandbook-2026-visual-v2.pdf", base).href,
  );
  if (!portfolioResponse.ok() || !brandbookResponse.ok()) {
    throw new Error("Published materials are unavailable");
  }
  if (
    !brandbookResponse.headers()["content-type"]?.includes("application/pdf")
  ) {
    throw new Error("Brandbook does not return PDF");
  }
  console.log(`[smoke] ${filename}: linked materials passed`);

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(output, filename), fullPage: false });
  console.log(`[smoke] ${filename}: main screenshot captured`);

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
  console.log(`[smoke] ${filename}: /app preserved`);

  return { ...checks, stylistAppPreserved };
}

await mkdir(output, { recursive: true });
const only = process.env.MAIN_LANDING_ONLY;
const results = {};
if (only !== "mobile") {
  results.desktop = await verify(
    { width: 1440, height: 1000 },
    "main-desktop.png",
  );
  await captureHeroMotion();
}
if (only !== "desktop") {
  results.mobile = await verify(
    { width: 390, height: 844 },
    "main-mobile.png",
  );
}
console.log(JSON.stringify({ base, ...results }, null, 2));
await browser.close();
