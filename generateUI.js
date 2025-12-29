//import {data} from './mockupdata.js';
import { trackEvent } from './monitoring.js';
const API_URL = "https://694a5ba81282f890d2d86de0.mockapi.io/api/v1/products";

function getProducts() {
  return new Promise(function (resolve, reject) {
    fetch(API_URL)
      .then(function (response) {
        if (!response.ok) {
          reject("Không thể lấy dữ liệu từ API");
        }
        return response.json();
      })
      .then(function (data) {
        resolve(data);
      })
      .catch(function (error) {
        reject(error);
      });
  });
}
export default getProducts;
function renderProducts(data) {
  const container = document.getElementById("scrollContainer");
  // Lấy danh sách yêu thích từ LocalStorage
  const favorites = JSON.parse(localStorage.getItem('nike_favorites')) || [];

  data.forEach(product => {
    console.log(product);
    // Kiểm tra xem sản phẩm này đã được like chưa
    const isFavorite = favorites.some(fav => String(fav.id) === String(product.id));
    
    const card = document.createElement("div");
    card.className = "product-card flex-shrink-0 w-64 md:w-72";

    // Theo dõi hành vi click vào sản phẩm 
    card.addEventListener('click', () => {
        trackEvent('product_click', {
            product_id: product.id,
            product_name: product.name,
            category: product.category
        });
    });

    card.innerHTML = `
      <div class="card-img-wrap bg-gray-100 rounded-xl overflow-hidden mb-4 transition-transform duration-300 hover:scale-105 relative group">
        <img src="${product.image}" 
             alt="${product.name}" 
             class="w-full h-auto">
             
        <!-- Favorite Button -->
        <button class="fav-btn absolute top-3 right-3 p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition-all duration-200 z-10 opacity-0 group-hover:opacity-100 focus:opacity-100" aria-label="Add to favorites">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transition-colors duration-200 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
        </button>
      </div>

      <div class="card-info">
        <div class="p-name font-medium text-gray-900 mb-1">
          ${product.name}
        </div>
        <div class="p-cat text-gray-600 text-sm mb-2">
          ${product.category}
        </div>
        <div class="p-price font-bold text-gray-900">
          ${typeof product.price === 'number' ? product.price.toLocaleString('vi-VN') + '₫' : product.price}
        </div>
      </div>
    `;
    
    // Thêm sự kiện click cho nút favorite
    const favBtn = card.querySelector('.fav-btn');
    favBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Ngăn không cho click vào card (nếu có link)
        toggleFavorite(product, favBtn);
    });

    container.appendChild(card);
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
    
    // Theo dõi hành động thêm vào yêu thích
    trackEvent('add_to_favorites', {
        product_id: product.id,
        product_name: product.name
    });
  } else {
    favorites.splice(index, 1);
    svg.classList.remove('text-red-500', 'fill-current');
    svg.classList.add('text-gray-400');
  }

  localStorage.setItem('nike_favorites', JSON.stringify(favorites));
}


function filterByTag(data, tag) {
  if (!tag) return data;

  return data.filter(item => item.tag === tag);
}
// const trendingProducts = filterByTag(data, "trending");
// renderProducts(trendingProducts);

async function init() {
  const container = document.getElementById("scrollContainer");
  try {
    if (container) container.innerHTML = '<div class="text-gray-500 p-10">Loading trending products...</div>';
    const products = await getProducts();
    if (container) container.innerHTML = ''; // Xóa dòng loading
    renderProducts(filterByTag(products, "trending"));
  } catch (error) {
    console.error("Lỗi:", error);
    
    // Gửi lỗi API về Google Analytics 
    trackEvent('api_error', {
        'endpoint': API_URL,
        'message': error.message || error
    });

    if (container) container.innerHTML = '<div class="text-red-500 p-10">Failed to load products. Please try again later.</div>';
  }
}

init();