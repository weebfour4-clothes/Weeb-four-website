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
    primaryLogo: "assets/weebfour_primary_logo_trans.png",
    secondarySymbol: "assets/weebfour_secondary_symbol_trans.png"
  },
  storyPanels: [
    {
      id: 1,
      image: "assets/tee_front_clean.jpg",
      badge1Title: "280 GSM FRENCH TERRY",
      badge1Sub: "Heavyweight Combed Cotton",
      badge2Title: "PREMIUM QUALITY",
      badge2Sub: "Sculptural Silhouette",
      stepIndicator: "PHASE 01 // PREMIUM MATERIAL",
      title: "HEAVYWEIGHT 280 GSM DRAPE",
      description: "Engineered from custom-knit high-density combed cotton with an antique wash. Maintains structural dropped-shoulder architecture and delivers an authentic, uncompromising tactile weight.",
      specs: [
        { label: "FABRIC DENSITY", value: "280 GSM" },
        { label: "TAILOR FIT", value: "BOXY OVERSIZED" },
        { label: "RIB COLLAR", value: "HIGH-ELASTICITY 1x1" },
        { label: "WASH LIFESPAN", value: "100+ CYCLES" }
      ],
      ctaText: "EXPLORE TEES",
      ctaCategory: "tshirts"
    },
    {
      id: 2,
      image: "assets/editorial_models.png",
      badge1Title: "SIGNATURE ARCHIVE",
      badge1Sub: "Editorial Silhouettes",
      badge2Title: "RAW STREETWEAR",
      badge2Sub: "Modern Cut",
      stepIndicator: "PHASE 02 // STRUCTURAL TAILORING",
      title: "OVERSIZED STREETWEAR DRAPES",
      description: "Blending antique tailoring with oversized streetwear proportions. Dropped shoulders, relaxed chest drapes, and high durability for all-day comfort.",
      specs: [
        { label: "SHOULDER SEAM", value: "DROPPED ARCHITECTURAL" },
        { label: "STITCHING", value: "DOUBLE-NEEDLE LOCK" },
        { label: "FEEL", value: "HEAVYWEIGHT SOFT TOUCH" },
        { label: "PRE-SHRUNK", value: "SILICONE WASHED" }
      ],
      ctaText: "VIEW COLLECTION",
      ctaCategory: "all"
    },
    {
      id: 3,
      image: "assets/art_tokyo_kanji.jpg",
      badge1Title: "CYBERPUNK GLITCH",
      badge1Sub: "Puff Print Calligraphy",
      badge2Title: "TACTILE CRAFTSMANSHIP",
      badge2Sub: "High Density Graphics",
      stepIndicator: "PHASE 03 // GRAPHIC ARTWORK",
      title: "HIGH-DENSITY TOKYO GRAPHICS",
      description: "Screen printed with premium durable inks and micro-puff detailing. Authentic underground Kanji typography and cyberpunk iconography.",
      specs: [
        { label: "PRINT TYPE", value: "HIGH-DENSITY PUFF & SCREEN" },
        { label: "ART INSPIRATION", value: "TOKYO CYBER UNDERGROUND" },
        { label: "COLOR RETENTION", value: "ANTI-FADE MINERAL" },
        { label: "TOUCH", value: "TACTILE RAISED TEXTURE" }
      ],
      ctaText: "SHOP CYBERPUNK TEE",
      ctaCategory: "tshirts"
    },
    {
      id: 4,
      image: "assets/art_apes_skull.jpg",
      badge1Title: "APES SKULL ARCHIVE",
      badge1Sub: "Mineral Acid Wash",
      badge2Title: "STRICTLY LIMITED",
      badge2Sub: "Authentic Drop",
      stepIndicator: "PHASE 04 // THE APES DROP",
      title: "MINERAL WASH APES SKULL",
      description: "Custom acid-washed t-shirt featuring our signature distressed Apes Skull design. Every shirt features a unique mineral distress pattern.",
      specs: [
        { label: "WASH STYLE", value: "MINERAL ACID DISTRESS" },
        { label: "PRINT FINISH", value: "CRACKLE VINTAGE MATTE" },
        { label: "COLLAR", value: "REINFORCED 1.25 INCH" },
        { label: "SHIPPING", value: "FREE ACROSS INDIA" }
      ],
      ctaText: "SHOP APES SKULL TEE",
      ctaCategory: "tshirts"
    }
  ]
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
