/**
 * ZANITH CONFIG v9.8 — PRODUCTION READY
 */
const ENCODED_SCRIPT_URL = "DÁN_MÃ_BASE64_URL_APPS_SCRIPT_CỦA_BẠN_VÀO_ĐÂY";

const CONFIG = {
  SCRIPT_URL: "",
  KEY_READ: "Zanith2026", // Key này phải khớp với key trong Apps Script của bạn
  TIMEOUT_MS: 20000,
  RETRY: 2
};

try {
  // Giải mã URL
  CONFIG.SCRIPT_URL = window.atob(ENCODED_SCRIPT_URL);
} catch(e) {
  console.error("❌ Lỗi cấu hình URL:", e.message);
}

/**
 * Hàm gọi Apps Script dùng chung cho cả Index và Admin
 */
async function zanithFetch(action, payload = {}, secret = CONFIG.KEY_READ) {
  if (!CONFIG.SCRIPT_URL) throw new Error("⚠️ SCRIPT_URL chưa được cấu hình!");

  for (let i = 0; i <= CONFIG.RETRY; i++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), CONFIG.TIMEOUT_MS);
      
      const res = await fetch(CONFIG.SCRIPT_URL, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" }, // Dùng text/plain để tránh lỗi CORS Preflight
        body: JSON.stringify({ action, secret, ...payload }),
        signal: controller.signal
      });
      
      clearTimeout(timeout);
      const data = await res.json();
      if (data.status === "error") throw new Error(data.message);
      return data;
    } catch (err) {
      if (i === CONFIG.RETRY) throw err;
      console.warn(`🔄 Thử lại lần ${i + 1}...`);
    }
  }
}
