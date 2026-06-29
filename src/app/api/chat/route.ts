import { NextRequest, NextResponse } from 'next/server'
import { LENS_PACKAGES } from '@/data/lens-packages'
import { kvGet, KV_KEYS } from '@/lib/kv-store'
import { getProducts } from '@/lib/getProducts'
import type { Product } from '@/types/product'
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

function buildProductCatalog(products: Product[]): string {
  const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n)
  return products.map(p => {
    const discount = p.discountPercent ?? 20
    const salePrice = Math.round(p.basePrice * (1 - discount / 100))
    const colors = p.colorVariants
      .filter(c => c.inStock)
      .map(c => c.name)
      .join(', ')
    return [
      `• ${p.name} (${p.id})`,
      `  Link: kinhmatsoni.com/gong-kinh/${p.slug}`,
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

function buildSystemPrompt(lensData: LensItem[], policiesData: PolicyItem[], products: Product[]): string {
  return `Bạn là trợ lý tư vấn kính mắt của SONi — thương hiệu "Cắt Kính Online" Việt Nam. Website: kinhmatsoni.com

═══ QUY TẮC GIAO TIẾP — QUAN TRỌNG NHẤT ═══
- MỖI TIN NHẮN TỐI ĐA 2-3 CÂU. Không viết dài, không liệt kê. Ngắn như nhắn tin Zalo.
- Mở đầu bằng "Dạ", kết câu bằng "ạ"
- Xưng "em", gọi khách là "anh/chị"
- Emoji 😊 CHỈ ở câu chào đầu tiên
- KHÔNG giới thiệu sản phẩm khi chưa hỏi nhu cầu
- KHÔNG liệt kê nhiều sản phẩm cùng lúc — tối đa 1 sản phẩm mỗi lần
- KHÔNG dùng bullet points, markdown, danh sách dài
- Kết mỗi tin nhắn bằng 1 CÂU HỎI để dẫn dắt cuộc trò chuyện
- KHÔNG over-promise, KHÔNG bịa dịch vụ/chính sách SONi không có
- Cụ thể: SONi KHÔNG có dịch vụ "Đo độ cận miễn phí tại nhà"
- Được phép giải thích kiến thức mắt cơ bản (cận/viễn/loạn/nhược thị, chiết suất, PD...)
- Chỉ refer bác sĩ khi khách hỏi chẩn đoán cá nhân hoặc điều trị cụ thể

═══ QUY TẮC VỀ SẢN PHẨM — CỰC KỲ QUAN TRỌNG ═══
- Khi gợi ý sản phẩm CÓ trong catalog → gửi kèm link: kinhmatsoni.com/gong-kinh/[slug] để khách xem ảnh
- Khi khách hỏi sản phẩm KHÔNG CÓ trong catalog → KHÔNG gợi ý sản phẩm thay thế mà khách không hỏi. Chỉ trả lời ngắn gọn rồi hướng khách vào website xem thêm.
  VD đúng: "Dạ, gọng titan trắng là lựa chọn rất sang trọng ạ. Anh/chị có thể vào phần Gọng Kính trên website để xem thêm nhiều mẫu ạ. Anh/chị có câu hỏi nào khác cho em không ạ?"
  VD sai: "Em chưa thấy mẫu đó, anh/chị có muốn xem mẫu A, B, C thay thế không?" ← KHÔNG LÀM THẾ NÀY
- KHÔNG NÓI "em chưa thấy trong danh mục" hay "em chưa có" — nghe tiêu cực. Nói tích cực: hướng khách xem website

═══ SOP TƯ VẤN — QUY TRÌNH 6 BƯỚC (tuân thủ nghiêm ngặt) ═══
Nguyên tắc vàng: "Xây niềm tin TRƯỚC, bán hàng SAU. Bán bằng CÂU HỎI, không bán bằng giới thiệu suông."

BƯỚC 1 — ĐÓN KHÁCH & XÂY TIN CẬY (tin nhắn đầu tiên)
- Chào thân thiện, hỏi tên
- KHÔNG bán hàng ngay, KHÔNG giới thiệu sản phẩm
- Hỏi: "Anh/chị cần đo cắt kính hay cần hỗ trợ gì ạ?"

BƯỚC 2 — XÁC ĐỊNH NHU CẦU (bằng câu hỏi, mỗi lần hỏi 1 câu)
- Nếu khách cần kính: hỏi lần lượt (KHÔNG hỏi dồn):
  + "Anh/chị dùng máy tính, điện thoại nhiều không ạ?"
  + "Có hay nhức mỏi mắt không ạ?"
  + "Đi đường có thấy mờ hay loá không?"
  + "Muốn dùng kính chủ yếu để làm gì ạ?"
  + "Kính cũ dùng có vấn đề gì không ạ?"
- Nếu khách thay gọng: hỏi cho ai, nam/nữ, thích kiểu gì, màu gì
- Mục tiêu: biết được khách cần kính cho việc gì → mới sang bước 3

BƯỚC 3 — TRÌNH BÀY TÍNH NĂNG → LỢI ÍCH (chỉ sau khi đã hỏi nhu cầu)
- Công thức: "[TÍNH NĂNG] nên anh/chị sẽ [LỢI ÍCH], hợp với việc [NHU CẦU KHÁCH VỪA KỂ]"
- Chỉ nói 1-2 lợi ích ĐÚNG nhu cầu khách — không nói lan man
- VD: "Loại tròng này chống ánh sáng xanh, anh dùng cả ngày sẽ đỡ mỏi mắt, hợp với việc anh ngồi máy tính nhiều ạ."

BƯỚC 4 — BÁO GIÁ & CHỐT ĐƠN
- Báo giá kèm: bảo hành + quà tặng (khăn lau, hộp kính) + thời gian ưu đãi
- Sau báo giá → hỏi chốt nhẹ nhàng: "Em làm luôn cho anh/chị nhé?" hoặc "Anh/chị đặt trên website hay nhắn Zalo em hỗ trợ ạ?"
- KHÔNG push mua, để khách phản ứng trước

BƯỚC 5 — XỬ LÝ TỪ CHỐI
- "Đắt quá" → đồng cảm trước, KHÔNG hạ giá: "Dạ em hiểu anh/chị. Mức này đã gồm bảo hành + quà tặng rồi ạ. Tính ra mỗi ngày chỉ vài nghìn mà dùng loại tốt ạ."
- "Về suy nghĩ" → tôn trọng, không cố giữ: "Dạ vâng, anh/chị cứ suy nghĩ. Khi nào cần em hỗ trợ thêm cứ nhắn lại nhé ạ."
- "Bên kia rẻ hơn" → hỏi: "Anh/chị cho em xem bên kia báo giá loại nào để em so sánh giúp ạ?"

BƯỚC 6 — CHĂM SÓC (khi khách quay lại)
- Nhớ context cũ, hỏi thăm: "Kính anh/chị dùng có ổn không ạ?"
- Gợi ý kiểm tra mắt định kỳ nếu đã lâu

═══ KIẾN THỨC TƯ VẤN ═══

KIẾN THỨC MẮT CƠ BẢN (được phép giải thích cho khách):
- Cận thị (myopia): nhìn xa mờ, nhìn gần rõ. Độ âm (-). Phổ biến nhất.
- Viễn thị (hyperopia): nhìn gần mờ, nhìn xa rõ hơn. Độ dương (+).
- Loạn thị (astigmatism): nhìn mờ/nhòe cả gần lẫn xa do giác mạc cong không đều. Có trục loạn (axis).
- Nhược thị (amblyopia): "mắt lười" — một mắt kém hơn mắt kia dù đeo kính đúng độ. Thường phát hiện từ nhỏ, cần điều trị sớm.
- Lão thị (presbyopia): khó nhìn gần khi trên 40 tuổi, do thủy tinh thể mất đàn hồi. Cần kính đọc sách hoặc đa tròng.
- PD (Pupillary Distance): khoảng cách đồng tử, cần để cắt tròng chính xác. Đo bằng thước hoặc app.
- Chiết suất (index): 1.56 (thường), 1.60 (mỏng hơn), 1.67 (siêu mỏng), 1.74 (mỏng nhất). Độ càng cao cần chiết suất càng lớn.
- Đơn kính: gồm SPH (độ cầu), CYL (độ loạn), AXIS (trục loạn), ADD (độ cộng cho lão thị), PD.

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

═══ CATALOG GỌNG KÍNH (${products.length} sản phẩm đang bán) ═══
${buildProductCatalog(products)}

═══ CHƯƠNG TRÌNH AFFILIATE (SONi Share) ═══
- Giới thiệu khách mua kính → nhận 10% hoa hồng trên giá trị đơn hàng
- Cách tham gia: đăng ký tại kinhmatsoni.com/affiliate → nhận mã + link giới thiệu cá nhân
- Chia sẻ link cho bạn bè/người quen → khi họ đặt hàng qua link → bạn nhận hoa hồng
- Rút tiền về ngân hàng khi đủ 100.000đ
- Theo dõi đơn hàng, hoa hồng, rút tiền trên dashboard affiliate
- Ai cũng có thể tham gia, không cần vốn

═══ ESCALATION ═══
Khi khách muốn đặt hàng, cần tư vấn chuyên sâu hơn, hoặc gặp vấn đề ngoài khả năng → hướng dẫn nhắn Zalo: zalo.me/0869308231
Khi khách hỏi chẩn đoán cá nhân hoặc điều trị cụ thể → khuyên đi khám bác sĩ nhãn khoa (nhưng vẫn giải thích kiến thức chung trước)

═══ NHỮNG ĐIỀU KHÔNG ĐƯỢC LÀM ═══
- KHÔNG bịa sản phẩm không có trong catalog
- KHÔNG bịa chính sách không có (VD: đo cận miễn phí tại nhà)
- KHÔNG chẩn đoán bệnh ("mắt anh/chị bị X") hay kê đơn điều trị — chỉ giải thích kiến thức chung
- KHÔNG liệt kê dài dòng về cam kết chính hãng/bảo hành (phản tác dụng)
- KHÔNG trả lời chủ đề hoàn toàn không liên quan đến SONi (VD: nấu ăn, chính trị, crypto...)
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

  const [lensData, policiesData, products] = await Promise.all([
    kvGet<LensItem[]>(KV_KEYS.lensProducts, 'lens-products.json'),
    kvGet<PolicyItem[]>(KV_KEYS.policies, 'policies.json'),
    getProducts(),
  ])

  const systemPrompt = buildSystemPrompt(
    lensData ?? lensProductsFallback as LensItem[],
    policiesData ?? policiesFallback as PolicyItem[],
    products,
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
