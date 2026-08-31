// --- CONFIG API ---
const API_URL = "https://694a5ba81282f890d2d86de0.mockapi.io/api/v1/products";

// --- UTILS ---
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const parsePrice = (priceStr) => {
    if (typeof priceStr === 'number') return priceStr;
    if (!priceStr) return 0;
    return parseInt(priceStr.toString().replace(/[^\d]/g, '')) || 0;
};

// --- CORE LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const emptyState = document.getElementById('emptyState');
    const summarySubtotal = document.getElementById('summarySubtotal');
    const summaryTotal = document.getElementById('summaryTotal');
    const navCartCount = document.getElementById('navCartCount');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const toastContainer = document.getElementById('toastContainer');
    const recommendationGrid = document.getElementById('recommendationGrid');

    let rawCart = JSON.parse(localStorage.getItem('nike_cart')) || [];

    // --- RENDER CART & SUMMARY (Giữ nguyên logic cũ) ---
    
    function updateNavFavCount() {
        const favorites = JSON.parse(localStorage.getItem("nike_favorites")) || [];
        const navFavCount = document.getElementById("navFavCount");
        if (!navFavCount) return;
        navFavCount.textContent = favorites.length;
        if (favorites.length > 0) {
            navFavCount.classList.remove('opacity-0');
            navFavCount.classList.add('opacity-100');
        } else {
            navFavCount.classList.remove('opacity-100');
            navFavCount.classList.add('opacity-0');
        }
    }
    updateNavFavCount();

    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = `bg-black text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-toast-in min-w-[250px]`;
        toast.innerHTML = `<span class="text-sm font-bold">${message}</span>`;
        toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.classList.replace('animate-toast-in', 'animate-toast-out');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    function renderCart() {
        const groupedCart = rawCart.reduce((acc, item) => {
            const existingItem = acc.find(i => String(i.id) === String(item.id));
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                acc.push({ ...item, quantity: 1 });
            }
            return acc;
        }, []);

        if (groupedCart.length === 0) {
            cartItemsContainer.innerHTML = '';
            cartItemsContainer.classList.add('hidden');
            emptyState.classList.remove('hidden');
            checkoutBtn.disabled = true;
            summarySubtotal.textContent = formatCurrency(0);
            summaryTotal.textContent = formatCurrency(0);
            navCartCount.classList.add('opacity-0');
            return;
        }

        cartItemsContainer.classList.remove('hidden');
        emptyState.classList.add('hidden');
        checkoutBtn.disabled = false;
        
        navCartCount.textContent = rawCart.length;
        navCartCount.classList.remove('opacity-0');

        cartItemsContainer.innerHTML = groupedCart.map(item => {
            const unitPrice = parsePrice(item.price);
            return `
            <div class="flex gap-4 md:gap-6 py-6 border-b border-gray-100 animate-fade-in group">
                <div class="w-24 h-24 md:w-36 md:h-36 bg-[#f5f5f5] rounded-xl flex-shrink-0 overflow-hidden">
                    <img src="${item.image}" alt="${item.name}" class="w-full h-full object-contain mix-blend-multiply p-2 transition-transform duration-500 group-hover:scale-105">
                </div>
                <div class="flex-1 flex flex-col justify-between">
                    <div class="flex justify-between items-start gap-4">
                        <div>
                            <h3 class="font-medium text-gray-900 text-base md:text-lg hover:underline cursor-pointer">${item.name}</h3>
                            <p class="text-gray-500 text-sm mt-1">${item.category}</p>
                            ${item.tag ? `<p class="text-gray-500 text-sm mt-0.5 capitalize">${item.tag}</p>` : ''}
                        </div>
                        <p class="font-medium text-gray-900 text-sm md:text-base whitespace-nowrap">
                            ${formatCurrency(unitPrice * item.quantity)}
                        </p>
                    </div>
                    <div class="flex items-center gap-6 mt-4">
                        <div class="flex items-center gap-3">
                            <span class="text-gray-500 text-sm">Quantity</span>
                            <div class="flex items-center border border-gray-200 rounded-full h-8 px-2">
                                <button class="w-6 h-full flex items-center justify-center text-gray-500 hover:text-black" onclick="updateQuantity('${item.id}', -1)">−</button>
                                <span class="w-6 text-center text-sm font-medium">${item.quantity}</span>
                                <button class="w-6 h-full flex items-center justify-center text-gray-500 hover:text-black" onclick="updateQuantity('${item.id}', 1)">+</button>
                            </div>
                        </div>
                        <button class="text-gray-400 hover:text-red-500 p-2 transition-colors" onclick="removeItem('${item.id}')" aria-label="Remove item">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    </div>
                </div>
            </div>`;
        }).join('');

        const total = rawCart.reduce((sum, item) => sum + parsePrice(item.price), 0);
        summarySubtotal.textContent = formatCurrency(total);
        summaryTotal.textContent = formatCurrency(total);
    }

    // --- RECOMMENDATION LOGIC (MỚI THÊM) ---
    async function fetchRecommendations() {
        try {
            // Hiển thị skeleton loading
            if (recommendationGrid) {
                recommendationGrid.innerHTML = Array(4).fill(0).map(() => `
                    <div class="min-w-[200px] md:min-w-[250px] space-y-3">
                        <div class="bg-gray-200 h-60 w-full rounded-xl animate-pulse"></div>
                        <div class="bg-gray-200 h-4 w-3/4 rounded animate-pulse"></div>
                        <div class="bg-gray-200 h-4 w-1/2 rounded animate-pulse"></div>
                    </div>
                `).join('');
            }

            const res = await fetch(API_URL);
            if (!res.ok) throw new Error('Failed to load products');
            const products = await res.json();

            // Lấy ngẫu nhiên 4-8 sản phẩm (hoặc lọc theo tiêu chí)
            // Ở đây lấy 8 sản phẩm đầu tiên chưa có trong giỏ hàng
            const cartIds = rawCart.map(i => String(i.id));
            const recommended = products
                .filter(p => !cartIds.includes(String(p.id))) // Loại bỏ sp đã có trong giỏ
                .sort(() => 0.5 - Math.random()) // Trộn ngẫu nhiên
                .slice(0, 8); // Lấy 8 cái

            renderRecommendations(recommended);

        } catch (err) {
            console.error(err);
            if (recommendationGrid) recommendationGrid.innerHTML = '<p class="text-gray-500">Could not load recommendations.</p>';
        }
    }

    function renderRecommendations(items) {
        if (!recommendationGrid) return;
        
        if (items.length === 0) {
            recommendationGrid.innerHTML = '<p class="text-gray-500">No recommendations available.</p>';
            return;
        }

        recommendationGrid.innerHTML = items.map(product => {
            const priceDisplay = typeof product.price === "number" ? formatCurrency(product.price) : product.price;
            return `
            <div class="min-w-[200px] md:min-w-[250px] group cursor-pointer">
                <div class="relative bg-[#f5f5f5] rounded-xl overflow-hidden mb-3 aspect-square">
                    <img src="${product.image}" alt="${product.name}" class="w-full h-full object-contain mix-blend-multiply p-4 transition-transform duration-500 group-hover:scale-105">
                    <button onclick='addToCartFromRec(${JSON.stringify(product).replace(/'/g, "&#39;")})' 
                            class="absolute bottom-3 right-3 bg-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all hover:bg-black hover:text-white transform translate-y-2 group-hover:translate-y-0" title="Add to Bag">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                    </button>
                </div>
                <div>
                    <h4 class="font-medium text-gray-900 truncate hover:text-gray-600 transition-colors">${product.name}</h4>
                    <p class="text-gray-500 text-sm">${product.category}</p>
                    <p class="font-medium text-gray-900 mt-1">${priceDisplay}</p>
                </div>
            </div>
            `;
        }).join('');
    }

    // --- GLOBAL FUNCTIONS ---
    
    // Hàm thêm vào giỏ từ mục Recommendation
    window.addToCartFromRec = (product) => {
        rawCart.push(product);
        localStorage.setItem('nike_cart', JSON.stringify(rawCart));
        
        // Hiệu ứng và cập nhật UI
        showToast('Added to bag');
        renderCart();
        
        // Reload lại recommendation để loại bỏ sản phẩm vừa thêm (tùy chọn)
        // fetchRecommendations(); 
    };

    window.updateQuantity = (id, change) => {
        if (change === 1) {
            const itemToAdd = rawCart.find(i => String(i.id) === String(id));
            if (itemToAdd) rawCart.push(itemToAdd);
        } else if (change === -1) {
            const indexToRemove = rawCart.findIndex(i => String(i.id) === String(id));
            if (indexToRemove !== -1) rawCart.splice(indexToRemove, 1);
        }
        saveAndRefresh();
    };

    window.removeItem = (id) => {
        rawCart = rawCart.filter(i => String(i.id) !== String(id));
        showToast('Item removed from bag');
        saveAndRefresh();
    };

    function saveAndRefresh() {
        localStorage.setItem('nike_cart', JSON.stringify(rawCart));
        renderCart();
    }

    checkoutBtn.addEventListener('click', () => {
        alert('Proceeding to checkout...\nTotal: ' + summaryTotal.textContent);
    });

    // --- INIT ---
    renderCart();
    fetchRecommendations(); // Gọi hàm lấy sản phẩm gợi ý
});