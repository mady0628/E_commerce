# Giỏ hàng & Thanh toán (Cart & Checkout)

Tài liệu này mô tả chi tiết logic xử lý Giỏ hàng thông minh và quy trình "Selective Checkout" (Chỉ thanh toán món đồ đã chọn).

## 1. Cơ sở dữ liệu (Database Schema)
**File**: `back_end/src/module/order.module.js`
Để phục vụ việc giao hàng, Schema của Đơn hàng (Order) đã được nâng cấp với 3 thuộc tính bắt buộc (`required: true`):
* `recipientName`: Tên người nhận.
* `phone`: Số điện thoại liên hệ.
* `address`: Địa chỉ giao hàng.

## 2. Xử lý API Giỏ hàng (Cart Controllers)
**File**: `back_end/src/controller/cart.controller.js`

* **`addToCart`**: Ngăn chặn người dùng thêm vào giỏ hàng nếu `quantity + 1 > product.stock`.
* **`updateCartItem` [MỚI]**: Route `PATCH /api/cart/item` dùng để tinh chỉnh số lượng trực tiếp trong giỏ:
  * Nhận vào `productID` và `quantity` mới.
  * Kiểm tra kho: Nếu `quantity` vượt quá `stock` -> Báo lỗi.
  * Nếu `quantity <= 0` -> Xóa hẳn sản phẩm khỏi mảng `cart.products`.
  * Nếu hợp lệ -> Cập nhật trực tiếp số lượng mới và lưu Database.

## 3. Xử lý API Thanh toán (Order Controller)
**File**: `back_end/src/controller/order.controller.js` (Hàm `createOrder`)

* **Selective Checkout**:
  * Nhận mảng `selectedItemIds` (danh sách ID các sản phẩm khách muốn mua) từ Frontend.
  * Lọc giỏ hàng: Chỉ giữ lại các món có ID nằm trong `selectedItemIds`.
  * Tính tổng tiền (`total`) dựa trên danh sách đã lọc.
* **Tạo đơn hàng**: Khởi tạo bản ghi Order mới với các thông tin giao hàng (`shippingInfo`) được gửi kèm.
* **Dọn dẹp Giỏ hàng thông minh**: Thay vì xóa sạch giỏ hàng như trước (`cart.products = []`), hệ thống giờ đây chỉ xóa những món đã thanh toán bằng cách lọc (`filter`) bỏ các `selectedItemIds`. Những món khách chưa mua vẫn còn nguyên vẹn trong giỏ.

## 4. Giao diện người dùng (Frontend)
**File**: `front_end/src/pages/cart.jsx`
* **Tăng/Giảm/Xóa**: Bổ sung các nút `+`, `-` và `🗑️` cho mỗi sản phẩm. Gọi trực tiếp hàm `updateQuantity`.
* **Checkbox**: Thêm Checkbox để lưu trạng thái mảng `selectedItems`. State `total` tự động update theo mảng này.
* **Form Giao hàng**: Khi bấm "Proceed to Checkout", UI sẽ hiển thị Inline Form yêu cầu nhập Thông tin giao hàng trước khi gọi API tạo đơn.
