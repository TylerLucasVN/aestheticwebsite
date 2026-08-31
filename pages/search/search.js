// --- CẤU HÌNH API ---
const API_URL = "https://694a5ba81282f890d2d86de0.mockapi.io/api/v1/products";

let products = [];
let currentFilters = {
    genders: [],
    tags: [],
    prices: [],
    sortBy: "featured",
    searchQuery: ""
};

// --- HÀM TIỆN ÍCH ---

function fetchProducts() {
    const productGrid = document.getElementById('productGrid');
    const resultsTitle = document.getElementById('resultsTitle');
    
    if(productGrid) productGrid.innerHTML = '<div class="col-span-full text-center py-20"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div><p class="mt-4 text-gray-500">Loading products...</p></div>';

    fetch(API_URL)
        .then(function(response) {
            if (!response.ok) throw new Error('Failed to fetch');
            return response.json();
        })
        .then(function(data) {
            products = data;
            applyFilters();
            updateNavCartCount();
            updateNavFavCount();
        })
        .catch(function(error) {
            console.error("Error loading products:", error);
            if(productGrid) productGrid.innerHTML = `<div class="col-span-full text-center py-20 text-red-500">Failed to load data. Please try again.</div>`;
            if(resultsTitle) resultsTitle.innerText = `Error`;
        });
}

// --- FAVORITES & CART LOGIC ---
function getFavorites() {
    return JSON.parse(localStorage.getItem('nike_favorites')) || [];
}

function getCart() {
    return JSON.parse(localStorage.getItem('nike_cart')) || [];
}

function updateNavFavCount() {
  const favorites = JSON.parse(localStorage.getItem("nike_favorites")) || [];
  const navFavCount = document.getElementById("navFavCount");
  if (!navFavCount) return;
  navFavCount.textContent = favorites.length;
  navFavCount.classList.toggle("opacity-0", favorites.length === 0);
  navFavCount.classList.toggle("opacity-100", favorites.length > 0);
}

function updateNavCartCount() {
    const cart = getCart();
    const navCartCount = document.getElementById("navCartCount");
    if (!navCartCount) return;

    const count = cart.length; 
    navCartCount.innerText = count;
    navCartCount.classList.toggle("opacity-0", count === 0);
    navCartCount.classList.toggle("opacity-100", count > 0);
}

// Global functions for HTML onclick
window.toggleLike = function(event, btn, productId) {
    event.preventDefault(); 
    event.stopPropagation();

    let favorites = getFavorites();
    const icon = btn.querySelector('svg');
    const product = products.find(p => String(p.id) === String(productId));
    const index = favorites.findIndex(f => String(f.id) === String(productId));

    if (index !== -1) {
        favorites.splice(index, 1);
        icon.classList.remove('text-red-500', 'fill-current');
        icon.classList.add('text-gray-500');
    } else {
        if(product) favorites.push(product);
        icon.classList.remove('text-gray-500');
        icon.classList.add('text-red-500', 'fill-current');
        // Animation click
        btn.classList.add('scale-110');
        setTimeout(() => btn.classList.remove('scale-110'), 200);
    }
    localStorage.setItem('nike_favorites', JSON.stringify(favorites));
}

// HÀM XỬ LÝ ADD TO CART (Đã sửa lỗi nhận sự kiện)
window.handleAddToCart = function(event, btn, productId) {
    // Ngăn chặn sự kiện click lan ra ngoài (để không mở trang chi tiết)
    event.preventDefault();
    event.stopPropagation();
    
    // Hiệu ứng nút bấm
    btn.classList.add('scale-90');
    setTimeout(() => btn.classList.remove('scale-90'), 150);

    let cart = getCart();
    // Tìm sản phẩm (chuyển ID về chuỗi để so sánh chính xác)
    const product = products.find(p => String(p.id) === String(productId));
    
    if(product) {
        cart.push(product);
        localStorage.setItem('nike_cart', JSON.stringify(cart));
        updateNavCartCount();
        
        // Gọi Modal hiển thị
        showCartModal(product);
    } else {
        console.error("Product not found:", productId);
    }
}

// --- MODAL LOGIC (Hiển thị bảng Added to Cart) ---
function showCartModal(product) {
    const modal = document.getElementById('cartModal');
    const backdrop = document.getElementById('cartModalBackdrop');
    const panel = document.getElementById('cartModalPanel');

    if(!modal) {
        console.error("Modal element not found in HTML");
        return;
    }

    // Điền dữ liệu vào Modal
    document.getElementById('modalImg').src = product.image;
    document.getElementById('modalName').innerText = product.name;
    document.getElementById('modalCategory').innerText = product.category;
    
    const tagEl = document.getElementById('modalTag');
    if (product.tag) {
        tagEl.innerText = product.tag;
        tagEl.classList.remove('hidden');
    } else {
        tagEl.classList.add('hidden');
    }

    // Hiển thị Modal (Xóa class hidden)
    modal.classList.remove('hidden');
    
    // Animation Fade In
    setTimeout(() => {
        backdrop.classList.remove('opacity-0');
        panel.classList.remove('opacity-0', 'scale-95');
        panel.classList.add('opacity-100', 'scale-100');
    }, 10);
}

window.closeCartModal = function() {
    const modal = document.getElementById('cartModal');
    const backdrop = document.getElementById('cartModalBackdrop');
    const panel = document.getElementById('cartModalPanel');

    // Animation Fade Out
    backdrop.classList.add('opacity-0');
    panel.classList.remove('opacity-100', 'scale-100');
    panel.classList.add('opacity-0', 'scale-95');

    // Ẩn modal sau khi animation chạy xong (300ms)
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

// --- RENDER & FILTERS ---
function parsePrice(price) {
    if (typeof price === 'number') return price;
    if (!price) return 0;
    return parseInt(price.replace(/[^\d]/g, '')) || 0;
}

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
        
        const priceDisplay = typeof product.price === 'number' 
            ? product.price.toLocaleString('vi-VN') + '₫' 
            : product.price;

        // FIX QUAN TRỌNG:
        // 1. Thêm event vào tham số đầu tiên: window.handleAddToCart(event, this, ...)
        // 2. Thêm dấu nháy đơn cho ID: '${product.id}' để tránh lỗi cú pháp nếu ID là chuỗi
        const html = `
            <div class="product-card group cursor-pointer relative transition-all duration-500 hover:-translate-y-1">
                <div class="relative">
                    <div class="card-img-wrap bg-[#f5f5f5] aspect-square mb-2 relative rounded-2xl overflow-hidden transition-all duration-500 group-hover:shadow-2xl">
                        <img src="${product.image}" alt="${product.name}" class="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110">
                        ${product.tag ? `<span class="absolute top-2 left-2 bg-white px-2 py-1 text-xs font-bold uppercase rounded z-10">${product.tag}</span>` : ''}
                    </div>

                    <button onclick="window.toggleLike(event, this, '${product.id}')" class="absolute top-2 right-2 bg-white p-2 rounded-full shadow-sm hover:bg-gray-100 transition-all z-50 opacity-100 md:opacity-0 md:group-hover:opacity-100 scale-100 hover:scale-110">
                        <svg class="w-5 h-5 ${heartClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                    </button>

                    <button onclick="window.handleAddToCart(event, this, '${product.id}')" class="absolute top-14 right-2 bg-white text-gray-900 p-2 rounded-full shadow-sm hover:bg-gray-100 transition-all z-50 opacity-100 md:opacity-0 md:group-hover:opacity-100 delay-75 scale-100 hover:scale-110" title="Add to Cart">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    </button>
                </div>
                
                <div class="px-1">
                    <h3 class="font-medium text-black text-base group-hover:text-gray-600 transition-colors">${product.name}</h3>
                    <p class="text-gray-500 text-sm">${product.category}</p>
                    <div class="mt-2 font-medium text-black">${priceDisplay}</div>
                </div>
            </div>
        `;
        productGrid.innerHTML += html;
    });
}

function applyFilters() {
    currentFilters.genders = Array.from(document.querySelectorAll('.filter-gender:checked')).map(cb => cb.value);
    currentFilters.tags = Array.from(document.querySelectorAll('.filter-tag:checked')).map(cb => cb.value);
    currentFilters.prices = Array.from(document.querySelectorAll('.filter-price:checked')).map(cb => cb.value);

    let filtered = products.filter(product => {
        if (currentFilters.searchQuery) {
            const query = currentFilters.searchQuery.toLowerCase();
            const productName = product.name ? product.name.toLowerCase() : "";
            const productCat = product.category ? product.category.toLowerCase() : "";
            if (!productName.includes(query) && !productCat.includes(query)) return false; 
        }
        if (currentFilters.genders.length > 0) {
            const category = product.category || "";
            if (!currentFilters.genders.some(selectedGender => category.includes(selectedGender))) return false;
        }
        if (currentFilters.tags.length > 0) {
            if (!product.tag || !currentFilters.tags.includes(product.tag)) return false;
        }
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

    if (currentFilters.sortBy === 'price-asc') filtered.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    else if (currentFilters.sortBy === 'price-desc') filtered.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
    else if (currentFilters.sortBy === 'newest') filtered.sort((a, b) => parseInt(b.id) - parseInt(a.id));

    renderProducts(filtered);
}

// --- XỬ LÝ SỰ KIỆN ---
window.handleSort = function(sortType) {
    currentFilters.sortBy = sortType;
    const mapName = { 'featured': 'Featured', 'newest': 'Newest', 'price-desc': 'Price: High-Low', 'price-asc': 'Price: Low-High' };
    const sortBtnText = document.getElementById('sortBtnText');
    if(sortBtnText) sortBtnText.innerText = mapName[sortType];
    
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
        filterSidebar.classList.add('mobile-open');
        overlay.classList.remove('hidden');
        setTimeout(() => overlay.classList.remove('opacity-0'), 10);
        body.style.overflow = 'hidden'; 
    } else {
        filterSidebar.classList.remove('mobile-open');
        overlay.classList.add('opacity-0');
        setTimeout(() => overlay.classList.add('hidden'), 300);
        body.style.overflow = ''; 
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const queryParam = urlParams.get('q');
    if (queryParam) currentFilters.searchQuery = decodeURIComponent(queryParam);

    const toggleFilterBtn = document.getElementById('toggleFilterBtn');
    const filterSidebar = document.getElementById('filterSidebar');
    const filterBtnText = document.getElementById('filterBtnText');
    const closeMobileFilterBtn = document.getElementById('closeMobileFilterBtn');
    const applyMobileFilterBtn = document.getElementById('applyMobileFilterBtn');
    const mobileOverlay = document.getElementById('mobileFilterOverlay');

    if (toggleFilterBtn) {
        toggleFilterBtn.addEventListener('click', () => {
            if (window.innerWidth < 768) {
                toggleMobileSidebar(true);
            } else {
                filterSidebar.classList.toggle('collapsed');
                filterBtnText.innerText = filterSidebar.classList.contains('collapsed') ? "Show Filters" : "Hide Filters";
            }
        });
    }

    if(closeMobileFilterBtn) closeMobileFilterBtn.addEventListener('click', () => toggleMobileSidebar(false));
    if(applyMobileFilterBtn) applyMobileFilterBtn.addEventListener('click', () => toggleMobileSidebar(false));
    if(mobileOverlay) mobileOverlay.addEventListener('click', () => toggleMobileSidebar(false));

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
    
    // Đóng Modal khi click ra ngoài vùng trắng
    const cartBackdrop = document.getElementById('cartModalBackdrop');
    if(cartBackdrop) cartBackdrop.addEventListener('click', window.closeCartModal);

    document.querySelectorAll('.custom-checkbox').forEach(cb => {
        cb.addEventListener('change', applyFilters);
    });

    fetchProducts();
});