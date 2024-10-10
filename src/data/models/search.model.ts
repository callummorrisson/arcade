import { UnionToIntersection } from "@/utils/typescript-utils";
import GameDetailsModel from "./game-details.model";

export interface SearchModel {
  sortBy: string & keyof GameDetailsModel;
  sortAscending: boolean;
  pageSize: number;
  pageNumber: number;

  filters: QueryFilters;
}

export type QueryFilters = {
  [field in Extract<keyof GameDetailsModel, string>]?: FieldFilters<
    GameDetailsModel[field]
  >;
};

export type FieldFilters<T> = {
  [operator in keyof FilterOperators<T>]?: FilterOperators<T>[operator];
};

export type FilterOperators<T> = UnionToIntersection<
  | ValueFilterOperators<T>
  | StringFilterOperators<T>
  | DateFilterOperators<T>
  | ArrayFilterOperators<T>
>;

type ValueFilterOperators<T> = T extends Array<unknown>
  ? never
  : {
      equals: T;
      isOneOf: Array<T>;
      isNotOneOf: Array<T>;
    };

type StringFilterOperators<T> = T extends string
  ? {
      contains: T;
    }
  : never;

type DateFilterOperators<T> = T extends number
  ? {
      min: T;
      max: T;
    }
  : never;

type ArrayFilterOperators<T> = T extends Array<infer U>
  ? {
      contains: U;
      containsAll: Array<U>;
      doesNotContainAny: Array<U>;
    }
  : never;
