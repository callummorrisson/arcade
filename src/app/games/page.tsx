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
import { useCallback, useState } from "react";
import { SearchModel } from "@/data/models/search.model";

export default function SearchGames() {
  const [initialParams, setInitialParams] = useState<Partial<SearchParams>>();
  const [settings, setSettings] = useState<Partial<SearchSettings>>({});

  const gameService = useDataService((x) => x.games);
  const resultsFunc = useCallback(
    (query: SearchModel) => gameService.search(query),
    [gameService]
  );

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
