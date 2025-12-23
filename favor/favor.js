import { data } from '../home/mockupdata.js';

// Chuẩn bị dữ liệu: Thêm cờ 'onSale' cho sản phẩm đầu tiên để demo (vì mockupdata gốc chưa có)
const products = data.map((item, index) => ({
    ...item,
    onSale: index === 0, // Giả lập sản phẩm đầu tiên đang giảm giá
    category: item.category || "Shoes"
}));

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
    
    closeModalBtn.addEventListener('click', closeCartModal);
    continueShoppingBtn.addEventListener('click', closeCartModal);
    
    viewCartModalBtn.addEventListener('click', function() {
        alert('Redirecting to cart page...');
        closeCartModal();
    });
    
    checkoutModalBtn.addEventListener('click', function() {
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
    const filterButtons = document.querySelectorAll('.filter-btn');
    const sortSelect = document.getElementById('sortSelect');
    
    // Biến lưu trữ danh sách sản phẩm hiện tại đang hiển thị
    let currentItems = [...products];

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
                    <div class="favorite-item bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300 animate-slide-up" data-id="${item.id}">
                        <div class="relative">
                            <div class="aspect-square bg-gray-100 relative">
                                <img src="${item.image}" alt="${item.name}" class="w-full h-full object-contain p-4 transition-transform duration-300 hover:scale-105">
                                <button class="remove-btn absolute top-3 right-3 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-all duration-200 opacity-0 group-hover:opacity-100">
                                    <svg class="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </button>
                                ${item.onSale ? '<div class="absolute top-3 left-3"><span class="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">SALE</span></div>' : ''}
                            </div>
                        </div>
                        <div class="p-4">
                            <div class="flex justify-between items-start mb-2">
                                <div>
                                    <h3 class="font-medium text-gray-900 mb-1">${item.name}</h3>
                                    <p class="text-gray-600 text-sm mb-2">${item.category}</p>
                                </div>
                            </div>
                            <div class="flex justify-between items-center">
                                <div>
                                    <span class="font-bold text-gray-900">${item.price}</span>
                                </div>
                                <button class="add-to-cart-btn bg-black text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-gray-800 transition-colors duration-200">
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
    }

    // Hàm cập nhật tổng số lượng và giá tiền
    function updateSummary(items) {
        const totalItems = items.length;
        let totalValue = 0;
        
        items.forEach(item => {
            totalValue += parseInt(item.price.replace(/[^\d]/g, ''));
        });

        favoritesCount.textContent = `${totalItems} saved ${totalItems === 1 ? 'item' : 'items'}`;
        if (totalValueElement) {
            totalValueElement.textContent = `Total: ${totalValue.toLocaleString('vi-VN')}₫`;
        }
    }
    
    // Hàm gắn sự kiện cho các nút trong danh sách sản phẩm (Remove, Add to Cart)
    function attachEventListeners() {
        // Remove buttons
        document.querySelectorAll('.remove-btn').forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                const favoriteItem = this.closest('.favorite-item');
                const id = parseInt(favoriteItem.dataset.id);
                
                // Xóa khỏi danh sách hiện tại
                currentItems = currentItems.filter(item => item.id !== id);
                
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
                    name: productCard.querySelector('.font-medium.text-gray-900').textContent,
                    category: productCard.querySelector('.text-gray-600.text-sm').textContent,
                    price: productCard.querySelector('.font-bold.text-gray-900').textContent
                };
                
                openCartModal(productInfo);
            });
        });
        
        // Hover effects
        document.querySelectorAll('.favorite-item').forEach(item => {
            item.addEventListener('mouseenter', function() {
                const removeBtn = this.querySelector('.remove-btn');
                if (removeBtn) removeBtn.classList.remove('opacity-0');
            });
            
            item.addEventListener('mouseleave', function() {
                const removeBtn = this.querySelector('.remove-btn');
                if (removeBtn) removeBtn.classList.add('opacity-0');
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
            let filteredItems = [];
            
            if (filter === 'all') {
                filteredItems = [...products];
            } else if (filter === 'shoes') {
                filteredItems = products.filter(i => i.category.toLowerCase().includes('shoes'));
            } else if (filter === 'apparel') {
                filteredItems = products.filter(i => i.category.toLowerCase().includes('apparel') || i.category.toLowerCase().includes('clothing'));
            } else if (filter === 'sale') {
                filteredItems = products.filter(i => i.onSale);
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