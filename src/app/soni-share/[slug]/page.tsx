import Link from 'next/link'
import { notFound } from 'next/navigation'
import { kvGet, KV_KEYS } from '@/lib/kv-store'
import postsFallback from '@/data/blog-posts.json'

interface BlogPost {
  id: string; slug: string; title: string; excerpt: string
  content: string; date: string; category: string; image: string; published: boolean
}

const categoryColors: Record<string, string> = {
  'Kiến Thức': 'bg-blue-50 text-blue-700',
  'Thời Trang': 'bg-pink-50 text-pink-700',
  'Mẹo Hay': 'bg-green-50 text-green-700',
  'Sức Khỏe': 'bg-yellow-50 text-yellow-700',
  'Tin Tức': 'bg-purple-50 text-purple-700',
}

// Render markdown đơn giản → HTML-safe string
function renderMarkdown(text: string): string {
  return text
    // Ảnh: ![alt](url)
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="w-full rounded-xl my-4 object-cover max-h-96"/>')
    // Heading H1
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-black text-brand-black mt-6 mb-3">$1</h1>')
    // Heading H2
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-brand-black mt-5 mb-2">$1</h2>')
    // Heading H3
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold text-brand-black mt-4 mb-2">$1</h3>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Danh sách
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    // Wrap li thành ul
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, m => `<ul class="space-y-1 my-3 text-brand-muted">${m}</ul>`)
    // Đoạn văn (dòng trống tạo paragraph)
    .split(/\n\n+/)
    .map(block => {
      if (block.startsWith('<h') || block.startsWith('<ul') || block.startsWith('<img')) return block
      return `<p class="text-brand-muted leading-relaxed">${block.replace(/\n/g, '<br/>')}</p>`
    })
    .join('\n')
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params

  const allPosts: BlogPost[] =
    (await kvGet<BlogPost[]>(KV_KEYS.blogPosts, 'blog-posts.json')) ?? postsFallback

  const post = allPosts.find(p => p.slug === slug && p.published)
  if (!post) notFound()

  const related = allPosts
    .filter(p => p.published && p.id !== post.id && p.category === post.category)
    .slice(0, 3)

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <nav className="text-xs text-brand-muted mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-brand-black">Trang Chủ</Link>
        <span>/</span>
        <Link href="/soni-share" className="hover:text-brand-black">SONi Share</Link>
        <span>/</span>
        <span className="text-brand-black font-medium line-clamp-1">{post.title}</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${categoryColors[post.category] ?? 'bg-gray-100 text-gray-600'}`}>
            {post.category}
          </span>
          <span className="text-xs text-brand-muted">{post.date}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-brand-black leading-tight mb-3">
          {post.title}
        </h1>
        {post.excerpt && (
          <p className="text-brand-muted text-base leading-relaxed border-l-4 border-brand-zalo pl-4 italic">
            {post.excerpt}
          </p>
        )}
      </div>

      {/* Ảnh đại diện */}
      {post.image && (
        <div className="mb-8 rounded-2xl overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.image} alt={post.title} className="w-full max-h-80 object-cover"/>
        </div>
      )}

      {/* Nội dung bài viết */}
      <article
        className="prose-sm max-w-none space-y-2"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
      />

      {/* Bài liên quan */}
      {related.length > 0 && (
        <div className="mt-12 pt-8 border-t border-brand-border">
          <h3 className="text-lg font-black text-brand-black mb-4">Bài viết liên quan</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map(p => (
              <Link key={p.id} href={`/soni-share/${p.slug}`}
                className="group bg-brand-light rounded-xl p-4 hover:bg-gray-100 transition-colors">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${categoryColors[p.category] ?? 'bg-gray-100 text-gray-600'}`}>
                  {p.category}
                </span>
                <p className="font-semibold text-sm text-brand-black mt-2 line-clamp-2 group-hover:text-brand-zalo transition-colors">
                  {p.title}
                </p>
                <p className="text-xs text-brand-muted mt-1">{p.date}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 text-center">
        <Link href="/soni-share" className="text-sm text-brand-zalo hover:underline">
          ← Quay lại SONi Share
        </Link>
      </div>
    </div>
  )
}
