function doPost(e) {
  try {
    var raw = e.postData ? e.postData.contents : ''
    var d = raw ? JSON.parse(raw) : {}
    var ss = SpreadsheetApp.getActiveSpreadsheet()

    if (d.action === 'markPaid') {
      var sheet = getSheet(ss)
      var rows = sheet.getDataRange().getValues()
      for (var i = 1; i < rows.length; i++) {
        if (String(rows[i][2]) === String(d.orderCode)) {
          var rowNum = i + 1
          sheet.getRange('A' + rowNum).setValue('✅ Đã thanh toán')
          sheet.getRange('A' + rowNum).setBackground('#d4edda').setFontColor('#155724').setFontWeight('bold')
          sheet.getRange('L' + rowNum).setValue(d.transactionRef || '')
          break
        }
      }
      return ok()
    }

    if (d.action === 'affiliateWithdraw') {
      var aSheet = ss.getSheetByName('Affiliate') || ss.insertSheet('Affiliate')
      if (aSheet.getLastRow() === 0) {
        aSheet.appendRow(['Thời gian','Tên','SĐT','Mã','Số tiền','Ngân hàng','STK','Chủ TK'])
        aSheet.getRange(1,1,1,8).setFontWeight('bold').setBackground('#333').setFontColor('#fff')
      }
      aSheet.appendRow([
        new Date().toLocaleString('vi-VN'),
        d.affiliateName||'', d.affiliatePhone||'', d.affiliateCode||'',
        d.amount||'', d.bankName||'', d.bankAccount||'', d.bankOwner||''
      ])
      return ok()
    }

    if (d.action === 'syncCustomer') {
      var cSheet = getCustomerSheet(ss)
      upsertCustomerRow(cSheet, d)
      return ok()
    }

    if (d.action === 'syncAllCustomers') {
      var cSheet = getCustomerSheet(ss)
      var list = d.customers || []
      for (var j = 0; j < list.length; j++) upsertCustomerRow(cSheet, list[j])
      return ok()
    }

    // Đơn hàng mới
    var sheet = getSheet(ss)
    var img = saveImage(d)
    var lastRow = sheet.getLastRow() + 1

    sheet.getRange(lastRow, 1).setValue('⏳ Chờ TT')
    sheet.getRange(lastRow, 2).setValue(new Date().toLocaleString('vi-VN'))
    sheet.getRange(lastRow, 3).setValue(String(d.orderCode || ''))
    sheet.getRange(lastRow, 4).setValue(String(d.name || ''))
    sheet.getRange(lastRow, 5).setValue(String(d.phone || ''))
    sheet.getRange(lastRow, 6).setValue(String(d.address || ''))
    sheet.getRange(lastRow, 7).setValue(String(d.product || '') + (d.color ? ' (' + String(d.color) + ')' : ''))
    sheet.getRange(lastRow, 8).setValue(String(d.lens || 'Chỉ Gọng'))
    sheet.getRange(lastRow, 9).setValue(String(d.total || ''))
    sheet.getRange(lastRow, 10).setValue(String(d.payment || ''))
    sheet.getRange(lastRow, 11).setValue(img || String(d.prescription || ''))
    sheet.getRange(lastRow, 12).setValue('')

    return ok()

  } catch(err) {
    Logger.log('ERROR: ' + err.message)
    return ContentService.createTextOutput('{"err":"' + err.message + '"}').setMimeType(ContentService.MimeType.JSON)
  }
}

function getSheet(ss) {
  var sheet = ss.getSheetByName('Đơn Hàng')
  if (!sheet) {
    sheet = ss.insertSheet('Đơn Hàng')
    sheet.appendRow([
      'Trạng thái TT','Thời gian','Mã đơn','Họ tên','SĐT',
      'Địa chỉ','Sản phẩm & Màu','Tròng kính','Tổng tiền',
      'Hình thức TT','Đơn thuốc','Mã GD'
    ])
    sheet.getRange(1,1,1,12).setBackground('#1a1a1a').setFontColor('#ffffff').setFontWeight('bold')
    sheet.setColumnWidth(1, 160)
    sheet.setFrozenRows(1)
  }
  return sheet
}

// ── Sheet "Khách Hàng" — danh sách khách hàng để chăm sóc/bán lại ────────────
function getCustomerSheet(ss) {
  var sheet = ss.getSheetByName('Khách Hàng')
  if (!sheet) {
    sheet = ss.insertSheet('Khách Hàng')
    sheet.appendRow(['SĐT','Họ tên','Email','Ngày tạo','Cập nhật lúc'])
    sheet.getRange(1,1,1,5).setBackground('#1a1a1a').setFontColor('#ffffff').setFontWeight('bold')
    sheet.setFrozenRows(1)
  }
  return sheet
}

// Tìm hàng theo SĐT (cột A) — có thì cập nhật, chưa có thì thêm mới
function upsertCustomerRow(sheet, c) {
  var rows = sheet.getDataRange().getValues()
  var now = new Date().toLocaleString('vi-VN')
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(c.phone)) {
      var rowNum = i + 1
      if (c.name) sheet.getRange(rowNum, 2).setValue(String(c.name))
      if (c.email) sheet.getRange(rowNum, 3).setValue(String(c.email))
      sheet.getRange(rowNum, 5).setValue(now)
      return
    }
  }
  var lastRow = sheet.getLastRow() + 1
  sheet.getRange(lastRow, 1).setValue(String(c.phone || ''))
  sheet.getRange(lastRow, 2).setValue(String(c.name || ''))
  sheet.getRange(lastRow, 3).setValue(String(c.email || ''))
  sheet.getRange(lastRow, 4).setValue(c.createdAt ? new Date(c.createdAt).toLocaleString('vi-VN') : now)
  sheet.getRange(lastRow, 5).setValue(now)
}

function saveImage(d) {
  if (!d.prescriptionImage || String(d.prescriptionImage).indexOf('data:image') !== 0) return ''
  try {
    var parts = d.prescriptionImage.split(',')
    var mime = d.prescriptionImage.split(';')[0].split(':')[1]
    var blob = Utilities.newBlob(Utilities.base64Decode(parts[1]), mime, 'don-thuoc-' + d.phone + '.jpg')
    var iter = DriveApp.getFoldersByName('SONi Đơn Thuốc')
    var folder = iter.hasNext() ? iter.next() : DriveApp.createFolder('SONi Đơn Thuốc')
    var file = folder.createFile(blob)
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW)
    return file.getUrl()
  } catch(e) { return '' }
}

function ok() {
  return ContentService.createTextOutput('{"success":true}').setMimeType(ContentService.MimeType.JSON)
}

function requestPermissions() {
  SpreadsheetApp.getActiveSpreadsheet()
  DriveApp.getRootFolder()
  Logger.log('OK')
}

// ══════════════════════════════════════════════════════════════════════════════
//  PHIẾU LÀM KÍNH — menu in phiếu cho bộ phận kỹ thuật/xưởng
// ══════════════════════════════════════════════════════════════════════════════

// Tự chạy khi mở Sheet → tạo menu "🔧 Xưởng Kính"
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🔧 Xưởng Kính')
    .addItem('📄 In phiếu — dòng đang chọn', 'inPhieuDangChon')
    .addItem('🖨️ In phiếu — các đơn CHƯA in', 'inPhieuChuaIn')
    .addSeparator()
    .addItem('✅ Đánh dấu đã in (dòng đang chọn)', 'danhDauDaIn')
    .addToUi()
}

// Cột M (13) = cờ "Đã in phiếu"
var PHIEU_FLAG_COL = 13

// In các dòng đang bôi chọn
function inPhieuDangChon() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Đơn Hàng')
  if (!sheet) { SpreadsheetApp.getUi().alert('Không tìm thấy sheet "Đơn Hàng".'); return }
  var sel = sheet.getActiveRange()
  var startRow = sel.getRow()
  var numRows = sel.getNumRows()
  var rows = []
  for (var i = 0; i < numRows; i++) {
    var r = startRow + i
    if (r < 2) continue // bỏ qua hàng tiêu đề
    rows.push(sheet.getRange(r, 1, 1, 12).getValues()[0])
  }
  if (rows.length === 0) { SpreadsheetApp.getUi().alert('Hãy bấm chọn ít nhất 1 dòng đơn (không phải hàng tiêu đề).'); return }
  showPhieu(rows)
}

// In các đơn chưa được đánh dấu "đã in" (cột M)
function inPhieuChuaIn() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Đơn Hàng')
  if (!sheet) { SpreadsheetApp.getUi().alert('Không tìm thấy sheet "Đơn Hàng".'); return }
  var last = sheet.getLastRow()
  if (last < 2) { SpreadsheetApp.getUi().alert('Chưa có đơn nào.'); return }
  var data = sheet.getRange(2, 1, last - 1, PHIEU_FLAG_COL).getValues()
  var rows = []
  for (var i = 0; i < data.length; i++) {
    if (String(data[i][PHIEU_FLAG_COL - 1]).indexOf('✅') === -1) {
      rows.push(data[i].slice(0, 12))
    }
  }
  if (rows.length === 0) { SpreadsheetApp.getUi().alert('Tất cả đơn đã được in phiếu rồi 🎉'); return }
  showPhieu(rows)
}

// Đánh dấu các dòng đang chọn là đã in (cột M)
function danhDauDaIn() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Đơn Hàng')
  if (!sheet) return
  var sel = sheet.getActiveRange()
  var startRow = sel.getRow()
  var numRows = sel.getNumRows()
  var stamp = '✅ ' + new Date().toLocaleDateString('vi-VN')
  for (var i = 0; i < numRows; i++) {
    var r = startRow + i
    if (r < 2) continue
    sheet.getRange(r, PHIEU_FLAG_COL).setValue(stamp)
  }
  SpreadsheetApp.getUi().alert('Đã đánh dấu ' + numRows + ' đơn là "đã in phiếu".')
}

// Mở hộp thoại chứa phiếu + nút in
function showPhieu(rows) {
  // Gom mỗi 3 phiếu vào 1 trang A5
  var pages = ''
  for (var i = 0; i < rows.length; i += 3) {
    var group = ''
    for (var j = i; j < i + 3 && j < rows.length; j++) group += phieuForRow(rows[j])
    pages += '<div class="page">' + group + '</div>'
  }
  // Mã đơn của các phiếu đang hiển thị — để đánh dấu "đã in" sau khi in
  var codes = []
  for (var c = 0; c < rows.length; c++) codes.push(String(rows[c][2]))
  var codesJson = JSON.stringify(codes)
  var html = ''
    + '<style>'
    + '  *{box-sizing:border-box;font-family:Arial,Helvetica,sans-serif}'
    + '  body{margin:0;background:#e9e9e9}'
    + '  .bar{position:sticky;top:0;z-index:9;background:#fff;border-bottom:1px solid #ddd;padding:9px 14px;text-align:center}'
    + '  .btn{background:#e8590c;color:#fff;border:0;padding:9px 22px;font-size:15px;font-weight:bold;border-radius:8px;cursor:pointer}'
    + '  .btn2{background:#fff;color:#155724;border:1.5px solid #155724;padding:8px 16px;font-size:13px;font-weight:bold;border-radius:8px;cursor:pointer;margin-left:8px}'
    + '  .mk{margin-left:10px;font-size:12px;color:#155724;font-weight:bold}'
    + '  .wrap{padding:12px}'
    + '  .page{background:#fff;width:148mm;margin:0 auto 12px;padding:6mm;box-shadow:0 1px 4px rgba(0,0,0,.2)}'
    + '  .phieu{border:1.5px solid #111;border-radius:6px;height:54mm;padding:5px 8px;margin-bottom:3mm;overflow:hidden;display:flex;flex-direction:column}'
    + '  .phieu:last-child{margin-bottom:0}'
    + '  .hd{display:flex;justify-content:space-between;align-items:center;border-bottom:1.5px solid #111;padding-bottom:3px;margin-bottom:4px}'
    + '  .brand{font-size:14px;font-weight:900;letter-spacing:.5px;line-height:1}'
    + '  .brand small{font-weight:700;font-size:8px;color:#666;letter-spacing:0}'
    + '  .code{text-align:right;font-size:10px;line-height:1.25}'
    + '  .code b{font-size:12px}'
    + '  .paid{display:inline-block;font-size:8px;font-weight:bold;padding:1px 6px;border-radius:10px}'
    + '  .p-yes{background:#d4edda;color:#155724}.p-no{background:#fff3cd;color:#856404}'
    + '  .cols{display:flex;gap:8px;flex:1;min-height:0}'
    + '  .cl{flex:1.1;font-size:10px}'
    + '  .cr{flex:1;border-left:1px dashed #bbb;padding-left:7px}'
    + '  .li{display:flex;margin:1.5px 0;line-height:1.25}'
    + '  .li .k{width:40px;color:#666;flex:none}'
    + '  .li .v{font-weight:bold;color:#111}'
    + '  .rh{font-size:9px;color:#e8590c;font-weight:bold;text-transform:uppercase;letter-spacing:.5px;margin-bottom:2px}'
    + '  table.rx{width:100%;border-collapse:collapse;font-size:10px}'
    + '  table.rx th,table.rx td{border:1px solid #999;padding:1px 3px;text-align:center}'
    + '  table.rx th{background:#f3f3f3;font-size:8.5px}'
    + '  table.rx td.eye{font-weight:bold;background:#fafafa}'
    + '  .rxextra{font-size:10px;font-weight:bold;margin-top:3px}'
    + '  .rxraw{font-size:9.5px;background:#fff8f0;border:1px solid #f3b;padding:3px 5px;border-radius:4px}'
    + '  @media print{'
    + '    @page{size:A5 portrait;margin:0}'
    + '    html,body{background:#fff;margin:0;padding:0}.bar{display:none}.wrap{padding:0}'
    + '    .page{width:auto;margin:0;padding:5mm;box-shadow:none;page-break-after:always}'
    + '    .page:last-child{page-break-after:auto}'
    + '  }'
    + '</style>'
    + '<div class="bar">'
    + '  <button class="btn" onclick="doPrint()">🖨️ IN A5 — 3 phiếu/tờ (' + rows.length + ' đơn)</button>'
    + '  <button class="btn2" onclick="markNow()">✅ Đánh dấu đã in</button>'
    + '  <span id="mk" class="mk"></span>'
    + '  <div style="font-size:11px;color:#c00;margin-top:5px"><b>Khi in:</b> Khổ <b>A5</b> · Lề (Margins) = <b>None/Không lề</b> · Scale <b>100%</b> · <b>TẮT</b> "Headers and footers"</div>'
    + '</div>'
    + '<div class="wrap">' + pages + '</div>'
    + '<script>'
    + '  var CODES = ' + codesJson + ';'
    + '  function markNow(){'
    + '    google.script.run.withSuccessHandler(function(n){'
    + '      document.getElementById("mk").textContent = "✅ Đã đánh dấu " + n + " đơn đã in phiếu";'
    + '    }).markPrintedByCodes(CODES);'
    + '  }'
    + '  function doPrint(){ window.print(); }'
    + '  window.addEventListener("afterprint", function(){'
    + '    if (confirm("Đã in xong? Bấm OK để đánh dấu " + CODES.length + " đơn là ĐÃ IN PHIẾU.")) markNow();'
    + '  });'
    + '</script>'
  var out = HtmlService.createHtmlOutput(html).setWidth(660).setHeight(700)
  SpreadsheetApp.getUi().showModalDialog(out, 'Phiếu Làm Kính A5 — ' + rows.length + ' đơn')
}

// Đánh dấu "đã in phiếu" (cột M) cho các đơn theo danh sách Mã đơn
function markPrintedByCodes(codes) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Đơn Hàng')
  if (!sheet || !codes || !codes.length) return 0
  var last = sheet.getLastRow()
  if (last < 2) return 0
  var col = sheet.getRange(2, 3, last - 1, 1).getValues() // cột C = Mã đơn
  var want = {}
  for (var i = 0; i < codes.length; i++) want[String(codes[i])] = true
  var stamp = '✅ ' + new Date().toLocaleDateString('vi-VN')
  var count = 0
  for (var r = 0; r < col.length; r++) {
    if (want[String(col[r][0])]) {
      sheet.getRange(r + 2, PHIEU_FLAG_COL).setValue(stamp)
      count++
    }
  }
  return count
}

// Escape HTML để tránh vỡ layout
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// Dựng HTML 1 phiếu từ 1 dòng đơn
function phieuForRow(r) {
  var status = String(r[0] || '')
  var time = String(r[1] || '')
  var code = String(r[2] || '')
  var name = String(r[3] || '')
  var phone = String(r[4] || '')
  var address = String(r[5] || '')
  var product = String(r[6] || '')
  var lens = String(r[7] || '')
  var total = String(r[8] || '')
  var payment = String(r[9] || '')
  var toa = String(r[10] || '')

  var paid = status.indexOf('✅') !== -1
  var paidBadge = paid
    ? '<span class="paid p-yes">✅ ĐÃ THANH TOÁN</span>'
    : '<span class="paid p-no">⏳ CHỜ / COD</span>'

  var toaHtml = renderToa(toa)

  return ''
    + '<div class="phieu">'
    + '  <div class="hd">'
    + '    <div class="brand">SONi <small>PHIẾU LÀM KÍNH</small></div>'
    + '    <div class="code"><b>' + esc(code) + '</b> &nbsp;' + paidBadge + '<br>' + esc(time) + '</div>'
    + '  </div>'
    + '  <div class="cols">'
    + '    <div class="cl">'
    + '      <div class="li"><span class="k">Khách</span><span class="v">' + esc(name) + '</span></div>'
    + '      <div class="li"><span class="k">SĐT</span><span class="v">' + esc(phone) + '</span></div>'
    + '      <div class="li"><span class="k">ĐC</span><span class="v">' + esc(address) + '</span></div>'
    + '      <div class="li"><span class="k">Gọng</span><span class="v">' + esc(product) + '</span></div>'
    + '      <div class="li"><span class="k">Tròng</span><span class="v">' + esc(lens) + '</span></div>'
    + '      <div class="li"><span class="k">Tổng</span><span class="v">' + esc(total) + ' · ' + esc(payment) + '</span></div>'
    + '    </div>'
    + '    <div class="cr">'
    + '      <div class="rh">Toa Kính</div>' + toaHtml
    + '    </div>'
    + '  </div>'
    + '</div>'
}

// Chuyển chuỗi toa "MP: SPH .. / CYL .. / Trục .. | MT: ... | ADD .. | PD: .." thành bảng đẹp
function renderToa(toa) {
  if (!toa) return '<div class="rxraw">— Không có toa —</div>'
  // Nếu là link ảnh đơn thuốc
  if (toa.indexOf('http') === 0) {
    return '<div class="rxraw">📷 Ảnh đơn thuốc: <a href="' + esc(toa) + '" target="_blank">' + esc(toa) + '</a></div>'
  }
  // Chỉ gọng
  if (toa.indexOf('Không cần') !== -1 || toa.toLowerCase().indexOf('chỉ gọng') !== -1) {
    return '<div class="rxraw">Chỉ gọng — không lắp tròng độ</div>'
  }
  var mp = matchEye(toa, 'MP')
  var mt = matchEye(toa, 'MT')
  if (!mp && !mt) return '<div class="rxraw">' + esc(toa) + '</div>' // fallback: hiện nguyên văn

  var add = (toa.match(/ADD\s*([+\-]?[\d.]+)/i) || [])[1] || ''
  var pd = (toa.match(/PD:\s*([\d.]+\s*mm?)/i) || [])[1] || ''

  var html = '<table class="rx"><tr><th></th><th>SPH (Cầu)</th><th>CYL (Trụ)</th><th>Trục</th></tr>'
  html += eyeRow('MP (Phải)', mp)
  html += eyeRow('MT (Trái)', mt)
  html += '</table>'
  if (add || pd) {
    html += '<div class="rxextra">'
    if (add) html += 'ADD: ' + esc(add) + '&nbsp;&nbsp;&nbsp;'
    if (pd) html += 'PD: ' + esc(pd)
    html += '</div>'
  }
  return html
}

function matchEye(toa, tag) {
  // Lấy đoạn sau "MP:" hoặc "MT:" đến dấu "|" kế tiếp
  var re = new RegExp(tag + ':([^|]*)', 'i')
  var m = toa.match(re)
  if (!m) return null
  var seg = m[1]
  return {
    sph: (seg.match(/SPH\s*([+\-]?[\d.]+|\?)/i) || [])[1] || '—',
    cyl: (seg.match(/CYL\s*([+\-]?[\d.]+|\?)/i) || [])[1] || '—',
    axis: (seg.match(/Tr[uụ]c\s*([\d]+|\?)/i) || [])[1] || '—'
  }
}

function eyeRow(label, e) {
  if (!e) return '<tr><td class="eye">' + label + '</td><td>—</td><td>—</td><td>—</td></tr>'
  return '<tr><td class="eye">' + label + '</td><td>' + esc(e.sph) + '</td><td>' + esc(e.cyl) + '</td><td>' + esc(e.axis) + '</td></tr>'
}
