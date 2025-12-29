import { trackEvent } from '../monitoring.js';
const API_URL = "https://694a5ba81282f890d2d86de0.mockapi.io/api/v1/products";

// Biến lưu trữ dữ liệu cache cho overlay để tìm kiếm nhanh
let cachedOverlayData = [];

// Fetch dữ liệu ngay khi load file (hoặc khi DOMReady)
async function fetchOverlayData() {
    try {
        const response = await fetch(API_URL);
        if (response.ok) {
            cachedOverlayData = await response.json();
        }
    } catch (error) {
        console.error("Search Overlay: Failed to fetch API", error);
    }
}

// --- HÀM HỖ TRỢ ĐƯỜNG DẪN ---
function getSearchPagePath() {
    const path = window.location.pathname;
    if (path.includes('/search/') || path.includes('/favor/') || path.includes('/products/')) {
        return '../search/search.html';
    }
    return './search/search.html';
}

function getLogoPath() {
     const path = window.location.pathname;
    if (path.includes('/search/') || path.includes('/favor/') || path.includes('/products/')) {
        return '../img/logo.png';
    }
    return './img/logo.png';
}

// --- HTML STRUCTURE ---
const searchOverlayHTML = `
<div id="searchBackdrop" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[199] hidden opacity-0 transition-opacity duration-300"></div>

<div id="searchContainer" class="fixed top-0 left-0 w-full bg-white z-[200] shadow-2xl transform -translate-y-full transition-transform duration-300 rounded-b-3xl overflow-hidden flex flex-col max-h-[70vh]">
    
    <div class="px-4 py-4 md:py-6 border-b border-gray-100 flex-shrink-0">
        <div class="max-w-3xl mx-auto flex items-center justify-between gap-4">
            <a href="#" class="hidden md:block flex-shrink-0 w-12">
                <img src="${getLogoPath()}" alt="Logo" class="h-6 object-contain">
            </a>
            
            <div class="flex-1 relative bg-gray-100 rounded-full group hover:bg-gray-200 transition-colors">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                     <svg class="h-5 w-5 text-gray-500 group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
                <input type="text" id="globalSearchInput" 
                    class="w-full bg-transparent border-none focus:ring-0 text-base font-medium py-2.5 pl-11 pr-10 placeholder-gray-500 text-gray-900 rounded-full" 
                    placeholder="Search" autocomplete="off">
                
                <button id="clearSearchInput" class="absolute inset-y-0 right-0 pr-3 flex items-center hidden text-gray-400 hover:text-black" aria-label="Clear search">
                    <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>
                </button>
            </div>

            <button id="closeSearchBtn" class="text-sm font-medium text-gray-500 hover:text-black px-2">
                Cancel
            </button>
        </div>
    </div>

    <div class="flex-1 overflow-y-auto px-4 sm:px-6 py-6" id="searchContentArea">
        <div class="max-w-3xl mx-auto">
            
            <div id="defaultSearchContent">
                <div id="searchHistorySection" class="mb-8 hidden">
                    <div class="flex justify-between items-center mb-3">
                        <h3 class="text-gray-500 font-medium text-xs uppercase tracking-wide">Recent Searches</h3>
                        <button id="clearHistoryBtn" class="text-xs text-gray-400 hover:text-red-500 underline">Clear</button>
                    </div>
                    <div class="flex flex-wrap gap-2" id="historyList">
                        </div>
                </div>

                <div>
                     <h3 class="text-gray-500 font-medium text-xs uppercase tracking-wide mb-3">Popular Search Terms</h3>
                     <div class="flex flex-col space-y-3">
                        <button class="text-left text-base font-semibold text-gray-900 hover:text-gray-500 transition-colors search-term-btn">Air Force 1</button>
                        <button class="text-left text-base font-semibold text-gray-900 hover:text-gray-500 transition-colors search-term-btn">Jordan</button>
                        <button class="text-left text-base font-semibold text-gray-900 hover:text-gray-500 transition-colors search-term-btn">Air Max</button>
                        <button class="text-left text-base font-semibold text-gray-900 hover:text-gray-500 transition-colors search-term-btn">Running</button>
                     </div>
                </div>
            </div>

            <div id="liveSearchResults" class="hidden">
                 <h3 class="text-gray-500 font-medium text-xs uppercase tracking-wide mb-4">Top Suggestions</h3>
                 <div id="liveProductList" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    </div>
                 <div id="noResultsMsg" class="hidden text-center py-8 text-gray-500">
                    No products found matching your search.
                 </div>
                 <button id="viewAllResultsBtn" class="w-full mt-6 py-3 bg-gray-100 text-black font-medium rounded-full hover:bg-gray-200 transition">
                    View All Results
                 </button>
            </div>

        </div>
    </div>
</div>
`;

// --- LOGIC CHÍNH ---
export function initSearchOverlay() {
    // 1. Inject HTML
    if (!document.getElementById('searchContainer')) {
        document.body.insertAdjacentHTML('beforeend', searchOverlayHTML);
    }

    // Elements
    const backdrop = document.getElementById('searchBackdrop');
    const container = document.getElementById('searchContainer');
    const closeBtn = document.getElementById('closeSearchBtn');
    const input = document.getElementById('globalSearchInput');
    const clearInputBtn = document.getElementById('clearSearchInput');
    
    // Content Sections
    const defaultContent = document.getElementById('defaultSearchContent');
    const liveResults = document.getElementById('liveSearchResults');
    const liveProductList = document.getElementById('liveProductList');
    const noResultsMsg = document.getElementById('noResultsMsg');
    const viewAllBtn = document.getElementById('viewAllResultsBtn');
    
    // History Elements
    const historySection = document.getElementById('searchHistorySection');
    const historyList = document.getElementById('historyList');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');

    // Trigger Buttons
    const searchBtns = document.querySelectorAll('.search-trigger-btn');

    // --- LOCAL STORAGE FUNCTIONS ---
    function getHistory() {
        return JSON.parse(localStorage.getItem('nike_search_history')) || [];
    }

    function saveHistory(term) {
        let history = getHistory();
        history = history.filter(item => item.toLowerCase() !== term.toLowerCase());
        history.unshift(term);
        if (history.length > 5) history.pop();
        localStorage.setItem('nike_search_history', JSON.stringify(history));
    }

    function clearHistory() {
        localStorage.removeItem('nike_search_history');
        renderHistory();
    }

    function renderHistory() {
        const history = getHistory();
        if (history.length === 0) {
            historySection.classList.add('hidden');
            return;
        }
        
        historySection.classList.remove('hidden');
        historyList.innerHTML = history.map(term => `
            <button class="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-sm text-gray-700 flex items-center gap-2 history-item-btn">
                <span>${term}</span>
            </button>
        `).join('');

        document.querySelectorAll('.history-item-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                performSearch(btn.querySelector('span').innerText);
            });
        });
    }

    // --- OVERLAY ACTIONS ---
    function openOverlay(e) {
        if(e) e.preventDefault();
        
        // Fetch dữ liệu nếu chưa có (đảm bảo cache có dữ liệu)
        if (cachedOverlayData.length === 0) fetchOverlayData();

        backdrop.classList.remove('hidden');
        setTimeout(() => backdrop.classList.remove('opacity-0'), 10);
        container.classList.remove('-translate-y-full');
        
        input.value = '';
        toggleView('');
        renderHistory();
        input.focus();
        document.body.style.overflow = 'hidden';
    }

    function closeOverlay() {
        backdrop.classList.add('opacity-0');
        container.classList.add('-translate-y-full');
        setTimeout(() => {
            backdrop.classList.add('hidden');
            document.body.style.overflow = '';
        }, 300);
    }

    // --- SEARCH LOGIC ---
    function performSearch(query) {
        if (!query.trim()) return;
        
        // Theo dõi từ khóa tìm kiếm (Ý số 1)
        trackEvent('search', { search_term: query.trim() });

        saveHistory(query.trim());
        const searchPath = getSearchPagePath();
        // Redirect sang trang search với query string
        window.location.href = `${searchPath}?q=${encodeURIComponent(query)}`;
    }

    function toggleView(query) {
        if (query.length > 0) {
            defaultContent.classList.add('hidden');
            liveResults.classList.remove('hidden');
            clearInputBtn.classList.remove('hidden');
            renderLiveProducts(query);
        } else {
            defaultContent.classList.remove('hidden');
            liveResults.classList.add('hidden');
            clearInputBtn.classList.add('hidden');
        }
    }

    function renderLiveProducts(query) {
        const lowerQuery = query.toLowerCase();
        
        // Sử dụng dữ liệu cache từ API để lọc
        const matches = cachedOverlayData.filter(p => 
            (p.name && p.name.toLowerCase().includes(lowerQuery)) || 
            (p.category && p.category.toLowerCase().includes(lowerQuery))
        ).slice(0, 4);

        if (matches.length === 0) {
            liveProductList.innerHTML = '';
            noResultsMsg.classList.remove('hidden');
            viewAllBtn.classList.add('hidden');
        } else {
            noResultsMsg.classList.add('hidden');
            viewAllBtn.classList.remove('hidden');
            viewAllBtn.innerText = `View All Results for "${query}"`;
            viewAllBtn.onclick = () => performSearch(query);

            liveProductList.innerHTML = matches.map(product => {
                const priceDisplay = typeof product.price === 'number' 
                    ? product.price.toLocaleString('vi-VN') + '₫' 
                    : product.price;

                return `
                <div class="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition product-suggestion-item" data-id="${product.id}">
                    <div class="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                        <img src="${product.image}" alt="${product.name}" class="w-full h-full object-contain mix-blend-multiply">
                    </div>
                    <div class="flex-1 min-w-0">
                        <h4 class="text-sm font-medium text-gray-900 truncate">${product.name}</h4>
                        <p class="text-xs text-gray-500 truncate">${product.category}</p>
                        <p class="text-sm font-semibold mt-1">${priceDisplay}</p>
                    </div>
                </div>
            `}).join('');

            document.querySelectorAll('.product-suggestion-item').forEach(item => {
                item.addEventListener('click', () => {
                    const name = item.querySelector('h4').innerText;
                    performSearch(name);
                });
            });
        }
    }

    // --- EVENT LISTENERS ---
    searchBtns.forEach(btn => btn.addEventListener('click', openOverlay));
    closeBtn.addEventListener('click', closeOverlay);
    backdrop.addEventListener('click', closeOverlay);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeOverlay();
    });

    input.addEventListener('input', (e) => {
        toggleView(e.target.value);
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') performSearch(input.value);
    });

    clearInputBtn.addEventListener('click', () => {
        input.value = '';
        input.focus();
        toggleView('');
    });

    clearHistoryBtn.addEventListener('click', clearHistory);

    document.querySelectorAll('.search-term-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            performSearch(e.target.innerText);
        });
    });
}

// Gọi fetch ngay khi load
fetchOverlayData();

document.addEventListener('DOMContentLoaded', initSearchOverlay);