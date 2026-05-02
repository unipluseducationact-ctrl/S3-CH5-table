const PAIR_OFFSET_DEG = 18;
function normDeg(deg) {
  let a = deg % 360;
  if (a < 0) a += 360;
  return a;
}
function baseAnglesForShell(shellIndex) {
  if (shellIndex === 0) return [0, 120, 240];
  const out = [];
  for (let i = 0; i < 8; i++) out.push(i * 45);
  return out;
}
function allSnapAnglesForShell(shellIndex) {
  const \u03B4 = PAIR_OFFSET_DEG;
  const seen = /* @__PURE__ */ new Set();
  const list = [];
  for (const \u03B8 of baseAnglesForShell(shellIndex)) {
    for (const a of [normDeg(\u03B8 - \u03B4), normDeg(\u03B8 + \u03B4)]) {
      if (!seen.has(a)) {
        seen.add(a);
        list.push(a);
      }
    }
  }
  list.sort((x, y) => x - y);
  return list;
}
const SHELL0_ANGLES = allSnapAnglesForShell(0);
const SHELL1PLUS_ANGLES = allSnapAnglesForShell(1);
const PREFERRED_FILL_ORDER = [0, 180, 90, 270, 45, 135, 225, 315];
function preferredOrderForBases(bases) {
  const set = new Set(bases.map((a) => normDeg(a)));
  const ordered = [];
  for (const a of PREFERRED_FILL_ORDER) {
    if (set.has(normDeg(a))) ordered.push(normDeg(a));
  }
  for (const a of bases) {
    const norm = normDeg(a);
    if (!ordered.includes(norm)) ordered.push(norm);
  }
  return ordered;
}
function anglesForShell(shellIndex, count) {
  if (count <= 0) return [];
  const \u03B4 = PAIR_OFFSET_DEG;
  const bases = preferredOrderForBases(baseAnglesForShell(shellIndex));
  const out = [];
  let remaining = count;
  for (const \u03B8 of bases) {
    if (remaining <= 0) break;
    if (remaining >= 2) {
      out.push(normDeg(\u03B8 - \u03B4), normDeg(\u03B8 + \u03B4));
      remaining -= 2;
    } else {
      out.push(normDeg(\u03B8 - \u03B4));
      remaining -= 1;
    }
  }
  return out;
}
function shellCountsToSlots(shellCounts) {
  const slots = [];
  shellCounts.forEach((n, shellIndex) => {
    if (n === 0) return;
    anglesForShell(shellIndex, n).forEach((angleDeg) => {
      slots.push({ shellIndex, angleDeg });
    });
  });
  return slots;
}
function make(z, symbol, nameEn, nameZh, massNumber, shellCounts) {
  const nonZero = shellCounts.filter((n) => n > 0);
  const expectedShells = nonZero.length;
  const trimmed = [...shellCounts];
  while (trimmed.length > 0 && trimmed[trimmed.length - 1] === 0) trimmed.pop();
  return {
    z,
    symbol,
    nameEn,
    nameZh,
    massNumber,
    shellCounts: trimmed.length ? trimmed : shellCounts,
    expectedShells,
    templateSlots: shellCountsToSlots(shellCounts)
  };
}
const ELEMENTS = [
  make(1, "H", "Hydrogen", "\u6C2B", 1, [1]),
  make(2, "He", "Helium", "\u6C26", 4, [2]),
  make(3, "Li", "Lithium", "\u92F0", 7, [2, 1]),
  make(4, "Be", "Beryllium", "\u9239", 9, [2, 2]),
  make(5, "B", "Boron", "\u787C", 11, [2, 3]),
  make(6, "C", "Carbon", "\u78B3", 12, [2, 4]),
  make(7, "N", "Nitrogen", "\u6C2E", 14, [2, 5]),
  make(8, "O", "Oxygen", "\u6C27", 16, [2, 6]),
  make(9, "F", "Fluorine", "\u6C1F", 19, [2, 7]),
  make(10, "Ne", "Neon", "\u6C16", 20, [2, 8]),
  make(11, "Na", "Sodium", "\u9209", 23, [2, 8, 1]),
  make(12, "Mg", "Magnesium", "\u9382", 24, [2, 8, 2]),
  make(13, "Al", "Aluminium", "\u92C1", 27, [2, 8, 3]),
  make(14, "Si", "Silicon", "\u77FD", 28, [2, 8, 4]),
  make(15, "P", "Phosphorus", "\u78F7", 31, [2, 8, 5]),
  make(16, "S", "Sulfur", "\u786B", 32, [2, 8, 6]),
  make(17, "Cl", "Chlorine", "\u6C2F", 35, [2, 8, 7]),
  make(18, "Ar", "Argon", "\u6C2C", 40, [2, 8, 8]),
  make(19, "K", "Potassium", "\u9240", 39, [2, 8, 8, 1]),
  make(20, "Ca", "Calcium", "\u9223", 40, [2, 8, 8, 2])
];
const ELEMENT_BY_Z = new Map(ELEMENTS.map((e) => [e.z, e]));
const MAX_SHELLS = 4;
function validAnglesForShell(shellIndex) {
  if (shellIndex === 0) return [...SHELL0_ANGLES];
  return [...SHELL1PLUS_ANGLES];
}
function snapTripletForBase(_shellIndex, baseTheta) {
  const \u03B4 = PAIR_OFFSET_DEG;
  const \u03B8 = normDeg(baseTheta);
  return {
    minus: normDeg(\u03B8 - \u03B4),
    plus: normDeg(\u03B8 + \u03B4)
  };
}
function baseForAngleOnShell(shellIndex, angleDeg) {
  const a = normDeg(angleDeg);
  for (const \u03B8 of baseAnglesForShell(shellIndex)) {
    const { minus, plus } = snapTripletForBase(shellIndex, \u03B8);
    if (a === minus || a === plus) return normDeg(\u03B8);
  }
  return null;
}
function baseOccupancyValid(shellIndex, baseTheta, anglesPresent) {
  const { minus, plus } = snapTripletForBase(shellIndex, baseTheta);
  const hasM = anglesPresent.has(minus);
  const hasP = anglesPresent.has(plus);
  const n = (hasM ? 1 : 0) + (hasP ? 1 : 0);
  if (n === 0) return true;
  if (n === 1) return true;
  if (n === 2) return hasM && hasP;
  return false;
}
function sanitizeTripletViolationsOnce(next) {
  let changed = false;
  for (let shell = 0; shell < MAX_SHELLS; shell++) {
    for (const baseTheta of baseAnglesForShell(shell)) {
      const { minus, plus } = snapTripletForBase(shell, baseTheta);
      const triplet = /* @__PURE__ */ new Set([minus, plus]);
      const anglesPresent = /* @__PURE__ */ new Set();
      for (let i = 0; i < next.length; i++) {
        const p = next[i];
        if (!p || p.shellIndex !== shell) continue;
        const a = normDeg(p.angleDeg);
        if (triplet.has(a)) anglesPresent.add(a);
      }
      if (anglesPresent.size === 0) continue;
      if (baseOccupancyValid(shell, baseTheta, anglesPresent)) continue;
      for (let i = 0; i < next.length; i++) {
        const p = next[i];
        if (!p || p.shellIndex !== shell) continue;
        if (triplet.has(normDeg(p.angleDeg))) {
          next[i] = null;
          changed = true;
        }
      }
    }
  }
  return changed;
}
function stripOrphanAnglesForShell(next) {
  let changed = false;
  for (let i = 0; i < next.length; i++) {
    const p = next[i];
    if (!p) continue;
    const allowed = new Set(validAnglesForShell(p.shellIndex).map((a) => normDeg(a)));
    if (!allowed.has(normDeg(p.angleDeg))) {
      next[i] = null;
      changed = true;
    }
  }
  return changed;
}
function sanitizePlacementsForShellRules(placements) {
  const next = [...placements];
  for (let iter = 0; iter < 16; iter++) {
    const a = sanitizeTripletViolationsOnce(next);
    const d = stripOrphanAnglesForShell(next);
    if (!a && !d) break;
  }
  return next;
}
function applySlotWithSanitize(placements, electronId, slot) {
  const next = [...placements];
  if (slot === null) {
    next[electronId] = null;
    return sanitizePlacementsForShellRules(next);
  }
  const key = slotKey(slot.shellIndex, slot.angleDeg);
  const prevAtTarget = next.findIndex(
    (p, i) => i !== electronId && p !== null && slotKey(p.shellIndex, p.angleDeg) === key
  );
  if (prevAtTarget >= 0) next[prevAtTarget] = null;
  next[electronId] = slot;
  return sanitizePlacementsForShellRules(next);
}
function placementKeepsSlot(next, electronId, intended) {
  const p = next[electronId];
  if (!p) return false;
  return p.shellIndex === intended.shellIndex && normDeg(p.angleDeg) === normDeg(intended.angleDeg);
}
function slotKey(shellIndex, angleDeg) {
  return `${shellIndex}:${normDeg(angleDeg)}`;
}
function shellPairingRuleSatisfied(shellIndex, angles) {
  if (angles.length === 0) return true;
  const byBase = /* @__PURE__ */ new Map();
  for (const raw of angles) {
    const base = baseForAngleOnShell(shellIndex, normDeg(raw));
    if (base === null) return false;
    const { minus, plus } = snapTripletForBase(shellIndex, base);
    const a = normDeg(raw);
    let rec = byBase.get(base);
    if (!rec) {
      rec = { minus: false, plus: false };
      byBase.set(base, rec);
    }
    if (a === minus) {
      if (rec.minus) return false;
      rec.minus = true;
    } else if (a === plus) {
      if (rec.plus) return false;
      rec.plus = true;
    } else {
      return false;
    }
  }
  let loneBases = 0;
  for (const rec of byBase.values()) {
    const n = (rec.minus ? 1 : 0) + (rec.plus ? 1 : 0);
    if (n === 1) loneBases++;
    else if (n !== 0 && n !== 2) return false;
  }
  const total = angles.length;
  if (total % 2 === 0) return loneBases === 0;
  return loneBases === 1;
}
function placementsSatisfyPairingRules(placements) {
  const byShell = /* @__PURE__ */ new Map();
  for (const p of placements) {
    if (!p) continue;
    const list = byShell.get(p.shellIndex) ?? [];
    list.push(p.angleDeg);
    byShell.set(p.shellIndex, list);
  }
  for (const [shellIndex, angles] of byShell) {
    if (!shellPairingRuleSatisfied(shellIndex, angles)) return false;
  }
  return true;
}
export {
  ELEMENTS,
  ELEMENT_BY_Z,
  MAX_SHELLS,
  applySlotWithSanitize,
  baseAnglesForShell,
  baseForAngleOnShell,
  baseOccupancyValid,
  placementKeepsSlot,
  placementsSatisfyPairingRules,
  sanitizePlacementsForShellRules,
  shellCountsToSlots,
  shellPairingRuleSatisfied,
  slotKey,
  snapTripletForBase,
  validAnglesForShell
};
