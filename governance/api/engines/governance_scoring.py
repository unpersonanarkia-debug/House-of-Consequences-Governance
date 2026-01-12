def score_governance(evidence: dict) -> dict:
    """
    Compute Governance Score and Normalized Error indicator
    from a validated Evidence Pack.
    """

    score_components = {}

    # 1️⃣ Interpretation Failure
    interpretation_signal = evidence.get("pdca_support", {}).get("plan_signal", "")
    interpretation_fail = "resurssi" in interpretation_signal.lower()
    score_components["interpretation_fail"] = 1.0 if interpretation_fail else 0.0

    # 2️⃣ Recursive Amplification
    findings = evidence.get("findings", [])
    complication_growth = 0.0

    for f in findings:
        if f["metric"] == "komplikaatio-osuus":
            baseline = f.get("baseline", 0)
            exposed = f.get("exposed", 0)
            if baseline > 0:
                complication_growth = (exposed - baseline) / baseline

    recursive_amplification = 1.0 if complication_growth >= 0.4 else 0.0
    score_components["recursive_amplification"] = recursive_amplification

    # 3️⃣ Persistence (Normalized State)
    check_signal = evidence.get("pdca_support", {}).get("check_signal", "")
    normalized_state = ">15%" in check_signal or "vakaasti" in check_signal.lower()
    score_components["normalized_state"] = 1.0 if normalized_state else 0.0

    # 4️⃣ Economic Burden
    econ = evidence.get("attribution", {}).get("economic_impact", {})
    annual_cost = econ.get("annual_total_cost", 0)
    economic_pressure = 1.0 if annual_cost >= 100_000_000 else 0.0
    score_components["economic_pressure"] = economic_pressure

    # 🎯 Final Score (weighted)
    governance_score = round(
        (
            score_components["interpretation_fail"] * 0.25 +
            score_components["recursive_amplification"] * 0.30 +
            score_components["normalized_state"] * 0.25 +
            score_components["economic_pressure"] * 0.20
        ),
        2
    )

    normalized_error = governance_score >= 0.75

    return {
        "governance_score": governance_score,
        "normalized_error_detected": normalized_error,
        "score_breakdown": score_components,
        "classification": (
            "normalized_error"
            if normalized_error
            else "non_normalized_structural_issue"
        )
    }

🔌 governance/api/main.py (lisäys)

Lisää olemassa olevan /validate/evidence-pack-endpointin jälkeen:


from governance.api.engines.governance_scoring import score_governance

@app.post("/analyze/evidence-pack")
def analyze_evidence_pack(data: dict):
    """
    Validate + score Evidence Pack for governance risk
    """
    from governance.api.validators.evidence_pack import validate_evidence_pack

    validation = validate_evidence_pack(data)
    if not validation["valid"]:
        raise HTTPException(
            status_code=422,
            detail={
                "message": "Evidence Pack validation failed",
                "errors": validation["errors"]
            }
        )

    analysis = score_governance(data)

    return {
        "status": "ok",
        "analysis": analysis,
        "canonical_classification": analysis["classification"]
    }
