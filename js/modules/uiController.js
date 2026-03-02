// =============================================================================
// UI Controller - Periodic Table Grid & Element Modal
// Extracted from script.js: grid generation, modal population, level system
// =============================================================================

import { finallyData, elements } from "../data/elementsData.js";
import { elementsData_v2 } from "../data/elementsData_v2.js";
import {
  init3DScene,
  updateAtomStructure,
  onWindowResize,
  reset3DView,
  animateAtom,
  cleanup3D,
  clearCurrentAtom,
  renderScene,
} from "./threeRenderer.js";

// ===== Legend & Category Highlighting =====
let activeLegendCategory = null;
function normalizeCategoryClass(catClass) {
  const aliasMap = {
    "reactive-non-metal": "reactive-nonmetal",
    "non-metal": "reactive-nonmetal",
  };
  return aliasMap[catClass] || catClass;
}
function highlightCategory(container, catClass) {
  const normalized = normalizeCategoryClass(catClass);
  container.classList.add("highlighting");
  const elements = container.querySelectorAll(".element");
  elements.forEach((el) => {
    if (el.classList.contains(catClass) || el.classList.contains(normalized)) {
      el.classList.add("highlighted");
    } else {
      el.classList.remove("highlighted");
    }
  });
}
function clearHighlights(container) {
  container.classList.remove("highlighting");
  const highlighted = container.querySelectorAll(".element.highlighted");
  highlighted.forEach((el) => el.classList.remove("highlighted"));
}
function createLegend(container) {
  const legendContainer = document.createElement("div");
  legendContainer.id = "table-legend";
  const categories = [
    // Row 1 (4 items)
    { name: "Alkali Metal", class: "alkali-metal" },
    { name: "Alkaline Earth", class: "alkaline-earth-metal" },
    { name: "Transition Metal", class: "transition-metal" },
    { name: "Metalloid", class: "metalloid" },
    // Row 2 (4 items)
    { name: "Halogen", class: "halogen" },
    { name: "Noble Gas", class: "noble-gas" },
    { name: "Lanthanide", class: "lanthanide" },
    { name: "Actinide", class: "actinide" },
    // Row 3 (2 wider items)
    {
      name: "Reactive nonmetal",
      class: "reactive-nonmetal",
      layoutClass: "legend-wide-left",
    },
    {
      name: "Post-Transition",
      class: "post-transition-metal",
      layoutClass: "legend-wide-right",
    },
  ];
  categories.forEach((cat) => {
    const item = document.createElement("div");
    item.classList.add("legend-item");
    if (cat.layoutClass) item.classList.add(cat.layoutClass);
    item.setAttribute("data-category", cat.class);
    const swatch = document.createElement("div");
    swatch.className = `legend-swatch ${cat.class}`;
    swatch.style.pointerEvents = "none";
    const label = document.createElement("span");
    label.textContent = cat.name;
    label.style.pointerEvents = "none";
    item.appendChild(swatch);
    item.appendChild(label);
    item.addEventListener("mouseenter", () => {
      if (activeLegendCategory) return;
      highlightCategory(container, cat.class);
    });
    item.addEventListener("mouseleave", () => {
      if (activeLegendCategory) return;
      clearHighlights(container);
    });
    item.addEventListener("click", (e) => {
      e.stopPropagation();
      if (activeLegendCategory === cat.class) {
        activeLegendCategory = null;
        item.classList.remove("active");
        clearHighlights(container);
      } else {
        container
          .querySelectorAll(".legend-item.active")
          .forEach((el) => el.classList.remove("active"));
        activeLegendCategory = cat.class;
        item.classList.add("active");
        highlightCategory(container, cat.class);
      }
    });
    legendContainer.appendChild(item);
  });
  container.appendChild(legendContainer);
}

// ===== Periodic Table Grid Generation =====
export function buildPeriodicTable(tableContainer) {
  const grid = {};
  elements.forEach((element) => {
    // Range blocks (La-Lu, Ac-Lr) skip phase calculation but still enter grid
    if (typeof element.number !== "string") {
      // Calculate Phase @ STP (25°C)
      if (!element.phase) {
        const data = finallyData[element.number] || {};
        const parseT = (s) => {
          const m = (s || "").match(/-?[\d.]+/);
          return m ? parseFloat(m[0]) : null;
        };
        const m = parseT(data.level3_properties?.physical?.meltingPoint);
        const b = parseT(data.level3_properties?.physical?.boilingPoint);

        if (element.number >= 104) {
          element.phase = "Unknown";
        } else if (b !== null && 25 > b) {
          element.phase = "Gas";
        } else if (m !== null && 25 < m) {
          element.phase = "Solid";
        } else if (m !== null) {
          element.phase = "Liquid";
        } else {
          element.phase = "Unknown";
        }
      }
    }

    if (element.row && element.column) {
      grid[`${element.row}-${element.column}`] = element;
    }
  });
  for (let r = 1; r <= 7; r++) {
    for (let c = 1; c <= 18; c++) {
      const element = grid[`${r}-${c}`];
      const cell = document.createElement("div");
      if (element) {
        cell.classList.add("element");
        if (element.category) {
          const catClass = normalizeCategoryClass(element.category
            .toLowerCase()
            .replace(/ /g, "-")
            .replace(/[^a-z0-9-]/g, ""));
          cell.classList.add(catClass);
        }
        cell.innerHTML = `
                      <span class="number">${element.number}</span>
                      <span class="symbol">${element.symbol}</span>
                      <span class="name">${element.name}</span>
                  `;
        // Range blocks (La-Lu, Ac-Lr): toggle category highlight instead of modal
        if (element.symbol === "La-Lu" || element.symbol === "Ac-Lr") {
          cell.classList.add("range-block");
          cell.addEventListener("click", () => {
            const catClass = element.symbol === "La-Lu" ? "lanthanide" : "actinide";
            if (activeLegendCategory === catClass) {
              activeLegendCategory = null;
              tableContainer.querySelectorAll(".legend-item.active").forEach((el) => el.classList.remove("active"));
              clearHighlights(tableContainer);
            } else {
              tableContainer.querySelectorAll(".legend-item.active").forEach((el) => el.classList.remove("active"));
              activeLegendCategory = catClass;
              highlightCategory(tableContainer, catClass);
            }
          });
        } else {
          cell.addEventListener("click", () => showModal(element));
        }
      } else {
        cell.classList.add("empty");
      }
      cell.style.gridRow = r;
      cell.style.gridColumn = c;
      tableContainer.appendChild(cell);
    }
  }
  createLegend(tableContainer);
  const lanthanides = elements
    .filter((e) => e.series === "lanthanide" && typeof e.number === "number")
    .sort((a, b) => a.number - b.number);
  const actinides = elements
    .filter((e) => e.series === "actinide" && typeof e.number === "number")
    .sort((a, b) => a.number - b.number);
  lanthanides.forEach((element, index) => {
    const cell = document.createElement("div");
    cell.classList.add("element", "lanthanide");
    if (element.category) {
      const catClass = normalizeCategoryClass(element.category
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^a-z0-9-]/g, ""));
      cell.classList.add(catClass);
    }
    cell.innerHTML = `
              <span class="number">${element.number}</span>
              <span class="symbol">${element.symbol}</span>
              <span class="name">${element.name}</span>
          `;
    cell.addEventListener("click", () => showModal(element));
    cell.style.gridRow = 9;
    cell.style.gridColumn = 4 + index;
    tableContainer.appendChild(cell);
  });
  actinides.forEach((element, index) => {
    const cell = document.createElement("div");
    cell.classList.add("element", "actinide");
    if (element.category) {
      const catClass = normalizeCategoryClass(element.category
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^a-z0-9-]/g, ""));
      cell.classList.add(catClass);
    }
    cell.innerHTML = `
              <span class="number">${element.number}</span>
              <span class="symbol">${element.symbol}</span>
              <span class="name">${element.name}</span>
          `;
    cell.addEventListener("click", () => showModal(element));
    cell.style.gridRow = 10;
    cell.style.gridColumn = 4 + index;
    tableContainer.appendChild(cell);
  });
  const hash = window.location.hash.toLowerCase();
  if (hash === "#pb" || hash === "#lead") {
    const leadElement = elements.find((el) => el.symbol === "Pb");
    if (leadElement) {
      setTimeout(() => showModal(leadElement), 500);
    }
  }
}

// ===== Modal DOM References (assigned in initModalUI) =====
let modal, modalClose, modalSymbol, modalName, modalNumber, modalCategory,
  modalPhase, modalCategoryDisplay, modalConfigLarge, modalDiscovery,
  modalEtymology, modalDescription, modalDensity, modalMelt, modalBoil,
  modalNegativity, modalRadius, modalIonization, modalWatermark,
  atomContainer, modalCharge, modalP, modalE, modalN, modalPeriod,
  modalGroup, modalCompounds, modalUses, modalHazards, modalShells,
  eduNames, eduIsotopes, eduCardsContainer;

// ===== Pure Helpers =====
export function reRenderCurrentAtomModal() {
  if (window.currentAtomElement) {
    let currentLevelIndex = null;
    const activeDot = document.querySelector(".slider-dots .dot.active");
    if (activeDot && activeDot.parentElement) {
      const dots = Array.from(activeDot.parentElement.querySelectorAll(".dot"));
      const idx = dots.indexOf(activeDot);
      if (idx >= 0) currentLevelIndex = idx;
    }
    if (currentLevelIndex === null) {
      const activeLevelBtn = document.querySelector(".level-btn.active[data-level]");
      if (activeLevelBtn) {
        const parsed = Number(activeLevelBtn.dataset.level) - 1;
        if (!Number.isNaN(parsed) && parsed >= 0) currentLevelIndex = parsed;
      }
    }
    if (currentLevelIndex === null) {
      const visibleLevel = Array.from(document.querySelectorAll(".level-content")).find(
        (content) => getComputedStyle(content).display !== "none",
      );
      if (visibleLevel && visibleLevel.id?.startsWith("level-")) {
        const parsed = Number(visibleLevel.id.replace("level-", "")) - 1;
        if (!Number.isNaN(parsed) && parsed >= 0) currentLevelIndex = parsed;
      }
    }
    if (currentLevelIndex !== null) {
      window._pendingLevelIndex = currentLevelIndex;
    }
    showModal(window.currentAtomElement);
  }
}

function getElementCategory(element) {
  if (element.number === 1) return "Reactive nonmetal";
  const c = element.column;
  const metalloids = [5, 14, 32, 33, 51, 52, 85];
  if (metalloids.includes(element.number)) return "Metalloid";
  if (c === 18) return "Reactive nonmetal (Noble Gas)";
  if (c === 17) return "Reactive nonmetal (Halogen)";
  const otherNonmetals = [6, 7, 8, 15, 16, 34];
  if (otherNonmetals.includes(element.number)) return "Reactive nonmetal";
  return "Metal";
}
function calculateShells(element) {
  const z = element.number;
  let shells = [];
  if (z <= 20) {
    let remaining = z;
    let filled = Math.min(remaining, 2);
    shells.push(filled);
    remaining -= filled;
    if (remaining > 0) {
      filled = Math.min(remaining, 8);
      shells.push(filled);
      remaining -= filled;
    }
    if (remaining > 0) {
      filled = Math.min(remaining, 8);
      shells.push(filled);
      remaining -= filled;
    }
    if (remaining > 0) {
      filled = Math.min(remaining, 2);
      shells.push(filled);
      remaining -= filled;
    }
  } else {
    return `${element.row} shells`;
  }
  return shells.join(", ");
}

// ===== Simplified View Population =====
function populateSimplifiedView(element) {
  const finallyElementData = finallyData[element.number] || {};
  const v2Data = elementsData_v2[element.number];
  const eduData = element.educational || {};
  const numberToSuperscript = (num) => {
    const map = {
      0: "⁰",
      1: "¹",
      2: "²",
      3: "³",
      4: "⁴",
      5: "⁵",
      6: "⁶",
      7: "⁷",
      8: "⁸",
      9: "⁹",
    };
    return num
      .toString()
      .split("")
      .map((d) => map[d] || d)
      .join("");
  };
  const setText = (selector, text) => {
    const el = document.querySelector(selector);
    if (el) el.textContent = text;
  };
  const setStyle = (el, styles) => {
    if (el) Object.assign(el.style, styles);
  };
  const findContentDiv = (cell, colorFilter) => {
    const divs =
      cell?.querySelectorAll('div[style*="font-size: 0.95rem"]') || [];
    for (const div of divs) {
      const style = div.getAttribute("style") || "";
      if (
        !colorFilter ||
        (colorFilter === "stse" && style.includes("color: #064E3B")) ||
        (colorFilter === "hazards" && style.includes("color: #991B1B")) ||
        (colorFilter === "uses" &&
          !style.includes("color: #064E3B") &&
          !style.includes("color: #991B1B"))
      ) {
        return div;
      }
    }
    return divs[0] || null;
  };
  const formatTemp = (temp) => {
    if (!temp || typeof temp !== "string") return "N/A";
    if (
      temp.includes("—") ||
      temp.includes("Pressurized") ||
      temp === "N/A" ||
      temp.includes("Unknown")
    )
      return "N/A";
    return temp.replace(" °C", "").replace("°C", "").trim();
  };
  const formatDensity = (density) => {
    if (!density || density === "N/A" || density === "Unknown")
      return { value: "N/A", unit: "" };
    const parts = density.split(" ");
    return { value: parts[0], unit: parts.slice(1).join(" ") };
  };
  const formatElectronegativity = (en) => {
    if (en === null || en === undefined) return "N/A";
    if (typeof en === "string") {
      if (en.includes("—") || en.trim() === "") return "N/A";
      const num = en.match(/[\d.]+/);
      return num ? parseFloat(num[0]).toFixed(2) : "N/A";
    }
    return en.toFixed(2);
  };
  const formatIonization = (ie) => {
    if (!ie) return "N/A";
    if (typeof ie === "string" && ie.includes("kJ/mol"))
      return ie.replace(" kJ/mol", "").trim();
    if (typeof ie === "string" && ie.includes("eV")) {
      const ev = parseFloat(ie);
      return !isNaN(ev) ? Math.round(ev * 96.485).toString() : "N/A";
    }
    return ie;
  };
  const formatSTSE = (content) => {
    const sentences = content.split(/[;。]\s*/).filter((s) => s.trim());
    return sentences
      .map((s, i) => s.trim() + (i < sentences.length - 1 ? "<br>" : ""))
      .join("");
  };
  const greenCard = document.querySelector(
    ".green-rectangle .card-info-container",
  );
  if (greenCard) {
    let typeDisplay = element.category || "Unknown";
    let phaseDisplay = element.phase || "Unknown";
    
    if (window.zperiodVersion === 'new' && v2Data) {
      typeDisplay = v2Data.level1_basic.type || typeDisplay;
      phaseDisplay = v2Data.level1_basic.phaseAtSTP || phaseDisplay;
    }
    
    setText(
      ".green-rectangle .info-row:nth-child(1) .info-value",
      typeDisplay,
    );
    let displayRow = element.row;
    let displayCol = element.column;
    if (element.series === "lanthanide") {
      displayRow = 6;
      displayCol = 3;
    } else if (element.series === "actinide") {
      displayRow = 7;
      displayCol = 3;
    }

    setText(
      ".green-rectangle .info-row:nth-child(2) .info-value",
      `${displayCol || "-"} / ${displayRow || "-"}`,
    );
    setText(
      ".green-rectangle .info-row:nth-child(3) .info-value",
      phaseDisplay,
    );
    const valenceRow = greenCard.querySelector(
      ".info-row:nth-child(4) .info-value",
    );
    if (valenceRow) {
      let valenceStr = "";
      if (window.zperiodVersion === 'new' && v2Data) {
        valenceStr = v2Data.level1_basic.valenceElectrons || "—";
      } else if (finallyElementData.level1_basic?.valenceElectrons !== undefined && finallyElementData.level1_basic?.valenceElectrons !== null) {
        const valence = finallyElementData.level1_basic.valenceElectrons;
        valenceStr = typeof valence === "string" ? valence : valence.toString();
      } else {
        valenceStr = "—";
      }
      valenceRow.textContent = valenceStr;
      // Use nowrap for very long valence strings like "Variable (outer s + d + f)"
      const isExtraLong = typeof valenceStr === "string" && valenceStr.includes("outer s + d + f");
      const isLong = typeof valenceStr === "string" && (valenceStr.includes("Variable") || valenceStr.includes("(") || valenceStr.length > 5);
      valenceRow.classList.remove("long-text", "long-text-nowrap");
      if (isExtraLong) {
        valenceRow.classList.add("long-text-nowrap");
      } else if (isLong) {
        valenceRow.classList.add("long-text");
      }
    }
    const ionsSection = greenCard.querySelector(".ions-section");
    if (ionsSection) {
      ionsSection
        .querySelectorAll(".ion-item")
        .forEach((item) => item.remove());
      let commonIonsText = finallyElementData.level1_basic?.commonIons || "";
      if (window.zperiodVersion === 'new' && v2Data) {
        commonIonsText = v2Data.level1_basic.commonIons || "";
      }
      
      const hasNoIons =
        !commonIonsText ||
        /none|n\/a|inert|unknown|does not form/i.test(commonIonsText) ||
        !commonIonsText.trim();
      const unicodeToHtml = (text) => {
        const subMap = { '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9' };
        const supMap = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁺': '+', '⁻': '-' };
        let result = '', i = 0;
        while (i < text.length) {
          if (subMap[text[i]] !== undefined) {
            let sub = '';
            while (i < text.length && subMap[text[i]] !== undefined) { sub += subMap[text[i]]; i++; }
            result += `<sub>${sub}</sub>`;
          } else if (supMap[text[i]] !== undefined) {
            let sup = '';
            while (i < text.length && supMap[text[i]] !== undefined) { sup += supMap[text[i]]; i++; }
            result += `<sup>${sup}</sup>`;
          } else {
            result += text[i]; i++;
          }
        }
        return result;
      };
      const createIonItem = (symbol, name) => {
        const item = document.createElement("div");
        item.className = "ion-item";
        item.innerHTML = `<span class="ion-symbol">${unicodeToHtml(symbol)}</span><span class="ion-arrow">→</span><span class="ion-name">${name}</span>`;
        return item;
      };
      if (hasNoIons) {
        ionsSection.appendChild(
          createIonItem(element.symbol, "No common ions"),
        );
      } else if (commonIonsText) {
        const parseIon = (ionText) => {
          // Match ion symbol (letters + superscript chars, plus optional subscript like Hg₂²⁺)
          const symMatch = ionText.match(
            /([A-Za-z]+[₀₁₂₃₄₅₆₇₈₉]*[⁺⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+)/,
          );
          if (!symMatch) return { symbol: element.symbol, name: ionText };
          const symbol = symMatch[1];
          // Find the outermost parentheses content after the symbol
          const afterSymbol = ionText.substring(ionText.indexOf(symbol) + symbol.length).trim();
          if (afterSymbol.startsWith('(')) {
            // Find matching closing paren (handle nesting)
            let depth = 0, end = -1;
            for (let i = 0; i < afterSymbol.length; i++) {
              if (afterSymbol[i] === '(') depth++;
              else if (afterSymbol[i] === ')') { depth--; if (depth === 0) { end = i; break; } }
            }
            const name = end > 0 ? afterSymbol.substring(1, end) : afterSymbol.substring(1);
            return { symbol, name };
          }
          return { symbol, name: `${element.name} ion` };
        };
        if (commonIonsText.includes(",")) {
          commonIonsText
            .split(",")
            .map((s) => s.trim())
            .forEach((ionText) => {
              const { symbol, name } = parseIon(ionText);
              ionsSection.appendChild(createIonItem(symbol, name));
            });
        } else {
          const { symbol, name } = parseIon(commonIonsText);
          ionsSection.appendChild(createIonItem(symbol, name));
        }
      }
    }
  }
  const yellowCard = document.querySelector(
    ".yellow-rectangle .card-info-container",
  );
  if (yellowCard) {
    let avgMass = finallyElementData.level2_atomic?.mass?.highSchool || "—";
    if (window.zperiodVersion === 'new' && v2Data && v2Data.level2_atomic.mass.standard) {
      avgMass = v2Data.level2_atomic.mass.standard;
    }
    setText(".yellow-rectangle .info-row:nth-child(1) .info-value", avgMass);
    setText(
      ".yellow-rectangle .info-row:nth-child(2) .info-value",
      element.number.toString(),
    );
    setText(
      ".yellow-rectangle .info-row:nth-child(3) .info-value",
      element.number.toString(),
    );
    const isotopesSection = yellowCard.querySelector(".ions-section");
    if (isotopesSection) {
      isotopesSection
        .querySelectorAll(".ion-item")
        .forEach((item) => item.remove());
      let isotopesToDisplay =
        finallyElementData.level2_atomic?.naturalIsotopes?.length > 0
          ? finallyElementData.level2_atomic.naturalIsotopes
          : [];
      
      if (window.zperiodVersion === 'new' && v2Data) {
        isotopesToDisplay = v2Data.level2_atomic.naturalIsotopes || [];
      }
      isotopesToDisplay.forEach((iso) => {
        const parseMassNumber = () => {
          if (iso.name?.includes("-")) return iso.name.split("-")[1];
          if (iso.symbol) {
            const match = iso.symbol.match(/[¹²³⁴⁵⁶⁷⁸⁹⁰]+/);
            if (match) {
              const supToNum = {
                "⁰": "0",
                "¹": "1",
                "²": "2",
                "³": "3",
                "⁴": "4",
                "⁵": "5",
                "⁶": "6",
                "⁷": "7",
                "⁸": "8",
                "⁹": "9",
              };
              return match[0]
                .split("")
                .map((c) => supToNum[c] || c)
                .join("");
            }
          }
          return iso.name?.match(/\d+/)?.[0] || "";
        };
        const massNumber = parseMassNumber();
        if (!massNumber) return;
        const percent = (iso.percent || "").toLowerCase();
        const isStable =
          percent &&
          !percent.includes("trace") &&
          !percent.includes("radioactive");
        const neutronNumber =
          iso.neutron?.replace("n", "").replace("⁰", "0") || "";
        const isoItem = document.createElement("div");
        isoItem.className = "ion-item";
        isoItem.innerHTML = `
                      <span class="ion-symbol">${numberToSuperscript(massNumber)}${element.symbol}</span>
                      <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end;">
                          <span style="font-weight: 600; font-size: 0.95rem;">${neutronNumber} n⁰</span>
                          <span style="font-size: 0.7rem; text-transform: uppercase; opacity: 0.6; font-weight: 700; letter-spacing: 0.5px; ${isStable ? "" : "color: #B91C1C;"}">${isStable ? "Stable" : "Radioactive"}</span>
                      </div>
                  `;
        isotopesSection.appendChild(isoItem);
      });
    }
  }
  const blueCard = document.querySelector(
    ".blue-rectangle .card-info-container",
  );
  if (blueCard) {
    const configHero = blueCard.querySelector(".config-hero");
    if (configHero) {
      let config = finallyElementData.level3_properties?.electronic?.configuration || "—";
      if (window.zperiodVersion === 'new' && v2Data && v2Data.level3_properties.electronic.configuration) {
        config = v2Data.level3_properties.electronic.configuration;
      }
      const supMap = {
        "¹": "<sup>1</sup>",
        "²": "<sup>2</sup>",
        "³": "<sup>3</sup>",
        "⁴": "<sup>4</sup>",
        "⁵": "<sup>5</sup>",
        "⁶": "<sup>6</sup>",
        "⁷": "<sup>7</sup>",
        "⁸": "<sup>8</sup>",
        "⁹": "<sup>9</sup>",
        "⁰": "<sup>0</sup>",
      };
      configHero.innerHTML = Object.entries(supMap).reduce(
        (html, [u, h]) => html.replace(new RegExp(u, "g"), h),
        config,
      );
    }
    const oxidationContainer = blueCard.querySelector(".oxidation-container");
    if (oxidationContainer) {
      oxidationContainer.innerHTML = "";
      let statesObj = finallyElementData.level3_properties?.electronic?.oxidationStates || { common: [], possible: [] };
      if (window.zperiodVersion === 'new' && v2Data) {
        const v2Ox = v2Data.level3_properties?.electronic?.oxidationStates;
        if (v2Ox && ((v2Ox.common && v2Ox.common.length > 0) || (v2Ox.possible && v2Ox.possible.length > 0))) {
          statesObj = v2Ox;
        }
      }
      // Support legacy flat array format
      if (Array.isArray(statesObj)) {
        statesObj = { common: statesObj.slice(0, 1), possible: statesObj.slice(1) };
      }
      const common = statesObj.common || [];
      const possible = statesObj.possible || [];
      const total = common.length + possible.length;
      if (total > 0) {
        common.forEach((state) => {
          const pill = document.createElement("div");
          pill.className = "ox-pill common";
          pill.textContent = state;
          oxidationContainer.appendChild(pill);
        });
        possible.forEach((state) => {
          const pill = document.createElement("div");
          pill.className = "ox-pill possible";
          pill.textContent = state;
          oxidationContainer.appendChild(pill);
        });
        const pills = oxidationContainer.querySelectorAll(".ox-pill");
        if (total > 8) {
          oxidationContainer.style.gap = "3px";
          pills.forEach((p) => {
            p.style.fontSize = p.classList.contains("common") ? "0.65rem" : "0.6rem";
            p.style.padding = "2px 5px";
          });
        } else if (total > 5) {
          oxidationContainer.style.gap = "4px";
          pills.forEach((p) => {
            p.style.fontSize = p.classList.contains("common") ? "0.75rem" : "0.68rem";
            p.style.padding = "3px 7px";
          });
        } else {
          oxidationContainer.style.gap = "6px";
          pills.forEach((p) => {
            p.style.fontSize = "";
            p.style.padding = "";
          });
        }
      }
    }
    let en = finallyElementData.level3_properties?.physical?.electronegativity ?? null;
    let ie = finallyElementData.level3_properties?.physical?.firstIonization || "";
    let den = finallyElementData.level3_properties?.physical?.density || "";
    let melt = finallyElementData.level3_properties?.physical?.meltingPoint || "";
    let boil = finallyElementData.level3_properties?.physical?.boilingPoint || "";

    if (window.zperiodVersion === 'new' && v2Data) {
      en = v2Data.level3_properties.physical.electronegativity ?? en;
      ie = v2Data.level3_properties.physical.firstIonization || ie;
      den = v2Data.level3_properties.physical.density || den;
      melt = v2Data.level3_properties.physical.meltingPoint || melt;
      boil = v2Data.level3_properties.physical.boilingPoint || boil;
    }

    setText(".blue-rectangle .l3-stat-item:nth-child(1) .l3-stat-value", formatElectronegativity(en));
    setText(".blue-rectangle .l3-stat-item:nth-child(2) .l3-stat-value", formatIonization(ie));
    
    const densityData = formatDensity(den);
    setText(".blue-rectangle .l3-stat-item:nth-child(3) .l3-stat-value", densityData.value);
    const densityUnit = blueCard.querySelector(".l3-stat-item:nth-child(3) .l3-stat-unit");
    if (densityUnit) densityUnit.textContent = densityData.unit;
    
    setText(".blue-rectangle .l3-stat-item:nth-child(4) .l3-stat-value", formatTemp(melt));
    setText(".blue-rectangle .l3-stat-item:nth-child(5) .l3-stat-value", formatTemp(boil));
  }
  const redCard = document.querySelector(
    ".red-rectangle .card-info-container",
  );
  if (redCard) {
    setStyle(redCard, {
      width: "100%",
      maxWidth: "100%",
      overflowX: "hidden",
      boxSizing: "border-box",
    });
    const commonCellStyles = {
      width: "100%",
      maxWidth: "100%",
      boxSizing: "border-box",
      overflow: "hidden",
    };
    const commonContentStyles = {
      width: "100%",
      maxWidth: "100%",
      boxSizing: "border-box",
      wordWrap: "break-word",
      overflowWrap: "break-word",
      wordBreak: "break-word",
      overflow: "hidden",
    };
    redCard.querySelectorAll(".info-row").forEach((row) => {
      setStyle(row, {
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
        display: "flex",
        justifyContent: "space-between",
        gap: "10px",
      });
      setStyle(row.querySelector(".info-label"), {
        flexShrink: "0",
        minWidth: "fit-content",
        whiteSpace: "nowrap",
      });
      setStyle(row.querySelector(".info-value"), {
        flex: "1 1 auto",
        minWidth: "0",
        maxWidth: "100%",
        wordWrap: "break-word",
        overflowWrap: "break-word",
        whiteSpace: "normal",
        textAlign: "right",
        overflow: "visible",
      });
    });
    let year = finallyElementData.level4_history_stse?.history?.discoveryYear || "—";
    if (window.zperiodVersion === 'new' && v2Data && v2Data.level4_history_stse.history.discoveryYear) {
      year = v2Data.level4_history_stse.history.discoveryYear;
    }

    setText(
      ".red-rectangle .info-row:nth-child(2) .info-value",
      year,
    );
    let discoveredBy = finallyElementData.level4_history_stse?.history?.discoveredBy || "—";
    let namedBy = finallyElementData.level4_history_stse?.history?.namedBy || "—";
    
    if (window.zperiodVersion === 'new' && v2Data) {
      discoveredBy = v2Data.level4_history_stse.history.discoveredBy || "—";
      namedBy = v2Data.level4_history_stse.history.namedBy || "—";
    }

    setText(".red-rectangle .info-row:nth-child(3) .info-value", discoveredBy);
    setText(".red-rectangle .info-row:nth-child(4) .info-value", namedBy);
    
    const propGridSection = redCard.querySelector(".prop-grid-section");
    if (propGridSection) {
      setStyle(propGridSection, {
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
        minWidth: "0",
      });
      const stseCell = propGridSection.querySelector(".prop-cell:nth-child(1)");
      if (stseCell) {
        setStyle(stseCell, commonCellStyles);
        const stseContent = findContentDiv(stseCell, "stse");
        
        let stseVal = (finallyElementData.level4_history_stse?.stseContext || []).join("; ");
        if (window.zperiodVersion === 'new' && v2Data) {
          stseVal = v2Data.level4_history_stse.stseContext && v2Data.level4_history_stse.stseContext.length > 0 
                    ? v2Data.level4_history_stse.stseContext.join(" • ") 
                    : "";
        }
        
        stseCell.style.display = "flex";
        if (stseContent) {
          setStyle(stseContent, commonContentStyles);
          if (stseVal) {
            stseContent.innerHTML = formatSTSE(stseVal);
          } else {
            stseContent.textContent = "—";
          }
        }
      }
      
      const usesCell = propGridSection.querySelector(".prop-cell:nth-child(2)");
      if (usesCell) {
        setStyle(usesCell, commonCellStyles);
        const usesContent = findContentDiv(usesCell, "uses");
        
        let usesVal = (finallyElementData.level4_history_stse?.commonUses || []).join(", ") || "—";
        if (window.zperiodVersion === 'new' && v2Data) {
          usesVal = v2Data.level4_history_stse.commonUses && v2Data.level4_history_stse.commonUses.length > 0
                    ? v2Data.level4_history_stse.commonUses.join(", ")
                    : "—";
        }
        
        if (usesContent) {
          setStyle(usesContent, commonContentStyles);
          usesContent.textContent = usesVal;
        }
      }
      
      const hazardsCell = propGridSection.querySelector(".prop-cell:nth-child(3)");
      if (hazardsCell) {
        setStyle(hazardsCell, commonCellStyles);
        const hazardsContent = findContentDiv(hazardsCell, "hazards");
        
        let hazardsVal = (finallyElementData.level4_history_stse?.hazards || []).join(", ") || "—";
        if (window.zperiodVersion === 'new' && v2Data) {
          hazardsVal = v2Data.level4_history_stse.hazards && v2Data.level4_history_stse.hazards.length > 0
                      ? v2Data.level4_history_stse.hazards.join(", ")
                      : "—";
        }
        
        if (hazardsContent) {
          setStyle(hazardsContent, commonContentStyles);
          hazardsContent.textContent = hazardsVal;
        }
      }
    }
  }
}

// ===== Show Modal (main element modal) =====
export function showModal(element) {
  window.currentAtomElement = element;
  const finallyElementData = finallyData[element.number] || {};
  element.educational = element.educational || {};
  element.phase = element.phase || finallyElementData.level1_basic?.phaseAtSTP || "";
  element.electronConfig =
    finallyElementData.level3_properties?.electronic?.configuration || "";
  element.discovery =
    finallyElementData.level4_history_stse?.history?.discoveryYear || "";
  element.etymology =
    finallyElementData.level4_history_stse?.history?.namedBy || "";
  element.description = (finallyElementData.level4_history_stse?.stseContext || []).join("; ");
  initializeLevelSystem(element);
  const isSimplifiedView = element.number <= 118;
  const elementContent = document.querySelector(".element-content");
  const simplifiedBox = document.querySelector(".simplified-element-box");
  const modalInfoPane = document.querySelector(".modal-info-pane");
  if (elementContent && simplifiedBox && modalInfoPane) {
    if (isSimplifiedView) {
      elementContent.style.display = "none";
      simplifiedBox.style.display = "flex";
      modalInfoPane.classList.add("no-scroll");
      populateSimplifiedView(element);
    } else {
      elementContent.style.display = "flex";
      simplifiedBox.style.display = "none";
      modalInfoPane.classList.remove("no-scroll");
    }
  }
  const eduData = element.educational;
  const massNumbers = [
    1, 4, 7, 9, 11, 12, 14, 16, 19, 20,
    23, 24, 27, 28, 31, 32, 35, 40, 39, 40,
    45, 48, 51, 52, 55, 56, 59, 59, 64, 65,
    70, 73, 75, 79, 80, 84, 85, 88, 89, 91,
    93, 96, 98, 101, 103, 106, 108, 112, 115, 119,
    122, 128, 127, 131, 133, 137, 139, 140, 141, 144,
    145, 150, 152, 157, 159, 163, 165, 167, 169, 173,
    175, 178, 181, 184, 186, 190, 192, 195, 197, 201,
    204, 207, 209, 209, 210, 222, 223, 226, 227, 232,
    231, 238, 237, 244, 243, 247, 247, 251, 252, 257,
    258, 259, 266, 267, 268, 269, 270, 277, 278, 281,
    282, 285, 286, 289, 290, 293, 294, 294
  ];
  const headlineMass = document.getElementById("headline-mass");
  const headlineAtomic = document.getElementById("headline-atomic");
  const headlineSymbol = document.getElementById("headline-symbol");
  if (headlineMass) {
    const massNumber =
      element.number >= 1 && element.number <= 118
        ? massNumbers[element.number - 1]
        : Math.round(element.weight);
    headlineMass.textContent = massNumber;
  }
  if (headlineAtomic) {
    headlineAtomic.textContent = element.number;
  }
  if (headlineSymbol) {
    headlineSymbol.textContent = element.symbol;
  }
  const headlineName = document.getElementById("headline-name");
  if (headlineName) {
    headlineName.textContent = element.name;
    const resizeFont = () => {
      const container = headlineName.parentElement;
      const leftGroup = container.querySelector(".headline-left-group");
      if (!container || !leftGroup) return;
      const containerWidth = container.offsetWidth;
      const leftGroupWidth = leftGroup.offsetWidth;
      let margins = 80;
      let fontSize = 2.5;
      headlineName.style.marginLeft = "40px";
      headlineName.style.marginRight = "40px";
      headlineName.style.fontSize = fontSize + "rem";
      let availableWidth = containerWidth - leftGroupWidth - margins;
      while (headlineName.scrollWidth > availableWidth && fontSize > 1.0) {
        fontSize -= 0.1;
        headlineName.style.fontSize = fontSize + "rem";
      }
      if (fontSize < 1.8) {
        margins = 40;
        headlineName.style.marginLeft = "20px";
        headlineName.style.marginRight = "20px";
        availableWidth = containerWidth - leftGroupWidth - margins;
        fontSize = Math.min(2.5, fontSize + 0.3);
        headlineName.style.fontSize = fontSize + "rem";
        while (headlineName.scrollWidth > availableWidth && fontSize > 1.0) {
          fontSize -= 0.1;
          headlineName.style.fontSize = fontSize + "rem";
        }
      }
    };
    setTimeout(resizeFont, 0);
    window.addEventListener("resize", resizeFont);
  }
  const elementText = document.querySelector(".element-text");
  const elementName = document.querySelector(".element-name");
  if (elementText && elementName) {
    const nameLength = element.name.length;
    let lengthCategory;
    if (nameLength <= 4) {
      lengthCategory = "very-short";
    } else if (nameLength <= 6) {
      lengthCategory = "short";
    } else if (nameLength <= 10) {
      lengthCategory = "medium";
    } else {
      lengthCategory = "long";
    }
    elementText.setAttribute("data-name-length", lengthCategory);
  }
  if (modalCategory) {
    let cat = getElementCategory(element);
    if (eduData && eduData.amphoteric) {
      cat += " • Amphoteric";
    }
    modalCategory.textContent = cat;
  }
  if (modalWatermark) {
    modalWatermark.textContent = element.symbol;
  }
  if (modalPhase) modalPhase.textContent = element.phase || "—";
  if (modalCategoryDisplay) {
    modalCategoryDisplay.textContent = element.category || "—";
  }
  if (modalConfigLarge) {
    modalConfigLarge.textContent = element.electronConfig || "—";
  }
  if (modalDiscovery) modalDiscovery.textContent = element.discovery;
  if (modalEtymology) modalEtymology.textContent = element.etymology;
  if (modalDescription) modalDescription.textContent = element.description;
  if (modalDensity) modalDensity.textContent = finallyElementData.level3_properties?.physical?.density || "—";
  if (modalMelt) modalMelt.textContent = finallyElementData.level3_properties?.physical?.meltingPoint || "—";
  if (modalBoil) modalBoil.textContent = finallyElementData.level3_properties?.physical?.boilingPoint || "—";
  if (modalNegativity)
    modalNegativity.textContent = finallyElementData.level3_properties?.physical?.electronegativity ?? "—";
  if (modalRadius) modalRadius.textContent = element.radius || "—";
  if (modalIonization) {
    modalIonization.textContent = finallyElementData.level3_properties?.physical?.firstIonization || "—";
  }
  const grp = element.column;
  if (eduNames && modalCharge) {
    if (eduData && eduData.stockNames) {
      modalCharge.style.display = "none";
      eduNames.style.display = "block";
      eduNames.innerHTML = eduData.stockNames
        .map(
          (n) =>
            `<div class="stock-name-item"><span class="stock-ion">${element.symbol}<sup>${n.charge}</sup></span> <span class="stock-text">= ${n.name}</span></div>`,
        )
        .join("");
    } else {
      modalCharge.style.display = "block";
      eduNames.style.display = "none";
      let statesObj = finallyElementData.level3_properties?.electronic?.oxidationStates || { common: [], possible: [] };
      // Support legacy flat array format
      if (Array.isArray(statesObj)) {
        statesObj = { common: statesObj.slice(0, 1), possible: statesObj.slice(1) };
      }
      const common = statesObj.common || [];
      const possible = statesObj.possible || [];
      if (common.length > 0 || possible.length > 0) {
        let html = common.map(s => `<span class="charge-main">${s}</span>`).join("");
        html += possible.map(s => `<span class="charge-sub">${s}</span>`).join("");
        modalCharge.innerHTML = html;
      } else {
        modalCharge.innerHTML = `<span class="charge-main">—</span>`;
      }
    }
  }
  const atomicNum = element.number;
  if (modalP) modalP.textContent = atomicNum;
  if (modalE) modalE.textContent = atomicNum;
  if (modalN) {
    const massNumbers = [
      1, 4, 7, 9, 11, 12, 14, 16, 19, 20,
      23, 24, 27, 28, 31, 32, 35, 40, 39, 40,
      45, 48, 51, 52, 55, 56, 59, 59, 64, 65,
      70, 73, 75, 79, 80, 84, 85, 88, 89, 91,
      93, 96, 98, 101, 103, 106, 108, 112, 115, 119,
      122, 128, 127, 131, 133, 137, 139, 140, 141, 144,
      145, 150, 152, 157, 159, 163, 165, 167, 169, 173,
      175, 178, 181, 184, 186, 190, 192, 195, 197, 201,
      204, 207, 209, 209, 210, 222, 223, 226, 227, 232,
      231, 238, 237, 244, 243, 247, 247, 251, 252, 257,
      258, 259, 266, 267, 268, 269, 270, 277, 278, 281,
      282, 285, 286, 289, 290, 293, 294, 294
    ];
    const massNumber = (atomicNum >= 1 && atomicNum <= 118)
      ? massNumbers[atomicNum - 1]
      : null;
    modalN.textContent = massNumber !== null ? (massNumber - atomicNum) : "—";
  }

  // Correct display for Lanthanides and Actinides
  let displayPeriod = element.row;
  let displayGroup = grp;
  if (element.series === "lanthanide") {
    displayPeriod = 6;
    displayGroup = 3;
  } else if (element.series === "actinide") {
    displayPeriod = 7;
    displayGroup = 3;
  }

  if (modalPeriod) modalPeriod.textContent = displayPeriod || "—";
  if (modalGroup) modalGroup.textContent = displayGroup || "—";
  const amphotericCard = document.getElementById("amphoteric-card");
  if (amphotericCard) {
    if (eduData && eduData.amphoteric) {
      amphotericCard.style.display = "flex";
    } else {
      amphotericCard.style.display = "none";
    }
  }
  if (eduNames) {
    if (eduData && eduData.stockNames) {
      eduNames.style.display = "block";
      eduNames.innerHTML = eduData.stockNames
        .map(
          (n) =>
            `<div class="stock-name-item"><span class="stock-ion">${element.symbol}<sup>${n.charge}</sup></span> <span class="stock-text">= ${n.name}</span></div>`,
        )
        .join("");
    } else {
      eduNames.style.display = "none";
    }
  }
  if (eduIsotopes) {
    if (eduData && eduData.isotopesOverride) {
      eduIsotopes.style.display = "block";
      eduIsotopes.innerHTML = `
                  <div class="iso-title">Natural Isotopes</div>
                  <table class="iso-table">
                      ${eduData.isotopesOverride
          .map(
            (iso) => `
                          <tr>
                              <td class="iso-name">${iso.name}</td>
                              <td class="iso-detail"><span class="n-badge">${iso.neutron}n</span></td>
                              <td class="iso-percent">${iso.percent}</td>
                          </tr>
                      `,
          )
          .join("")}
                  </table>
                  <div class="iso-note">Average Mass: ${element.weight}</div>
              `;
    } else {
      eduIsotopes.style.display = "none";
    }
  }
  if (eduCardsContainer) {
    eduCardsContainer.style.display = "none";
    eduCardsContainer.innerHTML = "";
    eduCardsContainer.className = "edu-cards-grid";
    let advancedHtml = "";
    const hasAdvanced =
      eduData &&
      (eduData.equilibriums ||
        eduData.electrochemistry ||
        eduData.thermodynamics);
    if (hasAdvanced) {
      eduCardsContainer.className = "advanced-data-container";
      eduCardsContainer.style.display = "flex";
      eduCardsContainer.style.flexDirection = "column";
      eduCardsContainer.style.gap = "24px";
      if (eduData.equilibriums) {
        advancedHtml += `
                      <div class="data-section">
                          <div class="data-title">Solubility Equilibrium (25°C)</div>
                          <table class="data-table">
                              <thead><tr><th>Reaction</th><th>K<sub>sp</sub></th></tr></thead>
                              <tbody>
                                  ${eduData.equilibriums
            .map(
              (e) => `
                                      <tr>
                                          <td class="formula">${e.reaction}</td>
                                          <td class="value">${e.value}</td>
                                      </tr>
                                  `,
            )
            .join("")}
                              </tbody>
                          </table>
                      </div>
                  `;
      }
      if (eduData.electrochemistry) {
        advancedHtml += `
                      <div class="data-section">
                          <div class="data-title">Standard Reduction Potentials</div>
                          <table class="data-table">
                              <thead><tr><th style="text-align:left">Half-Reaction</th><th>Type</th><th>E° (V)</th></tr></thead>
                              <tbody>
                                  ${eduData.electrochemistry
            .map(
              (e) => `
                                      <tr>
                                          <td class="formula">${e.reaction}</td>
                                          <td class="meta">${e.type}</td>
                                          <td class="value ${e.potential.includes("+") ? "pos" : "neg"}">${e.potential}</td>
                                      </tr>
                                  `,
            )
            .join("")}
                              </tbody>
                          </table>
                      </div>
                  `;
      }
      if (eduData.thermodynamics) {
        advancedHtml += `
                      <div class="data-section">
                          <div class="data-title">Standard Enthalpy & Entropy</div>
                          <table class="data-table">
                              <thead><tr><th>Compound</th><th>ΔH<sub>f</sub>° (kJ/mol)</th><th>S° (J/mol·K)</th></tr></thead>
                              <tbody>
                                  ${eduData.thermodynamics
            .map(
              (e) => `
                                      <tr>
                                          <td class="formula">${e.compound}</td>
                                          <td class="value">${e.value}</td>
                                          <td class="value">${e.entropy || "-"}</td>
                                      </tr>
                                  `,
            )
            .join("")}
                              </tbody>
                          </table>
                      </div>
                  `;
      }
      if (eduData.stse) {
        advancedHtml += `
                      <div class="data-section stse-section">
                          <div class="data-title">${eduData.stse.title}</div>
                          <div class="stse-content">
                              ${eduData.stse.content}
                          </div>
                          <div class="stse-tags">
                              ${eduData.stse.tags.map((t) => `<span class="stse-tag">${t}</span>`).join("")}
                          </div>
                      </div>
                  `;
      }
      eduCardsContainer.innerHTML = advancedHtml;
    } else if (eduData && (eduData.solubility || eduData.safety)) {
      eduCardsContainer.style.display = "grid";
      let html = "";
      if (eduData.solubility) {
        const sol = eduData.solubility;
        html += `<div class="edu-card edu-solubility" style="grid-column: 1 / -1; width: 100%;">
                              <h4 class="edu-title">Reaction Prediction</h4>`;
        if (sol.insoluble) {
          html +=
            `<div class="sol-group"><span class="sol-label bad">Precipitates (Insoluble):</span>` +
            sol.insoluble
              .map(
                (i) => `<div class="sol-item">• ${i.ion} → ${i.result}</div>`,
              )
              .join("") +
            `</div>`;
        }
        if (sol.soluble) {
          html +=
            `<div class="sol-group"><span class="sol-label good">Soluble:</span>` +
            sol.soluble
              .map((i) => `<div class="sol-item">• ${i.ion}</div>`)
              .join("") +
            `</div>`;
        }
        html += `</div>`;
      }
      if (eduData.safety) {
        const safe = eduData.safety;
        html += `<div class="edu-card edu-safety" style="width: 100%;">
                              <h4 class="edu-title">Safety</h4>
                              <div class="safe-row"><strong>Toxicity:</strong> ${safe.toxicity}</div>
                              <div class="safe-row"><strong>Env:</strong> ${safe.env}</div>
                            </div>`;
      }
      eduCardsContainer.innerHTML = html;
    }
  }
  let compounds = "—";
  if (modalCompounds) modalCompounds.textContent = compounds;
  if (modalUses) {
    modalUses.textContent = (finallyElementData.level4_history_stse?.commonUses || []).join(", ") || "—";
  }
  if (modalHazards) {
    modalHazards.textContent = (finallyElementData.level4_history_stse?.hazards || []).join(", ") || "—";
  }
  if (modalShells) {
    modalShells.textContent = calculateShells(element);
  }
  const modalIsotopes = document.getElementById("modal-isotopes");
  if (modalIsotopes) {
    modalIsotopes.innerHTML = "";
    if (element.isotopes && element.isotopes.length > 0) {
      element.isotopes.forEach((iso) => {
        const row = document.createElement("div");
        row.classList.add("isotope-row");
        const info = document.createElement("div");
        info.classList.add("iso-info");
        const sym = document.createElement("span");
        sym.classList.add("iso-symbol");
        sym.textContent = iso.symbol;
        const isoName = document.createElement("span");
        isoName.classList.add("iso-name");
        isoName.textContent = iso.name || "";
        const abundance = document.createElement("span");
        abundance.classList.add("iso-abundance");
        abundance.textContent = iso.abundance || "";
        info.appendChild(sym);
        info.appendChild(isoName);
        info.appendChild(abundance);
        const tag = document.createElement("span");
        tag.classList.add("iso-tag");
        const isStable = (iso.stability || "")
          .toLowerCase()
          .includes("stable");
        tag.classList.add(isStable ? "stable" : "radioactive");
        tag.textContent = iso.stability || "Radioactive";
        row.appendChild(info);
        row.appendChild(tag);
        modalIsotopes.appendChild(row);
      });
    } else {
      modalIsotopes.innerHTML = `<div class="isotope-row no-data-message">No key isotope data available.</div>`;
    }
  }
  let category = "Element";
  if (element.series) {
    category =
      element.series.charAt(0).toUpperCase() + element.series.slice(1);
  } else if (element.row === 7 && element.column === 18) {
    category = "Noble Gas";
  }
  if (element.isLanthanide) category = "Lanthanide";
  if (element.isActinide) category = "Actinide";
  if (modalCategory) {
    modalCategory.textContent = category;
  }
  const modalContent = modal.querySelector(".modal-content");
  if (modalContent) {
    modalContent.setAttribute(
      "data-element-name",
      `${element.symbol} - ${element.name}`,
    );
  }
  modal.classList.add("active");
  document.title = `Zperiod - ${element.name}`;
  document.body.classList.add("hide-nav");
  if (isSimplifiedView) {
    const slider = document.querySelector(".cards-slider");
    if (slider) {
      slider.style.visibility = "hidden";
    }
    requestAnimationFrame(() => {
      initSwipeSlider();
      if (slider) {
        slider.style.visibility = "visible";
      }
    });
  }
  if (element.number <= 118) {
    atomContainer.classList.add("visible");
    cleanup3D();
    clearCurrentAtom();
    renderScene();
    void atomContainer.offsetWidth;
    setTimeout(() => {
      if (typeof THREE === "undefined") return;
      try {
        const contentHeight =
          modal.querySelector(".modal-content").clientHeight;
        if (atomContainer.clientHeight === 0) {
          const visualPane = atomContainer.parentElement;
          if (visualPane.clientHeight === 0) {
            visualPane.style.height = "100%";
            if (visualPane.clientHeight === 0) {
              atomContainer.style.height = contentHeight + "px";
            }
          } else {
            atomContainer.style.height = visualPane.clientHeight + "px";
          }
        }
        init3DScene(atomContainer);
        updateAtomStructure(element);
        onWindowResize();
        reset3DView();
        animateAtom();
        requestAnimationFrame(() => {
          atomContainer.style.opacity = "1";
        });
      } catch (e) {
        console.error("Three.js error:", e);
      }
    }, 100);
  } else {
    atomContainer.classList.remove("visible");
    cleanup3D();
  }
}

// ===== Level System =====
window.lockedLevelIndex = window.lockedLevelIndex ?? 0;
window.isLevelLocked = window.isLevelLocked ?? false;
function initializeLevelSystem(element) {
  const levelBtns = document.querySelectorAll(".level-btn");
  const levelContents = document.querySelectorAll(".level-content");
  levelBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetLevel = btn.dataset.level;
      switchToLevel(targetLevel, element);
      levelBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });
  const pendingLevelIndex = Number.isInteger(window._pendingLevelIndex)
    ? Math.max(0, window._pendingLevelIndex)
    : null;
  const startLevel = pendingLevelIndex !== null
    ? String(pendingLevelIndex + 1)
    : window.isLevelLocked
      ? String(window.lockedLevelIndex + 1)
      : "1";
  switchToLevel(startLevel, element);
  levelBtns.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.level === startLevel);
  });
}
function switchToLevel(level, element) {
  const levelContents = document.querySelectorAll(".level-content");
  levelContents.forEach((content) => {
    content.style.display = "none";
  });
  const targetContent = document.getElementById(`level-${level}`);
  if (targetContent) {
    targetContent.style.display = "block";
    populateLevelContent(level, element);
  }
}
function populateLevelContent(level, element) {
  const eduData = element.educational;
  if (level === "1") {
    populateLevel1(element, eduData);
  } else if (level === "2") {
    populateLevel2(element, eduData);
  } else if (level === "3") {
    populateLevel3(element, eduData);
  }
}
function populateLevel1(element, eduData) {
  const finallyElementData = finallyData[element.number] || {};
  const level1Protons = document.getElementById("level1-protons");
  const level1Electrons = document.getElementById("level1-electrons");
  const level1Neutrons = document.getElementById("level1-neutrons");
  const level1Mass = document.getElementById("level1-mass");
  const level1Density = document.getElementById("level1-density");
  const level1Melt = document.getElementById("level1-melt");
  if (level1Protons) level1Protons.textContent = element.number;
  if (level1Electrons) level1Electrons.textContent = element.number;
  if (level1Neutrons) {
    const massNumbers = [
      1, 4, 7, 9, 11, 12, 14, 16, 19, 20,
      23, 24, 27, 28, 31, 32, 35, 40, 39, 40,
      45, 48, 51, 52, 55, 56, 59, 59, 64, 65,
      70, 73, 75, 79, 80, 84, 85, 88, 89, 91,
      93, 96, 98, 101, 103, 106, 108, 112, 115, 119,
      122, 128, 127, 131, 133, 137, 139, 140, 141, 144,
      145, 150, 152, 157, 159, 163, 165, 167, 169, 173,
      175, 178, 181, 184, 186, 190, 192, 195, 197, 201,
      204, 207, 209, 209, 210, 222, 223, 226, 227, 232,
      231, 238, 237, 244, 243, 247, 247, 251, 252, 257,
      258, 259, 266, 267, 268, 269, 270, 277, 278, 281,
      282, 285, 286, 289, 290, 293, 294, 294
    ];
    const massNumber = (element.number >= 1 && element.number <= 118)
      ? massNumbers[element.number - 1]
      : null;
    level1Neutrons.textContent = massNumber !== null ? (massNumber - element.number) : "—";
  }
  if (level1Mass) level1Mass.textContent = finallyElementData.level2_atomic?.mass?.highSchool || "—";
  if (level1Density) {
    level1Density.textContent = finallyElementData.level3_properties?.physical?.density || "—";
  }
  if (level1Melt) {
    level1Melt.textContent = finallyElementData.level3_properties?.physical?.meltingPoint || "—";
  }
  const modalCategoryDisplay = document.getElementById(
    "modal-category-display",
  );
  const modalPhase = document.getElementById("modal-phase");
  const modalGroup = document.getElementById("modal-group");
  const amphotericCard = document.getElementById("amphoteric-card");
  if (modalCategoryDisplay)
    modalCategoryDisplay.textContent = element.category || "—";
  if (modalPhase) modalPhase.textContent = element.phase || "—";
  if (modalGroup) modalGroup.textContent = element.column || "—";
  if (amphotericCard) {
    if (eduData && eduData.amphoteric) {
      amphotericCard.style.display = "flex";
    } else {
      amphotericCard.style.display = "none";
    }
  }
}
function populateLevel2(element, eduData) { }
function populateLevel3(element, eduData) { }

// ===== Swipe Slider =====
function initSwipeSlider() {
  // Abort all previous listeners to prevent stacking
  if (window._elementSliderAbort) window._elementSliderAbort.abort();
  const ac = new AbortController();
  window._elementSliderAbort = ac;
  const sig = { signal: ac.signal };

  const slider = document.querySelector(".cards-slider");
  const dots = document.querySelectorAll(".slider-dots .dot");
  const slides = document.querySelectorAll(".card-slide");
  const lockBtn = document.getElementById("level-lock-btn");

  if (!slider || slides.length < 2) return;

  const MAX_INDEX = Math.min(slides.length - 1, 3); // Hard limit: 4 pages max (index 0-3)
  const hasPendingLevel = Number.isInteger(window._pendingLevelIndex);
  let currentIndex = hasPendingLevel
    ? Math.min(Math.max(window._pendingLevelIndex, 0), MAX_INDEX)
    : window.isLevelLocked
      ? Math.min(window.lockedLevelIndex, MAX_INDEX)
      : 0;
  window._pendingLevelIndex = null;
  const gap = 20;
  let isDragging = false;
  let startX = 0;
  let startScrollLeft = 0;

  if (lockBtn) {
    lockBtn.style.display = "flex";
    const newLockBtn = lockBtn.cloneNode(true);
    lockBtn.parentNode.replaceChild(newLockBtn, lockBtn);
    newLockBtn.classList.toggle("locked", window.isLevelLocked);
    newLockBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.isLevelLocked = !window.isLevelLocked;
      window.lockedLevelIndex = currentIndex;
      newLockBtn.classList.toggle("locked", window.isLevelLocked);
      updateDots();
    }, sig);
  }

  function getSlideWidth() { return slider.clientWidth + gap; }

  function updateDots() {
    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === currentIndex);
      dot.classList.toggle("locked", window.isLevelLocked && i === window.lockedLevelIndex);
    });
  }

  function update3DEffect() {
    const scrollLeft = slider.scrollLeft;
    const slideWidth = getSlideWidth();
    slides.forEach((slide, index) => {
      const offset = (index * slideWidth - scrollLeft) / slider.clientWidth;
      if (Math.abs(offset) < 2) {
        const rotY = -25 * offset;
        const scale = 1 - 0.12 * Math.abs(offset);
        const opacity = 1 - 0.4 * Math.abs(offset);
        slide.style.transform = `perspective(800px) rotateY(${rotY}deg) scale(${scale})`;
        slide.style.opacity = Math.max(0.3, opacity);
        slide.style.zIndex = 10 - Math.abs(Math.round(offset));
      } else {
        slide.style.opacity = "0";
      }
    });
  }

  function snapToSlide(index, animated = true) {
    index = Math.max(0, Math.min(index, MAX_INDEX));
    currentIndex = index;
    const target = index * getSlideWidth();
    if (animated) {
      const start = slider.scrollLeft;
      const distance = target - start;
      const duration = 200;
      let startTime = null;
      function animate(currentTime) {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        slider.scrollLeft = start + distance * eased;
        update3DEffect();
        if (progress < 1) requestAnimationFrame(animate);
      }
      requestAnimationFrame(animate);
    } else {
      slider.scrollLeft = target;
    }
    updateDots();
    const el = window.currentAtomElement;
    if (el) switchToLevel(String(index + 1), el);
  }

  function getX(e) { return e.touches ? e.touches[0].clientX : e.pageX; }
  function startDrag(e) { isDragging = true; startX = getX(e); startScrollLeft = slider.scrollLeft; slider.style.cursor = "grabbing"; }
  function moveDrag(e) { if (!isDragging) return; slider.scrollLeft = startScrollLeft + (startX - getX(e)); update3DEffect(); }
  function endDrag() {
    if (!isDragging) return;
    isDragging = false;
    slider.style.cursor = "grab";
    const slideWidth = getSlideWidth();
    const moved = slider.scrollLeft - currentIndex * slideWidth;
    const threshold = slideWidth * 0.15;
    let targetIndex = currentIndex;
    if (moved > threshold) targetIndex = currentIndex + 1;
    else if (moved < -threshold) targetIndex = currentIndex - 1;
    snapToSlide(targetIndex);
  }

  slider.addEventListener("mousedown", startDrag, sig);
  slider.addEventListener("touchstart", startDrag, { passive: true, ...sig });
  document.addEventListener("mousemove", moveDrag, sig);
  document.addEventListener("touchmove", moveDrag, { passive: true, ...sig });
  document.addEventListener("mouseup", endDrag, sig);
  document.addEventListener("touchend", endDrag, sig);

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => snapToSlide(Math.min(index, MAX_INDEX)), sig);
  });

  slider.addEventListener("scroll", () => {
    if (!isDragging) {
      update3DEffect();
      const realIndex = Math.max(0, Math.min(Math.round(slider.scrollLeft / getSlideWidth()), MAX_INDEX));
      dots.forEach((dot, i) => dot.classList.toggle("active", i === realIndex));
    }
  }, sig);

  document.addEventListener("keydown", (e) => {
    const elementModal = document.getElementById("element-modal");
    if (!elementModal || !elementModal.classList.contains("active")) return;
    if (e.key === "ArrowRight" || e.key === " ") {
      e.preventDefault();
      if (currentIndex < MAX_INDEX) snapToSlide(currentIndex + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      if (currentIndex > 0) snapToSlide(currentIndex - 1);
    }
  }, sig);

  // Trackpad two-finger swipe for Mac
  let wheelTimeout = null;
  slider.addEventListener("wheel", (e) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 30) {
      e.preventDefault();
      if (wheelTimeout) return;
      wheelTimeout = setTimeout(() => { wheelTimeout = null; }, 300);
      if (e.deltaX > 0 && currentIndex < MAX_INDEX) snapToSlide(currentIndex + 1);
      else if (e.deltaX < 0 && currentIndex > 0) snapToSlide(currentIndex - 1);
    }
  }, { passive: false, ...sig });

  snapToSlide(currentIndex, false);
  update3DEffect();
}

// ===== Initialize Modal UI (call on DOMContentLoaded) =====
export function initModalUI() {
  modal = document.getElementById("element-modal");
  modalClose = document.getElementById("modal-close");
  modalSymbol = document.getElementById("modal-symbol");
  modalName = document.getElementById("modal-name");
  modalNumber = document.getElementById("modal-number");
  modalCategory = document.getElementById("modal-category");
  modalPhase = document.getElementById("modal-phase");
  modalCategoryDisplay = document.getElementById("modal-category-display");
  modalConfigLarge = document.getElementById("modal-config-large");
  modalDiscovery = document.getElementById("modal-discovery");
  modalEtymology = document.getElementById("modal-etymology");
  modalDescription = document.getElementById("modal-description");
  modalDensity = document.getElementById("modal-density");
  modalMelt = document.getElementById("modal-melt");
  modalBoil = document.getElementById("modal-boil");
  modalNegativity = document.getElementById("modal-electronegativity");
  modalRadius = document.getElementById("modal-radius");
  modalIonization = document.getElementById("modal-ionization");
  modalWatermark = document.getElementById("modal-watermark");
  atomContainer = document.getElementById("atom-container");
  modalCharge = document.getElementById("modal-charge");
  modalP = document.getElementById("modal-p");
  modalE = document.getElementById("modal-e");
  modalN = document.getElementById("modal-n");
  modalPeriod = document.getElementById("modal-period");
  modalGroup = document.getElementById("modal-group");
  modalCompounds = document.getElementById("modal-compounds");
  modalUses = document.getElementById("modal-uses");
  modalHazards = document.getElementById("modal-hazards");
  modalShells = document.getElementById("modal-shells");
  eduNames = document.getElementById("edu-names");
  eduIsotopes = document.getElementById("edu-isotopes");
  eduCardsContainer = document.getElementById("edu-cards-container");

  // Modal close handler
  function resetModalUI() {
    const slider = document.querySelector(".cards-slider");
    const dots = document.querySelectorAll(".slider-dots .dot");
    if (slider) {
      slider.scrollTo({ left: 0 });
      if (dots.length > 0) {
        dots.forEach((d) => d.classList.remove("active"));
        dots[0].classList.add("active");
      }
    }
    const levelBtns = document.querySelectorAll(".level-btn");
    const levelContents = document.querySelectorAll(".level-content");
    levelBtns.forEach((btn) => btn.classList.remove("active"));
    levelContents.forEach((content) => (content.style.display = "none"));
    const level1Btn = document.querySelector('.level-btn[data-level="1"]');
    const level1Content = document.getElementById("level-1");
    if (level1Btn) level1Btn.classList.add("active");
    if (level1Content) level1Content.style.display = "block";
  }

  modalClose.addEventListener("click", () => {
    modal.classList.remove("active");
    document.body.classList.remove("hide-nav");
    document.title = "Zperiod";
    cleanup3D(true);
    atomContainer.classList.remove("visible");
    resetModalUI();
  });

  modal.addEventListener("click", (e) => {
    if (window._zperiodIsDragging) return;
    if (e.target === modal) {
      modal.classList.remove("active");
      document.body.classList.remove("hide-nav");
      document.title = "Zperiod";
      cleanup3D(true);
      atomContainer.classList.remove("visible");
      resetModalUI();
    }
  });

  let currentPrimaryElement = null;
  const tableContainerEl = document.getElementById("periodic-table");
  if (tableContainerEl) {
    tableContainerEl.addEventListener("click", (e) => {
      const cell = e.target.closest(".element");
      if (cell && !cell.classList.contains("empty")) {
        // Range blocks (La-Lu, Ac-Lr) are handled by their own click listeners
        if (cell.classList.contains("range-block")) return;
        const number = parseInt(cell.querySelector(".number").textContent);
        const element = elements.find((el) => el.number === number);
        if (element) {
          currentPrimaryElement = element;
          showModal(element);
        }
      }
    });
  }
}
