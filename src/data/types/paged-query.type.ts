import { ItemBase } from "./item-base.type";
import { UnionToIntersection } from "@/utils/typescript-utils";

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

type NumberFilterOperators<T> = T extends number
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

export type FilterOperators<T> = UnionToIntersection<
  | ValueFilterOperators<T>
  | StringFilterOperators<T>
  | NumberFilterOperators<T>
  | ArrayFilterOperators<T>
>;

export type FieldFilters<T> = {
  [operator in keyof FilterOperators<T>]?: FilterOperators<T>[operator];
};

export type QueryFilters<TItem extends ItemBase> = {
  [field in Extract<keyof TItem, string>]?: FieldFilters<TItem[field]>;
};

export type PagedQuery<TItem extends ItemBase> = {
  sortBy: string & keyof TItem;
  sortAscending: boolean;
  pageSize: number;
  pageNumber: number;

  filters: QueryFilters<TItem>;
};
