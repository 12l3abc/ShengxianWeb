/**
 * 限时秒杀模块
 */

// 加载外部CSS函数
function loadCSS(href) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
}

// 加载外部CSS
loadCSS('../../css/modules/flashSale.css');

class FlashSale {
    constructor() {
        this.productsContainer = document.getElementById('flash-sale-products');
        this.hourElement = document.querySelector('.countdown-hour');
        this.minuteElement = document.querySelector('.countdown-minute');
        this.secondElement = document.querySelector('.countdown-second');
        this.timerInterval = null;
    }

    /**
     * 初始化限时秒杀模块
     */
    init() {
        this.startCountdown();
        this.loadFlashSaleProducts();
        this.setupCountdownProgress();
        this.enableTiltHover();
        this.injectFlameBar();
        this.addStickyCountdown();
        // 新增特效
        this.addParticleExplosionEffect();
        this.addPriceNumberBounceEffect();
    }

    /**
     * 开始倒计时
     */
    startCountdown() {
        // 设置倒计时时间（1小时45分30秒）
        let hours = 1;
        let minutes = 45;
        let seconds = 30;

        // 更新倒计时显示
        this.updateCountdownDisplay(hours, minutes, seconds);

        // 启动倒计时计时器
        this.timerInterval = setInterval(() => {
            seconds--;

            if (seconds < 0) {
                seconds = 59;
                minutes--;

                if (minutes < 0) {
                    minutes = 59;
                    hours--;

                    if (hours < 0) {
                        // 倒计时结束，重新开始
                        hours = 1;
                        minutes = 45;
                        seconds = 30;
                        // 可以在这里触发新一轮秒杀的逻辑
                        this.loadFlashSaleProducts();
                    }
                }
            }

            this.updateCountdownDisplay(hours, minutes, seconds);
            this.updateCountdownProgress(hours, minutes, seconds);
        }, 1000);
    }

    /**
     * 更新倒计时显示
     * @param {number} hours - 小时
     * @param {number} minutes - 分钟
     * @param {number} seconds - 秒
     */
    updateCountdownDisplay(hours, minutes, seconds) {
        if (this.hourElement) {
            this.hourElement.textContent = hours.toString().padStart(2, '0');
        }
        if (this.minuteElement) {
            this.minuteElement.textContent = minutes.toString().padStart(2, '0');
        }
        if (this.secondElement) {
            this.secondElement.textContent = seconds.toString().padStart(2, '0');
        }
    }

    // 倒计时进度条：以百分比展示剩余时间
    setupCountdownProgress() {
        const bar = document.createElement('div');
        bar.className = 'countdown-progress';
        bar.style.position = 'relative';
        bar.style.height = '6px';
        bar.style.background = 'rgba(255,255,255,0.15)';
        bar.style.borderRadius = '6px';
        bar.style.overflow = 'hidden';
        const inner = document.createElement('div');
        inner.className = 'countdown-progress-inner';
        inner.style.height = '100%';
        inner.style.width = '100%';
        inner.style.background = 'linear-gradient(90deg,#ff9800,#ff5722)';
        inner.style.transformOrigin = 'left center';
        inner.style.transition = 'transform 0.35s ease';
        bar.appendChild(inner);
        const container = document.querySelector('.flash-sale-info') || document.querySelector('.flash-sale');
        if (container) {
            container.appendChild(bar);
        }
        this.progressInner = inner;
        this.initialSeconds = 1 * 3600 + 45 * 60 + 30;
    }

    updateCountdownProgress(h, m, s) {
        if (!this.progressInner || !this.initialSeconds) return;
        const remain = Math.max(h * 3600 + m * 60 + s, 0);
        const ratio = remain / this.initialSeconds;
        this.progressInner.style.transform = `scaleX(${ratio})`;
    }

    /**
     * 加载限时秒杀商品
     */
    async loadFlashSaleProducts() {
        // 重新获取商品容器，确保DOM已完全加载
        this.productsContainer = document.getElementById('flash-sale-products');
        if (!this.productsContainer) {
            return;
        }

        this.productsContainer.innerHTML = '<div class="loading">加载中...</div>';

        try {
            // 直接从API获取所有商品，然后过滤出限时秒杀商品
            const response = await fetch('http://localhost:3001/api/products');
            
            if (!response.ok) {
                throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            
            const cleanImage = (src) => {
                if (!src) return 'src/shengxian.png';
                const lower = String(src).toLowerCase();
                if (lower.includes('placeholder.com') || lower.includes('via.placeholder')) {
                    return 'src/shengxian.png';
                }
                return src;
            };

            if (data.success && Array.isArray(data.products)) {
                // 过滤出限时秒杀商品
                const flashSaleProducts = data.products
                    .filter(p => p.isFlashSale)
                    .map(p => ({ ...p, image: cleanImage(p.image) }));
                
                if (flashSaleProducts.length > 0) {
                    this.renderProducts(flashSaleProducts);
                } else {
                    // 如果没有数据，显示提示信息
                    this.productsContainer.innerHTML = '<div class="loading">暂无限时秒杀商品</div>';
                }
            } else {
                // 如果数据格式错误，显示提示信息
                this.productsContainer.innerHTML = '<div class="loading">加载失败: 商品数据格式错误</div>';
            }
        } catch (error) {
            // 发生错误，显示提示信息
            this.productsContainer.innerHTML = `<div class="loading">加载失败: ${error.message}</div>`;
        }
    }

    /**
     * 渲染商品列表
     * @param {Array} products - 商品数据数组
     */
    renderProducts(products) {
        if (!this.productsContainer) {
            return;
        }

        if (!Array.isArray(products)) {
            this.productsContainer.innerHTML = '<div class="loading">加载失败: 商品数据格式错误</div>';
            return;
        }
        
        if (products.length === 0) {
            this.productsContainer.innerHTML = '<div class="loading">暂无限时秒杀商品</div>';
            return;
        }

        let html = '';
        
        products.forEach((product, index) => {
            // 确保商品对象有效
            if (!product || typeof product !== 'object') {
                return;
            }
            
            // 使用商品的原始价格或计算出的原始价格
            const originalPrice = product.original_price || product.originalPrice || product.price * 1.3;
            
            // 计算折扣百分比（添加严格验证，避免NaN%OFF）
            const discount = originalPrice > 0 && product.price > 0 
                ? Math.round((1 - product.price / originalPrice) * 100) 
                : 0;
            
            // 使用商品的库存信息或默认值
            const stock = product.stock || 0;
            const sold = Math.floor(Math.random() * stock); // 模拟已售数量
            const totalStock = stock + sold;
            
            // 计算库存进度
            const progress = totalStock > 0 
                ? Math.round((sold / totalStock) * 100) 
                : 0;
            
            // 确保商品id有效
            const productId = product.id || `product-${index}`;
            
            // 处理图片路径，支持Base64图片
            const productImage = product.image || 'src/shengxian.png';
            const isBase64 = productImage.startsWith('data:image/');
            const imageSrc = isBase64 ? productImage : `${productImage}?t=${Date.now()}`;
            
            html += `
                <div class="flash-sale-product">
                    <div class="flash-product-image">
                        <img src="${imageSrc}" alt="${product.name || '商品'}" onerror="this.onerror=null;this.src='src/shengxian.png'">
                        <span class="flash-badge">限时抢购</span>
                    </div>
                    <div class="flash-product-info">
                        <h3 class="flash-product-name">${product.name || '未命名商品'}</h3>
                        <div class="flash-price-section">
                            <span class="flash-current-price">¥${(product.price || 0).toFixed(2)}</span>
                            <span class="flash-original-price">¥${originalPrice.toFixed(2)}</span>
                            ${discount > 0 ? `<span class="flash-discount">${discount}%OFF</span>` : ''}
                        </div>
                        <div class="flash-stock-info">
                            <div class="flash-progress-bar">
                                <div class="flash-progress-fill" style="width: ${progress}%"></div>
                            </div>
                            <span class="flash-stock-text">已抢${progress}%，仅剩${stock}件</span>
                        </div>
                        <button class="flash-add-to-cart" data-product-id="${productId}">立即抢购</button>
                    </div>
                </div>
            `;
        });

        this.productsContainer.innerHTML = html;
        this.addEventListeners();
        this.highlightLowStock();
        this.bindTiltHover();
        this.addGlowToDeals();
    }

    // 库存紧张提示：售罄比例高时添加呼吸光效
    highlightLowStock() {
        const cards = this.productsContainer?.querySelectorAll('.flash-sale-product') || [];
        cards.forEach((card) => {
            const stockText = card.querySelector('.flash-stock-text')?.textContent || '';
            const matched = stockText.match(/已抢(\d+)%/);
            const percent = matched ? Number(matched[1]) : 0;
            if (percent >= 70) {
                card.style.boxShadow = '0 10px 24px rgba(255,87,34,0.25)';
                // 使用JavaScript实现低库存脉冲动画（上下浮动+轻微缩放）
                let startTime = null;
                const animate = (timestamp) => {
                    if (!startTime) startTime = timestamp;
                    const progress = ((timestamp - startTime) % 1600) / 1600;
                    const y = Math.sin(progress * Math.PI * 2) * -3;
                    const scale = 1 + Math.abs(Math.sin(progress * Math.PI * 2)) * 0.01;
                    card.style.transform = `translateY(${y}px) scale(${scale})`;
                    requestAnimationFrame(animate);
                };
                requestAnimationFrame(animate);
        }
        });
    }

    // 卡片倾斜悬停：为秒杀卡片添加轻微 3D 倾斜
    bindTiltHover() {
        const cards = this.productsContainer?.querySelectorAll('.flash-sale-product') || [];
        cards.forEach((card) => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const rx = ((y / rect.height) - 0.5) * -6;
                const ry = ((x / rect.width) - 0.5) * 6;
                card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0)';
            });
        });
    }

    // 供外部重绑悬停（初始化时也会调用）
    enableTiltHover() {
        this.bindTiltHover();
    }

    // 为高折扣商品添加火焰渐变边框（至少15行）
    addGlowToDeals() {
        const cards = this.productsContainer?.querySelectorAll('.flash-sale-product') || [];
        cards.forEach((card) => {
            const badge = card.querySelector('.flash-discount');
            if (badge) {
                const discountText = badge.textContent || '';
                const discountMatch = discountText.match(/(\d+)%/);
                const discountValue = discountMatch ? Number.parseInt(discountMatch[1], 10) : 0;
                
                // 根据折扣值设置不同的光效强度
                const glowIntensity = Math.min(discountValue / 50, 1);
                const shadowBlur = 12 + glowIntensity * 16;
                const shadowSpread = 0 + glowIntensity * 8;
                
                card.style.boxShadow = `0 ${shadowSpread}px ${shadowBlur}px rgba(255,87,34,${0.2 + glowIntensity * 0.2})`;
                card.style.border = `1px solid rgba(255,87,34,${0.3 + glowIntensity * 0.2})`;
                card.style.transition = 'box-shadow 0.3s ease, border 0.3s ease';
                
                // 使用JavaScript实现高折扣脉冲动画（阴影强度变化）
                if (discountValue >= 50) {
                    let startTime = null;
                    const animate = (timestamp) => {
                        if (!startTime) startTime = timestamp;
                        const progress = ((timestamp - startTime) % 2000) / 2000;
                        const intensity = Math.sin(progress * Math.PI * 2) * 0.5 + 0.5;
                        const blur = 8 + intensity * 4;
                        const spread = 0 + intensity * 4;
                        const opacity = 0.3 + intensity * 0.2;
                        card.style.boxShadow = `0 ${spread}px ${blur}px rgba(255,87,34,${opacity})`;
                        requestAnimationFrame(animate);
                    };
                    requestAnimationFrame(animate);
                }
            }
        });
    }

    // 顶部火焰进度条：常驻顶部的火线，强化紧迫/抢购氛围
    injectFlameBar() {
        if (document.querySelector('.flame-bar')) return;
        const bar = document.createElement('div');
        bar.className = 'flame-bar';
        Object.assign(bar.style, {
            position: 'fixed',
            top: '6px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '320px',
            height: '8px',
            background: 'linear-gradient(90deg,#ff7043,#ff5722,#ff9800)',
            borderRadius: '999px',
            boxShadow: '0 0 18px rgba(255,87,34,0.55)',
            zIndex: '2200',
            overflow: 'hidden'
        });
        const flame = document.createElement('div');
        flame.style.position = 'absolute';
        flame.style.inset = '0';
        flame.style.background = 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.9), rgba(255,255,255,0))';
        flame.style.transform = 'translateX(-60%)';
        bar.appendChild(flame);
        document.body.appendChild(bar);
        
        // 使用JavaScript实现火焰移动动画（左右循环移动）
        let startTime = null;
        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = ((timestamp - startTime) % 1600) / 1600;
            const translateX = -60 + progress * 120; // 从-60%移动到60%
            flame.style.transform = `translateX(${translateX}%)`;
            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }

    // 倒计时区域粘性显示：让倒计时始终贴顶可见，持续提醒剩余时间（至少15行）
    addStickyCountdown() {
        const countdown = document.querySelector('.flash-sale-countdown') || document.querySelector('.countdown');
        if (!countdown) return;
        
        // 设置粘性定位
        countdown.style.position = 'sticky';
        countdown.style.top = '10px';
        countdown.style.zIndex = '1100';
        countdown.style.backdropFilter = 'blur(6px)';
        countdown.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)';
        countdown.style.transition = 'all 0.3s ease';
        
        // 添加滚动时的透明度变化
        let lastScrollTop = 0;
        const handleScroll = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                countdown.style.opacity = '0.85';
                countdown.style.transform = 'translateY(-5px)';
            } else {
                countdown.style.opacity = '1';
                countdown.style.transform = 'translateY(0)';
            }
            lastScrollTop = scrollTop;
        };
        
        window.addEventListener('scroll', handleScroll, { passive: true });
        
        // 添加鼠标悬停效果
        countdown.addEventListener('mouseenter', () => {
            countdown.style.transform = 'scale(1.02)';
            countdown.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
        });
        
        countdown.addEventListener('mouseleave', () => {
            countdown.style.transform = 'scale(1)';
            countdown.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)';
        });
    }

    /**
     * 渲染模拟商品数据
     */
    renderMockProducts() {
        // 丰富的限时秒杀商品数据，包含各类生鲜产品
        const mockProducts = [
            {
                id: 1,
                name: '山东烟台红富士苹果 脆甜多汁',
                price: 12.99,
                originalPrice: 19.99,
                image: 'src/fruit.png',
                remainingStock: 150,
                totalStock: 200
            },
            {
                id: 2,
                name: '有机生菜 新鲜采摘 无农药',
                price: 4.5,
                originalPrice: 7.99,
                image: 'src/shengxian.png',
                remainingStock: 80,
                totalStock: 100
            },
            {
                id: 3,
                name: '新鲜三文鱼 挪威进口 现切',
                price: 69.99,
                originalPrice: 99.99,
                image: 'src/fish.png',
                remainingStock: 40,
                totalStock: 50
            },
            {
                id: 4,
                name: '土鸡蛋 农家散养 30枚装',
                price: 29.99,
                originalPrice: 39.99,
                image: 'src/egg.png',
                remainingStock: 100,
                totalStock: 150
            },
            {
                id: 5,
                name: '澳洲牛排 原切西冷 200g/份',
                price: 59.99,
                originalPrice: 89.99,
                image: 'src/shengxian.png',
                remainingStock: 60,
                totalStock: 80
            },
            {
                id: 6,
                name: '东北优质大米 5kg装',
                price: 39.99,
                originalPrice: 59.99,
                image: 'src/shengxian.png',
                remainingStock: 120,
                totalStock: 200
            },
            {
                id: 7,
                name: '海南三亚芒果 新鲜香甜 2.5kg装',
                price: 29.99,
                originalPrice: 45.99,
                image: 'src/fruit.png',
                remainingStock: 90,
                totalStock: 120
            },
            {
                id: 8,
                name: '纯牛奶 新鲜牧场直供 250ml*12盒',
                price: 35.99,
                originalPrice: 49.99,
                image: 'src/shengxian.png',
                remainingStock: 150,
                totalStock: 200
            }
        ];
        
        this.renderProducts(mockProducts);
    }

    /**
     * 添加事件监听器
     */
    addEventListeners() {
        const addToCartButtons = document.querySelectorAll('.flash-add-to-cart');
        
        addToCartButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const { productId } = e.currentTarget.dataset;
                this.addToCart(productId);
            });
        });
    }

    /**
     * 添加商品到购物车
     * @param {string} productId - 商品ID
     */
    addToCart(productId) {
        // 获取商品信息
        const productCard = document.querySelector(`[data-product-id="${productId}"]`).closest('.flash-sale-product');
        if (!productCard) return;
        
        const name = productCard.querySelector('.flash-product-name').textContent;
        const price = Number.parseFloat(productCard.querySelector('.flash-current-price').textContent.replace('¥', ''));
        
        // 使用全局购物车对象添加商品
        if (globalThis.shoppingCart) {
            globalThis.shoppingCart.addItem({
                name,
                price
            });
        }
    }

    // 粒子爆炸特效：点击秒杀按钮时产生粒子爆炸效果（至少15行）
    addParticleExplosionEffect() {
        const container = this.productsContainer;
        if (!container) return;
        
        container.addEventListener('click', (e) => {
            const addBtn = e.target.closest('.add-to-cart-btn, .flash-buy-btn');
            if (!addBtn) return;
            
            const rect = addBtn.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            // 创建20个粒子
            for (let i = 0; i < 20; i++) {
                const particle = document.createElement('div');
                particle.style.position = 'fixed';
                particle.style.width = '6px';
                particle.style.height = '6px';
                particle.style.borderRadius = '50%';
                particle.style.backgroundColor = '#ff5722';
                particle.style.left = centerX + 'px';
                particle.style.top = centerY + 'px';
                particle.style.zIndex = '10000';
                particle.style.pointerEvents = 'none';
                document.body.appendChild(particle);
                
                // 计算随机方向
                const angle = (Math.PI * 2 * i) / 20;
                const velocity = 150 + Math.random() * 100;
                const vx = Math.cos(angle) * velocity;
                const vy = Math.sin(angle) * velocity;
                
                // 粒子动画
                let startTime = null;
                const duration = 800 + Math.random() * 400;
                const animate = (timestamp) => {
                    if (!startTime) startTime = timestamp;
                    const elapsed = timestamp - startTime;
                    const progress = elapsed / duration;
                    
                    if (progress < 1) {
                        const x = centerX + vx * progress;
                        const y = centerY + vy * progress + 0.5 * 9.8 * progress * progress * 100;
                        const opacity = 1 - progress;
                        const scale = 1 - progress * 0.5;
                        
                        particle.style.left = x + 'px';
                        particle.style.top = y + 'px';
                        particle.style.opacity = opacity;
                        particle.style.transform = `scale(${scale})`;
                        
                        requestAnimationFrame(animate);
                    } else {
                        particle.remove();
                    }
                };
                requestAnimationFrame(animate);
            }
        });
    }
    
    // 价格数字跳动特效：价格变化时数字跳动显示（至少15行）
    addPriceNumberBounceEffect() {
        const container = this.productsContainer;
        if (!container) return;
        
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' || mutation.type === 'characterData') {
                    const priceElements = container.querySelectorAll('.flash-price, .discount-price');
                    priceElements.forEach((priceEl) => {
                        if (!priceEl.dataset.animated) {
                            priceEl.dataset.animated = 'true';
                            
                            // 创建跳动动画
                            let startTime = null;
                            const duration = 600;
                            const originalTransform = priceEl.style.transform || 'scale(1)';
                            
                            const animate = (timestamp) => {
                                if (!startTime) startTime = timestamp;
                                const elapsed = timestamp - startTime;
                                const progress = elapsed / duration;
                                
                                if (progress < 1) {
                                    // 弹性跳动效果
                                    let scale;
                                    if (progress < 0.3) {
                                        scale = 1 + (progress / 0.3) * 0.4; // 放大到1.4
                                    } else if (progress < 0.6) {
                                        scale = 1.4 - ((progress - 0.3) / 0.3) * 0.2; // 缩小到1.2
                                    } else if (progress < 0.8) {
                                        scale = 1.2 - ((progress - 0.6) / 0.2) * 0.15; // 缩小到1.05
                                    } else {
                                        scale = 1.05 - ((progress - 0.8) / 0.2) * 0.05; // 恢复到1
                                    }
                                    
                                    priceEl.style.transform = `scale(${scale})`;
                                    requestAnimationFrame(animate);
                                } else {
                                    priceEl.style.transform = originalTransform;
                                    priceEl.dataset.animated = 'false';
                                }
                            };
                            requestAnimationFrame(animate);
                        }
                    });
                }
            });
        });
        
        observer.observe(container, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }

    /**
     * 销毁方法，清理资源
     */
    destroy() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
}

// 导出FlashSale类
globalThis.FlashSale = FlashSale;

// 当DOM加载完成后初始化
const initFlashSale = () => {
    if (!document.getElementById('flash-sale-products')) return;
    const flashSale = new FlashSale();
    flashSale.init();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFlashSale);
} else {
    initFlashSale();
}
