'use client'

import { createContext, useContext } from 'react'

export interface CartLens {
  id: string
  name: string
  price: number
}

export interface CartRx {
  mode: 'form' | 'image' | 'later'
  rightSph?: string
  rightCyl?: string
  rightAxis?: string
  leftSph?: string
  leftCyl?: string
  leftAxis?: string
  pd?: string
  imageBase64?: string
}

export interface CartItem {
  productId: string
  productName: string
  colorId: string
  colorName: string
  colorHex: string
  image: string
  price: number
  originalPrice?: number
  quantity: number
  lens?: CartLens
  rx?: CartRx
}

export interface CartState {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (productId: string, colorId: string) => void
  updateQuantity: (productId: string, colorId: string, qty: number) => void
  setLens: (productId: string, colorId: string, lens: CartLens | undefined) => void
  setRx: (productId: string, colorId: string, rx: CartRx | undefined) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CART_KEY = 'soni-cart'

export function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(CART_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveCart(items: CartItem[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(CART_KEY, JSON.stringify(items))
}

export const CartContext = createContext<CartState | null>(null)

export function useCart(): CartState {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
