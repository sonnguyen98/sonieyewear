import Link from 'next/link'
import { kvGet, KV_KEYS } from '@/lib/kv-store'
import postsFallback from '@/data/blog-posts.json'

interface BlogPost { id: string; slug: string; title: string; excerpt: string; date: string; category: string; image: string; published: boolean; scheduledAt?: string }

const CATEGORIES = ['Tất Cả', 'Kiến Thức', 'Thời Trang', 'Mẹo Hay', 'Sức Khỏe', 'Tin Tức']

const categoryColors: Record<string, string> = {
  'Kiến Thức': 'bg-blue-50 text-blue-700',
  'Thời Trang': 'bg-pink-50 text-pink-700',
  'Mẹo Hay': 'bg-green-50 text-green-700',
  'Sức Khỏe': 'bg-yellow-50 text-yellow-700',
  'Tin Tức': 'bg-purple-50 text-purple-700',
}

interface PageProps {
  searchParams: Promise<{ category?: string }>
}

export default async function SoniSharePage({ searchParams }: PageProps) {
  const { category } = await searchParams
  const activeCategory = category && CATEGORIES.includes(category) ? category : 'Tất Cả'

  const allPosts: BlogPost[] =
    (await kvGet<BlogPost[]>(KV_KEYS.blogPosts, 'blog-posts.json')) ?? postsFallback

  const now = new Date()
  const published = allPosts.filter(p => {
    if (p.published) return true
    // Bài lên lịch: published=false nhưng scheduledAt đã đến giờ → tự hiện
    if (p.scheduledAt && new Date(p.scheduledAt) <= now) return true
    return false
  })
  const posts = activeCategory === 'Tất Cả'
    ? published
    : published.filter(p => p.category === activeCategory)

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-brand-black mb-2">SONi Share</h1>
        <p className="text-brand-muted">Kiến thức về kính mắt, xu hướng thời trang và mẹo chăm sóc mắt từ SONi</p>
      </div>

      {/* Tab danh mục */}
      <div className="flex gap-2 flex-wrap mb-8">
        {CATEGORIES.map(cat => {
          const isActive = cat === activeCategory
          const href = cat === 'Tất Cả' ? '/soni-share' : `/soni-share?category=${encodeURIComponent(cat)}`
          return (
            <Link
              key={cat}
              href={href}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-brand-black text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
              {isActive && cat !== 'Tất Cả' && (
                <span className="ml-1.5 text-xs opacity-70">({posts.length})</span>
              )}
            </Link>
          )
        })}
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16 text-brand-muted">
          <p className="text-4xl mb-3">✍️</p>
          <p>Chưa có bài viết nào trong danh mục <strong>{activeCategory}</strong>.</p>
          <Link href="/soni-share" className="mt-4 inline-block text-sm text-brand-zalo hover:underline">
            Xem tất cả bài viết →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => (
            <Link key={post.id} href={`/soni-share/${post.slug}`}
              className="group bg-white rounded-2xl border border-brand-border overflow-hidden hover:shadow-md transition-all">
              <div className="h-40 bg-gradient-to-br from-brand-light to-gray-200 flex items-center justify-center overflow-hidden">
                {post.image
                  ? <img src={post.image} alt={post.title} className="w-full h-full object-cover"/>
                  : <span className="text-4xl">👓</span>
                }
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${categoryColors[post.category] ?? 'bg-gray-100 text-gray-600'}`}>
                    {post.category}
                  </span>
                  <span className="text-[11px] text-brand-muted">{post.date}</span>
                </div>
                <h2 className="font-bold text-brand-black text-sm leading-tight line-clamp-2 mb-2 group-hover:text-brand-zalo transition-colors">
                  {post.title}
                </h2>
                <p className="text-xs text-brand-muted line-clamp-2 leading-relaxed">{post.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
