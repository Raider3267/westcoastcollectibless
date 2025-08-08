export type Variation = {
  label: string;
  sku: string;
  inStock?: boolean;
  paymentLink?: string;
}

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number; // dollars, not cents
  badges?: string[];
  images: string[];
  variations: Variation[];
  notes?: string[];
  category: string;
}

export type SiteMeta = {
  brand: string;
  tagline: string;
  hero: { headline: string; sub: string };
  socials: { instagram?: string; ebay?: string };
  policies: { shipping: string; returns: string; quality: string };
}
