// =======================
// API & GLOBAL VARIABLES
// =======================
const API_URL = "https://694a5ba81282f890d2d86de0.mockapi.io/api/v1/products";

let allProducts = [];
let filteredProducts = [];
let currentIndex = 0;

const ITEMS_PER_LOAD = 8;
let observer = null;

// =======================
// UTILS
// =======================
function parsePrice(price) {
  if (typeof price === "number") return price;
  return parseInt(String(price).replace(/[^\d]/g, "")) || 0;
}

// =======================
// INIT
// =======================
document.addEventListener("DOMContentLoaded", () => {
  fetchProducts();
  setupSort();
  updateNavFavCount();
});

// =======================
// FETCH PRODUCTS
// =======================
async function fetchProducts() {
  const grid = document.getElementById("productsGrid");
  const countLabel = document.getElementById("productsCount");
  const emptyState = document.getElementById("emptyState");

  try {
    grid.innerHTML = "";
    emptyState.classList.add("hidden");
    currentIndex = 0;

    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Fetch failed");

    allProducts = await res.json();

    // 👉 CHỈ WOMEN'S SHOES (KHÁC DUY NHẤT CHỖ NÀY)
    filteredProducts = allProducts.filter(
      p => p.category === "Women's Shoes"
    );

    updateCount();

    if (filteredProducts.length === 0) {
      showEmpty("No Women's Shoes found.");
      return;
    }

    renderNextBatch();
    setupLazyLoadObserver();

  } catch (err) {
    console.error(err);
    showEmpty("Failed to load products. Please try again later.");
  }
}

// =======================
// SORT (GIỮ NGUYÊN HTML)
// =======================
function setupSort() {
  const sortSelect = document.getElementById("sortSelect");
  if (!sortSelect) return;

  sortSelect.addEventListener("change", e => {
    const value = e.target.value;

    // reset list trước
    filteredProducts = allProducts.filter(
      p => p.category === "Women's Shoes"
    );

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

    resetAndRender();
  });
}

// =======================
// RESET + RENDER
// =======================
function resetAndRender() {
  const grid = document.getElementById("productsGrid");

  grid.innerHTML = "";
  currentIndex = 0;
  updateCount();

  if (observer) observer.disconnect();

  renderNextBatch();
  setupLazyLoadObserver();
}

// =======================
// COUNT
// =======================
function updateCount() {
  const countLabel = document.getElementById("productsCount");
  countLabel.textContent = `${filteredProducts.length} Items Found`;
}

// =======================
// EMPTY STATE
// =======================
function showEmpty(message) {
  const grid = document.getElementById("productsGrid");
  const emptyState = document.getElementById("emptyState");
  const countLabel = document.getElementById("productsCount");

  grid.innerHTML = "";
  countLabel.textContent = "0 Items Found";
  emptyState.classList.remove("hidden");
  emptyState.querySelector("p").textContent = message;
}

// =======================
// RENDER NEXT BATCH
// =======================
function renderNextBatch() {
  const grid = document.getElementById("productsGrid");
  const favorites = JSON.parse(localStorage.getItem("nike_favorites")) || [];

  const nextItems = filteredProducts.slice(
    currentIndex,
    currentIndex + ITEMS_PER_LOAD
  );

  if (nextItems.length === 0) return;

  nextItems.forEach(product => {
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
             loading="lazy"
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

  currentIndex += ITEMS_PER_LOAD;
}

// =======================
// LAZY LOAD
// =======================
function setupLazyLoadObserver() {
  const sentinel = document.createElement("div");
  sentinel.id = "scroll-sentinel";
  document.getElementById("productsGrid").after(sentinel);

  observer = new IntersectionObserver(entries => {
    if (
      entries[0].isIntersecting &&
      currentIndex < filteredProducts.length
    ) {
      renderNextBatch();
    }
  }, {
    rootMargin: "200px"
  });

  observer.observe(sentinel);
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
