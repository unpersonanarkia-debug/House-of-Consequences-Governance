from fastapi import FastAPI
import json
from pathlib import Path

app = FastAPI(
    title="House of Consequences Governance Engine",
    version="0.1.0"
)

# Ladataan Canonical Casebook -skeema muistiin
SCHEMA_PATH = Path(_file_).resolve().parent.parent / "schemas" / "casebook.schema.json"

with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
    CASEBOOK_SCHEMA = json.load(f)


@app.get("/")
def root():
    return {
        "status": "ok",
        "message": "Governance engine online",
        "canonical_schema_loaded": True,
        "schema_title": CASEBOOK_SCHEMA.get("title")
    }
