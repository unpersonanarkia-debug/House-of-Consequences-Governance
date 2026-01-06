def test_hus_casebook_valid():
    from backend.validators.casebook_validator import validate_casebook
    import json
    f = open("schemas/casebook.schema.json")
    schema = json.load(f)
    f2 = open("casebooks/terveydenhuolto/hus-psykiatria-hoitoviiveet.casebook.json")
    data = json.load(f2)
    result = validate_casebook(data)
    assert result["is_valid"]
