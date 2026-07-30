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

const routeUrl = (route) => new URL(route.replace(/^\//, ""), base).href;

async function openPage(context, route, testId, errors) {
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(`${route}: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`${route}: ${message.text()}`);
  });
  const response = await page.goto(routeUrl(route), {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  if (!response?.ok()) {
    throw new Error(`${route} returned ${response?.status()}`);
  }
  await page.locator(`[data-testid="${testId}"]`).waitFor({
    state: "visible",
    timeout: 30_000,
  });
  await page.waitForLoadState("networkidle");
  return page;
}

async function pageHealth(page) {
  return {
    overflow: await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    ),
    bodyLength: (await page.locator("body").innerText()).trim().length,
    headerPosition: await page
      .locator("header")
      .first()
      .evaluate((element) => getComputedStyle(element).position),
    failedImages: await page.locator("img").evaluateAll((images) =>
      images
        .filter(
          (image) =>
            image.offsetParent !== null &&
            image.currentSrc &&
            (!image.complete || image.naturalWidth === 0),
        )
        .map((image) => image.currentSrc),
    ),
  };
}

async function verifyHome(viewport, name) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const errors = [];
  const page = await openPage(
    context,
    "/",
    "dimkoff-lite-home",
    errors,
  );

  const h1 = (await page.locator("#top h1").innerText()).replace(/\s+/g, " ");
  const checks = {
    h1,
    heroScenes: await page.locator("section[data-testid$='scene']").count(),
    canvases: await page.locator("canvas").count(),
    directions: await page.locator('[class*="directionGrid"] > a').count(),
    featured: await page.locator('[class*="featuredGrid"] > a').count(),
    reasons: await page.locator('[class*="reasonGrid"] > article').count(),
    heavyScenes: await page
      .locator(
        '[data-testid="crystal-shatter-scene"], [data-testid="fold-screen-scene"], [data-testid="phone-showcase-scene"], [data-testid="card-stack-scene"], [data-testid="collage-scatter-scene"]',
      )
      .count(),
    telegramLinks: await page
      .locator('a[href="https://t.me/AIStudioDimkoFF"]')
      .count(),
    projectLinks: await page.locator('a[href*="/projects"]').count(),
    portfolioLinks: await page.locator('a[href*="/portfolio/"]').count(),
    health: await pageHealth(page),
  };

  if (
    !checks.h1.includes("digital") ||
    checks.heroScenes !== 1 ||
    checks.canvases !== 1 ||
    checks.directions !== 4 ||
    checks.featured !== 3 ||
    checks.reasons !== 3 ||
    checks.heavyScenes !== 0
  ) {
    throw new Error(`Light home contract failed: ${JSON.stringify(checks)}`);
  }
  if (
    checks.telegramLinks < 2 ||
    checks.projectLinks < 2 ||
    checks.portfolioLinks < 2
  ) {
    throw new Error(`Home routes are incomplete: ${JSON.stringify(checks)}`);
  }
  if (
    checks.health.overflow > 1 ||
    checks.health.headerPosition !== "fixed" ||
    checks.health.failedImages.length
  ) {
    throw new Error(`Home visual health failed: ${JSON.stringify(checks.health)}`);
  }

  await page.screenshot({
    path: path.join(output, `home-${name}.png`),
    fullPage: false,
  });

  const critical = errors.filter(
    (error) =>
      !error.includes("ERR_NETWORK_ACCESS_DENIED") &&
      !error.includes("THREE.WebGLRenderer"),
  );
  if (critical.length) throw new Error(critical.join(" | "));
  await context.close();
  return checks;
}

async function verifyInternalPages() {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 1,
  });
  const errors = [];
  const definitions = [
    {
      route: "/services/",
      testId: "dimkoff-services-page",
      selector: '[class*="serviceSheets"] > section',
      expected: 4,
      screenshot: "services-desktop.png",
    },
    {
      route: "/projects/",
      testId: "dimkoff-projects-page",
      selector: '[class*="projectSheets"] > article',
      expected: 6,
      screenshot: "projects-desktop.png",
    },
    {
      route: "/concepts/",
      testId: "dimkoff-concepts-page",
      selector: '[class*="conceptSheets"] > article',
      expected: 6,
      screenshot: "concepts-desktop.png",
    },
  ];
  const results = {};

  for (const definition of definitions) {
    const page = await openPage(
      context,
      definition.route,
      definition.testId,
      errors,
    );
    const cards = await page.locator(definition.selector).count();
    const health = await pageHealth(page);
    if (
      cards !== definition.expected ||
      health.overflow > 1 ||
      health.failedImages.length
    ) {
      throw new Error(
        `${definition.route} failed: ${JSON.stringify({ cards, health })}`,
      );
    }
    if (
      definition.route === "/concepts/" &&
      !(await page.locator("body").innerText()).includes(
        "CONCEPT / IN DEVELOPMENT",
      )
    ) {
      throw new Error("AI Director concept status is missing");
    }
    await page.screenshot({
      path: path.join(output, definition.screenshot),
      fullPage: false,
    });
    results[definition.route] = { cards, ...health };
    await page.close();
  }

  const portfolio = await context.request.get(routeUrl("/portfolio/"));
  if (!portfolio.ok()) {
    throw new Error(`/portfolio/ returned ${portfolio.status()}`);
  }
  results["/portfolio/"] = {
    status: portfolio.status(),
    contentType: portfolio.headers()["content-type"],
  };

  const critical = errors.filter(
    (error) => !error.includes("ERR_NETWORK_ACCESS_DENIED"),
  );
  if (critical.length) throw new Error(critical.join(" | "));
  await context.close();
  return results;
}

async function verifyInternalMobile() {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
  });
  const errors = [];
  const definitions = [
    ["/services/", "dimkoff-services-page", '[class*="serviceSheets"] > section', 4],
    ["/projects/", "dimkoff-projects-page", '[class*="projectSheets"] > article', 6],
    ["/concepts/", "dimkoff-concepts-page", '[class*="conceptSheets"] > article', 6],
  ];
  const results = {};

  for (const [route, testId, selector, expected] of definitions) {
    const page = await openPage(context, route, testId, errors);
    const cards = await page.locator(selector).count();
    const health = await pageHealth(page);
    if (cards !== expected || health.overflow > 1 || health.failedImages.length) {
      throw new Error(`${route} mobile failed: ${JSON.stringify({ cards, health })}`);
    }
    results[route] = { cards, ...health };
    await page.close();
  }

  const critical = errors.filter(
    (error) => !error.includes("ERR_NETWORK_ACCESS_DENIED"),
  );
  if (critical.length) throw new Error(critical.join(" | "));
  await context.close();
  return results;
}

async function verifyAppPreserved() {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto(routeUrl("/app"), {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  await page.evaluate(() => localStorage.setItem("onboarding_seen", "1"));
  await page.reload({ waitUntil: "networkidle" });
  await page.locator("#home-hero-title").waitFor({
    state: "visible",
    timeout: 30_000,
  });
  const preserved = await page.locator(".bottom-nav").isVisible();
  await context.close();
  if (!preserved) throw new Error("Stylist AI /app route is not preserved");
  return preserved;
}

await mkdir(output, { recursive: true });
const results = {
  desktop: await verifyHome({ width: 1440, height: 1000 }, "desktop"),
  mobile: await verifyHome({ width: 390, height: 844 }, "mobile"),
  pages: await verifyInternalPages(),
  mobilePages: await verifyInternalMobile(),
  appPreserved: await verifyAppPreserved(),
};
console.log(JSON.stringify({ base, ...results }, null, 2));
await browser.close();
