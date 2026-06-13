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
