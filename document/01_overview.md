# E-Commerce Project - Tài liệu Tổng quan (Overview)

Tài liệu này tổng hợp các tính năng và sự thay đổi quan trọng trong suốt quá trình phát triển dự án E-Commerce. Hệ thống đã được nâng cấp toàn diện từ Frontend (React, Vite) đến Backend (Node.js, Express, MongoDB) để mang lại trải nghiệm giống với các sàn thương mại điện tử chuyên nghiệp.

## 🌟 Tóm tắt các thay đổi lớn
1. **Quản trị Sản phẩm (Product Management)**: Thêm chức năng thêm/sửa/xóa sản phẩm, upload ảnh bằng Multer, và quản lý Số lượng tồn kho (Inventory).
2. **Giỏ hàng & Thanh toán (Cart & Checkout)**: Nâng cấp giỏ hàng cho phép tăng/giảm/xóa sản phẩm. Hỗ trợ Chọn sản phẩm để thanh toán (Selective Checkout) và Form thông tin giao hàng (Shipping Info).
3. **Admin Dashboard**: Cải tổ toàn bộ giao diện quản trị sang phong cách **Dark Theme** hiện đại, bao gồm hiệu ứng Glassmorphism.
4. **Bảo mật & Phân quyền**: Route bảo vệ bằng JWT, đảm bảo chỉ Admin mới có quyền truy cập trang quản trị và chỉnh sửa dữ liệu nhạy cảm.

## 📂 Cấu trúc Tài liệu Chi tiết
Để dễ theo dõi, toàn bộ tài liệu kỹ thuật và thay đổi được chia thành các file nhỏ:
- [02_product_management.md](./02_product_management.md) - Chi tiết luồng xử lý sản phẩm và tồn kho.
- [03_cart_checkout.md](./03_cart_checkout.md) - Chi tiết luồng xử lý giỏ hàng và thanh toán (Selective Checkout).
- [04_admin_dashboard.md](./04_admin_dashboard.md) - Chi tiết về giao diện Admin và quản lý đơn hàng/người dùng.

## 🛠 Tech Stack
- **Frontend**: React, React Router, Vite, Vanilla CSS.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose).
- **File Upload**: Multer (xử lý `multipart/form-data`).
- **Xác thực**: JSON Web Tokens (JWT).
