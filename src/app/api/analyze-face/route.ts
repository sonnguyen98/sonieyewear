import { NextRequest, NextResponse } from 'next/server'

// Cho phép function chạy tới 30s (Gemini có thể mất 10-20s khi xử lý ảnh)
export const maxDuration = 30
export const runtime = 'nodejs'

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

const PROMPT = `Bạn là chuyên gia tư vấn kính mắt của SONi Eyewear. Phân tích hình dạng khuôn mặt trong ảnh (chỉ phân tích hình dạng, KHÔNG nhận diện danh tính).

Trả về CHỈ JSON đúng schema (không markdown, không text khác):
{
  "shape": "oval" | "round" | "square" | "heart" | "rectangle" | "diamond",
  "shapeName": "Trái Xoan" | "Tròn" | "Vuông" | "Trái Tim" | "Chữ Nhật" | "Kim Cương",
  "confidence": <số 0.72-0.96>,
  "description": "1-2 câu mô tả đặc điểm hình dạng",
  "features": ["đặc điểm 1", "đặc điểm 2", "đặc điểm 3"],
  "recommendedShapes": ["chọn 2-3 từ: round, square, rectangle, cat-eye, oval, aviator, geometric"],
  "tip": "1-2 câu lời khuyên gọng kính phù hợp"
}`

// Schema bắt Gemini trả JSON hợp lệ tuyệt đối
const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    shape: { type: 'STRING', enum: ['oval', 'round', 'square', 'heart', 'rectangle', 'diamond'] },
    shapeName: { type: 'STRING' },
    confidence: { type: 'NUMBER' },
    description: { type: 'STRING' },
    features: { type: 'ARRAY', items: { type: 'STRING' } },
    recommendedShapes: { type: 'ARRAY', items: { type: 'STRING' } },
    tip: { type: 'STRING' },
  },
  required: ['shape', 'shapeName', 'confidence', 'description', 'features', 'recommendedShapes', 'tip'],
}

// Tắt safety filter — phân tích hình dạng khuôn mặt KHÔNG phải nội dung nhạy cảm,
// nhưng default filter của Gemini đôi khi block ảnh chân dung
const SAFETY_SETTINGS = [
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
]

export async function POST(req: NextRequest) {
  const GEMINI_KEY = process.env.GEMINI_API_KEY
  if (!GEMINI_KEY) {
    console.error('[analyze-face] GEMINI_API_KEY chưa được set trong env')
    return NextResponse.json(
      { error: 'GEMINI_API_KEY chưa được cấu hình trên server', code: 'NO_KEY' },
      { status: 500 }
    )
  }

  let imageBase64: string
  try {
    const body = await req.json()
    imageBase64 = body.imageBase64
    if (!imageBase64) throw new Error('Thiếu imageBase64')
  } catch {
    return NextResponse.json({ error: 'Request body không hợp lệ', code: 'BAD_REQUEST' }, { status: 400 })
  }

  // Bỏ prefix data URL, chỉ giữ phần base64 thuần
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')

  // Cảnh báo nếu ảnh quá lớn (Vercel body limit 4.5MB)
  const sizeMB = (base64Data.length * 0.75) / (1024 * 1024)
  console.log(`[analyze-face] image size: ${sizeMB.toFixed(2)}MB`)
  if (sizeMB > 4) {
    return NextResponse.json(
      { error: 'Ảnh quá lớn (>4MB), vui lòng chụp lại', code: 'IMAGE_TOO_LARGE' },
      { status: 413 }
    )
  }

  const callGemini = async (model: string) => {
    const url = `${GEMINI_BASE}/${model}:generateContent?key=${GEMINI_KEY}`
    const res = await fetch(url, {
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
        safetySettings: SAFETY_SETTINGS,
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1024,
          responseMimeType: 'application/json',
          responseSchema: RESPONSE_SCHEMA,
          // Tắt thinking để response nhanh hơn (tránh hết 30s timeout của Vercel)
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    })

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}))
      const errMsg = errBody?.error?.message ?? res.statusText
      console.error(`[analyze-face] ${model} HTTP ${res.status}:`, errMsg)
      throw Object.assign(new Error(errMsg), { httpStatus: res.status })
    }

    const data = await res.json()
    const candidate = data?.candidates?.[0]
    const finishReason = candidate?.finishReason
    const text: string = candidate?.content?.parts?.[0]?.text ?? ''

    if (!text) {
      console.error(`[analyze-face] ${model} trả về rỗng. finishReason=${finishReason}`,
        JSON.stringify(data).slice(0, 500))
      throw new Error(`Gemini trả response rỗng (finishReason=${finishReason ?? 'unknown'})`)
    }

    try {
      return JSON.parse(text)
    } catch {
      // Fallback: extract JSON object từ text nếu có markdown wrapper
      const m = text.match(/\{[\s\S]*\}/)
      if (m) return JSON.parse(m[0])
      console.error(`[analyze-face] ${model} không trả JSON hợp lệ:`, text.slice(0, 300))
      throw new Error('Gemini không trả JSON hợp lệ')
    }
  }

  try {
    let result: unknown
    // gemini-2.0-flash đã bị Google ngừng cấp cho user mới (404). Dùng 2.5-flash làm primary.
    try {
      result = await callGemini('gemini-2.5-flash')
    } catch (err: unknown) {
      const status = (err as { httpStatus?: number }).httpStatus
      // Fallback sang model nhẹ hơn nếu rate-limit hoặc Google overload
      if (status === 429 || status === 503 || status === 500) {
        console.warn('[analyze-face] gemini-2.5-flash lỗi, fallback gemini-2.5-flash-lite')
        result = await callGemini('gemini-2.5-flash-lite')
      } else {
        throw err
      }
    }
    return NextResponse.json({ success: true, result })
  } catch (err) {
    console.error('[analyze-face] FINAL ERROR:', err)
    return NextResponse.json(
      { error: 'Phân tích thất bại', detail: err instanceof Error ? err.message : String(err), code: 'GEMINI_FAILED' },
      { status: 500 }
    )
  }
}
