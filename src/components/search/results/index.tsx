"use client";

import { useSearchParams, useSearchResults } from "../search-store";

import style from "./results.module.scss";
import { ItemBase } from "@/data/types/item-base.type";

const DEFAULT_DISPLAYTEMPLATE = {
  grid: (x: ItemBase) => <div>{x.name}</div>,
  list: (x: ItemBase) => <div>{x.name}</div>,
}

export default function Results() {
  const results = useSearchResults((x) => x.results);
  const [display, displayTemplates ] = useSearchParams((x) => [x.display, x.displayTemplates]);

  const ResultComp: React.FC<ItemBase> = displayTemplates[display] ?? DEFAULT_DISPLAYTEMPLATE[display];
  return (
    <div
      className={`${style["results-container"]} ${style["results-" + display]}`}
    >
      {results.map((x, i) => <ResultComp key={i} {...x} />)}
    </div>
  );
}
