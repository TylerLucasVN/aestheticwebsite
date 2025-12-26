// Cấu hình API và các hằng số toàn cục
const API_URL = "https://694a5ba81282f890d2d86de0.mockapi.io/api/v1/products";

document.addEventListener('DOMContentLoaded', function() {
    // --- CÁC PHẦN TỬ GIAO DIỆN CHÍNH ---
    // Modal (Hộp thoại thêm vào giỏ hàng)
    const cartModal = document.getElementById('cartModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const continueShoppingBtn = document.getElementById('continueShoppingBtn');
    const viewCartModalBtn = document.getElementById('viewCartModalBtn');
    const checkoutModalBtn = document.getElementById('checkoutModalBtn');
    
    // Danh sách yêu thích và Sidebar
    const favoritesCount = document.getElementById('favoritesCount');
    const totalValueElement = document.getElementById('totalValue');
    const emptyState = document.getElementById('emptyState');
    const favoritesGrid = document.getElementById('favoritesGrid');
    const toastContainer = document.getElementById('toastContainer');
    const saleSidebarGrid = document.getElementById('saleSidebarGrid');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const sortSelect = document.getElementById('sortSelect');

    // --- XỬ LÝ MODAL (GIỎ HÀNG) ---
    function openCartModal(productInfo) {
        if (productInfo) {
            if (productInfo.image) document.getElementById('modalProductImage').src = productInfo.image;
            if (productInfo.name) document.getElementById('modalProductName').textContent = productInfo.name;
            if (productInfo.category) document.getElementById('modalProductCategory').textContent = productInfo.category;
            if (productInfo.price) document.getElementById('modalProductPrice').textContent = productInfo.price;
        }
        
        // Hiển thị modal với hiệu ứng mờ dần
        cartModal.classList.remove('hidden');
        setTimeout(() => {
            cartModal.classList.add('opacity-100');
        }, 10);
    }
    
    function closeCartModal() {
        cartModal.classList.add('hidden');
        cartModal.classList.remove('opacity-100');
    }
    
    // Gán sự kiện đóng modal
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeCartModal);
    if (continueShoppingBtn) continueShoppingBtn.addEventListener('click', closeCartModal);
    
    if (viewCartModalBtn) viewCartModalBtn.addEventListener('click', function() {
        alert('Redirecting to cart page...');
        closeCartModal();
    });
    
    if (checkoutModalBtn) checkoutModalBtn.addEventListener('click', function() {
        alert('Proceeding to checkout...');
        closeCartModal();
    });
    
    // Đóng modal khi click ra ngoài vùng chứa hoặc nhấn phím ESC
    cartModal.addEventListener('click', function(e) {
        if (e.target === cartModal) {
            closeCartModal();
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !cartModal.classList.contains('hidden')) {
            closeCartModal();
        }
    });
    
    // --- XỬ LÝ DANH SÁCH YÊU THÍCH ---

    // Lấy dữ liệu từ LocalStorage với key 'nike_favorites'
    const getFavorites = () => JSON.parse(localStorage.getItem('nike_favorites')) || [];
    
    // Biến lưu trữ danh sách sản phẩm đang hiển thị (phục vụ lọc/sắp xếp)
    let currentItems = getFavorites();

    // Hàm hiển thị thông báo (Toast) hiện đại ở góc màn hình
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

    // Hàm render danh sách sản phẩm yêu thích ra Grid
    function renderItems(items) {
        favoritesGrid.innerHTML = '';
        
        if (items.length === 0) {
            favoritesGrid.classList.add('hidden');
            emptyState.classList.remove('hidden');
        } else {
            favoritesGrid.classList.remove('hidden');
            emptyState.classList.add('hidden');
            
            items.forEach((item, index) => {
                // Sử dụng animation-delay để tạo hiệu ứng xuất hiện so le (staggered)
                const itemHTML = `
                    <div class="favorite-item group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-500 animate-slide-up" 
                         style="animation-delay: ${index * 0.05}s" data-id="${item.id}">
                        <div class="relative">
                            <div class="aspect-square bg-gray-100 relative">
                                <img src="${item.image}" alt="${item.name}" class="w-full h-full object-contain p-3 transition-transform duration-300 hover:scale-105">
                                <button class="remove-btn absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-sm hover:bg-red-50 hover:text-red-600 transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0">
                                    <svg class="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </button>
                                ${item.tag === 'sale' ? '<div class="absolute top-3 left-3"><span class="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">SALE</span></div>' : ''}
                            </div>
                        </div>
                        <div class="p-3">
                            <div class="flex justify-between items-start mb-1">
                                <div>
                                    <h3 class="text-[13px] font-bold text-gray-900 truncate w-full mb-0.5">${item.name}</h3>
                                    <p class="text-gray-500 text-[11px] mb-2">${item.category}</p>
                                </div>
                            </div>
                            <div class="flex justify-between items-center">
                                <div>
                                    <span class="text-xs font-bold text-gray-900">${item.price}</span>
                                </div>
                                <button class="add-to-cart-btn bg-black text-white text-[10px] font-bold px-4 py-2 rounded-full hover:bg-gray-800 active:scale-90 transition-all duration-200">
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

    // Hàm lấy và hiển thị sản phẩm đang Sale ở Sidebar bên phải
    async function renderSaleSidebar() {
        if (!saleSidebarGrid) return;
        
        // Hiển thị hiệu ứng chờ (Skeleton Loading) trong khi tải dữ liệu
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
            const saleItems = allProducts.filter(p => p.tag === 'sale').slice(0, 4);

            saleSidebarGrid.innerHTML = saleItems.map(item => `
                <div class="flex items-center gap-4 p-2 rounded-xl hover:bg-gray-50 transition-colors group cursor-pointer">
                    <div class="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img src="${item.image}" alt="${item.name}" class="w-full h-full object-contain p-1 group-hover:scale-110 transition-transform">
                    </div>
                    <div class="flex-1 min-w-0">
                        <h4 class="text-sm font-bold text-gray-900 truncate">${item.name}</h4>
                        <p class="text-xs text-gray-500 mb-1">${item.category}</p>
                        <div class="flex items-center gap-2">
                            <span class="text-sm font-bold text-red-600">${item.price}</span>
                        </div>
                    </div>
                    <button class="p-2 text-gray-400 hover:text-black">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                        </svg>
                    </button>
                </div>
            `).join('');
        } catch (error) {
            console.error("Error loading sale items:", error);
        }
    }

    // Cập nhật số lượng và tổng giá trị của danh sách yêu thích
    function updateSummary(items) {
        const totalItems = items.length;
        let totalValue = 0;
        
        items.forEach(item => {
            // Loại bỏ các ký tự không phải số để tính toán
            totalValue += parseInt(String(item.price).replace(/\D/g, '')) || 0;
        });

        favoritesCount.textContent = `${totalItems} saved ${totalItems === 1 ? 'item' : 'items'}`;
        if (totalValueElement) {
            totalValueElement.textContent = `Total: ${totalValue.toLocaleString('vi-VN')}₫`;
        }
    }

    // Cập nhật số lượng hiển thị trên icon trái tim ở thanh Navigation
    function updateNavFavCount() {
        const favorites = getFavorites();
        const navFavCount = document.getElementById('navFavCount');
        if (navFavCount) {
            navFavCount.textContent = favorites.length;
            navFavCount.classList.toggle('opacity-0', favorites.length === 0);
            navFavCount.classList.toggle('opacity-100', favorites.length > 0);
        }
    }
    
    // SỬ DỤNG EVENT DELEGATION: Gắn sự kiện vào container cha để xử lý các nút con
    favoritesGrid.addEventListener('click', function(e) {
        const removeBtn = e.target.closest('.remove-btn');
        const addToCartBtn = e.target.closest('.add-to-cart-btn');

        // Xử lý khi nhấn nút Xóa
        if (removeBtn) {
            e.stopPropagation();
            const favoriteItem = removeBtn.closest('.favorite-item');
            const id = favoriteItem.dataset.id;
            
            let allFavorites = getFavorites();
            allFavorites = allFavorites.filter(item => String(item.id) !== String(id));
            localStorage.setItem('nike_favorites', JSON.stringify(allFavorites));

            currentItems = currentItems.filter(item => String(item.id) !== String(id));
            showToast('Removed from favorites', 'info');

            // Hiệu ứng mờ dần trước khi xóa khỏi DOM
            favoriteItem.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
            setTimeout(() => renderItems(currentItems), 300);
        }

        // Xử lý khi nhấn nút Thêm vào giỏ
        if (addToCartBtn) {
            const productCard = addToCartBtn.closest('.favorite-item');
            const productInfo = {
                image: productCard.querySelector('img').src,
                name: productCard.querySelector('h3').textContent,
                category: productCard.querySelector('p').textContent,
                price: productCard.querySelector('span.text-xs.font-bold').textContent
            };
            openCartModal(productInfo);
        }
    });

    // Logic Sắp xếp sản phẩm
    function sortItems(items, sortType) {
        const sorted = [...items];
        const getPrice = (p) => parseInt(String(p).replace(/\D/g, '')) || 0;

        switch(sortType) {
            case 'price-asc':
                return sorted.sort((a, b) => getPrice(a.price) - getPrice(b.price));
            case 'price-desc':
                return sorted.sort((a, b) => getPrice(b.price) - getPrice(a.price));
            case 'name-asc':
                return sorted.sort((a, b) => a.name.localeCompare(b.name));
            case 'recent':
            default:
                return sorted.reverse(); // Đảo ngược để món mới nhất lên đầu
        }
    }

    // Xử lý sự kiện Bộ lọc (All, Shoes, Apparel, Sale)
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Cập nhật giao diện nút active
            filterButtons.forEach(b => {
                b.classList.remove('bg-black', 'text-white');
                b.classList.add('bg-gray-100', 'text-gray-800');
            });
            btn.classList.remove('bg-gray-100', 'text-gray-800');
            btn.classList.add('bg-black', 'text-white');

            // Lọc dữ liệu
            const filter = btn.dataset.filter;
            const allFavs = getFavorites();
            let filteredItems = [];
            
            if (filter === 'all') {
                filteredItems = [...allFavs];
            } else if (filter === 'shoes') {
                filteredItems = allFavs.filter(i => i.category.toLowerCase().includes('shoes'));
            } else if (filter === 'apparel') {
                filteredItems = allFavs.filter(i => i.category.toLowerCase().includes('apparel') || i.category.toLowerCase().includes('clothing'));
            } else if (filter === 'sale') {
                filteredItems = allFavs.filter(i => i.tag === 'sale');
            }
            
            // Áp dụng sắp xếp hiện tại cho danh sách đã lọc
            currentItems = sortItems(filteredItems, sortSelect ? sortSelect.value : 'recent');
            renderItems(currentItems);
        });
    });

    // Xử lý sự kiện thay đổi kiểu Sắp xếp
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            currentItems = sortItems(currentItems, this.value);
            renderItems(currentItems);
        });
    }

    // KHỞI TẠO TRANG
    renderItems(currentItems);
    renderSaleSidebar();
});