// scripts/json_to_products_ts.mjs
// Wrap scripts/products.from-ebay.json into lib/products.ts
// - Preserves existing SITE block verbatim
// - Replaces only PRODUCTS

import fs from 'node:fs';
import path from 'node:path';

const REPO_ROOT = process.cwd();
const JSON_IN = path.join(REPO_ROOT, 'scripts', 'products.from-ebay.json');
const PRODUCTS_TS = path.join(REPO_ROOT, 'lib', 'products.ts');

if (!fs.existsSync(JSON_IN)) {
  throw new Error(`Missing ${JSON_IN}. Run scripts/ebay_csv_to_products.mjs first.`);
}
if (!fs.existsSync(PRODUCTS_TS)) {
  throw new Error(`Missing ${PRODUCTS_TS}.`);
}

const json = JSON.parse(fs.readFileSync(JSON_IN, 'utf8'));
if (!Array.isArray(json)) throw new Error('products.from-ebay.json must be an array');

const tsSource = fs.readFileSync(PRODUCTS_TS, 'utf8');

const siteMatch = tsSource.match(/export const SITE[\s\S]*?=\s*\{[\s\S]*?\};/);
if (!siteMatch) {
  throw new Error('Could not find SITE block in lib/products.ts');
}
const siteBlock = siteMatch[0];

// stringify with stable formatting and valid TS
const productsTsLiteral = JSON.stringify(json, null, 2)
  // unquote object keys not required in TS (optional; safe to keep quoted)
  .replace(/"([^"]+)":/g, '$1:')
  // true/false and numbers are preserved by JSON.stringify, fine for TS
  ;

const out = `import type { Product, SiteMeta } from './types';

${siteBlock}

export const PRODUCTS: Product[] = ${productsTsLiteral};
`;

fs.writeFileSync(PRODUCTS_TS, out);
console.log(`Updated ${PRODUCTS_TS} with ${json.length} products while preserving SITE.`);
