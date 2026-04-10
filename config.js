/**
 * ZANITH CRAFTED STUDIO — config.js
 * File này commit lên GitHub/Cloudflare. Mọi thiết bị tự load.
 * QUAN TRỌNG: Điền URL Apps Script thật vào ZANITH_SCRIPT_URL
 */

// ← PASTE URL APPS SCRIPT THẬT VÀO ĐÂY (sau khi New Deployment)
const ZANITH_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx9mQfPWD9NKiL5_i6Vzafsc3pIKjGJ9sQ8T6uwRrj8dC1fynTGVfA6Am_3OR5wrsHV/exec';

const ZANITH_CONFIG = {
  SCRIPT_URL:    ZANITH_SCRIPT_URL,
  READ_KEY:      'Zanith2026',
  GA_ID:         'G-SGGH9DKW5J',
  // ✅ Cập nhật sang domain Cloudflare Pages
  DOWNLOAD_PAGE: 'https://zanith.pages.dev/download.html',
  SHOP_URL:      'https://zanith.pages.dev/',
  SHOP_EMAIL:    'zenithcraftedstudio@gmail.com'
};

// localStorage key (chỉ dùng cho session admin, không dùng cho URL)
const SCRIPT_URL_KEY = 'zanith_session_hint';

// Index và toàn bộ trang public dùng hàm này để fetch dữ liệu
// KHÔNG cần đăng nhập — dùng READ_KEY public
function getAppScriptUrl() {
  return ZANITH_CONFIG.SCRIPT_URL;
}
