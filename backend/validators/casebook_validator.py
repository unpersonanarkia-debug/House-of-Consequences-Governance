import json
from pathlib import Path
from jsonschema import Draft202012Validator

SCHEMA_PATH = Path(__file__).parents[1] / "schemas/casebook.schema.json"

with open(SCHEMA_PATH, encoding="utf-8") as f:
    SCHEMA = json.load(f)

def validate_casebook(data: dict) -> dict:
    validator = Draft202012Validator(SCHEMA)
    errors = sorted(validator.iter_errors(data), key=lambda e: e.path)
    return {
        "is_valid": not bool(errors),
        "errors": [e.message for e in errors]
    }

