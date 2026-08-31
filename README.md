# WEB BÁN GIÀY

## 1. Giới thiệu đề tài
Web Bán Giày là một ứng dụng web bán hàng online được xây dựng dựa trên việc tham khảo và clone UI/UX cũng như một phần logic từ nhiều website thương mại điện tử nổi tiếng (như Nike, Adidas, v.v.).
Ứng dụng hướng tới việc tạo ra một nền tảng trưng bày sản phẩm giày dép hiện đại, trực quan, giúp người dùng dễ dàng khám phá sản phẩm, đánh dấu yêu thích và mô phỏng trải nghiệm mua sắm online.

🔗 **Demo trực tuyến:**  
https://tylerlucasvn.github.io/aestheticwebsite/

---

## 2. Mục tiêu của đề tài
Xây dựng một ứng dụng web bán giày cho phép người dùng:
- Xem danh sách sản phẩm
- Lọc và sắp xếp sản phẩm theo danh mục
- Đánh dấu sản phẩm yêu thích
Áp dụng kiến thức về HTML, CSS, JavaScript trong xây dựng giao diện và xử lý logic phía client
Tối ưu trải nghiệm người dùng thông qua UI hiện đại và hiệu ứng tương tác
Tạo giao diện thân thiện, dễ sử dụng, phù hợp với nhiều thiết bị

---

## 3. Phạm vi và đối tượng sử dụng
### Đối tượng sử dụng
- Người dùng có nhu cầu tham khảo, mua sắm giày online
- Sinh viên học tập và nghiên cứu về thiết kế web và front-end 

### Phạm vi
Ứng dụng hoạt động trên trình duyệt web
Dữ liệu sản phẩm được lấy từ API mock hoặc file JSON
Lưu trữ dữ liệu phía client (offline) thông qua localStorage (ví dụ: danh sách yêu thích)
Không triển khai thanh toán và backend server

---

## 4. Các chức năng chính

### 4.1 Hiển thị sản phẩm
Hiển thị danh sách giày theo dạng lưới (grid layout)
Thông tin sản phẩm bao gồm:
- Hình ảnh
- Tên sản phẩm
- Danh mục
- Giá bán 

### 4.2 Phân loại và lọc sản phẩm
Phân loại sản phẩm theo:
- Men
- Women
- Kids
- Sale 
Hỗ trợ lọc sản phẩm thông qua tham số (param) hoặc tag

### 4.3 Sắp xếp (Sort)
Sắp xếp sản phẩm theo:
- Giá tăng dần / giảm dần
- Tên sản phẩm (A–Z / Z–A)

### 4.4 Yêu thích (Favorites)
Cho phép người dùng đánh dấu sản phẩm yêu thích
Lưu trạng thái yêu thích bằng localStorage
Hiển thị số lượng sản phẩm yêu thích trên thanh điều hướng

---

### 4.5. Lazy Load / Infinite Scroll
Tải sản phẩm theo từng batch khi người dùng cuộn trang
Giúp tối ưu hiệu năng và trải nghiệm người dùng

---

## 5. Giao diện và trải nghiệm người dùng
Thiết kế UI theo phong cách aesthetic / minimal / modern
Hiệu ứng hover, transition và animation mượt mà
Giao diện responsive, tương thích với:
- Desktop
- Tablet
- Mobile
Bố cục rõ ràng, dễ thao tác và dễ mở rộng

---

## 6. Công nghệ sử dụng
- HTML5  
- CSS3  
- JavaScript (ES6 Modules)  
- Tailwind CSS  
- API Mock / JSON
- localStorage  
- GitHub Pages  
- GitHub Actions  

---

## 7. Cấu trúc thư mục dự án
```
aestheticwebsite/
│
├── .github/
│   └── workflows/
│       └── static.yml                # Tự động hóa CI/CD deploy lên GitHub Pages
│
├── assets/                           # Tài nguyên tĩnh dùng chung
│   ├── css/
│   │   └── style.css                 # File định kiểu CSS tùy biến
│   ├── js/
│   │   ├── home.js                   # Logic render giao diện trang chủ
│   │   ├── mobile.js                 # Xử lý mobile drawer & touch swipe
│   │   ├── monitoring.js             # Theo dõi sự kiện & hiệu năng (Analytics)
│   │   └── searchOverlay.js          # Modal tìm kiếm nhanh đa trang
│   ├── images/                       # Hình ảnh & icons
│   │   ├── logo.png
│   │   ├── 78-best-nike-sneakers.webp
│   │   ├── hollywood-keepers-hero.jpg
│   │   ├── image.avif
│   │   └── image-1.avif
│   └── videos/                       # Video tư liệu
│       └── test-video.mp4
│
├── pages/                            # Các trang chức năng của website
│   ├── cart/                         # Trang giỏ hàng
│   │   ├── cart.html
│   │   └── cart.js
│   ├── favor/                        # Trang danh sách yêu thích
│   │   ├── favor.html
│   │   └── favor.js
│   ├── products/                     # Trang danh mục & lọc sản phẩm
│   │   ├── products.html
│   │   └── products.js
│   └── search/                       # Trang kết quả tìm kiếm chi tiết
│       ├── search.html
│       └── search.js
│
├── docs/                             # Báo cáo & Tài liệu kỹ thuật
│   └── lighthouse-report-20251230.html
│
├── index.html                        # Trang chủ (Root entrypoint)
└── README.md                         # Tài liệu hướng dẫn
```

---

## 8. Hướng dẫn cài đặt và chạy dự án

### 8.1 Yêu cầu hệ thống
Trình duyệt web hiện đại (Chrome, Edge, Firefox)

Không yêu cầu cài đặt backend 

### 8.2 Các bước chạy dự án
Clone repository:
```bash
git clone https://github.com/tylerlucasvn/aestheticwebsite.git
```
Mở file index.html bằng trình duyệt
Hoặc deploy thông qua GitHub Page

---

## 9. Đánh giá và hướng phát triển

### 9.1 Kết quả đạt được
Hoàn thiện giao diện web bán giày theo đúng mục tiêu đề tài
Các chức năng lọc, sắp xếp và yêu thích hoạt động ổn định
UI hiện đại, phù hợp với xu hướng thiết kế web hiện nay
Sử dụng được những yêu cầu cơ bản như tailwind, api mockup,...

### 9.2 Hướng phát triển
Bổ sung giỏ hàng và thanh toán
Kết nối backend và cơ sở dữ liệu thực
Thêm đăng nhập người dùng
Tối ưu SEO và hiệu năng tải trang

---

## 10. Kết luận
Đề tài Web Bán Giày giúp sinh viên vận dụng kiến thức đã học vào thực tế, đặc biệt trong lĩnh vực phát triển giao diện web và xử lý logic phía client.
Sản phẩm không chỉ mang tính học thuật mà còn có khả năng mở rộng thành một hệ thống thương mại điện tử hoàn chỉnh trong tương lai.

---

## 11. Nhóm thực hiện
Tên đề tài: Web bán giày 
Môn học: Thiết kế Web Lớp: 23SE – VNUK

Thành viên nhóm:
- Trần Tiến Minh
- Hồ Thăng Bảo Huy
- Nguyễn Bá Toàn
---
slide thuyết trình: [NHÓM 6.pdf](https://github.com/user-attachments/files/24394064/NHOM.6.pdf)
---
  
Nhóm xin chân thành cảm ơn giảng viên đã hướng dẫn và hỗ trợ trong suốt quá trình thực hiện dự án cũng như cũng cố dự án.

Nhóm 6 – 23SE – VNUK



