import GameDetailsModel from "./game-details.model";

export type SearchResultsModel = {
  results: GameDetailsModel[];
  totalResults: number;
  pageNumber: number;
}