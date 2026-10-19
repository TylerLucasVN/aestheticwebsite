import { trackEvent } from './monitoring.js';
const API_URL = "http://localhost:5000/api/v1/products";

// --- 1. CẬP NHẬT NAV ---
function updateNavFavCount() {
  const favorites = JSON.parse(localStorage.getItem("nike_favorites")) || [];
  const navFavCount = document.getElementById("navFavCount");

  if (!navFavCount) return;

  navFavCount.textContent = favorites.length;
  navFavCount.classList.toggle("opacity-0", favorites.length === 0);
  navFavCount.classList.toggle("opacity-100", favorites.length > 0);
}

function updateNavCartCount() {
  const cart = JSON.parse(localStorage.getItem('nike_cart')) || [];
  const navCartCount = document.getElementById('navCartCount');

  // Tính tổng dựa trên quantity
  const totalItems = cart.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0);

  if (navCartCount) {
    navCartCount.innerText = totalItems;
    navCartCount.classList.toggle("opacity-0", totalItems === 0);
    navCartCount.classList.toggle("opacity-100", totalItems > 0);
  }
}

// --- 2. LOGIC MODAL ---
window.closeCartModal = function () {
  const modal = document.getElementById('cartModal');
  const backdrop = document.getElementById('cartModalBackdrop');
  const panel = document.getElementById('cartModalPanel');
  if (!modal) return;

  backdrop.classList.add('opacity-0');
  panel.classList.remove('opacity-100', 'scale-100');
  panel.classList.add('opacity-0', 'scale-95');

  setTimeout(() => {
    modal.classList.add('hidden');
  }, 300);
}

function showCartModal(product) {
  const modal = document.getElementById('cartModal');
  const backdrop = document.getElementById('cartModalBackdrop');
  const panel = document.getElementById('cartModalPanel');

  if (!modal) return;

  document.getElementById('modalImg').src = product.image;
  document.getElementById('modalName').innerText = product.name;
  document.getElementById('modalCategory').innerText = product.category;

  const tagEl = document.getElementById('modalTag');
  if (product.price) {
    const priceDisplay = typeof product.price === 'number'
      ? product.price.toLocaleString('vi-VN') + '₫'
      : product.price;
    tagEl.innerText = priceDisplay;
    tagEl.classList.remove('hidden');
  }

  const viewCartBtn = panel.querySelectorAll('button')[1];
  const checkoutBtn = panel.querySelectorAll('button')[2];

  if (viewCartBtn) viewCartBtn.setAttribute('onclick', "window.location.href='pages/cart/cart.html'");
  if (checkoutBtn) checkoutBtn.setAttribute('onclick', "window.location.href='pages/cart/cart.html'");

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

// --- 4. RENDER GIAO DIỆN ---
function renderProducts(data) {
  const container = document.getElementById("scrollContainer");
  if (!container) return;
  const favorites = JSON.parse(localStorage.getItem('nike_favorites')) || [];

  let htmlContent = "";

  data.forEach(product => {
    const prodId = product.id || product._id;
    const isFavorite = favorites.some(fav => String(fav.id || fav._id) === String(prodId));
    const priceDisplay = typeof product.price === 'number'
      ? product.price.toLocaleString('vi-VN') + '₫'
      : product.price;

    htmlContent += `
      <div class="product-card flex-shrink-0 w-64 md:w-72 cursor-pointer group relative" data-id="${prodId}">
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

  // Gán sự kiện click cho giỏ hàng, tym và chuyển trang chi tiết
  data.forEach(product => {
    const prodId = product.id || product._id;
    const card = container.querySelector(`[data-id="${prodId}"]`);
    if (!card) return;

    const favBtn = card.querySelector('.fav-btn');
    const cartBtn = card.querySelector('.cart-btn');

    card.addEventListener('click', (e) => {
      if (!e.target.closest('.fav-btn') && !e.target.closest('.cart-btn')) {
        if (window.trackEvent) trackEvent('product_click', { product_id: prodId, product_name: product.name });
        localStorage.setItem('nike_selected_product', JSON.stringify(product));
        window.location.href = `pages/detail/detail.html?id=${prodId}`;
      }
    });

    cartBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      cartBtn.classList.add('scale-90');
      setTimeout(() => cartBtn.classList.remove('scale-90'), 150);

      let cart = JSON.parse(localStorage.getItem('nike_cart')) || [];
      const existingItem = cart.find(item => String(item.id || item._id) === String(prodId));

      if (existingItem) {
        existingItem.quantity = (parseInt(existingItem.quantity) || 1) + 1;
      } else {
        cart.push({ ...product, quantity: 1 });
      }

      localStorage.setItem('nike_cart', JSON.stringify(cart));
      updateNavCartCount();
      showCartModal(product);
    });

    favBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorite(product, favBtn);
    });
  });
}

function renderSpotlight(data) {
  const spotlightContainer = document.getElementById('spotlightContainer');
  if (!spotlightContainer || data.length === 0) return;

  spotlightContainer.innerHTML = "";

  data.forEach(product => {
    const prodId = product.id || product._id;
    const spotlightItem = document.createElement('div');
    spotlightItem.className = "flex-shrink-0 w-48 sm:w-56 text-center group cursor-pointer";

    spotlightItem.innerHTML = `
          <div class="bg-[#f5f5f5] rounded-2xl h-56 flex items-center justify-center p-6 mb-4 group-hover:bg-gray-200 transition duration-300 relative overflow-hidden">
              <img src="${product.image}" alt="${product.name}" class="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition duration-500">
              ${product.tag ? `<span class="absolute top-2 left-2 bg-white/90 px-2 py-0.5 text-[9px] font-bold uppercase rounded shadow-sm">${product.tag}</span>` : ''}
          </div>
          <h3 class="font-bold text-gray-900 text-sm md:text-base group-hover:text-gray-600 transition truncate px-1">${product.name}</h3>
          <p class="text-gray-500 text-xs mt-0.5">${product.category}</p>
      `;

    spotlightItem.addEventListener('click', () => {
      localStorage.setItem('nike_selected_product', JSON.stringify(product));
      window.location.href = `pages/detail/detail.html?id=${prodId}`;
    });

    spotlightContainer.appendChild(spotlightItem);
  });
}

// Logic Slider
function initSliders() {
  const scrollContainer = document.getElementById('scrollContainer');
  const btnNext = document.getElementById('btnNext');
  const btnPrev = document.getElementById('btnPrev');

  if (scrollContainer && btnNext && btnPrev) {
    const scrollAmount = 320;
    btnNext.addEventListener('click', () => scrollContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' }));
    btnPrev.addEventListener('click', () => scrollContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' }));
  }

  const spotlightContainer = document.getElementById('spotlightContainer');
  const spotlightNext = document.getElementById('spotlightNext');
  const spotlightPrev = document.getElementById('spotlightPrev');

  if (spotlightContainer && spotlightNext && spotlightPrev) {
    const scrollStep = 260;
    spotlightNext.addEventListener('click', () => spotlightContainer.scrollBy({ left: scrollStep, behavior: 'smooth' }));
    spotlightPrev.addEventListener('click', () => spotlightContainer.scrollBy({ left: -scrollStep, behavior: 'smooth' }));
  }
}

// --- UTILS ---
function toggleFavorite(product, btnElement) {
  let favorites = JSON.parse(localStorage.getItem('nike_favorites')) || [];
  const prodId = product.id || product._id;
  const index = favorites.findIndex(f => String(f.id || f._id) === String(prodId));
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

function filterByTag(data, tag) {
  if (!tag) return data;
  const searchTag = tag.toLowerCase();
  return data.filter(item => {
    const itemTag = item.tag ? String(item.tag).toLowerCase() : "";
    return itemTag.includes(searchTag);
  });
}

// --- 5. INITIALIZE ---
function init() {
  const container = document.getElementById("scrollContainer");
  const spotlightContainer = document.getElementById("spotlightContainer");

  if (container) container.innerHTML = '<div class="text-gray-500 p-10">Loading...</div>';
  if (spotlightContainer) spotlightContainer.innerHTML = '<div class="text-gray-500 py-10 text-sm">Loading spotlight products...</div>';

  getProducts()
    .then(function (products) {
      if (container) container.innerHTML = '';

      // Render 2 section bằng cùng 1 data fetched (Không gọi API 2 lần)
      renderProducts(filterByTag(products, "trending"));
      renderSpotlight(products);

      // Kích hoạt slider
      initSliders();

      // Cập nhật badges
      updateNavCartCount();
      updateNavFavCount();

      const cartBackdrop = document.getElementById('cartModalBackdrop');
      if (cartBackdrop) cartBackdrop.addEventListener('click', window.closeCartModal);
    })
    .catch(function (error) {
      console.error("Lỗi:", error);
      if (container) container.innerHTML = '<div class="text-red-500 p-10">Failed to load products.</div>';
      if (spotlightContainer) spotlightContainer.innerHTML = '<div class="text-red-500 py-10 text-sm">Failed to load spotlight.</div>';
    });
}

init();