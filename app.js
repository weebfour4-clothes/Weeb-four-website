// ==========================================
// WEEBFOUR (WEB4!) - MASTER STOREFRONT & ADMIN CONTROLLER
// Ultra-Smooth, Fast, Full Admin Control for Photos, Offers, Names, & Words
// ==========================================

// 1. Application State
let cart = [];
let activeCategory = 'all';
let searchQuery = '';
let currentSort = 'default';
let selectedQuickViewProduct = null;
let selectedSize = '';
let activeDiscount = 0.0;
let isAdminAuthenticated = false;

// 2. DOM Elements
const productGrid = document.getElementById('product-grid-container');
const emptyState = document.getElementById('empty-state');
const filterTabs = document.querySelectorAll('.filter-tab');
const collectionCards = document.querySelectorAll('.collection-card');
const sortSelector = document.getElementById('sort-selector');
const filterBadgesContainer = document.getElementById('filter-badges');
const badgesList = document.getElementById('badges-list');
const clearAllFiltersBtn = document.getElementById('clear-all-filters');

// Search elements
const searchToggleBtn = document.getElementById('search-toggle-btn');
const searchOverlay = document.getElementById('search-overlay');
const searchCloseBtn = document.getElementById('search-close-btn');
const catalogSearch = document.getElementById('catalog-search');

// Cart Drawer elements
const cartDrawer = document.getElementById('cart-drawer');
const cartOverlay = document.getElementById('cart-overlay');
const cartToggleBtn = document.getElementById('cart-toggle-btn');
const mobileCartBtn = document.getElementById('mobile-cart-btn');
const cartCloseBtn = document.getElementById('cart-close-btn');
const cartItemsContainer = document.getElementById('cart-items-container');
const cartCountHeader = document.getElementById('cart-count-header');
const cartBadge = document.querySelector('.cart-badge');
const cartBadgeMobile = document.querySelector('.cart-badge-mobile');
const cartSubtotalVal = document.getElementById('cart-subtotal-val');
const shippingMessage = document.getElementById('shipping-message');
const shippingProgress = document.getElementById('shipping-progress');
const goToCheckoutBtn = document.getElementById('go-to-checkout-btn');

// Quick View Modal elements
const quickViewOverlay = document.getElementById('quick-view-overlay');
const quickViewClose = document.getElementById('quick-view-close');
const qvMainImg = document.getElementById('qv-main-img');
const qvThumbnailsContainer = document.getElementById('qv-thumbnails-container');
const qvTag = document.getElementById('qv-tag');
const qvTitle = document.getElementById('qv-title');
const qvPrice = document.getElementById('qv-price');
const qvComparePrice = document.getElementById('qv-compare-price');
const qvDiscountPercent = document.getElementById('qv-discount-percent');
const qvDescription = document.getElementById('qv-description');
const qvSizeOptions = document.getElementById('qv-size-options');
const qvAddToCartBtn = document.getElementById('qv-add-to-cart-btn');
const sizeError = document.getElementById('size-error');

// Size Chart elements
const sizeChartOverlay = document.getElementById('size-chart-overlay');
const sizeChartClose = document.getElementById('size-chart-close');
const sizeChartToggle = document.getElementById('size-chart-toggle');

// Checkout Modal elements
const checkoutModalOverlay = document.getElementById('checkout-modal-overlay');
const checkoutClose = document.getElementById('checkout-close');
const step1Form = document.getElementById('shipping-form');
const step1Panel = document.getElementById('checkout-step-1');
const step2Panel = document.getElementById('checkout-step-2');
const step3Panel = document.getElementById('checkout-step-3');
const payAmountSpan = document.getElementById('pay-button-amount');
const checkoutPayBtn = document.getElementById('checkout-pay-btn');
const checkoutBackBtn = document.getElementById('checkout-back-btn');
const checkoutSuccessContinue = document.getElementById('checkout-success-continue');
const confirmedOrderId = document.getElementById('confirmed-order-id');

// Checkout summary elements
const checkoutItemsList = document.getElementById('checkout-items-list');
const coSubtotal = document.getElementById('co-subtotal');
const coShipping = document.getElementById('co-shipping');
const coDiscountRow = document.getElementById('co-discount-row');
const coDiscount = document.getElementById('co-discount');
const coTotal = document.getElementById('co-total');
const promoCodeInput = document.getElementById('promo-code');
const promoApplyBtn = document.getElementById('promo-apply-btn');
const promoMessage = document.getElementById('promo-message');

// Steps indicator
const stepInd1 = document.getElementById('step-ind-1');
const stepInd2 = document.getElementById('step-ind-2');
const stepInd3 = document.getElementById('step-ind-3');
const stepLine1 = document.getElementById('step-line-1');
const stepLine2 = document.getElementById('step-line-2');

// Newsletter elements
const newsletterForm = document.getElementById('newsletter-form');
const newsletterSuccess = document.getElementById('newsletter-success');

// Mobile Bottom Nav elements
const mobileNavItems = document.querySelectorAll('.mobile-nav-item');

// Admin Elements
const adminAuthOverlay = document.getElementById('admin-auth-overlay');
const adminSuiteOverlay = document.getElementById('admin-suite-overlay');
const productEditOverlay = document.getElementById('product-edit-overlay');
const authErrorMsg = document.getElementById('auth-error-msg');
const adminPasscodeInput = document.getElementById('admin-passcode');

// Temporary image array for product edit
let currentEditingImages = [];

// ==========================================
// 3. INITIALIZE STOREFRONT
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
  applySiteConfigToStorefront();
  renderProducts();
  setupEventListeners();
});

// Apply custom words, titles, photos & offers across the entire website
function applySiteConfigToStorefront() {
  if (!window.siteConfig) return;

  const cfg = window.siteConfig;

  // 1. Marquee Ticker Announcements
  const tickerWrap = document.querySelector('.ticker');
  if (tickerWrap && cfg.announcements && cfg.announcements.length > 0) {
    const tickerHtml = cfg.announcements.map(msg => 
      `<span class="ticker-item">${msg}</span>`
    ).join('') + cfg.announcements.map(msg => 
      `<span class="ticker-item">${msg}</span>`
    ).join('');
    tickerWrap.innerHTML = tickerHtml;
  }

  // 2. Hero Words & Headlines
  if (cfg.texts) {
    const heroBadge = document.querySelector('.hero-subtitle');
    if (heroBadge && cfg.texts.heroBadge) heroBadge.textContent = cfg.texts.heroBadge;

    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle && cfg.texts.heroTitle) {
      heroTitle.innerHTML = cfg.texts.heroTitle.replace('\n', '<br>');
    }

    const heroDesc = document.querySelector('.hero-description');
    if (heroDesc && cfg.texts.heroSubtitle) heroDesc.textContent = cfg.texts.heroSubtitle;

    const heroCtas = document.querySelectorAll('.hero-ctas .btn');
    if (heroCtas[0] && cfg.texts.heroCtaPrimary) {
      heroCtas[0].innerHTML = `${cfg.texts.heroCtaPrimary} <i class="ri-arrow-right-line"></i>`;
    }
    if (heroCtas[1] && cfg.texts.heroCtaSecondary) {
      heroCtas[1].innerHTML = `${cfg.texts.heroCtaSecondary} <i class="ri-compass-3-line"></i>`;
    }

    // Collections
    const collTitle = document.querySelector('#collections .section-title');
    if (collTitle && cfg.texts.collectionsTitle) collTitle.textContent = cfg.texts.collectionsTitle;

    const collSub = document.querySelector('#collections .section-subtitle');
    if (collSub && cfg.texts.collectionsSubtitle) collSub.textContent = cfg.texts.collectionsSubtitle;

    // Feed / Catalog
    const catTitle = document.querySelector('#shop .section-title');
    if (catTitle && cfg.texts.catalogTitle) catTitle.textContent = cfg.texts.catalogTitle;

    const catSub = document.querySelector('#shop .section-subtitle');
    if (catSub && cfg.texts.catalogSubtitle) catSub.textContent = cfg.texts.catalogSubtitle;

    // Newsletter
    const newsTitle = document.querySelector('#newsletter .newsletter-content h2');
    if (newsTitle && cfg.texts.newsletterTitle) newsTitle.textContent = cfg.texts.newsletterTitle;

    const newsSub = document.querySelector('#newsletter .newsletter-content p');
    if (newsSub && cfg.texts.newsletterSubtitle) newsSub.textContent = cfg.texts.newsletterSubtitle;

    // Footer
    const footerAbout = document.querySelector('.branding-col p');
    if (footerAbout && cfg.texts.footerAbout) footerAbout.textContent = cfg.texts.footerAbout;

    const storeAddr = document.querySelector('.address-text');
    if (storeAddr && cfg.texts.storeAddress) {
      storeAddr.innerHTML = cfg.texts.storeAddress.replace(/\n/g, '<br>');
    }

    const storeEmail = document.querySelector('.contact-email');
    if (storeEmail && cfg.texts.storeEmail) storeEmail.textContent = cfg.texts.storeEmail;
  }

  // 3. Media & Logos
  if (cfg.media) {
    if (cfg.media.heroBg) {
      const heroSection = document.getElementById('hero');
      if (heroSection) {
        heroSection.style.backgroundImage = `url('${cfg.media.heroBg}')`;
        heroSection.style.backgroundSize = 'cover';
        heroSection.style.backgroundPosition = 'center';
      }
    }
    if (cfg.media.primaryLogo) {
      document.querySelectorAll('.brand-logo-img, .footer-brand-logo').forEach(img => {
        img.src = cfg.media.primaryLogo;
      });
    }
    if (cfg.media.secondarySymbol) {
      document.querySelectorAll('.pill-symbol-img, .cart-logo-icon, .footer-symbol-logo, .admin-logo-badge').forEach(img => {
        img.src = cfg.media.secondarySymbol;
      });
    }
  }
}

// ==========================================
// 4. RENDER PRODUCT GRID (SMOOTH & FAST)
// ==========================================
function renderProducts() {
  let filtered = products.filter(product => {
    const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (currentSort === 'price-low') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (currentSort === 'price-high') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (currentSort === 'popular') {
    filtered.sort((a, b) => (a.tag === 'BEST SELLER' ? -1 : 1));
  }

  if (filtered.length === 0) {
    productGrid.style.display = 'none';
    emptyState.style.display = 'block';
  } else {
    productGrid.style.display = 'grid';
    emptyState.style.display = 'none';
    
    productGrid.innerHTML = filtered.map(product => {
      const discount = Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100);
      const tagHtml = product.tag ? `<div class="product-tag">${product.tag}</div>` : '';
      const displayImg = product.images && product.images.length > 0 ? product.images[0] : 'assets/tee_front_clean.jpg';

      return `
        <div class="product-card" data-id="${product.id}">
          <div class="product-img-box">
            ${tagHtml}
            <img src="${displayImg}" alt="${product.name}" loading="lazy">
            <div class="quick-view-trigger"><i class="ri-eye-line"></i> QUICK VIEW</div>
          </div>
          <div class="product-details">
            <h3 class="product-name">${product.name}</h3>
            <div class="product-price-row">
              <span class="current-price">₹${product.price}</span>
              <span class="compare-price">₹${product.compareAtPrice}</span>
              <span class="discount-pill">${discount}% OFF</span>
            </div>
            <div class="card-actions">
              <button class="btn btn-quick-add" onclick="openQuickView(${product.id})">
                SELECT OPTIONS <i class="ri-arrow-right-line"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach click to card image for quick view
    document.querySelectorAll('.product-img-box, .product-name').forEach(el => {
      el.addEventListener('click', () => {
        const card = el.closest('.product-card');
        const id = parseInt(card.dataset.id);
        openQuickView(id);
      });
    });
  }

  updateFilterBadges();
}

function updateFilterBadges() {
  if (activeCategory === 'all' && searchQuery === '') {
    filterBadgesContainer.style.display = 'none';
    return;
  }

  filterBadgesContainer.style.display = 'flex';
  let badgesHtml = '';

  if (activeCategory !== 'all') {
    badgesHtml += `
      <div class="filter-badge">
        CATEGORY: ${activeCategory.toUpperCase()}
        <i class="ri-close-line" onclick="setCategory('all')"></i>
      </div>
    `;
  }

  if (searchQuery !== '') {
    badgesHtml += `
      <div class="filter-badge">
        SEARCH: "${searchQuery}"
        <i class="ri-close-line" onclick="clearSearch()"></i>
      </div>
    `;
  }

  badgesList.innerHTML = badgesHtml;
}

window.setCategory = function(cat) {
  activeCategory = cat;
  filterTabs.forEach(tab => {
    if (tab.dataset.filter === cat) tab.classList.add('active');
    else tab.classList.remove('active');
  });
  renderProducts();
};

window.clearSearch = function() {
  searchQuery = '';
  catalogSearch.value = '';
  renderProducts();
};

window.resetFilters = function() {
  activeCategory = 'all';
  searchQuery = '';
  currentSort = 'default';
  catalogSearch.value = '';
  sortSelector.value = 'default';
  
  filterTabs.forEach(tab => {
    if (tab.dataset.filter === 'all') tab.classList.add('active');
    else tab.classList.remove('active');
  });
  
  renderProducts();
};

// ==========================================
// 5. SETUP EVENT LISTENERS
// ==========================================
function setupEventListeners() {
  // Navigation tabs filtering
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeCategory = tab.dataset.filter;
      renderProducts();
    });
  });

  // Collections Card Clicks
  collectionCards.forEach(card => {
    card.addEventListener('click', () => {
      const cat = card.dataset.category;
      setCategory(cat);
      const shopEl = document.getElementById('shop');
      if (shopEl) shopEl.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Sort Selector
  sortSelector.addEventListener('change', (e) => {
    currentSort = e.target.value;
    renderProducts();
  });

  // Search Overlay
  searchToggleBtn.addEventListener('click', () => {
    searchOverlay.classList.toggle('active');
    if (searchOverlay.classList.contains('active')) {
      catalogSearch.focus();
    }
  });

  searchCloseBtn.addEventListener('click', () => {
    searchOverlay.classList.remove('active');
  });

  catalogSearch.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderProducts();
  });

  // Cart Drawer open/close
  const toggleCart = () => {
    cartDrawer.classList.toggle('active');
    cartOverlay.classList.toggle('active');
    if (cartDrawer.classList.contains('active')) {
      renderCart();
    }
  };

  cartToggleBtn.addEventListener('click', toggleCart);
  if (mobileCartBtn) mobileCartBtn.addEventListener('click', toggleCart);
  cartCloseBtn.addEventListener('click', toggleCart);
  cartOverlay.addEventListener('click', toggleCart);

  clearAllFiltersBtn.addEventListener('click', resetFilters);

  // Quick View interactions
  quickViewClose.addEventListener('click', closeQuickView);
  quickViewOverlay.addEventListener('click', (e) => {
    if (e.target === quickViewOverlay) closeQuickView();
  });

  // Size Chart
  if (sizeChartToggle) {
    sizeChartToggle.addEventListener('click', (e) => {
      e.preventDefault();
      sizeChartOverlay.classList.add('active');
    });
  }
  if (sizeChartClose) {
    sizeChartClose.addEventListener('click', () => sizeChartOverlay.classList.remove('active'));
  }
  if (sizeChartOverlay) {
    sizeChartOverlay.addEventListener('click', (e) => {
      if (e.target === sizeChartOverlay) sizeChartOverlay.classList.remove('active');
    });
  }

  // Quick view Add to Bag
  qvAddToCartBtn.addEventListener('click', () => {
    if (!selectedSize) {
      sizeError.style.display = 'block';
      return;
    }
    sizeError.style.display = 'none';
    addToCart(selectedQuickViewProduct.id, selectedSize);
    closeQuickView();
    setTimeout(() => {
      cartDrawer.classList.add('active');
      cartOverlay.classList.add('active');
      renderCart();
    }, 300);
  });

  // Checkout Modal
  goToCheckoutBtn.addEventListener('click', () => {
    if (cart.length === 0) return;
    cartDrawer.classList.remove('active');
    cartOverlay.classList.remove('active');
    openCheckout();
  });

  checkoutClose.addEventListener('click', closeCheckout);
  checkoutModalOverlay.addEventListener('click', (e) => {
    if (e.target === checkoutModalOverlay && !step3Panel.classList.contains('active')) {
      closeCheckout();
    }
  });

  // Checkout Step 1 Form
  step1Form.addEventListener('submit', (e) => {
    e.preventDefault();
    step1Panel.classList.remove('active');
    step2Panel.classList.add('active');
    
    stepInd1.classList.remove('active');
    stepInd2.classList.add('active');
    stepLine1.classList.add('active');
    
    updateCheckoutSummary();
  });

  // Payment Selection toggling
  const paymentCards = document.querySelectorAll('.payment-method-card');
  paymentCards.forEach(card => {
    card.addEventListener('click', () => {
      paymentCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    });
  });

  // Back button in Payment screen
  checkoutBackBtn.addEventListener('click', () => {
    step2Panel.classList.remove('active');
    step1Panel.classList.add('active');
    
    stepInd2.classList.remove('active');
    stepInd1.classList.add('active');
    stepLine1.classList.remove('active');
  });

  // Pay / Place Order Click
  checkoutPayBtn.addEventListener('click', () => {
    const randomOrderId = 'WEEB-' + Math.floor(10000 + Math.random() * 90000);
    confirmedOrderId.textContent = randomOrderId;
    
    step2Panel.classList.remove('active');
    step3Panel.classList.add('active');
    
    stepInd2.classList.remove('active');
    stepInd3.classList.add('active');
    stepLine2.classList.add('active');
    
    cart = [];
    activeDiscount = 0.0;
    promoCodeInput.value = '';
    promoMessage.textContent = '';
    updateCartCount();
  });

  checkoutSuccessContinue.addEventListener('click', () => {
    closeCheckout();
  });

  // Promo code validation from siteConfig
  promoApplyBtn.addEventListener('click', () => {
    const code = promoCodeInput.value.trim().toUpperCase();
    const validPromos = window.siteConfig?.offers?.promos || [
      { code: 'WEEB10', discountPercent: 10 },
      { code: 'GENZ10', discountPercent: 10 }
    ];

    const match = validPromos.find(p => p.code.toUpperCase() === code);
    if (match) {
      activeDiscount = match.discountPercent / 100;
      promoMessage.style.color = 'var(--color-success)';
      promoMessage.textContent = `${match.discountPercent}% WEEBFOUR Promo Code Applied!`;
      updateCheckoutSummary();
    } else {
      promoMessage.style.color = 'var(--color-error)';
      promoMessage.textContent = 'Invalid promo code';
    }
  });

  // Newsletter form signup
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    newsletterForm.style.display = 'none';
    newsletterSuccess.style.display = 'flex';
  });

  // Mobile navigation tabs highlight
  mobileNavItems.forEach(item => {
    item.addEventListener('click', () => {
      mobileNavItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });

  // ESC key listener to close modals
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (productEditOverlay && productEditOverlay.classList.contains('active')) {
        closeProductEditModal();
      } else if (adminSuiteOverlay && adminSuiteOverlay.classList.contains('active')) {
        closeAdminSuite();
      } else if (adminAuthOverlay && adminAuthOverlay.classList.contains('active')) {
        closeAdminAuth();
      } else if (quickViewOverlay && quickViewOverlay.classList.contains('active')) {
        closeQuickView();
      }
    }
  });
}

// ==========================================
// 6. CART & BAG CONTROLLERS
// ==========================================
function addToCart(productId, size) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const existingItem = cart.find(item => item.product.id === productId && item.size === size);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      product: product,
      size: size,
      quantity: 1
    });
  }

  updateCartCount();
  animateCartIcon();
}

function updateCartCount() {
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  if (cartBadge) cartBadge.textContent = totalItems;
  if (cartBadgeMobile) cartBadgeMobile.textContent = totalItems;
  if (cartCountHeader) cartCountHeader.textContent = totalItems;
}

function animateCartIcon() {
  const badges = [cartBadge, cartBadgeMobile];
  badges.forEach(badge => {
    if (!badge) return;
    badge.style.transform = 'scale(1.4)';
    setTimeout(() => {
      badge.style.transform = 'scale(1)';
    }, 200);
  });
}

function renderCart() {
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="empty-cart-view">
        <i class="ri-shopping-bag-line"></i>
        <h3>Your shopping bag is empty</h3>
        <p>Explore our latest drops and grails.</p>
        <button class="btn btn-primary" onclick="closeCartDrawer()" style="margin-top: 16px;">CONTINUE SHOPPING</button>
      </div>
    `;
    cartSubtotalVal.textContent = '₹0';
    shippingMessage.textContent = 'Add items to unlock free shipping!';
    shippingProgress.style.width = '0%';
    goToCheckoutBtn.disabled = true;
    goToCheckoutBtn.style.opacity = '0.5';
    return;
  }

  goToCheckoutBtn.disabled = false;
  goToCheckoutBtn.style.opacity = '1';

  let subtotal = 0;
  cartItemsContainer.innerHTML = cart.map((item, index) => {
    const itemTotal = item.product.price * item.quantity;
    subtotal += itemTotal;
    const itemImg = item.product.images && item.product.images.length > 0 ? item.product.images[0] : 'assets/tee_front_clean.jpg';

    return `
      <div class="cart-item">
        <div class="cart-item-img">
          <img src="${itemImg}" alt="${item.product.name}">
        </div>
        <div class="cart-item-info">
          <div class="cart-item-title">${item.product.name}</div>
          <div class="cart-item-meta">SIZE: ${item.size}</div>
          <div class="cart-item-bottom">
            <div class="qty-control">
              <button class="qty-btn" onclick="updateQty(${index}, -1)"><i class="ri-subtract-line"></i></button>
              <span class="qty-count">${item.quantity}</span>
              <button class="qty-btn" onclick="updateQty(${index}, 1)"><i class="ri-add-line"></i></button>
            </div>
            <span class="cart-item-price">₹${itemTotal}</span>
            <button class="remove-item-btn" onclick="removeCartItem(${index})">Remove</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  cartSubtotalVal.textContent = `₹${subtotal}`;
  
  const threshold = window.siteConfig?.offers?.shippingThreshold || SHIPPING_THRESHOLD;
  if (subtotal >= threshold) {
    shippingMessage.innerHTML = `<span style="color: var(--color-primary)"><i class="ri-fire-fill"></i> FREE SHIPPING UNLOCKED!</span>`;
    shippingProgress.style.width = '100%';
  } else {
    const remaining = threshold - subtotal;
    shippingMessage.textContent = `Add ₹${remaining} more for FREE SHIPPING`;
    const percent = Math.min(100, (subtotal / threshold) * 100);
    shippingProgress.style.width = `${percent}%`;
  }
}

window.closeCartDrawer = function() {
  cartDrawer.classList.remove('active');
  cartOverlay.classList.remove('active');
};

window.updateQty = function(index, change) {
  cart[index].quantity += change;
  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }
  updateCartCount();
  renderCart();
};

window.removeCartItem = function(index) {
  cart.splice(index, 1);
  updateCartCount();
  renderCart();
};

// ==========================================
// 7. QUICK VIEW MODAL (SMOOTH & INSTANT)
// ==========================================
window.openQuickView = function(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  selectedQuickViewProduct = product;
  selectedSize = '';
  sizeError.style.display = 'none';

  const mainPhoto = product.images && product.images.length > 0 ? product.images[0] : 'assets/tee_front_clean.jpg';
  qvMainImg.src = mainPhoto;
  qvMainImg.alt = product.name;
  
  qvTag.textContent = product.tag || 'EXCLUSIVE DROP';
  qvTag.style.display = product.tag ? 'inline-block' : 'none';
  
  qvTitle.textContent = product.name;
  qvPrice.textContent = `₹${product.price}`;
  qvComparePrice.textContent = `₹${product.compareAtPrice}`;
  
  const discount = Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100);
  qvDiscountPercent.textContent = `${discount}% OFF`;

  qvDescription.textContent = product.description;

  if (product.images && product.images.length > 1) {
    qvThumbnailsContainer.style.display = 'flex';
    qvThumbnailsContainer.innerHTML = product.images.map((img, i) => 
      `<div class="qv-thumb ${i === 0 ? 'active' : ''}" onclick="switchQvImage(this, '${img}')">
        <img src="${img}" alt="Thumbnail ${i+1}">
      </div>`
    ).join('');
  } else {
    qvThumbnailsContainer.style.display = 'none';
  }

  const sizes = product.sizes || ["S", "M", "L", "XL"];
  qvSizeOptions.innerHTML = sizes.map(size => 
    `<button class="qv-size-btn" onclick="selectSize(this, '${size}')">${size}</button>`
  ).join('');

  quickViewOverlay.classList.add('active');
};

window.switchQvImage = function(thumb, imgSrc) {
  qvMainImg.src = imgSrc;
  document.querySelectorAll('.qv-thumb').forEach(t => t.classList.remove('active'));
  thumb.classList.add('active');
};

window.selectSize = function(btn, size) {
  selectedSize = size;
  sizeError.style.display = 'none';
  document.querySelectorAll('.qv-size-btn').forEach(opt => opt.classList.remove('active'));
  btn.classList.add('active');
};

function closeQuickView() {
  quickViewOverlay.classList.remove('active');
  selectedQuickViewProduct = null;
}

// ==========================================
// 8. MASTER ADMIN CONTROL SUITE (PHOTOS, OFFERS, NAMES, WORDS)
// ==========================================
window.openAdminModal = function() {
  if (isAdminAuthenticated) {
    openAdminSuite();
  } else {
    adminAuthOverlay.classList.add('active');
    authErrorMsg.style.display = 'none';
    adminPasscodeInput.value = '';
    setTimeout(() => adminPasscodeInput.focus(), 100);
  }
};

window.closeAdminAuth = function() {
  adminAuthOverlay.classList.remove('active');
};

window.handleAdminLogin = function(e) {
  e.preventDefault();
  const input = adminPasscodeInput.value.trim();
  // Passcode: "weebfour" or "admin123"
  if (input === 'weebfour' || input === 'admin123') {
    isAdminAuthenticated = true;
    closeAdminAuth();
    openAdminSuite();
  } else {
    authErrorMsg.style.display = 'block';
    adminPasscodeInput.select();
  }
};

window.openAdminSuite = function() {
  adminSuiteOverlay.classList.add('active');
  loadAdminFormValues();
  renderAdminProductsList();
  renderAdminTickerList();
  renderAdminPromosList();
};

window.closeAdminSuite = function() {
  adminSuiteOverlay.classList.remove('active');
};

// Switch Tabs inside Admin
window.switchAdminTab = function(tabName) {
  document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });
  document.querySelectorAll('.admin-tab-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === `admin-panel-${tabName}`);
  });
};

// --- TAB 1: Products List & Actions ---
window.renderAdminProductsList = function() {
  const query = (document.getElementById('admin-product-search')?.value || '').toLowerCase();
  const tbody = document.getElementById('admin-products-table-body');
  if (!tbody) return;

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(query) || 
    (p.tag && p.tag.toLowerCase().includes(query)) ||
    p.category.toLowerCase().includes(query)
  );

  tbody.innerHTML = filtered.map(p => {
    const img = p.images && p.images.length > 0 ? p.images[0] : 'assets/tee_front_clean.jpg';
    const tag = p.tag ? `<span class="table-tag">${p.tag}</span>` : '<span style="color:var(--color-text-dim)">—</span>';
    const sizes = (p.sizes || []).join(', ');

    return `
      <tr>
        <td><img src="${img}" class="table-prod-img" alt="${p.name}"></td>
        <td><div class="table-prod-name">${p.name}</div></td>
        <td><span style="text-transform: uppercase;">${p.category}</span></td>
        <td><strong>₹${p.price}</strong></td>
        <td><span style="color: var(--color-text-dim)">₹${p.compareAtPrice}</span></td>
        <td>${tag}</td>
        <td><span style="font-size: 0.75rem;">${sizes}</span></td>
        <td>
          <div class="table-actions">
            <button class="table-action-btn" onclick="openProductEditModal(${p.id})"><i class="ri-edit-line"></i> Edit</button>
            <button class="table-action-btn btn-delete" onclick="deleteProduct(${p.id})"><i class="ri-delete-bin-line"></i></button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
};

// Add or Edit Product Modal
window.openProductEditModal = function(productId) {
  const modalTitle = document.getElementById('product-modal-title');
  const editId = document.getElementById('edit-prod-id');
  const editName = document.getElementById('edit-prod-name');
  const editCategory = document.getElementById('edit-prod-category');
  const editPrice = document.getElementById('edit-prod-price');
  const editCompare = document.getElementById('edit-prod-compare');
  const editTag = document.getElementById('edit-prod-tag');
  const editDesc = document.getElementById('edit-prod-desc');

  if (productId) {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;
    modalTitle.textContent = `EDIT PRODUCT: ${prod.name}`;
    editId.value = prod.id;
    editName.value = prod.name;
    editCategory.value = prod.category;
    editPrice.value = prod.price;
    editCompare.value = prod.compareAtPrice || prod.price;
    editTag.value = prod.tag || '';
    editDesc.value = prod.description || '';

    // Sizes checkboxes
    const sizes = prod.sizes || [];
    document.querySelectorAll('.size-cb').forEach(cb => {
      cb.checked = sizes.includes(cb.value);
    });

    currentEditingImages = prod.images ? [...prod.images] : [];
  } else {
    // New product
    modalTitle.textContent = "ADD NEW PRODUCT";
    editId.value = "";
    editName.value = "";
    editCategory.value = "tees";
    editPrice.value = "";
    editCompare.value = "";
    editTag.value = "NEW DROP";
    editDesc.value = "";

    document.querySelectorAll('.size-cb').forEach(cb => {
      cb.checked = ["S", "M", "L", "XL"].includes(cb.value);
    });

    currentEditingImages = ["assets/tee_front_clean.jpg"];
  }

  renderProductImageInputs();
  productEditOverlay.classList.add('active');
};

window.closeProductEditModal = function() {
  productEditOverlay.classList.remove('active');
};

function renderProductImageInputs() {
  const container = document.getElementById('product-images-inputs-container');
  if (!container) return;

  container.innerHTML = currentEditingImages.map((imgUrl, i) => `
    <div class="image-input-row">
      <img src="${imgUrl}" class="image-thumb-mini" onerror="this.src='assets/tee_front_clean.jpg'">
      <input type="text" class="admin-form-input" value="${imgUrl}" style="flex: 1;" onchange="updateProductImageUrl(${i}, this.value)">
      <button type="button" class="btn btn-xs btn-secondary" onclick="removeProductImage(${i})" title="Remove photo"><i class="ri-close-line"></i></button>
    </div>
  `).join('');
}

window.addEmptyImageUrlInput = function() {
  currentEditingImages.push("");
  renderProductImageInputs();
};

window.removeProductImage = function(index) {
  currentEditingImages.splice(index, 1);
  if (currentEditingImages.length === 0) {
    currentEditingImages.push("assets/tee_front_clean.jpg");
  }
  renderProductImageInputs();
};

window.updateProductImageUrl = function(index, url) {
  currentEditingImages[index] = url;
  renderProductImageInputs();
};

// Handle uploading a local image file for product photo
window.handleProductImageUpload = function(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    currentEditingImages.push(dataUrl);
    renderProductImageInputs();
  };
  reader.readAsDataURL(file);
};

// Save Product Form
window.handleSaveProductForm = function(e) {
  e.preventDefault();
  const idVal = document.getElementById('edit-prod-id').value;
  const nameVal = document.getElementById('edit-prod-name').value.trim();
  const catVal = document.getElementById('edit-prod-category').value;
  const priceVal = parseInt(document.getElementById('edit-prod-price').value) || 999;
  const compareVal = parseInt(document.getElementById('edit-prod-compare').value) || priceVal * 2;
  const tagVal = document.getElementById('edit-prod-tag').value.trim();
  const descVal = document.getElementById('edit-prod-desc').value.trim();

  // Selected sizes
  const sizes = [];
  document.querySelectorAll('.size-cb:checked').forEach(cb => sizes.push(cb.value));

  // Valid image list
  const validImages = currentEditingImages.filter(url => url.trim() !== '');
  if (validImages.length === 0) validImages.push("assets/tee_front_clean.jpg");

  if (idVal) {
    // Update existing product
    const prodId = parseInt(idVal);
    const idx = products.findIndex(p => p.id === prodId);
    if (idx !== -1) {
      products[idx] = {
        ...products[idx],
        name: nameVal,
        category: catVal,
        price: priceVal,
        compareAtPrice: compareVal,
        tag: tagVal,
        sizes: sizes.length > 0 ? sizes : ["S", "M", "L", "XL"],
        images: validImages,
        description: descVal
      };
    }
  } else {
    // Create brand new product
    const newId = Math.max(...products.map(p => p.id), 0) + 1;
    products.push({
      id: newId,
      name: nameVal,
      category: catVal,
      price: priceVal,
      compareAtPrice: compareVal,
      tag: tagVal,
      sizes: sizes.length > 0 ? sizes : ["S", "M", "L", "XL"],
      images: validImages,
      description: descVal
    });
  }

  // Persist immediately in localStorage
  localStorage.setItem('weebfour_custom_catalog', JSON.stringify(products));

  closeProductEditModal();
  renderAdminProductsList();
  renderProducts();
};

window.deleteProduct = function(productId) {
  const prod = products.find(p => p.id === productId);
  if (!prod) return;

  if (confirm(`Are you sure you want to delete "${prod.name}" from your catalog?`)) {
    products = products.filter(p => p.id !== productId);
    localStorage.setItem('weebfour_custom_catalog', JSON.stringify(products));
    renderAdminProductsList();
    renderProducts();
  }
};

// --- TAB 2: Offers & Promos ---
window.renderAdminTickerList = function() {
  const list = document.getElementById('admin-ticker-list');
  if (!list || !window.siteConfig) return;

  const announcements = window.siteConfig.announcements || [];
  list.innerHTML = announcements.map((msg, i) => `
    <div class="dynamic-row-item">
      <input type="text" value="${msg}" onchange="updateAnnouncementRow(${i}, this.value)">
      <i class="ri-delete-bin-line del-row-btn" onclick="deleteAnnouncementRow(${i})" title="Delete message"></i>
    </div>
  `).join('');
};

window.addNewAnnouncementRow = function() {
  if (!window.siteConfig.announcements) window.siteConfig.announcements = [];
  window.siteConfig.announcements.push("🔥 NEW PROMO ANNOUNCEMENT MESSAGE");
  renderAdminTickerList();
};

window.deleteAnnouncementRow = function(index) {
  window.siteConfig.announcements.splice(index, 1);
  renderAdminTickerList();
};

window.updateAnnouncementRow = function(index, val) {
  window.siteConfig.announcements[index] = val;
};

window.renderAdminPromosList = function() {
  const list = document.getElementById('admin-promos-list');
  if (!list || !window.siteConfig) return;

  const promos = window.siteConfig.offers?.promos || [];
  list.innerHTML = promos.map((p, i) => `
    <div class="dynamic-row-item">
      <strong style="color: var(--color-primary); min-width: 80px;">CODE:</strong>
      <input type="text" value="${p.code}" style="width: 90px; text-transform: uppercase;" onchange="updatePromoCode(${i}, this.value)">
      <span style="font-size: 0.75rem; color: var(--color-text-dim);">DISCOUNT (%):</span>
      <input type="number" value="${p.discountPercent}" style="width: 60px;" min="1" max="100" onchange="updatePromoPercent(${i}, this.value)">
      <i class="ri-delete-bin-line del-row-btn" onclick="deletePromoRow(${i})" title="Delete promo"></i>
    </div>
  `).join('');
};

window.addNewPromoRow = function() {
  if (!window.siteConfig.offers.promos) window.siteConfig.offers.promos = [];
  window.siteConfig.offers.promos.push({ code: "SALE15", discountPercent: 15, description: "Seasonal Sale" });
  renderAdminPromosList();
};

window.deletePromoRow = function(index) {
  window.siteConfig.offers.promos.splice(index, 1);
  renderAdminPromosList();
};

window.updatePromoCode = function(index, code) {
  window.siteConfig.offers.promos[index].code = code.trim().toUpperCase();
};

window.updatePromoPercent = function(index, pct) {
  window.siteConfig.offers.promos[index].discountPercent = parseInt(pct) || 10;
};

// --- TAB 3 & 4: Load Values into Form ---
function loadAdminFormValues() {
  if (!window.siteConfig) return;
  const cfg = window.siteConfig;

  // Shipping
  const shipThresh = document.getElementById('admin-shipping-threshold');
  if (shipThresh) shipThresh.value = cfg.offers?.shippingThreshold || 1499;

  const flatShip = document.getElementById('admin-flat-shipping');
  if (flatShip) flatShip.value = cfg.offers?.flatShippingFee || 150;

  // Words & Texts
  if (cfg.texts) {
    setVal('admin-text-hero-badge', cfg.texts.heroBadge);
    setVal('admin-text-hero-title', cfg.texts.heroTitle);
    setVal('admin-text-hero-desc', cfg.texts.heroSubtitle);
    setVal('admin-text-hero-cta1', cfg.texts.heroCtaPrimary);
    setVal('admin-text-hero-cta2', cfg.texts.heroCtaSecondary);
    setVal('admin-text-collections-title', cfg.texts.collectionsTitle);
    setVal('admin-text-collections-sub', cfg.texts.collectionsSubtitle);
    setVal('admin-text-catalog-title', cfg.texts.catalogTitle);
    setVal('admin-text-catalog-sub', cfg.texts.catalogSubtitle);
    setVal('admin-text-news-title', cfg.texts.newsletterTitle);
    setVal('admin-text-news-sub', cfg.texts.newsletterSubtitle);
    setVal('admin-text-footer-about', cfg.texts.footerAbout);
    setVal('admin-text-store-email', cfg.texts.storeEmail);
    setVal('admin-text-store-addr', cfg.texts.storeAddress);
  }

  // Media URLs & Previews
  if (cfg.media) {
    setVal('admin-media-hero-bg', cfg.media.heroBg);
    setVal('admin-media-logo', cfg.media.primaryLogo);
    setVal('admin-media-symbol', cfg.media.secondarySymbol);

    if (cfg.media.heroBg) document.getElementById('admin-preview-hero-bg').src = cfg.media.heroBg;
    if (cfg.media.primaryLogo) document.getElementById('admin-preview-logo').src = cfg.media.primaryLogo;
    if (cfg.media.secondarySymbol) document.getElementById('admin-preview-symbol').src = cfg.media.secondarySymbol;
  }
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el && val !== undefined) el.value = val;
}

window.updateMediaPreview = function(type, url) {
  if (type === 'hero-bg') document.getElementById('admin-preview-hero-bg').src = url;
  if (type === 'logo') document.getElementById('admin-preview-logo').src = url;
  if (type === 'symbol') document.getElementById('admin-preview-symbol').src = url;
};

// Upload banner / logo from file
window.handleAdminFileUpload = function(event, type) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    if (type === 'hero-bg') {
      document.getElementById('admin-media-hero-bg').value = dataUrl;
      document.getElementById('admin-preview-hero-bg').src = dataUrl;
      window.siteConfig.media.heroBg = dataUrl;
    } else if (type === 'logo') {
      document.getElementById('admin-media-logo').value = dataUrl;
      document.getElementById('admin-preview-logo').src = dataUrl;
      window.siteConfig.media.primaryLogo = dataUrl;
    } else if (type === 'symbol') {
      document.getElementById('admin-media-symbol').value = dataUrl;
      document.getElementById('admin-preview-symbol').src = dataUrl;
      window.siteConfig.media.secondarySymbol = dataUrl;
    }
  };
  reader.readAsDataURL(file);
};

// Save All Admin Changes
window.saveAllAdminChanges = function() {
  if (!window.siteConfig) return;

  // Harvest form values
  const cfg = window.siteConfig;

  // Shipping
  cfg.offers.shippingThreshold = parseInt(document.getElementById('admin-shipping-threshold').value) || 1499;
  cfg.offers.flatShippingFee = parseInt(document.getElementById('admin-flat-shipping').value) || 150;

  // Words & texts
  cfg.texts.heroBadge = document.getElementById('admin-text-hero-badge').value;
  cfg.texts.heroTitle = document.getElementById('admin-text-hero-title').value;
  cfg.texts.heroSubtitle = document.getElementById('admin-text-hero-desc').value;
  cfg.texts.heroCtaPrimary = document.getElementById('admin-text-hero-cta1').value;
  cfg.texts.heroCtaSecondary = document.getElementById('admin-text-hero-cta2').value;
  cfg.texts.collectionsTitle = document.getElementById('admin-text-collections-title').value;
  cfg.texts.collectionsSubtitle = document.getElementById('admin-text-collections-sub').value;
  cfg.texts.catalogTitle = document.getElementById('admin-text-catalog-title').value;
  cfg.texts.catalogSubtitle = document.getElementById('admin-text-catalog-sub').value;
  cfg.texts.newsletterTitle = document.getElementById('admin-text-news-title').value;
  cfg.texts.newsletterSubtitle = document.getElementById('admin-text-news-sub').value;
  cfg.texts.footerAbout = document.getElementById('admin-text-footer-about').value;
  cfg.texts.storeEmail = document.getElementById('admin-text-store-email').value;
  cfg.texts.storeAddress = document.getElementById('admin-text-store-addr').value;

  // Media
  cfg.media.heroBg = document.getElementById('admin-media-hero-bg').value;
  cfg.media.primaryLogo = document.getElementById('admin-media-logo').value;
  cfg.media.secondarySymbol = document.getElementById('admin-media-symbol').value;

  // Persist to localStorage
  try {
    localStorage.setItem('weebfour_site_config', JSON.stringify(cfg));
    localStorage.setItem('weebfour_custom_catalog', JSON.stringify(products));
  } catch (e) {
    console.warn("Could not save to localStorage", e);
  }

  // Update Live Storefront immediately!
  applySiteConfigToStorefront();
  renderProducts();

  alert("SUCCESS: All website texts, photos, offers, and products have been saved & published live!");
};

// Export configuration to JSON file
window.exportAdminData = function() {
  const exportPayload = {
    products: products,
    siteConfig: window.siteConfig,
    exportedAt: new Date().toISOString()
  };

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `weebfour_backup_${Date.now()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

// Reset to factory defaults
window.resetToFactoryDefaults = function() {
  if (confirm("Reset the entire storefront back to factory default products, words, photos, and offers?")) {
    localStorage.removeItem('weebfour_custom_catalog');
    localStorage.removeItem('weebfour_site_config');
    window.location.reload();
  }
};

// ==========================================
// 9. CHECKOUT MODAL FLOW
// ==========================================
function openCheckout() {
  step1Panel.classList.add('active');
  step2Panel.classList.remove('active');
  step3Panel.classList.remove('active');
  
  stepInd1.classList.add('active');
  stepInd2.classList.remove('active');
  stepInd3.classList.remove('active');
  stepLine1.classList.remove('active');
  stepLine2.classList.remove('active');

  renderCheckoutSummaryItems();
  updateCheckoutSummary();
  checkoutModalOverlay.classList.add('active');
}

function closeCheckout() {
  checkoutModalOverlay.classList.remove('active');
}

function renderCheckoutSummaryItems() {
  checkoutItemsList.innerHTML = cart.map(item => `
    <div class="mini-item">
      <span class="mini-item-name">${item.product.name} (${item.size}) x${item.quantity}</span>
      <span class="mini-item-price">₹${item.product.price * item.quantity}</span>
    </div>
  `).join('');
}

function updateCheckoutSummary() {
  const subtotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  coSubtotal.textContent = `₹${subtotal}`;

  const threshold = window.siteConfig?.offers?.shippingThreshold || SHIPPING_THRESHOLD;
  const flatFee = window.siteConfig?.offers?.flatShippingFee || FLAT_SHIPPING_FEE;
  const shipping = subtotal >= threshold ? 0 : flatFee;
  coShipping.textContent = shipping === 0 ? 'FREE' : `₹${shipping}`;

  const discountVal = Math.round(subtotal * activeDiscount);
  if (discountVal > 0) {
    coDiscountRow.style.display = 'flex';
    coDiscount.textContent = `-₹${discountVal}`;
  } else {
    coDiscountRow.style.display = 'none';
  }

  const grandTotal = subtotal + shipping - discountVal;
  coTotal.textContent = `₹${grandTotal}`;
  payAmountSpan.textContent = `₹${grandTotal}`;
}
