import type { LandingPageContent } from '@/types/landingPage'

const lp: LandingPageContent = {
  productId: 'sp1777199378306',
  slug: 'gng-bulsajo-hai-cu',
  metaTitle: 'Gọng Bulsajo Hai Cầu — Sang hơn rõ rệt, nhẹ chỉ 20g | SONi Cắt Kính Online',
  metaDescription:
    'Gọng titanium IP hai cầu phi công 20 gram — tôn nét nam tính cho mặt tròn, trái xoan, vuông. Đeo cả ngày không hằn mũi. Giảm 30% còn 620k. SONi tư vấn dáng gọng qua Zalo trước khi đặt.',
  accent: 'orange',
  heroImage: '/images/landing-pages/bulsajo/hero.png',

  navAnchors: [
    { label: 'Quà tặng', targetId: 'gifts' },
    { label: 'Vì sao chọn Bulsajo', targetId: 'pain-solution' },
    { label: 'Quy trình SONi', targetId: 'team' },
    { label: 'Bảng giá', targetId: 'pricing' },
    { label: 'Câu hỏi thường gặp', targetId: 'faq' },
  ],

  // ───────── HERO ─────────
  hero: {
    eyebrow: 'Bộ sưu tập Titanium 2026',
    title: 'Cùng khuôn mặt đó —',
    titleHighlight: 'đeo Bulsajo trông sang và nam tính hơn rõ rệt',
    subtitle:
      'Bulsajo là gọng titanium IP siêu nhẹ chỉ 20 gram, thiết kế hai cầu phi công cách tân. Đeo lên, khuôn mặt bạn được kéo thanh thoát hơn — tôn nét nam tính cho mặt tròn, trái xoan, vuông. Còn về cảm giác đeo, bạn cứ đeo từ 8 giờ sáng đến 11 giờ đêm, đến lúc ngủ mới sực nhớ ra mình chưa tháo kính.',
    ctaPrimary: { text: 'Mua ngay — Nhận 3 quà tặng', targetId: 'pricing' },
    ctaSecondary: { text: 'AI tư vấn gọng hợp mặt', href: '/thu-kinh' },
    ctaMicrocopy: 'Freeship · COD · Bảo hành chính hãng · Tư vấn dáng gọng qua Zalo MIỄN PHÍ',
    trustStrip: [
      'Hai cầu phi công — tôn dáng mặt tròn / trái xoan / vuông',
      'Titanium IP chỉ 20g — đeo cả ngày không hằn mũi',
      'Cam kết hàng chính hãng — bạn kiểm khi nhận',
      'Hôm nay giảm 30% còn 620.000đ',
    ],
  },

  // ───────── SECTION 2 — 3 QUÀ TẶNG ─────────
  gifts: {
    eyebrow: '⭐ Tặng kèm đơn Bulsajo',
    title: 'Mua ngay — Nhận 3 quà tặng đi kèm',
    subtitle:
      'Mỗi đơn Bulsajo, SONi gửi kèm cho bạn 3 phần quà thật — không phải combo ảo, không phải voucher hết hạn nhanh. Tất cả đều phục vụ chính cặp kính bạn vừa đặt.',
    items: [
      {
        icon: '📚',
        name: 'Bộ 3 Ebook bảo vệ mắt',
        desc:
          'Bộ tài liệu SONi tự biên soạn — giúp bạn giữ độ ổn định, hạn chế tăng cận thêm: thói quen nhìn xa - nhìn gần, ăn uống bổ mắt, bài tập cho mắt cận của dân làm việc với máy tính.',
        value: 'Tải ngay sau khi đặt đơn',
        ctaText: 'Mua ngay nhận quà',
        ctaTargetId: 'pricing',
      },
      {
        icon: '📋',
        name: 'Sổ Y Bạ điện tử SONi',
        desc:
          'Đo độ ở đâu cũng lưu vào Sổ Y Bạ SONi của bạn — lần sau cắt kính chỉ cần đăng nhập, không phải nhớ số. SONi giữ giúp bạn lịch sử khám mắt, đơn kính, ngày bảo hành.',
        value: 'Kích hoạt cùng đơn đầu tiên',
        ctaText: 'Mua ngay nhận quà',
        ctaTargetId: 'pricing',
      },
      {
        icon: '🧴',
        name: 'Bộ Kit vệ sinh kính toàn diện',
        desc:
          'Khăn lau microfiber không xơ, dung dịch xịt rửa tròng chuyên dụng, hộp đựng giữ form gọng. Đủ để bạn chăm cặp kính chỉn chu suốt năm đầu — đỡ phải mua lẻ bên ngoài.',
        value: 'Gửi cùng đơn — trị giá ~150k',
        ctaText: 'Mua ngay nhận quà',
        ctaTargetId: 'pricing',
      },
    ],
  },

  // ───────── SECTION 3 — Q&A Nỗi đau ↔ Giải pháp ─────────
  painSolutionQA: {
    title: 'Vì sao chọn Bulsajo? 4 nỗi lo phổ biến — và cách SONi gỡ',
    subtitle:
      'SONi đã nghe đi nghe lại 4 câu hỏi này từ khách mua kính online. Đây là cách Bulsajo (và quy trình bên SONi) gỡ thẳng từng cái — không lý thuyết suông.',
    items: [
      {
        pain: {
          question: 'Đeo kính cả ngày bị hằn sống mũi đỏ ửng — phải làm sao?',
          text:
            'Nhiều bạn mua gọng nhựa 30-40 gram, đeo 4-5 tiếng đã thấy hai vệt đỏ trên sống mũi. Cuối ngày tháo kính ra, nhìn gương vẫn còn vết. Lâu dần thành thói quen day mũi 5-7 lần một ngày.',
          image: '/images/landing-pages/bulsajo/before-1.png',
        },
        solution: {
          title: 'Titanium IP chỉ 20 gram — áp lực phân tán đều, không dồn vào một điểm',
          text:
            'Bulsajo nhẹ chỉ bằng 1/3 gọng nhựa thông thường. Đệm silicon mềm ôm khít sống mũi — đeo từ sáng đến tối cũng không in vệt. Bạn cứ thử đeo nguyên một ngày làm việc, đến lúc tháo ra sẽ thấy sống mũi sạch.',
          image: '/images/landing-pages/bulsajo/after-1.png',
        },
      },
      {
        pain: {
          question: 'Tôi sợ gọng titanium online là hàng nhái — làm sao biết?',
          text:
            'Đây là nỗi lo công bằng. Trên mạng có quá nhiều shop bán gọng "titanium" thực chất là kim loại pha rẻ, đeo vài tháng là gãy bản lề hoặc bạc màu.',
          image: '/images/landing-pages/bulsajo/before-2.png',
        },
        solution: {
          title: 'Cam kết hàng chính hãng — bạn kiểm khi nhận',
          text:
            'Bạn mở hộp đeo thử ngay trước mặt shipper. Không khớp với mô tả — bạn cứ từ chối nhận, SONi chịu phí ship hoàn, bạn không cần giải thích gì.',
          image: '/images/landing-pages/bulsajo/after-2.png',
        },
      },
      {
        pain: {
          question: 'Đặt kính online thì tròng cận có đúng độ không? Lỡ sai phải làm sao?',
          text:
            'Đây là nỗi lo lớn nhất khi mua kính online. Cắt sai độ — đeo nhức đầu, chóng mặt, mỏi mắt. Mà đa số shop online không có khúc xạ viên kiểm tra lại trước khi cắt.',
          image: '/images/landing-pages/bulsajo/before-3.png',
        },
        solution: {
          title: 'Khúc xạ viên 10 năm kinh nghiệm kiểm tra lại độ từng mắt — sai SONi đổi miễn phí 30 ngày',
          text:
            'Trước khi cắt, khúc xạ viên SONi đọc kỹ số độ bạn khai, kiểm tra tính hợp lý từng mắt. Sau khi nhận kính, bạn đeo 30 ngày — thấy chóng mặt, mờ, nhức đầu → SONi cắt lại miễn phí, bạn chỉ chịu phí ship một chiều.',
          image: '/images/landing-pages/bulsajo/after-3.png',
        },
      },
      {
        pain: {
          question: 'Lỡ kính hỏng, đeo lệch, hay đệm mũi mòn — biết tìm ai khi shop ở xa?',
          text:
            'Shop online vô danh thường biến mất sau 6 tháng. Khách mua xong là xong, hỏng tìm không ra. Đó là lý do nhiều bạn vẫn chọn ra tiệm gần nhà dù đắt hơn.',
          image: '/images/landing-pages/bulsajo/before-4.png',
        },
        solution: {
          title: 'Bảo hành 1 năm — Zalo SONi luôn có người trả lời trong ngày',
          text:
            'Bulsajo bảo hành chính hãng 1 năm với mọi lỗi kỹ thuật, lớp phủ, khuyết tật. Đệm mũi mòn, bản lề lỏng — bạn gửi gọng về SONi, SONi sửa miễn phí gửi lại. Mọi khâu xử lý qua Zalo 0869.30.82.31, không bị trôi tin nhắn như fanpage.',
          image: '/images/landing-pages/bulsajo/after-4.png',
        },
      },
    ],
    aiSuggestion: {
      question: 'Mặt tôi không biết hợp dáng gọng nào — đặt sợ sai mẫu thì sao?',
      text:
        'Bạn không cần đoán mò. Nhờ AI dáng gọng của SONi phân tích khuôn mặt bạn trong 30 giây — sẽ đề xuất các mẫu hợp nhất theo mặt tròn, dài, vuông, trái xoan. Miễn phí, không cần đặt hàng cũng dùng được.',
      ctaText: 'Nhờ AI tư vấn dáng gọng hợp mặt →',
      ctaHref: '/thu-kinh',
    },
  },

  // ───────── SECTION 4 — Đội ngũ + Quy trình 5 bước + Tầm quan trọng cắt kính ─────────
  team: {
    eyebrow: '⭐ Bên SONi cắt kính ra sao?',
    title: 'Khúc xạ viên 10 năm trong nghề — hàng ngàn chiếc kính đã cắt online gửi đến tay khách',
    subtitle:
      'Khác với phần lớn shop kính online (đặt → cắt → giao thẳng, không kiểm tra), SONi có quy trình bài bản 5 bước cho mọi đơn cắt kính. Đặc biệt là bước 4 — SONi quay video minh bạch gửi bạn xem trước khi đóng gói.',
    // backgroundImage: '/images/landing-pages/bulsajo/team-bg.png', // user cung cấp sau
    steps: [
      {
        num: 1,
        icon: '📥',
        title: 'Nhận đơn + Tư vấn',
        desc: 'Bạn đặt qua website hoặc Zalo. SONi xác nhận thông tin, tư vấn dáng gọng nếu cần, kiểm tra số độ bạn khai báo có hợp lý không.',
      },
      {
        num: 2,
        icon: '👁️',
        title: 'Khúc xạ viên kiểm tra lại độ',
        desc: 'Mọi đơn cắt kính đều được khúc xạ viên 10 năm kinh nghiệm đọc lại số độ — phát hiện sai số bất thường thì gọi bạn xác nhận trước khi cắt.',
      },
      {
        num: 3,
        icon: '⚙️',
        title: 'Lắp ráp chính xác',
        desc: 'Tròng Chemilens chính hãng được cắt theo PD và dáng gọng của bạn, lắp khít vào Bulsajo bằng máy chuyên dụng. Không hở, không lệch tâm.',
      },
      {
        num: 4,
        icon: '🎥',
        title: 'Kiểm định + Quay video minh bạch',
        desc:
          'SONi quay lại quá trình hoàn thiện đơn kính của bạn — gọng, tròng, tem mác, mã sản phẩm. Video gửi qua Zalo trước khi đóng gói. Bạn xem tận mắt, yên tâm mới giao đi.',
      },
      {
        num: 5,
        icon: '📦',
        title: 'Giao + Bảo hành + Follow-up',
        desc:
          'COD toàn quốc, bạn kiểm hàng rồi mới trả tiền. Bảo hành chính hãng 1 năm. SONi nhắn lại sau 7 ngày, 30 ngày và 6 tháng để hỏi bạn dùng có ổn không.',
      },
    ],
    importanceBlock: {
      title: 'Vì sao cắt kính đúng quy trình lại quan trọng?',
      text:
        'Cặp kính cận của bạn là thiết bị y tế đeo trên mặt 12-14 tiếng mỗi ngày, suốt vài năm. Sai PD vài milimet — bạn nhức đầu, mỏi mắt mà không hiểu vì sao. Sai trục loạn — bạn nhìn chữ thấy nhoè. Cắt vội, lắp lệch tâm — đeo lâu tăng độ. Bên SONi không cắt nhanh, SONi cắt đúng để bạn dùng được nhiều năm.',
      ctaText: 'Đặt cắt kính cùng Bulsajo',
      ctaTargetId: 'pricing',
    },
  },

  // ───────── SECTION 5 — Personas mẫu ─────────
  personas: {
    title: 'Khách nào đang chọn cắt kính Online tại SONi?',
    subtitle:
      'Đây là 4 nhóm khách điển hình của SONi — bạn xem mình có giống ai trong số họ không. Đa phần đều chung 1 lý do: muốn cặp kính đeo thoải mái cả ngày + được kiểm tra độ kỹ trước khi cắt.',
    items: [
      {
        initial: 'A',
        name: 'Anh A',
        age: 30,
        role: 'Nhân viên văn phòng',
        location: 'Nghệ An',
        quote:
          'Văn phòng anh ở quê, không có chuỗi kính lớn nào quanh thị xã. Đặt SONi vì đọc thấy có khúc xạ viên kiểm tra lại độ — kính lần trước anh cắt ở tiệm gần nhà sai loạn 25 độ mà bạn chủ tiệm không phát hiện.',
      },
      {
        initial: 'B',
        name: 'Chị B',
        age: 24,
        role: 'Giáo viên',
        location: 'Hà Nam',
        quote:
          'Đứng lớp 6 tiếng một ngày — gọng cũ của em tì mũi đến nỗi đỏ ửng. SONi tư vấn Bulsajo titanium nhẹ. Đến giờ đeo 4 tháng vẫn quên là đang đeo kính, đến lúc rửa mặt mới nhớ tháo.',
      },
      {
        initial: 'C',
        name: 'Chị C',
        age: 28,
        role: 'Công nhân Samsung',
        location: 'Bắc Ninh',
        quote:
          'Đi ca đêm, không có thời gian ra tiệm kính giờ hành chính. Đặt SONi qua website, kiểm tra Sổ Y Bạ thì biết em đã đo độ tháng trước. Cắt online được luôn, COD nhận hàng lúc về ca.',
      },
      {
        initial: 'H',
        name: 'Em H',
        age: 18,
        role: 'Học sinh lớp 12',
        location: 'Thanh Hoá',
        quote:
          'Em ôn thi đại học, đeo kính 10-12 tiếng một ngày. Mẹ em tìm shop cắt online uy tín vì sợ ra tiệm gần nhà không có máy đo PD chuẩn. SONi cắt xong gửi video quay lại, mẹ em xem yên tâm.',
      },
    ],
    note:
      '※ Đây là 4 chân dung khách điển hình của SONi để bạn dễ hình dung. Tên đã được rút gọn theo yêu cầu bảo mật.',
  },

  // ───────── SECTION 6 — Bảng giá 3 gói ─────────
  pricing: {
    title: 'Mua Gọng Bulsajo — Chọn gói phù hợp',
    subtitle:
      'Bạn có thể đặt riêng gọng nếu đã có tròng, hoặc đặt trọn bộ gọng + tròng để tiết kiệm. Khác nhau ở chính sách đổi trả và bảo hành — đọc kỹ trước khi chọn.',
    packages: [
      {
        name: 'Chỉ gọng Bulsajo',
        tagline: 'Khi bạn đã có tròng kính riêng',
        price: 620000,
        originalPrice: 890000,
        features: [
          'Gọng titanium IP — 20 gram',
          'Hộp đựng + khăn lau microfiber',
          'Bảo hành gọng 12 tháng',
          'Đổi trả 7 ngày miễn phí — nếu không vừa mặt',
          'Tặng Bộ 3 Ebook + Sổ Y Bạ + Kit vệ sinh',
        ],
        ctaText: 'Chọn gói này',
        preset: { type: 'no-lens' },
      },
      {
        name: 'Combo trọn bộ trung cấp',
        tagline: 'Được chọn nhiều nhất — chiếm 70% đơn',
        price: 750000,
        originalPrice: 1290000,
        features: [
          'Trọn bộ gọng Bulsajo',
          'Tròng cận Chemilens chống ánh sáng xanh',
          'Khúc xạ viên kiểm tra lại độ trước khi cắt',
          'Bảo hành chính hãng 1 năm',
          'Đổi độ MIỄN PHÍ 30 ngày nếu sai',
          'Tặng Bộ 3 Ebook + Sổ Y Bạ + Kit vệ sinh',
        ],
        ctaText: 'Chọn gói phổ biến',
        highlighted: true,
        badge: 'Bán chạy nhất',
        preset: { type: 'lens-category', categoryId: 'blue' },
      },
      {
        name: 'Combo trọn bộ cao cấp',
        tagline: 'Khi bạn muốn tốt nhất ngay từ đầu',
        price: 1190000,
        originalPrice: 1890000,
        features: [
          'Trọn bộ gọng Bulsajo',
          'Tròng cao cấp Hi-Index siêu mỏng + chống ánh sáng xanh + chống chói',
          'Khúc xạ viên kiểm tra lại độ trước khi cắt',
          'Bảo hành chính hãng 1 năm',
          'Đổi độ MIỄN PHÍ 30 ngày nếu sai',
          'Tặng Bộ 3 Ebook + Sổ Y Bạ + Kit vệ sinh',
        ],
        ctaText: 'Chọn gói cao cấp',
        preset: { type: 'lens-category', categoryId: 'mong' },
      },
    ],
    footnote:
      'Đơn cắt kính (gói có tròng) không áp dụng đổi trả 7 ngày vì tròng đã cắt theo độ riêng — thay vào đó là đổi độ miễn phí 30 ngày nếu sai + bảo hành 1 năm. Để chắc chắn vừa mặt, bạn dùng AI tư vấn dáng gọng hoặc nhắn Zalo SONi trước khi đặt.',
  },

  // ───────── SECTION 7 — Cam kết SONi (3 dòng ngắn) ─────────
  guarantees: {
    title: 'Cam kết của SONi',
    items: [
      {
        icon: '🛠️',
        title: 'Làm sản phẩm cho khách cẩn thận, chỉn chu',
        desc: 'Mọi đơn cắt kính đều qua đủ 5 bước, có video minh bạch gửi bạn xem trước khi đóng gói.',
      },
      {
        icon: '🛡️',
        title: 'Bảo hành 1 năm + Đổi độ miễn phí 30 ngày',
        desc: 'Sai độ, hỏng kỹ thuật, lớp phủ bong, đệm mũi mòn — bạn gửi gọng về, SONi xử lý miễn phí.',
      },
      {
        icon: '✅',
        title: 'Sản phẩm chính hãng — kiểm khi nhận',
        desc: 'Bạn mở hộp đeo thử ngay trước mặt shipper. Không khớp — bạn từ chối nhận, SONi chịu phí ship hoàn.',
      },
    ],
  },

  // ───────── SECTION 8 — FAQ ─────────
  faq: {
    title: 'Câu hỏi thường gặp',
    items: [
      {
        q: 'SONi có cắt kính cận không?',
        a: 'Có. SONi cắt kính cận, loạn, viễn, đa tròng và kính mát đổi màu — toàn bộ online. Bạn đặt hàng qua website, khai số độ trong form, hoặc nhắn Zalo SONi để được hướng dẫn. Khúc xạ viên sẽ đọc lại số độ trước khi cắt cho bạn.',
      },
      {
        q: 'Tôi không biết độ của mình thì sao?',
        a: 'Cách đơn giản nhất là bạn ra một cơ sở đo mắt uy tín gần nhà — đo xong xin lại tờ đơn kính (có ghi SPH, CYL, AXIS, PD). Mang số đó về khai vào form đặt hàng SONi. SONi cũng sẽ lưu lại số đó vào Sổ Y Bạ của bạn để lần sau khỏi mất công nhớ.',
      },
      {
        q: 'Chiết suất là gì? Độ của tôi phù hợp chiết suất nào?',
        a: 'Chiết suất (1.56, 1.60, 1.67, 1.74) là chỉ số đo độ mỏng của tròng kính — chỉ số càng cao thì tròng càng mỏng. Cận dưới 4 độ dùng 1.56 là đủ. Từ 4-6 độ nên dùng 1.60 hoặc 1.67 để mỏng hơn. Trên 6 độ nên dùng 1.67 hoặc 1.74 cho thẩm mỹ. Bạn không biết chọn → nhắn Zalo, SONi tư vấn miễn phí.',
      },
      {
        q: 'Mặt tôi tròn / dài / vuông có hợp Bulsajo không?',
        a: 'Bulsajo có cầu đôi cách tân — hợp nhất với mặt tròn, trái xoan, và vuông vì nó kéo dài khuôn mặt theo phương ngang. Mặt dài hẹp đeo có thể không cân đối. Bạn dùng AI tư vấn dáng gọng của SONi (nhấn nút phía trên), hoặc gửi ảnh khuôn mặt qua Zalo 0869.30.82.31 để được tư vấn miễn phí trước khi đặt.',
      },
      {
        q: 'Làm sao để tôi đổi trả hàng?',
        a: 'Bạn nhắn Zalo SONi 0869.30.82.31 để được hướng dẫn. Đơn chỉ mua gọng: đổi trả 7 ngày miễn phí nếu không vừa mặt. Đơn cắt kính có tròng: đổi độ miễn phí 30 ngày nếu sai độ + bảo hành 1 năm cho lỗi kỹ thuật.',
      },
      {
        q: 'Tôi cắt kính rồi mà đeo thấy không ưng, có đổi được không?',
        a: 'Nếu không phải lỗi cắt mà bạn chỉ thấy không ưng dáng — SONi hỗ trợ đổi sang mẫu khác với 30% chi phí (bạn bù thêm tiền chênh nếu mẫu mới đắt hơn). Cách tốt nhất để khỏi đổi là nhờ AI dáng gọng hoặc nhắn Zalo tư vấn ngay từ đầu.',
      },
    ],
  },

  // ───────── SECTION 9 — Chốt cuối ─────────
  finalCta: {
    title: 'Một quyết định 30 giây — đổi cả 6 tháng tới của bạn.',
    subtitle:
      '6 tháng nữa bạn có 2 lựa chọn: vẫn đeo cặp kính cũ và tháo ra day mũi 5-7 lần một ngày, vẫn nghe câu "trông mệt vậy"… hoặc đang đeo Bulsajo và nghe câu "dạo này trông khác lắm — sang hơn". Bạn chọn gói nào hợp với mình thôi, phần còn lại bên SONi lo.',
    ctaText: 'Tôi muốn đổi sang Bulsajo',
    microcopy: 'Freeship · COD · Bảo hành chính hãng · Tư vấn dáng gọng qua Zalo MIỄN PHÍ',
  },
}

export default lp
