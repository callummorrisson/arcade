import * as fs from "fs";
import Ajv from "ajv";
import * as path from "path";

// webpack plugin
export default class GameDbGeneratorPlugin {
  constructor() {
    this.gamesDir = path.join(".", "src", "games");
    this.dbFile = path.join(".", "public", "games.db.json");
  }

  /** @param {import('webpack').Compiler} compiler */
  apply(compiler) {
    compiler.hooks.compile.tap("GameDbGeneratorPlugin_compile", () => {
      // get a list of all games (games without valid manifests are ignored)
      const gameManifests = this.#getGameManifests();

      // check unique game ids and names
      if (this.#hasDuplicates(gameManifests)) {
        console.log("GAME DB GENERATION FAILED BECAUSE DUPLICATES FOUND");
        return;
      }

      // write to file
      this.#writeDb(gameManifests);
    });
  }

  #writeDb(gameManifests) {
    // flatten manifests
    const gameDb = gameManifests.map((x) => ({
      ...x.manifest,
      gamePath: x.gamePath,
    }));

    const json = JSON.stringify(gameDb, null, 2);

    // ensure directory exists
    if (!fs.existsSync(path.dirname(this.dbFile))) {
      fs.mkdirSync(path.dirname(this.dbFile));
    }
    // write to this.dbFile
    fs.writeFileSync(this.dbFile, json, { encoding: "utf8" });
  }

  #hasDuplicates(gameManifests) {
    const idSet = new Set();
    const nameSet = new Set();

    return gameManifests.some((x) => {
      const idDupe = idSet.size === idSet.add(x.manifest.id).size;
      const nameDupe = nameSet.size === nameSet.add(x.manifest.name).size;

      if (idDupe)
        console.log(`FOUND MULTIPLE GAMES WITH "id"="${x.manifest.id}"`);
      if (nameDupe)
        console.log(`FOUND MULTIPLE GAMES WITH "name"="${x.manifest.name}"`);

      return idDupe || nameDupe;
    });
  }

  #getGameManifests() {
    const manifestSchema = this.#getManifestSchema();
    const schemaValidator = new Ajv().compile(manifestSchema);

    const manifestPathRegex = new RegExp(
      [".*?", "game.manifest.json"].join(path.sep)
    );

    const gameManifests = fs
      .readdirSync(this.gamesDir, { recursive: true })
      .filter((x) => manifestPathRegex.test(x))
      .map((x) => {
        const manifestPath = path.join(this.gamesDir, x);
        const gamePath = path.dirname(manifestPath);
        const manifestRaw = fs.readFileSync(manifestPath);

        let manifest = null;
        try {
          manifest = JSON.parse(manifestRaw);
        } catch (e) {
          console.log(`INVALID GAME MANIFEST: ${gamePath}`, e);
        }

        return {
          gamePath,
          manifest,
        };
      })
      .filter((x) => {
        if (!x.manifest) return false;

        const valid = schemaValidator(x.manifest, manifestSchema);
        if (!valid) {
          console.log(
            `INVALID GAME MANIFEST: ${x.gamePath}`,
            schemaValidator.errors.map((e) => e.message)
          );
        }
        return valid;
      });

    return gameManifests;
  }

  #getManifestSchema() {
    const schemaFileName = "game.manifest.schema.json";

    // expect schema to in the root of the repo
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

    return manifestSchema;
  }
}
