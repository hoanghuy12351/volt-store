# VOLT — Cửa hàng công nghệ mẫu

Giao diện bán đồ điện tử tĩnh, xây dựng bằng HTML, CSS và JavaScript thuần; lấy cảm hứng từ bảng màu và cách trình bày trong mẫu [HP Design System Analysis](https://getdesign.md/hp/design-md).

## Chạy trang

Mở `dist/index.html` bằng trình duyệt. Có thể chạy qua máy chủ tĩnh, ví dụ:

```bash
cd dist
python -m http.server 4173
```

Sau đó truy cập `http://localhost:4173`. Không cần cài đặt thư viện hay chạy bước build.

`index.html` ở thư mục gốc chuyển tới `dist/`, giúp trang hoạt động khi xuất bản GitHub Pages từ thư mục gốc của nhánh `main`.

Để xem trên điện thoại cùng mạng Wi-Fi, chạy lệnh sau trong thư mục dự án:

```bash
python -m http.server 4173 --bind 0.0.0.0 --directory dist
```

Trên Windows, dùng `ipconfig` để tìm địa chỉ IPv4 của Wi-Fi, sau đó mở `http://<IPv4>:4173` trên điện thoại. Máy tính phải giữ lệnh trên đang chạy; địa chỉ có thể thay đổi khi chuyển mạng. Những thiết bị khác trong cùng mạng có thể truy cập trang nếu mạng và tường lửa cho phép.

## Tùy chỉnh

- `dist/index.html`: nội dung, bố cục và biểu tượng.
- `dist/styles.css`: màu sắc, kiểu chữ và responsive.
- `dist/app.js`: danh sách sản phẩm, giá, tìm kiếm, lọc và giỏ hàng.
- `dist/assets/`: ảnh minh họa được lưu cục bộ. Các ảnh sản phẩm được lấy từ [DummyJSON](https://dummyjson.com/); kiểm tra quyền sử dụng trước khi triển khai cho mục đích thương mại.

Giá, nhãn ưu đãi và sản phẩm chỉ là dữ liệu minh họa. Giỏ hàng được lưu bằng `localStorage` trên trình duyệt, nếu trình duyệt cho phép. Trang không có backend, quản lý đơn hàng hay thanh toán thật.
