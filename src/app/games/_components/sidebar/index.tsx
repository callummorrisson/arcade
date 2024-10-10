"use client";

import style from "./sidebar.module.scss";
import { FilterComponent, unwrapFilterBuilder } from "../filterbuilder";
import { useRef } from "react";
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
  const filterValues = useSearchParams((x: SearchParams) => x.filters);
  const [filters, labelMap] = useSearchSettings((x: SearchSettings) => [
    x.filters,
    x.labelMap,
  ]);

  const filterDefinitions = useRef(unwrapFilterBuilder(filters));

  function handleFilterChange<
    TField extends Extract<keyof GameDetailsModel, string>
  >(field: TField, newFilters: FieldFilters<GameDetailsModel[TField]>) {
    const updated = { ...filterValues, [field]: newFilters };

    // changing filters should reset to first page
    updateParams({ filters: updated, pageNumber: 1 });
  }

  return (
    <div className={style.sidebar}>
      <h3>
        Filters <button>Clear</button>
      </h3>
      {filterDefinitions.current.map((x, i) => {
        const field = x.field;
        const Filter = x.component as FilterComponent<
          GameDetailsModel[typeof x.field]
        >;

        return (
          <div key={i}>
            <h3>{labelMap[x.field]}</h3>
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
