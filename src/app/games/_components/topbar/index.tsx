"use client";

import { IoGridOutline } from "react-icons/io5";
import { TfiLayoutListThumb } from "react-icons/tfi";
import { FaSortAmountDownAlt, FaSortAmountDown } from "react-icons/fa";

import {
  SearchParams,
  useSearchParams,
  useSearchParamsUpdater,
} from "../search-store";
import style from "./topbar.module.scss";
import Dropdown from "@/components/dropdown";
import { SearchSettings, useSearchSettings } from "../settings-store";

export default function Topbar() {
  const [sortOptions, labelMap] = useSearchSettings(
    (x: SearchSettings) => [x.sortOptions, x.labelMap]
  );
  const [display, sortBy, sortAscending] = useSearchParams(
    (x: SearchParams) => [x.display, x.sortBy, x.sortAscending]
  );
  const updateParams = useSearchParamsUpdater();

  const sortList = sortOptions.map((x) => ({ label: labelMap[x], value: x }));

  return (
    <div className={style.topbar}>
      <div className={style.display}>
        <label>
          <input
            type="radio"
            value="grid"
            name="display-type"
            onChange={() => updateParams({ display: "grid" })}
            checked={display === "grid"}
          />
          <IoGridOutline />
        </label>
        <label>
          <input
            type="radio"
            value="list"
            name="display-type"
            onChange={() => updateParams({ display: "list" })}
            checked={display === "list"}
          />
          <TfiLayoutListThumb />
        </label>
      </div>

      <div className={style.sort}>
        <Dropdown
          items={sortList}
          onChange={(val) => updateParams({ sortBy: val, pageNumber: 1 })}
          selected={sortBy}
        />
        <label className={style.checkbox}>
          <input
            type="checkbox"
            checked={sortAscending}
            onChange={(e) =>
              updateParams({
                sortAscending: e.currentTarget.checked,
                pageNumber: 1,
              })
            }
          />
          {sortAscending ? <FaSortAmountDownAlt /> : <FaSortAmountDown />}
        </label>
      </div>
    </div>
  );
}
