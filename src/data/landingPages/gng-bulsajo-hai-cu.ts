import type { LandingPageContent } from '@/types/landingPage'
import {
  DEFAULT_NAV_ANCHORS,
  DEFAULT_GIFTS,
  DEFAULT_PERSONAS,
  DEFAULT_GUARANTEES,
  DEFAULT_FAQ,
  DEFAULT_FINAL_CTA,
  DEFAULT_SOCIAL_PROOF_TITLE,
  DEFAULT_SOCIAL_PROOF_SUBTITLE,
  DEFAULT_SOCIAL_PROOF_RATING,
  DEFAULT_SOCIAL_PROOF_TAGLINE,
  pickProofGallery,
} from './shared-defaults'

const lp: LandingPageContent = {
  productId: 'sp1777199378306',
  slug: 'gng-bulsajo-hai-cu',
  metaTitle: 'Gọng Bulsajo Hai Cầu | SONi Cắt Kính Online',
  metaDescription: 'Gọng Bulsajo Hai Cầu — SONi Cắt Kính Online.',
  accent: 'orange',
  heroImage: '/images/landing-pages/bulsajo/hero.png',

  navAnchors: DEFAULT_NAV_ANCHORS,

  // ───────── 1. HERO (riêng từng LP) ─────────
  hero: {
    title: 'Bulsajo Hai Cầu',
    titleHighlight: 'Đeo nhẹ cả ngày – nhìn trẻ hơn chỉ trong 5 giây',
    subtitle:
      'Khung Titan nhẹ bẫng — đeo từ sáng tới tối mà quên luôn là đang đeo kính, không tì đỏ sống mũi. Dáng 2 cầu lên mặt sang và cá tính, kiểu kính không đụng hàng. Lớp màu bền đẹp như mới cả năm, khung cứng cáp không lo cong gãy, lại ôm khít khuôn mặt nên cúi xuống cũng không tụt — bạn cứ làm việc, vận động thoải mái, không phải đẩy kính suốt ngày.',
    ctaPrimary: { text: 'Mua Ngay', targetId: 'pricing' },
  },

  // ───────── MÀU SẮC (đồng bộ từ admin) ─────────
  showColorGallery: true,
  colorGalleryTitle: 'Chọn Màu Yêu Thích',

  // ───────── 2. QUÀ TẶNG (dùng chung) ─────────
  gifts: DEFAULT_GIFTS,

  // ───────── 3. NỖI ĐAU ↔ GIẢI PHÁP (riêng từng LP) ─────────
  painSolutionQA: {
    title: 'Bạn Có Đang Gặp Những Tình Huống Này Mỗi Ngày Khi Đeo Kính?',
    subtitle: 'Nếu câu trả lời là CÓ, đã đến lúc bạn cần một chiếc kính tốt hơn.',
    items: [
      {
        pain: {
          question: 'Kính thường xuyên bị tuột xuống mặt?',
          text: 'Người liên tục đẩy kính lên',
          image: '/images/landing-pages/bulsajo/before-1.png',
        },
        solution: {
          title: 'Bulsajo Hai Cầu sẽ giúp bạn',
          text: 'Người tự tin làm việc',
          image: '/images/landing-pages/bulsajo/after-1.png',
          bullets: [
            'Kính ôm mặt chắc chắn hơn',
            'Không còn phải chỉnh kính liên tục',
            'Tự tin hơn trong giao tiếp',
          ],
        },
      },
      {
        pain: {
          question: 'Đeo kính lâu bị đau tai, hằn đỏ sống mũi?',
          text: 'Vết hằn đỏ trên mũi',
          image: '/images/landing-pages/bulsajo/before-2.png',
        },
        solution: {
          title: 'Bulsajo Hai Cầu sẽ giúp bạn',
          text: 'Đeo thoải mái cả ngày',
          image: '/images/landing-pages/bulsajo/after-2.png',
          bullets: [
            'Giảm áp lực lên tai và sống mũi',
            'Đeo nhiều giờ vẫn thoải mái',
            'Tập trung hơn vào công việc',
          ],
        },
      },
      {
        pain: {
          question: 'Chiếc kính hiện tại chưa thực sự phù hợp với bạn?',
          text: 'Ngoại hình nhạt nhòa',
          image: '/images/landing-pages/bulsajo/before-3.png',
        },
        solution: {
          title: 'Bulsajo Hai Cầu sẽ giúp bạn',
          text: 'Gương mặt sáng và có thần hơn',
          image: '/images/landing-pages/bulsajo/after-3.png',
          bullets: [
            'Tôn lên đường nét khuôn mặt',
            'Tăng sự tự tin khi xuất hiện',
            'Nâng tầm hình ảnh cá nhân',
          ],
        },
      },
    ],
    aiSuggestion: {
      question: 'Không biết khuôn mặt mình hợp dáng gọng nào?',
      text: 'Hãy nhờ AI phân tích kiểu dáng chuẩn mặt — chỉ mất vài giây.',
      ctaText: 'AI Tư Vấn Dáng Gọng',
      ctaHref: '/thu-kinh',
    },
  },

  // ───────── 4. SOCIAL PROOF (dùng chung, ảnh riêng) ─────────
  team: {
    title: DEFAULT_SOCIAL_PROOF_TITLE,
    subtitle: DEFAULT_SOCIAL_PROOF_SUBTITLE,
    rating: DEFAULT_SOCIAL_PROOF_RATING,
    tagline: DEFAULT_SOCIAL_PROOF_TAGLINE,
    gallery: pickProofGallery('/images/landing-pages/bulsajo'),
  },

  // ───────── 5. PERSONAS (dùng chung) ─────────
  personas: DEFAULT_PERSONAS,

  // ───────── 6. BẢNG GIÁ (riêng từng LP) ─────────
  pricing: {
    title: 'Mua Gọng Kính Bulsajo',
    subtitle: 'Bạn có thể đặt riêng gọng, hoặc đặt trọn bộ gọng + tròng để tiết kiệm chi phí.',
    packages: [
      {
        name: 'Chỉ Mua Gọng',
        tagline: '',
        price: 496000,
        originalPrice: 620000,
        features: [
          'Gọng kính Bulsajo chính hãng',
          'Bảo hành gọng 12 tháng',
          'Đổi trả 7 ngày miễn phí',
          'Bộ quà tặng trị giá 797.000đ',
        ],
        ctaText: 'Mua Ngay',
        preset: { type: 'no-lens' },
      },
      {
        name: 'Combo Cắt Kính Trung Cấp',
        tagline: 'Chỉ từ',
        price: 765000,
        features: [
          'Trọn bộ: Gọng Bulsajo + Tròng cắt theo độ',
          'Tròng chống ánh sáng xanh — đỡ mỏi mắt khi dùng máy tính/điện thoại',
          'Cắt chuẩn theo độ cận / loạn của bạn',
          'Bảo hành chính hãng 12 tháng',
          'Bộ quà tặng trị giá 797.000đ',
        ],
        ctaText: 'Mua Ngay',
        highlighted: true,
        badge: '⭐ Phổ biến nhất',
        preset: {
          type: 'lens-variants',
          title: 'Chọn tròng Trung Cấp',
          variantIds: ['trong-1777351205463', 'trong-blue', 'trong-1777351518112', 'trong-1777350715165'],
        },
      },
      {
        name: 'Combo Cắt Kính Cao Cấp',
        tagline: 'Chỉ từ',
        price: 1000000,
        features: [
          'Trọn bộ: Gọng Bulsajo + Tròng cao cấp cắt theo độ',
          'Miễn phí đổi độ trong 30 ngày',
          'Tròng chiết suất cao — mỏng & nhẹ hơn, đỡ dày cộm cho người độ cao',
          'Chống ánh sáng xanh + chống chói + hạn chế trầy xước',
          'Cắt chuẩn theo độ cận / loạn của bạn',
          'Bảo hành chính hãng 12 tháng',
          'Bộ quà tặng trị giá 797.000đ',
        ],
        ctaText: 'Mua Ngay',
        preset: {
          type: 'lens-variants',
          title: 'Chọn tròng Cao Cấp',
          variantIds: ['trong-1777351518112', 'trong-1777350715165', 'trong-1777351590911', 'trong-1777350853717', 'trong-1777351780295', 'trong-1777351004167'],
        },
      },
    ],
  },

  // ───────── 7–9. DÙNG CHUNG ─────────
  guarantees: DEFAULT_GUARANTEES,
  faq: DEFAULT_FAQ,
  finalCta: DEFAULT_FINAL_CTA,
}

export default lp
