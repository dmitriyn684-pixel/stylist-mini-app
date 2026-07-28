const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu]");
const nav = document.querySelector("[data-nav]");
const languageButtons = [...document.querySelectorAll("[data-language]")];
const translatableElements = [...document.querySelectorAll("[data-i18n]")];
const heroScene = document.querySelector("[data-hero-scene]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

function setMenu(open) {
  menuButton?.setAttribute("aria-expanded", String(open));
  nav?.classList.toggle("open", open);
  document.body.classList.toggle("menu-open", open);
}

window.addEventListener(
  "scroll",
  () => header?.classList.toggle("scrolled", window.scrollY > 24),
  { passive: true },
);

menuButton?.addEventListener("click", () => {
  setMenu(menuButton.getAttribute("aria-expanded") !== "true");
});

nav?.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) setMenu(false);
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenu(false);
});

function applyLanguage(language, persist = true) {
  const nextLanguage = language === "en" ? "en" : "ru";
  document.documentElement.lang = nextLanguage;

  for (const element of translatableElements) {
    const value = element.dataset[nextLanguage];
    if (value) element.textContent = value;
  }

  for (const button of languageButtons) {
    button.setAttribute("aria-pressed", String(button.dataset.language === nextLanguage));
  }

  document.title =
    nextLanguage === "ru"
      ? "DimkoFF — AI Product Builder"
      : "DimkoFF — SMM + AI Product Builder";

  const description = document.querySelector('meta[name="description"]');
  description?.setAttribute(
    "content",
    nextLanguage === "ru"
      ? "DimkoFF — AI-продукты, Telegram Mini Apps, SMM-системы и премиальные digital experiences для бизнеса."
      : "DimkoFF — AI products, Telegram Mini Apps, SMM systems and premium digital experiences for business.",
  );

  if (persist) {
    try {
      localStorage.setItem("dimkoff-language", nextLanguage);
    } catch {
      // Storage is optional; Russian remains the safe default.
    }
  }
}

let initialLanguage = "ru";
try {
  initialLanguage = localStorage.getItem("dimkoff-language") || "ru";
} catch {
  initialLanguage = "ru";
}
applyLanguage(initialLanguage, false);

for (const button of languageButtons) {
  button.addEventListener("click", () => applyLanguage(button.dataset.language));
}

const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  },
  { threshold: 0.08, rootMargin: "0px 0px -5% 0px" },
);

document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

if (finePointer.matches && !reduceMotion.matches) {
  document.querySelectorAll("[data-tilt]").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      card.style.setProperty("--ry", `${x * 5.5}deg`);
      card.style.setProperty("--rx", `${y * -5.5}deg`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--ry", "0deg");
      card.style.setProperty("--rx", "0deg");
    });
  });

  heroScene?.addEventListener("pointermove", (event) => {
    const bounds = heroScene.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    heroScene.style.setProperty("--scene-x", `${x * 14}px`);
    heroScene.style.setProperty("--scene-y", `${y * 11}px`);
  });

  heroScene?.addEventListener("pointerleave", () => {
    heroScene.style.setProperty("--scene-x", "0px");
    heroScene.style.setProperty("--scene-y", "0px");
  });
}
