import Game from "./game";
import gamesDb from '@/../public/games.db.json';

interface GamePageParams { gameId: string };

export default async function GamePage(props: { params: Promise<GamePageParams> }) {
  const params = await props.params;
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
