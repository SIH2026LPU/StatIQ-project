import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UiState {
  lastArea: "learner" | "trainer" | "admin" | null;
  setLastArea: (area: UiState["lastArea"]) => void;
  offlineQueue: number;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      lastArea: null,
      offlineQueue: 0,
      setLastArea: (lastArea) => set({ lastArea }),
    }),
    { name: "statiq-ui" },
  ),
);
