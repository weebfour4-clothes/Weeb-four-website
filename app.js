// ==========================================
// WEEBFOUR (WEB4!) - MASTER APPLICATION CONTROLLER
// ==========================================

// 1. Application State
let cart = [];
let activeCategory = 'all';
let searchQuery = '';
let currentSort = 'default';
let selectedQuickViewProduct = null;
let selectedSize = '';
let activeDiscount = 0.0; // 0.10 for 10%, 0.15 for 15%

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
// 3. BUILD YOUR FIT STATE & SETUP
// ==========================================
let currentFit = {
  tee: null,
  bottom: null,
  outerwear: null,
  teeSize: 'L',
  bottomSize: 'M',
  outerwearSize: 'L'
};

// ==========================================
// 4. 3D TEE LAB STATE
// ==========================================
let teeLabState = {
  currentView: 'front', // 'front' | 'back'
  currentColor: 'black',
  currentAngle: 0,
  isDragging: false,
  startX: 0,
  startAngle: 0,
  zoomEnabled: false,
  zoomLevel: 2.5,
  selectedSize: 'L'
};

// ==========================================
// 5. INITIALIZE APP
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  setupEventListeners();
  initBuildYourFit();
  init3DTeeLab();
});

// ==========================================
// 6. RENDER PRODUCT GRID
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
      
      return `
        <div class="product-card" data-id="${product.id}">
          <div class="product-img-box">
            ${tagHtml}
            <img src="${product.images[0]}" alt="${product.name}">
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
// 7. SETUP EVENT LISTENERS
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
    } else if (code === 'WEEBFIT15') {
      activeDiscount = 0.15;
      promoMessage.style.color = 'var(--color-success)';
      promoMessage.textContent = '15% Fit Studio Discount Applied!';
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
}

// ==========================================
// 8. BUILD YOUR FIT IMPLEMENTATION
// ==========================================
function initBuildYourFit() {
  const teesList = products.filter(p => p.category === 'tees');
  const bottomsList = products.filter(p => p.category === 'cargoes');
  const layersList = products.filter(p => p.category === 'hoodies' || p.category === 'jackets' || p.category === 'accessories');

  // Set initial selections
  currentFit.tee = teesList[0] || products[0];
  currentFit.bottom = bottomsList[0] || products[4];
  currentFit.outerwear = layersList[0] || products[3];

  const teesGrid = document.getElementById('builder-tees-grid');
  const bottomsGrid = document.getElementById('builder-bottoms-grid');
  const layersGrid = document.getElementById('builder-layers-grid');

  if (teesGrid) {
    teesGrid.innerHTML = teesList.map((item, idx) => `
      <div class="builder-option-card ${idx === 0 ? 'selected' : ''}" data-type="tee" data-id="${item.id}">
        <div class="option-card-selected-check"><i class="ri-check-line"></i></div>
        <div class="option-thumb">
          <img src="${item.images[0]}" alt="${item.name}">
        </div>
        <div class="option-name">${item.name}</div>
        <div class="option-prices">
          <span class="option-price">₹${item.price}</span>
          <span class="option-compare">₹${item.compareAtPrice}</span>
        </div>
      </div>
    `).join('');
  }

  if (bottomsGrid) {
    bottomsGrid.innerHTML = bottomsList.map((item, idx) => `
      <div class="builder-option-card ${idx === 0 ? 'selected' : ''}" data-type="bottom" data-id="${item.id}">
        <div class="option-card-selected-check"><i class="ri-check-line"></i></div>
        <div class="option-thumb">
          <img src="${item.images[0]}" alt="${item.name}">
        </div>
        <div class="option-name">${item.name}</div>
        <div class="option-prices">
          <span class="option-price">₹${item.price}</span>
          <span class="option-compare">₹${item.compareAtPrice}</span>
        </div>
      </div>
    `).join('');
  }

  if (layersGrid) {
    layersGrid.innerHTML = layersList.map((item, idx) => `
      <div class="builder-option-card ${idx === 0 ? 'selected' : ''}" data-type="outerwear" data-id="${item.id}">
        <div class="option-card-selected-check"><i class="ri-check-line"></i></div>
        <div class="option-thumb">
          <img src="${item.images[0]}" alt="${item.name}">
        </div>
        <div class="option-name">${item.name}</div>
        <div class="option-prices">
          <span class="option-price">₹${item.price}</span>
          <span class="option-compare">₹${item.compareAtPrice}</span>
        </div>
      </div>
    `).join('');
  }

  // Handle Step Tabs Switching
  const stepTabs = document.querySelectorAll('.step-tab-btn');
  const stepPanes = document.querySelectorAll('.step-pane');
  stepTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const step = tab.dataset.step;
      stepTabs.forEach(t => t.classList.remove('active'));
      stepPanes.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const activePane = document.getElementById(`builder-step-${step}`);
      if (activePane) activePane.classList.add('active');
    });
  });

  // Handle Option Card Clicks
  document.querySelectorAll('.builder-option-card').forEach(card => {
    card.addEventListener('click', () => {
      const type = card.dataset.type;
      const id = parseInt(card.dataset.id);
      const product = products.find(p => p.id === id);
      if (!product) return;

      // Unselect siblings
      card.parentElement.querySelectorAll('.builder-option-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');

      // Update state
      currentFit[type] = product;
      updateFitPreview();
    });
  });

  // Handle Fit Sizes
  const teeSizeSelect = document.getElementById('fit-size-tee');
  const bottomSizeSelect = document.getElementById('fit-size-bottom');
  const outerwearSizeSelect = document.getElementById('fit-size-outerwear');

  if (teeSizeSelect) {
    teeSizeSelect.addEventListener('change', (e) => currentFit.teeSize = e.target.value);
  }
  if (bottomSizeSelect) {
    bottomSizeSelect.addEventListener('change', (e) => currentFit.bottomSize = e.target.value);
  }
  if (outerwearSizeSelect) {
    outerwearSizeSelect.addEventListener('change', (e) => currentFit.outerwearSize = e.target.value);
  }

  // Handle Add Fit to Bag (One Click)
  const addFitBtn = document.getElementById('add-fit-to-cart-btn');
  if (addFitBtn) {
    addFitBtn.addEventListener('click', () => {
      if (!currentFit.tee || !currentFit.bottom || !currentFit.outerwear) return;

      // Add all 3 items to cart with bundle discount (15% off)
      const bundleDiscountFactor = 0.85;

      const bundledTee = {
        product: { ...currentFit.tee, price: Math.round(currentFit.tee.price * bundleDiscountFactor) },
        size: currentFit.teeSize,
        quantity: 1,
        isBundle: true
      };

      const bundledBottom = {
        product: { ...currentFit.bottom, price: Math.round(currentFit.bottom.price * bundleDiscountFactor) },
        size: currentFit.bottomSize,
        quantity: 1,
        isBundle: true
      };

      const bundledOuterwear = {
        product: { ...currentFit.outerwear, price: Math.round(currentFit.outerwear.price * bundleDiscountFactor) },
        size: currentFit.outerwearSize,
        quantity: 1,
        isBundle: true
      };

      cart.push(bundledTee, bundledBottom, bundledOuterwear);
      updateCartCount();
      animateCartIcon();

      // Open Cart Drawer
      cartDrawer.classList.add('active');
      cartOverlay.classList.add('active');
      renderCart();

      // Celebration effect on button
      addFitBtn.innerHTML = `<i class="ri-check-double-line"></i> COMPLETE FIT ADDED! (-15% SAVED)`;
      setTimeout(() => {
        addFitBtn.innerHTML = `<i class="ri-shopping-bag-3-fill"></i> ADD COMPLETE LOOK TO BAG (3 ITEMS)`;
      }, 2500);
    });
  }

  updateFitPreview();
}

function updateFitPreview() {
  const { tee, bottom, outerwear } = currentFit;
  if (!tee || !bottom || !outerwear) return;

  // Update Left Canvas Images & Titles
  const previewOuterwear = document.getElementById('fit-preview-outerwear');
  const titleOuterwear = document.getElementById('fit-outerwear-title');
  const priceOuterwear = document.getElementById('fit-outerwear-price');

  const previewTee = document.getElementById('fit-preview-tee');
  const titleTee = document.getElementById('fit-tee-title');
  const priceTee = document.getElementById('fit-tee-price');

  const previewBottom = document.getElementById('fit-preview-bottom');
  const titleBottom = document.getElementById('fit-bottom-title');
  const priceBottom = document.getElementById('fit-bottom-price');

  if (previewOuterwear) previewOuterwear.src = outerwear.images[0];
  if (titleOuterwear) titleOuterwear.textContent = outerwear.name;
  if (priceOuterwear) priceOuterwear.textContent = `₹${outerwear.price}`;

  if (previewTee) previewTee.src = tee.images[0];
  if (titleTee) titleTee.textContent = tee.name;
  if (priceTee) priceTee.textContent = `₹${tee.price}`;

  if (previewBottom) previewBottom.src = bottom.images[0];
  if (titleBottom) titleBottom.textContent = bottom.name;
  if (priceBottom) priceBottom.textContent = `₹${bottom.price}`;

  // Calculate Combined Price & 15% Savings
  const subtotal = tee.price + bottom.price + outerwear.price;
  const discount = Math.round(subtotal * 0.15);
  const total = subtotal - discount;

  const subtotalEl = document.getElementById('fit-summary-subtotal');
  const discountEl = document.getElementById('fit-summary-discount');
  const totalEl = document.getElementById('fit-summary-total');

  if (subtotalEl) subtotalEl.textContent = `₹${subtotal}`;
  if (discountEl) discountEl.textContent = `-₹${discount}`;
  if (totalEl) totalEl.textContent = `₹${total}`;
}

// ==========================================
// 9. 3D TEE LAB IMPLEMENTATION (MOUSE REACTIVE)
// ==========================================
function init3DTeeLab() {
  const viewport = document.getElementById('tee-stage-viewport');
  const wrapper = document.getElementById('tee-3d-wrapper');
  const card3d = document.getElementById('tee-card-3d');
  const angleDegrees = document.getElementById('angle-degrees');
  const ambientGlow = document.getElementById('tee-ambient-glow');
  const angleBadge = document.getElementById('angle-indicator-badge');

  if (!viewport || !wrapper || !card3d) return;

  // 1. Mouse Move 3D Perspective Tilt
  viewport.addEventListener('mousemove', (e) => {
    if (teeLabState.isDragging) return;

    const rect = viewport.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Normalized coordinates (-1 to 1)
    const normX = (x / rect.width) * 2 - 1;
    const normY = (y / rect.height) * 2 - 1;

    // Tilt angles (max 18 deg)
    const tiltX = -normY * 16;
    const tiltY = normX * 22;

    wrapper.style.transform = `perspective(1200px) rotateX(${tiltX}deg) rotateY(${teeLabState.currentAngle + tiltY}deg) scale3d(1.02, 1.02, 1.02)`;

    // Handle Magnifier Loupe position
    if (teeLabState.zoomEnabled) {
      updateLoupePosition(x, y, rect.width, rect.height);
    }
  });

  viewport.addEventListener('mouseleave', () => {
    if (teeLabState.isDragging) return;
    wrapper.style.transform = `perspective(1200px) rotateX(0deg) rotateY(${teeLabState.currentAngle}deg) scale3d(1, 1, 1)`;
    hideLoupe();
  });

  // 2. Drag Horizontally to Rotate in 3D
  const onDragStart = (clientX) => {
    teeLabState.isDragging = true;
    teeLabState.startX = clientX;
    teeLabState.startAngle = teeLabState.currentAngle;
    hideLoupe();
  };

  const onDragMove = (clientX) => {
    if (!teeLabState.isDragging) return;
    const deltaX = clientX - teeLabState.startX;
    // Rotate factor: 1 pixel = 0.55 degrees
    teeLabState.currentAngle = Math.round((teeLabState.startAngle + deltaX * 0.55) % 360);
    if (teeLabState.currentAngle < 0) teeLabState.currentAngle += 360;

    wrapper.style.transform = `perspective(1200px) rotateX(0deg) rotateY(${teeLabState.currentAngle}deg)`;
    if (angleDegrees) angleDegrees.textContent = `${teeLabState.currentAngle}°`;
  };

  const onDragEnd = () => {
    teeLabState.isDragging = false;
  };

  // Mouse drag
  viewport.addEventListener('mousedown', (e) => onDragStart(e.clientX));
  window.addEventListener('mousemove', (e) => onDragMove(e.clientX));
  window.addEventListener('mouseup', onDragEnd);

  // Touch drag
  viewport.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) onDragStart(e.touches[0].clientX);
  });
  window.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1) onDragMove(e.touches[0].clientX);
  });
  window.addEventListener('touchend', onDragEnd);

  // 3. View Angle Buttons (Front & Back Views)
  const viewFrontBtn = document.getElementById('view-btn-front');
  const viewBackBtn = document.getElementById('view-btn-back');

  const setViewAngle = (view) => {
    teeLabState.currentView = view;
    if (view === 'front') {
      teeLabState.currentAngle = 0;
      if (viewFrontBtn) viewFrontBtn.classList.add('active');
      if (viewBackBtn) viewBackBtn.classList.remove('active');
    } else {
      teeLabState.currentAngle = 180;
      if (viewBackBtn) viewBackBtn.classList.add('active');
      if (viewFrontBtn) viewFrontBtn.classList.remove('active');
    }
    wrapper.style.transform = `perspective(1200px) rotateX(0deg) rotateY(${teeLabState.currentAngle}deg)`;
    if (angleDegrees) angleDegrees.textContent = `${teeLabState.currentAngle}°`;
    updateLoupeImage();
  };

  if (viewFrontBtn) viewFrontBtn.addEventListener('click', () => setViewAngle('front'));
  if (viewBackBtn) viewBackBtn.addEventListener('click', () => setViewAngle('back'));

  // 4. Instant Color Variant Switcher
  const swatches = document.querySelectorAll('.swatch-btn');
  const selectedColorName = document.getElementById('selected-color-name');
  const filterFront = document.getElementById('tee-filter-front');
  const filterBack = document.getElementById('tee-filter-back');

  const colorMap = {
    black: { color: 'transparent', glow: 'rgba(255, 32, 58, 0.25)', opacity: 0 },
    crimson: { color: 'rgba(210, 15, 35, 0.55)', glow: 'rgba(255, 32, 58, 0.5)', opacity: 1 },
    bone: { color: 'rgba(225, 218, 208, 0.45)', glow: 'rgba(230, 220, 200, 0.35)', opacity: 1 },
    charcoal: { color: 'rgba(50, 50, 60, 0.55)', glow: 'rgba(100, 100, 120, 0.3)', opacity: 1 },
    olive: { color: 'rgba(70, 85, 55, 0.5)', glow: 'rgba(90, 110, 70, 0.3)', opacity: 1 }
  };

  swatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      swatches.forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');

      const colorKey = swatch.dataset.color;
      const colorName = swatch.dataset.name;
      teeLabState.currentColor = colorKey;

      if (selectedColorName) selectedColorName.textContent = colorName;

      const cfg = colorMap[colorKey];
      if (cfg) {
        if (filterFront) {
          filterFront.style.backgroundColor = cfg.color;
          filterFront.style.opacity = cfg.opacity;
        }
        if (filterBack) {
          filterBack.style.backgroundColor = cfg.color;
          filterBack.style.opacity = cfg.opacity;
        }
        if (ambientGlow) {
          ambientGlow.style.background = `radial-gradient(circle, ${cfg.glow} 0%, transparent 70%)`;
        }
      }
    });
  });

  // 5. Magnifier Fabric & Print Loupe
  const toggleZoomBtn = document.getElementById('toggle-zoom-btn');
  const zoomToggleText = document.getElementById('zoom-toggle-text');
  const zoomSlider = document.getElementById('zoom-level-slider');
  const loupe = document.getElementById('magnifier-lens');

  if (toggleZoomBtn) {
    toggleZoomBtn.addEventListener('click', () => {
      teeLabState.zoomEnabled = !teeLabState.zoomEnabled;
      if (zoomToggleText) {
        zoomToggleText.textContent = teeLabState.zoomEnabled ? 'DISABLE LOUPE' : 'ENABLE LOUPE';
      }
      if (!teeLabState.zoomEnabled) hideLoupe();
    });
  }

  if (zoomSlider) {
    zoomSlider.addEventListener('input', (e) => {
      teeLabState.zoomLevel = parseFloat(e.target.value);
    });
  }

  // 6. Size selector & Quick Buy
  const sizePills = document.querySelectorAll('.size-pill');
  sizePills.forEach(pill => {
    pill.addEventListener('click', () => {
      sizePills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      teeLabState.selectedSize = pill.dataset.size;
    });
  });

  const labAddBtn = document.getElementById('lab-add-to-cart-btn');
  if (labAddBtn) {
    labAddBtn.addEventListener('click', () => {
      const teeProduct = products[0]; // Cyberpunk / Rebel Graffiti 280
      addToCart(teeProduct.id, teeLabState.selectedSize);
      cartDrawer.classList.add('active');
      cartOverlay.classList.add('active');
      renderCart();
      
      labAddBtn.innerHTML = `<i class="ri-check-line"></i> ADDED TO BAG!`;
      setTimeout(() => {
        labAddBtn.innerHTML = `<i class="ri-shopping-bag-3-fill"></i> ADD TEE TO BAG (₹999)`;
      }, 2000);
    });
  }
}

function updateLoupePosition(mouseX, mouseY, vpWidth, vpHeight) {
  const loupe = document.getElementById('magnifier-lens');
  const zoomedImg = document.getElementById('lens-zoomed-img');
  if (!loupe || !zoomedImg) return;

  loupe.classList.add('active');
  loupe.style.left = `${mouseX}px`;
  loupe.style.top = `${mouseY}px`;

  // Calculate translation inside loupe
  const zoom = teeLabState.zoomLevel;
  const offsetX = (mouseX / vpWidth) * 460;
  const offsetY = (mouseY / vpHeight) * 460;

  zoomedImg.style.transform = `scale(${zoom}) translate(${-offsetX / 2}px, ${-offsetY / 2}px)`;
}

function hideLoupe() {
  const loupe = document.getElementById('magnifier-lens');
  if (loupe) loupe.classList.remove('active');
}

function updateLoupeImage() {
  const zoomedImg = document.getElementById('lens-zoomed-img');
  if (!zoomedImg) return;
  if (teeLabState.currentView === 'front') {
    zoomedImg.src = 'assets/tee_front_clean.jpg';
  } else {
    zoomedImg.src = 'assets/tee_back.jpg';
  }
}

// ==========================================
// 10. EDITORIAL HERO PARALLAX
// ==========================================
function initHeroParallax() {
  const heroSection = document.getElementById('campaign');
  const modelsImg = document.getElementById('editorial-models-img');
  if (!heroSection || !modelsImg) return;

  heroSection.addEventListener('mousemove', (e) => {
    const rect = heroSection.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const moveX = (x / rect.width) * 18;
    const moveY = (y / rect.height) * 10;

    modelsImg.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
  });

  heroSection.addEventListener('mouseleave', () => {
    modelsImg.style.transform = `translate3d(0, 0, 0)`;
  });
}

// ==========================================
// 11. CART & QUICK VIEW CONTROLLERS
// ==========================================
function addToCart(productId, size) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const existingItem = cart.find(item => item.product.id === productId && item.size === size && !item.isBundle);

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
    const bundleBadge = item.isBundle ? `<span class="bundle-item-badge"><i class="ri-magic-line"></i> FIT BUNDLE (-15%)</span>` : '';

    return `
      <div class="cart-item">
        <div class="cart-item-img">
          <img src="${item.product.images[0]}" alt="${item.product.name}">
        </div>
        <div class="cart-item-info">
          ${bundleBadge}
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
// 12. QUICK VIEW MODAL CONTROLLER
// ==========================================
function openQuickView(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  selectedQuickViewProduct = product;
  selectedSize = '';
  sizeError.style.display = 'none';

  qvMainImg.src = product.images[0];
  qvMainImg.alt = product.name;
  
  qvTag.textContent = product.tag || 'EXCLUSIVE DROP';
  qvTag.style.display = product.tag ? 'inline-block' : 'none';
  
  qvTitle.textContent = product.name;
  qvPrice.textContent = `₹${product.price}`;
  qvComparePrice.textContent = `₹${product.compareAtPrice}`;
  
  const discount = Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100);
  qvDiscountPercent.textContent = `${discount}% OFF`;

  qvDescription.textContent = product.description;

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

  qvSizeOptions.innerHTML = product.sizes.map(size => 
    `<button class="qv-size-btn" onclick="selectSize(this, '${size}')">${size}</button>`
  ).join('');

  quickViewOverlay.classList.add('active');
}

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
// 13. CHECKOUT MODAL FLOW
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
      <span class="mini-item-name">${item.product.name} (x${item.quantity})</span>
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
