import { GameDetails } from "../types/game-details";

export default interface GameServiceContract {
  getAll(): Promise<GameDetails[]>;
  getGameDetails(gameId: string): Promise<GameDetails | undefined>;
}
