import * as fs from "fs";
import WatchExecutePlugin from "./watch-execute.plugin.mjs";
import { compile } from "json-schema-to-typescript";
import { getManifestSchema } from "./plugin-shared.mjs";

// note: file paths are all relative to root
const schemaFileName = "./.build/game.manifest.schema.json";
const typeDefinitionFileName = "./src/data/models/game-manifest.model.ts";

const bannerComment =
  "/*****************************************" +
  "\n * THIS FILE IS GENERATED CODE DO NOT EDIT" +
  "\n * see GameDbGeneratorPlugin in .build/game-manifest-typescript-generator.plugin.mjs" +
  "\n *****************************************/";
const typeName = "GameManifestModel";

export default class GameManifestTypescriptGeneratorPlugin extends WatchExecutePlugin {
  constructor() {
    super(schemaFileName, () => this.#generate());
    this.isInProgress = false;

    // hack: call once on first compile - means build server will always execute
    this.#generate();
  }

  #generate() {
    if (this.isInProgress) return;

    try {
      this.isInProgress = true;
      const manifestSchema = getManifestSchema(schemaFileName);

      // note: there's no synchronous overload for compile
      // if this causes issues then should wrap with something like (https://www.npmjs.com/package/synchronized-promise)
      compile(manifestSchema, typeName, {
        bannerComment: bannerComment,
        ignoreMinAndMaxItems: true
      }).then((ts) => {
        fs.writeFileSync(typeDefinitionFileName, ts);
        this.isInProgress = false;
      });
    } catch (e) {
      this.isInProgress = false;
      throw e;
    }
  }
}
