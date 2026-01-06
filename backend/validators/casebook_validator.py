import json
from jsonschema import Draft202012Validator

with open("schemas/casebook.schema.json", "r", encoding="utf-8") as f:
    schema = json.load(f)

def validate_casebook(data: dict) -> dict:
    validator = Draft202012Validator(schema)
    errors = sorted(validator.iter_errors(data), key=lambda e: e.path)
    return {
        "is_valid": not bool(errors),
        "errors": [str(error) for error in errors]
    }
