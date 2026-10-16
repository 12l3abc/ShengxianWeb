/**
 * 管理员面板
 */

// 基础状态
const adminState = {
  products: [],
  currentModule: 'dashboard',
  modules: [
    'dashboard',
    'freshProduce',
    'meatPoultry',
    'seafood',
    'dairyBakery',
    'beanProducts',
    'readyMeals',
    'specialOffers',
    'directSourcing',
    'users',
  ],
};

// 产地直采状态
const directSourcingState = {
  provinces: [],
};

// 产地直采 DOM 引用
let provinceModalEl;
let provinceFormEl;
let provinceIdEl;
let provinceNameEl;
let provinceDescEl;
let provinceDiscountEl;
let localProductModalEl;
let localProductFormEl;
let localProductIdEl;
let localProductProvinceIdEl;
let localProductNameEl;
let localProductPriceEl;
let localProductOriginalPriceEl;
let localProductDescEl;
let localProductImageFileEl;
let localProductImagePreviewEl;
let localProductImageUrlEl;
let localProductSeasonalEl;
let provinceAddBtn;

const tableBodyMap = {
  freshProduce: 'freshProduce-table-body',
  meatPoultry: 'meatPoultry-table-body',
  seafood: 'seafood-table-body',
  dairyBakery: 'dairyBakery-table-body',
  beanProducts: 'beanProducts-table-body',
  readyMeals: 'readyMeals-table-body',
  specialOffers: 'specialOffers-table-body',
};

// 主分类 -> ID 映射（与后端一致）
const categoryIdMap = {
  freshProduce: 1,
  meatPoultry: 2,
  seafood: 3,
  dairyBakery: 4,
  beanProducts: 5,
  readyMeals: 6,
  specialOffers: 7,
};

// 各模块小类选项
const subcategoryOptions = {
  freshProduce: [
    { value: 'vegetables', label: '蔬菜' },
    { value: 'fruits', label: '水果' },
    { value: 'mushrooms', label: '菌菇' },
    { value: 'herbs', label: '香草/调味菜' },
  ],
  meatPoultry: [
    { value: 'pork', label: '猪肉' },
    { value: 'beef', label: '牛肉' },
    { value: 'lamb', label: '羊肉' },
    { value: 'chicken', label: '鸡肉' },
    { value: 'duck', label: '鸭肉' },
    { value: 'goose', label: '鹅肉' },
    { value: 'egg', label: '蛋类' },
  ],
  seafood: [
    { value: 'fish', label: '鱼类' },
    { value: 'shrimp', label: '虾类' },
    { value: 'crab', label: '蟹类' },
    { value: 'shellfish', label: '贝类' },
    { value: 'otherSeafood', label: '其他海鲜' },
  ],
  dairyBakery: [
    { value: 'milk', label: '牛奶' },
    { value: 'yogurt', label: '酸奶' },
    { value: 'cheese', label: '奶酪' },
    { value: 'bread', label: '面包' },
    { value: 'pastry', label: '糕点' },
  ],
  beanProducts: [
    { value: 'tofu', label: '豆腐' },
    { value: 'beanCurd', label: '豆皮/豆干' },
    { value: 'soyMilk', label: '豆浆' },
    { value: 'grains', label: '杂粮' },
    { value: 'beans', label: '杂豆' },
  ],
  readyMeals: [
    { value: 'preWashed', label: '净菜' },
    { value: 'preCut', label: '切配' },
    { value: 'readyToCook', label: '即烹' },
    { value: 'readyToEat', label: '即食' },
    { value: 'frozenMeals', label: '冷冻预制' },
  ],
};

function renderSubcategoryOptions(category, selected = '') {
  const select = document.getElementById('product-subcategory');
  if (!select) return;
  const options = subcategoryOptions[category];
  select.innerHTML = `<option value="">请选择对应小类</option>`;
  if (!options) {
    select.disabled = true;
    return;
  }
  select.disabled = false;
  options.forEach((item) => {
    const option = document.createElement('option');
    option.value = item.value;
    option.textContent = item.label;
    if (selected && selected === item.value) option.selected = true;
    select.appendChild(option);
  });
}

// 工具：获取图片地址，非 Base64 时追加时间戳避免缓存
function getImageSrc(raw) {
  const fallback = 'src/shengxian.png';
  const src = raw || fallback;
  if (src.startsWith('data:image/')) return src;
  return `${src}?t=${Date.now()}`;
}

function ensureAdmin() {
  let user = null;
  try {
    const raw = localStorage.getItem('user');
    user = raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn('解析用户信息失败，清理后重定向');
    localStorage.removeItem('user');
  }
  if (!user || user.role !== 'admin') {
    window.location.href = 'admin-login.html';
    return false;
  }
  return true;
}

function bindLogout() {
  // 兼容历史和当前模板的退出按钮 id
  const logoutBtn =
    document.getElementById('logout-btn-panel') ||
    document.getElementById('logout-btn');
  if (!logoutBtn) return;
  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('user');
    window.location.href = 'admin-login.html';
  });
}

function showModule(module) {
  adminState.currentModule = module;
  document.querySelectorAll('.admin-sidebar-nav a').forEach((a) => {
    a.classList.toggle('active', a.getAttribute('data-module') === module);
  });
  document.querySelectorAll('.admin-module').forEach((m) => m.classList.remove('active'));
  const moduleId =
    module === 'directSourcing'
      ? 'direct-sourcing-module'
      : module === 'specialOffers'
      ? 'specialOffers-module'
      : `${module}-module`;
  const el = document.getElementById(moduleId);
  if (el) el.classList.add('active');
  if (module === 'users') {
    loadUsers();
  } else if (module === 'directSourcing') {
    loadProvinces();
  } else if (module === 'specialOffers') {
    renderTable('specialOffers');
  } else if (tableBodyMap[module]) {
    renderTable(module);
  }
}

function bindNav() {
  const nav = document.querySelector('.admin-sidebar-nav');
  if (!nav) return;
  nav.addEventListener('click', (e) => {
    const link = e.target.closest('a[data-module]');
    if (!link) return;
    e.preventDefault();
    showModule(link.getAttribute('data-module'));
  });
}

function renderDashboard() {
  const total = adminState.products.length;
  const specials = adminState.products.filter((p) => p.isSpecialOffer).length;
  const flash = adminState.products.filter((p) => p.isFlashSale).length;
  const cards = document.querySelectorAll('#dashboard-module .admin-content div > div > div');
  cards.forEach((card) => {
    const title = card.querySelector('h4')?.textContent;
    const p = card.querySelector('p');
    if (!p) return;
    if (title === '商品总数') p.textContent = total;
    if (title === '特价商品') p.textContent = specials;
    if (title === '秒杀商品') p.textContent = flash;
  });
}

function renderTable(category) {
  const bodyId = tableBodyMap[category];
  const tbody = document.getElementById(bodyId);
  if (!tbody) return;
  let list = [];
  if (category === 'specialOffers') {
    list = adminState.products.filter((p) => p.isSpecialOffer);
  } else {
    list = adminState.products.filter((p) => p.category === category);
  }
  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:20px;color:#666;">暂无数据</td></tr>`;
    return;
  }
  const categoryNames = {
    freshProduce: '新鲜果蔬',
    meatPoultry: '肉禽蛋品',
    seafood: '水产海鲜',
    dairyBakery: '乳品面点',
    beanProducts: '豆制品/杂粮',
    readyMeals: '速食净菜',
  };
  tbody.innerHTML = list
    .map((p) => {
      const img = getImageSrc(p.image);
      const categoryCol =
        category === 'specialOffers'
          ? `<td>${categoryNames[p.category] || p.category}</td>`
          : `<td>${p.isSpecialOffer ? '是' : '否'}</td>`;
      return `<tr>
          <td>${p.id}</td>
          <td>${p.name}</td>
          <td><img src="${img}" alt="${p.name}" class="product-image"></td>
          <td>¥${Number(p.price || 0).toFixed(2)}</td>
          <td>${p.stock}</td>
          ${categoryCol}
          <td>${p.isFlashSale ? '是' : '否'}</td>
          <td>
            <button class="btn edit-btn" data-id="${p.id}">编辑</button>
            <button class="btn danger delete-btn" data-id="${p.id}">删除</button>
          </td>
        </tr>`;
    })
    .join('');
}

function renderAllTables() {
  Object.keys(tableBodyMap).forEach((c) => renderTable(c));
}

async function loadProductsData() {
  const res = await apiClient.getAllProducts();
  if (res && res.success && Array.isArray(res.products)) {
    adminState.products = res.products.map((p) => ({
      ...p,
      // 统一小类字段，便于前端筛选
      subcategory: p.subcategory || p.subcategoryName || p.subcategory_id || '',
    }));
    renderAllTables();
    renderDashboard();
  } else {
    console.error('加载商品数据失败', res);
  }
}

function bindGlobalTableActions() {
  document.addEventListener('click', async (e) => {
    const editBtn = e.target.closest('.edit-btn');
    if (editBtn) {
      const id = Number(editBtn.dataset.id);
      const product = adminState.products.find((p) => p.id === id);
      if (product) openProductModal(product);
      return;
    }
    const delBtn = e.target.closest('.delete-btn');
    if (delBtn) {
      const id = Number(delBtn.dataset.id);
      if (Number.isFinite(id) && confirm('确定删除该商品？')) {
        const resp = await apiClient.deleteProduct(id);
        if (resp.success) {
          await loadProductsData();
          broadcastUpdate();
        } else {
          alert(resp.message || '删除失败');
        }
      }
    }
  });
}

// 商品模态框
let productModalEl, productFormEl, imageInputEl, imagePreviewEl, hiddenImageUrlEl;

function setupProductModal() {
  productModalEl = document.getElementById('product-modal');
  productFormEl = document.getElementById('product-form');
  imageInputEl = document.getElementById('product-image');
  imagePreviewEl = document.getElementById('image-preview');
  hiddenImageUrlEl = document.getElementById('product-image-url');
  const categorySelect = document.getElementById('product-category');
  if (categorySelect) {
    categorySelect.addEventListener('change', (e) => {
      renderSubcategoryOptions(e.target.value);
    });
  }

  const closeEls = [
    document.querySelector('.modal-close'),
    document.getElementById('cancel-product-btn'),
    document.getElementById('cancel-btn'),
  ];
  closeEls.forEach((el) => el && el.addEventListener('click', closeProductModal));

  if (imageInputEl) {
    imageInputEl.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const valid = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!valid.includes(file.type)) {
        alert('请选择有效的图片文件（JPEG/PNG/GIF/WebP）');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert('图片大小不能超过2MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const src = ev.target?.result;
        hiddenImageUrlEl.value = src;
        imagePreviewEl.innerHTML = `<img src="${src}" style="max-width:200px;max-height:200px;">`;
      };
      reader.readAsDataURL(file);
    });
  }

  if (productFormEl) {
    productFormEl.addEventListener('submit', handleProductSubmit);
  }
}

function openProductModal(product) {
  productFormEl.reset();
  hiddenImageUrlEl.value = '';
  imagePreviewEl.innerHTML = '';
  document.getElementById('product-id').value = '';
  const category = product?.category || 'freshProduce';
  document.getElementById('product-category').value = category;
  const subcategory = product?.subcategory || product?.subcategoryName || '';
  renderSubcategoryOptions(category, subcategory);
  if (product) {
    document.getElementById('product-id').value = product.id;
    document.getElementById('product-name').value = product.name || '';
    document.getElementById('product-price').value = product.price ?? '';
    document.getElementById('product-stock').value = product.stock ?? '';
    document.getElementById('product-description').value = product.description || '';
    document.getElementById('product-special-offer').checked = !!product.isSpecialOffer;
    document.getElementById('product-flash-sale').checked = !!product.isFlashSale;
    const subSelect = document.getElementById('product-subcategory');
    if (subSelect && subcategory) subSelect.value = subcategory;
    if (product.image) {
      hiddenImageUrlEl.value = product.image;
      imagePreviewEl.innerHTML = `<img src="${product.image}" style="max-width:200px;max-height:200px;">`;
    }
    if (product.flashSaleEndTime) {
      document.getElementById('product-flash-sale-end-time').value = new Date(product.flashSaleEndTime)
        .toISOString()
        .slice(0, 16);
    }
  } else {
    renderSubcategoryOptions(category);
  }
  productModalEl.style.display = 'flex';
  toggleFlashSaleEndTime();
}

function closeProductModal() {
  if (productModalEl) productModalEl.style.display = 'none';
}

function toggleFlashSaleEndTime() {
  const checkbox = document.getElementById('product-flash-sale');
  const container = document.getElementById('flash-sale-end-time-container');
  if (!checkbox || !container) return;
  container.style.display = checkbox.checked ? 'block' : 'none';
  if (checkbox.checked && !document.getElementById('product-flash-sale-end-time').value) {
    const twoHoursLater = new Date();
    twoHoursLater.setHours(twoHoursLater.getHours() + 2);
    document.getElementById('product-flash-sale-end-time').value = twoHoursLater.toISOString().slice(0, 16);
  }
}

async function handleProductSubmit(e) {
  e.preventDefault();
  const id = Number(document.getElementById('product-id').value);
  const product = {
    name: document.getElementById('product-name').value.trim(),
    category: document.getElementById('product-category').value,
    subcategory: document.getElementById('product-subcategory').value || '',
    category_id: categoryIdMap[document.getElementById('product-category').value] || null,
    subcategory_id: (() => {
      const cat = document.getElementById('product-category').value;
      const sub = document.getElementById('product-subcategory').value;
      const options = subcategoryOptions[cat] || [];
      const match = options.find((o) => o.value === sub);
      // 给常见默认值，避免后端再兜底到蔬菜
      if (match) {
        // 手动映射子分类到数值ID，与后端定义保持一致
        const map = {
          vegetables: 11,
          fruits: 12,
          mushrooms: 13,
          herbs: 14,
          pork: 21,
          beef: 22,
          lamb: 23,
          chicken: 24,
          duck: 25,
          goose: 0,
          egg: 26,
          eggs: 26,
          fish: 31,
          shrimp: 32,
          crab: 33,
          shellfish: 34,
          otherSeafood: 35,
          milk: 41,
          yogurt: 42,
          cheese: 43,
          bread: 44,
          pastry: 45,
          tofu: 51,
          beanCurd: 52,
          soyMilk: 53,
          grains: 54,
          beans: 55,
          preWashed: 61,
          preCut: 62,
          readyToCook: 63,
          readyToEat: 64,
          frozenMeals: 65,
        };
        return map[sub] ?? null;
      }
      return null;
    })(),
    price: parseFloat(document.getElementById('product-price').value),
    stock: parseInt(document.getElementById('product-stock').value, 10),
    image: hiddenImageUrlEl.value || 'src/shengxian.png',
    description: document.getElementById('product-description').value.trim(),
    isSpecialOffer: document.getElementById('product-special-offer').checked,
    isFlashSale: document.getElementById('product-flash-sale').checked,
    flashSaleEndTime: document.getElementById('product-flash-sale-end-time').value
      ? new Date(document.getElementById('product-flash-sale-end-time').value).toISOString()
      : null,
  };
  if (!product.name) return alert('请填写商品名称');
  if (!Number.isFinite(product.price) || product.price <= 0) return alert('请填写有效的价格');
  if (!Number.isInteger(product.stock) || product.stock < 0) return alert('请填写有效的库存');

  const resp = id ? await apiClient.updateProduct(id, product) : await apiClient.addProduct(product);
  if (resp && resp.success) {
    alert('商品保存成功');
    await loadProductsData();
    broadcastUpdate();
    closeProductModal();
  } else {
    alert(resp?.message || '商品保存失败');
  }
}

function broadcastUpdate() {
  if (typeof BroadcastChannel !== 'undefined') {
    const channel = new BroadcastChannel('product-updates');
    channel.postMessage({ action: 'product-updated', timestamp: Date.now() });
  }
}

function bindAddButtons() {
  document.querySelectorAll('[data-category]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const category = btn.getAttribute('data-category');
      openProductModal({ category });
    });
  });
}

function bindModalOutside() {
  window.addEventListener('click', (e) => {
    if (e.target === productModalEl) {
      closeProductModal();
    }
    if (e.target === provinceModalEl) {
      closeProvinceModal();
    }
    if (e.target === localProductModalEl) {
      closeLocalProductModal();
    }
  });
}

// 兼容旧版模板的全局调用接口
globalThis.AdminManager = {
  openProductModal: (product, category) => {
    const payload = product ? { ...product } : {};
    if (category) payload.category = category;
    openProductModal(payload);
  },
};

async function initAdmin() {
  if (!ensureAdmin()) return;
  bindLogout();
  bindNav();
  bindGlobalTableActions();
  setupProductModal();
  setupDirectSourcingModals();
  setupUserModal();
  bindAddButtons();
  bindModalOutside();
  await loadProductsData();

  // 监听外部页面更新（其他标签页或用户界面）
  if (typeof BroadcastChannel !== 'undefined') {
    const channel = new BroadcastChannel('product-updates');
    channel.onmessage = async () => {
      await loadProductsData();
    };
  }

  // 预加载产地直采数据，避免首次切换等待
  loadProvinces();
}

document.addEventListener('DOMContentLoaded', initAdmin);

// ---------------- 用户管理 ---------------- 
let usersState = {
  users: [],
};

async function loadUsers() {
  const tbody = document.getElementById('users-table-body');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;">加载中...</td></tr>';
  try {
    const res = await apiClient.getAllUsers();
    if (res && res.success && Array.isArray(res.users)) {
      usersState.users = res.users;
      renderUsers();
    } else {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:20px;color:#f00;">加载失败：${res?.message || '未知错误'}</td></tr>`;
    }
  } catch (e) {
    console.error('加载用户失败', e);
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;color:#f00;">加载失败，请稍后重试</td></tr>';
  }
}

function renderUsers() {
  const tbody = document.getElementById('users-table-body');
  if (!tbody) return;
  const users = usersState.users || [];
  if (!users.length) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;color:#666;">暂无用户数据</td></tr>';
    return;
  }
  tbody.innerHTML = users
    .map((u) => {
      const createdAt = u.created_at ? new Date(u.created_at).toLocaleString('zh-CN') : '未知';
      const roleText = u.role === 'admin' ? '管理员' : '普通用户';
      const roleClass = u.role === 'admin' ? 'admin-badge' : 'user-badge';
      return `<tr>
        <td>${u.id}</td>
        <td>${u.username || '未知'}</td>
        <td><span class="${roleClass}">${roleText}</span></td>
        <td>${createdAt}</td>
        <td>
          <button class="btn edit-user-btn" data-id="${u.id}">编辑</button>
          ${u.role !== 'admin' ? `<button class="btn danger delete-user-btn" data-id="${u.id}">删除</button>` : ''}
        </td>
      </tr>`;
    })
    .join('');
  
  // 绑定编辑按钮
  tbody.querySelectorAll('.edit-user-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.getAttribute('data-id'));
      const user = users.find((u) => u.id === id);
      if (user) openUserModal(user);
    });
  });
  
  // 绑定删除按钮
  tbody.querySelectorAll('.delete-user-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.getAttribute('data-id'));
      if (!confirm('确定删除该用户吗？此操作不可恢复。')) return;
      try {
        const res = await apiClient.deleteUser(id);
        if (res && res.success) {
          alert('删除成功');
          loadUsers();
        } else {
          alert(res?.message || '删除失败');
        }
      } catch (e) {
        console.error('删除用户失败', e);
        alert('删除失败：' + (e.message || '未知错误'));
      }
    });
  });
}

function setupUserModal() {
  const modal = document.getElementById('user-modal');
  const form = document.getElementById('user-form');
  const closeBtn = document.getElementById('user-modal-close');
  const cancelBtn = document.getElementById('user-cancel-btn');
  const searchBtn = document.getElementById('user-search-btn');
  const refreshBtn = document.getElementById('user-refresh-btn');
  const searchInput = document.getElementById('user-search');
  
  if (!modal || !form) return;
  
  [closeBtn, cancelBtn].forEach((btn) => {
    btn?.addEventListener('click', closeUserModal);
  });
  
  form.addEventListener('submit', handleUserSubmit);
  
  // 搜索功能
  searchBtn?.addEventListener('click', async () => {
    const keyword = searchInput?.value.trim();
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;">搜索中...</td></tr>';
    try {
      const res = keyword ? await apiClient.searchUsers(keyword) : await apiClient.getAllUsers();
      if (res && res.success && Array.isArray(res.users)) {
        usersState.users = res.users;
        renderUsers();
      } else {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:20px;color:#f00;">搜索失败：${res?.message || '未知错误'}</td></tr>`;
      }
    } catch (e) {
      console.error('搜索用户失败', e);
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;color:#f00;">搜索失败，请稍后重试</td></tr>';
    }
  });
  
  // 刷新功能
  refreshBtn?.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    loadUsers();
  });
  
  // 回车搜索
  searchInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchBtn?.click();
    }
  });
}

function openUserModal(user = null) {
  const modal = document.getElementById('user-modal');
  const title = document.getElementById('user-modal-title');
  const form = document.getElementById('user-form');
  const idEl = document.getElementById('user-id');
  const usernameEl = document.getElementById('user-username');
  const roleEl = document.getElementById('user-role');
  const createdAtEl = document.getElementById('user-created-at');
  
  if (!modal || !form) return;
  
  if (user) {
    if (title) title.textContent = '编辑用户';
    if (idEl) idEl.value = user.id || '';
    if (usernameEl) usernameEl.value = user.username || '';
    if (roleEl) roleEl.value = user.role || 'user';
    if (createdAtEl) createdAtEl.value = user.created_at ? new Date(user.created_at).toLocaleString('zh-CN') : '';
  } else {
    if (title) title.textContent = '添加用户';
    form.reset();
    if (idEl) idEl.value = '';
    if (createdAtEl) createdAtEl.value = '';
  }
  
  modal.style.display = 'block';
}

function closeUserModal() {
  const modal = document.getElementById('user-modal');
  if (modal) modal.style.display = 'none';
}

async function handleUserSubmit(e) {
  e.preventDefault();
  const idEl = document.getElementById('user-id');
  const usernameEl = document.getElementById('user-username');
  const roleEl = document.getElementById('user-role');
  
  if (!usernameEl || !roleEl) return;
  
  const id = idEl?.value ? Number(idEl.value) : null;
  const userData = {
    username: usernameEl.value.trim(),
    role: roleEl.value,
  };
  
  if (!userData.username) {
    alert('请填写用户名');
    return;
  }
  
  if (!['user', 'admin'].includes(userData.role)) {
    alert('请选择有效的角色');
    return;
  }
  
  try {
    const res = id ? await apiClient.updateUser(id, userData) : null;
    if (res && res.success) {
      alert('保存成功');
      closeUserModal();
      loadUsers();
    } else {
      alert(res?.message || '保存失败');
    }
  } catch (e) {
    console.error('保存用户失败', e);
    alert('保存失败：' + (e.message || '未知错误'));
  }
}

// ---------------- 产地直采（省份&地方商品） ----------------
async function loadProvinces() {
  const container = document.getElementById('provinces-list');
  if (!container) return;
  container.innerHTML = '<div class="loading">加载中...</div>';
  try {
    const res = await apiClient.getAllProvinces();
    if (res && res.success && Array.isArray(res.provinces)) {
      directSourcingState.provinces = res.provinces;
      renderProvinces();
    } else {
      container.innerHTML = `<div class="error">加载失败：${res?.message || '未知错误'}</div>`;
    }
  } catch (e) {
    console.error('加载省份失败', e);
    container.innerHTML = '<div class="error">加载失败，请稍后重试</div>';
  }
}

function renderProvinces() {
  const container = document.getElementById('provinces-list');
  if (!container) return;
  const provinces = directSourcingState.provinces || [];
  if (!provinces.length) {
    container.innerHTML = '<div class="empty-state">暂无省份数据</div>';
    return;
  }
  container.innerHTML = provinces
    .map((p) => {
      const products = Array.isArray(p.products) ? p.products : [];
      const productHTML =
        products.length === 0
          ? '<div class="empty-state">暂无地方商品</div>'
          : products
              .map((prod) => {
                const price = Number(prod.price || 0);
                const original = Number(prod.original_price || prod.originalPrice || price);
                const discountText = original > price ? `（约 ${(price / original * 10).toFixed(1)} 折）` : '';
                const seasonal = prod.isSeasonal || prod.is_seasonal;
                return `<div class="local-product-item">
                  <img src="${prod.image || 'https://via.placeholder.com/160?text=商品'}" alt="${prod.name || ''}" class="local-product-image">
                  <div class="local-product-info">
                    <h4>${prod.name || '未命名商品'}</h4>
                    <p>${prod.description || '暂无描述'}</p>
                    <p class="local-product-price">¥${price.toFixed(2)} ${discountText}</p>
                    ${seasonal ? '<span class="tag seasonal">当季</span>' : ''}
                  </div>
                  <div class="local-product-actions">
                    <button class="btn edit-local-product-btn" data-province-id="${p.id}" data-product-id="${prod.id}">编辑</button>
                    <button class="btn danger delete-local-product-btn" data-province-id="${p.id}" data-product-id="${prod.id}">删除</button>
                  </div>
                </div>`;
              })
              .join('');
      return `<div class="province-card">
        <div class="province-header">
          <div>
            <h3>${p.name}</h3>
            <div class="province-meta">${p.description || ''}</div>
          </div>
          <div class="province-actions">
            <button class="btn" data-action="add-local" data-id="${p.id}">添加商品</button>
            <button class="btn edit-btn" data-action="edit-province" data-id="${p.id}">编辑</button>
            <button class="btn danger" data-action="delete-province" data-id="${p.id}">删除</button>
          </div>
        </div>
        <div class="local-products-list">
          ${productHTML}
        </div>
      </div>`;
    })
    .join('');

  // 绑定省份级按钮
  container.querySelectorAll('[data-action="add-local"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const pid = Number(btn.getAttribute('data-id'));
      openLocalProductModal({ provinceId: pid });
    });
  });
  container.querySelectorAll('[data-action="edit-province"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const pid = Number(btn.getAttribute('data-id'));
      const province = provinces.find((x) => x.id === pid);
      openProvinceModal(province || { id: pid });
    });
  });
  container.querySelectorAll('[data-action="delete-province"]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const pid = Number(btn.getAttribute('data-id'));
      if (!confirm('确定删除该省份及其下的商品吗？')) return;
      const res = await apiClient.deleteProvince(pid);
      if (res && res.success) {
        alert('删除成功');
        loadProvinces();
      } else {
        alert(res?.message || '删除失败');
      }
    });
  });
  // 绑定商品级按钮
  container.querySelectorAll('.edit-local-product-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const pid = Number(btn.getAttribute('data-province-id'));
      const productId = Number(btn.getAttribute('data-product-id'));
      const province = provinces.find((x) => x.id === pid);
      const product = province?.products?.find((p) => p.id === productId);
      openLocalProductModal({ provinceId: pid, product });
    });
  });
  container.querySelectorAll('.delete-local-product-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const pid = Number(btn.getAttribute('data-province-id'));
      const productId = Number(btn.getAttribute('data-product-id'));
      if (!confirm('确定删除该地方商品吗？')) return;
      const res = await apiClient.deleteLocalProduct(pid, productId);
      if (res && res.success) {
        alert('删除成功');
        loadProvinces();
      } else {
        alert(res?.message || '删除失败');
      }
    });
  });
}

// ----------- 产地直采：弹窗与提交 -----------
function setupDirectSourcingModals() {
  provinceModalEl = document.getElementById('province-modal');
  provinceFormEl = document.getElementById('province-form');
  provinceIdEl = document.getElementById('province-id');
  provinceNameEl = document.getElementById('province-name');
  provinceDescEl = document.getElementById('province-description');
  provinceDiscountEl = document.getElementById('province-discount');
  provinceAddBtn = document.getElementById('add-province-btn');
  localProductModalEl = document.getElementById('local-product-modal');
  localProductFormEl = document.getElementById('local-product-form');
  localProductIdEl = document.getElementById('local-product-id');
  localProductProvinceIdEl = document.getElementById('local-product-province-id');
  localProductNameEl = document.getElementById('local-product-name');
  localProductPriceEl = document.getElementById('local-product-price');
  localProductOriginalPriceEl = document.getElementById('local-product-original-price');
  localProductDescEl = document.getElementById('local-product-description');
  localProductImageFileEl = document.getElementById('local-product-image-file');
  localProductImagePreviewEl = document.getElementById('local-product-image-preview');
  localProductImageUrlEl = document.getElementById('local-product-image-url');
  localProductSeasonalEl = document.getElementById('local-product-seasonal');

  if (provinceAddBtn) {
    provinceAddBtn.addEventListener('click', () => openProvinceModal());
  }
  const provinceClose = document.getElementById('province-modal-close');
  const provinceCancel = document.getElementById('province-cancel-btn');
  [provinceClose, provinceCancel].forEach((el) => el?.addEventListener('click', closeProvinceModal));
  provinceFormEl?.addEventListener('submit', handleProvinceSubmit);

  const lpClose = document.getElementById('local-product-modal-close');
  const lpCancel = document.getElementById('cancel-local-product-btn');
  [lpClose, lpCancel].forEach((el) => el?.addEventListener('click', closeLocalProductModal));
  localProductFormEl?.addEventListener('submit', handleLocalProductSubmit);

  if (localProductImageFileEl) {
    localProductImageFileEl.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const valid = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!valid.includes(file.type)) {
        alert('请选择有效的图片文件（JPEG/PNG/GIF/WebP）');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert('图片大小不能超过2MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const src = ev.target?.result;
        if (!src) return;
        localProductImageUrlEl.value = src;
        if (localProductImagePreviewEl) {
          localProductImagePreviewEl.innerHTML = `<img src="${src}" style="max-width:200px;max-height:200px;">`;
        }
      };
      reader.readAsDataURL(file);
    });
  }
}

function openProvinceModal(province = {}) {
  if (!provinceModalEl) return;
  document.getElementById('province-modal-title').textContent = province.id ? '编辑省份' : '添加省份';
  provinceIdEl.value = province.id || '';
  provinceNameEl.value = province.name || '';
  provinceDescEl.value = province.description || '';
  provinceDiscountEl.value = Number.isFinite(province.discount) ? province.discount : 0;
  provinceModalEl.style.display = 'flex';
}

function closeProvinceModal() {
  if (provinceModalEl) provinceModalEl.style.display = 'none';
}

async function handleProvinceSubmit(e) {
  e.preventDefault();
  const payload = {
    name: provinceNameEl.value.trim(),
    description: provinceDescEl.value.trim(),
    discount: parseInt(provinceDiscountEl.value || '0', 10) || 0,
  };
  if (!payload.name) return alert('请填写省份名称');
  const id = provinceIdEl.value;
  const res = id ? await apiClient.updateProvince(id, payload) : await apiClient.addProvince(payload);
  if (res && res.success) {
    alert('保存成功');
    closeProvinceModal();
    loadProvinces();
  } else {
    alert(res?.message || '保存失败');
  }
}

function openLocalProductModal({ provinceId, product } = {}) {
  if (!localProductModalEl) return;
  const isEdit = !!product;
  document.getElementById('local-product-modal-title').textContent = isEdit ? '编辑地方商品' : '添加地方商品';
  localProductIdEl.value = product?.id || '';
  localProductProvinceIdEl.value = provinceId || product?.province_id || '';
  localProductNameEl.value = product?.name || '';
  localProductPriceEl.value = product?.price || '';
  localProductOriginalPriceEl.value = product?.original_price || product?.originalPrice || '';
  localProductDescEl.value = product?.description || '';
  if (localProductImageFileEl) localProductImageFileEl.value = '';
  localProductImageUrlEl.value = product?.image || '';
  if (localProductImagePreviewEl) {
    localProductImagePreviewEl.innerHTML = product?.image
      ? `<img src="${product.image}" style="max-width:200px;max-height:200px;">`
      : '';
  }
  localProductSeasonalEl.checked = product?.isSeasonal || product?.is_seasonal || false;
  localProductModalEl.style.display = 'flex';
}

function closeLocalProductModal() {
  if (localProductModalEl) localProductModalEl.style.display = 'none';
}

async function handleLocalProductSubmit(e) {
  e.preventDefault();
  const provinceId = Number(localProductProvinceIdEl.value);
  if (!provinceId) return alert('缺少省份ID');
  const payload = {
    name: localProductNameEl.value.trim(),
    price: parseFloat(localProductPriceEl.value || '0'),
    originalPrice: parseFloat(localProductOriginalPriceEl.value || localProductPriceEl.value || '0'),
    description: localProductDescEl.value.trim(),
    image: localProductImageUrlEl.value.trim(),
    isSeasonal: localProductSeasonalEl.checked,
  };
  if (!payload.name) return alert('请填写商品名称');
  if (!Number.isFinite(payload.price) || payload.price <= 0) return alert('请填写有效价格');
  const id = localProductIdEl.value;
  const res = id
    ? await apiClient.updateLocalProduct(provinceId, id, payload)
    : await apiClient.addLocalProduct(provinceId, payload);
  if (res && res.success) {
    alert('保存成功');
    closeLocalProductModal();
    loadProvinces();
  } else {
    alert(res?.message || '保存失败');
  }
}

