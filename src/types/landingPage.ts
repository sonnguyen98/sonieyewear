// Schema cho landing page chạy ads — mỗi mẫu gọng 1 file content
// Cấu trúc theo skill trangbanhang: hero → vấn đề → giải pháp → bằng chứng → khử rủi ro → giá → FAQ → CTA cuối

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
  storyImage?: string

  hero: {
    eyebrow?: string
    title: string
    titleHighlight?: string
    subtitle: string
    ctaText: string
    ctaMicrocopy: string
    trustStrip: string[]
  }

  story: {
    title: string
    intro: string
    breakingPoint: { timeLabel: string; text: string }
    timeline: { time: string; label: string; text: string; isClimax?: boolean }[]
    villain: { myth: string; truth: string }
    twist: string
  }

  solution: {
    title: string
    subtitle: string
    items: { icon: string; featureLabel: string; benefitTitle: string; mechanism: string }[]
  }

  proof: {
    title: string
    stats: { value: string; label: string }[]
    testimonials: {
      name: string
      role: string
      text: string
      rating: number
      isPlaceholder?: boolean
    }[]
    placeholderNote?: string
  }

  guarantees: {
    title: string
    items: { icon: string; title: string; desc: string }[]
  }

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
    }[]
    footnote?: string
  }

  faq: {
    title: string
    items: { q: string; a: string }[]
  }

  finalCta: {
    title: string
    subtitle: string
    ctaText: string
    microcopy: string
  }
}
