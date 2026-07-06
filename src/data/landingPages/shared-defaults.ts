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
      name: 'Sổ Theo Dõi Độ Điện Tử',
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

export const DEFAULT_OBJECTIONS: LandingPageContent['objections'] = {
  eyebrow: 'Băn khoăn lớn nhất khi mua kính online',
  title: '"Mua online thì sao cắt đúng độ được?"',
  subtitle: 'Ai cũng lo điều này. Cùng xem thực tế SONi xử lý ra sao.',
  items: [
    {
      you: 'Không đo mắt trực tiếp thì làm sao cắt đúng độ cho tôi?',
      reality: 'Bạn **chụp ảnh đơn kính cũ** hoặc tự điền thông số, xưởng cắt theo đúng số đó. Chưa có đơn? Bạn cần đến cơ sở đo mắt uy tín để lấy số độ trước — sau đó lưu vào **Sổ Theo Dõi Độ SONi** dùng mãi cho lần sau.',
    },
    {
      you: 'Lỡ cắt sai độ, đeo vào nhức mắt thì mất tiền oan.',
      reality: 'Cắt sai so với thông số bạn cung cấp, **SONi làm lại miễn phí**. Trong 30 ngày đầu, **đổi độ cũng miễn phí** nếu chưa hợp.',
    },
    {
      you: 'Gọng nhìn trên mạng đẹp, về tay không vừa mặt thì sao?',
      reality: 'Mỗi gọng có **thông số kích thước rõ ràng** và có AI gợi ý dáng hợp khuôn mặt. Chưa ưng, bạn được **đổi trả trong 7 ngày**.',
    },
    {
      you: 'Tròng cắt riêng phải cọc trước — nhỡ có chuyện gì?',
      reality: 'Tròng cắt **riêng theo đúng độ của bạn**, không dùng lại cho ai khác được — nên cần cọc để xưởng vào việc. Đổi lại: **bảo hành 1 năm** và **đổi độ 30 ngày**.',
    },
  ],
}

export const DEFAULT_PROCESS: LandingPageContent['process4Steps'] = {
  eyebrow: 'Đơn giản hơn bạn nghĩ',
  title: 'Mua kính online tại SONi chỉ 4 bước',
  subtitle: 'Từ lúc chọn gọng đến khi cầm kính trên tay, mọi thứ gói gọn trong vài phút.',
  steps: [
    { n: 1, title: 'Chọn gọng', desc: 'Duyệt shop hoặc nhờ AI gợi ý dáng gọng hợp khuôn mặt. Chưa chắc, nhắn Zalo để được tư vấn.' },
    { n: 2, title: 'Khai độ', desc: 'Tự điền thông số hoặc chụp ảnh đơn kính gửi lên. Chưa có đơn? Đến cơ sở đo mắt uy tín lấy số độ trước, rồi quay lại đặt.' },
    { n: 3, title: 'Xưởng cắt chuẩn độ', desc: 'Khúc xạ viên 10 năm cắt tròng theo đúng thông số của bạn, lắp vào gọng và kiểm tra kỹ.' },
    { n: 4, title: 'Nhận kính tận nhà', desc: 'Giao toàn quốc 2–4 ngày. Sai độ so với đơn — làm lại miễn phí. Đổi độ trong 30 ngày.' },
  ],
  ctaText: 'Đặt Hàng Ngay',
}

export const DEFAULT_COMPARISON: LandingPageContent['comparison'] = {
  eyebrow: 'Vì sao chọn SONi',
  title: 'Cùng một bộ kính — khác nhau ở đâu?',
  subtitle: 'So sánh cắt kính online tại SONi với đi tiệm truyền thống.',
  rows: [
    { label: 'Giá bộ kính', soni: 'Giá xưởng, không gánh mặt bằng', shop: 'Cộng chi phí mặt bằng, nhân viên', soniOk: true, shopOk: false },
    { label: 'Đi lại', soni: 'Đặt tại nhà, giao tận nơi', shop: 'Phải ra tiệm, có khi 2 lần', soniOk: true, shopOk: false },
    { label: 'Khai / lưu độ', soni: 'Chụp ảnh đơn · lưu Sổ Theo Dõi Độ online', shop: 'Lần sau thường phải đo lại', soniOk: true, shopOk: false },
    { label: 'Cắt đúng độ', soni: 'Khúc xạ viên 10 năm · sai làm lại free', shop: 'Tùy tay nghề từng tiệm', soniOk: true, shopOk: true },
    { label: 'Đổi độ / bảo hành', soni: 'Đổi độ 30 ngày · bảo hành 1 năm', shop: 'Chính sách không đồng nhất', soniOk: true, shopOk: false },
  ],
  note: 'Bạn vẫn được thử & đổi: chưa ưng gọng, đổi trả trong 7 ngày.',
}

export const DEFAULT_GUARANTEES: LandingPageContent['guarantees'] = {
  title: 'Rủi Ro Thuộc Về SONi, Không Phải Bạn',
  subtitle: 'Cắt sai độ so với đơn của bạn — SONi làm lại miễn phí. Đeo chưa hợp — đổi độ trong 30 ngày. Mỗi chiếc kính bảo hành 1 năm.',
  items: [
    { icon: '🔄', title: 'Sai độ làm lại miễn phí', desc: '' },
    { icon: '📅', title: 'Đổi độ 30 ngày', desc: '' },
    { icon: '↩️', title: 'Đổi trả gọng 7 ngày', desc: '' },
    { icon: '🛡️', title: 'Bảo hành 1 năm', desc: '' },
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
      a: 'Bạn cần đi đến cơ sở uy tín để đo mắt và lấy thông số độ của mình. Bạn cũng có thể lưu lại số độ vào Sổ Theo Dõi Độ của SONi để dùng cho những lần sau.',
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
