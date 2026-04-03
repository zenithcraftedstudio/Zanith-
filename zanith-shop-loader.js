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
var ZANITH_SHOP_SHEET_URL    = 'https://script.google.com/macros/s/AKfycbwUmN6vywW2m4VRJsXeXp1T0ZHuioUV-ZbEHReFj2GgswyCkRuAxWmM3pw5zncscYWO/exec';  // ← URL Apps Script
var ZANITH_SHOP_SHEET_SECRET = 'YOUR_SECRET_KEY';       // ← Secret key
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: ZANITH_SHOP_SHEET_SECRET, action: 'getData' })
    }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    }).then(function (result) {
      if (result && result.data && Array.isArray(result.data.products)) {
        return result.data.products;
      }
      throw new Error('No products in response');
    });
  }

  // ── Main loader ──
  function run() {
    // Nếu chưa cài URL → bỏ qua, để CSV loader gốc làm việc
    if (!ZANITH_SHOP_SHEET_URL || ZANITH_SHOP_SHEET_URL === 'YOUR_APPS_SCRIPT_URL') {
      console.log('[ZanithShop] Apps Script URL chưa cài — dùng Google Sheet CSV như cũ.');
      return;
    }

    // 1. Thử cache trước để trang hiện nhanh
    var cached = getCache();
    if (cached && cached.length > 0) {
      console.log('[ZanithShop] Dùng cache (' + cached.length + ' sản phẩm)');
      tryTriggerShopRender(cached);
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
