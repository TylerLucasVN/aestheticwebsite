const API_URL = "https://694a5ba81282f890d2d86de0.mockapi.io/api/v1/products";
let allProducts = [];
let filteredProducts = [];

const parsePrice = (p) => typeof p === 'number' ? p : parseInt(String(p).replace(/[^\d]/g, '')) || 0;

document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    setupEventListeners();
    updateNavFavCount();
});

async function fetchProducts() {
    const countLabel = document.getElementById('productsCount');
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Network response was not ok');
        allProducts = await response.json();
        filteredProducts = [...allProducts];
        renderProducts(filteredProducts);
    } catch (error) {
        console.error("Error:", error);
        countLabel.textContent = "Failed to load products.";
    }
}

function renderProducts(products) {
    const grid = document.getElementById('productsGrid');
    const countLabel = document.getElementById('productsCount');
    const emptyState = document.getElementById('emptyState');
    const favorites = JSON.parse(localStorage.getItem('nike_favorites')) || [];

    grid.innerHTML = '';
    countLabel.textContent = `${products.length} Results`;

    if (products.length === 0) {
        grid.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }

    grid.classList.remove('hidden');
    emptyState.classList.add('hidden');

    products.forEach(product => {
        const isFavorite = favorites.some(fav => String(fav.id) === String(product.id));
        const card = document.createElement('div');
        card.className = "product-card animate-fade-in group";
        
        const priceDisplay = typeof product.price === 'number' 
            ? product.price.toLocaleString('vi-VN') + '₫' 
            : product.price;

        card.innerHTML = `
            <div class="relative bg-gray-100 rounded-xl overflow-hidden mb-4 aspect-square">
                <img src="${product.image}" alt="${product.name}" class="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105">
                <button class="fav-btn absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-all z-10">
                    <svg class="h-5 w-5 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                    </svg>
                </button>
            </div>
            <div class="space-y-1">
                <h3 class="font-medium text-gray-900">${product.name}</h3>
                <p class="text-gray-500 text-sm">${product.category}</p>
                <p class="font-bold text-gray-900 mt-2">${priceDisplay}</p>
            </div>
        `;

        card.querySelector('.fav-btn').addEventListener('click', (e) => {
            e.preventDefault();
            toggleFavorite(product, e.currentTarget);
        });

        grid.appendChild(card);
    });
}

function toggleFavorite(product, btn) {
    let favorites = JSON.parse(localStorage.getItem('nike_favorites')) || [];
    const index = favorites.findIndex(f => String(f.id) === String(product.id));
    const svg = btn.querySelector('svg');

    if (index === -1) {
        favorites.push(product);
        svg.classList.add('text-red-500', 'fill-current');
        svg.classList.remove('text-gray-400');
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
    const navFavCount = document.getElementById('navFavCount');
    if (navFavCount) {
        navFavCount.textContent = favorites.length;
        navFavCount.classList.toggle('opacity-0', favorites.length === 0);
        navFavCount.classList.toggle('opacity-100', favorites.length > 0);
    }
}

function setupEventListeners() {
    // Filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => {
                b.classList.replace('bg-black', 'bg-gray-100');
                b.classList.replace('text-white', 'text-gray-800');
            });
            btn.classList.replace('bg-gray-100', 'bg-black');
            btn.classList.replace('text-gray-800', 'text-white');

            const filter = btn.dataset.filter;
            filteredProducts = filter === 'all' 
                ? [...allProducts] 
                : allProducts.filter(p => p.category.toLowerCase().includes(filter));
            renderProducts(filteredProducts);
        });
    });

    // Sort
    document.getElementById('sortSelect').addEventListener('change', (e) => {
        const val = e.target.value;
        if (val === 'price-asc') {
            filteredProducts.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
        } else if (val === 'price-desc') {
            filteredProducts.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
        } else if (val === 'name-asc') {
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        }
        renderProducts(filteredProducts);
    });
}