/* ============================================================
 * House of Consequences – Governance Engine
 * Core logic for Casebook validation, lifecycle computation
 * and normalization detection.
 *
 * Canonical authority is enforced at engine level.
 * ============================================================ */

import casebookSchema from "../schemas/casebook.schema.json";
import caseSchema from "../schemas/case.schema.json";

/* -----------------------------
   Types
----------------------------- */

export type LifecycleStage =
  | "trigger"
  | "interpretation"
  | "decision"
  | "immediate_consequence"
  | "recursive_effect"
  | "normalized_state";

export interface CaseLifecycle {
  stage: LifecycleStage;
  description: string;
  actors: string[];
  artifacts?: string[];
}

export interface Case {
  case_id: string;
  core_claim: string;
  lifecycle: CaseLifecycle[];
  structural_risk: string;
  typical_loophole: string;
  learning_objectives: {
    pdca: string[];
    bloom: string[];
  };
}

export interface Casebook {
  casebook_id: string;
  canonical: boolean;
  scope: string;
  cases: Case[];
  meta: Record<string, any>;
}

/* -----------------------------
   Engine Errors
----------------------------- */

export class GovernanceError extends Error {
  constructor(message: string) {
    super([Governance Engine] ${message});
  }
}

/* -----------------------------
   Validation
----------------------------- */

export function validateCasebook(casebook: Casebook): void {
  if (!casebook.casebook_id) {
    throw new GovernanceError("Missing casebook_id");
  }

  if (!Array.isArray(casebook.cases)) {
    throw new GovernanceError("Casebook.cases must be an array");
  }

  casebook.cases.forEach(validateCase);

  if (casebook.canonical === true && !casebook.meta?.canonical_signature) {
    throw new GovernanceError(
      "Canonical casebooks require canonical_signature"
    );
  }
}

export function validateCase(caseItem: Case): void {
  const requiredStages: LifecycleStage[] = [
    "trigger",
    "interpretation",
    "decision",
    "immediate_consequence",
    "recursive_effect",
    "normalized_state",
  ];

  if (!caseItem.case_id || !caseItem.core_claim) {
    throw new GovernanceError("Case missing id or core claim");
  }

  const stages = caseItem.lifecycle.map((l) => l.stage);

  requiredStages.forEach((stage) => {
    if (!stages.includes(stage)) {
      throw new GovernanceError(
        Case ${caseItem.case_id} missing lifecycle stage: ${stage}
      );
    }
  });

  if (!caseItem.structural_risk) {
    throw new GovernanceError(
      Case ${caseItem.case_id} missing structural_risk
    );
  }

  if (!caseItem.typical_loophole) {
    throw new GovernanceError(
      Case ${caseItem.case_id} missing typical_loophole
    );
  }

  if (
    !caseItem.learning_objectives ||
    !caseItem.learning_objectives.pdca ||
    !caseItem.learning_objectives.bloom
  ) {
    throw new GovernanceError(
      Case ${caseItem.case_id} missing learning objectives
    );
  }
}

/* -----------------------------
   Lifecycle Processing
----------------------------- */

export function computeLifecycle(caseItem: Case): CaseLifecycle[] {
  return caseItem.lifecycle.sort(
    (a, b) =>
      lifecycleOrder(a.stage) - lifecycleOrder(b.stage)
  );
}

function lifecycleOrder(stage: LifecycleStage): number {
  const order: LifecycleStage[] = [
    "trigger",
    "interpretation",
    "decision",
    "immediate_consequence",
    "recursive_effect",
    "normalized_state",
  ];
  return order.indexOf(stage);
}

/* -----------------------------
   Normalization Detection
----------------------------- */

export function detectNormalization(caseItem: Case): boolean {
  const normalized = caseItem.lifecycle.find(
    (l) => l.stage === "normalized_state"
  );

  if (!normalized) return false;

  const blameRemoved =
    normalized.description.includes("no responsible actor") ||
    normalized.description.includes("systemic") ||
    normalized.description.includes("inevitable");

  return blameRemoved;
}

/* -----------------------------
   Governance Verdict
----------------------------- */

export function evaluateCase(caseItem: Case) {
  const lifecycle = computeLifecycle(caseItem);
  const normalized = detectNormalization(caseItem);

  return {
    case_id: caseItem.case_id,
    normalized,
    risk: caseItem.structural_risk,
    loophole: caseItem.typical_loophole,
    lifecycle,
  };
}

/* -----------------------------
   Public Engine API
----------------------------- */

export function runGovernance(casebook: Casebook) {
  validateCasebook(casebook);

  const results = casebook.cases.map(evaluateCase);

  return {
    casebook_id: casebook.casebook_id,
    canonical: casebook.canonical,
    evaluated_cases: results,
  };
}
