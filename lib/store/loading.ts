import { create } from "zustand";

interface LoadingState {
  pendingCount: number;
  increment: () => void;
  decrement: () => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
  pendingCount: 0,
  increment: () => set((s) => ({ pendingCount: s.pendingCount + 1 })),
  decrement: () =>
    set((s) => ({ pendingCount: Math.max(0, s.pendingCount - 1) })),
}));
