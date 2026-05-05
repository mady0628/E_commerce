# Trang quản trị (Admin Dashboard)

Tài liệu này mô tả chi tiết giao diện Admin và các cập nhật mới nhất cho trải nghiệm người quản trị.

## 1. Giao diện (UI/UX)
**File**: `front_end/src/admin/admin_page.css` & `front_end/src/admin/admin_page.jsx`

Hệ thống quản trị đã được thiết kế lại hoàn toàn theo phong cách **Dark Theme** & **Glassmorphism**:
* Background màu tối (Dark background) làm nổi bật nội dung.
* Các Panel (Card) được thiết kế dạng kính mờ (Glass effect) với `background: rgba(255,255,255,0.03)` và `backdrop-filter`.
* Thanh menu bên trái (Sidebar) sử dụng hiệu ứng hover gradient (`linear-gradient`) cực kỳ hiện đại.
* Tối ưu hóa không gian hiển thị bằng hệ thống Grid và Flexbox.

## 2. Quản lý Đơn hàng (Order Management)
* **Hiển thị Shipping Info**: Bảng đơn hàng được nâng cấp với cột **Shipping Info**. Cột này đọc dữ liệu `recipientName`, `phone` và `address` trực tiếp từ Order Database và hiển thị cho Admin.
* **Xử lý dài nội dung**: Nếu địa chỉ giao hàng quá dài, CSS sẽ sử dụng tính năng tự động xuống dòng (`word-break: break-word`) để đảm bảo không bị mất chữ và không phá vỡ cấu trúc bảng.
* **Cập nhật trạng thái**: Nút thả xuống (Dropdown) cho phép Admin nhanh chóng chuyển đổi trạng thái đơn hàng (Pending -> Success -> Cancel). Các trạng thái được tô màu sắc khác nhau (Vàng / Xanh / Đỏ) để dễ nhận biết.

## 3. Bảo vệ Route (Admin Route)
**File**: `front_end/src/route/AdminRoute.jsx`
* Component bảo mật: Cứ mỗi lần Admin truy cập, component này sẽ gửi yêu cầu xác thực (`/api/auth/me`) về backend.
* Nếu `user.role === 'admin'`, cho phép render nội dung trang Quản trị.
* Nếu `user.role !== 'admin'` hoặc Token hết hạn, lập tức `Navigate` điều hướng đẩy người dùng văng ra trang Home hoặc Login. Tính năng này chặn hoàn toàn rủi ro người dùng thường cố tình gõ URL `/admin`.
