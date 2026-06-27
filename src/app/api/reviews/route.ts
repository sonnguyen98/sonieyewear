import { NextRequest, NextResponse } from 'next/server'
import { kvGet, kvSet, KV_KEYS } from '@/lib/kv-store'

export interface Review {
  id: string
  productId: string
  name: string
  phone: string
  rating: number
  text: string
  images: string[]
  createdAt: string
  verified: boolean
}

export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get('productId')
  const all = await kvGet<Review[]>(KV_KEYS.reviews, 'reviews.json') ?? []

  const filtered = productId ? all.filter(r => r.productId === productId) : all
  const sorted = filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return NextResponse.json(sorted, {
    headers: { 'Cache-Control': 'public, s-maxage=30' },
  })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { productId, name, phone, rating, text, images } = body

  if (!productId || !name || !phone || !rating || !text) {
    return NextResponse.json({ error: 'Thiếu thông tin' }, { status: 400 })
  }

  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Rating phải từ 1-5' }, { status: 400 })
  }

  const review: Review = {
    id: `rv-${Date.now()}`,
    productId,
    name,
    phone: phone.replace(/\d{4}$/, '****'),
    rating: Math.round(rating),
    text: text.slice(0, 500),
    images: Array.isArray(images) ? images.slice(0, 3) : [],
    createdAt: new Date().toISOString(),
    verified: false,
  }

  const all = await kvGet<Review[]>(KV_KEYS.reviews, 'reviews.json') ?? []
  all.push(review)
  await kvSet(KV_KEYS.reviews, 'reviews.json', all)

  return NextResponse.json({ success: true, review })
}
