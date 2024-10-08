import GameDetailsModel from "@/data/models/game-details.model";
import GameServiceContract from "../game-service.contract";
import {
  FieldFilters,
  FilterOperators,
  PagedQuery,
} from "@/data/types/paged-query.type";
import { PagedResult } from "@/data/types/paged-result.type";
import { ItemBase } from "@/data/types/item-base.type";

export class GameServiceFromJson implements GameServiceContract {
  #baseUrl: string;

  constructor(baseUrl: string) {
    this.#baseUrl = baseUrl;
  }

  getAll(): Promise<GameDetailsModel[]> {
    return this.#getFromJson();
  }

  async search(
    query: PagedQuery<GameDetailsModel>
  ): Promise<PagedResult<GameDetailsModel>> {
    const data = await this.#getFromJson();
    const results = await this.#performPagedQuery(data, query);
    return results;
  }

  async getGameDetails(gameId: string): Promise<GameDetailsModel | undefined> {
    const all = await this.#getFromJson();
    return all.find((x) => x.id === gameId);
  }

  async #getFromJson(): Promise<GameDetailsModel[]> {
    const json = await fetch(`${this.#baseUrl}/games.db.json`);
    const data: GameDetailsModel[] = await json.json();
    return data;
  }

  async #performPagedQuery<TItem extends ItemBase>(
    data: TItem[],
    query: PagedQuery<TItem>
  ): Promise<PagedResult<TItem>> {
    type QFEntries = {
      [K in keyof TItem]: [K, FieldFilters<TItem[K]>];
    }[keyof TItem][];

    type FFEntries<T> = {
      [K in keyof FilterOperators<T>]: [K, FilterOperators<T>[K]];
    }[keyof FilterOperators<T>][];

    const filtered = data.filter((x) =>
      (Object.entries(query.filters) as QFEntries).every(([field, filters]) =>
        (Object.entries(filters) as FFEntries<TItem[typeof field]>).every(
          ([operator, filterValue]) => {
            const val = x[field];

            // exclude null/empty when a filter is applied
            if (val === null || val === undefined) return false;

            // array filters
            if (val instanceof Array) {
              switch (operator) {
                case "contains":
                  return val.includes(filterValue);
                case "containsAll":
                  return (filterValue as typeof val).every(val.includes);
                case "doesNotContainAny":
                  return !(filterValue as typeof val).every(val.includes);
                default:
                  throw `No mock handler for ${operator as string}`;
              }
            }

            // value filters
            switch (operator) {
              case "isOneOf":
                return (filterValue! as (typeof val)[]).includes(val);
              case "isNotOneOf":
                return !(filterValue! as (typeof val)[]).includes(val);
              case "equals":
                return filterValue === val;
              // string
              case "contains":
                return (val as string).includes(filterValue as string);
              // number
              case "min":
                return (filterValue as number) <= (val as number);
              case "max":
                return (filterValue as number) >= (val as number);
              default:
                throw `No mock handler for ${operator as string}`;
            }
          }
        )
      )
    ) as TItem[];
    const results = filtered.toSorted(
      (a, b, sortBy = query.sortBy, sortDir = query.sortAscending ? 1 : -1) =>
        a[sortBy] > b[sortBy] ? sortDir : a[sortBy] < b[sortBy] ? -sortDir : 0
    );

    const total = results.length;
    const startIndex = query.pageSize * (query.pageNumber - 1);
    const endIndex = startIndex + query.pageSize;
    const pagedResults = results.slice(startIndex, endIndex);
    const model: PagedResult<TItem> = {
      pageNumber: query.pageNumber,
      results: pagedResults,
      totalResults: total,
    };

    return model;
  }
}
