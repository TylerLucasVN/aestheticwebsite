//import {data} from './mockupdata.js';
import { trackEvent } from './monitoring.js';
const API_URL = "https://694a5ba81282f890d2d86de0.mockapi.io/api/v1/products";

// Cập nhật số lượng YÊU THÍCH (Theo yêu cầu của bạn)
function updateNavFavCount() {
  const favorites = JSON.parse(localStorage.getItem("nike_favorites")) || [];
  const navFavCount = document.getElementById("navFavCount");
  
  if (!navFavCount) return;
  
  navFavCount.textContent = favorites.length;
  // Logic ẩn hiện badge
  navFavCount.classList.toggle("opacity-0", favorites.length === 0);
  navFavCount.classList.toggle("opacity-100", favorites.length > 0);
}

// Cập nhật số lượng GIỎ HÀNG
function updateNavCartCount() {
    const cart = JSON.parse(localStorage.getItem('nike_cart')) || [];
    // Tìm thẻ span số lượng trong nav (ở trang index)
    const navCartCount = document.getElementById('navCartCount');
    
    if (navCartCount) {
        const count = cart.length; 
        navCartCount.innerText = count;
        navCartCount.classList.toggle("opacity-0", count === 0);
        navCartCount.classList.toggle("opacity-100", count > 0);
    }
}

// --- 2. LOGIC MODAL (ADDED TO CART) ---

// Đóng Modal
window.closeCartModal = function() {
    const modal = document.getElementById('cartModal');
    const backdrop = document.getElementById('cartModalBackdrop');
    const panel = document.getElementById('cartModalPanel');
    if(!modal) return;

    backdrop.classList.add('opacity-0');
    panel.classList.remove('opacity-100', 'scale-100');
    panel.classList.add('opacity-0', 'scale-95');
    
    setTimeout(() => { 
        modal.classList.add('hidden'); 
    }, 300);
}

// Hiển thị Modal
function showCartModal(product) {
    const modal = document.getElementById('cartModal');
    const backdrop = document.getElementById('cartModalBackdrop');
    const panel = document.getElementById('cartModalPanel');
    
    if(!modal) {
        console.warn("Thiếu HTML Modal trong index.html");
        return;
    }

    // Điền thông tin sản phẩm vào Modal
    document.getElementById('modalImg').src = product.image;
    document.getElementById('modalName').innerText = product.name;
    document.getElementById('modalCategory').innerText = product.category;
    
    // Xử lý Tag (SALE)
    const tagEl = document.getElementById('modalTag');
    if (product.tag) { 
        tagEl.innerText = product.tag; 
        tagEl.classList.remove('hidden'); 
    } else { 
        tagEl.classList.add('hidden'); 
    }

    // Hiệu ứng hiện Modal
    modal.classList.remove('hidden');
    setTimeout(() => {
        backdrop.classList.remove('opacity-0');
        panel.classList.remove('opacity-0', 'scale-95');
        panel.classList.add('opacity-100', 'scale-100');
    }, 10);
}

// --- 3. FETCH DATA ---

function getProducts() {
  return new Promise(function (resolve, reject) {
    fetch(API_URL)
      .then(response => response.ok ? response.json() : reject("Không thể lấy dữ liệu"))
      .then(data => resolve(data))
      .catch(error => reject(error));
  });
}

export default getProducts;

// --- 4. RENDER SẢN PHẨM ---

function renderProducts(data) {
  const container = document.getElementById("scrollContainer");
  const favorites = JSON.parse(localStorage.getItem('nike_favorites')) || [];
  
  let htmlContent = "";

  data.forEach(product => {
    const isFavorite = favorites.some(fav => String(fav.id) === String(product.id));
    const priceDisplay = typeof product.price === 'number' 
        ? product.price.toLocaleString('vi-VN') + '₫' 
        : product.price;

    htmlContent += `
      <div class="product-card flex-shrink-0 w-64 md:w-72 cursor-pointer group relative" data-id="${product.id}">
        
        <div class="card-img-wrap bg-gray-100 rounded-xl overflow-hidden mb-4 relative transition-transform duration-300">
            <img src="${product.image}" alt="${product.name}" class="w-full h-auto object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105" loading="lazy">
             
            <button class="fav-btn absolute top-3 right-3 p-2.5 rounded-full bg-white shadow-md hover:bg-gray-50 transition-all duration-200 z-20 opacity-0 group-hover:opacity-100 focus:opacity-100">
                <svg class="h-5 w-5 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'}" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            </button>

            <button class="cart-btn absolute top-16 right-3 p-2.5 rounded-full bg-white text-gray-900 shadow-md hover:bg-gray-100 transition-all duration-300 z-20 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0" title="Add to Cart">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            </button>
        </div>

        <div class="card-info px-1">
            <div class="p-name font-medium text-gray-900 mb-1 truncate">${product.name}</div>
            <div class="p-cat text-gray-600 text-sm mb-2">${product.category}</div>
            <div class="p-price font-bold text-gray-900">
                ${priceDisplay}
            </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = htmlContent;

  // Gán sự kiện Click
  data.forEach(product => {
    const card = container.querySelector(`[data-id="${product.id}"]`);
    const favBtn = card.querySelector('.fav-btn');
    const cartBtn = card.querySelector('.cart-btn');

    // 1. Sự kiện click vào thẻ sản phẩm (theo dõi tracking)
    card.addEventListener('click', (e) => {
        if (!e.target.closest('.fav-btn') && !e.target.closest('.cart-btn')) {
             trackEvent('product_click', { product_id: product.id, product_name: product.name });
        }
    });

    // 2. Sự kiện Thêm vào Giỏ hàng
    cartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Hiệu ứng nút nảy
        cartBtn.classList.add('scale-90');
        setTimeout(() => cartBtn.classList.remove('scale-90'), 150);

        // Lưu vào LocalStorage
        let cart = JSON.parse(localStorage.getItem('nike_cart')) || [];
        cart.push(product);
        localStorage.setItem('nike_cart', JSON.stringify(cart));
        
        // Cập nhật số lượng và hiện Modal
        updateNavCartCount();
        showCartModal(product);
    });

    // 3. Sự kiện Yêu thích
    favBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorite(product, favBtn);
    });
  });
}

function toggleFavorite(product, btnElement) {
  let favorites = JSON.parse(localStorage.getItem('nike_favorites')) || [];
  const index = favorites.findIndex(f => String(f.id) === String(product.id));
  const svg = btnElement.querySelector('svg');

  if (index === -1) {
    favorites.push(product);
    svg.classList.remove('text-gray-400');
    svg.classList.add('text-red-500', 'fill-current');
    trackEvent('add_to_favorites', { product_id: product.id, product_name: product.name });
  } else {
    favorites.splice(index, 1);
    svg.classList.remove('text-red-500', 'fill-current');
    svg.classList.add('text-gray-400');
  }
  localStorage.setItem('nike_favorites', JSON.stringify(favorites));
  
  // Cập nhật số lượng yêu thích ngay lập tức
  updateNavFavCount();
}

function filterByTag(data, tag) {
  if (!tag) return data;
  return data.filter(item => item.tag === tag);
}

function init() {
  const container = document.getElementById("scrollContainer");
  if (container) container.innerHTML = '<div class="text-gray-500 p-10">Loading trending products...</div>';

  getProducts()
    .then(function(products) {
      if (container) container.innerHTML = ''; 
      renderProducts(filterByTag(products, "trending"));
      
      // Gọi cập nhật số lượng khi load trang
      updateNavCartCount(); 
      updateNavFavCount(); // Gọi hàm này như yêu cầu
      
      // Đóng modal khi click ra vùng đen
      const cartBackdrop = document.getElementById('cartModalBackdrop');
      if(cartBackdrop) cartBackdrop.addEventListener('click', window.closeCartModal);
    })
    .catch(function(error) {
      console.error("Lỗi:", error);
      if (container) container.innerHTML = '<div class="text-red-500 p-10">Failed to load products.</div>';
    });
}

init();