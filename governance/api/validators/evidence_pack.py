import json
from jsonschema import Draft7Validator
from pathlib import Path

SCHEMA_PATH = Path(__file__).resolve().parents[3] / "governance" / "schemas" / "evidence.pack.schema.json"


def validate_evidence_pack(data: dict) -> dict:
    """
    Validate Evidence Pack JSON against locked schema.
    Returns structured validation result.
    """

    try:
        with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
            schema = json.load(f)
    except Exception as e:
        return {
            "valid": False,
            "errors": [f"Schema loading failed: {str(e)}"]
        }

    validator = Draft7Validator(schema)
    errors = sorted(validator.iter_errors(data), key=lambda e: e.path)

    if errors:
        return {
            "valid": False,
            "errors": [
                {
                    "path": ".".join([str(p) for p in error.path]),
                    "message": error.message
                }
                for error in errors
            ]
        }

    return {
        "valid": True,
        "errors": []
    }
