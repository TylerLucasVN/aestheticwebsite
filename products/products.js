// Cấu hình API và các biến toàn cục
const API_URL = "https://694a5ba81282f890d2d86de0.mockapi.io/api/v1/products";
let allProducts = [];
let filteredProducts = [];

// Hàm tiện ích: Chuyển đổi giá tiền từ chuỗi/số sang số nguyên để tính toán
const parsePrice = (p) => typeof p === 'number' ? p : parseInt(String(p).replace(/[^\d]/g, '')) || 0;

// Khởi tạo ứng dụng khi DOM đã sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    setupEventListeners();
    updateNavFavCount();
});

// Lấy danh sách sản phẩm từ Server
async function fetchProducts() {
    const countLabel = document.getElementById('productsCount');
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Network response was not ok');
        allProducts = await response.json();
        filteredProducts = [...allProducts];
        renderProducts(filteredProducts);
    } catch (error) {
        console.error("Error:", error);
        countLabel.textContent = "Failed to load products.";
    }
}

// Hiển thị danh sách sản phẩm ra màn hình
function renderProducts(products) {
    const grid = document.getElementById('productsGrid');
    const countLabel = document.getElementById('productsCount');
    const emptyState = document.getElementById('emptyState');
    const favorites = JSON.parse(localStorage.getItem('nike_favorites')) || [];

    grid.innerHTML = '';
    countLabel.textContent = `${products.length} Items Found`;

    if (products.length === 0) {
        grid.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }

    grid.classList.remove('hidden');
    emptyState.classList.add('hidden');

    products.forEach((product, index) => {
        // Kiểm tra trạng thái yêu thích
        const isFavorite = favorites.some(fav => String(fav.id) === String(product.id));
        const card = document.createElement('div');
        card.className = "product-card animate-fade-in group cursor-pointer";
        
        const priceDisplay = typeof product.price === 'number' 
            ? product.price.toLocaleString('vi-VN') + '₫' 
            : product.price;

        card.innerHTML = `
            <div class="relative bg-gray-50 rounded-2xl overflow-hidden mb-5 aspect-square transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-1">
                <img src="${product.image}" alt="${product.name}" class="w-full h-full object-contain p-6 transition-transform duration-700 group-hover:scale-110">
                <button class="fav-btn absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white hover:scale-110 transition-all z-10">
                    <svg class="h-5 w-5 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                    </svg>
                </button>
            </div>
            <div class="px-1">
                <h3 class="text-sm font-bold text-gray-900 mb-0.5 group-hover:text-gray-600 transition-colors">${product.name}</h3>
                <p class="text-gray-400 text-[11px] uppercase tracking-widest font-bold">${product.category}</p>
                <p class="text-sm font-black text-gray-900 mt-3">${priceDisplay}</p>
            </div>
        `;

        card.querySelector('.fav-btn').addEventListener('click', (e) => {
            e.preventDefault();
            toggleFavorite(product, e.currentTarget);
        });

        grid.appendChild(card);
    });
}

// Xử lý thêm/xóa sản phẩm khỏi danh sách yêu thích
function toggleFavorite(product, btn) {

    if(event) event.stopPropagation();

    // Gọi Auth trước khi thực hiện logic Like
    if (window.Auth) {
        window.Auth.requireAuth(() => {
            let favorites = JSON.parse(localStorage.getItem('nike_favorites')) || [];
            const index = favorites.findIndex(f => String(f.id) === String(product.id));
            const svg = btn.querySelector('svg');

            if (index === -1) {
                favorites.push(product);
                svg.classList.add('text-red-500', 'fill-current');
                svg.classList.remove('text-gray-400');
            } else {
                favorites.splice(index, 1);
                svg.classList.remove('text-red-500', 'fill-current');
                svg.classList.add('text-gray-400');
            }
            localStorage.setItem('nike_favorites', JSON.stringify(favorites));
            updateNavFavCount();
        });
    }
}

// Cập nhật số lượng yêu thích trên thanh Navigation
function updateNavFavCount() {
    const favorites = JSON.parse(localStorage.getItem('nike_favorites')) || [];
    const navFavCount = document.getElementById('navFavCount');
    if (navFavCount) {
        navFavCount.textContent = favorites.length;
        navFavCount.classList.toggle('opacity-0', favorites.length === 0);
        navFavCount.classList.toggle('opacity-100', favorites.length > 0);
    }
}

// Thiết lập các bộ lắng nghe sự kiện (Lọc & Sắp xếp)
function setupEventListeners() {
    // Xử lý các nút Lọc (All, Shoes, Apparel)
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => {
                b.classList.remove('bg-black', 'text-white');
                b.classList.add('bg-gray-50', 'text-gray-500');
            });
            btn.classList.remove('bg-gray-50', 'text-gray-500');
            btn.classList.add('bg-black', 'text-white');

            const filter = btn.dataset.filter;
            filteredProducts = filter === 'all' 
                ? [...allProducts] 
                : allProducts.filter(p => p.category.toLowerCase().includes(filter));
            renderProducts(filteredProducts);
        });
    });

    // Xử lý ô Sắp xếp
    document.getElementById('sortSelect').addEventListener('change', (e) => {
        const val = e.target.value;
        if (val === 'price-asc') {
            filteredProducts.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
        } else if (val === 'price-desc') {
            filteredProducts.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
        } else if (val === 'name-asc') {
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        }
        renderProducts(filteredProducts);
    });
}