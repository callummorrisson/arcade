"use client";

import AutoScaleText from "@/components/auto-scale-text";
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
          <div className={style["item-summary"]}>
            <div className={style["item-thumbnail"]}>
              <GameCoverImage
                gameFolder={x.gameFolder}
                coverExtension={x.coverExtension}
                className={style["item-thumbnail"]}
              />
            </div>
            <div className={style["item-summary-name"]}>
              <AutoScaleText text={x.name} />
            </div>
          </div>

          <div className={style["item-details"]}>
            <span className={style["item-name"]}>{x.name}</span>
            <span className={style["item-description"]}>{x.description}</span>
            <span className={style["item-created-date"]}>
              {x.createdDate.toLocaleDateString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
