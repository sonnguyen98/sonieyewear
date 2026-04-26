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

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_KEY}`,
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

    const data = await res.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

    // Parse JSON từ response Gemini
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Gemini không trả về JSON hợp lệ')

    const result = JSON.parse(jsonMatch[0])
    return NextResponse.json({ success: true, result })

  } catch (err) {
    console.error('Gemini error:', err)
    return NextResponse.json({ error: 'Phân tích thất bại', detail: String(err) }, { status: 500 })
  }
}
