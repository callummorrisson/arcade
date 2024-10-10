"use client";

import useDataService from "@/data/api/use-data-service";
import { GameDetails } from "@/data/types/game-details";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";

type GamePageParams = { gameId: string };

export default function Game({ gameId }: GamePageParams) {
  const gamesService = useDataService((x) => x.games);
  const [man, setMan] = useState<GameDetails | null>(null);
  const [cover, setCover] = useState<string>();

  useEffect(() => {
    const getGameDetails = async () => {
      const details = await gamesService.getGameDetails(gameId);
      if (details) setMan(details);
    };

    if (gameId) getGameDetails();
  }, [gamesService, gameId]);

  useEffect(() => {
    const getCover = async () => {
      const image = await import(`@/games/${man!.gameFolder}/cover${man!.coverExtension}`);
      setCover(image.default.src);
    }

    if (man && man.coverExtension) {
      getCover();
    }
  }, [man])

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
      {cover && (
        <img src={cover} alt="cover" width={400} height={400} />
      )}
    </>
  );
}
