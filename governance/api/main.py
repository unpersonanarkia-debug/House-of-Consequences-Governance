from fastapi import FastAPI, HTTPException
from governance.api.validators.evidence_pack import validate_evidence_pack

app = FastAPI(
    title="House of Consequences Governance API",
    version="1.0.0",
    description="Canonical validation layer for Evidence Packs and Casebooks"
)

@app.post("/validate/evidence-pack")
def validate_evidence(data: dict):
    """
    Validates an Evidence Pack against the locked evidence.pack.schema.json
    """
    result = validate_evidence_pack(data)

    if not result["valid"]:
        raise HTTPException(
            status_code=422,
            detail={
                "message": "Evidence Pack validation failed",
                "errors": result["errors"]
            }
        )

    return {
        "status": "ok",
        "message": "Evidence Pack is valid",
        "canonical_compatible": True
    }

# ─────────────────────────────────────────────
# Load locked Canonical Casebook schema
# ─────────────────────────────────────────────

SCHEMA_PATH = Path(__file__).resolve().parent.parent / "schemas" / "casebook.schema.json"

try:
    with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
        CASEBOOK_SCHEMA = json.load(f)
except Exception as e:
    raise RuntimeError(f"Failed to load casebook schema: {e}")

# ─────────────────────────────────────────────
# Health check
# ─────────────────────────────────────────────

@app.get("/health")
def health():
    return {
        "status": "ok",
        "engine": "House of Consequences Governance",
        "schema_version": CASEBOOK_SCHEMA.get("version", "unknown")
    }

# ─────────────────────────────────────────────
# Canonical Casebook validation endpoint
# ─────────────────────────────────────────────

@app.post("/validate/casebook")
def validate_casebook(casebook: dict):
    try:
        validate(instance=casebook, schema=CASEBOOK_SCHEMA)
        return JSONResponse(
            status_code=200,
            content={
                "valid": True,
                "canonical": True,
                "message": "Casebook is valid under Canonical Casebook v1.0"
            }
        )
    except ValidationError as e:
        raise HTTPException(
            status_code=422,
            detail={
                "valid": False,
                "canonical": False,
                "error": e.message,
                "path": list(e.path),
                "schema_path": list(e.schema_path)
            }
        )
