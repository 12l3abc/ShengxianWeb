// 首页模块

// 加载外部CSS函数
function loadCSS(href) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
}

// JavaScript动画工具类 - 替代所有CSS动画
class AnimationUtils {
    // fadeInUp动画
    static fadeInUp(element, duration = 600, delay = 0) {
        if (!element) return;
        setTimeout(() => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            requestAnimationFrame(() => {
                element.style.transition = `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`;
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            });
        }, delay);
    }

    // fadeIn动画
    static fadeIn(element, duration = 500, delay = 0) {
        if (!element) return;
        setTimeout(() => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            requestAnimationFrame(() => {
                element.style.transition = `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`;
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            });
        }, delay);
    }

    // slideInUp动画
    static slideInUp(element, duration = 500) {
        if (!element) return;
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        requestAnimationFrame(() => {
            element.style.transition = `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`;
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        });
    }

    // priceFlash价格闪烁动画
    static priceFlash(element, duration = 1000) {
        if (!element) return;
        const originalColor = element.style.color || '#ff5722';
        let startTime = null;
        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = (timestamp - startTime) / duration;
            if (progress < 1) {
                const intensity = Math.sin(progress * Math.PI * 2);
                if (intensity > 0) {
                    element.style.color = '#ff9800';
                    element.style.textShadow = `0 0 ${10 * intensity}px rgba(255, 152, 0, ${0.5 * intensity})`;
                } else {
                    element.style.color = originalColor;
                    element.style.textShadow = 'none';
                }
                requestAnimationFrame(animate);
            } else {
                element.style.color = originalColor;
                element.style.textShadow = 'none';
            }
        };
        requestAnimationFrame(animate);
    }

    // pulse脉冲动画
    static pulse(element, duration = 2000, scale = 1.05) {
        if (!element) return;
        let startTime = null;
        const originalTransform = element.style.transform || '';
        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = (timestamp - startTime) / duration;
            const cycle = Math.sin(progress * Math.PI * 2);
            const currentScale = 1 + (scale - 1) * Math.abs(cycle);
            element.style.transform = `${originalTransform} scale(${currentScale})`.trim();
            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }

    // cartBounce购物车弹跳动画 - 修复累加问题
    static cartBounce(element, duration = 500) {
        if (!element) return;
        // 保存原始transform，但只保存非scale的部分
        const computedStyle = window.getComputedStyle(element);
        const originalTransform = computedStyle.transform;
        // 重置为初始状态，避免累加
        element.style.transform = 'scale(1)';
        
        let startTime = null;
        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = (timestamp - startTime) / duration;
            if (progress < 1) {
                // 弹跳效果：先放大到1.3倍，然后恢复
                const scale = progress < 0.5 
                    ? 1 + (0.3 * (progress * 2))
                    : 1 + (0.3 * (2 - progress * 2));
                element.style.transform = `scale(${scale})`;
                requestAnimationFrame(animate);
            } else {
                // 动画结束后重置为1，避免累加
                element.style.transform = 'scale(1)';
            }
        };
        requestAnimationFrame(animate);
    }

    // cartFly购物车飞行动画 - 修复旋转和缩放效果
    static cartFly(element, startX, startY, endX, endY, duration = 1000) {
        if (!element) return;
        element.style.position = 'fixed';
        element.style.left = startX + 'px';
        element.style.top = startY + 'px';
        element.style.zIndex = '10000';
        element.style.opacity = '1';
        element.style.transform = 'translate(-50%, -50%) scale(0.5) rotate(0deg)';
        element.style.transformOrigin = 'center center';
        
        let startTime = null;
        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const easeProgress = progress * (2 - progress); // ease-out
            
            const x = startX + (endX - startX) * easeProgress;
            const y = startY + (endY - startY) * easeProgress;
            
            // 修复缩放：先放大到1.5倍，然后缩小到0.5倍
            let scale;
            if (progress < 0.5) {
                scale = 0.5 + (progress * 2) * 1.0; // 0.5 -> 1.5
            } else {
                scale = 1.5 - ((progress - 0.5) * 2) * 1.0; // 1.5 -> 0.5
            }
            
            const rotate = progress * 360;
            const opacity = 1 - progress;
            
            element.style.left = x + 'px';
            element.style.top = y + 'px';
            element.style.transform = `translate(-50%, -50%) scale(${scale}) rotate(${rotate}deg)`;
            element.style.opacity = opacity;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            }
        };
        requestAnimationFrame(animate);
    }

    // textGlow文字发光动画
    static textGlow(element, duration = 2000) {
        if (!element) return;
        let startTime = null;
        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = ((timestamp - startTime) % duration) / duration;
            const intensity = Math.sin(progress * Math.PI * 2) * 0.5 + 0.5;
            const shadow1 = 5 + intensity * 5;
            const shadow2 = 10 + intensity * 10;
            const shadow3 = 15 + intensity * 15;
            element.style.textShadow = `
                0 0 ${shadow1}px rgba(255, 255, 255, ${0.5 + intensity * 0.3}),
                0 0 ${shadow2}px rgba(76, 175, 80, ${0.3 + intensity * 0.3}),
                0 0 ${shadow3}px rgba(76, 175, 80, ${0.2 + intensity * 0.2})
            `;
            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }

    // brandSlide品牌滑动动画
    static brandSlide(element, duration = 20000) {
        if (!element) return;
        const trackWidth = element.scrollWidth / 2;
        let startTime = null;
        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = ((timestamp - startTime) % duration) / duration;
            const translateX = -progress * (trackWidth + 20);
            element.style.transform = `translateX(${translateX}px)`;
            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }

    // 平滑过渡动画（用于轮播图）
    static slideTransition(element, fromX, toX, duration = 800, callback) {
        if (!element) return;
        element.style.transform = `translateX(${fromX})`;
        element.style.opacity = '0';
        requestAnimationFrame(() => {
            element.style.transition = `transform ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
            requestAnimationFrame(() => {
                element.style.transform = `translateX(${toX})`;
                element.style.opacity = '1';
                if (callback) {
                    setTimeout(callback, duration);
                }
            });
        });
    }

    // 悬停效果处理
    static setupHoverEffect(element, hoverStyles, normalStyles) {
        if (!element) return;
        element.addEventListener('mouseenter', () => {
            Object.assign(element.style, hoverStyles);
        });
        element.addEventListener('mouseleave', () => {
            Object.assign(element.style, normalStyles);
        });
    }
}

class HomePage {
    constructor() {
        this.allProducts = []; // 存储所有商品数据
        this.recommendedProducts = [];
        this.init();
    }

    // 清洗图片，避免占位符域名报错(前期没插图片的时候我们用的)
    cleanImage(src) {
        if (!src) return 'src/shengxian.png';
        const lower = String(src).toLowerCase();
        if (lower.includes('placeholder.com') || lower.includes('via.placeholder')) {
            return 'src/shengxian.png';
        }
        return src;
    }
    
    async init() {
        // 初始化首页模块与样式加载
        loadCSS('../../css/modules/home.css');
        await this.loadAllProducts();
        this.setupCarousel();
        this.setupProductRecommendation();
        this.setupBrandSection();
        this.addPageAnimations();
    }
    
    // 加载所有商品
    async loadAllProducts() {
        try {
            const response = await apiClient.getAllProducts();
            if (response.success && response.products && response.products.length > 0) {
                this.allProducts = response.products.map(p => ({
                    ...p,
                    image: this.cleanImage(p.image)
                }));
            } else {
                this.allProducts = this.generateMockAllProducts();
            }
        } catch (error) {
            // 如果API调用失败，使用模拟数据
            this.allProducts = this.generateMockAllProducts();
        }
    }
    
    // 刷新商品数据
    async refreshProducts() {
        await this.loadAllProducts();
        this.setupProductRecommendation();
        this.setupCarousel();
    }
    

    
    // 生成模拟所有商品数据
    generateMockAllProducts() {
        const mockProducts = [];
        for (let i = 1; i <= 20; i++) {
            mockProducts.push({
                id: `product-${i}`,
                name: `商品${i}`,
                description: `精选优质商品${i}`,
                price: (Math.random() * 100 + 10).toFixed(2),
                image: 'images/placeholder.png'
            });
        }
        return mockProducts;
    }
    
    // 设置商品推荐系统
    setupProductRecommendation() {
        // 使用性能优化的实现，减少不必要的延迟
        // 采用Promise方式确保数据加载完成
        Promise.all([
            new Promise(resolve => {
                if (this.allProducts.length > 0) resolve();
                else setTimeout(resolve, 300); // 减少等待时间
            })
        ]).then(() => {
            this.generateRecommendedProducts();
            
            // 使用requestAnimationFrame优化渲染时机
            requestAnimationFrame(() => {
                this.renderRecommendedProducts();
                this.setupRecommendationInteractions();
            });
        });
    }
    
    // 初始化分页相关属性
    initPagination() {
        this.currentPage = 1;
        this.productsPerPage = 4; // 每页显示4个商品（2列布局）
        this.allRecommendedProducts = [];
    }
    
    // 生成推荐商品（基于类别和价格）
    generateRecommendedProducts() {
        // 初始化分页
        this.initPagination();
        
        // 从所有商品中选择价格较低的商品作为推荐
        this.allRecommendedProducts = [...this.allProducts]
            .filter(product => parseFloat(product.price) < 50)
            .sort(() => 0.5 - Math.random());
        
        // 设置当前页的商品
        this.updateCurrentPageProducts();
    }
    
    // 更新当前页的商品
    updateCurrentPageProducts() {
        const startIndex = (this.currentPage - 1) * this.productsPerPage;
        const endIndex = startIndex + this.productsPerPage;
        this.recommendedProducts = this.allRecommendedProducts.slice(startIndex, endIndex);
    }
    
    // 渲染推荐商品区域
    renderRecommendedProducts() {
        // 避免重复渲染，先移除已存在的推荐区域
        const existed = document.querySelector('.recommended-section');
        if (existed) existed.remove();

        const recommendedSection = document.createElement('div');
        recommendedSection.className = 'recommended-section';
        
        // 生成商品卡片HTML
        const productCardsHtml = this.recommendedProducts.map((product, index) => {
            // 处理图片路径，支持Base64图片
            const productImage = this.cleanImage(product.image);
            const isBase64 = productImage.startsWith('data:image/');
            const imageSrc = isBase64 ? productImage : `${productImage}?t=${Date.now()}`;
            
            // 确保价格是有效数字
            const price = parseFloat(product.price) || 0;
            const originalPrice = price * 1.3;
            
            // 确保商品名称和描述存在
            const productName = product.name || '未命名商品';
            const productDesc = product.description || '精选优质商品';
            
            return `
            <div class="product-card recommended-card" data-index="${index}" data-id="${product.id || ''}">
                <div class="product-image">
                    <img src="${imageSrc}" alt="${productName}" onerror="this.onerror=null;this.src='src/shengxian.png'" loading="lazy">
                    <div class="recommended-badge">推荐</div>
                    <div class="product-overlay">
                        <div class="overlay-content">
                            <div class="quick-view">快速查看</div>
                            <div class="favorite">❤️ 收藏</div>
                        </div>
                    </div>
                </div>
                <div class="product-info">
                    <h4>${productName}</h4>
                    <p class="product-description">${productDesc}</p>
                    <div class="product-meta">
                        <div class="price">
                            <span class="discount-price">¥${price.toFixed(2)}</span>
                            <span class="original-price">¥${originalPrice.toFixed(2)}</span>
                        </div>
                        <button class="add-to-cart-btn" data-id="${product.id || ''}">
                            <span class="btn-text">加入购物车</span>
                        </button>
                    </div>
                    <div class="product-tags">
                        <span class="tag fresh">新鲜</span>
                        <span class="tag popular">热销</span>
                    </div>
                </div>
            </div>
        `;}).join('');
        
        // 构建完整HTML
        recommendedSection.innerHTML = `
            <div class="module-header">
                <h2>✨ 为您推荐</h2>
                <p>基于您的浏览偏好，精选优质商品</p>
            </div>
            <div class="recommended-products-grid" id="recommended-products-grid">
                ${productCardsHtml}
            </div>
            <div class="recommendation-controls">
                <button class="recommendation-prev-btn" ${this.currentPage === 1 ? 'disabled' : ''}>‹ 上一页</button>
                <span class="page-info">第 ${this.currentPage} 页</span>
                <button class="recommendation-next-btn" ${this.recommendedProducts.length < this.productsPerPage ? 'disabled' : ''}>下一页 ›</button>
            </div>
        `;
        
        // 添加到页面中，直接放在轮播图之后
        const homeSection = document.getElementById('home');
        if (homeSection) {
            const carouselContainer = homeSection.querySelector('.carousel-container');
            if (carouselContainer) {
                carouselContainer.after(recommendedSection);
            }
        }
        
        // 确保首页商品卡片不会被其他模块的保质期脚本影响
        // 移除可能被错误添加的保质期显示
        setTimeout(() => {
            const homeCards = document.querySelectorAll('#home .recommended-card');
            homeCards.forEach(card => {
                // 移除保质期相关的属性
                card.removeAttribute('data-shelf-life');
                // 移除可能被错误添加的保质期容器
                const shelfLifeContainers = card.querySelectorAll('.shelf-life-container');
                shelfLifeContainers.forEach(container => container.remove());
            });
        }, 100);

    }
    
    // 切换到上一页
    prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.updateCurrentPageProducts();
            this.refreshRecommendedProducts();
        }
    }
    
    // 切换到下一页
    nextPage() {
        if (this.recommendedProducts.length >= this.productsPerPage) {
            this.currentPage++;
            this.updateCurrentPageProducts();
            this.refreshRecommendedProducts();
        }
    }
    
    // 刷新推荐商品显示
    refreshRecommendedProducts() {
        const recommendedSection = document.querySelector('.recommended-section');
        if (recommendedSection) {
            recommendedSection.remove();
        }
        this.renderRecommendedProducts();
        this.setupRecommendationInteractions();
    }
    
    // 设置推荐商品交互
    setupRecommendationInteractions() {
        const recommendedSection = document.querySelector('.recommended-section');
        if (!recommendedSection) return;
        
        const prevBtn = recommendedSection.querySelector('.recommendation-prev-btn');
        const nextBtn = recommendedSection.querySelector('.recommendation-next-btn');
        
        // 确保商品卡片有动画效果
        this.setupCardAnimations();
        
        // 添加分页控制
        const _this = this;
        prevBtn.addEventListener('click', () => {
            _this.prevPage();
        });
        
        nextBtn.addEventListener('click', () => {
            _this.nextPage();
        });
        
        // 添加鼠标悬停特效
        const productCards = document.querySelectorAll('.recommended-card');
        productCards.forEach(card => {
            // 鼠标进入效果
            card.addEventListener('mouseenter', () => {
                // 使用JavaScript实现卡片悬停效果（缩放+阴影+边框）
                card.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                card.style.transform = 'scale(1.03) translateY(-8px)';
                card.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
                card.style.borderColor = '#4CAF50';
                
                // 使用JavaScript实现图片放大效果
                const img = card.querySelector('.product-image img');
                if (img) {
                    img.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                    img.style.transform = 'scale(1.1)';
                }
                
                // 使用JavaScript实现覆盖层淡入效果
                const overlay = card.querySelector('.product-overlay');
                if (overlay) {
                    overlay.style.transition = 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                    overlay.style.opacity = '1';
                }
                
                // 使用JavaScript实现价格闪烁效果
                const price = card.querySelector('.discount-price');
                if (price) {
                    AnimationUtils.priceFlash(price, 1000);
                }
            });
            
            // 鼠标离开效果
            card.addEventListener('mouseleave', () => {
                // 使用JavaScript实现卡片恢复原状
                card.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                card.style.transform = 'scale(1) translateY(0)';
                card.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.1)';
                card.style.borderColor = 'transparent';
                
                // 使用JavaScript实现图片恢复原状
                const img = card.querySelector('.product-image img');
                if (img) {
                    img.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                    img.style.transform = 'scale(1)';
                }
                
                // 使用JavaScript实现覆盖层淡出效果
                const overlay = card.querySelector('.product-overlay');
                if (overlay) {
                    overlay.style.transition = 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                    overlay.style.opacity = '0';
                }
            });
            
            // 加入购物车按钮点击效果
            const addToCartBtn = card.querySelector('.add-to-cart-btn');
            if (addToCartBtn) {
                addToCartBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation(); // 防止事件冒泡
                    
                    // 使用JavaScript实现按钮点击反馈动画
                    addToCartBtn.style.transition = 'transform 0.1s ease';
                    addToCartBtn.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        addToCartBtn.style.transform = 'scale(1)';
                    }, 100);
                    
                    // 直接从按钮获取商品信息，不依赖allProducts数组
                    const productId = addToCartBtn.getAttribute('data-id');
                    const productCard = addToCartBtn.closest('.product-card');
                    
                    // 从商品卡片中提取商品信息
                    const productName = productCard.querySelector('h4').textContent;
                    const productPrice = productCard.querySelector('.discount-price').textContent.replace('¥', '');
                    
                    // 构建商品对象
                    const product = {
                        id: productId,
                        name: productName,
                        price: parseFloat(productPrice),
                        image: productCard.querySelector('.product-image img').src
                    };
                    
                    // 直接调用加入购物车方法，确保每次点击都能成功
                    this.addToCart(product, e);
                });
            }
        });
        
        // 添加滚动监听，为进入视口的卡片添加动画 - 使用JavaScript实现
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    AnimationUtils.fadeInUp(entry.target, 600, index * 100);
                }
            });
        }, { threshold: 0.1 });
        
        productCards.forEach(card => {
            observer.observe(card);
        });
    }
    
    // 使用JavaScript实现商品卡片动画（交错淡入效果）
    setupCardAnimations() {
        const cards = document.querySelectorAll('.recommended-card');
        cards.forEach((card, index) => {
            // 延迟动画，创建交错效果
            AnimationUtils.fadeInUp(card, 600, index * 150);
            setTimeout(() => {
                card.style.transform = 'translateY(0) scale(1)';
            }, index * 150);
        });
    }
    
    // 加入购物车功能
    addToCart(product, event) {
        // 确保商品对象包含所有必要的属性
        const validProduct = {
            name: product.name,
            price: product.price || 0,
            id: product.id || Date.now(),
            image: product.image || ''
        };
        
        // 使用全局购物车实例添加商品
        if (typeof window.shoppingCart !== 'undefined') {
            // 使用真正的购物车实例添加商品
            window.shoppingCart.addItem(validProduct);
        } else {
            // 显示错误信息
            console.error('购物车实例未找到');
            this.showNotification('购物车初始化失败，请刷新页面重试！', 'error');
            return;
        }
        
        // 使用JavaScript实现购物车飞行动画（旋转+缩放+移动）
        const buttonRect = event?.target?.getBoundingClientRect();
        const cartIconElement = document.querySelector('.cart-icon');
        const cartRect = cartIconElement?.getBoundingClientRect();
        
        if (buttonRect && cartRect) {
        const cartIcon = document.createElement('div');
        cartIcon.textContent = '🛒';
            cartIcon.style.fontSize = '32px';
            cartIcon.style.position = 'fixed';
            cartIcon.style.zIndex = '10000';
        document.body.appendChild(cartIcon);
        
            AnimationUtils.cartFly(
                cartIcon,
                buttonRect.left + buttonRect.width / 2,
                buttonRect.top + buttonRect.height / 2,
                cartRect.left + cartRect.width / 2,
                cartRect.top + cartRect.height / 2,
                1000
            );
        }
        
        // 使用JavaScript实现购物车数量弹跳动画
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            AnimationUtils.cartBounce(cartCount);
            }
    }
    
    // 从数组中随机选择n个不重复的元素
    getRandomItems(arr, n) {
        if (!arr || arr.length === 0) return [];
        
        // 创建数组副本以避免修改原数组
        const shuffled = [...arr].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(n, arr.length));
    }
    
    // 显示通知
    showNotification(message, type = 'success') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        // 根据类型设置图标和背景色
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        const backgrounds = {
            success: 'linear-gradient(135deg, #4CAF50, #45a049)',
            error: 'linear-gradient(135deg, #f44336, #e53935)',
            warning: 'linear-gradient(135deg, #ff9800, #f57c00)',
            info: 'linear-gradient(135deg, #2196F3, #1976D2)'
        };
        
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">${icons[type] || icons.success}</div>
                <div class="notification-text">${message}</div>
            </div>
        `;
        
        // 直接应用样式，优化通知外观
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.background = backgrounds[type] || backgrounds.success;
        notification.style.color = 'white';
        notification.style.padding = '15px 20px';
        notification.style.borderRadius = '12px';
        notification.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3)';
        notification.style.zIndex = '10000';
        notification.style.fontSize = '16px';
        notification.style.fontWeight = '500';
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        notification.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        notification.style.pointerEvents = 'none';
        
        document.body.appendChild(notification);
        
        // 显示通知
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        }, 10);
        
        // 自动关闭通知
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 400);
        }, 3000);
    }
    
    // 设置轮播图
    setupCarousel() {
        const homeSection = document.getElementById('home');
        if (!homeSection) return;
        
        // 增加检查确保DOM元素已完全加载
        const checkAndSetupCarousel = () => {
            const carousel = homeSection.querySelector('.carousel');
            if (carousel) {
                // 无论商品数据是否存在，都初始化轮播控制
                this.initCarouselControls();
                this.addTextEffects();
                
                // 只有当商品数据加载完成后才更新轮播图内容
                if (this.allProducts.length > 0) {
                    this.updateCarouselSlides();
                }
            } else {
                // 如果DOM元素未加载完成，延迟重试
                setTimeout(checkAndSetupCarousel, 100);
            }
        };
        
        checkAndSetupCarousel();
    }
    
    // 添加文字特效
    addTextEffects() {
        // 为首页标题添加文字发光效果
        const moduleHeaders = document.querySelectorAll('.module-header h2');
        moduleHeaders.forEach((header, index) => {
            // 添加文字发光效果
            header.classList.add('text-glow');
            AnimationUtils.textGlow(header);
            
            // 为每个标题添加不同的颜色
            const colors = ['#4CAF50', '#FF5722', '#2196F3', '#9C27B0', '#FFC107'];
            header.style.color = colors[index % colors.length];
            
            // 添加悬停放大效果
            AnimationUtils.setupHoverEffect(header, 
                { transform: 'scale(1.05)', transition: 'transform 0.3s ease' },
                { transform: 'scale(1)', transition: 'transform 0.3s ease' }
            );
        });
        
        // 为轮播图标题添加动态文字效果
        const carouselCaptions = document.querySelectorAll('.carousel-caption h3');
        carouselCaptions.forEach((caption, index) => {
            // 添加文字打字效果
            this.typewriterEffect(caption, 50, index * 200);
            
            // 添加文字渐变色效果
            caption.style.background = 'linear-gradient(45deg, #4CAF50, #FF5722)';
            caption.style.webkitBackgroundClip = 'text';
            caption.style.webkitTextFillColor = 'transparent';
            caption.style.backgroundClip = 'text';
            
            // 使用JavaScript实现slideInUp动画
            AnimationUtils.slideInUp(caption, 500);
        });
        
        // 为轮播图描述文字添加淡入效果
        const carouselDescriptions = document.querySelectorAll('.carousel-caption p');
        carouselDescriptions.forEach((desc, index) => {
            AnimationUtils.fadeIn(desc, 1000, 1000 + index * 200);
        });
        
        // 为推荐商品标题添加悬停效果
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach(card => {
            const productName = card.querySelector('h4');
            if (productName) {
                // 添加悬停变色效果
                productName.addEventListener('mouseenter', () => {
                    productName.style.color = '#4CAF50';
                    productName.style.transform = 'scale(1.05)';
                    productName.style.textShadow = '0 0 10px rgba(76, 175, 80, 0.3)';
                    productName.style.transition = 'all 0.3s ease';
                });
                
                productName.addEventListener('mouseleave', () => {
                    productName.style.color = '#333';
                    productName.style.transform = 'scale(1)';
                    productName.style.textShadow = 'none';
                });
            }
            
            // 为商品价格添加悬停闪烁效果
            const priceElement = card.querySelector('.price');
            if (priceElement) {
                priceElement.addEventListener('mouseenter', () => {
                    AnimationUtils.priceFlash(priceElement);
                    priceElement.style.transform = 'scale(1.1)';
                    priceElement.style.transition = 'transform 0.3s ease';
                });
                
                priceElement.addEventListener('mouseleave', () => {
                    priceElement.style.transform = 'scale(1)';
                });
            }
        });
        
        // 为页面所有按钮添加文字渐变效果，排除轮播按钮
        const buttons = document.querySelectorAll('button:not(.carousel-btn), .nav-link, .add-to-cart-btn, .tab-btn');
        buttons.forEach((button, index) => {
            if (button.tagName !== 'BUTTON' && !button.classList.contains('add-to-cart-btn')) {
                return;
            }
            
            button.style.position = 'relative';
            button.style.overflow = 'hidden';
            button.style.zIndex = '1';
            
            // 添加文字渐变背景
            button.style.background = 'linear-gradient(45deg, #4CAF50, #8BC34A)';
            button.style.color = 'white';
            button.style.border = 'none';
            
            // 添加悬停效果 - 使用JavaScript实现
            AnimationUtils.setupHoverEffect(button,
                {
                    background: 'linear-gradient(45deg, #43A047, #7CB342)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 5px 15px rgba(76, 175, 80, 0.3)',
                    transition: 'all 0.3s ease'
                },
                {
                    background: 'linear-gradient(45deg, #4CAF50, #8BC34A)',
                    transform: 'translateY(0)',
                    boxShadow: 'none',
                    transition: 'all 0.3s ease'
                }
            );
        });
    }
    
    // 打字机效果
    typewriterEffect(element, speed, delay) {
        const text = element.textContent;
        element.textContent = '';
        
        setTimeout(() => {
            let i = 0;
            const typeInterval = setInterval(() => {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    i++;
                } else {
                    clearInterval(typeInterval);
                }
            }, speed);
        }, delay);
    }
    
    // 文字渐变色效果
    addGradientTextEffect() {
        const gradientText = document.querySelectorAll('.module-header h2');
        gradientText.forEach(text => {
            text.style.background = 'linear-gradient(45deg, #4CAF50, #2196F3)';
            text.style.webkitBackgroundClip = 'text';
            text.style.webkitTextFillColor = 'transparent';
            text.style.backgroundClip = 'text';
        });
    }
    
    // 更新轮播图幻灯片内容
    updateCarouselSlides() {
        // 只有当有商品数据时才更新轮播图，避免清空现有内容
        if (this.allProducts.length === 0) {
            return;
        }
        
        const homeSection = document.getElementById('home');
        if (!homeSection) return;
        
        // 正确选择轮播图容器内的幻灯片
        const carousel = homeSection.querySelector('.carousel');
        if (!carousel) return;
        
        const slides = carousel.querySelectorAll('.carousel-slide');
        if (slides.length === 0) return;
        
        // 从所有商品中随机选择3个不重复的商品用于轮播
        const randomProducts = this.getRandomItems(this.allProducts, slides.length);
        
        // 设置轮播图的内容
        randomProducts.forEach((product, index) => {
            if (product && slides[index]) {
                const slide = slides[index];
                // 确保图片路径正确，添加错误处理
                const imageUrl = product.image || 'src/shengxian.png';
                // 处理Base64图片，不添加缓存清除参数
                const isBase64 = imageUrl.startsWith('data:image/');
                const finalImageUrl = isBase64 ? imageUrl : `${imageUrl}?t=${Date.now()}`;
                slide.innerHTML = `
                    <img src="${finalImageUrl}" alt="${product.name}" onerror="this.onerror=null;this.src='src/shengxian.png'">
                    <div class="carousel-caption">
                        <h3>${product.name}</h3>
                        <p>${index === 0 ? '今日新鲜到货' : index === 1 ? '热销推荐商品' : '新鲜品质承诺'}</p>
                    </div>
                `;
            }
        });
    }
    
    // 初始化轮播控制
    initCarouselControls() {
        // 使用事件委托和性能优化的轮播实现
        const homeSection = document.getElementById('home');
        if (!homeSection) return;
        
        // 修复轮播按钮选择器，使用正确的类名
        const prevBtn = homeSection.querySelector('.carousel-btn.prev-btn');
        const nextBtn = homeSection.querySelector('.carousel-btn.next-btn');
        
        // 正确选择轮播图容器内的幻灯片
        const carousel = homeSection.querySelector('.carousel');
        if (!carousel) return;
        
        const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
        const indicators = Array.from(homeSection.querySelectorAll('.indicator'));
        const slideCount = slides.length;
        
        // 如果没有幻灯片，不初始化轮播控制
        if (slideCount === 0) {
            return;
        }
        
        let currentSlide = 0;
        let autoplayInterval;
        let isAnimating = false;

        // 更新轮播图显示，实现平滑的过渡动画
        const updateCarousel = (direction = 'next') => {
            if (isAnimating) return;
            isAnimating = true;
            
            // 获取当前激活的幻灯片索引
            const currentActiveIndex = slides.findIndex(slide => slide.classList.contains('active'));
            
            // 使用requestAnimationFrame优化动画流畅度
            requestAnimationFrame(() => {
                // 使用JavaScript实现当前幻灯片淡出动画
                if (currentActiveIndex !== -1 && currentActiveIndex !== currentSlide) {
                    const currentActiveSlide = slides[currentActiveIndex];
                    currentActiveSlide.classList.remove('active');
                    
                    const fromX = direction === 'next' ? '0' : '0';
                    const toX = direction === 'next' ? '-100%' : '100%';
                    AnimationUtils.slideTransition(currentActiveSlide, fromX, toX, 800, () => {
                        currentActiveSlide.style.opacity = '0';
                    });
                }
                
                // 使用JavaScript实现新幻灯片淡入动画
                const newActiveSlide = slides[currentSlide];
                newActiveSlide.style.opacity = '0';
                
                // 根据方向设置初始位置
                if (direction === 'next') {
                    newActiveSlide.style.transform = 'translateX(100%)';
                } else {
                    newActiveSlide.style.transform = 'translateX(-100%)';
                }
                
                // 立即添加active类
                    newActiveSlide.classList.add('active');
                
                // 执行滑入动画
                requestAnimationFrame(() => {
                    AnimationUtils.slideTransition(newActiveSlide, 
                        direction === 'next' ? '100%' : '-100%', 
                        '0', 
                        800
                    );
                });
                
                // 更新指示器
                indicators.forEach((indicator, index) => {
                    indicator.classList.toggle('active', index === currentSlide);
                });
                
                // 动画结束后重置状态
                setTimeout(() => {
                    isAnimating = false;
                }, 1000); // 增加动画过渡时间，确保流畅性
            });
        };
        
        // 防抖处理函数
        function debounce(func, wait) {
            let timeout;
            return function() {
                const context = this;
                const args = arguments;
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(context, args), wait);
            };
        }
        
        // 开始自动播放
        const startAutoplay = () => {
            stopAutoplay(); // 先清除现有的定时器
            autoplayInterval = setInterval(() => {
                if (!isAnimating) {
                    currentSlide = (currentSlide + 1) % slideCount;
                    updateCarousel();
                }
            }, 5000); // 5秒自动切换一次
        };
        
        // 停止自动播放
        const stopAutoplay = () => {
            if (autoplayInterval) {
                clearInterval(autoplayInterval);
                autoplayInterval = null;
            }
        };
        
        // 上一张
        if (prevBtn) {
            prevBtn.addEventListener('click', debounce(() => {
                if (!isAnimating) {
                    currentSlide = (currentSlide - 1 + slideCount) % slideCount;
                    updateCarousel('prev'); // 传递方向参数
                    startAutoplay(); // 重置自动播放
                }
            }, 50));
        }
        
        // 下一张
        if (nextBtn) {
            nextBtn.addEventListener('click', debounce(() => {
                if (!isAnimating) {
                    currentSlide = (currentSlide + 1) % slideCount;
                    updateCarousel('next'); // 传递方向参数
                    startAutoplay(); // 重置自动播放
                }
            }, 50));
        }
        
        // 绑定指示器点击事件
        const indicatorContainer = homeSection.querySelector('.carousel-indicators');
        if (indicatorContainer) {
            // 使用事件委托减少事件监听器数量
            indicatorContainer.addEventListener('click', (e) => {
                const indicator = e.target.closest('.indicator');
                if (indicator && !isAnimating) {
                    const index = indicators.indexOf(indicator);
                    if (index !== -1 && index !== currentSlide) {
                        // 确定方向：如果目标索引大于当前索引，使用next，否则使用prev
                        const direction = index > currentSlide ? 'next' : 'prev';
                        currentSlide = index;
                        updateCarousel(direction); // 传递方向参数
                        startAutoplay(); // 重置自动播放
                    }
                }
            });
        } else {
            // 回退到单独绑定事件
            indicators.forEach((indicator, index) => {
                indicator.addEventListener('click', debounce(() => {
                    if (!isAnimating && index !== currentSlide) {
                        // 确定方向：如果目标索引大于当前索引，使用next，否则使用prev
                        const direction = index > currentSlide ? 'next' : 'prev';
                        currentSlide = index;
                        updateCarousel(direction); // 传递方向参数
                        startAutoplay(); // 重置自动播放
                    }
                }, 50));
            });
        }
        
        // 鼠标悬停时暂停自动播放
        const carouselContainer = homeSection.querySelector('.carousel-container');
        if (carouselContainer) {
            carouselContainer.addEventListener('mouseenter', stopAutoplay);
            carouselContainer.addEventListener('mouseleave', startAutoplay);
        }
        
        // 添加触摸支持，提升移动端兼容性
        let touchStartX = 0;
        let touchEndX = 0;
        
        if (carouselContainer) {
            carouselContainer.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });
            
            carouselContainer.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                handleSwipe();
            }, { passive: true });
        }
        
        function handleSwipe() {
            const swipeThreshold = 50; // 最小滑动距离
            if (touchEndX < touchStartX - swipeThreshold) {
                // 向左滑动，下一张
                if (!isAnimating) {
                    currentSlide = (currentSlide + 1) % slideCount;
                    updateCarousel('next'); // 传递方向参数
                    startAutoplay();
                }
            } else if (touchEndX > touchStartX + swipeThreshold) {
                // 向右滑动，上一张
                if (!isAnimating) {
                    currentSlide = (currentSlide - 1 + slideCount) % slideCount;
                    updateCarousel('prev'); // 传递方向参数
                    startAutoplay();
                }
            }
        }
        
        // 响应式调整
        function handleResize() {
            // 根据屏幕尺寸调整轮播配置
            const isMobile = window.innerWidth < 768;
            if (isMobile && autoplayInterval) {
                stopAutoplay();
                startAutoplay(); // 重置为适合的间隔
            }
        }
        
        // 添加调整大小事件监听
        window.addEventListener('resize', debounce(handleResize, 200));
        
        // 开始自动播放
        updateCarousel();
        startAutoplay();
    }
}

// 监听DOM加载完成事件并自动初始化
window.HomePage = HomePage;
document.addEventListener('DOMContentLoaded', function() {
    // 初始化首页
    try {
        // 将首页实例赋值给window对象，以便模块管理器调用
        window.homePage = new HomePage();
    } catch (error) {
        // 错误处理已在HomePage类内部处理
    }
});

// 添加品牌展示模块
HomePage.prototype.setupBrandSection = function() {
    const homeSection = document.getElementById('home');
    if (!homeSection) return;
    
    const brands = [
        { name: '绿色农场', logo: '🌱' },
        { name: '有机生活', logo: '🥗' },
        { name: '新鲜直达', logo: '🚚' },
        { name: '品质保证', logo: '✅' },
        { name: '健康优选', logo: '❤️' },
        { name: '安全食品', logo: '🔒' }
    ];
    
    const brandSection = document.createElement('div');
    brandSection.className = 'brand-section';
    brandSection.innerHTML = `
        <div class="module-header">
            <h2>🏆 合作品牌</h2>
            <p>值得信赖的合作伙伴</p>
        </div>
        <div class="brand-carousel">
            <div class="brand-track">
                ${brands.map(brand => `
                    <div class="brand-item">
                        <div class="brand-logo">${brand.logo}</div>
                        <div class="brand-name">${brand.name}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    // 添加到页面
    const recommendedSection = homeSection.querySelector('.recommended-section');
    if (recommendedSection) {
        recommendedSection.after(brandSection);
    } else {
        const carouselContainer = homeSection.querySelector('.carousel-container');
        if (carouselContainer) {
            carouselContainer.after(brandSection);
        }
    }
    
    // 使用JavaScript实现品牌滑动动画（无限循环）
    const brandTrack = brandSection.querySelector('.brand-track');
    if (brandTrack) {
        // 复制品牌项以实现无缝循环
        const brandItems = brandTrack.innerHTML;
        brandTrack.innerHTML = brandItems + brandItems;
        AnimationUtils.brandSlide(brandTrack, 20000);
    }
    
    // 使用JavaScript实现品牌项悬停效果
    const brandItems = brandSection.querySelectorAll('.brand-item');
    brandItems.forEach(item => {
        AnimationUtils.setupHoverEffect(item,
            {
                transform: 'translateY(-5px)',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease'
            },
            {
                transform: 'translateY(0)',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.3s ease'
            }
        );
    });
};

// 添加页面动画效果
HomePage.prototype.addPageAnimations = function() {
    // 使用JavaScript实现导航栏滚动效果（背景和阴影变化）
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 100) {
                navbar.classList.add('scrolled');
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
            } else {
                navbar.classList.remove('scrolled');
                navbar.style.background = '#ffffff';
                navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
            }
        }
    });
    
    // 使用JavaScript实现滚动触发淡入动画
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                AnimationUtils.fadeInUp(entry.target, 800);
            }
        });
    }, observerOptions);
    
    // 观察所有模块
    const modules = document.querySelectorAll('.module > div');
    modules.forEach(module => {
        module.style.opacity = '0';
        observer.observe(module);
    });

    // 顶部进度条：显示页面滚动进度，吸附在顶部，强调全局浏览位置
    if (!document.querySelector('.scroll-progress-bar')) {
        const bar = document.createElement('div');
        bar.className = 'scroll-progress-bar';
        Object.assign(bar.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            height: '4px',
            width: '0%',
            background: 'linear-gradient(90deg,#4caf50,#2196f3)',
            zIndex: '2000',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            transition: 'width 0.1s ease'
        });
        document.body.appendChild(bar);
        window.addEventListener('scroll', () => {
            const h = document.documentElement;
            const progress = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
            bar.style.width = `${progress}%`;
        }, { passive: true });
    }

    // 鼠标聚光灯：在首页区域添加跟随鼠标的光斑，营造舞台聚焦感
    const home = document.getElementById('home');
    if (home && !home.querySelector('.hero-spotlight')) {
        const spot = document.createElement('div');
        spot.className = 'hero-spotlight';
        Object.assign(spot.style, {
            position: 'absolute',
            width: '260px',
            height: '260px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.28), rgba(255,255,255,0))',
            pointerEvents: 'none',
            filter: 'blur(6px)',
            transform: 'translate(-50%, -50%)',
            mixBlendMode: 'screen'
        });
        home.style.position = 'relative';
        home.appendChild(spot);
        home.addEventListener('mousemove', (e) => {
            const rect = home.getBoundingClientRect();
            spot.style.left = `${e.clientX - rect.left}px`;
            spot.style.top = `${e.clientY - rect.top}px`;
        });
        home.addEventListener('mouseleave', () => {
            spot.style.left = '-9999px';
        });
    }

    // 使用JavaScript实现模块抛落式入场动画（下坠弹性效果）
    const firstModules = document.querySelectorAll('#home .module, #home .carousel-container, #home .recommended-section');
    firstModules.forEach((el, idx) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(-30px) scale(0.98)';
        setTimeout(() => {
            el.style.transition = 'all 0.5s cubic-bezier(.25,1.2,.3,1)';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0) scale(1)';
        }, 120 * idx);
    });

    // 使用JavaScript实现视差滚动效果（顶部区域与背景轻微偏移）
    const hero = document.querySelector('.hero') || document.getElementById('home');
    if (hero) {
        let ticking = false;
        const parallax = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                const offset = window.scrollY || 0;
                const translate = Math.min(offset * 0.12, 60);
                hero.style.transform = `translateY(${translate * -1}px)`;
                hero.style.backgroundPosition = `center ${translate * 0.6}px`;
                ticking = false;
            });
        };
        window.addEventListener('scroll', parallax, { passive: true });
    }

    // 使用JavaScript实现卡片滚动揭示动画（进入视口时逐个淡入）
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('card-revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    const attachReveal = () => {
        document.querySelectorAll('.recommended-card').forEach((card, idx) => {
            card.style.transitionDelay = `${idx * 60}ms`;
            revealObserver.observe(card);
        });
    };
    requestAnimationFrame(attachReveal);
    document.addEventListener('recommended:rendered', attachReveal);

    // 漂浮气泡背景：在首页容器内插入轻盈气泡，增强呼吸感
    const host = document.getElementById('home');
    if (host && !host.querySelector('.floating-bubbles')) {
        // 确保容器有相对定位和最小高度
        if (window.getComputedStyle(host).position === 'static') {
            host.style.position = 'relative';
        }
        
        const layer = document.createElement('div');
        layer.className = 'floating-bubbles';
        Object.assign(layer.style, {
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            minHeight: '600px',
            pointerEvents: 'none',
            overflow: 'visible',
            zIndex: '1'
        });
        
        // 创建气泡函数
        const createBubble = (index) => {
            const b = document.createElement('div');
            b.className = 'bubble';
            const size = 15 + Math.random() * 30;
            const startBottom = -50;
            const floatDuration = 12 + Math.random() * 8;
            const delay = index * 200; // 改为毫秒，减少延迟
            const leftPosition = Math.random() * 100;
            
            Object.assign(b.style, {
                position: 'absolute',
                width: `${size}px`,
                height: `${size}px`,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.4)',
                border: '2px solid rgba(255,255,255,0.5)',
                left: `${leftPosition}%`,
                bottom: `${startBottom}px`,
                filter: 'blur(1.5px)',
                opacity: '0',
                boxShadow: '0 0 15px rgba(255,255,255,0.4), inset 0 0 10px rgba(255,255,255,0.2)',
                transform: 'translateY(0)',
                willChange: 'transform, opacity'
            });
            
            layer.appendChild(b);
            
            // 使用JavaScript实现气泡浮动动画（上下浮动+上升+淡入淡出）
            const startAnimation = () => {
                let startTime = null;
                let animationId = null;
                
                const animate = (timestamp) => {
                    if (!startTime) startTime = timestamp;
                    const elapsed = (timestamp - startTime) / 1000;
                    
                    // 获取容器高度，如果为0则使用窗口高度
                    const containerHeight = Math.max(host.offsetHeight, host.scrollHeight, window.innerHeight);
                    const riseProgress = Math.min(elapsed / floatDuration, 1);
                    const totalDistance = containerHeight + 100;
                    const currentBottom = startBottom + totalDistance * riseProgress;
                    
                    // 左右摆动效果
                    const floatX = Math.sin(elapsed * 0.6) * 20;
                    const floatY = Math.sin(elapsed * 1.5) * 10;
                    
                    // 淡入淡出效果
                    let opacity = 0;
                    if (riseProgress < 0.15) {
                        // 前15%淡入
                        opacity = (riseProgress / 0.15) * 0.7;
                    } else if (riseProgress < 0.85) {
                        // 中间70%保持可见
                        opacity = 0.7;
                    } else {
                        // 最后15%淡出
                        opacity = 0.7 * (1 - (riseProgress - 0.85) / 0.15);
                    }
                    
                    // 缩放效果（上升过程中稍微变大）
                    const scale = 0.7 + riseProgress * 0.4;
                    
                    b.style.bottom = `${currentBottom}px`;
                    b.style.transform = `translate(${floatX}px, ${floatY}px) scale(${scale})`;
                    b.style.opacity = String(Math.max(0, Math.min(1, opacity)));
                    
                    // 如果气泡还没完全离开视口，继续动画
                    if (currentBottom < containerHeight + 150) {
                        animationId = requestAnimationFrame(animate);
                    } else {
                        // 气泡离开视口后，重置位置重新开始
                        b.style.bottom = `${startBottom}px`;
                        b.style.opacity = '0';
                        b.style.transform = 'translate(0, 0) scale(0.7)';
                        startTime = null;
                        // 短暂延迟后重新开始
                        setTimeout(() => {
                            startTime = null;
                            animationId = requestAnimationFrame(animate);
                        }, 500);
                    }
                };
                
                animationId = requestAnimationFrame(animate);
            };
            
            // 延迟启动动画
            if (delay > 0) {
                setTimeout(startAnimation, delay);
            } else {
                startAnimation();
            }
        };
        
        // 创建15个气泡
        for (let i = 0; i < 15; i++) {
            createBubble(i);
        }
        
        host.appendChild(layer);
        
        // 调试信息（可以删除）
        console.log('[HomePage] 漂浮气泡背景已创建，气泡数量: 15');
    }
};