// =======================
// API & GLOBAL VARIABLES
// =======================
const API_URL = "https://694a5ba81282f890d2d86de0.mockapi.io/api/v1/products";

let allProducts = [];
let categoryProducts = []; // Danh sách sản phẩm sau khi lọc theo URL (Men/Women/Kids)
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
});

// =======================
// FETCH DATA
// =======================
async function fetchProducts() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Fetch failed");

    allProducts = await res.json();

    // 1. Lấy tham số category từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');

    // 2. Lọc sản phẩm dựa trên category từ URL
    if (category) {
        const titleEl = document.querySelector('h1');
        if (titleEl) titleEl.textContent = category.charAt(0).toUpperCase() + category.slice(1);

        categoryProducts = allProducts.filter(p => {
            const pCat = p.category.toLowerCase();
            if (category === 'men') return pCat.includes('men');
            if (category === 'women') return pCat.includes('women');
            if (category === 'kids') return pCat.includes('kid');
            if (category === 'sale') return p.tag === 'sale' || pCat.includes('sale');
            return true;
        });
    } else {
        categoryProducts = [...allProducts];
    }

    filteredProducts = [...categoryProducts];
    renderProducts(filteredProducts);

  } catch (err) {
    console.error(err);
    document.getElementById("productsCount").textContent =
      "Failed to load products";
  }
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
    const isFavorite = favorites.some(
      fav => String(fav.id) === String(product.id)
    );

    const priceDisplay =
      typeof product.price === "number"
        ? product.price.toLocaleString("vi-VN") + "₫"
        : product.price;

    const card = document.createElement("div");
    card.className =
      "product-card animate-fade-in group cursor-pointer";

    card.innerHTML = `
      <div class="relative bg-gray-50 rounded-2xl overflow-hidden mb-5 aspect-square
                  transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-1">

        <img src="${product.image}"
             alt="${product.name}"
             class="w-full h-full object-contain p-6
                    transition-transform duration-700 group-hover:scale-110">

        <button class="fav-btn absolute top-4 right-4 p-2.5
                       bg-white/90 backdrop-blur-sm rounded-full shadow-sm
                       hover:bg-white hover:scale-110 transition-all z-10">
          <svg class="h-5 w-5 ${isFavorite ? "text-red-500 fill-current" : "text-gray-400"}"
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682
                     a4.5 4.5 0 00-6.364-6.364L12 7.636
                     l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
        </button>
      </div>

      <div class="px-1">
        <h3 class="text-sm font-bold text-gray-900 mb-0.5
                   group-hover:text-gray-600 transition-colors">
          ${product.name}
        </h3>

        <p class="text-gray-400 text-[11px] uppercase tracking-widest font-bold">
          ${product.category}
        </p>

        <p class="text-sm font-black text-gray-900 mt-3">
          ${priceDisplay}
        </p>
      </div>
    `;

    card.querySelector(".fav-btn").addEventListener("click", e => {
      e.preventDefault();
      toggleFavorite(product, e.currentTarget);
    });

    grid.appendChild(card);
  });
}

// =======================
// FAVORITES
// =======================
function toggleFavorite(product, btn) {
  let favorites = JSON.parse(localStorage.getItem("nike_favorites")) || [];
  const index = favorites.findIndex(
    f => String(f.id) === String(product.id)
  );

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

// =======================
// EVENTS (FILTER + SORT)
// =======================
function setupEventListeners() {

  // FILTER BUTTONS
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach(b => {
        b.classList.remove("bg-black", "text-white");
        b.classList.add("bg-gray-50", "text-gray-500");
      });

      btn.classList.add("bg-black", "text-white");
      btn.classList.remove("bg-gray-50", "text-gray-500");

      const filter = btn.dataset.filter;

      if (filter === "all") {
        filteredProducts = [...categoryProducts];
      } else {
        // Lọc dựa trên danh sách đã phân loại theo URL (ví dụ: chỉ lấy Shoes của Men)
        filteredProducts = categoryProducts.filter(p => 
            p.category.toLowerCase().includes(filter)
        );
      }

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
