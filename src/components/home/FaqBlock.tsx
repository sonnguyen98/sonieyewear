'use client'

import { useState } from 'react'
import Link from 'next/link'

const FAQS = [
  {
    q: 'Đeo kính có làm mắt kém đi không?',
    a: 'Kính được cắt đúng độ giúp mắt nhìn rõ mà không cần cố sức — điều này thực ra giảm mỏi mắt hơn là gây hại. Kính sai độ mới là nguyên nhân gây mỏi; đó là lý do SONi xác nhận đơn qua Zalo trước khi cắt.',
  },
  {
    q: 'Tại sao tôi hay bị chóng mặt khi đeo kính mới?',
    a: 'Chóng mặt thường do sai số PD (khoảng cách đồng tử) hoặc độ kính không khớp toa. Mắt cần 3–7 ngày thích nghi với kính mới là bình thường — nhưng nếu chóng mặt kéo dài hơn một tuần, cần kiểm tra lại toa và PD.',
  },
  {
    q: 'Mua kính online có vừa mặt không?',
    a: 'Mỗi gọng đều có thông số kích thước (chiều rộng tròng, cầu mũi, gọng tai). Bạn có thể đo gọng cũ đang đeo để so sánh — chênh lệch 1–2mm là chấp nhận được. SONi hỗ trợ tư vấn qua Zalo nếu bạn chưa chắc.',
  },
  {
    q: 'Làm sao biết kính cắt đúng không?',
    a: 'SONi quay video quá trình cắt kính và gửi qua Zalo trước khi đóng gói — bạn thấy tận mắt đúng gọng, đúng tròng, đúng độ. Nếu không hài lòng, SONi làm lại miễn phí.',
  },
  {
    q: 'Tôi không biết số PD của mình thì sao?',
    a: 'Không sao — bạn có thể bỏ trống ô PD khi đặt hàng. SONi sẽ hướng dẫn bạn đo tại nhà hoặc xác nhận qua Zalo trước khi cắt. Không ai bị ép đoán.',
  },
]

export default function FaqBlock() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="py-14 px-4 max-w-3xl mx-auto">
      <p className="text-xs font-semibold tracking-widest text-brand-muted uppercase mb-2">Hỏi &amp; Đáp</p>
      <h2 className="text-display-md font-bold text-brand-black mb-1">Những lo lắng thường gặp khi đeo kính</h2>
      <p className="text-sm text-brand-muted mb-8">
        Câu trả lời thật — không hoa mỹ.
      </p>

      <div className="divide-y divide-brand-border">
        {FAQS.map((faq, i) => (
          <div key={i}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-start justify-between gap-4 py-4 text-left"
            >
              <span className="text-sm font-semibold text-brand-black leading-snug">{faq.q}</span>
              <span className={`flex-shrink-0 w-5 h-5 rounded-full border border-brand-border flex items-center justify-center transition-transform ${open === i ? 'rotate-45' : ''}`}>
                <svg className="w-3 h-3 text-brand-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
                </svg>
              </span>
            </button>
            {open === i && (
              <p className="pb-4 text-sm text-brand-muted leading-relaxed">
                {faq.a}
              </p>
            )}
          </div>
        ))}
      </div>

      <p className="mt-8 text-xs text-brand-muted">
        Còn thắc mắc khác?{' '}
        <Link href="/soni-share" className="underline underline-offset-2 hover:text-brand-black transition-colors">
          Đọc thêm tại SONi Share
        </Link>
        {' '}hoặc{' '}
        <Link href="#" className="underline underline-offset-2 hover:text-brand-black transition-colors">
          nhắn Zalo để được tư vấn
        </Link>.
      </p>
    </section>
  )
}
