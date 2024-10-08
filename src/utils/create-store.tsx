import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import shallowEqual from "./shallow-equal";

export interface Store<TData> {
  useStore<TResults>(
    accessor: (store: TData) => TResults
  ): TResults;

  useStoreUpdater(): (patch: Partial<TData>) => void;

  Provider({
    children,
    initialValue
  }: Readonly<{
    children: React.ReactNode;
    initialValue: TData
  }>): JSX.Element;
}

export default function createStore<TData>(): Store<TData> {
  function useStoreData(initialValue: TData): {
    get: () => TData;
    set: (value: Partial<TData>) => void;
    subscribe: (callback: () => void) => () => void;
  } {
    const store = useRef<TData>(initialValue);

    const subscribers = useRef(new Set<() => void>());

    const get = useCallback(() => store.current, []);
    const set = useCallback((value: Partial<TData>) => {
      store.current = { ...store.current, ...value };
      subscribers.current.forEach((x) => x());
    }, []);

    const subscribe = (callback: () => void) => {
      subscribers.current.add(callback);
      return () => subscribers.current.delete(callback);
    };

    return {
      get,
      set,
      subscribe,
    };
  }

  type useStoreDataReturnType = ReturnType<typeof useStoreData>;

  const StoreContext = createContext<useStoreDataReturnType>(
    null as unknown as useStoreDataReturnType
  );

  function StoreProvider({
    children,
    initialValue
  }: Readonly<{ children: React.ReactNode, initialValue: TData }>) {
    return (
      <StoreContext.Provider value={useStoreData(initialValue)}>
        {children}
      </StoreContext.Provider>
    );
  }

  function useStore<TResults>(
    accessor: (store: TData) => TResults
  ): TResults {
    const store = useContext(StoreContext);

    const [_, refresh] = useState(0);
    const state = useRef(accessor(store.get()));

    useEffect(() => {
      const unsubscribe = store.subscribe(() => {
        const newState = accessor(store.get());
        if (!shallowEqual(newState, state.current)) {
          state.current = newState;
          refresh((x) => x + 1);
        }
      });
      return unsubscribe;
    }, []);

    return state.current;
  }

  function useStoreUpdater(): (value: Partial<TData>) => void {
    const store = useContext(StoreContext);

    return store.set;
  }

  return {
    Provider: StoreProvider,
    useStore,
    useStoreUpdater
  };
}
