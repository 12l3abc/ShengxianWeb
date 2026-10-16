// 主应用

// 模块管理器
class ModuleManager {
    constructor() {
        // 模块配置：键名 -> DOM元素ID映射
        this.moduleConfig = {
            'home': 'home',
            'specialOffers': 'special-offers',
            'freshProduce': 'fresh-produce',
            'meatPoultry': 'meat-poultry',
            'seafood': 'seafood',
            'dairyBakery': 'dairy-bakery',
            'beanProducts': 'bean-products',
            'readyMeals': 'ready-meals',
            'directSourcing': 'direct-sourcing',
            'afterSales': 'after-sales'
        };
        
        // 初始化模块对象
        this.modules = {};
        for (const [moduleName, elementId] of Object.entries(this.moduleConfig)) {
            this.modules[moduleName] = {
                loaded: moduleName === 'home',
                element: document.getElementById(elementId)
            };
        }
        
        this.currentModule = 'home';
        this.init();
        // 预加载今日特价模块（等模块脚本加载完成再尝试）
        this.preloadSpecialOffers();
    }

    // 尝试预加载今日特价模块，若模块尚未定义则延迟重试
    preloadSpecialOffers(retry = 0) {
        const maxRetry = 5;
        const retryDelay = 300; // ms
        if (typeof window !== 'undefined' && window.FlashSaleCountdown) {
            try {
                this.loadModule('specialOffers');
                // 保持当前可见模块不变
                if (this.modules['specialOffers']?.element) {
                    this.modules['specialOffers'].element.classList.remove('active');
                }
            } catch (e) {
                console.warn('预加载今日特价模块失败:', e);
            }
            return;
        }
        if (retry < maxRetry) {
            setTimeout(() => this.preloadSpecialOffers(retry + 1), retryDelay);
        } else {
            console.warn('预加载今日特价模块超时，未能加载FlashSaleCountdown');
        }
    }
    
    init() {
        // 绑定导航链接事件
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-link')) {
                e.preventDefault();
                const module = e.target.getAttribute('data-module');
                this.switchModule(module);
                
                // 添加点击波纹效果
                this.createRippleEffect(e);
            }
        });
        
        // 初始化首页
        this.showModule('home');
    }
    
    // 创建波纹效果
    createRippleEffect(e) {
        const button = e.target;
        
        // 排除轮播按钮，防止样式异常
        if (button.classList.contains('carousel-btn')) {
            return;
        }
        
        const circle = document.createElement("span");
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;
        
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left - radius;
        const y = e.clientY - rect.top - radius;
        
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${x}px`;
        circle.style.top = `${y}px`;
        circle.classList.add("ripple");
        
        // 移除之前的波纹效果
        const ripple = button.getElementsByClassName("ripple")[0];
        if (ripple) {
            ripple.remove();
        }
        
        button.appendChild(circle);
    }
    
    switchModule(moduleName) {
        if (this.currentModule === moduleName) return;
        
        // 隐藏当前模块
        this.hideModule(this.currentModule);
        
        // 显示新模块
        this.showModule(moduleName);
        
        // 更新当前模块
        this.currentModule = moduleName;
        
        // 更新导航激活状态
        this.updateNavigationActiveState(moduleName);
    }
    
    showModule(moduleName) {
        const module = this.modules[moduleName];
        if (module) {
            // 如果模块尚未加载，则加载它
            if (!module.loaded) {
                this.loadModule(moduleName);
            }
            
            // 显示模块
            if (module.element) {
                module.element.style.display = 'block';
                module.element.classList.add('active');
            }
        }
    }
    
    hideModule(moduleName) {
        const module = this.modules[moduleName];
        if (module && module.element) {
            module.element.classList.remove('active');
            module.element.style.display = 'none';
            
            // 特殊处理产地直采：切换或退出时销毁实例，避免残留
            if (moduleName === 'directSourcing') {
                if (module.instance && typeof module.instance.destroy === 'function') {
                    module.instance.destroy();
                }
                module.instance = null;
                module.loaded = false; // 下次进入重新初始化，确保干净
                module.element.innerHTML = '';
            }
        }
    }
    
    loadModule(moduleName) {
        console.log(`Loading module: ${moduleName}`);
        
        // 获取正确的DOM元素ID
        const elementId = this.moduleConfig[moduleName] || moduleName;
        
        // 创建模块容器（如果不存在）
        if (!this.modules[moduleName].element) {
            console.log(`Creating container for ${moduleName} with ID ${elementId}`);
            const container = document.createElement('section');
            container.id = elementId;
            container.className = 'module';
            document.getElementById('main-content').appendChild(container);
            this.modules[moduleName].element = container;
        }
        
        // 调用模块的初始化方法
        try {
            let moduleInstance;
            // 如果特价模块尚未准备好，直接提示并返回，避免重复加载脚本
            if (moduleName === 'specialOffers' && !window.FlashSaleCountdown) {
                console.warn('FlashSaleCountdown 未定义，等待脚本加载完成');
                return;
            }
            if (moduleName === 'home' && window.HomePage) {
                console.log(`Initializing HomePage for ${moduleName}`);
                moduleInstance = new window.HomePage();
            } else if (moduleName === 'specialOffers' && window.FlashSaleCountdown) {
                console.log(`Initializing FlashSaleCountdown for ${moduleName}`);
                moduleInstance = new window.FlashSaleCountdown();
            } else if (moduleName === 'freshProduce' && window.FreshProduceModule) {
                console.log(`Initializing FreshProduceModule for ${moduleName}`);
                moduleInstance = new window.FreshProduceModule();
            } else if (moduleName === 'meatPoultry' && window.MeatPoultryModule) {
                console.log(`Initializing MeatPoultryModule for ${moduleName}`);
                moduleInstance = new window.MeatPoultryModule();
            } else if (moduleName === 'seafood' && window.SeafoodModule) {
                console.log(`Initializing SeafoodModule for ${moduleName}`);
                moduleInstance = new window.SeafoodModule();
            } else if (moduleName === 'dairyBakery' && window.DairyBakeryModule) {
                console.log(`Initializing DairyBakeryModule for ${moduleName}`);
                moduleInstance = new window.DairyBakeryModule();
            } else if (moduleName === 'beanProducts' && window.BeanProductsModule) {
                console.log(`Initializing BeanProductsModule for ${moduleName}`);
                moduleInstance = new window.BeanProductsModule();
            } else if (moduleName === 'readyMeals' && window.ReadyMealsModule) {
                console.log(`Initializing ReadyMealsModule for ${moduleName}`);
                moduleInstance = new window.ReadyMealsModule();
            } else if (moduleName === 'directSourcing' && window.DirectSourcingModule) {
                console.log(`Initializing DirectSourcingModule for ${moduleName}`);
                moduleInstance = new window.DirectSourcingModule();
            } else if (moduleName === 'afterSales' && window.AfterSalesModule) {
                console.log(`Initializing AfterSalesModule for ${moduleName}`);
                moduleInstance = new window.AfterSalesModule();
            } else {
                console.warn(`Module ${moduleName} not found or not initialized:`, {
                    moduleName: moduleName,
                    availableModules: {
                        HomePage: typeof window.HomePage,
                        FlashSaleCountdown: typeof window.FlashSaleCountdown,
                        FreshProduceModule: typeof window.FreshProduceModule,
                        MeatPoultryModule: typeof window.MeatPoultryModule,
                        SeafoodModule: typeof window.SeafoodModule,
                        DairyBakeryModule: typeof window.DairyBakeryModule,
                        BeanProductsModule: typeof window.BeanProductsModule,
                        ReadyMealsModule: typeof window.ReadyMealsModule,
                        DirectSourcingModule: typeof window.DirectSourcingModule,
                        AfterSalesModule: typeof window.AfterSalesModule
                    }
                });
            }
            
            // 存储模块实例到modules对象
            if (moduleInstance) {
                this.modules[moduleName].instance = moduleInstance;
                console.log(`[ModuleManager] 已存储${moduleName}模块实例`);
            }
            
            // 只有成功初始化后才标记为已加载
            this.modules[moduleName].loaded = true;
        } catch (error) {
            console.error(`Error initializing ${moduleName} module:`, error);
            // 如果初始化失败，不标记为已加载，以便下次可以重试
            this.modules[moduleName].loaded = false;
            // 清空容器内容，防止显示错误内容
            if (this.modules[moduleName].element) {
                this.modules[moduleName].element.innerHTML = '<div class="error-message">模块加载失败，请刷新页面重试</div>';
            }
        }
    }
    
    updateNavigationActiveState(activeModule) {
        // 移除所有激活状态
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // 为当前模块添加激活状态
        const activeLink = document.querySelector(`.nav-link[data-module="${activeModule}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }
    
    // 全局数据刷新功能
    async refreshAllData() {
        console.log('=== 开始刷新所有商品数据 ===');
        
        // 遍历所有已加载的模块，调用其refreshData方法（如果存在）
        for (const [moduleName, module] of Object.entries(this.modules)) {
            if (module.loaded) {
                console.log(`刷新${moduleName}模块数据...`);
                
                try {
                    // 获取当前模块的DOM元素
                    const elementId = this.moduleConfig[moduleName];
                    const container = document.getElementById(elementId);
                    
                    if (container) {
                        // 为容器添加刷新动画
                        container.style.opacity = '0.6';
                        container.style.transition = 'opacity 0.3s ease';
                        
                        // 根据模块类型执行不同的刷新逻辑
                        if (moduleName === 'home') {
                            // 首页模块需要重新初始化
                            if (window.homePage) {
                                await window.homePage.refreshProducts();
                            }
                        } else if (moduleName === 'specialOffers') {
                            // 特价商品模块
                            console.log(`[ModuleManager] 刷新specialOffers模块数据`);
                            // 优先使用存储的实例调用refreshData方法
                            if (module.instance && module.instance.refreshData) {
                                console.log(`[ModuleManager] 调用${moduleName}模块的refreshData方法`);
                                await module.instance.refreshData();
                            } else {
                                // 如果没有实例或refreshData方法，重新初始化模块
                                console.log(`[ModuleManager] 重新初始化${moduleName}模块`);
                                container.innerHTML = '';
                                this.loadModule(moduleName);
                            }
                        } else if (moduleName === 'freshProduce') {
                            // 新鲜果蔬模块
                            await this.refreshFreshProduceData();
                        } else if (moduleName === 'meatPoultry') {
                            // 肉禽蛋品模块
                            await this.refreshMeatPoultryData();
                        } else if (moduleName === 'seafood') {
                            // 水产海鲜模块
                            await this.refreshSeafoodData();
                        } else if (moduleName === 'dairyBakery') {
                            // 乳品面点模块
                            await this.refreshDairyBakeryData();
                        } else if (moduleName === 'beanProducts') {
                            // 豆制品模块
                            await this.refreshBeanProductsData();
                        } else if (moduleName === 'readyMeals') {
                            // 速食净菜模块
                            await this.refreshReadyMealsData();
                        } else {
                            // 通用模块刷新逻辑：调用模块的refreshData方法（如果存在）
                            if (module.instance && module.instance.refreshData) {
                                console.log(`[ModuleManager] 调用${moduleName}模块的refreshData方法`);
                                await module.instance.refreshData();
                            }
                        }
                        
                        // 恢复容器透明度
                        container.style.opacity = '1';
                    }
                } catch (error) {
                    console.error(`刷新${moduleName}模块数据失败:`, error);
                }
            }
        }
        
        console.log('=== 所有商品数据刷新完成 ===');
    }
    
    // 刷新新鲜果蔬模块数据
    async refreshFreshProduceData() {
        // 重新初始化新鲜果蔬模块
        const container = document.getElementById('fresh-produce');
        if (container) {
            // 清空容器内容，确保重新初始化
            container.innerHTML = '';
            // 直接调用模块的init方法，确保异步操作完成
            if (window.FreshProduceModule) {
                const module = new window.FreshProduceModule();
                // 如果init方法是async的，等待其执行完成
                if (module.init && module.init.constructor.name === 'AsyncFunction') {
                    await module.init();
                }
            }
        }
    }
    
    // 刷新肉禽蛋品模块数据
    async refreshMeatPoultryData() {
        // 重新初始化肉禽蛋品模块
        const container = document.getElementById('meat-poultry');
        if (container) {
            container.innerHTML = '';
            if (window.MeatPoultryModule) {
                const module = new window.MeatPoultryModule();
                if (module.init && module.init.constructor.name === 'AsyncFunction') {
                    await module.init();
                }
            }
        }
    }
    
    // 刷新水产海鲜模块数据
    async refreshSeafoodData() {
        // 重新初始化水产海鲜模块
        const container = document.getElementById('seafood');
        if (container) {
            container.innerHTML = '';
            if (window.SeafoodModule) {
                const module = new window.SeafoodModule();
                if (module.init && module.init.constructor.name === 'AsyncFunction') {
                    await module.init();
                }
            }
        }
    }
    
    // 刷新乳品面点模块数据
    async refreshDairyBakeryData() {
        // 重新初始化乳品面点模块
        const container = document.getElementById('dairy-bakery');
        if (container) {
            // 清空容器内容，确保重新初始化
            container.innerHTML = '';
            // 直接调用模块的init方法，确保异步操作完成
            if (window.DairyBakeryModule) {
                const module = new window.DairyBakeryModule();
                // 如果init方法是async的，等待其执行完成
                if (module.init && module.init.constructor.name === 'AsyncFunction') {
                    await module.init();
                }
            }
        }
    }
    
    // 刷新豆制品模块数据
    async refreshBeanProductsData() {
        // 重新初始化豆制品模块
        const container = document.getElementById('bean-products');
        if (container) {
            // 清空容器内容，确保重新初始化
            container.innerHTML = '';
            // 直接调用模块的init方法，确保异步操作完成
            if (window.BeanProductsModule) {
                const module = new window.BeanProductsModule();
                // 如果init方法是async的，等待其执行完成
                if (module.init && module.init.constructor.name === 'AsyncFunction') {
                    await module.init();
                }
            }
        }
    }
    
    // 刷新速食净菜模块数据
    async refreshReadyMealsData() {
        // 重新初始化速食净菜模块
        const container = document.getElementById('ready-meals');
        if (container) {
            container.innerHTML = '';
            if (window.ReadyMealsModule) {
                const module = new window.ReadyMealsModule();
                if (module.init && module.init.constructor.name === 'AsyncFunction') {
                    await module.init();
                }
            }
        }
    }
    
    // 刷新今日特价模块数据
    async refreshSpecialOffersData() {
        // 重新初始化今日特价模块
        const container = document.getElementById('special-offers');
        if (container) {
            container.innerHTML = '';
            if (window.FlashSaleCountdown) {
                const module = new window.FlashSaleCountdown();
            }
        }
    }
}

// 页面加载动画
class PageLoader {
    constructor() {
        this.init();
    }
    
    init() {
        // 页面加载完成后隐藏加载动画
        window.addEventListener('load', () => {
            this.hideLoader();
        });
        
        // 如果页面已经加载完成，直接隐藏加载动画
        if (document.readyState === 'complete') {
            this.hideLoader();
        }
    }
    
    hideLoader() {
        const loader = document.getElementById('page-loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 300);
        }
    }
}

// 响应式导航菜单
class ResponsiveNavbar {
    constructor() {
        this.init();
    }
    
    init() {
        // 添加移动端菜单切换按钮
        const navContainer = document.querySelector('.nav-container');
        const menuToggle = document.createElement('div');
        menuToggle.className = 'menu-toggle';
        menuToggle.innerHTML = '☰';
        navContainer.appendChild(menuToggle);
        
        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .menu-toggle {
                display: none;
                font-size: 24px;
                cursor: pointer;
                color: #333;
            }
            
            @media (max-width: 768px) {
                .menu-toggle {
                    display: block;
                }
                
                .nav-menu {
                    position: fixed;
                    top: 70px;
                    left: -100%;
                    width: 100%;
                    height: calc(100vh - 70px);
                    background: white;
                    flex-direction: column;
                    align-items: center;
                    padding: 20px;
                    transition: left 0.3s ease;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                
                .nav-menu.active {
                    left: 0;
                }
                
                .nav-item {
                    margin: 10px 0;
                }
            }
        `;
        document.head.appendChild(style);
        
        // 绑定菜单切换事件
        menuToggle.addEventListener('click', () => {
            const navMenu = document.querySelector('.nav-menu');
            navMenu.classList.toggle('active');
        });
    }
}

// 购物车功能
class ShoppingCart {
    constructor() {
        this.items = [];
        this.init();
        // 初始化时更新购物车数量
        this.updateCartCount();
    }
    
    init() {
        // 绑定加入购物车事件
        document.addEventListener('click', (e) => {
            // 添加按钮波纹效果
            if (e.target.tagName === 'BUTTON' || e.target.classList.contains('add-to-cart-btn')) {
                ModuleManager.prototype.createRippleEffect.call({createRippleEffect: ModuleManager.prototype.createRippleEffect}, e);
            }
            
            if (e.target.classList.contains('add-to-cart-btn')) {
                this.addToCart(e.target);
            }
        });
        
        // 绑定购物车图标点击事件
        document.querySelector('.cart-icon').addEventListener('click', () => {
            this.showCart();
        });
    }
    
    addToCart(button) {
        // 获取商品信息
        const card = button.closest('.produce-card, .meat-card, .seafood-card, .dairy-card, .bean-product-card, .grain-product-card, .meal-card, .product-card');
        if (!card) return;
        
        const name = card.querySelector('h3, h4').textContent;
        const priceElement = card.querySelector('.price, .discount-price');
        const price = priceElement ? parseFloat(priceElement.textContent.replace('¥', '')) : 0;
        
        // 添加到购物车
        this.addItem({
            name: name,
            price: price
        }, button);
    }
    
    // 添加到购物车 - 直接通过商品对象（供其他模块调用）
    addItem(product, button = null) {
        // 检查商品是否已存在于购物车
        const existingItem = this.items.find(item => item.name === product.name);
        
        if (existingItem) {
            // 增加数量
            existingItem.quantity += 1;
        } else {
            // 新增商品
            this.items.push({
                id: Date.now(),
                name: product.name,
                price: product.price,
                quantity: 1
            });
        }
        
        // 更新购物车数量显示
        this.updateCartCount();
        
        // 显示反馈
        if (button) {
            this.showAddFeedback(button);
        } else {
            // 如果没有按钮，显示默认通知
            this.showCartNotification(product.name);
        }
    }
    
    // 使用JavaScript实现购物车反馈动画（从按钮飞到购物车图标）
    showAddFeedback(button) {
        const feedback = document.createElement('div');
        feedback.textContent = '+1';
        const buttonRect = button.getBoundingClientRect();
        const startX = buttonRect.left + buttonRect.width / 2;
        const startY = buttonRect.top + buttonRect.height / 2;
        
        feedback.style.cssText = `
            position: fixed;
            background: #4CAF50;
            color: white;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            z-index: 1000;
            pointer-events: none;
            left: ${startX}px;
            top: ${startY}px;
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
        `;
        
        document.body.appendChild(feedback);
        
        // 执行飞行动画
        const cartIcon = document.querySelector('.cart-icon');
        if (!cartIcon) {
            setTimeout(() => feedback.remove(), 1000);
            return;
        }
        const cartRect = cartIcon.getBoundingClientRect();
        const endX = cartRect.left + cartRect.width / 2;
        const endY = cartRect.top + cartRect.height / 2;
        
        let startTime = null;
        const duration = 1000;
        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const easeProgress = progress < 0.5 
                ? 2 * progress * progress 
                : 1 - Math.pow(-2 * progress + 2, 2) / 2; // ease-in-out
            
            const x = startX + (endX - startX) * easeProgress;
            const y = startY + (endY - startY) * easeProgress;
            const scale = 1 - (0.9 * progress);
            const opacity = 1 - progress;
            
            feedback.style.left = x + 'px';
            feedback.style.top = y + 'px';
            feedback.style.transform = `translate(-50%, -50%) scale(${scale})`;
            feedback.style.opacity = opacity;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
            feedback.remove();
            }
        };
        requestAnimationFrame(animate);
    }
    
    // 显示购物车通知
    showCartNotification(productName) {
        // 创建加入购物车的通知
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.textContent = `${productName} 已加入购物车！`;
        
        // 添加样式
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            opacity: 0;
            transform: translateY(-20px);
            transition: all 0.3s ease;
            font-weight: bold;
        `;
        
        // 添加到页面
        document.body.appendChild(notification);
        
        // 显示动画
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 10);
        
        // 3秒后移除
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    showCart() {
        if (this.items.length === 0) {
            alert('购物车为空');
            return;
        }

        // 创建购物车弹窗
        const cartWindow = document.createElement('div');
        cartWindow.className = 'cart-window';
        cartWindow.innerHTML = `
            <div class="cart-overlay">
                <div class="cart-modal">
                    <div class="cart-header">
                        <h3>购物车</h3>
                        <button class="close-cart">&times;</button>
                    </div>
                    <div class="cart-items">
                        ${this.items.map(item => `
                            <div class="cart-item" data-id="${item.id}">
                                <span class="item-name">${item.name}</span>
                                <span class="item-price">¥${item.price.toFixed(2)}</span>
                                <div class="item-controls">
                                    <button class="decrease-quantity">-</button>
                                    <span class="quantity">${item.quantity}</span>
                                    <button class="increase-quantity">+</button>
                                </div>
                                <button class="remove-item">删除</button>
                            </div>
                        `).join('')}
                    </div>
                    <div class="cart-footer">
                        <div class="total">总计: ¥${this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</div>
                        <button class="checkout-btn">结算</button>
                    </div>
                </div>
            </div>
        `;

        // 添加样式
        if (!document.getElementById('cart-styles')) {
            const cartStyles = document.createElement('style');
            cartStyles.id = 'cart-styles';
            cartStyles.textContent = `
                .cart-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.6);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 10000;
                }
                
                .cart-modal {
                    background: white;
                    border-radius: 15px;
                    width: 90%;
                    max-width: 550px;
                    max-height: 85vh;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
                }
                
                .cart-header {
                    padding: 20px 25px;
                    border-bottom: 1px solid #f0f0f0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: linear-gradient(135deg, #fff8f5 0%, #fff5f0 100%);
                }
                
                .cart-header h3 {
                    margin: 0;
                    color: #FF5722;
                    font-size: 22px;
                    font-weight: bold;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .close-cart {
                    background: #f5f5f5;
                    border: none;
                    font-size: 28px;
                    cursor: pointer;
                    color: #666;
                    width: 35px;
                    height: 35px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                }
                
                .close-cart:hover {
                    background: #e0e0e0;
                    color: #FF5722;
                    transform: rotate(90deg);
                }
                
                .cart-items {
                    flex: 1;
                    overflow-y: auto;
                    padding: 15px 25px;
                    background: #fafafa;
                }
                
                .cart-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 15px;
                    margin-bottom: 15px;
                    border-bottom: 1px solid #eee;
                    background: white;
                    border-radius: 10px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
                    transition: all 0.3s ease;
                }
                
                .cart-item:hover {
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                    transform: translateY(-2px);
                }
                
                .item-name {
                    flex: 2;
                    font-weight: bold;
                    color: #333;
                }
                
                .item-price {
                    flex: 1;
                    text-align: right;
                    color: #FF5722;
                    font-weight: bold;
                }
                
                .item-controls {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    justify-content: center;
                }
                
                .item-controls button {
                    background: linear-gradient(45deg, #FF9800, #FF5722);
                    color: white;
                    border: none;
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    transition: all 0.3s ease;
                    box-shadow: 0 2px 8px rgba(255, 152, 0, 0.3);
                }
                
                .item-controls button:hover {
                    transform: scale(1.1);
                    box-shadow: 0 4px 12px rgba(255, 152, 0, 0.4);
                }
                
                .item-controls .quantity {
                    font-weight: bold;
                    color: #333;
                }
                
                .remove-item {
                    background: linear-gradient(45deg, #f44336, #e53935);
                    color: white;
                    border: none;
                    padding: 8px 15px;
                    border-radius: 20px;
                    cursor: pointer;
                    font-size: 13px;
                    font-weight: bold;
                    transition: all 0.3s ease;
                    box-shadow: 0 2px 8px rgba(244, 67, 54, 0.3);
                }
                
                .remove-item:hover {
                    transform: scale(1.05);
                    box-shadow: 0 4px 12px rgba(244, 67, 54, 0.4);
                }
                
                .cart-footer {
                    padding: 20px 25px;
                    border-top: 1px solid #f0f0f0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: linear-gradient(135deg, #fff8f5 0%, #fff5f0 100%);
                }
                
                .total {
                    font-size: 20px;
                    font-weight: bold;
                    color: #333;
                }
                
                .total span {
                    color: #FF5722;
                    margin-left: 10px;
                }
                
                .checkout-btn {
                    background: linear-gradient(45deg, #4CAF50, #8BC34A);
                    color: white;
                    border: none;
                    padding: 12px 25px;
                    border-radius: 30px;
                    cursor: pointer;
                    font-weight: bold;
                    font-size: 16px;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
                }
                
                .checkout-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
                    background: linear-gradient(45deg, #43A047, #7CB342);
                }
            `;
            document.head.appendChild(cartStyles);
        }

        // 添加到页面
        document.body.appendChild(cartWindow);
        
        // 使用JavaScript实现购物车弹窗淡入和滑入动画
        const overlay = cartWindow.querySelector('.cart-overlay');
        const modal = cartWindow.querySelector('.cart-modal');
        
        if (overlay && modal) {
            // 初始状态
            overlay.style.opacity = '0';
            modal.style.opacity = '0';
            modal.style.transform = 'translateY(30px)';
            
            // 淡入动画
            requestAnimationFrame(() => {
                overlay.style.transition = 'opacity 0.3s ease';
                overlay.style.opacity = '1';
                
                modal.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                modal.style.opacity = '1';
                modal.style.transform = 'translateY(0)';
            });
        }

        // 绑定关闭事件
        const closeBtn = cartWindow.querySelector('.close-cart');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                // 使用JavaScript实现淡出动画
                if (overlay && modal) {
                    overlay.style.transition = 'opacity 0.3s ease';
                    overlay.style.opacity = '0';
                    modal.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                    modal.style.opacity = '0';
                    modal.style.transform = 'translateY(30px)';
                    setTimeout(() => {
            cartWindow.remove();
                    }, 300);
                }
        });
        }

        // 绑定删除事件
        cartWindow.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', (e) => {
                const itemId = parseInt(e.target.closest('.cart-item').dataset.id);
                this.removeItem(itemId);
                // 重新显示购物车
                cartWindow.remove();
                this.showCart();
            });
        });

        // 绑定增加数量事件
        cartWindow.querySelectorAll('.increase-quantity').forEach(button => {
            button.addEventListener('click', (e) => {
                const itemId = parseInt(e.target.closest('.cart-item').dataset.id);
                this.updateQuantity(itemId, 1);
                // 重新显示购物车
                cartWindow.remove();
                this.showCart();
            });
        });

        // 绑定减少数量事件
        cartWindow.querySelectorAll('.decrease-quantity').forEach(button => {
            button.addEventListener('click', (e) => {
                const itemId = parseInt(e.target.closest('.cart-item').dataset.id);
                this.updateQuantity(itemId, -1);
                // 重新显示购物车
                cartWindow.remove();
                this.showCart();
            });
        });
    }

    // 更新购物车数量显示
    updateCartCount() {
        const cartCountElement = document.getElementById('cart-count');
        if (cartCountElement) {
            // 计算总商品数量（考虑每个商品的数量）
            const totalCount = this.items.reduce((sum, item) => sum + item.quantity, 0);
            cartCountElement.textContent = totalCount.toString();
            
            // 添加数量变化动画
            cartCountElement.classList.add('update');
            
            // 动画结束后移除类名
            setTimeout(() => {
                cartCountElement.classList.remove('update');
            }, 300);
        }
    }
    
    // 删除商品
    removeItem(id) {
        this.items = this.items.filter(item => item.id !== id);
        // 更新购物车数量显示
        this.updateCartCount();
    }

    // 更新商品数量
    updateQuantity(id, change) {
        const item = this.items.find(item => item.id === id);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                this.removeItem(id);
            } else {
                // 更新购物车数量显示
                this.updateCartCount();
            }
        }
    }
}

// 通用按钮波纹效果
document.addEventListener('click', function(e) {
    // 检查点击的元素是否是按钮，但排除轮播按钮
    if (e.target.tagName === 'BUTTON' || 
        e.target.classList.contains('btn') || 
        e.target.classList.contains('add-to-cart-btn') ||
        e.target.classList.contains('upload-btn') ||
        e.target.classList.contains('stepper-btn') ||
        e.target.classList.contains('category-btn') ||
        e.target.classList.contains('confirm-weight') ||
        e.target.classList.contains('weigh-btn') ||
        e.target.classList.contains('view-products-btn') ||
        e.target.classList.contains('back-to-map') ||
        e.target.classList.contains('join-group-btn') ||
        e.target.classList.contains('submit-appeal')) {
        
        // 创建波纹效果
        ModuleManager.prototype.createRippleEffect.call({createRippleEffect: ModuleManager.prototype.createRippleEffect}, e);
    }
});

// 用户认证管理
class UserAuth {
    constructor() {
        this.user = null;
        this.init();
    }

    init() {
        // 检查本地存储中的用户信息
        this.checkUserStatus();

        // 使用事件委托，将事件绑定到document上，确保即使元素动态创建也能触发
        document.addEventListener('click', (e) => {
            // 检查点击的元素是否是退出链接
            if (e.target.id === 'logout-link') {
                e.preventDefault();
                this.logout();
            }
            
            // 检查点击的元素是否是修改昵称链接
            if (e.target.id === 'edit-nickname') {
                e.preventDefault();
                this.editNickname();
            }
            
            // 检查点击的元素是否是修改密码链接
            if (e.target.id === 'change-password') {
                e.preventDefault();
                this.changePassword();
            }
        });
    }

    checkUserStatus() {
        // 检查是否有存储的用户信息
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            this.user = JSON.parse(storedUser);
            this.updateUIForLoggedInUser();
        } else {
            this.updateUIForLoggedOutUser();
        }
    }

    updateUIForLoggedInUser() {
        // 隐藏个人中心链接，显示任务中心
        const personalCenter = document.getElementById('personal-center');
        if (personalCenter) {
            personalCenter.style.display = 'none';
        }
        document.getElementById('task-center').style.display = 'block';

        // 显示用户信息
        const userInfo = document.getElementById('user-info');
        if (userInfo && this.user) {
            userInfo.textContent = this.user.username || '用户';
            userInfo.style.display = 'block';
        }
    }

    updateUIForLoggedOutUser() {
        // 显示个人中心链接，隐藏任务中心
        const personalCenter = document.getElementById('personal-center');
        if (personalCenter) {
            personalCenter.style.display = 'block';
        }
        document.getElementById('task-center').style.display = 'none';

        // 清空用户信息显示
        const userInfo = document.getElementById('user-info');
        if (userInfo) {
            userInfo.textContent = '';
            userInfo.style.display = 'none';
        }
    }

    logout() {
        // 清除用户信息
        localStorage.removeItem('user');
        this.user = null;

        // 更新UI
        this.updateUIForLoggedOutUser();

        // 跳转到登录页面
        window.location.href = 'login.html';
    }

    editNickname() {
        if (!this.user) return;

        const newNickname = prompt('请输入新的昵称:', this.user.username);
        if (newNickname !== null && newNickname.trim() !== '') {
            this.user.username = newNickname.trim();
            localStorage.setItem('user', JSON.stringify(this.user));
            alert('昵称修改成功!');
        }
    }

    changePassword() {
        if (!this.user) return;

        const oldPassword = prompt('请输入原密码:');
        if (oldPassword === null) return;

        // 这里简化处理，实际应该有更复杂的验证
        if (oldPassword !== this.user.password) {
            alert('原密码错误!');
            return;
        }

        const newPassword = prompt('请输入新密码:');
        if (newPassword === null || newPassword.trim() === '') {
            alert('密码不能为空!');
            return;
        }

        const confirmNewPassword = prompt('请再次输入新密码:');
        if (confirmNewPassword !== newPassword) {
            alert('两次输入的新密码不一致!');
            return;
        }

        // 更新密码
        this.user.password = newPassword;
        localStorage.setItem('user', JSON.stringify(this.user));
        alert('密码修改成功!');
    }
}

// 全局初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化模块管理器
    window.moduleManager = new ModuleManager();
    
    // 初始化页面加载器
    new PageLoader();
    
    // 初始化响应式导航栏
    new ResponsiveNavbar();
    
    // 初始化购物车并赋值给全局变量
    window.shoppingCart = new ShoppingCart();
    
    // 初始化用户认证
    window.userAuth = new UserAuth();
    
    // 提前加载特价商品模块，确保首页可以看到限时抢购内容
    window.moduleManager.loadModule('specialOffers');
    
    // 添加全局样式 - 移除CSS动画，改为JavaScript实现
    const globalStyle = document.createElement('style');
    globalStyle.textContent = `
        /* 全局动画 - 已移除，由JavaScript实现 */
        
        /* 滚动条样式 */
        ::-webkit-scrollbar {
            width: 8px;
        }
        
        ::-webkit-scrollbar-track {
            background: #f1f1f1;
        }
        
        ::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
            background: #555;
        }
        
        /* 全局折扣标签样式 - 修复折字位置问题 */
        .discount-tag {
            display: inline-block !important;
            vertical-align: middle !important;
        }
    `;
    document.head.appendChild(globalStyle);
    
    // 添加商品数据更新监听
    setupProductUpdateListener();
});

// 设置商品数据更新监听
function setupProductUpdateListener() {
    console.log('设置商品数据更新监听...');
    
    // 使用BroadcastChannel API实现跨页面通信
    if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('product-updates');
        
        // 监听商品更新消息
        channel.onmessage = function(event) {
            console.log('收到商品数据更新通知:', event.data);
            
            // 刷新所有商品数据
            if (window.moduleManager) {
                window.moduleManager.refreshAllData();
                console.log('已触发所有商品数据刷新');
            }
        };
        
        console.log('商品数据更新监听设置成功');
    } 
    // 添加localStorage事件监听作为备选方案
    window.addEventListener('storage', function(event) {
        if (event.key === 'productUpdated') {
            console.log('收到localStorage商品数据更新通知，触发数据刷新');
            
            // 刷新所有商品数据
            if (window.moduleManager) {
                window.moduleManager.refreshAllData();
                console.log('已触发所有商品数据刷新');
            }
        }
    });
    
    // 作为备选方案，每分钟自动刷新一次数据
    setInterval(() => {
        console.log('自动刷新商品数据...');
        if (window.moduleManager) {
            window.moduleManager.refreshAllData();
        }
    }, 60000); // 60秒自动刷新一次
    
    // 添加手动刷新按钮
    addManualRefreshButton();
}

// 添加手动刷新按钮
function addManualRefreshButton() {
    // 检查是否已经添加了刷新按钮
    if (document.getElementById('refresh-products-btn')) {
        return;
    }
    
    // 创建刷新按钮
    const refreshBtn = document.createElement('button');
    refreshBtn.id = 'refresh-products-btn';
    refreshBtn.textContent = '刷新商品数据';
    refreshBtn.style.cssText = `
        position: fixed;
        bottom: 120px;
        right: 20px;
        background: linear-gradient(45deg, #4CAF50, #8BC34A);
        color: white;
        border: none;
        padding: 15px 20px;
        border-radius: 50px;
        cursor: pointer;
        font-size: 16px;
        font-weight: bold;
        box-shadow: 0 6px 25px rgba(76, 175, 80, 0.3);
        z-index: 999;
        transition: all 0.3s ease;
    `;
    
    // 添加悬停效果
    refreshBtn.addEventListener('mouseenter', () => {
        refreshBtn.style.transform = 'scale(1.1)';
        refreshBtn.style.boxShadow = '0 8px 35px rgba(76, 175, 80, 0.4)';
    });
    
    refreshBtn.addEventListener('mouseleave', () => {
        refreshBtn.style.transform = 'scale(1)';
        refreshBtn.style.boxShadow = '0 6px 25px rgba(76, 175, 80, 0.3)';
    });
    
    // 添加点击事件
    refreshBtn.addEventListener('click', () => {
        console.log('用户手动触发商品数据刷新');
        if (window.moduleManager) {
            // 添加刷新动画 - 使用JavaScript实现旋转
            const spinner = document.createElement('span');
            spinner.style.cssText = 'display: inline-block; width: 16px; height: 16px; border: 2px solid white; border-radius: 50%; border-top-color: transparent;';
            spinner.textContent = ' ';
            refreshBtn.innerHTML = '';
            refreshBtn.appendChild(spinner);
            refreshBtn.appendChild(document.createTextNode(' 刷新中...'));
            
            // 使用JavaScript实现旋转动画
            let rotation = 0;
            const spinInterval = setInterval(() => {
                rotation += 10;
                spinner.style.transform = `rotate(${rotation}deg)`;
            }, 16); // 约60fps
            
            // 保存interval ID以便清除
            refreshBtn.dataset.spinInterval = spinInterval;
            
            // 刷新数据
            window.moduleManager.refreshAllData().then(() => {
                // 清除旋转动画
                if (refreshBtn.dataset.spinInterval) {
                    clearInterval(parseInt(refreshBtn.dataset.spinInterval));
                    delete refreshBtn.dataset.spinInterval;
                }
                // 恢复按钮状态
                setTimeout(() => {
                    refreshBtn.innerHTML = '🔄 刷新商品数据';
                }, 500);
            });
        }
    });
    
    // 添加到页面
    document.body.appendChild(refreshBtn);
}