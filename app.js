// ==========================================================================
// WEEBFOUR STOREFRONT CONTROLLER - INSPIRED BY THELASTAPE.IN
// Responsive 4-Col Desktop / 2-Col Mobile, Hover Image Swap, Cart Drawer & Admin Suite
// ==========================================================================

// 1. Application State & Taxonomy Definitions
const DEPARTMENTS = {
  topwear: ['shirts', 'tshirts', 'sweatshirts', 'hoodies', 'bodysuits', 'jackets'],
  bottomwear: ['trousers', 'denims', 'cargos', 'joggers', 'shorts'],
  accessories: ['shades', 'socks', 'bags', 'cap', 'perfume']
};

let cart = [];
let wishlist = new Set();
let activeCategory = 'all';
let activeTag = '';
let searchQuery = '';
let currentSort = 'default';
let selectedQuickViewProduct = null;
let selectedSize = '';
let activePromoDiscount = 0.0; // percentage as decimal (0.10 for 10%)
let appliedPromoCode = '';
let orderInstructions = '';
let isAdminAuthenticated = false;

// Load persisted cart, wishlist, and config from localStorage
try {
  const savedCart = localStorage.getItem('weebfour_cart');
  if (savedCart) cart = JSON.parse(savedCart);

  const savedWishlist = localStorage.getItem('weebfour_wishlist');
  if (savedWishlist) wishlist = new Set(JSON.parse(savedWishlist));

  const savedNotes = localStorage.getItem('weebfour_order_notes');
  if (savedNotes) orderInstructions = savedNotes;
} catch (e) {
  console.warn("Could not parse saved storage data", e);
}

// Temporary storage for editing product images in Admin
let currentEditingImages = [];

// ==========================================================================
// 2. INITIALIZATION ON DOM READY
// ==========================================================================
window.addEventListener('DOMContentLoaded', () => {
  initTheme();
  applySiteConfigToStorefront();
  renderProducts();
  updateCategoryCardBackgrounds();
  updateCartUI();
  updateWishlistUI();
  setupEventListeners();

  // Restore saved order notes
  const noteEl = document.getElementById('cart-order-notes');
  if (noteEl && orderInstructions) {
    noteEl.value = orderInstructions;
  }
});

// Setup Global Event Listeners
function setupEventListeners() {
  // Sticky header shadow on scroll
  const header = document.getElementById('main-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('header-scrolled');
    } else {
      header.classList.remove('header-scrolled');
    }
  });

  // Search Toggle
  const searchBtn = document.getElementById('search-toggle-btn');
  const searchModal = document.getElementById('search-bar-modal');
  const searchClose = document.getElementById('search-close-btn');
  const searchInput = document.getElementById('catalog-search-input');

  if (searchBtn && searchModal) {
    searchBtn.addEventListener('click', () => {
      searchModal.classList.toggle('open');
      if (searchModal.classList.contains('open')) {
        searchInput.focus();
      }
    });
  }

  if (searchClose && searchModal) {
    searchClose.addEventListener('click', () => {
      searchModal.classList.remove('open');
      searchInput.value = '';
      searchQuery = '';
      renderProducts();
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      renderProducts();
    });
  }

  // Mobile Drawer Toggle
  const mobileOpenBtn = document.getElementById('mobile-drawer-open-btn');
  const mobileCloseBtn = document.getElementById('mobile-drawer-close-btn');
  const mobileOverlay = document.getElementById('mobile-drawer-overlay');

  if (mobileOpenBtn) mobileOpenBtn.addEventListener('click', openMobileDrawer);
  if (mobileCloseBtn) mobileCloseBtn.addEventListener('click', closeMobileDrawer);
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeMobileDrawer);

  // Cart Toggle
  const cartBtn = document.getElementById('cart-toggle-btn');
  if (cartBtn) cartBtn.addEventListener('click', openCartDrawer);

  // Order notes save on input
  const noteEl = document.getElementById('cart-order-notes');
  if (noteEl) {
    noteEl.addEventListener('input', (e) => {
      orderInstructions = e.target.value;
      localStorage.setItem('weebfour_order_notes', orderInstructions);
    });
  }

  // Admin shortcut Ctrl+Alt+A or Cmd+Alt+A
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.altKey && (e.key === 'a' || e.key === 'A')) {
      e.preventDefault();
      openAdminModal();
    }
  });

  // Close modals on ESC key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCartDrawer();
      closeMobileDrawer();
      closeQuickView();
      closeCheckoutModal();
      closeWishlistModal();
      closeSizeChartModal();
      closeAdminAuth();
      closeAdminSuite();
      closeProductEditModal();
    }
  });
}

// Dynamic Category Card Photos: Automatically sets background photo from category products
function updateCategoryCardBackgrounds() {
  const allCategories = [
    'shirts', 'tshirts', 'sweatshirts', 'hoodies', 'bodysuits', 'jackets',
    'trousers', 'denims', 'cargos', 'joggers', 'shorts',
    'shades', 'socks', 'bags', 'cap', 'perfume'
  ];

  allCategories.forEach(cat => {
    const cardBgEl = document.getElementById(`cat-card-bg-${cat}`);
    if (!cardBgEl) return;

    // Find the first product in this category that has a valid image
    const prodWithImg = (window.products || []).find(p => 
      p.category === cat && 
      p.images && 
      p.images.length > 0 && 
      p.images[0] && 
      p.images[0].trim() !== ''
    );

    if (prodWithImg) {
      cardBgEl.style.backgroundImage = `url("${prodWithImg.images[0]}")`;
      cardBgEl.style.backgroundSize = 'cover';
      cardBgEl.style.backgroundPosition = 'center';
    } else {
      // Normal state: keep procedural gradient from CSS
      cardBgEl.style.backgroundImage = '';
    }
  });
}

// ==========================================================================
// 3. APPLY SITE CONFIG (CUSTOM COPY, OFFERS, BANNERS)
// ==========================================================================
function applySiteConfigToStorefront() {
  if (!window.siteConfig) return;
  const cfg = window.siteConfig;

  // 1. Marquee Ticker Announcements
  const ticker = document.querySelector('.ticker');
  if (ticker && cfg.announcements && cfg.announcements.length > 0) {
    const items = cfg.announcements.map(msg => `<span class="ticker-item">${msg}</span>`).join('');
    // duplicate for seamless infinite loop
    ticker.innerHTML = items + items;
  }

  // 2. Headlines & Copywriting
  if (cfg.texts) {
    const badge = document.getElementById('hero-badge-pill');
    if (badge && cfg.texts.heroBadge) {
      badge.innerHTML = `<i class="ri-fire-fill" style="color: var(--color-sale-red);"></i> ${cfg.texts.heroBadge}`;
    }

    const heroTitle = document.getElementById('hero-main-title');
    if (heroTitle && cfg.texts.heroTitle) {
      heroTitle.innerHTML = cfg.texts.heroTitle.replace('//', '<br>');
    }

    const heroSub = document.getElementById('hero-subtext');
    if (heroSub && cfg.texts.heroSubtitle) heroSub.textContent = cfg.texts.heroSubtitle;

    const cta1 = document.getElementById('hero-cta-primary');
    if (cta1 && cfg.texts.heroCtaPrimary) {
      cta1.innerHTML = `${cfg.texts.heroCtaPrimary} <i class="ri-arrow-right-line"></i>`;
    }

    const cta2 = document.getElementById('hero-cta-secondary');
    if (cta2 && cfg.texts.heroCtaSecondary) {
      cta2.innerHTML = `${cfg.texts.heroCtaSecondary} <i class="ri-compass-3-line"></i>`;
    }

    const colTitle = document.getElementById('collections-title');
    if (colTitle && cfg.texts.collectionsTitle) colTitle.textContent = cfg.texts.collectionsTitle;

    const colSub = document.getElementById('collections-subtitle');
    if (colSub && cfg.texts.collectionsSubtitle) colSub.textContent = cfg.texts.collectionsSubtitle;

    const catTitle = document.getElementById('catalog-title');
    if (catTitle && cfg.texts.catalogTitle) catTitle.textContent = cfg.texts.catalogTitle;

    const catSub = document.getElementById('catalog-subtitle');
    if (catSub && cfg.texts.catalogSubtitle) catSub.textContent = cfg.texts.catalogSubtitle;

    const newsTitle = document.getElementById('newsletter-title');
    if (newsTitle && cfg.texts.newsletterTitle) newsTitle.textContent = cfg.texts.newsletterTitle;

    const newsSub = document.getElementById('newsletter-subtitle');
    if (newsSub && cfg.texts.newsletterSubtitle) newsSub.textContent = cfg.texts.newsletterSubtitle;

    const footerAbout = document.getElementById('footer-about');
    if (footerAbout && cfg.texts.footerAbout) footerAbout.textContent = cfg.texts.footerAbout;

    const footerAddr = document.getElementById('footer-address');
    if (footerAddr && cfg.texts.storeAddress) footerAddr.innerHTML = cfg.texts.storeAddress.replace(/\n/g, '<br>');

    const footerEmail = document.getElementById('footer-email');
    if (footerEmail && cfg.texts.storeEmail) footerEmail.textContent = cfg.texts.storeEmail;
  }

  // 3. Media & Banners
  if (cfg.media) {
    const heroBg = document.getElementById('hero-slider-bg');
    if (heroBg) {
      if (cfg.media.heroBg && !cfg.media.heroBg.includes('editorial_raw')) {
        heroBg.style.backgroundImage = `url('${cfg.media.heroBg}')`;
      } else {
        heroBg.style.backgroundImage = `url('assets/hero_branding_photo.jpg')`;
      }
    }
    if (cfg.media.primaryLogo) {
      document.querySelectorAll('.brand-logo-img').forEach(img => img.src = cfg.media.primaryLogo);
    }
  }
}

// ==========================================================================
// 4. RENDER PRODUCTS GRID (thelastape.in 4-Col Desktop / 2-Col Mobile Layout)
// ==========================================================================
function renderProducts() {
  const container = document.getElementById('product-grid-container');
  const emptyView = document.getElementById('empty-state-view');
  if (!container) return;

  // Filter products by department or specific collection category
  let filtered = (window.products || []).filter(item => {
    let matchesCat = false;
    if (activeCategory === 'all') {
      matchesCat = true;
    } else if (DEPARTMENTS[activeCategory]) {
      matchesCat = DEPARTMENTS[activeCategory].includes(item.category);
    } else {
      matchesCat = (item.category === activeCategory);
    }

    const matchesTag = !activeTag || item.tag === activeTag;
    const matchesSearch = !searchQuery || 
      (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCat && matchesTag && matchesSearch;
  });

  // Sort products
  if (currentSort === 'price-low') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (currentSort === 'price-high') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (currentSort === 'popular') {
    filtered.sort((a, b) => (a.tag === 'BEST SELLER' ? -1 : 1));
  }

  // Exact 1:1 view matching user's reference screenshot when empty
  if (filtered.length === 0) {
    container.style.display = 'none';
    if (emptyView) emptyView.style.display = 'flex';
  } else {
    container.style.display = 'grid';
    if (emptyView) emptyView.style.display = 'none';

    container.innerHTML = filtered.map(item => {
      const discount = item.compareAtPrice && item.compareAtPrice > item.price
        ? Math.round(((item.compareAtPrice - item.price) / item.compareAtPrice) * 100)
        : 0;
      const isWishlisted = wishlist.has(item.id);
      
      const hasImages = item.images && item.images.length > 0 && item.images[0];
      const mainImg = hasImages ? item.images[0] : '';
      const hoverImg = (item.images && item.images.length > 1) ? item.images[1] : mainImg;

      const sizePills = item.sizes ? item.sizes.map(s => `<span class="mini-size-pill">${s}</span>`).join('') : '';

      return `
        <div class="product-card" data-id="${item.id}">
          <!-- Media Box with Hover Swap or Placeholder -->
          <div class="card-media-box" onclick="openQuickView(${item.id})">
            <!-- Badges Left -->
            <div class="card-badges-left">
              ${discount > 0 ? `<span class="sale-pill-badge">-${discount}% OFF</span>` : ''}
              ${item.tag ? `<span class="bestseller-badge">${item.tag}</span>` : ''}
            </div>

            <!-- Action Icons Right -->
            <div class="card-actions-right" onclick="event.stopPropagation();">
              <button class="card-icon-btn ${isWishlisted ? 'wishlisted' : ''}" 
                      onclick="toggleWishlist(${item.id})" 
                      title="Add to Wishlist" 
                      aria-label="Wishlist">
                <i class="${isWishlisted ? 'ri-heart-fill' : 'ri-heart-line'}"></i>
              </button>
              <button class="card-icon-btn" 
                      onclick="openQuickView(${item.id})" 
                      title="Quick View" 
                      aria-label="Quick View">
                <i class="ri-eye-line"></i>
              </button>
              <button class="card-icon-btn" 
                      onclick="quickAddToCart(${item.id})" 
                      title="Quick Add to Bag" 
                      aria-label="Add to Bag">
                <i class="ri-shopping-bag-line"></i>
              </button>
            </div>

            <!-- Primary and Hover Swap Images, or Styled Placeholder -->
            ${hasImages ? `
              <img src="${mainImg}" alt="${item.name}" class="card-img-main" loading="lazy">
              <img src="${hoverImg}" alt="${item.name} alternate angle" class="card-img-hover" loading="lazy">
            ` : `
              <div class="card-img-placeholder">
                <i class="ri-t-shirt-2-line"></i>
                <span>${item.name}</span>
                <small style="font-size:0.75rem; color:var(--color-text-dim); margin-top:4px;">ARCHIVE IMAGE PENDING</small>
              </div>
            `}
          </div>

          <!-- Product Details -->
          <div class="card-info-wrap">
            <span class="card-brand-tag">WEEBFOUR</span>
            <h3 class="card-product-title" onclick="openQuickView(${item.id})">${item.name}</h3>
            
            <div class="card-sizes-row">
              ${sizePills}
            </div>

            <div class="card-price-row">
              <span class="card-sale-price">₹${item.price.toLocaleString('en-IN')}</span>
              ${item.compareAtPrice ? `<span class="card-compare-price">₹${item.compareAtPrice.toLocaleString('en-IN')}</span>` : ''}
              ${item.compareAtPrice && item.compareAtPrice > item.price ? `<span class="card-save-amount">Save ₹${(item.compareAtPrice - item.price).toLocaleString('en-IN')}</span>` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  updateActiveFilterBadges();
}

// Active Filter Chips & Clear
function updateActiveFilterBadges() {
  const container = document.getElementById('active-filters-container');
  if (!container) return;

  if (activeCategory === 'all' && !activeTag && !searchQuery) {
    container.style.display = 'none';
    return;
  }

  container.style.display = 'flex';
  let chips = '';

  if (activeCategory !== 'all') {
    chips += `
      <div class="filter-chip">
        CATEGORY: ${activeCategory.toUpperCase()}
        <button onclick="filterByCategory('all')">&times;</button>
      </div>
    `;
  }

  if (activeTag) {
    chips += `
      <div class="filter-chip">
        TAG: ${activeTag.toUpperCase()}
        <button onclick="filterByTag('')">&times;</button>
      </div>
    `;
  }

  if (searchQuery) {
    chips += `
      <div class="filter-chip">
        SEARCH: "${searchQuery}"
        <button onclick="clearSearch()">&times;</button>
      </div>
    `;
  }

  chips += `<button class="btn btn-sm btn-secondary" style="padding: 2px 8px; font-size: 0.8rem;" onclick="resetAllFilters()">CLEAR ALL</button>`;

  container.innerHTML = chips;
}

// Filter Actions with Tab and Pill Synchronization
function setFeedFilter(category) {
  activeCategory = category;
  activeTag = '';
  syncFilterButtons();
  renderProducts();
}

function filterByCategory(category) {
  activeCategory = category;
  activeTag = '';
  syncFilterButtons();
  renderProducts();
  const shopEl = document.getElementById('shop');
  if (shopEl) shopEl.scrollIntoView({ behavior: 'smooth' });
}

function filterByTag(tag) {
  activeTag = tag;
  activeCategory = 'all';
  syncFilterButtons();
  renderProducts();
  const shopEl = document.getElementById('shop');
  if (shopEl) shopEl.scrollIntoView({ behavior: 'smooth' });
}

function syncFilterButtons() {
  document.querySelectorAll('.feed-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === activeCategory);
  });
  document.querySelectorAll('.subpill-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.cat === activeCategory);
  });
}

function switchCollectionDept(dept, btn) {
  document.querySelectorAll('.dept-tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  
  const cards = document.querySelectorAll('#collections-grid .category-card');
  cards.forEach(card => {
    if (dept === 'all' || card.dataset.dept === dept) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

function handleSortChange(sortVal) {
  currentSort = sortVal;
  renderProducts();
}

function clearSearch() {
  searchQuery = '';
  const input = document.getElementById('catalog-search-input');
  if (input) input.value = '';
  renderProducts();
}

function resetAllFilters() {
  activeCategory = 'all';
  activeTag = '';
  searchQuery = '';
  currentSort = 'default';
  const input = document.getElementById('catalog-search-input');
  if (input) input.value = '';
  const sort = document.getElementById('feed-sort-selector');
  if (sort) sort.value = 'default';
  syncFilterButtons();
  renderProducts();
}

// Visual Theme Management (Dark Cyberpunk / Concrete Industrial)
function initTheme() {
  const savedTheme = localStorage.getItem('weebfour_theme') || 'dark';
  applyTheme(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  applyTheme(newTheme);
  try {
    localStorage.setItem('weebfour_theme', newTheme);
  } catch (e) {}
}

function applyTheme(theme) {
  const icon = document.getElementById('theme-toggle-icon');
  const drawerIcon = document.getElementById('drawer-theme-icon');
  const drawerText = document.getElementById('drawer-theme-text');

  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    if (icon) icon.className = 'ri-sun-fill';
    if (drawerIcon) drawerIcon.className = 'ri-sun-line';
    if (drawerText) drawerText.textContent = 'LIGHT CONCRETE';
  } else {
    document.documentElement.removeAttribute('data-theme');
    if (icon) icon.className = 'ri-moon-fill';
    if (drawerIcon) drawerIcon.className = 'ri-moon-line';
    if (drawerText) drawerText.textContent = 'DARK CYBER';
  }
}

// ==========================================================================
// 5. WISHLIST MANAGEMENT
// ==========================================================================
function toggleWishlist(productId) {
  if (wishlist.has(productId)) {
    wishlist.delete(productId);
  } else {
    wishlist.add(productId);
  }
  localStorage.setItem('weebfour_wishlist', JSON.stringify([...wishlist]));
  updateWishlistUI();
  renderProducts();
}

function updateWishlistUI() {
  const count = wishlist.size;
  const badge = document.getElementById('wishlist-count-badge');
  const mobBadge = document.getElementById('mobile-wishlist-count');
  const totBadge = document.getElementById('wishlist-total-count');

  if (badge) badge.textContent = count;
  if (mobBadge) mobBadge.textContent = count;
  if (totBadge) totBadge.textContent = count;
}

function openWishlistModal() {
  const overlay = document.getElementById('wishlist-modal-overlay');
  const grid = document.getElementById('wishlist-items-grid');
  const emptyMsg = document.getElementById('wishlist-empty-msg');
  if (!overlay || !grid) return;

  const items = window.products.filter(p => wishlist.has(p.id));
  if (items.length === 0) {
    grid.style.display = 'none';
    if (emptyMsg) emptyMsg.style.display = 'block';
  } else {
    grid.style.display = 'grid';
    if (emptyMsg) emptyMsg.style.display = 'none';

    grid.innerHTML = items.map(p => `
      <div class="product-card">
        <div class="card-media-box" onclick="closeWishlistModal(); openQuickView(${p.id})">
          <img src="${p.images[0]}" alt="${p.name}">
        </div>
        <div class="card-info-wrap">
          <h4 class="card-product-title" onclick="closeWishlistModal(); openQuickView(${p.id})">${p.name}</h4>
          <div class="card-price-row">
            <span class="card-sale-price">₹${p.price.toLocaleString('en-IN')}</span>
          </div>
          <button class="btn btn-primary btn-sm" style="margin-top: 10px; width: 100%;" onclick="quickAddToCart(${p.id})">
            MOVE TO BAG
          </button>
        </div>
      </div>
    `).join('');
  }

  overlay.classList.add('active');
}

function closeWishlistModal() {
  const overlay = document.getElementById('wishlist-modal-overlay');
  if (overlay) overlay.classList.remove('active');
}

// ==========================================================================
// 6. CART MANAGEMENT & SLIDE-OUT DRAWER
// ==========================================================================
function openCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const backdrop = document.getElementById('cart-drawer-backdrop');
  if (drawer && backdrop) {
    drawer.classList.add('active');
    backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const backdrop = document.getElementById('cart-drawer-backdrop');
  if (drawer && backdrop) {
    drawer.classList.remove('active');
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function quickAddToCart(productId) {
  const product = window.products.find(p => p.id === productId);
  if (!product) return;

  const defaultSize = (product.sizes && product.sizes.length > 0) ? product.sizes[0] : 'ONESIZE';
  addToCart(product, defaultSize, 1);
  openCartDrawer();
}

function addToCart(product, size, qty = 1) {
  const existing = cart.find(item => item.id === product.id && item.size === size);
  if (existing) {
    existing.quantity += qty;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      image: product.images[0],
      size: size,
      quantity: qty
    });
  }

  localStorage.setItem('weebfour_cart', JSON.stringify(cart));
  updateCartUI();
}

function adjustCartQty(index, delta) {
  if (cart[index]) {
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
      cart.splice(index, 1);
    }
  }
  localStorage.setItem('weebfour_cart', JSON.stringify(cart));
  updateCartUI();
}

function removeCartItem(index) {
  cart.splice(index, 1);
  localStorage.setItem('weebfour_cart', JSON.stringify(cart));
  updateCartUI();
}

function updateCartUI() {
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Update Header Badges
  const cartBadge = document.getElementById('cart-count-badge');
  const mobBadge = document.getElementById('mobile-cart-count');
  const drawerCount = document.getElementById('cart-drawer-count');

  if (cartBadge) cartBadge.textContent = totalCount;
  if (mobBadge) mobBadge.textContent = totalCount;
  if (drawerCount) drawerCount.textContent = totalCount;

  // Subtotal in drawer
  const subtotalEl = document.getElementById('cart-drawer-subtotal');
  if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;

  // Shipping Meter Calculation
  const threshold = (window.siteConfig && window.siteConfig.offers && window.siteConfig.offers.shippingThreshold) ? window.siteConfig.offers.shippingThreshold : 1499;
  const progressFill = document.getElementById('shipping-progress-fill');
  const progressText = document.getElementById('shipping-progress-text');

  if (progressFill && progressText) {
    if (subtotal === 0) {
      progressFill.style.width = '0%';
      progressText.textContent = `Add items worth ₹${threshold} for FREE Pan-India Shipping!`;
    } else if (subtotal >= threshold) {
      progressFill.style.width = '100%';
      progressText.innerHTML = `<i class="ri-checkbox-circle-fill" style="color: #2e7d32;"></i> YOU UNLOCKED FREE EXPRESS SHIPPING!`;
    } else {
      const remaining = threshold - subtotal;
      const pct = Math.min(100, Math.round((subtotal / threshold) * 100));
      progressFill.style.width = `${pct}%`;
      progressText.textContent = `Add ₹${remaining.toLocaleString('en-IN')} more to unlock FREE Pan-India Shipping!`;
    }
  }

  // Render Items List
  const container = document.getElementById('cart-items-scroll');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty-view">
        <i class="ri-shopping-bag-line"></i>
        <h3>YOUR BAG IS EMPTY</h3>
        <p>Explore our latest streetwear drops and find your next grail.</p>
        <button class="btn btn-primary" onclick="closeCartDrawer()">START SHOPPING</button>
      </div>
    `;
  } else {
    container.innerHTML = cart.map((item, idx) => `
      <div class="cart-item-row">
        <img src="${item.image}" alt="${item.name}" class="cart-item-thumb">
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <div class="cart-item-size">SIZE: <strong>${item.size}</strong></div>
          <div class="cart-qty-stepper">
            <button class="qty-step-btn" onclick="adjustCartQty(${idx}, -1)">-</button>
            <span class="qty-step-num">${item.quantity}</span>
            <button class="qty-step-btn" onclick="adjustCartQty(${idx}, 1)">+</button>
          </div>
        </div>
        <div class="cart-item-right">
          <span class="cart-item-price">₹${(item.price * item.quantity).toLocaleString('en-IN')}</span>
          <button class="cart-item-delete" onclick="removeCartItem(${idx})" title="Remove item" aria-label="Remove item">
            <i class="ri-delete-bin-line"></i>
          </button>
        </div>
      </div>
    `).join('');
  }
}

// ==========================================================================
// 7. QUICK VIEW MODAL
// ==========================================================================
function openQuickView(productId) {
  const product = window.products.find(p => p.id === productId);
  if (!product) return;

  selectedQuickViewProduct = product;
  selectedSize = (product.sizes && product.sizes.length > 0) ? product.sizes[0] : 'ONESIZE';

  const overlay = document.getElementById('quick-view-overlay');
  const mainImg = document.getElementById('qv-main-image');
  const thumbsRow = document.getElementById('qv-thumbs-row');
  const title = document.getElementById('qv-title');
  const salePrice = document.getElementById('qv-sale-price');
  const compPrice = document.getElementById('qv-compare-price');
  const discountPill = document.getElementById('qv-discount-pill');
  const badge = document.getElementById('qv-badge');
  const desc = document.getElementById('qv-description');
  const sizeSelector = document.getElementById('qv-size-selector');
  const qtyInput = document.getElementById('qv-qty-input');

  if (title) title.textContent = product.name;
  if (salePrice) salePrice.textContent = `₹${product.price.toLocaleString('en-IN')}`;
  if (compPrice) compPrice.textContent = `₹${product.compareAtPrice.toLocaleString('en-IN')}`;
  
  const discount = Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100);
  if (discountPill) discountPill.textContent = `${discount}% OFF`;

  if (badge) {
    if (product.tag) {
      badge.textContent = product.tag;
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
  }

  if (desc) desc.textContent = product.description;
  if (qtyInput) qtyInput.value = '1';

  // Gallery
  if (mainImg) mainImg.src = product.images[0];
  if (thumbsRow) {
    thumbsRow.innerHTML = product.images.map((img, i) => `
      <img src="${img}" class="qv-thumb-item ${i === 0 ? 'active' : ''}" 
           onclick="selectQuickViewImage('${img}', this)">
    `).join('');
  }

  // Size Selector
  if (sizeSelector && product.sizes) {
    sizeSelector.innerHTML = product.sizes.map((s, idx) => `
      <button class="size-btn-pill ${idx === 0 ? 'selected' : ''}" 
              onclick="selectQuickViewSize('${s}', this)">
        ${s}
      </button>
    `).join('');
  }

  if (overlay) overlay.classList.add('active');
}

function selectQuickViewImage(imgUrl, el) {
  const mainImg = document.getElementById('qv-main-image');
  if (mainImg) mainImg.src = imgUrl;
  document.querySelectorAll('.qv-thumb-item').forEach(t => t.classList.remove('active'));
  if (el) el.classList.add('active');
}

function selectQuickViewSize(size, el) {
  selectedSize = size;
  document.querySelectorAll('.size-btn-pill').forEach(btn => btn.classList.remove('selected'));
  if (el) el.classList.add('selected');
  const alert = document.getElementById('qv-size-alert');
  if (alert) alert.style.display = 'none';
}

function adjustQuickViewQty(delta) {
  const qtyInput = document.getElementById('qv-qty-input');
  if (!qtyInput) return;
  let val = parseInt(qtyInput.value) + delta;
  if (val < 1) val = 1;
  qtyInput.value = val;
}

function addQuickViewToCart() {
  if (!selectedQuickViewProduct) return;
  if (!selectedSize) {
    const alert = document.getElementById('qv-size-alert');
    if (alert) alert.style.display = 'block';
    return;
  }

  const qtyInput = document.getElementById('qv-qty-input');
  const qty = qtyInput ? parseInt(qtyInput.value) : 1;

  addToCart(selectedQuickViewProduct, selectedSize, qty);
  closeQuickView();
  openCartDrawer();
}

function closeQuickView() {
  const overlay = document.getElementById('quick-view-overlay');
  if (overlay) overlay.classList.remove('active');
  selectedQuickViewProduct = null;
}

// ==========================================================================
// 8. SIZE CHART MODAL
// ==========================================================================
function openSizeChartModal() {
  const overlay = document.getElementById('size-chart-overlay');
  if (overlay) overlay.classList.add('active');
}
function closeSizeChartModal() {
  const overlay = document.getElementById('size-chart-overlay');
  if (overlay) overlay.classList.remove('active');
}

// ==========================================================================
// 9. MULTI-STEP CHECKOUT MODAL
// ==========================================================================
function openCheckoutModal() {
  if (cart.length === 0) {
    alert("Your shopping bag is empty! Add products first.");
    return;
  }
  closeCartDrawer();
  const overlay = document.getElementById('checkout-modal-overlay');
  if (overlay) {
    overlay.classList.add('active');
    goToCheckoutStep(1);
    renderCheckoutSummary();
  }
}

function closeCheckoutModal() {
  const overlay = document.getElementById('checkout-modal-overlay');
  if (overlay) overlay.classList.remove('active');
}

function goToCheckoutStep(step) {
  const p1 = document.getElementById('checkout-step1-panel');
  const p2 = document.getElementById('checkout-step2-panel');
  const p3 = document.getElementById('checkout-step3-panel');
  const t1 = document.getElementById('checkout-tab-step1');
  const t2 = document.getElementById('checkout-tab-step2');
  const t3 = document.getElementById('checkout-tab-step3');

  if (p1) p1.style.display = step === 1 ? 'block' : 'none';
  if (p2) p2.style.display = step === 2 ? 'block' : 'none';
  if (p3) p3.style.display = step === 3 ? 'block' : 'none';

  if (t1) t1.classList.toggle('active', step >= 1);
  if (t2) t2.classList.toggle('active', step >= 2);
  if (t3) t3.classList.toggle('active', step >= 3);
}

function handleShippingFormSubmit(e) {
  e.preventDefault();
  goToCheckoutStep(2);
}

function selectPaymentMethod(tile, method) {
  document.querySelectorAll('.payment-method-tile').forEach(t => t.classList.remove('selected'));
  if (tile) {
    tile.classList.add('selected');
    const radio = tile.querySelector('input[type="radio"]');
    if (radio) radio.checked = true;
  }
}

function renderCheckoutSummary() {
  const itemsContainer = document.getElementById('checkout-summary-items');
  const subtotalEl = document.getElementById('co-subtotal-val');
  const totalEl = document.getElementById('co-total-val');
  const payBtnTotal = document.getElementById('pay-button-total');
  const discRow = document.getElementById('co-discount-row');
  const discVal = document.getElementById('co-discount-val');

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = Math.round(subtotal * activePromoDiscount);
  const total = Math.max(0, subtotal - discountAmount);

  if (itemsContainer) {
    itemsContainer.innerHTML = cart.map(item => `
      <div style="display: flex; gap: 10px; margin-bottom: 12px; align-items: center;">
        <img src="${item.image}" style="width: 44px; height: 55px; object-fit: cover;">
        <div style="flex: 1; font-size: 0.85rem;">
          <div style="font-weight: 600;">${item.name}</div>
          <div style="color: #666;">Size: ${item.size} x ${item.quantity}</div>
        </div>
        <div style="font-weight: 700; font-size: 0.9rem;">
          ₹${(item.price * item.quantity).toLocaleString('en-IN')}
        </div>
      </div>
    `).join('');
  }

  if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
  if (totalEl) totalEl.textContent = `₹${total.toLocaleString('en-IN')}`;
  if (payBtnTotal) payBtnTotal.textContent = `₹${total.toLocaleString('en-IN')}`;

  if (discRow && discVal) {
    if (discountAmount > 0) {
      discRow.style.display = 'flex';
      discVal.textContent = `-₹${discountAmount.toLocaleString('en-IN')} (${appliedPromoCode})`;
    } else {
      discRow.style.display = 'none';
    }
  }
}

function applyPromoCode() {
  const input = document.getElementById('checkout-promo-input');
  const msg = document.getElementById('promo-status-msg');
  if (!input || !msg) return;

  const code = input.value.trim().toUpperCase();
  const promos = (window.siteConfig && window.siteConfig.offers && window.siteConfig.offers.promos) ? window.siteConfig.offers.promos : [];

  const found = promos.find(p => p.code.toUpperCase() === code);
  if (found) {
    activePromoDiscount = found.discountPercent / 100;
    appliedPromoCode = found.code;
    msg.style.display = 'block';
    msg.style.color = '#2e7d32';
    msg.textContent = `Promo "${found.code}" applied: ${found.discountPercent}% OFF!`;
  } else {
    activePromoDiscount = 0;
    appliedPromoCode = '';
    msg.style.display = 'block';
    msg.style.color = 'var(--color-sale-red)';
    msg.textContent = 'Invalid promo code. Try WEEB10.';
  }

  renderCheckoutSummary();
}

function completeOrderPayment() {
  // Generate random Order ID
  const orderNumber = `WEEB-${Math.floor(10000 + Math.random() * 90000)}`;
  const orderNumEl = document.getElementById('confirmed-order-number');
  if (orderNumEl) orderNumEl.textContent = orderNumber;

  goToCheckoutStep(3);
}

function clearCartAfterPurchase() {
  cart = [];
  localStorage.removeItem('weebfour_cart');
  updateCartUI();
}

// ==========================================================================
// 10. MOBILE MENU DRAWER
// ==========================================================================
function openMobileDrawer() {
  const drawer = document.getElementById('mobile-menu-drawer');
  const overlay = document.getElementById('mobile-drawer-overlay');
  if (drawer && overlay) {
    drawer.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeMobileDrawer() {
  const drawer = document.getElementById('mobile-menu-drawer');
  const overlay = document.getElementById('mobile-drawer-overlay');
  if (drawer && overlay) {
    drawer.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function toggleDrawerSubmenu(el) {
  const submenu = el.nextElementSibling;
  const icon = el.querySelector('i');
  if (submenu) {
    const isClosed = submenu.style.display === 'none';
    submenu.style.display = isClosed ? 'block' : 'none';
    if (icon) {
      icon.className = isClosed ? 'ri-subtract-line' : 'ri-add-line';
    }
  }
}

// ==========================================================================
// 11. VIP PHONE NUMBER SUBMISSION (SMS & WHATSAPP DROPS)
// ==========================================================================
function handleNewsletterSubmit(e) {
  e.preventDefault();
  let phoneVal = '';
  const p1 = document.getElementById('newsletter-phone');
  const p2 = document.getElementById('footer-newsletter-phone');

  if (p1 && p1.value.trim()) {
    phoneVal = p1.value.trim();
  } else if (p2 && p2.value.trim()) {
    phoneVal = p2.value.trim();
  }

  if (phoneVal) {
    try {
      const stored = JSON.parse(localStorage.getItem('weebfour_phone_subscribers') || '[]');
      if (!stored.includes(phoneVal)) {
        stored.push(phoneVal);
        localStorage.setItem('weebfour_phone_subscribers', JSON.stringify(stored));
      }
    } catch (err) {
      console.warn("Could not save phone subscriber", err);
    }
  }

  const success = document.getElementById('newsletter-success-msg');
  if (success) {
    success.style.display = 'block';
    setTimeout(() => { success.style.display = 'none'; }, 6000);
  }

  if (p1) p1.value = '';
  if (p2) p2.value = '';
}

// ==========================================================================
// 12. MASTER ADMIN SUITE CONTROLLER
// Complete management of Photos, Offers, Names, and Copywriting
// ==========================================================================
function openAdminModal() {
  if (isAdminAuthenticated) {
    openAdminSuite();
  } else {
    const authOverlay = document.getElementById('admin-auth-overlay');
    if (authOverlay) authOverlay.classList.add('active');
  }
}

function closeAdminAuth() {
  const authOverlay = document.getElementById('admin-auth-overlay');
  if (authOverlay) authOverlay.classList.remove('active');
}

function handleAdminLogin(e) {
  e.preventDefault();
  const passcode = document.getElementById('admin-passcode-input').value.trim();
  const errorEl = document.getElementById('admin-auth-error');

  // Default passcode: weebfour
  if (passcode.toLowerCase() === 'weebfour' || passcode === 'admin123') {
    isAdminAuthenticated = true;
    closeAdminAuth();
    openAdminSuite();
    if (errorEl) errorEl.style.display = 'none';
  } else {
    if (errorEl) errorEl.style.display = 'block';
  }
}

function openAdminSuite() {
  const suiteOverlay = document.getElementById('admin-suite-overlay');
  if (!suiteOverlay) return;

  suiteOverlay.classList.add('active');
  populateAdminFields();
  renderAdminProductsList();
  renderAdminOffersList();
}

function closeAdminSuite() {
  const suiteOverlay = document.getElementById('admin-suite-overlay');
  if (suiteOverlay) suiteOverlay.classList.remove('active');
}

function switchAdminTab(tabName) {
  document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });
  document.querySelectorAll('.admin-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === `admin-panel-${tabName}`);
  });
}

// Populate form inputs with current values
function populateAdminFields() {
  const cfg = window.siteConfig;
  if (!cfg) return;

  // Words & Copywriting
  if (cfg.texts) {
    const t = cfg.texts;
    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
    setVal('admin-text-hero-badge', t.heroBadge);
    setVal('admin-text-hero-title', t.heroTitle);
    setVal('admin-text-hero-desc', t.heroSubtitle);
    setVal('admin-text-hero-cta1', t.heroCtaPrimary);
    setVal('admin-text-hero-cta2', t.heroCtaSecondary);
    setVal('admin-text-collections-title', t.collectionsTitle);
    setVal('admin-text-catalog-title', t.catalogTitle);
    setVal('admin-text-news-title', t.newsletterTitle);
    setVal('admin-text-address', t.storeAddress);
    setVal('admin-text-email', t.storeEmail);
  }

  // Shipping
  if (cfg.offers) {
    const thresh = document.getElementById('admin-shipping-threshold');
    const flat = document.getElementById('admin-flat-shipping');
    if (thresh) thresh.value = cfg.offers.shippingThreshold || 1499;
    if (flat) flat.value = cfg.offers.flatShippingFee || 150;
  }

  // Banners & Photos
  if (cfg.media) {
    const heroBgUrl = document.getElementById('admin-hero-bg-url');
    const heroBgPrev = document.getElementById('admin-hero-bg-preview');
    if (heroBgUrl) heroBgUrl.value = cfg.media.heroBg || '';
    if (heroBgPrev) heroBgPrev.src = cfg.media.heroBg || '';

    const logoUrl = document.getElementById('admin-logo-url');
    const logoPrev = document.getElementById('admin-logo-preview');
    if (logoUrl) logoUrl.value = cfg.media.primaryLogo || '';
    if (logoPrev) logoPrev.src = cfg.media.primaryLogo || '';
  }
}

// Admin Tab 1: Render Products Table
function renderAdminProductsList() {
  const tbody = document.getElementById('admin-products-table-body');
  const searchInput = document.getElementById('admin-prod-search');
  if (!tbody) return;

  const q = searchInput ? searchInput.value.toLowerCase().trim() : '';

  const filtered = window.products.filter(p => {
    return !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || (p.tag && p.tag.toLowerCase().includes(q));
  });

  tbody.innerHTML = filtered.map(p => `
    <tr>
      <td>
        <img src="${p.images[0]}" style="width: 44px; height: 55px; object-fit: cover; border: 1px solid #ddd;">
      </td>
      <td><strong>${p.name}</strong></td>
      <td><span class="mini-size-pill">${p.category.toUpperCase()}</span></td>
      <td>₹${p.price}</td>
      <td><span style="color: #888; text-decoration: line-through;">₹${p.compareAtPrice}</span></td>
      <td>${p.tag ? `<span class="sale-pill-badge" style="font-size: 0.75rem;">${p.tag}</span>` : '-'}</td>
      <td>${p.sizes ? p.sizes.join(', ') : '-'}</td>
      <td>
        <button class="btn btn-sm btn-secondary" onclick="openProductEditModal(${p.id})"><i class="ri-edit-line"></i></button>
        <button class="btn btn-sm btn-secondary" style="color: var(--color-sale-red);" onclick="deleteAdminProduct(${p.id})"><i class="ri-delete-bin-line"></i></button>
      </td>
    </tr>
  `).join('');
}

// Admin Product Add/Edit Modal
function openProductEditModal(productId) {
  const overlay = document.getElementById('product-edit-overlay');
  const title = document.getElementById('prod-edit-modal-title');
  const idInput = document.getElementById('edit-prod-id');
  const nameInput = document.getElementById('edit-prod-name');
  const catInput = document.getElementById('edit-prod-category');
  const tagInput = document.getElementById('edit-prod-tag');
  const priceInput = document.getElementById('edit-prod-price');
  const compInput = document.getElementById('edit-prod-compare');
  const sizesInput = document.getElementById('edit-prod-sizes');
  const descInput = document.getElementById('edit-prod-desc');

  if (productId) {
    const prod = window.products.find(p => p.id === productId);
    if (!prod) return;
    if (title) title.textContent = 'EDIT PRODUCT';
    if (idInput) idInput.value = prod.id;
    if (nameInput) nameInput.value = prod.name;
    if (catInput) catInput.value = prod.category;
    if (tagInput) tagInput.value = prod.tag || '';
    if (priceInput) priceInput.value = prod.price;
    if (compInput) compInput.value = prod.compareAtPrice;
    if (sizesInput) sizesInput.value = prod.sizes ? prod.sizes.join(', ') : '';
    if (descInput) descInput.value = prod.description || '';
    currentEditingImages = prod.images ? [...prod.images] : [];
  } else {
    if (title) title.textContent = 'ADD NEW PRODUCT';
    if (idInput) idInput.value = '';
    if (nameInput) nameInput.value = '';
    if (catInput) catInput.value = 'tees';
    if (tagInput) tagInput.value = 'NEW DROP';
    if (priceInput) priceInput.value = '999';
    if (compInput) compInput.value = '1999';
    if (sizesInput) sizesInput.value = 'S, M, L, XL';
    if (descInput) descInput.value = '';
    currentEditingImages = ['assets/tee_front_clean.jpg'];
  }

  renderEditingProductImages();
  if (overlay) overlay.classList.add('active');
}

function closeProductEditModal() {
  const overlay = document.getElementById('product-edit-overlay');
  if (overlay) overlay.classList.remove('active');
}

function renderEditingProductImages() {
  const list = document.getElementById('edit-prod-images-list');
  if (!list) return;

  list.innerHTML = currentEditingImages.map((img, idx) => `
    <div style="position: relative; width: 60px; height: 75px; border: 1px solid #ccc;">
      <img src="${img}" style="width: 100%; height: 100%; object-fit: cover;">
      <button type="button" onclick="removeImageFromEditingProduct(${idx})" 
              style="position: absolute; top: -6px; right: -6px; background: red; color: #fff; width: 18px; height: 18px; border-radius: 50%; font-size: 10px; display: flex; align-items: center; justify-content: center;">
        &times;
      </button>
    </div>
  `).join('');
}

function addImageToEditingProduct() {
  const input = document.getElementById('edit-prod-new-img-url');
  if (!input || !input.value.trim()) return;
  currentEditingImages.push(input.value.trim());
  input.value = '';
  renderEditingProductImages();
}

function uploadImageToProduct(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    currentEditingImages.push(event.target.result);
    renderEditingProductImages();
  };
  reader.readAsDataURL(file);
}

function removeImageFromEditingProduct(index) {
  currentEditingImages.splice(index, 1);
  renderEditingProductImages();
}

function handleProductSave(e) {
  e.preventDefault();
  const idInput = document.getElementById('edit-prod-id');
  const name = document.getElementById('edit-prod-name').value.trim();
  const category = document.getElementById('edit-prod-category').value;
  const tag = document.getElementById('edit-prod-tag').value.trim();
  const price = parseInt(document.getElementById('edit-prod-price').value) || 0;
  const compareAtPrice = parseInt(document.getElementById('edit-prod-compare').value) || (price * 2);
  const sizesStr = document.getElementById('edit-prod-sizes').value;
  const sizes = sizesStr ? sizesStr.split(',').map(s => s.trim()).filter(Boolean) : ['ONESIZE'];
  const description = document.getElementById('edit-prod-desc').value.trim();

  if (currentEditingImages.length === 0) {
    currentEditingImages = ['assets/tee_front_clean.jpg'];
  }

  if (idInput && idInput.value) {
    // Update existing product
    const id = parseInt(idInput.value);
    const prod = window.products.find(p => p.id === id);
    if (prod) {
      prod.name = name;
      prod.category = category;
      prod.tag = tag;
      prod.price = price;
      prod.compareAtPrice = compareAtPrice;
      prod.sizes = sizes;
      prod.description = description;
      prod.images = [...currentEditingImages];
    }
  } else {
    // Add new product
    const newId = window.products.length > 0 ? Math.max(...window.products.map(p => p.id)) + 1 : 1;
    window.products.unshift({
      id: newId,
      name,
      category,
      tag,
      price,
      compareAtPrice,
      sizes,
      description,
      images: [...currentEditingImages]
    });
  }

  // Persist catalog
  localStorage.setItem('weebfour_custom_catalog', JSON.stringify(window.products));
  renderAdminProductsList();
  renderProducts();
  updateCategoryCardBackgrounds();
  closeProductEditModal();
}

function deleteAdminProduct(productId) {
  if (confirm("Are you sure you want to delete this product from the storefront?")) {
    window.products = window.products.filter(p => p.id !== productId);
    localStorage.setItem('weebfour_custom_catalog', JSON.stringify(window.products));
    renderAdminProductsList();
    renderProducts();
    updateCategoryCardBackgrounds();
  }
}

// Admin Tab 2: Offers & Promos
function renderAdminOffersList() {
  const tickerContainer = document.getElementById('admin-ticker-list');
  const promosContainer = document.getElementById('admin-promos-list');

  // Announcements
  if (tickerContainer && window.siteConfig && window.siteConfig.announcements) {
    tickerContainer.innerHTML = window.siteConfig.announcements.map((msg, i) => `
      <div style="display: flex; gap: 8px; margin-bottom: 8px;">
        <input type="text" class="form-control-input admin-ticker-msg-input" value="${msg}">
        <button class="btn btn-sm btn-secondary" onclick="deleteAnnouncementRow(${i})">&times;</button>
      </div>
    `).join('');
  }

  // Promos
  if (promosContainer && window.siteConfig && window.siteConfig.offers && window.siteConfig.offers.promos) {
    promosContainer.innerHTML = window.siteConfig.offers.promos.map((p, i) => `
      <div style="display: grid; grid-template-columns: 1fr 80px auto; gap: 8px; margin-bottom: 8px;">
        <input type="text" class="form-control-input admin-promo-code" value="${p.code}" placeholder="CODE">
        <input type="number" class="form-control-input admin-promo-pct" value="${p.discountPercent}" placeholder="%">
        <button class="btn btn-sm btn-secondary" onclick="deletePromoRow(${i})">&times;</button>
      </div>
    `).join('');
  }
}

function addNewAnnouncementRow() {
  if (!window.siteConfig.announcements) window.siteConfig.announcements = [];
  window.siteConfig.announcements.push("NEW STORE OFFER - SHOP NOW!");
  renderAdminOffersList();
}

function deleteAnnouncementRow(index) {
  window.siteConfig.announcements.splice(index, 1);
  renderAdminOffersList();
}

function addNewPromoRow() {
  if (!window.siteConfig.offers.promos) window.siteConfig.offers.promos = [];
  window.siteConfig.offers.promos.push({ code: "NEW10", discountPercent: 10, description: "10% Discount" });
  renderAdminOffersList();
}

function deletePromoRow(index) {
  window.siteConfig.offers.promos.splice(index, 1);
  renderAdminOffersList();
}

// Admin Tab 4: Image Upload Handling
function handleImageFileUpload(e, type) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const dataUrl = event.target.result;
    if (type === 'hero-bg') {
      const urlInput = document.getElementById('admin-hero-bg-url');
      const prev = document.getElementById('admin-hero-bg-preview');
      if (urlInput) urlInput.value = dataUrl;
      if (prev) prev.src = dataUrl;
    } else if (type === 'logo') {
      const urlInput = document.getElementById('admin-logo-url');
      const prev = document.getElementById('admin-logo-preview');
      if (urlInput) urlInput.value = dataUrl;
      if (prev) prev.src = dataUrl;
    }
  };
  reader.readAsDataURL(file);
}

// Save All Admin Changes
function saveAllAdminChanges() {
  // 1. Ticker Announcements
  const tickerInputs = document.querySelectorAll('.admin-ticker-msg-input');
  if (tickerInputs.length > 0) {
    window.siteConfig.announcements = Array.from(tickerInputs).map(inp => inp.value.trim()).filter(Boolean);
  }

  // 2. Promo Codes
  const codeInputs = document.querySelectorAll('.admin-promo-code');
  const pctInputs = document.querySelectorAll('.admin-promo-pct');
  const promos = [];
  codeInputs.forEach((inp, idx) => {
    const code = inp.value.trim().toUpperCase();
    const pct = parseInt(pctInputs[idx].value) || 10;
    if (code) {
      promos.push({ code, discountPercent: pct, description: `${pct}% Discount` });
    }
  });
  window.siteConfig.offers.promos = promos;

  // 3. Shipping
  const thresh = document.getElementById('admin-shipping-threshold');
  const flat = document.getElementById('admin-flat-shipping');
  if (thresh) window.siteConfig.offers.shippingThreshold = parseInt(thresh.value) || 1499;
  if (flat) window.siteConfig.offers.flatShippingFee = parseInt(flat.value) || 150;

  // 4. Words & Copywriting
  const getVal = (id) => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
  window.siteConfig.texts.heroBadge = getVal('admin-text-hero-badge');
  window.siteConfig.texts.heroTitle = getVal('admin-text-hero-title');
  window.siteConfig.texts.heroSubtitle = getVal('admin-text-hero-desc');
  window.siteConfig.texts.heroCtaPrimary = getVal('admin-text-hero-cta1');
  window.siteConfig.texts.heroCtaSecondary = getVal('admin-text-hero-cta2');
  window.siteConfig.texts.collectionsTitle = getVal('admin-text-collections-title');
  window.siteConfig.texts.catalogTitle = getVal('admin-text-catalog-title');
  window.siteConfig.texts.newsletterTitle = getVal('admin-text-news-title');
  window.siteConfig.texts.storeAddress = getVal('admin-text-address');
  window.siteConfig.texts.storeEmail = getVal('admin-text-email');

  // 5. Media
  const heroBgUrl = document.getElementById('admin-hero-bg-url');
  if (heroBgUrl && heroBgUrl.value.trim()) {
    window.siteConfig.media.heroBg = heroBgUrl.value.trim();
  }
  const logoUrl = document.getElementById('admin-logo-url');
  if (logoUrl && logoUrl.value.trim()) {
    window.siteConfig.media.primaryLogo = logoUrl.value.trim();
  }

  // Persist to localStorage
  localStorage.setItem('weebfour_site_config', JSON.stringify(window.siteConfig));

  // Live Apply across Storefront
  applySiteConfigToStorefront();
  renderProducts();
  updateCartUI();

  alert("All changes published live to your storefront successfully!");
  closeAdminSuite();
}

function exportAdminData() {
  const data = {
    products: window.products,
    siteConfig: window.siteConfig
  };
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `weebfour_store_backup_${Date.now()}.json`;
  a.click();
}

function resetToFactoryDefaults() {
  if (confirm("Reset storefront to factory defaults? Custom products and config will be restored to defaults.")) {
    localStorage.removeItem('weebfour_custom_catalog');
    localStorage.removeItem('weebfour_site_config');
    window.products = JSON.parse(JSON.stringify(window.defaultProducts));
    window.siteConfig = JSON.parse(JSON.stringify(window.defaultSiteConfig));
    populateAdminFields();
    renderAdminProductsList();
    renderAdminOffersList();
    applySiteConfigToStorefront();
    renderProducts();
    updateCategoryCardBackgrounds();
    updateCartUI();
    alert("Storefront reset to factory defaults.");
  }
}
