"use client";

import { PagedResult } from "@/data/types/paged-result.type";
import {
  FieldFilters,
  FilterOperators,
  PagedQuery,
  QueryFilters,
} from "@/data/types/paged-query.type";
import { ItemBase } from "@/data/types/item-base.type";
import {
  ReadonlyURLSearchParams,
  usePathname,
  useSearchParams as useURLSearchParams,
} from "next/navigation";
import { useEffect } from "react";
import createStore, { Store } from "@/utils/create-store";

const STORAGE_KEY = "product-list-params"; // params key for local storage

// lookup for common query string params
enum UrlQueryParam {
  PageSize = "page-size",
  PageNumber = "page-num",
  SortBy = "sort-by",
  SortDirection = "sort-dir",
  Display = "display",
}

export interface SearchParams<TItem extends ItemBase>
  extends PagedQuery<TItem> {
  display: "list" | "grid";
  displayTemplates: {list?: React.FC<TItem>, grid?: React.FC<TItem> }
}

export interface SearchResults<TItem extends ItemBase>
  extends PagedResult<TItem> {
  isLoading: boolean;
}

const SearchParamsStore = createStore<SearchParams<ItemBase>>();

const ResultsStore = createStore<SearchResults<ItemBase>>();

export function useSearchParams<
  TItem extends ItemBase,
  TResults
>(accessor: (store: SearchParams<TItem>) => TResults): TResults {
  return (SearchParamsStore as Store<SearchParams<TItem>>).useStore(accessor);
}

export function useSearchParamsUpdater<TItem extends ItemBase = ItemBase>() {
  return (SearchParamsStore as Store<SearchParams<TItem>>).useStoreUpdater();
}

export function useSearchResults<TItem extends ItemBase, TResults>(
  accessor: (store: SearchResults<TItem>) => TResults
) {
  return (ResultsStore as Store<SearchResults<TItem>>).useStore(accessor);
}

export function useProductResultsUpdater<TItem extends ItemBase = ItemBase>() {
  return (ResultsStore as Store<SearchResults<TItem>>).useStoreUpdater();
}

export function SearchProvider<TItem extends ItemBase>({
  children,
  initialParams,
  resultsFunc,
}: Readonly<{
  children: React.ReactNode;
  initialParams?: Partial<SearchParams<TItem>>;
  resultsFunc: (query: PagedQuery<TItem>) => Promise<PagedResult<TItem>>;
}>) {
  const searchParams = useURLSearchParams();
  const initialValue = getInitialParams<TItem>(searchParams, initialParams);
  return (
    <SearchParamsStore.Provider initialValue={initialValue as SearchParams<ItemBase>}>
      <ResultsStore.Provider initialValue={getInitialResults()}>
        <StateManager<TItem> resultsFunc={resultsFunc} />
        {children}
      </ResultsStore.Provider>
    </SearchParamsStore.Provider>
  );
}

function getInitialResults<TItem extends ItemBase>(): SearchResults<TItem> {
  return {
    isLoading: false,
    results: [],
    pageNumber: 1,
    totalResults: 0,
  };
}

function StateManager<TItem extends ItemBase>({
  resultsFunc,
}: Readonly<{
  resultsFunc: (query: PagedQuery<TItem>) => Promise<PagedResult<TItem>>;
}>) {
  const searchParams = useSearchParams((x: SearchParams<TItem>) => x);
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
      const fieldFilters: FieldFilters<TItem[typeof field]> =
        searchParams.filters[field]!;

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

function getInitialParams<TItem extends ItemBase>(
  urlQueryParams: ReadonlyURLSearchParams,
  overrideParams?: Partial<SearchParams<TItem>>
): SearchParams<TItem> {
  const defaultParams: SearchParams<TItem> = {
    display: "grid",
    displayTemplates: { },
    filters: {},
    pageNumber: 1,
    pageSize: 12,
    sortAscending: true,
    sortBy: "name",
  };

  const storedParams = readParamsFromLocalStorageOrDefault<TItem>();
  const urlParams = readParamsFromUrlQuery<TItem>(urlQueryParams);
  return { ...defaultParams, ...storedParams, ...urlParams, ...overrideParams };
}

function readParamsFromLocalStorageOrDefault<TItem extends ItemBase>(): Partial<
  SearchParams<TItem>
> {
  const paramsJson = localStorage.getItem(STORAGE_KEY);
  let params: Partial<SearchParams<TItem>> = {};
  try {
    if (paramsJson !== null) params = JSON.parse(paramsJson);
  } catch {
    // cleanup invalid storage entry
    localStorage.removeItem(STORAGE_KEY);
  }

  return params;
}

function readParamsFromUrlQuery<TItem extends ItemBase>(
  urlQueryParams: ReadonlyURLSearchParams
): Partial<SearchParams<TItem>> {
  const result: Partial<SearchParams<TItem>> = {};
  const filters = readFilterValuesFromUrlQuery<TItem>(urlQueryParams);
  result.filters = filters;

  if (urlQueryParams.has(UrlQueryParam.Display)) {
    // todo bad "any", should validate properly
    result.display = urlQueryParams.get(UrlQueryParam.Display)! as "list" | "grid";
  }

  if (urlQueryParams.has(UrlQueryParam.SortBy)) {
    // todo bad "any", should validate properly
    result.sortBy = urlQueryParams.get(UrlQueryParam.SortBy)! as (string & keyof TItem);
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

function readFilterValuesFromUrlQuery<TItem extends ItemBase>(
  urlQueryParams: ReadonlyURLSearchParams
): QueryFilters<TItem> {
  const result: QueryFilters<TItem> = {};
  for (const [key, value] of urlQueryParams.entries()) {
    // currently assuming product fields are NOT kebab case...
    // filter field eg: f-price-min
    const split = key.split("-");
    if (split.length !== 3 || split[0] !== "f") continue;
    const [_, field, operator] = split as [
      string,
      Extract<keyof TItem, string>,
      Extract<keyof FilterOperators<TItem[keyof TItem]>, string>
    ];

    try {
      // todo better error handling
      const parsedValue = JSON.parse(value);
      const fieldObj: FieldFilters<TItem[typeof field]> =
        result[field] || (result[field] = {});
      fieldObj[operator] = JSON.parse(parsedValue);
    } catch {}
  }

  return result;
}
