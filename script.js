import { data } from './mockupdata.js';
    
// --- 1. CHỌN CÁC PHẦN TỬ (SELECTORS) ---
const scrollContainer = document.getElementById('scrollContainer');
const btnPrev = document.getElementById('btnPrev');
const btnNext = document.getElementById('btnNext');

// --- 2. LOGIC NÚT BẤM (BUTTON CLICK) ---
btnNext.addEventListener('click', () => {
    // Cuộn sang phải 420px (chiều rộng card + gap)
    scrollContainer.scrollBy({ left: 420, behavior: 'smooth' });
});

btnPrev.addEventListener('click', () => {
    // Cuộn sang trái
    scrollContainer.scrollBy({ left: -420, behavior: 'smooth' });
});

// --- 3. LOGIC KÉO CHUỘT (DRAG TO SCROLL) ---
// Biến để theo dõi trạng thái chuột
let isDown = false;
let startX;
let scrollLeft;

// Khi nhấn chuột xuống
scrollContainer.addEventListener('mousedown', (e) => {
    isDown = true;
    scrollContainer.classList.add('active'); // Đổi con trỏ thành grabbing
    startX = e.pageX - scrollContainer.offsetLeft;
    scrollLeft = scrollContainer.scrollLeft;
});

// Khi chuột rời khỏi vùng cuộn
scrollContainer.addEventListener('mouseleave', () => {
    isDown = false;
    scrollContainer.classList.remove('active');
});

// Khi nhả chuột ra
scrollContainer.addEventListener('mouseup', () => {
    isDown = false;
    scrollContainer.classList.remove('active');
});

// Khi di chuyển chuột (Logic chính)
scrollContainer.addEventListener('mousemove', (e) => {
    if (!isDown) return; // Nếu chưa nhấn chuột thì không làm gì cả
    e.preventDefault(); // Ngăn chặn chọn văn bản
    const x = e.pageX - scrollContainer.offsetLeft;
    const walk = (x - startX) * 2; // Nhân 2 để kéo nhanh hơn một chút
    scrollContainer.scrollLeft = scrollLeft - walk;
});