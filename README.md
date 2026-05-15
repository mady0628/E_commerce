# E-Commerce Web Application

Ứng dụng thương mại điện tử full-stack được xây dựng bằng React, Node.js, Express và MongoDB. Project mô phỏng các chức năng chính của một website bán hàng trực tuyến như xem sản phẩm, tìm kiếm, giỏ hàng, đặt hàng, lịch sử đơn hàng, đánh giá sản phẩm và trang quản trị dành cho admin.

## Tính năng chính

### Người dùng

- Đăng ký và đăng nhập tài khoản bằng JWT authentication.
- Xem danh sách sản phẩm.
- Tìm kiếm sản phẩm theo từ khóa.
- Sắp xếp sản phẩm theo mới nhất, bán chạy, giá tăng dần và giá giảm dần.
- Xem chi tiết sản phẩm, hình ảnh, mô tả, đánh giá và bình luận.
- Thêm sản phẩm vào giỏ hàng.
- Cập nhật số lượng hoặc xóa sản phẩm khỏi giỏ hàng.
- Kiểm tra tồn kho trước khi thêm vào giỏ hoặc đặt hàng.
- Chọn một phần sản phẩm trong giỏ để thanh toán.
- Nhập thông tin giao hàng khi đặt hàng.
- Xem lịch sử đơn hàng cá nhân.

### Quản trị viên

- Trang admin được bảo vệ bằng phân quyền.
- Quản lý sản phẩm: thêm, sửa, xóa, upload ảnh và cập nhật tồn kho.
- Quản lý người dùng: xem danh sách, tìm kiếm, đổi quyền và xóa người dùng.
- Quản lý đơn hàng: xem toàn bộ đơn, tìm kiếm và cập nhật trạng thái đơn hàng.
- Quản lý bình luận: xem đánh giá sản phẩm và ẩn/hiện bình luận.
- Dashboard hiển thị dữ liệu tổng quan và biểu đồ thống kê.

## Công nghệ sử dụng

### Frontend

- React
- Vite
- React Router
- Recharts
- CSS
- Fetch API

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Token
- bcrypt
- Multer
- CORS
- Morgan
- Dotenv

## Cấu trúc thư mục

```txt
New_Ecommerce/
├── back_end/
│   ├── src/
│   │   ├── controller/
│   │   ├── middleware/
│   │   ├── module/
│   │   ├── router/
│   │   ├── postman/
│   │   └── app.js
│   ├── public/uploads/
│   └── package.json
├── front_end/
│   ├── src/
│   │   ├── admin/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── route/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── document/
```

## Các module chính

### Xác thực và phân quyền

Hệ thống hỗ trợ đăng ký, đăng nhập và xác thực người dùng bằng JWT. Các route quan trọng được bảo vệ bằng middleware. Trang admin chỉ cho phép tài khoản có quyền `admin` truy cập.

### Quản lý sản phẩm

Sản phẩm bao gồm tên, giá, mô tả, hình ảnh, đánh giá, số lượng tồn kho, lượt mua và ngày tạo. Admin có thể thêm, sửa, xóa sản phẩm và upload nhiều ảnh cho từng sản phẩm.

### Giỏ hàng và thanh toán

Mỗi người dùng có một giỏ hàng riêng. Người dùng có thể thêm sản phẩm, cập nhật số lượng, xóa sản phẩm và chọn một số sản phẩm để thanh toán. Backend kiểm tra tồn kho trước khi cho phép đặt hàng.

### Quản lý đơn hàng

Khi người dùng đặt hàng, hệ thống tạo đơn hàng, lưu thông tin giao hàng, tính tổng tiền và cập nhật số lượng tồn kho. Người dùng có thể xem lịch sử đơn hàng, còn admin có thể xem toàn bộ đơn hàng và cập nhật trạng thái.

### Bình luận và đánh giá

Người dùng có thể đánh giá sản phẩm bằng số sao, viết bình luận và upload ảnh. Rating trung bình của sản phẩm được cập nhật dựa trên các đánh giá hiển thị. Admin có thể ẩn hoặc hiện bình luận khi cần.

## Cài đặt và chạy project

### 1. Clone project

```bash
git clone <repository-url>
cd New_Ecommerce
```

### 2. Cài đặt backend

```bash
cd back_end
npm install
```

Tạo file `.env` trong thư mục `back_end/`:

```env
MONGO_URL=<your-mongodb-connection-string>
JWT_PASS=<your-jwt-secret>
```

Chạy backend:

```bash
npm run dev
```

Backend chạy tại:

```txt
http://localhost:3000
```

### 3. Cài đặt frontend

Mở terminal khác:

```bash
cd front_end
npm install
npm run dev
```

Frontend sẽ chạy trên Vite development server.

## Tổng quan API

### Auth

```txt
POST   /api/auth/sign_up
POST   /api/auth/sign_in
GET    /api/auth/me
GET    /api/auth/users
PATCH  /api/auth/users/:id/role
DELETE /api/auth/users/:id
```

### Product

```txt
GET    /api/product
POST   /api/product
PATCH  /api/product/:id
DELETE /api/product/:id
GET    /api/product/:id
```

### Cart

```txt
GET    /api/cart
POST   /api/cart
PATCH  /api/cart/item
```

### Order

```txt
POST   /api/order
GET    /api/order
GET    /api/orders
PATCH  /api/orders/:id/status
```

### Comment

```txt
POST   /api/product/:id/comment
GET    /api/admin/product/:id/comments
PATCH  /api/admin/comments/:id/visibility
```

## Điểm nổi bật

- Xây dựng đầy đủ luồng thương mại điện tử từ xem sản phẩm đến đặt hàng.
- Áp dụng JWT authentication và role-based authorization.
- Có trang quản trị riêng cho admin.
- Tích hợp upload ảnh bằng Multer.
- Có kiểm tra tồn kho khi thêm vào giỏ và đặt hàng.
- Hỗ trợ tìm kiếm, sắp xếp và phân trang sản phẩm.
- Sử dụng Mongoose để thiết kế schema và liên kết dữ liệu giữa user, product, cart, order và comment.
- Có hệ thống đánh giá sản phẩm và quản lý bình luận.

## Các màn hình chính

- Trang chủ
- Trang danh sách sản phẩm
- Trang kết quả tìm kiếm
- Trang chi tiết sản phẩm
- Trang giỏ hàng
- Luồng thanh toán
- Trang lịch sử đơn hàng
- Trang đăng nhập
- Trang đăng ký
- Trang quản trị admin

## Hướng phát triển tiếp theo

- Tích hợp thanh toán online.
- Thêm test tự động cho backend API.
- Bổ sung validation form và validation request.
- Đưa API base URL vào biến môi trường.
- Thêm middleware xử lý lỗi tập trung.
- Cải thiện độ an toàn của checkout bằng MongoDB transaction.
- Thêm danh mục sản phẩm và bộ lọc nâng cao.
- Thêm trang hồ sơ người dùng.
- Bổ sung cấu hình deploy.

## Mục tiêu project

Project được xây dựng nhằm thực hành quy trình phát triển một ứng dụng web full-stack thực tế, bao gồm thiết kế giao diện frontend, xây dựng REST API, xác thực người dùng, phân quyền admin, thiết kế database, upload file, quản lý giỏ hàng, xử lý đơn hàng và xây dựng dashboard quản trị.
