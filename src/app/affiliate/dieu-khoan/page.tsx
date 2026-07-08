import Link from 'next/link'

export const metadata = {
  title: 'Điều khoản Chương trình Tiếp thị Liên kết — SONi',
  description: 'Quy định hoa hồng, ghi nhận đơn, duyệt và rút tiền của chương trình Affiliate SONi.',
}

const sections: { h: string; body: React.ReactNode }[] = [
  {
    h: '1. Hoa hồng',
    body: <>Cộng tác viên (CTV) nhận <b>10% giá trị đơn hàng</b> thành công phát sinh qua link giới thiệu của mình. Hoa hồng được tính trên số tiền khách thực trả (không gồm phí vận chuyển do bên thứ ba thu, nếu có).</>,
  },
  {
    h: '2. Ghi nhận đơn (attribution)',
    body: <>Khi khách bấm vào link giới thiệu, mã CTV được lưu trên trình duyệt khách trong <b>30 ngày</b>. Đơn hàng được ghi cho CTV có link được bấm <b>gần nhất</b> (last-click). Nếu khách xoá dữ liệu trình duyệt, dùng thiết bị khác hoặc ẩn danh thì đơn có thể không được ghi nhận.</>,
  },
  {
    h: '3. Trạng thái & duyệt hoa hồng',
    body: <>Hoa hồng ban đầu ở trạng thái <b>“Chờ duyệt”</b>. Đơn thanh toán trước (chuyển khoản) được duyệt tự động khi SONi nhận đủ tiền. Đơn <b>COD</b> chỉ được duyệt sau khi đơn <b>giao thành công và khách đã thanh toán</b>. Đơn bị huỷ / hoàn / bom hàng sẽ không được duyệt.</>,
  },
  {
    h: '4. Rút tiền',
    body: <>Số dư <b>đã duyệt</b> tối thiểu <b>100.000đ</b> mới được yêu cầu rút. Tiền chuyển về đúng tài khoản ngân hàng CTV đã đăng ký, thường trong <b>vòng 24 giờ</b> làm việc. Vì lý do an toàn, SONi không hỗ trợ đổi tài khoản nhận tiền qua hệ thống — vui lòng liên hệ trực tiếp nếu cần thay đổi.</>,
  },
  {
    h: '5. Hành vi bị cấm',
    body: <>Không <b>tự đặt hàng qua link của chính mình</b> để nhận hoa hồng (hệ thống tự loại các đơn có SĐT trùng CTV). Không tạo đơn ảo, không spam, không chạy quảng cáo mạo danh thương hiệu SONi, không cam kết sai về sản phẩm/chính sách. Vi phạm có thể bị <b>thu hồi hoa hồng và khoá tài khoản</b>.</>,
  },
  {
    h: '6. Quyền của SONi',
    body: <>SONi có quyền điều chỉnh tỷ lệ hoa hồng, cập nhật điều khoản, tạm khoá tài khoản có dấu hiệu gian lận, và từ chối duyệt các hoa hồng không hợp lệ. Mọi thay đổi sẽ được áp dụng cho các đơn phát sinh sau thời điểm thay đổi.</>,
  },
]

export default function AffiliateTermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-900 text-white px-4 py-5">
        <div className="max-w-2xl mx-auto">
          <Link href="/affiliate" className="text-xs text-gray-400 hover:text-white">← Về trang Affiliate</Link>
          <h1 className="font-black text-xl mt-1">Điều khoản Chương trình Tiếp thị Liên kết</h1>
          <p className="text-xs text-gray-400 mt-1">Áp dụng cho toàn bộ Cộng tác viên SONi</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {sections.map(s => (
          <div key={s.h} className="bg-white rounded-2xl border border-gray-200 p-4">
            <h2 className="font-bold text-sm text-gray-900 mb-1.5">{s.h}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{s.body}</p>
          </div>
        ))}
        <p className="text-center text-xs text-gray-400 pt-2">
          Cần hỗ trợ? Liên hệ SONi qua Zalo hoặc hotline trên website.
        </p>
      </div>
    </div>
  )
}
