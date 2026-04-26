import { NextResponse } from 'next/server'

async function testModel(key: string, model: string) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Trả lời "OK"' }] }],
        generationConfig: { maxOutputTokens: 10 },
      }),
    }
  )
  const data = await res.json()
  return {
    model,
    httpStatus: res.status,
    ok: res.ok,
    response: data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null,
    error: res.ok ? undefined : (data?.error?.message ?? 'unknown error'),
  }
}

export async function GET() {
  const key = process.env.GEMINI_API_KEY
  if (!key) {
    return NextResponse.json({ status: 'NO_KEY', message: 'GEMINI_API_KEY chưa được cấu hình' })
  }

  const [r1, r2] = await Promise.allSettled([
    testModel(key, 'gemini-2.5-flash'),
    testModel(key, 'gemini-2.5-flash-lite'),
  ])

  return NextResponse.json({
    'gemini-2.5-flash': r1.status === 'fulfilled' ? r1.value : { error: String((r1 as PromiseRejectedResult).reason) },
    'gemini-2.5-flash-lite': r2.status === 'fulfilled' ? r2.value : { error: String((r2 as PromiseRejectedResult).reason) },
  })
}
