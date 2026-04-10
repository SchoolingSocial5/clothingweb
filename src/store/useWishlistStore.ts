import { create } from 'zustand';

interface WishlistStore {
  ids: number[];
  hydrated: boolean;
  hydrate: () => void;
  toggle: (id: number) => void;
  isWishlisted: (id: number) => boolean;
}

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  ids: [],
  hydrated: false,

  hydrate: () => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem('wishlist');
      set({ ids: saved ? JSON.parse(saved) : [], hydrated: true });
    } catch {
      set({ ids: [], hydrated: true });
    }
  },

  toggle: (id) => {
    const current = get().ids;
    const next = current.includes(id) ? current.filter((i) => i !== id) : [...current, id];
    set({ ids: next });
    if (typeof window !== 'undefined') {
      localStorage.setItem('wishlist', JSON.stringify(next));
    }
  },

  isWishlisted: (id) => get().ids.includes(id),
}));
