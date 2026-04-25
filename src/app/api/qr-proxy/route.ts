import { NextRequest, NextResponse } from 'next/server'

// Proxy VietQR image để tránh CORS trên desktop
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const bank    = searchParams.get('bank') ?? 'MB'
  const account = searchParams.get('account') ?? ''
  const amount  = searchParams.get('amount') ?? '0'
  const content = searchParams.get('content') ?? ''
  const name    = searchParams.get('name') ?? ''

  const url = `https://img.vietqr.io/image/${bank}-${account}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(content)}&accountName=${encodeURIComponent(name)}`

  try {
    const res = await fetch(url)
    const buf = await res.arrayBuffer()
    return new NextResponse(buf, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store',
      },
    })
  } catch {
    return new NextResponse('Error', { status: 500 })
  }
}
