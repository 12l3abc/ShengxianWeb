// 肉禽蛋品模块
// 动态加载CSS文件
function loadCSS(href) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
    return link;
}

// 加载模块CSS文件
loadCSS('../../css/modules/meatPoultry.css');



// 冷鲜/冷冻 Tab 切换特效
class MeatTemperatureTabs {
    constructor() {
        this.currentTab = 'chilled'; // chilled: 冷鲜, frozen: 冷冻
        this.currentProducts = []; // 存储当前加载的商品数据，用于筛选
        this.init();
    }
    
    init() {
        // 创建 Tab 界面
        this.createTabInterface();
        
        // 绑定事件
        this.bindEvents();
        
        // 立即初始化温度相关特效，确保样式正确显示
        // 使用双重 requestAnimationFrame 确保DOM已完全渲染
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                // 确保容器已渲染
                const tabsContainer = document.querySelector('.temperature-tabs');
                if (tabsContainer) {
                    // 1.温度示意条特效
                    this.addTemperatureBar();
                    // 4.温度计指针摆动特效
                    this.addThermometerNeedle();
                    
                    // 确保按钮的active类正确应用
                    document.querySelectorAll('.temp-tab').forEach(btn => {
                        const isActive = btn.getAttribute('data-tab') === this.currentTab;
                        btn.classList.toggle('active', isActive);
                    });
                } else {
                    // 如果容器还没准备好，延迟重试
                    setTimeout(() => {
                        this.addTemperatureBar();
                        this.addThermometerNeedle();
                        document.querySelectorAll('.temp-tab').forEach(btn => {
                            const isActive = btn.getAttribute('data-tab') === this.currentTab;
                            btn.classList.toggle('active', isActive);
                        });
                    }, 100);
                }
            });
        });
        
        // 2.分类标签磁吸特效
        this.bindCategoryMagnet();
        
        // 加载默认数据
        this.loadData(this.currentTab);

        // 3.冷烟雾叠加特效 - 延迟执行，等待商品渲染
        setTimeout(() => {
            this.addColdSmokeOverlay();
        }, 500);
        
        // 5.卡片错峰入场特效 - 延迟执行，等待商品渲染
        setTimeout(() => {
            this.setupCardStaggerReveal();
        }, 500);
        
        // 6.鼠标光晕跟随特效 - 延迟执行，等待商品渲染
        setTimeout(() => {
            this.enableCursorLight();
        }, 500);
        
        // 新增特效 - 延迟执行，确保DOM已加载
        setTimeout(() => {
            if (typeof addMeatFreshnessIndicator === 'function') {
                addMeatFreshnessIndicator();
            }
            if (typeof addCuttingAnimationEffect === 'function') {
                addCuttingAnimationEffect();
            }
            if (typeof addTemperatureGradientFlow === 'function') {
                addTemperatureGradientFlow();
            }
        }, 1000);
    }
    
    createTabInterface() {
        // 默认排序方式
        this.sortOrder = 'default'; // default: 默认, price: 价格, weight: 重量
        
        const container = document.getElementById('meat-poultry');
        container.innerHTML = `
            <div class="module-header">
                <h2>肉禽蛋品</h2>
                <p>精选优质肉禽蛋品，安全放心，营养丰富</p>
            </div>
            <div class="temperature-tabs">
                <button class="temp-tab ${this.currentTab === 'chilled' ? 'active' : ''}" data-tab="chilled">
                    冷鲜肉类
                    <span class="tab-badge">保鲜 0-4°C</span>
                </button>
                <button class="temp-tab ${this.currentTab === 'frozen' ? 'active' : ''}" data-tab="frozen">
                    冷冻肉类
                    <span class="tab-badge">冷冻 -18°C</span>
                </button>
            </div>
            <div class="meat-categories">
                <div class="category-tags">
                    <span class="category-tag active" data-type="all">全部</span>
                    <span class="category-tag" data-type="pork">猪肉</span>
                    <span class="category-tag" data-type="beef">牛肉</span>
                    <span class="category-tag" data-type="chicken">鸡肉</span>
                    <span class="category-tag" data-type="duck">鸭肉</span>
                    <span class="category-tag" data-type="goose">鹅肉</span>
                    <span class="category-tag" data-type="egg">蛋类</span>
                </div>
            </div>
            <div class="sort-options">
                <span>排序:</span>
                <button class="sort-button ${this.sortOrder === 'default' ? 'active' : ''}" data-sort="default">默认排序</button>
                <button class="sort-button ${this.sortOrder === 'price' ? 'active' : ''}" data-sort="price">价格排序</button>
                <button class="sort-button ${this.sortOrder === 'weight' ? 'active' : ''}" data-sort="weight">重量排序</button>
            </div>
            <div class="meat-grid" id="meat-grid">
                <!-- 商品将在此处加载 -->
            </div>
        `;
    }
    
    bindEvents() {
        // Tab 切换事件
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('temp-tab')) {
                const tab = e.target.getAttribute('data-tab');
                this.switchTab(tab);
            }
            
            if (e.target.classList.contains('category-tag')) {
                const type = e.target.getAttribute('data-type');
                this.filterByType(type);
            }
            
            if (e.target.classList.contains('sort-button')) {
                const sort = e.target.getAttribute('data-sort');
                this.changeSortOrder(sort);
            }
        });
    }
    
    switchTab(tab) {
        this.currentTab = tab;
        
        // 更新激活状态
        document.querySelectorAll('.temp-tab').forEach(btn => {
            const isActive = btn.getAttribute('data-tab') === tab;
            btn.classList.toggle('active', isActive);
        });
        
        // 更新温度条和温度计
        const fill = document.querySelector('.temp-progress-fill');
        if (fill) {
            fill.style.width = tab === 'chilled' ? '48%' : '90%';
            fill.style.background = tab === 'chilled'
                ? 'linear-gradient(90deg,#e0f2fe,#bae6fd)'
                : 'linear-gradient(90deg,#bae6fd,#7dd3fc)';
        }
        
        const needle = document.querySelector('.temp-needle');
        if (needle) {
            needle.style.transform = tab === 'chilled' ? 'rotate(-25deg)' : 'rotate(25deg)';
            needle.style.background = tab === 'chilled'
                ? 'rgba(14, 165, 233, 0.15)'
                : 'rgba(14, 165, 233, 0.2)';
        }
        
        // 加载新数据
        this.loadData(tab);
    }
    
    filterByType(type) {
        // 更新激活状态
        document.querySelectorAll('.category-tag').forEach(tag => {
            tag.classList.toggle('active', tag.getAttribute('data-type') === type);
        });
        
        // 应用当前排序+过滤
        this.applyCurrentView(type);
    }

    // 温度示意条：下方渐变填充展示冷鲜/冷冻状态
    addTemperatureBar() {
        const tabs = document.querySelector('.temperature-tabs');
        if (!tabs) return;
        
        // 如果已经存在温度条，先移除
        const existingBar = tabs.querySelector('.temp-progress');
        if (existingBar) {
            existingBar.remove();
        }
        
        const bar = document.createElement('div');
        bar.className = 'temp-progress';
        Object.assign(bar.style, {
            position: 'absolute',
            bottom: '-8px',
            left: '0',
            height: '4px',
            width: '100%',
            background: 'rgba(255,255,255,0.16)',
            borderRadius: '4px',
            overflow: 'hidden'
        });
        const fill = document.createElement('div');
        fill.className = 'temp-progress-fill';
        fill.style.height = '100%';
        fill.style.width = '50%';
        fill.style.transition = 'width 0.35s ease, background 0.35s ease';
        // 默认使用蓝色渐变
        fill.style.background = 'linear-gradient(90deg,#e0f2fe,#bae6fd)';
        bar.appendChild(fill);
        tabs.style.position = 'relative';
        tabs.appendChild(bar);
        const move = (tab) => {
            fill.style.width = tab === 'chilled' ? '48%' : '90%';
            // 两个tab都使用蓝色渐变，但可以有不同的深浅
            fill.style.background = tab === 'chilled'
                ? 'linear-gradient(90deg,#e0f2fe,#bae6fd)'
                : 'linear-gradient(90deg,#bae6fd,#7dd3fc)';
        };
        move(this.currentTab);
        document.addEventListener('click', (e) => {
            const t = e.target.closest('.temp-tab');
            if (t) {
                move(t.getAttribute('data-tab'));
            }
        });
    }

    // 分类标签磁吸放大，增强可点击性
    bindCategoryMagnet() {
        document.addEventListener('mousemove', (e) => {
            document.querySelectorAll('.category-tag').forEach((tag) => {
                const rect = tag.getBoundingClientRect();
                const dx = e.clientX - (rect.left + rect.width / 2);
                const dy = e.clientY - (rect.top + rect.height / 2);
                const dist = Math.sqrt(dx * dx + dy * dy);
                const influence = Math.max(0, 1 - dist / 200);
                const scale = 1 + influence * 0.12;
                tag.style.transform = `scale(${scale})`;
                tag.style.transition = 'transform 0.12s ease';
            });
        });
        document.addEventListener('mouseleave', () => {
            document.querySelectorAll('.category-tag').forEach((tag) => {
                tag.style.transform = 'scale(1)';
            });
        });
    }

    // 冷烟雾叠加：在肉类图片区域添加淡淡的冷雾动画
    addColdSmokeOverlay() {
        const grid = document.getElementById('meat-grid');
        if (!grid) return;
        const attach = () => {
            grid.querySelectorAll('.meat-card .meat-image, .meat-card .product-image, .flash-product-image').forEach((imgWrap) => {
                if (imgWrap.querySelector('.cold-smoke')) return;
                const smoke = document.createElement('div');
                smoke.className = 'cold-smoke';
                Object.assign(smoke.style, {
                    position: 'absolute',
                    inset: '0',
                    background: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.12), transparent 40%), radial-gradient(circle at 80% 60%, rgba(255,255,255,0.1), transparent 45%)',
                    mixBlendMode: 'screen',
                    pointerEvents: 'none',
                    transform: 'translateY(0)',
                    opacity: '0.6'
                });
                imgWrap.style.position = 'relative';
                imgWrap.appendChild(smoke);
                
                // 使用JavaScript实现烟雾浮动动画（上下浮动+透明度变化）
                let startTime = null;
                const animate = (timestamp) => {
                    if (!startTime) startTime = timestamp;
                    const progress = ((timestamp - startTime) % 6000) / 6000;
                    const y = Math.sin(progress * Math.PI * 2) * -6;
                    const opacity = 0.6 + Math.sin(progress * Math.PI * 2) * 0.3;
                    smoke.style.transform = `translateY(${y}px)`;
                    smoke.style.opacity = opacity;
                    requestAnimationFrame(animate);
                };
                requestAnimationFrame(animate);
            });
        };
        // 初始和每次渲染后执行
        attach();
        document.addEventListener('meat:rendered', attach);
    }

    // 温度针：根据当前 tab 显示不同角度，直观区分冷鲜/冷冻
    addThermometerNeedle() {
        const container = document.querySelector('.temperature-tabs');
        if (!container) {
            console.warn('[MeatPoultry] 温度标签容器未找到，延迟重试');
            setTimeout(() => this.addThermometerNeedle(), 100);
            return;
        }
        
        // 如果已经存在温度针，先移除
        const existingNeedle = container.querySelector('.temp-needle');
        if (existingNeedle) {
            existingNeedle.remove();
        }
        const needle = document.createElement('div');
        needle.className = 'temp-needle';
        Object.assign(needle.style, {
            position: 'absolute',
            top: '-18px',
            left: '20px',
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.8)',
            boxShadow: '0 6px 14px rgba(0,0,0,0.15)',
            background: 'rgba(14, 165, 233, 0.15)',
            transformOrigin: '50% 110%',
            transition: 'transform 0.4s ease, background 0.4s ease',
            zIndex: '10'
        });
        const hand = document.createElement('div');
        Object.assign(hand.style, {
            position: 'absolute',
            width: '4px',
            height: '18px',
            background: '#fff',
            top: '6px',
            left: '50%',
            transform: 'translateX(-50%)',
            borderRadius: '4px'
        });
        needle.appendChild(hand);
        container.appendChild(needle);
        const setAngle = (tab) => {
            needle.style.transform = tab === 'chilled' ? 'rotate(-25deg)' : 'rotate(25deg)';
            // 两个tab都使用蓝色，但可以有不同的深浅
            needle.style.background = tab === 'chilled'
                ? 'rgba(14, 165, 233, 0.15)'
                : 'rgba(14, 165, 233, 0.2)';
        };
        setAngle(this.currentTab);
        document.addEventListener('click', (e) => {
            const t = e.target.closest('.temp-tab');
            if (t) setAngle(t.getAttribute('data-tab'));
        });
    }

    // 卡片瀑布入场：列表渲染后分段落下，提升动感
    setupCardStaggerReveal() {
        const grid = document.getElementById('meat-grid');
        if (!grid) return;
        const reveal = () => {
            const cards = grid.querySelectorAll('.meat-card, .product-card');
            cards.forEach((card, idx) => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.transition = 'all 0.45s ease';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, idx * 70);
            });
        };
        reveal();
        document.addEventListener('meat:rendered', reveal);
    }

    // 网格光圈跟随：鼠标移动时出现柔光，增强交互反馈
    enableCursorLight() {
        const grid = document.getElementById('meat-grid');
        if (!grid || grid.querySelector('.grid-light')) return;
        const light = document.createElement('div');
        light.className = 'grid-light';
        Object.assign(light.style, {
            position: 'absolute',
            width: '160px',
            height: '160px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.15), rgba(255,255,255,0))',
            pointerEvents: 'none',
            mixBlendMode: 'screen',
            transform: 'translate(-50%, -50%)',
            transition: 'opacity 0.2s ease',
            opacity: '0'
        });
        grid.style.position = 'relative';
        grid.appendChild(light);
        grid.addEventListener('mousemove', (e) => {
            const rect = grid.getBoundingClientRect();
            light.style.left = `${e.clientX - rect.left}px`;
            light.style.top = `${e.clientY - rect.top}px`;
            light.style.opacity = '1';
        });
        grid.addEventListener('mouseleave', () => {
            light.style.opacity = '0';
        });
    }
    
    async loadData(tab) {
        console.log('[MeatPoultry] 开始loadData方法，tab:', tab);
        
        const container = document.getElementById('meat-poultry');
        console.log('[MeatPoultry] 容器元素:', container);
        
        const grid = document.getElementById('meat-grid');
        console.log('[MeatPoultry] 网格元素:', grid);
        
        if (!grid) {
            console.error('[MeatPoultry] 网格元素未找到');
            return;
        }
        
        grid.innerHTML = '<div class="loading">加载中...</div>';
        
        let products = [];
        
        // 尝试从API获取肉禽蛋品数据
        try {
            // 检查apiClient是否存在
            const apiClient = globalThis.apiClient || window.apiClient;
            if (!apiClient) {
                console.log('[MeatPoultry] apiClient未定义，使用备用数据');
                products = this.generateMeatPoultryFallbackProducts();
            } else if (!apiClient.getProductsByCategory) {
                console.log('[MeatPoultry] apiClient.getProductsByCategory方法不存在，使用备用数据');
                products = this.generateMeatPoultryFallbackProducts();
            } else {
                console.log('[MeatPoultry] 调用apiClient.getProductsByCategory...');
                const response = await apiClient.getProductsByCategory('meatPoultry');
            
            console.log('[MeatPoultry] API响应:', JSON.stringify(response, null, 2));
            
            // 检查数据结构，兼容新旧API格式和各种可能的响应
            // 情况1: 响应是数组，直接作为products
            if (Array.isArray(response)) {
                products = response;
                console.log('[MeatPoultry] 情况1 - 响应是数组，products:', products);
            }
            // 情况2: 响应有success属性，且为true
            else if (response.success === true) {
                console.log('[MeatPoultry] 情况2 - 响应success为true');
                if (response.products) {
                    // 标准API格式：数据直接在products中
                    products = response.products;
                    console.log('[MeatPoultry] 情况2.1 - 标准API格式，products:', products);
                } else if (response.data && response.data.products) {
                    // 嵌套API格式：数据在data.products中
                    products = response.data.products;
                    console.log('[MeatPoultry] 情况2.2 - 嵌套API格式，products:', products);
                } else if (response.data && Array.isArray(response.data)) {
                    // 数据直接在data中（数组格式）
                    products = response.data;
                    console.log('[MeatPoultry] 情况2.3 - data是数组，products:', products);
                } else {
                    console.log('[MeatPoultry] 情况2.4 - 没有找到products数据，response结构:', Object.keys(response));
                    products = [];
                }
            }
            // 情况3: 响应没有success属性，或者success不为true，但可能直接包含数据
            else {
                console.log('[MeatPoultry] 情况3 - 响应没有success属性或success不为true');
                if (response.products) {
                    // 即使success不为true，也尝试获取products
                    products = response.products;
                    console.log('[MeatPoultry] 情况3.1 - products存在，products:', products);
                } else if (response.data && response.data.products) {
                    // 即使success不为true，也尝试获取data.products
                    products = response.data.products;
                    console.log('[MeatPoultry] 情况3.2 - data.products存在，products:', products);
                } else if (response.data && Array.isArray(response.data)) {
                    // 即使success不为true，也尝试获取data数组
                    products = response.data;
                    console.log('[MeatPoultry] 情况3.3 - data是数组，products:', products);
                } else {
                    console.log('[MeatPoultry] 情况3.4 - 无法解析产品数据，响应:', JSON.stringify(response));
                    products = [];
                }
            }
            
            // 最终检查products是否为数组
            if (!Array.isArray(products)) {
                console.error('[MeatPoultry] 解析后products不是数组，类型:', typeof products, '值:', products);
                products = [];
            }
            
            // 筛选出肉禽蛋品分类的商品，确保只显示meatPoultry分类的商品
            products = products.filter(product => product.category === 'meatPoultry');
            console.log('[MeatPoultry] 筛选后meatPoultry分类商品数量:', products.length);
            
            // 如果API返回的数据为空，使用备用数据
            if (products.length === 0) {
                console.log('[MeatPoultry] API返回数据为空，使用备用数据');
                products = this.generateMeatPoultryFallbackProducts();
            }
            }
        } catch (error) {
            console.error('[MeatPoultry] 加载数据出错:', error);
            console.error('[MeatPoultry] 错误堆栈:', error.stack);
            // API调用失败，使用备用数据
            console.log('[MeatPoultry] API调用失败，使用备用数据');
            products = this.generateMeatPoultryFallbackProducts();
        }
        
        // 根据tab参数过滤商品：冷鲜(chilled)或冷冻(frozen)
        const isChilled = tab === 'chilled';
        let filteredProducts = [];
        
        // 简化商品过滤逻辑，确保能正确匹配冷鲜/冷冻商品
        if (isChilled) {
            // 冷鲜商品：匹配temperature为chilled、badge为冷鲜或名称包含新鲜
            filteredProducts = products.filter(product => 
                product.temperature === 'chilled' || 
                product.badge === '冷鲜' ||
                (product.name && product.name.includes('新鲜'))
            );
        } else {
            // 冷冻商品：匹配temperature为frozen、badge为冷冻或名称包含冷冻/冻
            filteredProducts = products.filter(product => 
                product.temperature === 'frozen' || 
                product.badge === '冷冻' ||
                (product.name && (product.name.includes('冷冻') || product.name.includes('冻')))
            );
        }
        
        // 如果过滤后没有数据，直接使用原始列表，避免页面空白
        if (!filteredProducts || filteredProducts.length === 0) {
            console.log('[MeatPoultry] 过滤后无数据，回退到全部肉禽蛋品列表');
            filteredProducts = products;
        }
        
        console.log(`[MeatPoultry] ${isChilled ? '冷鲜' : '冷冻'}商品数量:`, filteredProducts.length);
        
        // 为每个商品添加温度相关属性，保留API返回的真实数据
        const processedProducts = filteredProducts.map((product, index) => {
            console.log(`[MeatPoultry] 处理商品 ${index}:`, product);
            // 使用API返回的真实图片URL，如果没有则使用默认图片
            let imageUrl = product.image || 'src/shengxian.png';
            
            // 处理图片URL，确保格式正确
            if (!imageUrl.startsWith('data:image/') && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
                if (!imageUrl.startsWith('src/')) {
                    imageUrl = 'src/' + imageUrl;
                }
            }
            
            // 检测商品类型，用于分类筛选，优先使用subcategory属性，否则使用名称匹配
            // 兼容不同字段：优先使用子分类标识，其次使用子分类名称
            let productType =
                product.subcategory ||
                product.subcategoryName ||
                product.subcategory_name ||
                product.subcategory_id ||
                product.subcategoryId ||
                'other';
            // 如果是数字ID，尝试映射
            const subId = Number(product.subcategory_id || product.subcategoryId || product.subcategory);
            const idMap = {
                21: 'pork',
                22: 'beef',
                23: 'lamb',
                24: 'chicken',
                25: 'duck',
                26: 'egg'
            };
            if (!productType || productType === 'other') {
                productType = idMap[subId] || 'other';
            } else if (!isNaN(productType) && idMap[Number(productType)]) {
                productType = idMap[Number(productType)];
            }
            // 中文名称兼容
            const zhMap = {
                '猪肉': 'pork',
                '牛肉': 'beef',
                '羊肉': 'lamb',
                '鸡肉': 'chicken',
                '鸭肉': 'duck',
                '鹅肉': 'goose',
                '蛋类': 'egg',
            };
            if (zhMap[productType]) {
                productType = zhMap[productType];
            }
            
            // 如果没有subcategory属性，使用名称匹配
            if (productType === 'other') {
                const name = product.name.toLowerCase();
                if (name.includes('猪') || name.includes('五花肉') || name.includes('里脊肉')) {
                    productType = 'pork';
                } else if (name.includes('牛') || name.includes('牛排') || name.includes('牛腩')) {
                    productType = 'beef';
                } else if (name.includes('羊')) {
                    productType = 'lamb';
                } else if (name.includes('鸡') || name.includes('鸡胸') || name.includes('鸡腿')) {
                    productType = 'chicken';
                } else if (name.includes('鸭')) {
                    productType = 'duck';
                } else if (name.includes('鹅')) {
                    productType = 'goose';
                } else if (name.includes('蛋') || name.includes('鸡蛋') || name.includes('鸭蛋')) {
                    productType = 'egg';
                }
            }
            
            // 判断是否可切片
            const sliceable = ['猪五花肉', '猪里脊肉', '牛里脊', '牛腩肉', '牛排', '鸡胸肉', '鸡腿肉'].includes(product.name);
            
            return {
                ...product,
                // 保留商品的原始ID，不覆盖
                temperature: isChilled ? '0-4°C 冷鲜' : '-18°C 冷冻',
                weight: product.weight || `${(Math.random() * 1000 + 500).toFixed(0)}g`,
                sliceable: sliceable,
                type: productType,
                image: imageUrl
            };
        });
        
        console.log('[MeatPoultry] 最终渲染products数量:', processedProducts.length);
        this.currentProducts = processedProducts; // 存储当前商品数据用于筛选
        // 首屏保持当前分类与排序一致
        const activeType = document.querySelector('.category-tag.active')?.getAttribute('data-type') || 'all';
        this.applyCurrentView(activeType, processedProducts);
    }
    
    renderProducts(products) {
        const grid = document.getElementById('meat-grid');
        
        // 生成商品卡片HTML，将map方法提取到模板字符串外
        const productCardsHtml = products.map(product => {
            // 处理图片路径，支持Base64图片
            const productImage = product.image || 'src/shengxian.png';
            const isBase64 = productImage.startsWith('data:image/');
            // 移除时间戳，避免首屏闪烁；允许浏览器缓存
            const imageSrc = isBase64 ? productImage : productImage;
            
            return `
            <div class="product-card meat-card" data-id="${product.id}">
                <div class="product-image">
                    <img src="${imageSrc}" alt="${product.name}" onerror="this.onerror=null;this.src='src/shengxian.png'" loading="lazy">
                    <div class="temperature-badge">${product.temperature}</div>
                    ${product.sliceable ? '<div class="slice-tag">可切片</div>' : ''}
                </div>
                <div class="product-info">
                    <h4>${product.name}</h4>
                    <p class="product-description">${product.description || '精选优质肉禽蛋品，安全放心，营养丰富'}</p>
                    <div class="product-details">
                        <div class="detail-item">
                            <span class="detail-label">重量:</span>
                            <span class="detail-value">${product.weight || '500g'}</span>
                        </div>
                    </div>
                    <div class="product-meta">
                        <span class="price">¥${product.price.toFixed(2)}</span>
                        <button class="add-to-cart-btn">加入购物车</button>
                    </div>
                </div>
            </div>
        `;}).join('');
        
        grid.innerHTML = productCardsHtml;
        
        // 重新启用动画效果
        this.addCardAnimations();
        
        // 重新应用特效 - 延迟执行，确保DOM已完全渲染
        setTimeout(() => {
            if (typeof addMeatFreshnessIndicator === 'function') {
                addMeatFreshnessIndicator();
            }
            if (typeof addCuttingAnimationEffect === 'function') {
                addCuttingAnimationEffect();
            }
            if (typeof addTemperatureGradientFlow === 'function') {
                addTemperatureGradientFlow();
            }
        }, 300);
    }
    
    filterProducts(type) {
        // 若无商品数据，直接返回
        if (!Array.isArray(this.currentProducts) || this.currentProducts.length === 0) return;

        // 按当前排序方式保持顺序一致
        const sorted = this.getSortedProducts(this.currentProducts);

        // all 直接渲染
        if (type === 'all') {
            this.renderProducts(sorted);
            return;
        }

        // 按 type/category/tags 匹配
        let filtered = sorted.filter(p => {
            const pType = (p.type || '').toLowerCase();
            const pCate = (p.category || '').toLowerCase();
            const tags = (p.tags || []).map(t => String(t).toLowerCase());
            return pType === type || pCate === type || tags.includes(type);
        });

        // 针对蛋类做名称兜底匹配，避免显示全部
        if (filtered.length === 0 && type === 'egg') {
            filtered = sorted.filter(p => /蛋|egg/i.test(p.name || '') || /蛋|egg/i.test(p.subcategoryName || ''));
        }

        // 若仍为空，显示空状态提示
        if (filtered.length === 0) {
            const grid = document.getElementById('meat-grid');
            if (grid) {
                grid.innerHTML = `<div class="empty-tip">暂无该分类商品</div>`;
            }
            return;
        }

        this.renderProducts(filtered);
    }
    
    changeSortOrder(sort) {
        this.sortOrder = sort;
        
        // 更新激活状态
        document.querySelectorAll('.sort-button').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-sort') === sort);
        });
        
        // 应用当前排序+过滤
        const activeType = document.querySelector('.category-tag.active')?.getAttribute('data-type') || 'all';
        this.applyCurrentView(activeType);
    }
    
    sortCurrentData() {
        if (!this.currentProducts || this.currentProducts.length === 0) {
            return;
        }
        
        const sortedProducts = this.getSortedProducts(this.currentProducts);
        // 重新渲染排序后的商品
        this.renderProducts(sortedProducts);
    }

    // 根据当前排序规则返回新的排序数组
    getSortedProducts(products = []) {
        const list = [...products];
        switch (this.sortOrder) {
            case 'price':
                list.sort((a, b) => (a.price || 0) - (b.price || 0));
                break;
            case 'weight':
                list.sort((a, b) => {
                    const weightA = parseInt(a.weight || '0', 10);
                    const weightB = parseInt(b.weight || '0', 10);
                    return weightA - weightB;
                });
                break;
            default:
                break;
        }
        return list;
    }

    // 按当前排序和分类统一渲染，避免首屏与刷新差异
    applyCurrentView(type = 'all', productsOverride = null) {
        const source = Array.isArray(productsOverride) && productsOverride.length > 0
            ? productsOverride
            : this.currentProducts;
        if (!Array.isArray(source) || source.length === 0) return;

        const sorted = this.getSortedProducts(source);
        // all 直接渲染
        if (type === 'all') {
            this.renderProducts(sorted);
            return;
        }

        let filtered = sorted.filter(p => {
            const pType = (p.type || '').toLowerCase();
            const pCate = (p.category || '').toLowerCase();
            const tags = (p.tags || []).map(t => String(t).toLowerCase());
            return pType === type || pCate === type || tags.includes(type);
        });

        if (filtered.length === 0 && type === 'egg') {
            filtered = sorted.filter(p => /蛋|egg/i.test(p.name || '') || /蛋|egg/i.test(p.subcategoryName || ''));
        }

        if (filtered.length === 0) {
            const grid = document.getElementById('meat-grid');
            if (grid) {
                grid.innerHTML = `<div class="empty-tip">暂无该分类商品</div>`;
            }
            return;
        }

        this.renderProducts(filtered);
    }
    
    // 生成肉禽蛋品备用数据
    generateMeatPoultryFallbackProducts() {
        return [
            {
                id: 'meat1',
                name: '新鲜猪五花肉',
                description: '精选优质五花肉，肥瘦相间，肉质鲜嫩',
                price: 35.8,
                image: 'src/shengxian.png',
                category: 'meatPoultry',
                badge: '冷鲜'
            },
            {
                id: 'meat2',
                name: '新鲜猪里脊肉',
                description: '猪身上最嫩的部位，适合炒菜、做肉脯',
                price: 42.5,
                image: 'src/shengxian.png',
                category: 'meatPoultry',
                badge: '冷鲜'
            },
            {
                id: 'meat3',
                name: '冷冻牛里脊肉',
                description: '进口冷冻牛里脊，肉质鲜美，适合煎烤',
                price: 89.9,
                image: 'src/shengxian.png',
                category: 'meatPoultry',
                badge: '冷冻'
            },
            {
                id: 'meat4',
                name: '冷冻牛腩肉',
                description: '优质牛腩，适合炖煮，口感软烂',
                price: 65.8,
                image: 'src/shengxian.png',
                category: 'meatPoultry',
                badge: '冷冻'
            },
            {
                id: 'meat5',
                name: '新鲜鸡胸肉',
                description: '新鲜鸡胸肉，低脂高蛋白，健康之选',
                price: 28.9,
                image: 'src/shengxian.png',
                category: 'meatPoultry',
                badge: '冷鲜'
            },
            {
                id: 'meat6',
                name: '新鲜鸡腿肉',
                description: '新鲜去骨鸡腿肉，肉质鲜嫩，适合各种烹饪方式',
                price: 25.8,
                image: 'src/shengxian.png',
                category: 'meatPoultry',
                badge: '冷鲜'
            },
            {
                id: 'meat7',
                name: '冷冻整鸭',
                description: '整只冷冻鸭子，适合做烤鸭、啤酒鸭',
                price: 59.9,
                image: 'src/shengxian.png',
                category: 'meatPoultry',
                badge: '冷冻'
            },
            {
                id: 'meat8',
                name: '新鲜鸡蛋',
                description: '散养土鸡蛋，蛋黄饱满，营养丰富',
                price: 19.8,
                image: 'src/shengxian.png',
                category: 'meatPoultry',
                badge: '新鲜'
            },
            {
                id: 'meat9',
                name: '冷冻牛排',
                description: '进口冷冻牛排，肉质鲜嫩，适合煎制',
                price: 78.5,
                image: 'src/shengxian.png',
                category: 'meatPoultry',
                badge: '冷冻'
            },
            {
                id: 'meat10',
                name: '新鲜鸭蛋',
                description: '新鲜鸭蛋，适合做咸鸭蛋、皮蛋',
                price: 16.8,
                image: 'src/shengxian.png',
                category: 'meatPoultry',
                badge: '新鲜'
            }
        ];
    }
    
    addCardAnimations() {
        const cards = document.querySelectorAll('.meat-card');
        
        // 添加入场动画
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.5s ease-out';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
            
            // 添加悬停效果
            card.addEventListener('mouseenter', () => {
                card.style.transition = 'all 0.3s ease-out';
                card.style.transform = 'translateY(-5px) scale(1.02)';
                card.style.boxShadow = '0 15px 30px rgba(0,0,0,0.15)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transition = 'all 0.3s ease-out';
                card.style.transform = 'translateY(0) scale(1)';
                card.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
            });
        });
    }
    
    animateCardAppearance(card) {
        card.style.opacity = '0';
        card.style.transform = 'scale(0.9)';
        
        // 强制重排
        card.offsetHeight;
        
        card.style.transition = 'all 0.3s ease-out';
        card.style.opacity = '1';
        card.style.transform = 'scale(1)';
    }
}

// 检疫证书预览特效
class QuarantineCertificatePreview {
    constructor() {
        this.modal = null;
        this.init();
    }
    
    init() {
        // 创建模态框
        this.createModal();
        
        // 绑定事件
        document.addEventListener('click', (e) => {
            if (e.target.closest('.quarantine-cert img')) {
                const imgSrc = e.target.src;
                this.showCertificate(imgSrc);
            }
            
            if (e.target.classList.contains('modal-close') || 
                e.target.classList.contains('certificate-modal')) {
                this.hideCertificate();
            }
        });
    }
    
    createModal() {
        this.modal = document.createElement('div');
        this.modal.className = 'certificate-modal';
        
        this.modal.innerHTML = `
            <div class="modal-content">
                <span class="modal-close">&times;</span>
                <img src="" alt="检疫证书" class="certificate-full">
                <div class="modal-footer">
                    <p>官方检疫证书，请放心购买</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.modal);
    }
    
    showCertificate(imgSrc) {
        const fullImg = this.modal.querySelector('.certificate-full');
        fullImg.src = imgSrc;
        this.modal.style.display = 'flex';
        
        // 使用JavaScript实现缩放淡入动画
        const modalContent = this.modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.opacity = '0';
            modalContent.style.transform = 'scale(0.8)';
            requestAnimationFrame(() => {
                modalContent.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
                modalContent.style.opacity = '1';
                modalContent.style.transform = 'scale(1)';
            });
        }
    }
    
    hideCertificate() {
        this.modal.style.display = 'none';
    }
}

// 按克切片功能特效
class SliceByWeightFeature {
    constructor() {
        this.slicingModal = null;
        this.init();
    }
    
    init() {
        // 创建切片设置模态框
        this.createSlicingModal();
        
        // 绑定事件
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('slice-tag')) {
                const productCard = e.target.closest('.meat-card');
                const productId = productCard.getAttribute('data-id');
                this.showSlicingModal(productId);
            }
            
            if (e.target.classList.contains('modal-close-slice') || 
                e.target.classList.contains('slicing-modal')) {
                this.hideSlicingModal();
            }
            
            if (e.target.classList.contains('confirm-slice')) {
                this.confirmSlicing();
            }
        });
    }
    
    createSlicingModal() {
        this.slicingModal = document.createElement('div');
        this.slicingModal.className = 'slicing-modal';
        
        this.slicingModal.innerHTML = `
            <div class="slicing-content">
                <span class="modal-close-slice">&times;</span>
                <h3>按克切片定制</h3>
                <div class="slicing-form">
                    <div class="form-group">
                        <label>选择重量 (克):</label>
                        <input type="range" min="100" max="2000" step="50" value="500" class="weight-slider">
                        <span class="weight-value">500g</span>
                    </div>
                    <div class="form-group">
                        <label>切割要求:</label>
                        <select class="cut-preference">
                            <option value="thin">薄片</option>
                            <option value="medium" selected>中等厚度</option>
                            <option value="thick">厚片</option>
                            <option value="strips">肉丝</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>预计价格:</label>
                        <span class="estimated-price">¥35.00</span>
                    </div>
                    <button class="confirm-slice">确认加入购物车</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.slicingModal);
        
        // 绑定滑块事件
        this.bindSliderEvent();
    }
    
    bindSliderEvent() {
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('weight-slider')) {
                const value = e.target.value;
                const valueDisplay = this.slicingModal.querySelector('.weight-value');
                valueDisplay.textContent = `${value}g`;
                
                // 更新预计价格（模拟计算）
                const priceDisplay = this.slicingModal.querySelector('.estimated-price');
                const price = (value * 0.07).toFixed(2);
                priceDisplay.textContent = `¥${price}`;
            }
        });
    }
    
    showSlicingModal(productId) {
        this.slicingModal.style.display = 'flex';
        
        // 使用JavaScript实现滑入淡入动画
        const slicingContent = this.slicingModal.querySelector('.slicing-content');
        if (slicingContent) {
            slicingContent.style.opacity = '0';
            slicingContent.style.transform = 'translateY(30px)';
            requestAnimationFrame(() => {
                slicingContent.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
                slicingContent.style.opacity = '1';
                slicingContent.style.transform = 'translateY(0)';
            });
        }
    }
    
    hideSlicingModal() {
        this.slicingModal.style.display = 'none';
    }
    
    confirmSlicing() {
        // 获取设置值
        const weight = this.slicingModal.querySelector('.weight-slider').value;
        const cutPreference = this.slicingModal.querySelector('.cut-preference').value;
        
        // 显示确认消息
        alert(`已添加 ${weight}g ${cutPreference}切片商品到购物车`);
        
        // 关闭模态框
        this.hideSlicingModal();
    }
}

// 肉禽蛋品模块主类 - 供ModuleManager调用
class MeatPoultryModule {
    constructor() {
        console.log('[MeatPoultry] MeatPoultryModule构造函数被调用');
        this.init();
    }
    
    init() {
        console.log('[MeatPoultry] 开始init方法');
        
        // 检查容器元素
        const container = document.getElementById('meat-poultry');
        console.log('[MeatPoultry] 初始化时容器元素:', container);
        
        if (!container) {
            console.error('[MeatPoultry] 初始化失败：容器元素未找到');
            return;
        }
        
        // 调用带有温度标签和分类筛选的完整初始化
        console.log('[MeatPoultry] 初始化MeatTemperatureTabs...');
        new MeatTemperatureTabs();
        
        // 初始化按克切片功能特效
        console.log('[MeatPoultry] 初始化SliceByWeightFeature...');
        new SliceByWeightFeature();
        
        console.log('[MeatPoultry] 初始化完成');
    }
}

// 导出到全局作用域，供ModuleManager使用
window.MeatPoultryModule = MeatPoultryModule;

// 传统初始化方式，兼容直接访问
function initMeatPoultry() {
    const container = document.getElementById('meat-poultry');
    if (container) {
        new MeatPoultryModule();
    }
}

// 移除重复的初始化逻辑，由ModuleManager统一管理
// 避免模块被多次初始化导致的冲突

// 添加温度标签切换事件监听，仅处理样式问题
document.addEventListener('DOMContentLoaded', () => {
    // 监听温度标签切换事件
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('temp-tab')) {
            // 确保肉禽网格有正确的样式
            setTimeout(() => {
                const meatGrid = document.getElementById('meat-grid');
                if (meatGrid) {
                    meatGrid.style.display = 'grid';
                    meatGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(250px, 1fr))';
                    meatGrid.style.gap = '20px';
                    meatGrid.style.marginTop = '20px';
                    meatGrid.style.padding = '0 20px';
                    meatGrid.style.maxWidth = '1200px';
                    meatGrid.style.marginLeft = 'auto';
                    meatGrid.style.marginRight = 'auto';
                }
            }, 50);
        }
    });
});

// 新鲜度指示器特效：显示肉类新鲜度的动态指示器 
function addMeatFreshnessIndicator() { 
    const cards = document.querySelectorAll('.meat-card, .poultry-card'); 
    cards.forEach((card, index) => { 
        // 检查是否已经存在指示器，避免重复添加 
        const imgContainer = card.querySelector('.product-image, .meat-image'); 
        if (!imgContainer) return; 
        
        // 如果已经存在指示器，先移除旧的 
        const existingIndicator = imgContainer.querySelector('.freshness-indicator'); 
        if (existingIndicator) { 
            existingIndicator.remove(); 
        } 
        
        // 创建新鲜度指示器 
        const indicator = document.createElement('div'); 
        indicator.className = 'freshness-indicator'; 
        indicator.style.position = 'absolute'; 
        indicator.style.top = '10px'; 
        indicator.style.left = '10px'; 
        indicator.style.width = '60px'; 
        indicator.style.height = '60px'; 
        indicator.style.borderRadius = '50%'; 
        indicator.style.background = 'radial-gradient(circle, rgba(76,175,80,0.8), rgba(76,175,80,0.3))'; 
        indicator.style.border = '3px solid rgba(76,175,80,0.9)'; 
        indicator.style.zIndex = '10'; 
        indicator.style.display = 'flex'; 
        indicator.style.alignItems = 'center'; 
        indicator.style.justifyContent = 'center'; 
        indicator.style.color = '#fff'; 
        indicator.style.fontSize = '12px'; 
        indicator.style.fontWeight = 'bold'; 
        indicator.textContent = '新鲜'; 
        
        imgContainer.style.position = 'relative'; 
        imgContainer.appendChild(indicator); 
        
        // 新鲜度脉冲动画 
        let startTime = null; 
        const animate = (timestamp) => { 
            if (!startTime) startTime = timestamp; 
            const elapsed = timestamp - startTime; 
            const progress = (elapsed % 2000) / 2000; 
            
            // 呼吸效果 
            const scale = 1 + Math.sin(progress * Math.PI * 2) * 0.1; 
            const opacity = 0.7 + Math.sin(progress * Math.PI * 2) * 0.2; 
            
            indicator.style.transform = `scale(${scale})`; 
            indicator.style.opacity = opacity; 
            
            requestAnimationFrame(animate); 
        }; 
        requestAnimationFrame(animate); 
    }); 
} 

// 切割动画特效：悬停时显示切割线条动画（至少15行） 
function addCuttingAnimationEffect() { 
    const cards = document.querySelectorAll('.meat-card, .poultry-card'); 
    cards.forEach((card) => { 
        const img = card.querySelector('.product-image img, .meat-image img'); 
        if (!img) return; 
        
        const imgContainer = img.parentElement; 
        if (!imgContainer) return; 
        
        // 如果已经存在切割线条容器，先移除旧的 
        const existingCutLines = imgContainer.querySelector('.cutting-lines'); 
        if (existingCutLines) { 
            existingCutLines.remove(); 
        } 
        
        // 创建切割线条容器 
        const cutLines = document.createElement('div'); 
        cutLines.className = 'cutting-lines'; 
        cutLines.style.position = 'absolute'; 
        cutLines.style.top = '0'; 
        cutLines.style.left = '0'; 
        cutLines.style.width = '100%'; 
        cutLines.style.height = '100%'; 
        cutLines.style.pointerEvents = 'none'; 
        cutLines.style.zIndex = '8'; 
        cutLines.style.overflow = 'hidden'; 
        
        imgContainer.style.position = 'relative'; 
        imgContainer.appendChild(cutLines); 
        
        // 创建3条切割线 
        for (let i = 0; i < 3; i++) { 
            const line = document.createElement('div'); 
            line.style.position = 'absolute'; 
            line.style.width = '2px'; 
            line.style.height = '100%'; 
            line.style.background = 'rgba(255,255,255,0.6)'; 
            line.style.left = `${30 + i * 20}%`; 
            line.style.top = '0'; 
            line.style.opacity = '0'; 
            line.style.boxShadow = '0 0 10px rgba(255,255,255,0.8)'; 
            cutLines.appendChild(line); 
            
            // 切割线动画 
            let startTime = null; 
            const delay = i * 300; 
            const animate = (timestamp) => { 
                if (!startTime) startTime = timestamp; 
                const elapsed = timestamp - startTime - delay; 
                if (elapsed < 0) { 
                    requestAnimationFrame(animate); 
                    return; 
                } 
                
                const progress = (elapsed % 2000) / 2000; 
                const opacity = Math.sin(progress * Math.PI) * 0.8; 
                const translateX = Math.sin(progress * Math.PI * 2) * 5; 
                
                line.style.opacity = opacity; 
                line.style.transform = `translateX(${translateX}px)`; 
                
                requestAnimationFrame(animate); 
            }; 
            requestAnimationFrame(animate); 
        } 
    }); 
}
    
    // 温度渐变流动特效：温度条上的渐变流动效果（至少15行）
    function addTemperatureGradientFlow() {
        const container = document.getElementById('meat-poultry');
        if (!container) return;
        
        const tempBars = container.querySelectorAll('.temperature-bar, .temp-indicator');
        tempBars.forEach((bar) => {
            // 创建流动渐变层
            const flowLayer = document.createElement('div');
            flowLayer.style.position = 'absolute';
            flowLayer.style.top = '0';
            flowLayer.style.left = '0';
            flowLayer.style.width = '100%';
            flowLayer.style.height = '100%';
            flowLayer.style.background = 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)';
            flowLayer.style.backgroundSize = '200% 100%';
            flowLayer.style.opacity = '0.5';
            flowLayer.style.pointerEvents = 'none';
            
            const barParent = bar.parentElement;
            barParent.style.position = 'relative';
            barParent.style.overflow = 'hidden';
            barParent.appendChild(flowLayer);
            
            // 渐变流动动画
            let startTime = null;
            const animate = (timestamp) => {
                if (!startTime) startTime = timestamp;
                const elapsed = timestamp - startTime;
                const progress = (elapsed % 3000) / 3000;
                
                // 渐变从左到右流动
                const xPosition = -100 + progress * 200;
                flowLayer.style.backgroundPosition = `${xPosition}% 0`;
                
                // 透明度变化
                const opacity = 0.3 + Math.sin(progress * Math.PI * 2) * 0.2;
                flowLayer.style.opacity = opacity;
                
                requestAnimationFrame(animate);
            };
            requestAnimationFrame(animate);
        });
    }