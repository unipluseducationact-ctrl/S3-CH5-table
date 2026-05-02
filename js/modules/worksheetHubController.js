// =============================================================================
// Worksheet hub — type picker vs detail panels (equation + embedded Ch.5 sheets)
// =============================================================================

import { getLang, onLangChange } from "./langController.js";

const WORKSHEET_SUBTYPES = ["equation", "atomic-structure", "isotope-ram", "cursor-chem"];

const EMBED_IFRAME_SEL = "#worksheet-shell iframe.worksheet-embed-fs-frame";

/**
 * Map hot-bar language (en | zh | zh-Hant) to each embedded worksheet’s ?lang= value.
 */
function langQueryForWorksheetPath(pathname, hostLang) {
  const p = (pathname || "").toLowerCase();
  if (p.includes("cursor-chem")) {
    return hostLang === "en" ? "en" : "zh-Hant";
  }
  if (p.includes("ram_calculation") || p.includes("ch5-isotope-ram")) {
    return hostLang === "en" ? "en" : "zh";
  }
  if (p.includes("ch5-atomic-structure")) {
    return hostLang === "en" ? "en" : "zh";
  }
  return hostLang === "en" ? "en" : "zh-Hant";
}

/** Point embedded worksheet iframes at the current hot-bar language (reloads iframe when param changes). */
export function applyWorksheetEmbedIframesLang() {
  const host = getLang();
  document.querySelectorAll(EMBED_IFRAME_SEL).forEach((frame) => {
    const attr = frame.getAttribute("src");
    if (!attr) return;
    let url;
    try {
      url = new URL(attr, window.location.href);
    } catch {
      return;
    }
    const want = langQueryForWorksheetPath(url.pathname, host);
    if (url.searchParams.get("lang") === want) return;
    url.searchParams.set("lang", want);
    frame.setAttribute("src", `${url.pathname}${url.search}${url.hash}`);
  });
}

/** Embedded HTML/iframes: layout inside the shell can collapse; pin panel size via JS + CSS. */
const EMBED_SUBTYPES = new Set(["atomic-structure", "isotope-ram", "cursor-chem"]);

const NAV_TOP_OFFSET_PX = 60;

const EMBED_PANEL_INLINE_PROPS = [
  "position",
  "top",
  "bottom",
  "left",
  "right",
  "width",
  "height",
  "min-height",
  "max-height",
  "max-width",
  "z-index",
  "inset",
];

const PANEL_ID_BY_SUBTYPE = {
  equation: "worksheet-panel-equation",
  "atomic-structure": "worksheet-panel-atomic-structure",
  "isotope-ram": "worksheet-panel-isotope-ram",
  "cursor-chem": "worksheet-panel-cursor-chem",
};

function getShell() {
  return document.getElementById("worksheet-shell");
}

function clearEmbedFullscreenStyles() {
  document.querySelectorAll(".worksheet-panel--embed-full").forEach((el) => {
    EMBED_PANEL_INLINE_PROPS.forEach((prop) => el.style.removeProperty(prop));
  });
}

function applyEmbedFullscreen(panel) {
  if (!panel || !panel.classList.contains("worksheet-panel--embed-full")) return;
  const h = `calc(100dvh - ${NAV_TOP_OFFSET_PX}px)`;
  panel.style.setProperty("position", "fixed", "important");
  panel.style.setProperty("top", `${NAV_TOP_OFFSET_PX}px`, "important");
  panel.style.setProperty("left", "0", "important");
  panel.style.setProperty("width", "100vw", "important");
  panel.style.setProperty("max-width", "100vw", "important");
  panel.style.setProperty("height", h, "important");
  panel.style.setProperty("min-height", h, "important");
  panel.style.setProperty("max-height", h, "important");
  panel.style.setProperty("z-index", "5000", "important");
}

function hideAllPanels() {
  Object.values(PANEL_ID_BY_SUBTYPE).forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.setAttribute("hidden", "");
      el.setAttribute("aria-hidden", "true");
    }
  });
}

function showHub() {
  const shell = getShell();
  const hub = document.getElementById("worksheet-hub");
  if (shell) {
    shell.classList.remove("worksheet-shell--detail");
    shell.removeAttribute("data-worksheet-panel");
  }
  if (hub) {
    hub.removeAttribute("hidden");
  }
  hideAllPanels();
  clearEmbedFullscreenStyles();
}

function showDetail(subtype) {
  if (!WORKSHEET_SUBTYPES.includes(subtype)) return;

  const shell = getShell();
  const hub = document.getElementById("worksheet-hub");
  const panelId = PANEL_ID_BY_SUBTYPE[subtype];
  const panel = panelId ? document.getElementById(panelId) : null;

  hideAllPanels();

  if (shell) {
    shell.classList.add("worksheet-shell--detail");
    shell.setAttribute("data-worksheet-panel", subtype);
  }
  if (hub) {
    hub.setAttribute("hidden", "");
  }
  if (panel) {
    panel.removeAttribute("hidden");
    panel.setAttribute("aria-hidden", "false");
    if (EMBED_SUBTYPES.has(subtype)) {
      applyEmbedFullscreen(panel);
    }
  }

  requestAnimationFrame(() => {
    window.dispatchEvent(new Event("resize"));
  });
}

function bindWorksheetTypeCard(card) {
  if (!card || card.dataset.worksheetHubBound === "true") return;
  const subtype = card.dataset.worksheetSubtype;
  if (!subtype || !WORKSHEET_SUBTYPES.includes(subtype)) return;

  const open = () => showDetail(subtype);

  card.addEventListener("click", open);
  card.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    open();
  });

  card.dataset.worksheetHubBound = "true";
}

/**
 * Wire hub navigation. Call `resetWorksheetHub` when the Worksheets tab is shown
 * so users always land on the type picker.
 */
export function initWorksheetHub() {
  const shell = getShell();
  if (shell) {
    shell.querySelectorAll(".worksheet-back-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        showHub();
      });
    });
  }

  document.querySelectorAll(".worksheet-type-card[data-worksheet-subtype]").forEach(bindWorksheetTypeCard);

  showHub();

  applyWorksheetEmbedIframesLang();
  onLangChange(() => applyWorksheetEmbedIframesLang());

  return {
    resetWorksheetHub: showHub,
  };
}
