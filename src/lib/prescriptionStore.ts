import { kvGet, kvSet, withLock, KV_KEYS } from './kv-store'

// ── Types ────────────────────────────────────────────────────────────────────
export interface EyeData {
  sph: number    // Độ cầu  (-20 → +20, step 0.25)
  cyl: number    // Độ trụ  (-6  → +6,  step 0.25)
  axis: number   // Trục    (0   → 180, integer)
  add?: number   // Cộng thêm (0 → +4, step 0.25) — dành cho kính đọc/progressive
}

export interface Prescription {
  id: string
  customerId: string
  examDate: string       // YYYY-MM-DD
  clinicName?: string
  right: EyeData         // Mắt phải (OD)
  left: EyeData          // Mắt trái (OS)
  pd?: number            // Khoảng cách đồng tử (mm)
  notes?: string
  imageUrl?: string      // Ảnh đơn kính upload (Phase 3)
  createdAt: string
}

// ── Read ops ─────────────────────────────────────────────────────────────────
async function getAll(): Promise<Prescription[]> {
  return (await kvGet<Prescription[]>(KV_KEYS.prescriptions, 'prescriptions.json')) ?? []
}

export async function getPrescriptionsByCustomer(customerId: string): Promise<Prescription[]> {
  const all = await getAll()
  return all
    .filter(p => p.customerId === customerId)
    .sort((a, b) => b.examDate.localeCompare(a.examDate)) // mới nhất trước
}

export async function findPrescriptionById(id: string): Promise<Prescription | null> {
  const all = await getAll()
  return all.find(p => p.id === id) ?? null
}

// ── Validate helpers ─────────────────────────────────────────────────────────
function isValidEye(e: unknown): e is EyeData {
  if (!e || typeof e !== 'object') return false
  const { sph, cyl, axis } = e as Record<string, unknown>
  if (typeof sph !== 'number' || sph < -20 || sph > 20) return false
  if (typeof cyl !== 'number' || cyl < -6 || cyl > 6) return false
  if (typeof axis !== 'number' || axis < 0 || axis > 180) return false
  return true
}

// ── Write ops ────────────────────────────────────────────────────────────────
export interface CreatePrescriptionInput {
  customerId: string
  examDate: string
  clinicName?: string
  right: EyeData
  left: EyeData
  pd?: number
  notes?: string
  imageUrl?: string
}

export async function createPrescription(
  input: CreatePrescriptionInput
): Promise<{ ok: true; prescription: Prescription } | { ok: false; error: string }> {
  if (!isValidEye(input.right)) return { ok: false, error: 'Dữ liệu mắt phải không hợp lệ' }
  if (!isValidEye(input.left))  return { ok: false, error: 'Dữ liệu mắt trái không hợp lệ' }
  if (!input.examDate)          return { ok: false, error: 'Thiếu ngày khám' }

  return withLock('prescription:write', async () => {
    const all = await getAll()

    const prescription: Prescription = {
      id: 'rx-' + Date.now(),
      customerId: input.customerId,
      examDate: input.examDate,
      ...(input.clinicName ? { clinicName: input.clinicName } : {}),
      right: input.right,
      left: input.left,
      ...(input.pd !== undefined ? { pd: input.pd } : {}),
      ...(input.notes ? { notes: input.notes } : {}),
      ...(input.imageUrl ? { imageUrl: input.imageUrl } : {}),
      createdAt: new Date().toISOString(),
    }

    await kvSet(KV_KEYS.prescriptions, 'prescriptions.json', [...all, prescription])
    return { ok: true, prescription }
  })
}

export async function deletePrescription(
  id: string,
  customerId: string
): Promise<{ ok: boolean; error?: string }> {
  return withLock('prescription:write', async () => {
    const all = await getAll()
    const idx = all.findIndex(p => p.id === id)
    if (idx === -1) return { ok: false, error: 'Không tìm thấy đơn kính' }
    if (all[idx].customerId !== customerId) return { ok: false, error: 'Không có quyền xóa' }

    await kvSet(KV_KEYS.prescriptions, 'prescriptions.json', all.filter((_, i) => i !== idx))
    return { ok: true }
  })
}
