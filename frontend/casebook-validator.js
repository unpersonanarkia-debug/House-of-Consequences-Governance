// House of Consequences – Casebook Schema Validator

async function loadSchema() {
  const res = await fetch("../schemas/casebook.schema.json");
  if (!res.ok) throw new Error("Schemaa ei voitu ladata");
  return await res.json();
}

async function validateCasebook(data) {
  const schema = await loadSchema();

  const ajv = new window.ajv7.default({
    allErrors: true,
    strict: false
  });

  const validate = ajv.compile(schema);
  const valid = validate(data);

  return {
    valid,
    errors: validate.errors || []
  };
}
