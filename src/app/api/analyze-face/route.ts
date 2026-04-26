import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const GEMINI_KEY = process.env.GEMINI_API_KEY
  if (!GEMINI_KEY) {
    return NextResponse.json({ error: 'Gemini API key chưa được cấu hình' }, { status: 500 })
  }

  try {
    const { imageBase64 } = await req.json()
    // Bỏ prefix "data:image/jpeg;base64,"
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')

    const prompt = `Bạn là chuyên gia tư vấn kính mắt hàng đầu tại Việt Nam với 20 năm kinh nghiệm.

Nhìn kỹ ảnh khuôn mặt này và phân tích THẬT SỰ dựa trên đặc điểm khuôn mặt CỤ THỂ trong ảnh:
- Đo chiều rộng trán, gò má, hàm
- Xác định chiều dài so với chiều rộng mặt
- Nhận xét cằm nhọn hay vuông
- Phân biệt chính xác hình dạng (KHÔNG mặc định oval nếu không phải)

Trả về JSON (không có text nào khác ngoài JSON):
{
  "shape": "oval|round|square|heart|rectangle|diamond",
  "shapeName": "Tên tiếng Việt",
  "confidence": số từ 0.72 đến 0.96,
  "description": "Mô tả CỤ THỂ đặc điểm nhìn thấy trong ảnh này (2-3 câu, đề cập đặc điểm riêng)",
  "features": ["đặc điểm cụ thể 1", "đặc điểm cụ thể 2", "đặc điểm cụ thể 3"],
  "recommendedShapes": ["shape1", "shape2", "shape3"],
  "tip": "Lời khuyên cá nhân hoá dựa trên khuôn mặt này (1-2 câu)"
}

shape hợp lệ: oval, round, square, heart, rectangle, diamond
recommendedShapes hợp lệ: round, square, rectangle, cat-eye, oval, aviator, geometric

Quan trọng: Phân tích THẬT SỰ khuôn mặt trong ảnh, không dùng kết quả chung chung.`

    const callGemini = async (model: string) => {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { inline_data: { mime_type: 'image/jpeg', data: base64Data } },
                { text: prompt }
              ]
            }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 512,
            }
          })
        }
      )

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        const errMsg = errBody?.error?.message ?? res.statusText
        console.error(`Gemini ${model} HTTP ${res.status}:`, errMsg)
        throw Object.assign(new Error(errMsg), { status: res.status })
      }

      const data = await res.json()
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        console.error(`Gemini ${model} trả về text không có JSON:`, text.slice(0, 200))
        throw new Error('Gemini không trả về JSON hợp lệ')
      }
      return { result: JSON.parse(jsonMatch[0]), model }
    }

    // Thử gemini-2.5-flash trước, fallback gemini-2.0-flash nếu 429
    let outcome: { result: unknown; model: string }
    try {
      outcome = await callGemini('gemini-2.5-flash')
    } catch (err: unknown) {
      const status = (err as { status?: number }).status
      if (status === 429 || status === 503) {
        console.warn('gemini-2.5-flash rate limited, thử gemini-2.0-flash...')
        outcome = await callGemini('gemini-2.0-flash')
      } else {
        throw err
      }
    }

    return NextResponse.json({ success: true, result: outcome.result, model: outcome.model })

  } catch (err) {
    const status = (err as { status?: number }).status
    console.error('Gemini analyze-face lỗi:', err)
    return NextResponse.json(
      { error: 'Phân tích thất bại', detail: String(err), geminiStatus: status },
      { status: 500 }
    )
  }
}
