/**
 * NOIRVANE APP v2.0
 * Performance-optimized customer-side rendering engine
 */

const App = {
  cache: new Map(),
  observers: [],

  init() {
    this.bindGlobalEvents();
    this.initLazyLoad();
    this.initCart();
    this.initSearch();
    this.initMobileMenu();
    this.initScrollReveal();
    this.initNavbarScroll();

    document.addEventListener('catalog-updated', () => {
      this.refreshPageData();
    });

    const page = document.body.dataset.page;
    if (page === 'home') this.initHome();
    if (page === 'shop') this.initShop();
    if (page === 'product') this.initProduct();
    if (page === 'cart') this.initCartPage();
    if (page === 'checkout') this.initCheckout();
  },

  formatPrice(p) { return '$' + parseFloat(p).toFixed(2); },

  getStars(r) {
    const full = Math.floor(r);
    const half = r % 1 >= 0.5;
    return '\u2605'.repeat(full) + (half ? '\u00bd' : '') + '\u2606'.repeat(5 - full - (half ? 1 : 0));
  },

  throttle(fn, wait) {
    let last = 0;
    return (...args) => {
      const now = Date.now();
      if (now - last >= wait) { last = now; fn.apply(this, args); }
    };
  },

  debounce(fn, wait) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn.apply(this, args), wait); };
  },

  initLazyLoad() {
    if ('IntersectionObserver' in window) {
      const imgObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              img.classList.add('loaded');
            }
            imgObserver.unobserve(img);
          }
        });
      }, { rootMargin: '50px' });
      document.querySelectorAll('img[data-src]').forEach(img => imgObserver.observe(img));
    } else {
      document.querySelectorAll('img[data-src]').forEach(img => { img.src = img.dataset.src; });
    }
  },

  initCart() {
    this.updateCartCount();
    const openBtns = document.querySelectorAll('[data-open-cart]');
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    const closeBtn = document.getElementById('closeCart');

    openBtns.forEach(btn => btn.addEventListener('click', () => this.openCart(sidebar, overlay)));
    if (closeBtn) closeBtn.addEventListener('click', () => this.closeCart(sidebar, overlay));
    if (overlay) overlay.addEventListener('click', () => this.closeCart(sidebar, overlay));
  },

  openCart(sidebar, overlay) {
    if (!sidebar) return;
    this.renderCartSidebar();
    sidebar.classList.add('open');
    if (overlay) overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  },

  closeCart(sidebar, overlay) {
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
  },

  getCart() { return DB.getCart(); },

  addToCart(productId, size, color, qty) {
    const cart = this.getCart();
    const existing = cart.find(item => item.id == productId && item.size === size && item.color === color);
    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({ id: parseInt(productId), size, color, qty });
    }
    DB.saveCart(cart);
    this.updateCartCount();
    this.renderCartSidebar();
    this.showToast('Added to cart', 'check');
  },

  removeFromCart(index) {
    const cart = this.getCart();
    cart.splice(index, 1);
    DB.saveCart(cart);
    this.updateCartCount();
    this.renderCartSidebar();
    if (document.body.dataset.page === 'cart') this.initCartPage();
  },

  updateCartQty(index, delta) {
    const cart = this.getCart();
    cart[index].qty += delta;
    if (cart[index].qty < 1) {
      this.removeFromCart(index);
      return;
    }
    DB.saveCart(cart);
    this.updateCartCount();
    this.renderCartSidebar();
    if (document.body.dataset.page === 'cart') this.initCartPage();
  },

  updateCartCount() {
    const cart = this.getCart();
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    document.querySelectorAll('.cart-count').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  },

  getCartTotal() {
    return this.getCart().reduce((sum, item) => {
      const p = DB.getProduct(item.id);
      return sum + ((p?.salePrice || p?.price || 0) * item.qty);
    }, 0);
  },

  renderCartSidebar() {
    const container = document.getElementById('cartItems');
    const totalEl = document.getElementById('cartTotal');
    if (!container) return;

    const cart = this.getCart();
    if (cart.length === 0) {
      container.innerHTML = `
        <div class="cart-empty">
          <i class="fas fa-shopping-bag"></i>
          <p>Your cart is empty</p>
          <a href="shop.html" class="btn btn-sm">Shop Now</a>
        </div>`;
      if (totalEl) totalEl.textContent = this.formatPrice(0);
      return;
    }

    container.innerHTML = cart.map((item, i) => {
      const p = DB.getProduct(item.id);
      if (!p) return '';
      const price = p.salePrice || p.price;
      return `
        <div class="cart-item" data-index="${i}">
          <div class="cart-item-image">
            <img src="${p.image}" alt="${p.name}" loading="lazy">
          </div>
          <div class="cart-item-details">
            <div class="cart-item-name">${p.name}</div>
            <div class="cart-item-meta">${item.size} / ${item.color}</div>
            <div class="cart-item-actions">
              <button class="qty-btn" aria-label="Decrease quantity">-</button>
              <span class="qty-value">${item.qty}</span>
              <button class="qty-btn" aria-label="Increase quantity">+</button>
              <span class="cart-item-price">${this.formatPrice(price * item.qty)}</span>
            </div>
          </div>
          <button class="remove-item" aria-label="Remove item"><i class="fas fa-trash"></i></button>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const item = e.target.closest('.cart-item');
        const idx = parseInt(item.dataset.index);
        const delta = e.target.textContent === '+' ? 1 : -1;
        this.updateCartQty(idx, delta);
      });
    });

    container.querySelectorAll('.remove-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.closest('.cart-item').dataset.index);
        this.removeFromCart(idx);
      });
    });

    if (totalEl) totalEl.textContent = this.formatPrice(this.getCartTotal());
  },

  createCard(p) {
    const priceHtml = p.salePrice
      ? '<span class="price-sale">' + this.formatPrice(p.price) + '</span><span class="price">' + this.formatPrice(p.salePrice) + '</span>'
      : '<span class="price">' + this.formatPrice(p.price) + '</span>';

    const badgeHtml = p.badge ? '<span class="badge badge-' + p.badge.toLowerCase() + '">' + p.badge + '</span>' : '';
    const inWish = DB.getWishlist().includes(p.id);

    return `
      <article class="product-card" data-id="${p.id}" style="contain: layout style paint;">
        <div class="product-image">
          <img data-src="${p.image}" alt="${p.name} - ${p.colors[0]} ${p.subcategory}" loading="lazy">
          ${badgeHtml}
          <div class="product-actions">
            <button class="action-btn wishlist-btn ${inWish ? 'active' : ''}" data-id="${p.id}" aria-label="Toggle wishlist">
              <i class="fas fa-heart"></i>
            </button>
            <a href="product.html?id=${p.id}" class="action-btn" aria-label="View product">
              <i class="fas fa-eye"></i>
            </a>
          </div>
        </div>
        <div class="product-info">
          <div class="product-category">${p.subcategory}</div>
          <h3 class="product-name"><a href="product.html?id=${p.id}">${p.name}</a></h3>
          <div class="product-price">${priceHtml}</div>
          <div class="rating">${this.getStars(p.rating)} <span>(${p.reviews})</span></div>
          <button class="add-to-cart-btn" data-id="${p.id}" data-colors="${p.colors[0]}" data-sizes="${p.sizes[Math.floor(p.sizes.length/2)]}">
            <i class="fas fa-shopping-bag"></i> Quick Add
          </button>
        </div>
      </article>
    `;
  },

  renderGrid(container, products) {
    if (!container) return;
    const frag = document.createDocumentFragment();
    const wrapper = document.createElement('div');
    wrapper.className = 'product-grid';
    wrapper.innerHTML = products.map(p => this.createCard(p)).join('');
    frag.appendChild(wrapper);
    container.innerHTML = '';
    container.appendChild(frag);
    this.initLazyLoad();
    this.bindCardEvents();
    this.initScrollReveal();
  },

  bindCardEvents() {
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = parseInt(btn.dataset.id);
        const list = DB.getWishlist();
        const idx = list.indexOf(id);
        if (idx > -1) { list.splice(idx, 1); btn.classList.remove('active'); this.showToast('Removed from wishlist', 'heart-broken'); }
        else { list.push(id); btn.classList.add('active'); this.showToast('Added to wishlist', 'heart'); }
        DB.saveWishlist(list);
      });
    });

    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = parseInt(btn.dataset.id);
        const size = btn.dataset.sizes;
        const color = btn.dataset.colors;
        this.addToCart(id, size, color, 1);
      });
    });
  },

  initHome() {
    const products = DB.getProducts();

    const heroBg = document.querySelector('.hero-bg');
    if (heroBg) {
      heroBg.style.backgroundImage = "url('https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&q=80')";
    }

    const featured = document.getElementById('featuredProducts');
    if (featured) this.renderGrid(featured, products.filter(p => p.badge).slice(0, 4));

    const newArrivals = document.getElementById('newArrivals');
    if (newArrivals) this.renderGrid(newArrivals, products.filter(p => p.badge === 'New').slice(0, 4));

    const bestSellers = document.getElementById('bestSellers');
    if (bestSellers) this.renderGrid(bestSellers, [...products].sort((a,b) => b.reviews - a.reviews).slice(0, 4));

    const trending = document.getElementById('trendingProducts');
    if (trending) this.renderGrid(trending, products.filter(p => p.badge === 'Trending').slice(0, 4));

    const catGrid = document.getElementById('categoryGrid');
    if (catGrid) {
      const cats = [
        { key: 'tops', name: 'Tops', count: products.filter(p => p.category === 'tops').length, img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80' },
        { key: 'hoodies', name: 'Hoodies', count: products.filter(p => p.category === 'hoodies').length, img: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80' },
        { key: 'outerwear', name: 'Outerwear', count: products.filter(p => p.category === 'outerwear').length, img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80' },
        { key: 'bottoms', name: 'Bottoms', count: products.filter(p => p.category === 'bottoms').length, img: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80' },
        { key: 'footwear', name: 'Footwear', count: products.filter(p => p.category === 'footwear').length, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80' },
        { key: 'accessories', name: 'Accessories', count: products.filter(p => p.category === 'accessories').length, img: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600&q=80' }
      ];
      catGrid.innerHTML = cats.map(c => `
        <a href="shop.html?cat=${c.key}" class="category-card reveal">
          <img data-src="${c.img}" alt="${c.name} category" loading="lazy">
          <div class="category-overlay">
            <div class="category-name">${c.name}</div>
            <div class="category-count">${c.count} Products</div>
          </div>
        </a>
      `).join('');
      this.initLazyLoad();
    }

    this.initCountdown();
  },

  initCountdown() {
    const el = document.getElementById('countdown');
    if (!el) return;
    const end = new Date(Date.now() + 72 * 3600 * 1000);
    const update = () => {
      const diff = end - Date.now();
      if (diff <= 0) return;
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      el.innerHTML = `
        <div class="countdown-item"><div class="countdown-value">${String(d).padStart(2,'0')}</div><div class="countdown-label">Days</div></div>
        <div class="countdown-item"><div class="countdown-value">${String(h).padStart(2,'0')}</div><div class="countdown-label">Hours</div></div>
        <div class="countdown-item"><div class="countdown-value">${String(m).padStart(2,'0')}</div><div class="countdown-label">Mins</div></div>
        <div class="countdown-item"><div class="countdown-value">${String(s).padStart(2,'0')}</div><div class="countdown-label">Secs</div></div>
      `;
    };
    update();
    setInterval(update, 1000);
  },

  initShop() {
    const grid = document.getElementById('shopGrid');
    const searchInput = document.getElementById('shopSearch');
    const sortSelect = document.getElementById('sortSelect');
    const priceSlider = document.getElementById('priceSlider');
    const priceValue = document.getElementById('priceValue');
    const resultsCount = document.getElementById('resultsCount');
    const catFilters = document.querySelectorAll('.cat-filter');
    const subFilters = document.querySelectorAll('.sub-filter');

    let filters = {
      categories: [],
      subcategories: [],
      maxPrice: 600,
      search: '',
      sort: 'featured'
    };

    const applyFilters = () => {
      let filtered = DB.getProducts().filter(p => {
        const price = p.salePrice || p.price;
        if (filters.categories.length && !filters.categories.includes(p.category)) return false;
        if (filters.subcategories.length && !filters.subcategories.includes(p.subcategory)) return false;
        if (price > filters.maxPrice) return false;
        if (filters.search && !p.name.toLowerCase().includes(filters.search.toLowerCase()) && !p.subcategory.toLowerCase().includes(filters.search.toLowerCase())) return false;
        return true;
      });

      switch(filters.sort) {
        case 'price-low': filtered.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price)); break;
        case 'price-high': filtered.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price)); break;
        case 'newest': filtered.sort((a, b) => b.id - a.id); break;
        case 'rating': filtered.sort((a, b) => b.rating - a.rating); break;
        default: filtered.sort((a, b) => (b.badge ? 1 : 0) - (a.badge ? 1 : 0));
      }

      if (resultsCount) resultsCount.textContent = filtered.length + ' product' + (filtered.length !== 1 ? 's' : '');
      this.renderGrid(grid, filtered);
    };

    if (searchInput) {
      searchInput.addEventListener('input', this.debounce((e) => {
        filters.search = e.target.value;
        applyFilters();
      }, 300));
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => { filters.sort = e.target.value; applyFilters(); });
    }

    if (priceSlider) {
      priceSlider.addEventListener('input', (e) => {
        filters.maxPrice = parseInt(e.target.value);
        if (priceValue) priceValue.textContent = this.formatPrice(filters.maxPrice);
        applyFilters();
      });
    }

    catFilters.forEach(cb => cb.addEventListener('change', () => {
      filters.categories = Array.from(document.querySelectorAll('.cat-filter:checked')).map(c => c.value);
      applyFilters();
    }));

    subFilters.forEach(cb => cb.addEventListener('change', () => {
      filters.subcategories = Array.from(document.querySelectorAll('.sub-filter:checked')).map(c => c.value);
      applyFilters();
    }));

    const params = new URLSearchParams(window.location.search);
    const cat = params.get('cat');
    if (cat) {
      const cb = document.querySelector('.cat-filter[value="' + cat + '"]');
      if (cb) { cb.checked = true; filters.categories = [cat]; }
    }

    applyFilters();
  },

  initProduct() {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'));
    const p = DB.getProduct(id);
    if (!p) { window.location.href = 'shop.html'; return; }

    document.title = p.name + ' | Noirvane';

    const mainImg = document.getElementById('mainImage');
    if (mainImg) mainImg.src = p.image;

    const setText = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
    setText('productName', p.name);
    setText('productCategory', p.subcategory);
    setText('productSku', p.sku);
    setText('productDesc', p.description);
    setText('productFit', p.fit);
    setText('productMaterial', p.material);
    setText('productStock', p.stock + ' available');
    setText('productFitSpec', p.fit);
    setText('productSkuSpec', p.sku);

    const priceEl = document.getElementById('productPrice');
    if (priceEl) {
      priceEl.innerHTML = p.salePrice
        ? '<span class="price-sale">' + this.formatPrice(p.price) + '</span><span class="price" style="font-size:2rem;">' + this.formatPrice(p.salePrice) + '</span>'
        : '<span class="price" style="font-size:2rem;">' + this.formatPrice(p.price) + '</span>';
    }

    const ratingEl = document.getElementById('productRating');
    if (ratingEl) ratingEl.innerHTML = this.getStars(p.rating) + ' <span>(' + p.reviews + ' reviews)</span>';

    const sizeContainer = document.getElementById('sizeSelector');
    if (sizeContainer) {
      sizeContainer.innerHTML = p.sizes.map((s, i) => 
        '<button class="size-option ' + (i === Math.floor(p.sizes.length/2) ? 'active' : '') + '" data-size="' + s + '">' + s + '</button>'
      ).join('');
      sizeContainer.querySelectorAll('.size-option').forEach(btn => {
        btn.addEventListener('click', () => {
          sizeContainer.querySelectorAll('.size-option').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        });
      });
    }

    const colorContainer = document.getElementById('colorSelector');
    if (colorContainer) {
      colorContainer.innerHTML = p.colors.map((c, i) => 
        '<button class="color-option ' + (i === 0 ? 'active' : '') + '" style="background:' + c.toLowerCase() + ';" data-color="' + c + '" title="' + c + '"></button>'
      ).join('');
      colorContainer.querySelectorAll('.color-option').forEach(btn => {
        btn.addEventListener('click', () => {
          colorContainer.querySelectorAll('.color-option').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        });
      });
    }

    const qtyInput = document.getElementById('qtyInput');
    document.getElementById('qtyMinus')?.addEventListener('click', () => {
      if (qtyInput) qtyInput.value = Math.max(1, parseInt(qtyInput.value) - 1);
    });
    document.getElementById('qtyPlus')?.addEventListener('click', () => {
      if (qtyInput) qtyInput.value = Math.min(p.stock, parseInt(qtyInput.value) + 1);
    });

    document.getElementById('addToCartBtn')?.addEventListener('click', () => {
      const size = sizeContainer?.querySelector('.size-option.active')?.dataset.size || p.sizes[0];
      const color = colorContainer?.querySelector('.color-option.active')?.dataset.color || p.colors[0];
      const qty = parseInt(qtyInput?.value) || 1;
      this.addToCart(p.id, size, color, qty);
    });

    const wishBtn = document.getElementById('productWishlist');
    if (wishBtn) {
      const updateWish = () => {
        const active = DB.getWishlist().includes(p.id);
        wishBtn.classList.toggle('active', active);
      };
      updateWish();
      wishBtn.addEventListener('click', () => {
        const list = DB.getWishlist();
        const idx = list.indexOf(p.id);
        if (idx > -1) { list.splice(idx, 1); this.showToast('Removed from wishlist', 'heart-broken'); }
        else { list.push(p.id); this.showToast('Added to wishlist', 'heart'); }
        DB.saveWishlist(list);
        updateWish();
      });
    }

    const related = document.getElementById('relatedProducts');
    if (related) {
      const items = DB.getProducts().filter(pr => pr.category === p.category && pr.id !== p.id).slice(0, 4);
      this.renderGrid(related, items);
    }

    const reviewsList = document.getElementById('reviewsList');
    if (reviewsList) {
      const reviews = [
        { author: "Marcus T.", date: "2 weeks ago", text: "Exceptional quality and fit. The fabric feels premium and the stitching is impeccable. True to the exact description and image.", rating: 5 },
        { author: "James K.", date: "1 month ago", text: "Great piece. The fit is exactly as shown. Consider sizing down if you prefer a tighter fit.", rating: 4 },
        { author: "Alex R.", date: "2 months ago", text: "Absolutely love this. The material feels incredible and the color matches the photos perfectly.", rating: 5 },
        { author: "David L.", date: "3 months ago", text: "Solid purchase. Fast shipping and the product looks exactly like the images on the site.", rating: 4 }
      ];
      reviewsList.innerHTML = reviews.map(r => `
        <div class="review-card reveal">
          <div class="review-header">
            <div>
              <div class="review-author">${r.author}</div>
              <div class="rating">${this.getStars(r.rating)}</div>
            </div>
            <div class="review-date">${r.date}</div>
          </div>
          <div class="review-text">${r.text}</div>
        </div>
      `).join('');
    }
  },

  initCartPage() {
    const container = document.getElementById('cartItemsList');
    const summary = document.getElementById('cartSummary');
    if (!container) return;

    const cart = this.getCart();
    if (cart.length === 0) {
      container.innerHTML = `
        <div class="cart-empty-page">
          <i class="fas fa-shopping-bag"></i>
          <h2>Your cart is empty</h2>
          <p>Discover our latest collection and add some items.</p>
          <a href="shop.html" class="btn btn-primary">Continue Shopping</a>
        </div>`;
      if (summary) summary.style.display = 'none';
      return;
    }

    container.innerHTML = `
      <div class="cart-table-header">
        <div>Product</div><div>Price</div><div>Quantity</div><div>Total</div><div></div>
      </div>
      ${cart.map((item, i) => {
        const p = DB.getProduct(item.id);
        if (!p) return '';
        const price = p.salePrice || p.price;
        return `
          <div class="cart-table-row" data-index="${i}">
            <div class="cart-product-info">
              <img src="${p.image}" alt="${p.name}" loading="lazy">
              <div class="cart-product-details">
                <h4>${p.name}</h4>
                <p>${item.size} / ${item.color}</p>
              </div>
            </div>
            <div>${this.formatPrice(price)}</div>
            <div class="cart-qty">
              <button class="qty-btn" data-delta="-1">-</button>
              <span>${item.qty}</span>
              <button class="qty-btn" data-delta="1">+</button>
            </div>
            <div style="font-weight:700;">${this.formatPrice(price * item.qty)}</div>
            <button class="remove-item" aria-label="Remove"><i class="fas fa-trash"></i></button>
          </div>
        `;
      }).join('')}
    `;

    container.addEventListener('click', (e) => {
      const row = e.target.closest('.cart-table-row');
      if (!row) return;
      const idx = parseInt(row.dataset.index);

      if (e.target.closest('.remove-item')) {
        this.removeFromCart(idx);
      } else if (e.target.classList.contains('qty-btn')) {
        this.updateCartQty(idx, parseInt(e.target.dataset.delta));
      }
    });

    const subtotal = this.getCartTotal();
    const shipping = subtotal > 200 ? 0 : 15;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    if (summary) {
      summary.style.display = 'block';
      summary.innerHTML = `
        <h3>Order Summary</h3>
        <div class="summary-row"><span>Subtotal</span><span>${this.formatPrice(subtotal)}</span></div>
        <div class="summary-row"><span>Shipping</span><span>${shipping === 0 ? 'Free' : this.formatPrice(shipping)}</span></div>
        <div class="summary-row"><span>Estimated Tax</span><span>${this.formatPrice(tax)}</span></div>
        <div class="summary-row total"><span>Total</span><span>${this.formatPrice(total)}</span></div>
        <div class="promo-input">
          <input type="text" placeholder="Promo code" id="promoCode">
          <button id="applyPromo">Apply</button>
        </div>
        <p class="shipping-note">Free shipping on orders over $200</p>
        <a href="checkout.html" class="checkout-btn">Proceed to Checkout</a>
        <a href="shop.html" class="continue-link">Continue Shopping</a>
      `;

      document.getElementById('applyPromo')?.addEventListener('click', () => {
        const code = document.getElementById('promoCode')?.value.toUpperCase();
        if (code === 'NOIR10') this.showToast('10% discount applied!', 'tag');
        else this.showToast('Invalid promo code', 'times');
      });
    }
  },

  initCheckout() {
    const container = document.getElementById('checkoutItems');
    const summary = document.getElementById('checkoutSummary');
    if (!container) return;

    const cart = this.getCart();
    const subtotal = this.getCartTotal();
    const shipping = subtotal > 200 ? 0 : 15;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    container.innerHTML = cart.map(item => {
      const p = DB.getProduct(item.id);
      if (!p) return '';
      const price = p.salePrice || p.price;
      return `
        <div class="order-item">
          <img src="${p.image}" alt="${p.name}" loading="lazy">
          <div class="order-item-details">
            <h4>${p.name}</h4>
            <p>${item.size} / ${item.color} x ${item.qty}</p>
          </div>
          <div class="order-item-price">${this.formatPrice(price * item.qty)}</div>
        </div>
      `;
    }).join('');

    if (summary) {
      summary.innerHTML = `
        <div class="summary-row"><span>Subtotal</span><span>${this.formatPrice(subtotal)}</span></div>
        <div class="summary-row"><span>Shipping</span><span>${shipping === 0 ? 'Free' : this.formatPrice(shipping)}</span></div>
        <div class="summary-row"><span>Tax (8%)</span><span>${this.formatPrice(tax)}</span></div>
        <div class="summary-row total"><span>Total</span><span>${this.formatPrice(total)}</span></div>
      `;
    }

    document.querySelectorAll('.payment-method').forEach(pm => {
      pm.addEventListener('click', () => {
        document.querySelectorAll('.payment-method').forEach(p => p.classList.remove('active'));
        pm.classList.add('active');
      });
    });

    const form = document.getElementById('checkoutForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const order = {
          id: 'NV-' + Date.now().toString(36).toUpperCase(),
          date: new Date().toISOString(),
          items: [...cart],
          total: total,
          status: 'Processing',
          customer: {
            email: form.querySelector('[name="email"]')?.value,
            name: (form.querySelector('[name="firstName"]')?.value || '') + ' ' + (form.querySelector('[name="lastName"]')?.value || '')
          }
        };
        DB.saveOrder(order);
        this.updateCartCount();
        this.showToast('Order placed! #' + order.id, 'check-circle');
        setTimeout(() => window.location.href = 'index.html', 2000);
      });
    }
  },

  initSearch() {
    const modal = document.getElementById('searchModal');
    const input = document.getElementById('searchInput');
    const results = document.getElementById('searchResults');

    document.querySelectorAll('[data-open-search]').forEach(btn => {
      btn.addEventListener('click', () => {
        modal?.classList.add('open');
        setTimeout(() => input?.focus(), 100);
      });
    });

    document.getElementById('closeSearch')?.addEventListener('click', () => modal?.classList.remove('open'));

    if (input) {
      input.addEventListener('input', this.debounce((e) => {
        const q = e.target.value.toLowerCase();
        if (!q) { results.innerHTML = ''; return; }
        const filtered = DB.getProducts().filter(p => p.name.toLowerCase().includes(q) || p.subcategory.toLowerCase().includes(q));
        results.innerHTML = filtered.slice(0, 6).map(p => `
          <a href="product.html?id=${p.id}" class="search-result-item">
            <img src="${p.image}" alt="${p.name}" loading="lazy">
            <div>
              <div class="search-result-name">${p.name}</div>
              <div class="search-result-meta">${p.subcategory} &bull; ${this.formatPrice(p.salePrice || p.price)}</div>
            </div>
          </a>
        `).join('') || '<div class="search-empty">No products found</div>';
      }, 200));
    }
  },

  initMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    const overlay = document.getElementById('mobileOverlay');
    const openBtn = document.getElementById('mobileMenuBtn');
    const closeBtn = document.getElementById('closeMobileMenu');

    const open = () => { menu?.classList.add('open'); overlay?.classList.add('open'); };
    const close = () => { menu?.classList.remove('open'); overlay?.classList.remove('open'); };

    openBtn?.addEventListener('click', open);
    closeBtn?.addEventListener('click', close);
    overlay?.addEventListener('click', close);
  },

  initNavbarScroll() {
    const nav = document.querySelector('.navbar');
    if (!nav) return;
    let last = 0;
    window.addEventListener('scroll', this.throttle(() => {
      const current = window.pageYOffset;
      nav.style.background = current > 80 ? 'rgba(10,10,10,0.98)' : 'rgba(10,10,10,0.85)';
      nav.style.padding = current > 80 ? '0.6rem 0' : '1rem 0';
      last = current;
    }, 100), { passive: true });
  },

  initScrollReveal() {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

      document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    } else {
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('active'));
    }
  },

  showToast(msg, icon) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = '<span class="toast-icon"><i class="fas fa-' + icon + '"></i></span><span>' + msg + '</span>';
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, 3000);
  },

  refreshPageData() {
    const page = document.body.dataset.page;
    if (page === 'shop') this.initShop();
    if (page === 'home') this.initHome();
    this.showToast('Catalog updated', 'sync');
  },

  bindGlobalEvents() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal.open, .cart-sidebar.open, .search-modal.open').forEach(el => el.classList.remove('open'));
        document.querySelectorAll('.cart-overlay.open').forEach(el => el.classList.remove('open'));
        document.body.style.overflow = '';
      }
    });
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}
