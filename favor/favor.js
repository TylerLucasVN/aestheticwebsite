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
    const removeButtons = document.querySelectorAll('.remove-btn');
    const favoritesCount = document.getElementById('favoritesCount');
    const totalValueElement = document.getElementById('totalValue');
    const emptyState = document.getElementById('emptyState');
    const favoritesGrid = document.getElementById('favoritesGrid');
    
    // Tự động tính toán số lượng và tổng tiền từ HTML hiện có
    let totalItems = 0;
    let totalValue = 0;

    document.querySelectorAll('.favorite-item').forEach(item => {
        totalItems++;
        const priceText = item.querySelector('.font-bold.text-gray-900').textContent;
        totalValue += parseInt(priceText.replace(/[^\d]/g, ''));
    });
    
    function updateSummary() {
        favoritesCount.textContent = `${totalItems} saved ${totalItems === 1 ? 'item' : 'items'}`;
        if (totalValueElement) {
            totalValueElement.textContent = `Total: ${totalValue.toLocaleString('vi-VN')}₫`;
        }
        
        if (totalItems === 0) {
            emptyState.classList.remove('hidden');
            favoritesGrid.classList.add('hidden');
        } else {
            emptyState.classList.add('hidden');
            favoritesGrid.classList.remove('hidden');
        }
    }
    
    // Remove individual items
    removeButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const favoriteItem = this.closest('.favorite-item');
            const priceElement = favoriteItem.querySelector('.font-bold.text-gray-900');
            
            if (priceElement) {
                const priceText = priceElement.textContent;
                const price = parseInt(priceText.replace(/[^\d]/g, ''));
                
                totalValue -= price;
                totalItems--;
                
                // Add fade out animation
                favoriteItem.classList.add('opacity-0', 'scale-95');
                setTimeout(() => {
                    favoriteItem.remove();
                    updateSummary();
                }, 300);
            }
        });
    });
    
    // Add to cart buttons
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    addToCartButtons.forEach(button => {
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
    
    // ======================
    // HOVER EFFECTS
    // ======================
    const favoriteItems = document.querySelectorAll('.favorite-item');
    favoriteItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            const removeBtn = this.querySelector('.remove-btn');
            if (removeBtn) {
                removeBtn.classList.remove('opacity-0');
            }
        });
        
        item.addEventListener('mouseleave', function() {
            const removeBtn = this.querySelector('.remove-btn');
            if (removeBtn) {
                removeBtn.classList.add('opacity-0');
            }
        });
    });
});