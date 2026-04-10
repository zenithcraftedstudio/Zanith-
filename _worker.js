/**
 * Cloudflare Pages Worker — zanith.pages.dev
 * Injects product-specific OG meta tags so Pinterest/Facebook crawlers
 * see the correct image & title when sharing ?sku=XXX links
 *
 * Place this file in the ROOT of your GitHub repo as: _worker.js
 * Cloudflare Pages auto-deploys it as an Edge Worker — FREE, no setup needed
 */

const SHOP_URL = 'https://zanith.pages.dev';
const DEFAULT_IMG = SHOP_URL + '/images/PTN-GEO-diamond-001.png';
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx9mQfPWD9NKiL5_i6Vzafsc3pIKjGJ9sQ8T6uwRrj8dC1fynTGVfA6Am_3OR5wrsHV/exec';
const READ_KEY = 'Zanith2026';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const sku = url.searchParams.get('sku');

    // Only process index page with ?sku= param
    // All other requests pass through normally
    if (!sku || url.pathname !== '/') {
      return env.ASSETS.fetch(request);
    }

    // Check if request is from a social media crawler
    const ua = request.headers.get('user-agent') || '';
    const isCrawler = /facebookexternalhit|Twitterbot|Pinterest|LinkedInBot|WhatsApp|Slackbot|Googlebot|bingbot/i.test(ua);

    if (!isCrawler) {
      // Real user — serve normal page (JS will handle modal opening via ?sku=)
      return env.ASSETS.fetch(request);
    }

    // Social crawler — fetch product data and inject OG tags
    let product = null;
    try {
      const res = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'readProducts', secret: READ_KEY }),
        cf: { cacheTtl: 300 } // cache 5 min on Cloudflare edge
      });
      const data = await res.json();
      const products = data.data ? (Array.isArray(data.data) ? data.data : (data.data.all || [])) : [];
      product = products.find(p => (p.SKU || p.sku) === sku);
    } catch (e) {}

    // Fetch the original HTML
    const response = await env.ASSETS.fetch(request);
    const html = await response.text();

    if (!product) {
      // Product not found — serve as-is
      return new Response(html, { headers: response.headers });
    }

    const title = (product.Title || product.title || 'Zanith Pattern') + ' — Zanith Crafted Studio';
    const desc = (product.Description || product.description || 'Seamless pattern · 300 DPI · Commercial License · Instant download').slice(0, 160);
    const img = product.Image || product.image || DEFAULT_IMG;
    const imgFull = img.startsWith('http') ? img : SHOP_URL + '/' + img;
    const pageUrl = SHOP_URL + '/?sku=' + sku;

    const ogTags = `
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${desc}">
    <meta property="og:image" content="${imgFull}">
    <meta property="og:url" content="${pageUrl}">
    <meta property="og:type" content="product">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${desc}">
    <meta name="twitter:image" content="${imgFull}">`;

    // Inject right after <head>
    const injected = html.replace('<head>', '<head>' + ogTags);

    return new Response(injected, {
      headers: {
        ...Object.fromEntries(response.headers),
        'content-type': 'text/html;charset=UTF-8',
        'cache-control': 'public, max-age=300'
      }
    });
  }
};
