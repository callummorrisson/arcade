import GameDetailsModel from "../models/game-details.model";
import { PagedQuery } from "../types/paged-query.type";
import { PagedResult } from "../types/paged-result.type";

export default interface GameServiceContract {
  getAll(): Promise<GameDetailsModel[]>;
  search(
    query: PagedQuery<GameDetailsModel>
  ): Promise<PagedResult<GameDetailsModel>>;
  getGameDetails(gameId: string): Promise<GameDetailsModel | undefined>;
}
