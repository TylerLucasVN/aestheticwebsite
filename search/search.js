import { data } from '../mockupdata.js';
import { Auth } from '../auth/authOverlay.js';

// Khai báo products từ data import vào
const products = data;

// --- QUẢN LÝ TRẠNG THÁI (STATE) ---
let currentFilters = {
    genders: [],
    tags: [],   // Thêm filter tags
    prices: [],
    sortBy: "featured",
    searchQuery: ""
};

// --- HÀM TIỆN ÍCH ---

// Lấy danh sách yêu thích
function getFavorites() {
    return JSON.parse(localStorage.getItem('nike_favorites')) || []; // Sửa key cho khớp với phần trước
}

// Hàm Toggle Like (Gán vào window để HTML gọi được)
window.toggleLike = function(btn, productId) {
    if(event) event.stopPropagation();
    
    Auth.requireAuth(() => {
        let favorites = getFavorites();
        const icon = btn.querySelector('svg');
        // Tìm object sản phẩm trong data gốc
        const product = products.find(p => p.id === productId);

        const index = favorites.findIndex(f => f.id === productId);

        if (index !== -1) {
            // Đã like -> Xóa
            favorites.splice(index, 1);
            icon.classList.remove('text-red-500', 'fill-current'); // Dùng màu đỏ cho đồng bộ
            icon.classList.add('text-gray-500');
        } else {
            // Chưa like -> Thêm
            if(product) favorites.push(product);
            icon.classList.remove('text-gray-500');
            icon.classList.add('text-red-500', 'fill-current');
            btn.classList.add('scale-125');
            setTimeout(() => btn.classList.remove('scale-125'), 200);
        }
        localStorage.setItem('nike_favorites', JSON.stringify(favorites));
    });
}

// Chuyển đổi giá tiền từ string "3.209.000₫" sang số
function parsePrice(priceStr) {
    return parseInt(priceStr.replace(/[^\d]/g, ''));
}

// Hàm render sản phẩm
function renderProducts(items) {
    const productGrid = document.getElementById('productGrid');
    const resultsTitle = document.getElementById('resultsTitle');
    productGrid.innerHTML = '';

    if(currentFilters.searchQuery) {
        resultsTitle.innerHTML = `Search results for "<span class="font-bold text-black">${currentFilters.searchQuery}</span>" (${items.length})`;
    } else {
        resultsTitle.innerText = `All Products (${items.length})`;
    }

    if (items.length === 0) {
        productGrid.innerHTML = `<div class="col-span-full text-center py-20"><p class="text-xl text-gray-600">No products found.</p></div>`;
        if(resultsTitle) resultsTitle.innerText = `All Products (0)`;
        return;
    }

    const favorites = getFavorites();

    items.forEach(product => {
        const isLiked = favorites.some(f => f.id === product.id);
        const heartClass = isLiked ? 'text-red-500 fill-current' : 'text-gray-500';

        const html = `
            <div class="product-card group cursor-pointer relative">
                <div class="card-img-wrap bg-[#f5f5f5] aspect-square mb-2 relative rounded-lg overflow-hidden">
                    <img src="${product.image}" alt="${product.name}" class="w-full h-full object-contain mix-blend-multiply transition-opacity duration-300">
                    <button onclick="window.toggleLike(this, ${product.id})" class="absolute top-2 right-2 bg-white p-2 rounded-full shadow-sm hover:bg-gray-100 transition-all z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100">
                        <svg class="w-5 h-5 ${heartClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                    </button>
                    ${product.tag ? `<span class="absolute top-2 left-2 bg-white px-2 py-1 text-xs font-bold uppercase rounded">${product.tag}</span>` : ''}
                </div>
                <div class="px-1">
                    <h3 class="font-medium text-black text-base">${product.name}</h3>
                    <p class="text-gray-500 text-sm">${product.category}</p>
                    <div class="mt-2 font-medium text-black">${product.price}</div>
                </div>
            </div>
        `;
        productGrid.innerHTML += html;
    });
    if(resultsTitle) resultsTitle.innerText = `All Products (${items.length})`;
}

// --- LOGIC LỌC CHÍNH ---
function applyFilters() {
    // 1. Lấy giá trị input    
    currentFilters.genders = Array.from(document.querySelectorAll('.filter-gender:checked')).map(cb => cb.value);
    currentFilters.tags = Array.from(document.querySelectorAll('.filter-tag:checked')).map(cb => cb.value);
    currentFilters.prices = Array.from(document.querySelectorAll('.filter-price:checked')).map(cb => cb.value);

    // 2. Lọc
    let filtered = products.filter(product => {
        // Search Query
        if (currentFilters.searchQuery) {
            const query = currentFilters.searchQuery.toLowerCase();
            const productName = product.name.toLowerCase();
            // Có thể tìm theo tên hoặc category
            if (!productName.includes(query) && !product.category.toLowerCase().includes(query)) {
                return false; 
            }
        }

        // Gender (OR Logic: Sản phẩm thuộc 1 trong các giới tính đã chọn)
        if (currentFilters.genders.length > 0) {
            const category = product.category || "";
            const matchGender = currentFilters.genders.some(selectedGender => category.includes(selectedGender));
            if (!matchGender) return false;
        }

        // Tags (OR Logic: Sản phẩm có tag nằm trong các tag đã chọn)
        if (currentFilters.tags.length > 0) {
            if (!product.tag) return false; // Không có tag thì loại
            const matchTag = currentFilters.tags.includes(product.tag);
            if (!matchTag) return false;
        }

        // Price
        if (currentFilters.prices.length > 0) {
            const priceVal = parsePrice(product.price);
            let matchPrice = false;
            currentFilters.prices.forEach(range => {
                if (range === 'under2m' && priceVal < 2000000) matchPrice = true;
                if (range === '2m-5m' && priceVal >= 2000000 && priceVal <= 5000000) matchPrice = true;
                if (range === 'over5m' && priceVal > 5000000) matchPrice = true;
            });
            if (!matchPrice) return false;
        }

        return true;
    });

    // 3. Sort
    if (currentFilters.sortBy === 'price-asc') {
        filtered.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    } else if (currentFilters.sortBy === 'price-desc') {
        filtered.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
    } else if (currentFilters.sortBy === 'newest') {
        filtered.sort((a, b) => b.id - a.id);
    }

    renderProducts(filtered);
}

// --- XỬ LÝ SỰ KIỆN ---

// Hàm Sort (Gán vào window)
window.handleSort = function(sortType) {
    currentFilters.sortBy = sortType;
    const mapName = {
        'featured': 'Featured',
        'newest': 'Newest',
        'price-desc': 'Price: High-Low',
        'price-asc': 'Price: Low-High'
    };
    document.getElementById('sortBtnText').innerText = mapName[sortType];
    
    // Đóng menu sau khi chọn xong
    const sortMenu = document.getElementById('sortMenu');
    const sortIcon = document.getElementById('sortIcon');
    if(sortMenu) sortMenu.classList.add('hidden');
    if(sortIcon) sortIcon.classList.remove('rotate-180');

    applyFilters();
}

// INIT
document.addEventListener('DOMContentLoaded', () => {
    // --- XỬ LÝ LOGIC SORT DROPDOWN (Click để mở/đóng) ---
    const urlParams = new URLSearchParams(window.location.search);
    const queryParam = urlParams.get('q');
    const sortButton = document.getElementById('sortButton');
    const sortDropdown = document.getElementById('sortDropdown');
    const sortIcon = document.getElementById('sortIcon');

    // Nếu có query param thì gán vào bộ lọc
    if (queryParam) {
        currentFilters.searchQuery = queryParam;
    }

    if (sortButton && sortDropdown) {
        // Sự kiện click vào nút Sort By
        sortButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Ngăn chặn sự kiện click lan ra document
            sortDropdown.classList.toggle('hidden'); // Bật/tắt class hidden
            sortIcon.classList.toggle('rotate-180'); // Xoay icon
        });

        // Sự kiện click ra ngoài thì đóng menu
        document.addEventListener('click', (e) => {
            if (!sortButton.contains(e.target) && !sortDropdown.contains(e.target)) {
                sortDropdown.classList.add('hidden');
                sortIcon.classList.remove('rotate-180');
            }
        });
    }

    // Gán sự kiện cho tất cả Checkbox (Gender, Tag, Price)
    const allCheckboxes = document.querySelectorAll('.custom-checkbox');
    allCheckboxes.forEach(cb => {
        cb.addEventListener('change', applyFilters);
    });

    // Xử lý nút mở/đóng filter sidebar
    const toggleFilterBtn = document.getElementById('toggleFilterBtn');
    const filterSidebar = document.getElementById('filterSidebar');
    const filterBtnText = document.getElementById('filterBtnText');

    if (toggleFilterBtn && filterSidebar) {
        toggleFilterBtn.addEventListener('click', () => {
            filterSidebar.classList.toggle('collapsed');
            if (filterSidebar.classList.contains('collapsed')) {
                filterBtnText.innerText = "Show Filters";
            } else {
                filterBtnText.innerText = "Hide Filters";
            }
        });
    }
    // Xử lý nút mở/đóng sort menu
    const sortMenu = document.getElementById('sortMenu');
    const sortContainer = document.getElementById('sortContainer');

    if (sortButton && sortMenu) {
        // Nhấn nút thì toggle ẩn/hiện
        sortButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Ngăn sự kiện nổi bọt
            sortMenu.classList.toggle('hidden');
            if(sortIcon) sortIcon.classList.toggle('rotate-180'); // Xoay mũi tên
        });

        // Nhấn ra ngoài thì đóng menu
        document.addEventListener('click', (e) => {
            if (!sortContainer.contains(e.target)) {
                sortMenu.classList.add('hidden');
                if(sortIcon) sortIcon.classList.remove('rotate-180');
            }
        });
    }

    // Render lần đầu
    applyFilters();
});