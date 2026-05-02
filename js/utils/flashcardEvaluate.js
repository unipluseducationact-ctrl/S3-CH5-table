import {
  placementsSatisfyPairingRules
} from "../data/elements";
function normalizeSymbol(input) {
  return input.trim();
}
function evaluateAnswer(element, symbolInput, shellCount, placements) {
  const reasons = [];
  const yours = normalizeSymbol(symbolInput);
  const expected = element.symbol;
  if (yours !== expected) reasons.push("reason_wrongSymbol");
  if (shellCount !== element.expectedShells) reasons.push("reason_wrongShells");
  const allPlaced = placements.length === element.z && placements.every((p) => p !== null);
  if (!allPlaced) reasons.push("reason_wrongElectrons");
  else {
    const expectedCounts = element.shellCounts;
    const maxShell = Math.max(expectedCounts.length, shellCount);
    const placedCounts = Array.from({ length: maxShell }, () => 0);
    for (const p of placements) {
      if (!p) continue;
      if (p.shellIndex < 0 || p.shellIndex >= maxShell) {
        reasons.push("reason_wrongElectrons");
        break;
      }
      placedCounts[p.shellIndex]++;
    }
    if (!reasons.includes("reason_wrongElectrons")) {
      for (let i = 0; i < maxShell; i++) {
        const expectedInShell = expectedCounts[i] ?? 0;
        if (placedCounts[i] !== expectedInShell) {
          reasons.push("reason_wrongElectrons");
          break;
        }
      }
    }
  }
  const uniq = [...new Set(reasons)];
  const structureOk = uniq.length === 0;
  const reminders = [];
  if (structureOk && !placementsSatisfyPairingRules(placements)) {
    reminders.push("reminder_pairing");
  }
  return { correct: structureOk, reasons: uniq, reminders };
}
export {
  evaluateAnswer,
  normalizeSymbol
};
