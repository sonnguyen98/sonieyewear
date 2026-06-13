// Google Apps Script trả 302 redirect — Node.js tự đổi POST→GET làm mất body.
// Dùng redirect:'manual' rồi gọi lại Location bằng GET để hoàn tất request.
export async function postToSheet(data: object): Promise<void> {
  const url = process.env.GOOGLE_APPS_SCRIPT_URL
  if (!url || url.includes('paste_your')) return

  try {
    const r1 = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      redirect: 'manual',
    })
    if (r1.status >= 300 && r1.status < 400) {
      const loc = r1.headers.get('location') ?? ''
      if (loc) await fetch(loc, { method: 'GET' })
    }
  } catch (err) {
    console.error('[Sheet] Error:', err)
  }
}
