import { create } from 'zustand'

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'title-asc'
export type ViewMode = 'grid' | 'list'

type UiState = {
  isCartOpen: boolean
  search: string
  sort: SortOption
  view: ViewMode
  setSearch: (value: string) => void
  setSort: (value: SortOption) => void
  setView: (value: ViewMode) => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
}

export const useUiStore = create<UiState>((set) => ({
  isCartOpen: false,
  search: '',
  sort: 'featured',
  view: 'grid',
  setSearch: (value) => set({ search: value }),
  setSort: (value) => set({ sort: value }),
  setView: (value) => set({ view: value }),
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
}))
