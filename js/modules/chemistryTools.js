// =============================================================================
// Chemistry Tools - Pure Logic Module
// Extracted from script.js: algorithms, parsers, calculators (zero DOM access)
// =============================================================================

// ===== Atomic Masses (common elements for Grade 9-11) =====
export const atomicMasses = {
  // Period 1
  H: 1.008,
  He: 4.003,
  // Period 2
  Li: 6.941,
  Be: 9.012,
  B: 10.81,
  C: 12.01,
  N: 14.01,
  O: 16.0,
  F: 19.0,
  Ne: 20.18,
  // Period 3
  Na: 22.99,
  Mg: 24.31,
  Al: 26.98,
  Si: 28.09,
  P: 30.97,
  S: 32.07,
  Cl: 35.45,
  Ar: 39.95,
  // Period 4
  K: 39.1,
  Ca: 40.08,
  Sc: 44.96,
  Ti: 47.87,
  V: 50.94,
  Cr: 52.0,
  Mn: 54.94,
  Fe: 55.85,
  Co: 58.93,
  Ni: 58.69,
  Cu: 63.55,
  Zn: 65.38,
  Ga: 69.72,
  Ge: 72.63,
  As: 74.92,
  Se: 78.97,
  Br: 79.9,
  Kr: 83.8,
  // Period 5
  Rb: 85.47,
  Sr: 87.62,
  Y: 88.91,
  Zr: 91.22,
  Nb: 92.91,
  Mo: 95.95,
  Tc: 98.0,
  Ru: 101.1,
  Rh: 102.9,
  Pd: 106.4,
  Ag: 107.9,
  Cd: 112.4,
  In: 114.8,
  Sn: 118.7,
  Sb: 121.8,
  Te: 127.6,
  I: 126.9,
  Xe: 131.3,
  // Period 6
  Cs: 132.9,
  Ba: 137.3,
  La: 138.9,
  Ce: 140.1,
  Pr: 140.9,
  Nd: 144.2,
  Pm: 145.0,
  Sm: 150.4,
  Eu: 152.0,
  Gd: 157.3,
  Tb: 158.9,
  Dy: 162.5,
  Ho: 164.9,
  Er: 167.3,
  Tm: 168.9,
  Yb: 173.0,
  Lu: 175.0,
  Hf: 178.5,
  Ta: 180.9,
  W: 183.8,
  Re: 186.2,
  Os: 190.2,
  Ir: 192.2,
  Pt: 195.1,
  Au: 197.0,
  Hg: 200.6,
  Tl: 204.4,
  Pb: 207.2,
  Bi: 209.0,
  Po: 209.0,
  At: 210.0,
  Rn: 222.0,
  // Period 7
  Fr: 223.0,
  Ra: 226.0,
  Ac: 227.0,
  Th: 232.0,
  Pa: 231.0,
  U: 238.0,
  Np: 237.0,
  Pu: 244.0,
  Am: 243.0,
  Cm: 247.0,
  Bk: 247.0,
  Cf: 251.0,
  Es: 252.0,
  Fm: 257.0,
  Md: 258.0,
  No: 259.0,
  Lr: 262.0,
  Rf: 267.0,
  Db: 270.0,
  Sg: 271.0,
  Bh: 270.0,
  Hs: 277.0,
  Mt: 276.0,
  Ds: 281.0,
  Rg: 282.0,
  Cn: 285.0,
  Nh: 286.0,
  Fl: 289.0,
  Mc: 290.0,
  Lv: 293.0,
  Ts: 294.0,
  Og: 294.0,
};

// ===== Parse chemical formula (Strict Rules) =====
export function parseFormulaStrict(formula) {
  if (!formula) return {};

  // Normalize Subscripts
  const subMap = {
    "₀": "0",
    "₁": "1",
    "₂": "2",
    "₃": "3",
    "₄": "4",
    "₅": "5",
    "₆": "6",
    "₇": "7",
    "₈": "8",
    "₉": "9",
  };
  formula = formula.replace(/[₀-₉]/g, (c) => subMap[c]);

  // Normalize Dots to •
  formula = formula.replace(/[.*·]/g, "•");

  // Handle Hydrates (Recursive)
  if (formula.includes("•")) {
    const parts = formula.split("•");
    const finalCounts = {};
    parts.forEach((part) => {
      const partCounts = parseFormulaStrict(part.trim());
      for (const [el, num] of Object.entries(partCounts)) {
        finalCounts[el] = (finalCounts[el] || 0) + num;
      }
    });
    return finalCounts;
  }

  formula = formula.trim();
  if (!formula) return {};

  // 1. Extract Global Coefficient
  let globalMultiplier = 1;
  const coeffMatch = formula.match(/^(\d+)/);
  if (coeffMatch) {
    globalMultiplier = parseInt(coeffMatch[1]);
    formula = formula.substring(coeffMatch[1].length);
  }

  const stack = [{}]; // Root layer
  let i = 0;
  const len = formula.length;

  while (i < len) {
    const char = formula[i];

    if (char === "(" || char === "[" || char === "{") {
      stack.push({});
      i++;
    } else if (char === ")" || char === "]" || char === "}") {
      if (stack.length < 2) throw new Error("Unmatched parentheses");
      i++;

      // Subscript after parenthesis
      let count = 1;
      const numMatch = formula.slice(i).match(/^(\d+)/);
      if (numMatch) {
        count = parseInt(numMatch[1]);
        i += numMatch[1].length;
      }

      const popped = stack.pop();
      const current = stack[stack.length - 1];

      // Merge popped * count into current
      for (const [el, num] of Object.entries(popped)) {
        current[el] = (current[el] || 0) + num * count;
      }
    } else if (/[A-Z]/.test(char)) {
      // Read Element
      let element = char;
      i++;
      if (i < len && /[a-z]/.test(formula[i])) {
        element += formula[i];
        i++;
      }

      // Read Subscript
      let count = 1;
      const numMatch = formula.slice(i).match(/^(\d+)/);
      if (numMatch) {
        count = parseInt(numMatch[1]);
        i += numMatch[1].length;
      }

      const current = stack[stack.length - 1];
      current[element] = (current[element] || 0) + count;
    } else {
      // Ignore whitespace, reject others
      if (/\s/.test(char)) {
        i++;
      } else {
        throw new Error("Invalid character: " + char);
      }
    }
  }

  if (stack.length > 1) throw new Error("Unclosed parentheses");

  const result = stack[0];

  // Apply Global Coefficient
  if (globalMultiplier !== 1) {
    for (const k in result) result[k] *= globalMultiplier;
  }
  return result;
}

// =============================================================================
// GAUSSIAN ELIMINATION EQUATION BALANCER
// Implements matrix-based chemical equation balancing using RREF
// =============================================================================

/**
 * Parse a chemical formula into element counts
 * Handles parentheses, nested groups, and coefficients
 * Examples: "H2O" -> {H:2, O:1}, "Ca(OH)2" -> {Ca:1, O:2, H:2}, "Al2(SO4)3" -> {Al:2, S:3, O:12}
 */
function parseChemicalFormula(formula) {
  // Remove any leading coefficient
  formula = formula.replace(/^\d+/, "").trim();

  const atoms = {};

  function parse(str, multiplier = 1) {
    let i = 0;
    while (i < str.length) {
      if (str[i] === "(" || str[i] === "[") {
        // Find matching closing bracket
        const openBracket = str[i];
        const closeBracket = openBracket === "(" ? ")" : "]";
        let depth = 1;
        let j = i + 1;
        while (j < str.length && depth > 0) {
          if (str[j] === openBracket) depth++;
          if (str[j] === closeBracket) depth--;
          j++;
        }
        const inner = str.substring(i + 1, j - 1);

        // Get multiplier after closing bracket
        let numStr = "";
        while (j < str.length && /\d/.test(str[j])) {
          numStr += str[j];
          j++;
        }
        const innerMult = numStr ? parseInt(numStr) : 1;

        parse(inner, multiplier * innerMult);
        i = j;
      } else if (/[A-Z]/.test(str[i])) {
        // Element symbol
        let element = str[i];
        i++;
        while (i < str.length && /[a-z]/.test(str[i])) {
          element += str[i];
          i++;
        }

        // Get count after element
        let numStr = "";
        while (i < str.length && /\d/.test(str[i])) {
          numStr += str[i];
          i++;
        }
        const count = numStr ? parseInt(numStr) : 1;

        atoms[element] = (atoms[element] || 0) + count * multiplier;
      } else {
        i++;
      }
    }
  }

  parse(formula);
  return atoms;
}

/**
 * Calculate GCD of two numbers
 */
function gcd(a, b) {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

/**
 * Calculate LCM of two numbers
 */
function lcm(a, b) {
  return Math.abs(a * b) / gcd(a, b);
}

/**
 * Calculate LCM of an array of numbers
 */
function lcmArray(arr) {
  return arr.reduce((a, b) => lcm(a, b), 1);
}

/**
 * Calculate GCD of an array of numbers
 */
function gcdArray(arr) {
  return arr.reduce((a, b) => gcd(a, b));
}

/**
 * Gaussian Elimination to solve the system (find null space)
 * Returns coefficients for balancing, or null if no solution
 */
function gaussianElimination(matrix, numCompounds) {
  const rows = matrix.length;
  const cols = matrix[0].length;

  // Create a copy of the matrix with floating point
  const m = matrix.map((row) => row.map((v) => v));

  let pivotRow = 0;
  const pivotCols = [];

  // Forward elimination
  for (let col = 0; col < cols && pivotRow < rows; col++) {
    // Find the maximum element in this column for numerical stability
    let maxRow = pivotRow;
    let maxVal = Math.abs(m[pivotRow][col]);
    for (let row = pivotRow + 1; row < rows; row++) {
      if (Math.abs(m[row][col]) > maxVal) {
        maxVal = Math.abs(m[row][col]);
        maxRow = row;
      }
    }

    if (maxVal < 1e-10) continue; // Skip this column (no pivot)

    // Swap rows
    [m[pivotRow], m[maxRow]] = [m[maxRow], m[pivotRow]];

    pivotCols.push(col);

    // Scale pivot row
    const pivot = m[pivotRow][col];
    for (let j = 0; j < cols; j++) {
      m[pivotRow][j] /= pivot;
    }

    // Eliminate other rows
    for (let row = 0; row < rows; row++) {
      if (row !== pivotRow && Math.abs(m[row][col]) > 1e-10) {
        const factor = m[row][col];
        for (let j = 0; j < cols; j++) {
          m[row][j] -= factor * m[pivotRow][j];
        }
      }
    }

    pivotRow++;
  }

  // Find free variables (columns without pivots)
  const freeVars = [];
  for (let col = 0; col < cols; col++) {
    if (!pivotCols.includes(col)) {
      freeVars.push(col);
    }
  }

  if (freeVars.length === 0) {
    return null; // No solution (system is overdetermined)
  }

  // Use the last free variable as the parameter (set to 1)
  const freeVar = freeVars[freeVars.length - 1];
  const solution = new Array(cols).fill(0);
  solution[freeVar] = 1;

  // Back substitute to find other values
  for (let i = pivotCols.length - 1; i >= 0; i--) {
    const pivotCol = pivotCols[i];
    let sum = 0;
    for (let j = pivotCol + 1; j < cols; j++) {
      sum += m[i][j] * solution[j];
    }
    solution[pivotCol] = -sum;
  }

  return solution;
}

/**
 * Convert floating point solution to minimal integer coefficients
 */
function toIntegerCoefficients(solution) {
  // Filter out very small values (numerical errors)
  const cleaned = solution.map((v) => (Math.abs(v) < 1e-10 ? 0 : v));

  // Find denominators (convert to fractions)
  const denominators = [];
  for (const val of cleaned) {
    if (val !== 0) {
      // Find denominator by checking common fractions
      for (let d = 1; d <= 1000; d++) {
        if (Math.abs(val * d - Math.round(val * d)) < 1e-9) {
          denominators.push(d);
          break;
        }
      }
    }
  }

  if (denominators.length === 0) return null;

  // Multiply by LCM of denominators
  const multiplier = lcmArray(denominators);
  let intSolution = cleaned.map((v) => Math.round(v * multiplier));

  // Make all positive (if all negative, flip signs)
  const allNegative = intSolution.every((v) => v <= 0);
  const allPositive = intSolution.every((v) => v >= 0);

  if (allNegative) {
    intSolution = intSolution.map((v) => -v);
  } else if (!allPositive) {
    // Mixed signs - try to make positive
    intSolution = intSolution.map((v) => Math.abs(v));
  }

  // Reduce by GCD
  const nonZero = intSolution.filter((v) => v !== 0);
  if (nonZero.length === 0) return null;

  const g = gcdArray(nonZero);
  intSolution = intSolution.map((v) => v / g);

  // Validate: all should be positive integers
  if (intSolution.some((v) => v <= 0)) {
    return null;
  }

  return intSolution;
}

/**
 * Main equation balancing function using Gaussian Elimination
 */
function balanceEquationGaussian(reactants, products) {
  // Parse all compounds
  const allCompounds = [...reactants, ...products];
  const numReactants = reactants.length;
  const numProducts = products.length;
  const numCompounds = allCompounds.length;

  // Parse each compound to get atom counts
  const compoundAtoms = allCompounds.map((c) => parseChemicalFormula(c));

  // Get all unique elements
  const elements = new Set();
  compoundAtoms.forEach((atoms) => {
    Object.keys(atoms).forEach((el) => elements.add(el));
  });
  const elementList = Array.from(elements);

  // Build the matrix
  // Rows = elements, Columns = compounds
  // Reactants get positive coefficients, products get negative
  const matrix = [];
  for (const element of elementList) {
    const row = [];
    for (let i = 0; i < numCompounds; i++) {
      const count = compoundAtoms[i][element] || 0;
      // Products have negative sign (moving to right side of equation)
      row.push(i < numReactants ? count : -count);
    }
    matrix.push(row);
  }

  // Solve using Gaussian elimination
  const solution = gaussianElimination(matrix, numCompounds);

  if (!solution) return null;

  // Convert to integer coefficients
  const coefficients = toIntegerCoefficients(solution);

  if (!coefficients) return null;

  // Verify the solution
  for (const element of elementList) {
    let leftSum = 0,
      rightSum = 0;
    for (let i = 0; i < numReactants; i++) {
      leftSum += (compoundAtoms[i][element] || 0) * coefficients[i];
    }
    for (let i = numReactants; i < numCompounds; i++) {
      rightSum += (compoundAtoms[i][element] || 0) * coefficients[i];
    }
    if (Math.abs(leftSum - rightSum) > 0.001) {
      return null; // Verification failed
    }
  }

  return {
    reactants: coefficients.slice(0, numReactants),
    products: coefficients.slice(numReactants),
  };
}

export function balanceEquationModal(equation) {
  const parts = equation.split("→").map((s) => s.trim());
  if (parts.length !== 2) {
    throw new Error("Equation must contain → (arrow)");
  }

  // Normalize input: split by space or + and rejoin with +
  const normalizeCompounds = (str) => {
    return str
      .split(/[\s+]+/)
      .filter((s) => s.trim())
      .map((s) => s.trim());
  };

  const reactants = normalizeCompounds(parts[0])
    .map((s) => s.replace(/^\d+/, "").trim())
    .filter((s) => s);
  const products = normalizeCompounds(parts[1])
    .map((s) => s.replace(/^\d+/, "").trim())
    .filter((s) => s);

  if (reactants.length === 0 || products.length === 0) {
    throw new Error("Missing reactants or products");
  }

  // ===== Pre-flight Check: Element Consistency Validation =====
  const getElements = (compounds) => {
    const elements = new Set();
    compounds.forEach((compound) => {
      const atoms = parseChemicalFormula(compound);
      Object.keys(atoms).forEach((el) => elements.add(el));
    });
    return elements;
  };

  const reactantElements = getElements(reactants);
  const productElements = getElements(products);

  // Check for elements in products that don't exist in reactants
  const extraInProducts = [...productElements].filter(
    (el) => !reactantElements.has(el),
  );
  if (extraInProducts.length > 0) {
    const invalidEl = extraInProducts[0];
    throw new Error(
      `Element '${invalidEl}' in products is not found in reactants`,
    );
  }

  // Check for elements in reactants that don't exist in products
  const extraInReactants = [...reactantElements].filter(
    (el) => !productElements.has(el),
  );
  if (extraInReactants.length > 0) {
    const invalidEl = extraInReactants[0];
    throw new Error(
      `Element '${invalidEl}' in reactants is not found in products`,
    );
  }

  // Build explanation steps
  const steps = [];
  steps.push("<h4>Step-by-step balancing:</h4>");
  steps.push("<ol>");
  steps.push(
    "<li><strong>Identify elements:</strong> List all elements on both sides</li>",
  );
  steps.push(
    "<li><strong>Count atoms:</strong> Count atoms of each element</li>",
  );
  steps.push(
    "<li><strong>Build matrix:</strong> Create element × compound matrix</li>",
  );
  steps.push(
    "<li><strong>Gaussian elimination:</strong> Solve the linear system</li>",
  );
  steps.push(
    "<li><strong>Normalize:</strong> Convert to smallest integer coefficients</li>",
  );
  steps.push("</ol>");
  steps.push(
    '<div class="warning-box"><strong>Important:</strong> Never change subscripts, only coefficients!</div>',
  );

  // Try to balance using Gaussian elimination
  const result = balanceEquationGaussian(reactants, products);

  let balancedEq = equation;
  let check = "";

  if (result) {
    // Build balanced equation string
    const balancedReactants = reactants
      .map((r, i) => {
        const coef = result.reactants[i];
        return coef === 1 ? r : coef + r;
      })
      .join(" + ");

    const balancedProducts = products
      .map((p, i) => {
        const coef = result.products[i];
        return coef === 1 ? p : coef + p;
      })
      .join(" + ");

    balancedEq = balancedReactants + " → " + balancedProducts;
    check = generateAtomCheckModal(balancedEq);
  } else {
    check =
      '<p class="note-text">Unable to balance this equation. Please check the formulas.</p>';
  }

  // Create a plain text version for updating inputs (without Unicode subscripts)
  const balancedPlain = balancedEq
    .replace(/₂/g, "2")
    .replace(/₃/g, "3")
    .replace(/₄/g, "4")
    .replace(/₅/g, "5")
    .replace(/₆/g, "6");

  return {
    equation: balancedEq,
    balanced: balancedPlain,
    explanation: steps.join(""),
    check: check,
  };
}

export function generateAtomCheckModal(equation) {
  // Normalize subscripts for counting
  const normalized = equation
    .replace(/₂/g, "2")
    .replace(/₃/g, "3")
    .replace(/₄/g, "4")
    .replace(/₅/g, "5")
    .replace(/₆/g, "6");

  const parts = normalized.split("→");
  const left = parts[0].trim();
  const right = parts[1].trim();

  const leftAtoms = countAtomsModal(left);
  const rightAtoms = countAtomsModal(right);

  let html = "<h4>Atom Count Check:</h4>";
  html += '<table class="check-table">';
  html +=
    "<tr><th>Element</th><th>Left Side</th><th>Right Side</th><th>Match</th></tr>";

  const allElements = new Set([
    ...Object.keys(leftAtoms),
    ...Object.keys(rightAtoms),
  ]);
  let allMatch = true;

  allElements.forEach((element) => {
    const leftCount = leftAtoms[element] || 0;
    const rightCount = rightAtoms[element] || 0;
    const match = leftCount === rightCount;
    if (!match) allMatch = false;
    const matchIcon = match ? "✓" : "✗";
    const matchClass = match ? "match-yes" : "match-no";
    html += `<tr><td>${element}</td><td>${leftCount}</td><td>${rightCount}</td><td class="${matchClass}">${matchIcon}</td></tr>`;
  });

  html += "</table>";
  html += `<div class="balance-status ${allMatch ? "balanced" : "unbalanced"}">
        <strong>Conservation of matter:</strong> ${allMatch ? "✓ Balanced!" : "✗ Not balanced"}
    </div>`;

  return html;
}

export function countAtomsModal(side) {
  const atoms = {};
  const compounds = side.split("+").map((s) => s.trim());

  compounds.forEach((compound) => {
    const match = compound.match(/^(\d*)(.+)$/);
    const coefficient = match[1] ? parseInt(match[1]) : 1;
    const formula = match[2];
    const elements = parseFormulaStrict(formula);

    Object.keys(elements).forEach((element) => {
      atoms[element] = (atoms[element] || 0) + elements[element] * coefficient;
    });
  });

  return atoms;
}

// ===== Molar Mass Calculator (Modal version) =====
export function calculateMolarMassModal(formula, exact) {
  const elements = parseFormulaStrict(formula);
  let total = 0;
  const breakdown = [];

  Object.keys(elements).forEach((element) => {
    const count = elements[element];
    const atomicMass = atomicMasses[element];

    if (!atomicMass) {
      throw new Error(`Unknown element: ${element}`);
    }

    const subtotal = atomicMass * count;
    total += subtotal;

    breakdown.push({
      element,
      atomicMass: exact ? atomicMass.toFixed(3) : Math.round(atomicMass),
      count,
      subtotal: exact ? subtotal.toFixed(3) : Math.round(subtotal),
    });
  });

  return {
    total: exact ? total.toFixed(3) : Math.round(total),
    breakdown,
    exact,
  };
}

// ===== Empirical Tool: Preset Compounds =====
export const EMPIRICAL_PRESETS = [
  // 2个元素
  {
    name: "Methane (甲烷)",
    elements: [
      { s: "C", v: 75.0 },
      { s: "H", v: 25.0 },
    ],
    molMass: 16,
  },
  {
    name: "Water (水)",
    elements: [
      { s: "H", v: 11.2 },
      { s: "O", v: 88.8 },
    ],
    molMass: 18,
  },
  {
    name: "Ammonia (氨)",
    elements: [
      { s: "N", v: 82.4 },
      { s: "H", v: 17.6 },
    ],
    molMass: 17,
  },
  {
    name: "Benzene (苯)",
    elements: [
      { s: "C", v: 92.3 },
      { s: "H", v: 7.7 },
    ],
    molMass: 78,
  },
  {
    name: "Carbon Dioxide (二氧化碳)",
    elements: [
      { s: "C", v: 27.3 },
      { s: "O", v: 72.7 },
    ],
    molMass: 44,
  },
  // 3个元素
  {
    name: "Glucose (葡萄糖)",
    elements: [
      { s: "C", v: 40.0 },
      { s: "H", v: 6.7 },
      { s: "O", v: 53.3 },
    ],
    molMass: 180,
  },
  {
    name: "Aspirin (阿司匹林)",
    elements: [
      { s: "C", v: 60.0 },
      { s: "H", v: 4.5 },
      { s: "O", v: 35.5 },
    ],
    molMass: 180,
  },
  {
    name: "Ethanol (乙醇)",
    elements: [
      { s: "C", v: 52.2 },
      { s: "H", v: 13.0 },
      { s: "O", v: 34.8 },
    ],
    molMass: 46,
  },
  {
    name: "Acetic Acid (乙酸)",
    elements: [
      { s: "C", v: 40.0 },
      { s: "H", v: 6.7 },
      { s: "O", v: 53.3 },
    ],
    molMass: 60,
  },
  {
    name: "Vitamin C (维生素C)",
    elements: [
      { s: "C", v: 40.9 },
      { s: "H", v: 4.6 },
      { s: "O", v: 54.5 },
    ],
    molMass: 176,
  },
  // 4个元素
  {
    name: "Caffeine (咖啡因)",
    elements: [
      { s: "C", v: 49.5 },
      { s: "H", v: 5.2 },
      { s: "N", v: 28.9 },
      { s: "O", v: 16.5 },
    ],
    molMass: 194,
  },
  {
    name: "Urea (尿素)",
    elements: [
      { s: "C", v: 20.0 },
      { s: "H", v: 6.7 },
      { s: "N", v: 46.7 },
      { s: "O", v: 26.7 },
    ],
    molMass: 60,
  },
  {
    name: "Glycine (甘氨酸)",
    elements: [
      { s: "C", v: 32.0 },
      { s: "H", v: 6.7 },
      { s: "N", v: 18.7 },
      { s: "O", v: 42.6 },
    ],
    molMass: 75,
  },
  {
    name: "Alanine (丙氨酸)",
    elements: [
      { s: "C", v: 40.4 },
      { s: "H", v: 7.9 },
      { s: "N", v: 15.7 },
      { s: "O", v: 36.0 },
    ],
    molMass: 89,
  },
  // 5个元素
  {
    name: "Cysteine (半胱氨酸)",
    elements: [
      { s: "C", v: 29.8 },
      { s: "H", v: 5.8 },
      { s: "N", v: 11.6 },
      { s: "O", v: 26.4 },
      { s: "S", v: 26.4 },
    ],
    molMass: 121,
  },
  {
    name: "Methionine (蛋氨酸)",
    elements: [
      { s: "C", v: 40.3 },
      { s: "H", v: 7.4 },
      { s: "N", v: 9.4 },
      { s: "O", v: 21.5 },
      { s: "S", v: 21.5 },
    ],
    molMass: 149,
  },
  {
    name: "Thiamine (维生素B1)",
    elements: [
      { s: "C", v: 42.7 },
      { s: "H", v: 5.4 },
      { s: "N", v: 16.6 },
      { s: "O", v: 4.7 },
      { s: "S", v: 9.5 },
    ],
    molMass: 337,
  },
];

// ===== Helper: Convert formula with subscripts to HTML =====
export function formatFormulaHTML(formula) {
  if (!formula) return "";
  // Replace subscript unicode with <sub> tags
  return formula.replace(/[₀₁₂₃₄₅₆₇₈₉]+/g, (match) => {
    const nums = match
      .split("")
      .map((c) => {
        const subscripts = "₀₁₂₃₄₅₆₇₈₉";
        return subscripts.indexOf(c);
      })
      .join("");
    return `<sub>${nums}</sub>`;
  });
}

// ===== Empirical Formula Calculator =====

// Metal symbols list (for formula ordering: metals before nonmetals)
const METALS = new Set([
  'Li','Be','Na','Mg','Al','K','Ca','Sc','Ti','V','Cr','Mn','Fe','Co','Ni','Cu','Zn',
  'Ga','Rb','Sr','Y','Zr','Nb','Mo','Tc','Ru','Rh','Pd','Ag','Cd','In','Sn',
  'Cs','Ba','La','Ce','Pr','Nd','Pm','Sm','Eu','Gd','Tb','Dy','Ho','Er','Tm','Yb','Lu',
  'Hf','Ta','W','Re','Os','Ir','Pt','Au','Hg','Tl','Pb','Bi','Po',
  'Fr','Ra','Ac','Th','Pa','U','Np','Pu','Am','Cm','Bk','Cf','Es','Fm','Md','No','Lr',
  'Rf','Db','Sg','Bh','Hs','Mt','Ds','Rg','Cn','Nh','Fl','Mc','Lv','Ts','Og'
]);

/**
 * Normalise an element symbol: first letter upper, rest lower.
 * Returns null if the symbol is not in the atomicMasses table.
 */
export function normalizeSymbol(raw) {
  if (!raw) return null;
  const s = raw.trim();
  if (s.length === 0 || s.length > 2) return null;
  const norm = s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  return atomicMasses[norm] !== undefined ? norm : null;
}

/**
 * Validate all inputs, returning an object { ok, errors[] }
 * Each error: { row, field, message }
 */
export function validateEmpiricalInputs(elements, molecularMass) {
  const errors = [];

  if (elements.length < 2) {
    errors.push({ row: -1, field: 'global', message: 'Enter at least 2 elements.' });
  }

  const seenSymbols = new Set();
  let percentSum = 0;

  elements.forEach((el, i) => {
    // Symbol check
    if (!el.symbol || el.symbol.trim() === '') {
      errors.push({ row: i, field: 'symbol', message: 'Enter an element symbol' });
    } else {
      const norm = normalizeSymbol(el.symbol);
      if (!norm) {
        errors.push({ row: i, field: 'symbol', message: `"${el.symbol}" is not a valid element` });
      } else if (seenSymbols.has(norm)) {
        errors.push({ row: i, field: 'symbol', message: `Duplicate element: ${norm}` });
      } else {
        seenSymbols.add(norm);
      }
    }

    // Percent check
    if (el.percent === undefined || el.percent === null || el.percent === '' || isNaN(Number(el.percent))) {
      errors.push({ row: i, field: 'value', message: 'Enter a number' });
    } else {
      const v = Number(el.percent);
      if (v <= 0 || v > 100) {
        errors.push({ row: i, field: 'value', message: 'Must be 0–100 %' });
      } else {
        percentSum += v;
      }
    }
  });

  // Percent sum check (strict: must be within ±1%)
  if (errors.filter(e => e.field === 'value').length === 0 && elements.length >= 2) {
    if (Math.abs(percentSum - 100) > 1.0) {
      errors.push({
        row: -1, field: 'sum',
        message: `Percentages sum to ${percentSum.toFixed(1)}%, expected ~100%`
      });
    }
  }

  // Molecular mass check
  if (molecularMass !== null && molecularMass !== undefined && molecularMass !== '') {
    const mm = Number(molecularMass);
    if (isNaN(mm) || mm <= 0) {
      errors.push({ row: -1, field: 'molMass', message: 'Molar mass must be a positive number' });
    }
  }

  return { ok: errors.length === 0, errors };
}

/**
 * GCD of two positive integers
 */
function gcdTwo(a, b) {
  a = Math.round(Math.abs(a));
  b = Math.round(Math.abs(b));
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

/**
 * GCD of an integer array
 */
function gcdArr(arr) {
  return arr.reduce((g, v) => gcdTwo(g, v));
}

/**
 * Simplify mole ratios to smallest whole-number subscripts.
 * Algorithm:
 *  1. Divide all by min → raw ratios
 *  2. Try multipliers 1‒8; accept if all values are within ±0.08 of an integer.
 *  3. Reduce result by GCD.
 *  4. Fail if no multiplier works.
 */
function simplifyRatiosModal(ratios) {
  const TOL = 0.08;
  const MAX_MULT = 8;

  for (let mult = 1; mult <= MAX_MULT; mult++) {
    const scaled = ratios.map(r => r.ratio * mult);
    const allInt = scaled.every(v => Math.abs(v - Math.round(v)) < TOL);
    if (allInt) {
      let counts = scaled.map(v => Math.round(v) || 1);
      // GCD reduce
      const g = gcdArr(counts);
      counts = counts.map(c => c / g);
      return ratios.map((r, i) => ({ symbol: r.symbol, count: counts[i] }));
    }
  }

  // Fallback: round to nearest, warn
  return null;
}

/**
 * Order elements for formula display:
 *  - If mix of metals + nonmetals → metals first (by periodic table order), then nonmetals.
 *  - Otherwise, Hill system: C first, H second, rest alphabetical.
 */
function orderElements(elements) {
  const hasMetal = elements.some(e => METALS.has(e.symbol));
  const hasNonMetal = elements.some(e => !METALS.has(e.symbol));

  if (hasMetal && hasNonMetal) {
    // Metals first, then nonmetals (alphabetical within each group)
    const metals = elements.filter(e => METALS.has(e.symbol)).sort((a, b) => a.symbol.localeCompare(b.symbol));
    const nonmetals = elements.filter(e => !METALS.has(e.symbol)).sort((a, b) => a.symbol.localeCompare(b.symbol));
    return [...metals, ...nonmetals];
  }

  // Hill system: C first, H second, rest alphabetical
  const sorted = [...elements].sort((a, b) => {
    if (a.symbol === 'C') return -1;
    if (b.symbol === 'C') return 1;
    if (a.symbol === 'H') return -1;
    if (b.symbol === 'H') return 1;
    return a.symbol.localeCompare(b.symbol);
  });
  return sorted;
}

export function calculateEmpiricalModal(data) {
  const { elements, molecularMass } = data;

  if (!elements || elements.length < 2) {
    throw new Error("Please enter at least 2 elements with valid data.");
  }

  // — Normalize percentages to exactly 100 —
  const rawSum = elements.reduce((s, e) => s + e.percent, 0);
  const normalised = (Math.abs(rawSum - 100) > 0.01);
  const scaleFactor = 100 / rawSum;
  const elems = elements.map(e => ({
    symbol: e.symbol,
    percent: e.percent * scaleFactor,
  }));

  // — Step 1: Convert to moles (assume 100 g sample) —
  const moles = elems.map(elem => {
    const aw = atomicMasses[elem.symbol];
    const molesVal = elem.percent / aw;
    return {
      symbol: elem.symbol,
      grams: elem.percent,
      atomicWeight: aw,
      moles: molesVal,
      originalPercent: elements.find(e => e.symbol === elem.symbol).percent,
    };
  });

  // — Step 2: Divide by smallest —
  const minMoles = Math.min(...moles.map(m => m.moles));
  const ratios = moles.map(m => ({
    symbol: m.symbol,
    moles: m.moles,
    ratio: m.moles / minMoles,
    grams: m.grams,
    atomicWeight: m.atomicWeight,
    originalPercent: m.originalPercent,
  }));

  // — Step 3: Simplify to integers —
  const simplified = simplifyRatiosModal(ratios);
  if (!simplified) {
    throw new Error("Cannot determine empirical formula — ratios are too far from whole numbers. Check your data.");
  }

  // — Order for display —
  const ordered = orderElements(simplified);

  // Build formula string
  const empiricalFormula = ordered
    .map(r => r.symbol + (r.count > 1 ? subscript(r.count) : ''))
    .join('');

  // Empirical mass
  let empiricalMass = 0;
  ordered.forEach(elem => {
    empiricalMass += atomicMasses[elem.symbol] * elem.count;
  });

  // ===== Build detailed explanation =====
  let explanation = "<h4>Calculation Steps</h4><ol>";
  explanation += "<li><strong>Assume 100 g sample</strong> — each % becomes grams directly.</li>";
  if (normalised) {
    explanation += `<li><strong>Note:</strong> Percentages summed to ${rawSum.toFixed(1)}%; values normalised to 100%.</li>`;
  }
  explanation += "<li><strong>Convert grams → moles</strong> (g ÷ atomic mass):</li><ul>";
  moles.forEach(m => {
    explanation += `<li>${m.symbol}: ${m.grams.toFixed(2)} g ÷ ${m.atomicWeight} g/mol = <strong>${m.moles.toFixed(4)} mol</strong></li>`;
  });
  explanation += "</ul>";
  explanation += `<li><strong>Divide all by smallest</strong> (${minMoles.toFixed(4)} mol):</li><ul>`;
  ratios.forEach(r => {
    explanation += `<li>${r.symbol}: ${r.moles.toFixed(4)} ÷ ${minMoles.toFixed(4)} = <strong>${r.ratio.toFixed(3)}</strong></li>`;
  });
  explanation += "</ul>";
  explanation += "<li><strong>Round to whole-number ratio:</strong></li><ul>";
  ordered.forEach(r => {
    explanation += `<li>${r.symbol} → <strong>${r.count}</strong></li>`;
  });
  explanation += "</ul>";
  explanation += `<li><strong>Empirical formula:</strong> <strong>${empiricalFormula}</strong> (${empiricalMass.toFixed(2)} g/mol)</li>`;
  explanation += "</ol>";

  // ===== Molecular formula (only if molar mass provided) =====
  let molecularFormula = null;
  let multiplier = 1;
  let molMassError = null;

  if (molecularMass !== null && molecularMass !== undefined && Number(molecularMass) > 0) {
    const mm = Number(molecularMass);
    const rawN = mm / empiricalMass;
    const n = Math.round(rawN);

    if (n < 1 || Math.abs(rawN - n) > 0.1) {
      molMassError = `Molar mass ${mm} g/mol does not match empirical formula mass ${empiricalMass.toFixed(2)} g/mol (ratio = ${rawN.toFixed(2)}, not close to an integer).`;
    } else {
      multiplier = n;
      molecularFormula = ordered
        .map(r => r.symbol + (r.count * n > 1 ? subscript(r.count * n) : ''))
        .join('');

      explanation += "<hr><h4>Molecular Formula</h4>";
      explanation += `<p>Given molar mass: <strong>${mm} g/mol</strong></p>`;
      explanation += `<p>n = ${mm} ÷ ${empiricalMass.toFixed(2)} = <strong>${rawN.toFixed(2)} ≈ ${n}</strong></p>`;
      explanation += `<p>Molecular formula = empirical × ${n} = <strong>${molecularFormula}</strong></p>`;
    }
  }

  return {
    empiricalFormula,
    molecularFormula,
    explanation,
    empiricalMass,
    molecularMass: molecularMass ? Number(molecularMass) : null,
    empirical: ordered,
    multiplier,
    molMassError,
    normalised,
  };
}

function subscript(num) {
  const subscripts = {
    0: "₀",
    1: "₁",
    2: "₂",
    3: "₃",
    4: "₄",
    5: "₅",
    6: "₆",
    7: "₇",
    8: "₈",
    9: "₉",
  };
  return String(num)
    .split("")
    .map((d) => subscripts[d] || d)
    .join("");
}

