"use client";

import { useRef } from "react";

import styles from "./sidebar.module.scss";
import { FilterComponent, unwrapFilterBuilder } from "../filterbuilder";
import { FieldFilters } from "@/data/models/search.model";
import {
  SearchParams,
  useSearchParams,
  useSearchParamsUpdater,
} from "../search-store";
import { SearchSettings, useSearchSettings } from "../settings-store";
import GameDetailsModel from "@/data/models/game-details.model";

export default function Sidebar() {
  const updateParams = useSearchParamsUpdater();
  const keywords = useSearchParams((x: SearchParams) => x.keywords);
  const filterValues = useSearchParams((x: SearchParams) => x.filters);
  const [filters, labelMap] = useSearchSettings((x: SearchSettings) => [
    x.filters,
    x.labelMap,
  ]);

  const filterDefinitions = useRef(unwrapFilterBuilder(filters));

  function handleFilterChange<
    TField extends Extract<keyof GameDetailsModel, string>,
  >(field: TField, newFilters: FieldFilters<GameDetailsModel[TField]>) {
    const updated = { ...filterValues, [field]: newFilters };

    // changing filters should reset to first page
    updateParams({ filters: updated, pageNumber: 1 });
  }

  function clearFilters() {
    updateParams({ keywords: '', filters: {} });
  }

  return (
    <div className={styles.sidebar}>
      <h3 className={styles.header}>
        <span>Filters</span>
        <button className={styles["clear-button"]} onClick={clearFilters}>Clear</button>
      </h3>

      <div>
        <h4>Search</h4>
        <div className={styles["keywords-filter"]}>
          <input name="keywords" value={keywords} onChange={e => updateParams({ keywords: e.currentTarget.value.trim() })} />
        </div>
      </div>

      {filterDefinitions.current.map((x, i) => {
        const field = x.field;
        const Filter = x.component as FilterComponent<
          GameDetailsModel[typeof x.field]
        >;

        return (
          <div key={i}>
            <h4>{labelMap[x.field]}</h4>
            <Filter
              onChange={(val) => handleFilterChange(field, val)}
              value={
                filterValues[x.field] ??
                ({} as FieldFilters<GameDetailsModel[typeof x.field]>)
              }
            />
          </div>
        );
      })}
    </div>
  );
}
