/**
 * NOIRVANE ADMIN v2.0
 * Real-time catalog management with live preview
 */

const Admin = {
  init() {
    this.renderStats();
    this.renderTable();
    this.initModals();
    this.initForm();
    this.initImagePreview();
    this.bindEvents();

    window.addEventListener('storage', (e) => {
      if (e.key === DB.STORAGE_KEY) this.renderTable();
    });
  },

  renderStats() {
    const products = DB.getProducts();
    const orders = DB.getOrders();
    const revenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const stats = document.getElementById('adminStats');
    if (!stats) return;

    stats.innerHTML = `
      <div class="stat-card">
        <h4>Total Products</h4>
        <div class="stat-value">${products.length}</div>
        <div class="stat-change">${products.filter(p => p.badge === 'New').length} new arrivals</div>
      </div>
      <div class="stat-card">
        <h4>Total Orders</h4>
        <div class="stat-value">${orders.length}</div>
        <div class="stat-change">${orders.filter(o => o.status === 'Processing').length} processing</div>
      </div>
      <div class="stat-card">
        <h4>Revenue</h4>
        <div class="stat-value">${App.formatPrice(revenue)}</div>
        <div class="stat-change">Lifetime sales</div>
      </div>
      <div class="stat-card">
        <h4>Low Stock Alerts</h4>
        <div class="stat-value">${products.filter(p => p.stock < 10).length}</div>
        <div class="stat-change">Items need restocking</div>
      </div>
    `;
  },

  renderTable() {
    const tbody = document.getElementById('adminTableBody');
    if (!tbody) return;
    const products = DB.getProducts();

    tbody.innerHTML = products.map(p => `
      <tr>
        <td><img src="${p.image}" alt="${p.name}" class="admin-thumb" loading="lazy"></td>
        <td>
          <div class="admin-product-name">${p.name}</div>
          <div class="admin-product-sku">${p.sku}</div>
        </td>
        <td><span class="admin-category">${p.subcategory}</span></td>
        <td>${App.formatPrice(p.salePrice || p.price)}</td>
        <td>
          <span class="stock-badge ${p.stock < 10 ? 'low' : p.stock < 20 ? 'medium' : 'good'}">${p.stock}</span>
        </td>
        <td>${p.badge ? '<span class="badge badge-' + p.badge.toLowerCase() + '">' + p.badge + '</span>' : '-'}</td>
        <td>
          <button class="admin-btn admin-btn-edit" data-id="${p.id}">Edit</button>
          <button class="admin-btn admin-btn-delete" data-id="${p.id}">Delete</button>
        </td>
      </tr>
    `).join('');

    tbody.addEventListener('click', (e) => {
      const btn = e.target.closest('.admin-btn-edit, .admin-btn-delete');
      if (!btn) return;
      const id = parseInt(btn.dataset.id);
      if (btn.classList.contains('admin-btn-edit')) this.openEditModal(id);
      if (btn.classList.contains('admin-btn-delete')) this.deleteProduct(id);
    });
  },

  initModals() {
    const modal = document.getElementById('productModal');
    document.getElementById('addProductBtn')?.addEventListener('click', () => this.openAddModal());
    document.getElementById('closeModal')?.addEventListener('click', () => modal?.classList.remove('open'));
    modal?.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('open'); });
  },

  openAddModal() {
    const modal = document.getElementById('productModal');
    document.getElementById('modalTitle').textContent = 'Add New Product';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('imgPreview').style.display = 'none';
    modal?.classList.add('open');
  },

  openEditModal(id) {
    const p = DB.getProduct(id);
    if (!p) return;
    const modal = document.getElementById('productModal');

    document.getElementById('modalTitle').textContent = 'Edit Product';
    document.getElementById('productId').value = p.id;
    document.getElementById('pName').value = p.name;
    document.getElementById('pPrice').value = p.price;
    document.getElementById('pSale').value = p.salePrice || '';
    document.getElementById('pCategory').value = p.category;
    document.getElementById('pSub').value = p.subcategory;
    document.getElementById('pStock').value = p.stock;
    document.getElementById('pBadge').value = p.badge;
    document.getElementById('pColors').value = p.colors.join(', ');
    document.getElementById('pSizes').value = p.sizes.join(', ');
    document.getElementById('pFit').value = p.fit;
    document.getElementById('pMaterial').value = p.material;
    document.getElementById('pDesc').value = p.description;
    document.getElementById('pImage').value = p.image;

    const preview = document.getElementById('imgPreview');
    preview.src = p.image;
    preview.style.display = 'block';

    modal?.classList.add('open');
  },

  initForm() {
    const form = document.getElementById('productForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('productId').value;

      const productData = {
        name: document.getElementById('pName').value,
        price: parseFloat(document.getElementById('pPrice').value),
        salePrice: document.getElementById('pSale').value ? parseFloat(document.getElementById('pSale').value) : null,
        category: document.getElementById('pCategory').value,
        subcategory: document.getElementById('pSub').value,
        stock: parseInt(document.getElementById('pStock').value),
        badge: document.getElementById('pBadge').value,
        colors: document.getElementById('pColors').value.split(',').map(c => c.trim()).filter(Boolean),
        sizes: document.getElementById('pSizes').value.split(',').map(s => s.trim()).filter(Boolean),
        fit: document.getElementById('pFit').value,
        material: document.getElementById('pMaterial').value,
        description: document.getElementById('pDesc').value,
        image: document.getElementById('pImage').value || 'https://via.placeholder.com/600x800/1a1a1a/ffffff?text=No+Image',
        gallery: [],
        rating: 4.5,
        reviews: 0
      };

      if (id) {
        DB.updateProduct(parseInt(id), productData);
        App.showToast('Product updated successfully', 'check');
      } else {
        DB.addProduct(productData);
        App.showToast('Product added successfully', 'plus');
      }

      this.renderTable();
      this.renderStats();
      document.getElementById('productModal')?.classList.remove('open');
    });
  },

  initImagePreview() {
    const imgInput = document.getElementById('pImage');
    const fileInput = document.getElementById('pImageFile');
    const preview = document.getElementById('imgPreview');

    imgInput?.addEventListener('input', () => {
      if (imgInput.value) { preview.src = imgInput.value; preview.style.display = 'block'; }
      else preview.style.display = 'none';
    });

    fileInput?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        preview.src = ev.target.result;
        preview.style.display = 'block';
        imgInput.value = ev.target.result;
      };
      reader.readAsDataURL(file);
    });
  },

  deleteProduct(id) {
    if (!confirm('Delete this product permanently?')) return;
    DB.deleteProduct(id);
    this.renderTable();
    this.renderStats();
    App.showToast('Product deleted', 'trash');
  },

  bindEvents() {
    document.getElementById('refreshData')?.addEventListener('click', () => {
      this.renderStats();
      this.renderTable();
      App.showToast('Data refreshed', 'sync');
    });

    document.getElementById('viewOrders')?.addEventListener('click', () => {
      const section = document.getElementById('ordersSection');
      if (section) {
        section.style.display = section.style.display === 'none' ? 'block' : 'none';
        if (section.style.display === 'block') this.renderOrders();
      }
    });
  },

  renderOrders() {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;
    const orders = DB.getOrders();

    tbody.innerHTML = orders.map(o => `
      <tr>
        <td><span class="order-id">${o.id}</span></td>
        <td>${new Date(o.date).toLocaleDateString()}</td>
        <td>${o.customer?.name || 'Guest'}</td>
        <td>${o.items?.length || 0} items</td>
        <td>${App.formatPrice(o.total)}</td>
        <td><span class="status-badge status-${o.status.toLowerCase()}">${o.status}</span></td>
      </tr>
    `).join('') || '<tr><td colspan="6" style="text-align:center;padding:2rem;">No orders yet</td></tr>';
  }
};

if (document.body.dataset.page === 'admin') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Admin.init());
  } else {
    Admin.init();
  }
}
