// product/data.js

const trendingProducts = [
  {
    id: 1,
    name: "Nike Air Force 1 '07",
    image: "https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/e6da41fa-7565-4271-b610-188b393b4904/air-force-1-07-shoes-WrLlWX.png",
    category: "Men's Shoes",
    price: "3.209.000₫"
  },
  {
    id: 2,
    name: "Nike Dunk Low Retro",
    image: "https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/a3e7dead-1ad2-4c40-996d-93ebc9df0fca/dunk-low-retro-shoes-bCzchX.png",
    category: "Men's Shoes",
    price: "2.909.000₫"
  },
  {
    id: 3,
    name: "Air Jordan 1 Low",
    image: "https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/21d38052-598b-44f6-a857-123c9f72b015/air-jordan-1-low-shoes-459b4T.png",
    category: "Women's Shoes",
    price: "3.509.000₫"
  },
  {
    id: 4,
    name: "Air Jordan 1 Low SE",
    image: "https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/u_126ab356-44d8-4a06-89b4-fcdcc8df0245,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/0a0279c7-5264-4424-b040-34925894b917/air-jordan-1-low-se-shoes-H7DD5v.png",
    category: "Women's Shoes",
    price: "3.809.000₫"
  }
];

// Chú ý: Để code tìm kiếm hoạt động tốt nhất, 
// tôi đã gộp chung dữ liệu vào mảng 'products' và đổi tên danh mục cho thống nhất.
const products = [
    // --- Trending Products (Data cũ) ---
    ...trendingProducts, 
    
    // --- Data mới thêm vào ---
    {
        id: 5, // Đánh lại số ID để không bị trùng (1-4 đã dùng ở trên)
        name: "Product 1",
        price: "750.000₫", // Đổi sang định dạng tiền Việt chuỗi để bộ lọc hoạt động
        image: "images/product1.jpg",
        size: "M",
        category: "Men's Shoes" // Sửa 'catory' -> category và thống nhất tên
    },
    {
        id: 6,
        name: "Product 2",
        price: "1.000.000₫",
        image: "images/product2.jpg",
        size: "L",
        category: "Women's Shoes"
    },
    {
        id: 7,
        name: "Classic Leather Loafers",
        price: "2.250.000₫",
        image: "images/product3.jpg",
        size: "L",
        category: "Men's Shoes"
    },
    {
        id: 8,
        name: "Summer Beach Sandals",
        price: "630.000₫",
        image: "images/product4.jpg",
        size: "S",
        category: "Women's Shoes"
    },
    {
        id: 9,
        name: "High-Top Sneakers",
        price: "1.600.000₫",
        image: "images/product5.jpg",
        size: "XL",
        category: "Men's Shoes"
    },
    {
        id: 10,
        name: "Pro Running Gear",
        price: "1.750.000₫",
        image: "images/product6.jpg",
        size: "M",
        category: "Women's Shoes"
    },
    {
        id: 11,
        name: "Winter Warm Boots",
        price: "2.375.000₫",
        image: "images/product7.jpg",
        size: "L",
        category: "Men's Shoes"
    },
    {
        id: 12,
        name: "Casual Daily Slip-on",
        price: "1.125.000₫",
        image: "images/product8.jpg",
        size: "M",
        category: "Men's Shoes"
    },
    {
        id: 13,
        name: "Elegant Party Heels",
        price: "1.400.000₫",
        image: "images/product9.jpg",
        size: "S",
        category: "Women's Shoes"
    },
    {
        id: 14,
        name: "Canvas Streetwear",
        price: "875.000₫",
        image: "images/product10.jpg",
        size: "M",
        category: "Unisex Shoes"
    },
    {
        id: 15,
        name: "Mountain Trekking Boots",
        price: "2.750.000₫",
        image: "images/product11.jpg",
        size: "XL",
        category: "Men's Shoes"
    },
    {
        id: 16,
        name: "Office Derby Black",
        price: "1.875.000₫",
        image: "images/product12.jpg",
        size: "L",
        category: "Men's Shoes"
    },
    {
        id: 17,
        name: "Soft Yoga Trainers",
        price: "1.000.000₫",
        image: "images/product13.jpg",
        size: "M",
        category: "Women's Shoes"
    },
    {
        id: 18,
        name: "Oxford Vintage Brown",
        price: "2.125.000₫",
        image: "images/product14.jpg",
        size: "M",
        category: "Men's Shoes"
    },
    {
        id: 19,
        name: "Chunky Style Sneakers",
        price: "1.500.000₫",
        image: "images/product15.jpg",
        size: "L",
        category: "Women's Shoes"
    }
];

const favorProducts = [...products];