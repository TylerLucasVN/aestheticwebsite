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
});

// =======================
// FETCH DATA
// =======================
async function fetchProducts() {
  try {
    // Lấy dữ liệu từ API (Lấy hết về, không lọc trên URL API)
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Fetch failed");
    allProducts = await res.json();

    // Lấy tham số từ trình duyệt
    const urlParams = new URLSearchParams(window.location.search);
    const tagParam = urlParams.get('tag');       // Lấy ?tag=...
    const categoryParam = urlParams.get('category'); // Lấy ?category=...

    // Logic lọc
    if (tagParam) {
      // --- LỌC THEO TAG (SALE) ---
      const searchTag = tagParam.toLowerCase().trim(); // "sale"
      
      console.log("Đang tìm tag:", searchTag); // Kiểm tra log

      filteredProducts = allProducts.filter(p => {
        // Kiểm tra xem sản phẩm có trường "tag" không (Lưu ý: tag số ít)
        if (!p.tag) return false;

        // Chuyển dữ liệu trong JSON về chữ thường để so sánh
        // Dữ liệu của bạn: "tag": "sale"
        const productTag = String(p.tag).toLowerCase();

        return productTag.includes(searchTag);
      });

      updateTitle(tagParam);

    } else if (categoryParam) {
      // --- LỌC THEO CATEGORY (MEN, WOMEN, KIDS) ---
      const searchCat = categoryParam.toLowerCase().trim();
      
      filteredProducts = allProducts.filter(p => {
        if (!p.category) return false;
        const pCat = p.category.toLowerCase();

        // Fix lỗi: Tìm Men nhưng không lấy Women
        if (searchCat === 'men') {
          return pCat.includes('men') && !pCat.includes('women');
        }
        
        return pCat.includes(searchCat);
      });

      updateTitle(categoryParam);

    } else {
      // --- KHÔNG LỌC (ALL PRODUCTS) ---
      filteredProducts = [...allProducts];
      updateTitle("New & Featured");
    }

    console.log(`Kết quả: Tìm thấy ${filteredProducts.length} sản phẩm.`);
    renderProducts(filteredProducts);

  } catch (err) {
    console.error(err);
    document.getElementById("productsCount").textContent = "Failed to load products";
  }
}

// Hàm đổi tên tiêu đề
function updateTitle(text) {
  const title = document.querySelector('h1');
  if (title) title.textContent = text.toUpperCase();
}

// =======================
// FILTER LOGIC (CORE)
// =======================

// 👉 CHỈ FILTER ĐÚNG "Men's Shoes"
function filterMenShoes(products) {
  return products.filter(
    p => p.category === "Men's Shoes"
  );
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

      if (filter === "men") {
        filteredProducts = filterMenShoes(allProducts);
      } else {
        filteredProducts = [...allProducts];
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
