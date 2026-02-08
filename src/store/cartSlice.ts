import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from './store'

export type Product = {
  id: number
  title: string
  price: number
  thumbnail?: string
}

export type CartItem = Product & {
  quantity: number
}

type CartState = {
  items: CartItem[]
}

const initialState: CartState = {
  items: [],
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<Product>) => {
      const existing = state.items.find((item) => item.id === action.payload.id)
      if (existing) {
        existing.quantity += 1
        return
      }
      state.items.push({ ...action.payload, quantity: 1 })
    },
    removeItem: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((item) => item.id !== action.payload)
    },
    increment: (state, action: PayloadAction<number>) => {
      const existing = state.items.find((item) => item.id === action.payload)
      if (existing) {
        existing.quantity += 1
      }
    },
    decrement: (state, action: PayloadAction<number>) => {
      const existing = state.items.find((item) => item.id === action.payload)
      if (!existing) return
      if (existing.quantity <= 1) {
        state.items = state.items.filter((item) => item.id !== action.payload)
        return
      }
      existing.quantity -= 1
    },
    clearCart: (state) => {
      state.items = []
    },
  },
})

export const { addItem, removeItem, increment, decrement, clearCart } =
  cartSlice.actions

export default cartSlice.reducer

export const selectCartItems = (state: RootState) => state.cart.items
export const selectCartCount = (state: RootState) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0)
export const selectCartTotal = (state: RootState) =>
  state.cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
