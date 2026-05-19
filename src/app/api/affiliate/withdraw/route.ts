import { NextRequest, NextResponse } from 'next/server'
import { createWithdrawal } from '@/lib/affiliateStore'
import { applyRateLimit, limiters, getClientIp } from '@/lib/ratelimit'

async function postToScript(url: string, data: object) {
  const body = JSON.stringify(data)
  try {
    const r1 = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      redirect: 'manual',
    })
    if (r1.status >= 300 && r1.status < 400) {
      const loc = r1.headers.get('location') ?? ''
      if (loc) await fetch(loc, { method: 'GET' })
    }
  } catch {}
}

export async function POST(req: NextRequest) {
  const code = req.headers.get('x-affiliate-code')
  const phone = req.headers.get('x-affiliate-phone')
  if (!code || !phone) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const limited = await applyRateLimit(limiters.affiliateWithdraw, `${code}:${getClientIp(req)}`)
  if (limited) return limited

  const { amount } = await req.json().catch(() => ({ amount: undefined }))
  const result = await createWithdrawal(code, phone, amount)
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status })

  const APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL
  if (APPS_SCRIPT_URL && !APPS_SCRIPT_URL.includes('paste_your')) {
    await postToScript(APPS_SCRIPT_URL, {
      action: 'affiliateWithdraw',
      ...result.withdrawal,
    })
  }

  return NextResponse.json({ success: true, withdrawal: result.withdrawal })
}
