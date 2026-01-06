import Ajv from "ajv7";
import schema from "../schemas/casebook.schema.json";

test("HUS Psykiatria casebook valid", () => {
  const ajv = new Ajv({ allErrors: true });
  const validate = ajv.compile(schema);
  const casebook = require("../casebooks/terveydenhuolto/hus-psykiatria-hoitoviiveet.casebook.json");
  expect(validate(casebook)).toBe(true);
});
