/**
 * ZANITH CONFIG v9.8
 * ⚠️ QUAN TRỌNG: Thay YOUR_SCRIPT_ID bằng ID Apps Script thật của bạn
 */

// 🔗 URL Apps Script (dán URL Web App vào đây)
// Ví dụ: https://script.google.com/macros/s/ABC123xyz/exec
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxGJZqtR40ySho3u4iq16wruTY1NjWI0PQZhrJ95IX0eZ4s60bZ_AbSb_u9PYUFG98/exec";

const CONFIG = {
  SCRIPT_URL: APPS_SCRIPT_URL,
  KEY_READ: "Zanith2026",
  TIMEOUT_MS: 20000,
  RETRY: 2
};

/**
 * Fetch wrapper cho Apps Script
 */
async function zanithFetch(action, payload = {}, secret = CONFIG.KEY_READ) {
  if (!CONFIG.SCRIPT_URL || CONFIG.SCRIPT_URL.includes("YOUR_SCRIPT_ID")) {
    throw new Error("⚠️ Chưa cấu hình Apps Script URL trong config.js");
  }

  let lastErr;
  for (let i = 0; i <= CONFIG.RETRY; i++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), CONFIG.TIMEOUT_MS);

      const response = await fetch(CONFIG.SCRIPT_URL, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, secret, ...payload }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status === "error") {
        throw new Error(data.message || "Server error");
      }

      return data;

    } catch (err) {
      lastErr = err;
      if (i < CONFIG.RETRY) {
        await new Promise(r => setTimeout(r, 500 * (i + 1)));
      }
    }
  }

  throw lastErr || new Error("Network failed");
}

// Log để debug
console.log("✅ config.js loaded. URL:", CONFIG.SCRIPT_URL);
