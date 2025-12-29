/**
 * Module giám sát và phân tích hệ thống
 */

// 1. Hàm tiện ích để gửi sự kiện lên Google Analytics
export const trackEvent = (eventName, params = {}) => {
    if (typeof gtag === 'function') {
        gtag('event', eventName, params);
        // Log ra console để bạn kiểm tra ngay "trên này"
        console.log(`📊 [GA Event]: ${eventName}`, params);
    } else {
        // Nếu chưa có mã ID thật, vẫn log ra để bạn biết code đã chạy đến đây
        console.warn(`⚠️ [GA Mock]: Sự kiện "${eventName}" đã kích hoạt nhưng chưa có mã ID thật.`, params);
    }
};

// 2. Cấu hình Sentry để bắt các lỗi không mong muốn
export const initMonitoring = () => {
    // Khởi tạo hệ thống giám sát nội bộ
    console.log("Monitoring system initialized...");
    trackPerformance();
};

// 3. Theo dõi hiệu suất (Web Vitals)
export const trackPerformance = () => {
    if ('performance' in window && 'getEntriesByType' in performance) {
        window.addEventListener('load', () => {
            const paintMetrics = performance.getEntriesByType('paint');
            paintMetrics.forEach((metric) => {
                console.log(`Hiệu suất [${metric.name}]: ${metric.startTime}ms`);
                trackEvent('performance_metric', {
                    'metric_name': metric.name,
                    'value': Math.round(metric.startTime)
                });
            });
        });
    }
};

// Tự động bắt các lỗi Promise bị từ chối (Unhandled Rejections)
window.addEventListener('unhandledrejection', event => {
    const errorMsg = event.reason?.message || event.reason || "Unknown Promise Error";
    console.error("❌ [Hệ thống - Lỗi chưa xử lý]:", errorMsg);
    trackEvent('exception', {
        'description': errorMsg,
        'fatal': false
    });
});

// Bắt các lỗi JavaScript thông thường (Syntax, Reference, v.v.)
window.onerror = function(message, source, lineno, colno, error) {
    const errorDetail = `${message} tại ${source}:${lineno}:${colno}`;
    trackEvent('exception', {
        'description': errorDetail,
        'fatal': true
    });
};

initMonitoring();
