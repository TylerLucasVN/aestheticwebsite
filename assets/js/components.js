// Tính toán đường dẫn gốc dựa trên URL hiện tại của trang
const isRoot = !window.location.pathname.includes('/pages/');
const root = isRoot ? './' : '../../';
const pages = isRoot ? 'pages/' : '../';

// 1. HEADER COMPONENT
class AppHeader extends HTMLElement {
    connectedCallback() {
        let user = null;
        try { user = JSON.parse(localStorage.getItem('user')); } catch (e) { }
        const accountHTML = user
            ? `<div class="flex items-center gap-x-3">
           <span class="hidden sm:inline text-sm font-medium text-gray-800">Hi, ${user.name || 'bạn'}</span>
           <button id="logoutBtn" class="text-sm font-medium text-gray-600 hover:text-black underline">Logout</button>
       </div>`
            : `<a href="${pages}login/login.html" class="text-gray-600 hover:text-black transition-colors" aria-label="Đăng nhập" title="Đăng nhập">
           <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
           </svg>
       </a>`;
        this.innerHTML = `
        <div class="bg-black text-white text-xs md:text-sm py-2 px-4 text-center">
            Free Shipping & 60-Day Free Returns. <a href="${pages}login/register.html" class="underline font-medium ml-1">Join Now</a>
        </div>

        <nav class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex md:grid md:grid-cols-3 items-center justify-between h-16">
                    <!-- Logo -->
                    <a href="${root}index.html" class="flex-shrink-0 flex justify-start">
                        <img src="${root}assets/images/logo.png" alt="SGD Logo" class="h-10 md:h-12 w-auto object-contain transition-transform hover:scale-105">
                    </a>

                    <!-- Desktop Navigation Links -->
                    <div class="hidden md:flex md:items-center md:justify-center gap-x-8" id="categoryTabs">
                        <a href="${pages}products/products.html" data-category="all" class="tab text-sm font-medium transition-colors text-gray-800 hover:text-black">All</a>
                        <a href="${pages}products/products.html?category=men" data-category="men" class="tab text-sm font-medium transition-colors text-gray-800 hover:text-black">Men</a>
                        <a href="${pages}products/products.html?category=women" data-category="women" class="tab text-sm font-medium transition-colors text-gray-800 hover:text-black">Women</a>
                        <a href="${pages}products/products.html?category=kids" data-category="kids" class="tab text-sm font-medium transition-colors text-gray-800 hover:text-black">Kids</a>
                        <a href="${pages}products/products.html?category=sale" data-category="sale" class="tab text-sm font-medium transition-colors text-gray-800 hover:text-black">Sale</a>
                    </div>

                    <!-- Icons -->
                    <div class="flex items-center justify-end gap-x-6">
                        <button class="search-trigger-btn text-gray-600 hover:text-black">
                            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                        </button>
                        <a href="${pages}favor/favor.html" class="text-gray-600 hover:text-black transition-colors relative group">
                            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                            </svg>
                            <span id="navFavCount" class="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center opacity-0 transition-opacity">0</span>
                        </a>
                        <a href="${pages}cart/cart.html" class="text-gray-600 hover:text-black transition-colors relative group">
                            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            </svg>
                            <span id="navCartCount" class="absolute -top-1 -right-1 bg-black text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center opacity-0 transition-opacity">0</span>
                        </a>
                        ${accountHTML}
                        <button id="mobile-menu-btn" class="md:hidden text-gray-900 hover:text-black focus:outline-none p-1">
                            <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
                </nav>
        `;

        const lo = this.querySelector('#logoutBtn');
        if (lo) lo.addEventListener('click', () => {
            localStorage.removeItem('user');
            location.reload();
        });
    }
}

// 2. FOOTER COMPONENT
class AppFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <footer class="bg-black text-white py-10 mt-12">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 class="font-bold text-lg mb-4">Find A Store</h3>
                        <ul class="space-y-2 text-gray-400">
                            <li><a href="#" class="hover:text-white transition-colors duration-200">Become a Member</a></li>
                            <li><a href="#" class="hover:text-white transition-colors duration-200">Sign Up for Email</a></li>
                            <li><a href="#" class="hover:text-white transition-colors duration-200">Student Discounts</a></li>
                        </ul>
                    </div>
                    
                    <div>
                        <h3 class="font-bold text-lg mb-4">Get Help</h3>
                        <ul class="space-y-2 text-gray-400">
                            <li><a href="#" class="hover:text-white transition-colors duration-200">Order Status</a></li>
                            <li><a href="#" class="hover:text-white transition-colors duration-200">Delivery</a></li>
                            <li><a href="#" class="hover:text-white transition-colors duration-200">Returns</a></li>
                            <li><a href="#" class="hover:text-white transition-colors duration-200">Payment Options</a></li>
                        </ul>
                    </div>
                    
                    <div>
                        <h3 class="font-bold text-lg mb-4">About Nike</h3>
                        <ul class="space-y-2 text-gray-400">
                            <li><a href="#" class="hover:text-white transition-colors duration-200">News</a></li>
                            <li><a href="#" class="hover:text-white transition-colors duration-200">Careers</a></li>
                            <li><a href="#" class="hover:text-white transition-colors duration-200">Investors</a></li>
                            <li><a href="#" class="hover:text-white transition-colors duration-200">Sustainability</a></li>
                        </ul>
                    </div>
                    
                    <div>
                        <h3 class="font-bold text-lg mb-4">Follow Us</h3>
                        <div class="flex space-x-4">
                            <a href="#" class="hover:text-white transition-colors duration-200">
                                <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path fill-rule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clip-rule="evenodd" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
                
                <div class="mt-10 pt-6 border-t border-gray-800 text-center text-gray-400 text-sm">
                    <p>© 2023 Nike, Inc. All Rights Reserved</p>
                    <div class="mt-2">
                        <a href="#" class="hover:text-white mx-2 transition-colors duration-200">Guides</a>
                        <a href="#" class="hover:text-white mx-2 transition-colors duration-200">Terms of Sale</a>
                        <a href="#" class="hover:text-white mx-2 transition-colors duration-200">Terms of Use</a>
                        <a href="#" class="hover:text-white mx-2 transition-colors duration-200">Privacy Policy</a>
                    </div>
                </div>
            </div>
        </footer>
        `;
    }
}

// Đăng ký Custom Elements
customElements.define('app-header', AppHeader);
customElements.define('app-footer', AppFooter);