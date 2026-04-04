/**
 * ZANITH LOADER v6.0 - AUTO SYNC
 * Tự động tải sản phẩm và cấu hình từ Google Sheet
 */

function initZanithStore() {
    console.log("Zanith: Đang kết nối hệ thống...");

    // Gọi hàm callSheet từ file zanith-guard.js
    // Chúng ta dùng KEY_READ "Zanith2026" để lấy dữ liệu công khai
    callSheet("readProducts", {}, "Zanith2026")
    .then(response => {
        if (response.status === "success") {
            console.log("Zanith: Đã lấy dữ liệu thành công từ Sheet.");
            
            // response.data chính là danh sách sản phẩm của bạn
            // Hàm renderProducts phải là hàm vẽ giao diện hiện tại của bạn
            if (typeof renderProducts === "function") {
                renderProducts(response.data);
            }
        } else {
            console.error("Zanith: Lỗi phản hồi từ Server.");
        }
    })
    .catch(err => {
        console.error("Zanith: Không thể tải sản phẩm. Hãy kiểm tra link Apps Script trong Settings.");
    });
}

// Lệnh này kích hoạt việc tải sản phẩm ngay khi trang web mở ra
document.addEventListener("DOMContentLoaded", initZanithStore);
