import { NextRequest, NextResponse } from 'next/server'
import { MERGED_PRODUCTS } from '@/data/products'
import { LENS_PACKAGES } from '@/data/lens-packages'
import { kvGet, KV_KEYS } from '@/lib/kv-store'
import policiesFallback from '@/data/policies.json'
import lensProductsFallback from '@/data/lens-products.json'

interface ChatMessage {
  role: 'user' | 'model'
  text: string
}

interface LensItem {
  id: string; name: string; desc: string; price: number
  badge: string; features: string[]; suitableFor?: string
  discountPercent?: number; free?: boolean
}

interface PolicyItem { id: string; title: string; icon: string; content: string }

function buildProductCatalog(): string {
  const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n)
  return MERGED_PRODUCTS.map(p => {
    const discount = p.discountPercent ?? 20
    const salePrice = Math.round(p.basePrice * (1 - discount / 100))
    const colors = p.colorVariants
      .filter(c => c.inStock)
      .map(c => c.name)
      .join(', ')
    return [
      `• ${p.name} (${p.id})`,
      `  Giá bán: ${fmt(salePrice)}đ (giảm ${discount}% từ ${fmt(p.basePrice)}đ)`,
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

function buildLensProducts(lensData: LensItem[]): string {
  return lensData.map(l => {
    const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n)
    const discount = l.discountPercent ?? 0
    const salePrice = discount > 0 ? Math.round(l.price * (1 - discount / 100)) : l.price
    const priceStr = discount > 0
      ? `${fmt(salePrice)}đ (giảm ${discount}% từ ${fmt(l.price)}đ)`
      : `${fmt(l.price)}đ`
    return [
      `• ${l.name} — ${priceStr}${l.free ? ' — MIỄN PHÍ khi mua gọng' : ''}`,
      `  ${l.desc}`,
      l.suitableFor ? `  Phù hợp: ${l.suitableFor}` : '',
      `  Tính năng: ${l.features.join(', ')}`,
      l.badge ? `  ${l.badge}` : '',
    ].filter(Boolean).join('\n')
  }).join('\n\n')
}

function buildPolicies(policiesData: PolicyItem[]): string {
  return policiesData.map(p => `• ${p.title}: ${p.content}`).join('\n')
}

function buildSystemPrompt(lensData: LensItem[], policiesData: PolicyItem[]): string {
  return `Bạn là trợ lý tư vấn kính mắt của SONi — thương hiệu "Cắt Kính Online" Việt Nam. Website: kinhmatsoni.com

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

CHƯƠNG TRÌNH GIẢM GIÁ:
- SONi ĐANG CÓ giảm giá cho cả gọng kính và tròng kính
- Giá bán thực tế đã được ghi rõ trong catalog bên dưới (đã trừ giảm giá)
- Khi khách hỏi "có giảm giá không" → trả lời CÓ và nêu % giảm + giá sau giảm

GIÁ KÍNH HOÀN CHỈNH = Giá bán gọng (đã giảm) + Giá bán tròng (đã giảm)

ĐƠN HÀNG & GIAO HÀNG:
- Đặt hàng trên website hoặc qua Zalo
- Cần cung cấp đơn kính (số độ cận/loạn/viễn, PD) để cắt tròng
- Giao hàng toàn quốc
- Thanh toán: chuyển khoản, MoMo, COD

═══ CHÍNH SÁCH ═══
${buildPolicies(policiesData)}
- Đổi trả 7 ngày CHỈ cho đơn GỌNG (chưa cắt tròng)
- Cắt kính: bảo hành 6 tháng
- Gọng: bảo hành 12 tháng lỗi kỹ thuật

═══ GÓI TRÒNG KHI ĐẶT GỌNG (add-on) ═══
${buildLensInfo()}

═══ DANH MỤC TRÒNG KÍNH (giá bán thực tế trên website) ═══
SONi bán tròng kính thương hiệu Chemi (Hàn Quốc) với 2 dòng:
- Chemi U2: chống ánh sáng xanh cơ bản
- Chemi U6: lọc ánh sáng xanh nâng cao, phủ AR chống chói
Mỗi dòng có 4 chiết suất: 1.56 (độ thấp), 1.60 (độ trung bình), 1.67 (độ cao), 1.74 (độ rất cao)

${buildLensProducts(lensData)}

HƯỚNG DẪN TƯ VẤN TRÒNG THEO ĐỘ:
- 0–3 độ → chiết suất 1.56 (rẻ nhất, đủ mỏng)
- 3–6 độ → chiết suất 1.60 (mỏng hơn 15%)
- 6–8 độ → chiết suất 1.67 (siêu mỏng)
- Trên 8 độ → chiết suất 1.74 (mỏng nhất hiện nay)
- Dùng màn hình nhiều → chọn dòng U6 (lọc ánh sáng xanh tốt hơn)
- Ngân sách tiết kiệm → chọn dòng U2

═══ CATALOG GỌNG KÍNH ═══
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
}

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

  const [lensData, policiesData] = await Promise.all([
    kvGet<LensItem[]>(KV_KEYS.lensProducts, 'lens-products.json'),
    kvGet<PolicyItem[]>(KV_KEYS.policies, 'policies.json'),
  ])

  const systemPrompt = buildSystemPrompt(
    lensData ?? lensProductsFallback as LensItem[],
    policiesData ?? policiesFallback as PolicyItem[],
  )

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: {
            maxOutputTokens: 2048,
            temperature: 0.7,
            topP: 0.9,
          },
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
          ],
        }),
      }
    )

    const data = await res.json().catch(() => null)

    if (!res.ok) {
      console.error('Gemini API error:', res.status, JSON.stringify(data))
      return NextResponse.json(
        { reply: 'Dạ xin lỗi anh/chị, hệ thống đang bận. Anh/chị thử lại sau giây lát hoặc nhắn Zalo 0869308231 để được tư vấn trực tiếp ạ.' },
      )
    }

    const candidate = data?.candidates?.[0]
    if (candidate?.finishReason === 'SAFETY') {
      return NextResponse.json({
        reply: 'Dạ anh/chị cho em hỏi rõ hơn về nhu cầu kính mắt được không ạ? Em sẵn sàng tư vấn gọng kính, tròng kính, hoặc chính sách bảo hành ạ.',
      })
    }

    const parts = candidate?.content?.parts ?? []
    const reply = parts
      .filter((p: { text?: string }) => p.text)
      .map((p: { text: string }) => p.text)
      .join('') || 'Dạ xin lỗi anh/chị, em chưa hiểu rõ câu hỏi. Anh/chị có thể hỏi lại được không ạ?'

    return NextResponse.json({ reply })
  } catch (e) {
    console.error('Chat API error:', e)
    return NextResponse.json(
      { reply: 'Dạ xin lỗi, đã có lỗi xảy ra. Anh/chị nhắn Zalo 0869308231 để được tư vấn ạ.' },
    )
  }
}
