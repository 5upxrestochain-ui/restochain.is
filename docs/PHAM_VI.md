# Phạm vi nghiệp vụ và các giả định cần hiểu

## 1. Ý nghĩa bản bàn giao

Bản này hiện thực một phần vận hành cốt lõi của RESTOCHAIN: hai cổng, bảy nhóm chức năng quản trị, chi nhánh café/buffet, định lượng café, xuất kho thủ công cho buffet, đặt bàn theo nhu cầu, phân quyền và cảnh báo ngưỡng. Nó không thay thế bản đặc tả toàn bộ dự án, không phải ứng dụng iOS/Android và không phải bản nâng cấp tại chỗ của hệ thống đã vận hành trước đó.

Đây là một codebase mới viết bằng React/TypeScript, Vite và Vercel Node Functions. Cơ sở dữ liệu là D1 qua SQL tham số hóa; bản này chưa dùng Drizzle ORM. Mọi dữ liệu về nhà hàng, doanh thu, khách hàng, tên nhân sự và công thức mặc định là dữ liệu minh họa cần thay trước khi thử nghiệm thật.

## 2. Quy tắc đơn hàng và kho

- Café: chọn món → tạo đơn chưa thu → nhân viên xác nhận đã nhận đủ tiền mặt → đơn hoàn tất và trừ nguyên liệu theo định lượng một lần.
- Máy chủ tự lấy giá món, không nhận giá do trình duyệt gửi làm căn cứ thu tiền. Đơn giữ lại tên, giá và công thức tại lúc tạo. Đổi thực đơn không sửa ngược đơn đó. Các đơn mẫu được tạo sẵn trước khi thao tác là dữ liệu minh họa và dùng công thức mẫu.
- Khi thu tiền, cộng nhu cầu nguyên liệu của toàn bộ món trước khi kiểm tra kho. Thiếu nguyên liệu thì toàn bộ thao tác bị từ chối; đơn và kho giữ nguyên.
- Đơn chưa thu có thể hủy và bắt buộc ghi lý do. Đơn đã thu không được hủy/xóa; chức năng hoàn tiền, bù hàng và đối soát chưa được triển khai.
- Mỗi lần nhập/xuất thủ công có số lượng và lý do. Ở buffet, thao tác này có thể ghi nhận xuất theo mẻ; chưa có màn hình xây công thức mẻ, hao hụt thực tế hay bán vé buffet.
- Chưa quản lý hạn sử dụng, lô nhập, FEFO, nhà cung cấp, phiếu mua hàng, chuyển kho liên chi nhánh hoặc kế toán giá vốn.

**Giới hạn vận hành:** tồn kho trong bản này được trừ tại lúc thu tiền, chưa giữ nguyên liệu ngay khi tạo đơn. Hai đơn chưa thu có thể cùng cần lượng hàng vượt tồn; đơn thu sau sẽ bị chặn khi thiếu kho. Nếu thực tế pha chế trước thu tiền, cần bổ sung bước xuất khi chế biến và xử lý hủy/hao hụt trước khi chạy nhà hàng thật. Không coi con số doanh thu trên dashboard là lợi nhuận hay báo cáo thuế.

## 3. Quy tắc đặt bàn và gọi món trước

- Thời gian đặt: từ hiện tại đến 60 ngày tới, giờ bắt đầu 07:00–21:00 ở múi giờ Việt Nam; lựa chọn trên giao diện bắt đầu từ 08:00. Một lượt dự kiến 120 phút.
- Kiểm tra bàn đúng chi nhánh, số khách không vượt số ghế và khoảng thời gian không chồng lấn. Kết thúc đúng lúc lượt tiếp theo bắt đầu được xem là không trùng.
- Yêu cầu mới chờ xác nhận và giữ tạm 30 phút tính từ lúc gửi. Hết 30 phút thì hết giữ tạm; bản ghi vẫn còn để nhân viên xử lý. Nếu xác nhận muộn, hệ thống kiểm tra lại bàn.
- Trạng thái: chờ xác nhận → đã xác nhận → đã đến; có thể hủy trước khi đã đến. Chưa có danh sách chờ, ghép bàn, đặt cọc, đổi giờ hay tự gửi thông báo xác nhận qua SMS/email.
- Café có thể đặt món trước. Hệ thống lưu giá niêm yết tại lúc đặt; chưa thu tiền và chưa trừ kho. Khi khách đến, nhân viên bấm “Chuyển món sang đơn”; một lượt chỉ được chuyển một lần. Đơn sau đó đi qua bước thu tiền thông thường. Công thức dùng khi chuyển món là công thức hiện tại, được chụp lại trong đơn mới.
- Trang công khai chỉ trả danh mục, chi nhánh, bàn và khung giờ bận đã bỏ danh tính; không trả danh sách khách, số điện thoại, ghi chú riêng, kho, ca làm hoặc nhật ký nội bộ.
- Khách đồng ý cung cấp tên/điện thoại để xử lý đặt bàn; việc này không tự đăng ký họ nhận tiếp thị.

## 4. Khách hàng, nhân sự và quyền

Hồ sơ khách mới có lượt ghé và chi tiêu bằng 0. Bản MVP chưa tự gắn đơn vào hồ sơ bằng ID khách để tăng lịch sử/tích điểm. Các số lượt ghé/chi tiêu hiển thị sẵn trong bản demo là số liệu mẫu. Không suy ra lòng trung thành hoặc hiệu quả CRM từ các số này.

Xếp ca hiện dùng tên nhân viên, chưa gắn vào ID tài khoản. Ca cùng tên và cùng ngày không được trùng giờ, kể cả khác chi nhánh. Ca phải bắt đầu và kết thúc trong cùng ngày. Bắt đầu/kết thúc ca là thao tác ghi nhận thủ công, chưa phải hệ thống chấm công, tính lương hoặc xác thực vị trí.

| Quyền                                               | Nhân viên | Quản lý | Chủ doanh nghiệp |
| --------------------------------------------------- | --------- | ------- | ---------------- |
| Xem dữ liệu trong doanh nghiệp                      | Có        | Có      | Có               |
| Tạo/thu/hủy đơn chưa thu, xử lý đặt bàn             | Có        | Có      | Có               |
| Bắt đầu/kết thúc ca và đánh dấu cảnh báo đã xem     | Có        | Có      | Có               |
| Sửa món/công thức, nhập/xuất kho, tạo khách, xếp ca | Không     | Có      | Có               |
| Sửa thông tin doanh nghiệp/chi nhánh                | Không     | Không   | Có               |
| Tạo tài khoản nội bộ                                | Không     | Không   | Có               |

Quyền đọc hiện ở cấp doanh nghiệp, chưa giới hạn nhân viên theo chi nhánh hoặc che doanh thu theo chức danh. Bắt đầu/kết thúc ca cũng chưa giới hạn “chỉ ca của chính mình”. Nếu doanh nghiệp yêu cầu những giới hạn này, cần mở rộng quyền trước khi dùng thật.

## 5. Kiến trúc dữ liệu và bảo vệ thông tin

- Bốn bảng D1: `workspaces`, `users`, `sessions`, `rate_limits`.
- Nghiệp vụ mỗi doanh nghiệp nằm trong `state_json`, kèm số phiên bản `revision`. Mỗi lần ghi dùng điều kiện phiên bản cũ còn đúng; đơn, kho và nhật ký được cập nhật cùng một câu SQL. Xung đột trả mã 409 và giao diện tải lại dữ liệu.
- Giới hạn chủ động 1 MB JSON cho một không gian. Nhật ký giữ 500 thao tác gần nhất. Chưa có phân trang/lưu trữ lịch sử dài hạn, sao lưu tự động ở ứng dụng hay hệ thống audit bất biến.
- Mật khẩu được băm bằng scrypt với salt riêng. Cookie phiên có HttpOnly, SameSite=Lax, Secure trên HTTPS, hết hạn sau 8 giờ; cơ sở dữ liệu chỉ lưu hash token phiên.
- POST yêu cầu đúng Origin và JSON; truy vấn SQL dùng tham số; các đường đăng nhập, đăng ký, đặt bàn và tạo thành viên có giới hạn tần suất. CSV có xử lý ô có thể bị hiểu thành công thức.
- Token D1 chỉ đặt ở môi trường máy chủ. Không lưu thông tin thật của chế độ doanh nghiệp vào localStorage.
- Đăng ký cần bật cấu hình và mã riêng. Chưa có xác minh email, quên/đổi mật khẩu, khóa/xóa tài khoản qua giao diện, MFA, thư mời và phân quyền chi tiết theo chi nhánh. Không mở đăng ký đại trà ở trạng thái này.

REST API D1 có giới hạn dùng chung tài khoản Cloudflare, do đó adapter hiện tại chỉ dành cho thử nghiệm ít lưu lượng. Cấu trúc JSON giúp các nghiệp vụ nhỏ ghi nhất quán nhưng không phù hợp số lượng lớn đơn/chi nhánh. Giai đoạn thương mại cần chuẩn hóa bảng đơn, dòng đơn, giao dịch kho, đặt bàn, nhân sự và audit; dùng Worker D1 binding; phân trang, idempotency có khóa bền vững, backup/restore và kiểm thử tải.

Nếu mạng mất sau khi máy chủ đã lưu nhưng trước khi trả kết quả, phải kiểm tra danh sách trước khi gửi lại. Thu tiền và chuyển món đã chống thực hiện lại cùng ID; không tuyên bố mọi thao tác nhập kho/công khai đều có bảo đảm exactly-once qua mọi lần mất mạng.

## 6. Những nội dung chưa triển khai

Thanh toán trực tuyến/QR và webhook xác nhận; hóa đơn điện tử; POS bán vé buffet; hoàn tiền; quy trình chế biến/bếp; FEFO; CRM tích điểm; lương/chấm công thực; dự báo AI/ML; đánh giá nhà hàng; bản đồ địa lý; ứng dụng native; offline đồng bộ; quản lý gói thuê bao; migration tự động từ hệ thống RESTOCHAIN cũ.

Giao diện hiện sửa danh mục món/nguyên liệu/chi nhánh/bàn có sẵn ở mức nêu trong README; chưa có đầy đủ CRUD tạo/xóa tất cả danh mục. Thay bộ danh mục khởi tạo trước khi tạo tenant tại `initialState` trong `src/domain.ts`, hoặc xây màn hình cấu hình danh mục riêng. Không sửa tay `state_json` của hệ thống đang có giao dịch nếu chưa sao lưu và kiểm tra toàn vẹn.

## 7. Thông tin sử dụng AI

Mã nguồn, bố cục và tài liệu bàn giao được soạn với hỗ trợ AI theo yêu cầu của người dùng. Không coi dữ liệu minh họa là khảo sát hoặc kết quả kinh doanh thực tế. Chủ dự án cần duyệt thương hiệu, giá, quy tắc nghiệp vụ và nghiệm thu trước khi công bố là sản phẩm chính thức.
