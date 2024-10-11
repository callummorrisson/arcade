"use client";

import useDataService from "@/data/api/use-data-service";
import GameDetails from "@/data/models/game-details.model";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { GameCoverImage } from "@/components/game-cover-image/game-cover-image";

type GamePageParams = { gameId: string };

export default function Game({ gameId }: GamePageParams) {
  const gamesService = useDataService((x) => x.games);
  const [man, setMan] = useState<GameDetails | null>(null);

  useEffect(() => {
    const getGameDetails = async () => {
      const details = await gamesService.getGameDetails(gameId);
      if (details) setMan(details);
    };

    if (gameId) getGameDetails();
  }, [gamesService, gameId]);

 
  const Game = useMemo(
    () =>
      man &&
      dynamic(() => import(`@/games/${man.gameFolder}/index.tsx`), {
        ssr: false,
      }),
    [man]
  );

  return (
    <>
      <h1>{gameId}</h1>
      <pre>{JSON.stringify(man, null, 2)}</pre>
      {Game && <Game />}
      {man && <GameCoverImage gameFolder={man.gameFolder} coverExtension={man.coverExtension} />}
    </>
  );
}
