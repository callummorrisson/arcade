import * as fs from "fs";
import Ajv from "ajv";
import * as path from "path";
import WatchExecutePlugin from "./watch-execute.plugin.mjs";
import { globSync } from "glob";

export default class GameDbGeneratorPlugin extends WatchExecutePlugin {
  constructor() {
    super("./src/games/*/game.manifest.json", () => this.#generateDb());

    this.dbFilePath = "./public/games.db.json";

    // hack: call once on first compile
    this.#generateDb();
  }

  #generateDb() {
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
    if (!fs.existsSync(path.dirname(this.dbFilePath))) {
      fs.mkdirSync(path.dirname(this.dbFilePath));
    }
    // write to this.dbFilePath
    fs.writeFileSync(this.dbFilePath, json, { encoding: "utf8" });
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
    const manifestSchema = this.#getManifestSchema();
    const schemaValidator = new Ajv().compile(manifestSchema);

    const manifestFiles = this.getWatchedFiles();
    const gameManifests = [];

    for (const manifestFile of manifestFiles) {
      const manifest = this.#parseGameManigest(manifestFile, schemaValidator);
      if (!manifest) continue;

      const gameFolder = path.dirname(manifestFile);
      const coverExtension = this.#getGameCoverExtension(gameFolder);

      gameManifests.push({
        ...manifest,
        coverExtension,
        gameFolder: path.basename(gameFolder)
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
        schemaValidator.errors.map((e) => e.message)
      );
    }

    return manifest;
  }

  #getManifestSchema() {
    const schemaFileName = "./.build/game.manifest.schema.json";

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
