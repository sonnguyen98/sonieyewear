import Link from 'next/link'
import Image from 'next/image'
import { VI } from '@/constants/vietnamese'

const CATEGORIES = [
  { label: VI.categories.round,     href: '/gong-kinh?shape=round',     img: '/images/categories/mat-tron.png',   bg: 'bg-amber-50',  border: 'border-amber-200' },
  { label: VI.categories.square,    href: '/gong-kinh?shape=square',    img: '/images/categories/mat-vuong.png',  bg: 'bg-gray-50',   border: 'border-gray-200' },
  { label: VI.categories.catEye,    href: '/gong-kinh?shape=cat-eye',   img: '/images/categories/mat-meo.png',    bg: 'bg-pink-50',   border: 'border-pink-200' },
  { label: VI.categories.rectangle, href: '/gong-kinh?shape=rectangle', img: '/images/categories/chu-nhat.png',   bg: 'bg-green-50',  border: 'border-green-200' },
  { label: VI.categories.oval,      href: '/gong-kinh?shape=oval',      img: '/images/categories/oval.png',       bg: 'bg-cyan-50',   border: 'border-cyan-200' },
  { label: VI.categories.rimless,   href: '/gong-kinh?type=rimless',    img: '/images/categories/khong-vien.png', bg: 'bg-purple-50', border: 'border-purple-200' },
  { label: VI.categories.geometric, href: '/gong-kinh?shape=geometric', img: '/images/categories/da-giac.png',    bg: 'bg-orange-50', border: 'border-orange-200' },
]

export default function CategoryGrid() {
  return (
    <section className="py-12 px-4 max-w-7xl mx-auto">
      <h2 className="text-display-md font-black text-brand-black mb-2">{VI.home.categoriesHeading}</h2>
      <p className="text-brand-muted text-sm mb-6">Tìm gọng phù hợp với khuôn mặt của bạn</p>

      <div className="grid grid-cols-4 md:grid-cols-7 gap-2 sm:gap-3">
        {CATEGORIES.map(cat => (
          <Link
            key={cat.href}
            href={cat.href}
            className={`flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-2xl border ${cat.bg} ${cat.border} hover:scale-105 hover:shadow-md transition-all duration-200 aspect-square`}
          >
            <div className="relative w-full flex-1 min-h-0">
              <Image
                src={cat.img}
                alt={cat.label}
                fill
                className="object-contain"
                style={{ mixBlendMode: 'multiply' }}
                sizes="(max-width: 640px) 25vw, 14vw"
              />
            </div>
            <span className="text-xs font-semibold text-brand-black text-center leading-tight shrink-0">{cat.label}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
