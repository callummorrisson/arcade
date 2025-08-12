/*****************************************
 * THIS FILE IS GENERATED CODE DO NOT EDIT
 * see GameDbGeneratorPlugin in .build/game-manifest-typescript-generator.plugin.mjs
 *****************************************/

export interface GameManifestModel {
  /**
   * Unique id for this game, will be used in the URL
   */
  id: string;
  name: string;
  description: string;
  createdDate: string;
  /**
   * @minItems 1
   */
  controlOptions: ("mouse" | "keyboard" | "mouse-and-keyboard" | "midi" | "gamepad")[];
}
