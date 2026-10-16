class ApiClient {
    constructor() {
        // API服务器地址 - 确保指向正确的端口
        this.baseUrl = 'http://localhost:3001'; // 与服务器端口保持一致
        this.useMockData = false; // 添加模拟数据开关，设置为false使用真实API

        // 图片清洗，防止占位符域名导致加载失败
        this.cleanImage = (src) => {
            if (!src) return 'src/shengxian.png';
            const lower = String(src).toLowerCase();
            if (lower.includes('placeholder.com') || lower.includes('via.placeholder')) {
                return 'src/shengxian.png';
            }
            return src;
        };

        // 按分类/小类提供本地图作为兜底
        this.fallbackImage = (category, subcategory) => {
            const base = 'src/shengxian.png';
            const map = {
                freshProduce: 'src/fruit.png',
                meatPoultry: base,
                seafood: base,
                dairyBakery: base,
                beanProducts: base,
                readyMeals: base,
                specialOffers: base,
                beef: base,
                pork: base,
                lamb: base,
                chicken: base,
                duck: base,
                goose: base,
                egg: base,
            };
            return map[subcategory] || map[category] || base;
        };

        // 子分类ID到名称映射（与后端一致）
        this.subcategoryIdMap = {
            21: 'pork',
            22: 'beef',
            23: 'lamb',
            24: 'chicken',
            25: 'duck',
            26: 'egg',
            31: 'fish',
            32: 'shrimp',
            33: 'crab',
            34: 'shellfish',
            35: 'otherSeafood',
            41: 'milk',
            42: 'yogurt',
            43: 'cheese',
            44: 'bread',
            45: 'pastry',
            51: 'tofu',
            52: 'beanCurd',
            53: 'soyMilk',
            54: 'grains',
            55: 'beans',
            61: 'preWashed',
            62: 'preCut',
            63: 'readyToCook',
            64: 'readyToEat',
            65: 'frozenMeals',
        };

        // 统一清洗商品数组的图片
        this.normalizeProducts = (list) =>
            Array.isArray(list)
                ? list.map((p) => ({
                      ...p,
                      image: this.cleanImage(p.image) || this.fallbackImage(p.category, p.subcategory),
                      // 兼容下划线字段
                      isSpecialOffer:
                          p.isSpecialOffer !== undefined
                              ? p.isSpecialOffer
                              : p.is_special_offer === 1 || p.is_special_offer === true,
                      isFlashSale:
                          p.isFlashSale !== undefined
                              ? p.isFlashSale
                              : p.is_flash_sale === 1 || p.is_flash_sale === true,
                      flashSaleEndTime: p.flashSaleEndTime || p.flash_sale_end_time || null,
                      // 统一子分类字段，便于前端分类过滤
                      subcategory: (() => {
                          const subRaw =
                              p.subcategory ??
                              p.subcategoryName ??
                              p.subcategory_name ??
                              p.subcategory_id ??
                              p.subcategoryId ??
                              '';
                          if (subRaw === null || subRaw === undefined) return '';
                          const asNum = Number(subRaw);
                          if (!Number.isNaN(asNum) && this.subcategoryIdMap[asNum]) {
                              return this.subcategoryIdMap[asNum];
                          }
                          return String(subRaw);
                      })(),
                      subcategory_id: (() => {
                          const subRaw =
                              p.subcategory_id ??
                              p.subcategoryId ??
                              p.subcategory ??
                              p.subcategoryName ??
                              p.subcategory_name ??
                              '';
                          const asNum = Number(subRaw);
                          return Number.isNaN(asNum) ? null : asNum;
                      })(),
                  }))
                : list;
        
        // 检测浏览器环境
        this.isBrowser = typeof window !== 'undefined';
        console.log('[ApiClient] 初始化，baseUrl设置为:', this.baseUrl);
        console.log('[ApiClient] 是否使用模拟数据:', this.useMockData);
        console.log('[ApiClient] 运行环境:', this.isBrowser ? '浏览器' : 'Node.js');
    }
    
    // 发送HTTP请求
    async request(method, url, data = null) {
        // 添加时间戳参数防止浏览器缓存
        let finalUrl = url;
        if (method === 'GET') {
            const timestamp = new Date().getTime();
            // 检查URL中是否已有查询参数
            if (finalUrl.includes('?')) {
                finalUrl += `&_t=${timestamp}`;
            } else {
                finalUrl += `?_t=${timestamp}`;
            }
        }
        
        const fullUrl = this.baseUrl + finalUrl;
        console.log(`[API Client] 请求URL: ${fullUrl}`);
        console.log(`[API Client] 请求方法: ${method}`);
        console.log(`[API Client] 请求路径: ${finalUrl}`);
        
        // 隐藏密码信息
        if (data) {
            const safeData = { ...data };
            if (safeData.password) {
                safeData.password = '***';
            }
            console.log(`[API Client] 请求数据:`, safeData);
        } else {
            console.log(`[API Client] 请求数据: null`);
        }
        
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
            // 不使用 credentials: 'include'，避免 file:// 或不同源下的请求被CORS拦截
        };
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        try {
            console.log(`[API Client] 正在发送请求到: ${fullUrl}...`);
            console.log(`[API Client] 请求选项:`, options);
            
            // 先检查网络连接
            if (!navigator.onLine) {
                throw new Error('网络连接已断开');
            }
            
            const response = await fetch(fullUrl, options);
            console.log(`[API Client] 收到响应: ${response.status} ${response.statusText}`);
            console.log(`[API Client] 响应URL: ${response.url}`);
            console.log(`[API Client] 响应状态: ${response.ok ? '成功' : '失败'}`);
            console.log(`[API Client] 响应头:`, Object.fromEntries(response.headers.entries()));
            
            // 检查响应是否为空
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                try {
                    const result = await response.json();
                    console.log('[API Client] 响应数据:', result);
                    return result;
                } catch (jsonError) {
                    console.error(`[API Client] 解析JSON响应失败:`, jsonError);
                    const text = await response.text();
                    console.log(`[API Client] 原始响应文本:`, text);
                    return { success: false, message: `响应解析错误: ${jsonError.message}` };
                }
            } else {
                console.log(`[API Client] 响应不是JSON格式，内容类型: ${contentType}`);
                const text = await response.text();
                console.log(`[API Client] 响应文本:`, text);
                return { success: false, message: `非JSON响应: ${text}` };
            }
        } catch (error) {
            console.error('[API Client] API请求失败:', error);
            console.error('[API Client] 错误类型:', error.name);
            console.error('[API Client] 错误堆栈:', error.stack);
            return {
                success: false,
                message: '网络请求失败: ' + error.message,
                error: error.toString(),
                errorName: error.name,
                errorStack: error.stack
            };
        }
    }
    
    // 登录
    async login(username, password) {
        console.log(`[API Client] 登录调用，用户名: ${username}`);
        return this.request('POST', '/login', { username, password });
    }
    
    // 注册
    async register(username, password) {
        console.log(`[API Client] 注册调用，用户名: ${username}`);
        return this.request('POST', '/register', { username, password });
    }
    
    // 获取所有商品
    async getAllProducts() {
        if (this.useMockData) {
            console.log('[ApiClient] 使用模拟数据获取所有商品');
            // 模拟商品列表
            return {
                success: true,
                products: [
                    {
                        id: 1,
                        name: '苹果',
                        category: 'freshProduce',
                        price: 9.99,
                        stock: 100,
                        image: 'https://picsum.photos/id/1080/200/200',
                        description: '新鲜红苹果',
                        isSpecialOffer: false,
                        isFlashSale: false
                    },
                    {
                        id: 2,
                        name: '牛奶',
                        category: 'dairyBakery',
                        price: 5.99,
                        stock: 50,
                        image: 'https://picsum.photos/id/431/200/200',
                        description: '纯牛奶',
                        isSpecialOffer: true,
                        isFlashSale: false
                    }
                ]
            };
        }
        console.log(`[API Client] 获取所有商品调用`);
        const res = await this.request('GET', '/api/products');
        if (res && res.success && res.products) {
            res.products = this.normalizeProducts(res.products);
        }
        return res;
    }
    
    // 根据分类获取商品
    async getProductsByCategory(category) {
        console.log(`[API Client] 获取分类商品调用，分类: ${category}`);
        const res = await this.request('GET', `/api/products/category/${category}`);
        if (res && res.success && res.products) {
            res.products = this.normalizeProducts(res.products);
        }
        return res;
    }
    
    // 添加商品
    async addProduct(product) {
        if (this.useMockData) {
            console.log('[ApiClient] 使用模拟数据添加商品:', product);
            // 模拟成功响应
            return {
                success: true,
                data: {
                    id: Date.now(), // 生成唯一ID
                    ...product
                },
                message: '商品添加成功'
            };
        }
        return this.request('POST', '/api/products', product);
    }
    
    // 更新商品
    async updateProduct(id, product) {
        return this.request('PUT', '/api/products/' + id, product);
    }
    
    // 删除商品
    async deleteProduct(id) {
        return this.request('DELETE', '/api/products/' + id);
    }
    
    // 获取特价商品
    async getSpecialOfferProducts() {
        // 路径不需要包含/api前缀，因为baseUrl已经包含了
        const res = await this.request('GET', '/api/products/special-offers');
        if (res && res.success && res.products) {
            res.products = this.normalizeProducts(res.products);
        }
        return res;
    }
    
    // 获取秒杀商品
    async getFlashSaleProducts() {
        const res = await this.request('GET', '/api/products/flash-sales');
        if (res && res.success && res.products) {
            res.products = this.normalizeProducts(res.products);
        }
        return res;
    }
    
    // 产地直采相关API
    // 获取所有省份
    async getAllProvinces() {
        return this.request('GET', '/api/direct-sourcing/provinces');
    }
    
    // 添加省份
    async addProvince(province) {
        return this.request('POST', '/api/direct-sourcing/provinces', { province });
    }
    
    // 更新省份
    async updateProvince(id, province) {
        return this.request('PUT', '/api/direct-sourcing/provinces/' + id, { province });
    }
    
    // 删除省份
    async deleteProvince(id) {
        return this.request('DELETE', '/api/direct-sourcing/provinces/' + id);
    }
    
    // 获取省份的地方商品
    async getProvinceProducts(provinceId) {
        return this.request('GET', '/api/direct-sourcing/provinces/' + provinceId + '/products');
    }
    
    // 添加地方商品
    async addLocalProduct(provinceId, product) {
        return this.request('POST', '/api/direct-sourcing/provinces/' + provinceId + '/products', { product });
    }
    
    // 更新地方商品
    async updateLocalProduct(provinceId, productId, product) {
        return this.request('PUT', '/api/direct-sourcing/provinces/' + provinceId + '/products/' + productId, { product });
    }
    
    // 删除地方商品
    async deleteLocalProduct(provinceId, productId) {
        return this.request('DELETE', '/api/direct-sourcing/provinces/' + provinceId + '/products/' + productId);
    }
    
    // 用户管理相关方法
    // 获取所有用户
    async getAllUsers() {
        return this.request('GET', '/api/users');
    }
    
    // 搜索用户
    async searchUsers(keyword) {
        return this.request('GET', '/api/users/search', { keyword });
    }
    
    // 根据ID获取用户
    async getUserById(id) {
        return this.request('GET', '/api/users/' + id);
    }
    
    // 更新用户信息
    async updateUser(id, userData) {
        return this.request('PUT', '/api/users/' + id, userData);
    }
    
    // 删除用户
    async deleteUser(id) {
        return this.request('DELETE', '/api/users/' + id);
    }
}

// 创建API客户端实例
const apiClient = new ApiClient();

// 导出API客户端
window.apiClient = apiClient;