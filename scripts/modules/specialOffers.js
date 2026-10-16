// 今日特价模块

// 加载CSS样式
function loadSpecialOffersCSS() {
    if (document.getElementById('special-offers-css')) return;
    const link = document.createElement('link');
    link.id = 'special-offers-css';
    link.rel = 'stylesheet';
    link.href = '../../css/modules/specialOffers.css';
    document.head.appendChild(link);
}

// 今日特价模块主类
class FlashSaleCountdown {
    currentTab = 'daily';
    dailyProducts = [];
    flashProducts = [];
    animationFrameId = null;

    constructor() {
        this.init();
    }

    // 初始化模块
    init() {
        loadSpecialOffersCSS();
        
        const container = document.getElementById('special-offers');
        if (!container) {
            console.error('[SpecialOffers] 容器不存在');
            return;
        }

        // 创建UI结构
        container.innerHTML = `
            <div class="module-header">
                <h2>特价专区</h2>
                <p>今日特价和限时秒杀商品，超值优惠</p>
                <button class="refresh-btn" id="refresh-special-offers">刷新</button>
            </div>
            <div class="tabs-container">
                <button class="tab-btn active" data-tab="daily">今日特价</button>
                <button class="tab-btn" data-tab="flash">限时秒杀</button>
            </div>
            <div class="tab-content active" id="daily-content">
                <div class="product-grid" id="daily-grid"></div>
                </div>
            <div class="tab-content" id="flash-content">
                <div class="product-grid" id="flash-grid"></div>
            </div>
        `;

        // 绑定事件
        this.bindEvents();

        // 立即加载数据
        this.loadData();
    }

    // 绑定事件监听器
    bindEvents() {
        const container = document.getElementById('special-offers');
        if (!container) return;

        // 标签切换事件
        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-btn')) {
                const tab = e.target.dataset.tab;
                if (tab) {
                    this.switchTab(tab);
                }
            }
        });

        // 刷新按钮事件
        const refreshBtn = document.getElementById('refresh-special-offers');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshData();
            });
        }
    }

    // 切换标签
    switchTab(tab) {
        if (this.currentTab === tab) return;
        
        // 1.标签切换粒子爆炸特效
        this.createParticleExplosion();
        
        this.currentTab = tab;
        
        // 更新按钮状态
        document.querySelectorAll('#special-offers .tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });

        // 更新内容显示
        document.getElementById('daily-content').classList.toggle('active', tab === 'daily');
        document.getElementById('flash-content').classList.toggle('active', tab === 'flash');

        // 显示对应数据
        this.showCurrentTab();
    }

    // 1.标签切换粒子爆炸特效（至少15行）
    createParticleExplosion() {
        const activeBtn = document.querySelector('#special-offers .tab-btn.active');
        if (!activeBtn) return;
        
        const rect = activeBtn.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const particleCount = 30;
        const particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'fixed';
            particle.style.width = '6px';
            particle.style.height = '6px';
            particle.style.borderRadius = '50%';
            particle.style.backgroundColor = '#ff5722';
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '10000';
            particle.style.left = centerX + 'px';
            particle.style.top = centerY + 'px';
            document.body.appendChild(particle);
            
            const angle = (Math.PI * 2 * i) / particleCount;
            const velocity = 2 + Math.random() * 3;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;
            
            particles.push({
                element: particle,
                x: centerX,
                y: centerY,
                vx: vx,
                vy: vy,
                life: 1
            });
        }
        
        const animate = () => {
            let allDead = true;
            particles.forEach(p => {
                if (p.life > 0) {
                    allDead = false;
                    p.x += p.vx;
                    p.y += p.vy;
                    p.vy += 0.15;
                    p.life -= 0.02;
                    p.element.style.left = p.x + 'px';
                    p.element.style.top = p.y + 'px';
                    p.element.style.opacity = p.life;
                    p.element.style.transform = `scale(${p.life})`;
                }
            });
            
            if (allDead) {
                particles.forEach(p => {
                    p.element.remove();
                });
            } else {
                requestAnimationFrame(animate);
            }
        };
        animate();
    }

    // 显示当前标签的数据
    showCurrentTab() {
        const products = this.currentTab === 'daily' ? this.dailyProducts : this.flashProducts;
        const gridId = this.currentTab === 'daily' ? 'daily-grid' : 'flash-grid';
        
        // 如果数据为空，使用备用数据
        if (!products || products.length === 0) {
            const fallback = this.getFallbackProducts(this.currentTab);
            if (this.currentTab === 'daily') {
                this.dailyProducts = fallback;
            } else {
                this.flashProducts = fallback;
            }
            this.renderProducts(fallback, gridId, this.currentTab);
        } else {
            this.renderProducts(products, gridId, this.currentTab);
        }
    }

    // 加载数据
    async loadData() {
        // 立即显示备用数据
        if (this.dailyProducts.length === 0) {
            this.dailyProducts = this.getFallbackProducts('daily');
        }
        if (this.flashProducts.length === 0) {
            this.flashProducts = this.getFallbackProducts('flash');
        }
        this.showCurrentTab();

        // 后台异步加载真实数据
        this.loadDailyProducts();
        this.loadFlashProducts();
    }

    // 加载今日特价商品（从管理员界面API）
    async loadDailyProducts() {
        try {
            const apiClient = globalThis.apiClient;
            if (!apiClient) {
                console.log('[SpecialOffers] API客户端未就绪，使用备用数据');
                return;
            }

            let products = [];

            // 方法1: 尝试专用接口
            const response = await apiClient.getSpecialOfferProducts?.();
            if (response?.success && Array.isArray(response.products) && response.products.length > 0) {
                products = response.products;
                console.log(`[SpecialOffers] 从API获取到 ${products.length} 个今日特价商品`);
            }

            // 方法2: 从全量商品筛选
            if (products.length === 0) {
                const allResponse = await apiClient.getAllProducts?.();
                if (allResponse?.success && Array.isArray(allResponse.products)) {
                    products = allResponse.products.filter(p => 
                        p.isSpecialOffer === true || p.isSpecialOffer === 1 ||
                        p.is_special_offer === true || p.is_special_offer === 1
                    );
                    if (products.length > 0) {
                        console.log(`[SpecialOffers] 从全量商品筛选得到 ${products.length} 个今日特价商品`);
                    }
                }
            }

            // 如果有数据，更新
            if (products.length > 0) {
                this.dailyProducts = products;
                if (this.currentTab === 'daily') {
                    this.renderProducts(products, 'daily-grid', 'daily');
                }
            }
        } catch (error) {
            console.error('[SpecialOffers] 加载今日特价商品失败:', error);
        }
    }

    // 加载限时秒杀商品
    async loadFlashProducts() {
        try {
            const apiClient = globalThis.apiClient;
            if (!apiClient) {
                console.log('[SpecialOffers] API客户端未就绪，使用备用数据');
                return;
            }

            let products = [];

            // 方法1: 尝试专用接口
            const response = await apiClient.getFlashSaleProducts?.();
            if (response?.success && Array.isArray(response.products) && response.products.length > 0) {
                products = response.products;
                console.log(`[SpecialOffers] 从API获取到 ${products.length} 个限时秒杀商品`);
            }

            // 方法2: 从全量商品筛选
            if (products.length === 0) {
                const allResponse = await apiClient.getAllProducts?.();
                if (allResponse?.success && Array.isArray(allResponse.products)) {
                    products = allResponse.products.filter(p => 
                        p.isFlashSale === true || p.isFlashSale === 1 ||
                        p.is_flash_sale === true || p.is_flash_sale === 1
                    );
                    if (products.length > 0) {
                        console.log(`[SpecialOffers] 从全量商品筛选得到 ${products.length} 个限时秒杀商品`);
                    }
                }
            }

            // 如果有数据，更新
            if (products.length > 0) {
                this.flashProducts = products;
                if (this.currentTab === 'flash') {
                    this.renderProducts(products, 'flash-grid', 'flash');
                }
            }
        } catch (error) {
            console.error('[SpecialOffers] 加载限时秒杀商品失败:', error);
        }
    }

    // 获取备用商品数据
    getFallbackProducts(type) {
        if (type === 'daily') {
            return [
                { id: 'd1', name: '优质牛肉', price: 45.9, original_price: 68, image: 'src/shengxian.png', description: '精选优质牛肉，新鲜美味' },
                { id: 'd2', name: '有机苹果', price: 8.9, original_price: 12.5, image: 'src/fruit.png', description: '有机种植，新鲜可口' },
                { id: 'd3', name: '进口牛奶', price: 99, original_price: 129, image: 'src/shengxian.png', description: '进口优质牛奶，营养丰富' },
                { id: 'd4', name: '新鲜鸡蛋', price: 18.8, original_price: 23.5, image: 'src/shengxian.png', description: '新鲜鸡蛋，营养健康' },
                { id: 'd5', name: '新鲜蔬菜', price: 6.8, original_price: 9.9, image: 'src/shengxian.png', description: '新鲜蔬菜，营养丰富' },
                { id: 'd6', name: '精品大米', price: 25.9, original_price: 35, image: 'src/shengxian.png', description: '优质大米，口感香糯' }
            ];
        } else {
            return [
                { id: 'f1', name: '鲜活龙虾', price: 198, original_price: 298, image: 'src/shengxian.png', description: '鲜活龙虾，肉质鲜美' },
                { id: 'f2', name: '高级奶酪拼盘', price: 88, original_price: 128, image: 'src/shengxian.png', description: '高级奶酪拼盘，口感丰富' },
                { id: 'f3', name: '智利樱桃', price: 58, original_price: 88, image: 'src/fruit.png', description: '智利进口樱桃，甜蜜多汁' },
                { id: 'f4', name: '意大利橄榄油', price: 99, original_price: 168, image: 'src/shengxian.png', description: '意大利进口橄榄油，健康美味' }
            ];
        }
    }

    // 渲染商品列表
    renderProducts(products, gridId, type) {
        const grid = document.getElementById(gridId);
        if (!grid) {
            console.error(`[SpecialOffers] 找不到容器: ${gridId}`);
            return;
        }
        
        if (!products || products.length === 0) {
            grid.innerHTML = '<div class="no-products">暂无商品</div>';
            return;
        }
        
        const html = products.map((product, index) => {
            const price = Number(product.price || 0).toFixed(2);
            const originalPrice = Number(product.original_price || product.originalPrice || price * 1.2).toFixed(2);
            const discount = Math.round((1 - Number(price) / Number(originalPrice)) * 100);
            
            let imgSrc = product.image || 'src/shengxian.png';
            if (!imgSrc.startsWith('data:image/') && !imgSrc.startsWith('http') && !imgSrc.startsWith('src/')) {
                imgSrc = 'src/' + imgSrc;
            }

            return `
                <div class="product-card" data-id="${product.id || ''}" data-index="${index}" data-price="${price}">
                    <div class="product-image">
                        <img src="${imgSrc}" alt="${product.name || ''}" onerror="this.src='src/shengxian.png'">
                        <div class="flash-sale-badge">${type === 'daily' ? '今日特价' : '限时秒杀'}</div>
                        ${discount > 0 ? `<div class="discount-badge" data-discount="${discount}">${discount}%</div>` : ''}
                    </div>
                    <div class="product-info">
                        <h4>${product.name || '未命名商品'}</h4>
                        <p class="product-description">${product.description || '精选优质商品'}</p>
                        <div class="price">
                            <span class="discount-price" data-final-price="${price}">¥${price}</span>
                            <span class="original-price">¥${originalPrice}</span>
                        </div>
                        <button class="add-to-cart-btn" data-index="${index}">加入购物车</button>
                    </div>
                </div>
            `;
        }).join('');

        grid.innerHTML = html;

        // 7.购物车按钮点击波纹特效（按钮内局部波纹）
        grid.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const index = Number.parseInt(btn.dataset.index || '0', 10);
                if (products[index]) {
                    // 特效7：购物车按钮点击波纹效果
                    this.createRippleEffect(e.target, e);
                    this.addToCart(products[index]);
                }
            });
        });

        // 应用所有特效
        this.applyAllEffects(grid, products);
    }

    // 应用所有特效（本模块从 2 开始编号，因为 1 已用于标签粒子爆炸）
    applyAllEffects(grid, products) {
        const cards = grid.querySelectorAll('.product-card');
        
        cards.forEach((card, index) => {
            // 2.商品卡片3D翻转特效
            this.apply3DFlipEffect(card);
            
            // 3.价格数字滚动动画
            const priceElement = card.querySelector('.discount-price');
            if (priceElement) {
                this.animatePriceNumber(priceElement);
            }
            
            // 4.商品图片轮播/缩放特效
            const imgElement = card.querySelector('.product-image img');
            if (imgElement) {
                this.applyImageZoomEffect(imgElement);
            }
            
            // 5.商品卡片入场动画
            this.applyCardEntryAnimation(card, index);
            
            // 6.折扣标签闪烁脉冲特效
            const discountBadge = card.querySelector('.discount-badge');
            if (discountBadge) {
                this.applyDiscountPulseEffect(discountBadge);
            }
        });
    }

    // 2.商品卡片3D翻转特效（至少15行）
    apply3DFlipEffect(card) {
        let isFlipped = false;
        card.style.transition = 'transform 0.6s';
        card.style.transformStyle = 'preserve-3d';
        card.style.perspective = '1000px';
        
        card.addEventListener('mouseenter', () => {
            if (!isFlipped) {
                card.style.transform = 'rotateY(5deg) rotateX(5deg) scale(1.05)';
                card.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
            }
        });
        
        card.addEventListener('mouseleave', () => {
            if (!isFlipped) {
                card.style.transform = 'rotateY(0deg) rotateX(0deg) scale(1)';
                card.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
            }
        });
        
        card.addEventListener('click', () => {
            isFlipped = !isFlipped;
            if (isFlipped) {
                card.style.transform = 'rotateY(180deg) scale(1.1)';
            } else {
                card.style.transform = 'rotateY(0deg) scale(1)';
            }
        });
    }

    // 3.价格数字滚动动画（至少15行）
    animatePriceNumber(priceElement) {
        const finalPrice = Number.parseFloat(priceElement.dataset.finalPrice || priceElement.textContent.replace('¥', ''));
        if (Number.isNaN(finalPrice)) return;
        
        const startPrice = 0;
        const duration = 1500;
        const startTime = Date.now();
        const priceText = priceElement.textContent;
        const prefix = priceText.includes('¥') ? '¥' : '';
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // 使用easeOutCubic缓动函数
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentPrice = startPrice + (finalPrice - startPrice) * easeProgress;
            
            priceElement.textContent = prefix + currentPrice.toFixed(2);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                priceElement.textContent = prefix + finalPrice.toFixed(2);
            }
        };
        
        // 延迟启动动画，让卡片先出现
        setTimeout(() => {
            animate();
        }, 200);
    }

    // 4.商品图片轮播/缩放特效（至少15行）
    applyImageZoomEffect(imgElement) {
        let scale = 1;
        let isAnimating = false;
        const maxScale = 1.2;
        const minScale = 1;
        const speed = 0.02;
        
        imgElement.style.transition = 'transform 0.3s ease-out';
        imgElement.parentElement.style.overflow = 'hidden';
        
        imgElement.addEventListener('mouseenter', () => {
            isAnimating = true;
            const animate = () => {
                if (isAnimating && scale < maxScale) {
                    scale += speed;
                    imgElement.style.transform = `scale(${scale})`;
                    requestAnimationFrame(animate);
                }
            };
            animate();
        });
        
        imgElement.addEventListener('mouseleave', () => {
            isAnimating = false;
            const animate = () => {
                if (scale > minScale) {
                    scale -= speed * 2;
                    if (scale < minScale) scale = minScale;
                    imgElement.style.transform = `scale(${scale})`;
                    if (scale > minScale) {
                        requestAnimationFrame(animate);
                    }
                }
            };
            animate();
        });
    }

    // 5.商品卡片入场动画（至少15行）
    applyCardEntryAnimation(card, index) {
        const directions = [
            { x: -100, y: -50, rotate: -10 },
            { x: 100, y: -50, rotate: 10 },
            { x: -100, y: 50, rotate: -10 },
            { x: 100, y: 50, rotate: 10 },
            { x: 0, y: -100, rotate: 0 },
            { x: 0, y: 100, rotate: 0 }
        ];
        
        const direction = directions[index % directions.length];
        card.style.opacity = '0';
        card.style.transform = `translate(${direction.x}px, ${direction.y}px) rotate(${direction.rotate}deg) scale(0.8)`;
        card.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translate(0, 0) rotate(0deg) scale(1)';
        }, index * 100);
    }

    // 6.折扣标签闪烁脉冲特效（至少15行）
    applyDiscountPulseEffect(badge) {
        let pulseScale = 1;
        let pulseDirection = 1;
        const minScale = 1;
        const maxScale = 1.3;
        const pulseSpeed = 0.05;
        
        badge.style.transition = 'transform 0.1s ease-out';
        badge.style.display = 'inline-block';
        
        const pulse = () => {
            pulseScale += pulseDirection * pulseSpeed;
            
            if (pulseScale >= maxScale) {
                pulseScale = maxScale;
                pulseDirection = -1;
            } else if (pulseScale <= minScale) {
                pulseScale = minScale;
                pulseDirection = 1;
            }
            
            badge.style.transform = `scale(${pulseScale})`;
            badge.style.filter = `brightness(${1 + (pulseScale - 1) * 0.5})`;
            
            requestAnimationFrame(pulse);
        };
        
        pulse();
    }

    // 7.购物车按钮点击波纹特效（至少15行）
    createRippleEffect(button, event) {
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.position = 'absolute';
        ripple.style.width = size + 'px';
        ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255, 255, 255, 0.6)';
        ripple.style.transform = 'scale(0)';
        ripple.style.transition = 'transform 0.6s ease-out, opacity 0.6s ease-out';
        ripple.style.pointerEvents = 'none';
        ripple.style.zIndex = '1000';
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.style.transform = 'scale(2)';
            ripple.style.opacity = '0';
        }, 10);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    // 添加到购物车
    addToCart(product) {
        if (!product) return;

        const shoppingCart = globalThis.shoppingCart;
        if (shoppingCart && typeof shoppingCart.addItem === 'function') {
            shoppingCart.addItem({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image
            });
            console.log(`[SpecialOffers] 已添加商品到购物车: ${product.name}`);
        } else {
            alert(`已选择: ${product.name} - ¥${Number(product.price || 0).toFixed(2)}`);
        }
    }

    // 刷新数据（供ModuleManager调用）
    refreshData() {
        console.log('[SpecialOffers] 刷新数据');
        this.dailyProducts = [];
        this.flashProducts = [];
        this.loadData();
    }
}

// 导出到全局作用域
globalThis.FlashSaleCountdown = FlashSaleCountdown;

console.log('[SpecialOffers] 模块已加载');
