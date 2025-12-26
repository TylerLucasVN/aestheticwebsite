import { data } from '../mockupdata.js';
import { Auth } from '../auth/authOverlay.js';

document.addEventListener('DOMContentLoaded', function() {
    const productsGrid = document.getElementById('productsGrid');
    const productsCount = document.getElementById('productsCount');
    const sortSelect = document.getElementById('sortSelect');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const navFavCount = document.getElementById('navFavCount');
    const emptyState = document.getElementById('emptyState');

    let currentProducts = [...data];

    // Khởi tạo
    renderProducts(currentProducts);
    updateNavFavCount();

    // Hàm hiển thị sản phẩm
    function renderProducts(items) {
        productsGrid.innerHTML = '';
        
        // Cập nhật số lượng
        productsCount.textContent = `${items.length} Products`;

        if (items.length === 0) {
            productsGrid.classList.add('hidden');
            emptyState.classList.remove('hidden');
            return;
        }

        productsGrid.classList.remove('hidden');
        emptyState.classList.add('hidden');

        // Lấy danh sách yêu thích để kiểm tra trạng thái tim
        const favorites = JSON.parse(localStorage.getItem('nike_favorites')) || [];

        items.forEach(product => {
            const isFav = favorites.some(f => f.id === product.id);
            
            const productHTML = `
                <div class="group animate-fade-in">
                    <div class="relative bg-gray-100 rounded-xl overflow-hidden aspect-square mb-4">
                        <img src="${product.image}" alt="${product.name}" class="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105 mix-blend-multiply">
                        
                        <!-- Favorite Button -->
                        <button class="fav-btn absolute top-3 right-3 p-2 rounded-full bg-white shadow-sm hover:bg-gray-50 transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100" data-id="${product.id}">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transition-colors duration-200 ${isFav ? 'text-red-500 fill-current' : 'text-gray-400'}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </button>

                        ${product.tag === 'sale' ? '<span class="absolute top-3 left-3 bg-white px-2 py-1 text-xs font-bold rounded text-red-600">Sale</span>' : ''}
                    </div>
                    
                    <div class="space-y-1">
                        <h3 class="font-medium text-gray-900 text-base">${product.name}</h3>
                        <p class="text-gray-500 text-sm">${product.category}</p>
                        <p class="font-semibold text-gray-900 pt-1">${product.price}</p>
                    </div>
                </div>
            `;
            productsGrid.insertAdjacentHTML('beforeend', productHTML);
        });

        // Gắn sự kiện click cho nút tim
        document.querySelectorAll('.fav-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const id = parseInt(this.dataset.id);
                const product = data.find(p => p.id === id);
                
                Auth.requireAuth(() => {
                    toggleFavorite(product, this);
                });
            });
        });
    }

    // Hàm xử lý Filter
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Style active button
            filterButtons.forEach(b => {
                b.classList.remove('bg-black', 'text-white');
                b.classList.add('bg-gray-100', 'text-gray-800');
            });
            btn.classList.remove('bg-gray-100', 'text-gray-800');
            btn.classList.add('bg-black', 'text-white');

            const filter = btn.dataset.filter;
            if (filter === 'all') {
                currentProducts = [...data];
            } else if (filter === 'shoes') {
                currentProducts = data.filter(p => p.category.toLowerCase().includes('shoes'));
            } else if (filter === 'apparel') {
                currentProducts = data.filter(p => !p.category.toLowerCase().includes('shoes'));
            }
            
            // Reset sort khi filter
            sortSelect.value = 'default';
            renderProducts(currentProducts);
        });
    });

    // Hàm xử lý Sort
    sortSelect.addEventListener('change', function() {
        const value = this.value;
        let sorted = [...currentProducts];

        if (value === 'price-asc') {
            sorted.sort((a, b) => parseInt(a.price.replace(/[^\d]/g, '')) - parseInt(b.price.replace(/[^\d]/g, '')));
        } else if (value === 'price-desc') {
            sorted.sort((a, b) => parseInt(b.price.replace(/[^\d]/g, '')) - parseInt(a.price.replace(/[^\d]/g, '')));
        } else if (value === 'name-asc') {
            sorted.sort((a, b) => a.name.localeCompare(b.name));
        }
        
        renderProducts(sorted);
    });

    // Logic Toggle Favorite (Giống trang chủ)
    function toggleFavorite(product, btnElement) {
        let favorites = JSON.parse(localStorage.getItem('nike_favorites')) || [];
        const index = favorites.findIndex(f => f.id === product.id);
        const svg = btnElement.querySelector('svg');

        if (index === -1) {
            favorites.push(product);
            svg.classList.remove('text-gray-400');
            svg.classList.add('text-red-500', 'fill-current');
        } else {
            favorites.splice(index, 1);
            svg.classList.remove('text-red-500', 'fill-current');
            svg.classList.add('text-gray-400');
        }
        localStorage.setItem('nike_favorites', JSON.stringify(favorites));
        updateNavFavCount();
    }

    function updateNavFavCount() {
        const favorites = JSON.parse(localStorage.getItem('nike_favorites')) || [];
        if (favorites.length > 0) {
            navFavCount.textContent = favorites.length;
            navFavCount.classList.remove('opacity-0');
        } else {
            navFavCount.classList.add('opacity-0');
        }
    }
});