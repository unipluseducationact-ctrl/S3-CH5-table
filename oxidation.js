// oxidationStates_1_to_30.js
// Education-focused split: common (high-frequency in textbooks & typical compounds)
// vs possible (known but less common / special conditions)

export const oxidationStates_1_to_30 = {
  1:  { common: ["+1", "-1"], possible: [] },                 // H
  2:  { common: ["0"], possible: [] },                        // He
  3:  { common: ["+1"], possible: [] },                       // Li
  4:  { common: ["+2"], possible: [] },                       // Be
  5:  { common: ["+3"], possible: [] },                       // B
  6:  { common: ["-4", "+4"], possible: ["+2"] },             // C
  7:  { common: ["-3", "+3", "+5"], possible: ["+1", "+2", "+4"] }, // N
  8:  { common: ["-2"], possible: ["-1", "0", "+1", "+2"] },  // O
  9:  { common: ["-1"], possible: [] },                       // F
  10: { common: ["0"], possible: [] },                        // Ne
  11: { common: ["+1"], possible: [] },                       // Na
  12: { common: ["+2"], possible: [] },                       // Mg
  13: { common: ["+3"], possible: ["+1"] },                   // Al (rare +1)
  14: { common: ["-4", "+4"], possible: ["+2"] },             // Si
  15: { common: ["-3", "+3", "+5"], possible: [] },           // P
  16: { common: ["-2", "+4", "+6"], possible: ["+2"] },       // S
  17: { common: ["-1", "+1", "+5", "+7"], possible: ["+3"] }, // Cl
  18: { common: ["0"], possible: [] },                        // Ar
  19: { common: ["+1"], possible: [] },                       // K
  20: { common: ["+2"], possible: [] },                       // Ca
  21: { common: ["+3"], possible: ["+2", "+1"] },             // Sc (lower states rare)
  22: { common: ["+4"], possible: ["+3", "+2"] },             // Ti
  23: { common: ["+5", "+4", "+3"], possible: ["+2"] },       // V
  24: { common: ["+3", "+6"], possible: ["+2", "+4", "+5"] }, // Cr
  25: { common: ["+2", "+4", "+7"], possible: ["+1", "+3", "+5", "+6"] }, // Mn
  26: { common: ["+2", "+3"], possible: ["+6"] },             // Fe
  27: { common: ["+2", "+3"], possible: ["+1", "+4"] },       // Co
  28: { common: ["+2"], possible: ["+1", "+3"] },             // Ni
  29: { common: ["+1", "+2"], possible: ["+3"] },             // Cu
  30: { common: ["+2"], possible: ["+1"] },                   // Zn (Zn+ rare)
};// oxidationStates_30_to_80.js
// Education-focused split: common (high-frequency in textbooks & typical compounds)
// vs possible (known but less common / special conditions)

export const oxidationStates_31_to_80 = {                      // Zn
  31: { common: ["+3"], possible: ["+1", "+2"] },                 // Ga
  32: { common: ["+4", "+2"], possible: ["-4"] },                 // Ge
  33: { common: ["-3", "+3", "+5"], possible: ["+1"] },           // As
  34: { common: ["-2", "+4", "+6"], possible: ["+2"] },           // Se
  35: { common: ["-1", "+1", "+5", "+7"], possible: ["+3"] },     // Br
  36: { common: ["0"], possible: ["+2"] },                        // Kr
  37: { common: ["+1"], possible: [] },                           // Rb
  38: { common: ["+2"], possible: [] },                           // Sr
  39: { common: ["+3"], possible: ["+2", "+1"] },                 // Y
  40: { common: ["+4"], possible: ["+3", "+2"] },                 // Zr
  41: { common: ["+5"], possible: ["+4", "+3", "+2"] },           // Nb
  42: { common: ["+6"], possible: ["+4", "+5", "+3", "+2"] },     // Mo
  43: { common: ["+7"], possible: ["+4", "+6", "+5"] },           // Tc
  44: { common: ["+3", "+4"], possible: ["+2", "+6", "+7", "+8"] }, // Ru
  45: { common: ["+3"], possible: ["+1", "+2", "+4", "+5"] },     // Rh
  46: { common: ["+2"], possible: ["0", "+1", "+3", "+4"] },      // Pd
  47: { common: ["+1"], possible: ["+2", "+3"] },                 // Ag
  48: { common: ["+2"], possible: ["+1"] },                       // Cd
  49: { common: ["+3"], possible: ["+1", "+2"] },                 // In
  50: { common: ["+2", "+4"], possible: ["-4"] },                 // Sn
  51: { common: ["-3", "+3", "+5"], possible: ["+1"] },           // Sb
  52: { common: ["-2", "+4", "+6"], possible: ["+2"] },           // Te
  53: { common: ["-1", "+1", "+5", "+7"], possible: ["+3"] },     // I
  54: { common: ["0"], possible: ["+2", "+4", "+6", "+8"] },      // Xe
  55: { common: ["+1"], possible: [] },                           // Cs
  56: { common: ["+2"], possible: [] },                           // Ba
  57: { common: ["+3"], possible: ["+2"] },                       // La
  58: { common: ["+3", "+4"], possible: ["+2"] },                 // Ce
  59: { common: ["+3"], possible: ["+4", "+2"] },                 // Pr
  60: { common: ["+3"], possible: ["+2"] },                       // Nd
  61: { common: ["+3"], possible: ["+2"] },                       // Pm
  62: { common: ["+3"], possible: ["+2"] },                       // Sm
  63: { common: ["+2", "+3"], possible: [] },                     // Eu
  64: { common: ["+3"], possible: ["+2"] },                       // Gd
  65: { common: ["+3"], possible: ["+4", "+2"] },                 // Tb
  66: { common: ["+3"], possible: ["+2"] },                       // Dy
  67: { common: ["+3"], possible: ["+2"] },                       // Ho
  68: { common: ["+3"], possible: ["+2"] },                       // Er
  69: { common: ["+3"], possible: ["+2"] },                       // Tm
  70: { common: ["+2", "+3"], possible: [] },                     // Yb
  71: { common: ["+3"], possible: ["+2"] },                       // Lu
  72: { common: ["+4"], possible: ["+3", "+2"] },                 // Hf
  73: { common: ["+5"], possible: ["+4", "+3"] },                 // Ta
  74: { common: ["+6"], possible: ["+5", "+4", "+3", "+2"] },     // W
  75: { common: ["+7"], possible: ["+6", "+5", "+4", "+3", "+2"] }, // Re
  76: { common: ["+4", "+8"], possible: ["+2", "+3", "+6", "+7"] }, // Os
  77: { common: ["+3", "+4"], possible: ["+1", "+2", "+5", "+6"] }, // Ir
  78: { common: ["+2", "+4"], possible: ["0", "+1", "+3", "+6"] },  // Pt
  79: { common: ["+1", "+3"], possible: ["+2", "+5"] },           // Au
  80: { common: ["+1", "+2"], possible: [] },                     // Hg
};
// oxidationStates_81_to_118.js
// Education-focused split: common (textbook/high-frequency) vs possible (known/predicted but less common)

export const oxidationStates_81_to_118 = {
  81: { common: ["+1", "+3"], possible: [] },                            // Tl
  82: { common: ["+2", "+4"], possible: [] },                            // Pb
  83: { common: ["+3", "+5"], possible: [] },                            // Bi
  84: { common: ["-2", "+4"], possible: ["+2", "+6"] },                  // Po
  85: { common: ["-1"], possible: ["+1", "+3", "+5", "+7"] },            // At
  86: { common: ["0"], possible: ["+2"] },                               // Rn
  87: { common: ["+1"], possible: [] },                                  // Fr
  88: { common: ["+2"], possible: [] },                                  // Ra
  89: { common: ["+3"], possible: [] },                                  // Ac
  90: { common: ["+4"], possible: ["+3"] },                              // Th
  91: { common: ["+5"], possible: ["+4", "+3"] },                        // Pa
  92: { common: ["+6", "+4"], possible: ["+5", "+3"] },                  // U
  93: { common: ["+5"], possible: ["+3", "+4", "+6", "+7"] },            // Np
  94: { common: ["+4"], possible: ["+3", "+5", "+6", "+7"] },            // Pu
  95: { common: ["+3"], possible: ["+2", "+4", "+5", "+6"] },            // Am
  96: { common: ["+3"], possible: ["+2", "+4"] },                        // Cm
  97: { common: ["+3"], possible: ["+2", "+4"] },                        // Bk
  98: { common: ["+3"], possible: ["+2", "+4"] },                        // Cf
  99: { common: ["+3"], possible: ["+2"] },                              // Es
  100:{ common: ["+3"], possible: ["+2"] },                              // Fm
  101:{ common: ["+3"], possible: ["+2"] },                              // Md
  102:{ common: ["+2"], possible: ["+3"] },                              // No
  103:{ common: ["+3"], possible: [] },                                  // Lr

  // Superheavy (mostly predicted / limited chemistry)
  104:{ common: ["+4"], possible: ["+3", "+2"] },                        // Rf
  105:{ common: ["+5"], possible: ["+4", "+3"] },                        // Db
  106:{ common: ["+6"], possible: ["+5", "+4"] },                        // Sg
  107:{ common: ["+7"], possible: ["+5", "+4", "+3"] },                  // Bh
  108:{ common: ["+8"], possible: ["+6", "+4", "+2"] },                  // Hs
  109:{ common: ["+3"], possible: ["+2", "+4", "+6"] },                  // Mt
  110:{ common: ["+2"], possible: ["+4"] },                              // Ds
  111:{ common: ["+1"], possible: ["+3"] },                              // Rg
  112:{ common: ["+2"], possible: ["+1", "+4"] },                        // Cn
  113:{ common: ["+1"], possible: ["+3"] },                              // Nh
  114:{ common: ["+2"], possible: ["+4"] },                              // Fl
  115:{ common: ["+1"], possible: ["+3", "+5"] },                        // Mc
  116:{ common: ["+2"], possible: ["+4", "+6"] },                        // Lv
  117:{ common: ["-1"], possible: ["+1", "+3", "+5", "+7"] },            // Ts
  118:{ common: ["0"], possible: ["+2"] },                               // Og
};