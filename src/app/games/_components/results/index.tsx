"use client";

import { useSearchParams, useSearchResults } from "../search-store";

import style from "./results.module.scss";
import { GameCoverImage } from "@/components/game-cover-image/game-cover-image";

export default function Results() {
  const results = useSearchResults((x) => x.results);
  const [display] = useSearchParams((x) => [x.display]);

  return (
    <div
      className={`${style["results-container"]} ${style["results-" + display]}`}
    >
      {results.map((x, i) => (
        <div className={style.item} key={i}>
          <GameCoverImage
            gameFolder={x.gameFolder}
            coverExtension={x.coverExtension}
            className={style["item-thumbnail"]}
          />

          <span className={style["item-name"]}>{x.name}</span>
        </div>
      ))}
    </div>
  );
}
