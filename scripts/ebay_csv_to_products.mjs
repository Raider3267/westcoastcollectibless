// scripts/ebay_csv_to_products.mjs
// Convert eBay Active Listings CSV → scripts/products.from-ebay.json
// Mapping rules:
// - Title → name
// - Custom label (SKU) | SKU → variations[0].sku
// - Current price | Price | Buy It Now Price → price (number, USD)
// - Picture URL (split by |) → images[]
// - Description | Subtitle → description (fallback: "Imported from eBay listing.")
// - Quantity available → inStock (true if > 0)
// - Category (fallback "Collectibles") → category
// - id = slug(sku) or slug(title)

import fs from 'node:fs';
import path from 'node:path';

const CSV_PATH = process.env.EBAY_CSV_PATH
  || path.join(process.cwd(), 'data', 'eBay-all-active-listings-report-2025-08-07-12257717404.csv');

const OUT_JSON = path.join(process.cwd(), 'scripts', 'products.from-ebay.json');

// --- minimal CSV parser (handles quotes, commas) ---
function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = splitCSVLine(lines[0]);
  const rows = lines.slice(1).map(line => {
    const cells = splitCSVLine(line);
    const obj = {};
    headers.forEach((h, i) => (obj[h] = (cells[i] ?? '').trim()));
    return obj;
  });
  return { headers, rows };
}

function splitCSVLine(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"'; i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      out.push(cur); cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

// --- helpers ---
function firstCol(obj, candidates) {
  for (const cand of candidates) {
    const key = Object.keys(obj).find(k => k.trim().toLowerCase() === cand.toLowerCase());
    if (key) return key;
  }
  // partial match fallback
  for (const cand of candidates) {
    const key = Object.keys(obj).find(k => k.toLowerCase().includes(cand.toLowerCase()));
    if (key) return key;
  }
  return null;
}

function toUSDNumber(val) {
  if (!val) return 0;
  const num = parseFloat(String(val).replace(/[^0-9.]/g, ''));
  return Number.isFinite(num) ? Number(num.toFixed(2)) : 0;
}

function slugify(s) {
  return (s || '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || 'item';
}

// --- main ---
const csv = fs.readFileSync(CSV_PATH, 'utf8');
const { rows } = parseCSV(csv);

const products = rows.map((row, idx) => {
  // dynamic header detection per row (robust to varying exports)
  const titleK = firstCol(row, ['Title']);
  const skuK = firstCol(row, ['Custom label (SKU)', 'SKU', 'Custom label']);
  const priceK = firstCol(row, ['Current price', 'Price', 'Buy It Now Price', 'Start price']);
  const picK = firstCol(row, ['Picture URL', 'Picture URLs', 'PictureURL']);
  const descK = firstCol(row, ['Description', 'Subtitle', 'Item description']);
  const qtyK = firstCol(row, ['Quantity available', 'Quantity Available', 'Quantity']);
  const catK = firstCol(row, ['Category', 'Primary Category']);

  const name = (row[titleK] || `eBay Item ${idx + 1}`).trim();
  const sku = (row[skuK] || `SKU-${idx + 1}`).trim();
  const price = toUSDNumber(row[priceK]);
  const description = (row[descK] || 'Imported from eBay listing.').trim();
  const qty = parseInt(String(row[qtyK] || '1').replace(/[^\d]/g, ''), 10);
  const inStock = Number.isFinite(qty) ? qty > 0 : true;
  const category = (row[catK] || 'Collectibles').trim();

  // images
  const picsRaw = row[picK] || '';
  const images = picsRaw
    ? picsRaw.split('|').map(s => s.trim()).filter(s => /^https?:\/\//i.test(s)).slice(0, 8)
    : [];

  const id = slugify(sku || name);

  return {
    id,
    name: name.slice(0, 120),
    description: description.slice(0, 1000),
    price,
    badges: [],
    images,
    variations: [{
      label: 'Default',
      sku,
      inStock,
      paymentLink: '' // fill with Stripe Payment Links later
    }],
    notes: [],
    category
  };
});

// at least one item should have an image; if none, leave as-is but log
if (!products.some(p => (p.images?.[0] ?? '') !== '')) {
  console.warn('Warning: No product has a primary image (images[0]). Consider adding at least one for Stripe review.');
}

fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
fs.writeFileSync(OUT_JSON, JSON.stringify(products, null, 2));
console.log(`Wrote ${products.length} products → ${OUT_JSON}`);
