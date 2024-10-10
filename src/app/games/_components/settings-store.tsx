import GameDetailsModel from "@/data/models/game-details.model";
import FilterBuilder from "./filterbuilder";
import createStore, { Store } from "@/utils/create-store";

export type LabelMap = {
  [field in keyof GameDetailsModel]: string;
};

export type SortOptions = (string & keyof GameDetailsModel)[];

// use the fieldName
const DEFAULT_LABELMAP = new Proxy(
  {},
  {
    get(target, fieldName) {
      return fieldName;
    },
  }
) as LabelMap;

const DEFAULT_SORTOPTIONS: SortOptions = ["name"];

export type SearchSettings = {
  labelMap: LabelMap;
  sortOptions: SortOptions;
  filters?: (builder: FilterBuilder) => void;
};

const SettingsStore = createStore<SearchSettings>();

export function useSearchSettings<TResults>(
  accessor: (store: SearchSettings) => TResults
): TResults {
  return (SettingsStore as Store<SearchSettings>).useStore(accessor);
}

export function useSearchSettingsUpdater() {
  return (SettingsStore as Store<SearchSettings>).useStoreUpdater();
}

export function SearchSettingsProvider({
  children,
  settings,
}: {
  children: React.ReactNode;
  settings: Partial<SearchSettings>;
}) {
  const actualSettings: SearchSettings = {
    filters: settings.filters,
    labelMap: settings.labelMap ?? DEFAULT_LABELMAP,
    sortOptions: settings.sortOptions ?? DEFAULT_SORTOPTIONS,
  };

  return (
    <SettingsStore.Provider
      initialValue={actualSettings as SearchSettings}
    >
      {children}
    </SettingsStore.Provider>
  );
}
