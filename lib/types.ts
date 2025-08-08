// lib/types.ts
export type Variation = {
  label: string;
  sku?: string;
  inStock?: boolean;
  paymentLink?: string; // Stripe or (temporarily) eBay URL
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;              // dollars, not cents
  badges?: string[];
  images: string[];           // array of image URLs
  variations?: Variation[];   // ← OPTIONAL so CSV-only items don’t break
  notes?: string[];
  category: string;
};

export type SiteMeta = {
  brand: string;
  tagline: string;
  hero: { headline: string; sub: string };
  socials: { instagram?: string; ebay?: string };
  policies: { shipping: string; returns: string; quality: string };
};
