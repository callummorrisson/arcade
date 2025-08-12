import GameDetailsModel from "../models/game-details.model";
import { SearchModel } from "../models/search.model";
import { SearchResultsModel } from "../models/search-results.model";

export default interface GameServiceContract {
  getAll(): Promise<GameDetailsModel[]>;
  search(
    query: SearchModel
  ): Promise<SearchResultsModel>;
  getGameDetails(gameId: string): Promise<GameDetailsModel | undefined>;
}
