/**
 * ============================================================
 * ZANITH ADMIN — PASSWORD GUARD
 * ✅ Không lưu password trong code — an toàn public GitHub
 * ✅ Xác thực qua Apps Script mỗi lần đăng nhập
 * ✅ Session token lưu tạm trong sessionStorage (xóa khi đóng tab)
 * ============================================================
 * ⚙️ CHỈ SỬA DÒNG NÀY:
 */
const ZANITH_SHEET_URL = 'https://script.google.com/macros/s/AKfycbwPRo-qRD4U6USHiQBUCIurwAt2fg_XeNE5SFUwbZ_YO7pvfMux61Un33zF7lYn0vId/exec';
/**
 * ============================================================
 * HƯỚNG DẪN APPS SCRIPT:
 * Trong hàm doPost() của Apps Script, thêm xử lý action 'verifyPassword':
 *
 *   if (body.action === 'verifyPassword') {
 *     const ok = body.secret === SECRET_KEY;
 *     return jsonResponse({ ok });
 *   }
 *
 * SECRET_KEY là mật khẩu bạn đặt trong Apps Script — không ai thấy được.
 * ============================================================
 */

(function () {
  'use strict';

  // Session token — chỉ sống trong tab hiện tại, đóng tab là mất
  var SESSION_KEY = 'zanith_session_verified';

  // ── 1. INJECT CSS ──────────────────────────────────────────
  var css = `
  #zanith-lock-screen {
    position: fixed; inset: 0; z-index: 99999;
    display: flex; align-items: center; justify-content: center;
    background: #0a0a0a; font-family: 'Georgia', serif;
  }
  #zanith-lock-screen.unlocked { display: none !important; }
  .zlock-box {
    width: 360px; padding: 48px 40px; background: #111;
    border: 1px solid #2a2a2a; border-radius: 4px;
    text-align: center; animation: zlock-fade-in 0.4s ease;
  }
  @keyframes zlock-fade-in {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .zlock-logo {
    font-size: 11px; letter-spacing: 0.35em; color: #444;
    text-transform: uppercase; margin-bottom: 32px;
  }
  .zlock-title { font-size: 22px; color: #e8e0d0; font-weight: normal; margin-bottom: 8px; }
  .zlock-sub { font-size: 12px; color: #555; margin-bottom: 32px; letter-spacing: 0.05em; }
  .zlock-input-wrap { position: relative; margin-bottom: 16px; }
  #zlock-password {
    width: 100%; padding: 14px 44px 14px 16px; background: #1a1a1a;
    border: 1px solid #2a2a2a; border-radius: 3px; color: #e8e0d0;
    font-size: 15px; font-family: 'Courier New', monospace;
    letter-spacing: 0.1em; box-sizing: border-box; outline: none; transition: border-color 0.2s;
  }
  #zlock-password:focus { border-color: #c9a96e; }
  #zlock-password.shake { animation: zlock-shake 0.4s ease; border-color: #c0392b !important; }
  @keyframes zlock-shake {
    0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)}
    40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)}
  }
  #zlock-toggle-pw {
    position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
    background: none; border: none; color: #444; cursor: pointer; font-size: 16px;
    padding: 4px; transition: color 0.2s;
  }
  #zlock-toggle-pw:hover { color: #888; }
  #zlock-btn {
    width: 100%; padding: 14px; background: #c9a96e; color: #0a0a0a; border: none;
    border-radius: 3px; font-size: 12px; font-family: 'Georgia', serif;
    letter-spacing: 0.2em; text-transform: uppercase; cursor: pointer;
    transition: background 0.2s, transform 0.1s;
  }
  #zlock-btn:hover:not(:disabled) { background: #d4b87a; transform: translateY(-1px); }
  #zlock-btn:disabled { background: #2a2a2a; color: #555; cursor: not-allowed; transform: none; }
  #zlock-msg { margin-top: 16px; font-size: 12px; min-height: 18px; letter-spacing: 0.05em; }
  #zlock-msg.error { color: #c0392b; }
  #zlock-msg.info  { color: #c9a96e; }
  .zlock-dots { display: flex; justify-content: center; gap: 6px; margin-top: 20px; }
  .zlock-dot { width: 6px; height: 6px; border-radius: 50%; background: #2a2a2a; transition: background 0.2s; }
  .zlock-dot.filled { background: #c9a96e; }
  .zlock-dot.wrong  { background: #c0392b; }

  #zanith-sync-badge {
    position: fixed; bottom: 20px; right: 20px; z-index: 9999;
    display: flex; align-items: center; gap: 8px; padding: 8px 14px;
    background: #111; border: 1px solid #2a2a2a; border-radius: 20px;
    font-size: 11px; color: #888; font-family: 'Georgia', serif;
    letter-spacing: 0.05em; transition: all 0.3s; cursor: pointer; user-select: none;
  }
  #zanith-sync-badge:hover { border-color: #444; }
  #zanith-sync-badge .sync-dot {
    width: 7px; height: 7px; border-radius: 50%; background: #444; flex-shrink: 0;
  }
  #zanith-sync-badge.syncing .sync-dot { background: #c9a96e; animation: zsync-pulse 0.8s ease infinite; }
  #zanith-sync-badge.synced .sync-dot  { background: #27ae60; }
  #zanith-sync-badge.error  .sync-dot  { background: #c0392b; }
  @keyframes zsync-pulse {
    0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.7)}
  }
  `;

  var styleEl = document.createElement('style');
  styleEl.id = 'zanith-guard-style';
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ── 2. INJECT HTML ─────────────────────────────────────────
  function injectHTML() {
    var lockHTML = `
<div id="zanith-lock-screen">
  <div class="zlock-box">
    <div class="zlock-logo">Zanith Studio</div>
    <div class="zlock-title">Admin Access</div>
    <div class="zlock-sub">Nhập mật khẩu để tiếp tục</div>
    <div class="zlock-input-wrap">
      <input type="password" id="zlock-password" placeholder="••••••••"
             autocomplete="off" spellcheck="false"/>
      <button id="zlock-toggle-pw" tabindex="-1" title="Hiện/ẩn">👁</button>
    </div>
    <button id="zlock-btn">Đăng nhập</button>
    <div id="zlock-msg"></div>
    <div class="zlock-dots">
      <div class="zlock-dot" id="zdot-0"></div>
      <div class="zlock-dot" id="zdot-1"></div>
      <div class="zlock-dot" id="zdot-2"></div>
    </div>
  </div>
</div>
<div id="zanith-sync-badge" style="display:none" title="Click để sync ngay">
  <span class="sync-dot"></span>
  <span id="zanith-sync-text">Chưa sync</span>
</div>`;

    var tmp = document.createElement('div');
    tmp.innerHTML = lockHTML;
    var body = document.body;
    while (tmp.firstChild) {
      body.insertBefore(tmp.firstChild, body.firstChild);
    }

    // ── 3. GUARD LOGIC ─────────────────────────────────────
    var MAX_ATTEMPTS = 3;
    var LOCKOUT_MS   = 30 * 1000;

    var lockScreen = document.getElementById('zanith-lock-screen');
    var pwInput    = document.getElementById('zlock-password');
    var loginBtn   = document.getElementById('zlock-btn');
    var msgEl      = document.getElementById('zlock-msg');
    var toggleBtn  = document.getElementById('zlock-toggle-pw');
    var syncBadge  = document.getElementById('zanith-sync-badge');
    var syncText   = document.getElementById('zanith-sync-text');

    var attempts    = 0;
    var lockedUntil = 0;
    var syncTimer   = null;

    function setMsg(text, type) {
      msgEl.textContent = text;
      msgEl.className   = type || '';
    }

    function updateDots(count, wrong) {
      for (var i = 0; i < 3; i++) {
        var dot = document.getElementById('zdot-' + i);
        dot.className = 'zlock-dot';
        if (i < count) dot.classList.add(wrong ? 'wrong' : 'filled');
      }
    }

    function checkLockout() {
      var now = Date.now();
      if (lockedUntil > now) {
        var sec = Math.ceil((lockedUntil - now) / 1000);
        setMsg('Thử lại sau ' + sec + 's', 'error');
        loginBtn.disabled = true;
        setTimeout(checkLockout, 1000);
        return true;
      }
      loginBtn.disabled = false;
      return false;
    }

    function unlockSuccess(secret) {
      // Lưu session tạm — mất khi đóng tab
      sessionStorage.setItem(SESSION_KEY, '1');
      // Lưu secret cho các API call sau (getData, setData...)
      // Dùng sessionStorage để không persist lên localStorage / GitHub
      sessionStorage.setItem('zanith_session_secret', secret);
      window.ZANITH_SHEET_SECRET = secret;

      attempts = 0;
      updateDots(0, false);
      lockScreen.classList.add('unlocked');
      syncBadge.style.display = 'flex';
      loadDataFromSheet(secret);
    }

    function tryUnlock() {
      if (checkLockout()) return;
      var val = pwInput.value;
      if (!val) return;

      loginBtn.disabled = true;
      setMsg('Đang xác thực...', 'info');

      fetch(ZANITH_SHEET_URL, {
        method: 'POST',
        mode: 'cors',
        redirect: 'follow', // Quan trọng: Để không bị lỗi Fail to fetch
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // Quan trọng: Tránh lỗi CORS
        body: JSON.stringify({ action: 'verifyPassword', secret: val })
      })
      .then(function(res) { return res.json(); })
      .then(function(result) {
        loginBtn.disabled = false;
        // Kiểm tra đúng cấu trúc trả về từ Apps Script mới
        if (result && result.status === "success" && result.data.ok === true) {
          unlockSuccess(val);
        } else {
          onWrongPassword();
        }
      })
      .catch(function(err) {
        loginBtn.disabled = false;
        setMsg('Lỗi kết nối: ' + err.message, 'error');
      });
    }
    function onWrongPassword() {
      attempts++;
      updateDots(attempts, true);
      pwInput.classList.add('shake');
      setTimeout(function () { pwInput.classList.remove('shake'); }, 400);
      pwInput.value = '';

      if (attempts >= MAX_ATTEMPTS) {
        lockedUntil = Date.now() + LOCKOUT_MS;
        setMsg('Sai ' + MAX_ATTEMPTS + ' lần — khóa 30 giây', 'error');
        loginBtn.disabled = true;
        setTimeout(function () {
          attempts = 0;
          updateDots(0, false);
          setMsg('', '');
          loginBtn.disabled = false;
        }, LOCKOUT_MS);
      } else {
        setMsg('Sai mật khẩu (' + attempts + '/' + MAX_ATTEMPTS + ')', 'error');
      }
    }

    loginBtn.addEventListener('click', tryUnlock);
    pwInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') tryUnlock();
      else setMsg('', '');
    });
    toggleBtn.addEventListener('click', function () {
      pwInput.type = pwInput.type === 'password' ? 'text' : 'password';
    });

    // Auto-focus
    setTimeout(function () { pwInput.focus(); }, 120);

    // Nếu session còn sống trong tab (ví dụ F5 refresh) → bỏ qua màn hình lock
    if (sessionStorage.getItem(SESSION_KEY) === '1') {
      var cachedSecret = sessionStorage.getItem('zanith_session_secret') || '';
      window.ZANITH_SHEET_SECRET = cachedSecret;
      lockScreen.classList.add('unlocked');
      syncBadge.style.display = 'flex';
      loadDataFromSheet(cachedSecret);
    }

    // ── CLOUD SYNC ─────────────────────────────────────────
    function setSyncStatus(status, text) {
      syncBadge.className = status;
      syncText.textContent = text;
    }

    function callSheet(action, payload, secret) {
      var s = secret || window.ZANITH_SHEET_SECRET || sessionStorage.getItem('zanith_session_secret') || '';
      var body = Object.assign({ secret: s, action: action }, payload);
      return fetch(ZANITH_SHEET_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }).then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      });
    }

    function loadDataFromSheet(secret) {
      setSyncStatus('syncing', 'Đang tải...');
      callSheet('getData', {}, secret)
        .then(function (result) {
          if (result && result.data) {
            localStorage.setItem('zanith_products', JSON.stringify(result.data.products || []));
            localStorage.setItem('zanith_settings', JSON.stringify(result.data.settings || {}));
            localStorage.setItem('zanith_orders',   JSON.stringify(result.data.orders   || []));
            window.dispatchEvent(new CustomEvent('zanith:data-loaded', { detail: result.data }));
            var d = new Date();
            setSyncStatus('synced', 'Đã đồng bộ ' + d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0'));
          }
        })
        .catch(function (e) {
          setSyncStatus('error', 'Lỗi tải data');
          console.warn('[ZanithGuard] load error:', e);
        });
    }

    function saveDataToSheet() {
      setSyncStatus('syncing', 'Đang lưu...');
      var data = {
        products: JSON.parse(localStorage.getItem('zanith_products') || '[]'),
        settings: JSON.parse(localStorage.getItem('zanith_settings') || '{}'),
        orders:   JSON.parse(localStorage.getItem('zanith_orders')   || '[]')
      };
      callSheet('setData', { data: data })
        .then(function () {
          var d = new Date();
          setSyncStatus('synced', 'Đã lưu ' + d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0'));
        })
        .catch(function (e) {
          setSyncStatus('error', 'Lỗi lưu — thử lại');
          console.warn('[ZanithGuard] save error:', e);
        });
    }

    // Auto-save khi localStorage thay đổi
    var _setItem = localStorage.setItem.bind(localStorage);
    localStorage.setItem = function (key, value) {
      _setItem(key, value);
      if (key.startsWith('zanith_') && lockScreen.classList.contains('unlocked')) {
        clearTimeout(syncTimer);
        syncTimer = setTimeout(saveDataToSheet, 2000);
      }
    };

    syncBadge.addEventListener('click', function () {
      clearTimeout(syncTimer);
      saveDataToSheet();
    });

    window.ZanithSync = { save: saveDataToSheet, load: function() { loadDataFromSheet(); } };
  }

  // Inject sau khi DOM sẵn sàng
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectHTML);
  } else {
    injectHTML();
  }

})();
