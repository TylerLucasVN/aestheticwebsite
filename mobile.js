document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initTouchSwipe();
});

// --- 1. Xử lý Menu Mobile (Hamburger) ---
function initMobileMenu() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const closeBtn = document.getElementById('close-mobile-menu');
    const mobileMenu = document.getElementById('mobile-menu-drawer');
    const backdrop = document.getElementById('mobile-menu-backdrop');

    if (!menuBtn || !mobileMenu) return;

    function openMenu() {
        mobileMenu.classList.remove('translate-x-full'); // Trượt vào
        backdrop.classList.remove('hidden');
        setTimeout(() => {
            backdrop.classList.remove('opacity-0');
        }, 10);
        document.body.style.overflow = 'hidden'; // Khóa cuộn trang chính
    }

    function closeMenu() {
        mobileMenu.classList.add('translate-x-full'); // Trượt ra
        backdrop.classList.add('opacity-0');
        setTimeout(() => {
            backdrop.classList.add('hidden');
        }, 300);
        document.body.style.overflow = ''; // Mở khóa cuộn
    }

    menuBtn.addEventListener('click', openMenu);
    
    if(closeBtn) closeBtn.addEventListener('click', closeMenu);
    if(backdrop) backdrop.addEventListener('click', closeMenu);
}

// --- 2. Xử lý Vuốt (Swipe) cho Slider Sản phẩm ---
function initTouchSwipe() {
    // Tìm tất cả các container có class product-scroll hoặc id scrollContainer
    const sliders = document.querySelectorAll('.product-scroll, #scrollContainer, #recommendationGrid');

    sliders.forEach(slider => {
        let isDown = false;
        let startX;
        let scrollLeft;

        // Touch events (Mobile)
        slider.addEventListener('touchstart', (e) => {
            isDown = true;
            startX = e.touches[0].pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
        }, { passive: true });

        slider.addEventListener('touchend', () => {
            isDown = false;
        });

        slider.addEventListener('touchmove', (e) => {
            if (!isDown) return;
            const x = e.touches[0].pageX - slider.offsetLeft;
            const walk = (x - startX) * 1.5; // Tốc độ vuốt
            slider.scrollLeft = scrollLeft - walk;
        }, { passive: true });
    });
}