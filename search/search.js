// --- CẤU HÌNH API ---
const API_URL = "https://694a5ba81282f890d2d86de0.mockapi.io/api/v1/products";

// Biến lưu trữ sản phẩm (sẽ được fetch từ API)
let products = [];

// --- QUẢN LÝ TRẠNG THÁI (STATE) ---
let currentFilters = {
    genders: [],
    tags: [],
    prices: [],
    sortBy: "featured",
    searchQuery: ""
};

// --- HÀM TIỆN ÍCH ---

// Hàm lấy dữ liệu từ API
async function fetchProducts() {
    const productGrid = document.getElementById('productGrid');
    const resultsTitle = document.getElementById('resultsTitle');
    
    // Hiển thị loading
    if(productGrid) productGrid.innerHTML = '<div class="col-span-full text-center py-20"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div><p class="mt-4 text-gray-500">Loading products...</p></div>';

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch');
        products = await response.json();
        
        // Sau khi có dữ liệu, áp dụng bộ lọc ngay lập tức
        applyFilters();
    } catch (error) {
        console.error("Error loading products:", error);
        if(productGrid) productGrid.innerHTML = `<div class="col-span-full text-center py-20 text-red-500">Failed to load data. Please try again.</div>`;
        if(resultsTitle) resultsTitle.innerText = `Error`;
    }
}

// Lấy danh sách yêu thích
function getFavorites() {
    return JSON.parse(localStorage.getItem('nike_favorites')) || [];
}

// Hàm Toggle Like (Gán vào window để HTML gọi được)
window.toggleLike = function(btn, productId) {
    if(event) event.stopPropagation();

    let favorites = getFavorites();
    const icon = btn.querySelector('svg');
    // Tìm object sản phẩm trong data gốc
    // Lưu ý: MockAPI ID thường là string, so sánh lỏng (==) hoặc ép kiểu
    const product = products.find(p => String(p.id) === String(productId));
    const index = favorites.findIndex(f => String(f.id) === String(productId));

    if (index !== -1) {
        // Đã like -> Xóa
        favorites.splice(index, 1);
        icon.classList.remove('text-red-500', 'fill-current');
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
}

// Chuyển đổi giá tiền từ string hoặc number sang số nguyên để so sánh
function parsePrice(price) {
    if (typeof price === 'number') return price;
    if (!price) return 0;
    return parseInt(price.replace(/[^\d]/g, '')) || 0;
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
        const isLiked = favorites.some(f => String(f.id) === String(product.id));
        const heartClass = isLiked ? 'text-red-500 fill-current' : 'text-gray-500';
        
        // Xử lý hiển thị giá (nếu API trả về số thì format lại)
        const priceDisplay = typeof product.price === 'number' 
            ? product.price.toLocaleString('vi-VN') + '₫' 
            : product.price;

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
                    <div class="mt-2 font-medium text-black">${priceDisplay}</div>
                </div>
            </div>
        `;
        productGrid.innerHTML += html;
    });
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
            const productName = product.name ? product.name.toLowerCase() : "";
            const productCat = product.category ? product.category.toLowerCase() : "";
            
            if (!productName.includes(query) && !productCat.includes(query)) {
                return false; 
            }
        }

        // Gender (So sánh chuỗi trong category)
        if (currentFilters.genders.length > 0) {
            const category = product.category || "";
            const matchGender = currentFilters.genders.some(selectedGender => category.includes(selectedGender));
            if (!matchGender) return false;
        }

        // Tags
        if (currentFilters.tags.length > 0) {
            if (!product.tag) return false;
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
        filtered.sort((a, b) => parseInt(b.id) - parseInt(a.id));
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
    const sortBtnText = document.getElementById('sortBtnText');
    if(sortBtnText) sortBtnText.innerText = mapName[sortType];
    
    // Đóng menu sau khi chọn xong
    const sortMenu = document.getElementById('sortMenu');
    const sortIcon = document.getElementById('sortIcon');
    if(sortMenu) sortMenu.classList.add('hidden');
    if(sortIcon) sortIcon.classList.remove('rotate-180');

    applyFilters();
}

function toggleMobileSidebar(show) {
    const filterSidebar = document.getElementById('filterSidebar');
    const overlay = document.getElementById('mobileFilterOverlay');
    const body = document.body;

    if (show) {
        // Mở Sidebar
        filterSidebar.classList.add('mobile-open');
        overlay.classList.remove('hidden');
        setTimeout(() => overlay.classList.remove('opacity-0'), 10);
        body.style.overflow = 'hidden'; // Khóa cuộn trang
    } else {
        // Đóng Sidebar
        filterSidebar.classList.remove('mobile-open');
        overlay.classList.add('opacity-0');
        setTimeout(() => overlay.classList.add('hidden'), 300);
        body.style.overflow = ''; // Mở cuộn
    }
}

// INIT
document.addEventListener('DOMContentLoaded', () => {
    // --- XỬ LÝ LOGIC SORT DROPDOWN ---
    const urlParams = new URLSearchParams(window.location.search);
    const queryParam = urlParams.get('q');
    
    // Nếu có query param từ URL, gán vào bộ lọc
    if (queryParam) {
        currentFilters.searchQuery = decodeURIComponent(queryParam);
    }

    const toggleFilterBtn = document.getElementById('toggleFilterBtn');
    const filterSidebar = document.getElementById('filterSidebar');
    const filterBtnText = document.getElementById('filterBtnText');
    const closeMobileFilterBtn = document.getElementById('closeMobileFilterBtn');
    const applyMobileFilterBtn = document.getElementById('applyMobileFilterBtn');
    const mobileOverlay = document.getElementById('mobileFilterOverlay');

    // --- SỰ KIỆN TOGGLE BỘ LỌC (Desktop & Mobile) ---
    if (toggleFilterBtn) {
        toggleFilterBtn.addEventListener('click', () => {
            if (window.innerWidth < 768) {
                // Mobile: Mở Off-canvas
                toggleMobileSidebar(true);
            } else {
                // Desktop: Collapse/Expand
                filterSidebar.classList.toggle('collapsed');
                filterBtnText.innerText = filterSidebar.classList.contains('collapsed') ? "Show Filters" : "Hide Filters";
            }
        });
    }

    // Sự kiện đóng Mobile Sidebar
    if(closeMobileFilterBtn) closeMobileFilterBtn.addEventListener('click', () => toggleMobileSidebar(false));
    if(applyMobileFilterBtn) applyMobileFilterBtn.addEventListener('click', () => toggleMobileSidebar(false));
    if(mobileOverlay) mobileOverlay.addEventListener('click', () => toggleMobileSidebar(false));

    // Sort Dropdown Logic
    const sortButton = document.getElementById('sortButton');
    const sortMenu = document.getElementById('sortMenu');
    const sortContainer = document.getElementById('sortContainer');
    const sortIcon = document.getElementById('sortIcon');

    if (sortButton && sortMenu) {
        sortButton.addEventListener('click', (e) => {
            e.stopPropagation();
            sortMenu.classList.toggle('hidden');
            if(sortIcon) sortIcon.classList.toggle('rotate-180');
        });
        document.addEventListener('click', (e) => {
            if (!sortContainer.contains(e.target)) {
                sortMenu.classList.add('hidden');
                if(sortIcon) sortIcon.classList.remove('rotate-180');
            }
        });
    }

    // Checkbox Listeners
    document.querySelectorAll('.custom-checkbox').forEach(cb => {
        cb.addEventListener('change', applyFilters);
    });

    // Start
    fetchProducts();
});