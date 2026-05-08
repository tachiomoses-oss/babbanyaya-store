/* ==========================================================
   BABBANYAYA STORE — JAVASCRIPT
   ========================================================== */

'use strict';

// ============================================================
// STATE
// ============================================================

let cart = [];

// ============================================================
// DOM REFERENCES
// ============================================================

const cartBadge        = document.getElementById('cart-badge');
const cartToggle       = document.getElementById('cart-toggle');
const cartSidebar      = document.getElementById('cart-sidebar');
const cartOverlay      = document.getElementById('cart-overlay');
const cartClose        = document.getElementById('cart-close');
const cartEmpty        = document.getElementById('cart-empty');
const cartItemsList    = document.getElementById('cart-items-list');
const cartFooter       = document.getElementById('cart-footer');
const subtotalAmount   = document.getElementById('subtotal-amount');
const btnClearCart     = document.getElementById('btn-clear-cart');
const btnContinueShop  = document.getElementById('btn-continue-shop');
const productsGrid     = document.getElementById('products-grid');
const noProducts       = document.getElementById('no-products');
const categoryPills    = document.querySelectorAll('.cat-pill');
const hamburger        = document.getElementById('hamburger');
const mainNav          = document.getElementById('main-nav');
const siteHeader       = document.getElementById('site-header');
const newsletterForm   = document.getElementById('newsletter-form');
const newsletterEmail  = document.getElementById('newsletter-email');
const newsletterSuccess= document.getElementById('newsletter-success');
const newsletterError  = document.getElementById('newsletter-error');
const toast            = document.getElementById('toast');

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}

function formatPrice(n) {
  return '₦' + Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ============================================================
// CART OPEN / CLOSE
// ============================================================

function openCart() {
  cartSidebar.classList.add('active');
  cartOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  cartSidebar.setAttribute('aria-hidden', 'false');
}

function closeCart() {
  cartSidebar.classList.remove('active');
  cartOverlay.classList.remove('active');
  document.body.style.overflow = '';
  cartSidebar.setAttribute('aria-hidden', 'true');
}

cartToggle.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);
if (btnContinueShop) btnContinueShop.addEventListener('click', () => {
  closeCart();
  document.getElementById('shop').scrollIntoView({ behavior: 'smooth' });
});

// ============================================================
// CART BADGE UPDATE
// ============================================================

function updateCartBadge() {
  const total = cart.reduce((sum, item) => sum + item.qty, 0);
  cartBadge.textContent = total;

  // Bump animation
  cartBadge.classList.remove('bump');
  void cartBadge.offsetWidth; // reflow
  if (total > 0) cartBadge.classList.add('bump');
  setTimeout(() => cartBadge.classList.remove('bump'), 400);
}

// ============================================================
// CART RENDER
// ============================================================

function getProductGradient(category) {
  const gradients = {
    women:       'linear-gradient(135deg, #C0392B, #F39C12)',
    men:         'linear-gradient(135deg, #1B3A6B, #C8893A)',
    kids:        'linear-gradient(135deg, #F48FB1, #A5D6A7)',
    accessories: 'linear-gradient(135deg, #1A1A1A, #C8893A)',
  };
  return gradients[category] || 'linear-gradient(135deg, #C8893A, #2C1810)';
}

function renderCart() {
  if (cart.length === 0) {
    cartEmpty.style.display = 'flex';
    cartItemsList.style.display = 'none';
    cartFooter.style.display = 'none';
    return;
  }

  cartEmpty.style.display = 'none';
  cartItemsList.style.display = 'block';
  cartFooter.style.display = 'flex';

  cartItemsList.innerHTML = cart.map(item => `
    <div class="cart-item" data-cart-id="${item.cartId}">
      <div class="cart-item-thumb" style="background:${getProductGradient(item.category)};">
        <svg viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 8 C20 8 10 18 5 28 L18 33 L18 80 L62 80 L62 33 L75 28 C70 18 60 8 60 8 L48 16 C45 6 35 6 32 16 Z" fill="rgba(255,255,255,0.20)" stroke="rgba(255,255,255,0.45)" stroke-width="2"/>
        </svg>
      </div>
      <div class="cart-item-info">
        <div class="cart-item-name">${escapeHtml(item.name)}</div>
        <div class="cart-item-meta">${escapeHtml(item.color)} · Size: ${escapeHtml(item.size)}</div>
        <div class="cart-item-actions">
          <div class="qty-control">
            <button class="qty-btn" data-action="decrease" data-cart-id="${item.cartId}" aria-label="Decrease quantity">−</button>
            <span class="qty-num">${item.qty}</span>
            <button class="qty-btn" data-action="increase" data-cart-id="${item.cartId}" aria-label="Increase quantity">+</button>
          </div>
          <span class="cart-item-price">${formatPrice(item.price * item.qty)}</span>
          <button class="cart-item-remove" data-cart-id="${item.cartId}" aria-label="Remove item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `).join('');

  // Subtotal
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  subtotalAmount.textContent = formatPrice(subtotal);

  // Bind qty/remove events
  cartItemsList.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cartId = btn.dataset.cartId;
      const action = btn.dataset.action;
      const idx = cart.findIndex(i => i.cartId === cartId);
      if (idx === -1) return;
      if (action === 'increase') {
        cart[idx].qty++;
      } else {
        cart[idx].qty--;
        if (cart[idx].qty <= 0) cart.splice(idx, 1);
      }
      updateCartBadge();
      renderCart();
    });
  });

  cartItemsList.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const cartId = btn.dataset.cartId;
      cart = cart.filter(i => i.cartId !== cartId);
      updateCartBadge();
      renderCart();
      showToast('Item removed from cart');
    });
  });
}

// Clear cart
if (btnClearCart) {
  btnClearCart.addEventListener('click', () => {
    if (cart.length === 0) return;
    cart = [];
    updateCartBadge();
    renderCart();
    showToast('Cart cleared');
  });
}

// Checkout placeholder
document.querySelector('.btn-checkout')?.addEventListener('click', () => {
  showToast('Checkout coming soon! 🛍️');
});

// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ============================================================
// COLOR SWATCH SELECTION
// ============================================================

document.querySelectorAll('.product-card').forEach(card => {
  const swatches = card.querySelectorAll('.color-swatch');
  swatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      swatches.forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
    });
  });
});

// ============================================================
// SIZE PILL SELECTION
// ============================================================

document.querySelectorAll('.product-card').forEach(card => {
  const sizePills = card.querySelectorAll('.size-pill');
  const sizeError = card.querySelector('.size-error');

  sizePills.forEach(pill => {
    pill.addEventListener('click', () => {
      sizePills.forEach(p => p.classList.remove('selected'));
      pill.classList.add('selected');
      if (sizeError) sizeError.style.display = 'none';
    });
  });
});

// ============================================================
// ADD TO CART
// ============================================================

document.querySelectorAll('.btn-add-cart').forEach(btn => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.product-card');
    if (!card) return;

    // Get selected size
    const selectedSizePill = card.querySelector('.size-pill.selected');
    const sizeError = card.querySelector('.size-error');

    if (!selectedSizePill) {
      if (sizeError) {
        sizeError.style.display = 'block';
        sizeError.style.animation = 'none';
        void sizeError.offsetWidth;
      }
      // Shake the size pills
      const sizePillsContainer = card.querySelector('.size-pills');
      if (sizePillsContainer) {
        sizePillsContainer.style.animation = 'shake 0.4s ease';
        setTimeout(() => { sizePillsContainer.style.animation = ''; }, 400);
      }
      return;
    }

    const size = selectedSizePill.dataset.size;

    // Get selected color
    const selectedSwatch = card.querySelector('.color-swatch.active');
    const color = selectedSwatch ? selectedSwatch.dataset.color : 'Default';

    // Product data
    const name     = btn.dataset.name;
    const price    = parseFloat(btn.dataset.price);
    const category = btn.dataset.category;

    // Check if item already in cart with same name + color + size
    const existing = cart.find(i => i.name === name && i.color === color && i.size === size);
    if (existing) {
      existing.qty++;
    } else {
      cart.push({
        cartId: generateId(),
        name,
        price,
        category,
        color,
        size,
        qty: 1,
      });
    }

    updateCartBadge();
    renderCart();
    openCart();
    showToast(`${name} added to cart! 🛍️`);

    // Button feedback
    const origText = btn.textContent;
    btn.textContent = '✓ Added!';
    btn.style.background = '#22c55e';
    setTimeout(() => {
      btn.textContent = origText;
      btn.style.background = '';
    }, 1400);
  });
});

// Shake animation
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%       { transform: translateX(-5px); }
    40%       { transform: translateX(5px); }
    60%       { transform: translateX(-4px); }
    80%       { transform: translateX(4px); }
  }
`;
document.head.appendChild(shakeStyle);

// ============================================================
// CATEGORY FILTER
// ============================================================

function filterCategory(filter) {
  const cards = productsGrid.querySelectorAll('.product-card');
  let visibleCount = 0;

  cards.forEach(card => {
    const cat = card.dataset.category;
    if (filter === 'all' || cat === filter) {
      card.classList.remove('hidden');
      card.style.animationDelay = `${visibleCount * 0.04}s`;
      visibleCount++;
    } else {
      card.classList.add('hidden');
    }
  });

  noProducts.style.display = visibleCount === 0 ? 'flex' : 'none';

  // Update active pill
  categoryPills.forEach(pill => {
    pill.classList.toggle('active', pill.dataset.filter === filter);
  });
}

// Expose globally for footer links
window.filterCategory = filterCategory;

categoryPills.forEach(pill => {
  pill.addEventListener('click', () => {
    filterCategory(pill.dataset.filter);
    document.getElementById('shop').scrollIntoView({ behavior: 'smooth' });
  });
});

// ============================================================
// HAMBURGER MENU
// ============================================================

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mainNav.classList.toggle('open');
});

// Close on nav link click
mainNav.querySelectorAll('.nav-link, .nav-cart-btn').forEach(el => {
  el.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mainNav.classList.remove('open');
  });
});

// ============================================================
// STICKY HEADER SHADOW
// ============================================================

window.addEventListener('scroll', () => {
  siteHeader.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

// ============================================================
// SMOOTH SCROLL FOR NAV LINKS
// ============================================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const href = anchor.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth' });
  });
});

// ============================================================
// NEWSLETTER FORM
// ============================================================

newsletterForm.addEventListener('submit', e => {
  e.preventDefault();
  const email = newsletterEmail.value.trim();

  // Hide previous messages
  newsletterSuccess.style.display = 'none';
  newsletterError.style.display = 'none';

  // Basic validation
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRe.test(email)) {
    newsletterError.style.display = 'block';
    newsletterEmail.focus();
    return;
  }

  // Success state
  newsletterSuccess.style.display = 'flex';
  newsletterEmail.value = '';
  newsletterEmail.blur();
});

// ============================================================
// KEYBOARD TRAP IN CART SIDEBAR
// ============================================================

cartSidebar.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeCart();
});

// ============================================================
// INTERSECTION OBSERVER — fade-in product cards on scroll
// ============================================================

if ('IntersectionObserver' in window) {
  const fadeStyle = document.createElement('style');
  fadeStyle.textContent = `
    .product-card, .testimonial-card, .stat-box {
      opacity: 0;
      transform: translateY(24px);
      transition: opacity 0.5s ease, transform 0.5s ease;
    }
    .product-card.visible, .testimonial-card.visible, .stat-box.visible {
      opacity: 1;
      transform: translateY(0);
    }
  `;
  document.head.appendChild(fadeStyle);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, 60 * (entry.target.dataset.delay || 0));
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.10, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.product-card, .testimonial-card, .stat-box').forEach((el, i) => {
    el.dataset.delay = i % 4;
    observer.observe(el);
  });
}

// ============================================================
// INIT
// ============================================================

// Initialize cart UI
renderCart();
updateCartBadge();

// Ensure all products are shown on load
filterCategory('all');

console.log('%cBabbanYaya Store — Wear Your Heritage 🌍', 'color: #C8893A; font-size: 14px; font-weight: bold;');
