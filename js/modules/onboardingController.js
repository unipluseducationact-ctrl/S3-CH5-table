
import { t } from "./langController.js";

/**
 * Entry landing for ALL devices:
 * - Logo + Uni+ title
 * - Floating chemistry words in the background
 * - Start button → enter main app
 */
export function initEntryLanding(onComplete) {
  const overlay = document.createElement("div");
  overlay.id = "uniplus-entry-overlay";
  overlay.innerHTML = `
    <style>
      #uniplus-entry-overlay {
        position: fixed;
        inset: 0;
        background: #ffffff;
        z-index: 1000000;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        font-family: 'Inter', -apple-system, sans-serif;
      }

      .logo-container {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 120px;
      }

      .onboarding-logo-img {
        height: 96px;
        width: auto;
        max-width: min(520px, 86vw);
        object-fit: contain;
        opacity: 0;
        transform: translateY(6px) scale(0.98);
        transition:
          opacity 0.8s cubic-bezier(0.23, 1, 0.32, 1),
          transform 0.8s cubic-bezier(0.23, 1, 0.32, 1);
        pointer-events: none;
        z-index: 1;
        filter: drop-shadow(0 14px 34px rgba(0, 0, 0, 0.10));
      }

      .logo-container.expanded .onboarding-logo-img {
        opacity: 1;
        transform: translateY(0) scale(1);
      }

      .brand-title {
        margin-top: 10px;
        font-size: 3rem;
        font-weight: 900;
        letter-spacing: -0.04em;
        color: #0f172a;
        opacity: 0;
        transform: translateY(6px);
        transition:
          opacity 0.8s cubic-bezier(0.23, 1, 0.32, 1),
          transform 0.8s cubic-bezier(0.23, 1, 0.32, 1);
        z-index: 2;
      }

      .logo-container.expanded ~ .brand-title {
        opacity: 1;
        transform: translateY(0);
      }

      .danmaku-container {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 0;
        opacity: 0;
        transition: opacity 1.5s ease;
      }

      .danmaku-container.visible {
        opacity: 0.25;
      }

      .danmaku-item {
        position: absolute;
        white-space: nowrap;
        font-weight: 700;
        color: #475569;
        opacity: 0.6;
        filter: blur(0.5px);
        animation: danmaku-move linear forwards;
      }

      @keyframes danmaku-move {
        from { transform: translateX(-100%); left: 0; }
        to { transform: translateX(100vw); left: 0; }
      }

      .start-btn-container {
        margin-top: 24px;
        opacity: 0;
        transform: translateY(10px);
        transition: all 0.6s ease;
        z-index: 10;
      }

      .start-btn-container.visible {
        opacity: 1;
        transform: translateY(0);
      }

      .onboarding-btn {
        padding: 14px 40px;
        background: #1e293b;
        color: white;
        border: none;
        border-radius: 14px;
        font-size: 1.05rem;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .onboarding-btn:hover {
        transform: translateY(-2px);
        background: #000;
        box-shadow: 0 8px 20px rgba(0,0,0,0.15);
      }
    </style>
    <div class="danmaku-container" id="danmaku-field"></div>

    <div id="animation-stage" style="display:flex; flex-direction:column; align-items:center;">
        <div class="logo-container" id="onboarding-logo">
          <img class="onboarding-logo-img" src="images/uniplus-logo.png" alt="Uni+ logo" decoding="async" />
        </div>
        <div class="brand-title" aria-hidden="true">Uni+</div>

        <div class="start-btn-container" id="start-btn-box">
          <button class="onboarding-btn" id="onboarding-start-btn" type="button">Start</button>
        </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const logoContainer = document.getElementById("onboarding-logo");
  const danmakuField = document.getElementById("danmaku-field");
  const startBtnBox = document.getElementById("start-btn-box");
  const startBtn = document.getElementById("onboarding-start-btn");

  startBtn.textContent = t("onboarding.start", "Start");

  // Step 1: Initial Delay then Expand Logo
  setTimeout(() => {
    logoContainer.classList.add("expanded");
  }, 800);

  // Step 2: Show Danmaku and Start Button after Logo animation
  setTimeout(() => {
    danmakuField.classList.add("visible");
    startBtnBox.classList.add("visible");
    startDanmaku();
  }, 1600);

  function startDanmaku() {
    const supportedLangs = ["en", "zh", "zh-Hant"];
    const allPhrases = [];
    supportedLangs.forEach(l => {
        const phrases = t(`onboarding.phrases`, [], l);
        if (Array.isArray(phrases)) allPhrases.push(...phrases);
    });

    if (allPhrases.length === 0) {
        allPhrases.push("Uni+", "Chemistry", "Atom", "Molecule");
    }

    const createItem = () => {
      if (!overlay.parentElement) return;
      const item = document.createElement("div");
      item.className = "danmaku-item";
      item.textContent = allPhrases[Math.floor(Math.random() * allPhrases.length)];

      const top = Math.random() * 85 + 5;
      const size = Math.random() * 0.8 + 0.9;
      const duration = Math.random() * 12 + 10;

      item.style.top = `${top}%`;
      item.style.fontSize = `${size}rem`;
      item.style.animationDuration = `${duration}s`;

      danmakuField.appendChild(item);
      item.addEventListener("animationend", () => item.remove());

      setTimeout(createItem, 1500 + Math.random() * 1000);
    };

    for(let i=0; i<4; i++) setTimeout(createItem, i * 1000);
  }

  startBtn.addEventListener("click", () => {
    overlay.style.pointerEvents = "none";
    overlay.style.transition = "opacity 0.45s ease";
    overlay.style.opacity = "0";
    setTimeout(() => {
      overlay.remove();
      if (typeof onComplete === "function") onComplete();
    }, 480);
  });
}
