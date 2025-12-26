function getLogoPath() {
    const path = window.location.pathname;
   if (path.includes('/search/') || path.includes('/favor/') || path.includes('/products/')) {
       return '../img/logo.png';
   }
   return './img/logo.png';
}

const authModalHTML = `
<div id="authModal" class="fixed inset-0 z-[9999] hidden">
    
    <div class="absolute inset-0 bg-white transition-opacity duration-500 opacity-0" id="authBackdrop"></div>
    
    <div class="absolute inset-0 flex items-center justify-center p-4">
        <div class="bg-white w-full max-w-[480px] p-8 md:p-12 transition-all duration-500 transform scale-95 opacity-0 relative" id="authContainer">
            
            <button id="closeAuthBtn" class="absolute top-2 right-2 p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>

            <div class="mb-8 text-center md:text-left">
                <img src="${getLogoPath()}" alt="Nike" class="h-6 mb-8 mx-auto md:mx-0">
                <h2 class="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3 leading-tight tracking-tight">
                    Enter your email to join us.
                </h2>
            </div>

            <form id="loginForm" class="space-y-6">
                <div class="relative group">
                    <input type="email" id="userEmail" required
                        class="peer w-full h-14 rounded-md border border-gray-300 px-4 pt-2 outline-none focus:border-black transition-colors text-base"
                        placeholder=" "
                    >
                    <label for="userEmail" class="absolute left-4 top-4 text-gray-500 text-base transition-all 
                        peer-placeholder-shown:top-4 peer-placeholder-shown:text-base 
                        peer-focus:top-1 peer-focus:text-[11px] peer-focus:font-bold peer-focus:text-gray-500
                        peer-not-placeholder-shown:top-1 peer-not-placeholder-shown:text-[11px] peer-not-placeholder-shown:font-bold pointer-events-none">
                        Email*
                    </label>
                </div>

                <div class="text-xs text-gray-500 leading-relaxed text-center md:text-left">
                    By continuing, I agree to Us's <a href="#" class="underline hover:text-black">Privacy Policy</a> and <a href="#" class="underline hover:text-black">Terms of Use</a>.
                </div>

                <div class="flex justify-end pt-4">
                    <button type="submit" class="w-full md:w-auto bg-black text-white font-bold rounded-full px-8 py-3 hover:bg-gray-800 transition-all active:scale-95">
                        Continue
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
`;

let pendingAction = null;

export const Auth = {
    init() {
        if (!document.getElementById('authModal')) {
            document.body.insertAdjacentHTML('beforeend', authModalHTML);
            this.attachEvents();
        }
        this.interceptNavbarLinks();
    },

    // --- QUAN TRỌNG: Dùng sessionStorage thay vì localStorage ---
    isLoggedIn() {
        return !!sessionStorage.getItem('nike_user_session');
    },

    requireAuth(actionCallback) {
        if (this.isLoggedIn()) {
            actionCallback();
        } else {
            pendingAction = actionCallback;
            this.openModal();
        }
    },

    openModal() {
        const modal = document.getElementById('authModal');
        const backdrop = document.getElementById('authBackdrop');
        const container = document.getElementById('authContainer');
        const emailInput = document.getElementById('userEmail');

        // Reset form cho mới
        emailInput.value = ''; 
        
        modal.classList.remove('hidden');
        
        // Khóa cuộn trang web bên dưới lại
        document.body.style.overflow = 'hidden';

        // Animation
        setTimeout(() => {
            backdrop.classList.remove('opacity-0'); // Hiện nền trắng che phủ
            container.classList.remove('opacity-0', 'scale-95'); // Hiện form
        }, 10);

        emailInput.focus();
    },

    closeModal() {
        const modal = document.getElementById('authModal');
        const backdrop = document.getElementById('authBackdrop');
        const container = document.getElementById('authContainer');

        backdrop.classList.add('opacity-0');
        container.classList.add('opacity-0', 'scale-95');

        // Mở lại cuộn trang
        document.body.style.overflow = '';

        setTimeout(() => {
            modal.classList.add('hidden');
            pendingAction = null;
        }, 500); // Tăng thời gian chờ để animation mượt hơn
    },

    handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('userEmail').value;
        if (email) {
            // --- QUAN TRỌNG: Lưu vào Session Storage ---
            // Dữ liệu này sẽ MẤT khi tắt tab
            sessionStorage.setItem('nike_user_session', email);
            
            // Lưu email vào LocalStorage (chỉ để lưu trữ settings/favorites lâu dài nếu cần, không dùng để check login)
            // localStorage.setItem('last_known_email', email);

            this.closeModal();

            if (pendingAction) {
                pendingAction();
                pendingAction = null;
            }
        }
    },

    attachEvents() {
        document.getElementById('closeAuthBtn').addEventListener('click', () => this.closeModal());
        // Không cho click backdrop để đóng nữa (để tạo cảm giác bắt buộc hơn - tùy chọn)
        // document.getElementById('authBackdrop').addEventListener('click', () => this.closeModal());
        
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
    },

    interceptNavbarLinks() {
        const favorLinks = document.querySelectorAll('a[href*="favor.html"]');
        favorLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                if (!this.isLoggedIn()) {
                    e.preventDefault();
                    this.requireAuth(() => {
                        window.location.href = link.href;
                    });
                }
            });
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Auth.init();
});