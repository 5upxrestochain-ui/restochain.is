# Đưa RESTOCHAIN lên Vercel

## A. Đưa bản trải nghiệm lên trước

Bạn cần tài khoản GitHub và Vercel. Bước này không cần Cloudflare, API key hay cơ sở dữ liệu.

1. Giải nén, mở thư mục `restochain-web`.
2. Trên GitHub, tạo một repository, ví dụ `restochain-web`. Có thể để Private.
3. Tải **nội dung thư mục dự án** lên repository. `package.json`, `index.html`, `vercel.json`, `src`, `public`, `api`, `server` cần nằm ở đúng cấp gốc dự án. Không chỉ tải file ZIP lên. Không tải `node_modules`, `.env.local` hoặc thông tin bí mật.
4. Trên Vercel, chọn **Add New → Project**, kết nối GitHub và Import repository này.
5. Kiểm tra cấu hình:

| Trường                | Giá trị                                                             |
| --------------------- | ------------------------------------------------------------------- |
| Framework Preset      | Vite                                                                |
| Root Directory        | Thư mục chứa `package.json`; thường để mặc định nếu đã tải đúng cấp |
| Install Command       | `npm ci`                                                            |
| Build Command         | `npm run build`                                                     |
| Output Directory      | `dist`                                                              |
| Node.js Version       | 24.x                                                                |
| Environment Variables | Để trống khi chỉ triển khai bản trải nghiệm                         |

6. Bấm **Deploy**. Khi hoàn thành, mở URL do Vercel cấp.
7. Thử Bán hàng → tạo đơn → danh sách đơn → thu tiền mặt; thử cổng khách hàng. Dòng “Dữ liệu mẫu” vẫn xuất hiện cho đến khi bạn cấu hình máy chủ và đăng nhập.

Nếu quen Terminal, có thể dùng Vercel CLI ngay trong thư mục dự án:

```bash
npx vercel
```

Làm theo hướng dẫn đăng nhập/tạo project. Sau khi kiểm tra bản preview, dùng `npx vercel --prod` để triển khai production. Bản bàn giao chưa chạy lệnh publish bằng tài khoản của bạn.

## B. Bật tài khoản và dữ liệu dùng chung

### B1. Tạo Cloudflare D1

1. Trong Cloudflare Dashboard, tìm **D1 SQL Database**, tạo database riêng cho RESTOCHAIN.
2. Mở phần Console/SQL của database. Chạy nội dung `server/schema.sql` để tạo bảng.
3. Ghi lại **Account ID** và **Database ID** đúng database vừa tạo.
4. Tạo API token với quyền đọc/ghi D1 cho tài khoản cần dùng, theo hướng dẫn Cloudflare. Không dùng Global API key và không đặt token trong mã giao diện.

Adapter hiện gọi D1 REST API để đơn giản hóa việc học và thử nghiệm. Cloudflare cho biết REST API này phù hợp nhất với tác vụ quản trị vì dùng chung giới hạn Cloudflare API. Trước khi mở cho nhiều nhà hàng/khách truy cập đồng thời, cần chuyển kết nối sang Worker dùng D1 binding và chuẩn hóa các bảng nghiệp vụ; xem phần kiến trúc trong PHAM_VI.md.

### B2. Thêm biến môi trường trên Vercel

Mở **Project → Settings → Environment Variables**. Cấu hình môi trường **Production**:

| Biến                     | Điền gì?                                                                                                       |
| ------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `CLOUDFLARE_ACCOUNT_ID`  | Account ID Cloudflare                                                                                          |
| `CLOUDFLARE_DATABASE_ID` | Database ID D1                                                                                                 |
| `CLOUDFLARE_API_TOKEN`   | API token đọc/ghi D1                                                                                           |
| `APP_ORIGIN`             | Chính xác origin website, ví dụ `https://restochain-abc.vercel.app`; không có dấu `/` cuối, đường dẫn hoặc `#` |
| `ALLOW_REGISTRATION`     | Tạm đặt `true` để tạo chủ doanh nghiệp đầu tiên                                                                |
| `SIGNUP_CODE`            | Mã ngẫu nhiên ít nhất 16 ký tự do bạn tự tạo và giữ riêng                                                      |

Mã đăng ký và mật khẩu tài khoản là hai giá trị khác nhau. Có thể tự tạo mã ngẫu nhiên trên máy mình:

```bash
node -e "console.log(require('node:crypto').randomBytes(24).toString('base64url'))"
```

Lệnh chỉ in mã trên máy bạn. Không gửi mã hoặc token vào chat, không commit vào GitHub. Mọi biến trên đều là biến máy chủ, **không thêm tiền tố `VITE_`**.

Sau khi thêm hoặc sửa biến, **Redeploy** để bản mới nhận cấu hình. Preview deployment có hostname khác production: không trỏ preview vào dữ liệu thật; nếu cần thử API ở preview, dùng database thử riêng và `APP_ORIGIN` đúng URL ổn định của môi trường thử.

### B3. Tạo chủ doanh nghiệp

1. Mở website → Đăng nhập → Đăng ký.
2. Nhập họ tên, doanh nghiệp, email, mật khẩu 12–128 ký tự và `SIGNUP_CODE` vừa đặt.
3. Tài khoản mới nhận vai trò chủ doanh nghiệp. Số liệu doanh thu/khách/ca làm ban đầu rỗng; tồn kho bằng 0.
4. Quay lại Vercel, đổi `ALLOW_REGISTRATION=false` rồi Redeploy để đóng đăng ký ngoài ý muốn. Khi cần thêm một doanh nghiệp thử khác, chủ dự án có thể mở lại có kiểm soát.
5. Trong website, vào Cài đặt để sửa tên/địa chỉ chi nhánh; vào Thực đơn để sửa tên, giá và công thức; vào Kho để nhập tồn thực tế.
6. Tại Cài đặt → Thêm tài khoản, tạo tài khoản nhân viên/quản lý và chuyển mật khẩu bằng kênh riêng. Bản MVP chưa có quy trình gửi thư mời, xác minh email hay quên mật khẩu.
7. Sao chép liên kết đặt bàn riêng tại Cài đặt. Mở liên kết này trên điện thoại khác để thử; yêu cầu sẽ hiện trong lịch đúng ngày của doanh nghiệp.

### B4. Cấu hình tại máy cá nhân

Sao chép `.env.example` thành `.env.local`, nhập thông tin của **database thử** và đặt `APP_ORIGIN=http://localhost:4173`. Chạy lại `npm run dev`. Chỉ truy cập đúng `localhost:4173`, không đổi sang IP khác khi cấu hình origin vẫn giữ nguyên. Cookie HTTP chỉ được dùng trong cấu hình localhost; Vercel dùng cookie Secure.

## C. Gắn tên miền riêng

Nếu bạn sở hữu `5upxrestochain.com`, thêm tên miền ở **Vercel → Project → Settings → Domains** rồi làm đúng các bản ghi DNS Vercel hiển thị cho project đó. Không đoán IP hay bản ghi DNS. Chọn một tên miền chính, cập nhật `APP_ORIGIN` sang origin chính xác của tên miền này và Redeploy. Kiểm tra lại đăng nhập, đặt bàn, tài nguyên ảnh/font và HTTPS.

Việc mua tên miền, thay DNS, lựa chọn gói dịch vụ và thanh toán tài khoản không nằm trong thao tác đã thực hiện của bản bàn giao.

## D. Xử lý lỗi thường gặp

| Hiện tượng                               | Cách kiểm tra                                                                                      |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Build không tìm thấy package.json        | Chọn lại Root Directory đúng cấp                                                                   |
| Trang trắng khi mở file HTML             | Chạy `npm run dev` hoặc mở URL Vercel; không nhấp đúp HTML                                         |
| Đăng nhập báo máy chủ chưa cấu hình      | Kiểm tra đủ 4 biến D1/origin và Redeploy                                                           |
| Báo chưa kết nối cơ sở dữ liệu           | Kiểm tra token D1, ID database/account, các bảng đã tạo; xem log Vercel và trạng thái nhà cung cấp |
| Nguồn gửi yêu cầu không hợp lệ           | `APP_ORIGIN` phải trùng origin trên thanh địa chỉ, bao gồm https, www và cổng nếu có               |
| Không tạo được tài khoản                 | Bật đăng ký, mã đủ 16 ký tự, nhập đúng mã, email chưa được sử dụng                                 |
| Tạo đơn nhưng không thu tiền được        | Nhập đủ nguyên liệu theo công thức; bản dữ liệu thật bắt đầu từ kho 0                              |
| Không thấy lượt đặt                      | Chọn đúng ngày, chi nhánh và dùng liên kết có mã doanh nghiệp; chờ lượt tải cập nhật hoặc tải lại  |
| Dữ liệu vừa thay đổi                     | Ứng dụng đã tải lại bản mới; kiểm tra kết quả trước khi gửi lại để tránh thao tác trùng            |
| Đã gửi yêu cầu nhưng mất mạng giữa chừng | Kiểm tra danh sách trước khi gửi lại; không mặc định coi thao tác thất bại                         |

## Nguồn hướng dẫn chính thức

Đối chiếu ngày 30/09/2026; giao diện dịch vụ có thể đổi vị trí một số nút:

- Vite trên Vercel: https://vercel.com/docs/frameworks/frontend/vite
- Node.js runtime: https://vercel.com/docs/functions/runtimes/node-js
- Phiên bản Node.js: https://vercel.com/docs/functions/runtimes/node-js/node-js-versions
- Biến môi trường: https://vercel.com/docs/environment-variables
- Cloudflare D1 REST query: https://developers.cloudflare.com/api/resources/d1/subresources/database/methods/query/
- Khuyến nghị D1 proxy Worker: https://developers.cloudflare.com/d1/tutorials/build-an-api-to-access-d1/
