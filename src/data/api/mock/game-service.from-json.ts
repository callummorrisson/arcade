import { GameDetails } from "@/data/types/game-details";
import GameServiceContract from "../game-service.contract";

export class GameServiceFromJson implements GameServiceContract {
  #baseUrl: string;

  constructor(baseUrl: string) {
    this.#baseUrl = baseUrl;
  }

  getAll(): Promise<GameDetails[]> {
    return this.#getFromJson();
  }
  async getGameDetails(gameId: string): Promise<GameDetails | undefined> {
    const all = await this.#getFromJson();
    return all.find(x => x.id === gameId);
  }

  async #getFromJson(): Promise<GameDetails[]> {
    const json = await fetch(`${this.#baseUrl}/games.db.json`);
    const data: GameDetails[] = await json.json();
    return data;
  }
}