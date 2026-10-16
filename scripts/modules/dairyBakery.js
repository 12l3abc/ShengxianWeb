// 乳品面点模块

// 动态加载CSS文件
function loadCSS(href) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
    return link;
}

// 加载模块CSS文件
loadCSS('../../css/modules/dairyBakery.css');

// 1.保质期倒计时特效：定时递减天数并高亮临期卡片
class ShelfLifeCountdown {
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
        const dairyCards = document.querySelectorAll('#dairy-grid .product-card, #dairy-bakery .product-card');
        
        dairyCards.forEach(card => {
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
            console.warn('[ShelfLifeCountdown] 卡片元素不存在');
            return;
        }
        
        const metaDiv = card.querySelector('.product-meta');
        if (!metaDiv) {
            console.warn('[ShelfLifeCountdown] 找不到.product-meta元素，跳过保质期显示');
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
        const dairyCards = document.querySelectorAll('.product-card');
        
        dairyCards.forEach(card => {
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

// 2.促销横幅动画特效：顶部促销横幅+倒计时动态刷新
class PromotionBannerAnimation {
    constructor() {
        this.init();
    }
    
    init() {
        // 创建促销横幅
        this.createPromotionBanner();
    }
    
    createPromotionBanner() {
        const container = document.getElementById('dairy-bakery');
        if (container) {
            // 检查是否已经存在特惠活动条，避免重复创建
            if (container.querySelector('.promotion-banner')) {
                console.log('[DairyBakery] 特惠活动条已存在，跳过创建');
                return;
            }
            
            const banner = document.createElement('div');
            banner.className = 'promotion-banner';
            banner.innerHTML = `
                <div class="banner-title">🎉 乳品面点专区优惠活动</div>
                <div class="banner-subtitle">
                    临期商品第二件半价 
                    <span class="banner-timer" id="promo-timer">02:00:00</span>
                </div>
            `;
            
            // 将横幅插入到顶部
            container.insertBefore(banner, container.firstChild);
            
            // 启动倒计时
            this.startPromotionTimer();
        }
    }
    
    startPromotionTimer() {
        const timerElement = document.getElementById('promo-timer');
        if (timerElement) {
            // 设置2小时倒计时
            let seconds = 2 * 60 * 60;
            
            const updateTimer = () => {
                const hours = Math.floor(seconds / 3600);
                const minutes = Math.floor((seconds % 3600) / 60);
                const secs = seconds % 60;
                
                timerElement.textContent = 
                    `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
                
                if (seconds > 0) {
                    seconds--;
                }
            };
            
            updateTimer();
            setInterval(updateTimer, 1000);
        }
    }
}

// 3.临期折扣特效：临近过期自动打七折并加徽章动画
class ExpiringDiscount {
    constructor() {
        this.discountApplied = new Set();
        this.init();
    }
    
    init() {
        // 定期检查并应用折扣
        setInterval(() => this.checkAndApplyDiscounts(), 30000);
    }
    
    checkAndApplyDiscounts() {
        const dairyCards = document.querySelectorAll('.product-card');
        
        dairyCards.forEach(card => {
            const daysLeft = parseInt(card.getAttribute('data-shelf-life'));
            const productId = card.getAttribute('data-id');
            
            // 如果剩余天数小于等于1且尚未应用折扣
            if (daysLeft <= 1 && !this.discountApplied.has(productId)) {
                this.applyDiscount(card, productId);
            }
        });
    }
    
    applyDiscount(card, productId) {
        // 检查是否已经应用过折扣
        if (card.querySelector('.discount-badge')) {
            return; // 已经应用过折扣，跳过
        }
        
        // 标记已应用折扣
        this.discountApplied.add(productId);
        
        // 使用原始价格计算折扣，避免多次折扣叠加
        const originalPrice = parseFloat(card.getAttribute('data-original-price'));
        
        // 计算折扣价（打7折）
        const discountedPrice = originalPrice * 0.7;
        
        // 添加折扣徽章
        const discountBadge = document.createElement('div');
        discountBadge.className = 'discount-badge';
        discountBadge.textContent = '临期特惠';
        card.appendChild(discountBadge);
        
        // 更新价格显示
        const priceElement = card.querySelector('.price');
        priceElement.innerHTML = `
            <span class="original-price">¥${originalPrice.toFixed(2)}</span>
            <span class="expiring-discount">临期</span>
        `;
        
        // 检查是否已经有折扣价格元素
        let discountedPriceElement = card.querySelector('.discounted-price');
        if (!discountedPriceElement) {
            discountedPriceElement = document.createElement('div');
            discountedPriceElement.className = 'discounted-price';
            card.querySelector('.product-meta').insertBefore(
                discountedPriceElement, 
                card.querySelector('.product-meta').firstChild
            );
        }
        
        // 设置折扣价格
        discountedPriceElement.textContent = `¥${discountedPrice.toFixed(2)}`;
        
        // 添加特效 - 使用JavaScript实现
        let iteration = 0;
        let startTime = null;
        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = ((timestamp - startTime) % 500) / 500;
            if (progress < 0.5) {
                const scale = 1 + (progress * 2) * 0.05;
                card.style.transform = `scale(${scale})`;
            } else {
                const scale = 1.05 - ((progress - 0.5) * 2) * 0.05;
                card.style.transform = `scale(${scale})`;
            }
            if (iteration < 3) {
                if (progress >= 0.99) {
                    iteration++;
                    if (iteration >= 3) {
                        card.style.transform = 'scale(1)';
                        return;
                    }
                }
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    }
}

// 4.视觉增强特效：波纹背景+卡片浮动+呼吸光环凸显柔软新鲜感
class DairyBakeryEffects {
    constructor() {
        this.init();
    }

    init() {
        this.addMilkyBackground();
        this.addFloatingCards();
        this.addBreathingHalo();
        this.addMilkSplashEffect();
        this.addExpiryDateCountdown();
    }

    // 在容器添加柔和波纹背景
    addMilkyBackground() {
        const container = document.getElementById('dairy-bakery');
        if (!container || container.querySelector('.milk-bg')) return;
        const bg = document.createElement('div');
        bg.className = 'milk-bg';
        Object.assign(bg.style, {
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 25% 30%, rgba(255,255,255,0.35), transparent 45%), radial-gradient(circle at 75% 60%, rgba(255,255,255,0.3), transparent 50%)',
            transform: 'translateY(0)',
            pointerEvents: 'none',
            zIndex: 0
        });
        container.style.position = 'relative';
        container.prepend(bg);
        
        // 使用JavaScript实现牛奶波纹动画（上下浮动效果）
        let startTime = null;
        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = ((timestamp - startTime) % 10000) / 10000;
            const y = Math.sin(progress * Math.PI * 2) * -6;
            bg.style.transform = `translateY(${y}px)`;
            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }

    // 5.卡片轻浮动特效：悬停/按压的浮动与阴影反馈
    addFloatingCards() {
        const cards = document.querySelectorAll('#dairy-bakery .product-card');
        cards.forEach((card, index) => {
            card.classList.add('card-float');
            
            // 添加鼠标悬停时的额外提升效果 - 使用JavaScript实现
            card.addEventListener('mouseenter', () => {
                card.style.transition = 'transform 0.25s ease, box-shadow 0.25s ease';
                card.style.transform = 'translateY(-8px) scale(1.02)';
                card.style.boxShadow = '0 16px 32px rgba(0,0,0,0.15)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
                card.style.boxShadow = '';
            });
            
            // 添加点击时的下沉反馈
            card.addEventListener('mousedown', () => {
                card.style.transform = 'translateY(-4px) scale(0.98)';
            });
            
            card.addEventListener('mouseup', () => {
                card.style.transform = 'translateY(-8px) scale(1.02)';
            });
        });
    }

    // 6.临期/促销呼吸光环特效：高亮提示临期或促销卡片
    addBreathingHalo() {
        const cards = document.querySelectorAll('#dairy-bakery .product-card');
        cards.forEach((card) => {
            const shelf = Number(card.getAttribute('data-shelf-life') || 3);
            const isExpiring = shelf <= 2;
            const isPromotion = card.classList.contains('expiring-soon') || 
                               card.querySelector('.promotion-badge') !== null;
            
            if (isExpiring || isPromotion) {
                card.classList.add('halo-pulse');
                
                // 根据剩余天数设置不同的光环颜色
                let haloColor = 'rgba(255,255,255,0.2)';
                if (shelf <= 1) {
                    haloColor = 'rgba(255,87,34,0.3)'; // 红色警告
                } else if (shelf <= 2) {
                    haloColor = 'rgba(255,152,0,0.25)'; // 橙色提醒
                } else if (isPromotion) {
                    haloColor = 'rgba(76,175,80,0.25)'; // 绿色促销
                }
                
                // 动态设置光环颜色
                const style = document.createElement('style');
                style.textContent = `
                    #dairy-bakery .product-card.halo-pulse::after {
                        background: radial-gradient(circle, ${haloColor}, transparent 65%);
                    }
                `;
                if (!document.getElementById('dynamic-halo-style')) {
                    style.id = 'dynamic-halo-style';
                    document.head.appendChild(style);
                }
            }
        });
    }

   

    // 过期倒计时：显示剩余保质期
    addExpiryDateCountdown() {
        const expiryBadges = document.querySelectorAll('.expiry-badge');
        expiryBadges.forEach((badge) => {
            const days = Number(badge.textContent.replace('剩余', '').replace('天', ''));
            let startTime = null;
            const animate = (timestamp) => {
                if (!startTime) startTime = timestamp;
                const progress = ((timestamp - startTime) % 1000) / 1000;
                const blinkProgress = (progress * 2) % 1;
                const opacity = 0.7 + Math.sin(blinkProgress * Math.PI) * 0.3;
                const scale = 1 + Math.sin(blinkProgress * Math.PI) * 0.08;

                badge.style.opacity = opacity;
                badge.style.transform = `scale(${scale})`;

                requestAnimationFrame(animate);
            };
            requestAnimationFrame(animate);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new DairyBakeryEffects();
});

// 乳品面点分类标签特效增强
class DairyBakeryCategoryTabs {
    constructor() {
        this.categories = ['全部', '牛奶', '面包', '蛋糕', '酸奶', '奶酪'];
        this.currentCategory = '全部';
        this.sortOrder = 'arrival'; // arrival: 到库时间, price: 价格, popularity: 热门度
        this.init();
    }
    
    init() {
        // 创建分类标签界面
        this.createCategoryInterface();
        
        // 绑定事件
        this.bindEvents();
        
        // 加载默认分类数据
        this.loadCategoryData(this.currentCategory);
    }
    
    createCategoryInterface() {
        const container = document.getElementById('dairy-bakery');
        container.innerHTML = `
            <div class="module-header">
                <h2>乳品面点</h2>
                <p>新鲜出炉，美味可口</p>
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
            <div class="product-grid" id="dairy-grid">
                <!-- 商品将在此处加载 -->
            </div>
        `;
        
        // 创建促销横幅
        new PromotionBannerAnimation();
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
        
        // 添加切换动画效果
        this.addCategorySwitchAnimation();
        
        // 加载新分类数据
        this.loadCategoryData(category);
    }
    
    // 使用JavaScript实现分类切换动画
    addCategorySwitchAnimation() {
        const tabs = document.querySelectorAll('.tab-button');
        
        tabs.forEach((tab) => {
            if (tab.classList.contains('active')) {
                // 激活标签：缩放动画（0.9 -> 1.05 -> 1）
                tab.style.transform = 'scale(0.9)';
                requestAnimationFrame(() => {
                    tab.style.transition = 'transform 0.3s ease-out';
                    tab.style.transform = 'scale(1.05)';
                    setTimeout(() => {
                        tab.style.transform = 'scale(1)';
                    }, 300);
                });
            } else {
                // 非激活标签：淡出效果
                tab.style.opacity = '1';
                requestAnimationFrame(() => {
                    tab.style.transition = 'opacity 0.3s ease-out';
                    tab.style.opacity = '0.7';
                });
            }
        });
    }
    
    async loadCategoryData(category) {
        console.log('[DairyBakery] 开始加载分类数据', category);
        const grid = document.getElementById('dairy-grid');
        if (!grid) {
            console.error('[DairyBakery] 找不到dairy-grid容器');
            return;
        }
        grid.innerHTML = '<div class="loading">加载中...</div>';
        
        try {
            // 获取API客户端
            const apiClient = globalThis.apiClient;
            if (!apiClient) {
                console.error('[DairyBakery] API客户端未就绪');
                grid.innerHTML = '<div class="error-message">加载商品数据失败: API客户端未初始化</div>';
                return;
            }
            
            if (!apiClient.getProductsByCategory) {
                console.error('[DairyBakery] API客户端缺少getProductsByCategory方法');
                grid.innerHTML = '<div class="error-message">加载商品数据失败: API方法不存在</div>';
                return;
            }
            
            // 从API获取乳品面点商品数据
            console.log('[DairyBakery] 调用API获取数据');
            const response = await apiClient.getProductsByCategory('dairyBakery');
            console.log('[DairyBakery] API响应', response);
            
            if (response && response.success && Array.isArray(response.products)) {
                console.log('[DairyBakery] 成功获取数据，商品数量:', response.products.length);
                
                if (response.products.length === 0) {
                    grid.innerHTML = '<div class="error-message">暂无商品数据</div>';
                    return;
                }
                
                // 为每个商品添加分类相关属性
                let products = response.products.map((product) => {
                    return {
                        ...product,
                        shelfLife: product.shelfLife || Math.floor(Math.random() * 7) + 1, // 1-7天
                        rating: (Math.random() * 2 + 3).toFixed(1) // 3-5星评分
                    };
                });

                // 按当前分类过滤（"全部"不过滤）
                if (category !== '全部') {
                    const map = {
                        '牛奶': ['milk', '41'],
                        '面包': ['bread', '44'],
                        '蛋糕': ['pastry', '45'],
                        '酸奶': ['yogurt', '42'],
                        '奶酪': ['cheese', '43'],
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
                console.log('[DairyBakery] 成功渲染商品，数量:', products.length);
            } else {
                console.error('[DairyBakery] API返回失败或无商品数据', response);
                grid.innerHTML = '<div class="error-message">加载商品数据失败</div>';
            }
        } catch (error) {
            console.error('[DairyBakery] 获取商品数据异常:', error);
            grid.innerHTML = `<div class="error-message">加载商品数据失败: ${error.message || '未知错误'}</div>`;
        }
    }
    
    renderProducts(products) {
        const grid = document.getElementById('dairy-grid');
        grid.innerHTML = products.map(product => {
            // 处理图片路径（移除强制刷新的时间戳，减少重复加载延迟）
            let imageSrc = product.image || 'src/shengxian.png';
            
            // 检查是否为Base64图片
            const isBase64 = imageSrc.startsWith('data:image/');
            
            // 如果是普通图片URL，确保路径正确
            if (!isBase64) {
                if (!imageSrc.startsWith('src/') && !imageSrc.startsWith('http://') && !imageSrc.startsWith('https://')) {
                    // 如果是相对路径且不是以src/开头，添加src/前缀
                    imageSrc = 'src/' + imageSrc;
                }
                // 允许浏览器缓存，提升渲染速度，不再附加时间戳
            }
            
            // 为商品添加原价属性，用于后续折扣计算
            const originalPrice = product.price;
            
            return `
            <div class="product-card dairy-card" data-id="dairy-${product.id}" data-shelf-life="${product.shelfLife}" data-original-price="${originalPrice}">
                <div class="product-image">
                    <img src="${imageSrc}" alt="${product.name}" onerror="this.onerror=null;this.src='src/shengxian.png'" loading="lazy">
                </div>
                <div class="product-info">
                    <h4>${product.name}</h4>
                    <p class="product-description">${product.description || '精选优质产品，保证品质'}</p>
                    <div class="product-meta">
                        <span class="price">¥${originalPrice.toFixed(2)}</span>
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
        new ShelfLifeCountdown();
        
        // 初始化临期折扣 - 仅在全局范围内初始化一次
        if (!window.expiringDiscountInstance) {
            window.expiringDiscountInstance = new ExpiringDiscount();
        } else {
            // 更新折扣实例，确保它使用最新的商品卡片
            window.expiringDiscountInstance.checkAndApplyDiscounts();
        }
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
        const grid = document.getElementById('dairy-grid');
        const cards = Array.from(grid.querySelectorAll('.product-card'));
        
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
        
        // 使用JavaScript实现卡片淡入滑入动画（交错效果）
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            setTimeout(() => {
                card.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 50);
        });
    }
    
    addCardAnimations() {
        const cards = document.querySelectorAll('.product-card');
        
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

// 乳品面点模块主类 - 供ModuleManager调用
class DairyBakeryModule {
    constructor() {
        this.init();
    }
    
    init() {
        // 初始化分类标签
        this.categoryTabs = new DairyBakeryCategoryTabs();
        
        // 为按钮添加特效
        this.addButtonEffects();
    }
    
    // 刷新数据方法，供ModuleManager调用
    async refreshData() {
        console.log('刷新乳品面点商品数据...');
        if (this.categoryTabs && this.categoryTabs.loadCategoryData) {
            await this.categoryTabs.loadCategoryData(this.categoryTabs.currentCategory);
            console.log('乳品面点商品数据刷新完成');
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
    
    // 牛奶飞溅特效：点击卡片时产生牛奶飞溅效果（至少15行）
    addMilkSplashEffect() {
        // 使用事件委托处理动态加载的卡片
        document.addEventListener('click', (e) => {
            // 支持多种卡片选择器
            const cardSelectors = ['.product-card', '.dairy-card', '.bakery-card'];
            let clickedCard = null;
            
            // 检查点击目标是否是卡片或卡片的子元素
            for (let selector of cardSelectors) {
                clickedCard = e.target.closest(selector);
                if (clickedCard) break;
            }
            
            if (clickedCard) {
                const rect = clickedCard.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const clickY = e.clientY - rect.top;
                
                // 创建20个牛奶粒子
                for (let i = 0; i < 20; i++) {
                    const particle = document.createElement('div');
                    particle.className = 'milk-particle';
                    particle.style.position = 'absolute';
                    particle.style.width = '8px';
                    particle.style.height = '8px';
                    particle.style.borderRadius = '50%';
                    particle.style.background = 'rgba(255, 255, 255, 0.9)';
                    particle.style.left = clickX + 'px';
                    particle.style.top = clickY + 'px';
                    particle.style.pointerEvents = 'none';
                    particle.style.zIndex = '100';
                    clickedCard.style.position = 'relative';
                    clickedCard.appendChild(particle);
                    
                    // 为每个粒子设置随机运动参数
                    const angle = Math.random() * Math.PI * 2;
                    const velocity = 3 + Math.random() * 6;
                    const lifetime = 600 + Math.random() * 400;
                    const gravity = 0.2;
                    
                    let posX = 0;
                    let posY = 0;
                    let velX = Math.cos(angle) * velocity;
                    let velY = Math.sin(angle) * velocity;
                    let startTime = null;
                    
                    const animate = (timestamp) => {
                        if (!startTime) startTime = timestamp;
                        const elapsed = timestamp - startTime;
                        
                        if (elapsed < lifetime) {
                            posX += velX;
                            posY += velY;
                            velY += gravity;
                            
                            particle.style.transform = `translate(${posX}px, ${posY}px)`;
                            particle.style.opacity = 1 - (elapsed / lifetime);
                            
                            requestAnimationFrame(animate);
                        } else {
                            particle.remove();
                        }
                    };
                    requestAnimationFrame(animate);
                }
            }
        });
    }

    // 保质期倒计时特效：显示保质期倒计时的动态数字（至少15行）
    addExpiryDateCountdown() {
        const cards = document.querySelectorAll('.dairy-card, .bakery-card');
        cards.forEach((card) => {
            const expiryElement = card.querySelector('.expiry-date, .shelf-life');
            if (!expiryElement) {
                // 创建保质期显示元素
                const expiryBadge = document.createElement('div');
                expiryBadge.className = 'expiry-countdown';
                expiryBadge.textContent = '剩余3天';
                expiryBadge.style.position = 'absolute';
                expiryBadge.style.bottom = '10px';
                expiryBadge.style.right = '10px';
                expiryBadge.style.background = 'rgba(255,152,0,0.9)';
                expiryBadge.style.color = '#fff';
                expiryBadge.style.padding = '6px 12px';
                expiryBadge.style.borderRadius = '15px';
                expiryBadge.style.fontSize = '11px';
                expiryBadge.style.fontWeight = 'bold';
                expiryBadge.style.zIndex = '10';

                const cardContent = card.querySelector('.card-content, .product-info');
                if (cardContent) {
                    cardContent.style.position = 'relative';
                    cardContent.appendChild(expiryBadge);
                }
                
                // 倒计时数字闪烁动画
                let startTime = null;
                const animate = (timestamp) => {
                    if (!startTime) startTime = timestamp;
                    const elapsed = timestamp - startTime;
                    const progress = (elapsed % 2000) / 2000;
                    
                    // 每1秒闪烁一次
                    const blinkProgress = (progress * 2) % 1;
                    const opacity = 0.7 + Math.sin(blinkProgress * Math.PI) * 0.3;
                    const scale = 1 + Math.sin(blinkProgress * Math.PI) * 0.08;
                    
                    expiryBadge.style.opacity = opacity;
                    expiryBadge.style.transform = `scale(${scale})`;
                    
                    requestAnimationFrame(animate);
                };
                requestAnimationFrame(animate);
            }
        });
    }
}

// 导出到全局作用域，供ModuleManager使用
window.DairyBakeryModule = DairyBakeryModule;

// 仅通过ModuleManager初始化，移除传统初始化方式