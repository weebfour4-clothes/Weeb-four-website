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
let activeDiscount = 0.0; // 0.10 for 10%

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

    return `
      <div class="cart-item">
        <div class="cart-item-img">
          <img src="${item.product.images[0]}" alt="${item.product.name}">
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
// 7. QUICK VIEW MODAL CONTROLLER
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
// 8. CHECKOUT MODAL FLOW
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
