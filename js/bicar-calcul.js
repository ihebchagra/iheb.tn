/**
 * Bicar-Calcul — Calculateur de gaz du sang
 * Basé sur le guide d'Emna Sahli, encadré par Pr. Souheil Omar
 * 
 * Calculs:
 * 1. Bicarbonate [HCO₃⁻] via Henderson-Hasselbalch
 * 2. CO₂ total (réserve alcaline)
 * 3. Excès de Base (BE) via Siggaard-Andersen
 */

(function() {
    'use strict';

    // Constants
    const PKA = 6.1;                    // pKa de l'acide carbonique
    const ALPHA_CO2 = 0.03;             // Coefficient de solubilité du CO₂ (mmol/L/mmHg)
    const HCO3_NORMAL = 24.4;           // Bicarbonate normal (mmol/L)
    const PH_NORMAL = 7.4;              // pH normal
    const BE_FACTOR = 0.93;             // Facteur de correction Siggaard-Andersen
    const PH_COEF = 14.8;               // Coefficient pH dans BE

    // DOM Elements
    const phInput = document.getElementById('ph-input');
    const paco2Input = document.getElementById('paco2-input');
    const btnCalculate = document.getElementById('btn-calculate');
    const btnReset = document.getElementById('btn-reset');
    const resultsSection = document.getElementById('results-section');

    // Result elements
    const hco3Value = document.getElementById('hco3-value');
    const co2TotalValue = document.getElementById('co2-total-value');
    const beValue = document.getElementById('be-value');

    /**
     * Calculate bicarbonate using Henderson-Hasselbalch equation
     * pH = pKa + log([HCO₃⁻] / (α × PaCO₂))
     * [HCO₃⁻] = α × PaCO₂ × 10^(pH - pKa)
     */
    function calculateBicarbonate(ph, paco2) {
        const co2Dissolved = ALPHA_CO2 * paco2;
        const hco3 = co2Dissolved * Math.pow(10, ph - PKA);
        return {
            co2Dissolved,
            hco3
        };
    }

    /**
     * Calculate total CO₂ (réserve alcaline)
     * CO₂ total = [HCO₃⁻] + (α × PaCO₂)
     */
    function calculateCo2Total(hco3, co2Dissolved) {
        return hco3 + co2Dissolved;
    }

    /**
     * Calculate Base Excess using Siggaard-Andersen formula
     * BE = 0.93 × ([HCO₃⁻] – 24.4 + 14.8 × (pH – 7.4))
     */
    function calculateBaseExcess(hco3, ph) {
        return BE_FACTOR * (hco3 - HCO3_NORMAL + PH_COEF * (ph - PH_NORMAL));
    }

    /**
     * Main calculation function
     */
    function calculate() {
        // Get input values
        const ph = parseFloat(phInput.value);
        const paco2 = parseFloat(paco2Input.value);

        // Validate inputs
        // if (isNaN(ph) || isNaN(paco2)) {
        //     alert('Veuillez entrer des valeurs valides pour le pH et la PaCO₂');
        //     return;
        // }

        // if (ph < 6.0 || ph > 8.0) {
        //     alert('Le pH doit être compris entre 6.0 et 8.0');
        //     return;
        // }

        // if (paco2 < 10 || paco2 > 150) {
        //     alert('La PaCO₂ doit être comprise entre 10 et 150 mmHg');
        //     return;
        // }

        // Perform calculations
        const { co2Dissolved, hco3 } = calculateBicarbonate(ph, paco2);
        const co2Total = calculateCo2Total(hco3, co2Dissolved);
        const be = calculateBaseExcess(hco3, ph);

        // Display results
        hco3Value.textContent = hco3.toFixed(2);
        co2TotalValue.textContent = co2Total.toFixed(2);
        beValue.textContent = be.toFixed(2);

        // Show results section
        resultsSection.style.display = 'block';

        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    /**
     * Reset form and hide results
     */
    function reset() {
        phInput.value = '7.40';
        paco2Input.value = '40';
        resultsSection.style.display = 'none';
    }

    // Event listeners
    btnCalculate.addEventListener('click', calculate);
    btnReset.addEventListener('click', reset);

    // Allow Enter key to trigger calculation
    [phInput, paco2Input].forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                calculate();
            }
        });
    });
})();
