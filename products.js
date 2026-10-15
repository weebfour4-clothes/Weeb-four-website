const products = [
  {
    id: 1,
    name: "CYBERPUNK GLITCH OVERSIZED TEE",
    category: "tees",
    price: 999,
    compareAtPrice: 1999,
    tag: "BEST SELLER",
    sizes: ["S", "M", "L", "XL"],
    has_3d: true,
    model_3d_url: null, // Custom .glb if provided via admin, otherwise high-precision garment mesh
    garment_fit: "boxy_oversized",
    fabric_gsm: 280,
    fabric_roughness: 0.85,
    front_texture_url: "assets/tee_front_clean.jpg",
    back_texture_url: "assets/tee_back.jpg",
    front_art_placement: { scale: 0.64, offsetY: 0.04, offsetX: 0 },
    back_art_placement: { scale: 0.72, offsetY: 0.02, offsetX: 0 },
    default_color_id: "black",
    available_colors: [
      { id: "black", name: "Onyx Black", hex: "#0c0d10", inStock: true, previewImg: "assets/tee_front_clean.jpg" },
      { id: "acid_charcoal", name: "Acid Charcoal", hex: "#24272c", inStock: true, previewImg: "assets/tee_front_clean.jpg" },
      { id: "cyber_green", name: "Cyber Pine", hex: "#15241c", inStock: true, previewImg: "assets/tee_front_clean.jpg" }
    ],
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
    has_3d: true,
    model_3d_url: null,
    garment_fit: "acid_distressed_tee",
    fabric_gsm: 260,
    fabric_roughness: 0.88,
    front_texture_url: "assets/art_apes_skull.jpg",
    back_texture_url: "assets/weebfour_primary_logo_trans.png",
    front_art_placement: { scale: 0.65, offsetY: 0.04, offsetX: 0 },
    back_art_placement: { scale: 0.60, offsetY: -0.05, offsetX: 0 },
    default_color_id: "mineral_grey",
    available_colors: [
      { id: "mineral_grey", name: "Mineral Acid Grey", hex: "#292b30", inStock: true, previewImg: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&auto=format&fit=crop&q=80" },
      { id: "bleach_white", name: "Washed Chalk White", hex: "#e0e1e6", inStock: true, previewImg: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80" },
      { id: "vintage_rust", name: "Vintage Rust", hex: "#3e2520", inStock: true, previewImg: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&auto=format&fit=crop&q=80" }
    ],
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
    has_3d: false,
    model_3d_url: null,
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
    has_3d: false,
    model_3d_url: null,
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
    has_3d: false,
    model_3d_url: null,
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
    has_3d: false,
    model_3d_url: null,
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
    has_3d: false,
    model_3d_url: null,
    images: [
      "https://images.unsplash.com/photo-1576871337622-98d48d4353d3?w=800&auto=format&fit=crop&q=80"
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
    has_3d: false,
    model_3d_url: null,
    images: [
      "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80"
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
    has_3d: false,
    model_3d_url: null,
    images: [
      "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=800&auto=format&fit=crop&q=80"
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
    has_3d: true,
    model_3d_url: null,
    garment_fit: "minimal_heavyweight",
    fabric_gsm: 260,
    fabric_roughness: 0.80,
    front_texture_url: "assets/weebfour_secondary_symbol_trans.png",
    back_texture_url: "assets/art_tokyo_kanji.jpg",
    front_art_placement: { scale: 0.28, offsetY: 0.16, offsetX: -0.14 },
    back_art_placement: { scale: 0.70, offsetY: 0.04, offsetX: 0 },
    default_color_id: "ecru",
    available_colors: [
      { id: "ecru", name: "Ecru Raw Cotton", hex: "#ebe6db", inStock: true, previewImg: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80" },
      { id: "forest_sage", name: "Forest Sage", hex: "#223126", inStock: true, previewImg: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80" },
      { id: "midnight_black", name: "Midnight Black", hex: "#111215", inStock: true, previewImg: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80" }
    ],
    images: [
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80"
    ],
    description: "Clean minimalist heavyweight boxy tee in 260 GSM combed cotton with subtle micro-embroidered W4! star emblem on the chest and high-density Kanji print on the rear collar."
  }
];

// Allow localStorage persistence for Admin overrides if modified in Admin Studio
try {
  const customCatalog = localStorage.getItem('weebfour_custom_catalog');
  if (customCatalog) {
    const parsed = JSON.parse(customCatalog);
    parsed.forEach(customItem => {
      const idx = products.findIndex(p => p.id === customItem.id);
      if (idx !== -1) {
        products[idx] = { ...products[idx], ...customItem };
      }
    });
  }
} catch (e) {
  console.warn("Could not load local storage overrides for catalog", e);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = products;
} else {
  window.products = products;
}
