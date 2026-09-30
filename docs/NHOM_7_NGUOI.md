# Gợi ý chia việc cho nhóm 7 người

Bạn là trưởng nhóm nắm dự án. Sáu người mới bắt đầu có thể nhận các phần có đầu ra rõ ràng dưới đây; tên thành viên sẽ điền sau. Đây là phân công cho bộ website MVP này, không phải xác nhận các thành viên đã thực hiện công việc.

| Thành viên        | Việc chính                                                                                                 | Việc cần học trước                                                             | Sản phẩm bàn giao                                                                            |
| ----------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| Bạn — trưởng nhóm | Duyệt nghiệp vụ RESTOCHAIN, thương hiệu, phạm vi, giá; rà các thay đổi API/phân quyền/kho; nghiệm thu cuối | Đọc README, PHAM_VI, hiểu demo và dữ liệu thật                                 | Danh sách yêu cầu đã duyệt, quyết định phạm vi và biên bản nghiệm thu                        |
| Người 2           | Nội dung và trang giới thiệu                                                                               | Cấu trúc component, chữ/ảnh trong `public.tsx`; không tự bịa số khách/đối tác  | Nội dung đã đối chiếu, mô tả sản phẩm đúng phạm vi, nguồn ảnh                                |
| Người 3           | Trải nghiệm POS và thực đơn                                                                                | Giá, giỏ hàng, công thức, khác nhau giữa tạo đơn và thu tiền                   | Danh mục món/công thức được trưởng nhóm duyệt; kiểm thử bước 4–9                             |
| Người 4           | Dữ liệu kho và cảnh báo                                                                                    | Đơn vị kg/lít/chiếc, nhập/xuất, tồn tối thiểu; mẫu không phải định lượng chuẩn | Bảng nguyên liệu, đơn vị, định lượng thực tế, lỗi kho phát hiện                              |
| Người 5           | Cổng khách và đặt bàn                                                                                      | Giữ tạm, xác nhận, sức chứa, giờ trùng, quyền riêng tư                         | Kiểm thử bước 10–13, rà lời hướng dẫn và bố cục biểu mẫu                                     |
| Người 6           | Khách hàng, ca làm và tài liệu                                                                             | Đúng mục đích dùng thông tin khách; phân biệt tài khoản và tên trên lịch ca    | Kịch bản thêm khách/xếp ca, hướng dẫn thao tác ngắn, lỗi phát hiện                           |
| Người 7           | Vercel và tổng hợp QA                                                                                      | Chạy npm, repository, build; phân biệt preview/production và biến môi trường   | Triển khai demo dưới giám sát, bảng checklist desktop/mobile, danh sách lỗi có bước tái hiện |

## Làm việc trong một tuần

1. **Buổi đầu:** cả nhóm chạy bản demo, mỗi người tự tạo một đơn và một lượt đặt. Trưởng nhóm giải thích quy tắc tiền/kho/đặt bàn.
2. **Ngày 2–3:** từng người hoàn thành nội dung hoặc kịch bản kiểm thử thuộc phần của mình. Người mới chưa tự sửa xác thực, SQL hoặc thuật toán trừ kho khi chưa hiểu.
3. **Ngày 4:** trưởng nhóm đối chiếu các phần giao nhau: món → công thức → tồn kho; đặt bàn → chuyển món → đơn; người dùng → quyền.
4. **Ngày 5:** triển khai bản demo/preview, kiểm tra trên ít nhất một máy tính và một điện thoại.
5. **Ngày 6–7:** sửa các lỗi có bằng chứng, chạy lại kiểm thử liên quan, tổng hợp hướng dẫn và thuyết trình.

Mỗi thay đổi nên có một mục tiêu nhỏ, người duyệt và cách kiểm tra. Không chỉnh đồng thời cùng một tệp lớn trên hai máy rồi chép đè; dùng nhánh Git/commit và để trưởng nhóm duyệt trước khi gộp. Khóa D1 và tài khoản chủ do người được giao trách nhiệm giữ, không chia sẻ công khai trong nhóm chat.
