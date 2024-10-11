"use client";

import GameDetailsModel from "@/data/models/game-details.model";
import { useSearchParams, useSearchResults } from "../search-store";

import style from "./results.module.scss";
import { GameCoverImage } from "@/components/game-cover-image/game-cover-image";

const DEFAULT_DISPLAYTEMPLATE = {
  grid: (x: GameDetailsModel) => <div>{x.name}</div>,
  list: (x: GameDetailsModel) => <div>{x.name}</div>,
}

export default function Results() {
  const results = useSearchResults((x) => x.results);
  const [display ] = useSearchParams((x) => [x.display]);

  const ResultComp: React.FC<GameDetailsModel> =  DEFAULT_DISPLAYTEMPLATE[display];
  return (
    <div
      className={`${style["results-container"]} ${style["results-" + display]}`}
    >
      {results.map((x, i) => <div className={style.item} key={i}>
          <GameCoverImage gameFolder={x.gameFolder} coverExtension={x.coverExtension} className={style["item-thumbnail"]} />
          
          <span className={style["item-name"]}>{x.name}</span>
        </div>)}
    </div>
  );
}
