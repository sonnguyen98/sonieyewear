import { NextResponse } from 'next/server'

export async function GET() {
  const key = process.env.GEMINI_API_KEY
  if (!key) return NextResponse.json({ status: 'NO_KEY', message: 'GEMINI_API_KEY chưa được cấu hình' })

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Trả lời "OK" bằng tiếng Việt' }] }]
        })
      }
    )
    const data = await res.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
    return NextResponse.json({
      status: res.ok ? 'OK' : 'ERROR',
      httpStatus: res.status,
      response: text,
      raw: res.ok ? undefined : data
    })
  } catch (err) {
    return NextResponse.json({ status: 'EXCEPTION', error: String(err) })
  }
}
