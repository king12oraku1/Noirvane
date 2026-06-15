/**
 * NOIRVANE DB v2.0
 * Real-time JSON storage engine with cross-tab sync
 */

const DB = {
  STORAGE_KEY: 'noirvane_v2_catalog',
  ORDERS_KEY: 'noirvane_v2_orders',
  CART_KEY: 'noirvane_v2_cart',
  WISHLIST_KEY: 'noirvane_v2_wishlist',

  defaults: {
    version: '2.0.0',
    updated: Date.now(),
    categories: {
      tops: { name: 'Tops', subs: ['Oversized Tees', 'Graphic Tees'] },
      hoodies: { name: 'Hoodies & Sweatshirts', subs: ['Hoodies', 'Crewnecks'] },
      outerwear: { name: 'Outerwear', subs: ['Leather Jackets', 'Blazers'] },
      bottoms: { name: 'Bottoms', subs: ['Cargo Pants', 'Baggy Jeans'] },
      footwear: { name: 'Footwear', subs: ['Sneakers'] },
      accessories: { name: 'Accessories', subs: ['Watches', 'Sunglasses', 'Bags'] }
    },
    products: [
      {
        id: 1,
        name: "Midnight Obsidian Hoodie",
        slug: "midnight-obsidian-hoodie",
        price: 189.00,
        salePrice: null,
        category: "hoodies",
        subcategory: "Hoodies",
        badge: "Trending",
        colors: ["Black"],
        sizes: ["S","M","L","XL","XXL"],
        fit: "Oversized",
        material: "450gsm Cotton Fleece",
        stock: 24,
        rating: 4.9,
        reviews: 128,
        description: "Premium heavyweight oversized hoodie in deep obsidian black. Features dropped shoulders, kangaroo pocket, and gunmetal hardware. 450gsm brushed fleece interior.",
        image: "https://kimi-web-img.moonshot.cn/img/www.shutterstock.com/510d1a947716507038b7232df520fb00a789c390.jpg",
        gallery: [],
        sku: "NV-HD-001"
      },
      {
        id: 2,
        name: "Arctic White Boxy Tee",
        slug: "arctic-white-boxy-tee",
        price: 79.00,
        salePrice: null,
        category: "tops",
        subcategory: "Oversized Tees",
        badge: "New",
        colors: ["White"],
        sizes: ["S","M","L","XL","XXL"],
        fit: "Oversized",
        material: "240gsm Organic Cotton",
        stock: 45,
        rating: 4.7,
        reviews: 86,
        description: "Crisp white oversized boxy t-shirt with drop-shoulder silhouette. 240gsm heavyweight organic cotton with reinforced neckline.",
        image: "https://kimi-web-img.moonshot.cn/img/www.shutterstock.com/982a2076e0d91cf7ed82f248f1b1a27074f7fd1a.jpg",
        gallery: [],
        sku: "NV-TP-002"
      },
      {
        id: 3,
        name: "Shadow Tactical Cargos",
        slug: "shadow-tactical-cargos",
        price: 165.00,
        salePrice: null,
        category: "bottoms",
        subcategory: "Cargo Pants",
        badge: "Trending",
        colors: ["Black"],
        sizes: ["28","30","32","34","36","38"],
        fit: "Relaxed Taper",
        material: "Cotton Ripstop",
        stock: 18,
        rating: 4.8,
        reviews: 204,
        description: "Technical black cargo pants with six utility pockets. Relaxed taper fit with adjustable ankle cuffs and reinforced knees.",
        image: "https://kimi-web-img.moonshot.cn/img/au.representclo.com/4807216fa9db8ace2cf8ddadbeb8276af1db090b.jpg",
        gallery: [],
        sku: "NV-BT-003"
      },
      {
        id: 4,
        name: "Vintage Blue Baggy Denim",
        slug: "vintage-blue-baggy-denim",
        price: 145.00,
        salePrice: 115.00,
        category: "bottoms",
        subcategory: "Baggy Jeans",
        badge: "Sale",
        colors: ["Blue"],
        sizes: ["28","30","32","34","36","38"],
        fit: "Baggy",
        material: "14oz Selvedge Denim",
        stock: 12,
        rating: 4.6,
        reviews: 156,
        description: "90s inspired baggy jeans in vintage blue wash. High waist with a relaxed fit through the leg. Strategic distressing and repair details.",
        image: "https://kimi-web-img.moonshot.cn/img/www.shutterstock.com/64156ac5f640771d5d05d61a83e59b7244c41bbc.jpg",
        gallery: [],
        sku: "NV-BT-004"
      },
      {
        id: 5,
        name: "Onyx Moto Leather Jacket",
        slug: "onyx-moto-leather-jacket",
        price: 495.00,
        salePrice: null,
        category: "outerwear",
        subcategory: "Leather Jackets",
        badge: "Trending",
        colors: ["Black"],
        sizes: ["S","M","L","XL","XXL"],
        fit: "Slim",
        material: "Full-Grain Lambskin",
        stock: 8,
        rating: 4.9,
        reviews: 92,
        description: "Premium black moto jacket in full-grain lambskin. Asymmetric zip closure, quilted lining, and gunmetal hardware. Slim contemporary cut.",
        image: "https://kimi-web-img.moonshot.cn/img/takemysnap.com/2ae8c9d4adff4eaef346e1a430ca90dce8553128.jpg",
        gallery: [],
        sku: "NV-OW-005"
      },
      {
        id: 6,
        name: "Admiral Navy Blazer",
        slug: "admiral-navy-blazer",
        price: 395.00,
        salePrice: null,
        category: "outerwear",
        subcategory: "Blazers",
        badge: "New",
        colors: ["Navy"],
        sizes: ["36","38","40","42","44","46"],
        fit: "Slim",
        material: "Italian Wool Blend",
        stock: 15,
        rating: 4.8,
        reviews: 67,
        description: "Slim-fit navy blazer in Italian wool blend. Peak lapels, double vent, and fully lined interior. Perfect for business or evening wear.",
        image: "https://kimi-web-img.moonshot.cn/img/www.charlestyrwhitt.com/6a289ac9c3be876e5d4d43c6a9340cc425656e70.jpg",
        gallery: [],
        sku: "NV-OW-006"
      },
      {
        id: 7,
        name: "Cloud Minimalist Sneakers",
        slug: "cloud-minimalist-sneakers",
        price: 225.00,
        salePrice: null,
        category: "footwear",
        subcategory: "Sneakers",
        badge: "New",
        colors: ["White"],
        sizes: ["40","41","42","43","44","45","46"],
        fit: "Regular",
        material: "Italian Calfskin Leather",
        stock: 32,
        rating: 4.8,
        reviews: 198,
        description: "Minimalist white low-top sneaker in Italian calfskin. Clean side-profile silhouette with comfortable padded collar and gum sole.",
        image: "https://kimi-web-img.moonshot.cn/img/static.vecteezy.com/116f5c74fba885b8c3ecdca53f51d64d3fc49f59.jpeg",
        gallery: [],
        sku: "NV-FW-007"
      },
      {
        id: 8,
        name: "Stealth Chronograph Elite",
        slug: "stealth-chronograph-elite",
        price: 475.00,
        salePrice: null,
        category: "accessories",
        subcategory: "Watches",
        badge: "Trending",
        colors: ["Black"],
        sizes: ["One Size"],
        fit: "Regular",
        material: "Stainless Steel & Sapphire",
        stock: 10,
        rating: 4.9,
        reviews: 74,
        description: "All-black chronograph with sapphire crystal and stainless steel case. Water resistant to 100m with genuine leather strap.",
        image: "https://kimi-web-img.moonshot.cn/img/visualeducation.com/93c2b687baaea5dec29c7bea8f90f9b0a0794062.jpg",
        gallery: [],
        sku: "NV-AC-008"
      },
      {
        id: 9,
        name: "Storm Grey Oversized Crew",
        slug: "storm-grey-oversized-crew",
        price: 155.00,
        salePrice: null,
        category: "hoodies",
        subcategory: "Crewnecks",
        badge: "",
        colors: ["Grey"],
        sizes: ["S","M","L","XL","XXL"],
        fit: "Oversized",
        material: "400gsm French Terry",
        stock: 28,
        rating: 4.7,
        reviews: 112,
        description: "Extreme oversized crewneck sweatshirt in storm grey. 400gsm French terry with dropped shoulders and ribbed cuffs.",
        image: "https://kimi-web-img.moonshot.cn/img/images.asos-media.com/dab2652f4f63e8c524758d59df66875e7cb3fb87",
        gallery: [],
        sku: "NV-HD-009"
      },
      {
        id: 10,
        name: "Phantom Aviator Sunglasses",
        slug: "phantom-aviator-sunglasses",
        price: 165.00,
        salePrice: null,
        category: "accessories",
        subcategory: "Sunglasses",
        badge: "",
        colors: ["Black"],
        sizes: ["One Size"],
        fit: "Regular",
        material: "Titanium & Nylon Lenses",
        stock: 22,
        rating: 4.7,
        reviews: 89,
        description: "Black aviator sunglasses with polarized nylon lenses. Titanium frame with adjustable nose pads and 100% UV protection.",
        image: "https://kimi-web-img.moonshot.cn/img/www.blenderseyewear.com/b7943223aee9079254e825bd75ceb1d6e1c77251.webp",
        gallery: [],
        sku: "NV-AC-010"
      },
      {
        id: 11,
        name: "Noir Leather Messenger",
        slug: "noir-leather-messenger",
        price: 295.00,
        salePrice: null,
        category: "accessories",
        subcategory: "Bags",
        badge: "",
        colors: ["Black"],
        sizes: ["One Size"],
        fit: "Regular",
        material: "Vegetable-Tanned Leather",
        stock: 14,
        rating: 4.8,
        reviews: 53,
        description: "Compact black leather crossbody messenger bag. Vegetable-tanned full-grain leather with brass hardware and adjustable strap.",
        image: "https://kimi-web-img.moonshot.cn/img/omybagamsterdam.com/f42c6f0b5ea5090b43c70505b06b147c2f4e1a87.jpg",
        gallery: [],
        sku: "NV-AC-011"
      },
      {
        id: 12,
        name: "Ice White Executive Blazer",
        slug: "ice-white-executive-blazer",
        price: 425.00,
        salePrice: null,
        category: "outerwear",
        subcategory: "Blazers",
        badge: "New",
        colors: ["White"],
        sizes: ["36","38","40","42","44","46"],
        fit: "Slim",
        material: "Stretch Wool Blend",
        stock: 9,
        rating: 4.8,
        reviews: 41,
        description: "Slim-fit white executive blazer in stretch wool. Notch lapels, two-button closure, and partial lining for breathability.",
        image: "https://kimi-web-img.moonshot.cn/img/images.hugoboss.com/77c89c09f53b5b066fb7c9487b8ae1f730155d4d",
        gallery: [],
        sku: "NV-OW-012"
      }
    ]
  },

  init() {
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      this.save(this.defaults);
    }
    window.addEventListener('storage', (e) => {
      if (e.key === this.STORAGE_KEY) {
        document.dispatchEvent(new CustomEvent('catalog-updated', { detail: this.get() }));
      }
    });
  },

  get() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || this.defaults;
    } catch {
      return this.defaults;
    }
  },

  save(data) {
    data.updated = Date.now();
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  },

  getProducts() { return this.get().products; },
  getProduct(id) { return this.getProducts().find(p => p.id == id); },
  getCategories() { return this.get().categories; },

  addProduct(product) {
    const db = this.get();
    product.id = Math.max(0, ...db.products.map(p => p.id)) + 1;
    product.slug = this.slugify(product.name);
    product.sku = product.sku || `NV-${Date.now().toString(36).toUpperCase()}`;
    db.products.push(product);
    this.save(db);
    return product;
  },

  updateProduct(id, updates) {
    const db = this.get();
    const idx = db.products.findIndex(p => p.id == id);
    if (idx === -1) return false;
    db.products[idx] = { ...db.products[idx], ...updates, id: parseInt(id), updated: Date.now() };
    this.save(db);
    return db.products[idx];
  },

  deleteProduct(id) {
    const db = this.get();
    db.products = db.products.filter(p => p.id != id);
    this.save(db);
  },

  slugify(str) {
    return str.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').substring(0, 60);
  },

  getCart() {
    try { return JSON.parse(localStorage.getItem(this.CART_KEY)) || []; } catch { return []; }
  },
  saveCart(cart) { localStorage.setItem(this.CART_KEY, JSON.stringify(cart)); },

  getWishlist() {
    try { return JSON.parse(localStorage.getItem(this.WISHLIST_KEY)) || []; } catch { return []; }
  },
  saveWishlist(list) { localStorage.setItem(this.WISHLIST_KEY, JSON.stringify(list)); },

  getOrders() {
    try { return JSON.parse(localStorage.getItem(this.ORDERS_KEY)) || []; } catch { return []; }
  },
  saveOrder(order) {
    const orders = this.getOrders();
    orders.unshift(order);
    localStorage.setItem(this.ORDERS_KEY, JSON.stringify(orders));
    this.saveCart([]);
    return order;
  }
};

DB.init();
