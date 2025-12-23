import {data} from './mockupdata.js';

function renderProducts(data) {
  const container = document.getElementById("scrollContainer");

  data.forEach(product => {
    console.log(product);
    const card = document.createElement("div");
    card.className = "product-card flex-shrink-0 w-64 md:w-72";

    card.innerHTML = `
      <div class="card-img-wrap bg-gray-100 rounded-xl overflow-hidden mb-4 
                  transition-transform duration-300 hover:scale-105">
        <img src="${product.image}" 
             alt="${product.name}" 
             class="w-full h-auto">
      </div>

      <div class="card-info">
        <div class="p-name font-medium text-gray-900 mb-1">
          ${product.name}
        </div>
        <div class="p-cat text-gray-600 text-sm mb-2">
          ${product.category}
        </div>
        <div class="p-price font-bold text-gray-900">
          ${product.price}
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}


function filterByTag(data, tag) {
  if (!tag) return data;

  return data.filter(item => item.tag === tag);
}
const trendingProducts = filterByTag(data, "trending");
renderProducts(trendingProducts);
