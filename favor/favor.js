// --- CẤU HÌNH API ---
const API_URL = "https://694a5ba81282f890d2d86de0.mockapi.io/api/v1/products";

document.addEventListener('DOMContentLoaded', function() {
    
    // --- KHAI BÁO CÁC PHẦN TỬ DOM ---
    // Modal Elements
    const cartModal = document.getElementById('cartModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const continueShoppingBtn = document.getElementById('continueShoppingBtn');
    const viewCartModalBtn = document.getElementById('viewCartModalBtn');
    const checkoutModalBtn = document.getElementById('checkoutModalBtn');
    const cartModalBackdrop = document.getElementById('cartModalBackdrop');

    // Main UI Elements
    const favoritesCount = document.getElementById('favoritesCount');
    const totalValueElement = document.getElementById('totalValue');
    const emptyState = document.getElementById('emptyState');
    const favoritesGrid = document.getElementById('favoritesGrid');
    const toastContainer = document.getElementById('toastContainer');
    const saleSidebarGrid = document.getElementById('saleSidebarGrid');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const sortSelect = document.getElementById('sortSelect');

    // --- HÀM XỬ LÝ DỮ LIỆU LOCALSTORAGE ---

    const getFavorites = () => JSON.parse(localStorage.getItem('nike_favorites')) || [];
    const getCart = () => JSON.parse(localStorage.getItem('nike_cart')) || [];

    // Biến lưu trạng thái danh sách hiện tại (để lọc/sort)
    let currentItems = getFavorites();

    // --- CẬP NHẬT GIAO DIỆN NAVBAR (BADGE) ---

    // Cập nhật số lượng trên icon Giỏ hàng
    function updateNavCartCount() {
    const cart = getCart();
    // Tìm thẻ span theo ID vừa thêm
    const navCartCount = document.getElementById("navCartCount");
    
    if (navCartCount) {
        const count = cart.length; 
        navCartCount.innerText = count;
        
        // Logic ẩn hiện: Nếu > 0 thì hiện, = 0 thì ẩn
        if (count > 0) {
            navCartCount.classList.remove("opacity-0");
            navCartCount.classList.add("opacity-100");
        } else {
            navCartCount.classList.remove("opacity-100");
            navCartCount.classList.add("opacity-0");
        }
    }
}

    // Cập nhật số lượng trên icon Yêu thích
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

    // --- XỬ LÝ MODAL ADD TO CART ---

    function openCartModal(productInfo) {
        if (productInfo) {
            document.getElementById('modalProductImage').src = productInfo.image;
            document.getElementById('modalProductName').textContent = productInfo.name;
            document.getElementById('modalProductCategory').textContent = productInfo.category;
            document.getElementById('modalProductPrice').textContent = productInfo.price;
        }
        
        cartModal.classList.remove('hidden');
        // Animation fade in
        setTimeout(() => {
            cartModal.firstElementChild.classList.remove('opacity-0'); // Backdrop
            cartModal.lastElementChild.firstElementChild.classList.remove('opacity-0', 'scale-95'); // Panel
            cartModal.lastElementChild.firstElementChild.classList.add('opacity-100', 'scale-100');
        }, 10);
    }
    
    function closeCartModal() {
        // Animation fade out
        cartModal.firstElementChild.classList.add('opacity-0');
        cartModal.lastElementChild.firstElementChild.classList.remove('opacity-100', 'scale-100');
        cartModal.lastElementChild.firstElementChild.classList.add('opacity-0', 'scale-95');

        setTimeout(() => {
            cartModal.classList.add('hidden');
        }, 300);
    }

    // Gán sự kiện đóng modal
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeCartModal);
    if (continueShoppingBtn) continueShoppingBtn.addEventListener('click', closeCartModal);
    if (cartModalBackdrop) cartModalBackdrop.addEventListener('click', closeCartModal); // Click ra ngoài vùng trắng

    if (viewCartModalBtn) viewCartModalBtn.addEventListener('click', function() {
        window.location.href = '../cart/cart.html'; // Chuyển hướng sang trang Cart
    });
    
    if (checkoutModalBtn) checkoutModalBtn.addEventListener('click', function() {
        window.location.href = '../cart/cart.html';
    });

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
                const itemHTML = `
                    <div class="favorite-item group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-500 animate-slide-up" 
                         style="animation-delay: ${index * 0.05}s" data-id="${item.id}">
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
                                
                                <button class="add-to-cart-btn bg-black text-white text-[10px] font-bold px-4 py-2 rounded-full hover:bg-gray-800 active:scale-95 transition-all duration-200 shadow-sm">
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
        updateNavFavCount(); // Cập nhật lại số lượng badge tim
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
            // Lọc sản phẩm có tag SALE hoặc ngẫu nhiên nếu không có tag
            const saleItems = allProducts.filter(p => (p.tag && p.tag.toLowerCase().includes('sale'))).slice(0, 4);

            saleSidebarGrid.innerHTML = saleItems.map(item => `
                <div class="flex items-center gap-4 p-2 rounded-xl hover:bg-gray-50 transition-colors group cursor-pointer" onclick="window.location.href='../products/products.html'">
                    <div class="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img src="${item.image}" alt="${item.name}" class="w-full h-full object-contain p-1 group-hover:scale-110 transition-transform mix-blend-multiply">
                    </div>
                    <div class="flex-1 min-w-0">
                        <h4 class="text-sm font-bold text-gray-900 truncate">${item.name}</h4>
                        <p class="text-xs text-gray-500 mb-1">${item.category}</p>
                        <span class="text-sm font-bold text-black">${typeof item.price === 'number' ? item.price.toLocaleString('vi-VN') + '₫' : item.price}</span>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error("Error loading sale items:", error);
            saleSidebarGrid.innerHTML = '<p class="text-xs text-gray-400">Cannot load recommendations.</p>';
        }
    }

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
    
    favoritesGrid.addEventListener('click', function(e) {
        const removeBtn = e.target.closest('.remove-btn');
        const addToCartBtn = e.target.closest('.add-to-cart-btn');
        const favoriteItem = e.target.closest('.favorite-item');

        if (!favoriteItem) return;
        const id = favoriteItem.dataset.id;

        // 1. Xử lý nút Xóa
        if (removeBtn) {
            e.stopPropagation();
            
            let allFavorites = getFavorites();
            allFavorites = allFavorites.filter(item => String(item.id) !== String(id));
            localStorage.setItem('nike_favorites', JSON.stringify(allFavorites));

            // Cập nhật lại UI
            currentItems = currentItems.filter(item => String(item.id) !== String(id));
            showToast('Removed from favorites', 'info');

            // Animation biến mất
            favoriteItem.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
            setTimeout(() => renderItems(currentItems), 300);
            
            updateNavFavCount(); // Cập nhật badge
        }

        // 2. Xử lý nút Add to Cart
        if (addToCartBtn) {
            e.stopPropagation(); // Ngăn sự kiện click vào thẻ cha (nếu có)

            // Tìm thông tin sản phẩm trong danh sách favorites
            const allFavs = getFavorites();
            const product = allFavs.find(item => String(item.id) === String(id));

            if (product) {
                // Hiệu ứng click nút
                addToCartBtn.classList.add('scale-90');
                setTimeout(() => addToCartBtn.classList.remove('scale-90'), 150);

                // --- LOGIC ADD TO CART ---
                let cart = getCart();
                cart.push(product); // Thêm sản phẩm vào mảng
                localStorage.setItem('nike_cart', JSON.stringify(cart)); // Lưu lại

                // Cập nhật UI
                updateNavCartCount();
                
                // Chuẩn bị dữ liệu hiển thị Modal
                const productInfo = {
                    image: product.image,
                    name: product.name,
                    category: product.category,
                    price: typeof product.price === 'number' ? product.price.toLocaleString('vi-VN') + '₫' : product.price
                };
                openCartModal(productInfo);
            }
        }
    });

    // --- SORT & FILTER LOGIC ---

    function sortItems(items, sortType) {
        const sorted = [...items];
        const getPrice = (p) => typeof p === 'number' ? p : parseInt(String(p).replace(/\D/g, '')) || 0;

        switch(sortType) {
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
        sortSelect.addEventListener('change', function() {
            currentItems = sortItems(currentItems, this.value);
            renderItems(currentItems);
        });
    }

    // --- INIT ---
    updateNavCartCount(); // Gọi ngay khi load trang
    updateNavFavCount();
    renderItems(currentItems);
    renderSaleSidebar();
});