import crypto from 'crypto'
import { kvGet, kvSet, withLock, KV_KEYS } from './kv-store'

// ── Types ───────────────────────────────────────────────────────────────────
export interface Affiliate {
  id: string
  code: string
  name: string
  phone: string
  passwordHash: string
  bankName: string
  bankAccount: string
  bankOwner: string
  balance: number
  pendingBalance: number
  totalEarned: number
  totalWithdrawn: number
  createdAt: string
  status: 'active' | 'suspended'
}

export interface AffiliateCommission {
  id: string
  affiliateCode: string
  orderCode: string
  customerName: string
  orderAmount: number
  commission: number
  paymentType: 'prepaid' | 'cod'
  status: 'approved' | 'pending'
  createdAt: string
  approvedAt?: string
}

export interface AffiliateWithdrawal {
  id: string
  affiliateCode: string
  affiliateName: string
  affiliatePhone: string
  amount: number
  bankName: string
  bankAccount: string
  bankOwner: string
  status: 'pending' | 'paid'
  requestedAt: string
  paidAt?: string
}

const COMMISSION_RATE = 0.10
const MIN_WITHDRAW = 100_000

// ── Password hashing (scrypt) ───────────────────────────────────────────────
const SCRYPT_N = 16384
const SCRYPT_r = 8
const SCRYPT_p = 1
const SCRYPT_KEYLEN = 64

function scryptHash(password: string): string {
  const salt = crypto.randomBytes(16)
  const hash = crypto.scryptSync(password, salt, SCRYPT_KEYLEN, { N: SCRYPT_N, r: SCRYPT_r, p: SCRYPT_p })
  return `scrypt$${salt.toString('base64')}$${hash.toString('base64')}`
}

function scryptVerify(password: string, stored: string): boolean {
  const parts = stored.split('$')
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false
  const salt = Buffer.from(parts[1], 'base64')
  const expected = Buffer.from(parts[2], 'base64')
  const actual = crypto.scryptSync(password, salt, expected.length, { N: SCRYPT_N, r: SCRYPT_r, p: SCRYPT_p })
  return crypto.timingSafeEqual(expected, actual)
}

function isLegacySha256(stored: string): boolean {
  return /^[a-f0-9]{64}$/i.test(stored)
}

function legacySha256(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

export function hashPassword(password: string): string {
  return scryptHash(password)
}

// ── Read ops (no lock) ──────────────────────────────────────────────────────
export async function getAllAffiliates(): Promise<Affiliate[]> {
  return (await kvGet<Affiliate[]>(KV_KEYS.affiliates, 'affiliates.json')) ?? []
}

export async function getAllCommissions(): Promise<AffiliateCommission[]> {
  return (await kvGet<AffiliateCommission[]>(KV_KEYS.affiliateCommissions, 'affiliate-commissions.json')) ?? []
}

export async function getAllWithdrawals(): Promise<AffiliateWithdrawal[]> {
  return (await kvGet<AffiliateWithdrawal[]>(KV_KEYS.affiliateWithdrawals, 'affiliate-withdrawals.json')) ?? []
}

export async function findAffiliateByPhone(phone: string): Promise<Affiliate | null> {
  const list = await getAllAffiliates()
  return list.find(a => a.phone === phone) ?? null
}

export async function findAffiliateByCodeAndPhone(code: string, phone: string): Promise<Affiliate | null> {
  const list = await getAllAffiliates()
  return list.find(a => a.code === code && a.phone === phone) ?? null
}

// ── Auth ─────────────────────────────────────────────────────────────────────
// Verify mật khẩu — hỗ trợ migration SHA-256 legacy sang scrypt.
// Nếu mật khẩu khớp legacy → tự upgrade hash trong DB.
export async function verifyAffiliateLogin(phone: string, password: string): Promise<Affiliate | null> {
  const list = await getAllAffiliates()
  const idx = list.findIndex(a => a.phone === phone)
  if (idx === -1) return null

  const aff = list[idx]
  const stored = aff.passwordHash

  if (isLegacySha256(stored)) {
    if (legacySha256(password) !== stored) return null
    // Upgrade trong nền — không chặn login
    upgradePassword(aff.id, password).catch(err => console.error('[affiliate] upgrade hash error:', err))
    return aff
  }

  if (stored.startsWith('scrypt$')) {
    return scryptVerify(password, stored) ? aff : null
  }

  return null
}

async function upgradePassword(affiliateId: string, password: string): Promise<void> {
  await withLock(`aff:upgrade:${affiliateId}`, async () => {
    const list = await getAllAffiliates()
    const idx = list.findIndex(a => a.id === affiliateId)
    if (idx === -1) return
    list[idx] = { ...list[idx], passwordHash: scryptHash(password) }
    await kvSet(KV_KEYS.affiliates, 'affiliates.json', list)
  })
}

// ── Register ────────────────────────────────────────────────────────────────
function genCode(existing: string[]): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  do {
    code = 'SONI' + Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  } while (existing.includes(code))
  return code
}

export interface RegisterInput {
  name: string; phone: string; password: string
  bankName: string; bankAccount: string; bankOwner: string
}

export async function registerAffiliate(input: RegisterInput): Promise<{ ok: true; affiliate: Affiliate } | { ok: false; error: string }> {
  return withLock('aff:write', async () => {
    const list = await getAllAffiliates()
    if (list.some(a => a.phone === input.phone)) {
      return { ok: false, error: 'Số điện thoại này đã đăng ký' }
    }
    const newAff: Affiliate = {
      id: 'aff-' + Date.now(),
      code: genCode(list.map(a => a.code)),
      name: input.name,
      phone: input.phone,
      passwordHash: scryptHash(input.password),
      bankName: input.bankName,
      bankAccount: input.bankAccount,
      bankOwner: input.bankOwner,
      balance: 0, pendingBalance: 0, totalEarned: 0, totalWithdrawn: 0,
      createdAt: new Date().toISOString(),
      status: 'active',
    }
    await kvSet(KV_KEYS.affiliates, 'affiliates.json', [...list, newAff])
    return { ok: true, affiliate: newAff }
  })
}

// ── Commission ───────────────────────────────────────────────────────────────
export interface CreateCommissionInput {
  orderCode: string
  customerName: string
  affiliateCode: string
  orderAmount: number
  paymentType: 'prepaid' | 'cod'
}

export async function createAffiliateCommission(
  input: CreateCommissionInput
): Promise<{ ok: true; commission?: AffiliateCommission; skipped?: string } | { ok: false; error: string }> {
  return withLock('aff:write', async () => {
    const affiliates = await getAllAffiliates()
    const affIdx = affiliates.findIndex(a => a.code === input.affiliateCode && a.status === 'active')
    if (affIdx === -1) return { ok: false, error: 'Affiliate không tồn tại' }

    const commissions = await getAllCommissions()
    if (commissions.some(c => c.orderCode === input.orderCode)) {
      return { ok: true, skipped: 'duplicate' }
    }

    const commission = Math.round(input.orderAmount * COMMISSION_RATE)
    const newCommission: AffiliateCommission = {
      id: 'cm-' + Date.now(),
      affiliateCode: input.affiliateCode,
      orderCode: input.orderCode,
      customerName: input.customerName,
      orderAmount: input.orderAmount,
      commission,
      paymentType: input.paymentType,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }
    await kvSet(KV_KEYS.affiliateCommissions, 'affiliate-commissions.json', [...commissions, newCommission])

    affiliates[affIdx] = {
      ...affiliates[affIdx],
      pendingBalance: affiliates[affIdx].pendingBalance + commission,
    }
    await kvSet(KV_KEYS.affiliates, 'affiliates.json', affiliates)
    return { ok: true, commission: newCommission }
  })
}

async function approveCommissionInternal(commissions: AffiliateCommission[], idx: number): Promise<boolean> {
  const commission = commissions[idx]
  if (commission.status === 'approved') return false

  commissions[idx] = { ...commission, status: 'approved', approvedAt: new Date().toISOString() }
  await kvSet(KV_KEYS.affiliateCommissions, 'affiliate-commissions.json', commissions)

  const affiliates = await getAllAffiliates()
  const affIdx = affiliates.findIndex(a => a.code === commission.affiliateCode)
  if (affIdx !== -1) {
    affiliates[affIdx] = {
      ...affiliates[affIdx],
      balance: affiliates[affIdx].balance + commission.commission,
      pendingBalance: Math.max(0, affiliates[affIdx].pendingBalance - commission.commission),
      totalEarned: affiliates[affIdx].totalEarned + commission.commission,
    }
    await kvSet(KV_KEYS.affiliates, 'affiliates.json', affiliates)
  }
  return true
}

export async function approveCommissionById(commissionId: string): Promise<{ ok: boolean; error?: string }> {
  return withLock('aff:write', async () => {
    const commissions = await getAllCommissions()
    const idx = commissions.findIndex(c => c.id === commissionId)
    if (idx === -1) return { ok: false, error: 'Không tìm thấy' }
    const changed = await approveCommissionInternal(commissions, idx)
    if (!changed) return { ok: false, error: 'Đã duyệt rồi' }
    return { ok: true }
  })
}

export async function approveCommissionByOrderCode(orderCode: string): Promise<boolean> {
  return withLock('aff:write', async () => {
    const commissions = await getAllCommissions()
    const idx = commissions.findIndex(c => c.orderCode === orderCode && c.status === 'pending')
    if (idx === -1) return false
    return approveCommissionInternal(commissions, idx)
  })
}

// ── Withdraw ─────────────────────────────────────────────────────────────────
export async function createWithdrawal(
  code: string, phone: string, amount: number | undefined
): Promise<{ ok: true; withdrawal: AffiliateWithdrawal } | { ok: false; status: number; error: string }> {
  return withLock('aff:write', async () => {
    const affiliates = await getAllAffiliates()
    const idx = affiliates.findIndex(a => a.code === code && a.phone === phone)
    if (idx === -1) return { ok: false, status: 401, error: 'Unauthorized' }

    const aff = affiliates[idx]
    if (aff.balance < MIN_WITHDRAW) {
      return { ok: false, status: 400, error: `Số dư tối thiểu để rút là ${MIN_WITHDRAW.toLocaleString('vi-VN')}đ` }
    }

    const withdrawAmount = Math.min(amount ?? aff.balance, aff.balance)
    if (withdrawAmount < MIN_WITHDRAW) {
      return { ok: false, status: 400, error: 'Số tiền rút không hợp lệ' }
    }

    affiliates[idx] = {
      ...aff,
      balance: aff.balance - withdrawAmount,
      totalWithdrawn: aff.totalWithdrawn + withdrawAmount,
    }
    await kvSet(KV_KEYS.affiliates, 'affiliates.json', affiliates)

    const withdrawals = await getAllWithdrawals()
    const newWithdrawal: AffiliateWithdrawal = {
      id: 'wd-' + Date.now(),
      affiliateCode: code,
      affiliateName: aff.name,
      affiliatePhone: aff.phone,
      amount: withdrawAmount,
      bankName: aff.bankName,
      bankAccount: aff.bankAccount,
      bankOwner: aff.bankOwner,
      status: 'pending',
      requestedAt: new Date().toISOString(),
    }
    await kvSet(KV_KEYS.affiliateWithdrawals, 'affiliate-withdrawals.json', [...withdrawals, newWithdrawal])
    return { ok: true, withdrawal: newWithdrawal }
  })
}

export async function markWithdrawalPaid(withdrawalId: string): Promise<{ ok: boolean; error?: string }> {
  return withLock('aff:write', async () => {
    const withdrawals = await getAllWithdrawals()
    const idx = withdrawals.findIndex(w => w.id === withdrawalId)
    if (idx === -1) return { ok: false, error: 'Không tìm thấy' }
    withdrawals[idx] = { ...withdrawals[idx], status: 'paid', paidAt: new Date().toISOString() }
    await kvSet(KV_KEYS.affiliateWithdrawals, 'affiliate-withdrawals.json', withdrawals)
    return { ok: true }
  })
}

export async function toggleAffiliateStatus(affiliateId: string): Promise<{ ok: boolean; error?: string }> {
  return withLock('aff:write', async () => {
    const affiliates = await getAllAffiliates()
    const idx = affiliates.findIndex(a => a.id === affiliateId)
    if (idx === -1) return { ok: false, error: 'Không tìm thấy' }
    affiliates[idx] = {
      ...affiliates[idx],
      status: affiliates[idx].status === 'active' ? 'suspended' : 'active',
    }
    await kvSet(KV_KEYS.affiliates, 'affiliates.json', affiliates)
    return { ok: true }
  })
}
