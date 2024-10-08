import { ItemBase } from "./item-base.type";

export type PagedResult<TGame extends ItemBase> = {
  results: TGame[];
  totalResults: number;
  pageNumber: number;
}