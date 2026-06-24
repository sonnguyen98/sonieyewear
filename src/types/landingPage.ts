// Schema cho landing page chạy ads — mỗi mẫu gọng 1 file content
// Cấu trúc 10 phần (v2): Top Nav → Hero → Quà tặng → Q&A Pain/Solution → Đội ngũ + Quy trình →
// Personas → Pricing → Cam kết → FAQ → Final CTA + Sticky bottom CTA mobile.

// Khi khách bấm "Đặt hàng" từ thẻ giá, OrderModal mở thẳng đến bước phù hợp với gói đó.
// - 'no-lens'      → bỏ qua chọn tròng, đi thẳng bước điền thông tin thanh toán
// - 'lens-list'    → vào màn hình chọn nhóm tròng (đầy đủ Trắng/Xanh/Đổi màu/Phân cực/Mỏng)
// - 'lens-category'→ đi vào danh sách variants của một nhóm tròng cụ thể (vd: 'blue', 'mong')
// - 'da-trong'     → đi vào màn chọn đa tròng
export type LandingPagePreset =
  | { type: 'no-lens' }
  | { type: 'lens-list' }
  | { type: 'lens-category'; categoryId: string }
  | { type: 'da-trong' }

// Mục tiêu nội bộ để CTA cuộn tới — id của section
export type LpTargetId =
  | 'gifts'
  | 'pain-solution'
  | 'team'
  | 'personas'
  | 'pricing'
  | 'guarantees'
  | 'faq'
  | 'final-cta'

export interface LandingPageContent {
  // Liên kết tới sản phẩm trên hệ thống (id từ /api/products)
  productId: string
  // Slug LP để route /lp/[slug] — không liên quan tới product.slug
  slug: string
  // SEO
  metaTitle: string
  metaDescription: string
  // Tông accent (mặc định cam ấm cho LP, override nếu sản phẩm cần tông khác)
  accent?: 'orange' | 'red' | 'blue' | 'green' | 'gold'
  // Ảnh override — nếu không set thì lấy product.images[0]
  heroImage?: string

  // Anchor menu trên top nav
  navAnchors?: { label: string; targetId: LpTargetId }[]

  hero: {
    eyebrow?: string
    title: string
    titleHighlight?: string
    subtitle: string
    // CTA chính cứng — luôn cuộn tới 1 section
    ctaPrimary: { text: string; targetId: LpTargetId }
    // CTA phụ mềm (optional) — vd "AI tư vấn dáng gọng"
    ctaSecondary?: { text: string; href?: string; targetId?: LpTargetId }
    ctaMicrocopy: string
    trustStrip: string[]
  }

  // SECTION 2 — 3 Quà tặng tặng kèm
  gifts: {
    eyebrow?: string
    title: string
    subtitle?: string
    items: {
      icon?: string
      name: string
      desc: string
      value?: string
      image?: string
      ctaText: string
      ctaTargetId: LpTargetId
    }[]
  }

  // SECTION 3 — Q&A Nỗi đau ↔ Giải pháp (lồng ghép)
  painSolutionQA: {
    title: string
    subtitle?: string
    items: {
      pain: { question: string; text: string; image?: string }
      solution: { title: string; text: string; image?: string }
    }[]
    // Câu hỏi đặc biệt: không biết mặt mình hợp dáng gọng nào → AI tư vấn
    aiSuggestion?: {
      question: string
      text: string
      ctaText: string
      ctaHref?: string
      ctaTargetId?: LpTargetId
    }
  }

  // SECTION 4 — Đội ngũ + Quy trình 5 bước + Tầm quan trọng cắt kính cận
  team: {
    eyebrow?: string
    title: string
    subtitle?: string
    backgroundImage?: string
    steps: { num: number; icon?: string; title: string; desc: string }[]
    importanceBlock?: {
      title: string
      text: string
      ctaText?: string
      ctaTargetId?: LpTargetId
    }
  }

  // SECTION 5 — Personas mẫu (4-10 chân dung khách điển hình)
  personas: {
    title: string
    subtitle?: string
    items: {
      initial: string
      name: string
      age: number
      role: string
      location: string
      quote: string
    }[]
    note?: string
  }

  // SECTION 6 — Bảng giá 3 gói
  pricing: {
    title: string
    subtitle?: string
    packages: {
      name: string
      tagline: string
      price: number
      originalPrice?: number
      features: string[]
      ctaText: string
      highlighted?: boolean
      badge?: string
      preset?: LandingPagePreset
    }[]
    footnote?: string
  }

  // SECTION 7 — Cam kết SONi (ngắn, brevity rule)
  guarantees: {
    title: string
    subtitle?: string
    items: { icon: string; title: string; desc: string }[]
  }

  // SECTION 8 — FAQ
  faq: {
    title: string
    items: { q: string; a: string }[]
  }

  // SECTION 9 — Chốt cuối (Future fork)
  finalCta: {
    title: string
    subtitle: string
    ctaText: string
    microcopy: string
  }
}
