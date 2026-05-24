import crypto from 'crypto'
import { kvGet, kvSet, withLock, KV_KEYS } from './kv-store'

// ── Types ────────────────────────────────────────────────────────────────────
export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  passwordHash: string
  createdAt: string
  dob?: string
}

export type SafeCustomer = Omit<Customer, 'passwordHash'>

// ── Password hashing (scrypt — cùng params với affiliateStore) ───────────────
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

export function stripPassword(c: Customer): SafeCustomer {
  const { passwordHash: _, ...safe } = c
  return safe
}

// ── Read ops ─────────────────────────────────────────────────────────────────
export async function getAllCustomers(): Promise<Customer[]> {
  return (await kvGet<Customer[]>(KV_KEYS.customers, 'customers.json')) ?? []
}

export async function findCustomerById(id: string): Promise<Customer | null> {
  const list = await getAllCustomers()
  return list.find(c => c.id === id) ?? null
}

export async function findCustomerByPhone(phone: string): Promise<Customer | null> {
  const list = await getAllCustomers()
  return list.find(c => c.phone === phone) ?? null
}

export async function findCustomerByEmail(email: string): Promise<Customer | null> {
  const list = await getAllCustomers()
  return list.find(c => c.email === email.toLowerCase()) ?? null
}

// ── Register ─────────────────────────────────────────────────────────────────
export interface RegisterCustomerInput {
  name: string
  email: string
  phone: string
  password: string
  dob?: string
}

export async function registerCustomer(
  input: RegisterCustomerInput
): Promise<{ ok: true; customer: Customer } | { ok: false; error: string }> {
  return withLock('customer:write', async () => {
    const list = await getAllCustomers()

    if (list.some(c => c.phone === input.phone.trim()))
      return { ok: false, error: 'Số điện thoại đã được đăng ký' }

    if (list.some(c => c.email === input.email.toLowerCase().trim()))
      return { ok: false, error: 'Email đã được đăng ký' }

    const customer: Customer = {
      id: 'cust-' + Date.now(),
      name: input.name.trim(),
      email: input.email.toLowerCase().trim(),
      phone: input.phone.trim(),
      passwordHash: scryptHash(input.password),
      createdAt: new Date().toISOString(),
      ...(input.dob ? { dob: input.dob } : {}),
    }

    await kvSet(KV_KEYS.customers, 'customers.json', [...list, customer])
    return { ok: true, customer }
  })
}

// ── Auth ─────────────────────────────────────────────────────────────────────
export async function verifyCustomerLogin(
  phone: string,
  password: string
): Promise<Customer | null> {
  const list = await getAllCustomers()
  const customer = list.find(c => c.phone === phone.trim())
  if (!customer) return null
  return scryptVerify(password, customer.passwordHash) ? customer : null
}
