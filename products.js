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
    title: "TOPWEAR COLLECTION",
    subtitle: "Heavyweight cotton, oversized boxy cuts, and streetwear tops.",
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
    title: "BOTTOM WEAR COLLECTION",
    subtitle: "Cargo pants, relaxed trousers, and comfortable everyday fits.",
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
    title: "ACCESSORIES",
    subtitle: "Everyday essentials, caps, shades, and bags.",
    items: [
      { id: "shades", name: "Shades", slug: "shades", tag: "UV400 STREETWEAR" },
      { id: "socks", name: "Socks", slug: "socks", tag: "CUSHIONED RIB" },
      { id: "bags", name: "Bags", slug: "bags", tag: "TACTICAL NYLON" },
      { id: "cap", name: "Cap", slug: "cap", tag: "STRUCTURED 6-PANEL" },
      { id: "perfume", name: "Perfume", slug: "perfume", tag: "SIGNATURE EXTRACT" }
    ]
  }
};

// Only the user's two original products
const defaultProducts = [
  {
    id: 1,
    name: "CYBERPUNK GLITCH OVERSIZED TEE",
    category: "tshirts",
    tag: "NEW DROP",
    price: 999,
    compareAtPrice: 1999,
    sizes: ["S", "M", "L", "XL"],
    description: "Upgrade your streetwear game with the signature WEEBFOUR Cyberpunk Glitch Oversized Tee. Cut from 280 GSM ultra-dense French Terry Cotton, this tee offers a heavy structural boxy fit designed to maintain its shape. Featuring high-density puff print calligraphy and the iconic WEB4! symbol, pre-shrunk and silicone washed.",
    images: ["assets/tee_front_clean.jpg", "assets/tee_back.jpg", "assets/art_tokyo_kanji.jpg"]
  },
  {
    id: 2,
    name: "APES SKULL ACID WASH TEE",
    category: "tshirts",
    tag: "BEST SELLER",
    price: 1199,
    compareAtPrice: 2299,
    sizes: ["S", "M", "L", "XL"],
    description: "Custom acid-washed t-shirt featuring our signature distressed Apes Skull design. Every shirt features a unique mineral distress pattern. Heavyweight 260 GSM fabric, ribbed crewneck collar, and double-needle stitching make this piece extremely durable and ready for daily wear.",
    images: ["assets/tee_front.jpg", "assets/tee_back.jpg", "assets/art_apes_skull.jpg"]
  }
];

// Always enforce the user's authentic 2 products
let products = [...defaultProducts];
try {
  localStorage.removeItem('weebfour_custom_catalog');
  localStorage.removeItem('weebfour_custom_catalog_v2');
} catch (e) {}

// Default Website Content, Offers & Words configuration
const defaultSiteConfig = {
  announcements: [
    "FREE SHIPPING ON ALL ORDERS ACROSS INDIA",
    "NEW STREETWEAR COLLECTIONS LAUNCHING FOR WINTER-SPRING 2026",
    "USE CODE 'WEEB10' FOR 10% OFF YOUR FIRST ORDER",
    "CASH ON DELIVERY (COD) AVAILABLE NATIONWIDE",
    "PAN-INDIA EXPRESS COURIER DISPATCH WITHIN 24-48 HOURS"
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
    heroBadge: "NEW ARRIVALS",
    heroTitle: "WEEBFOUR\nCLOTHING",
    heroSubtitle: "Heavyweight Cotton & Oversized Boxy Fits. Built for Everyday Streetwear.",
    heroCtaPrimary: "SHOP NOW",
    heroCtaSecondary: "EXPLORE COLLECTIONS",
    collectionsTitle: "SHOP BY COLLECTION",
    collectionsSubtitle: "Explore our collection: Topwear, Bottom Wears, and Street Accessories.",
    catalogTitle: "THE DROPS",
    catalogSubtitle: "LATEST ARRIVALS & RESTOCKS",
    newsletterTitle: "JOIN THE WEEBFOUR SQUAD",
    newsletterSubtitle: "Subscribe to receive early access to new drops, secret discount codes, and exclusive releases.",
    footerAbout: "Premium streetwear and graphic oversized tees. Heavyweight fabrics, durable boxy cuts, and clean aesthetic.",
    storeAddress: "9/23, 5th Street, X-Block, Anna Nagar\nChennai - 600040, Tamil Nadu",
    storeEmail: "support@weebfour.com"
  },
  media: {
    heroBg: "assets/hero_branding_photo.jpg",
    heroMobileBg: "assets/hero_branding_photo.jpg",
    primaryLogo: "assets/weebfour_primary_logo_trans.png"
  }
};

let siteConfig = JSON.parse(JSON.stringify(defaultSiteConfig));
try {
  localStorage.removeItem('weebfour_site_config');
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
