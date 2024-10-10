"use client";

import { SearchResultsModel } from "@/data/models/search-results.model";
import {
  FieldFilters,
  FilterOperators,
  SearchModel,
  QueryFilters,
} from "@/data/models/search.model";
import {
  ReadonlyURLSearchParams,
  usePathname,
  useSearchParams as useURLSearchParams,
} from "next/navigation";
import { useEffect } from "react";
import createStore, { Store } from "@/utils/create-store";
import GameDetailsModel from "@/data/models/game-details.model";

const STORAGE_KEY = "product-list-params"; // params key for local storage

// lookup for common query string params
enum UrlQueryParam {
  PageSize = "page-size",
  PageNumber = "page-num",
  SortBy = "sort-by",
  SortDirection = "sort-dir",
  Display = "display",
}

export interface SearchParams extends SearchModel {
  display: "list" | "grid";
}

export interface SearchResults extends SearchResultsModel {
  isLoading: boolean;
}

const SearchParamsStore = createStore<SearchParams>();

const ResultsStore = createStore<SearchResults>();

export function useSearchParams<TResults>(
  accessor: (store: SearchParams) => TResults
): TResults {
  return SearchParamsStore.useStore(accessor);
}

export function useSearchParamsUpdater() {
  return SearchParamsStore.useStoreUpdater();
}

export function useSearchResults<TResults>(
  accessor: (store: SearchResults) => TResults
) {
  return (ResultsStore as Store<SearchResults>).useStore(accessor);
}

export function useProductResultsUpdater() {
  return ResultsStore.useStoreUpdater();
}

export function SearchProvider({
  children,
  initialParams,
  resultsFunc,
}: Readonly<{
  children: React.ReactNode;
  initialParams?: Partial<SearchParams>;
  resultsFunc: (query: SearchModel) => Promise<SearchResultsModel>;
}>) {
  const searchParams = useURLSearchParams();
  const initialValue = getInitialParams(searchParams, initialParams);
  return (
    <SearchParamsStore.Provider initialValue={initialValue as SearchParams}>
      <ResultsStore.Provider initialValue={getInitialResults()}>
        <StateManager resultsFunc={resultsFunc} />
        {children}
      </ResultsStore.Provider>
    </SearchParamsStore.Provider>
  );
}

function getInitialResults(): SearchResults {
  return {
    isLoading: false,
    results: [],
    pageNumber: 1,
    totalResults: 0,
  };
}

function StateManager({
  resultsFunc,
}: Readonly<{
  resultsFunc: (query: SearchModel) => Promise<SearchResultsModel>;
}>) {
  const searchParams = useSearchParams((x: SearchParams) => x);
  const resultsUpdater = useProductResultsUpdater();
  const pathname = usePathname();

  useEffect(() => {
    let isStale = false;

    // debounced call to resultsFunc
    const timeoutId = setTimeout(() => {
      resultsUpdater({ isLoading: true });
      resultsFunc(searchParams).then((val) => {
        if (isStale) return;
        resultsUpdater({
          isLoading: false,
          results: val.results,
          pageNumber: val.pageNumber,
          totalResults: val.totalResults,
        });
      });
    }, 250);

    return () => {
      isStale = true;
      clearTimeout(timeoutId);
    };
  }, [resultsFunc, resultsUpdater, searchParams]);

  // update url query string on filters change
  useEffect(() => {
    const urlSearchParams = new URL(window.location.toString()).searchParams;
    const current = new URLSearchParams(
      // remove existing filters
      Array.from(urlSearchParams.entries()).filter(
        (x) => !x[0].startsWith("f-")
      )
    );

    let field: keyof typeof searchParams.filters;
    for (field in searchParams.filters) {
      const fieldFilters = searchParams.filters[field]!;

      let operator: Extract<keyof typeof fieldFilters, string>;
      for (operator in fieldFilters) {
        const key = `f-${field}-${operator}`;
        const value = searchParams.filters[field]![operator];
        current.set(key, JSON.stringify(value));
      }
    }

    updateUrlQueryString(pathname, current);
  }, [searchParams.filters]);

  // update url query string and localStorage when display, sorting, or paging options change
  useEffect(() => {
    const urlSearchParams = new URL(window.location.toString()).searchParams;
    const current = new URLSearchParams(Array.from(urlSearchParams.entries()));

    const { display, sortBy, sortAscending, pageSize, pageNumber } =
      searchParams;

    current.set(UrlQueryParam.Display, display);
    current.set(UrlQueryParam.SortBy, sortBy);
    current.set(UrlQueryParam.SortDirection, sortAscending ? "asc" : "desc");
    current.set(UrlQueryParam.PageSize, pageSize.toString());
    current.set(UrlQueryParam.PageNumber, pageNumber.toString());

    updateUrlQueryString(pathname, current);

    // note: pageNumber makes no sense as a "default", so don't put it in localStorage
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ display, sortBy, sortAscending, pageSize })
    );
  }, [
    searchParams.display,
    searchParams.sortBy,
    searchParams.sortAscending,
    searchParams.pageSize,
    searchParams.pageNumber,
  ]);

  return <></>;
}

function updateUrlQueryString(pathname: string, searchParams: URLSearchParams) {
  const search = searchParams.toString();
  const query = search ? `?${search}` : "";

  const newUrl = pathname + query;

  window.history.replaceState(
    { ...window.history.state, as: newUrl, url: newUrl },
    "",
    newUrl
  );
}

function getInitialParams(
  urlQueryParams: ReadonlyURLSearchParams,
  overrideParams?: Partial<SearchParams>
): SearchParams {
  const defaultParams: SearchParams = {
    display: "grid",
    filters: {},
    pageNumber: 1,
    pageSize: 12,
    sortAscending: true,
    sortBy: "name",
  };

  const storedParams = readParamsFromLocalStorageOrDefault();
  const urlParams = readParamsFromUrlQuery(urlQueryParams);
  return { ...defaultParams, ...storedParams, ...urlParams, ...overrideParams };
}

function readParamsFromLocalStorageOrDefault(): Partial<SearchParams> {
  const paramsJson = localStorage.getItem(STORAGE_KEY);
  let params: Partial<SearchParams> = {};
  try {
    if (paramsJson !== null) params = JSON.parse(paramsJson);
  } catch {
    // cleanup invalid storage entry
    localStorage.removeItem(STORAGE_KEY);
  }

  return params;
}

function readParamsFromUrlQuery(
  urlQueryParams: ReadonlyURLSearchParams
): Partial<SearchParams> {
  const result: Partial<SearchParams> = {};
  const filters = readFilterValuesFromUrlQuery(urlQueryParams);
  result.filters = filters;

  if (urlQueryParams.has(UrlQueryParam.Display)) {
    // todo bad "any", should validate properly
    result.display = urlQueryParams.get(UrlQueryParam.Display)! as
      | "list"
      | "grid";
  }

  if (urlQueryParams.has(UrlQueryParam.SortBy)) {
    // todo bad "any", should validate properly
    result.sortBy = urlQueryParams.get(UrlQueryParam.SortBy)! as string &
      keyof GameDetailsModel;
  }

  if (urlQueryParams.has(UrlQueryParam.SortDirection)) {
    result.sortAscending =
      urlQueryParams.get(UrlQueryParam.SortDirection) == "desc" ? false : true;
  }

  const pageNumber = parseInt(urlQueryParams.get(UrlQueryParam.PageNumber)!);
  if (pageNumber > 0) {
    result.pageNumber = pageNumber;
  }

  const pageSize = parseInt(urlQueryParams.get(UrlQueryParam.PageSize)!);
  if (pageSize > 0) {
    result.pageSize = pageSize;
  }

  return result;
}

function readFilterValuesFromUrlQuery(
  urlQueryParams: ReadonlyURLSearchParams
): QueryFilters {
  const result: QueryFilters = {};
  for (const [key, value] of urlQueryParams.entries()) {
    // currently assuming product fields are NOT kebab case...
    // filter field eg: f-price-min
    const split = key.split("-");
    if (split.length !== 3 || split[0] !== "f") continue;
    const [_, field, operator] = split as [
      string,
      Extract<keyof GameDetailsModel, string>,
      Extract<keyof FilterOperators<GameDetailsModel[keyof GameDetailsModel]>, string>
    ];

    try {
      debugger;
      // todo better error handling
      const parsedValue = JSON.parse(value);
      // todo `typeof field` is always string isn't it? doesn't matter, here, but pretty sure this is wrong
      const fieldObj: FieldFilters<GameDetailsModel[typeof field]> =
        result[field] || (result[field] = {});
      fieldObj[operator] = parsedValue;
    } catch {}
  }

  return result;
}
