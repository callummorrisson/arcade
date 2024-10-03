import useDataService from "@/data/api/use-data-service";
import Game from "./game";
import gamesDb from '@/../public/games.db.json';

type GamePageParams = { gameId: string };

export default function GamePage({ params }: { params: GamePageParams }) {
  return (
    <>
    <h2>{params.gameId}</h2>
      <Game gameId={params.gameId} />
    </>
  );
}

export function generateStaticParams() {
  const games = gamesDb.map(x => ({ gameId: x.id }));
  return games;
}
