// Tạm thời bỏ Base64 để test CORS. Sau khi chạy ổn mình sẽ encode lại.
const CONFIG = {
  // Dán nguyên URL mới vừa copy ở Bước 1 vào đây (giữ nguyên dấu ngoặc kép)
  SCRIPT_URL: "https://script.google.com/macros/s/AKfycbxGJZqtR40ySho3u4iq16wruTY1NjWI0PQZhrJ95IX0eZ4s60bZ_AbSb_u9PYUFG98/exec", 
  
  KEY_READ: "Zanith2026"
  TIMEOUT_MS: 20000,
  RETRY: 0 // Tắt retry để test nhanh
};

// Hàm fetch giữ nguyên
async function zanithFetch(action, payload = {}, secret = CONFIG.KEY_READ) {
  if (!CONFIG.SCRIPT_URL) throw new Error("Missing URL");
  
  const res = await fetch(CONFIG.SCRIPT_URL, {
    method: "POST",
    mode: "cors", // Quan trọng
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, secret, ...payload })
  });
  
  const data = await res.json();
  if (data.status === "error") throw new Error(data.message);
  return data;
}
