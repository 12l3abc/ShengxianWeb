// api-server.js
const auth = require('./backend/api/auth');
const products = require('./backend/api/products-api');
const productImages = require('./backend/api/product-images-api');
const directSourcing = require('./backend/api/directSourcing');
const users = require('./backend/api/users-api');

// -------------- 路由表 --------------
const routeDefs = [
  // 认证
  { method: 'POST', path: '/login', handler: d => auth.login(d.username, d.password) },
  { method: 'POST', path: '/register', handler: d => auth.register(d.username, d.password) },
  { method: 'GET',  path: '/user', handler: d => auth.getUserInfo(d.userId) },
  
  // 用户管理
  { method: 'GET', path: '/api/users', handler: () => users.getAllUsers() },
  { method: 'GET', path: '/api/users/search', handler: d => users.searchUsers(d.keyword) },
  { method: 'GET', path: '/api/users/:id', handler: d => users.getUserById(d.id) },
  { method: 'PUT', path: '/api/users/:id', handler: d => users.updateUser(d.id, d) },
  { method: 'DELETE', path: '/api/users/:id', handler: d => users.deleteUser(d.id) },

  // 商品
  { method: 'GET', path: '/api/products', handler: () => products.getAllProducts() },
  { method: 'GET', path: '/api/products/special-offers', handler: () => products.getSpecialOfferProducts() },
  { method: 'GET', path: '/api/products/flash-sales', handler: () => products.getFlashSaleProducts() },
  { method: 'GET', path: '/api/products/meatPoultry', handler: () => products.getMeatPoultryProducts() },
  { method: 'GET', path: '/api/products/seafood', handler: () => products.getSeafoodProducts() },
  { method: 'GET', path: '/api/products/dairy', handler: () => products.getDairyBakeryProducts() },
  { method: 'GET', path: '/api/products/freshProduce', handler: () => products.getFreshProduceProducts() },
  { method: 'GET', path: '/api/products/beanProducts', handler: () => products.getBeanProducts() },
  { method: 'GET', path: '/api/products/category/:category', handler: d => products.getProductsByCategory(d.category) },
  { method: 'GET', path: '/api/products/:id', handler: d => products.getProductById(d.id) },
  { method: 'POST', path: '/api/products', handler: d => products.addProduct(d) },
  { method: 'PUT', path: '/api/products/:id', handler: d => products.updateProduct(d.id, d) },
  { method: 'DELETE', path: '/api/products/:id', handler: d => products.deleteProduct(d.id) },
  
  // 商品分类管理
  { method: 'GET', path: '/api/categories', handler: () => products.getAllCategories() },
  { method: 'GET', path: '/api/categories/level/:level', handler: d => products.getCategoriesByLevel(d.level) },
  { method: 'GET', path: '/api/categories/level/1', handler: () => products.getFirstLevelCategories() },
  { method: 'GET', path: '/api/categories/level/2', handler: () => products.getSecondLevelCategories() },
  { method: 'GET', path: '/api/categories/:id/subcategories', handler: d => products.getSubcategoriesByParentId(d.id) },
  { method: 'GET', path: '/api/categories/:id', handler: d => products.getCategoryById(d.id) },
  { method: 'POST', path: '/api/categories', handler: d => products.addCategory(d) },
  { method: 'PUT', path: '/api/categories/:id', handler: d => products.updateCategory(d.id, d) },
  { method: 'DELETE', path: '/api/categories/:id', handler: d => products.deleteCategory(d.id) },
  
  // 商品图片
  { method: 'GET', path: '/api/products/:id/images', handler: d => productImages.getProductImages(d.id) },
  { method: 'PUT', path: '/api/products/:id/images', handler: d => productImages.updateProductImage(d.id, d) },
  { method: 'DELETE', path: '/api/products/:id/images', handler: d => productImages.deleteProductImage(d.id) },
  
  // 产地直采
  { method: 'GET', path: '/api/direct-sourcing/provinces', handler: () => directSourcing.getAllProvinces() },
  { method: 'POST', path: '/api/direct-sourcing/provinces', handler: d => directSourcing.addProvince(d.province) },
  { method: 'PUT', path: '/api/direct-sourcing/provinces/:id', handler: d => directSourcing.updateProvince(d.id, d.province) },
  { method: 'DELETE', path: '/api/direct-sourcing/provinces/:id', handler: d => directSourcing.deleteProvince(d.id) },
  { method: 'GET', path: '/api/direct-sourcing/provinces/:provinceId/products', handler: d => directSourcing.getProvinceProducts(d.provinceId) },
  { method: 'POST', path: '/api/direct-sourcing/provinces/:provinceId/products', handler: d => directSourcing.addLocalProduct(d.provinceId, d.product) },
  { method: 'PUT', path: '/api/direct-sourcing/provinces/:provinceId/products/:productId', handler: d => directSourcing.updateLocalProduct(d.provinceId, d.productId, d.product) },
  { method: 'DELETE', path: '/api/direct-sourcing/provinces/:provinceId/products/:productId', handler: d => directSourcing.deleteLocalProduct(d.provinceId, d.productId) },
  
  // 没有/api前缀的路由，兼容旧版本
  { method: 'GET', path: '/products', handler: () => products.getAllProducts() },
  { method: 'GET', path: '/products/special-offers', handler: () => products.getSpecialOfferProducts() },
  { method: 'GET', path: '/products/flash-sales', handler: () => products.getFlashSaleProducts() },
  { method: 'GET', path: '/products/meatPoultry', handler: () => products.getMeatPoultryProducts() },
  { method: 'GET', path: '/products/seafood', handler: () => products.getSeafoodProducts() },
  { method: 'GET', path: '/products/dairy', handler: () => products.getDairyBakeryProducts() },
  { method: 'GET', path: '/products/freshProduce', handler: () => products.getFreshProduceProducts() },
  { method: 'GET', path: '/products/beanProducts', handler: () => products.getBeanProducts() },
  { method: 'GET', path: '/products/category/:category', handler: d => products.getProductsByCategory(d.category) },
  { method: 'GET', path: '/products/:id', handler: d => products.getProductById(d.id) },
  { method: 'POST', path: '/products', handler: d => products.addProduct(d) },
  { method: 'PUT', path: '/products/:id', handler: d => products.updateProduct(d.id, d) },
  { method: 'DELETE', path: '/products/:id', handler: d => products.deleteProduct(d.id) },
  
  // 商品分类管理（兼容旧版本）
  { method: 'GET', path: '/categories', handler: () => products.getAllCategories() },
  { method: 'GET', path: '/categories/level/:level', handler: d => products.getCategoriesByLevel(d.level) },
  { method: 'GET', path: '/categories/level/1', handler: () => products.getFirstLevelCategories() },
  { method: 'GET', path: '/categories/level/2', handler: () => products.getSecondLevelCategories() },
  { method: 'GET', path: '/categories/:id/subcategories', handler: d => products.getSubcategoriesByParentId(d.id) },
  { method: 'GET', path: '/categories/:id', handler: d => products.getCategoryById(d.id) },
  { method: 'POST', path: '/categories', handler: d => products.addCategory(d) },
  { method: 'PUT', path: '/categories/:id', handler: d => products.updateCategory(d.id, d) },
  { method: 'DELETE', path: '/categories/:id', handler: d => products.deleteCategory(d.id) },
  
  { method: 'GET', path: '/direct-sourcing/provinces', handler: () => directSourcing.getAllProvinces() },
  { method: 'POST', path: '/direct-sourcing/provinces', handler: d => directSourcing.addProvince(d.province) },
  { method: 'PUT', path: '/direct-sourcing/provinces/:id', handler: d => directSourcing.updateProvince(d.id, d.province) },
  { method: 'DELETE', path: '/direct-sourcing/provinces/:id', handler: d => directSourcing.deleteProvince(d.id) },
  { method: 'GET', path: '/direct-sourcing/provinces/:provinceId/products', handler: d => directSourcing.getProvinceProducts(d.provinceId) },
  { method: 'POST', path: '/direct-sourcing/provinces/:provinceId/products', handler: d => directSourcing.addLocalProduct(d.provinceId, d.product) },
  { method: 'PUT', path: '/direct-sourcing/provinces/:provinceId/products/:productId', handler: d => directSourcing.updateLocalProduct(d.provinceId, d.productId, d.product) },
  { method: 'DELETE', path: '/direct-sourcing/provinces/:provinceId/products/:productId', handler: d => directSourcing.deleteLocalProduct(d.provinceId, d.productId) },
];

// -------------- 路由预编译 --------------
const compiledRoutes = routeDefs.map(r => {
  const keys = [];
  const reg = r.path.replace(/:([^/]+)/g, (_, k) => {
    keys.push(k);
    return '([^/]+)';
  });
  return { ...r, keys, regex: new RegExp(`^${reg}$`) };
});

// -------------- 主类 --------------
class ApiServer {
  async handleRequest(method, url, data = {}) {
    console.log(`[API] 收到请求: ${method} ${url}`);
    console.log(`[API] 请求数据:`, data);
    const route = this.matchRoute(method, url);
    if (!route) {
      console.log(`[API] 错误: 找不到匹配的路由 ${method} ${url}`);
      return { success: false, message: '接口未找到' };
    }
    console.log(`[API] 找到匹配的路由: ${method} ${route.path}`);

    // 合并路径参数 + body 数据
    const merged = { ...data, ...route.params };

    try {
      // 由于后端API已经返回了正确格式的数据，直接返回，避免重复包装
      const payload = await route.handler(merged);
      // 确保响应包含success字段
      if (!payload.hasOwnProperty('success')) {
        // 如果返回的是数组，并且路由包含 "products"，则使用 products 字段
        if (Array.isArray(payload) && (route.path.includes('products') || route.path.includes('special-offers') || route.path.includes('flash-sales'))) {
          return { success: true, products: payload };
        }
        return { success: true, data: payload };
      }
      return payload;
    } catch (e) {
      console.error('[API] 处理错误:', e);
      return { success: false, message: e.message || '服务器内部错误' };
    }
  }

  matchRoute(method, url) {
    console.log(`[API] 尝试匹配路由: ${method} ${url}`);
    console.log(`[API] 路由总数: ${compiledRoutes.length}`);
    
    for (const r of compiledRoutes) {
      console.log(`[API] 检查路由: ${r.method} ${r.path} (正则: ${r.regex})`);
      if (r.method !== method) {
        console.log(`[API] 方法不匹配: 期望 ${r.method}, 收到 ${method}`);
        continue;
      }
      const m = url.match(r.regex);
      if (!m) {
        console.log(`[API] 路径不匹配: ${url} 不匹配 ${r.regex}`);
        continue;
      }
      console.log(`[API] 路径匹配成功: ${url} 匹配 ${r.regex}`);
      const params = {};
      r.keys.forEach((k, i) => { params[k] = decodeURIComponent(m[i + 1]); });
      console.log(`[API] 提取的参数:`, params);
      return { ...r, params };
    }
    console.log(`[API] 未找到匹配的路由`);
    return null;
  }
}

// 统一的 HTTP 响应格式
function httpWrap(status, body) {
  return { status, headers: { 'Content-Type': 'application/json' }, body };
}

module.exports = new ApiServer();