"use client";
import useDataService from "@/data/api/use-data-service";
import { useEffect, useState } from "react";
import Link from "next/link";
import GameDetailsModel from "@/data/models/game-details.model";

export default function Home() {
  const [games, setGames] = useState<GameDetailsModel[]>([]);
  const gameService = useDataService((x) => x.games);

  useEffect(() => {
    const getGames = async () => {
      const games = await gameService.getAll();
      setGames(games);
    };
    getGames();
  }, [gameService]);

  return (
    <>
      {games.map((x) => (
        <div key={x.id}>
          <Link href={`/games/${x.id}`}>{x.name}</Link>
        </div>
      ))}
    </>
  );
}
