// =======================
// API & GLOBAL VARIABLES
// =======================
const API_URL = "https://694a5ba81282f890d2d86de0.mockapi.io/api/v1/products";

let allProducts = [];
let filteredProducts = [];

// =======================
// UTILS
// =======================
function parsePrice(price) {
  if (typeof price === "number") return price;
  return parseInt(price.replace(/[^\d]/g, "")) || 0;
}

// =======================
// INIT APP
// =======================
document.addEventListener("DOMContentLoaded", () => {
  fetchProducts();
  setupEventListeners();
  updateNavFavCount();
  updateNavCartCount(); // Cập nhật số lượng giỏ hàng khi load
  
  const cartBackdrop = document.getElementById('cartModalBackdrop');
  if(cartBackdrop) cartBackdrop.addEventListener('click', window.closeCartModal);
});

async function fetchProducts() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Fetch failed");
    allProducts = await res.json();
    filteredProducts = [...allProducts];
    renderProducts(filteredProducts);
  } catch (err) {
    console.error(err);
    document.getElementById("productsCount").textContent = "Failed to load products";
  }
}

// =======================
// CART & MODAL LOGIC
// =======================
function getCart() {
    return JSON.parse(localStorage.getItem('nike_cart')) || [];
}

function updateNavCartCount() {
    const cart = getCart();
    // Tìm thẻ span theo ID vừa thêm
    const navCartCount = document.getElementById("navCartCount");
    
    if (navCartCount) {
        const count = cart.length; 
        navCartCount.innerText = count;
        
        // Logic ẩn hiện: Nếu > 0 thì hiện, = 0 thì ẩn
        if (count > 0) {
            navCartCount.classList.remove("opacity-0");
            navCartCount.classList.add("opacity-100");
        } else {
            navCartCount.classList.remove("opacity-100");
            navCartCount.classList.add("opacity-0");
        }
    }
}

// Hàm thêm vào giỏ hàng (Gán vào window để HTML gọi được)
window.handleAddToCart = function(event, btn, productId) {
    event.preventDefault();
    event.stopPropagation();
    
    // Hiệu ứng click
    btn.classList.add('scale-90');
    setTimeout(() => btn.classList.remove('scale-90'), 150);

    let cart = getCart();
    // Tìm sản phẩm trong danh sách đã tải
    const product = allProducts.find(p => String(p.id) === String(productId));
    
    if(product) {
        cart.push(product);
        localStorage.setItem('nike_cart', JSON.stringify(cart));
        updateNavCartCount(); // Cập nhật badge
        showCartModal(product); // Hiện modal
    }
}

// --- MODAL FUNCTIONS ---
function showCartModal(product) {
    const modal = document.getElementById('cartModal');
    const backdrop = document.getElementById('cartModalBackdrop');
    const panel = document.getElementById('cartModalPanel');

    if(!modal) return;

    document.getElementById('modalImg').src = product.image;
    document.getElementById('modalName').innerText = product.name;
    document.getElementById('modalCategory').innerText = product.category;
    
    const tagEl = document.getElementById('modalTag');
    if (product.tag) { tagEl.innerText = product.tag; tagEl.classList.remove('hidden'); } else { tagEl.classList.add('hidden'); }

    modal.classList.remove('hidden');
    setTimeout(() => {
        backdrop.classList.remove('opacity-0');
        panel.classList.remove('opacity-0', 'scale-95');
        panel.classList.add('opacity-100', 'scale-100');
    }, 10);
}

window.closeCartModal = function() {
    const modal = document.getElementById('cartModal');
    const backdrop = document.getElementById('cartModalBackdrop');
    const panel = document.getElementById('cartModalPanel');

    backdrop.classList.add('opacity-0');
    panel.classList.remove('opacity-100', 'scale-100');
    panel.classList.add('opacity-0', 'scale-95');

    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

// =======================
// RENDER PRODUCTS
// =======================
function renderProducts(products) {
  const grid = document.getElementById("productsGrid");
  const countLabel = document.getElementById("productsCount");
  const emptyState = document.getElementById("emptyState");
  const favorites = JSON.parse(localStorage.getItem("nike_favorites")) || [];

  grid.innerHTML = "";
  countLabel.textContent = `${products.length} Items Found`;

  if (products.length === 0) {
    grid.classList.add("hidden");
    emptyState.classList.remove("hidden");
    return;
  }

  grid.classList.remove("hidden");
  emptyState.classList.add("hidden");

  products.forEach(product => {
    const isFavorite = favorites.some(fav => String(fav.id) === String(product.id));
    const priceDisplay = typeof product.price === "number" ? product.price.toLocaleString("vi-VN") + "₫" : product.price;

    const card = document.createElement("div");
    card.className = "product-card animate-fade-in group cursor-pointer relative transition-all duration-500 hover:-translate-y-1";

    card.innerHTML = `
      <div class="relative">
          <div class="bg-gray-50 rounded-2xl overflow-hidden mb-5 aspect-square relative transition-all duration-500 group-hover:shadow-2xl">
            <img src="${product.image}" alt="${product.name}" class="w-full h-full object-contain p-6 transition-transform duration-700 group-hover:scale-110 mix-blend-multiply">
          </div>

          <button class="fav-btn absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white hover:scale-110 transition-all z-50">
            <svg class="h-5 w-5 ${isFavorite ? "text-red-500 fill-current" : "text-gray-400"}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          </button>

          <button onclick="window.handleAddToCart(event, this, '${product.id}')" class="absolute top-16 right-4 p-2.5 bg-white text-gray-900 rounded-full shadow-sm hover:bg-gray-100 hover:scale-110 transition-all z-50 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300" title="Add to Cart">
             <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          </button>
      </div>

      <div class="px-1">
        <h3 class="text-sm font-bold text-gray-900 mb-0.5 group-hover:text-gray-600 transition-colors">${product.name}</h3>
        <p class="text-gray-400 text-[11px] uppercase tracking-widest font-bold">${product.category}</p>
        <p class="text-sm font-black text-gray-900 mt-3">${priceDisplay}</p>
      </div>
    `;

    card.querySelector(".fav-btn").addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();
      toggleFavorite(product, e.currentTarget);
    });

    grid.appendChild(card);
  });
}

function toggleFavorite(product, btn) {
  let favorites = JSON.parse(localStorage.getItem("nike_favorites")) || [];
  const index = favorites.findIndex(f => String(f.id) === String(product.id));
  const svg = btn.querySelector("svg");

  if (index === -1) {
    favorites.push(product);
    svg.classList.add("text-red-500", "fill-current");
    svg.classList.remove("text-gray-400");
  } else {
    favorites.splice(index, 1);
    svg.classList.remove("text-red-500", "fill-current");
    svg.classList.add("text-gray-400");
  }
  localStorage.setItem("nike_favorites", JSON.stringify(favorites));
  updateNavFavCount();
}

function updateNavFavCount() {
  const favorites = JSON.parse(localStorage.getItem("nike_favorites")) || [];
  const navFavCount = document.getElementById("navFavCount");
  if (!navFavCount) return;
  navFavCount.textContent = favorites.length;
  navFavCount.classList.toggle("opacity-0", favorites.length === 0);
  navFavCount.classList.toggle("opacity-100", favorites.length > 0);
}

function setupEventListeners() {
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach(b => {
        b.classList.remove("bg-black", "text-white");
        b.classList.add("bg-gray-50", "text-gray-500");
      });
      btn.classList.add("bg-black", "text-white");
      btn.classList.remove("bg-gray-50", "text-gray-500");
      const filter = btn.dataset.filter;
      if (filter === "men") filteredProducts = filterMenShoes(allProducts);
      else filteredProducts = [...allProducts];
      renderProducts(filteredProducts);
    });
  });

  // SORT
  document.getElementById("sortSelect")?.addEventListener("change", e => {
    const value = e.target.value;

    if (value === "price-asc") {
      filteredProducts.sort(
        (a, b) => parsePrice(a.price) - parsePrice(b.price)
      );
    }

    if (value === "price-desc") {
      filteredProducts.sort(
        (a, b) => parsePrice(b.price) - parsePrice(a.price)
      );
    }

    if (value === "name-asc") {
      filteredProducts.sort(
        (a, b) => a.name.localeCompare(b.name)
      );
    }

    renderProducts(filteredProducts);
  });
}
