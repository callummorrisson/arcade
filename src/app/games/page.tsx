'use client'

import { Search } from "@/components/search";
import GameDetailsModel from "@/data/models/game-details.model";
import useDataService from "@/data/api/use-data-service";

export default function SearchGames() {
  const gameService = useDataService(x => x.games);

  return (
    <Search<GameDetailsModel>
      resultsFunc={x => gameService.search(x)}
    />
  );
}