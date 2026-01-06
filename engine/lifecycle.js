/**
 * Päätöksen elinkaari (House of Consequences)
 * 
 * Tämä moduuli vie casebook‐datan läpi "päätöksen elinkaaren"
 * ja palauttaa sen rakenteena, joka on tulkittavissa
 * ja renderöitävissä UI:hin.
 */

export const LIFECYCLE_PHASES = [
  "trigger",
  "interpretation",
  "decision",
  "immediate_consequence",
  "recursive_effect",
  "normalized_state"
];

/**
 * Validates that a phase exists in the canonical order.
 * @param {string} phase 
 * @returns {boolean}
 */
export function isValidPhase(phase) {
  return LIFECYCLE_PHASES.includes(phase);
}

/**
 * Normalize event records in a casebook
 * to the canonical lifecycle phases.
 * 
 * @param {Object} casebook JSON-loaded casebook
 * @returns {Object[]} array of { phase, label, description }
 */
export function deriveLifecycle(casebook) {
  if (!casebook || !Array.isArray(casebook.nodes)) {
    throw new Error("Invalid casebook: nodes missing");
  }

  // Map nodes by phase
  const phaseMap = Object.create(null);
  casebook.nodes.forEach(node => {
    if (!node.phase) return;
    if (!phaseMap[node.phase]) phaseMap[node.phase] = [];
    phaseMap[node.phase].push(node);
  });

  // Build ordered lifecycle
  const lifecycle = LIFECYCLE_PHASES.map(phase => {
    const nodes = phaseMap[phase] || [];

    return {
      phase,
      nodes
    };
  });

  return lifecycle;
}

/**
 * Produce a summary (text) of the lifecycle
 * for governance notes or simple log outputs.
 * 
 * @param {Object} casebook JSON casebook
 * @returns {string[]}
 */
export function summarizeLifecycle(casebook) {
  const lifecycle = deriveLifecycle(casebook);

  return lifecycle.map(stage => {
    const count = stage.nodes.length;
    const name = stage.phase.replace(/_/g, " ");
    return · ${name}: ${count} event${count === 1 ? "" : "s"};
  });
}
