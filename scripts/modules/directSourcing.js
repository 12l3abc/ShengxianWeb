// 产地直采模块

// 加载外部CSS函数
function loadCSS(href) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
}

// 加载外部CSS
loadCSS('../../css/modules/directSourcing.css');

// 中国地图交互特效
class ChinaMapInteraction {
    constructor() {
        this.mapContainer = null;
        this.provinceData = []; // 从API获取数据
        this.handleDocumentClick = null;
        this.init();
    }
    
    async init() {
        // 创建地图容器
        this.createMapContainer();
        
        // 从API获取省份数据
        await this.fetchProvinceData();
        
        // 初始化省份标记
        this.initializeProvinces();
    }
    
    createMapContainer() {
        const container = document.getElementById('direct-sourcing');
        if (container) {
            this.mapContainer = document.createElement('div');
            this.mapContainer.className = 'map-container';
            this.mapContainer.innerHTML = '<h3>点击省份查看当地直采商品</h3>';
            container.appendChild(this.mapContainer);
        }
    }
    
    initializeProvinces() {
        // 简化版中国地图省份位置（模拟）
        const provincePositions = {
            '北京': { top: '120px', left: '60%' },
            '上海': { top: '180px', left: '65%' },
            '广东': { top: '250px', left: '55%' },
            '山东': { top: '130px', left: '52%' },
            '四川': { top: '180px', left: '35%' },
            '云南': { top: '250px', left: '30%' },
            '新疆': { top: '100px', left: '10%' },
            '海南': { top: '300px', left: '50%' }
        };
        
        this.provinceData.forEach(province => {
            const position = provincePositions[province.name];
            if (position) {
                const provinceElement = document.createElement('div');
                provinceElement.className = 'province';
                provinceElement.style.top = position.top;
                provinceElement.style.left = position.left;
                provinceElement.setAttribute('data-province', province.name);
                provinceElement.innerHTML = `
                    ${province.name.substring(0, 2)}
                    <div class="province-label">${province.name}</div>
                `;
                
                this.mapContainer.appendChild(provinceElement);
            }
        });
        
        // 绑定点击事件
        this.bindProvinceEvents();
    }
    
    // 从API获取省份数据
    async fetchProvinceData() {
        try {
            const response = await fetch('http://localhost:3001/api/direct-sourcing/provinces');
            const data = await response.json();
            
            if (data.success) {
                // 转换数据格式以适配现有代码
        this.provinceData = data.provinces.map(province => ({
                    name: province.name,
                    discount: province.discount || 0,
                    products: Array.isArray(province.products) ? province.products : []
                }));
            } else {
                // 如果API请求失败，使用默认数据
                this.provinceData = [
                    { 
                        name: '北京', 
                        products: ['北京白菜', '京西稻', '平谷大桃', '延庆国光苹果', '大兴西瓜', '昌平草莓', '怀柔板栗', '密云金丝小枣'], 
                        discount: 15 
                    },
                    { 
                        name: '上海', 
                        products: ['崇明大米', '崇明芦笋', '浦东三黄鸡', '南汇水蜜桃', '金山蟠桃', '嘉定白蒜', '松江鲈鱼', '枫泾丁蹄'], 
                        discount: 10 
                    },
                    { 
                        name: '广东', 
                        products: ['增城丝苗米', '肇庆裹蒸粽', '惠州梅菜', '潮州蜜柑', '从化荔枝', '汕头牛肉丸', '茂名龙眼', '湛江对虾'], 
                        discount: 20 
                    }
                ];
            }
        } catch (error) {
            // 如果API请求失败，使用默认数据
            this.provinceData = [
                { 
                    name: '北京', 
                    products: ['北京白菜', '京西稻', '平谷大桃', '延庆国光苹果', '大兴西瓜', '昌平草莓', '怀柔板栗', '密云金丝小枣'], 
                    discount: 15 
                },
                { 
                    name: '上海', 
                    products: ['崇明大米', '崇明芦笋', '浦东三黄鸡', '南汇水蜜桃', '金山蟠桃', '嘉定白蒜', '松江鲈鱼', '枫泾丁蹄'], 
                    discount: 10 
                },
                { 
                    name: '广东', 
                    products: ['增城丝苗米', '肇庆裹蒸粽', '惠州梅菜', '潮州蜜柑', '从化荔枝', '汕头牛肉丸', '茂名龙眼', '湛江对虾'], 
                    discount: 20 
                }
            ];
        }
    }
    
    // 1.地图省份点击弹窗特效：点击省份时高亮并弹出特产信息卡片
    bindProvinceEvents() {
        this.handleDocumentClick = (e) => {
            if (e.target.classList.contains('province')) {
                const provinceName = e.target.getAttribute('data-province');
                this.showProvincePopup(provinceName, e.target);
            }
            
            // 点击其他地方关闭弹窗
            if (!e.target.closest('.province') && !e.target.closest('.province-popup')) {
                this.hideAllPopups();
            }
        };
        
        document.addEventListener('click', this.handleDocumentClick);
    }
    
    // 2.省份弹窗智能定位特效：根据视口翻转/限位，避免遮挡
    showProvincePopup(provinceName, element) {
        // 隐藏其他弹窗
        this.hideAllPopups();
        
        // 获取省份数据
        const province = this.provinceData.find(p => p.name === provinceName);
        if (!province) return;
        
        // 处理商品列表，支持字符串数组和对象数组
        let productNames = [];
        if (Array.isArray(province.products)) {
            productNames = province.products.map(product => {
                if (typeof product === 'string') {
                    return product;
                } else if (product && typeof product === 'object') {
                    return product.name || product.productName || product.title || '未命名商品';
                }
                return '未知商品';
            });
        }
        
        // 创建弹窗
        const popup = document.createElement('div');
        popup.className = 'province-popup';
        
        popup.innerHTML = `
            <div class="popup-arrow"></div>
            <h4>${province.name}直采</h4>
            <div class="popup-products">特色商品: ${productNames.length > 0 ? productNames.join('、') : '暂无特色商品'}</div>
            <div class="popup-discount">比市场价低${province.discount || 0}%</div>
            <button class="view-products-btn" data-province="${province.name}">查看商品</button>
        `;
        
        // 使用视口坐标定位，挂到 body 避免被容器裁剪
        popup.style.position = 'absolute';
        popup.style.zIndex = 9999;
        popup.style.visibility = 'hidden';
        document.body.appendChild(popup);

        const bubbleRect = element.getBoundingClientRect();
        const popupRect = popup.getBoundingClientRect();
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        const scrollX = window.scrollX || document.documentElement.scrollLeft;

        let top = bubbleRect.bottom + 10 + scrollY;
        let left = bubbleRect.left + bubbleRect.width / 2 - popupRect.width / 2 + scrollX;

        // 如果超出窗口底部，翻转到上方
        const viewportBottom = scrollY + window.innerHeight;
        if (top + popupRect.height > viewportBottom) {
            top = bubbleRect.top - popupRect.height - 10 + scrollY;
        }
        if (top < scrollY) top = bubbleRect.bottom + 10 + scrollY; // 兜底

        // 限制水平不超出窗口
        if (left < scrollX) left = scrollX + 10;
        const maxLeft = scrollX + window.innerWidth - popupRect.width - 10;
        if (left > maxLeft) left = maxLeft;

        popup.style.top = `${top}px`;
        popup.style.left = `${left}px`;
        popup.style.visibility = 'visible';
        popup.style.display = 'block';
        
        // 绑定查看商品按钮事件
        popup.querySelector('.view-products-btn').addEventListener('click', () => {
            // 先关闭弹窗，再显示商品列表
            this.hideAllPopups();
            this.showProvinceProducts(province.name);
        });
    }
    
    hideAllPopups() {
        document.querySelectorAll('.province-popup').forEach(popup => popup.remove());
    }
    
    // 规范化省份名称（去掉后缀/无关字样）
    normalizeProvinceName(name = '') {
        return name
            .replace(/直采商品|直采|特产|专区/g, '')
            .replace(/省|市|自治区|壮族|回族|维吾尔|特别行政区/g, '')
            .replace(/\s+/g, '')
            .trim();
    }

    // 获取兜底商品列表，保证至少有可见数据
    getFallbackProducts(provinceName) {
        const normalizedName = this.normalizeProvinceName(provinceName);
        const provinceProducts = {
            '北京': [
                { name: '北京白菜', desc: '京郊直供，清脆爽口', originalPrice: '8.80', discountPrice: '7.50' },
                { name: '京西稻', desc: '皇家贡米，口感软糯', originalPrice: '28.50', discountPrice: '24.20' },
                { name: '平谷大桃', desc: '个大味甜，汁多可口', originalPrice: '35.80', discountPrice: '30.40' },
                { name: '延庆国光苹果', desc: '酸甜适中，风味独特', originalPrice: '22.80', discountPrice: '19.40' },
                { name: '大兴西瓜', desc: '沙瓤甜脆，消暑解渴', originalPrice: '15.80', discountPrice: '13.40' }
            ],
            '上海': [
                { name: '崇明大米', desc: '生态种植，口感软糯', originalPrice: '26.80', discountPrice: '24.10' },
                { name: '浦东三黄鸡', desc: '散养土鸡，肉质鲜美', originalPrice: '58.80', discountPrice: '52.90' },
                { name: '南汇水蜜桃', desc: '个大汁多，甜而不腻', originalPrice: '45.80', discountPrice: '41.20' },
                { name: '金山蟠桃', desc: '肉质细腻，香气浓郁', originalPrice: '39.80', discountPrice: '35.80' },
                { name: '松江鲈鱼', desc: '肉质鲜嫩，营养丰富', originalPrice: '128.00', discountPrice: '115.20' }
            ],
            '广东': [
                { name: '增城丝苗米', desc: '米中珍品，细长如丝', originalPrice: '38.80', discountPrice: '31.00' },
                { name: '肇庆裹蒸粽', desc: '传统名吃，料多味美', originalPrice: '45.00', discountPrice: '36.00' },
                { name: '从化荔枝', desc: '妃子笑品种，甜如蜜', originalPrice: '58.00', discountPrice: '46.40' },
                { name: '汕头牛肉丸', desc: '手工制作，弹性十足', originalPrice: '68.00', discountPrice: '54.40' },
                { name: '湛江对虾', desc: '鲜活捕捞，肉质紧实', originalPrice: '88.00', discountPrice: '70.40' }
            ],
            '山东': [
                { name: '烟台红富士苹果', desc: '脆甜多汁，耐储存', originalPrice: '32.80', discountPrice: '24.60' },
                { name: '寿光黄瓜', desc: '生态种植，清脆爽口', originalPrice: '12.80', discountPrice: '9.60' },
                { name: '章丘大葱', desc: '高白脆甜，章丘特产', originalPrice: '16.80', discountPrice: '12.60' },
                { name: '青岛啤酒', desc: '百年品牌，醇厚爽口', originalPrice: '45.00', discountPrice: '33.80' },
                { name: '德州扒鸡', desc: '传统名菜，香而不腻', originalPrice: '78.00', discountPrice: '58.50' }
            ]
        };

        const matched =
            provinceProducts[provinceName] ||
            provinceProducts[normalizedName];

        if (matched && matched.length) return matched;

        // 通用占位
        return Array.from({ length: 8 }).map((_, idx) => ({
            name: `${normalizedName || provinceName || '产地'}优选商品${idx + 1}`,
            desc: '产地直采，品质保障',
            originalPrice: (20 + idx * 2).toFixed(2),
            discountPrice: (15 + idx * 1.5).toFixed(2),
            image: 'src/shengxian.png'
        }));
    }
    
    async showProvinceProducts(provinceName) {
        console.log('[DirectSourcing] showProvinceProducts 被调用，省份:', provinceName);
        console.log('[DirectSourcing] 当前 provinceData:', this.provinceData);
        
        // 先关闭所有省份弹窗
        this.hideAllPopups();
        
        const container = document.getElementById('direct-sourcing');
        if (!container) {
            console.error('[DirectSourcing] 容器元素未找到');
            return;
        }
        
        // 隐藏地图和其他内容
        if (this.mapContainer) this.mapContainer.style.display = 'none';
        
        // 清除旧的商品列表
        const oldProductsSection = container.querySelector('.province-products');
        if (oldProductsSection) {
            oldProductsSection.remove();
        }
        
        // 隐藏拼单区域
        const groupBuying = container.querySelector('.group-buying');
        if (groupBuying) {
            groupBuying.style.display = 'none';
        }
        
        const provinceData = this.provinceData.find(p => p.name === provinceName);
        console.log('[DirectSourcing] 找到的省份数据:', provinceData);
        // 兜底商品，确保后续渲染有数据来源
        const fallbackProducts = this.getFallbackProducts(provinceName);
        
        
        const productsSection = document.createElement('div');
        productsSection.className = 'province-products';
        productsSection.style.cssText = 'width: 100%; padding: 20px; background: #fff; border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.08);';
        
        // 3.商品秒渲染特效：先用兜底数据秒出列表，再后台刷新
        let displayProducts = this.getFallbackProducts(provinceName);
            console.log('[DirectSourcing] 立即使用兜底数据，数量:', displayProducts.length);
            
            // 在后台异步加载API数据，然后更新（不阻塞显示）
            this.loadAndUpdateProducts(provinceName, productsSection, fallbackProducts).catch(err => {
                console.error('[DirectSourcing] 后台加载API数据失败:', err);
            });
        
        console.log('[DirectSourcing] 立即显示商品数量:', displayProducts.length);
        console.log('[DirectSourcing] 商品数据:', displayProducts);
        
        // 确保有商品数据
        if (!displayProducts.length) {
            console.warn('[DirectSourcing] 没有商品数据，使用兜底数据');
            displayProducts = fallbackProducts;
        }
        
        // 立即渲染商品列表（使用兜底数据）
        productsSection.innerHTML = `
            <div class="products-header">
                <button class="back-to-map">← 返回地图</button>
                <h3>${provinceName}直采商品</h3>
            </div>
            <div class="products-grid" style="display: grid !important; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)) !important; gap: 20px !important; min-height: 280px !important; background: #f8f9fb !important; padding: 20px !important; border-radius: 12px !important; width: 100% !important; visibility: visible !important; opacity: 1 !important;">
                <div class="product-card skeleton" style="display: block !important; visibility: visible !important; opacity: 1 !important;">
                    <div class="product-image" style="background:#eee; height: 180px; border-radius: 10px;"></div>
                    <div class="product-info">
                        <h4 style="background:#f0f0f0;height:16px;width:60%;border-radius:4px;margin:10px 0;"></h4>
                        <p style="background:#f3f3f3;height:12px;width:90%;border-radius:4px;margin:5px 0;"></p>
                    </div>
                </div>
            </div>
        `;
        
        // 确保容器可见
        container.style.display = 'block';
        container.appendChild(productsSection);
        
        // 使用提取的方法渲染商品（在添加到DOM后）
        this.renderProducts(displayProducts, provinceName, productsSection, fallbackProducts);
        
        console.log('[DirectSourcing] 商品列表已添加到容器');
        console.log('[DirectSourcing] 商品网格元素:', productsSection.querySelector('.products-grid'));
        console.log('[DirectSourcing] 商品卡片数量:', productsSection.querySelectorAll('.product-card').length);
        
        // 绑定返回按钮事件（容器委托，避免事件丢失）
        productsSection.addEventListener('click', (evt) => {
            const backBtn = evt.target.closest('.back-to-map');
        if (backBtn) {
                productsSection.remove();
                if (this.mapContainer) {
                    this.mapContainer.style.display = 'block';
                }
                if (groupBuying) {
                    groupBuying.style.display = 'block';
                }
        }
        });
        
        // 注意：加入购物车按钮事件在renderProducts方法中统一处理，这里不再重复绑定
    }
    
    // 后台异步加载并更新商品数据（不阻塞初始显示）
    async loadAndUpdateProducts(provinceName, productsSection, fallbackProducts) {
        try {
            console.log('[DirectSourcing] 后台开始加载API数据...');
            const response = await fetch('http://localhost:3001/api/direct-sourcing/provinces');
            const data = await response.json();
            
            if (data.success && Array.isArray(data.provinces)) {
                const province = data.provinces.find(p => p.name === provinceName);
                if (province && Array.isArray(province.products) && province.products.length > 0) {
                    console.log('[DirectSourcing] API数据加载成功，数量:', province.products.length);
                    
                    // 更新缓存
                    const cachedProvince = this.provinceData.find(p => p.name === provinceName);
                    if (cachedProvince) {
                        cachedProvince.products = province.products;
                    }
                    
                    // 更新显示（如果用户还在查看这个省份）
                    const currentSection = document.querySelector('.province-products');
                    if (currentSection === productsSection) {
                        this.renderProducts(province.products, provinceName, productsSection, fallbackProducts);
                        console.log('[DirectSourcing] 商品列表已更新为API数据');
                    }
                }
            }
        } catch (error) {
            console.error('[DirectSourcing] 后台加载API数据失败:', error);
            // 静默失败，不影响已显示的数据
        }
    }
    
    // 渲染商品列表（提取为独立方法，便于复用）
    renderProducts(displayProducts, provinceName, productsSection, fallbackProducts) {
        console.log('[DirectSourcing] renderProducts 被调用');
        console.log('[DirectSourcing] displayProducts:', displayProducts);
        console.log('[DirectSourcing] productsSection:', productsSection);
        
        // 4.商品渲染防空兜底特效：双层兜底确保卡片一定渲染
        const safeFallback = Array.isArray(fallbackProducts) && fallbackProducts.length
            ? fallbackProducts
            : this.getFallbackProducts(provinceName);
        if (!Array.isArray(displayProducts) || displayProducts.length === 0) {
            console.warn('[DirectSourcing] 没有商品数据可渲染，使用兜底占位');
            displayProducts = safeFallback;
        }
        
        // 标准化商品数据：将字符串数组转换为对象数组
        const normalizedProducts = displayProducts.map((product) => {
            // 如果是字符串，转换为对象
            if (typeof product === 'string') {
                // 优先从fallbackProducts中找同名（若存在）
                if (Array.isArray(safeFallback)) {
                    const matched = safeFallback.find(p => p.name === product);
                    if (matched) return matched;
                }
                return {
                    name: product,
                    desc: '产地直采，品质保证',
                    originalPrice: '19.90',
                    discountPrice: '15.90',
                    image: 'src/shengxian.png'
                };
            }
            // 如果已经是对象，确保字段完整
            return {
                name: product.name || product.productName || product.title || '未命名商品',
                desc: product.description || product.desc || '暂无描述',
                originalPrice: product.original_price || product.originalPrice || product.price || '0',
                discountPrice: product.price || product.discountPrice || product.original_price || product.originalPrice || '0',
                image: product.image || product.imageUrl || 'src/shengxian.png'
            };
        });
        const finalProducts = normalizedProducts.length ? normalizedProducts : safeFallback;
        
        const productsGrid = productsSection.querySelector('.products-grid');
        if (!productsGrid) {
            console.error('[DirectSourcing] 找不到 .products-grid 元素');
            return;
        }
        
        console.log('[DirectSourcing] 准备渲染', finalProducts.length, '个商品');
        
        // 直接内联样式，确保可见性（避免被其他样式覆盖导致"看不见"）
        const cardStyle = 'background:#fff !important;border:2px solid #4CAF50 !important;border-radius:12px !important;min-height:240px !important;box-shadow:0 8px 24px rgba(0,0,0,0.12) !important;padding:12px !important;display:flex !important;flex-direction:column !important;gap:8px !important;color:#111 !important;visibility:visible !important;opacity:1 !important;position:relative !important;z-index:1 !important;';
        const productsHTML = finalProducts.length ? finalProducts.map((product) => {
            const productName = product.name || '未命名商品';
            const productDesc = product.desc || '暂无描述';
            const originalPrice = Number.parseFloat(product.originalPrice) || 0;
            const discountPrice = Number.parseFloat(product.discountPrice) || 0;
            const imageUrl = product.image || 'src/shengxian.png';
            const isBase64 = imageUrl.startsWith('data:image/');
            // 允许缓存，避免频繁刷新的延迟
            const finalImageUrl = isBase64 ? imageUrl : imageUrl;
            
            return `
                <div class="product-card" style="${cardStyle}">
                    <div class="product-image" style="height:180px;background:#f3f4f6;border-radius:10px;overflow:hidden;">
                        <img src="${finalImageUrl}" alt="${productName}" onerror="this.onerror=null;this.src='src/shengxian.png'" loading="lazy">
                    </div>
                    <div class="product-info" style="flex:1;color:#333;">
                        <h4 style="margin:8px 0;font-size:16px;font-weight:600;">${productName}</h4>
                        <p style="margin:0 0 10px 0;line-height:1.4;color:#555;">${productDesc}</p>
                        <div class="product-meta" style="display:flex;align-items:center;gap:10px;">
                            ${originalPrice > 0 ? `<span class="original-price" style="text-decoration:line-through;color:#888;">¥${originalPrice.toFixed(2)}</span>` : ''}
                            ${discountPrice > 0 ? `<span class="discount-price" style="color:#e53935;font-weight:700;font-size:16px;">¥${discountPrice.toFixed(2)}</span>` : ''}
                        </div>
                        <button class="add-to-cart-btn" style="margin-top:auto;padding:10px 12px;border:none;border-radius:8px;background:#4CAF50;color:#fff;font-weight:600;cursor:pointer;">加入购物车</button>
                    </div>
                </div>
            `;
        }).join('') : '<div class="no-products" style="grid-column: 1/-1; text-align: center; padding: 40px; color: #999;">暂无商品</div>';
        
        // 立即渲染商品HTML，移除 skeleton
        productsGrid.innerHTML = productsHTML;
        
        // 确保商品网格和卡片可见
        productsGrid.style.display = 'grid';
        productsGrid.style.visibility = 'visible';
        productsGrid.style.opacity = '1';
        productsGrid.querySelectorAll('.product-card').forEach(card => {
            card.style.display = 'flex';
            card.style.visibility = 'visible';
            card.style.opacity = '1';
        });
        
        let cardCount = productsGrid.querySelectorAll('.product-card').length;
        
        // 如果渲染后仍然没有卡片，强制使用兜底数据再渲染一次
        if (cardCount === 0) {
            const forceFallback = this.getFallbackProducts(provinceName);
            const forceHTML = forceFallback.map((product) => {
                const productName = product.name || '未命名商品';
                const productDesc = product.desc || '暂无描述';
                const originalPrice = Number.parseFloat(product.originalPrice) || 0;
                const discountPrice = Number.parseFloat(product.discountPrice) || 0;
                const imageUrl = product.image || 'src/shengxian.png';
                const isBase64 = imageUrl.startsWith('data:image/');
                const finalImageUrl = isBase64 ? imageUrl : imageUrl;
                return `
                    <div class="product-card" style="${cardStyle}">
                        <div class="product-image" style="height:180px;background:#f3f4f6;border-radius:10px;overflow:hidden;">
                            <img src="${finalImageUrl}" alt="${productName}" onerror="this.onerror=null;this.src='src/shengxian.png'" loading="lazy">
                        </div>
                        <div class="product-info" style="flex:1;color:#333;">
                            <h4 style="margin:8px 0;font-size:16px;font-weight:600;">${productName}</h4>
                            <p style="margin:0 0 10px 0;line-height:1.4;color:#555;">${productDesc}</p>
                            <div class="product-meta" style="display:flex;align-items:center;gap:10px;">
                                ${originalPrice > 0 ? `<span class="original-price" style="text-decoration:line-through;color:#888;">¥${originalPrice.toFixed(2)}</span>` : ''}
                                ${discountPrice > 0 ? `<span class="discount-price" style="color:#e53935;font-weight:700;font-size:16px;">¥${discountPrice.toFixed(2)}</span>` : ''}
                            </div>
                            <button class="add-to-cart-btn" style="margin-top:auto;padding:10px 12px;border:none;border-radius:8px;background:#4CAF50;color:#fff;font-weight:600;cursor:pointer;">加入购物车</button>
                        </div>
                    </div>
                `;
            }).join('');
            productsGrid.innerHTML = forceHTML;
            
            // 确保强制渲染的卡片也可见
            productsGrid.style.display = 'grid';
            productsGrid.style.visibility = 'visible';
            productsGrid.style.opacity = '1';
            productsGrid.querySelectorAll('.product-card').forEach(card => {
                card.style.display = 'flex';
                card.style.visibility = 'visible';
                card.style.opacity = '1';
            });
            
            cardCount = productsGrid.querySelectorAll('.product-card').length;
            console.warn('[DirectSourcing] 首次渲染无卡片，使用兜底强制渲染，数量:', cardCount);
        }
        
        console.log('[DirectSourcing] 商品HTML已设置，商品卡片数量:', cardCount);
        
        // 5.卡片悬停与点击放大特效：悬停阴影提升，点击进入详情
        productsGrid.querySelectorAll('.product-card').forEach((card, index) => {
            // 添加鼠标样式提示可点击
            card.style.cursor = 'pointer';
            
            card.addEventListener('click', (e) => {
                // 如果点击的是按钮，不触发卡片点击
                if (e.target.closest('.add-to-cart-btn')) {
                    return;
                }
                
                const product = finalProducts[index];
                if (product) {
                    this.showProductDetail(product);
                }
            });
            
            // 添加悬停效果
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px)';
                card.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.15)';
                card.style.transition = 'all 0.3s ease';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
                card.style.boxShadow = '';
            });
        });
        
        // 使用事件委托，避免重复绑定事件监听器
        // 6.加入购物车反馈特效：按钮缩放+全局购物车同步并提示
        // 先移除旧的事件监听器（如果存在）
        const oldHandler = productsGrid._cartClickHandler;
        if (oldHandler) {
            productsGrid.removeEventListener('click', oldHandler);
        }
        
        // 创建新的事件处理函数
        const cartClickHandler = (e) => {
            const btn = e.target.closest('.add-to-cart-btn');
            if (!btn) return;
            
            e.stopPropagation(); // 阻止事件冒泡，避免重复触发
            
            // 找到对应的商品卡片和索引
            const productCard = btn.closest('.product-card');
            if (!productCard) return;
            
            // 通过商品名称匹配，而不是索引（更可靠）
            const productNameEl = productCard.querySelector('h4');
            if (!productNameEl) return;
            
            const productName = productNameEl.textContent.trim();
            const product = finalProducts.find(p => p.name === productName) || finalProducts.find(p => p.name && p.name.includes(productName));
            
            if (!product) {
                console.warn('[DirectSourcing] 未找到对应商品:', productName);
                return;
            }
            
                    const productPrice = Number.parseFloat(product.discountPrice || product.originalPrice || 0);
                    
                    console.log('[DirectSourcing] 加入购物车:', productName);
                    
                    // 添加点击反馈动画
                    btn.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        btn.style.transform = 'scale(1)';
                    }, 100);
                    
            const payload = {
                            name: productName,
                price: Number.isFinite(productPrice) ? productPrice : 0,
                            image: product.image || 'src/shengxian.png'
            };
            
            const cart = globalThis.shoppingCart;
            if (cart && typeof cart.addItem === 'function') {
                cart.addItem(payload, btn);
                if (typeof cart.updateCartCount === 'function') {
                    cart.updateCartCount();
                }
            } else if (globalThis.addToCart) {
                globalThis.addToCart(payload);
                    } else {
                        alert(`已将 ${productName} 加入购物车`);
                    }
            
            // 成功后关闭详情弹窗（如果存在）
            const modal = document.querySelector('.product-detail-modal');
            if (modal) {
                modal.remove();
            }
            
            // 全局提示
            if (globalThis.showToast) {
                globalThis.showToast(`${productName} 已加入购物车`);
            } else {
                alert(`${productName} 已加入购物车`);
            }
        };
        
        // 保存引用，以便后续移除
        productsGrid._cartClickHandler = cartClickHandler;
        // 使用事件委托，在容器上绑定一次即可
        productsGrid.addEventListener('click', cartClickHandler);
    }
    
    // 显示商品详情弹窗
    showProductDetail(product) {
        // 移除旧的详情弹窗
        const oldModal = document.querySelector('.product-detail-modal');
        if (oldModal) {
            oldModal.remove();
        }
        
        const modal = document.createElement('div');
        modal.className = 'product-detail-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 10000;
            display: flex;
            justify-content: center;
            align-items: center;
            opacity: 0;
        `;
        
        const originalPrice = Number.parseFloat(product.originalPrice) || 0;
        const discountPrice = Number.parseFloat(product.discountPrice) || 0;
        const imageUrl = product.image || 'src/shengxian.png';
        const isBase64 = imageUrl.startsWith('data:image/');
        const finalImageUrl = isBase64 ? imageUrl : `${imageUrl}?t=${Date.now()}`;
        const discount = originalPrice > 0 ? Math.round((1 - discountPrice / originalPrice) * 100) : 0;
        
        modal.innerHTML = `
            <div class="modal-content" style="
                background: white;
                border-radius: 15px;
                padding: 30px;
                max-width: 600px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                position: relative;
                opacity: 0;
                transform: 'translateY(50px)';
            ">
                <button class="modal-close" style="
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    background: #f5f5f5;
                    border: none;
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 20px;
                    line-height: 1;
                    color: #666;
                ">×</button>
                <div style="display: flex; gap: 20px; margin-bottom: 20px;">
                    <div style="flex: 1;">
                        <img src="${finalImageUrl}" alt="${product.name}" 
                             onerror="this.onerror=null;this.src='src/shengxian.png'"
                             style="width: 100%; border-radius: 10px;">
                    </div>
                    <div style="flex: 1;">
                        <h2 style="margin: 0 0 10px 0; color: #333;">${product.name || '未命名商品'}</h2>
                        <p style="color: #666; margin: 0 0 20px 0;">${product.desc || '暂无描述'}</p>
                        <div style="margin-bottom: 20px;">
                            ${originalPrice > 0 ? `<span style="text-decoration: line-through; color: #999; margin-right: 10px;">¥${originalPrice.toFixed(2)}</span>` : ''}
                            ${discountPrice > 0 ? `<span style="font-size: 24px; color: #ff5722; font-weight: bold;">¥${discountPrice.toFixed(2)}</span>` : ''}
                            ${discount > 0 ? `<span style="background: #ff5722; color: white; padding: 2px 8px; border-radius: 4px; margin-left: 10px; font-size: 14px;">省${discount}%</span>` : ''}
                        </div>
                        <button class="modal-add-to-cart" style="
                            width: 100%;
                            padding: 12px;
                            background: linear-gradient(135deg, #4CAF50, #8BC34A);
                            color: white;
                            border: none;
                            border-radius: 8px;
                            font-size: 16px;
                            font-weight: bold;
                            cursor: pointer;
                            margin-top: 20px;
                        ">加入购物车</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 使用JavaScript实现模态框淡入和滑入动画
        requestAnimationFrame(() => {
            if (modal) {
                modal.style.transition = 'opacity 0.3s ease';
                modal.style.opacity = '1';
            }
            
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                modalContent.style.opacity = '1';
                modalContent.style.transform = 'translateY(0)';
            }
        });
        
        // 关闭按钮事件
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });
        
        // 点击背景关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        // 详情页加入购物车按钮
        modal.querySelector('.modal-add-to-cart').addEventListener('click', (e) => {
            e.stopPropagation();
            const productName = product.name || '未知商品';
            const productPrice = Number.parseFloat(product.discountPrice || product.originalPrice || 0);
            const productImage = product.image || 'src/shengxian.png';
            
            // 添加点击反馈
            const btn = e.target;
            btn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                btn.style.transform = 'scale(1)';
            }, 100);
            
            // 使用统一的购物车API
            const payload = {
                name: productName,
                price: Number.isFinite(productPrice) ? productPrice : 0,
                image: productImage
            };
            
            const cart = globalThis.shoppingCart;
            if (cart && typeof cart.addItem === 'function') {
                cart.addItem(payload, btn);
                if (typeof cart.updateCartCount === 'function') {
                    cart.updateCartCount();
                }
                // 关闭详情弹窗
                modal.remove();
                // 显示提示
                if (globalThis.showToast) {
                    globalThis.showToast(`${productName} 已加入购物车`);
                } else {
                    alert(`${productName} 已加入购物车`);
                }
            } else if (globalThis.addToCart) {
                globalThis.addToCart(payload);
                modal.remove();
            } else {
                alert(`已将 ${productName} 加入购物车`);
                modal.remove();
            }
        });
        
        // CSS动画已移除，由JavaScript实现
    }
    
    // 清理监听和弹窗，供模块切换时调用
    destroy() {
        if (this.handleDocumentClick) {
            document.removeEventListener('click', this.handleDocumentClick);
        }
        this.hideAllPopups();
        this.handleDocumentClick = null;
    }
}

// 拼单降价特效
class GroupBuyingEffect {
    constructor() {
        this.init();
    }
    
    init() {
        // 初始化拼单特效
        this.initializeGroupBuying();
    }
    
    initializeGroupBuying() {
        const container = document.getElementById('direct-sourcing');
        if (container) {
            const groupSection = document.createElement('div');
            groupSection.className = 'group-buying';
            groupSection.innerHTML = `
                <h4>🚚 拼单享更多优惠</h4>
                <p>满3人拼单，额外享受5%折扣</p>
                <div class="group-progress">
                    <span>当前人数:</span>
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: 33%"></div>
                    </div>
                    <span>1/3人</span>
                </div>
                <div class="group-discount">当前折扣: 20% | 拼单后: 25%</div>
                <button class="join-group-btn">立即参团</button>
            `;
            
            // 插入到地图之前
            const mapContainer = container.querySelector('.map-container');
            if (mapContainer) {
                container.insertBefore(groupSection, mapContainer);
            } else {
                container.appendChild(groupSection);
            }
            
            // 绑定参团按钮事件
            groupSection.querySelector('.join-group-btn').addEventListener('click', () => {
                this.joinGroupBuying(groupSection);
            });
        }
    }
    
    joinGroupBuying(section) {
        const button = section.querySelector('.join-group-btn');
        button.textContent = '已参团 ✓';
        button.style.background = '#2196F3';
        button.disabled = true;
        
        // 更新进度条
        const progressBar = section.querySelector('.progress-bar');
        progressBar.style.width = '66%';
        
        // 更新人数显示
        const peopleCount = section.querySelector('.group-progress span:last-child');
        peopleCount.textContent = '2/3人';
        
        // 显示成功消息
        const message = document.createElement('div');
        message.style.marginTop = '10px';
        message.style.fontWeight = 'bold';
        message.textContent = '参团成功！再邀请1人即可享受额外5%折扣';
        section.appendChild(message);
        
        // 2秒后自动消失
        setTimeout(() => {
            message.remove();
        }, 2000);
    }
}

// 季节性商品特效
class SeasonalProductsEffect {
    constructor() {
        this.seasons = {
            spring: ['春笋', '菠菜', '韭菜', '豌豆'],
            summer: ['西瓜', '黄瓜', '茄子', '豇豆'],
            autumn: ['苹果', '梨', '南瓜', '红薯'],
            winter: ['白菜', '萝卜', '冬瓜', '橙子']
        };
        this.init();
    }
    
    init() {
        // 初始化季节性商品标识
        this.markSeasonalProducts();
    }
    
    markSeasonalProducts() {
        const currentSeason = this.getCurrentSeason();
        const seasonalProducts = this.seasons[currentSeason];
        
        // 在商品名称中查找季节性商品
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach(card => {
            const productNameElement = card.querySelector('h4');
            if (!productNameElement) return; // 跳过没有h4元素的卡片
            const productName = productNameElement.textContent;
            
            if (seasonalProducts.some(product => productName.includes(product))) {
                // 添加季节徽章
                const badge = document.createElement('div');
                badge.className = 'seasonal-badge floating';
                badge.textContent = '当季';
                card.appendChild(badge);
                
                // 添加季节标识
                const seasonIndicator = document.createElement('span');
                seasonIndicator.className = `season-indicator ${currentSeason}`;
                seasonIndicator.textContent = this.getSeasonChinese(currentSeason);
                card.querySelector('h4').appendChild(seasonIndicator);
            }
        });
    }
    
    getCurrentSeason() {
        const month = new Date().getMonth() + 1; // 月份从0开始，所以+1
        
        if (month >= 3 && month <= 5) return 'spring';
        if (month >= 6 && month <= 8) return 'summer';
        if (month >= 9 && month <= 11) return 'autumn';
        return 'winter';
    }
    
    getSeasonChinese(season) {
        const seasons = {
            spring: '春季',
            summer: '夏季',
            autumn: '秋季',
            winter: '冬季'
        };
        return seasons[season];
    }
}

// 产地直采模块主类 - 供ModuleManager调用
class DirectSourcingModule {
    constructor() {
        this.container = null;
        this.mapInteraction = null;
        this.init();
    }
    
    init() {
        this.container = document.getElementById('direct-sourcing');
        if (!this.container) return;
        this.container.innerHTML = `
            <h2>产地直采</h2>
            <p>当季直采蔬果，价格比市场低20-30%</p>
        `;
        this.mapInteraction = new ChinaMapInteraction();
        new GroupBuyingEffect();
        new SeasonalProductsEffect();
    }
    
    // 模块销毁：移除事件和内容，供模块切换/退出时调用
    destroy() {
        if (this.mapInteraction && typeof this.mapInteraction.destroy === 'function') {
            this.mapInteraction.destroy();
        }
        if (this.container) {
            this.container.innerHTML = '';
        }
        this.container = null;
        this.mapInteraction = null;
    }
}

// 导出到全局作用域，供ModuleManager使用
window.DirectSourcingModule = DirectSourcingModule;

// 仅通过ModuleManager初始化，移除传统初始化方式
// 避免与ModuleManager的初始化逻辑冲突