var ZANITH_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSY4PMlpCs78wKXxX_E2BKqGuJI3T9-vCrMWpo8YZtEEwyJvo5khwreI5Ca6xnQtZepxSaj9aeovGzW/pub?gid=0&single=true&output=csv';


// Các đoạn code xử lý bên dưới của loader...
 * ============================================================
 * ZANITH SHOP — DATA LOADER
 * ============================================================
 * Cách dùng: Thêm 1 dòng vào cuối <body> của index.html:
 *   <script src="zanith-shop-loader.js"></script>
 *
 * ⚙️ CHỈ SỬA 2 DÒNG NÀY (giống hệt trong zanith-guard.js):
 */
var ZANITH_SHOP_SHEET_URL    = 'https://script.google.com/macros/s/AKfycbxfgj56Z5oKgpfVoG4cNpVm8-NiamCpJa3H_dKQaPu2Pj2pBfPiRGDriSL4AL8AnLtR/exec';  // ← URL Apps Script
var ZANITH_SHOP_SHEET_SECRET = 'Zanith2026';       // ← Secret key
/**
 * ============================================================
 * Cách hoạt động:
 * - Trang shop mở → thử lấy data từ Apps Script
 * - Nếu OK → cache vào localStorage + kích hoạt re-render
 * - Nếu lỗi → dùng cache localStorage hoặc CSV gốc như cũ
 * ============================================================
 */

(function () {
  'use strict';

  var CACHE_KEY = 'zanith_shop_products_cache';
  var TTL_MS    = 5 * 60 * 1000; // cache 5 phút

  // ── Kiểm tra xem shop đã có hàm render chưa ──
  function tryTriggerShopRender(products) {
    // Nếu index.html expose allProducts + renderProducts/renderGrid
    if (window.allProducts && typeof window.filterProducts === 'function') {
      // Ghi đè allProducts và re-render
      window.allProducts = products;
      if (typeof window.filteredProducts !== 'undefined') window.filteredProducts = products.slice();
      window.filterProducts();
      return true;
    }
    // Thử renderGrid nếu có
    if (typeof window.renderGrid === 'function') {
      window.allProducts = products;
      window.renderGrid();
      return true;
    }
    return false;
  }

  // ── Đọc cache localStorage ──
  function getCache() {
    try {
      var raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      var obj = JSON.parse(raw);
      if (Date.now() - (obj.ts || 0) > TTL_MS) return null; // hết hạn
      return obj.products || null;
    } catch (e) { return null; }
  }

  // ── Ghi cache ──
  function setCache(products) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), products: products }));
    } catch (e) {}
  }

  // ── Fetch từ Apps Script ──
  function fetchFromScript() {
    return fetch(ZANITH_SHOP_SHEET_URL, {
      method: 'POST',
      mode: 'cors',           // Quan trọng 1: Chế độ chia sẻ tài nguyên
      redirect: 'follow',     // Quan trọng 2: Cho phép Google chuyển hướng link
      headers: { 
        'Content-Type': 'text/plain;charset=utf-8' // Quan trọng 3: Dùng text/plain để Google không chặn
      },
      body: JSON.stringify({ 
        action: 'read',       // Khớp với lệnh 'read' trong Apps Script 3 lớp của bạn
        key: ZANITH_SHOP_SHEET_SECRET 
      })
    })
    .then(function (res) {
      if (!res.ok) throw new Error('Lỗi kết nối HTTP ' + res.status);
      return res.json();
    })
    .then(function (result) {
      // Kiểm tra cấu trúc dữ liệu trả về từ Apps Script 3 lớp
      if (result && result.status === "success" && Array.isArray(result.data)) {
        return result.data; // Trả về mảng sản phẩm
      }
      throw new Error(result.message || 'Dữ liệu không đúng định dạng');
    });
  }
    // 2. Fetch mới từ Apps Script (background)
    fetchFromScript().then(function (products) {
      if (!products || products.length === 0) return;
      setCache(products);
      console.log('[ZanithShop] Đã tải ' + products.length + ' sản phẩm từ Apps Script');
      tryTriggerShopRender(products);

      // Cập nhật campaign data nếu có
      if (typeof window.loadCampaign === 'function') window.loadCampaign();
      window.dispatchEvent(new CustomEvent('zanith:shop-loaded', { detail: { count: products.length } }));

    }).catch(function (e) {
      console.warn('[ZanithShop] Fetch lỗi, dùng CSV gốc:', e.message);
      // Không làm gì thêm — CSV loader gốc trong index.html tự xử lý
    });
  }

  // Chạy sau khi DOM + scripts đã load
  if (document.readyState === 'complete') {
    run();
  } else {
    window.addEventListener('load', run);
  }

  // Public API
  window.ZanithShop = { reload: run };

})();
