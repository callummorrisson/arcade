import GameDetailsModel from "@/data/models/game-details.model";
import { FieldFilters } from "@/data/models/search.model";

export type FilterComponent<T> = React.FC<{
  value: FieldFilters<T>;
  onChange: (filter: FieldFilters<T>) => void;
}>;

export default interface FilterBuilder {
  clear(): this;
  add<TField extends Extract<keyof GameDetailsModel, string>>(
    field: TField,
    component: FilterComponent<GameDetailsModel[TField]>
  ): this;
}

export type FilterDefinition = {
  [TField in Extract<keyof GameDetailsModel, string>]-?: {
    field: TField;
    component: FilterComponent<GameDetailsModel[TField]>;
  };
}[Extract<keyof GameDetailsModel, string>];

export function unwrapFilterBuilder(
  filters?: (builder: FilterBuilder) => void
): FilterDefinition[] {
  const builder = new Builder();
  filters?.(builder);
  return builder.filters;
}

// todo maybe don't need?
const DEFAULT_FILTERS: FilterDefinition[] = [];

class Builder implements FilterBuilder {
  filters: FilterDefinition[] = DEFAULT_FILTERS;

  clear() {
    this.filters = [];
    return this;
  }

  add<TField extends Extract<keyof GameDetailsModel, string>>(
    field: TField,
    component: FilterComponent<GameDetailsModel[TField]>
  ) {
    this.filters.push({
      field,
      component,
    } as FilterDefinition);
    return this;
  }
}
