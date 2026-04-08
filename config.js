{
  "_note": "Zanith Crafted Studio — Config file. Chỉnh trực tiếp hoặc qua Admin.",
  "sheet_id": "",
  "webhook_url": "",
  "emailjs": {
    "public_key": "",
    "service_id": "",
    "tpl_customer": "",
    "tpl_admin": "",
    "tpl_newsletter": "",
    "admin_email": ""
  },
  "anthropic_api_key": ""
}
// config.js - Quản lý cấu hình tập trung cho Zanith Crafted Studio
const ZANITH_CONFIG = {
  // 1. Dán Link Apps Script chuẩn (đã fix lỗi lặp lại /exec) vào đây
  S_ID:aHR0cHM6Ly9zY3JpcHQuZ29vZ2xlLmNvbS9tYWNyb3Mvcy9BS2Z5Y2J6cXBYVVhlTDY1MnlCMlp0UzhjTE1DNURUV1MzSWRKTDFGM1pqb1phakR0a3pyTWpBc2VuU2hfdmtQVEFZb3RNbk8vZXhlYw==
  // 2. Key Read (Để load sản phẩm công khai)
  READ_KEY: 'Zanith2026',
  
  // 3. Các thông tin khác nếu muốn quản lý tập trung
  SHOP_NAME: 'Zanith Crafted Studio',
  GA_ID: 'G-SGGH9DKW5J'
};
// Hàm giải mã link để sử dụng trong toàn bộ hệ thống
const getAppScriptUrl = () => {
  return "https://script.google.com/macros/s/" + atob(ZANITH_CONFIG.S_ID) + "/exec";
};
// Mã hóa nhẹ để tránh bot quét dạo (tùy chọn)
// Link script và Key sẽ được gọi thông qua đối tượng ZANITH_CONFIG
