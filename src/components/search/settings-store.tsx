import { ItemBase } from "@/data/types/item-base.type";
import FilterBuilder from "./filterbuilder";
import createStore, { Store } from "@/utils/create-store";

export type LabelMap<TItem extends ItemBase> = {
  [field in keyof TItem]: string;
};

export type SortOptions<TItem extends ItemBase> = (string & keyof TItem)[];

// use the fieldName
const DEFAULT_LABELMAP = new Proxy(
  {},
  {
    get(target, fieldName) {
      return fieldName;
    },
  }
);

const DEFAULT_SORTOPTIONS: SortOptions<ItemBase> = ["name"];

export type SearchSettings<TItem extends ItemBase> = {
  labelMap: LabelMap<TItem>;
  sortOptions: SortOptions<TItem>;
  filters?: (builder: FilterBuilder<TItem>) => void;
};

const SettingsStore = createStore<SearchSettings<ItemBase>>();

export function useSearchSettings<TItem extends ItemBase, TResults>(
  accessor: (store: SearchSettings<TItem>) => TResults
): TResults {
  return (SettingsStore as Store<SearchSettings<TItem>>).useStore(accessor);
}

export function useSearchSettingsUpdater<TItem extends ItemBase = ItemBase>() {
  return (SettingsStore as Store<SearchSettings<TItem>>).useStoreUpdater();
}

export function SearchSettingsProvider<TItem extends ItemBase>({
  children,
  settings,
}: {
  children: React.ReactNode;
  settings: Partial<SearchSettings<TItem>>;
}) {
  const actualSettings: SearchSettings<TItem> = {
    filters: settings.filters,
    labelMap: settings.labelMap ?? (DEFAULT_LABELMAP as LabelMap<TItem>),
    sortOptions: settings.sortOptions ?? DEFAULT_SORTOPTIONS,
  };

  return (
    <SettingsStore.Provider
      initialValue={actualSettings as SearchSettings<ItemBase>}
    >
      {children}
    </SettingsStore.Provider>
  );
}
