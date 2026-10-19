// --- CẤU HÌNH API ---
const API_URL = "http://localhost:5000/api/v1/products";

// Biến cho Quick Size Modal
let activeQuickProduct = null;
let selectedQuickSize = null;
let currentQuickQty = 1;

document.addEventListener('DOMContentLoaded', function () {

    // --- KHAI BÁO CÁC PHẦN TỬ DOM ---
    const cartModal = document.getElementById('cartModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const continueShoppingBtn = document.getElementById('continueShoppingBtn');
    const viewCartModalBtn = document.getElementById('viewCartModalBtn');
    const checkoutModalBtn = document.getElementById('checkoutModalBtn');
    const cartModalBackdrop = document.getElementById('cartModalBackdrop');

    const favoritesCount = document.getElementById('favoritesCount');
    const totalValueElement = document.getElementById('totalValue');
    const emptyState = document.getElementById('emptyState');
    const favoritesGrid = document.getElementById('favoritesGrid');
    const toastContainer = document.getElementById('toastContainer');
    const saleSidebarGrid = document.getElementById('saleSidebarGrid');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const sortSelect = document.getElementById('sortSelect');

    const getFavorites = () => JSON.parse(localStorage.getItem('nike_favorites')) || [];
    const getCart = () => JSON.parse(localStorage.getItem('nike_cart')) || [];

    let currentItems = getFavorites();

    // --- CẬP NHẬT GIAO DIỆN NAVBAR (BADGE) ---
    function updateNavCartCount() {
        const cart = getCart();
        const navCartCount = document.getElementById("navCartCount");

        if (navCartCount) {
            const totalItems = cart.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0);
            navCartCount.innerText = totalItems;

            if (totalItems > 0) {
                navCartCount.classList.remove("opacity-0");
                navCartCount.classList.add("opacity-100");
            } else {
                navCartCount.classList.remove("opacity-100");
                navCartCount.classList.add("opacity-0");
            }
        }
    }

    function updateNavFavCount() {
        const favorites = getFavorites();
        const navFavCount = document.getElementById('navFavCount');
        if (navFavCount) {
            const count = favorites.length;
            navFavCount.innerText = count;
            if (count > 0) {
                navFavCount.classList.remove('opacity-0');
                navFavCount.classList.add('opacity-100');
            } else {
                navFavCount.classList.remove('opacity-100');
                navFavCount.classList.add('opacity-0');
            }
        }
    }

    // --- XỬ LÝ MODAL ADD TO CART THÀNH CÔNG ---
    function openCartModal(productInfo) {
        if (productInfo) {
            document.getElementById('modalProductImage').src = productInfo.image;
            document.getElementById('modalProductName').textContent = productInfo.name;
            document.getElementById('modalProductCategory').textContent = productInfo.category;
            document.getElementById('modalProductPrice').textContent = productInfo.price;
        }

        cartModal.classList.remove('hidden');
        setTimeout(() => {
            cartModal.firstElementChild.classList.remove('opacity-0');
            cartModal.lastElementChild.firstElementChild.classList.remove('opacity-0', 'scale-95');
            cartModal.lastElementChild.firstElementChild.classList.add('opacity-100', 'scale-100');
        }, 10);
    }

    function closeCartModal() {
        cartModal.firstElementChild.classList.add('opacity-0');
        cartModal.lastElementChild.firstElementChild.classList.remove('opacity-100', 'scale-100');
        cartModal.lastElementChild.firstElementChild.classList.add('opacity-0', 'scale-95');

        setTimeout(() => {
            cartModal.classList.add('hidden');
        }, 300);
    }

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeCartModal);
    if (continueShoppingBtn) continueShoppingBtn.addEventListener('click', closeCartModal);
    if (cartModalBackdrop) cartModalBackdrop.addEventListener('click', closeCartModal);

    if (viewCartModalBtn) viewCartModalBtn.addEventListener('click', function () {
        window.location.href = '../cart/cart.html';
    });

    if (checkoutModalBtn) checkoutModalBtn.addEventListener('click', function () {
        window.location.href = '../cart/cart.html';
    });

    // --- QUICK SIZE MODAL LOGIC ---
    window.openQuickSizeModal = function (productId) {
        const allFavs = getFavorites();
        const product = allFavs.find(item => String(item.id || item._id) === String(productId));
        if (!product) return;

        activeQuickProduct = product;
        selectedQuickSize = null;
        currentQuickQty = 1;

        document.getElementById("quickModalImg").src = product.image;
        document.getElementById("quickModalName").textContent = product.name;
        document.getElementById("quickModalCategory").textContent = product.category;
        document.getElementById("quickModalPrice").textContent = typeof product.price === "number" ? product.price.toLocaleString("vi-VN") + "₫" : product.price;
        document.getElementById("quickQtyDisplay").textContent = currentQuickQty;
        document.getElementById("quickSizeError").classList.add("hidden");

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

        const modal = document.getElementById("quickSizeModal");
        const backdrop = document.getElementById("quickModalBackdrop");
        const panel = document.getElementById("quickModalPanel");

        modal.classList.remove("hidden");
        setTimeout(() => {
            backdrop.classList.add("opacity-100");
            panel.classList.remove("opacity-0", "scale-95");
            panel.classList.add("opacity-100", "scale-100");
        }, 10);
    };

    window.adjustQuickQty = function (change) {
        currentQuickQty += change;
        if (currentQuickQty < 1) currentQuickQty = 1;
        document.getElementById("quickQtyDisplay").textContent = currentQuickQty;
    };

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
    };

    // Xác nhận Add to Bag từ Quick Modal
    const confirmQuickAddBtn = document.getElementById('confirmQuickAdd');
    if (confirmQuickAddBtn) {
        confirmQuickAddBtn.onclick = () => {
            if (!selectedQuickSize) {
                document.getElementById('quickSizeError').classList.remove('hidden');
                return;
            }

            let cart = getCart();
            const prodId = activeQuickProduct.id || activeQuickProduct._id;
            const existingItem = cart.find(item => String(item.id || item._id) === String(prodId) && item.size === selectedQuickSize);

            if (existingItem) {
                existingItem.quantity = (parseInt(existingItem.quantity) || 1) + currentQuickQty;
            } else {
                cart.push({ ...activeQuickProduct, size: selectedQuickSize, quantity: currentQuickQty });
            }

            localStorage.setItem('nike_cart', JSON.stringify(cart));
            updateNavCartCount();
            window.closeQuickSizeModal();

            const productInfo = {
                image: activeQuickProduct.image,
                name: activeQuickProduct.name,
                category: activeQuickProduct.category,
                price: typeof activeQuickProduct.price === 'number' ? activeQuickProduct.price.toLocaleString('vi-VN') + '₫' : activeQuickProduct.price
            };
            openCartModal(productInfo);
        };
    }

    // --- RENDER DANH SÁCH YÊU THÍCH ---
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        const bgColor = type === 'success' ? 'bg-black' : 'bg-red-600';
        toast.className = `${bgColor} text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-toast-in min-w-[300px]`;
        toast.innerHTML = `
            <span class="text-lg">${type === 'success' ? '✓' : '✕'}</span>
            <span class="text-sm font-medium">${message}</span>
        `;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.replace('animate-toast-in', 'animate-toast-out');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    function renderItems(items) {
        favoritesGrid.innerHTML = '';

        if (items.length === 0) {
            favoritesGrid.classList.add('hidden');
            emptyState.classList.remove('hidden');
        } else {
            favoritesGrid.classList.remove('hidden');
            emptyState.classList.add('hidden');

            items.forEach((item, index) => {
                const itemId = item.id || item._id;
                const itemHTML = `
                    <div class="favorite-item group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-500 animate-slide-up" 
                         style="animation-delay: ${index * 0.05}s" data-id="${itemId}">
                        <div class="relative">
                            <div class="aspect-square bg-gray-100 relative">
                                <img src="${item.image}" alt="${item.name}" class="w-full h-full object-contain p-3 transition-transform duration-300 hover:scale-105 mix-blend-multiply">
                                
                                <button class="remove-btn absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-sm hover:bg-red-50 hover:text-red-600 transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0" title="Remove">
                                    <svg class="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </button>
                                ${item.tag ? `<div class="absolute top-3 left-3"><span class="bg-white/90 backdrop-blur-sm px-2 py-1 text-[10px] font-bold uppercase rounded tracking-wider">${item.tag}</span></div>` : ''}
                            </div>
                        </div>
                        <div class="p-3">
                            <div class="mb-2">
                                <h3 class="text-[13px] font-bold text-gray-900 truncate w-full mb-0.5">${item.name}</h3>
                                <p class="text-gray-500 text-[11px]">${item.category}</p>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-xs font-bold text-gray-900">${typeof item.price === 'number' ? item.price.toLocaleString('vi-VN') + '₫' : item.price}</span>
                                
                                <button onclick="window.openQuickSizeModal('${itemId}')" class="add-to-cart-btn bg-black text-white text-[10px] font-bold px-4 py-2 rounded-full hover:bg-gray-800 active:scale-95 transition-all duration-200 shadow-sm">
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                favoritesGrid.insertAdjacentHTML('beforeend', itemHTML);
            });
        }

        updateSummary(items);
        updateNavFavCount();
    }

    async function renderSaleSidebar() {
        if (!saleSidebarGrid) return;

        // Skeleton Loading
        saleSidebarGrid.innerHTML = Array(3).fill(0).map(() => `
            <div class="flex items-center gap-4 p-2">
                <div class="w-16 h-16 bg-gray-200 rounded-lg animate-pulse"></div>
                <div class="flex-1 space-y-2">
                    <div class="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                    <div class="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                </div>
            </div>`).join('');

        try {
            const response = await fetch(API_URL);
            const allProducts = await response.json();
            const saleItems = allProducts.filter(p => (p.tag && p.tag.toLowerCase().includes('sale'))).slice(0, 4);

            saleSidebarGrid.innerHTML = saleItems.map(item => {
                const itemId = item.id || item._id;
                return `
                <div class="flex items-center gap-4 p-2 rounded-xl hover:bg-gray-50 transition-colors group cursor-pointer" onclick="goToDetailFromSale('${itemId}')">
                    <div class="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img src="${item.image}" alt="${item.name}" class="w-full h-full object-contain p-1 group-hover:scale-110 transition-transform mix-blend-multiply">
                    </div>
                    <div class="flex-1 min-w-0">
                        <h4 class="text-sm font-bold text-gray-900 truncate">${item.name}</h4>
                        <p class="text-xs text-gray-500 mb-1">${item.category}</p>
                        <span class="text-sm font-bold text-black">${typeof item.price === 'number' ? item.price.toLocaleString('vi-VN') + '₫' : item.price}</span>
                    </div>
                </div>
            `;}).join('');
        } catch (error) {
            console.error("Error loading sale items:", error);
            saleSidebarGrid.innerHTML = '<p class="text-xs text-gray-400">Cannot load recommendations.</p>';
        }
    }

    // Hàm phụ trợ hỗ trợ chuyển sang trang chi tiết từ mục Featured Sale
    window.goToDetailFromSale = async function (productId) {
        try {
            const response = await fetch(API_URL);
            const allProducts = await response.json();
            const product = allProducts.find(p => String(p.id || p._id) === String(productId));
            if (product) {
                localStorage.setItem('nike_selected_product', JSON.stringify(product));
                window.location.href = `../detail/detail.html?id=${productId}`;
            }
        } catch (err) {
            console.error("Error navigating to product detail:", err);
        }
    };

    function updateSummary(items) {
        const totalItems = items.length;
        let totalValue = 0;

        items.forEach(item => {
            const price = typeof item.price === 'number' ? item.price : parseInt(String(item.price).replace(/\D/g, '')) || 0;
            totalValue += price;
        });

        favoritesCount.textContent = `${totalItems} saved ${totalItems === 1 ? 'item' : 'items'}`;
        if (totalValueElement) {
            totalValueElement.textContent = `Total: ${totalValue.toLocaleString('vi-VN')}₫`;
        }
    }

    // --- XỬ LÝ SỰ KIỆN CLICK (Delegation) ---
    favoritesGrid.addEventListener('click', function (e) {
        const removeBtn = e.target.closest('.remove-btn');
        const favoriteItem = e.target.closest('.favorite-item');

        if (!favoriteItem) return;
        const id = favoriteItem.dataset.id;

        if (removeBtn) {
            e.stopPropagation();

            let allFavorites = getFavorites();
            allFavorites = allFavorites.filter(item => String(item.id || item._id) !== String(id));
            localStorage.setItem('nike_favorites', JSON.stringify(allFavorites));

            currentItems = currentItems.filter(item => String(item.id || item._id) !== String(id));
            showToast('Removed from favorites', 'info');

            favoriteItem.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
            setTimeout(() => renderItems(currentItems), 300);

            updateNavFavCount();
        }
    });

    // --- SORT & FILTER LOGIC ---
    function sortItems(items, sortType) {
        const sorted = [...items];
        const getPrice = (p) => typeof p === 'number' ? p : parseInt(String(p).replace(/\D/g, '')) || 0;

        switch (sortType) {
            case 'price-asc': return sorted.sort((a, b) => getPrice(a.price) - getPrice(b.price));
            case 'price-desc': return sorted.sort((a, b) => getPrice(b.price) - getPrice(a.price));
            case 'name-asc': return sorted.sort((a, b) => a.name.localeCompare(b.name));
            case 'recent': default: return sorted.reverse();
        }
    }

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => {
                b.classList.remove('bg-black', 'text-white');
                b.classList.add('bg-gray-100', 'text-gray-800');
            });
            btn.classList.remove('bg-gray-100', 'text-gray-800');
            btn.classList.add('bg-black', 'text-white');

            const filter = btn.dataset.filter;
            const allFavs = getFavorites();
            let filteredItems = [];

            if (filter === 'all') filteredItems = [...allFavs];
            else if (filter === 'shoes') filteredItems = allFavs.filter(i => i.category.toLowerCase().includes('shoes'));
            else if (filter === 'apparel') filteredItems = allFavs.filter(i => i.category.toLowerCase().includes('clothing') || i.category.toLowerCase().includes('top') || i.category.toLowerCase().includes('t-shirt'));
            else if (filter === 'sale') filteredItems = allFavs.filter(i => i.tag && i.tag.toLowerCase().includes('sale'));

            currentItems = sortItems(filteredItems, sortSelect ? sortSelect.value : 'recent');
            renderItems(currentItems);
        });
    });

    if (sortSelect) {
        sortSelect.addEventListener('change', function () {
            currentItems = sortItems(currentItems, this.value);
            renderItems(currentItems);
        });
    }

    // --- INIT ---
    updateNavCartCount();
    updateNavFavCount();
    renderItems(currentItems);
    renderSaleSidebar();
});