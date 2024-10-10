"use client";

import {
  useSearchParams,
  useSearchParamsUpdater,
  useSearchResults,
} from "../search-store";
import { IoMdArrowDropleft, IoMdArrowDropright } from "react-icons/io";
import style from "./pagination.module.scss";
import Dropdown from "@/components/dropdown";

const PAGE_SIZES = [3, 12, 24, 60, 120];

export default function Pagination() {
  const [totalResults] = useSearchResults((x) => [
    x.totalResults,
  ]);
  const [pageNumber, pageSize] = useSearchParams((x) => [ x.pageNumber, x.pageSize ]);
  const updateParams = useSearchParamsUpdater();

  const numPages = Math.ceil(totalResults / pageSize);
  const firstItem = pageSize * (pageNumber - 1) + 1;
  const lastItem = Math.min(totalResults, firstItem + pageSize - 1);

  // todo, stop being lazy, this needs thought
  const pages = Array.from({ length: numPages + 1 }, (_, i) =>
    numPages <= 9 || // always show atleast 9
    i === 1 || // first page
    i === numPages || // last page
    (i >= pageNumber - 2 && i <= pageNumber + 2) || // current page and 2 on either side
    (i === 2 && pageNumber === 5) || // don't show an elipses for a single number
    (i === numPages - 1 && pageNumber === numPages - 4) // don't show an elipses for a single number
      ? i
      : null
  ).filter((x, i, a) => x || a[i - 1]);

  return (
    <div className={style.pagination}>
      <div className={style.total}>
        {firstItem} - {lastItem} of {totalResults}
      </div>
      <div className={style.pages}>
        <button
          className={`${style.page} ${style["page-prev"]}`}
          disabled={pageNumber === 1}
          onClick={() => updateParams({ pageNumber: pageNumber - 1 })}
        >
          <IoMdArrowDropleft />
        </button>
        {pages.map((x, i) =>
          x ? (
            <button
              onClick={() => updateParams({ pageNumber: x })}
              key={i}
              className={`${style.page} ${
                x === pageNumber ? style["current-page"] : ""
              }`}
            >
              {x}
            </button>
          ) : (
            <span key={i} className={`${style.page} ${style["page-gap"]}`}>
              …
            </span>
          )
        )}
        <button
          className={`${style.page} ${style["page-next"]}`}
          disabled={pageNumber === numPages}
          onClick={() => updateParams({ pageNumber: pageNumber + 1 })}
        >
          <IoMdArrowDropright />
        </button>
      </div>
      <div className={style["page-size"]}>
        <Dropdown<number>
          items={PAGE_SIZES.map((x) => ({ label: x, value: x }))}
          selected={pageSize}
          onChange={(val) => updateParams({ pageSize: val, pageNumber: 1 })}
        />
      </div>
    </div>
  );
}
