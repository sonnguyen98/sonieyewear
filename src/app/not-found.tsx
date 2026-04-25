import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="text-6xl mb-4">👓</div>
      <h1 className="text-display-lg font-black text-brand-black mb-3">404</h1>
      <p className="text-brand-muted text-base mb-6">Trang bạn tìm không tồn tại.</p>
      <Link href="/">
        <Button variant="primary" size="lg">Về Trang Chủ</Button>
      </Link>
    </div>
  )
}
