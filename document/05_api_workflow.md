# Luồng Hoạt động API Chi tiết (API Workflow)

Tài liệu này tổng hợp toàn bộ các hàm xử lý ở Backend (Controllers), mô tả chi tiết luồng đi của dữ liệu: Dữ liệu nhận vào (Input/Request) là gì, hàm xử lý như thế nào và Dữ liệu trả về (Output/Response) là gì.

---

## 1. Xác thực & Quản lý Người dùng (User & Auth)
**Module**: `back_end/src/controller/user.controller.js`

### 1.1 Đăng ký (`sign_up`)
* **Nhận vào (req.body):** `name`, `email`, `password`.
* **Xử lý:** Băm mật khẩu (Hash password) bằng `bcrypt`, tạo bản ghi User mới trong Database với quyền mặc định là `user`.
* **Trả về (res.json):** `message: "create succes"` và object `user` vừa tạo.

### 1.2 Đăng nhập (`sign_in`)
* **Nhận vào (req.body):** `email`, `password`.
* **Xử lý:** Kiểm tra email có tồn tại không -> Kiểm tra mật khẩu (so khớp mã băm) -> Tạo thẻ `JWT Token` chứa ID người dùng với thời hạn 1 ngày. (Đã xóa password khỏi object trả về để bảo mật).
* **Trả về (res.json):** `message: "login success"`, chuỗi `token`, và object `user` (đã giấu password).

### 1.3 Xác thực tự động (`me`)
* **Nhận vào (req.user):** ID lấy được sau khi đi qua `authMiddleware`.
* **Xử lý:** Đây là API dùng để Frotend kiểm tra xem người dùng còn đăng nhập hợp lệ không mỗi lần load trang.
* **Trả về (res.json):** Object `user`.

### 1.4 Quản trị viên lấy danh sách User (`getAllUsers`)
* **Nhận vào:** Không yêu cầu body. (Bắt buộc phải là Admin).
* **Xử lý:** Truy xuất toàn bộ danh sách User từ Database (loại bỏ trường password).
* **Trả về (res.json):** Mảng mảng `users`.

### 1.5 Đổi quyền hạn (`updateRole`)
* **Nhận vào (req.params & req.body):** `id` (trên URL) và `role` mới ('admin' hoặc 'user').
* **Xử lý:** Kiểm tra tính hợp lệ của `role` -> Cập nhật vào DB.
* **Trả về (res.json):** Object `user` sau khi đã cập nhật.

---

## 2. Quản lý Sản phẩm (Product)
**Module**: `back_end/src/controller/product.controller.js`

### 2.1 Lấy danh sách sản phẩm (`getAllProduct`)
* **Nhận vào:** Không có.
* **Xử lý:** Lấy toàn bộ sản phẩm trong kho.
* **Trả về (res.json):** Mảng `product`.

### 2.2 Thêm sản phẩm mới (`creatProduct`)
* **Nhận vào (req.body & req.file):** Dạng `FormData` gồm `name`, `cost`, `describe`, `stock` và file ảnh `image` (chuyển qua `multer`).
* **Xử lý:** Lưu file ảnh cục bộ, lấy đường dẫn URL ảnh, tạo bản ghi Product mới.
* **Trả về (res.json):** Object `product` vừa tạo.

### 2.3 Cập nhật sản phẩm (`updateProduct`)
* **Nhận vào (req.params, req.body & req.file):** `id` sản phẩm và các thông tin muốn cập nhật. (Nếu có file ảnh mới thì lấy link ảnh mới).
* **Xử lý:** Tìm theo ID và cập nhật các trường được thay đổi.
* **Trả về (res.json):** Object `product` đã được cập nhật.

### 2.4 Xóa sản phẩm (`deleteProduct`)
* **Nhận vào (req.params):** `id` của sản phẩm.
* **Xử lý:** Tìm kiếm và xóa vĩnh viễn khỏi Database.
* **Trả về (res.json):** `message: "delete success"`.

---

## 3. Quản lý Giỏ hàng (Cart)
**Module**: `back_end/src/controller/cart.controller.js`

### 3.1 Xem giỏ hàng (`getCart`)
* **Nhận vào (req.user):** ID lấy từ Token.
* **Xử lý:** Dò tìm giỏ hàng của user này. Nhúng (`populate`) chi tiết sản phẩm.
* **Trả về (res.json):** Object `cart` chứa mảng các sản phẩm `products` và số lượng `quantity`. Nếu chưa có giỏ hàng, trả về mảng rỗng `[]`.

### 3.2 Thêm vào giỏ (`addToCart`)
* **Nhận vào (req.body):** `productID`.
* **Xử lý:** 
  * Tìm sản phẩm trong DB. 
  * Tìm giỏ hàng (nếu chưa có thì tạo mới). 
  * Kiểm tra tồn kho (`stock`), nếu mua vượt mức -> Báo lỗi `400`. 
  * Nếu sản phẩm đã có trong giỏ -> Tăng `quantity` +1. Nếu chưa có -> Thêm mới với `quantity` = 1.
* **Trả về (res.json):** Object `cart` mới nhất.

### 3.3 Tùy chỉnh số lượng (`updateCartItem`)
* **Nhận vào (req.body):** `productID` và `quantity` (con số khách hàng ấn +/- hoặc gõ vào).
* **Xử lý:** 
  * Nếu `quantity <= 0`: Gỡ sản phẩm khỏi giỏ hàng.
  * Nếu `quantity > 0`: Kiểm tra tồn kho, nếu đủ thì gắn `quantity` mới vào.
* **Trả về (res.json):** Object `cart` mới nhất.

---

## 4. Quản lý Đơn hàng (Order)
**Module**: `back_end/src/controller/order.controller.js`

### 4.1 Tạo đơn hàng (`createOrder`)
* **Nhận vào (req.body):** 
  * `selectedItemIds`: Mảng chứa các ID sản phẩm khách đã tick chọn để mua.
  * `shippingInfo`: Object chứa `recipientName`, `phone`, `address`.
* **Xử lý (Flow phức tạp nhất):**
  1. Lọc lấy những sản phẩm khách đã tick từ trong giỏ hàng.
  2. Kiểm tra lại Kho (`stock`) lần cuối để đảm bảo hàng vẫn còn đủ.
  3. Tính tổng tiền `total`.
  4. Tạo bản ghi Đơn hàng mới.
  5. Lùi số lượng Tồn kho của các sản phẩm đó (`$inc: { stock: -quantity }`).
  6. Xóa các món đã mua khỏi Giỏ hàng (nhưng giữ lại các món khách chưa tick).
* **Trả về (res.json):** Object `order` chứa thông tin hóa đơn hoàn chỉnh.

### 4.2 Lịch sử mua hàng của Khách (`getOrder`)
* **Nhận vào (req.user):** ID của user đang đăng nhập.
* **Xử lý:** Tìm toàn bộ hóa đơn của riêng người này, `populate` chi tiết sản phẩm để hiển thị ảnh/giá.
* **Trả về (res.json):** Mảng các `order`.

### 4.3 Xem toàn bộ đơn hàng của Admin (`getAllOrder`)
* **Nhận vào:** Yêu cầu quyền Admin (kiểm tra qua Middleware).
* **Xử lý:** Lấy tất cả Đơn hàng trong hệ thống. `populate` thông tin người mua (User) và thông tin hàng hóa (Products).
* **Trả về (res.json):** Mảng tất cả `orders`.

### 4.4 Cập nhật Trạng thái Đơn hàng (`updateOrderStatus`)
* **Nhận vào (req.params & req.body):** `id` của đơn hàng và `status` mới (chỉ nhận: `'pending'`, `'shipping'`, `'success'`, `'cancel'`).
* **Xử lý:** Đổi trạng thái (`status`) của đơn hàng trong Database.
* **Trả về (res.json):** Object `order` đã được đổi màu/trạng thái.
