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

    return ok({ ok: false, reason: 'unknown_action', action: data.action })
  } catch (err) {
    return ok({ ok: false, error: String(err) })
  }
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
