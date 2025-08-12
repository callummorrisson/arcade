"use client";

import AutoScaleText from "@/components/auto-scale-text";
import { useSearchParams, useSearchResults } from "../search-store";

import styles from "./results.module.scss";
import { GameCoverImage } from "@/components/game-cover-image";

export default function Results() {
  const results = useSearchResults((x) => x.results);
  const [display] = useSearchParams((x) => [x.display]);

  return (
    <div
      className={`${styles["results-container"]} ${styles["results-" + display]}`}
    >
      {results.map((x, i) => (
        <div className={styles.item} key={i}>
          <div className={styles["item-summary"]}>
            <div className={styles["item-thumbnail"]}>
              <GameCoverImage
                gameFolder={x.gameFolder}
                coverExtension={x.coverExtension}
                className={styles["item-thumbnail"]}
              />
            </div>
            <div className={styles["item-summary-name"]}>
              <AutoScaleText text={x.name} />
            </div>
          </div>

          <div className={styles["item-details"]}>
            <span className={styles["item-name"]}>{x.name}</span>
            <span className={styles["item-description"]}>{x.description}</span>
            <span className={styles["item-created-date"]}>
              {x.createdDate.toLocaleDateString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
