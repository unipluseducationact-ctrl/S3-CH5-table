const fs = require('fs');

// Path to inputs
const jsonPath = '/Users/zhilips/Downloads/PubChemElements_all.json';
const skeletonPath = './js/data/elementsSkeleton.js';
const outputPath = './js/data/elementsData_v2.js';

async function main() {
    // 1. Read PubChem JSON
    const rawJson = fs.readFileSync(jsonPath, 'utf-8');
    const pubchemData = JSON.parse(rawJson);

    const columns = pubchemData.Table.Columns.Column;
    const rows = pubchemData.Table.Row;

    // Helper to extract value from a row
    const getValue = (row, colName) => {
        const idx = columns.indexOf(colName);
        return idx !== -1 ? row.Cell[idx] : "";
    };

    // 2. Read Skeleton JS (parse as module)
    // We'll strip the 'export const elementsSkeleton = ' and the trailing ';'
    let rawSkeleton = fs.readFileSync(skeletonPath, 'utf-8');
    rawSkeleton = rawSkeleton.replace('export const elementsSkeleton = ', '').replace(/;\s*$/, '');
    const skeleton = JSON.parse(rawSkeleton);

    // 3. Process each row
    rows.forEach(row => {
        const atomicNumberStr = getValue(row, 'AtomicNumber');
        const atomicNumber = parseInt(atomicNumberStr, 10);
        
        if (skeleton[atomicNumber]) {
            const el = skeleton[atomicNumber];

            // 1. phaseAtSTP -> StandardState
            el.level1_basic.phaseAtSTP = getValue(row, 'StandardState') || "";

            // 2. mass.standard -> AtomicMass (不允许任何四舍五入)
            // Modify mass structure
            const atomicMassStr = getValue(row, 'AtomicMass');
            el.level2_atomic.mass = {
                standard: atomicMassStr || null
            };

            // 3. electronic.configuration -> ElectronConfiguration
            el.level3_properties.electronic.configuration = getValue(row, 'ElectronConfiguration') || "";
            
            // 3. electronic.oxidationStates -> OxidationStates
            const oxStatesStr = getValue(row, 'OxidationStates');
            if (oxStatesStr) {
                el.level3_properties.electronic.oxidationStates = oxStatesStr.split(',').map(s => s.trim()).filter(s => s);
            } else {
                el.level3_properties.electronic.oxidationStates = [];
            }

            // 4. physical
            const electronegativity = getValue(row, 'Electronegativity');
            el.level3_properties.physical.electronegativity = electronegativity ? Number(electronegativity) : null;

            const ie_eV = getValue(row, 'IonizationEnergy');
            if (ie_eV) {
                const ie_kJ = Math.round(Number(ie_eV) * 96.485);
                el.level3_properties.physical.firstIonization = `${ie_kJ} kJ/mol`;
            } else {
                el.level3_properties.physical.firstIonization = "";
            }

            const density = getValue(row, 'Density');
            if (density) {
                const phase = el.level1_basic.phaseAtSTP.toLowerCase();
                const unit = phase === 'gas' ? 'g/L' : 'g/cm³';
                el.level3_properties.physical.density = `${density} ${unit}`;
            } else {
                el.level3_properties.physical.density = "";
            }

            const meltK = getValue(row, 'MeltingPoint');
            if (meltK) {
                const meltC = (Number(meltK) - 273.15).toFixed(1);
                el.level3_properties.physical.meltingPoint = `${meltC} °C`;
            } else {
                el.level3_properties.physical.meltingPoint = "";
            }

            const boilK = getValue(row, 'BoilingPoint');
            if (boilK) {
                const boilC = (Number(boilK) - 273.15).toFixed(1);
                el.level3_properties.physical.boilingPoint = `${boilC} °C`;
            } else {
                el.level3_properties.physical.boilingPoint = "";
            }

            // 5. history.discoveryYear -> YearDiscovered
            el.level4_history_stse.history.discoveryYear = getValue(row, 'YearDiscovered') || "";
        }
    });

    // 4. Write Output
    const outputString = `export const elementsData_v2 = ${JSON.stringify(skeleton, null, 2)};\n`;
    fs.writeFileSync(outputPath, outputString, 'utf-8');
    console.log(`Successfully injected data into ${outputPath}`);
}

main().catch(console.error);
