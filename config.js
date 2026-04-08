// config.js - Zanith Crafted Studio
const ZANITH_CONFIG = {
  // Dán mã ID đã mã hóa Base64 vào đây
  S_ID: 'aHR0cHM6Ly9zY3JpcHQuZ29vZ2xlLmNvbS9tYWNyb3Mvcy9BS2Z5Y2J6cXBYVVhlTDY1MnlCMlp0UzhjTE1DNURUV1MzSWRKTDFGM1pqb1phakR0a3pyTWpBc2VuU2hfdmtQVEFZb3RNbk8vZXhlYw==', 
  READ_KEY: 'Zanith2026',
  SHOP_NAME: 'Zanith Crafted Studio',
  GA_ID: 'G-SGGH9DKW5J'
};

// Hàm lấy URL giải mã
function getAppScriptUrl() {
  try {
    return "https://script.google.com/macros/s/" + atob(ZANITH_CONFIG.S_ID) + "/exec";
  } catch (e) {
    console.error("Lỗi giải mã ID: Hãy kiểm tra lại chuỗi S_ID.");
    return "";
  }
}
