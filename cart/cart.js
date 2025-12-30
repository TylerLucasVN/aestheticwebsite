// --- UTILS ---
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const parsePrice = (priceStr) => {
    if (typeof priceStr === 'number') return priceStr;
    if (!priceStr) return 0;
    // Loại bỏ mọi ký tự không phải số
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

    // Lấy dữ liệu từ LocalStorage
    // Lưu ý: search.js push thẳng object vào mảng, nên ta cần gom nhóm (group) lại.
    let rawCart = JSON.parse(localStorage.getItem('nike_cart')) || [];

    function updateNavFavCount() {
        const favorites = JSON.parse(localStorage.getItem("nike_favorites")) || [];
        const navFavCount = document.getElementById("navFavCount");
        
        if (!navFavCount) return; // Nếu không tìm thấy icon thì thoát
        
        navFavCount.textContent = favorites.length;
        
        // Ẩn/Hiện badge dựa trên số lượng
        if (favorites.length > 0) {
            navFavCount.classList.remove('opacity-0');
            navFavCount.classList.add('opacity-100');
        } else {
            navFavCount.classList.remove('opacity-100');
            navFavCount.classList.add('opacity-0');
        }
    }
    updateNavFavCount();
    // Hàm hiển thị Toast
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

    // Hàm render chính
    function renderCart() {
        // 1. Gom nhóm sản phẩm giống nhau (dựa trên ID) để tính số lượng
        const groupedCart = rawCart.reduce((acc, item) => {
            const existingItem = acc.find(i => String(i.id) === String(item.id));
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                acc.push({ ...item, quantity: 1 });
            }
            return acc;
        }, []);

        // 2. Cập nhật UI trạng thái trống/có hàng
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
        
        // Cập nhật số lượng trên nav
        navCartCount.textContent = rawCart.length;
        navCartCount.classList.remove('opacity-0');

        // 3. Render danh sách item
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
                                <button class="w-6 h-full flex items-center justify-center text-gray-500 hover:text-black" 
                                        onclick="updateQuantity('${item.id}', -1)">−</button>
                                <span class="w-6 text-center text-sm font-medium">${item.quantity}</span>
                                <button class="w-6 h-full flex items-center justify-center text-gray-500 hover:text-black" 
                                        onclick="updateQuantity('${item.id}', 1)">+</button>
                            </div>
                        </div>

                        <button class="text-gray-400 hover:text-red-500 p-2 transition-colors" 
                                onclick="removeItem('${item.id}')" aria-label="Remove item">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            `;
        }).join('');

        // 4. Tính toán Summary
        const total = rawCart.reduce((sum, item) => sum + parsePrice(item.price), 0);
        summarySubtotal.textContent = formatCurrency(total);
        summaryTotal.textContent = formatCurrency(total);
    }

    // --- GLOBAL FUNCTIONS (được gắn vào window để gọi từ HTML) ---

    // Thay đổi số lượng
    window.updateQuantity = (id, change) => {
        if (change === 1) {
            // Tìm item mẫu để thêm vào
            const itemToAdd = rawCart.find(i => String(i.id) === String(id));
            if (itemToAdd) {
                rawCart.push(itemToAdd);
            }
        } else if (change === -1) {
            // Tìm vị trí item cần xóa (chỉ xóa 1 instance)
            const indexToRemove = rawCart.findIndex(i => String(i.id) === String(id));
            if (indexToRemove !== -1) {
                rawCart.splice(indexToRemove, 1);
            }
        }
        
        saveAndRefresh();
    };

    // Xóa toàn bộ sản phẩm đó
    window.removeItem = (id) => {
        rawCart = rawCart.filter(i => String(i.id) !== String(id));
        showToast('Item removed from bag');
        saveAndRefresh();
    };

    function saveAndRefresh() {
        localStorage.setItem('nike_cart', JSON.stringify(rawCart));
        renderCart();
    }

    // Nút Checkout
    checkoutBtn.addEventListener('click', () => {
        alert('Proceeding to checkout...\nTotal: ' + summaryTotal.textContent);
    });

    // --- INIT ---
    renderCart();
});