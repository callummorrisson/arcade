"use client";

import Pagination from "./_components/pagination";
import Results from "./_components/results";
import Sidebar from "./_components/sidebar";
import Topbar from "./_components/topbar";
import style from "./page.module.scss";
import useDataService from "@/data/api/use-data-service";
import { SearchParams, SearchProvider } from "./_components/search-store";
import {
  SearchSettings,
  SearchSettingsProvider,
} from "./_components/settings-store";
import { Suspense, useCallback, useState } from "react";
import { SearchModel } from "@/data/models/search.model";

export default function SearchGames() {
  // todo params and settings
  const [initialParams, _setInitialParams] = useState<Partial<SearchParams>>();
  const [settings, _setSettings] = useState<Partial<SearchSettings>>({});

  const gameService = useDataService((x) => x.games);
  const resultsFunc = useCallback(
    (query: SearchModel) => gameService.search(query),
    [gameService]
  );

  return (
    // todo figure out what this <Suspense> is actually doing. 
    //      default eslint rule is forcing us to use it, but it should work without.
    <Suspense>
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
    </Suspense>
  );
}
