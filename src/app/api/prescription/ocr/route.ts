import { NextRequest, NextResponse } from 'next/server'
import { getCustomerIdFromRequest } from '@/lib/customerAuth'
import { saveImage } from '@/lib/uploadStore'
import { applyRateLimit, limiters, getClientIp } from '@/lib/ratelimit'

export const maxDuration = 30
export const runtime = 'nodejs'

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
const MAX_SIZE = 8 * 1024 * 1024 // 8MB

const OCR_PROMPT = `Bạn là chuyên gia đọc đơn kính quang học Việt Nam. Hãy trích xuất thông số khúc xạ từ ảnh đơn khám mắt này.

Ký hiệu thường gặp:
- OD / MP / Mắt phải / R: mắt phải
- OS / MT / Mắt trái / L: mắt trái
- SPH / S / Sph: độ cầu (âm = cận thị, dương = viễn thị, Pl/PL = 0)
- CYL / C / Cyl: độ trụ (loạn thị, thường âm hoặc 0)
- AXE / AXIS / A / Ax / Trục: trục loạn (0–180)
- ADD / Ad: cộng thêm cho kính đọc/progressive (thường 0–4)
- PD / KT: khoảng cách đồng tử (mm, thường 55–75)

Quy tắc xử lý:
- PL hoặc Pl = số 0
- Số không có dấu = dương (ví dụ: 1.25 = +1.25)
- Nếu trường không xuất hiện trong đơn → để null
- AXIS chỉ có nghĩa khi CYL khác 0; nếu CYL = 0 thì AXIS = 0
- Nếu ảnh không phải đơn kính hoặc không đọc được → confidence = "low"

Trả về CHỈ JSON (không markdown, không text thêm):
{
  "right": { "sph": number, "cyl": number, "axis": number, "add": number | null },
  "left":  { "sph": number, "cyl": number, "axis": number, "add": number | null },
  "pd": number | null,
  "examDate": "YYYY-MM-DD" | null,
  "clinicName": string | null,
  "confidence": "high" | "medium" | "low"
}`

interface OcrResult {
  right: { sph: number; cyl: number; axis: number; add: number | null }
  left:  { sph: number; cyl: number; axis: number; add: number | null }
  pd: number | null
  examDate: string | null
  clinicName: string | null
  confidence: 'high' | 'medium' | 'low'
}

function clamp(n: number, min: number, max: number) { return Math.min(max, Math.max(min, n)) }

function sanitizeOcrResult(raw: OcrResult): OcrResult {
  const eye = (e: OcrResult['right']) => ({
    sph:  clamp(Math.round((e?.sph  ?? 0) * 4) / 4, -20, 20),
    cyl:  clamp(Math.round((e?.cyl  ?? 0) * 4) / 4, -6,   6),
    axis: clamp(Math.round(e?.axis  ?? 0), 0, 180),
    add:  e?.add != null ? clamp(Math.round(e.add * 4) / 4, 0, 4) : null,
  })
  return {
    right: eye(raw.right),
    left:  eye(raw.left),
    pd: raw.pd != null ? clamp(Math.round(raw.pd * 2) / 2, 50, 80) : null,
    examDate: raw.examDate ?? null,
    clinicName: raw.clinicName ?? null,
    confidence: raw.confidence ?? 'medium',
  }
}

async function callGemini(model: string, base64: string, mimeType: string, apiKey: string): Promise<OcrResult> {
  const url = `${GEMINI_BASE}/${model}:generateContent?key=${apiKey}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { inlineData: { mimeType, data: base64 } },
          { text: OCR_PROMPT },
        ],
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 512,
        responseMimeType: 'application/json',
        thinkingConfig: { thinkingBudget: 0 },
      },
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw Object.assign(new Error(err?.error?.message ?? res.statusText), { httpStatus: res.status })
  }

  const data = await res.json()
  const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  if (!text) throw new Error('Gemini trả response rỗng')

  try {
    return JSON.parse(text) as OcrResult
  } catch {
    const m = text.match(/\{[\s\S]*\}/)
    if (m) return JSON.parse(m[0]) as OcrResult
    throw new Error('Gemini không trả JSON hợp lệ')
  }
}

export async function POST(req: NextRequest) {
  // Auth
  const customerId = await getCustomerIdFromRequest(req)
  if (!customerId)
    return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })

  // Rate limit
  const limited = await applyRateLimit(limiters.prescriptionOcr, getClientIp(req))
  if (limited) return limited

  const GEMINI_KEY = process.env.GEMINI_API_KEY
  if (!GEMINI_KEY)
    return NextResponse.json({ error: 'Tính năng OCR chưa được cấu hình' }, { status: 503 })

  // Parse file
  let file: File
  try {
    const form = await req.formData()
    file = form.get('image') as File
    if (!file) throw new Error('Thiếu file')
  } catch {
    return NextResponse.json({ error: 'Vui lòng đính kèm ảnh đơn kính' }, { status: 400 })
  }

  if (!ALLOWED_TYPES.includes(file.type))
    return NextResponse.json({ error: 'Chỉ chấp nhận ảnh JPG, PNG, WebP, HEIC' }, { status: 400 })

  if (file.size > MAX_SIZE)
    return NextResponse.json({ error: 'Ảnh quá lớn (tối đa 8MB)' }, { status: 400 })

  // Lưu ảnh vào Blob (để đính kèm vào đơn kính sau)
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  let imageUrl: string | undefined
  try {
    const saved = await saveImage(file, 'prescriptions', ext)
    imageUrl = saved.url
  } catch (e) {
    console.warn('[ocr] Lưu ảnh thất bại, tiếp tục OCR:', e)
  }

  // Chuyển sang base64 để gửi Gemini
  const bytes = await file.arrayBuffer()
  const base64 = Buffer.from(bytes).toString('base64')
  const mimeType = file.type === 'image/heic' || file.type === 'image/heif' ? 'image/jpeg' : file.type

  try {
    let raw: OcrResult
    try {
      raw = await callGemini('gemini-2.5-flash', base64, mimeType, GEMINI_KEY)
    } catch (err: unknown) {
      const status = (err as { httpStatus?: number }).httpStatus
      if (status === 429 || status === 503 || status === 500) {
        raw = await callGemini('gemini-2.5-flash-lite', base64, mimeType, GEMINI_KEY)
      } else {
        throw err
      }
    }

    const result = sanitizeOcrResult(raw)

    if (result.confidence === 'low')
      return NextResponse.json({ error: 'Không nhận ra đây là đơn kính. Vui lòng chụp rõ hơn hoặc nhập tay.' }, { status: 422 })

    return NextResponse.json({ success: true, data: result, imageUrl })
  } catch (err) {
    console.error('[ocr] FINAL ERROR:', err)
    return NextResponse.json(
      { error: 'Đọc đơn kính thất bại. Vui lòng nhập thủ công hoặc thử lại.' },
      { status: 500 }
    )
  }
}
