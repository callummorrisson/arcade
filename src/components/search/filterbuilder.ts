import { FieldFilters } from "@/data/types/paged-query.type";
import { ItemBase } from "@/data/types/item-base.type";

export type FilterComponent<T> = React.FC<{
  value: FieldFilters<T>;
  onChange: (filter: FieldFilters<T>) => void;
}>;

export default interface FilterBuilder<TItem extends ItemBase> {
  clear(): this;
  add<TField extends Extract<keyof TItem, string>>(
    field: TField,
    component: FilterComponent<TItem[TField]>
  ): this;
}

export type FilterDefinition<TItem extends ItemBase> = {
  [TField in Extract<keyof TItem, string>]-?: {
    field: TField;
    component: FilterComponent<TItem[TField]>;
  };
}[Extract<keyof TItem, string>];

export function unwrapFilterBuilder<TItem extends ItemBase>(
  filters?: (builder: FilterBuilder<TItem>) => void
): FilterDefinition<TItem>[] {
  const builder = new Builder<TItem>();
  filters?.(builder);
  return builder.filters;
}

// todo maybe don't need?
const DEFAULT_FILTERS: FilterDefinition<ItemBase>[] = [];

class Builder<TItem extends ItemBase> implements FilterBuilder<TItem> {
  filters: FilterDefinition<TItem>[] =
    DEFAULT_FILTERS as unknown as FilterDefinition<TItem>[];

  clear() {
    this.filters = [];
    return this;
  }

  add<TField extends Extract<keyof TItem, string>>(
    field: TField,
    component: FilterComponent<TItem[TField]>
  ) {
    this.filters.push({
      field,
      component,
    } as FilterDefinition<TItem>);
    return this;
  }
}
