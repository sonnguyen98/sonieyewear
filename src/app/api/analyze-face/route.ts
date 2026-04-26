import { NextRequest, NextResponse } from 'next/server'

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

const PROMPT = `Hãy phân tích khuôn mặt trong ảnh như một chuyên gia tư vấn kính mắt của SONi Eyewear và trả lời 3 câu hỏi sau:

1. Khuôn mặt này thuộc hình dạng khuôn mặt nào?
2. Đặc điểm ngắn gọn của hình dạng khuôn mặt này là gì?
3. Lời khuyên từ SONi: nên dùng kiểu gọng nào cho phù hợp?

Trả về JSON (không có text nào khác ngoài JSON):
{
  "shape": "oval|round|square|heart|rectangle|diamond",
  "shapeName": "Tên tiếng Việt (Trái Xoan / Tròn / Vuông / Trái Tim / Chữ Nhật / Kim Cương)",
  "confidence": số từ 0.72 đến 0.96,
  "description": "Đặc điểm ngắn gọn của hình dạng khuôn mặt này (1-2 câu súc tích)",
  "features": ["đặc điểm 1", "đặc điểm 2", "đặc điểm 3"],
  "recommendedShapes": ["shape1", "shape2"],
  "tip": "Lời khuyên từ SONi: nên dùng kiểu gọng nào và tại sao (1-2 câu cụ thể)"
}

shape hợp lệ: oval, round, square, heart, rectangle, diamond
recommendedShapes chọn 2-3 từ: round, square, rectangle, cat-eye, oval, aviator, geometric`

export async function POST(req: NextRequest) {
  const GEMINI_KEY = process.env.GEMINI_API_KEY
  if (!GEMINI_KEY) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY chưa được cấu hình trên server' },
      { status: 500 }
    )
  }

  let imageBase64: string
  try {
    const body = await req.json()
    imageBase64 = body.imageBase64
    if (!imageBase64) throw new Error('Thiếu imageBase64')
  } catch {
    return NextResponse.json({ error: 'Request body không hợp lệ' }, { status: 400 })
  }

  // Bỏ prefix data URL, chỉ giữ phần base64 thuần
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')

  try {
    const callGemini = async (model: string) => {
      const res = await fetch(`${GEMINI_BASE}/${model}:generateContent?key=${GEMINI_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
                { text: PROMPT },
              ],
            },
          ],
          generationConfig: { temperature: 0.3, maxOutputTokens: 512 },
        }),
      })

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        const errMsg = errBody?.error?.message ?? res.statusText
        console.error(`Gemini ${model} HTTP ${res.status}:`, errMsg)
        throw Object.assign(new Error(errMsg), { httpStatus: res.status })
      }

      const data = await res.json()
      const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        console.error(`Gemini ${model} không trả về JSON:`, text.slice(0, 300))
        throw new Error('Gemini không trả về JSON hợp lệ')
      }
      return JSON.parse(jsonMatch[0])
    }

    // Thử gemini-2.0-flash trước, fallback gemini-2.5-flash nếu 429/503
    let result: unknown
    try {
      result = await callGemini('gemini-2.0-flash')
    } catch (err: unknown) {
      const status = (err as { httpStatus?: number }).httpStatus
      if (status === 429 || status === 503) {
        console.warn('gemini-2.0-flash rate limited, fallback gemini-2.5-flash...')
        result = await callGemini('gemini-2.5-flash')
      } else {
        throw err
      }
    }

    return NextResponse.json({ success: true, result })

  } catch (err) {
    console.error('Lỗi khi gọi Gemini:', err)
    return NextResponse.json(
      { error: 'Phân tích thất bại', detail: String(err) },
      { status: 500 }
    )
  }
}
