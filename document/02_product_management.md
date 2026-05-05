# Quản trị Sản phẩm & Tồn kho (Product Management)

Đây là tài liệu mô tả chi tiết các thay đổi và hàm chức năng liên quan đến Hệ thống Quản trị Sản phẩm và Kho hàng.

## 1. Cơ sở dữ liệu (Database Schema)
**File**: `back_end/src/module/product.module.js`
* Bổ sung thuộc tính `stock`: Kiểu `Number`, mặc định là `0`. Trường này quyết định số lượng hàng còn lại trong kho.

## 2. Xử lý API (Controllers)
**File**: `back_end/src/controller/product.controller.js`

* **`creatProduct`**: Nhận dữ liệu `FormData` từ client. 
  * Xử lý file ảnh qua thư viện `multer` và tạo URL cho ảnh lưu trữ cục bộ.
  * Lấy `stock` từ `req.body`, ép kiểu sang số nguyên và lưu vào Database cùng với các thông tin khác (`name`, `cost`, `describe`).
* **`updateProduct`**: 
  * Kiểm tra và cập nhật linh hoạt các trường dữ liệu.
  * Cho phép update ảnh mới hoặc giữ nguyên ảnh cũ.
  * Cho phép chỉnh sửa trực tiếp `stock`.
* **`deleteProduct`**: Hàm tìm và xóa sản phẩm thông qua ID bằng `findByIdAndDelete`.

## 3. Quản lý kho hàng tự động (Inventory Logic)
**File**: `back_end/src/controller/order.controller.js` (Hàm `createOrder`)
* Trước khi tạo đơn, hệ thống quét qua các sản phẩm khách muốn mua để so sánh với `stock`.
* Nếu số lượng mua > `stock`, ném lỗi `400 Bad Request`.
* Ngay khi đơn hàng được lưu, hệ thống dùng MongoDB Operator `$inc: { stock: -item.quantity }` để lùi số lượng kho tương ứng một cách an toàn và đồng bộ.

## 4. Giao diện người dùng (Frontend)
* **`front_end/src/admin/admin_page.jsx`**: 
  * Form Thêm/Sửa được nhúng `stock` bên cạnh `cost`.
  * Thẻ sản phẩm hiển thị "Stock: X" hoặc "Out of Stock" với màu sắc xanh/đỏ trực quan.
* **`front_end/src/pages/home.jsx`**:
  * Các sản phẩm có `stock = 0` sẽ bị khóa tính năng thêm vào giỏ hàng. Nút "Add to Cart" bị vô hiệu hóa (disabled).
