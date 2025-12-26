const API_URL = "https://694a5ba81282f890d2d86de0.mockapi.io/api/v1/products";

document.addEventListener('DOMContentLoaded', function() {
    // ======================
    // MODAL FUNCTIONALITY
    // ======================
    const cartModal = document.getElementById('cartModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const continueShoppingBtn = document.getElementById('continueShoppingBtn');
    const viewCartModalBtn = document.getElementById('viewCartModalBtn');
    const checkoutModalBtn = document.getElementById('checkoutModalBtn');
    
    function openCartModal(productInfo) {
        if (productInfo) {
            if (productInfo.image) document.getElementById('modalProductImage').src = productInfo.image;
            if (productInfo.name) document.getElementById('modalProductName').textContent = productInfo.name;
            if (productInfo.category) document.getElementById('modalProductCategory').textContent = productInfo.category;
            if (productInfo.price) document.getElementById('modalProductPrice').textContent = productInfo.price;
        }
        
        cartModal.classList.remove('hidden');
        setTimeout(() => {
            cartModal.classList.add('opacity-100');
        }, 10);
    }
    
    function closeCartModal() {
        cartModal.classList.add('hidden');
        cartModal.classList.remove('opacity-100');
    }
    
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
    
    // ======================
    // FAVORITES FUNCTIONALITY
    // ======================
    const favoritesCount = document.getElementById('favoritesCount');
    const totalValueElement = document.getElementById('totalValue');
    const emptyState = document.getElementById('emptyState');
    const favoritesGrid = document.getElementById('favoritesGrid');
    const saleSidebarGrid = document.getElementById('saleSidebarGrid');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const sortSelect = document.getElementById('sortSelect');
    
    // Hàm lấy dữ liệu mới nhất từ LocalStorage
    const getFavorites = () => JSON.parse(localStorage.getItem('nike_favorites')) || [];
    
    // Biến lưu trữ danh sách sản phẩm hiện tại đang hiển thị
    let currentItems = getFavorites();

    // Hàm hiển thị sản phẩm ra giao diện
    function renderItems(items) {
        favoritesGrid.innerHTML = '';
        
        if (items.length === 0) {
            favoritesGrid.classList.add('hidden');
            emptyState.classList.remove('hidden');
        } else {
            favoritesGrid.classList.remove('hidden');
            emptyState.classList.add('hidden');
            
            items.forEach(item => {
                const itemHTML = `
                    <div class="favorite-item group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300 animate-slide-up" data-id="${item.id}">
                        <div class="relative">
                            <div class="aspect-square bg-gray-100 relative">
                                <img src="${item.image}" alt="${item.name}" class="w-full h-full object-contain p-3 transition-transform duration-300 hover:scale-105">
                                <button class="remove-btn absolute top-2 right-2 bg-white/80 backdrop-blur-sm rounded-full p-1.5 shadow-sm hover:bg-white transition-all duration-200 opacity-0 group-hover:opacity-100">
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
                                <button class="add-to-cart-btn bg-black text-white text-[10px] font-bold px-3 py-1.5 rounded-full hover:bg-gray-800 transition-colors duration-200">
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
        attachEventListeners();
        updateNavFavCount();
    }

    // Hàm hiển thị sản phẩm Sale ở sidebar
    async function renderSaleSidebar() {
        if (!saleSidebarGrid) return;
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

    // Hàm cập nhật tổng số lượng và giá tiền
    function updateSummary(items) {
        const totalItems = items.length;
        let totalValue = 0;
        
        items.forEach(item => {
            totalValue += parseInt(String(item.price).replace(/[^\d]/g, '')) || 0;
        });

        favoritesCount.textContent = `${totalItems} saved ${totalItems === 1 ? 'item' : 'items'}`;
        if (totalValueElement) {
            totalValueElement.textContent = `Total: ${totalValue.toLocaleString('vi-VN')}₫`;
        }
    }

    function updateNavFavCount() {
        const favorites = getFavorites();
        const navFavCount = document.getElementById('navFavCount');
        if (navFavCount) {
            navFavCount.textContent = favorites.length;
            navFavCount.classList.toggle('opacity-0', favorites.length === 0);
            navFavCount.classList.toggle('opacity-100', favorites.length > 0);
        }
    }
    
    // Hàm gắn sự kiện cho các nút trong danh sách sản phẩm (Remove, Add to Cart)
    function attachEventListeners() {
        // Remove buttons
        document.querySelectorAll('.remove-btn').forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                const favoriteItem = this.closest('.favorite-item');
                const id = favoriteItem.dataset.id;
                
                // Cập nhật LocalStorage (toàn bộ danh sách)
                let allFavorites = getFavorites();
                allFavorites = allFavorites.filter(item => String(item.id) !== String(id));
                localStorage.setItem('nike_favorites', JSON.stringify(allFavorites));

                // Cập nhật danh sách đang hiển thị (để xóa ngay lập tức trên UI)
                currentItems = currentItems.filter(item => String(item.id) !== String(id));
                
                // Add fade out animation
                favoriteItem.classList.add('opacity-0', 'scale-95');
                setTimeout(() => {
                    renderItems(currentItems);
                }, 300);
            });
        });
        
        // Add to cart buttons
        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', function() {
                const productCard = this.closest('.favorite-item');
                const productInfo = {
                    image: productCard.querySelector('img').src,
                    name: productCard.querySelector('h3').textContent,
                    category: productCard.querySelector('p').textContent,
                    price: productCard.querySelector('span.font-bold').textContent
                };
                
                openCartModal(productInfo);
            });
        });
    }

    // Hàm xử lý sắp xếp
    function sortItems(items, sortType) {
        const sorted = [...items];
        switch(sortType) {
            case 'price-asc':
                return sorted.sort((a, b) => {
                    return parseInt(a.price.replace(/[^\d]/g, '')) - parseInt(b.price.replace(/[^\d]/g, ''));
                });
            case 'price-desc':
                return sorted.sort((a, b) => {
                    return parseInt(b.price.replace(/[^\d]/g, '')) - parseInt(a.price.replace(/[^\d]/g, ''));
                });
            case 'name-asc':
                return sorted.sort((a, b) => a.name.localeCompare(b.name));
            case 'recent':
            default:
                return sorted.sort((a, b) => a.id - b.id);
        }
    }

    // Xử lý sự kiện Filter
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

    // Xử lý sự kiện Sort
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            currentItems = sortItems(currentItems, this.value);
            renderItems(currentItems);
        });
    }

    // Khởi tạo lần đầu
    renderItems(currentItems);
    renderSaleSidebar();
    
    // Like buttons in recommendations
    const likeButtons = document.querySelectorAll('.like-btn');
    likeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const isLiked = this.classList.contains('text-red-500');
            
            if (isLiked) {
                this.classList.remove('text-red-500');
                this.classList.add('text-gray-400');
                this.innerHTML = `
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                    </svg>
                `;
            } else {
                this.classList.remove('text-gray-400');
                this.classList.add('text-red-500');
                this.innerHTML = `
                    <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                    </svg>
                `;
                
                // Show notification
                const productName = this.closest('.flex.items-center').querySelector('.font-medium').textContent;
                alert(`"${productName}" has been added to your favorites!`);
            }
        });
    });
});