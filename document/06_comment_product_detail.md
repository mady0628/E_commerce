# Hệ thống Bình luận & Trang Chi tiết Sản phẩm

Tài liệu này giải thích chi tiết luồng hoạt động của **hệ thống comment (bình luận)** và **trang Product Detail** — bao gồm Backend (API, Schema) và Frontend (giao diện, logic hiển thị, load thêm comment).

---

## 📂 Các file liên quan

| File | Vai trò |
|------|---------|
| `back_end/src/module/comment.module.js` | Schema Comment (Mongoose) |
| `back_end/src/controller/comment.controller.js` | Xử lý logic: lấy comment, tạo comment |
| `back_end/src/router/comment.router.js` | Định tuyến API cho comment |
| `back_end/src/middleware/auth.middleware.js` | Xác thực JWT (bảo vệ route POST comment) |
| `front_end/src/pages/product_detail.jsx` | Giao diện trang chi tiết sản phẩm + comment |
| `front_end/src/App.jsx` | Đăng ký route `/product/:id` |

---

## 1. Backend — Schema Comment

```js
// back_end/src/module/comment.module.js
{
    user:      ObjectId → ref 'User',   // Ai viết comment
    product:   ObjectId → ref 'Product',// Comment cho sản phẩm nào
    content:   String,                  // Nội dung bình luận
    rating:    Number (1-5, required),  // Đánh giá sao
    images:    [String],                // Mảng URL ảnh đính kèm
    isHidden:  Boolean (default: false),// Ẩn comment (admin dùng)
    createAt:  Date (default: Date.now) // Thời gian tạo
}
```

---

## 2. Backend — API Endpoints

### 2.1 GET `/api/product/:id` — Lấy sản phẩm + comment

**Router**: `comment.router.js` → `getProductDetailWithComments`

**Query params**:
- `commentOffset` — Bỏ qua bao nhiêu comment (mặc định: 0)
- `commentLimit` — Lấy tối đa bao nhiêu comment (mặc định: 5, tối đa: 20)

**Luồng xử lý**:

```
1. Lấy id từ req.params
2. Parse & validate commentOffset, commentLimit từ query string
3. Tìm product theo id → không có thì trả 404
4. Query comment: filter { product: id, isHidden: false }
   → populate user (lấy tên)
   → sort theo createAt giảm dần (mới nhất trước)
   → skip(offset) + limit(limit) → phân trang
5. Đếm tổng comment (countDocuments)
6. Tính pagination: returned, nextOffset, hasMore
7. Trả JSON: { product, comment, commentPagination }
```

**Response mẫu**:
```json
{
  "product": { "_id": "abc", "name": "Áo thun", "cost": 150000, ... },
  "comment": [
    { "_id": "c1", "user": { "name": "Nguyen A" }, "rating": 5, "content": "Rất đẹp", "createAt": "..." },
    { "_id": "c2", "user": { "name": "Tran B" }, "rating": 4, "content": "Tốt", "createAt": "..." }
  ],
  "commentPagination": {
    "offset": 0,
    "limit": 5,
    "returned": 5,
    "total": 18,
    "nextOffset": 5,
    "hasMore": true
  }
}
```

### 2.2 POST `/api/product/:id/comment` — Tạo comment mới

**Router**: `comment.router.js` → `authMiddleware` → `createComment`

> Yêu cầu đăng nhập (JWT token trong header Authorization).

**Body**: `{ content: String, rating: Number (1-5) }`

**Luồng xử lý**:
```
1. Lấy id sản phẩm từ params, content + rating từ body
2. Kiểm tra sản phẩm tồn tại → không có thì 404
3. Validate rating (1-5) → không hợp lệ thì 400
4. Tạo comment: user = req.user._id (từ middleware)
5. Populate user name cho comment vừa tạo
6. Trả 201: { comment: {...} }
```

---

## 3. Frontend — Trang Product Detail (`product_detail.jsx`)

### 3.1 Cấu trúc tổng quan

File gồm 5 phần:

```
┌─ Import & Hằng số (dòng 1-6)
├─ Component phụ: StarIcon, RatingStars (dòng 8-38)
├─ Object styles `s` (dòng 40-155)
├─ Component chính: ProductDetail
│   ├─ State declarations (dòng 159-172)
│   ├─ useEffect — load lần đầu (dòng 175-183)
│   ├─ fetchData — gọi API (dòng 185-209)
│   ├─ handleLoadMore — load thêm comment (dòng 212-216)
│   ├─ handleSubmit — gửi comment mới (dòng 219-243)
│   ├─ Helper functions (dòng 247-259)
│   └─ JSX Render (dòng 261-511)
└─ Export
```

### 3.2 Component phụ

**StarIcon** — Vẽ 1 ngôi sao bằng SVG:
- `filled=true` → tô vàng cam `#ffa502`
- `filled=false` → chỉ có viền, không tô
- `hoverable=true` → phóng to khi hover (dùng cho form chọn sao)

**RatingStars** — Hiển thị 5 sao theo giá trị `value`:
```
value = 3 → ★★★☆☆
value = 5 → ★★★★★
```

### 3.3 State

| State | Kiểu | Mục đích |
|-------|------|----------|
| `product` | Object/null | Thông tin sản phẩm từ API |
| `comments` | Array | Mảng comment đang hiển thị trên trang |
| `pagination` | Object/null | Metadata phân trang: total, nextOffset, hasMore |
| `loading` | Boolean | Loading lần đầu → hiện spinner |
| `loadingMore` | Boolean | Đang load thêm comment → disable nút Load More |
| `rating` | Number (0-5) | Số sao user đã chọn trong form (0 = chưa chọn) |
| `hoverRating` | Number (0-5) | Sao đang hover → preview hiệu ứng trước khi click |
| `content` | String | Nội dung comment user đang gõ |
| `submitting` | Boolean | Đang gửi comment → disable nút Post |

### 3.4 Hàm `fetchData(offset, reset)` — Cốt lõi của phân trang

```
Tham số:
  - offset: vị trí bắt đầu lấy comment (0, 5, 10, ...)
  - reset: true = thay thế mảng, false = nối thêm

Luồng:
  1. Set loading state (spinner hoặc nút)
  2. GET /api/product/:id?commentOffset={offset}&commentLimit=5
  3. Set product data
  4. if (reset) → comments = data mới          (lần đầu load)
     else      → comments = [...cũ, ...mới]   (load more)
  5. Set pagination metadata
  6. Tắt loading
```

### 3.5 Luồng Load More Comment

```
Lần đầu vào trang:
  fetchData(offset=0, reset=true)
  → comments = [c1, c2, c3, c4, c5]           (5 comment)
  → pagination = { nextOffset: 5, total: 18, hasMore: true }
  → Hiện nút "Load More (13 remaining)"

Bấm Load More lần 1:
  fetchData(offset=5, reset=false)
  → comments = [c1..c5, c6, c7, c8, c9, c10]  (10 comment)
  → pagination = { nextOffset: 10, hasMore: true }
  → Hiện nút "Load More (8 remaining)"

Bấm Load More lần 2:
  fetchData(offset=10, reset=false)
  → comments = [c1..c10, c11..c15]             (15 comment)

Bấm Load More lần 3:
  fetchData(offset=15, reset=false)
  → comments = [c1..c15, c16, c17, c18]        (18 comment)
  → pagination = { hasMore: false }
  → ẨN nút Load More
```

### 3.6 Luồng Gửi Comment Mới (`handleSubmit`)

```
1. User chọn sao (1-5) + gõ nội dung
2. Bấm "Post Review"
3. Validate: rating === 0 → alert lỗi
4. POST /api/product/:id/comment  { content, rating }
5. Backend tạo comment, populate user name, trả về
6. Frontend:
   - Chèn comment mới vào ĐẦU mảng: [newComment, ...prev]
   - Cập nhật pagination.total + 1
   - Reset form: content='', rating=0
   → Comment xuất hiện ngay trên đầu danh sách, không cần reload
```

### 3.7 Helper Functions

**`timeAgo(dateStr)`** — Chuyển đổi thời gian thành dạng tương đối:
```
< 1 phút  → "just now"
< 60 phút → "15m ago"
< 24 giờ  → "3h ago"
< 30 ngày → "5d ago"
≥ 30 ngày → "08/05/2026" (toLocaleDateString)
```

**`getInitial(name)`** — Lấy chữ cái đầu tiên làm avatar:
```
"Nguyen Van A" → "N"
null/undefined → "?"
```

### 3.8 Cấu trúc JSX (giao diện)

```
<div page>
  ├── [Loading spinner]              ← loading=true
  ├── [Product not found]            ← product=null
  │
  ├── Product Info (grid 2 cột)
  │   ├── Cột trái: Ảnh sản phẩm
  │   └── Cột phải: Tên, mô tả, giá, badge (stock/sold), nút Add to Cart
  │
  ├── Divider (đường kẻ ngang)
  │
  ├── Write a Review (form)
  │   ├── Star picker: 5 sao click được (hover preview)
  │   ├── Textarea: nhập nội dung
  │   └── Nút "Post Review"
  │
  └── Customer Reviews (danh sách)
      ├── [Trống] → "No reviews yet"
      ├── Comment cards (lặp qua mảng comments)
      │   ├── Avatar (chữ cái đầu) + Tên user
      │   ├── Rating sao + Thời gian (timeAgo)
      │   └── Nội dung comment
      └── Nút "Load More Reviews (N remaining)"
          └── Chỉ hiện khi pagination.hasMore === true
</div>
```

---

## 4. Kết nối giữa Frontend và Backend

```
Frontend (React)                          Backend (Express + MongoDB)
─────────────────                         ──────────────────────────
Vào /product/:id
  │
  ├─ GET /api/product/:id ──────────────→ getProductDetailWithComments()
  │   ?commentOffset=0&commentLimit=5     → Product.findById(id)
  │                                       → Comment.find({product:id})
  │                                            .populate("user","name")
  │                                            .sort({createAt:-1})
  │                                            .skip(0).limit(5)
  │  ←──────────────────────────────────  → res.json({product, comment, commentPagination})
  │
  ├─ Bấm "Load More"
  │  GET /api/product/:id ──────────────→ (cùng hàm, offset=5)
  │   ?commentOffset=5&commentLimit=5
  │  ←──────────────────────────────────  → res.json({...})
  │
  └─ Bấm "Post Review"
     POST /api/product/:id/comment ─────→ authMiddleware → createComment()
       { content, rating }                → Comment.create({user, product, content, rating})
     ←──────────────────────────────────  → res.json({comment: populated})
```

---

## 5. Lưu ý kỹ thuật

- **Phân trang kiểu Offset**: dùng `skip/limit` của MongoDB. Phù hợp cho danh sách comment vì user thường xem tuần tự.
- **Optimistic UI**: comment mới được chèn ngay vào đầu mảng trên frontend mà không cần gọi lại toàn bộ API.
- **isHidden**: cho phép admin ẩn comment vi phạm mà không cần xóa khỏi database.
- **Route bảo vệ**: GET comment không cần auth (ai cũng xem được), POST comment yêu cầu đăng nhập (authMiddleware).
