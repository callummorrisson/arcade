import * as fs from "fs";
import * as path from "path";
import Ajv from "ajv";

/**
 * 
 * @param {string} schemaFileName 
 * @returns {import("json-schema").JSONSchema7}
 */
export function getManifestSchema(schemaFileName) {
  // expect schema to be in the root of the repo
  const schemaPath = path.resolve(".", schemaFileName);
  if (!fs.existsSync(schemaPath)) {
    throw `COULD NOT FIND GAME MANIFEST SCHEMA: ${schemaPath}`;
  }

  const raw = fs.readFileSync(schemaPath);

  let manifestSchema;
  try {
    manifestSchema = JSON.parse(raw);
  } catch (e) {
    // TODO dunno if Error.cause is supported in node??
    throw new Error("INVALID GAME MANIFEST SCHEMA", { cause: e });
  }

  const ajv = new Ajv();
  const valResult = ajv.validateSchema(manifestSchema);
  if (!valResult) {
    throw `INVALID JSON SCHEMA - ${schemaFileName}\n${JSON.stringify(ajv.errors.map(x => `${x.dataPath} - ${x.message}`), null, 2)}`;
  }

  return manifestSchema;
}
