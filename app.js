// ==========================================
// WEEBFOUR (WEB4!) - MASTER APPLICATION CONTROLLER
// Includes 3D Garment Studio Engine & Admin Asset Manager
// ==========================================

// 1. Application State
let cart = [];
let activeCategory = 'all';
let searchQuery = '';
let currentSort = 'default';
let selectedQuickViewProduct = null;
let selectedSize = '';
let selectedColor = null;
let activeViewerMode = '3d'; // '3d' or '2d'
let activeDiscount = 0.0; // 0.10 for 10%

// 3D Viewer Singletons
let mainGarmentViewer = null;
let adminGarmentViewer = null;
let fsGarmentViewer = null;
let currentAdminProduct = null;

// Free Shipping Threshold
const SHIPPING_THRESHOLD = 1499;
const FLAT_SHIPPING_FEE = 150;

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

// 3D Viewport elements
const qv3dViewport = document.getElementById('qv-3d-viewport');
const qv2dGalleryWrap = document.getElementById('qv-2d-gallery-wrap');
const qv3dCanvasWrap = document.getElementById('qv-3d-canvas-wrap');
const qv3dLoading = document.getElementById('qv-3d-loading');
const qv3dFallback = document.getElementById('qv-3d-fallback');
const tabMode3D = document.getElementById('tab-mode-3d');
const tabMode2D = document.getElementById('tab-mode-2d');
const qvActiveColorName = document.getElementById('qv-active-color-name');
const qvColorSwatches = document.getElementById('qv-color-swatches');
const specGsm = document.getElementById('spec-gsm');
const specFit = document.getElementById('spec-fit');

// Fullscreen Modal elements
const studioFsModal = document.getElementById('studio-fullscreen-modal');
const fsCanvasContainer = document.getElementById('fs-canvas-container');
const fsProductTitle = document.getElementById('fs-product-title');
const fsColorSwatches = document.getElementById('fs-color-swatches');

// Admin Studio Modal elements
const adminStudioOverlay = document.getElementById('admin-studio-overlay');
const adminStudioBtn = document.getElementById('admin-studio-btn');
const adminProductSelect = document.getElementById('admin-product-select');
const adminHas3D = document.getElementById('admin-has-3d');
const adminFitSelect = document.getElementById('admin-fit-select');
const adminGlbFilename = document.getElementById('admin-glb-filename');
const adminFrontFilename = document.getElementById('admin-front-filename');
const adminBackFilename = document.getElementById('admin-back-filename');
const adminFrontScale = document.getElementById('admin-front-scale');
const adminFrontScaleVal = document.getElementById('admin-front-scale-val');
const adminBackScale = document.getElementById('admin-back-scale');
const adminBackScaleVal = document.getElementById('admin-back-scale-val');
const adminRoughness = document.getElementById('admin-roughness');
const adminRoughnessVal = document.getElementById('admin-roughness-val');
const adminColorsList = document.getElementById('admin-colors-list');
const adminCanvasContainer = document.getElementById('admin-canvas-container');

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

// ==========================================
// 3. INITIALIZE APP
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  setupEventListeners();
});

// ==========================================
// 4. RENDER PRODUCT GRID
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
      const badge3DHtml = product.has_3d 
        ? `<div class="badge-3d-pill"><i class="ri-box-3-fill"></i> 3D INTERACTIVE</div>` 
        : '';
      
      const actionsHtml = product.has_3d ? `
        <div class="card-actions-row">
          <button class="btn btn-3d-view" onclick="openQuickView(${product.id}, '3d')">
            <i class="ri-box-3-line"></i> 3D STUDIO
          </button>
          <button class="btn btn-quick-add" onclick="openQuickView(${product.id}, '2d')">
            DETAILS <i class="ri-arrow-right-line"></i>
          </button>
        </div>
      ` : `
        <div class="card-actions-row single-btn">
          <button class="btn btn-quick-add" onclick="openQuickView(${product.id}, '2d')">
            SELECT OPTIONS <i class="ri-arrow-right-line"></i>
          </button>
        </div>
      `;

      return `
        <div class="product-card" data-id="${product.id}">
          <div class="product-img-box">
            ${badge3DHtml}
            ${tagHtml}
            <img src="${product.images[0]}" alt="${product.name}">
            <div class="quick-view-trigger"><i class="ri-eye-line"></i> ${product.has_3d ? '3D GARMENT STUDIO' : 'QUICK VIEW'}</div>
          </div>
          <div class="product-details">
            <h3 class="product-name">${product.name}</h3>
            <div class="product-price-row">
              <span class="current-price">₹${product.price}</span>
              <span class="compare-price">₹${product.compareAtPrice}</span>
              <span class="discount-pill">${discount}% OFF</span>
            </div>
            ${actionsHtml}
          </div>
        </div>
      `;
    }).join('');

    // Attach click to card image for quick view
    document.querySelectorAll('.product-img-box, .product-name').forEach(el => {
      el.addEventListener('click', () => {
        const card = el.closest('.product-card');
        const id = parseInt(card.dataset.id);
        const prod = products.find(p => p.id === id);
        openQuickView(id, prod && prod.has_3d ? '3d' : '2d');
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

  // Admin Studio Trigger
  if (adminStudioBtn) {
    adminStudioBtn.addEventListener('click', openAdminStudio);
  }

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
    addToCart(selectedQuickViewProduct.id, selectedSize, selectedColor);
    closeQuickView();
    setTimeout(() => {
      cartDrawer.classList.add('active');
      cartOverlay.classList.add('active');
      renderCart();
    }, 400);
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

  // Promo apply
  promoApplyBtn.addEventListener('click', () => {
    const code = promoCodeInput.value.trim().toUpperCase();
    if (code === 'WEEB10' || code === 'GENZ10') {
      activeDiscount = 0.10;
      promoMessage.style.color = 'var(--color-success)';
      promoMessage.textContent = '10% WEEBFOUR Discount Applied!';
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

  // Keyboard shortcut: ESC closes modals
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (studioFsModal && studioFsModal.classList.contains('active')) {
        closeStudioFullscreen();
      } else if (adminStudioOverlay && adminStudioOverlay.classList.contains('active')) {
        closeAdminStudio();
      } else if (quickViewOverlay && quickViewOverlay.classList.contains('active')) {
        closeQuickView();
      }
    }
  });
}

// ==========================================
// 6. CART & BAG CONTROLLERS
// ==========================================
function addToCart(productId, size, color) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const colorObj = color || (product.available_colors ? product.available_colors[0] : { id: 'std', name: 'Original', hex: '#000000' });

  // Match item by product ID, size, and color
  const existingItem = cart.find(item => 
    item.product.id === productId && 
    item.size === size && 
    item.color?.id === colorObj.id
  );

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      product: product,
      size: size,
      color: colorObj,
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
    const colorLabel = item.color ? ` • COLOR: ${item.color.name.toUpperCase()}` : '';

    return `
      <div class="cart-item">
        <div class="cart-item-img">
          <img src="${item.color?.previewImg || item.product.images[0]}" alt="${item.product.name}">
        </div>
        <div class="cart-item-info">
          <div class="cart-item-title">${item.product.name}</div>
          <div class="cart-item-meta">SIZE: ${item.size}${colorLabel}</div>
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
  
  if (subtotal >= SHIPPING_THRESHOLD) {
    shippingMessage.innerHTML = `<span style="color: var(--color-primary)"><i class="ri-fire-fill"></i> FREE SHIPPING UNLOCKED!</span>`;
    shippingProgress.style.width = '100%';
  } else {
    const remaining = SHIPPING_THRESHOLD - subtotal;
    shippingMessage.textContent = `Add ₹${remaining} more for FREE SHIPPING`;
    const percent = Math.min(100, (subtotal / SHIPPING_THRESHOLD) * 100);
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
// 7. QUICK VIEW & 3D GARMENT STUDIO CONTROLLER
// ==========================================
window.openQuickView = function(productId, preferredMode = '3d') {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  selectedQuickViewProduct = product;
  selectedSize = '';
  sizeError.style.display = 'none';

  // Set Info
  qvTag.textContent = product.tag || 'EXCLUSIVE DROP';
  qvTag.style.display = product.tag ? 'inline-block' : 'none';
  qvTitle.textContent = product.name;
  qvPrice.textContent = `₹${product.price}`;
  qvComparePrice.textContent = `₹${product.compareAtPrice}`;
  
  const discount = Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100);
  qvDiscountPercent.textContent = `${discount}% OFF`;
  qvDescription.textContent = product.description;

  // Specs Strip
  if (product.fabric_gsm) {
    specGsm.style.display = 'inline-flex';
    specGsm.querySelector('span').textContent = `${product.fabric_gsm} GSM FRENCH TERRY`;
  } else {
    specGsm.style.display = 'none';
  }

  const fitNames = {
    'boxy_oversized': 'BOXY OVERSIZED DROP SHOULDER',
    'acid_distressed_tee': 'ACID DISTRESSED RELAXED CUT',
    'minimal_heavyweight': 'HEAVYWEIGHT MINIMAL BOXY'
  };
  specFit.querySelector('span').textContent = fitNames[product.garment_fit] || 'STREETWEAR SILHOUETTE';

  // 2D Photo Gallery Setup
  qvMainImg.src = product.images[0];
  qvMainImg.alt = product.name;

  if (product.images.length > 1) {
    qvThumbnailsContainer.style.display = 'flex';
    qvThumbnailsContainer.innerHTML = product.images.map((img, i) => 
      `<div class="qv-thumb ${i === 0 ? 'active' : ''}" onclick="switchQvImage(this, '${img}')">
        <img src="${img}" alt="Thumbnail ${i+1}">
      </div>`
    ).join('');
  } else {
    qvThumbnailsContainer.style.display = 'none';
  }

  // Size Options Setup
  qvSizeOptions.innerHTML = product.sizes.map(size => 
    `<button class="qv-size-btn" onclick="selectSize(this, '${size}')">${size}</button>`
  ).join('');

  // Colorways Swatches Setup
  const colors = product.available_colors || [
    { id: 'default', name: 'Original', hex: '#0e1014', inStock: true, previewImg: product.images[0] }
  ];
  
  // Default to default_color_id or first color
  selectedColor = colors.find(c => c.id === product.default_color_id) || colors[0];
  qvActiveColorName.textContent = selectedColor.name.toUpperCase();

  qvColorSwatches.innerHTML = colors.map(col => `
    <button class="color-swatch-btn ${col.id === selectedColor.id ? 'active' : ''}" 
            title="${col.name}" 
            onclick="selectColorVariant('${col.id}')">
      <span class="color-swatch-inner" style="background-color: ${col.hex};"></span>
    </button>
  `).join('');

  // Mode Selection: 3D or 2D
  if (product.has_3d) {
    tabMode3D.style.display = 'inline-flex';
    if (preferredMode === '3d') {
      switchQvViewMode('3d');
    } else {
      switchQvViewMode('2d');
    }
  } else {
    // Product has no 3D model yet
    tabMode3D.style.display = 'none';
    switchQvViewMode('2d');
  }

  quickViewOverlay.classList.add('active');

  // Trigger 3D Viewer if in 3D mode
  if (product.has_3d && activeViewerMode === '3d') {
    initOrUpdateMainViewer(product, selectedColor.id);
  }
};

window.switchQvViewMode = function(mode) {
  activeViewerMode = mode;
  if (mode === '3d') {
    tabMode3D.classList.add('active');
    tabMode2D.classList.remove('active');
    qv3dViewport.style.display = 'flex';
    qv2dGalleryWrap.style.display = 'none';

    if (selectedQuickViewProduct) {
      if (selectedQuickViewProduct.has_3d) {
        qv3dFallback.style.display = 'none';
        initOrUpdateMainViewer(selectedQuickViewProduct, selectedColor?.id);
      } else {
        qv3dFallback.style.display = 'flex';
        qv3dLoading.style.display = 'none';
      }
    }
  } else {
    tabMode2D.classList.add('active');
    tabMode3D.classList.remove('active');
    qv3dViewport.style.display = 'none';
    qv2dGalleryWrap.style.display = 'block';
  }
};

// Initialize or update the Three.js garment viewer
function initOrUpdateMainViewer(product, colorId) {
  if (!window.WeebGarmentViewer) {
    console.warn("WeebGarmentViewer library is loading...");
    setTimeout(() => initOrUpdateMainViewer(product, colorId), 150);
    return;
  }

  qv3dLoading.style.display = 'flex';
  qv3dLoading.style.opacity = '1';

  if (!mainGarmentViewer) {
    mainGarmentViewer = new WeebGarmentViewer({
      container: qv3dCanvasWrap,
      onLoadStart: () => {
        qv3dLoading.style.display = 'flex';
        qv3dLoading.style.opacity = '1';
      },
      onLoadComplete: () => {
        qv3dLoading.style.opacity = '0';
        setTimeout(() => { qv3dLoading.style.display = 'none'; }, 400);
      },
      onError: (err) => {
        console.error("Main 3D Viewer error:", err);
        qv3dLoading.style.display = 'none';
        qv3dFallback.style.display = 'flex';
      },
      onAngleChange: (angle) => {
        document.querySelectorAll('.qv-angle-btn').forEach(btn => {
          if (btn.dataset.angle === angle) btn.classList.add('active');
          else btn.classList.remove('active');
        });
      }
    });
  }

  // Load product into viewer
  mainGarmentViewer.loadProduct(product, colorId);
  setTimeout(() => mainGarmentViewer.handleResize(), 80);
}

// Color variant selector handler
window.selectColorVariant = function(colorId) {
  if (!selectedQuickViewProduct) return;
  const colors = selectedQuickViewProduct.available_colors || [];
  const col = colors.find(c => c.id === colorId);
  if (!col) return;

  selectedColor = col;
  qvActiveColorName.textContent = col.name.toUpperCase();

  // Update swatches active ring in Quick View
  document.querySelectorAll('#qv-color-swatches .color-swatch-btn').forEach(btn => {
    btn.classList.toggle('active', btn.title === col.name);
  });

  // Update swatches in Fullscreen if open
  document.querySelectorAll('#fs-color-swatches .color-swatch-btn').forEach(btn => {
    btn.classList.toggle('active', btn.title === col.name);
  });

  // Update 3D Viewer material live
  if (mainGarmentViewer && activeViewerMode === '3d') {
    mainGarmentViewer.setColorVariant(colorId);
  }

  // Update 2D photo preview if image provided
  if (col.previewImg) {
    qvMainImg.src = col.previewImg;
  }
};

// 3D View Angle Controls
window.setViewerAngle = function(angle) {
  if (mainGarmentViewer) {
    mainGarmentViewer.viewAngle(angle);
  }
};

window.toggleViewerAutoRotate = function() {
  if (mainGarmentViewer) {
    const isRotating = mainGarmentViewer.toggleAutoRotate();
    const btn = document.getElementById('qv-autorotate-btn');
    const fsBtn = document.getElementById('fs-autorotate-btn');
    if (btn) btn.classList.toggle('active', isRotating);
    if (fsBtn) fsBtn.classList.toggle('active', isRotating);
  }
};

window.zoomViewerIn = function() {
  if (mainGarmentViewer) mainGarmentViewer.zoomIn();
};

window.zoomViewerOut = function() {
  if (mainGarmentViewer) mainGarmentViewer.zoomOut();
};

// Fullscreen Runway Studio
window.openStudioFullscreen = function() {
  if (!selectedQuickViewProduct) return;

  studioFsModal.classList.add('active');
  fsProductTitle.textContent = `${selectedQuickViewProduct.name} — 3D RUNWAY INSPECTOR`;

  // Move canvas element to fullscreen container
  if (mainGarmentViewer && mainGarmentViewer.renderer) {
    fsCanvasContainer.appendChild(mainGarmentViewer.renderer.domElement);
    setTimeout(() => {
      mainGarmentViewer.handleResize();
    }, 50);
  }

  // Populate color swatches dock
  const colors = selectedQuickViewProduct.available_colors || [];
  fsColorSwatches.innerHTML = colors.map(col => `
    <button class="color-swatch-btn ${col.id === selectedColor?.id ? 'active' : ''}" 
            title="${col.name}" 
            onclick="selectColorVariant('${col.id}')">
      <span class="color-swatch-inner" style="background-color: ${col.hex};"></span>
    </button>
  `).join('');
};

window.closeStudioFullscreen = function() {
  studioFsModal.classList.remove('active');
  // Return canvas back to quick view
  if (mainGarmentViewer && mainGarmentViewer.renderer) {
    qv3dCanvasWrap.appendChild(mainGarmentViewer.renderer.domElement);
    setTimeout(() => {
      mainGarmentViewer.handleResize();
    }, 50);
  }
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
// 8. ADMIN 3D ASSET STUDIO CONTROLLER
// ==========================================
window.openAdminStudio = function() {
  populateAdminProductSelect();
  adminStudioOverlay.classList.add('active');

  // Load first 3D product or product 1
  const initialProduct = products.find(p => p.has_3d) || products[0];
  if (initialProduct) {
    adminProductSelect.value = initialProduct.id;
    onAdminSelectProduct(initialProduct.id);
  }
};

window.closeAdminStudio = function() {
  adminStudioOverlay.classList.remove('active');
};

function populateAdminProductSelect() {
  adminProductSelect.innerHTML = products.map(p => 
    `<option value="${p.id}">${p.name} ${p.has_3d ? '[3D ACTIVE]' : '[2D ONLY]'}</option>`
  ).join('');
}

window.onAdminSelectProduct = function(productId) {
  const prod = products.find(p => p.id === parseInt(productId));
  if (!prod) return;

  currentAdminProduct = JSON.parse(JSON.stringify(prod));

  // Populate Admin Form Fields
  adminHas3D.checked = !!currentAdminProduct.has_3d;
  adminFitSelect.value = currentAdminProduct.garment_fit || 'boxy_oversized';
  adminGlbFilename.textContent = currentAdminProduct.model_3d_url || 'Using procedural streetwear garment geometry';
  adminFrontFilename.textContent = currentAdminProduct.front_texture_url || 'No front artwork assigned';
  adminBackFilename.textContent = currentAdminProduct.back_texture_url || 'No back artwork assigned';

  const frontPlacement = currentAdminProduct.front_art_placement || { scale: 0.64 };
  const backPlacement = currentAdminProduct.back_art_placement || { scale: 0.70 };

  adminFrontScale.value = frontPlacement.scale || 0.64;
  adminFrontScaleVal.textContent = adminFrontScale.value;
  adminBackScale.value = backPlacement.scale || 0.70;
  adminBackScaleVal.textContent = adminBackScale.value;

  adminRoughness.value = currentAdminProduct.fabric_roughness || 0.85;
  adminRoughnessVal.textContent = adminRoughness.value;

  renderAdminColorways(currentAdminProduct.available_colors || []);

  // Update Live Admin 3D Preview
  updateAdminLivePreview(currentAdminProduct);
};

window.onAdminToggle3D = function(enabled) {
  if (!currentAdminProduct) return;
  currentAdminProduct.has_3d = enabled;
  document.getElementById('admin-preview-status').innerHTML = enabled 
    ? `<i class="ri-checkbox-circle-fill"></i> ACTIVE`
    : `<span style="color: var(--color-error);"><i class="ri-close-circle-fill"></i> DISABLED (2D Fallback)</span>`;
};

window.onAdminUpdateFit = function(fit) {
  if (!currentAdminProduct) return;
  currentAdminProduct.garment_fit = fit;
  updateAdminLivePreview(currentAdminProduct);
};

window.onAdminUploadGLB = function(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Validate extension
  const validExts = ['.glb', '.gltf'];
  const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  if (!validExts.includes(ext)) {
    alert("Invalid file format. Please upload a .GLB or .GLTF garment 3D model.");
    return;
  }

  // Validate size (< 25MB)
  if (file.size > 25 * 1024 * 1024) {
    alert("File exceeds maximum allowed size (25MB). Please optimize your 3D asset.");
    return;
  }

  const blobUrl = URL.createObjectURL(file);
  currentAdminProduct.model_3d_url = blobUrl;
  adminGlbFilename.textContent = `${file.name} (${Math.round(file.size / 1024)} KB)`;
  updateAdminLivePreview(currentAdminProduct);
};

window.onAdminUploadArtwork = function(event, side) {
  const file = event.target.files[0];
  if (!file) return;

  // Validate image type
  if (!file.type.startsWith('image/')) {
    alert("Please upload a valid image file (PNG, JPG, or WEBP).");
    return;
  }

  // Validate size (< 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert("Image file size exceeds 5MB. Please upload an optimized artwork map.");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    if (side === 'front') {
      currentAdminProduct.front_texture_url = dataUrl;
      adminFrontFilename.textContent = file.name;
    } else {
      currentAdminProduct.back_texture_url = dataUrl;
      adminBackFilename.textContent = file.name;
    }
    updateAdminLivePreview(currentAdminProduct);
  };
  reader.readAsDataURL(file);
};

window.onAdminUpdateArtworkPlacement = function() {
  if (!currentAdminProduct) return;
  const fScale = parseFloat(adminFrontScale.value);
  const bScale = parseFloat(adminBackScale.value);
  adminFrontScaleVal.textContent = fScale.toFixed(2);
  adminBackScaleVal.textContent = bScale.toFixed(2);

  currentAdminProduct.front_art_placement = { scale: fScale, offsetY: 0.04, offsetX: 0 };
  currentAdminProduct.back_art_placement = { scale: bScale, offsetY: 0.02, offsetX: 0 };

  updateAdminLivePreview(currentAdminProduct);
};

window.onAdminUpdateRoughness = function(val) {
  if (!currentAdminProduct) return;
  adminRoughnessVal.textContent = parseFloat(val).toFixed(2);
  currentAdminProduct.fabric_roughness = parseFloat(val);
  updateAdminLivePreview(currentAdminProduct);
};

function renderAdminColorways(colors) {
  adminColorsList.innerHTML = colors.map((col, idx) => `
    <div style="display: flex; align-items: center; gap: 8px; background: rgba(255, 255, 255, 0.02); padding: 6px 10px; border: 1px solid var(--color-border);">
      <input type="color" value="${col.hex}" style="width: 28px; height: 28px; border: none; cursor: pointer; background: transparent;" onchange="onAdminUpdateColorHex(${idx}, this.value)">
      <input type="text" value="${col.name}" class="admin-input" style="padding: 6px 10px; font-size: 0.78rem; flex: 1;" onchange="onAdminUpdateColorName(${idx}, this.value)">
      <span style="font-size: 0.7rem; color: var(--color-primary); cursor: pointer;" onclick="onAdminPreviewColor(${idx})"><i class="ri-eye-line"></i> Preview</span>
    </div>
  `).join('');
}

window.onAdminUpdateColorHex = function(idx, hex) {
  if (!currentAdminProduct || !currentAdminProduct.available_colors) return;
  currentAdminProduct.available_colors[idx].hex = hex;
  updateAdminLivePreview(currentAdminProduct);
};

window.onAdminUpdateColorName = function(idx, name) {
  if (!currentAdminProduct || !currentAdminProduct.available_colors) return;
  currentAdminProduct.available_colors[idx].name = name;
};

window.onAdminPreviewColor = function(idx) {
  if (!currentAdminProduct || !currentAdminProduct.available_colors) return;
  const col = currentAdminProduct.available_colors[idx];
  if (adminGarmentViewer) {
    adminGarmentViewer.setColorVariant(col.id);
  }
};

function updateAdminLivePreview(product) {
  if (!window.WeebGarmentViewer) return;

  if (!adminGarmentViewer) {
    adminGarmentViewer = new WeebGarmentViewer({
      container: adminCanvasContainer,
      onLoadStart: () => {},
      onLoadComplete: () => {},
      onError: (err) => console.warn("Admin preview error:", err)
    });
  }

  adminGarmentViewer.loadProduct(product);
  setTimeout(() => adminGarmentViewer.handleResize(), 80);
}

window.saveAdminChanges = function() {
  if (!currentAdminProduct) return;

  const targetIdx = products.findIndex(p => p.id === currentAdminProduct.id);
  if (targetIdx !== -1) {
    products[targetIdx] = { ...products[targetIdx], ...currentAdminProduct };

    // Persist in localStorage
    try {
      localStorage.setItem('weebfour_custom_catalog', JSON.stringify(products));
    } catch (e) {
      console.warn("Could not save to localStorage", e);
    }

    renderProducts();
    populateAdminProductSelect();
    adminProductSelect.value = currentAdminProduct.id;

    // Toast Alert
    alert(`Successfully published 3D garment configuration for "${currentAdminProduct.name}"!`);
  }
};

window.resetAdminDefaults = function() {
  if (confirm("Reset catalog back to initial state? All custom uploads and overrides will be cleared.")) {
    localStorage.removeItem('weebfour_custom_catalog');
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
      <span class="mini-item-name">${item.product.name} (${item.size}${item.color ? ' / ' + item.color.name : ''}) x${item.quantity}</span>
      <span class="mini-item-price">₹${item.product.price * item.quantity}</span>
    </div>
  `).join('');
}

function updateCheckoutSummary() {
  const subtotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  coSubtotal.textContent = `₹${subtotal}`;

  const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;
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
