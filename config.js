/**
 * ZANITH CONFIG v9.8 — DEBUG VERSION
 */

// 🔐 DÁN CHUỖI BASE64 THẬT VÀO ĐÂY
const ENCODED_SCRIPT_URL = "aHR0cHM6Ly9zY3JpcHQuZ29vZ2xlLmNvbS9tYWNyb3Mvcy9BS2Z5Y2J4R0pacXRSNDB5U2hvM3U0aXExNndydVRZMU5qV0kwUFFaaHJKOTVJWDBlWjRzNjBiWl9BYlNiX3U5UFlVRkc5OC9leGVj";

const CONFIG = {
  SCRIPT_URL: "",
  KEY_READ: "Zanith2026",
  TIMEOUT_MS: 20000,
  RETRY: 2
};

// Debug: Log để kiểm tra
console.log("🔍 ENCODED_SCRIPT_URL:", ENCODED_SCRIPT_URL);

try {
  CONFIG.SCRIPT_URL = window.atob(ENCODED_SCRIPT_URL);
  console.log("✅ Decode thành công:", CONFIG.SCRIPT_URL);
  
  if (!CONFIG.SCRIPT_URL.includes("script.google.com/macros/s/")) {
    throw new Error("URL không chứa 'script.google.com/macros/s/'");
  }
  if (CONFIG.SCRIPT_URL.includes("YOUR_SCRIPT_ID")) {
    throw new Error("⚠️ URL vẫn chứa 'YOUR_SCRIPT_ID' — chưa thay URL thật!");
  }
  
} catch(e) {
  console.error("❌ Lỗi decode Base64:", e.message);
  console.error("📝 ENCODED_SCRIPT_URL hiện tại:", ENCODED_SCRIPT_URL);
  
  // Fallback: Dán URL trực tiếp vào đây nếu Base64 lỗi
  CONFIG.SCRIPT_URL = ""; // Để trống nếu muốn debug
}

async function zanithFetch(action, payload = {}, secret = CONFIG.KEY_READ) {
  console.log("📡 Fetching:", action, "from", CONFIG.SCRIPT_URL);
  
  if (!CONFIG.SCRIPT_URL) {
    throw new Error("⚠️ SCRIPT_URL trống! Kiểm tra console để biết lỗi decode.");
  }
  if (!CONFIG.SCRIPT_URL.includes("script.google.com")) {
    throw new Error("⚠️ SCRIPT_URL không hợp lệ: " + CONFIG.SCRIPT_URL);
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
      console.warn(`⚠️ Attempt ${i+1} failed:`, err.message);
      if (i < CONFIG.RETRY) await new Promise(r => setTimeout(r, 500 * (i + 1)));
    }
  }
  throw lastErr || new Error("Network failed");
}
