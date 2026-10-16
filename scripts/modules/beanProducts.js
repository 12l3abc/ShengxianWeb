// 豆制品/杂粮模块

// 动态加载CSS文件
function loadCSS(href) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
    return link;
}

// 加载模块CSS文件
loadCSS('../../css/modules/beanProducts.css');



// 1.保质期倒计时特效：定时递减并标记临期卡片
class BeanShelfLifeCountdown {
    constructor() {
        this.products = [];
        this.init();
    }
    
    init() {
        // 初始化保质期显示
        this.initializeShelfLife();
        
        // 定期更新倒计时
        setInterval(() => this.updateShelfLife(), 60000);
    }
    
    initializeShelfLife() {
        const productCards = document.querySelectorAll('#bean-grid .bean-product-card, #bean-products .bean-product-card');
        
        productCards.forEach(card => {
            const daysLeftAttr = card.getAttribute('data-shelf-life');
            if (daysLeftAttr === null || daysLeftAttr === undefined) {
                return; // 跳过没有保质期数据的卡片
            }
            const daysLeft = Number.parseInt(daysLeftAttr, 10);
            if (Number.isNaN(daysLeft)) {
                return; // 跳过无效的保质期数据
            }
            this.createShelfLifeDisplay(card, daysLeft);
        });
    }
    
    createShelfLifeDisplay(card, daysLeft) {
        if (!card) {
            console.warn('[BeanShelfLifeCountdown] 卡片元素不存在');
            return;
        }
        
        const metaDiv = card.querySelector('.product-meta');
        if (!metaDiv) {
            console.warn('[BeanShelfLifeCountdown] 找不到.product-meta元素，跳过保质期显示');
            return;
        }
        
        // 检查是否已经存在保质期容器，避免重复添加
        if (metaDiv.querySelector('.shelf-life-container')) {
            return;
        }
        
        const shelfLifeContainer = document.createElement('div');
        shelfLifeContainer.className = 'shelf-life-container';
        
        shelfLifeContainer.innerHTML = `
            <span class="shelf-life-icon">⏱️</span>
            <span class="shelf-life-days ${this.getShelfLifeClass(daysLeft)}">
                剩余 ${daysLeft} 天
            </span>
        `;
        
        metaDiv.appendChild(shelfLifeContainer);
        
        // 如果临近过期，添加特殊样式
        if (daysLeft <= 1) {
            card.classList.add('expiring-soon');
        }
    }
    
    getShelfLifeClass(daysLeft) {
        if (daysLeft <= 1) return 'shelf-life-expiring';
        if (daysLeft <= 3) return 'shelf-life-warning';
        return 'shelf-life-fresh';
    }
    
    updateShelfLife() {
        const productCards = document.querySelectorAll('.bean-product-card');
        
        productCards.forEach(card => {
            let daysLeft = parseInt(card.getAttribute('data-shelf-life'));
            // 模拟时间流逝（实际应用中应该基于生产日期计算）
            daysLeft = Math.max(0, daysLeft - 1);
            card.setAttribute('data-shelf-life', daysLeft);
            
            const daysSpan = card.querySelector('.shelf-life-days');
            if (daysSpan) {
                daysSpan.textContent = `剩余 ${daysLeft} 天`;
                daysSpan.className = `shelf-life-days ${this.getShelfLifeClass(daysLeft)}`;
            }
            
            // 如果临近过期，添加特殊样式
            if (daysLeft <= 1) {
                card.classList.add('expiring-soon');
            }
        });
    }
}

// 2.当日生产标签特效：当日生产商品打上“当日新鲜”徽章
class FreshProductionTag {
    constructor() {
        this.init();
    }
    
    init() {
        // 初始化新鲜生产标签
        this.initializeFreshTags();
    }
    
    initializeFreshTags() {
        const productCards = document.querySelectorAll('.bean-product-card');
        productCards.forEach(card => {
            const productionDate = card.getAttribute('data-production-date');
            const today = new Date().toISOString().split('T')[0];
            
            if (productionDate === today) {
                // 添加新鲜标签
                const imageContainer = card.querySelector('.product-image');
                const freshBadge = document.createElement('div');
                freshBadge.className = 'fresh-badge';
                freshBadge.textContent = '当日新鲜';
                imageContainer.appendChild(freshBadge);
                
                // 高亮生产日期
                const dateElement = card.querySelector('.production-date');
                if (dateElement) {
                    dateElement.classList.add('fresh');
                }
                
                // 添加高亮效果
                card.classList.add('fresh-highlight');
            }
        });
    }
}

// 3.散装杂粮称重特效：弹出称重模态，滑块/步进调整重量
class BulkGrainWeighing {
    constructor() {
        this.weighingModal = null;
        this.init();
    }
    
    init() {
        // 创建称重模态框
        this.createWeighingModal();
        

        
        // 绑定事件
        this.bindEvents();
    }
    
    bindEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('weigh-btn')) {
                const productId = e.target.closest('.grain-product-card').getAttribute('data-id');
                const productName = e.target.closest('.grain-product-card').querySelector('h3').textContent;
                this.showWeighingModal(productId, productName);
            }
            
            if (e.target.classList.contains('modal-close-weigh') || 
                e.target.classList.contains('weighing-modal')) {
                this.hideWeighingModal();
            }
            
            if (e.target.classList.contains('confirm-weight')) {
                this.confirmWeight();
            }
        });
        
        // 滑块事件
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('weight-slider')) {
                const value = e.target.value;
                
                // 更新输入框
                const weightInput = this.weighingModal.querySelector('.weight-input');
                weightInput.value = value;
                
                // 更新显示
                const valueDisplay = this.weighingModal.querySelector('.weight-value');
                valueDisplay.textContent = `${value}g`;
                
                this.updateEstimatedPrice(value);
            }
        });
        
        // 步进器按钮事件
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('stepper-btn')) {
                const input = e.target.closest('.stepper-input').querySelector('.weight-input');
                let value = parseInt(input.value);
                
                if (e.target.classList.contains('plus')) {
                    value += 50;
                } else if (e.target.classList.contains('minus')) {
                    value -= 50;
                }
                
                // 确保在范围内
                value = Math.max(100, Math.min(2000, value));
                
                input.value = value;
                
                // 更新滑块和显示
                const slider = this.weighingModal.querySelector('.weight-slider');
                slider.value = value;
                
                const valueDisplay = this.weighingModal.querySelector('.weight-value');
                valueDisplay.textContent = `${value}g`;
                
                this.updateEstimatedPrice(value);
            }
        });
        
        // 输入框事件
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('weight-input')) {
                let value = parseInt(e.target.value);
                
                // 确保在范围内
                value = Math.max(100, Math.min(2000, value));
                
                // 调整到最接近的50的倍数
                value = Math.round(value / 50) * 50;
                
                e.target.value = value;
                
                // 更新滑块和显示
                const slider = this.weighingModal.querySelector('.weight-slider');
                slider.value = value;
                
                const valueDisplay = this.weighingModal.querySelector('.weight-value');
                valueDisplay.textContent = `${value}g`;
                
                this.updateEstimatedPrice(value);
            }
        });
    }
    
    createWeighingModal() {
        this.weighingModal = document.createElement('div');
        this.weighingModal.className = 'weighing-modal';
        
        this.weighingModal.innerHTML = `
            <div class="weighing-content">
                <span class="modal-close-weigh">&times;</span>
                <h3>散装杂粮称重</h3>
                <div class="product-info">
                    <h4 id="weighing-product-name">商品名称</h4>
                </div>
                <div class="weighing-form">
                    <div class="form-group">
                        <label>选择重量 (克):</label>
                        <input type="range" min="100" max="2000" step="50" value="500" class="weight-slider">
                        <span class="weight-value">500g</span>
                    </div>
                    <div class="form-group">
                        <label>起称重量: 100g</label>
                        <div class="stepper-input">
                            <button class="stepper-btn minus">-</button>
                            <input type="number" class="weight-input" value="500" min="100" step="50">
                            <button class="stepper-btn plus">+</button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>预计价格:</label>
                        <span class="estimated-price">¥12.50</span>
                    </div>
                    <button class="confirm-weight">确认加入购物车</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.weighingModal);
    }
    
    showWeighingModal(productId, productName) {
        // 设置商品名称
        const nameElement = this.weighingModal.querySelector('#weighing-product-name');
        nameElement.textContent = productName;
        
        // 更新初始价格
        this.updateEstimatedPrice(500);
        
        // 显示模态框
        this.weighingModal.style.display = 'flex';
    }
    
    hideWeighingModal() {
        this.weighingModal.style.display = 'none';
    }
    
    updateEstimatedPrice(weight) {
        // 根据重量计算价格（示例：假设基础价格为12.50/500g）
        const basePrice = 12.50; // 500g的价格
        const estimatedPrice = (weight / 500) * basePrice;
        
        const priceElement = this.weighingModal.querySelector('.estimated-price');
        priceElement.textContent = `¥${estimatedPrice.toFixed(2)}`;
    }
    
    confirmWeight() {
        // 获取重量
        const weight = this.weighingModal.querySelector('.weight-input').value;
        const productName = this.weighingModal.querySelector('#weighing-product-name').textContent;
        
        // 显示确认消息
        alert(`已添加 ${productName} ${weight}g 到购物车`);
        
        // 关闭模态框
        this.hideWeighingModal();
    }
}

// 视觉增强：谷粒纹理背景、卡片侧光、分段进度条
// 作用：用纹理与光效强调谷物质感，同时用进度条提示保质期
class BeanVisualEffects {
    constructor() {
        this.init();
    }

    init() {
        this.addGrainTexture();
        this.addSideLight();
        this.addShelfProgress();
    }

    // 背景添加斜向谷粒纹理
    addGrainTexture() {
        const container = document.getElementById('bean-products');
        if (!container || container.querySelector('.grain-texture')) return;
        const layer = document.createElement('div');
        layer.className = 'grain-texture';
        Object.assign(layer.style, {
            position: 'absolute',
            inset: 0,
            background: 'repeating-linear-gradient(135deg, rgba(139,69,19,0.08) 0, rgba(139,69,19,0.08) 10px, rgba(255,255,255,0) 10px, rgba(255,255,255,0) 22px)',
            pointerEvents: 'none',
            zIndex: 0,
            backgroundPosition: '0 0'
        });
        container.style.position = 'relative';
        container.prepend(layer);
        
        // 使用JavaScript实现谷物移动动画（背景位置循环移动）
        let startTime = null;
        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = ((timestamp - startTime) % 14000) / 14000;
            const x = progress * 140; // 移动140px距离后循环
            layer.style.backgroundPosition = `${x}px 0`;
            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }

    // 卡片侧光，跟随鼠标（至少15行）
    addSideLight() {
        const cards = document.querySelectorAll('.bean-product-card');
        cards.forEach((card) => {
            card.classList.add('bean-tilt');
            card.style.transition = 'background-image 0.3s ease, transform 0.2s ease';
            
            // 创建侧光元素
            let sideLight = card.querySelector('.side-light');
            if (!sideLight) {
                sideLight = document.createElement('div');
                sideLight.className = 'side-light';
                sideLight.style.position = 'absolute';
                sideLight.style.pointerEvents = 'none';
                sideLight.style.width = '150px';
                sideLight.style.height = '100%';
                sideLight.style.background = 'linear-gradient(90deg, rgba(255,255,255,0.3), transparent)';
                sideLight.style.opacity = '0';
                sideLight.style.transition = 'opacity 0.3s ease, left 0.1s ease';
                sideLight.style.filter = 'blur(15px)';
                card.style.position = 'relative';
                card.appendChild(sideLight);
            }
            
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                card.style.backgroundImage = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.16), transparent 55%)`;
                
                // 更新侧光位置
                sideLight.style.left = `${x - 75}px`;
                sideLight.style.opacity = '1';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.backgroundImage = '';
                sideLight.style.opacity = '0';
            });
        });
    }

    // 根据保质期天数缩放进度条
    addShelfProgress() {
        document.querySelectorAll('.bean-product-card').forEach((card) => {
            if (card.querySelector('.shelf-progress')) return;
            const days = Number(card.getAttribute('data-shelf-life') || 7);
            const bar = document.createElement('div');
            bar.className = 'shelf-progress';
            const fill = document.createElement('div');
            fill.className = 'shelf-progress-fill';
            const ratio = Math.max(0.1, Math.min(1, days / 10));
            fill.style.transform = `scaleX(${ratio})`;
            bar.appendChild(fill);
            const meta = card.querySelector('.product-meta');
            if (meta) {
                meta.appendChild(bar);
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new BeanVisualEffects();
});

// 豆制品分类标签特效增强
class BeanProductCategoryTabs {
    constructor() {
        console.log('[BeanProductCategoryTabs] 构造函数调用');
        this.categories = ['全部', '豆腐类', '豆干类', '豆浆类', '杂粮类', '豆类'];
        this.currentCategory = '全部';
        this.sortOrder = 'arrival'; // arrival: 到库时间, price: 价格, popularity: 热门度
        this.init();
    }
    
    init() {
        // 初始化分类标签
        this.createCategoryInterface();
        
        // 绑定事件
        this.bindEvents();
        
        // 加载默认分类数据
        this.loadCategoryData(this.currentCategory);
        
        // 添加定时刷新机制，每30秒刷新一次数据
        this.setupAutoRefresh();
    }
    
    createCategoryInterface() {
        const container = document.getElementById('bean-products');
        container.innerHTML = `
            <div class="module-header">
                <h2>豆制品/杂粮</h2>
                <p>精选优质豆制品和杂粮，营养健康</p>
            </div>
            <div class="category-tabs">
                ${this.categories.map(category => `
                    <button class="tab-button ${category === this.currentCategory ? 'active' : ''}" 
                            data-category="${category}">
                        ${category}
                    </button>
                `).join('')}
            </div>
            <div class="sort-options">
                <span>排序:</span>
                <button class="sort-button ${this.sortOrder === 'arrival' ? 'active' : ''}" data-sort="arrival">到库时间</button>
                <button class="sort-button ${this.sortOrder === 'price' ? 'active' : ''}" data-sort="price">价格</button>
                <button class="sort-button ${this.sortOrder === 'popularity' ? 'active' : ''}" data-sort="popularity">热门度</button>
            </div>
            <div class="product-grid" id="bean-grid">
                <!-- 商品将在此处加载 -->
            </div>
        `;
    }
    
    bindEvents() {
        // 分类标签点击事件
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-button')) {
                const category = e.target.getAttribute('data-category');
                this.switchCategory(category);
            }
            
            if (e.target.classList.contains('sort-button')) {
                const sort = e.target.getAttribute('data-sort');
                this.changeSortOrder(sort);
            }
        });
    }
    
    switchCategory(category) {
        this.currentCategory = category;
        
        // 更新激活状态
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-category') === category);
        });
        
        // 加载新分类数据
        this.loadCategoryData(category);
    }
    
    async loadCategoryData(category) {
        console.log('[BeanProducts] 开始加载分类数据', category);
        const grid = document.getElementById('bean-grid');
        if (!grid) {
            console.error('[BeanProducts] 找不到bean-grid容器');
            return;
        }
        grid.innerHTML = '<div class="loading">加载中...</div>';
        
        try {
            // 获取API客户端
            const apiClient = globalThis.apiClient;
            if (!apiClient) {
                console.error('[BeanProducts] API客户端未就绪');
                grid.innerHTML = '<div class="error-message">加载商品数据失败: API客户端未初始化</div>';
                return;
            }
            
            if (!apiClient.getProductsByCategory) {
                console.error('[BeanProducts] API客户端缺少getProductsByCategory方法');
                grid.innerHTML = '<div class="error-message">加载商品数据失败: API方法不存在</div>';
                return;
            }
            
            // 从API获取豆制品商品数据
            console.log('[BeanProducts] 调用API获取数据');
            const response = await apiClient.getProductsByCategory('beanProducts');
            console.log('[BeanProducts] API响应', response);
            
            if (response && response.success && Array.isArray(response.products)) {
                console.log('[BeanProducts] 成功获取数据，商品数量:', response.products.length);
                
                if (response.products.length === 0) {
                    grid.innerHTML = '<div class="error-message">暂无商品数据</div>';
                    return;
                }
                
                // 为每个商品添加必要属性，简化处理
                let products = response.products.map((product) => {
                    // 为每个商品生成生产期
                    const productionDate = new Date();
                    productionDate.setDate(productionDate.getDate() - Math.floor(Math.random() * 3));
                    
                    return {
                        ...product,
                        productionDate: productionDate.toISOString().split('T')[0],
                        shelfLife: product.shelfLife || Math.floor(Math.random() * 7) + 1, // 1-7天保质期
                        rating: (Math.random() * 2 + 3).toFixed(1) // 3-5星评分
                    };
                });

                // 按当前分类过滤（"全部"不过滤）
                if (category !== '全部') {
                    const map = {
                        '豆腐类': ['tofu', '51'],
                        '豆干类': ['beanCurd', 'beanCurdSkin', '52'],
                        '豆浆类': ['soyMilk', '53'],
                        '杂粮类': ['grains', '54'],
                        '豆类': ['beans', '55'],
                    };
                    const targets = map[category] || [];
                    products = products.filter((p) => {
                        const sub =
                            p.subcategory ||
                            p.subcategoryName ||
                            p.subcategory_name ||
                            p.subcategory_id ||
                            p.subcategoryId ||
                            '';
                        return targets.includes(String(sub));
                    });
                }
                
                if (products.length === 0) {
                    grid.innerHTML = '<div class="error-message">该分类下暂无商品</div>';
                    return;
                }
                
                this.renderProducts(products);
                console.log('[BeanProducts] 成功渲染商品，数量:', products.length);
            } else {
                console.error('[BeanProducts] API返回失败或无商品数据', response);
                grid.innerHTML = '<div class="error-message">加载商品数据失败</div>';
            }
        } catch (error) {
            console.error('[BeanProducts] 获取商品数据异常:', error);
            grid.innerHTML = `<div class="error-message">加载商品数据失败: ${error.message || '未知错误'}</div>`;
        }
    }
    
    renderProducts(products) {
        const grid = document.getElementById('bean-grid');
        grid.innerHTML = products.map(product => {
            // 处理图片路径
            let imageSrc = product.image || 'src/shengxian.png';
            
            // 检查是否为Base64图片
            const isBase64 = imageSrc.startsWith('data:image/');
            
            // 如果是普通图片URL，确保路径正确
            if (!isBase64) {
                if (!imageSrc.startsWith('src/') && !imageSrc.startsWith('http://') && !imageSrc.startsWith('https://')) {
                    // 如果是相对路径且不是以src/开头，添加src/前缀
                    imageSrc = 'src/' + imageSrc;
                }
                // 非Base64图片添加缓存清除参数
                imageSrc += `?t=${Date.now()}`;
            }
            
            return `
            <div class="product-card bean-product-card" data-id="bean-${product.id}" data-shelf-life="${product.shelfLife}">
                <div class="product-image">
                    <img src="${imageSrc}" alt="${product.name}" onerror="this.onerror=null;this.src='src/shengxian.png'" loading="lazy">
                    <div class="production-date-tag">生产日期: ${product.productionDate}</div>
                </div>
                <div class="product-info">
                    <h4>${product.name}</h4>
                    <p class="product-description">${product.description || '精选优质产品，保证品质'}</p>
                    <div class="product-meta">
                        <span class="price">¥${product.price.toFixed(2)}</span>
                        <span class="rating">⭐${product.rating}</span>
                    </div>
                    <div class="product-badges">
                        <span class="product-badge fresh-badge">新鲜</span>
                    </div>
                    <button class="add-to-cart-btn">加入购物车</button>
                </div>
            </div>
        `;
        }).join('');
        
        // 添加卡片动画效果
        this.addCardAnimations();
        
        // 初始化保质期倒计时
        new BeanShelfLifeCountdown();
    }
    
    changeSortOrder(sort) {
        this.sortOrder = sort;
        
        // 更新激活状态
        document.querySelectorAll('.sort-button').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-sort') === sort);
        });
        
        // 重新排序当前数据
        this.sortCurrentData();
    }
    
    sortCurrentData() {
        const grid = document.getElementById('bean-grid');
        const cards = Array.from(grid.querySelectorAll('.bean-product-card'));
        
        // 根据排序方式重新排列
        cards.sort((a, b) => {
            switch (this.sortOrder) {
                case 'price':
                    const priceA = parseFloat(a.querySelector('.price').textContent.replace('¥', ''));
                    const priceB = parseFloat(b.querySelector('.price').textContent.replace('¥', ''));
                    return priceA - priceB;
                case 'popularity':
                    const ratingA = parseFloat(a.querySelector('.rating').textContent.replace('⭐', ''));
                    const ratingB = parseFloat(b.querySelector('.rating').textContent.replace('⭐', ''));
                    return ratingB - ratingA; // 评分高的在前
                default: // arrival
                    return 0; // 默认按到库时间排序，这里简化处理
            }
        });
        
        // 重新插入元素实现排序
        cards.forEach(card => grid.appendChild(card));
    }
    
    // 设置自动刷新机制
    setupAutoRefresh() {
        // 每30秒刷新一次数据
        this.refreshInterval = setInterval(() => {
            console.log('[BeanProducts] 执行自动刷新数据...');
            this.refreshData();
        }, 30000);
        
        // 监听页面可见性变化，当页面重新可见时刷新数据
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                console.log('[BeanProducts] 页面重新可见，刷新数据...');
                this.refreshData();
            }
        });
        
        // 添加手动刷新按钮到界面
        this.addRefreshButton();
    }
    
    // 添加手动刷新按钮
    addRefreshButton() {
        const container = document.getElementById('bean-products');
        const header = container.querySelector('.module-header');
        
        // 检查刷新按钮是否已存在
        if (!header.querySelector('.refresh-btn')) {
            const refreshBtn = document.createElement('button');
            refreshBtn.className = 'refresh-btn';
            refreshBtn.innerHTML = '🔄 刷新';
            refreshBtn.style.cssText = `
                background: none;
                border: 1px solid #3498db;
                color: #3498db;
                padding: 5px 10px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                margin-left: 10px;
                transition: all 0.3s ease;
            `;
            refreshBtn.onmouseenter = () => {
                refreshBtn.style.background = '#3498db';
                refreshBtn.style.color = 'white';
            };
            refreshBtn.onmouseleave = () => {
                refreshBtn.style.background = 'none';
                refreshBtn.style.color = '#3498db';
            };
            refreshBtn.onclick = () => {
                console.log('[BeanProducts] 手动刷新数据...');
                this.refreshData(true); // 传入true表示显示加载状态
            };
            
            header.appendChild(refreshBtn);
        }
    }
    
    // 刷新当前分类数据
    async refreshData(showLoading = false) {
        console.log('[BeanProductCategoryTabs] refreshData方法调用');
        // 直接重新加载当前分类数据
        await this.loadCategoryData(this.currentCategory);
    }
    
    addCardAnimations() {
        const cards = document.querySelectorAll('.bean-product-card');
        
        // 添加入场动画
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.3s ease-out';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
            
            // 添加悬停效果
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px) scale(1.02)';
                card.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
                card.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
            });
        });
    }
}

// 豆制品/杂粮模块主类 - 供ModuleManager调用
class BeanProductsModule {
    constructor() {
        this.init();
    }
    
    init() {
        // 初始化分类标签
        this.categoryTabs = new BeanProductCategoryTabs();
        
        // 为按钮添加特效
        this.addButtonEffects();
        
        // 延迟调用特效，确保DOM已加载
        setTimeout(() => {
            this.addGrainParticleEffect();
            this.addNutritionLabelRotation();
            this.addShelfLifeProgressBar();
        }, 500);
    }
    
    // 谷物粒子特效：点击卡片时产生谷物粒子飞散效果（至少15行）
    addGrainParticleEffect() {
        const cards = document.querySelectorAll('.bean-product-card');
        cards.forEach((card) => {
            card.addEventListener('click', (e) => {
                const rect = card.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                
                // 创建12个谷物粒子
                const grains = ['🌾', '🌽', '🌾', '🌽'];
                for (let i = 0; i < 12; i++) {
                    const particle = document.createElement('div');
                    particle.textContent = grains[i % grains.length];
                    particle.style.position = 'fixed';
                    particle.style.fontSize = '20px';
                    particle.style.left = centerX + 'px';
                    particle.style.top = centerY + 'px';
                    particle.style.zIndex = '10000';
                    particle.style.pointerEvents = 'none';
                    document.body.appendChild(particle);
                    
                    // 计算随机方向
                    const angle = (Math.PI * 2 * i) / 12 + (Math.random() - 0.5) * 0.3;
                    const velocity = 100 + Math.random() * 80;
                    const vx = Math.cos(angle) * velocity;
                    const vy = Math.sin(angle) * velocity;
                    
                    // 粒子飞散动画
                    let startTime = null;
                    const duration = 1200 + Math.random() * 600;
                    const animate = (timestamp) => {
                        if (!startTime) startTime = timestamp;
                        const elapsed = timestamp - startTime;
                        const progress = elapsed / duration;
                        
                        if (progress < 1) {
                            const x = centerX + vx * progress;
                            const y = centerY + vy * progress + 0.5 * 9.8 * progress * progress * 100;
                            const rotation = progress * 720;
                            const opacity = 1 - progress;
                            const scale = 1 - progress * 0.6;
                            
                            particle.style.left = x + 'px';
                            particle.style.top = y + 'px';
                            particle.style.transform = `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`;
                            particle.style.opacity = opacity;
                            
                            requestAnimationFrame(animate);
                        } else {
                            particle.remove();
                        }
                    };
                    requestAnimationFrame(animate);
                }
            });
        });
    }
    
    // 营养标签旋转特效：营养标签持续旋转显示（至少15行）
    addNutritionLabelRotation() {
        const cards = document.querySelectorAll('.bean-product-card');
        cards.forEach((card) => {
            // 创建营养标签
            const nutritionLabel = document.createElement('div');
            nutritionLabel.className = 'nutrition-label';
            nutritionLabel.textContent = '高蛋白';
            nutritionLabel.style.position = 'absolute';
            nutritionLabel.style.top = '10px';
            nutritionLabel.style.right = '10px';
            nutritionLabel.style.background = 'rgba(156,39,176,0.9)';
            nutritionLabel.style.color = '#fff';
            nutritionLabel.style.padding = '6px 12px';
            nutritionLabel.style.borderRadius = '20px';
            nutritionLabel.style.fontSize = '11px';
            nutritionLabel.style.fontWeight = 'bold';
            nutritionLabel.style.zIndex = '10';
            nutritionLabel.style.transformOrigin = 'center center';
            
            const cardContent = card.querySelector('.card-content, .product-info');
            if (cardContent) {
                cardContent.style.position = 'relative';
                cardContent.appendChild(nutritionLabel);
            }
            
            // 旋转动画
            let startTime = null;
            const animate = (timestamp) => {
                if (!startTime) startTime = timestamp;
                const elapsed = timestamp - startTime;
                const progress = (elapsed % 4000) / 4000;
                
                // 3D旋转效果
                const rotationY = progress * 360;
                const scale = 1 + Math.sin(progress * Math.PI * 2) * 0.1;
                const opacity = 0.8 + Math.sin(progress * Math.PI * 2) * 0.2;
                
                nutritionLabel.style.transform = `rotateY(${rotationY}deg) scale(${scale})`;
                nutritionLabel.style.opacity = opacity;
                
                requestAnimationFrame(animate);
            };
            requestAnimationFrame(animate);
        });
    }
    
    // 保质期进度条特效：保质期进度条动态填充（至少15行）
    addShelfLifeProgressBar() {
        const cards = document.querySelectorAll('.bean-product-card');
        cards.forEach((card) => {
            // 创建保质期进度条
            const progressContainer = document.createElement('div');
            progressContainer.className = 'shelf-life-progress';
            progressContainer.style.position = 'absolute';
            progressContainer.style.bottom = '10px';
            progressContainer.style.left = '10px';
            progressContainer.style.right = '10px';
            progressContainer.style.height = '4px';
            progressContainer.style.background = 'rgba(0,0,0,0.1)';
            progressContainer.style.borderRadius = '2px';
            progressContainer.style.overflow = 'hidden';
            progressContainer.style.zIndex = '10';
            
            const progressBar = document.createElement('div');
            progressBar.className = 'shelf-life-fill';
            progressBar.style.height = '100%';
            progressBar.style.width = '0%';
            progressBar.style.background = 'linear-gradient(90deg, #4caf50, #8bc34a)';
            progressBar.style.borderRadius = '2px';
            progressContainer.appendChild(progressBar);
            
            const cardContent = card.querySelector('.card-content, .product-info');
            if (cardContent) {
                cardContent.style.position = 'relative';
                cardContent.appendChild(progressContainer);
            }
            
            // 进度条填充动画
            let startTime = null;
            const targetWidth = 75; // 75%剩余
            const animate = (timestamp) => {
                if (!startTime) startTime = timestamp;
                const elapsed = timestamp - startTime;
                const progress = Math.min(elapsed / 2000, 1);
                
                // 缓动填充
                const easeProgress = 1 - Math.pow(1 - progress, 3);
                const currentWidth = easeProgress * targetWidth;
                
                progressBar.style.width = currentWidth + '%';
                
                // 添加流动效果
                const flowProgress = (elapsed % 2000) / 2000;
                const flowX = flowProgress * 200;
                progressBar.style.backgroundPosition = `${flowX}% 0`;
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };
            requestAnimationFrame(animate);
        });
    }
    
    // 刷新数据方法，供ModuleManager调用
    async refreshData() {
        console.log('刷新豆制品商品数据...');
        if (this.categoryTabs && this.categoryTabs.loadCategoryData) {
            await this.categoryTabs.loadCategoryData(this.categoryTabs.currentCategory);
            console.log('豆制品商品数据刷新完成');
        }
    }
    
    // 为按钮添加特效
    addButtonEffects() {
        // 为所有按钮添加点击波纹效果
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-button') || 
                e.target.classList.contains('sort-button') || 
                e.target.classList.contains('add-to-cart-btn')) {
                const button = e.target;
                
                // 创建波纹元素
                const ripple = document.createElement('span');
                ripple.className = 'ripple';
                
                // 设置波纹大小和位置
                const rect = button.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                
                // 添加波纹到按钮
                button.appendChild(ripple);
                
                // 动画结束后移除波纹
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            }
        });
    }
    
    // 谷物粒子特效：点击卡片时产生谷物粒子飞散效果（至少15行）
    addGrainParticleEffect() {
        // 延迟执行，确保DOM已加载
        setTimeout(() => {
            const cards = document.querySelectorAll('.bean-product-card');
            cards.forEach((card) => {
                card.addEventListener('click', (e) => {
                    const rect = card.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;
                    
                    // 创建12个谷物粒子
                    const grains = ['🌾', '🌽', '🌾', '🌽'];
                    for (let i = 0; i < 12; i++) {
                        const particle = document.createElement('div');
                        particle.textContent = grains[i % grains.length];
                        particle.style.position = 'fixed';
                        particle.style.fontSize = '20px';
                        particle.style.left = centerX + 'px';
                        particle.style.top = centerY + 'px';
                        particle.style.zIndex = '10000';
                        particle.style.pointerEvents = 'none';
                        document.body.appendChild(particle);
                        
                        // 计算随机方向
                        const angle = (Math.PI * 2 * i) / 12 + (Math.random() - 0.5) * 0.3;
                        const velocity = 100 + Math.random() * 80;
                        const vx = Math.cos(angle) * velocity;
                        const vy = Math.sin(angle) * velocity;
                        
                        // 粒子飞散动画
                        let startTime = null;
                        const duration = 1200 + Math.random() * 600;
                        const animate = (timestamp) => {
                            if (!startTime) startTime = timestamp;
                            const elapsed = timestamp - startTime;
                            const progress = elapsed / duration;
                            
                            if (progress < 1) {
                                const x = centerX + vx * progress;
                                const y = centerY + vy * progress + 0.5 * 9.8 * progress * progress * 100;
                                const rotation = progress * 720;
                                const opacity = 1 - progress;
                                const scale = 1 - progress * 0.6;
                                
                                particle.style.left = x + 'px';
                                particle.style.top = y + 'px';
                                particle.style.transform = `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`;
                                particle.style.opacity = opacity;
                                
                                requestAnimationFrame(animate);
                            } else {
                                particle.remove();
                            }
                        };
                        requestAnimationFrame(animate);
                    }
                });
            });
        }, 500);
    }
    
    // 营养标签旋转特效：营养标签持续旋转显示（至少15行）
    addNutritionLabelRotation() {
        // 延迟执行，确保DOM已加载
        setTimeout(() => {
            const cards = document.querySelectorAll('.bean-product-card');
            cards.forEach((card) => {
                // 创建营养标签
                const nutritionLabel = document.createElement('div');
                nutritionLabel.className = 'nutrition-label';
                nutritionLabel.textContent = '高蛋白';
                nutritionLabel.style.position = 'absolute';
                nutritionLabel.style.top = '10px';
                nutritionLabel.style.right = '10px';
                nutritionLabel.style.background = 'rgba(156,39,176,0.9)';
                nutritionLabel.style.color = '#fff';
                nutritionLabel.style.padding = '6px 12px';
                nutritionLabel.style.borderRadius = '20px';
                nutritionLabel.style.fontSize = '11px';
                nutritionLabel.style.fontWeight = 'bold';
                nutritionLabel.style.zIndex = '10';
                nutritionLabel.style.transformOrigin = 'center center';
                
                const cardContent = card.querySelector('.card-content, .product-info');
                if (cardContent) {
                    cardContent.style.position = 'relative';
                    cardContent.appendChild(nutritionLabel);
                }
                
                // 旋转动画
                let startTime = null;
                const animate = (timestamp) => {
                    if (!startTime) startTime = timestamp;
                    const elapsed = timestamp - startTime;
                    const progress = (elapsed % 4000) / 4000;
                    
                    // 3D旋转效果
                    const rotationY = progress * 360;
                    const scale = 1 + Math.sin(progress * Math.PI * 2) * 0.1;
                    const opacity = 0.8 + Math.sin(progress * Math.PI * 2) * 0.2;
                    
                    nutritionLabel.style.transform = `rotateY(${rotationY}deg) scale(${scale})`;
                    nutritionLabel.style.opacity = opacity;
                    
                    requestAnimationFrame(animate);
                };
                requestAnimationFrame(animate);
            });
        }, 500);
    }
    
    // 保质期进度条特效：保质期进度条动态填充（至少15行）
    addShelfLifeProgressBar() {
        // 延迟执行，确保DOM已加载
        setTimeout(() => {
            const cards = document.querySelectorAll('.bean-product-card');
            cards.forEach((card) => {
                // 创建保质期进度条
                const progressContainer = document.createElement('div');
                progressContainer.className = 'shelf-life-progress';
                progressContainer.style.position = 'absolute';
                progressContainer.style.bottom = '10px';
                progressContainer.style.left = '10px';
                progressContainer.style.right = '10px';
                progressContainer.style.height = '4px';
                progressContainer.style.background = 'rgba(0,0,0,0.1)';
                progressContainer.style.borderRadius = '2px';
                progressContainer.style.overflow = 'hidden';
                progressContainer.style.zIndex = '10';
                
                const progressBar = document.createElement('div');
                progressBar.className = 'shelf-life-fill';
                progressBar.style.height = '100%';
                progressBar.style.width = '0%';
                progressBar.style.background = 'linear-gradient(90deg, #4caf50, #8bc34a)';
                progressBar.style.borderRadius = '2px';
                progressContainer.appendChild(progressBar);
                
                const cardContent = card.querySelector('.card-content, .product-info');
                if (cardContent) {
                    cardContent.style.position = 'relative';
                    cardContent.appendChild(progressContainer);
                }
                
                // 进度条填充动画
                let startTime = null;
                const targetWidth = 75; // 75%剩余
                const animate = (timestamp) => {
                    if (!startTime) startTime = timestamp;
                    const elapsed = timestamp - startTime;
                    const progress = Math.min(elapsed / 2000, 1);
                    
                    // 缓动填充
                    const easeProgress = 1 - Math.pow(1 - progress, 3);
                    const currentWidth = easeProgress * targetWidth;
                    
                    progressBar.style.width = currentWidth + '%';
                    
                    // 添加流动效果
                    const flowProgress = (elapsed % 2000) / 2000;
                    const flowX = flowProgress * 200;
                    progressBar.style.backgroundPosition = `${flowX}% 0`;
                    
                    if (progress < 1) {
                        requestAnimationFrame(animate);
                    }
                };
                requestAnimationFrame(animate);
            });
        }, 500);
    }
}

// 导出到全局作用域，供ModuleManager使用
window.BeanProductsModule = BeanProductsModule;

// 仅通过ModuleManager初始化，移除传统初始化方式
// 避免与ModuleManager的初始化逻辑冲突
