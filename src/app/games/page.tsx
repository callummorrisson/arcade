"use client";

import Pagination from "./_components/pagination";
import Results from "./_components/results";
import Sidebar from "./_components/sidebar";
import Topbar from "./_components/topbar";
import styles from "./page.module.scss";
import useDataService from "@/data/api/use-data-service";
import { SearchParams, SearchProvider } from "./_components/search-store";
import { SearchSettings, SearchSettingsProvider } from "./_components/settings-store";
import { Suspense, useCallback, useEffect, useState } from "react";
import { SearchModel } from "@/data/models/search.model";
import FilterBuilder from "./_components/filterbuilder";
import Filters from "./_components/filters";


const filterbuilder = (builder: FilterBuilder) => {
  builder.clear();
  builder.add('createdDate', Filters.MinMaxDate);
}

export default function SearchGames() {
  // todo params and settings
  const [initialParams, _setInitialParams] = useState<Partial<SearchParams>>();
  const [settings, _setSettings] = useState<Partial<SearchSettings>>({ filters: filterbuilder });

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
          <div className={styles.search}>
            <div className={styles.sidebar}>
              <Sidebar />
            </div>
            <div className={styles.topbar}>
              <Topbar />
            </div>
            <div className={styles.results}>
              <Results />
            </div>
            <div className={styles.pagination}>
              <Pagination />
            </div>
          </div>
        </SearchSettingsProvider>
      </SearchProvider>
    </Suspense>
  );
}
