import create from "zustand";

type Tab = { id: string; title: string; url: string; engine: "webkit" | "chromium" };
type Store = {
  tabs: Tab[];
  addTab: (tab: Tab) => void;
  removeTab: (id: string) => void;
};

export const useTabStore = create<Store>((set) => ({
  tabs: [],
  addTab: (tab) => set((state) => ({ tabs: [...state.tabs, tab] })),
  removeTab: (id) => set((state) => ({ tabs: state.tabs.filter((t) => t.id !== id) })),
}));
