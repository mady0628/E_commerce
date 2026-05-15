# Project Review

Ngay thuc hien: 2026-05-15

## Tong Quan

Project gom 2 phan chinh:

- `front_end`: React + Vite.
- `back_end`: Node.js + Express + MongoDB/Mongoose.

Ket qua kiem tra nhanh:

- Frontend build thanh cong bang `npm run build`.
- Frontend lint dang fail bang `npm run lint`.
- Backend khong co loi cu phap o cac file `.js` khi chay `node --check`.
- Chua co test tu dong cho backend/frontend.

## Loi Can Sua Truoc

### 1. Frontend lint dang fail

File: `front_end/src/admin/admin_page.jsx`

Loi:

- Dong 69: bien `headers` duoc khai bao nhung khong duoc su dung.
- Dong 725: khai bao `const groupedOrders` truc tiep trong `case 'order'`, gay loi `no-case-declarations`.

Huong sua:

- Xoa bien `headers` neu khong can dung.
- Boc noi dung `case 'order'` bang block `{ ... }` hoac dua `groupedOrders` ra ngoai `switch`.

### 2. Bien loi `err` khong duoc su dung

Files:

- `front_end/src/pages/cart.jsx`
- `front_end/src/pages/sign_in.jsx`
- `front_end/src/pages/sign_up.jsx`

Loi:

- Cac block `catch (err)` khai bao `err` nhung khong dung.

Huong sua:

- Doi thanh `catch { ... }` neu khong can log loi.
- Hoac dung `console.error(err)` neu can debug.

### 3. AdminRoute bi React lint canh bao nghiem trong

File: `front_end/src/route/AdminRoute.jsx`

Loi:

- `setStatus("unauthorized")` duoc goi dong bo ngay trong `useEffect` khi khong co token.

Tac dong:

- Co the khong lam app crash, nhung dang lam `npm run lint` fail voi rule hien tai.

Huong sua:

- Khoi tao state dua tren token ban dau.
- Hoac tach logic redirect/kiem tra token de tranh set state dong bo trong effect.

## Rủi Ro Backend

### 1. Checkout co the sai stock khi nhieu user mua cung luc

File: `back_end/src/controller/order.controller.js`

Van de:

- Code kiem tra stock truoc, sau do moi tao order va tru stock.
- Neu nhieu request checkout cung luc, 2 request co the cung thay con hang va cung tao order.
- Cac update stock dang chay tung query rieng le, khong co transaction.

Tac dong:

- Co the ban qua so luong ton kho.
- Co the tao order thanh cong nhung tru stock/cart that bai giua chung.

Huong sua:

- Dung MongoDB transaction cho toan bo flow checkout.
- Hoac cap nhat stock bang dieu kien atomic, vi du chi update khi `stock >= quantity`.

### 2. Cart co the crash neu product khong ton tai

File: `back_end/src/controller/cart.controller.js`

Van de:

- Trong `updateCartItem`, code goi `Product.findById(productID)`.
- Neu product khong ton tai, `product` la `null`, sau do dung `product.stock` se gay crash.

Huong sua:

- Them check:

```js
if (!product) {
  return res.status(404).json({ message: "Product not found" });
}
```

### 3. User co the dang ky trung email

File: `back_end/src/module/user.module.js`

Van de:

- Field `email` chi co `required: true`, chua co `unique: true`.
- Controller dang ky cung chua check email da ton tai.

Tac dong:

- Mot email co the tao nhieu tai khoan.
- Dang nhap bang email co the lay nham user dau tien.

Huong sua:

- Them `unique: true` vao schema.
- Check email truoc khi tao user.
- Xu ly Mongo duplicate key error neu dung unique index.

### 4. JWT secret va Mongo URL chua duoc validate luc khoi dong

File: `back_end/src/app.js`

Van de:

- App dung `process.env.MONGO_URL` va `process.env.JWT_PASS`.
- Neu thieu env, loi chi xay ra khi connect DB hoac verify/sign token.

Huong sua:

- Kiem tra env bat buoc khi app start.
- Neu thieu thi log loi ro rang va dung server.

## Tối Ưu Frontend

### 1. Gom API base URL vao env

Hien tai frontend hard-code rat nhieu URL:

```js
http://localhost:3000
```

Tac dong:

- Kho deploy len server/staging.
- Doi port/domain phai sua nhieu file.

Huong sua:

- Tao bien moi truong `VITE_API_URL`.
- Tao helper trong `front_end/src/utils/api.js`.

Vi du:

```js
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
```

### 2. Cai thien `apiFetch`

File: `front_end/src/utils/api.js`

Van de:

- Hien tai helper chi `return res.json()`.
- Neu HTTP status la 400/401/500, caller co the khong biet day la loi.

Huong sua:

```js
export const apiFetch = async (url, option = {}) => {
  const res = await fetch(url, {
    ...option,
    headers: {
      "Content-Type": "application/json",
      ...option.headers,
    },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || data?.error || "Request failed");
  }

  return data;
};
```

Luu y:

- Voi upload `FormData`, khong nen tu set `"Content-Type": "application/json"` vi browser can tu set boundary.

### 3. Bundle frontend hoi lon

Ket qua build:

- File JS chinh khoang `670 KB`.
- Vite canh bao chunk lon hon `500 KB`.

Huong sua:

- Lazy-load cac route lon nhu admin page.
- Tach dashboard/chart ra dynamic import.
- Chi import nhung component can dung tu thu vien lon.

## Tối Ưu Backend

### 1. Khong hard-code URL anh upload

Files:

- `back_end/src/controller/product.controller.js`
- `back_end/src/controller/comment.controller.js`

Hien tai:

```js
http://localhost:3000/uploads/${f.filename}
```

Huong sua:

- Dung env `BASE_URL`.
- Hoac chi luu path tuong doi `/uploads/filename`.

Khuyen nghi:

- Luu path tuong doi se linh hoat hon khi deploy sau reverse proxy/CDN.

### 2. Them validation input

Nen validate:

- `email`, `password`, `name` khi dang ky/dang nhap.
- `cost`, `stock`, `name` khi tao/sua product.
- `quantity`, `productID` khi sua cart.
- `recipientName`, `phone`, `address` khi checkout.
- `rating` va `content` khi comment.

Tac dong:

- Giam loi 500.
- Response API ro rang hon.
- Tranh data xau vao database.

### 3. Them middleware xu ly loi tap trung

Hien tai nhieu controller tu `try/catch` rieng le, mot so route nhu cart chua bọc try/catch day du.

Huong sua:

- Tao async handler.
- Tao error middleware cuoi app.
- Controller chi throw loi hoac return response.

### 4. Cai thien security co ban

Nen them:

- `helmet` de set security headers.
- CORS chi cho phep origin frontend thay vi `cors()` mo toan bo.
- Rate limit cho route auth.
- Khong tra ve thong tin loi noi bo qua `err.message` o production.

## Thứ Tự Ưu Tiên Đề Xuất

1. Sua cac loi lint frontend de `npm run lint` pass.
2. Sua bug backend co the crash trong cart.
3. Them check email trung khi dang ky.
4. Sua checkout stock bang transaction hoac atomic update.
5. Gom API URL vao env va cai thien `apiFetch`.
6. Chuyen URL anh upload sang env/path tuong doi.
7. Them validation input va error middleware.
8. Lazy-load admin/dashboard de giam bundle frontend.

## Lenh Da Chay

```bash
npm run lint
npm run build
node --check
```

Ket qua:

- `npm run lint`: fail.
- `npm run build`: pass, co warning chunk lon.
- `node --check` backend: pass.
