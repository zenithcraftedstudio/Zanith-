/**
 * ZANITH LOADER v6.1 - HYBRID CACHE & AUTO SYNC
 * Tối ưu tốc độ Load và hỗ trợ link Pinterest (#SKU)
 */

function initZanithStore() {
    const CACHE_KEY = 'zanith_products_cache';
    console.log("Zanith: Đang khởi động hệ thống...");

    // 1. TỐI ƯU TỐC ĐỘ: Lấy dữ liệu từ bộ nhớ tạm (LocalStorage) để hiện ngay lập tức
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
        const products = JSON.parse(cachedData);
        console.log("🚀 Zanith: Hiển thị nhanh từ Cache.");
        if (typeof renderProducts === "function") renderProducts(products);
        // Sau khi hiện từ cache, kiểm tra xem có cần mở Modal theo URL #SKU không
        setTimeout(handleURLHash, 500); 
    }

    // 2. ĐỒNG BỘ ONLINE: Gọi Apps Script để lấy dữ liệu mới nhất (Chạy ngầm)
    // Chúng ta vẫn dùng hàm callSheet của bạn để giữ tính bảo mật
    callSheet("readProducts", {}, "Zanith2026")
    .then(response => {
        if (response.status === "success") {
            const newDataStr = JSON.stringify(response.data);
            
            // Chỉ cập nhật và lưu cache nếu dữ liệu trên Sheet có thay đổi
            if (newDataStr !== cachedData) {
                localStorage.setItem(CACHE_KEY, newDataStr);
                console.log("🔄 Zanith: Đã cập nhật mẫu mới từ Google Sheet.");
                
                if (typeof renderProducts === "function") {
                    renderProducts(response.data);
                }
                // Check lại Hash một lần nữa sau khi có dữ liệu mới nhất
                handleURLHash(); 
            }
        }
    })
    .catch(err => {
        console.error("Zanith: Lỗi kết nối online. Đang dùng dữ liệu ngoại tuyến.");
    });
}

/**
 * Hỗ trợ Pinterest: Tự động mở Modal sản phẩm nếu URL có đuôi #SKU
 */
function handleURLHash() {
    const hash = window.location.hash.substring(1); 
    if (!hash) return;

    // Lấy dữ liệu từ cache để tìm sản phẩm nhanh nhất
    const cachedData = localStorage.getItem('zanith_products_cache');
    if (cachedData) {
        const products = JSON.parse(cachedData);
        // Tìm sản phẩm có SKU khớp với đoạn sau dấu # trên link
        const target = products.find(p => p.SKU === hash || p.id === hash);
        
        // Nếu tìm thấy và có hàm mở Modal, thực hiện mở ngay
        if (target && typeof openProductModal === "function") {
            openProductModal(target); 
        }
    }
}

// Kích hoạt khi trang đã sẵn sàng
document.addEventListener("DOMContentLoaded", initZanithStore);
// Lắng nghe nếu khách đổi link (nhấn vào link # khác khi đang ở trong trang)
window.addEventListener('hashchange', handleURLHash);
