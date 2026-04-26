import { NextResponse } from 'next/server'

export async function GET() {
  const key = process.env.GEMINI_API_KEY
  if (!key) {
    return NextResponse.json({ status: 'NO_KEY', message: 'GEMINI_API_KEY chưa được cấu hình' })
  }

  // Lấy danh sách models khả dụng
  const listRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`
  ).catch(() => null)

  const listData = listRes ? await listRes.json().catch(() => ({})) : {}
  const availableModels: string[] = (listData?.models ?? [])
    .filter((m: { supportedGenerationMethods?: string[] }) =>
      m.supportedGenerationMethods?.includes('generateContent')
    )
    .map((m: { name: string }) => m.name.replace('models/', ''))

  return NextResponse.json({
    availableModels,
    tip: 'Dùng tên model ở trên để cập nhật code',
  })
}
