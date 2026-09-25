import { create } from 'zustand';

export type DataSource = 'network' | 'cache';

interface DataFreshnessState {
  source: DataSource;
  cachedAt?: Date;
  markNetwork: () => void;
  markCache: (cachedAt: Date) => void;
}

export const initialDataFreshness = {
  source: 'network' as DataSource,
  cachedAt: undefined,
};

/** Ephemeral connection state used to tell users when displayed data may be stale. */
export const useDataFreshnessStore = create<DataFreshnessState>((set) => ({
  ...initialDataFreshness,
  markNetwork: () => set(initialDataFreshness),
  markCache: (cachedAt) => set({ source: 'cache', cachedAt }),
}));
