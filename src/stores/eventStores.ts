import { create } from "zustand";

type Store = {
  endModalDialogOpen: { open: boolean; eventId: string | null }
  setEndModalDialogOpen: (open: boolean, eventId?: string | null) => void;
}

export const useEventStore = create<Store>((set) => ({
  endModalDialogOpen: { open: false, eventId: null },
  setEndModalDialogOpen: (open: boolean, eventId?: string | null) => set({ endModalDialogOpen: { open, eventId: eventId ?? null } })
}));