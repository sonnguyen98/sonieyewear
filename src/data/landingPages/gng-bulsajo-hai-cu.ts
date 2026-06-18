import type { LandingPageContent } from '@/types/landingPage'

const lp: LandingPageContent = {
  productId: 'sp1777199378306',
  slug: 'gng-bulsajo-hai-cu',
  metaTitle: 'Gọng Bulsajo Hai Cầu — Titanium 20g, đeo cả ngày không hằn mũi | SONi',
  metaDescription:
    'Gọng kính titanium IP 20 gram, thiết kế hai cầu phi công cách tân. Hợp mặt tròn, trái xoan. Giảm 30% còn 620k. Đổi trả 7 ngày, bảo hành 12 tháng, freeship.',
  accent: 'orange',
  heroImage: '/images/landing-pages/bulsajo/hero.png',
  storyImage: '/images/landing-pages/bulsajo/model-office.png',

  hero: {
    eyebrow: 'Bộ sưu tập Titanium 2026',
    title: 'Gọng kính chỉ 20 gram —',
    titleHighlight: 'đeo 14 tiếng vẫn quên là đang đeo kính',
    subtitle:
      'Titanium IP siêu nhẹ, thiết kế hai cầu phi công cách tân. Tôn nét nam tính cho mặt tròn và trái xoan. Đệm mũi silicon ôm khớp sống mũi — không tuột, không hằn, không đau tai.',
    ctaText: 'Đặt Gọng Bulsajo Ngay',
    ctaMicrocopy: 'Freeship toàn quốc · Đổi trả 7 ngày · COD · Bảo hành 12 tháng',
    trustStrip: [
      'Titanium IP cao cấp',
      'Chỉ 20 gram — nhẹ nhất phân khúc',
      'Bảo hành chính hãng 12 tháng',
      'Hôm nay giảm 30% còn 620.000đ',
    ],
  },

  story: {
    title: 'Bạn không khó chịu vì *đeo kính lâu*',
    intro:
      '8 giờ sáng. Bạn đeo cặp kính cũ, lên xe đi làm. Một ngày bình thường — bạn nghĩ vậy. Đây là chuyện xảy ra trong 14 tiếng kế tiếp.',
    breakingPoint: {
      timeLabel: '14:30 — Cuộc họp quan trọng',
      text: 'Sếp đang nhìn slide của bạn. Cả phòng im lặng. Đúng lúc bạn nghiêng đầu ghi chú — gọng kính trượt xuống mũi 2 phân. Theo phản xạ, tay phải đẩy lên. Sếp dừng nói. Mạch trình bày của bạn đứt. Bạn cười gượng. Cả phòng quay lại nhìn bạn.',
    },
    timeline: [
      {
        time: '08:00',
        label: 'Vẫn ổn',
        text: 'Bạn ra khỏi nhà. Chưa cảm thấy gì. Cặp kính cũ vẫn nằm trên sống mũi — bạn nghĩ đó là cảm giác bình thường của việc đeo kính.',
      },
      {
        time: '11:30',
        label: 'Sống mũi bắt đầu nóng',
        text: 'Cứ 30 phút bạn vô thức đưa tay lên day sống mũi một lần. Bạn không nhận ra mình đang làm điều đó — đến khi đồng nghiệp ngồi cạnh hỏi: "Kính khó chịu hả ông?"',
      },
      {
        time: '14:30',
        label: 'Gọng tuột giữa cuộc họp',
        text: 'Một giây mất tập trung — cả phòng nhìn về phía bạn. Bạn cười gượng, đẩy kính lên, cố nối lại mạch nói. Nhưng năng lượng đã rớt mất rồi.',
        isClimax: true,
      },
      {
        time: '18:00',
        label: 'Tai trái bắt đầu đau',
        text: 'Càng kính ép lên xương sau tai. Bạn tháo kính, ngồi đờ ra 5 phút trước màn hình. Nhìn vào màn hình bằng mắt thường thấy mờ — bạn đeo lại. Cảm giác đau vẫn còn.',
      },
      {
        time: '22:30',
        label: 'Tháo kính: hai vệt đỏ trên sống mũi',
        text: 'Bạn nhìn vào gương. Hai vết hằn đỏ rõ. Bạn tự hỏi: "Mình đeo kính lâu thành quen yếu hay sao?" Sáng mai, bạn vẫn sẽ đeo cặp kính đó.',
      },
    ],
    villain: {
      myth: 'Không phải bạn đeo kính lâu thành "quen yếu". Không phải sống mũi bạn "không hợp đeo gọng". Không phải bạn "đang già đi".',
      truth:
        'Thủ phạm là 35 gram nhựa rẻ ép xuống sống mũi 14 tiếng mỗi ngày. Và bộ đệm mũi cứng đã biến dạng sau 6 tháng đeo — nó không còn ôm khớp với sống mũi của bạn nữa.',
    },
    twist:
      'Suốt 6 tháng bạn nghĩ tại mình. Cho đến khi anh đồng nghiệp chuyển sang gọng titanium 20 gram — và bạn để ý anh ấy đeo nguyên ngày không động vào kính một lần nào.',
  },

  solution: {
    title: 'Vì sao Bulsajo gỡ được cả 4 vấn đề trên',
    subtitle:
      'Bulsajo không phải "gọng kính đẹp hơn". Nó được làm khác về chất liệu, kết cấu và đệm — để khắc phục đúng các nguyên nhân gây khó chịu khi đeo kính lâu.',
    items: [
      {
        icon: '🪶',
        featureLabel: 'TITANIUM IP — 20 GRAM',
        benefitTitle: 'Đeo cả ngày như không có gì trên mặt',
        mechanism:
          'Titanium nhẹ chỉ bằng 1/3 gọng nhựa thông thường. Lớp IP (Ion Plating) tăng độ cứng và chống ăn mòn từ mồ hôi. Sống mũi không hằn vì áp lực phân tán đều, không dồn một điểm.',
      },
      {
        icon: '🛡️',
        featureLabel: 'BỀN GẤP 3 LẦN THÉP',
        benefitTitle: 'Không gãy khi vô tình ngồi đè, không phai khi đeo dưới nắng',
        mechanism:
          'Titanium IP có độ cứng vượt trội — chịu được va đập nhẹ và rơi từ độ cao 1m. Không bị oxy hoá hay đổi màu dù đeo dưới mưa nắng nhiều năm. Đây là chất liệu các thương hiệu kính cao cấp Nhật/Hàn dùng.',
      },
      {
        icon: '✈️',
        featureLabel: 'THIẾT KẾ HAI CẦU PHI CÔNG',
        benefitTitle: 'Tôn nét nam tính cho mặt tròn và trái xoan',
        mechanism:
          'Cầu đôi (Double Bridge) cách tân từ kiểu phi công cổ điển — nhấn xương lông mày, kéo dài khuôn mặt theo phương ngang. Khuôn mặt tròn trở nên góc cạnh hơn, mặt trái xoan trở nên hài hoà hơn.',
      },
      {
        icon: '👃',
        featureLabel: 'ĐỆM MŨI SILICON ĐIỀU CHỈNH',
        benefitTitle: 'Không tuột dù nghiêng đầu, không đau dù đeo 12 tiếng',
        mechanism:
          'Đệm silicon mềm có thể uốn cong để khớp đúng sống mũi của bạn. Khác đệm cứng dùng chung cho mọi người — đệm này được điều chỉnh khi giao hàng và có thể chỉnh lại miễn phí tại cửa hàng SONi.',
      },
    ],
  },

  proof: {
    title: 'Thông số và đánh giá thực tế',
    stats: [
      { value: '20g', label: 'Trọng lượng tổng — nhẹ nhất phân khúc' },
      { value: '4.5★', label: 'Điểm đánh giá trung bình' },
      { value: '12', label: 'Tháng bảo hành chính hãng' },
      { value: '7', label: 'Ngày đổi trả miễn phí' },
    ],
    testimonials: [
      {
        name: '[Tên khách hàng 1]',
        role: '[Nghề nghiệp / khu vực]',
        text: '[Trải nghiệm thật của khách — sẽ thay sau khi nhận feedback. Ví dụ: "Cặp kính cũ tôi đeo 2 tiếng đã phải tháo ra. Bulsajo đeo từ 8 sáng đến 10 đêm không thấy khó chịu — đến lúc ngủ mới nhớ ra mình chưa tháo kính."]',
        rating: 5,
        isPlaceholder: true,
      },
      {
        name: '[Tên khách hàng 2]',
        role: '[Nghề nghiệp / khu vực]',
        text: '[Trải nghiệm thật của khách — sẽ thay sau khi nhận feedback. Ví dụ: "Mặt tròn nhưng đeo gọng vuông không hợp, gọng tròn thì trẻ con quá. Bulsajo 2 cầu vừa nam tính vừa hiện đại — đi làm hợp, đi chơi cũng hợp."]',
        rating: 5,
        isPlaceholder: true,
      },
      {
        name: '[Tên khách hàng 3]',
        role: '[Nghề nghiệp / khu vực]',
        text: '[Trải nghiệm thật của khách — sẽ thay sau khi nhận feedback. Ví dụ: "Đặt online lúc đầu hơi lo không vừa. Nhận hàng đeo thử thấy ổn ngay. Bên SONi gọi điện hỏi xem cần chỉnh đệm mũi không — chu đáo."]',
        rating: 4,
        isPlaceholder: true,
      },
    ],
    placeholderNote:
      'Phần đánh giá đang dùng nội dung mẫu để minh hoạ cấu trúc. Sẽ thay bằng feedback thật của khách hàng kèm ảnh sau khi đủ số lượng review.',
  },

  guarantees: {
    title: 'Bạn không có gì để mất khi thử Bulsajo',
    items: [
      {
        icon: '🔄',
        title: 'Đổi trả 7 ngày miễn phí',
        desc: 'Đeo thử tại nhà 7 ngày. Không vừa mặt, không hợp dáng → đổi mẫu khác hoặc hoàn 100% tiền gọng. SONi chịu phí ship đổi.',
      },
      {
        icon: '🛡️',
        title: 'Bảo hành chính hãng 12 tháng',
        desc: 'Gãy gọng do lỗi nhà sản xuất → đổi mới. Đệm mũi hỏng → thay miễn phí. Lỗi do va đập mạnh thì sửa với phí ưu đãi.',
      },
      {
        icon: '💬',
        title: 'Tư vấn chọn gọng theo khuôn mặt',
        desc: 'Gửi ảnh khuôn mặt qua Zalo SONi — bên mình tư vấn xem Bulsajo có hợp khuôn mặt của bạn không, miễn phí, không cần đặt hàng cũng tư vấn.',
      },
      {
        icon: '💵',
        title: 'Thanh toán khi nhận hàng (COD)',
        desc: 'Nhận hàng, mở kiểm tra, đeo thử rồi mới trả tiền cho shipper. Không hài lòng có thể từ chối nhận, không mất phí.',
      },
    ],
  },

  pricing: {
    title: 'Chọn gói phù hợp với bạn',
    subtitle: 'Bạn có thể đặt riêng gọng nếu đã có tròng, hoặc đặt trọn bộ gọng + tròng để tiết kiệm.',
    packages: [
      {
        name: 'Chỉ gọng Bulsajo',
        tagline: 'Khi bạn đã có tròng kính riêng',
        price: 620000,
        originalPrice: 890000,
        features: [
          'Gọng titanium IP — 20 gram',
          'Hộp đựng kính + khăn lau',
          'Bảo hành 12 tháng',
          'Đổi trả 7 ngày miễn phí',
        ],
        ctaText: 'Chọn gói này',
        preset: { type: 'no-lens' },
      },
      {
        name: 'Gọng + Tròng cận',
        tagline: 'Phổ biến nhất — chiếm 70% đơn',
        price: 980000,
        originalPrice: 1490000,
        features: [
          'Trọn bộ gọng Bulsajo',
          'Tròng cận chống ánh sáng xanh',
          'Đo độ cận miễn phí tại nhà (HCM/HN)',
          'Bảo hành 12 tháng cho cả gọng + tròng',
          'Đổi trả 7 ngày miễn phí',
        ],
        ctaText: 'Chọn gói phổ biến',
        highlighted: true,
        badge: 'Tiết kiệm 510k',
        preset: { type: 'lens-category', categoryId: 'blue' },
      },
      {
        name: 'Combo trọn bộ cao cấp',
        tagline: 'Khi bạn muốn tốt nhất ngay từ đầu',
        price: 1690000,
        originalPrice: 2490000,
        features: [
          'Gọng Bulsajo',
          'Tròng cao cấp chống ánh sáng xanh + chống chói',
          'Hộp đựng da thật cao cấp',
          'Khăn lau microfiber Nhật Bản',
          'Đo độ cận miễn phí tại nhà',
          'Bảo hành 18 tháng',
        ],
        ctaText: 'Chọn gói cao cấp',
        preset: { type: 'lens-category', categoryId: 'mong' },
      },
    ],
    footnote:
      'Bạn chọn gói nào, lúc bấm "Đặt hàng" hệ thống vẫn để bạn tuỳ chỉnh tròng kính và phương thức thanh toán. Không bị khoá lựa chọn.',
  },

  faq: {
    title: 'Khách hay hỏi trước khi đặt',
    items: [
      {
        q: 'Mặt tôi tròn / dài / vuông có hợp gọng Bulsajo không?',
        a: 'Bulsajo có cầu đôi cách tân — hợp nhất với mặt tròn và trái xoan, vì nó kéo dài khuôn mặt theo phương ngang. Mặt vuông đeo vẫn hài hoà. Mặt dài hẹp đeo có thể không cân đối — nếu không chắc, gửi ảnh khuôn mặt qua Zalo SONi (0869.30.82.31), bên mình tư vấn miễn phí trước khi đặt.',
      },
      {
        q: 'Gọng titanium 20g có dễ gãy không?',
        a: 'Titanium IP bền gấp 3 lần thép thường, chịu được khi vô tình ngồi đè hoặc rơi từ độ cao 1m. Bạn vẫn được bảo hành 12 tháng nếu gãy do lỗi nhà sản xuất. Cẩn thận hơn nữa là tránh đặt gọng úp xuống bàn — đây là thói quen gây cong càng kính nhanh nhất với mọi loại gọng.',
      },
      {
        q: 'Bao lâu nhận được hàng?',
        a: 'Nội thành HCM và Hà Nội: 1-2 ngày. Tỉnh khác: 2-4 ngày. Miễn phí giao toàn quốc qua Giao Hàng Nhanh / Viettel Post.',
      },
      {
        q: 'Có được thử trước khi trả tiền không?',
        a: 'Có. Bạn thanh toán khi nhận hàng (COD). Khi shipper giao, bạn mở hộp kiểm tra gọng + đeo thử trước, sau đó mới trả tiền. Nếu không hài lòng có thể từ chối nhận, không mất phí.',
      },
      {
        q: 'Lắp tròng cận / loạn / viễn vào Bulsajo được không?',
        a: 'Được hết. Bulsajo dùng được với mọi loại tròng: cận, loạn, viễn, đa tròng, kính mát. Khi đặt qua website bạn chọn luôn loại tròng và độ — bên mình sẽ lắp tròng rồi giao tận tay. Hoặc nhận gọng trước, đem đến cửa hàng SONi để đo và lắp tròng riêng.',
      },
      {
        q: 'Bảo hành như thế nào?',
        a: '12 tháng bảo hành chính hãng. Gãy gọng / lệch trục do lỗi nhà sản xuất → đổi mới hoàn toàn. Đệm mũi mòn / lỏng → thay miễn phí. Lỗi do va đập mạnh / mất mát → sửa chữa với phí ưu đãi cho khách hàng SONi.',
      },
      {
        q: 'Nếu đeo về thấy không hợp thì sao?',
        a: 'Trong 7 ngày kể từ ngày nhận, gọng còn nguyên không trầy → đổi sang mẫu khác hoặc hoàn 100% tiền gọng. SONi chịu phí ship đổi. Bạn không phải mất gì để thử.',
      },
    ],
  },

  finalCta: {
    title: 'Mỗi ngày bạn không đổi gọng — là một ngày sống mũi tiếp tục bị ép xuống.',
    subtitle:
      '6 tháng nữa, bạn có 2 lựa chọn: vẫn đeo cặp kính cũ và tháo ra day mũi 5-7 lần một ngày — hoặc đang đeo Bulsajo và quên là mình đang đeo kính. Khác biệt chỉ là một quyết định 30 giây từ giờ.',
    ctaText: 'Tôi muốn đổi sang Bulsajo',
    microcopy: 'Freeship toàn quốc · Đổi trả 7 ngày · COD · Bảo hành 12 tháng',
  },
}

export default lp
