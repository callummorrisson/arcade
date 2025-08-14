"use client";

import { SearchResultsModel } from "@/data/models/search-results.model";
import { SearchModel, QueryFilters } from "@/data/models/search.model";
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
export enum SearchUrlQueryParam {
  PageSize = "page-size",
  PageNumber = "page-num",
  SortBy = "sort-by",
  SortDirection = "sort-dir",
  Display = "display",
  Keywords = "keywords"
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
    <SearchParamsStore.Provider initialValue={initialValue}>
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
  const { display, sortBy, sortAscending, pageSize, pageNumber, filters, keywords } =
    useSearchParams((x: SearchParams) => x);
  const resultsUpdater = useProductResultsUpdater();
  const pathname = usePathname();

  // retrieve and update search results on SearchModel change
  useEffect(() => {
    let isStale = false;

    // debounced call to resultsFunc
    const timeoutId = setTimeout(() => {
      resultsUpdater({ isLoading: true });
      resultsFunc({
        sortBy,
        sortAscending,
        pageSize,
        pageNumber,
        filters,
        keywords,
      }).then((val) => {
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
  }, [
    resultsFunc,
    resultsUpdater,

    // note: specifically excluding 'display'
    sortBy,
    sortAscending,
    pageSize,
    pageNumber,
    filters,
    keywords
  ]);

  // update url query string on keywords change
  useEffect(() => {
    const urlSearchParams = new URL(window.location.toString()).searchParams;
    let current: URLSearchParams;

    if (keywords) {
      current = new URLSearchParams(Array.from(urlSearchParams.entries()));
      current.set(SearchUrlQueryParam.Keywords, keywords);
    } else {
      current =
        new URLSearchParams(
          Array.from(urlSearchParams.entries()).filter((x) => x[0] !== SearchUrlQueryParam.Keywords)
        );
    }

    updateUrlQueryString(pathname, current);
  }, [pathname, keywords]);

  // update url query string on filters change
  useEffect(() => {
    const urlSearchParams = new URL(window.location.toString()).searchParams;
    const current = new URLSearchParams(
      // remove existing filters
      Array.from(urlSearchParams.entries()).filter(
        (x) => !x[0].startsWith("f-")
      )
    );

    let field: keyof typeof filters;
    for (field in filters) {
      const fieldFilters = filters[field]!;

      for (const operator in fieldFilters) {
        const key = `f-${field}-${operator}`;
        const value = filters[field]![operator as keyof typeof fieldFilters];
        current.set(key, JSON.stringify(value));
      }
    }

    updateUrlQueryString(pathname, current);
  }, [pathname, filters]);

  // update url query string and localStorage when display, sorting, or paging options change
  useEffect(() => {
    const urlSearchParams = new URL(window.location.toString()).searchParams;
    const current = new URLSearchParams(Array.from(urlSearchParams.entries()));

    current.set(SearchUrlQueryParam.Display, display);
    current.set(SearchUrlQueryParam.SortBy, sortBy);
    current.set(SearchUrlQueryParam.SortDirection, sortAscending ? "asc" : "desc");
    current.set(SearchUrlQueryParam.PageSize, pageSize.toString());
    current.set(SearchUrlQueryParam.PageNumber, pageNumber.toString());

    updateUrlQueryString(pathname, current);

    // note: pageNumber makes no sense as a "default", so don't put it in localStorage
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ display, sortBy, sortAscending, pageSize })
    );
  }, [pathname, display, sortBy, sortAscending, pageSize, pageNumber]);

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
    keywords: "",
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
  // guard against intrusive nextjs SSR. apparently it's impossible to turn that shit off.
  if (typeof window === "undefined" || !window.localStorage) return {};

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

  if (urlQueryParams.has(SearchUrlQueryParam.Keywords)) {
    result.keywords = urlQueryParams.get(SearchUrlQueryParam.Keywords)!;
  }

  if (urlQueryParams.has(SearchUrlQueryParam.Display)) {
    result.display = urlQueryParams.get(SearchUrlQueryParam.Display)! as
      | "list"
      | "grid";
  }

  if (urlQueryParams.has(SearchUrlQueryParam.SortBy)) {
    result.sortBy = urlQueryParams.get(SearchUrlQueryParam.SortBy)! as string &
      keyof GameDetailsModel;
  }

  if (urlQueryParams.has(SearchUrlQueryParam.SortDirection)) {
    result.sortAscending =
      urlQueryParams.get(SearchUrlQueryParam.SortDirection) == "desc" ? false : true;
  }

  const pageNumber = parseInt(urlQueryParams.get(SearchUrlQueryParam.PageNumber)!);
  if (pageNumber > 0) {
    result.pageNumber = pageNumber;
  }

  const pageSize = parseInt(urlQueryParams.get(SearchUrlQueryParam.PageSize)!);
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

    try {
      const parsedValue = JSON.parse(value);

      const field = split[1] as keyof typeof result;
      // todo: this is gross..
      const fieldObj: Record<string, unknown> = result[field] || (result[field] = {});
      const operator = split[2];

      fieldObj[operator] = parsedValue;
    } catch {
      // todo consider better error handling
    }
  }

  return result;
}
