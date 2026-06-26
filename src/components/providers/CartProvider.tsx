'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { CartContext, loadCart, saveCart, type CartItem, type CartLens, type CartRx } from '@/lib/cartStore'

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setItems(loadCart())
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (loaded) saveCart(items)
  }, [items, loaded])

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.productId === item.productId && i.colorId === item.colorId)
      if (idx >= 0) {
        const updated = [...prev]
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + 1 }
        return updated
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }, [])

  const removeItem = useCallback((productId: string, colorId: string) => {
    setItems(prev => prev.filter(i => !(i.productId === productId && i.colorId === colorId)))
  }, [])

  const updateQuantity = useCallback((productId: string, colorId: string, qty: number) => {
    if (qty <= 0) {
      removeItem(productId, colorId)
      return
    }
    setItems(prev => prev.map(i =>
      i.productId === productId && i.colorId === colorId ? { ...i, quantity: qty } : i
    ))
  }, [removeItem])

  const setLens = useCallback((productId: string, colorId: string, lens: CartLens | undefined) => {
    setItems(prev => prev.map(i =>
      i.productId === productId && i.colorId === colorId ? { ...i, lens } : i
    ))
  }, [])

  const setRx = useCallback((productId: string, colorId: string, rx: CartRx | undefined) => {
    setItems(prev => prev.map(i =>
      i.productId === productId && i.colorId === colorId ? { ...i, rx } : i
    ))
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const totalItems = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items])
  const totalPrice = useMemo(() => items.reduce((s, i) => {
    const lensPrice = i.lens?.price ?? 0
    return s + (i.price + lensPrice) * i.quantity
  }, 0), [items])

  const value = useMemo(() => ({
    items, addItem, removeItem, updateQuantity, setLens, setRx, clearCart, totalItems, totalPrice
  }), [items, addItem, removeItem, updateQuantity, setLens, setRx, clearCart, totalItems, totalPrice])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
