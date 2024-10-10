"use client";

import GameDetailsModel from "@/data/models/game-details.model";
import { useSearchParams, useSearchResults } from "../search-store";

import style from "./results.module.scss";

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
      {results.map((x, i) => <ResultComp key={i} {...x} />)}
    </div>
  );
}
