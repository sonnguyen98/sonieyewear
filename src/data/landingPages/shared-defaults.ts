import type { LandingPageContent } from '@/types/landingPage'

export const DEFAULT_NAV_ANCHORS: LandingPageContent['navAnchors'] = [
  { label: 'Quà Tặng', targetId: 'gifts' },
  { label: 'Bảng Giá', targetId: 'pricing' },
  { label: 'Câu Hỏi Thường Gặp', targetId: 'faq' },
]

export const DEFAULT_GIFTS: LandingPageContent['gifts'] = {
  eyebrow: 'Ưu đãi đặc biệt',
  title: 'Đặt Hàng Hôm Nay — Nhận Ngay 3 Quà Tặng',
  subtitle: 'Tổng giá trị quà tặng lên đến 797.000đ — Hoàn toàn MIỄN PHÍ khi đặt hàng.',
  items: [
    {
      icon: '📚',
      name: 'Bộ 3 Ebook',
      desc: 'Cẩm nang chăm mắt tại nhà giúp bạn giữ mắt khỏe, dễ chịu và hạn chế tăng độ theo thời gian.',
      bullets: [
        '📘 21 Bài Tập Thư Giãn Mắt — Mỗi ngày vài phút, đánh tan mỏi mắt – khô – căng tức sau giờ làm việc với màn hình.',
        '📗 Bí Mật Giữ Độ Ổn Định — Những thói quen đơn giản hằng ngày để hạn chế độ cận tăng nhanh, đỡ phải đổi kính liên tục.',
        '📙 Dinh Dưỡng Vàng Cho Đôi Mắt — Ăn đúng món, đúng cách để nuôi đôi mắt sáng khỏe từ bên trong.',
      ],
      value: '399.000đ',
      ctaText: 'Mua Ngay Để Nhận Quà',
      ctaTargetId: 'pricing',
    },
    {
      icon: '📋',
      name: 'Sổ Y Bạ Điện Tử',
      desc: 'Lưu lại toàn bộ thông số mắt & lịch sử cắt kính của bạn — tra cứu mọi lúc, lần sau đặt kính nhanh gọn, không lo quên độ.',
      subdesc: 'Theo dõi độ cận qua từng giai đoạn để chủ động chăm mắt kịp thời.',
      value: '249.000đ',
      ctaText: 'Mua Ngay Để Nhận Quà',
      ctaTargetId: 'pricing',
    },
    {
      icon: '✨',
      name: 'Bộ Kit Vệ Sinh Kính',
      desc: 'Giữ tròng kính luôn trong veo như mới — sạch bụi, hết mờ, hạn chế trầy xước để kính bền đẹp và nhìn rõ hơn mỗi ngày.',
      subdesc: 'Đầy đủ dụng cụ lau kính chuẩn, dùng ngay tại nhà.',
      value: '149.000đ',
      ctaText: 'Mua Ngay Để Nhận Quà',
      ctaTargetId: 'pricing',
    },
  ],
}

export const DEFAULT_PERSONAS: LandingPageContent['personas'] = {
  title: 'Lý Do Tại Sao Mọi Người Mua Gọng Và Cắt Kính Online Tại SONi',
  items: [
    {
      initial: 'T',
      avatar: '/images/landing-pages/bulsajo/personas/anh-den-ngau-006.jpg',
      name: 'tu**ng_2k',
      age: 30,
      role: '',
      location: '',
      quote: 'Đeo 4h mới viết đánh giá. Mình không nhớ rõ độ cận, nói nhắm chừng mà thợ cắt y chang. Kính đeo không nhức mắt, không chóng mặt — nhẹ, sáng và đẹp.',
    },
    {
      initial: 'L',
      avatar: '/images/landing-pages/bulsajo/personas/anh-den-ngau-014.jpg',
      name: 'l*nh.tr**n',
      age: 24,
      role: '',
      location: '',
      quote: 'Lần thứ 3 mua gọng kính của shop. Chất lượng tốt, giá rất hợp lý. Ưu điểm lớn nhất là chủ shop tư vấn rất nhiệt tình.',
    },
    {
      initial: 'H',
      avatar: '/images/landing-pages/bulsajo/personas/anh-den-ngau-016.jpg',
      name: 'h**ng.nt',
      age: 28,
      role: '',
      location: '',
      quote: 'Shop tư vấn rất nhiệt tình, chăm sóc khách hàng tốt. Kính như ngoài tiệm nhưng rẻ hơn rất nhiều, chất lượng ok lắm.',
    },
    {
      initial: 'M',
      avatar: '/images/landing-pages/bulsajo/personas/anh-den-ngau-017.jpg',
      name: 'm*nh_hsk',
      age: 18,
      role: '',
      location: '',
      quote: 'Tròng rất trong, shop cắt chuẩn độ nên nhìn nét căng. Chất lượng hoàn thiện rất đẹp — nhận hàng còn đẹp hơn trong ảnh.',
    },
  ],
}

export const DEFAULT_GUARANTEES: LandingPageContent['guarantees'] = {
  title: 'Cam Kết Của SONi',
  items: [
    { icon: '🛠️', title: 'Làm sản phẩm cho khách hàng cẩn thận, chỉn chu', desc: '' },
    { icon: '🛡️', title: 'Bảo hành 1 năm + Đổi độ miễn phí trong 30 ngày', desc: '' },
    { icon: '✅', title: 'Sản phẩm chính hãng', desc: '' },
  ],
}

export const DEFAULT_FAQ: LandingPageContent['faq'] = {
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
      a: 'Là độ mỏng nhẹ của tròng kính. Chiết suất càng cao, tròng càng mỏng và nhẹ — đeo đẹp hơn, nhất là với người độ cao.',
    },
    {
      q: 'Độ của tôi phù hợp chiết suất nào?',
      a: 'Độ nào cũng cắt được, nhưng chiết suất càng cao thì tròng càng mỏng – nhẹ – đẹp:\n• Dưới 2 độ: 1.56 là đủ — nhưng nâng lên 1.61 sẽ mỏng và nhẹ hơn rõ, đeo cả ngày không mỏi.\n• 2–4 độ: nên chọn 1.61 trở lên cho gọn gàng.\n• Trên 4 độ: 1.67+ để tránh dày cộm.\n\n👉 Mẹo từ SONi: nhiều khách cận nhẹ vẫn chọn chiết suất cao vì tròng mỏng nhìn sang và tinh tế hơn hẳn — nhất là với gọng khoan không viền. Chênh nhẹ chi phí nhưng đeo lên khác hẳn.',
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
}

export const DEFAULT_FINAL_CTA: LandingPageContent['finalCta'] = {
  title: 'Đặt Kính Ngay — Giao Tận Nhà',
  subtitle: 'Đổi trả 7 ngày · Bảo hành 1 năm · Freeship toàn quốc',
  ctaText: 'Đặt Hàng Ngay →',
  microcopy: 'Hoặc nhắn Zalo 0869.30.82.31 để được tư vấn miễn phí',
}

// Social proof dùng chung — ảnh từ folder shared, random 9 ảnh mỗi LP
export const DEFAULT_SOCIAL_PROOF_TITLE = 'Hơn 1.000 Khách Hàng Đã Tin Tưởng Đặt Kính Tại SONi'
export const DEFAULT_SOCIAL_PROOF_SUBTITLE = 'Từ học sinh, sinh viên, nhân viên văn phòng đến chủ doanh nghiệp trên khắp Việt Nam.'
export const DEFAULT_SOCIAL_PROOF_RATING = { score: '4.9/5', text: 'từ khách hàng đã mua kính tại SONi' }
export const DEFAULT_SOCIAL_PROOF_TAGLINE = 'Mỗi chiếc kính đều được cắt và lắp ráp theo thông số riêng của từng người.'

const PROOF_ALTS = [
  'Khách đeo kính thực tế',
  'Đơn hàng đã đóng gói',
  'Quá trình cắt kính',
  'Khách đeo kính thực tế',
  'Giao hàng tận nơi',
  'Feedback khách hàng',
  'Khách đeo kính thực tế',
  'Quá trình lắp ráp kính',
  'Feedback khách hàng',
]

export function pickProofGallery(folder: string, count = 9): { src: string; alt: string }[] {
  return Array.from({ length: count }, (_, i) => ({
    src: `${folder}/proof-${i + 1}.jpg`,
    alt: PROOF_ALTS[i % PROOF_ALTS.length],
  }))
}
