import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { generateGarmentSvg } from "./garment-svg.mjs";

// Load .env.local automatically
function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, "utf-8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx <= 0) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvLocal();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = process.env.SUPABASE_PRODUCT_IMAGES_BUCKET || "product-images";

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const BRAIN_DIR =
  "C:\\Users\\yunus\\.gemini\\antigravity\\brain\\bddc047d-e04e-4d0d-ac1e-14191dd5bea7";
const HORDE_DIR = path.join(BRAIN_DIR, "scratch", "horde-products");

// Real AI-generated images + cutout editorial assets
const AI_ASSETS = {
  // Editorial Models & Cutouts
  "editorial/hero/hero-model.jpg": path.join(BRAIN_DIR, "hero_model_1794310600794.jpg"),
  "editorial/hero/hero-cutout.png": path.join(BRAIN_DIR, "hero_cutout.png"),
  "editorial/testimonials/testimonial-portrait.jpg": path.join(
    BRAIN_DIR,
    "testimonial_streetwear_customer_1794377859822.jpg"
  ),
  "editorial/categories/cat-men.jpg": path.join(BRAIN_DIR, "cat_men_1794310621588.jpg"),
  "editorial/categories/cat-women.jpg": path.join(BRAIN_DIR, "look_04_png_1794310620525.jpg"),
  "editorial/categories/cat-unisex.jpg": path.join(BRAIN_DIR, "style_workwear_1794310603082.jpg"),
  "editorial/categories/cat-accessories.jpg": path.join(BRAIN_DIR, "cat_accessories_png_1794310598614.jpg"),
  "editorial/campaigns/seasonal-banner.jpg": path.join(BRAIN_DIR, "seasonal_banner_png_1794310619738.jpg"),
  "editorial/lookbook/look-03.jpg": path.join(BRAIN_DIR, "look_03_png_1794310596740.jpg"),
  "editorial/lookbook/look-04.jpg": path.join(BRAIN_DIR, "look_04_png_1794310620525.jpg"),
  "editorial/styles/style-workwear.jpg": path.join(BRAIN_DIR, "style_workwear_1794310603082.jpg"),
  "editorial/styles/style-japanese.jpg": path.join(BRAIN_DIR, "style_japanese_1794310629038.jpg"),
  // Product Studio Photos (6)
  "products/men/orbit-washed-boxy-tee.jpg": path.join(BRAIN_DIR, "m_tee_01_1794310621542.jpg"),
  "products/men/earth-plaid-flannel-overshirt.jpg": path.join(BRAIN_DIR, "m_shirt_03_1794310620652.jpg"),
  "products/men/vintage-brown-detroit-work-jacket.jpg": path.join(BRAIN_DIR, "prod_m_detroit_jacket_1794313028486.jpg"),
  "products/men/charcoal-sunfaded-zip-hoodie.jpg": path.join(BRAIN_DIR, "m_hoodie_01_png_1794310629748.jpg"),
  "products/women/ivory-contrast-baby-tee.jpg": path.join(BRAIN_DIR, "w_tee_01_1794310639473.jpg"),
  "products/women/indigo-cropped-trucker-denim.jpg": path.join(BRAIN_DIR, "w_outer_01_1794310643770.jpg"),
};

const CATEGORIES = [
  { name: "Kaos & Graphic Tees", slug: "kaos-tees", is_active: true },
  { name: "Kemeja & Overshirt", slug: "kemeja-overshirt", is_active: true },
  { name: "Jaket & Outerwear", slug: "jaket-outerwear", is_active: true },
  { name: "Hoodie & Crewneck", slug: "hoodie-crewneck", is_active: true },
  { name: "Jeans & Denim", slug: "jeans-denim", is_active: true },
  { name: "Celana & Cargo", slug: "celana-cargo", is_active: true },
  { name: "Knitwear, Rok & Dress", slug: "women-wear", is_active: true },
  { name: "Topi, Tas & Aksesori", slug: "aksesoris", is_active: true },
];

// 60 Distinct Indonesian Streetwear & Curated Thrift Products
const PRODUCTS = [
  // ================= MEN (20) =================
  {
    sku: "ST-M-01",
    name: "Orbit Washed Black Boxy Graphic Tee",
    slug: "orbit-washed-boxy-tee",
    categorySlug: "kaos-tees",
    gender: "men",
    price: 75000,
    original_price: 110000,
    condition: "Excellent",
    color: "Washed Charcoal",
    material: "Heavyweight Cotton 240gsm",
    style_tags: ["y2k-streetwear", "skate-culture"],
    measurements: "Panjang 72cm · Lebar Dada 58cm",
    badge: "BEST SELLER",
    is_featured: true,
    aiImage: "products/men/orbit-washed-boxy-tee.jpg",
    description:
      "Vintage washed black oversized graphic tee dengan karakter streetwear Jakarta yang kuat. Material cotton tebal 240gsm, potongan boxy fit, dan efek faded alami.",
    variants: [
      { size_label: "M", stock: 2 },
      { size_label: "L", stock: 3 },
      { size_label: "XL", stock: 1 },
    ],
  },
  {
    sku: "ST-M-02",
    name: "Bandung Heavyweight Ivory Plain Tee",
    slug: "bandung-heavyweight-ivory-tee",
    categorySlug: "kaos-tees",
    gender: "men",
    price: 55000,
    condition: "Like New",
    color: "Warm Ivory",
    material: "Combed Cotton 24s",
    style_tags: ["minimal-daily", "casual-essentials"],
    measurements: "Panjang 70cm · Lebar Dada 56cm",
    badge: "UNDER 100K",
    is_featured: false,
    svg: { silhouette: "tee", primaryHex: "#F4F1EA", secondaryHex: "#D5D0C5" },
    description:
      "Kaos polos heavyweight lokal bernuansa warm ivory dengan kerah rib tebal yang kokoh. Potongan santai untuk layering jaket workwear maupun dipakai harian.",
    variants: [
      { size_label: "M", stock: 3 },
      { size_label: "L", stock: 4 },
    ],
  },
  {
    sku: "ST-M-03",
    name: "Kemang Faded Olive Pocket Tee",
    slug: "kemang-faded-olive-pocket-tee",
    categorySlug: "kaos-tees",
    gender: "men",
    price: 62000,
    condition: "Very Good",
    color: "Faded Olive",
    material: "100% Soft Cotton",
    style_tags: ["vintage-workwear", "casual-essentials"],
    measurements: "Panjang 71cm · Lebar Dada 55cm",
    badge: "NEW",
    is_featured: false,
    svg: { silhouette: "tee", primaryHex: "#555D4A", secondaryHex: "#3C4233", label: "pocket" },
    description:
      "Kaos thrift kurasi dengan saku dada utility berwarna olive pudar. Jahitan rantai rapi dan tekstur katun lembut yang adem untuk cuaca tropis.",
    variants: [
      { size_label: "L", stock: 2 },
      { size_label: "XL", stock: 2 },
    ],
  },
  {
    sku: "ST-M-04",
    name: "Midnight Skate Vintage Navy Tee",
    slug: "midnight-skate-vintage-navy-tee",
    categorySlug: "kaos-tees",
    gender: "men",
    price: 68000,
    original_price: 95000,
    condition: "Excellent",
    color: "Vintage Navy",
    material: "Cotton Jersey",
    style_tags: ["skate-culture", "y2k-streetwear"],
    measurements: "Panjang 73cm · Lebar Dada 59cm",
    badge: "UNDER 100K",
    is_featured: false,
    svg: { silhouette: "tee", primaryHex: "#242E42", secondaryHex: "#171E2C", label: "graphic" },
    description:
      "Vintage navy skate tee dengan sablon motif retro yang sedikit retak natural. Siluet lebar cocok dipadukan dengan baggy jeans dan sneakers kanvas.",
    variants: [
      { size_label: "L", stock: 2 },
      { size_label: "XL", stock: 1 },
    ],
  },
  {
    sku: "ST-M-05",
    name: "Charcoal Twill Boxy Work Shirt",
    slug: "charcoal-twill-boxy-work-shirt",
    categorySlug: "kemeja-overshirt",
    gender: "men",
    price: 95000,
    condition: "Like New",
    color: "Faded Charcoal",
    material: "Cotton Twill",
    style_tags: ["vintage-workwear", "minimal-daily"],
    measurements: "Panjang 69cm · Lebar Dada 58cm",
    badge: "EDITOR'S PICK",
    is_featured: false,
    svg: { silhouette: "shirt", primaryHex: "#333436", secondaryHex: "#1E1F20", accentHex: "#7A7A78" },
    description:
      "Kemeja kerja potongan boxy dengan dua saku dada fungsional. Bahan cotton twill kokoh namun tetap nyaman dipakai terbuka sebagai outer.",
    variants: [
      { size_label: "M", stock: 1 },
      { size_label: "L", stock: 2 },
    ],
  },
  {
    sku: "ST-M-06",
    name: "Jogja Striped Relaxed Oxford Shirt",
    slug: "jogja-striped-oxford-shirt",
    categorySlug: "kemeja-overshirt",
    gender: "men",
    price: 88000,
    condition: "Excellent",
    color: "Cream / Mocha Stripe",
    material: "Brushed Oxford Cotton",
    style_tags: ["japanese-street", "casual-essentials"],
    measurements: "Panjang 74cm · Lebar Dada 60cm",
    badge: "UNDER 100K",
    is_featured: false,
    svg: { silhouette: "shirt", primaryHex: "#E8E1D3", secondaryHex: "#7E6752", label: "stripe" },
    description:
      "Kemeja oxford vintage motif garis tipis cream-cokelat bergaya Japanese city-boy. Cocok untuk outfit kampus maupun nongkrong santai sore hari.",
    variants: [
      { size_label: "M", stock: 2 },
      { size_label: "L", stock: 2 },
    ],
  },
  {
    sku: "ST-M-07",
    name: "Earth Plaid Brushed Flannel Overshirt",
    slug: "earth-plaid-flannel-overshirt",
    categorySlug: "kemeja-overshirt",
    gender: "men",
    price: 105000,
    original_price: 145000,
    condition: "Excellent",
    color: "Earth Brown / Olive",
    material: "Heavy Brushed Flannel",
    style_tags: ["japanese-street", "vintage-workwear"],
    measurements: "Panjang 75cm · Lebar Dada 61cm",
    badge: "BEST SELLER",
    is_featured: true,
    aiImage: "products/men/earth-plaid-flannel-overshirt.jpg",
    description:
      "Overshirt flanel earth-tone cokelat dan olive dengan tekstur brushed cotton lembut. Potongan oversized ideal untuk layering di atas kaos putih.",
    variants: [
      { size_label: "L", stock: 2 },
      { size_label: "XL", stock: 2 },
    ],
  },
  {
    sku: "ST-M-08",
    name: "Raw Indigo Washed Denim Work Shirt",
    slug: "raw-indigo-washed-denim-shirt",
    categorySlug: "kemeja-overshirt",
    gender: "men",
    price: 110000,
    condition: "Very Good",
    color: "Dark Washed Indigo",
    material: "8oz Chambray Denim",
    style_tags: ["vintage-workwear", "casual-essentials"],
    measurements: "Panjang 73cm · Lebar Dada 57cm",
    badge: null,
    is_featured: false,
    svg: { silhouette: "shirt", primaryHex: "#2F3E56", secondaryHex: "#1E2838", accentHex: "#B59C78" },
    description:
      "Kemeja denim kerja warna dark indigo dengan jahitan kontras klasik. Kondisi terawat tanpa sobek, warna fading rapi di bagian saku dan kerah.",
    variants: [
      { size_label: "M", stock: 1 },
      { size_label: "L", stock: 2 },
    ],
  },
  {
    sku: "ST-M-09",
    name: "Vintage Brown Canvas Detroit Work Jacket",
    slug: "vintage-brown-detroit-work-jacket",
    categorySlug: "jaket-outerwear",
    gender: "men",
    price: 225000,
    original_price: 295000,
    condition: "Excellent",
    color: "Tobacco Brown",
    material: "12oz Duck Canvas",
    style_tags: ["vintage-workwear", "japanese-street"],
    measurements: "Panjang 66cm · Lebar Dada 61cm",
    badge: "BEST SELLER",
    is_featured: true,
    aiImage: "products/men/vintage-brown-detroit-work-jacket.jpg",
    description:
      "Jaket canvas Detroit bergaya workwear vintage dengan kerah corduroy gelap dan ritsleting kuningan. Patina alami membuat tampilannya sangat berkarakter.",
    variants: [
      { size_label: "L", stock: 1 },
      { size_label: "XL", stock: 1 },
    ],
  },
  {
    sku: "ST-M-10",
    name: "Matte Charcoal Nylon Bomber Jacket",
    slug: "matte-charcoal-nylon-bomber",
    categorySlug: "jaket-outerwear",
    gender: "men",
    price: 175000,
    condition: "Like New",
    color: "Matte Charcoal",
    material: "Water-Repellent Nylon",
    style_tags: ["y2k-streetwear", "minimal-daily"],
    measurements: "Panjang 67cm · Lebar Dada 60cm",
    badge: "NEW",
    is_featured: false,
    svg: { silhouette: "bomber", primaryHex: "#2B2D2F", secondaryHex: "#18191B", accentHex: "#555" },
    description:
      "Jaket bomber nylon matte dengan kerah rib dan saku lengan utilitarian. Ringan, tahan angin untuk berkendara malam di kota besar.",
    variants: [
      { size_label: "M", stock: 2 },
      { size_label: "L", stock: 1 },
    ],
  },
  {
    sku: "ST-M-11",
    name: "Minimalist Wool-Blend Boxy Varsity Jacket",
    slug: "minimalist-boxy-varsity-jacket",
    categorySlug: "jaket-outerwear",
    gender: "men",
    price: 235000,
    condition: "Excellent",
    color: "Charcoal / Cream",
    material: "Wool Blend & Cotton Twill",
    style_tags: ["skate-culture", "vintage-workwear"],
    measurements: "Panjang 68cm · Lebar Dada 62cm",
    badge: "LIMITED",
    is_featured: false,
    svg: { silhouette: "varsity", primaryHex: "#2A2B2E", secondaryHex: "#151618", accentHex: "#EAE5D9" },
    description:
      "Jaket varsity clean tanpa bordir berlebihan, memadukan bodi wool charcoal dengan lengan cream. Potongan cropped-boxy yang sangat proporsional.",
    variants: [
      { size_label: "L", stock: 1 },
    ],
  },
  {
    sku: "ST-M-12",
    name: "Sage Olive Half-Zip Technical Anorak",
    slug: "sage-olive-technical-anorak",
    categorySlug: "jaket-outerwear",
    gender: "men",
    price: 145000,
    condition: "Very Good",
    color: "Sage Olive",
    material: "Ripstop Nylon",
    style_tags: ["y2k-streetwear", "skate-culture"],
    measurements: "Panjang 70cm · Lebar Dada 62cm",
    badge: null,
    is_featured: false,
    svg: { silhouette: "track", primaryHex: "#5E6856", secondaryHex: "#3C4436", accentHex: "#9DA695" },
    description:
      "Windbreaker anorak setengah ritsleting warna sage olive dengan bahan ripstop ringan. Cocok untuk outfit outdoor-urban ala gorpcore lokal.",
    variants: [
      { size_label: "M", stock: 1 },
      { size_label: "L", stock: 2 },
    ],
  },
  {
    sku: "ST-M-13",
    name: "Charcoal Sun-Faded Boxy Zip Hoodie",
    slug: "charcoal-sunfaded-zip-hoodie",
    categorySlug: "hoodie-crewneck",
    gender: "men",
    price: 155000,
    original_price: 195000,
    condition: "Excellent",
    color: "Sun-Faded Black",
    material: "Heavy Fleece 360gsm",
    style_tags: ["y2k-streetwear", "skate-culture"],
    measurements: "Panjang 68cm · Lebar Dada 62cm",
    badge: "BEST SELLER",
    is_featured: true,
    aiImage: "products/men/charcoal-sunfaded-zip-hoodie.jpg",
    description:
      "Zip hoodie fleece tebal dengan efek sun-faded di sepanjang jahitan bahu dan kantong kanguru. Ritsleting metal kokoh dan hoodie double-layer.",
    variants: [
      { size_label: "M", stock: 2 },
      { size_label: "L", stock: 2 },
    ],
  },
  {
    sku: "ST-M-14",
    name: "Faded Navy Heavyweight Skate Crewneck",
    slug: "faded-navy-skate-crewneck",
    categorySlug: "hoodie-crewneck",
    gender: "men",
    price: 118000,
    condition: "Very Good",
    color: "Faded Navy",
    material: "Cotton Fleece 330gsm",
    style_tags: ["skate-culture", "casual-essentials"],
    measurements: "Panjang 70cm · Lebar Dada 60cm",
    badge: null,
    is_featured: false,
    svg: { silhouette: "crewneck", primaryHex: "#283347", secondaryHex: "#1B2230" },
    description:
      "Crewneck polos bernuansa vintage navy dengan drop shoulder yang rileks. Karet rib masih kencang dan bebas bulu berlebihan.",
    variants: [
      { size_label: "L", stock: 2 },
      { size_label: "XL", stock: 1 },
    ],
  },
  {
    sku: "ST-M-15",
    name: "Washed Black Ripstop Multi-Pocket Cargo",
    slug: "washed-black-ripstop-cargo",
    categorySlug: "celana-cargo",
    gender: "men",
    price: 145000,
    original_price: 185000,
    condition: "Excellent",
    color: "Washed Black",
    material: "Cotton Ripstop",
    style_tags: ["y2k-streetwear", "vintage-workwear"],
    measurements: "Lingkar Pinggang 80-86cm · Panjang 103cm",
    badge: "BEST SELLER",
    is_featured: false,
    svg: { silhouette: "cargo", primaryHex: "#242426", secondaryHex: "#151517", accentHex: "#6B6B68" },
    description:
      "Celana cargo wide-leg bahan cotton ripstop dengan saku samping besar dan tali serut di pergelangan kaki. Wajib punya untuk siluet streetwear harian.",
    variants: [
      { size_label: "30", stock: 2 },
      { size_label: "32", stock: 3 },
    ],
  },
  {
    sku: "ST-M-16",
    name: "Stonewashed Baggy Skate Denim Jeans",
    slug: "stonewashed-baggy-skate-denim",
    categorySlug: "jeans-denim",
    gender: "men",
    price: 155000,
    condition: "Excellent",
    color: "Light Stonewash Blue",
    material: "13oz Rigid Denim",
    style_tags: ["skate-culture", "y2k-streetwear"],
    measurements: "Lingkar Pinggang 82cm · Panjang 105cm",
    badge: "EDITOR'S PICK",
    is_featured: false,
    svg: { silhouette: "denim", primaryHex: "#7A98B5", secondaryHex: "#55718D", accentHex: "#D1B58A" },
    description:
      "Baggy jeans stonewashed era 90-an dengan leg opening lebar dan fading biru muda yang bersih. Sempurna untuk dipadukan dengan oversized graphic tee.",
    variants: [
      { size_label: "30", stock: 1 },
      { size_label: "32", stock: 2 },
      { size_label: "34", stock: 1 },
    ],
  },
  {
    sku: "ST-M-17",
    name: "Dark Charcoal Parachute Track Pants",
    slug: "dark-charcoal-parachute-pants",
    categorySlug: "celana-cargo",
    gender: "men",
    price: 125000,
    condition: "Like New",
    color: "Olive Charcoal",
    material: "Crinkle Nylon",
    style_tags: ["y2k-streetwear", "japanese-street"],
    measurements: "Pinggang Karet 74-90cm · Panjang 102cm",
    badge: "NEW",
    is_featured: false,
    svg: { silhouette: "cargo", primaryHex: "#444742", secondaryHex: "#2B2D2A", accentHex: "#959891" },
    description:
      "Celana parasut Y2K dengan detail lipatan lutut ergonomis dan stopper elastis di bagian bawah. Ringan dan bervolume saat dipakai bergerak.",
    variants: [
      { size_label: "M", stock: 2 },
      { size_label: "L", stock: 2 },
    ],
  },
  {
    sku: "ST-M-18",
    name: "Khaki Relaxed Pleated Chino Trousers",
    slug: "khaki-relaxed-pleated-chino",
    categorySlug: "celana-cargo",
    gender: "men",
    price: 115000,
    condition: "Excellent",
    color: "Warm Khaki",
    material: "Brushed Cotton Twill",
    style_tags: ["japanese-street", "minimal-daily"],
    measurements: "Lingkar Pinggang 80cm · Panjang 100cm",
    badge: null,
    is_featured: false,
    svg: { silhouette: "pants", primaryHex: "#BFA98B", secondaryHex: "#8F7B5E", accentHex: "#4A4339" },
    description:
      "Celana chino potongan relaxed dengan lipatan pinggang klasik bergaya city-boy Tokyo. Rapi namun tetap santai saat dipasangkan dengan flanel atau tee.",
    variants: [
      { size_label: "30", stock: 2 },
      { size_label: "32", stock: 2 },
    ],
  },
  {
    sku: "ST-M-19",
    name: "Straight-Cut Deep Indigo Selvedge Jeans",
    slug: "straight-cut-deep-indigo-jeans",
    categorySlug: "jeans-denim",
    gender: "men",
    price: 165000,
    condition: "Like New",
    color: "Deep Indigo",
    material: "14oz Denim",
    style_tags: ["vintage-workwear", "minimal-daily"],
    measurements: "Lingkar Pinggang 82cm · Panjang 104cm",
    badge: "LIMITED",
    is_featured: false,
    svg: { silhouette: "denim", primaryHex: "#232F46", secondaryHex: "#161E2E", accentHex: "#B88C54" },
    description:
      "Jeans potongan straight klasik warna deep indigo pekat. Cocok untuk dipadukan bersama Detroit jacket dan boots atau retro trainers.",
    variants: [
      { size_label: "31", stock: 1 },
      { size_label: "32", stock: 1 },
    ],
  },
  {
    sku: "ST-M-20",
    name: "Vintage Slate Graphic Band-Style Tee",
    slug: "vintage-slate-band-style-tee",
    categorySlug: "kaos-tees",
    gender: "men",
    price: 82000,
    condition: "Very Good",
    color: "Slate Charcoal",
    material: "Soft Washed Cotton",
    style_tags: ["skate-culture", "y2k-streetwear"],
    measurements: "Panjang 72cm · Lebar Dada 57cm",
    badge: "UNDER 100K",
    is_featured: false,
    svg: { silhouette: "tee", primaryHex: "#3C3E42", secondaryHex: "#222427", label: "graphic" },
    description:
      "Kaos grafis orisinal bertema musik independen lokal dengan efek warna slate yang lembut. Tidak menerawang dan kerah tetap kencang.",
    variants: [
      { size_label: "M", stock: 1 },
      { size_label: "L", stock: 2 },
    ],
  },

  // ================= WOMEN (14) =================
  {
    sku: "ST-W-01",
    name: "Ivory Contrast Trim Ribbed Baby Tee",
    slug: "ivory-contrast-baby-tee",
    categorySlug: "kaos-tees",
    gender: "women",
    price: 49000,
    original_price: 75000,
    condition: "Like New",
    color: "Warm Cream / Navy",
    material: "Stretch Cotton Rib",
    style_tags: ["y2k-streetwear", "casual-essentials"],
    measurements: "Panjang 48cm · Lebar Dada 42cm",
    badge: "BEST SELLER",
    is_featured: true,
    aiImage: "products/women/ivory-contrast-baby-tee.jpg",
    description:
      "Baby tee bahan katun rib lembut berwarna cream dengan list leher navy kontras. Potongan fitted yang pas dipadukan bersama celana wide-leg.",
    variants: [
      { size_label: "S", stock: 2 },
      { size_label: "M", stock: 3 },
    ],
  },
  {
    sku: "ST-W-02",
    name: "Washed Charcoal Boxy Cropped Tee",
    slug: "washed-charcoal-cropped-tee",
    categorySlug: "kaos-tees",
    gender: "women",
    price: 58000,
    condition: "Excellent",
    color: "Washed Charcoal",
    material: "Heavyweight Cotton",
    style_tags: ["minimal-daily", "skate-culture"],
    measurements: "Panjang 50cm · Lebar Dada 50cm",
    badge: "UNDER 100K",
    is_featured: false,
    svg: { silhouette: "baby-tee", primaryHex: "#323234", secondaryHex: "#1E1E20" },
    description:
      "Cropped tee berpotongan boxy lebar yang tetap sopan di atas pinggang celana high-waist. Tekstur katun tebal dan warna charcoal natural.",
    variants: [
      { size_label: "S", stock: 2 },
      { size_label: "M", stock: 2 },
    ],
  },
  {
    sku: "ST-W-03",
    name: "Stone Blue Striped Oversized Poplin Shirt",
    slug: "stone-blue-oversized-poplin-shirt",
    categorySlug: "kemeja-overshirt",
    gender: "women",
    price: 85000,
    condition: "Excellent",
    color: "Stone Blue Stripe",
    material: "Cotton Poplin",
    style_tags: ["minimal-daily", "japanese-street"],
    measurements: "Panjang 73cm · Lebar Dada 60cm",
    badge: "EDITOR'S PICK",
    is_featured: false,
    svg: { silhouette: "shirt", primaryHex: "#D4DEE6", secondaryHex: "#6F8499", label: "stripe" },
    description:
      "Kemeja oversized bergaya clean urban dari bahan poplin renyah yang sejuk. Bisa dimasukkan sebagian ke celana jeans atau dijadikan outer santai.",
    variants: [
      { size_label: "All Size", stock: 3 },
    ],
  },
  {
    sku: "ST-W-04",
    name: "Vintage Cream Camp-Collar Linen Blouse",
    slug: "vintage-cream-camp-collar-blouse",
    categorySlug: "kemeja-overshirt",
    gender: "women",
    price: 78000,
    condition: "Very Good",
    color: "Natural Cream",
    material: "Cotton Linen Blend",
    style_tags: ["casual-essentials", "minimal-daily"],
    measurements: "Panjang 60cm · Lebar Dada 52cm",
    badge: "UNDER 100K",
    is_featured: false,
    svg: { silhouette: "blouse", primaryHex: "#EFE9DC", secondaryHex: "#B5A892", accentHex: "#7A6A53" },
    description:
      "Blus kerah camp vintage bernuansa natural cream dengan kancing kayu. Ringan, breathable, cocok untuk suasana kafe dan kampus.",
    variants: [
      { size_label: "S", stock: 1 },
      { size_label: "M", stock: 2 },
    ],
  },
  {
    sku: "ST-W-05",
    name: "Oatmeal Chunky Rib-Knit Cardigan",
    slug: "oatmeal-chunky-knit-cardigan",
    categorySlug: "women-wear",
    gender: "women",
    price: 115000,
    original_price: 150000,
    condition: "Like New",
    color: "Warm Oatmeal",
    material: "Soft Cotton Knit",
    style_tags: ["minimal-daily", "casual-essentials"],
    measurements: "Panjang 54cm · Lebar Dada 53cm",
    badge: "NEW",
    is_featured: false,
    svg: { silhouette: "knit", primaryHex: "#DFD7C8", secondaryHex: "#9F9483" },
    description:
      "Kardigan rajut tekstur rib warna oatmeal hangat dengan potongan sedikit cropped. Lembut di kulit dan mudah dipadukan dengan rok maupun trousers.",
    variants: [
      { size_label: "S", stock: 1 },
      { size_label: "M", stock: 2 },
    ],
  },
  {
    sku: "ST-W-06",
    name: "Olive Sage Fine-Knit Pullover Sweater",
    slug: "olive-sage-fine-knit-sweater",
    categorySlug: "women-wear",
    gender: "women",
    price: 98000,
    condition: "Excellent",
    color: "Olive Sage",
    material: "Fine Cotton Knit",
    style_tags: ["japanese-street", "minimal-daily"],
    measurements: "Panjang 61cm · Lebar Dada 55cm",
    badge: "UNDER 100K",
    is_featured: false,
    svg: { silhouette: "crewneck", primaryHex: "#7E8471", secondaryHex: "#585E4E" },
    description:
      "Sweater rajut tipis warna sage olive yang ringan dan jatuh rapi di badan. Ideal untuk ruangan ber-AC atau cuaca hujan Bandung.",
    variants: [
      { size_label: "M", stock: 2 },
    ],
  },
  {
    sku: "ST-W-07",
    name: "Indigo Washed Cropped Trucker Denim Jacket",
    slug: "indigo-cropped-trucker-denim",
    categorySlug: "jaket-outerwear",
    gender: "women",
    price: 155000,
    original_price: 210000,
    condition: "Excellent",
    color: "Medium Vintage Indigo",
    material: "12oz Washed Denim",
    style_tags: ["y2k-streetwear", "vintage-workwear"],
    measurements: "Panjang 52cm · Lebar Dada 51cm",
    badge: "BEST SELLER",
    is_featured: true,
    aiImage: "products/women/indigo-cropped-trucker-denim.jpg",
    description:
      "Jaket denim trucker potongan cropped vintage dengan efek washed medium blue klasik. Memberikan proporsi kaki tampak lebih jenjang.",
    variants: [
      { size_label: "S", stock: 1 },
      { size_label: "M", stock: 2 },
    ],
  },
  {
    sku: "ST-W-08",
    name: "Stone Beige Cotton Twill Utility Jacket",
    slug: "stone-beige-utility-jacket",
    categorySlug: "jaket-outerwear",
    gender: "women",
    price: 138000,
    condition: "Very Good",
    color: "Stone Beige",
    material: "Cotton Twill",
    style_tags: ["minimal-daily", "vintage-workwear"],
    measurements: "Panjang 62cm · Lebar Dada 56cm",
    badge: null,
    is_featured: false,
    svg: { silhouette: "jacket", primaryHex: "#D5CEC0", secondaryHex: "#968E7F", accentHex: "#4F4B43" },
    description:
      "Outerwear ringan bahan katun twill berwarna stone netral dengan saku utility depan. Mudah dikombinasikan dengan bawahan warna gelap maupun cerah.",
    variants: [
      { size_label: "M", stock: 2 },
    ],
  },
  {
    sku: "ST-W-09",
    name: "Dark Indigo High-Waisted Wide Denim",
    slug: "dark-indigo-high-waisted-wide-denim",
    categorySlug: "jeans-denim",
    gender: "women",
    price: 145000,
    condition: "Excellent",
    color: "Dark Indigo",
    material: "12.5oz Denim",
    style_tags: ["minimal-daily", "y2k-streetwear"],
    measurements: "Pinggang 68-74cm · Panjang 102cm",
    badge: "EDITOR'S PICK",
    is_featured: false,
    svg: { silhouette: "denim", primaryHex: "#232C40", secondaryHex: "#171D2A", accentHex: "#C29B61" },
    description:
      "Celana jeans high-waist berpotongan wide-leg warna indigo pekat. Sangat flattering dan nyaman dipakai seharian.",
    variants: [
      { size_label: "27", stock: 2 },
      { size_label: "29", stock: 2 },
    ],
  },
  {
    sku: "ST-W-10",
    name: "Olive Pleated Wide-Leg Tailored Trousers",
    slug: "olive-pleated-wide-leg-trousers",
    categorySlug: "celana-cargo",
    gender: "women",
    price: 118000,
    condition: "Like New",
    color: "Muted Olive",
    material: "Cotton Twill",
    style_tags: ["japanese-street", "minimal-daily"],
    measurements: "Pinggang 68-76cm · Panjang 100cm",
    badge: "NEW",
    is_featured: false,
    svg: { silhouette: "pants", primaryHex: "#626952", secondaryHex: "#414636", accentHex: "#C9C5B8" },
    description:
      "Celana wide-leg lipit pinggang warna muted olive yang memberi siluet rapi sekaligus kasual. Cocok dipasangkan dengan baby tee atau kemeja oxford.",
    variants: [
      { size_label: "S", stock: 1 },
      { size_label: "M", stock: 2 },
    ],
  },
  {
    sku: "ST-W-11",
    name: "Washed Charcoal Utility Cargo Midi Skirt",
    slug: "charcoal-utility-cargo-midi-skirt",
    categorySlug: "women-wear",
    gender: "women",
    price: 96000,
    condition: "Excellent",
    color: "Washed Charcoal",
    material: "Cotton Ripstop",
    style_tags: ["y2k-streetwear", "skate-culture"],
    measurements: "Pinggang 70cm · Panjang 78cm",
    badge: "UNDER 100K",
    is_featured: false,
    svg: { silhouette: "skirt", primaryHex: "#3B3C3E", secondaryHex: "#202123" },
    description:
      "Rok midi cargo bernuansa streetwear dengan dua kantong samping besar. Nyaman untuk beraktivitas dan dipadukan dengan sneakers retro.",
    variants: [
      { size_label: "S", stock: 1 },
      { size_label: "M", stock: 2 },
    ],
  },
  {
    sku: "ST-W-12",
    name: "Minimalist Washed Black A-Line Midi Dress",
    slug: "washed-black-aline-midi-dress",
    categorySlug: "women-wear",
    gender: "women",
    price: 110000,
    condition: "Like New",
    color: "Washed Black",
    material: "Heavy Cotton Jersey",
    style_tags: ["minimal-daily", "casual-essentials"],
    measurements: "Panjang 112cm · Lebar Dada 47cm",
    badge: null,
    is_featured: false,
    svg: { silhouette: "dress", primaryHex: "#242426", secondaryHex: "#141416" },
    description:
      "Dress midi tanpa lengan berpotongan A-line minimalis. Sangat praktis untuk layering dengan kemeja oversized ataupun jaket denim.",
    variants: [
      { size_label: "S", stock: 1 },
      { size_label: "M", stock: 1 },
    ],
  },
  {
    sku: "ST-W-13",
    name: "Vintage Stone Straight-Cut Denim Jeans",
    slug: "vintage-stone-straight-denim-women",
    categorySlug: "jeans-denim",
    gender: "women",
    price: 128000,
    condition: "Very Good",
    color: "Light Vintage Blue",
    material: "12oz Cotton Denim",
    style_tags: ["casual-essentials", "vintage-workwear"],
    measurements: "Pinggang 70cm · Panjang 99cm",
    badge: null,
    is_featured: false,
    svg: { silhouette: "denim", primaryHex: "#87A2BE", secondaryHex: "#5C758E", accentHex: "#D2B48C" },
    description:
      "Jeans straight-cut klasik dengan fading biru muda alami. Potongan timeless yang pas untuk outfit harian tanpa ribet.",
    variants: [
      { size_label: "28", stock: 2 },
    ],
  },
  {
    sku: "ST-W-14",
    name: "Warm Brown Vintage Pleated Midi Skirt",
    slug: "warm-brown-vintage-midi-skirt",
    categorySlug: "women-wear",
    gender: "women",
    price: 89000,
    condition: "Excellent",
    color: "Earth Brown",
    material: "Cotton Gabardine",
    style_tags: ["japanese-street", "casual-essentials"],
    measurements: "Pinggang 68-74cm · Panjang 76cm",
    badge: "UNDER 100K",
    is_featured: false,
    svg: { silhouette: "skirt", primaryHex: "#7A5D45", secondaryHex: "#503B2A" },
    description:
      "Rok midi cokelat earth-tone dengan struktur bahan gabardine kokoh. Memberi kesan vintage editorial yang tenang.",
    variants: [
      { size_label: "M", stock: 2 },
    ],
  },

  // ================= UNISEX (16) =================
  {
    sku: "ST-U-01",
    name: "Mineral Gray Oversized Graphic Street Tee",
    slug: "mineral-gray-graphic-street-tee",
    categorySlug: "kaos-tees",
    gender: "unisex",
    price: 78000,
    original_price: 105000,
    condition: "Like New",
    color: "Mineral Gray",
    material: "Cotton Combed 20s",
    style_tags: ["y2k-streetwear", "skate-culture"],
    measurements: "Panjang 74cm · Lebar Dada 60cm",
    badge: "BEST SELLER",
    is_featured: false,
    svg: { silhouette: "tee", primaryHex: "#7B7B77", secondaryHex: "#4D4D4A", label: "graphic" },
    description:
      "Kaos streetwear unisex berwarna mineral gray dengan siluet drop-shoulder lega. Sablon grafis tonal di dada dan punggung tampil understated namun standout.",
    variants: [
      { size_label: "M", stock: 2 },
      { size_label: "L", stock: 3 },
      { size_label: "XL", stock: 2 },
    ],
  },
  {
    sku: "ST-U-02",
    name: "Espresso Brown Heavyweight Boxy Tee",
    slug: "espresso-brown-boxy-tee",
    categorySlug: "kaos-tees",
    gender: "unisex",
    price: 65000,
    condition: "Excellent",
    color: "Washed Espresso",
    material: "Heavy Cotton 250gsm",
    style_tags: ["minimal-daily", "casual-essentials"],
    measurements: "Panjang 71cm · Lebar Dada 59cm",
    badge: "UNDER 100K",
    is_featured: false,
    svg: { silhouette: "tee", primaryHex: "#4A372B", secondaryHex: "#2F221A" },
    description:
      "Kaos boxy unisex berwarna cokelat espresso pudar dengan ketebalan 250gsm. Memberi jatuh siluet rapi dan tidak mudah melar.",
    variants: [
      { size_label: "M", stock: 2 },
      { size_label: "L", stock: 2 },
    ],
  },
  {
    sku: "ST-U-03",
    name: "Cream Retro Orbit Print Oversized Tee",
    slug: "cream-retro-orbit-tee",
    categorySlug: "kaos-tees",
    gender: "unisex",
    price: 72000,
    condition: "Like New",
    color: "Vintage Cream",
    material: "Cotton 24s",
    style_tags: ["skate-culture", "casual-essentials"],
    measurements: "Panjang 73cm · Lebar Dada 58cm",
    badge: "NEW",
    is_featured: false,
    svg: { silhouette: "tee", primaryHex: "#EFEAE0", secondaryHex: "#C9C2B4", accentHex: "#4E5646", label: "graphic" },
    description:
      "Kaos streetwear warna vintage cream dengan motif ilustrasi orbit kecil di dada berwarna olive. Nyaman dipakai pria maupun wanita.",
    variants: [
      { size_label: "M", stock: 2 },
      { size_label: "L", stock: 3 },
    ],
  },
  {
    sku: "ST-U-04",
    name: "Sage Olive Drop-Shoulder Pullover Hoodie",
    slug: "sage-olive-pullover-hoodie",
    categorySlug: "hoodie-crewneck",
    gender: "unisex",
    price: 158000,
    original_price: 205000,
    condition: "Excellent",
    color: "Faded Sage Olive",
    material: "Cotton Fleece 350gsm",
    style_tags: ["y2k-streetwear", "minimal-daily"],
    measurements: "Panjang 70cm · Lebar Dada 64cm",
    badge: "EDITOR'S PICK",
    is_featured: false,
    svg: { silhouette: "hoodie", primaryHex: "#7A826F", secondaryHex: "#555C4C", accentHex: "#DFDDD6" },
    description:
      "Hoodie pullover unisex berwarna sage olive lembut dengan jahitan bahu turun yang sangat nyaman. Kantong kanguru luas dan tudung tebal.",
    variants: [
      { size_label: "M", stock: 2 },
      { size_label: "L", stock: 2 },
    ],
  },
  {
    sku: "ST-U-05",
    name: "Washed Ash Charcoal Vintage Crewneck",
    slug: "washed-ash-vintage-crewneck",
    categorySlug: "hoodie-crewneck",
    gender: "unisex",
    price: 125000,
    condition: "Very Good",
    color: "Ash Charcoal",
    material: "Cotton Terry 320gsm",
    style_tags: ["skate-culture", "casual-essentials"],
    measurements: "Panjang 69cm · Lebar Dada 61cm",
    badge: null,
    is_featured: false,
    svg: { silhouette: "crewneck", primaryHex: "#545557", secondaryHex: "#38393B" },
    description:
      "Crewneck terry charcoal dengan efek washed alami dan detail kerah rib V-insert klasik. Cocok untuk outfit kasual harian.",
    variants: [
      { size_label: "M", stock: 1 },
      { size_label: "L", stock: 2 },
    ],
  },
  {
    sku: "ST-U-06",
    name: "Olive Khaki Multi-Pocket Utility Vest",
    slug: "olive-khaki-utility-vest",
    categorySlug: "jaket-outerwear",
    gender: "unisex",
    price: 115000,
    condition: "Excellent",
    color: "Olive Khaki",
    material: "Canvas Twill",
    style_tags: ["vintage-workwear", "japanese-street"],
    measurements: "Panjang 64cm · Lebar Dada 58cm",
    badge: "LIMITED",
    is_featured: false,
    svg: { silhouette: "vest", primaryHex: "#696D56", secondaryHex: "#444737" },
    description:
      "Rompi utility multi-kantong berbahan canvas twill tebal. Menjadi statement layering instan di atas kaos oversized ataupun kemeja flannel.",
    variants: [
      { size_label: "L", stock: 2 },
    ],
  },
  {
    sku: "ST-U-07",
    name: "Washed Black Duck Canvas Chore Jacket",
    slug: "washed-black-chore-jacket",
    categorySlug: "jaket-outerwear",
    gender: "unisex",
    price: 195000,
    original_price: 250000,
    condition: "Excellent",
    color: "Washed Black",
    material: "Heavy Duck Canvas",
    style_tags: ["vintage-workwear", "japanese-street"],
    measurements: "Panjang 71cm · Lebar Dada 60cm",
    badge: "BEST SELLER",
    is_featured: false,
    svg: { silhouette: "jacket", primaryHex: "#272729", secondaryHex: "#141416", accentHex: "#7A7A78" },
    description:
      "Jaket chore workwear hitam pudar dengan tiga saku patch besar. Siluet lurus unisex yang sangat mudah dipadukan untuk gaya urban Bandung maupun Jakarta.",
    variants: [
      { size_label: "M", stock: 1 },
      { size_label: "L", stock: 2 },
    ],
  },
  {
    sku: "ST-U-08",
    name: "Retro Cream & Charcoal Nylon Track Jacket",
    slug: "retro-cream-charcoal-track-jacket",
    categorySlug: "jaket-outerwear",
    gender: "unisex",
    price: 145000,
    condition: "Very Good",
    color: "Cream / Charcoal",
    material: "Crinkle Nylon",
    style_tags: ["y2k-streetwear", "skate-culture"],
    measurements: "Panjang 68cm · Lebar Dada 61cm",
    badge: "NEW",
    is_featured: false,
    svg: { silhouette: "track", primaryHex: "#2D2E30", secondaryHex: "#1B1C1E", accentHex: "#EAE5DA" },
    description:
      "Track jacket color-block retro 90-an dengan kerah tinggi dan lapisan furing mesh breathable. Ringan namun tetap tahan angin.",
    variants: [
      { size_label: "M", stock: 1 },
      { size_label: "L", stock: 2 },
    ],
  },
  {
    sku: "ST-U-09",
    name: "Slate Blue Boxy Vintage Denim Jacket",
    slug: "slate-blue-boxy-denim-jacket",
    categorySlug: "jaket-outerwear",
    gender: "unisex",
    price: 185000,
    condition: "Excellent",
    color: "Slate Blue Wash",
    material: "13oz Cotton Denim",
    style_tags: ["vintage-workwear", "skate-culture"],
    measurements: "Panjang 65cm · Lebar Dada 61cm",
    badge: null,
    is_featured: false,
    svg: { silhouette: "jacket", primaryHex: "#5B738C", secondaryHex: "#3C4F63", accentHex: "#C7B28E" },
    description:
      "Jaket denim boxy unisex warna slate blue pudar yang sudah nyaman dipakai (broken-in feel). Kancing metal lengkap dan saku dalam fungsional.",
    variants: [
      { size_label: "M", stock: 1 },
      { size_label: "L", stock: 1 },
    ],
  },
  {
    sku: "ST-U-10",
    name: "Olive Drab Military Ripstop Cargo Pants",
    slug: "olive-drab-military-cargo-pants",
    categorySlug: "celana-cargo",
    gender: "unisex",
    price: 135000,
    condition: "Excellent",
    color: "Olive Drab",
    material: "Cotton Ripstop",
    style_tags: ["vintage-workwear", "y2k-streetwear"],
    measurements: "Pinggang 76-84cm · Panjang 103cm",
    badge: "BEST SELLER",
    is_featured: false,
    svg: { silhouette: "cargo", primaryHex: "#4F5741", secondaryHex: "#34392A", accentHex: "#A6A396" },
    description:
      "Celana cargo militer olive drab potongan relaxed yang ikonik di skena streetwear lokal. Memiliki adjuster pinggang samping dan saku kargo luas.",
    variants: [
      { size_label: "M", stock: 2 },
      { size_label: "L", stock: 2 },
    ],
  },
  {
    sku: "ST-U-11",
    name: "Washed Charcoal Wide Baggy Skate Denim",
    slug: "washed-charcoal-baggy-skate-denim",
    categorySlug: "jeans-denim",
    gender: "unisex",
    price: 162000,
    original_price: 198000,
    condition: "Like New",
    color: "Washed Charcoal",
    material: "13.5oz Denim",
    style_tags: ["skate-culture", "y2k-streetwear"],
    measurements: "Pinggang 78-84cm · Panjang 104cm",
    badge: "EDITOR'S PICK",
    is_featured: false,
    svg: { silhouette: "denim", primaryHex: "#38393C", secondaryHex: "#202124", accentHex: "#8C8C88" },
    description:
      "Celana jeans baggy unisex berwarna washed charcoal gelap dengan potongan ekstra lebar untuk tampilan skate yang effortless.",
    variants: [
      { size_label: "30", stock: 2 },
      { size_label: "32", stock: 2 },
    ],
  },
  {
    sku: "ST-U-12",
    name: "Stone Beige Loose Carpenter Denim Pants",
    slug: "stone-beige-carpenter-denim",
    categorySlug: "jeans-denim",
    gender: "unisex",
    price: 148000,
    condition: "Excellent",
    color: "Stone Ecru",
    material: "Heavy Duck Denim",
    style_tags: ["vintage-workwear", "japanese-street"],
    measurements: "Pinggang 78cm · Panjang 102cm",
    badge: "NEW",
    is_featured: false,
    svg: { silhouette: "cargo", primaryHex: "#D5CEC0", secondaryHex: "#A1998B", accentHex: "#555" },
    description:
      "Celana carpenter ecru dengan jahitan ganda, saku penggaris samping, dan loop palu khas workwear klasik.",
    variants: [
      { size_label: "30", stock: 1 },
      { size_label: "32", stock: 2 },
    ],
  },
  {
    sku: "ST-U-13",
    name: "Vintage Cream & Olive Zip Track Sweatshirt",
    slug: "cream-olive-zip-sweatshirt",
    categorySlug: "hoodie-crewneck",
    gender: "unisex",
    price: 128000,
    condition: "Very Good",
    color: "Cream / Olive",
    material: "Cotton Fleece",
    style_tags: ["skate-culture", "japanese-street"],
    measurements: "Panjang 69cm · Lebar Dada 60cm",
    badge: null,
    is_featured: false,
    svg: { silhouette: "track", primaryHex: "#E6E0D2", secondaryHex: "#565E49", accentHex: "#4E5646" },
    description:
      "Sweatshirt kerah setengah ritsleting memadukan warna cream hangat dan aksen olive. Memberi kesan sporty-vintage tanpa terlihat mencolok.",
    variants: [
      { size_label: "M", stock: 2 },
      { size_label: "L", stock: 1 },
    ],
  },
  {
    sku: "ST-U-14",
    name: "Sun-Faded Rust Boxy Vintage Tee",
    slug: "sun-faded-rust-boxy-tee",
    categorySlug: "kaos-tees",
    gender: "unisex",
    price: 59000,
    condition: "Good",
    color: "Faded Rust",
    material: "100% Cotton",
    style_tags: ["vintage-workwear", "casual-essentials"],
    measurements: "Panjang 70cm · Lebar Dada 57cm",
    badge: "UNDER 100K",
    is_featured: false,
    svg: { silhouette: "tee", primaryHex: "#9A5B47", secondaryHex: "#6E3D2E" },
    description:
      "Kaos thrift warna faded terracotta / rust yang unik. Cocok dipasangkan dengan celana denim pudar maupun celana hitam.",
    variants: [
      { size_label: "L", stock: 2 },
    ],
  },
  {
    sku: "ST-U-15",
    name: "Charcoal Fleece Relaxed Sweatpants",
    slug: "charcoal-fleece-sweatpants",
    categorySlug: "celana-cargo",
    gender: "unisex",
    price: 92000,
    condition: "Excellent",
    color: "Dark Charcoal",
    material: "Heavyweight Fleece",
    style_tags: ["minimal-daily", "casual-essentials"],
    measurements: "Pinggang Karet 72-88cm · Panjang 100cm",
    badge: "UNDER 100K",
    is_featured: false,
    svg: { silhouette: "pants", primaryHex: "#363739", secondaryHex: "#1E1F21", accentHex: "#7A7A7A" },
    description:
      "Celana sweatpants fleece tebal berpotongan lurus terbuka (open hem) yang nyaman untuk bepergian jarak jauh maupun harian.",
    variants: [
      { size_label: "M", stock: 2 },
      { size_label: "L", stock: 2 },
    ],
  },
  {
    sku: "ST-U-16",
    name: "Earth Khaki Oversized Camp Collar Shirt",
    slug: "earth-khaki-camp-collar-shirt",
    categorySlug: "kemeja-overshirt",
    gender: "unisex",
    price: 89000,
    condition: "Like New",
    color: "Earth Khaki",
    material: "Cotton Poplin",
    style_tags: ["minimal-daily", "japanese-street"],
    measurements: "Panjang 72cm · Lebar Dada 59cm",
    badge: "UNDER 100K",
    is_featured: false,
    svg: { silhouette: "shirt", primaryHex: "#B5A790", secondaryHex: "#877A65" },
    description:
      "Kemeja lengan pendek kerah camp berwarna earth khaki yang sejuk dan rapi. Mudah dipadupadankan untuk acara kasual maupun semi-formal.",
    variants: [
      { size_label: "M", stock: 2 },
      { size_label: "L", stock: 2 },
    ],
  },

  // ================= ACCESSORIES (10) =================
  {
    sku: "ST-A-01",
    name: "Sun-Faded Washed Black 6-Panel Cap",
    slug: "sunfaded-washed-black-cap",
    categorySlug: "aksesoris",
    gender: "accessories",
    price: 45000,
    original_price: 65000,
    condition: "Excellent",
    color: "Washed Black",
    material: "Brushed Cotton Twill",
    style_tags: ["skate-culture", "casual-essentials"],
    measurements: "One Size (Strap Adjustable)",
    badge: "BEST SELLER",
    is_featured: false,
    svg: { silhouette: "cap", primaryHex: "#2B2B2D", secondaryHex: "#1C1C1E" },
    description:
      "Topi baseball 6-panel katun twill warna hitam pudar matahari dengan pengatur besi di bagian belakang. Ringan dan pas di kepala.",
    variants: [
      { size_label: "OS", stock: 4 },
    ],
  },
  {
    sku: "ST-A-02",
    name: "Washed Olive Canvas Unstructured Dad Cap",
    slug: "washed-olive-canvas-cap",
    categorySlug: "aksesoris",
    gender: "accessories",
    price: 48000,
    condition: "Like New",
    color: "Faded Olive",
    material: "Washed Duck Canvas",
    style_tags: ["vintage-workwear", "minimal-daily"],
    measurements: "One Size (Buckle Strap)",
    badge: "UNDER 100K",
    is_featured: false,
    svg: { silhouette: "cap", primaryHex: "#555D48", secondaryHex: "#3C4233" },
    description:
      "Topi unstructured bergaya dad cap dari bahan canvas olive yang lembut. Pelengkap wajib untuk tampilan workwear harian.",
    variants: [
      { size_label: "OS", stock: 3 },
    ],
  },
  {
    sku: "ST-A-03",
    name: "Natural Unbleached Heavy Canvas Sling Bag",
    slug: "natural-canvas-messenger-sling-bag",
    categorySlug: "aksesoris",
    gender: "accessories",
    price: 85000,
    original_price: 115000,
    condition: "Like New",
    color: "Natural Unbleached Cream",
    material: "16oz Heavy Canvas",
    style_tags: ["japanese-street", "casual-essentials"],
    measurements: "38cm x 28cm x 11cm",
    badge: "EDITOR'S PICK",
    is_featured: false,
    svg: { silhouette: "bag", primaryHex: "#EAE4D6", secondaryHex: "#5A554A" },
    description:
      "Tas selempang messenger dari bahan kanvas tebal unbleached 16oz dengan tali bahu lebar. Muat laptop 14 inci, buku catatan, dan perlengkapan harian.",
    variants: [
      { size_label: "OS", stock: 3 },
    ],
  },
  {
    sku: "ST-A-04",
    name: "Washed Charcoal Nylon Utility Crossbody",
    slug: "charcoal-nylon-utility-crossbody",
    categorySlug: "aksesoris",
    gender: "accessories",
    price: 79000,
    condition: "Excellent",
    color: "Matte Charcoal",
    material: "Ripstop Nylon",
    style_tags: ["y2k-streetwear", "skate-culture"],
    measurements: "26cm x 18cm x 8cm",
    badge: "NEW",
    is_featured: false,
    svg: { silhouette: "bag", primaryHex: "#303234", secondaryHex: "#18191B" },
    description:
      "Tas selempang ringkas berbahan nylon tahan air dengan gesper matte dan kompartemen tersembunyi.",
    variants: [
      { size_label: "OS", stock: 3 },
    ],
  },
  {
    sku: "ST-A-05",
    name: "Stone Cream Heavyweight Webbing Tote Bag",
    slug: "stone-cream-webbing-tote-bag",
    categorySlug: "aksesoris",
    gender: "accessories",
    price: 65000,
    condition: "Like New",
    color: "Stone / Charcoal",
    material: "14oz Cotton Canvas",
    style_tags: ["minimal-daily", "japanese-street"],
    measurements: "40cm x 36cm x 12cm",
    badge: "UNDER 100K",
    is_featured: false,
    svg: { silhouette: "bag", primaryHex: "#DFD9CC", secondaryHex: "#2A2A28" },
    description:
      "Tote bag kanvas tebal dengan tali webbing kontras berwarna charcoal. Kuat membawa beban kuliah dan kerja sehari-hari.",
    variants: [
      { size_label: "OS", stock: 5 },
    ],
  },
  {
    sku: "ST-A-06",
    name: "Distressed Dark Brown Full-Grain Leather Belt",
    slug: "distressed-brown-leather-belt",
    categorySlug: "aksesoris",
    gender: "accessories",
    price: 68000,
    condition: "Very Good",
    color: "Dark Brown",
    material: "Full-Grain Leather",
    style_tags: ["vintage-workwear", "minimal-daily"],
    measurements: "Panjang 110cm · Lebar 3.2cm",
    badge: "UNDER 100K",
    is_featured: false,
    svg: { silhouette: "belt", primaryHex: "#4E3524", secondaryHex: "#2F1E13" },
    description:
      "Ikat pinggang kulit cokelat tua dengan gesper besi brushed steel. Patina kulit yang matang membuatnya serasi dengan denim atau chino.",
    variants: [
      { size_label: "OS", stock: 2 },
    ],
  },
  {
    sku: "ST-A-07",
    name: "Stone Beige Vintage Twill Bucket Cap",
    slug: "stone-beige-twill-cap",
    categorySlug: "aksesoris",
    gender: "accessories",
    price: 42000,
    condition: "Excellent",
    color: "Stone Beige",
    material: "Cotton Twill",
    style_tags: ["casual-essentials", "minimal-daily"],
    measurements: "One Size (Adjustable)",
    badge: "UNDER 100K",
    is_featured: false,
    svg: { silhouette: "cap", primaryHex: "#CFC6B4", secondaryHex: "#9C9280" },
    description:
      "Topi kasual warna stone beige netral yang mudah dipadu-padankan untuk aktivitas luar ruangan.",
    variants: [
      { size_label: "OS", stock: 4 },
    ],
  },
  {
    sku: "ST-A-08",
    name: "Olive Nylon Everyday Messenger Pack",
    slug: "olive-nylon-messenger-pack",
    categorySlug: "aksesoris",
    gender: "accessories",
    price: 89000,
    condition: "Excellent",
    color: "Muted Olive",
    material: "Heavy Nylon Canvas",
    style_tags: ["y2k-streetwear", "vintage-workwear"],
    measurements: "36cm x 26cm x 10cm",
    badge: null,
    is_featured: false,
    svg: { silhouette: "bag", primaryHex: "#555D49", secondaryHex: "#2C3126" },
    description:
      "Messenger bag harian berwarna olive yang ringkas dan fungsional untuk pengendara motor atau komuter KRL.",
    variants: [
      { size_label: "OS", stock: 2 },
    ],
  },
  {
    sku: "ST-A-09",
    name: "Minimalist Matte Black Leather Dress Belt",
    slug: "minimalist-black-leather-belt",
    categorySlug: "aksesoris",
    gender: "accessories",
    price: 62000,
    condition: "Like New",
    color: "Matte Black",
    material: "Smooth Cowhide Leather",
    style_tags: ["minimal-daily", "y2k-streetwear"],
    measurements: "Panjang 108cm · Lebar 3cm",
    badge: "UNDER 100K",
    is_featured: false,
    svg: { silhouette: "belt", primaryHex: "#1E1E20", secondaryHex: "#0E0E0F" },
    description:
      "Sabuk kulit hitam minimalis tanpa logo mencolok. Rapi untuk celana bahan maupun wide-leg denim.",
    variants: [
      { size_label: "OS", stock: 3 },
    ],
  },
  {
    sku: "ST-A-10",
    name: "Vintage Navy Corduroy 6-Panel Cap",
    slug: "vintage-navy-corduroy-cap",
    categorySlug: "aksesoris",
    gender: "accessories",
    price: 54000,
    condition: "Excellent",
    color: "Deep Navy",
    material: "Wide-Wale Corduroy",
    style_tags: ["skate-culture", "japanese-street"],
    measurements: "One Size (Adjustable)",
    badge: "UNDER 100K",
    is_featured: false,
    svg: { silhouette: "cap", primaryHex: "#253147", secondaryHex: "#172030" },
    description:
      "Topi corduroy bergaya retro dengan tekstur garis beludru yang khas. Nyaman dan memberikan sentuhan tekstur pada outfit polos.",
    variants: [
      { size_label: "OS", stock: 2 },
    ],
  },
];

async function uploadToStorage(storagePath, buffer, contentType) {
  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, buffer, {
    contentType,
    upsert: true,
  });
  if (error) {
    throw new Error(`Upload failed for ${storagePath}: ${error.message}`);
  }
}

async function main() {
  console.log("🚀 Starting SpaceTrip Catalog & Editorial Asset Seeding...");

  // 1. Ensure buckets exist
  await supabase.storage.createBucket(BUCKET, { public: true }).catch(() => {});

  // 2. Upload all AI-generated Editorial & Product photos
  console.log("📸 Uploading AI-generated Indonesian editorial & product photography...");
  for (const [storagePath, localFile] of Object.entries(AI_ASSETS)) {
    if (!fs.existsSync(localFile)) {
      console.warn(`⚠️ Missing local file ${localFile}, skipping...`);
      continue;
    }
    const buf = fs.readFileSync(localFile);
    const contentType = storagePath.toLowerCase().endsWith(".png")
      ? "image/png"
      : "image/jpeg";
    await uploadToStorage(storagePath, buf, contentType);
  }
  console.log(`✅ Uploaded ${Object.keys(AI_ASSETS).length} AI-generated assets to Supabase Storage.`);

  // 3. Upsert Categories
  console.log("📁 Seeding 8 categories...");
  const categoryMap = new Map();
  for (const cat of CATEGORIES) {
    const { data, error } = await supabase
      .from("categories")
      .upsert(cat, { onConflict: "slug" })
      .select("id,slug")
      .single();
    if (error) throw error;
    categoryMap.set(data.slug, data.id);
  }
  console.log(`✅ Categories ready: ${categoryMap.size}`);

  // 4. Upsert 60 Products + Variants + Studio Product Images
  console.log("👕 Seeding 60 distinct Indonesian streetwear & curated thrift products...");
  const productSlugToId = new Map();

  for (const p of PRODUCTS) {
    const categoryId = categoryMap.get(p.categorySlug);
    if (!categoryId) throw new Error(`Missing category for ${p.categorySlug}`);

    let storagePath = p.aiImage || `products/${p.gender}/${p.slug}.svg`;
    const hordeFile = path.join(HORDE_DIR, `${p.slug}.webp`);

    if (!p.aiImage && fs.existsSync(hordeFile) && fs.statSync(hordeFile).size > 25000) {
      storagePath = `products/${p.gender}/${p.slug}.webp`;
      await uploadToStorage(storagePath, fs.readFileSync(hordeFile), "image/webp");
    } else if (!p.aiImage && p.svg) {
      const svgContent = generateGarmentSvg(p.svg);
      await uploadToStorage(storagePath, Buffer.from(svgContent, "utf-8"), "image/svg+xml");
    }

    const { data: prodRow, error: prodErr } = await supabase
      .from("products")
      .upsert(
        {
          category_id: categoryId,
          name: p.name,
          slug: p.slug,
          description: p.description,
          price: p.price,
          original_price: p.original_price ?? null,
          status: "active",
          gender: p.gender,
          condition: p.condition,
          color: p.color,
          material: p.material,
          style_tags: p.style_tags,
          measurements: p.measurements,
          is_featured: Boolean(p.is_featured),
          badge: p.badge ?? null,
        },
        { onConflict: "slug" }
      )
      .select("id")
      .single();

    if (prodErr) throw prodErr;
    const productId = prodRow.id;
    productSlugToId.set(p.slug, productId);

    // Upsert variants idempotently (by product_id + size_label)
    for (let idx = 0; idx < p.variants.length; idx++) {
      const v = p.variants[idx];
      const variantSku = `${p.sku}-${v.size_label.replace(/\s+/g, "").toUpperCase()}`;
      const { error: varErr } = await supabase.from("product_variants").upsert(
        {
          product_id: productId,
          size_label: v.size_label,
          stock: v.stock,
          sku: variantSku,
          is_active: true,
        },
        { onConflict: "product_id,size_label" }
      );
      if (varErr) throw varErr;
    }

    // Ensure primary image exists cleanly without duplicates
    const { data: existingImgs } = await supabase
      .from("product_images")
      .select("id,storage_path")
      .eq("product_id", productId);

    if (!existingImgs || existingImgs.length === 0) {
      const { error: imgErr } = await supabase.from("product_images").insert({
        product_id: productId,
        storage_path: storagePath,
        alt: p.name,
        sort_order: 0,
      });
      if (imgErr) throw imgErr;
    } else {
      await supabase
        .from("product_images")
        .update({ storage_path: storagePath, alt: p.name })
        .eq("id", existingImgs[0].id);
    }
  }

  console.log(`✅ Successfully seeded ${productSlugToId.size} products with variants & images!`);

  // 5. Seed Editorial Looks linking Indonesian Model Photos directly to real catalog Product IDs
  console.log("✨ Seeding Editorial Lookbook ('Shop the Look')...");
  const LOOKS = [
    {
      title: "LOOK 01 — YOGYAKARTA WORKWEAR",
      subtitle: "Canvas Detroit Jacket, Heavyweight Ivory Tee & Deep Indigo Denim",
      model_name: "Raka (Yogyakarta)",
      location: "Yogyakarta Industrial Space",
      image_path: "editorial/lookbook/look-03.jpg",
      product_slugs: [
        "vintage-brown-detroit-work-jacket",
        "bandung-heavyweight-ivory-tee",
        "straight-cut-deep-indigo-jeans",
      ],
      sort_order: 1,
    },
    {
      title: "LOOK 02 — URBAN MINIMALIST",
      subtitle: "Oversized Striped Oxford, High-Waisted Wide Denim & Leather Belt",
      model_name: "Nadia (Jakarta Selatan)",
      location: "Menteng Architectural Wall",
      image_path: "editorial/lookbook/look-04.jpg",
      product_slugs: [
        "stone-blue-oversized-poplin-shirt",
        "dark-indigo-high-waisted-wide-denim",
        "minimalist-black-leather-belt",
      ],
      sort_order: 2,
    },
    {
      title: "LOOK 03 — BANDUNG CITY-BOY",
      subtitle: "Earth Plaid Flannel Overshirt, Relaxed Chino & Everyday Canvas Bag",
      model_name: "Dimas (Bandung)",
      location: "Braga Alleyway",
      image_path: "editorial/styles/style-japanese.jpg",
      product_slugs: [
        "earth-plaid-flannel-overshirt",
        "khaki-relaxed-pleated-chino",
        "natural-canvas-messenger-sling-bag",
      ],
      sort_order: 3,
    },
    {
      title: "LOOK 04 — JAKARTA STREET UTILITY",
      subtitle: "Washed Black Chore Jacket, Orbit Boxy Tee & Ripstop Cargo Pants",
      model_name: "Bagas (Jakarta)",
      location: "SCBD Studio",
      image_path: "editorial/hero/hero-model.jpg",
      product_slugs: [
        "washed-black-chore-jacket",
        "orbit-washed-boxy-tee",
        "washed-black-ripstop-cargo",
        "sunfaded-washed-black-cap",
      ],
      sort_order: 4,
    },
  ];

  // Clear previous seed looks cleanly & insert fresh deterministic set
  await supabase.from("editorial_looks").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  for (const lk of LOOKS) {
    const product_ids = lk.product_slugs
      .map((s) => productSlugToId.get(s))
      .filter(Boolean);

    const { error: lkErr } = await supabase.from("editorial_looks").insert({
      title: lk.title,
      subtitle: lk.subtitle,
      model_name: lk.model_name,
      location: lk.location,
      image_path: lk.image_path,
      product_ids,
      sort_order: lk.sort_order,
      is_active: true,
    });
    if (lkErr) throw lkErr;
  }

  console.log("✅ Editorial Lookbook ready!");
  console.log("🎉 SPACETRIP DATABASE SEEDING COMPLETE!");
}

main().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});

