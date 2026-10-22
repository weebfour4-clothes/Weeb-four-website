// ==========================================================================
// WEEBFOUR STOREFRONT - CATALOG & TAXONOMY CONFIGURATION
// Collections:
// 1. Topwear: Shirts, T-Shirts, Sweatshirts, Hoodies, Bodysuits, Jackets
// 2. Bottom Wears: Trousers, Denims, Cargos, Joggers, Shorts
// 3. Accessories: Shades, Socks, Bags, Cap, Perfume
// ==========================================================================

const COLLECTIONS_CONFIG = {
  topwear: {
    id: "topwear",
    name: "TOPWEAR",
    title: "TOPWEAR DIVISION",
    subtitle: "Heavyweight French Terry, oversized tailored cuts, and technical outerwear.",
    items: [
      { id: "shirts", name: "Shirts", slug: "shirts", tag: "NEW SEASON" },
      { id: "tshirts", name: "T-Shirts", slug: "tshirts", tag: "HEAVYWEIGHT 280 GSM" },
      { id: "sweatshirts", name: "Sweatshirts", slug: "sweatshirts", tag: "FRENCH TERRY" },
      { id: "hoodies", name: "Hoodies", slug: "hoodies", tag: "420 GSM FLEECE" },
      { id: "bodysuits", name: "Bodysuits", slug: "bodysuits", tag: "SECOND SKIN" },
      { id: "jackets", name: "Jackets", slug: "jackets", tag: "OUTERWEAR" }
    ]
  },
  bottomwear: {
    id: "bottomwear",
    name: "BOTTOM WEARS",
    title: "BOTTOM WEAR DIVISION",
    subtitle: "Articulated knee cuts, tactical ripstop cargo pockets, and relaxed drapery.",
    items: [
      { id: "trousers", name: "Trousers", slug: "trousers", tag: "TAILORED RELAXED" },
      { id: "denims", name: "Denims", slug: "denims", tag: "RAW SELVEDGE" },
      { id: "cargos", name: "Cargos", slug: "cargos", tag: "MULTI-POCKET" },
      { id: "joggers", name: "Joggers", slug: "joggers", tag: "HEAVY FLEECE" },
      { id: "shorts", name: "Shorts", slug: "shorts", tag: "BOXER & COMBAT" }
    ]
  },
  accessories: {
    id: "accessories",
    name: "ACCESSORIES",
    title: "ACCESSORIES & OBJECTS",
    subtitle: "Finishing statement pieces, technical utility carriers, and dark fragrances.",
    items: [
      { id: "shades", name: "Shades", slug: "shades", tag: "UV400 STREETWEAR" },
      { id: "socks", name: "Socks", slug: "socks", tag: "CUSHIONED RIB" },
      { id: "bags", name: "Bags", slug: "bags", tag: "TACTICAL NYLON" },
      { id: "cap", name: "Cap", slug: "cap", tag: "STRUCTURED 6-PANEL" },
      { id: "perfume", name: "Perfume", slug: "perfume", tag: "SIGNATURE EXTRACT" }
    ]
  }
};

// Default curated streetwear catalog inspired by thelastape.in
const defaultProducts = [
  {
    id: 1,
    name: "RISE // OVERSIZED GRAPHIC TEE",
    category: "tshirts",
    tag: "NEW DROP",
    price: 999,
    compareAtPrice: 1999,
    sizes: ["S", "M", "L", "XL"],
    description: "Engineered from 280 GSM heavyweight combed cotton. Features Tokyo streetwear architectural typography, dropped shoulder seams, and reinforced collar.",
    images: ["assets/tee_front_clean.jpg", "assets/art_tokyo_kanji.jpg"]
  },
  {
    id: 2,
    name: "CHAMP // THE LAST APE HEAVY TEE",
    category: "tshirts",
    tag: "BEST SELLER",
    price: 1199,
    compareAtPrice: 2299,
    sizes: ["S", "M", "L", "XL"],
    description: "High-density 300 GSM French Terry t-shirt featuring signature The Last Ape graphic back-print in elevated tactile puff ink. Boxy oversized drape.",
    images: ["assets/tee_front.jpg", "assets/art_apes_skull.jpg"]
  },
  {
    id: 3,
    name: "CYBER-HEAVYWEIGHT 420 GSM HOODIE",
    category: "hoodies",
    tag: "BEST SELLER",
    price: 2199,
    compareAtPrice: 3999,
    sizes: ["S", "M", "L", "XL"],
    description: "Ultra-heavy 420 GSM double-fleece cotton hoodie. Double-layered structured hood without drawstrings for a sleek architectural streetwear silhouette.",
    images: ["assets/hero_branding_photo.jpg", "assets/editorial_models.png"]
  },
  {
    id: 4,
    name: "TACTICAL PARACHUTE CARGOS",
    category: "cargos",
    tag: "NEW DROP",
    price: 1899,
    compareAtPrice: 3499,
    sizes: ["S", "M", "L", "XL"],
    description: "Japanese DWR coated ripstop nylon cargo pants with 8 modular utility pockets, 3D articulated knee pleats, and adjustable ankle bungee cords.",
    images: ["assets/editorial_card.png", "assets/editorial_models.png"]
  },
  {
    id: 5,
    name: "ATELIER RELAXED BOX SHIRT",
    category: "shirts",
    tag: "NEW SEASON",
    price: 1499,
    compareAtPrice: 2499,
    sizes: ["S", "M", "L", "XL"],
    description: "Structured Cuban collar camp shirt in textured matte rayon blend. Relaxed drop-shoulder cut designed for modern high-fashion layering.",
    images: ["assets/editorial_models.png", "assets/editorial_card.png"]
  },
  {
    id: 6,
    name: "RAW SELVEDGE LOOSE DENIMS",
    category: "denims",
    tag: "LIMITED GRAIL",
    price: 2499,
    compareAtPrice: 4299,
    sizes: ["S", "M", "L", "XL"],
    description: "14.5 oz Japanese raw selvedge denim. Vintage stone-wash finish, wide-leg skate silhouette, custom matte black hardware, and chain-stitched hems.",
    images: ["assets/editorial_card.png", "assets/hero_branding_photo.jpg"]
  },
  {
    id: 7,
    name: "TOKYO RUNNER BOMBER JACKET",
    category: "jackets",
    tag: "OUTERWEAR",
    price: 2999,
    compareAtPrice: 4999,
    sizes: ["S", "M", "L", "XL"],
    description: "Water-resistant flight satin nylon bomber jacket with heavy quilted lining, oversized sleeves, utility arm pocket, and custom metal zip pulls.",
    images: ["assets/hero_branding_photo.jpg", "assets/editorial_card.png"]
  },
  {
    id: 8,
    name: "ARCHITECTURAL HEAVY SWEATSHIRT",
    category: "sweatshirts",
    tag: "FRENCH TERRY",
    price: 1699,
    compareAtPrice: 2999,
    sizes: ["S", "M", "L", "XL"],
    description: "380 GSM loopback cotton crewneck. Minimalist chest embroidery, ribbed side panels for mobility, and wide ribbed hem band.",
    images: ["assets/tee_back.jpg", "assets/tee_front_clean.jpg"]
  },
  {
    id: 9,
    name: "SECOND-SKIN TECHNICAL BODYSUIT",
    category: "bodysuits",
    tag: "NEW DROP",
    price: 1299,
    compareAtPrice: 2199,
    sizes: ["S", "M", "L"],
    description: "Moisture-wicking matte technical compression fabric with flatlock ergonomic seams and reflective branding details.",
    images: ["assets/editorial_models.png", "assets/editorial_card.png"]
  },
  {
    id: 10,
    name: "WIDE-LEG PLEATED TROUSERS",
    category: "trousers",
    tag: "TAILORED",
    price: 1799,
    compareAtPrice: 3199,
    sizes: ["S", "M", "L", "XL"],
    description: "Deep double-pleat tailored trousers crafted from durable poly-viscose twill with a flowing drape and relaxed puddle leg hem.",
    images: ["assets/editorial_card.png", "assets/editorial_models.png"]
  },
  {
    id: 11,
    name: "HEAVYWEIGHT DRAWSTRING JOGGERS",
    category: "joggers",
    tag: "420 GSM",
    price: 1599,
    compareAtPrice: 2799,
    sizes: ["S", "M", "L", "XL"],
    description: "Thick double-knit cotton fleece sweatpants with deep zipper pockets, extra-long natural drawstrings, and elasticated cuffs.",
    images: ["assets/editorial_models.png", "assets/hero_branding_photo.jpg"]
  },
  {
    id: 12,
    name: "TACTICAL COMBAT SHORTS",
    category: "shorts",
    tag: "SUMMER GRAIL",
    price: 1199,
    compareAtPrice: 1999,
    sizes: ["S", "M", "L", "XL"],
    description: "Ripstop utility shorts featuring 3D cargo side compartments, keychain D-ring attachment, and elastic waistband with cinch clip.",
    images: ["assets/editorial_card.png", "assets/editorial_models.png"]
  },
  {
    id: 13,
    name: "CYBER MATRIX UV400 SHADES",
    category: "shades",
    tag: "ACCESSORIES",
    price: 799,
    compareAtPrice: 1499,
    sizes: ["ONE SIZE"],
    description: "Futuristic wraparound cyberpunk sunglasses with UV400 polarized mirrored lenses and lightweight acetate frame.",
    images: ["assets/editorial_models.png", "assets/hero_branding_photo.jpg"]
  },
  {
    id: 14,
    name: "STRUCTURED 6-PANEL STREET CAP",
    category: "cap",
    tag: "6-PANEL",
    price: 699,
    compareAtPrice: 1299,
    sizes: ["ONE SIZE"],
    description: "100% heavy cotton twill structured 6-panel cap with high-density 3D embroidery and antique brass buckle closure.",
    images: ["assets/art_apes_skull.jpg", "assets/editorial_card.png"]
  },
  {
    id: 15,
    name: "MODULAR CORDURA TACTICAL BAG",
    category: "bags",
    tag: "CORDURA",
    price: 1099,
    compareAtPrice: 1999,
    sizes: ["ONE SIZE"],
    description: "Waterproof 500D Cordura crossbody sling bag with MOLLE webbing system, magnetic quick-release buckle, and padded strap.",
    images: ["assets/hero_branding_photo.jpg", "assets/editorial_models.png"]
  },
  {
    id: 16,
    name: "HEAVY RIBBED SOCKS (3-PACK)",
    category: "socks",
    tag: "RIBBED",
    price: 499,
    compareAtPrice: 899,
    sizes: ["FREE SIZE"],
    description: "Cushioned combed cotton crew socks with arch compression support and woven technical coordinates on the ankle.",
    images: ["assets/tee_front_clean.jpg", "assets/art_tokyo_kanji.jpg"]
  },
  {
    id: 17,
    name: "OBSIDIAN EXTRACT EAU DE PARFUM",
    category: "perfume",
    tag: "SIGNATURE",
    price: 1499,
    compareAtPrice: 2499,
    sizes: ["50 ML"],
    description: "Smoky dark woody fragrance with top notes of black pepper and bergamot, cedarwood heart, and rich ambergris base. 25% oil concentration.",
    images: ["assets/hero_branding_photo.jpg", "assets/art_apes_skull.jpg"]
  }
];

// Load catalog: prioritize custom catalog, fall back to default rich catalog
let products = [];
try {
  const savedCatalog = localStorage.getItem('weebfour_custom_catalog_v2');
  if (savedCatalog && JSON.parse(savedCatalog).length > 0) {
    products = JSON.parse(savedCatalog);
  } else {
    products = [...defaultProducts];
  }
} catch (e) {
  products = [...defaultProducts];
  console.warn("Could not parse saved catalog from localStorage", e);
}

// Default Website Content, Offers & Words configuration
const defaultSiteConfig = {
  announcements: [
    "FREE SHIPPING ON ALL ORDERS ACROSS INDIA",
    "NEW STREETWEAR COLLECTIONS LAUNCHING FOR WINTER-SPRING 2026",
    "USE CODE 'WEEB10' FOR 10% OFF YOUR FIRST ORDER",
    "CASH ON DELIVERY (COD) AVAILABLE NATIONWIDE",
    "7-DAY HASSLE-FREE RETURNS & EXCHANGES"
  ],
  offers: {
    shippingThreshold: 1499,
    flatShippingFee: 150,
    promos: [
      { code: "WEEB10", discountPercent: 10, description: "10% Welcome Discount" },
      { code: "WEEB20", discountPercent: 20, description: "20% VIP Drop Discount" },
      { code: "APE10", discountPercent: 10, description: "10% Streetwear Special" }
    ]
  },
  texts: {
    heroBadge: "WEEBFOUR® / WINTER-SPRING 2026 ARCHIVE",
    heroTitle: "BORN IN THE STREETS\nWEAR THE REVOLUTION",
    heroSubtitle: "Engineered in Tokyo & Mumbai. Ultra-heavyweight French Terry tees, technical waterproof nylon cargoes, and structural outerwear designed for the modern subculture.",
    heroCtaPrimary: "EXPLORE COLLECTIONS",
    heroCtaSecondary: "SHOP BY DIVISION",
    collectionsTitle: "SHOP BY COLLECTION",
    collectionsSubtitle: "Select your division: Topwear, Bottom Wears, and Street Accessories.",
    catalogTitle: "THE DROPS",
    catalogSubtitle: "LATEST ARRIVALS, RESTOCKS & LIMITED EDITION GRAILS",
    newsletterTitle: "JOIN THE WEEBFOUR SQUAD",
    newsletterSubtitle: "Subscribe to receive early access to seasonal drops, secret discount codes, and exclusive invitations to member releases.",
    footerAbout: "Avant-garde streetwear engineered for the subculture. Heavyweight fabrics, structural boxy cuts, and uncompromising attitude.",
    storeAddress: "9/23, 5th Street, Cyber Fashion Hub\nSector 4, Bandra West, Mumbai - 400050",
    storeEmail: "support@weebfour.com"
  },
  media: {
    heroBg: "assets/hero_branding_photo.jpg",
    primaryLogo: "assets/weebfour_primary_logo_trans.png",
    secondarySymbol: "assets/weebfour_secondary_symbol_trans.png"
  }
};

let siteConfig = JSON.parse(JSON.stringify(defaultSiteConfig));
try {
  const savedConfig = localStorage.getItem('weebfour_site_config');
  if (savedConfig) {
    siteConfig = JSON.parse(savedConfig);
  }
} catch (e) {
  console.warn("Could not parse saved site config", e);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { products, siteConfig, defaultProducts, defaultSiteConfig, COLLECTIONS_CONFIG };
} else {
  window.products = products;
  window.siteConfig = siteConfig;
  window.defaultProducts = defaultProducts;
  window.defaultSiteConfig = defaultSiteConfig;
  window.COLLECTIONS_CONFIG = COLLECTIONS_CONFIG;
}
