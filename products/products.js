// =======================
// 1. API & GLOBAL VARIABLES
// =======================
const API_URL = "https://694a5ba81282f890d2d86de0.mockapi.io/api/v1/products";

let allProducts = [];
let currentCategoryList = [];
let displayedProducts = [];

// =======================
// 2. INIT APP
// =======================
document.addEventListener("DOMContentLoaded", () => {
    fetchProducts();
    setupEventListeners();
    updateNavCartCount(); // Fix lỗi hiển thị số lượng khi vừa vào trang
    updateNavFavCount();
});

// =======================
// 3. FETCH & FILTER DATA
// =======================
async function fetchProducts() {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Fetch failed");
        allProducts = await res.json();

        const urlParams = new URLSearchParams(window.location.search);
        const categoryParam = urlParams.get('category'); // men, women, sale...

        // --- LỌC THEO CATEGORY TỪ URL ---
        if (categoryParam) {
            const searchCat = categoryParam.toLowerCase().trim();
            console.log("--> Đang lọc URL Category:", searchCat);

            currentCategoryList = allProducts.filter(p => {
                // Chuẩn hóa dữ liệu từ API để tránh lỗi null/undefined
                const pCat = p.category ? p.category.toLowerCase() : "";
                const pTag = p.tag ? String(p.tag).toLowerCase() : ""; // Lấy trường "tag" từ JSON

                // === FIX LỖI SALE TẠI ĐÂY ===
                if (searchCat === 'sale') {
                    // Chỉ lấy sản phẩm nào có "tag": "sale"
                    return pTag === 'sale';
                }
                
                // === CÁC TRƯỜNG HỢP KHÁC ===
                
                // Xử lý 'men' để không dính 'women'
                if (searchCat === 'men') {
                    return pCat.includes('men') && !pCat.includes('women');
                }

                // Các trường hợp còn lại (Women, Kids...) lọc theo tên category
                return pCat.includes(searchCat);
            });

            updateTitle(categoryParam);
        } else {
            currentCategoryList = [...allProducts];
            updateTitle("All Products");
        }

        displayedProducts = [...currentCategoryList];
        highlightActiveLink(categoryParam || 'all');
        renderProducts(displayedProducts);

    } catch (err) {
        console.error(err);
        document.getElementById("productsCount").textContent = "Failed to load products";
    }
}

// =======================
// 4. UI LOGIC & HELPER
// =======================
function updateTitle(text) {
    const title = document.querySelector('h1');
    if (title) title.textContent = text.toUpperCase();
}

function highlightActiveLink(activeCategory) {
    const links = document.querySelectorAll('.nav-link'); // Bạn cần thêm class nav-link vào thẻ a ở HTML
    
    // Fallback: Nếu HTML chưa có class nav-link, tìm theo text
    const allLinks = document.querySelectorAll('nav a');
    
    allLinks.forEach(link => {
        // Reset style
        link.classList.remove('font-bold', 'underline', 'text-black', 'decoration-2', 'underline-offset-4');
        link.classList.add('text-gray-800');

        // Logic highlight
        const href = link.getAttribute('href') || "";
        const text = link.textContent.trim().toLowerCase();
        
        // Kiểm tra URL hoặc Text để active đúng
        if (href.includes(`category=${activeCategory}`) || text === activeCategory) {
            link.classList.remove('text-gray-800');
            link.classList.add('font-bold', 'underline', 'text-black', 'decoration-2', 'underline-offset-4');
        }
    });
}

// FIX LỖI NAN: Tính tổng dựa trên thuộc tính quantity
function updateNavCartCount() {
    const cart = JSON.parse(localStorage.getItem("nike_cart")) || [];
    const navCartCount = document.getElementById("navCartCount");
    
    // Tính tổng số lượng item (quantity) thay vì độ dài mảng
    const totalItems = cart.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0);

    if (navCartCount) {
        navCartCount.textContent = totalItems; // Sẽ hiện số, không hiện NaN nữa
        navCartCount.classList.toggle("opacity-0", totalItems === 0);
        navCartCount.classList.toggle("opacity-100", totalItems > 0);
    }
}

// =======================
// 5. RENDER PRODUCTS
// =======================
function renderProducts(products) {
    const grid = document.getElementById("productsGrid");
    const countLabel = document.getElementById("productsCount");
    const emptyState = document.getElementById("emptyState");
    const favorites = JSON.parse(localStorage.getItem("nike_favorites")) || [];

    grid.innerHTML = "";
    countLabel.textContent = `${products.length} Items Found`;

    if (products.length === 0) {
        grid.classList.add("hidden");
        emptyState.classList.remove("hidden");
        return;
    }
    grid.classList.remove("hidden");
    emptyState.classList.add("hidden");

    products.forEach(product => {
        const isFavorite = favorites.some(f => String(f.id) === String(product.id));
        const priceDisplay = typeof product.price === "number" 
            ? product.price.toLocaleString("vi-VN") + "₫" 
            : product.price;

        const card = document.createElement("div");
        card.className = "product-card animate-fade-in group relative cursor-pointer";

        card.innerHTML = `
            <div class="relative bg-gray-50 rounded-2xl overflow-hidden mb-4 aspect-square">
                <img src="${product.image}" alt="${product.name}" 
                     class="w-full h-full object-contain p-6 transition-transform duration-700 group-hover:scale-110 mix-blend-multiply">
                
                <button class="fav-btn absolute top-4 right-4 p-2 bg-white rounded-full shadow hover:scale-110 transition-transform z-10">
                    <svg class="h-5 w-5 ${isFavorite ? "text-red-500 fill-current" : "text-gray-400"}" 
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                    </svg>
                </button>

                <button class="add-cart-btn absolute bottom-4 right-4 bg-black text-white p-3 rounded-full opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-lg hover:bg-gray-800">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                </button>
            </div>
            <div>
                <h3 class="font-bold text-gray-900 text-sm leading-tight mb-1 group-hover:text-gray-600 transition-colors">${product.name}</h3>
                <p class="text-gray-500 text-xs mb-2">${product.category}</p>
                <p class="font-bold text-gray-900">${priceDisplay}</p>
            </div>
        `;

        card.querySelector(".fav-btn").addEventListener("click", (e) => {
            e.stopPropagation();
            toggleFavorite(product, e.currentTarget);
        });

        card.querySelector(".add-cart-btn").addEventListener("click", (e) => {
            e.stopPropagation();
            addToCart(product);
        });

        grid.appendChild(card);
    });
}

// =======================
// 6. CART & FAVORITE ACTIONS
// =======================
function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem("nike_cart")) || [];
    
    // Kiểm tra xem sản phẩm đã có chưa
    const existingItem = cart.find(item => String(item.id) === String(product.id));

    if (existingItem) {
        existingItem.quantity = (parseInt(existingItem.quantity) || 1) + 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem("nike_cart", JSON.stringify(cart));
    updateNavCartCount();
    
    // Mở Modal (Nếu bạn có code Modal ở HTML)
    if(typeof openCartModal === 'function') openCartModal(product);
    else alert("Added to Bag!");
}

function toggleFavorite(product, btn) {
    let favorites = JSON.parse(localStorage.getItem("nike_favorites")) || [];
    const index = favorites.findIndex(f => String(f.id) === String(product.id));
    const svg = btn.querySelector("svg");

    if (index === -1) {
        favorites.push(product);
        svg.classList.add("text-red-500", "fill-current");
        svg.classList.remove("text-gray-400");
    } else {
        favorites.splice(index, 1);
        svg.classList.remove("text-red-500", "fill-current");
        svg.classList.add("text-gray-400");
    }
    localStorage.setItem("nike_favorites", JSON.stringify(favorites));
    updateNavFavCount();
}

function updateNavFavCount() {
    const favorites = JSON.parse(localStorage.getItem("nike_favorites")) || [];
    const navFavCount = document.getElementById("navFavCount");
    if (navFavCount) {
        navFavCount.textContent = favorites.length;
        navFavCount.classList.toggle("opacity-0", favorites.length === 0);
        navFavCount.classList.toggle("opacity-100", favorites.length > 0);
    }
}

// =======================
// 7. EVENT LISTENERS
// =======================
function setupEventListeners() {
    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".filter-btn").forEach(b => {
                b.classList.remove("bg-black", "text-white");
                b.classList.add("bg-gray-50", "text-gray-500");
            });
            btn.classList.add("bg-black", "text-white");
            btn.classList.remove("bg-gray-50", "text-gray-500");

            const filterType = btn.dataset.filter;
            if (filterType === "all") {
                displayedProducts = [...currentCategoryList];
            } else {
                displayedProducts = currentCategoryList.filter(p => 
                    p.category.toLowerCase().includes(filterType)
                );
            }
            renderProducts(displayedProducts);
        });
    });

    const sortSelect = document.getElementById("sortSelect");
    if (sortSelect) {
        sortSelect.addEventListener("change", (e) => {
            const value = e.target.value;
            let sorted = [...displayedProducts];
            if (value === "price-asc") sorted.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
            if (value === "price-desc") sorted.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
            if (value === "name-asc") sorted.sort((a, b) => a.name.localeCompare(b.name));
            renderProducts(sorted);
        });
    }
}

function parsePrice(price) {
    if (typeof price === "number") return price;
    return parseInt(String(price).replace(/[^\d]/g, "")) || 0;
}