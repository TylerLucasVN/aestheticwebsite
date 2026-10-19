const API_URL = "http://localhost:5000/api/v1/products";
let selectedSize = null; // Biến lưu trạng thái size

document.addEventListener("DOMContentLoaded", () => {
    loadProductDetail();
    updateNavCounts();
    setupDrawerEvents(); // Khởi tạo sự kiện đóng/mở popup drawer
});

async function loadProductDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        alert("Product not found!");
        window.location.href = "../../index.html";
        return;
    }

    let product = null;

    try {
        // 1. Lấy từ Cache
        const cachedProduct = localStorage.getItem('nike_selected_product');
        if (cachedProduct) {
            const parsed = JSON.parse(cachedProduct);
            const cachedId = parsed.id || parsed._id;
            if (String(cachedId) === String(productId) || String(parsed.id) === String(productId) || String(parsed._id) === String(productId)) {
                product = parsed;
            }
        }

        // 2. Fallback gọi API 
        if (!product) {
            const res = await fetch(`${API_URL}/${productId}`);
            if (!res.ok) {
                const resAll = await fetch(API_URL);
                if (!resAll.ok) throw new Error("Failed to fetch products list");
                const products = await resAll.json();
                product = products.find(p => String(p.id) === String(productId) || String(p._id) === String(productId));
            } else {
                product = await res.json();
            }
        }

        if (!product) {
            throw new Error("Product does not exist in database");
        }

        renderDetail(product);

    } catch (error) {
        console.error("Detailed Error occurred:", error);
        alert("Error loading product detail: " + error.message);
        window.location.href = "../products/products.html";
    }
}

function renderDetail(product) {
    document.getElementById('loadingState').classList.add('hidden');
    document.getElementById('productContainer').classList.remove('hidden');

    document.getElementById('detailImage').src = product.image;
    document.getElementById('detailName').textContent = product.name;
    document.getElementById('detailCategory').textContent = product.category;

    const priceDisplay = typeof product.price === "number"
        ? product.price.toLocaleString("vi-VN") + "₫"
        : product.price;
    document.getElementById('detailPrice').textContent = priceDisplay;

    const defaultDesc = "The radiance lives on in the classic construction, pairing premium materials for timeless style.";
    document.getElementById('detailDesc').textContent = product.description || defaultDesc;

    // Gọi hàm vẽ các nút chọn Size từ DB
    renderSizeOptions(product);

    checkFavoriteStatus(product.id);

    // Gắn sự kiện nút bấm: Bắt buộc chọn size
    document.getElementById('btnAddToCart').onclick = () => {
        if (!selectedSize) {
            document.getElementById('sizeError').classList.remove('hidden');
            return;
        }
        addToCart(product, selectedSize);
    };

    document.getElementById('btnFavorite').onclick = () => toggleFavorite(product);
}

// Hàm render Size tự động
function renderSizeOptions(product) {
    const sizeContainer = document.getElementById('sizeContainer');
    sizeContainer.innerHTML = "";
    selectedSize = null; // Reset size mỗi khi load sản phẩm mới

    // Lấy mảng sizes từ DB, nếu thiếu thì dùng mảng dự phòng
    const availableSizes = product.sizes && product.sizes.length > 0
        ? product.sizes
        : ["EU 40", "EU 41", "EU 42", "EU 43"];

    availableSizes.forEach(sizeString => {
        const btn = document.createElement('button');
        btn.type = "button";
        btn.textContent = sizeString;
        btn.className = "size-btn border border-gray-300 rounded-md py-3 text-center font-medium hover:border-black transition-all";

        // Khi click vào nút Size
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.size-btn').forEach(b => {
                b.classList.remove('border-black', 'bg-black', 'text-white', 'ring-1', 'ring-black');
                b.classList.add('border-gray-300');
            });

            const clickedBtn = e.currentTarget;
            clickedBtn.classList.remove('border-gray-300');
            clickedBtn.classList.add('border-black', 'bg-black', 'text-white', 'ring-1', 'ring-black');

            selectedSize = sizeString;
            document.getElementById('sizeError').classList.add('hidden'); // Tắt thông báo lỗi
        });

        sizeContainer.appendChild(btn);
    });
}

// Hàm Add to Cart kết hợp Popup Drawer
function addToCart(product, size) {
    let cart = JSON.parse(localStorage.getItem("nike_cart")) || [];

    // Kiểm tra trùng ID VÀ trùng cả Size
    const existingItem = cart.find(item => String(item.id) === String(product.id) && item.size === size);

    if (existingItem) {
        existingItem.quantity = (parseInt(existingItem.quantity) || 1) + 1;
    } else {
        cart.push({ ...product, size: size, quantity: 1 });
    }

    localStorage.setItem("nike_cart", JSON.stringify(cart));
    updateNavCounts();

    // Hiệu ứng đổi màu nút đồng thời gọi Popup trượt ra
    const btn = document.getElementById('btnAddToCart');
    const originalText = btn.textContent;
    btn.textContent = `Added (${size}) ✓`;
    btn.classList.add('bg-green-600');
    setTimeout(() => {
        btn.textContent = originalText;
        btn.classList.remove('bg-green-600');
    }, 2000);

    // Kích hoạt hiển thị popup drawer bên phải
    openCartDrawer(product, size);
}

// --- POPUP DRAWER LOGIC ---
function openCartDrawer(product, size) {
    const drawer = document.getElementById('cartDrawer');
    if (!drawer) return; // Đảm bảo HTML đã có phần drawer này

    const backdrop = document.getElementById('drawerBackdrop');
    const panel = document.getElementById('drawerPanel');

    // Đổ dữ liệu sản phẩm vừa add vào drawer
    document.getElementById('drawerItemImg').src = product.image;
    document.getElementById('drawerItemName').textContent = product.name;
    document.getElementById('drawerItemCategory').textContent = product.category;
    document.getElementById('drawerItemSize').textContent = size;

    const priceDisplay = typeof product.price === "number"
        ? product.price.toLocaleString("vi-VN") + "₫"
        : product.price;
    document.getElementById('drawerItemPrice').textContent = priceDisplay;

    // Cập nhật tổng số lượng trong giỏ
    const cart = JSON.parse(localStorage.getItem("nike_cart")) || [];
    const totalItems = cart.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0);
    document.getElementById('drawerTotalItems').textContent = totalItems;
    document.getElementById('drawerBagCount').textContent = totalItems;

    // Hiện Drawer với hiệu ứng trượt mượt mà
    drawer.classList.remove('hidden');
    setTimeout(() => {
        if (backdrop) backdrop.classList.add('opacity-100');
        if (panel) panel.classList.remove('translate-x-full');
    }, 10);
}

function setupDrawerEvents() {
    const drawer = document.getElementById('cartDrawer');
    if (!drawer) return;

    const backdrop = document.getElementById('drawerBackdrop');
    const panel = document.getElementById('drawerPanel');
    const closeBtn = document.getElementById('closeDrawer');
    const continueBtn = document.getElementById('continueShopping');

    const closeDrawerFunc = () => {
        if (backdrop) backdrop.classList.remove('opacity-100');
        if (panel) panel.classList.add('translate-x-full');
        setTimeout(() => {
            drawer.classList.add('hidden');
        }, 300);
    };

    if (closeBtn) closeBtn.onclick = closeDrawerFunc;
    if (backdrop) backdrop.onclick = closeDrawerFunc;
    if (continueBtn) continueBtn.onclick = closeDrawerFunc;
}

function toggleFavorite(product) {
    let favorites = JSON.parse(localStorage.getItem("nike_favorites")) || [];
    const index = favorites.findIndex(f => String(f.id) === String(product.id));

    if (index === -1) {
        favorites.push(product);
    } else {
        favorites.splice(index, 1);
    }

    localStorage.setItem("nike_favorites", JSON.stringify(favorites));
    checkFavoriteStatus(product.id);
    updateNavCounts();
}

function checkFavoriteStatus(productId) {
    let favorites = JSON.parse(localStorage.getItem("nike_favorites")) || [];
    const isFav = favorites.some(f => String(f.id) === String(productId));
    const favIcon = document.getElementById('favIcon');
    if (!favIcon) return;

    if (isFav) {
        favIcon.classList.add("text-red-500", "fill-current");
        favIcon.classList.remove("text-gray-400");
    } else {
        favIcon.classList.remove("text-red-500", "fill-current");
        favIcon.classList.add("text-gray-400");
    }
}

function updateNavCounts() {
    const cart = JSON.parse(localStorage.getItem("nike_cart")) || [];
    const totalItems = cart.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0);
    const navCartCount = document.getElementById("navCartCount");
    if (navCartCount) {
        navCartCount.textContent = totalItems;
        navCartCount.classList.toggle("opacity-0", totalItems === 0);
        navCartCount.classList.toggle("opacity-100", totalItems > 0);
    }

    const favorites = JSON.parse(localStorage.getItem("nike_favorites")) || [];
    const navFavCount = document.getElementById("navFavCount");
    if (navFavCount) {
        navFavCount.textContent = favorites.length;
        navFavCount.classList.toggle("opacity-0", favorites.length === 0);
        navFavCount.classList.toggle("opacity-100", favorites.length > 0);
    }
}