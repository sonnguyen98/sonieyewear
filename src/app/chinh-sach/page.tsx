import policiesData from '@/data/policies.json'

export default function ChinhSachPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-black text-brand-black mb-2">Chính Sách Bảo Hành</h1>
      <p className="text-brand-muted mb-8">Cam kết chất lượng từ SONi Kính</p>
      <div className="space-y-5">
        {policiesData.map((p: { id: string; icon: string; title: string; content: string }) => (
          <div key={p.id} className="bg-brand-light rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
              <span>{p.icon}</span> {p.title}
            </h2>
            <p className="text-brand-muted leading-relaxed">{p.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
