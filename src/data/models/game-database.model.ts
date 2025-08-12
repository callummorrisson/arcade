import { GameManifestModel } from "./game-manifest.model";

export default interface GameDatabaseModel extends GameManifestModel {
  gameFolder: string;
  coverExtension?: string;
}
