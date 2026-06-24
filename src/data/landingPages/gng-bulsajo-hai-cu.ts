import type { LandingPageContent } from '@/types/landingPage'

// Content theo đúng phác thảo user — KHÔNG sáng tạo thêm copy.
// User sẽ điền/sửa từng phần sau khi xem skeleton.

const lp: LandingPageContent = {
  productId: 'sp1777199378306',
  slug: 'gng-bulsajo-hai-cu',
  metaTitle: 'Gọng Bulsajo Hai Cầu | SONi Cắt Kính Online',
  metaDescription: 'Gọng Bulsajo Hai Cầu — SONi Cắt Kính Online.',
  accent: 'orange',
  heroImage: '/images/landing-pages/bulsajo/hero.png',

  navAnchors: [
    { label: 'Quà tặng', targetId: 'gifts' },
    { label: 'Nỗi đau & Giải pháp', targetId: 'pain-solution' },
    { label: 'Quy trình SONi', targetId: 'team' },
    { label: 'Bảng giá', targetId: 'pricing' },
    { label: 'Câu hỏi thường gặp', targetId: 'faq' },
  ],

  // ───────── 1. HERO ─────────
  hero: {
    title: 'Gọng Bulsajo Hai Cầu',
    subtitle: '[Lợi ích của sản phẩm — bạn điền sau]',
    ctaPrimary: { text: 'Mua Ngay', targetId: 'pricing' },
  },

  // ───────── 2. QUÀ TẶNG ─────────
  gifts: {
    title: 'Mua Ngay Và Nhận 3 Quà Tặng Sau',
    items: [
      {
        name: 'Bộ 3 Ebook',
        desc: 'Giúp bạn không bị tăng độ cận thêm nữa.',
        value: '[... VNĐ]',
        ctaText: 'Mua Ngay',
        ctaTargetId: 'pricing',
      },
      {
        name: 'Sổ Y Bạ điện tử',
        desc: '[Lợi ích — bạn điền sau]',
        value: '[... VNĐ]',
        ctaText: 'Mua Ngay',
        ctaTargetId: 'pricing',
      },
      {
        name: 'Bộ Kit vệ sinh kính toàn diện',
        desc: '[Mô tả — bạn điền sau]',
        value: '[... VNĐ]',
        ctaText: 'Mua Ngay',
        ctaTargetId: 'pricing',
      },
    ],
  },

  // ───────── 3. NỖI ĐAU ↔ GIẢI PHÁP ─────────
  painSolutionQA: {
    title: 'Lồng Ghép Nỗi Đau Và Giải Pháp',
    items: [
      {
        pain: {
          question: '[Câu hỏi khơi gợi nỗi đau 1]',
          text: '[Nội dung mô tả nỗi đau — bạn điền sau]',
          image: '/images/landing-pages/bulsajo/before-1.png',
        },
        solution: {
          title: '[Giải pháp 1]',
          text: '[Nội dung giải pháp — bạn điền sau]',
          image: '/images/landing-pages/bulsajo/after-1.png',
        },
      },
      {
        pain: {
          question: '[Câu hỏi khơi gợi nỗi đau 2]',
          text: '[Nội dung mô tả nỗi đau — bạn điền sau]',
          image: '/images/landing-pages/bulsajo/before-2.png',
        },
        solution: {
          title: '[Giải pháp 2]',
          text: '[Nội dung giải pháp — bạn điền sau]',
          image: '/images/landing-pages/bulsajo/after-2.png',
        },
      },
    ],
    aiSuggestion: {
      question: 'Khách hàng không biết có hợp dáng gọng này không, khuôn mặt khách hàng hình gì, hợp loại nào?',
      text: 'Hãy nhờ sự tư vấn của AI phân tích kiểu dáng chuẩn mặt.',
      ctaText: 'AI Tư Vấn Dáng Gọng',
      ctaHref: '/thu-kinh',
    },
  },

  // ───────── 4. ĐỘI NGŨ + 5 BƯỚC + TẦM QUAN TRỌNG ─────────
  team: {
    title: 'Kỹ Thuật Viên 10 Năm Trong Nghề — Hàng Ngàn Chiếc Kính Đã Cắt Online Gửi Đến Tay Khách',
    subtitle: 'SONi có quy trình bài bản 5 bước:',
    steps: [
      { num: 1, title: 'Nhận đơn', desc: '[Mô tả ngắn — bạn điền sau]' },
      { num: 2, title: 'Kiểm tra thông số', desc: '[Mô tả ngắn — bạn điền sau]' },
      { num: 3, title: 'Lắp ráp', desc: '[Mô tả ngắn — bạn điền sau]' },
      { num: 4, title: 'Kiểm định', desc: '[Mô tả ngắn — bạn điền sau]' },
      { num: 5, title: 'Giao và bảo hành', desc: '[Mô tả ngắn — bạn điền sau]' },
    ],
    importanceBlock: {
      title: 'Cắt Kính Cận Rất Quan Trọng',
      text: 'Kính của bạn sẽ được làm cá nhân hoá với máy móc hiện đại — không lo bị rơi mắt, lệch tâm, sai trục loạn, sai độ.',
      ctaText: 'Mua Ngay',
      ctaTargetId: 'pricing',
    },
  },

  // ───────── 5. PERSONAS ─────────
  personas: {
    title: 'Lý Do Tại Sao Mọi Người Mua Gọng Và Cắt Kính Online Tại SONi',
    items: [
      {
        initial: 'A',
        name: 'Anh A',
        age: 30,
        role: 'Nhân viên văn phòng',
        location: 'Nghệ An',
        quote: '[Quote khách — bạn điền sau]',
      },
      {
        initial: 'B',
        name: 'Chị B',
        age: 24,
        role: 'Giáo viên',
        location: '[Khu vực]',
        quote: '[Quote khách — bạn điền sau]',
      },
      {
        initial: 'C',
        name: 'Chị C',
        age: 28,
        role: 'Công nhân tại Samsung',
        location: 'Bắc Ninh',
        quote: '[Quote khách — bạn điền sau]',
      },
      {
        initial: 'H',
        name: 'Em H',
        age: 18,
        role: 'Học sinh lớp 12',
        location: '[Khu vực]',
        quote: '[Quote khách — bạn điền sau]',
      },
    ],
  },

  // ───────── 6. BẢNG GIÁ ─────────
  pricing: {
    title: 'Mua Gọng Kính Bulsajo',
    subtitle: 'Bạn có thể đặt riêng gọng, hoặc đặt trọn bộ gọng + tròng để tiết kiệm chi phí.',
    packages: [
      {
        name: 'Chỉ Mua Gọng',
        tagline: '',
        price: 620000,
        originalPrice: 890000,
        features: [
          'Sản phẩm',
          'Bảo hành 12 tháng',
          'Đổi trả 7 ngày miễn phí',
          'Quà tặng',
        ],
        ctaText: 'Mua Ngay',
        preset: { type: 'no-lens' },
      },
      {
        name: 'Combo Trọn Bộ Trung Cấp',
        tagline: 'Chỉ từ 750.000đ',
        price: 750000,
        features: [
          'Trọn bộ gọng',
          'Tròng chống ánh sáng xanh',
        ],
        ctaText: 'Mua Ngay',
        highlighted: true,
        preset: { type: 'lens-category', categoryId: 'blue' },
      },
      {
        name: 'Combo Cao Cấp',
        tagline: 'Chỉ từ 1.190.000đ',
        price: 1190000,
        features: [
          '[Tính năng — bạn điền sau]',
        ],
        ctaText: 'Mua Ngay',
        preset: { type: 'lens-category', categoryId: 'mong' },
      },
    ],
  },

  // ───────── 7. CAM KẾT ─────────
  guarantees: {
    title: 'Cam Kết Của SONi',
    items: [
      {
        icon: '🛠️',
        title: 'Làm sản phẩm cho khách hàng cẩn thận, chỉn chu',
        desc: '',
      },
      {
        icon: '🛡️',
        title: 'Bảo hành 1 năm + Đổi độ miễn phí trong 30 ngày',
        desc: '',
      },
      {
        icon: '✅',
        title: 'Sản phẩm chính hãng',
        desc: '',
      },
    ],
  },

  // ───────── 8. FAQ ─────────
  faq: {
    title: 'Câu Hỏi Thường Gặp',
    items: [
      {
        q: 'Shop có cắt kính cận không?',
        a: 'Shop có cắt kính cận online, bạn đặt hàng và làm theo hướng dẫn. Khai báo thông số độ để SONi lên đơn.',
      },
      {
        q: 'Tôi không biết độ của mình?',
        a: 'Bạn cần đi đến cơ sở uy tín để đo mắt và lấy thông số độ của mình. Bạn cũng có thể lưu lại số độ vào Sổ Y Bạ của SONi để dùng cho những lần sau.',
      },
      {
        q: 'Chiết suất là gì?',
        a: '[Bạn điền câu trả lời sau]',
      },
      {
        q: 'Độ của tôi phù hợp chiết suất nào?',
        a: '[Bạn điền câu trả lời sau]',
      },
      {
        q: 'Làm sao để tôi đổi trả hàng?',
        a: 'Bạn liên hệ Zalo hỗ trợ của SONi 0869.30.82.31 để được hướng dẫn.',
      },
      {
        q: 'Tôi cắt kính rồi mà không ưng có đổi được không?',
        a: 'Nếu bạn không ưng, SONi hỗ trợ đổi sang sản phẩm khác chỉ với 30% chi phí.',
      },
    ],
  },

  // ───────── 9. FINAL CTA ─────────
  finalCta: {
    title: '[Tiêu đề chốt cuối — bạn điền sau]',
    subtitle: '[Future fork — bạn điền sau]',
    ctaText: 'Mua Ngay',
    microcopy: '',
  },
}

export default lp
