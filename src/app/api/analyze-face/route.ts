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

    const prompt = `Bạn là chuyên gia tư vấn kính mắt tại Việt Nam. Hãy phân tích hình dạng khuôn mặt trong ảnh này.

Trả về JSON theo đúng format sau (không có text nào khác):
{
  "shape": "oval|round|square|heart|rectangle|diamond",
  "shapeName": "Tên hình dạng bằng tiếng Việt",
  "confidence": số từ 0.7 đến 0.97,
  "description": "Mô tả đặc điểm khuôn mặt (2-3 câu)",
  "features": ["đặc điểm 1", "đặc điểm 2", "đặc điểm 3"],
  "recommendedShapes": ["tên shape gọng phù hợp 1", "tên shape 2", "tên shape 3"],
  "tip": "Lời khuyên chọn gọng kính phù hợp (1-2 câu)"
}

Các giá trị shape hợp lệ: oval, round, square, heart, rectangle, diamond
Các giá trị recommendedShapes hợp lệ: round, square, rectangle, cat-eye, oval, aviator, geometric`

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
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
