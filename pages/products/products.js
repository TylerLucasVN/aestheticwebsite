// =======================
// 1. API & GLOBAL VARIABLES
// =======================
const API_URL = "https://694a5ba81282f890d2d86de0.mockapi.io/api/v1/products";

let allProducts = [];
let currentCategoryList = [];
let displayedProducts = [];

// Biến lưu trạng thái cho Quick Modal
let activeQuickProduct = null;
let selectedQuickSize = null;
let currentQuickQty = 1;

// =======================
// 2. INIT APP
// =======================
document.addEventListener("DOMContentLoaded", () => {
    fetchProducts();
    setupEventListeners();
    updateNavCartCount();
    updateNavFavCount();
});

// =======================
// 3. FETCH & FILTER DATA
// =======================
async function fetchProducts() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const categoryParam = urlParams.get('category');

        setActiveCategoryNav(categoryParam || 'all');

        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Fetch failed");
        allProducts = await res.json();

        if (categoryParam) {
            const searchCat = categoryParam.toLowerCase().trim();
            currentCategoryList = allProducts.filter(p => {
                const pCat = p.category ? p.category.toLowerCase() : "";
                const pTag = p.tag ? String(p.tag).toLowerCase() : "";

                if (searchCat === 'sale') return pTag === 'sale';
                if (searchCat === 'men') return pCat.includes('men') && !pCat.includes('women');
                return pCat.includes(searchCat);
            });
            updateTitle(categoryParam);
        } else {
            currentCategoryList = [...allProducts];
            updateTitle("All Products");
        }

        displayedProducts = [...currentCategoryList];
        renderProducts(displayedProducts);

    } catch (err) {
        console.error(err);
        document.getElementById("productsCount").textContent = "Failed to load products";
    }
}

// =======================
// 4. UI HELPERS (Nav & Title)
// =======================
function updateTitle(text) {
    const title = document.querySelector('h1');
    if (title) title.textContent = text.toUpperCase();
}

function setActiveCategoryNav(activeCategory) {
    const normalized = activeCategory ? activeCategory.toLowerCase() : 'all';
    const links = document.querySelectorAll("nav a");

    links.forEach(link => {
        const linkCat = link.dataset.category ? link.dataset.category.toLowerCase() : '';
        const linkHref = link.getAttribute('href') || '';
        const linkText = link.textContent.trim().toLowerCase();

        let isActive = false;
        if (linkCat === normalized || linkHref.includes(`category=${normalized}`) || linkText === normalized) {
            isActive = true;
        } else if (normalized === 'all' && !linkHref.includes('category=') && (linkText === 'all' || linkText.includes('new'))) {
            isActive = true;
        }

        if (isActive) {
            link.classList.add("text-black", "font-bold", "underline", "decoration-2", "underline-offset-4");
            link.classList.remove("text-gray-800", "font-medium");
        } else {
            link.classList.remove("text-black", "font-bold", "underline", "decoration-2", "underline-offset-4");
            link.classList.add("text-gray-800", "font-medium");
        }
    });
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
                <!-- Hiển thị ảnh sản phẩm -->
                <img src="${product.image}" alt="${product.name}" 
                     class="w-full h-full object-contain p-6 transition-transform duration-700 group-hover:scale-110 mix-blend-multiply">
                
                <!-- 👉 BỔ SUNG: Hiển thị nhãn TAG (SALE, TRENDING,...) nếu sản phẩm có -->
                ${product.tag ? `<span class="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold uppercase rounded tracking-wider shadow-sm z-10">${product.tag}</span>` : ''}
                
                <button class="fav-btn absolute top-4 right-4 p-2 bg-white rounded-full shadow hover:scale-110 transition-transform z-10">
                    <svg class="h-5 w-5 ${isFavorite ? "text-red-500 fill-current" : "text-gray-400"}" 
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                    </svg>
                </button>

                <button class="add-cart-btn absolute bottom-4 right-4 bg-black text-white p-3 rounded-full opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-lg hover:bg-gray-800" title="Quick Add">
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

        card.addEventListener('click', () => {
            localStorage.setItem('nike_selected_product', JSON.stringify(product));
            window.location.href = `../detail/detail.html?id=${product.id}`;
        });

        card.querySelector(".fav-btn").addEventListener("click", (e) => {
            e.stopPropagation();
            toggleFavorite(product, e.currentTarget);
        });

        card.querySelector(".add-cart-btn").addEventListener("click", (e) => {
            e.stopPropagation();
            openQuickSizeModal(product);
        });

        grid.appendChild(card);
    });
}
// =======================
// 6. QUICK SIZE & QUANTITY MODAL LOGIC
// =======================
function openQuickSizeModal(product) {
    activeQuickProduct = product;
    selectedQuickSize = null;
    currentQuickQty = 1;

    document.getElementById("quickModalImg").src = product.image;
    document.getElementById("quickModalName").textContent = product.name;
    document.getElementById("quickModalCategory").textContent = product.category;
    document.getElementById("quickModalPrice").textContent = typeof product.price === "number" ? product.price.toLocaleString("vi-VN") + "₫" : product.price;
    document.getElementById("quickQtyDisplay").textContent = currentQuickQty;
    document.getElementById("quickSizeError").classList.add("hidden");

    // Render danh sách size động từ sản phẩm
    const sizeContainer = document.getElementById("quickSizeContainer");
    sizeContainer.innerHTML = "";

    const availableSizes = product.sizes && product.sizes.length > 0
        ? product.sizes
        : ["EU 40", "EU 41", "EU 42", "EU 43"];

    availableSizes.forEach(sizeStr => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = sizeStr;
        btn.className = "border border-gray-300 rounded-xl py-2.5 text-xs font-bold text-center hover:border-black transition-all";

        btn.addEventListener('click', () => {
            document.querySelectorAll("#quickSizeContainer button").forEach(b => {
                b.classList.remove("border-black", "bg-black", "text-white", "ring-1", "ring-black");
                b.classList.add("border-gray-300");
            });
            btn.classList.remove("border-gray-300");
            btn.classList.add("border-black", "bg-black", "text-white", "ring-1", "ring-black");
            selectedQuickSize = sizeStr;
            document.getElementById("quickSizeError").classList.add("hidden");
        });

        sizeContainer.appendChild(btn);
    });

    // Hiển thị modal
    const modal = document.getElementById("quickSizeModal");
    const backdrop = document.getElementById("quickModalBackdrop");
    const panel = document.getElementById("quickModalPanel");

    modal.classList.remove("hidden");
    setTimeout(() => {
        backdrop.classList.add("opacity-100");
        panel.classList.remove("opacity-0", "scale-95");
        panel.classList.add("opacity-100", "scale-100");
    }, 10);
}

window.adjustQuickQty = function (change) {
    currentQuickQty += change;
    if (currentQuickQty < 1) currentQuickQty = 1;
    document.getElementById("quickQtyDisplay").textContent = currentQuickQty;
}

window.closeQuickSizeModal = function () {
    const modal = document.getElementById("quickSizeModal");
    const backdrop = document.getElementById("quickModalBackdrop");
    const panel = document.getElementById("quickModalPanel");

    if (!modal) return;
    backdrop.classList.remove("opacity-100");
    panel.classList.remove("opacity-100", "scale-100");
    panel.classList.add("opacity-0", "scale-95");

    setTimeout(() => {
        modal.classList.add("hidden");
    }, 300);
}

// Xử lý nút Add to Bag trong Quick Modal
document.getElementById("confirmQuickAdd").onclick = () => {
    if (!selectedQuickSize) {
        document.getElementById("quickSizeError").classList.remove("hidden");
        return;
    }

    let cart = JSON.parse(localStorage.getItem("nike_cart")) || [];
    const existingItem = cart.find(item => String(item.id) === String(activeQuickProduct.id) && item.size === selectedQuickSize);

    if (existingItem) {
        existingItem.quantity = (parseInt(existingItem.quantity) || 1) + currentQuickQty;
    } else {
        cart.push({ ...activeQuickProduct, size: selectedQuickSize, quantity: currentQuickQty });
    }

    localStorage.setItem("nike_cart", JSON.stringify(cart));
    updateNavCartCount();
    closeQuickSizeModal();

    // Mở popup xác nhận thành công (cartModal cũ của bạn)
    openCartModal(activeQuickProduct);
};

// =======================
// 7. SUCCESS MODAL & CART COUNT
// =======================
function updateNavCartCount() {
    const cart = JSON.parse(localStorage.getItem("nike_cart")) || [];
    const navCartCount = document.getElementById("navCartCount");
    const totalItems = cart.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0);

    if (navCartCount) {
        navCartCount.textContent = totalItems;
        navCartCount.classList.toggle("opacity-0", totalItems === 0);
        navCartCount.classList.toggle("opacity-100", totalItems > 0);
    }
}

function openCartModal(product) {
    const modal = document.getElementById("cartModal");
    const backdrop = document.getElementById("cartModalBackdrop");
    const panel = document.getElementById("cartModalPanel");

    if (!modal) return;

    document.getElementById("modalImg").src = product.image;
    document.getElementById("modalName").textContent = product.name;
    document.getElementById("modalCategory").textContent = product.category;

    const price = typeof product.price === "number" ? product.price.toLocaleString("vi-VN") + "₫" : product.price;
    document.getElementById("modalTag").textContent = price;

    modal.classList.remove("hidden");
    setTimeout(() => {
        backdrop.classList.add("opacity-100");
        panel.classList.remove("opacity-0", "scale-95");
        panel.classList.add("opacity-100", "scale-100");
    }, 10);
}

window.closeCartModal = function () {
    const modal = document.getElementById("cartModal");
    const backdrop = document.getElementById("cartModalBackdrop");
    const panel = document.getElementById("cartModalPanel");

    if (!modal) return;

    backdrop.classList.remove("opacity-100");
    panel.classList.remove("opacity-100", "scale-100");
    panel.classList.add("opacity-0", "scale-95");

    setTimeout(() => {
        modal.classList.add("hidden");
    }, 300);
}

// =======================
// 8. FAVORITE LOGIC
// =======================
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
// 9. EVENT LISTENERS
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