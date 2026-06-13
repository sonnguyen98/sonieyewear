/**
 * Google Apps Script — Nhận đơn hàng từ website kinhmatsoni.com
 *
 * CÁCH DÙNG:
 * 1. Mở Google Sheet bạn muốn lưu đơn → Extensions → Apps Script
 * 2. Xoá hết code mặc định, dán toàn bộ file này vào
 * 3. Sửa SHEET_NAME bên dưới nếu sheet của bạn tên khác
 * 4. Deploy → New deployment → Type: Web app
 *      - Execute as: Me
 *      - Who has access: Anyone   (KHÔNG phải "Anyone with Google account")
 * 5. Copy URL Web app → dán vào .env.local biến GOOGLE_APPS_SCRIPT_URL
 *
 * MỖI LẦN SỬA CODE: phải Deploy → Manage deployments → Edit (cây bút) → Version: New version → Deploy
 *   nếu không, URL cũ vẫn chạy code cũ.
 */

const SHEET_NAME = 'Đơn hàng'  // <- đổi tên sheet nếu cần
const CUSTOMER_SHEET_NAME = 'Khách Hàng'  // <- sheet danh sách khách hàng (chăm sóc/bán lại)

// Header cột — sẽ tự tạo nếu sheet trống
const HEADERS = [
  'Thời gian',
  'Mã đơn',
  'Họ tên',
  'SĐT',
  'Địa chỉ',
  'Sản phẩm',
  'Màu',
  'Tròng kính',
  'Số tiền',
  'Hình thức TT',
  'Ghi chú',
  'Affiliate',
  'Trạng thái TT',
  'Mã GD',
  'Thời gian TT',
]

const CUSTOMER_HEADERS = [
  'SĐT',
  'Họ tên',
  'Email',
  'Ngày tạo',
  'Cập nhật lúc',
]

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents)
    const ss = SpreadsheetApp.getActiveSpreadsheet()
    let sheet = ss.getSheetByName(SHEET_NAME)
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME)
      sheet.appendRow(HEADERS)
      sheet.setFrozenRows(1)
    }
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS)
      sheet.setFrozenRows(1)
    }

    if (data.action === 'newOrder') {
      sheet.appendRow([
        new Date(),
        data.orderCode || '',
        data.name || '',
        data.phone || '',
        data.address || '',
        data.product || '',
        data.color || '',
        data.lens || '',
        data.payAmount || data.orderAmount || 0,
        data.paymentType || data.payment || '',
        data.note || '',
        data.affiliateCode || '',
        'Chưa thanh toán',
        '',
        '',
      ])
      return ok({ ok: true, action: 'newOrder', code: data.orderCode })
    }

    if (data.action === 'markPaid') {
      const code = data.orderCode
      const values = sheet.getDataRange().getValues()
      // Tìm hàng có mã đơn ở cột B (index 1)
      for (let i = 1; i < values.length; i++) {
        if (values[i][1] === code) {
          sheet.getRange(i + 1, 13).setValue('Đã thanh toán')   // cột "Trạng thái TT"
          sheet.getRange(i + 1, 14).setValue(data.transactionRef || '')
          sheet.getRange(i + 1, 15).setValue(data.paidAt || new Date())
          return ok({ ok: true, action: 'markPaid', code })
        }
      }
      return ok({ ok: false, reason: 'order_not_found', code })
    }

    if (data.action === 'syncCustomer') {
      const custSheet = getOrCreateCustomerSheet(ss)
      upsertCustomerRow(custSheet, data)
      return ok({ ok: true, action: 'syncCustomer', phone: data.phone })
    }

    if (data.action === 'syncAllCustomers') {
      const custSheet = getOrCreateCustomerSheet(ss)
      const customers = data.customers || []
      customers.forEach(c => upsertCustomerRow(custSheet, c))
      return ok({ ok: true, action: 'syncAllCustomers', count: customers.length })
    }

    return ok({ ok: false, reason: 'unknown_action', action: data.action })
  } catch (err) {
    return ok({ ok: false, error: String(err) })
  }
}

// ── Sheet "Khách Hàng" — danh sách khách hàng để chăm sóc/bán lại ────────────
function getOrCreateCustomerSheet(ss) {
  let sheet = ss.getSheetByName(CUSTOMER_SHEET_NAME)
  if (!sheet) {
    sheet = ss.insertSheet(CUSTOMER_SHEET_NAME)
    sheet.appendRow(CUSTOMER_HEADERS)
    sheet.setFrozenRows(1)
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(CUSTOMER_HEADERS)
    sheet.setFrozenRows(1)
  }
  return sheet
}

// Tìm hàng theo SĐT (cột A) — có thì cập nhật, chưa có thì thêm mới
function upsertCustomerRow(sheet, c) {
  const values = sheet.getDataRange().getValues()
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === c.phone) {
      if (c.name) sheet.getRange(i + 1, 2).setValue(c.name)
      if (c.email) sheet.getRange(i + 1, 3).setValue(c.email)
      sheet.getRange(i + 1, 5).setValue(new Date())
      return
    }
  }
  sheet.appendRow([
    c.phone || '',
    c.name || '',
    c.email || '',
    c.createdAt ? new Date(c.createdAt) : new Date(),
    new Date(),
  ])
}

function doGet() {
  // Cho test bằng trình duyệt — mở URL trên browser sẽ thấy "ok"
  return ok({ ok: true, msg: 'Apps Script đang hoạt động. Dùng POST để gửi đơn.' })
}

function ok(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON)
}
