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

// ==========================================================================
// SUPABASE CLIENT CONFIGURATION & CLOUD DATABASE SYNC
// ==========================================================================
const SUPABASE_URL = 'https://lcxsztthumrxnhematle.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjeHN6dHRodW1yeG5oZW1hdGxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxNTk2MTMsImV4cCI6MjEwNzczNTYxM30.jH3l15TEXGVptqfmKpDPRqAcvi8OGSG3mQF5UOf5xsw';

let supabaseClient = null;
try {
  if (window.supabase && typeof window.supabase.createClient === 'function') {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("Supabase Client initialized successfully!");
  }
} catch (e) {
  console.warn("Could not initialize Supabase client:", e);
}

// Fetch products from Supabase cloud database
async function loadProductsFromDatabase() {
  if (!supabaseClient) return;
  try {
    const { data, error } = await supabaseClient
      .from('products')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.warn("Supabase products fetch warning:", error.message);
      return;
    }

    if (data && data.length > 0) {
      window.products = data.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        tag: item.tag || '',
        price: item.price,
        compareAtPrice: item.compare_at_price || 0,
        sizes: item.sizes || ['S', 'M', 'L', 'XL'],
        description: item.description || '',
        images: item.images || []
      }));
      window.products.sort((a, b) => Number(a.id) - Number(b.id));
      renderProducts();
      updateCategoryCardBackgrounds();
      if (typeof initProductDetailPage === 'function') {
        initProductDetailPage();
      }
      console.log(`Loaded ${data.length} products from Supabase cloud database.`);
    }
  } catch (err) {
    console.warn("Failed to load products from Supabase:", err);
  }
}

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
  initFuturisticCyberMatrix();
  initLenisSmoothScroll();
  loadProductsFromDatabase();

  // Restore saved order notes
  const noteEl = document.getElementById('cart-order-notes');
  if (noteEl && orderInstructions) {
    noteEl.value = orderInstructions;
  }

  // Auto-launch Admin Modal if requested via URL (?admin=true or #admin)
  if (window.location.search.includes('admin=true') || window.location.hash === '#admin') {
    setTimeout(() => {
      openAdminModal();
    }, 350);
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
    const heroImg = document.getElementById('hero-slider-img');
    if (heroImg && cfg.media.heroBg) {
      heroImg.src = cfg.media.heroBg;
    }
    const heroBg = document.getElementById('hero-slider-bg');
    if (heroBg && cfg.media.heroBg) {
      heroBg.style.backgroundImage = `url('${cfg.media.heroBg}')`;
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

  // View matching user's reference screenshot when empty or drops pending
  if (filtered.length === 0) {
    container.style.display = 'none';
    if (emptyView) {
      emptyView.style.display = 'flex';
      const emptyTitle = document.getElementById('empty-state-title');
      const emptySubtitle = document.getElementById('empty-state-subtitle');
      if (window.products && window.products.length > 0) {
        if (emptyTitle) emptyTitle.textContent = 'NO PRODUCTS FOUND';
        if (emptySubtitle) emptySubtitle.innerHTML = 'USE FEWER FILTERS OR <button type="button" class="empty-remove-link" onclick="resetAllFilters()">REMOVE ALL</button>';
      } else {
        if (emptyTitle) emptyTitle.textContent = 'NEW DROPS COMING SOON';
        if (emptySubtitle) emptySubtitle.textContent = 'STAY TUNED FOR UPCOMING STREETWEAR DROPS';
      }
    }
  } else {
    container.style.display = 'grid';
    if (emptyView) emptyView.style.display = 'none';

    container.innerHTML = filtered.map(item => {
      const discount = item.compareAtPrice && item.compareAtPrice > item.price
        ? Math.round(((item.compareAtPrice - item.price) / item.compareAtPrice) * 100)
        : 0;
      const isWishlisted = wishlist.has(item.id);
      const isAvailable = item.inStock !== false;
      
      const hasImages = item.images && item.images.length > 0 && item.images[0];
      const mainImg = hasImages ? item.images[0] : '';
      const hoverImg = (item.images && item.images.length > 1) ? item.images[1] : mainImg;

      const sizePills = item.sizes ? item.sizes.map(s => `<span class="mini-size-pill">${s}</span>`).join('') : '';

      return `
        <div class="product-card ${!isAvailable ? 'card-out-of-stock' : ''}" data-id="${item.id}">
          <!-- Media Box clicking navigates to dedicated product.html page (thelastape.in style) -->
          <div class="card-media-box" onclick="window.location.href='product.html?id=${item.id}'" style="cursor: pointer; position: relative;">
            <!-- Badges Left -->
            <div class="card-badges-left">
              ${!isAvailable ? `<span class="sale-pill-badge" style="background: var(--color-muted-red);">SOLD OUT</span>` : ''}
              ${discount > 0 && isAvailable ? `<span class="sale-pill-badge">-${discount}% OFF</span>` : ''}
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
                      onclick="window.location.href='product.html?id=${item.id}'" 
                      title="Open Product Page" 
                      aria-label="Open Product Page">
                <i class="ri-eye-line"></i>
              </button>
              <button class="card-icon-btn ${!isAvailable ? 'btn-disabled-soldout' : ''}" 
                      onclick="${isAvailable ? `quickAddToCart(${item.id})` : `showToast('This product is currently sold out.')`}" 
                      title="${isAvailable ? 'Quick Add to Bag' : 'Sold Out'}" 
                      aria-label="${isAvailable ? 'Add to Bag' : 'Sold Out'}">
                <i class="${isAvailable ? 'ri-shopping-bag-line' : 'ri-close-circle-line'}"></i>
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
                <small style="font-size:0.75rem; color:var(--color-text-dim); margin-top:4px;">IMAGE COMING SOON</small>
              </div>
            `}

            ${!isAvailable ? `
              <div class="card-soldout-overlay"><span>SOLD OUT</span></div>
            ` : ''}

            <!-- Interactive Quick Size Selector Bar (thelastape.in signature feature) -->
            <div class="card-quick-sizes" onclick="event.stopPropagation();">
              <span class="quick-size-label">${isAvailable ? 'QUICK ADD:' : 'STATUS:'}</span>
              ${isAvailable ? (item.sizes && item.sizes.length > 0 ? item.sizes : ['S', 'M', 'L', 'XL', 'XXL']).map(s => `
                <button type="button" class="quick-size-btn" onclick="quickAddWithSize(event, ${item.id}, '${s}')" title="Quick add ${s}">${s}</button>
              `).join('') : '<span style="font-size:0.75rem; color:#ff6b6b; font-weight:700;">OUT OF STOCK</span>'}
            </div>
          </div>

          <!-- Product Details -->
          <div class="card-info-wrap">
            <div class="product-stock-tag ${isAvailable ? 'in-stock' : 'out-of-stock'}">
              <i class="${isAvailable ? 'ri-checkbox-circle-fill' : 'ri-close-circle-fill'}"></i>
              ${isAvailable ? 'In Stock' : 'Out of Stock'}
            </div>
            <span class="card-brand-tag">WEEBFOUR</span>
            <h3 class="card-product-title" onclick="window.location.href='product.html?id=${item.id}'" style="cursor: pointer;">${item.name}</h3>
            
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

// Single Signature Dark Theme Enforcement (Theme Changer removed)
function initTheme() {
  document.documentElement.removeAttribute('data-theme');
  try {
    localStorage.removeItem('weebfour_theme');
  } catch (e) {}
}

function toggleTheme() {
  // Single theme only - no toggle
}

function applyTheme() {
  document.documentElement.removeAttribute('data-theme');
}

// ==========================================================================
// 5. WISHLIST MANAGEMENT
// ==========================================================================
function toggleWishlist(productId) {
  const product = (window.products || []).find(p => String(p.id) === String(productId) || Number(p.id) === Number(productId));
  if (wishlist.has(productId)) {
    wishlist.delete(productId);
    showToast(`Removed from Wishlist`, 'ri-heart-line');
  } else {
    wishlist.add(productId);
    showToast(`Added ${product ? product.name : 'item'} to Wishlist!`, 'ri-heart-fill');
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

// Scroll management helpers for modals and drawers to ensure 100% natural mousewheel scrolling
let activeModalCount = 0;
function pausePageScroll() {
  activeModalCount++;
  document.body.style.overflow = 'hidden';
  if (window.masterLenis) window.masterLenis.stop();
}

function resumePageScroll() {
  activeModalCount = Math.max(0, activeModalCount - 1);
  const anyActiveOverlay = document.querySelector('.modal-overlay.active, .cart-drawer.active, .mobile-menu-drawer.active');
  if (activeModalCount === 0 || !anyActiveOverlay) {
    activeModalCount = 0;
    document.body.style.overflow = '';
    if (window.masterLenis) window.masterLenis.start();
  }
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
        <div class="card-media-box" onclick="closeWishlistModal(); window.location.href='product.html?id=' + ${p.id}" style="cursor: pointer;">
          <img src="${p.images[0]}" alt="${p.name}">
        </div>
        <div class="card-info-wrap">
          <h4 class="card-product-title" onclick="closeWishlistModal(); window.location.href='product.html?id=' + ${p.id}" style="cursor: pointer;">${p.name}</h4>
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

  pausePageScroll();
  overlay.classList.add('active');
}

function closeWishlistModal() {
  const overlay = document.getElementById('wishlist-modal-overlay');
  if (overlay) overlay.classList.remove('active');
  resumePageScroll();
}

// ==========================================================================
// 6. CART MANAGEMENT & SLIDE-OUT DRAWER
// ==========================================================================
function openCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const backdrop = document.getElementById('cart-drawer-backdrop');
  if (drawer && backdrop) {
    pausePageScroll();
    drawer.classList.add('active');
    backdrop.classList.add('active');
  }
}

function closeCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const backdrop = document.getElementById('cart-drawer-backdrop');
  if (drawer && backdrop) {
    drawer.classList.remove('active');
    backdrop.classList.remove('active');
    resumePageScroll();
  }
}

function quickAddToCart(productId) {
  const product = (window.products || []).find(p => String(p.id) === String(productId) || Number(p.id) === Number(productId));
  if (!product) return;
  if (product.inStock === false) {
    showToast(`Sorry, "${product.name}" is currently sold out.`);
    return;
  }

  const defaultSize = (product.sizes && product.sizes.length > 0) ? product.sizes[0] : 'ONESIZE';
  addToCart(product, defaultSize, 1);
  openCartDrawer();
}

function addToCart(product, size, qty = 1) {
  if (!product) return;
  if (product.inStock === false) {
    showToast(`Sorry, "${product.name}" is currently out of stock.`);
    return;
  }

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
  showToast(`Added ${product.name} (${size}) to Bag!`, 'ri-shopping-bag-3-line');
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

function setCartItemQty(index, newQty) {
  if (cart[index]) {
    const val = parseInt(newQty, 10);
    if (isNaN(val) || val <= 0) {
      cart[index].quantity = 1;
    } else {
      cart[index].quantity = Math.min(99, val);
    }
    localStorage.setItem('weebfour_cart', JSON.stringify(cart));
    updateCartUI();
  }
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
  const ctaTotal = document.getElementById('cart-drawer-cta-total');
  if (ctaTotal) ctaTotal.textContent = `₹${subtotal.toLocaleString('en-IN')}`;

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
  if (container) {
    if (cart.length === 0) {
      container.innerHTML = `
        <div class="cart-empty-view">
          <i class="ri-shopping-bag-line"></i>
          <h3>YOUR BAG IS EMPTY</h3>
          <p>Explore our latest streetwear drops and find your next favorite tee.</p>
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
              <button type="button" class="qty-step-btn" onclick="adjustCartQty(${idx}, -1)" aria-label="Decrease quantity">-</button>
              <input type="number" class="qty-number-input" min="1" max="99" value="${item.quantity}" onchange="setCartItemQty(${idx}, this.value)" aria-label="Item quantity">
              <button type="button" class="qty-step-btn" onclick="adjustCartQty(${idx}, 1)" aria-label="Increase quantity">+</button>
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

  if (typeof renderStandaloneCart === 'function' && document.getElementById('cart-page-items')) {
    renderStandaloneCart();
  }
  if (typeof renderCheckoutSummary === 'function' && document.getElementById('checkout-summary-items')) {
    renderCheckoutSummary();
  }
}

// ==========================================================================
// 7. QUICK VIEW MODAL
// ==========================================================================
function openQuickView(productId) {
  const product = (window.products || []).find(p => String(p.id) === String(productId) || Number(p.id) === Number(productId));
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

  pausePageScroll();
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
  resumePageScroll();
}

// ==========================================================================
// 8. SIZE CHART MODAL
// ==========================================================================
function openSizeChartModal() {
  const overlay = document.getElementById('size-chart-overlay');
  if (overlay) {
    pausePageScroll();
    overlay.classList.add('active');
  }
}
function closeSizeChartModal() {
  const overlay = document.getElementById('size-chart-overlay');
  if (overlay) overlay.classList.remove('active');
  resumePageScroll();
}

// ==========================================================================
// 9. MULTI-STEP CHECKOUT CONTROLLER (THELASTAPE.IN SEQUENTIAL FLOW)
// Order of steps:
// Step 1: Contact Information (Mobile Phone No & Email)
// Step 2: Delivery Address (Full Name, Street, Landmark, City, State, PIN)
// Step 3: Payment Method (UPI, Cards, NetBanking, COD)
// Step 4: Order Confirmation & Receipt
// ==========================================================================

let checkoutData = {
  phone: '',
  email: '',
  whatsapp: true,
  address: {
    fullName: '',
    firstName: '',
    lastName: '',
    street: '',
    landmark: '',
    city: '',
    state: '',
    pincode: ''
  },
  paymentMethod: 'Cashfree Payment Gateway'
};

let contactSaveDebounceTimer = null;

function handleLiveContactInput() {
  clearTimeout(contactSaveDebounceTimer);
  contactSaveDebounceTimer = setTimeout(() => {
    saveContactDetailsToDatabase(false);
  }, 700);
}

function saveContactDetailsToDatabase(isFormSubmit = false) {
  const nameInput = document.getElementById('co-name');
  const phoneInput = document.getElementById('co-phone');
  const emailInput = document.getElementById('co-email');

  const name = nameInput ? nameInput.value.trim() : (checkoutData.address.fullName || '');
  const phone = phoneInput ? phoneInput.value.trim() : (checkoutData.phone || '');
  const email = emailInput ? emailInput.value.trim() : (checkoutData.email || '');

  if (!name && !phone && !email) return;

  if (name) checkoutData.address.fullName = name;
  if (phone) checkoutData.phone = phone;
  if (email) checkoutData.email = email;

  // 1. Save contact locally so it persists
  try {
    localStorage.setItem('weebfour_saved_contact', JSON.stringify({ name, phone, email }));
    let leads = JSON.parse(localStorage.getItem('weebfour_customer_leads') || '[]');
    const existingIdx = leads.findIndex(l => (phone && l.phone === phone) || (email && l.email === email));
    const leadObj = {
      id: existingIdx >= 0 ? leads[existingIdx].id : `LEAD-${Date.now()}`,
      name: name || (existingIdx >= 0 ? leads[existingIdx].name : 'Direct Visitor'),
      phone: phone || (existingIdx >= 0 ? leads[existingIdx].phone : ''),
      email: email || (existingIdx >= 0 ? leads[existingIdx].email : ''),
      status: isFormSubmit ? 'CONTACT_SUBMITTED' : 'LEAD_CAPTURED',
      updated_at: new Date().toISOString()
    };
    if (existingIdx >= 0) leads[existingIdx] = leadObj;
    else leads.unshift(leadObj);
    localStorage.setItem('weebfour_customer_leads', JSON.stringify(leads));
  } catch(e) {}

  // 2. Save / Upsert to Supabase database for store owner access
  if (supabaseClient) {
    let leadSessionId = sessionStorage.getItem('weebfour_lead_session_id');
    if (!leadSessionId) {
      leadSessionId = `LEAD-${Math.floor(100000 + Math.random() * 900000)}`;
      sessionStorage.setItem('weebfour_lead_session_id', leadSessionId);
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const leadPayload = {
      id: leadSessionId,
      customer_name: name || 'Interested Customer',
      customer_phone: phone || 'N/A',
      customer_email: email || 'N/A',
      status: isFormSubmit ? 'CONTACT_SUBMITTED' : 'LEAD_CAPTURED',
      total_amount: subtotal || 0,
      payment_method: checkoutData.paymentMethod || 'PENDING_CHECKOUT',
      shipping_address: checkoutData.address || {},
      items: cart || []
    };

    supabaseClient.from('orders').upsert(leadPayload, { onConflict: 'id' }).then(({ error }) => {
      if (error) console.warn("Supabase lead capture sync warning:", error.message);
      else console.log("Customer contact saved to database:", name, phone, email);
    });

    if (phone && phone.length === 10) {
      supabaseClient.from('subscribers').upsert({ phone: phone }, { onConflict: 'phone' }).then(() => {});
    }
  }
}

function openCheckoutModal() {
  if (!cart || cart.length === 0) {
    showToast("Your bag is empty! Add products to proceed.", "ri-shopping-bag-line");
    return;
  }
  closeCartDrawer();
  const overlay = document.getElementById('checkout-modal-overlay');
  if (overlay) {
    pausePageScroll();
    overlay.classList.add('active');

    // Auto-fill from localStorage if previously stored
    try {
      const savedContact = JSON.parse(localStorage.getItem('weebfour_saved_contact') || '{}');
      if (savedContact.name) {
        checkoutData.address.fullName = savedContact.name;
        const nInput = document.getElementById('co-name');
        if (nInput) nInput.value = savedContact.name;
      }
      if (savedContact.phone) {
        checkoutData.phone = savedContact.phone;
        const pInput = document.getElementById('co-phone');
        if (pInput) pInput.value = savedContact.phone;
      }
      if (savedContact.email) {
        checkoutData.email = savedContact.email;
        const eInput = document.getElementById('co-email');
        if (eInput) eInput.value = savedContact.email;
      }

      const savedAddress = JSON.parse(localStorage.getItem('weebfour_saved_address') || '{}');
      if (savedAddress.street || savedAddress.fullName) {
        checkoutData.address = savedAddress;
        if (!savedContact.name && savedAddress.fullName) {
          const nInput = document.getElementById('co-name');
          if (nInput) nInput.value = savedAddress.fullName;
        }
        if (document.getElementById('co-fullname')) {
          document.getElementById('co-fullname').value = savedAddress.fullName || `${savedAddress.firstName || ''} ${savedAddress.lastName || ''}`.trim();
        }
        if (document.getElementById('co-street')) document.getElementById('co-street').value = savedAddress.street || '';
        if (document.getElementById('co-landmark')) document.getElementById('co-landmark').value = savedAddress.landmark || '';
        if (document.getElementById('co-city')) document.getElementById('co-city').value = savedAddress.city || '';
        if (document.getElementById('co-state')) document.getElementById('co-state').value = savedAddress.state || '';
        if (document.getElementById('co-pincode')) document.getElementById('co-pincode').value = savedAddress.pincode || '';
      }
    } catch(e) {}

    // Attach live input listeners so typed contact is captured in real-time
    ['co-name', 'co-phone', 'co-email'].forEach(id => {
      const el = document.getElementById(id);
      if (el && !el._hasContactSyncListener) {
        el.addEventListener('input', handleLiveContactInput);
        el.addEventListener('blur', () => saveContactDetailsToDatabase(false));
        el._hasContactSyncListener = true;
      }
    });

    goToCheckoutStep(1);
    renderCheckoutSummary();
  }
}

function closeCheckoutModal() {
  const overlay = document.getElementById('checkout-modal-overlay');
  if (overlay) overlay.classList.remove('active');
  resumePageScroll();
}

function goToCheckoutStep(step) {
  const p1 = document.getElementById('checkout-step1-panel');
  const p2 = document.getElementById('checkout-step2-panel');
  const p3 = document.getElementById('checkout-step3-panel');
  const p4 = document.getElementById('checkout-step4-panel');
  const t1 = document.getElementById('checkout-tab-step1');
  const t2 = document.getElementById('checkout-tab-step2');
  const t3 = document.getElementById('checkout-tab-step3');

  if (p1) p1.style.display = step === 1 ? 'block' : 'none';
  if (p2) p2.style.display = step === 2 ? 'block' : 'none';
  if (p3) p3.style.display = step === 3 ? 'block' : 'none';
  if (p4) p4.style.display = step === 4 ? 'block' : 'none';

  if (t1) {
    t1.classList.toggle('active', step === 1);
    t1.classList.toggle('completed', step > 1);
  }
  if (t2) {
    t2.classList.toggle('active', step === 2);
    t2.classList.toggle('completed', step > 2);
  }
  if (t3) {
    t3.classList.toggle('active', step === 3);
    t3.classList.toggle('completed', step > 3);
  }

  // Update Step 2 Preview Badges
  const prevPhone = document.getElementById('co-preview-phone');
  const prevEmail = document.getElementById('co-preview-email');
  if (prevPhone && checkoutData.phone) prevPhone.textContent = `+91 ${checkoutData.phone}`;
  if (prevEmail && checkoutData.email) prevEmail.textContent = checkoutData.email;

  // Update Step 3 Summary Badges
  const sumContact = document.getElementById('co-summary-contact');
  const sumAddress = document.getElementById('co-summary-address');
  if (sumContact && checkoutData.phone) {
    sumContact.textContent = `+91 ${checkoutData.phone} • ${checkoutData.email || ''}`;
  }
  if (sumAddress && checkoutData.address && checkoutData.address.street) {
    const custName = checkoutData.address.fullName || `${checkoutData.address.firstName || ''} ${checkoutData.address.lastName || ''}`.trim();
    sumAddress.textContent = `${custName ? custName + ', ' : ''}${checkoutData.address.street}, ${checkoutData.address.city || ''} - ${checkoutData.address.pincode || ''}`;
  }
}

function handleContactFormSubmit(e) {
  e.preventDefault();
  const nameInput = document.getElementById('co-name');
  const phoneInput = document.getElementById('co-phone');
  const emailInput = document.getElementById('co-email');

  const name = nameInput ? nameInput.value.trim() : '';
  const phone = phoneInput ? phoneInput.value.trim() : '';
  const email = emailInput ? emailInput.value.trim() : '';
  const whatsapp = document.getElementById('co-whatsapp-opt') ? document.getElementById('co-whatsapp-opt').checked : true;

  if (!name) {
    alert("Please enter your full name.");
    if (nameInput) nameInput.focus();
    return;
  }
  if (!phone || phone.length < 10) {
    alert("Please enter a valid 10-digit mobile phone number.");
    if (phoneInput) phoneInput.focus();
    return;
  }
  if (!email || !email.includes('@')) {
    alert("Please enter a valid email address for your order confirmation.");
    if (emailInput) emailInput.focus();
    return;
  }

  checkoutData.phone = phone;
  checkoutData.email = email;
  checkoutData.whatsapp = whatsapp;
  checkoutData.address.fullName = name;

  // Sync to Step 2 full name input if empty
  const coFull = document.getElementById('co-fullname');
  if (coFull && !coFull.value.trim()) {
    coFull.value = name;
  }

  // Save to database & local storage immediately
  saveContactDetailsToDatabase(true);

  goToCheckoutStep(2);
}

function handleShippingFormSubmit(e) {
  e.preventDefault();
  const fullName = document.getElementById('co-fullname') ? document.getElementById('co-fullname').value.trim() : '';
  const street = document.getElementById('co-street') ? document.getElementById('co-street').value.trim() : '';
  const landmark = document.getElementById('co-landmark') ? document.getElementById('co-landmark').value.trim() : '';
  const city = document.getElementById('co-city') ? document.getElementById('co-city').value.trim() : '';
  const state = document.getElementById('co-state') ? document.getElementById('co-state').value.trim() : '';
  const pincode = document.getElementById('co-pincode') ? document.getElementById('co-pincode').value.trim() : '';

  if (!fullName || !street || !city || !pincode) {
    alert("Please fill in all mandatory delivery address fields.");
    return;
  }

  checkoutData.address = {
    fullName: fullName,
    firstName: fullName,
    lastName: '',
    street: street,
    landmark: landmark,
    city: city,
    state: state,
    pincode: pincode
  };

  try {
    localStorage.setItem('weebfour_saved_address', JSON.stringify(checkoutData.address));
  } catch(e) {}

  goToCheckoutStep(3);
}

function selectPaymentMethod(tile, method) {
  document.querySelectorAll('.payment-method-tile').forEach(t => t.classList.remove('selected'));
  if (tile) {
    tile.classList.add('selected');
    const radio = tile.querySelector('input[type="radio"]');
    if (radio) radio.checked = true;
  }
  checkoutData.paymentMethod = method;
}

function renderCheckoutSummary() {
  const itemsContainer = document.getElementById('checkout-summary-items');
  const subtotalEl = document.getElementById('co-subtotal-val');
  const totalEl = document.getElementById('co-total-val');
  const payBtnTotal = document.getElementById('pay-button-total');
  const discRow = document.getElementById('co-discount-row');
  const discVal = document.getElementById('co-discount-val');

  if (cart.length === 0) {
    closeCheckoutModal();
    return;
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = Math.round(subtotal * activePromoDiscount);
  const total = Math.max(0, subtotal - discountAmount);

  if (itemsContainer) {
    itemsContainer.innerHTML = cart.map((item, idx) => `
      <div class="checkout-summary-item-row" style="display: flex; gap: 12px; margin-bottom: 12px; align-items: center; padding-bottom: 12px; border-bottom: 1px solid var(--color-border);">
        <img src="${item.image}" alt="${item.name}" style="width: 46px; height: 58px; object-fit: cover; border-radius: 4px; border: 1px solid var(--color-border);">
        <div style="flex: 1; min-width: 0;">
          <div style="font-weight: 600; font-size: 0.88rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.name}</div>
          <div style="color: var(--color-text-muted); font-size: 0.78rem; margin: 2px 0 6px;">Size: <strong>${item.size}</strong></div>
          <div class="cart-qty-stepper" style="transform: scale(0.92); transform-origin: left center;">
            <button type="button" class="qty-step-btn" onclick="adjustCartQty(${idx}, -1)" aria-label="Decrease quantity">-</button>
            <input type="number" class="qty-number-input" min="1" max="99" value="${item.quantity}" onchange="setCartItemQty(${idx}, this.value)" aria-label="Item quantity">
            <button type="button" class="qty-step-btn" onclick="adjustCartQty(${idx}, 1)" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 6px;">
          <div style="font-weight: 700; font-size: 0.92rem;">
            ₹${(item.price * item.quantity).toLocaleString('en-IN')}
          </div>
          <button type="button" class="cart-item-delete" onclick="removeCartItem(${idx})" title="Remove item" aria-label="Remove item" style="background: none; border: none; color: var(--color-text-dim); cursor: pointer; padding: 2px;">
            <i class="ri-delete-bin-line" style="font-size: 1rem;"></i>
          </button>
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
    msg.style.color = '#00d66c';
    msg.textContent = `Promo "${found.code}" applied: ${found.discountPercent}% OFF!`;
  } else if (code === 'WEEB10' || code === 'FIRST10') {
    activePromoDiscount = 0.10;
    appliedPromoCode = code;
    msg.style.display = 'block';
    msg.style.color = '#00d66c';
    msg.textContent = `Promo "${code}" applied: 10% OFF!`;
  } else {
    activePromoDiscount = 0;
    appliedPromoCode = '';
    msg.style.display = 'block';
    msg.style.color = 'var(--color-sale-red)';
    msg.textContent = 'Invalid promo code. Try WEEB10.';
  }

  renderCheckoutSummary();
}

function completeOrderPayment(method) {
  if (method) checkoutData.paymentMethod = method;

  const orderNumber = `WEEB-${Math.floor(10000 + Math.random() * 90000)}`;
  const orderNumEl = document.getElementById('confirmed-order-number');
  if (orderNumEl) orderNumEl.textContent = orderNumber;

  const custName = checkoutData.address.fullName || `${checkoutData.address.firstName || ''} ${checkoutData.address.lastName || ''}`.trim() || 'Direct Customer';
  const nameEl = document.getElementById('confirmed-customer-name');
  if (nameEl) nameEl.textContent = custName;

  const confContact = document.getElementById('confirmed-contact');
  if (confContact) confContact.textContent = `+91 ${checkoutData.phone} • ${checkoutData.email}`;

  const confAddr = document.getElementById('confirmed-address');
  if (confAddr) {
    confAddr.textContent = `${custName}, ${checkoutData.address.street || ''}, ${checkoutData.address.city || ''} - ${checkoutData.address.pincode || ''}`;
  }

  const emailNotice = document.getElementById('confirmed-email-notice');
  if (emailNotice) emailNotice.textContent = checkoutData.email;

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = Math.round(subtotal * activePromoDiscount);
  const total = Math.max(0, subtotal - discountAmount);

  // Configure WhatsApp tracking direct button
  const waBtn = document.getElementById('confirmed-whatsapp-btn');
  if (waBtn) {
    const waText = encodeURIComponent(`Hi WEEB FOUR, I have placed order #${orderNumber} for ₹${total.toLocaleString('en-IN')}.\nCustomer: ${custName}\nPhone: ${checkoutData.phone}\nPlease share my package dispatch and tracking updates!`);
    waBtn.href = `https://wa.me/916381177617?text=${waText}`;
  }

  const orderPayload = {
    id: orderNumber,
    customer_name: custName,
    customer_phone: checkoutData.phone,
    customer_email: checkoutData.email,
    shipping_address: checkoutData.address,
    items: [...cart],
    total_amount: total,
    payment_method: checkoutData.paymentMethod || 'Cashfree Payment Gateway',
    status: 'CONFIRMED'
  };

  // 1. Insert Confirmed Order to Supabase cloud database
  if (supabaseClient) {
    supabaseClient.from('orders').insert(orderPayload).then(({ error }) => {
      if (error) console.error("Supabase order error:", error);
      else console.log("Order saved to Supabase successfully:", orderNumber);
    });

    // Clean up temporary lead session if exists
    const activeLeadId = sessionStorage.getItem('weebfour_lead_session_id');
    if (activeLeadId) {
      sessionStorage.removeItem('weebfour_lead_session_id');
    }
  }

  // 2. Automatically dispatch confirmation email mentioning customer name from weebfour.4@gmail.com
  sendCustomerOrderEmail(orderPayload);

  goToCheckoutStep(4);
}

// ==========================================================================
// AUTOMATED ORDER CONFIRMATION EMAIL SENDER (weebfour.4@gmail.com)
// ==========================================================================
async function sendCustomerOrderEmail(order) {
  if (!order || !order.customer_email) return;

  const customerName = order.customer_name || 'Customer';
  const customerEmail = order.customer_email;
  const orderId = order.id;
  const totalAmount = order.total_amount;
  const itemsText = (order.items || []).map(i => `• ${i.name} (Size: ${i.size}) x ${i.quantity} = ₹${(i.price * i.quantity).toLocaleString('en-IN')}`).join('\n');
  const addressText = order.shipping_address ? 
    `${order.shipping_address.street || ''}, ${order.shipping_address.city || ''}, ${order.shipping_address.state || ''} - ${order.shipping_address.pincode || ''}` : 'As entered at checkout';

  const emailSubject = `Order Confirmed #${orderId} - WEEB FOUR`;
  const emailMessage = `Hi ${customerName},

Thank you for shopping with WEEB FOUR!
Your order #${orderId} has been confirmed and payment was received successfully.

YOUR ORDER IS BEING PACKED RIGHT AWAY!
We will get to you right away with your express dispatch tracking link.

----------------------------------------
ORDER DETAILS:
Order ID: #${orderId}
Customer Name: ${customerName}
Delivery Address: ${addressText}
Payment Method: ${order.payment_method || 'Online Payment'}

ITEMS IN THIS ORDER:
${itemsText}

Total Amount Paid: ₹${totalAmount.toLocaleString('en-IN')}
----------------------------------------

If you have any questions, reach out to us at:
Official Email: weebfour.4@gmail.com
Phone / WhatsApp: +91 63811 77617

Stay Fresh,
WEEB FOUR Official Streetwear Team`;

  console.log(`[Order Email] Sending confirmation email to ${customerName} (${customerEmail}) from weebfour.4@gmail.com...`);

  // Try EmailJS
  const emailjsPublicKey = localStorage.getItem('weebfour_emailjs_public_key') || '';
  const emailjsServiceId = localStorage.getItem('weebfour_emailjs_service_id') || 'service_weebfour';
  const emailjsTemplateId = localStorage.getItem('weebfour_emailjs_template_id') || 'template_order_confirm';

  if (window.emailjs && emailjsPublicKey) {
    try {
      if (typeof emailjs.init === 'function') emailjs.init(emailjsPublicKey);
      const res = await emailjs.send(emailjsServiceId, emailjsTemplateId, {
        to_name: customerName,
        to_email: customerEmail,
        customer_name: customerName,
        customer_email: customerEmail,
        order_id: orderId,
        order_total: `₹${totalAmount.toLocaleString('en-IN')}`,
        items_summary: itemsText,
        shipping_address: addressText,
        from_name: 'WEEB FOUR',
        reply_to: 'weebfour.4@gmail.com',
        message: emailMessage
      });
      console.log("[EmailJS] Confirmation email sent successfully via EmailJS:", res);
      showToast(`Order confirmation email sent to ${customerEmail}`, "ri-mail-check-line");
      return;
    } catch (e) {
      console.warn("[EmailJS] EmailJS sending error:", e);
    }
  }

  // Fallback direct mail dispatch
  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        access_key: "f07dcf20-e2d4-4a46-81cf-83e9b1d9df52",
        subject: emailSubject,
        from_name: "WEEB FOUR Official",
        reply_to: "weebfour.4@gmail.com",
        email: customerEmail,
        name: customerName,
        message: emailMessage
      })
    });
    const result = await res.json();
    if (result.success) {
      console.log("[Mail API] Order notification email dispatched:", result);
      showToast(`Order confirmation email sent to ${customerEmail}`, "ri-mail-check-line");
    }
  } catch (err) {
    console.warn("[Mail API] Mail API dispatch warning:", err);
  }
}

// Cashfree Payment Gateway SDK Integration Hook (Ready for Tomorrow)
window.CashfreeConfig = {
  mode: 'production',
  appId: '',
  paymentSessionId: ''
};

function initiateCashfreePayment(customPayload) {
  if (window.Cashfree && window.CashfreeConfig.paymentSessionId) {
    try {
      const cashfree = Cashfree({ mode: window.CashfreeConfig.mode || "production" });
      cashfree.checkout({
        paymentSessionId: window.CashfreeConfig.paymentSessionId,
        redirectTarget: "_modal"
      }).then((data) => {
        if (data.error) {
          alert("Payment could not be completed: " + data.error.message);
        }
        if (data.paymentDetails) {
          completeOrderPayment('Cashfree Gateway');
        }
      });
      return;
    } catch(err) {
      console.warn("Cashfree initialization error:", err);
    }
  }
  completeOrderPayment('Cashfree Payment Gateway');
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
    pausePageScroll();
    drawer.classList.add('active');
    overlay.classList.add('active');
  }
}

function closeMobileDrawer() {
  const drawer = document.getElementById('mobile-menu-drawer');
  const overlay = document.getElementById('mobile-drawer-overlay');
  if (drawer && overlay) {
    drawer.classList.remove('active');
    overlay.classList.remove('active');
    resumePageScroll();
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

    // Save subscriber phone to Supabase cloud database
    if (supabaseClient) {
      supabaseClient.from('subscribers').upsert({ phone: phoneVal }, { onConflict: 'phone' }).then(({ error }) => {
        if (error) console.warn("Supabase subscriber error:", error.message);
        else console.log("Subscriber phone saved to Supabase:", phoneVal);
      });
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
  const authOverlay = document.getElementById('admin-auth-overlay');
  if (!authOverlay) {
    window.location.href = 'index.html?admin=true';
    return;
  }
  if (isAdminAuthenticated) {
    openAdminSuite();
  } else {
    pausePageScroll();
    authOverlay.classList.add('active');
  }
}

function closeAdminAuth() {
  const authOverlay = document.getElementById('admin-auth-overlay');
  if (authOverlay && authOverlay.classList.contains('active')) {
    authOverlay.classList.remove('active');
    resumePageScroll();
  }
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

  pausePageScroll();
  suiteOverlay.classList.add('active');
  populateAdminFields();
  renderAdminProductsList();
  renderAdminOffersList();
  loadAndRenderAdminContacts();
}

function closeAdminSuite() {
  const suiteOverlay = document.getElementById('admin-suite-overlay');
  if (suiteOverlay && suiteOverlay.classList.contains('active')) {
    suiteOverlay.classList.remove('active');
    resumePageScroll();
  }
}

function switchAdminTab(tabName) {
  document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });
  document.querySelectorAll('.admin-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === `admin-panel-${tabName}`);
  });
  if (tabName === 'contacts') {
    loadAndRenderAdminContacts();
  }
}

// Populate form inputs with current values
function populateAdminFields() {
  const cfg = window.siteConfig;
  if (!cfg) return;

  // EmailJS Settings
  const emKey = document.getElementById('admin-emailjs-key');
  const emServ = document.getElementById('admin-emailjs-service');
  const emTemp = document.getElementById('admin-emailjs-template');
  if (emKey) emKey.value = localStorage.getItem('weebfour_emailjs_public_key') || '';
  if (emServ) emServ.value = localStorage.getItem('weebfour_emailjs_service_id') || 'service_weebfour';
  if (emTemp) emTemp.value = localStorage.getItem('weebfour_emailjs_template_id') || 'template_order_confirm';

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

  tbody.innerHTML = filtered.map(p => {
    const isAvailable = p.inStock !== false;
    return `
      <tr>
        <td>
          <img src="${p.images[0]}" style="width: 44px; height: 55px; object-fit: cover; border: 1px solid #ddd; border-radius: 4px;">
        </td>
        <td><strong>${p.name}</strong></td>
        <td><span class="mini-size-pill">${p.category.toUpperCase()}</span></td>
        <td>₹${p.price}</td>
        <td>
          <button type="button" class="btn btn-xs" 
                  style="font-size: 0.75rem; padding: 5px 10px; border-radius: 4px; font-weight: 700; cursor: pointer; background: ${isAvailable ? 'rgba(0,214,108,0.15)' : 'rgba(184,58,58,0.2)'}; color: ${isAvailable ? '#00d66c' : '#ff5e5e'}; border: 1px solid ${isAvailable ? 'rgba(0,214,108,0.4)' : 'rgba(184,58,58,0.4)'};"
                  onclick="toggleProductStock(${p.id})">
            ${isAvailable ? '<i class="ri-checkbox-circle-fill"></i> IN STOCK' : '<i class="ri-close-circle-fill"></i> OUT OF STOCK'}
          </button>
        </td>
        <td>${p.tag ? `<span class="sale-pill-badge" style="font-size: 0.75rem;">${p.tag}</span>` : '-'}</td>
        <td>${p.sizes ? p.sizes.join(', ') : '-'}</td>
        <td>
          <button class="btn btn-sm btn-secondary" onclick="openProductEditModal(${p.id})" title="Edit Details"><i class="ri-edit-line"></i></button>
        </td>
      </tr>
    `;
  }).join('');
}

function toggleProductStock(productId) {
  const p = (window.products || []).find(item => item.id == productId);
  if (!p) return;
  const current = p.inStock !== false;
  p.inStock = !current;

  try {
    const saved = JSON.parse(localStorage.getItem('weebfour_stock_overrides') || '{}');
    saved[p.id] = p.inStock;
    localStorage.setItem('weebfour_stock_overrides', JSON.stringify(saved));
  } catch (e) {}

  if (typeof renderAdminProductsList === 'function') renderAdminProductsList();
  if (typeof renderProductFeed === 'function') renderProductFeed();
  if (typeof updateProductPageStock === 'function') updateProductPageStock();

  showToast(`Stock updated: "${p.name}" is now ${p.inStock ? 'IN STOCK' : 'OUT OF STOCK'}`);
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
    if (catInput) catInput.value = 'tshirts';
    if (tagInput) tagInput.value = 'NEW DROP';
    if (priceInput) priceInput.value = '999';
    if (compInput) compInput.value = '1999';
    if (sizesInput) sizesInput.value = 'S, M, L, XL, XXL';
    if (descInput) descInput.value = '';
    currentEditingImages = [];
  }

  renderEditingProductImages();
  if (overlay) {
    pausePageScroll();
    overlay.classList.add('active');
  }
}

function closeProductEditModal() {
  const overlay = document.getElementById('product-edit-overlay');
  if (overlay && overlay.classList.contains('active')) {
    overlay.classList.remove('active');
    resumePageScroll();
  }
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

// Client-side image compression utility
// Resizes large photos and compresses to fast, mobile-optimized format (prevents lag and memory hang on mobile phones)
function compressImageFile(file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) {
  return new Promise((resolve) => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.onerror = () => resolve(null);
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => resolve(e.target.result);
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const format = (file.type === 'image/png' && file.size < 400000) ? 'image/png' : 'image/jpeg';
        const compressedDataUrl = canvas.toDataURL(format, quality);
        resolve(compressedDataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

async function uploadImageToProduct(e) {
  const file = e.target.files[0];
  if (!file) return;
  showToast("Compressing image for mobile optimization...", "ri-loader-4-line");
  try {
    const compressed = await compressImageFile(file, 1200, 1200, 0.8);
    if (compressed) {
      currentEditingImages.push(compressed);
      renderEditingProductImages();
      showToast("Compressed image added!", "ri-checkbox-circle-line");
    }
  } catch (err) {
    const reader = new FileReader();
    reader.onload = (event) => {
      currentEditingImages.push(event.target.result);
      renderEditingProductImages();
    };
    reader.readAsDataURL(file);
  }
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
    currentEditingImages = ['assets/hero_branding_photo.jpg'];
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

  // Persist catalog locally
  localStorage.setItem('weebfour_custom_catalog', JSON.stringify(window.products));
  renderAdminProductsList();
  renderProducts();
  updateCategoryCardBackgrounds();

  // Save product to Supabase cloud database
  if (supabaseClient) {
    const itemPayload = {
      name,
      category,
      tag,
      price,
      compare_at_price: compareAtPrice,
      sizes,
      description,
      images: [...currentEditingImages]
    };
    if (idInput && idInput.value) {
      itemPayload.id = parseInt(idInput.value);
    }
    supabaseClient.from('products').upsert(itemPayload).then(({ error }) => {
      if (error) console.error("Supabase product save error:", error);
      else console.log("Product synced to Supabase successfully!");
    });
  }

  closeProductEditModal();
}

function deleteAdminProduct(productId) {
  if (confirm("Are you sure you want to delete this product from the storefront?")) {
    window.products = window.products.filter(p => p.id !== productId);
    localStorage.setItem('weebfour_custom_catalog', JSON.stringify(window.products));
    renderAdminProductsList();
    renderProducts();
    updateCategoryCardBackgrounds();

    // Delete from Supabase cloud database
    if (supabaseClient) {
      supabaseClient.from('products').delete().eq('id', productId).then(({ error }) => {
        if (error) console.error("Supabase product delete error:", error);
      });
    }
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

// Admin Tab 4: Image Upload Handling with Mobile Auto-Compression
async function handleImageFileUpload(e, type) {
  const file = e.target.files[0];
  if (!file) return;

  showToast("Compressing image for mobile optimization...", "ri-loader-4-line");
  const compressed = await compressImageFile(file, 1600, 1600, 0.82);
  const dataUrl = compressed || URL.createObjectURL(file);

  if (type === 'hero-bg') {
    const urlInput = document.getElementById('admin-hero-bg-url');
    const prev = document.getElementById('admin-hero-bg-preview');
    if (urlInput) urlInput.value = dataUrl;
    if (prev) prev.src = dataUrl;
    showToast("Hero image compressed & set!", "ri-checkbox-circle-line");
  } else if (type === 'logo') {
    const urlInput = document.getElementById('admin-logo-url');
    const prev = document.getElementById('admin-logo-preview');
    if (urlInput) urlInput.value = dataUrl;
    if (prev) prev.src = dataUrl;
    showToast("Logo optimized & set!", "ri-checkbox-circle-line");
  }
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

// ==========================================================================
// 17. ADMIN CUSTOMER CONTACTS & LEADS SUITE
// Live access to customer names, phone numbers, emails & orders
// ==========================================================================
window.allAdminContacts = [];

async function loadAndRenderAdminContacts() {
  const tbody = document.getElementById('admin-contacts-table-body');
  if (tbody) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--color-text-muted); padding: 20px;"><i class="ri-loader-4-line" style="animation: spin 1s infinite linear;"></i> Fetching customer contacts from database...</td></tr>`;
  }

  let contactsMap = new Map();

  // 1. Read from Supabase orders table
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        data.forEach(item => {
          const key = (item.customer_phone || '') + '_' + (item.customer_email || '');
          contactsMap.set(key, {
            id: item.id,
            name: item.customer_name || 'Customer',
            phone: item.customer_phone || '',
            email: item.customer_email || '',
            status: item.status || 'LEAD_CAPTURED',
            total_amount: item.total_amount || 0,
            items: item.items || [],
            created_at: item.created_at || new Date().toISOString(),
            source: 'Database Order'
          });
        });
      }
    } catch(err) {
      console.warn("Could not query orders table:", err);
    }

    // Also read phone subscribers
    try {
      const { data: subs } = await supabaseClient.from('subscribers').select('*');
      if (Array.isArray(subs)) {
        subs.forEach(s => {
          const key = s.phone + '_';
          if (!contactsMap.has(key)) {
            contactsMap.set(key, {
              id: `SUB-${s.id}`,
              name: 'SMS VIP Subscriber',
              phone: s.phone,
              email: '',
              status: 'VIP_SUBSCRIBER',
              total_amount: 0,
              items: [],
              created_at: s.created_at || new Date().toISOString(),
              source: 'VIP Drops Phone Signup'
            });
          }
        });
      }
    } catch(e) {}
  }

  // 2. Read locally cached leads
  try {
    const localLeads = JSON.parse(localStorage.getItem('weebfour_customer_leads') || '[]');
    localLeads.forEach(lead => {
      const key = (lead.phone || '') + '_' + (lead.email || '');
      if (!contactsMap.has(key)) {
        contactsMap.set(key, {
          id: lead.id,
          name: lead.name || 'Direct Lead',
          phone: lead.phone || '',
          email: lead.email || '',
          status: lead.status || 'LEAD_CAPTURED',
          total_amount: 0,
          items: [],
          created_at: lead.updated_at || new Date().toISOString(),
          source: 'Live Form Lead'
        });
      }
    });
  } catch(e) {}

  window.allAdminContacts = Array.from(contactsMap.values()).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // Update Metrics
  const totalEl = document.getElementById('metric-total-contacts');
  const confEl = document.getElementById('metric-confirmed-orders');
  const leadEl = document.getElementById('metric-leads-count');

  const totalCount = window.allAdminContacts.length;
  const confCount = window.allAdminContacts.filter(c => c.status === 'CONFIRMED').length;
  const leadCount = totalCount - confCount;

  if (totalEl) totalEl.textContent = totalCount;
  if (confEl) confEl.textContent = confCount;
  if (leadEl) leadEl.textContent = leadCount;

  renderAdminContactsList();
}

function renderAdminContactsList() {
  const tbody = document.getElementById('admin-contacts-table-body');
  if (!tbody) return;

  const searchInput = document.getElementById('admin-contacts-search');
  const filterSelect = document.getElementById('admin-contacts-filter');

  const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
  const filter = filterSelect ? filterSelect.value : 'all';

  let list = window.allAdminContacts || [];

  if (query) {
    list = list.filter(c => 
      (c.name && c.name.toLowerCase().includes(query)) ||
      (c.phone && c.phone.includes(query)) ||
      (c.email && c.email.toLowerCase().includes(query)) ||
      (c.id && c.id.toLowerCase().includes(query))
    );
  }

  if (filter === 'confirmed') {
    list = list.filter(c => c.status === 'CONFIRMED');
  } else if (filter === 'leads') {
    list = list.filter(c => c.status !== 'CONFIRMED');
  }

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--color-text-muted); padding: 28px;">No customer contacts match your filter.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(c => {
    const isConfirmed = c.status === 'CONFIRMED';
    const cleanPhone = (c.phone || '').replace(/\D/g, '');
    const dateStr = c.created_at ? new Date(c.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent';

    const waText = encodeURIComponent(`Hi ${c.name || 'there'}! This is WEEB FOUR Streetwear support. Regarding your order/inquiry...`);

    return `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 32px; height: 32px; border-radius: 50%; background: ${isConfirmed ? 'rgba(0, 214, 108, 0.15)' : 'rgba(255, 170, 0, 0.15)'}; color: ${isConfirmed ? '#00d66c' : '#ffaa00'}; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem;">
              ${(c.name || 'C').charAt(0).toUpperCase()}
            </div>
            <div>
              <strong style="color: #ffffff; font-size: 0.95rem;">${c.name || 'Customer'}</strong>
              <div style="font-size: 0.75rem; color: var(--color-text-muted);">${c.id}</div>
            </div>
          </div>
        </td>
        <td>
          ${c.phone && c.phone !== 'N/A' ? `
            <div style="display: flex; align-items: center; gap: 6px;">
              <a href="tel:${cleanPhone}" style="color: var(--color-foreground); font-weight: 600; text-decoration: none;">+91 ${cleanPhone}</a>
            </div>
          ` : '<span style="color: var(--color-text-muted);">Not provided</span>'}
        </td>
        <td>
          ${c.email && c.email !== 'N/A' ? `
            <a href="mailto:${c.email}?subject=Your%20WEEB%20FOUR%20Order&body=Hi%20${encodeURIComponent(c.name || 'Customer')}," style="color: var(--color-foreground); text-decoration: underline; text-decoration-color: rgba(255,255,255,0.3); font-size: 0.88rem;">
              ${c.email}
            </a>
          ` : '<span style="color: var(--color-text-muted);">Not provided</span>'}
        </td>
        <td>
          <span class="badge ${isConfirmed ? 'badge-confirmed' : 'badge-lead'}" style="font-size: 0.75rem; padding: 4px 8px; border-radius: 4px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; ${isConfirmed ? 'background: rgba(0, 214, 108, 0.15); color: #00d66c;' : 'background: rgba(255, 170, 0, 0.15); color: #ffaa00;'}">
            <i class="${isConfirmed ? 'ri-checkbox-circle-fill' : 'ri-time-line'}"></i>
            ${isConfirmed ? 'CONFIRMED' : 'LEAD CAPTURED'}
          </span>
        </td>
        <td>
          <strong style="color: #ffffff;">₹${(c.total_amount || 0).toLocaleString('en-IN')}</strong>
          ${c.items && c.items.length ? `<div style="font-size: 0.75rem; color: var(--color-text-muted);">${c.items.length} item(s)</div>` : ''}
        </td>
        <td style="font-size: 0.82rem; color: var(--color-text-muted);">${dateStr}</td>
        <td>
          <div style="display: flex; gap: 6px;">
            ${cleanPhone ? `
              <a href="https://wa.me/91${cleanPhone}?text=${waText}" target="_blank" class="btn btn-sm btn-secondary" title="Chat on WhatsApp" style="color: #25D366; padding: 4px 8px;">
                <i class="ri-whatsapp-line"></i>
              </a>
              <a href="tel:${cleanPhone}" class="btn btn-sm btn-secondary" title="Call Customer" style="padding: 4px 8px;">
                <i class="ri-phone-line"></i>
              </a>
            ` : ''}
            ${c.email && c.email !== 'N/A' ? `
              <a href="mailto:${c.email}?subject=Your%20WEEB%20FOUR%20Streetwear%20Order&body=Hi%20${encodeURIComponent(c.name || 'Customer')}," class="btn btn-sm btn-secondary" title="Email Customer" style="padding: 4px 8px;">
                <i class="ri-mail-line"></i>
              </a>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function exportContactsCSV() {
  const list = window.allAdminContacts || [];
  if (list.length === 0) {
    alert("No contacts to export yet.");
    return;
  }

  const headers = ['Order / Lead ID', 'Customer Name', 'Phone Number', 'Email Address', 'Status', 'Total Amount', 'Created Date'];
  const rows = list.map(c => [
    `"${c.id || ''}"`,
    `"${(c.name || '').replace(/"/g, '""')}"`,
    `"${c.phone || ''}"`,
    `"${c.email || ''}"`,
    `"${c.status || ''}"`,
    `"${c.total_amount || 0}"`,
    `"${c.created_at || ''}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `weebfour_customer_contacts_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function saveEmailJSConfig() {
  const keyInput = document.getElementById('admin-emailjs-key');
  const serviceInput = document.getElementById('admin-emailjs-service');
  const templateInput = document.getElementById('admin-emailjs-template');

  if (keyInput) localStorage.setItem('weebfour_emailjs_public_key', keyInput.value.trim());
  if (serviceInput) localStorage.setItem('weebfour_emailjs_service_id', serviceInput.value.trim() || 'service_weebfour');
  if (templateInput) localStorage.setItem('weebfour_emailjs_template_id', templateInput.value.trim() || 'template_order_confirm');

  showToast("Email configuration saved successfully!", "ri-checkbox-circle-line");
}

function sendTestConfirmationEmail() {
  const dummyOrder = {
    id: `TEST-${Math.floor(1000 + Math.random() * 9000)}`,
    customer_name: "Selvin Doss",
    customer_email: "weebfour.4@gmail.com",
    customer_phone: "6381177617",
    total_amount: 999,
    payment_method: "Cashfree Payment Gateway (Test Mode)",
    shipping_address: {
      street: "Store HQ Test Street",
      city: "Hosur",
      state: "Tamil Nadu",
      pincode: "635126"
    },
    items: [
      { name: "Tokyo Cyber Heavyweight Tee", size: "L", quantity: 1, price: 999 }
    ]
  };

  sendCustomerOrderEmail(dummyOrder);
  showToast("Test confirmation email triggered to weebfour.4@gmail.com!", "ri-mail-send-line");
}

// ==========================================================================
// 20. FUTURISTIC CYBERNETIC PARTICLES & INTERACTIVE MATRIX CANVAS
// ==========================================================================
function initFuturisticCyberMatrix() {
  const canvas = document.getElementById('cyber-matrix-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = canvas.width = canvas.parentElement.offsetWidth || window.innerWidth;
  let height = canvas.height = canvas.parentElement.offsetHeight || 600;

  function resize() {
    if (!canvas.parentElement) return;
    width = canvas.width = canvas.parentElement.offsetWidth || window.innerWidth;
    height = canvas.height = canvas.parentElement.offsetHeight || 600;
  }
  window.addEventListener('resize', resize);

  const particleCount = Math.min(65, Math.floor((width * height) / 12000));
  const particles = [];
  const mouse = { x: -1000, y: -1000, radius: 140 };

  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.75,
      vy: (Math.random() - 0.5) * 0.75,
      size: Math.random() * 2 + 1,
      baseColor: Math.random() > 0.3 ? 'rgba(0, 242, 254, ' : 'rgba(255, 42, 81, ',
      alpha: Math.random() * 0.5 + 0.3
    });
  }

  let isVisible = true;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isVisible = entry.isIntersecting;
      if (isVisible) loop();
    });
  }, { threshold: 0.1 });
  observer.observe(canvas);

  function loop() {
    if (!isVisible) return;
    ctx.clearRect(0, 0, width, height);

    // Draw connecting electric filaments
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 110) {
          const lineAlpha = (1 - dist / 110) * 0.28;
          ctx.strokeStyle = `rgba(0, 242, 254, ${lineAlpha})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // Update and draw particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      // Mouse repulsion / cyber disturbance
      const mdx = p.x - mouse.x;
      const mdy = p.y - mouse.y;
      const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
      if (mdist < mouse.radius) {
        const force = (1 - mdist / mouse.radius) * 3;
        p.x += (mdx / mdist) * force;
        p.y += (mdy / mdist) * force;
      }

      ctx.fillStyle = p.baseColor + p.alpha + ')';
      ctx.shadowColor = '#00f2fe';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    requestAnimationFrame(loop);
  }

  loop();
}

// ==========================================================================
// 17. LENIS SMOOTH SCROLL (EXACT SMARTNESTS.IN ARCHITECTURE)
// ==========================================================================
let masterLenis = null;

function initLenisSmoothScroll() {
  if (typeof Lenis === 'undefined') return;

  // On touch mobile devices, native hardware-accelerated momentum scrolling provides
  // 120Hz fluid gestures, zero lag, and prevents touch scroll locking.
  const isTouchMobile = (('ontouchstart' in window) || (navigator.maxTouchPoints > 0)) && window.innerWidth <= 820;
  if (isTouchMobile) {
    console.log("Mobile touch device: Native momentum scrolling active for optimal responsiveness.");
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.config({ ignoreMobileResize: true });
    }
    return;
  }

  try {
    masterLenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 0, // Never hijack native touch
      smoothTouch: false,
      infinite: false,
      prevent: (node) => {
        return (
          node.hasAttribute('data-lenis-prevent') ||
          node.closest('[data-lenis-prevent]') !== null ||
          node.closest('.admin-panel-content') !== null ||
          node.closest('.master-admin-box') !== null ||
          node.closest('.admin-auth-box') !== null ||
          node.closest('.cart-drawer') !== null ||
          node.closest('.mobile-menu-drawer') !== null ||
          node.closest('.checkout-modal-box') !== null ||
          node.closest('.quick-view-box') !== null
        );
      }
    });

    window.masterLenis = masterLenis;

    // Synchronize Lenis with GSAP ScrollTrigger using SINGLE unified RAF ticker
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
      masterLenis.on('scroll', ScrollTrigger.update);

      gsap.ticker.add((time) => {
        masterLenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) {
        masterLenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }
    console.log("Lenis Smooth Scrolling initialized.");
  } catch (err) {
    console.warn("Could not initialize Lenis:", err);
  }
}


// ==========================================================================
// 19. THELASTAPE.IN QUICK-ADD SIZE SELECTOR & TOAST SYSTEM
// ==========================================================================
function quickAddWithSize(event, productId, size) {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }

  const product = (window.products || []).find(p => String(p.id) === String(productId) || Number(p.id) === Number(productId));
  if (!product) return;

  addToCart(product, size, 1);
  openCartDrawer();
}

function showToast(message, iconClass = 'ri-checkbox-circle-fill') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.innerHTML = `
    <i class="${iconClass}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Trigger enter animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  // Auto remove after 3.2 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 400);
  }, 3200);
}




// ==========================================================================
// 19. STANDALONE PRODUCT PAGE CONTROLLER (PRODUCT.HTML)
// Handles full-page product view matching thelastape.in
// ==========================================================================
let currentProductItem = null;
let currentProductSelectedSize = 'M';
let currentProductQty = 1;

function initProductDetailPage() {
  // Only execute on product.html
  const pageContainer = document.getElementById('product-detail-view');
  if (!pageContainer) return;

  const params = new URLSearchParams(window.location.search);
  const rawId = params.get('id');
  let product = null;
  if (rawId) {
    product = (window.products || []).find(p => String(p.id) === String(rawId) || Number(p.id) === Number(rawId));
  }
  if (!product && window.products && window.products.length > 0) {
    product = window.products[0];
  }

  if (!product) {
    document.title = `DROPS COMING SOON | WEEBFOUR`;
    pageContainer.innerHTML = `
      <div class="page-container" style="padding: 100px 20px; text-align: center; min-height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <span class="sale-pill-badge" style="background: var(--color-muted-red); margin-bottom: 16px; font-size: 0.85rem; padding: 6px 14px;">WEEBFOUR VAULT</span>
        <h1 style="font-size: 2.2rem; font-weight: 900; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 12px; color: #fff;">NEW DROPS DROPPING SHORTLY</h1>
        <p style="color: #999; max-width: 500px; margin-bottom: 28px; line-height: 1.6; font-size: 0.95rem;">Our exclusive collections are currently being prepared. Check back soon or visit the shop for latest updates.</p>
        <a href="index.html#shop" class="btn btn-primary" style="background: var(--color-muted-red); color: #fff; padding: 14px 28px; border-radius: 4px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; text-decoration: none;">EXPLORE THE SHOP &rarr;</a>
      </div>
    `;
    return;
  }
  currentProductItem = product;
  currentProductSelectedSize = (product.sizes && product.sizes.length > 0) ? product.sizes[0] : 'M';
  currentProductQty = 1;

  // Title and breadcrumbs
  document.title = `${product.name} | WEEBFOUR`;
  const crumbCat = document.getElementById('p-crumb-category');
  if (crumbCat) {
    crumbCat.textContent = (product.category || 'DROPS').toUpperCase();
    crumbCat.href = `index.html#shop`;
  }
  const crumbTitle = document.getElementById('p-crumb-name');
  if (crumbTitle) crumbTitle.textContent = product.name;

  // Main Image and Badges
  const mainImg = document.getElementById('p-main-img');
  if (mainImg) mainImg.src = product.images[0];
  
  const discountBadge = document.getElementById('p-badge-discount');
  const discount = product.compareAtPrice ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100) : 0;
  if (discountBadge) {
    if (discount > 0) {
      discountBadge.style.display = 'inline-block';
      discountBadge.textContent = `-${discount}% OFF`;
    } else {
      discountBadge.style.display = 'none';
    }
  }

  // Thumbnails Strip
  const thumbsContainer = document.getElementById('p-thumbs-strip');
  if (thumbsContainer && product.images) {
    thumbsContainer.innerHTML = product.images.map((img, idx) => `
      <button type="button" class="p-thumb-btn ${idx === 0 ? 'active' : ''}" onclick="selectProductPageImage('${img}', this)">
        <img src="${img}" alt="${product.name} view ${idx + 1}">
      </button>
    `).join('');
  }

  // Product Header & Pricing
  const titleEl = document.getElementById('p-title');
  if (titleEl) titleEl.textContent = product.name;

  const priceEl = document.getElementById('p-price');
  if (priceEl) priceEl.textContent = `₹${product.price.toLocaleString('en-IN')}`;

  const compPriceEl = document.getElementById('p-compare-price');
  if (compPriceEl) {
    if (product.compareAtPrice && product.compareAtPrice > product.price) {
      compPriceEl.style.display = 'inline';
      compPriceEl.textContent = `₹${product.compareAtPrice.toLocaleString('en-IN')}`;
    } else {
      compPriceEl.style.display = 'none';
    }
  }

  const saveAmtEl = document.getElementById('p-save-amount-text');
  if (saveAmtEl && product.compareAtPrice && product.compareAtPrice > product.price) {
    saveAmtEl.textContent = `Save ₹${(product.compareAtPrice - product.price).toLocaleString('en-IN')} (${discount}% OFF)`;
    saveAmtEl.style.display = 'inline-block';
  } else if (saveAmtEl) {
    saveAmtEl.style.display = 'none';
  }

  // Size Picker
  const sizeLabel = document.getElementById('p-selected-size-label');
  if (sizeLabel) sizeLabel.textContent = currentProductSelectedSize;

  const sizesContainer = document.getElementById('p-sizes-container');
  if (sizesContainer) {
    const availableSizes = (product.sizes && product.sizes.length > 0) ? product.sizes : ['S', 'M', 'L', 'XL', 'XXL'];
    sizesContainer.innerHTML = availableSizes.map((s, idx) => `
      <button type="button" class="p-size-chip ${s === currentProductSelectedSize ? 'selected' : ''}" onclick="selectProductPageSize('${s}', this)">
        ${s}
      </button>
    `).join('');
  }

  // Stock Availability Status & Purchase Buttons
  updateProductPageStock();

  // Descriptions
  const descEl = document.getElementById('p-desc-text');
  if (descEl) {
    descEl.textContent = product.description || "Cut from ultra-heavyweight 280-420 GSM combed French Terry cotton. Designed with dropped shoulders, structured boxy silhouette, and architectural tailoring built to outlast seasons.";
  }

  // Mobile Sticky Bar
  const stickyPrice = document.getElementById('sticky-p-price');
  if (stickyPrice) stickyPrice.textContent = `₹${product.price.toLocaleString('en-IN')}`;

  // Related Products
  renderRelatedProducts(product);
}

function updateProductPageStock() {
  if (!currentProductItem) return;
  const isAvailable = currentProductItem.inStock !== false;
  const stockIndicator = document.getElementById('p-stock-indicator');
  const stockText = document.getElementById('p-stock-text');
  const addBagBtn = document.querySelector('.p-add-bag-btn');
  const buyNowBtn = document.querySelector('.p-buy-now-btn');

  if (stockIndicator) {
    if (isAvailable) {
      stockIndicator.className = 'p-stock-indicator in-stock';
      if (stockText) stockText.textContent = 'In Stock • Ready to Dispatch';
    } else {
      stockIndicator.className = 'p-stock-indicator out-of-stock';
      if (stockText) stockText.textContent = 'Currently Out of Stock / Sold Out';
    }
  }

  if (addBagBtn) {
    if (isAvailable) {
      addBagBtn.disabled = false;
      addBagBtn.classList.remove('btn-disabled-soldout');
      addBagBtn.innerHTML = '<i class="ri-shopping-bag-3-line"></i> ADD TO BAG';
    } else {
      addBagBtn.disabled = true;
      addBagBtn.classList.add('btn-disabled-soldout');
      addBagBtn.innerHTML = '<i class="ri-close-circle-line"></i> SOLD OUT';
    }
  }

  if (buyNowBtn) {
    if (isAvailable) {
      buyNowBtn.disabled = false;
      buyNowBtn.classList.remove('btn-disabled-soldout');
      buyNowBtn.innerHTML = '<i class="ri-flashlight-fill"></i> BUY IT NOW';
    } else {
      buyNowBtn.disabled = true;
      buyNowBtn.classList.add('btn-disabled-soldout');
      buyNowBtn.innerHTML = 'OUT OF STOCK';
    }
  }
}

function selectProductPageImage(src, btn) {
  const mainImg = document.getElementById('p-main-img');
  if (mainImg) mainImg.src = src;
  document.querySelectorAll('.p-thumb-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

function selectProductPageSize(size, btn) {
  currentProductSelectedSize = size;
  const label = document.getElementById('p-selected-size-label');
  if (label) label.textContent = size;
  document.querySelectorAll('.p-size-chip').forEach(b => b.classList.remove('selected'));
  if (btn) btn.classList.add('selected');
}

function adjustProductPageQty(delta) {
  currentProductQty = Math.max(1, currentProductQty + delta);
  const qtyEl = document.getElementById('p-qty-val');
  if (qtyEl) qtyEl.value = currentProductQty;
}

function addProductToCart() {
  if (!currentProductItem) return;
  addToCart(currentProductItem, currentProductSelectedSize, currentProductQty);
  openCartDrawer();
}

function buyProductNow() {
  if (!currentProductItem) return;
  addToCart(currentProductItem, currentProductSelectedSize, currentProductQty);
  openCheckoutModal();
}

function renderRelatedProducts(currentProduct) {
  const container = document.getElementById('related-products-grid');
  if (!container) return;

  const related = (window.products || [])
    .filter(p => p.id !== currentProduct.id)
    .slice(0, 4);

  container.innerHTML = related.map(item => `
    <div class="product-card">
      <div class="card-media-box" onclick="window.location.href='product.html?id=${item.id}'" style="cursor: pointer;">
        <img src="${item.images[0]}" alt="${item.name}" class="card-img-main">
      </div>
      <div class="card-info-wrap">
        <span class="card-brand-tag">WEEBFOUR</span>
        <h3 class="card-product-title" onclick="window.location.href='product.html?id=${item.id}'" style="cursor: pointer;">${item.name}</h3>
        <div class="card-price-row">
          <span class="card-sale-price">₹${item.price.toLocaleString('en-IN')}</span>
          ${item.compareAtPrice ? `<span class="card-compare-price">₹${item.compareAtPrice.toLocaleString('en-IN')}</span>` : ''}
        </div>
      </div>
    </div>
  `).join('');
}

// Auto-initialize Product Page or Cart Page on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initProductDetailPage();
  initStandaloneCartPage();
});

// Standalone Cart Page (cart.html)
function initStandaloneCartPage() {
  const cartGrid = document.getElementById('cart-page-items');
  if (!cartGrid) return;
  renderStandaloneCart();
}

function renderStandaloneCart() {
  const container = document.getElementById('cart-page-items');
  const subtotalEl = document.getElementById('cart-page-subtotal');
  const totalEl = document.getElementById('cart-page-total');
  const emptyView = document.getElementById('cart-page-empty');
  const contentGrid = document.getElementById('cart-page-grid');

  if (!container) return;

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (cart.length === 0) {
    if (emptyView) emptyView.style.display = 'block';
    if (contentGrid) contentGrid.style.display = 'none';
    return;
  }

  if (emptyView) emptyView.style.display = 'none';
  if (contentGrid) contentGrid.style.display = 'grid';

  container.innerHTML = cart.map((item, idx) => `
    <div class="cart-item-row" style="padding: 20px 0;">
      <img src="${item.image}" alt="${item.name}" class="cart-item-thumb" style="width: 90px; height: 115px;">
      <div class="cart-item-info">
        <h4 style="font-size: 1.3rem;">${item.name}</h4>
        <div class="cart-item-size">SIZE: <strong>${item.size}</strong></div>
        <div class="cart-qty-stepper">
          <button type="button" class="qty-step-btn" onclick="adjustCartQty(${idx}, -1)" aria-label="Decrease quantity">-</button>
          <input type="number" class="qty-number-input" min="1" max="99" value="${item.quantity}" onchange="setCartItemQty(${idx}, this.value)" aria-label="Item quantity">
          <button type="button" class="qty-step-btn" onclick="adjustCartQty(${idx}, 1)" aria-label="Increase quantity">+</button>
        </div>
      </div>
      <div class="cart-item-right">
        <span class="cart-item-price" style="font-size: 1.2rem;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</span>
        <button type="button" class="cart-item-delete" onclick="removeCartItem(${idx})" title="Remove item" aria-label="Remove item">
          <i class="ri-delete-bin-line" style="font-size: 1.4rem;"></i>
        </button>
      </div>
    </div>
  `).join('');

  if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
  if (totalEl) totalEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
}
