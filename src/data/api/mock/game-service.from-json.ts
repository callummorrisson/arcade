import GameDetailsModel from "@/data/models/game-details.model";
import GameServiceContract from "../game-service.contract";
import { SearchModel } from "@/data/models/search.model";
import { SearchResultsModel } from "@/data/models/search-results.model";
import GameDatabaseModel from "@/data/models/game-database.model";

export class GameServiceFromJson implements GameServiceContract {
  baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  getAll(): Promise<GameDetailsModel[]> {
    return this.getFromJson();
  }

  async search(query: SearchModel): Promise<SearchResultsModel> {
    const data = await this.getFromJson();

    let keywordMatches: typeof data;
    if (query.keywords) {
      // note: this is pretty rubbish performance wise, will have to revisist if dataset gets too big.
      const keywords = query.keywords.trim().split(' ').filter(x => x).map(x => x.toLowerCase());
      keywordMatches = data.filter(x => keywords.every(k => x.name.toLowerCase().includes(k) || x.description.toLowerCase().includes(k)));
    } else {
      keywordMatches = data;
    }

    const filtered = keywordMatches.filter((x) =>
      Object.entries(query.filters).every(([field, filters]) =>
        Object.entries(filters).every(([operator, filterValue]) => {
          const val = x[field as keyof GameDetailsModel];

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
            // number | Date
            case "min":
              return (filterValue as Date | number) <= (val as Date | number);
            case "max":
              return (filterValue as Date | number) >= (val as Date | number);
            default:
              throw `No mock handler for ${operator as string}`;
          }
        })
      )
    ) as GameDetailsModel[];
    const results = filtered.toSorted(
      (a, b, sortBy = query.sortBy, sortDir = query.sortAscending ? 1 : -1) =>
        a[sortBy]! > b[sortBy]!
          ? sortDir
          : a[sortBy]! < b[sortBy]!
            ? -sortDir
            : 0
    );

    const total = results.length;
    const startIndex = query.pageSize * (query.pageNumber - 1);
    const endIndex = startIndex + query.pageSize;
    const pagedResults = results.slice(startIndex, endIndex);
    const model: SearchResultsModel = {
      pageNumber: query.pageNumber,
      results: pagedResults,
      totalResults: total,
    };

    return model;
  }

  async getGameDetails(gameId: string): Promise<GameDetailsModel | undefined> {
    const all = await this.getFromJson();
    return all.find((x) => x.id === gameId);
  }

  async getFromJson(): Promise<GameDetailsModel[]> {
    const json = await fetch(`${this.baseUrl}/games.db.json`);
    const data: GameDatabaseModel[] = await json.json();

    // replacement of createdDate string with Date
    return data.map<GameDetailsModel>((x) => ({
      ...x,
      createdDate: new Date(x.createdDate),
    }));
  }
}
