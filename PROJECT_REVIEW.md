# Project Review - E-Commerce Web Application

## 1. Tổng quan dự án

Đây là một project E-Commerce full-stack gồm frontend React/Vite và backend Node.js/Express kết nối MongoDB. Ứng dụng tập trung vào các chức năng cơ bản của một hệ thống bán hàng trực tuyến: xác thực người dùng, danh sách sản phẩm, chi tiết sản phẩm, giỏ hàng, checkout, lịch sử đơn hàng, đánh giá sản phẩm và trang quản trị.

Project đã có đủ nền tảng của một ứng dụng thương mại điện tử cơ bản, bao gồm phân quyền admin, upload ảnh sản phẩm, quản lý tồn kho, quản lý người dùng, quản lý đơn hàng và hệ thống bình luận/đánh giá.

## 2. Công nghệ sử dụng

### Frontend

- React
- Vite
- React Router
- Recharts
- CSS thuần
- Fetch API

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- Multer
- CORS
- Morgan
- Dotenv

## 3. Cấu trúc project

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
├── document/
└── PROJECT_REVIEW.md
```

## 4. Chức năng hiện có

### Người dùng

- Đăng ký tài khoản.
- Đăng nhập bằng email và mật khẩu.
- Lưu JWT token ở frontend.
- Lấy thông tin người dùng hiện tại qua API `/api/auth/me`.
- Phân quyền `user` và `admin`.

### Sản phẩm

- Lấy danh sách sản phẩm.
- Tìm kiếm sản phẩm theo tên hoặc mô tả.
- Sắp xếp theo sản phẩm mới, bán chạy, giá tăng dần và giá giảm dần.
- Phân trang dạng load more.
- Xem chi tiết sản phẩm.
- Hiển thị ảnh sản phẩm.
- Hiển thị tồn kho và lượt mua.

### Giỏ hàng

- Thêm sản phẩm vào giỏ hàng.
- Tăng/giảm số lượng sản phẩm.
- Xóa sản phẩm khỏi giỏ hàng khi số lượng nhỏ hơn hoặc bằng 0.
- Kiểm tra tồn kho khi thêm/sửa số lượng.
- Chọn một phần sản phẩm trong giỏ để checkout.

### Đơn hàng

- Tạo đơn hàng từ các sản phẩm được chọn trong giỏ.
- Lưu thông tin giao hàng gồm tên người nhận, số điện thoại và địa chỉ.
- Tính tổng tiền đơn hàng.
- Trừ tồn kho sau khi đặt hàng.
- Lưu lịch sử đơn hàng của người dùng.
- Admin có thể xem toàn bộ đơn hàng.
- Admin có thể cập nhật trạng thái đơn hàng.

### Bình luận và đánh giá

- Người dùng có thể bình luận sản phẩm.
- Có thể đánh giá sản phẩm bằng số sao.
- Có hỗ trợ upload ảnh trong bình luận.
- Tính lại rating trung bình của sản phẩm.
- Admin có thể xem và ẩn/hiện bình luận.

### Admin dashboard

- Giao diện dashboard riêng cho admin.
- Quản lý sản phẩm.
- Quản lý người dùng.
- Quản lý đơn hàng.
- Quản lý bình luận.
- Có route guard để chặn user thường truy cập trang admin.

## 5. Điểm mạnh của project

- Project đã có đầy đủ flow cơ bản của một trang thương mại điện tử.
- Backend được chia module khá rõ theo controller, router, middleware và model.
- Có sử dụng JWT để xác thực và phân quyền.
- Có kiểm tra quyền admin ở các API nhạy cảm.
- Product, cart, order và comment đã được liên kết bằng MongoDB reference.
- Frontend có nhiều màn hình thực tế, không chỉ là demo tĩnh.
- Có chức năng upload ảnh cho sản phẩm và bình luận.
- Có phân trang/load more cho sản phẩm và bình luận, giúp tránh tải quá nhiều dữ liệu một lần.
- Có tài liệu trong thư mục `document/`, giúp người đọc hiểu flow chính của project.

## 6. Vấn đề kỹ thuật cần xử lý

### 6.1 Frontend lint đang lỗi

Khi chạy `npm run lint` ở frontend, project hiện tại vẫn còn lỗi ESLint.

Các lỗi đáng chú ý:

- Biến không sử dụng trong `front_end/src/admin/admin_page.jsx`.
- Khai báo biến trực tiếp trong `case` của `switch`, gây lỗi `no-case-declarations`.
- Một số block `catch (err)` khai báo `err` nhưng không sử dụng.
- `AdminRoute.jsx` bị rule React Hooks cảnh báo về việc gọi `setState` đồng bộ trong effect.

Tác động:

- Code vẫn có thể build được, nhưng chưa đạt trạng thái sạch để merge/deploy nghiêm túc.
- CI/CD nếu có bước lint sẽ fail.

Mức ưu tiên: Cao.

### 6.2 API URL đang bị hard-code

Frontend đang gọi trực tiếp nhiều URL dạng:

```js
http://localhost:3000
```

Backend cũng đang lưu URL ảnh upload dạng:

```js
http://localhost:3000/uploads/filename
```

Tác động:

- Khi deploy lên server thật, phải sửa nhiều file.
- Không linh hoạt giữa môi trường local, staging và production.
- URL ảnh cũ có thể sai nếu đổi domain.

Đề xuất:

- Frontend dùng `VITE_API_URL`.
- Backend dùng `BASE_URL` hoặc chỉ lưu đường dẫn tương đối như `/uploads/filename`.

Mức ưu tiên: Cao.

### 6.3 Helper API chưa xử lý lỗi HTTP tốt

File `front_end/src/utils/api.js` hiện chỉ gọi `fetch` và trả về `res.json()`.

Vấn đề:

- Nếu backend trả HTTP 400, 401 hoặc 500, helper vẫn trả JSON như response bình thường.
- Mỗi component phải tự xử lý `res.ok`, dẫn đến code không thống nhất.

Đề xuất:

- Chuẩn hóa `apiFetch` để kiểm tra `res.ok`.
- Throw error khi request thất bại.
- Không tự set `Content-Type: application/json` khi body là `FormData`.

Mức ưu tiên: Trung bình cao.

### 6.4 Checkout chưa an toàn khi nhiều request cùng lúc

Trong backend, flow tạo đơn hàng hiện đang:

1. Lấy cart.
2. Kiểm tra stock.
3. Tạo order.
4. Trừ stock.
5. Xóa sản phẩm đã mua khỏi cart.

Vấn đề:

- Các bước này không nằm trong transaction.
- Nếu nhiều người cùng mua một sản phẩm gần như cùng lúc, stock có thể bị trừ sai.
- Nếu một bước giữa chừng fail, dữ liệu order, stock và cart có thể không đồng bộ.

Đề xuất:

- Dùng MongoDB transaction cho toàn bộ checkout flow.
- Hoặc dùng atomic update với điều kiện `stock >= quantity`.

Mức ưu tiên: Cao.

### 6.5 User có thể đăng ký trùng email

Model user hiện có `email` bắt buộc, nhưng chưa có unique index rõ ràng và controller chưa kiểm tra email tồn tại trước khi tạo user.

Tác động:

- Một email có thể tạo nhiều tài khoản.
- Đăng nhập bằng email có thể lấy nhầm user.

Đề xuất:

- Thêm `unique: true` cho email.
- Check email trước khi tạo user.
- Xử lý lỗi duplicate key từ MongoDB.

Mức ưu tiên: Cao.

### 6.6 Một số controller chưa xử lý lỗi đầy đủ

Một số function backend, đặc biệt ở cart, chưa có `try/catch` đầy đủ.

Ví dụ:

- Nếu `Product.findById(productID)` trả về `null`, code vẫn có thể truy cập `product.stock`.
- Nếu `productID` không hợp lệ, Mongoose có thể throw CastError.

Đề xuất:

- Bọc controller bằng async error handler.
- Trả lỗi 400/404 rõ ràng thay vì để server trả 500.
- Thêm middleware xử lý lỗi tập trung.

Mức ưu tiên: Trung bình cao.

### 6.7 Validation input còn thiếu

Hiện project chủ yếu xử lý dữ liệu dựa trên logic thủ công trong controller.

Nên validate rõ:

- `name`, `email`, `password` khi đăng ký.
- `email`, `password` khi đăng nhập.
- `name`, `cost`, `stock`, `describe` khi tạo/sửa sản phẩm.
- `productID`, `quantity` khi sửa cart.
- `recipientName`, `phone`, `address` khi checkout.
- `rating`, `content` khi tạo comment.

Đề xuất:

- Dùng thư viện như Zod, Joi hoặc express-validator.
- Chuẩn hóa response lỗi validation.

Mức ưu tiên: Trung bình.

### 6.8 Bảo mật cần bổ sung trước production

Project đã có JWT và phân quyền admin, nhưng vẫn cần thêm một số lớp bảo vệ:

- Cấu hình CORS theo domain frontend thay vì mở toàn bộ.
- Thêm `helmet`.
- Thêm rate limit cho auth API.
- Không trả trực tiếp `err.message` trong production.
- Kiểm tra env bắt buộc khi server khởi động.
- Cân nhắc lưu token bằng httpOnly cookie nếu muốn tăng bảo mật trước XSS.

Mức ưu tiên: Trung bình.

## 7. Tối ưu nên làm

### Frontend

- Tách cấu hình API ra một file duy nhất.
- Lazy-load route admin để giảm bundle ban đầu.
- Tách các component lớn trong admin dashboard.
- Chuẩn hóa loading, empty state và error state.
- Giảm inline style, chuyển dần về CSS module hoặc CSS file có cấu trúc.
- Thay `alert()` bằng toast/modal để trải nghiệm tốt hơn.
- Cân nhắc dùng context/store cho auth và cart.

### Backend

- Chuẩn hóa response format cho API.
- Thêm middleware error handler.
- Thêm validation layer.
- Dùng transaction cho checkout.
- Thêm index cho các field hay tìm kiếm như email, product name, order user.
- Không hard-code port/base URL.
- Tách config database/server/env thành module riêng.

### Database

- Thêm unique index cho `User.email`.
- Thêm index cho `Order.user`.
- Thêm index cho `Comment.product`.
- Cân nhắc lưu snapshot thông tin sản phẩm trong order để tránh giá/tên sản phẩm thay đổi làm sai lịch sử đơn hàng.

## 8. Kết quả kiểm tra hiện tại

### Frontend

Lệnh:

```bash
npm run build
```

Kết quả:

- Build thành công.
- Có cảnh báo chunk JavaScript lớn hơn 500 KB.

Lệnh:

```bash
npm run lint
```

Kết quả:

- Lint chưa pass.
- Có lỗi unused variable, no-case-declarations và React Hooks rule.

### Backend

Lệnh:

```bash
node --check
```

Kết quả:

- Các file backend không có lỗi cú pháp.

Lưu ý:

- Backend hiện chưa có test tự động.
- Script `npm test` của backend vẫn là script placeholder.

## 9. Roadmap đề xuất

### Giai đoạn 1: Làm sạch code hiện tại

- Sửa toàn bộ lỗi ESLint.
- Xóa biến không dùng.
- Chuẩn hóa các block `catch`.
- Sửa `switch case` trong admin page.
- Tạo file cấu hình API URL cho frontend.

### Giai đoạn 2: Củng cố backend

- Thêm validation input.
- Thêm error middleware.
- Check trùng email khi đăng ký.
- Sửa cart controller để không crash khi product không tồn tại.
- Validate env khi server start.

### Giai đoạn 3: Làm checkout an toàn hơn

- Dùng transaction hoặc atomic update cho stock.
- Đảm bảo order, cart và product stock luôn đồng bộ.
- Cân nhắc lưu snapshot sản phẩm trong order.

### Giai đoạn 4: Chuẩn bị deploy

- Dùng `.env` cho frontend và backend.
- Bỏ hard-code localhost.
- Cấu hình CORS theo production domain.
- Bổ sung security headers.
- Tối ưu bundle frontend.

### Giai đoạn 5: Bổ sung test

- Test auth API.
- Test product API.
- Test cart API.
- Test checkout flow.
- Test quyền admin.

## 10. Đánh giá tổng kết

Project đang ở trạng thái tốt cho mục đích học tập, demo hoặc phát triển tiếp. Các chức năng chính của một website thương mại điện tử đã có đủ và được chia module tương đối rõ.

Tuy nhiên, nếu muốn đưa project lên GitHub như một sản phẩm nghiêm túc hoặc chuẩn bị deploy, cần ưu tiên sửa các lỗi lint, loại bỏ hard-code localhost, bổ sung validation, xử lý lỗi tập trung và làm checkout an toàn hơn. Đây là những điểm ảnh hưởng trực tiếp đến độ ổn định, khả năng mở rộng và chất lượng kỹ thuật của project.

Nhìn chung, project có nền tảng tốt, nhưng cần thêm một vòng refactor và hardening trước khi xem là production-ready.
