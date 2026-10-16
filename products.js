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

// All product pictures removed as requested. Catalog starts clean ready for your real pictures.
const defaultProducts = [];

// Load custom catalog from localStorage if user adds items via Admin
let products = [];
try {
  const savedCatalog = localStorage.getItem('weebfour_custom_catalog_v2');
  if (savedCatalog) {
    products = JSON.parse(savedCatalog);
  }
  // Clear legacy mock products from previous sessions
  localStorage.removeItem('weebfour_custom_catalog');
} catch (e) {
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
