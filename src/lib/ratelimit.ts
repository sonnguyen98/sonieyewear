import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextRequest, NextResponse } from 'next/server'

// Trong dev không có Redis credentials → rate limit thành no-op
const HAS_REDIS = !!process.env.KV_REST_API_URL

const redis = HAS_REDIS
  ? new Redis({ url: process.env.KV_REST_API_URL!, token: process.env.KV_REST_API_TOKEN! })
  : null

function build(limiterKey: string, limit: number, windowSec: number): Ratelimit | null {
  if (!redis) return null
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
    analytics: false,
    prefix: `rl:${limiterKey}`,
  })
}

// Các limiter có sẵn — chọn ngưỡng dựa trên use-case
export const limiters = {
  adminLogin:      build('admin-login', 5, 60),       // 5 lần / phút
  affiliateLogin:  build('affiliate-login', 5, 60),   // 5 lần / phút
  affiliateRegister: build('affiliate-reg', 3, 600),  // 3 lần / 10 phút
  order:           build('order', 10, 3600),          // 10 đơn / giờ / IP
  paymentWebhook:  build('webhook', 60, 60),          // 60 webhook / phút (SePay) — chống flood
  affiliateWithdraw: build('aff-wd', 5, 3600),        // 5 lệnh rút / giờ
  api:             build('api', 60, 60),              // 60 req / phút (mặc định)
}

export function getClientIp(req: NextRequest): string {
  // Vercel set x-forwarded-for; ưu tiên IP đầu tiên
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0]!.trim()
  return req.headers.get('x-real-ip') ?? 'unknown'
}

// Áp dụng rate-limit; nếu vượt → trả 429 response, ngược lại return null để route tiếp tục.
export async function applyRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<NextResponse | null> {
  if (!limiter) return null
  const r = await limiter.limit(identifier)
  if (!r.success) {
    const retry = Math.max(1, Math.ceil((r.reset - Date.now()) / 1000))
    return NextResponse.json(
      { error: 'Quá nhiều yêu cầu, vui lòng thử lại sau.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(retry),
          'X-RateLimit-Limit': String(r.limit),
          'X-RateLimit-Remaining': String(r.remaining),
          'X-RateLimit-Reset': String(r.reset),
        },
      }
    )
  }
  return null
}
