# RESTOCHAIN · F&B Workspace

Bộ mã nguồn website MVP cho dự án RESTOCHAIN của nhóm 5UP. Giao diện tiếng Việt, hai cổng doanh nghiệp và thực khách, cấu hình triển khai trên Vercel. Bản bàn giao: 30/09/2026.

**Bạn có thể đưa bản trải nghiệm lên Vercel ngay mà chưa cần cơ sở dữ liệu.** Muốn đăng nhập và dùng chung dữ liệu giữa các thiết bị, làm thêm phần Cloudflare D1 trong hướng dẫn. Đây là bản MVP để học, trình diễn và thử nghiệm nhóm nhỏ; chưa phải hệ thống thương mại đã nghiệm thu tại nhà hàng.

## 1. Bắt đầu ở đâu?

1. Giải nén toàn bộ file ZIP. Mở thư mục `restochain-web`, nơi có `package.json`.
2. Đọc [Hướng dẫn Vercel](docs/VERCEL.md) nếu muốn có đường dẫn web để mở trên điện thoại/máy tính.
3. Đọc [Phạm vi và nghiệp vụ](docs/PHAM_VI.md) trước khi nhập dữ liệu thật.
4. Đọc [Kịch bản nghiệm thu](docs/KIEM_THU.md) để tự kiểm tra sau khi triển khai.
5. Nhóm 7 người có thể bắt đầu từ [Bảng phân công](docs/NHOM_7_NGUOI.md).

## 2. Những gì đã có

| Khu vực          | Chức năng                                                                                            |
| ---------------- | ---------------------------------------------------------------------------------------------------- |
| Tổng quan        | Doanh thu đã thu, số đơn hoàn tất, giá trị đơn trung bình, biểu đồ 7 ngày, tổng hợp chi nhánh        |
| Bán hàng         | Chọn món, giỏ hàng, tạo đơn, xác nhận tiền mặt, hủy đơn chưa thu, xuất CSV                           |
| Thực đơn         | Sửa tên, giá và định lượng nguyên liệu; đơn mới lưu lại giá/công thức tại lúc tạo                    |
| Kho              | Tồn kho theo chi nhánh, nhập/xuất kèm lý do, cảnh báo ngưỡng, xuất CSV                               |
| Bàn & đặt chỗ    | Chọn bàn, chống trùng giờ, xác nhận, ghi nhận khách đến, chuyển món đặt trước thành đơn              |
| Khách hàng       | Tạo hồ sơ, tìm kiếm, ghi nhận đồng ý tiếp thị; các chỉ số lịch sử trong demo là dữ liệu mẫu          |
| Nhân sự          | Xếp ca, chặn trùng ca theo tên nhân viên, ghi nhận bắt đầu/kết thúc ca thủ công                      |
| Báo cáo          | Tổng hợp doanh thu đã thu, cảnh báo tồn kho theo quy tắc, nhật ký nghiệp vụ                          |
| Cài đặt          | Đổi tên doanh nghiệp, tên/địa chỉ chi nhánh, tạo tài khoản quản lý/nhân viên sau khi kết nối máy chủ |
| Cổng thực khách  | Lọc bàn theo số người/nhu cầu, gửi thông tin đặt bàn và món muốn dùng trước                          |
| Trang giới thiệu | Giới thiệu RESTOCHAIN, giá trị sản phẩm, hành trình sử dụng; các mức phí chỉ là đề xuất minh họa     |

Mộc Collective và các chi nhánh Mộc/Bếp Mộc là dữ liệu giả định để trình diễn, không phải khách hàng hoặc đối tác đã xác nhận của RESTOCHAIN. Các mức phí 249.000/499.000/799.000 đồng trên trang giới thiệu là phương án minh họa của bản web, chưa phải bảng giá chính thức được người sáng lập phê duyệt.

## 3. Chạy trên máy của bạn

Cài Node.js **24.x** từ [nodejs.org](https://nodejs.org/), sau đó mở Terminal trong thư mục dự án:

```bash
npm ci
npm run dev
```

Mở `http://localhost:4173`. Giữ Terminal đang chạy trong lúc sử dụng. Nhấn `Ctrl+C` để dừng. Trên Windows, nếu PowerShell chặn `npm.ps1`, dùng Command Prompt hoặc gõ `npm.cmd` thay cho `npm`; không cần thay chính sách bảo mật máy.

Không mở `index.html` bằng cách nhấp đúp: đây là ứng dụng cần chạy qua máy chủ web.

Các lệnh khác:

```bash
npm test
npm run build
npm run preview
```

`preview` chỉ phục vụ giao diện đã build; muốn thử API tại máy cá nhân, dùng `dev` với cấu hình máy chủ. Thư mục `dist` là đầu ra build; `src` mới là mã nguồn để chỉnh sửa.

## 4. Hai chế độ dữ liệu

**Trải nghiệm:** không cần tài khoản. Dữ liệu được lưu bằng localStorage của trình duyệt. Tải lại trang vẫn giữ thao tác đã lưu, nhưng không đồng bộ sang điện thoại khác. Xóa dữ liệu website sẽ làm mất dữ liệu demo. Tại Cài đặt có nút khôi phục mẫu. Không dùng chế độ này để lưu thông tin khách hàng thật.

**Doanh nghiệp:** API Node chạy trên Vercel; dữ liệu lưu trong Cloudflare D1. Đăng ký tạo không gian mới với một chi nhánh, thực đơn/công thức mẫu và tồn kho bằng 0; không sao chép doanh thu giả. Chủ doanh nghiệp chỉnh thông tin chi nhánh, kiểm tra công thức, nhập kho, rồi tạo tài khoản cho đội ngũ. Giao diện kiểm tra cập nhật khoảng 45 giây khi tab đang mở; thao tác ghi được kiểm tra phiên bản ngay trên máy chủ.

## 5. Các đường dẫn

Thêm phần sau vào cuối tên miền Vercel của bạn:

| Đường dẫn                       | Nội dung                                        |
| ------------------------------- | ----------------------------------------------- |
| `/#/intro`                      | Trang giới thiệu                                |
| `/#/dashboard`                  | Tổng quan quản trị                              |
| `/#/orders`                     | Bán hàng và thực đơn                            |
| `/#/inventory`                  | Kho                                             |
| `/#/reservations`               | Bàn và đặt chỗ                                  |
| `/#/customers`                  | Khách hàng                                      |
| `/#/team`                       | Ca làm                                          |
| `/#/insights`                   | Cảnh báo và nhật ký                             |
| `/#/settings`                   | Cài đặt                                         |
| `/#/login`                      | Đăng nhập/đăng ký                               |
| `/#/discover`                   | Trải nghiệm đặt bàn bằng dữ liệu mẫu            |
| `/#/discover/<mã-doanh-nghiệp>` | Trang đặt bàn công khai của doanh nghiệp đã tạo |

Dấu `#` là có chủ ý. Sao chép liên kết dành cho khách tại Cài đặt sau khi đăng nhập; không thay nó bằng liên kết demo.

## 6. Tổ chức mã nguồn

| Tệp/thư mục                      | Vai trò                                                   |
| -------------------------------- | --------------------------------------------------------- |
| `src/App.tsx`                    | Điều hướng, khung quản trị                                |
| `src/views.tsx`                  | Các màn hình nghiệp vụ                                    |
| `src/public.tsx`                 | Trang giới thiệu, đăng nhập, đặt bàn                      |
| `src/domain.ts`                  | Kiểu dữ liệu, dữ liệu mẫu và quy tắc nghiệp vụ dùng chung |
| `src/workspace.ts`               | Trạng thái giao diện, lưu demo và gọi API                 |
| `src/styles.css`                 | Giao diện, màu sắc, bố cục theo kích thước màn hình       |
| `api/restochain.ts`              | Điểm vào API trên Vercel                                  |
| `server/app.ts`                  | Đăng nhập, phân quyền, đặt bàn, chống cập nhật xung đột   |
| `server/db.ts`, `server/auth.ts` | Truy vấn D1 và xử lý mật khẩu/phiên                       |
| `server/schema.sql`              | Cấu trúc cơ sở dữ liệu                                    |
| `tests`                          | Kiểm thử nghiệp vụ và API với SQLite trong bộ nhớ         |
| `vercel.json`, `.env.example`    | Cấu hình triển khai và mẫu biến môi trường                |

React + TypeScript + Vite; biểu tượng Lucide; font Be Vietnam Pro lưu trong bundle, ảnh lưu trong `public`. Các khóa cơ sở dữ liệu chỉ chạy trên máy chủ, không có tiền tố `VITE_`.

## 7. Tình trạng kiểm tra

- 17 bài kiểm thử tự động đạt; TypeScript và build production đạt.
- Kiểm thử API dùng SQLite cục bộ, chưa gọi D1 thật bằng tài khoản của bạn.
- Chưa triển khai lên tài khoản Vercel của bạn; chưa gắn tên miền `5upxrestochain.com`.
- Chưa hoàn thành kiểm tra trực quan bằng trình duyệt tự động: môi trường kiểm thử chặn truy cập trang xem thử. Cần làm checklist desktop/mobile trong `docs/KIEM_THU.md` sau khi triển khai.

Không tuyên bố “không có lỗi” hoặc “đầy đủ 100% hệ thống thương mại” dựa trên việc build thành công. Xem các phần chưa triển khai và giới hạn lưu trữ trong [PHAM_VI.md](docs/PHAM_VI.md).
