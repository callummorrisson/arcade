"use client";

import useDataService from "@/data/api/use-data-service";
import { GameDetails } from "@/data/types/game-details";
import { useEffect, useState } from "react";

type GamePageParams = { gameId: string };

export default function Game({ gameId }: GamePageParams) {
  const gamesService = useDataService(x => x.games);
  const [man, setMan] = useState<GameDetails| null>(null);

  useEffect(() => {
    const getGameDetails = async () => {
      var details = await gamesService.getGameDetails(gameId);
      if (details) setMan(details);
    };

    if (gameId) getGameDetails();
  }, [gameId]);

  return (
    <>
      <h1>{gameId}</h1>
      <pre>{JSON.stringify(man, null, 2)}</pre>
    </>
  );
}
