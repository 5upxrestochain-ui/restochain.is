# Kiểm thử và nghiệm thu

## Kết quả đã thực hiện ngày 30/09/2026

- `npm test`: 17/17 kiểm thử đạt, không bỏ qua kiểm thử.
- `npm run build`: TypeScript đạt; Vite build production đạt.
- Kiểm thử SQL dùng SQLite trong bộ nhớ với cấu trúc `server/schema.sql`. Không giả lập kết quả thành công từ Cloudflare thật.

Các nhóm kiểm thử bao gồm: định giá ở máy chủ, mã đơn duy nhất, thu tiền/trừ kho một lần, tổng định lượng nhiều dòng, chụp công thức trong đơn, quyền staff/manager, trùng bàn và hết giữ tạm, ngày/giờ/sức chứa, chuyển món đặt trước, ca chồng lấn, CSV; đăng ký có mã riêng, băm mật khẩu, cookie/đăng xuất, chống POST khác origin, cách ly doanh nghiệp, cập nhật đồng thời và lọc dữ liệu đặt bàn công khai.

**Chưa kiểm chứng:** triển khai Vercel thật, D1 thật với token người dùng, DNS/tên miền, hình ảnh hiển thị và thao tác trực tiếp trên desktop/mobile. Phiên trình duyệt kiểm thử không mở được preview vì chính sách truy cập của môi trường; không dùng build/typecheck để thay cho nghiệm thu giao diện.

## Tự kiểm tra sau khi Deploy — dùng dữ liệu thử

| Bước | Thao tác                                                            | Kết quả mong đợi                                                                 |
| ---- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| 1    | Mở trang gốc, từng mục menu và trang giới thiệu                     | Không trang trắng; chữ tiếng Việt, biểu tượng, ảnh/font hiển thị                 |
| 2    | Mở ở máy tính và điện thoại khoảng 390 px                           | Menu thu gọn mở/đóng được, biểu mẫu không tràn màn hình, bảng cuộn ngang khi cần |
| 3    | Dùng Tab/Shift+Tab, Enter, Escape                                   | Thấy vị trí focus; hộp thoại đóng được; các trường có nhãn                       |
| 4    | Tạo đơn 2 cà phê sữa đá bằng giá mẫu                                | Tổng 90.000 đồng, trạng thái chưa thu, kho chưa đổi                              |
| 5    | Xác nhận tiền mặt trong danh sách đơn                               | Ghi nhận đúng 90.000; cà phê giảm 0,04 kg, sữa giảm 0,08 lít theo công thức mẫu  |
| 6    | Tải lại, tìm đơn vừa thu                                            | Đơn còn dữ liệu; không có nút thu tiền lần hai                                   |
| 7    | Tạo đơn vượt khả năng kho rồi thử thu                               | Báo thiếu nguyên liệu; trạng thái/kho không thay đổi một phần                    |
| 8    | Nhập kho với lý do, xem Nhật ký                                     | Tồn tăng đúng số lượng; ghi rõ ai/thao tác/lý do                                 |
| 9    | Sửa giá/công thức sau khi đã tạo một đơn                            | Đơn cũ giữ giá/công thức; đơn mới dùng giá/công thức mới                         |
| 10   | Cổng khách: chọn ngày mai, bàn B01, 10:00, 2 khách, đặt trước 2 món | Gửi được yêu cầu, còn trạng thái chờ và chưa thanh toán                          |
| 11   | Trở về Bàn & đặt chỗ, chọn đúng ngày mai                            | Thấy yêu cầu, tên/điện thoại/ghi chú và món đặt trước                            |
| 12   | Thử đặt cùng bàn 11:00; sau đó thử 12:00                            | 11:00 bị chặn, 12:00 được chọn khi không có lịch khác                            |
| 13   | Xác nhận → khách đến → chuyển món sang đơn                          | Có đúng một đơn chưa thu; chuyển lại không tạo trùng; thu tại mục Bán hàng       |
| 14   | Tạo hai ca cùng người chồng thời gian                               | Ca thứ hai bị từ chối                                                            |
| 15   | Xuất CSV, mở trong phần mềm bảng tính                               | Tiếng Việt và cột đúng, dữ liệu khớp bộ lọc đang dùng                            |

Không xác nhận nhận tiền cho giao dịch thật chỉ để thử phần mềm. Bộ dữ liệu Mộc được tạo riêng để thử các nút này.

## Thêm bước cho chế độ doanh nghiệp

1. Dùng database thử, tạo chủ doanh nghiệp; kiểm tra kho 0 và không có doanh thu giả.
2. Đóng đăng ký sau khi tạo tài khoản. Tạo staff/manager từ tài khoản chủ.
3. Đăng nhập staff ở trình duyệt khác: xử lý được đơn/đặt bàn, bị từ chối sửa kho/giá/tạo tài khoản.
4. Mở trang đặt bàn có mã doanh nghiệp trên điện thoại; gửi tên và điện thoại thử, kiểm tra trên máy quản lý đúng ngày. Thử cùng bàn bằng hai thiết bị gần đồng thời: chỉ một lịch được giữ.
5. Dùng hai phiên doanh nghiệp riêng: thay đổi doanh nghiệp A không xuất hiện ở B.
6. Hai thiết bị cùng ghi một phiên bản kho: thiết bị lưu sau nhận thông báo dữ liệu thay đổi, không âm kho hoặc mất thao tác.
7. Đăng xuất rồi thử lại API nghiệp vụ: phải yêu cầu đăng nhập. Kiểm tra cookie Secure/HttpOnly trên HTTPS.
8. Tắt mạng khi đang dùng dữ liệu thật: không hiểu nhầm là đã đồng bộ; kiểm tra lại danh sách sau khi có mạng trước khi gửi lại.
9. Kiểm tra response trang đặt bàn không chứa số điện thoại/ghi chú của lượt đặt khác, dữ liệu kho, nhân viên hoặc token.
10. Kiểm tra ngân sách/gói Vercel và Cloudflare của chính tài khoản triển khai trước khi mở rộng lưu lượng. Không coi bản demo là cam kết dịch vụ miễn phí không giới hạn.

## Ghi nhận lỗi

Mỗi lỗi nên có: thiết bị/trình duyệt; URL; vai trò; chế độ demo/cloud; bước tái hiện; kết quả mong đợi/thực tế; ảnh màn hình đã che thông tin khách; thời gian. Không đưa mật khẩu, token hoặc dữ liệu cá nhân thật vào issue công khai.
