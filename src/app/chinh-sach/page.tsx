import { kvGet, KV_KEYS } from '@/lib/kv-store'
import policiesFallback from '@/data/policies.json'

export const revalidate = 300

interface Policy { id: string; icon: string; title: string; content: string }

export default async function ChinhSachPage() {
  const policiesData: Policy[] =
    (await kvGet<Policy[]>(KV_KEYS.policies, 'policies.json')) ?? policiesFallback

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-black text-brand-black mb-2">Chính Sách Bảo Hành</h1>
      <p className="text-brand-muted mb-8">Cam kết chất lượng từ SONi Kính</p>
      <div className="space-y-5">
        {policiesData.map(p => (
          <div key={p.id} className="bg-brand-light rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
              <span>{p.icon}</span> {p.title}
            </h2>
            <div className="text-brand-muted leading-relaxed space-y-2">
              {p.content.split('\n\n').map((para, i) => (
                <p key={i}>
                  {para.split('\n').map((line, j) => (
                    <span key={j}>
                      {line}
                      {j < para.split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
