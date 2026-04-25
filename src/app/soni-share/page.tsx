import Link from 'next/link'
import postsData from '@/data/blog-posts.json'

const categoryColors: Record<string, string> = {
  'Kiến Thức': 'bg-blue-50 text-blue-700',
  'Thời Trang': 'bg-pink-50 text-pink-700',
  'Mẹo Hay': 'bg-green-50 text-green-700',
  'Sức Khỏe': 'bg-yellow-50 text-yellow-700',
  'Tin Tức': 'bg-purple-50 text-purple-700',
}

export default function SoniSharePage() {
  const posts = postsData.filter((p: { published: boolean }) => p.published)
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-brand-black mb-2">SONi Share</h1>
        <p className="text-brand-muted">Kiến thức về kính mắt, xu hướng thời trang và mẹo chăm sóc mắt từ SONi</p>
      </div>
      {posts.length === 0 ? (
        <div className="text-center py-16 text-brand-muted">
          <p className="text-4xl mb-3">✍️</p>
          <p>Chưa có bài viết nào. Thêm bài trong trang Admin!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post: { id: string; slug: string; title: string; excerpt: string; date: string; category: string; image: string }) => (
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
