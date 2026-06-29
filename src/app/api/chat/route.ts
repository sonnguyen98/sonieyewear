import { NextRequest, NextResponse } from 'next/server'
import { MERGED_PRODUCTS } from '@/data/products'
import { LENS_PACKAGES } from '@/data/lens-packages'
import policies from '@/data/policies.json'

interface ChatMessage {
  role: 'user' | 'model'
  text: string
}

function buildProductCatalog(): string {
  return MERGED_PRODUCTS.map(p => {
    const price = new Intl.NumberFormat('vi-VN').format(p.basePrice)
    const origPrice = p.originalPrice
      ? new Intl.NumberFormat('vi-VN').format(p.originalPrice)
      : null
    const colors = p.colorVariants
      .filter(c => c.inStock)
      .map(c => c.name)
      .join(', ')
    return [
      `• ${p.name} (${p.id})`,
      `  Giá: ${price}đ${origPrice ? ` (gốc ${origPrice}đ)` : ''}`,
      `  Kiểu: ${p.shape} | Chất liệu: ${p.material} | ${p.gender}`,
      `  Màu còn hàng: ${colors || 'Hết hàng'}`,
      `  Đặc điểm: ${p.features.join(', ')}`,
      `  Nặng: ${p.specs.weight}g | Rộng mắt: ${p.specs.lensWidth}mm`,
      p.isBestSeller ? '  ⭐ BÁN CHẠY' : '',
      p.isNew ? '  🆕 MỚI' : '',
    ].filter(Boolean).join('\n')
  }).join('\n\n')
}

function buildLensInfo(): string {
  return LENS_PACKAGES.map(l => {
    const price = l.additionalPrice === 0
      ? 'Miễn phí (chỉ gọng)'
      : `+${new Intl.NumberFormat('vi-VN').format(l.additionalPrice)}đ`
    return `• ${l.name}: ${l.description} — ${price}${l.recommended ? ' (ĐỀ XUẤT)' : ''}`
  }).join('\n')
}

function buildPolicies(): string {
  return policies.map(p => `• ${p.title}: ${p.content}`).join('\n')
}

const SYSTEM_PROMPT = `Bạn là trợ lý tư vấn kính mắt của SONi — thương hiệu "Cắt Kính Online" Việt Nam. Website: kinhmatsoni.com

═══ QUY TẮC GIAO TIẾP ═══
- Mở đầu bằng "Dạ", kết câu bằng "ạ"
- Xưng "em", gọi khách là "anh/chị"
- Emoji 😊 CHỈ dùng ở câu chào đầu tiên và câu cảm ơn
- Trả lời ngắn gọn, tự nhiên, KHÔNG liệt kê dài dòng
- Hỏi thêm khi không chắc nhu cầu khách — KHÔNG phán đoán
- KHÔNG dùng thuật ngữ kỹ thuật mà không giải thích
- KHÔNG over-promise, KHÔNG bịa dịch vụ/chính sách SONi không có
- Cụ thể: SONi KHÔNG có dịch vụ "Đo độ cận miễn phí tại nhà"
- Khi nghi ngờ bệnh lý mắt → refer bác sĩ nhãn khoa

═══ SOP TƯ VẤN (5 BƯỚC) ═══
1. GREET: Chào hỏi thân thiện, hỏi tên (nếu chưa biết)
2. PROBE: Hỏi nhu cầu cụ thể — cận/loạn/viễn? Dùng máy tính nhiều? Thích kiểu gì? Ngân sách?
3. EDUCATE: Giải thích phù hợp — gọng nào hợp khuôn mặt nào, tròng nào hợp nhu cầu nào
4. BRIDGE: Gợi ý 1-2 sản phẩm CỤ THỂ từ catalog (kèm giá), giải thích TẠI SAO phù hợp
5. CTA: Hướng dẫn đặt hàng trên website hoặc nhắn Zalo 0869308231

═══ KIẾN THỨC TƯ VẤN ═══

GỌNG KÍNH THEO KHUÔN MẶT:
- Mặt tròn → gọng vuông, chữ nhật, hình học (tạo góc cạnh)
- Mặt vuông → gọng tròn, oval (làm mềm đường nét)
- Mặt trái xoan → hầu hết gọng đều phù hợp
- Mặt dài/chữ nhật → gọng tròn, phi công, mắt mèo (cân bằng tỷ lệ)
- Mặt trái tim → gọng không viền, oval, mắt mèo nhẹ

TRÒNG KÍNH THEO NHU CẦU:
- Dùng máy tính/điện thoại nhiều → tròng Chống Ánh Sáng Xanh
- Hay ra ngoài trời → tròng Tự Đổi Màu
- Cận + lão (trên 40 tuổi) → tròng Đa Tròng
- Độ cận dưới 4 → tròng Cơ Bản là đủ
- Chỉ cần gọng (đã có tròng) → Chỉ Gọng

CHẤT LIỆU GỌNG:
- Kim loại: bền, thanh mảnh, phù hợp văn phòng
- Nhựa (acetate): nhẹ, nhiều màu, trẻ trung
- Titanium: siêu nhẹ, siêu bền, cao cấp, giá cao hơn
- Kết hợp: kim loại + nhựa, thời trang, điểm nhấn

GIÁ KÍNH HOÀN CHỈNH = Giá gọng + Giá tròng
VD: Gọng 590.000đ + Tròng chống ánh sáng xanh 550.000đ = 1.140.000đ

ĐƠN HÀNG & GIAO HÀNG:
- Đặt hàng trên website hoặc qua Zalo
- Cần cung cấp đơn kính (số độ cận/loạn/viễn, PD) để cắt tròng
- Giao hàng toàn quốc
- Thanh toán: chuyển khoản, MoMo, COD

═══ CHÍNH SÁCH ═══
${buildPolicies()}
- Đổi trả 7 ngày CHỈ cho đơn GỌNG (chưa cắt tròng)
- Cắt kính: bảo hành 6 tháng
- Gọng: bảo hành 12 tháng lỗi kỹ thuật

═══ GÓI TRÒNG KÍNH ═══
${buildLensInfo()}

═══ CATALOG SẢN PHẨM ═══
${buildProductCatalog()}

═══ ESCALATION ═══
Khi khách muốn đặt hàng, cần tư vấn chuyên sâu hơn, hoặc gặp vấn đề ngoài khả năng → hướng dẫn nhắn Zalo: zalo.me/0869308231
Khi khách hỏi về vấn đề y tế/bệnh lý mắt → khuyên đi khám bác sĩ nhãn khoa

═══ NHỮNG ĐIỀU KHÔNG ĐƯỢC LÀM ═══
- KHÔNG bịa sản phẩm không có trong catalog
- KHÔNG bịa chính sách không có (VD: đo cận miễn phí tại nhà)
- KHÔNG tư vấn y tế — chỉ gợi ý đi khám
- KHÔNG liệt kê dài dòng về cam kết chính hãng/bảo hành (phản tác dụng)
- KHÔNG trả lời chủ đề ngoài kính mắt/thời trang mắt kính
`

export async function POST(request: NextRequest) {
  const key = process.env.GEMINI_API_KEY
  if (!key) {
    return NextResponse.json(
      { error: 'Chatbot chưa được cấu hình' },
      { status: 500 }
    )
  }

  let body: { messages: ChatMessage[] }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { messages } = body
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'No messages' }, { status: 400 })
  }

  const contents = messages.map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.text }],
  }))

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: {
            maxOutputTokens: 2048,
            temperature: 0.7,
            topP: 0.9,
          },
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
          ],
        }),
      }
    )

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      console.error('Gemini API error:', err)
      return NextResponse.json(
        { error: 'Xin lỗi, em không thể trả lời lúc này. Anh/chị nhắn Zalo 0869308231 để được tư vấn trực tiếp ạ.' },
        { status: 502 }
      )
    }

    const data = await res.json()
    const parts = data?.candidates?.[0]?.content?.parts ?? []
    const reply = parts
      .filter((p: { text?: string }) => p.text)
      .map((p: { text: string }) => p.text)
      .join('') || 'Dạ xin lỗi anh/chị, em chưa hiểu rõ câu hỏi. Anh/chị có thể hỏi lại được không ạ?'

    return NextResponse.json({ reply })
  } catch (e) {
    console.error('Chat API error:', e)
    return NextResponse.json(
      { error: 'Xin lỗi, đã có lỗi xảy ra. Anh/chị nhắn Zalo 0869308231 để được tư vấn ạ.' },
      { status: 500 }
    )
  }
}
