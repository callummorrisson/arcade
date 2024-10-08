"use client";

import Pagination from "./pagination";
import Results from "./results";
import Sidebar from "./sidebar";
import Topbar from "./topbar";
import style from "./search.module.scss";
import { PagedQuery } from "@/data/types/paged-query.type";
import { ItemBase } from "@/data/types/item-base.type";
import { PagedResult } from "@/data/types/paged-result.type";
import { SearchParams, SearchProvider } from "./search-store";
import {
  SearchSettings,
  SearchSettingsProvider,
} from "./settings-store";

type SearchProps<TItem extends ItemBase> = {
  resultsFunc: (query: PagedQuery<TItem>) => Promise<PagedResult<TItem>>;
  initialParams?: Partial<SearchParams<TItem>>;
} & Partial<SearchSettings<TItem>>;

export function Search<TItem extends ItemBase>({
  resultsFunc,
  initialParams,
  ...settings
}: Readonly<SearchProps<TItem>>) {
  return (
    <SearchProvider resultsFunc={resultsFunc} initialParams={initialParams}>
      <SearchSettingsProvider settings={settings}>
        <div className={style.search}>
          <div className={style.sidebar}>
            <Sidebar />
          </div>
          <div className={style.topbar}>
            <Topbar />
          </div>
          <div className={style.results}>
            <Results />
          </div>
          <div className={style.pagination}>
            <Pagination />
          </div>
        </div>
      </SearchSettingsProvider>
    </SearchProvider>
  );
}
