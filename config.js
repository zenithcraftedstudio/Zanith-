/**
 * ZANITH CONFIG v9.8 — ONLINE-FIRST & OBFSUCATED URL
 * 🔒 URL Apps Script được mã hóa Base64 để tránh bị crawl trực tiếp từ GitHub.
 * ⚠️ Thay thế ENCODED_SCRIPT_URL bằng chuỗi Base64 của URL thật của bạn.
 */

// 🔐 THAY THẾ BẰNG CHUỖI BASE64 CỦA URL APPS SCRIPT CỦA BẠN
// Ví dụ URL gốc: https://script.google.com/macros/s/ABC123xyz/exec
// Base64 tương ứng: aHR0cHM6Ly9zY3JpcHQuZ29vZ2xlLmNvbS9tYWNyb3Mvcy9BQkMxMjN4eXovZXhlYw==
const ENCODED_SCRIPT_URL = "aHR0cHM6Ly9zY3JpcHQuZ29vZ2xlLmNvbS9tYWNyb3Mvcy9ZT1VSX1NDUklQVF9JRC9leGVj";

const CONFIG = {
  SCRIPT_URL: "", // Sẽ được giải mã tự động khi file load
  KEY_READ: "Zanith2026",
  TIMEOUT_MS: 25000,
  RETRY: 2
};

/**
 * Giải mã Base64 an toàn
 */
function initConfig() {
  try {
    CONFIG.SCRIPT_URL = window.atob(ENCODED_SCRIPT_URL);
    if (!CONFIG.SCRIPT_URL.includes("script.google.com")) {
      throw new Error("URL sau khi giải mã không hợp lệ");
    }
  } catch (e) {
    console.error("❌ Lỗi giải mã Apps Script URL. Vui lòng kiểm tra lại ENCODED_SCRIPT_URL trong config.js");
    CONFIG.SCRIPT_URL = "";
  }
}
// Chạy ngay khi load
initConfig();

/**
 * Fetch wrapper chuẩn cho cả Admin & Shop
 */
async function zanithFetch(action, payload = {}, secret = CONFIG.KEY_READ) {
  if (!CONFIG.SCRIPT_URL) {
    throw new Error("⚠️ SCRIPT_URL chưa được cấu hình hoặc giải mã thất bại.");
  }
  
  let lastErr;
  for (let i = 0; i <= CONFIG.RETRY; i++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), CONFIG.TIMEOUT_MS);
      
      const res = await fetch(CONFIG.SCRIPT_URL, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, secret, ...payload }),
        signal: controller.signal
      });
      clearTimeout(timeout);
      
      const data = await res.json();
      if (data.status === "error") throw new Error(data.message || "Server error");
      return data;
    } catch (err) {
      lastErr = err;
      if (i < CONFIG.RETRY) await new Promise(r => setTimeout(r, 600 * (i + 1)));
    }
  }
  throw lastErr || new Error("Network failed");
}