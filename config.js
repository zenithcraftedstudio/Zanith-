/**
 * ZANITH CRAFTED STUDIO — config.js v9.9
 * File này commit lên GitHub. Mọi thiết bị tự load.
 * DEPLOY: Điền URL Apps Script vào ZANITH_SCRIPT_URL
 */
const ZANITH_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxloT6C1lArchnAUqlF9TN3hSy9FBG-KI-XAF-zdxXyc6G4iLjNOEEy05Q-d6rHADuS/exec';

const ZANITH_CONFIG = {
  SCRIPT_URL:    ZANITH_SCRIPT_URL,
  READ_KEY:      'Zanith2026',
  GA_ID:         'G-SGGH9DKW5J',
  DOWNLOAD_PAGE: 'https://zenithcraftedstudio.github.io/Zanith-/download.html',
  SHOP_EMAIL:    'zenithcraftedstudio@gmail.com'
};

const SCRIPT_URL_KEY = 'zanith_script_url';

function getAppScriptUrl() {
  return localStorage.getItem(SCRIPT_URL_KEY) || ZANITH_CONFIG.SCRIPT_URL || '';
}
