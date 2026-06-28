import { NextResponse } from 'next/server'
import { kvGet, KV_KEYS } from '@/lib/kv-store'
import fs from 'fs'
import path from 'path'

function findLensImage(lensId: string): string {
  const dir = path.join(process.cwd(), 'public', 'images', 'lens')
  try {
    const files = fs.readdirSync(dir).filter(f => f.startsWith('lens-') && /\.(jpg|jpeg|png|webp)$/i.test(f))
    const numFromId = lensId.replace(/\D/g, '')
    if (!numFromId) return ''
    const idNum = parseInt(numFromId)
    let best = ''
    let bestDiff = Infinity
    for (const f of files) {
      const fNum = parseInt(f.replace(/\D/g, ''))
      const diff = Math.abs(fNum - idNum)
      if (diff < bestDiff) { bestDiff = diff; best = f }
    }
    return best ? `/images/lens/${best}` : ''
  } catch { return '' }
}

export async function GET() {
  const data = await kvGet<Record<string, unknown>[]>(KV_KEYS.lensProducts, 'lens-products.json')
  const items = (data ?? []).map(item => ({
    ...item,
    image: (item as { image?: string }).image || findLensImage((item as { id: string }).id),
  }))
  return NextResponse.json(items, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
  })
}
