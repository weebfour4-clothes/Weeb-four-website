const defaultProducts = [
  {
    id: 1,
    name: "CYBERPUNK GLITCH OVERSIZED TEE",
    category: "tees",
    price: 999,
    compareAtPrice: 1999,
    tag: "BEST SELLER",
    sizes: ["S", "M", "L", "XL"],
    images: [
      "assets/tee_front_clean.jpg",
      "assets/tee_back.jpg",
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80"
    ],
    description: "Upgrade your streetwear game with the signature WEEBFOUR Cyberpunk Glitch Oversized Tee. Cut from 280 GSM ultra-dense French Terry Cotton, this tee offers a heavy structural boxy fit designed to maintain its shape. Featuring high-density puff print calligraphy and the iconic WEB4! symbol, pre-shrunk and silicone washed."
  },
  {
    id: 2,
    name: "APES SKULL ACID WASH TEE",
    category: "tees",
    price: 1099,
    compareAtPrice: 2199,
    tag: "NEW DROP",
    sizes: ["M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80"
    ],
    description: "Custom acid-washed t-shirt featuring our signature distressed Apes Skull design. Every shirt features a unique mineral distress pattern. Heavyweight 260 GSM fabric, ribbed crewneck collar, and double-needle stitching make this piece extremely durable and ready for daily wear."
  },
  {
    id: 3,
    name: "TOKYO DRIFT VARSITY JACKET",
    category: "jackets",
    price: 2999,
    compareAtPrice: 5999,
    tag: "LIMITED DROP",
    sizes: ["S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1611312449412-6cefac5dc3e4?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80"
    ],
    description: "The ultimate WEEBFOUR streetwear grail. Features vegan leather sleeves, a premium wool blend body, and detailed chenille embroidery patches with the W4! shuriken emblem on the chest and back. Quilted satin lining ensures premium warmth and comfort. Relaxed dropped-shoulder fit."
  },
  {
    id: 4,
    name: "LOST MINDS HEAVYWEIGHT HOODIE",
    category: "hoodies",
    price: 2499,
    compareAtPrice: 4499,
    tag: "BEST SELLER",
    sizes: ["S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=80"
    ],
    description: "Constructed from an ultra-thick 420 GSM double-fleece cotton blend. Features a double-lined hood (no drawstrings for a clean architectural aesthetic), kangaroo pocket with reinforced stitches, and tight ribbed cuffs. Finished with high-density WEEBFOUR typographic puff printing."
  },
  {
    id: 5,
    name: "UTILITY MULTI-POCKET CARGOES",
    category: "cargoes",
    price: 1999,
    compareAtPrice: 3499,
    tag: "RESTOCKED",
    sizes: ["S", "M", "L"],
    images: [
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1517462964-21fdcec3f25b?w=800&auto=format&fit=crop&q=80"
    ],
    description: "Engineered utility trousers featuring 6 tactical pockets, an adjustable integrated webbing belt, and toggles at the leg openings for a custom taper. Made from a heavy-duty cotton ripstop fabric that is both breathable and highly tear-resistant."
  },
  {
    id: 6,
    name: "DISTRESSED STREETWEAR SWEATER",
    category: "hoodies",
    price: 1799,
    compareAtPrice: 2999,
    tag: "HOT",
    sizes: ["M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?w=800&auto=format&fit=crop&q=80"
    ],
    description: "Knitted loose-gauge sweater with distressed detailing along the hem and collar. Very soft cotton acrylic blend that is warm yet breathable. Gives that effortless grunge avant-garde look."
  },
  {
    id: 7,
    name: "WEEBFOUR INDUSTRIAL METALLIC BEANIE",
    category: "accessories",
    price: 499,
    compareAtPrice: 999,
    tag: "COLLECTIBLE",
    sizes: ["ONESIZE"],
    images: [
      "https://images.unsplash.com/photo-1576871337622-98d48d4353d3?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=800&auto=format&fit=crop&q=80"
    ],
    description: "Four-way stretch knit beanie featuring a custom laser-etched polished steel hardware plate on the cuff with WEEBFOUR branding. Warm, snug, and acts as the perfect finishing touch to any street fit."
  },
  {
    id: 8,
    name: "TACTICAL INDUSTRIAL COBRA BELT",
    category: "accessories",
    price: 399,
    compareAtPrice: 799,
    tag: "ESSENTIAL",
    sizes: ["ONESIZE"],
    images: [
      "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80"
    ],
    description: "Heavy-duty canvas belt with a quick-release metal cobra buckle. Features embroidered WEEBFOUR typographic branding and W4! logo accents. Fully adjustable and perfect for threading through our multi-pocket cargoes."
  },
  {
    id: 9,
    name: "SHURIKEN CYBER TECH PARACHUTE PANTS",
    category: "cargoes",
    price: 1899,
    compareAtPrice: 3299,
    tag: "NEW DROP",
    sizes: ["S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=800&auto=format&fit=crop&q=80"
    ],
    description: "Ultra-wide parachute fit trousers with articulated knee pleats, bungee cinch ankles, and water-repellent nylon-cotton blend. Embroidered with subtle W4! emblem on the cargo flap."
  },
  {
    id: 10,
    name: "NEO TOKYO MINIMAL BOXY TEE",
    category: "tees",
    price: 899,
    compareAtPrice: 1799,
    tag: "ESSENTIAL",
    sizes: ["S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80"
    ],
    description: "Clean minimalist heavyweight boxy tee in 260 GSM combed cotton with subtle micro-embroidered W4! star emblem on the chest and high-density Kanji print on the rear collar."
  }
];

// Load persisted custom catalog from localStorage if available
let products = JSON.parse(JSON.stringify(defaultProducts));

try {
  const savedCatalog = localStorage.getItem('weebfour_custom_catalog');
  if (savedCatalog) {
    products = JSON.parse(savedCatalog);
  }
} catch (e) {
  console.warn("Could not parse saved catalog from localStorage", e);
}

// Default Website Content, Offers & Words configuration
const defaultSiteConfig = {
  announcements: [
    "FREE SHIPPING ON ALL ORDERS ACROSS INDIA",
    "USE CODE 'WEEB10' FOR 10% OFF YOUR FIRST ORDER",
    "CASH ON DELIVERY (COD) AVAILABLE NATIONWIDE",
    "NEW STREETWEAR GRAILS DROP EVERY WEEK",
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
    heroTitle: "BORN IN THE STREETS // WEAR THE REVOLUTION",
    heroSubtitle: "Engineered in Tokyo & Mumbai. Ultra-heavyweight French Terry tees, technical waterproof nylon cargoes, and structural outerwear designed for the subculture.",
    heroCtaPrimary: "EXPLORE COLLECTION",
    heroCtaSecondary: "SHOP BEST SELLERS",
    collectionsTitle: "SHOP BY COLLECTION",
    collectionsSubtitle: "Curated divisions. From 280 GSM heavyweight oversized tees to engineered tactical cargoes.",
    catalogTitle: "THE DROPS",
    catalogSubtitle: "LATEST ARRIVALS, RESTOCKS & LIMITED EDITION GRAILS",
    newsletterTitle: "JOIN THE WEEBFOUR SQUAD",
    newsletterSubtitle: "Subscribe to receive early access to seasonal drops, secret discount codes, and exclusive invitations to member releases.",
    footerAbout: "Avant-garde streetwear engineered for the subculture. Heavyweight fabrics, structural boxy cuts, and uncompromising attitude.",
    storeAddress: "9/23, 5th Street, Cyber Fashion Hub\nSector 4, Bandra West, Mumbai - 400050",
    storeEmail: "support@weebfour.com"
  },
  media: {
    heroBg: "assets/hero_editorial_raw.png",
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
  module.exports = { products, siteConfig, defaultProducts, defaultSiteConfig };
} else {
  window.products = products;
  window.siteConfig = siteConfig;
  window.defaultProducts = defaultProducts;
  window.defaultSiteConfig = defaultSiteConfig;
}
