// ==========================================
// GENZ CLOTHINGS - APPLICATION CONTROLLER
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
const step1Form = document.getElementById('checkout-step-1');
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

// 3. Initialize App
window.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  setupEventListeners();
});

// 4. Render Product Grid
function renderProducts() {
  // Filter products
  let filtered = products.filter(product => {
    const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Sort products
  if (currentSort === 'price-low') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (currentSort === 'price-high') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (currentSort === 'popular') {
    // Sort by id or mock popularity
    filtered.sort((a, b) => (a.tag === 'BEST SELLER' ? -1 : 1));
  }

  // Update empty state
  if (filtered.length === 0) {
    productGrid.style.display = 'none';
    emptyState.style.display = 'block';
  } else {
    productGrid.style.display = 'grid';
    emptyState.style.display = 'none';
    
    productGrid.innerHTML = filtered.map(product => {
      const discount = Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100);
      
      // Secondary image or fallback to main
      const hoverImage = product.images[1] ? product.images[1] : product.images[0];
      
      // Tag badge
      const tagBadgeHtml = product.tag ? `<div class="prod-tag">${product.tag}</div>` : '';
      
      // Sizes quick add
      const sizesHtml = product.sizes.map(size => 
        `<button class="quick-size-btn" data-prod-id="${product.id}" data-size="${size}">${size}</button>`
      ).join('');

      return `
        <div class="product-card" data-id="${product.id}">
          <div class="product-image-container">
            ${tagBadgeHtml}
            <img class="prod-img" src="${product.images[0]}" alt="${product.name}">
            <img class="prod-img-hover" src="${hoverImage}" alt="${product.name} alternate">
            
            <div class="quick-add-overlay">
              <span class="quick-add-title">QUICK ADD SIZE:</span>
              <div class="quick-add-sizes">
                ${sizesHtml}
              </div>
            </div>
          </div>
          
          <div class="product-details">
            <span class="product-cat">${product.category}</span>
            <h3 class="product-name" data-id="${product.id}">${product.name}</h3>
            
            <div class="price-box">
              <span class="price-now">₹${product.price}</span>
              <span class="price-compare">₹${product.compareAtPrice}</span>
              <span class="save-percent">${discount}% OFF</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Reattach listeners to quick add size buttons
    document.querySelectorAll('.quick-size-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.prodId);
        const size = btn.dataset.size;
        addToCart(id, size);
      });
    });

    // Reattach listeners to card image & name for Quick View
    document.querySelectorAll('.product-image-container, .product-name').forEach(el => {
      el.addEventListener('click', (e) => {
        // Check if size button was clicked, don't open modal in that case
        if (e.target.classList.contains('quick-size-btn')) return;
        
        const card = el.closest('.product-card');
        const id = parseInt(card.dataset.id);
        openQuickView(id);
      });
    });
  }

  updateFilterBadges();
}

// 5. Update active filter badges
function updateFilterBadges() {
  if (activeCategory === 'all' && searchQuery === '') {
    filterBadgesContainer.style.display = 'none';
    return;
  }

  filterBadgesContainer.style.display = 'flex';
  let badgesHtml = '';

  if (activeCategory !== 'all') {
    badgesHtml += `
      <div class="badge-item">
        Category: ${activeCategory.toUpperCase()}
        <button onclick="setCategory('all')"><i class="ri-close-line"></i></button>
      </div>
    `;
  }

  if (searchQuery !== '') {
    badgesHtml += `
      <div class="badge-item">
        Search: "${searchQuery}"
        <button onclick="clearSearch()"><i class="ri-close-line"></i></button>
      </div>
    `;
  }

  badgesList.innerHTML = badgesHtml;
}

// Global category/search setters for badges
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

// 6. Setup All Event Listeners
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

  // Category selection via landing collection cards
  collectionCards.forEach(card => {
    card.addEventListener('click', () => {
      const cat = card.dataset.category;
      setCategory(cat);
      document.getElementById('shop').scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Sort select changes
  sortSelector.addEventListener('change', (e) => {
    currentSort = e.target.value;
    renderProducts();
  });

  // Search trigger toggling
  searchToggleBtn.addEventListener('click', () => {
    searchOverlay.classList.toggle('active');
    if (searchOverlay.classList.contains('active')) {
      catalogSearch.focus();
    }
  });

  searchCloseBtn.addEventListener('click', () => {
    searchOverlay.classList.remove('active');
  });

  // Live searching
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

  // Clear filters link
  clearAllFiltersBtn.addEventListener('click', resetFilters);

  // Quick View interactions
  quickViewClose.addEventListener('click', closeQuickView);
  quickViewOverlay.addEventListener('click', (e) => {
    if (e.target === quickViewOverlay) closeQuickView();
  });

  // Size chart toggling
  sizeChartToggle.addEventListener('click', (e) => {
    e.preventDefault();
    sizeChartOverlay.classList.add('active');
  });
  sizeChartClose.addEventListener('click', () => sizeChartOverlay.classList.remove('active'));
  sizeChartOverlay.addEventListener('click', (e) => {
    if (e.target === sizeChartOverlay) sizeChartOverlay.classList.remove('active');
  });

  // Add to cart inside Quick view
  qvAddToCartBtn.addEventListener('click', () => {
    if (!selectedSize) {
      sizeError.style.display = 'block';
      return;
    }
    sizeError.style.display = 'none';
    addToCart(selectedQuickViewProduct.id, selectedSize);
    closeQuickView();
    // Auto-open cart drawer to show items added
    setTimeout(() => {
      cartDrawer.classList.add('active');
      cartOverlay.classList.add('active');
      renderCart();
    }, 450);
  });

  // Checkout Wizard activation
  goToCheckoutBtn.addEventListener('click', () => {
    if (cart.length === 0) return;
    cartDrawer.classList.remove('active');
    cartOverlay.classList.remove('active');
    openCheckout();
  });

  checkoutClose.addEventListener('click', closeCheckout);
  checkoutModalOverlay.addEventListener('click', (e) => {
    if (e.target === checkoutModalOverlay) {
      // Don't close if order is already completed
      if (!step3Panel.classList.contains('active')) {
        closeCheckout();
      }
    }
  });

  // Checkout Step 1 Submit
  step1Form.addEventListener('submit', (e) => {
    e.preventDefault();
    // Transition to step 2
    step1Form.classList.remove('active');
    step2Panel.classList.add('active');
    
    stepInd1.classList.remove('active');
    stepInd2.classList.add('active');
    stepLine1.classList.add('active');
    
    // Update Checkout final values
    updateCheckoutSummary();
  });

  // Payment Selection toggling
  const paymentCards = document.querySelectorAll('.payment-card');
  paymentCards.forEach(card => {
    card.addEventListener('click', () => {
      paymentCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      
      const radio = card.querySelector('input[type="radio"]');
      radio.checked = true;
      
      // Toggle conditional fields
      const upiBox = document.getElementById('upi-details-box');
      const cardBox = document.getElementById('card-details-box');
      
      if (radio.value === 'upi') {
        upiBox.style.display = 'block';
        cardBox.style.display = 'none';
      } else if (radio.value === 'card') {
        upiBox.style.display = 'none';
        cardBox.style.display = 'block';
      } else {
        upiBox.style.display = 'none';
        cardBox.style.display = 'none';
      }
    });
  });

  // Back button in Payment screen
  checkoutBackBtn.addEventListener('click', () => {
    step2Panel.classList.remove('active');
    step1Form.classList.add('active');
    
    stepInd2.classList.remove('active');
    stepInd1.classList.add('active');
    stepLine1.classList.remove('active');
  });

  // Pay / Place Order Click
  checkoutPayBtn.addEventListener('click', () => {
    // Generate simulated order
    const randomOrderId = '#GNZ-' + Math.floor(100000 + Math.random() * 900000);
    confirmedOrderId.textContent = randomOrderId;
    
    // Transition to step 3
    step2Panel.classList.remove('active');
    step3Panel.classList.add('active');
    
    stepInd2.classList.remove('active');
    stepInd3.classList.add('active');
    stepLine2.classList.add('active');
    
    // Clear cart
    cart = [];
    activeDiscount = 0.0;
    promoCodeInput.value = '';
    promoMessage.className = 'promo-feedback';
    promoMessage.textContent = '';
    updateCartCount();
  });

  // Checkout Success Continue Shopping
  checkoutSuccessContinue.addEventListener('click', () => {
    closeCheckout();
  });

  // Promo apply
  promoApplyBtn.addEventListener('click', () => {
    const code = promoCodeInput.value.trim().toUpperCase();
    if (code === 'GENZ10') {
      activeDiscount = 0.10;
      promoMessage.className = 'promo-feedback success';
      promoMessage.textContent = '10% Discount Applied!';
      updateCheckoutSummary();
    } else {
      promoMessage.className = 'promo-feedback error';
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

// 7. Add to Cart Handler
function addToCart(productId, size) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  // Check if item with exact product ID and size already in cart
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

  // Update navbar/mobile bag badges
  updateCartCount();
  
  // Quick floating animations on cart icons
  animateCartIcon();
}

function updateCartCount() {
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  cartBadge.textContent = totalItems;
  cartBadgeMobile.textContent = totalItems;
  cartCountHeader.textContent = totalItems;
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

// 8. Render Cart Items inside Drawer
function renderCart() {
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="cart-empty-view">
        <i class="ri-shopping-bag-line"></i>
        <h3>Your shopping bag is empty</h3>
        <button class="btn btn-primary" onclick="closeCartDrawer()">CONTINUE SHOPPING</button>
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
        <img class="cart-item-img" src="${item.product.images[0]}" alt="${item.product.name}">
        <div class="cart-item-info">
          <h4>${item.product.name}</h4>
          <span class="cart-item-size">Size: ${item.size}</span>
          <div class="cart-item-bottom">
            <div class="qty-selectors">
              <button class="qty-btn" onclick="updateQty(${index}, -1)"><i class="ri-subtract-line"></i></button>
              <span class="qty-val">${item.quantity}</span>
              <button class="qty-btn" onclick="updateQty(${index}, 1)"><i class="ri-add-line"></i></button>
            </div>
            <span class="cart-item-price">₹${itemTotal}</span>
          </div>
        </div>
        <button class="cart-item-remove" onclick="removeCartItem(${index})" aria-label="Remove item">
          <i class="ri-delete-bin-line"></i>
        </button>
      </div>
    `;
  }).join('');

  cartSubtotalVal.textContent = `₹${subtotal}`;
  
  // Shipping Meter Calculation
  if (subtotal >= SHIPPING_THRESHOLD) {
    shippingMessage.innerHTML = `<span style="color: var(--color-primary)">🔥 CONGRATULATIONS! YOU UNLOCKED FREE SHIPPING!</span>`;
    shippingProgress.style.width = '100%';
  } else {
    const remaining = SHIPPING_THRESHOLD - subtotal;
    shippingMessage.textContent = `Add ₹${remaining} more for FREE SHIPPING`;
    const percent = (subtotal / SHIPPING_THRESHOLD) * 100;
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

// 9. Quick View Modal controller
function openQuickView(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  selectedQuickViewProduct = product;
  selectedSize = ''; // reset size choice
  sizeError.style.display = 'none';

  // Load product details
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

  // Load image thumbnails
  if (product.images.length > 1) {
    qvThumbnailsContainer.style.display = 'flex';
    qvThumbnailsContainer.innerHTML = product.images.map((img, i) => 
      `<img class="qv-thumb ${i === 0 ? 'active' : ''}" src="${img}" alt="Thumbnail ${i+1}" onclick="switchQvImage(this, '${img}')">`
    ).join('');
  } else {
    qvThumbnailsContainer.style.display = 'none';
  }

  // Load sizing options
  qvSizeOptions.innerHTML = product.sizes.map(size => 
    `<button class="size-option" onclick="selectSize(this, '${size}')">${size}</button>`
  ).join('');

  // Show Modal
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
  document.querySelectorAll('.size-option').forEach(opt => opt.classList.remove('active'));
  btn.classList.add('active');
};

function closeQuickView() {
  quickViewOverlay.classList.remove('active');
  selectedQuickViewProduct = null;
}

// 10. Checkout Flow Controller
function openCheckout() {
  // Reset forms & progress indicators
  step1Form.classList.add('active');
  step2Panel.classList.remove('active');
  step3Panel.classList.remove('active');
  
  stepInd1.classList.add('active');
  stepInd2.classList.remove('active');
  stepInd3.classList.remove('active');
  stepLine1.classList.remove('active');
  stepLine2.classList.remove('active');

  // Load checkout sidebar items
  renderCheckoutSummaryItems();

  checkoutModalOverlay.classList.add('active');
}

function closeCheckout() {
  checkoutModalOverlay.classList.remove('active');
}

function renderCheckoutSummaryItems() {
  checkoutItemsList.innerHTML = cart.map(item => `
    <div class="co-item">
      <img class="co-item-img" src="${item.product.images[0]}" alt="${item.product.name}">
      <div class="co-item-info">
        <h4 class="co-item-name">${item.product.name}</h4>
        <span class="co-item-meta">Size: ${item.size} | Qty: ${item.quantity}</span>
      </div>
      <span class="co-item-price">₹${item.product.price * item.quantity}</span>
    </div>
  `).join('');
}

function updateCheckoutSummary() {
  const subtotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  coSubtotal.textContent = `₹${subtotal}`;

  // Shipping
  const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;
  coShipping.textContent = shipping === 0 ? 'FREE' : `₹${shipping}`;

  // Discount
  const discountVal = Math.round(subtotal * activeDiscount);
  if (discountVal > 0) {
    coDiscountRow.style.display = 'flex';
    coDiscount.textContent = `-₹${discountVal}`;
  } else {
    coDiscountRow.style.display = 'none';
  }

  // Grand Total
  const grandTotal = subtotal + shipping - discountVal;
  coTotal.textContent = `₹${grandTotal}`;
  payAmountSpan.textContent = grandTotal;
}
