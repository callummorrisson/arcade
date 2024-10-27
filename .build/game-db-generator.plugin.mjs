import * as fs from "fs";
import Ajv from "ajv";
import * as path from "path";
import WatchExecutePlugin from "./watch-execute.plugin.mjs";
import { globSync } from "glob";
import { getManifestSchema } from "./plugin-shared.mjs";

// note: file paths are all relative to root
const schemaFileName = "./.build/game.manifest.schema.json";
const manifestGlob = "./src/games/*/game.manifest.json";
const dbFilePath = "./public/games.db.json";

export default class GameDbGeneratorPlugin extends WatchExecutePlugin {
  constructor() {
    super([schemaFileName, manifestGlob], () => this.#generate());

    // hack: call once on first compile - means build server will always execute
    this.#generate();
  }

  #generate() {
    // get a list of all games (games without valid manifests are ignored)
    const gameManifests = this.#getGameManifests();

    // check unique game ids and names
    if (this.#hasDuplicates(gameManifests)) {
      console.error("GAME DB GENERATION FAILED BECAUSE DUPLICATES FOUND");
      return;
    }

    // write to file
    this.#writeDb(gameManifests);
  }

  #writeDb(gameManifests) {
    const json = JSON.stringify(gameManifests, null, 2);

    // ensure directory exists
    if (!fs.existsSync(path.dirname(dbFilePath))) {
      fs.mkdirSync(path.dirname(dbFilePath));
    }
    // write to file
    fs.writeFileSync(dbFilePath, json, { encoding: "utf8" });
  }

  #hasDuplicates(gameManifests) {
    const idSet = new Set();
    const nameSet = new Set();

    return gameManifests.some((x) => {
      const idDupe = idSet.size === idSet.add(x.id).size;
      const nameDupe = nameSet.size === nameSet.add(x.name).size;

      if (idDupe) console.warn(`FOUND MULTIPLE GAMES WITH "id"="${x.id}"`);
      if (nameDupe)
        console.warn(`FOUND MULTIPLE GAMES WITH "name"="${x.name}"`);

      return idDupe || nameDupe;
    });
  }

  #getGameManifests() {
    const manifestSchema = getManifestSchema(schemaFileName);
    const schemaValidator = new Ajv().compile(manifestSchema);

    const manifestFiles = globSync(manifestGlob).map((x) => path.resolve(x));
    const gameManifests = [];

    for (const manifestFile of manifestFiles) {
      const manifest = this.#parseGameManigest(manifestFile, schemaValidator);
      if (!manifest) continue;

      const gameFolder = path.dirname(manifestFile);
      const coverExtension = this.#getGameCoverExtension(gameFolder);

      gameManifests.push({
        ...manifest,
        coverExtension,
        gameFolder: path.basename(gameFolder),
      });
    }

    return gameManifests;
  }

  #getGameCoverExtension(gameFolder) {
    const coverImages = globSync(`${gameFolder}/cover.+(jpg|png|svg|jpeg)`);
    if (!coverImages.length) return null;

    return path.extname(coverImages[0]);
  }

  #parseGameManigest(filePath, validator) {
    let manifest = null;
    try {
      const manifestRaw = fs.readFileSync(filePath);
      manifest = JSON.parse(manifestRaw);
    } catch (e) {
      console.error(`INVALID GAME MANIFEST: ${filePath}`, e);
    }

    if (!manifest) return manifest;

    const valid = validator(manifest);
    if (!valid) {
      console.error(
        `INVALID GAME MANIFEST: ${filePath}`,
        validator.errors.map((e) => e.message)
      );
    }

    return manifest;
  }
}
