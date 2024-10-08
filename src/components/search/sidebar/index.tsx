"use client";

import style from "./sidebar.module.scss";
import { unwrapFilterBuilder } from "../filterbuilder";
import { useRef } from "react";
import { FieldFilters } from "@/data/types/paged-query.type";
import {
  SearchParams,
  useSearchParams,
  useSearchParamsUpdater,
} from "../search-store";
import { SearchSettings, useSearchSettings } from "../settings-store";
import { ItemBase } from "@/data/types/item-base.type";

export default function Sidebar<TItem extends ItemBase>() {
  const updateParams = useSearchParamsUpdater<TItem>();
  const filterValues = useSearchParams(
    (x: SearchParams<TItem>) => x.filters
  );
  const [filters, labelMap] = useSearchSettings(
    (x: SearchSettings<TItem>) => [x.filters, x.labelMap]
  );

  const filterDefinitions = useRef(unwrapFilterBuilder<TItem>(filters));

  function handleFilterChange<TField extends Extract<keyof TItem, string>>(
    field: TField,
    newFilters: FieldFilters<TItem[TField]>
  ) {
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
        return (
          <div key={i}>
            <h3>{labelMap[x.field]}</h3>
            <x.component
              onChange={(val) => handleFilterChange(field, val)}
              value={
                filterValues[x.field] ??
                ({} as FieldFilters<TItem[typeof x.field]>)
              }
            />
          </div>
        );
      })}
    </div>
  );
}
