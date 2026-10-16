// 新鲜果蔬模块

// 动态加载CSS文件
function loadCSS(href) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
    return link;
}

// 加载模块CSS文件
loadCSS('../../css/modules/freshProduce.css');

// 果蔬分类标签特效增强
class ProduceCategoryTabs {
    constructor() {
        this.categories = ['叶菜', '根茎', '瓜果', '菌菇'];
        this.currentCategory = '叶菜';
        this.sortOrder = 'arrival'; // arrival: 到库时间, price: 价格, popularity: 热门度
        this.productCache = new Map(); // 缓存商品数据，避免重复生成随机数据
        this.init();
    }
    
    init() {
        // 创建分类标签界面
        this.createCategoryInterface();
        
        // 绑定事件
        this.bindEvents();
        
        // 加载默认分类数据
        this.loadCategoryData(this.currentCategory);

        // 1.季节光晕特效
        this.addSeasonalGlow();
        // 2.标签水波特效
        this.enableTabRipple();
        // 3.卡片滚动揭示特效
        this.setupGridReveal();
        // 4.斜向条纹流动背景特效
        this.injectMovingStripes();
        // 5.卡片倾斜跟随鼠标特效
        this.enableCardTilt();
        // 6.模块标题弹跳特效
        this.addHeaderBounce();
    }
    
    createCategoryInterface() {
        const container = document.getElementById('fresh-produce');
        container.innerHTML = `
            <div class="module-header">
                <h2>新鲜果蔬</h2>
                <p>每日新鲜采摘，从田间到餐桌的新鲜体验</p>
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
            <div class="product-grid" id="produce-grid">
                <!-- 商品将在此处加载 -->
            </div>
        `;
    }
    
    bindEvents() {
        // 分类标签点击事件
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-button')) {
                const { category } = e.target.dataset;
                this.switchCategory(category);
            }
            
            if (e.target.classList.contains('sort-button')) {
                const { sort } = e.target.dataset;
                this.changeSortOrder(sort);
            }
        });
    }
    
    switchCategory(category) {
        this.currentCategory = category;
        
        // 更新激活状态
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
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
    
    changeSortOrder(sort) {
        this.sortOrder = sort;
        
        // 更新激活状态
        document.querySelectorAll('.sort-button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.sort === sort);
        });
        
        // 添加排序切换动画
        this.addSortSwitchAnimation();
        
        // 重新排序当前数据
        this.sortCurrentData();
    }
    
    // 使用JavaScript实现排序切换动画
    addSortSwitchAnimation() {
        const sortButtons = document.querySelectorAll('.sort-button');
        
        sortButtons.forEach((button) => {
            if (button.classList.contains('active')) {
                // 激活按钮：旋转动画（0deg -> 360deg -> 0deg）
                button.style.transform = 'rotate(0deg)';
                requestAnimationFrame(() => {
                    button.style.transition = 'transform 0.5s ease-out';
                    button.style.transform = 'rotate(360deg)';
                    setTimeout(() => {
                        button.style.transform = 'rotate(0deg)';
                    }, 500);
                });
            }
        });
    }
    
    async loadCategoryData(category) {
        const grid = document.getElementById('produce-grid');
        if (!grid) return;
        
        // 如果正在加载，避免重复加载
        if (grid.dataset.loading === 'true') {
            return;
        }
        
        grid.dataset.loading = 'true';
        grid.innerHTML = '<div class="loading">加载中...</div>';
        
        try {
            // 检查缓存
            const cacheKey = `freshProduce_${category}`;
            if (this.productCache.has(cacheKey)) {
                const cachedProducts = this.productCache.get(cacheKey);
                this.renderProducts(cachedProducts);
                grid.dataset.loading = 'false';
                return;
            }
            
            // 从API获取果蔬商品数据
            const apiClient = globalThis.apiClient || window.apiClient;
            if (!apiClient || !apiClient.getProductsByCategory) {
                console.warn('[FreshProduce] apiClient未定义，使用备用数据');
                grid.dataset.loading = 'false';
                return;
            }
            
            const response = await apiClient.getProductsByCategory('freshProduce');
            if (response.success && response.products) {
                // 为每个商品添加分类相关属性，保留原始ID
                // 使用商品ID作为随机种子，确保同一商品的数据一致
                let products = response.products.map((product) => {
                    // 如果商品已有harvestDate和rating，使用它们；否则生成并缓存
                    if (!product.harvestDate || !product.rating) {
                        // 使用商品ID作为随机种子，确保数据稳定
                        const seed = product.id ? parseInt(product.id.toString().replace(/\D/g, '')) || 0 : 0;
                        const randomOffset = (seed % 3); // 0-2天
                        const productHarvestDate = new Date();
                        productHarvestDate.setDate(productHarvestDate.getDate() - randomOffset);
                        
                        const ratingSeed = (seed % 20); // 0-19
                        const rating = (3 + (ratingSeed / 10)).toFixed(1); // 3.0-4.9
                        
                        product.harvestDate = productHarvestDate.toISOString().split('T')[0];
                        product.rating = rating;
                    }
                    
                    return {
                        ...product,
                        // 保留商品的原始ID，不覆盖
                    };
                });
                
                // 根据分类过滤商品
                if (category && category !== '全部') {
                    products = this.filterProductsByCategory(products, category);
                }
                
                // 缓存数据
                this.productCache.set(cacheKey, products);
                
                this.renderProducts(products);
            } else {
                grid.innerHTML = '<div class="error-message">加载商品数据失败</div>';
            }
        } catch (error) {
            console.error('[FreshProduce] 获取果蔬商品数据失败:', error);
            grid.innerHTML = '<div class="error-message">加载商品数据失败</div>';
        } finally {
            grid.dataset.loading = 'false';
        }
    }
    
    // 根据分类过滤商品
    filterProductsByCategory(products, category) {
        // 分类ID映射（根据数据库中的二级分类ID）
        const categoryIdMap = {
            '叶菜': 11,
            '根茎': 12,
            '瓜果': 13,
            '菌菇': 14
        };
        
        // 分类关键词映射（更全面的关键词列表）
        const categoryKeywords = {
            '叶菜': ['菠菜', '生菜', '油菜', '空心菜', '白菜', '油麦菜', '香菜', '韭菜', '芹菜', '茼蒿', '芥蓝', '娃娃菜', '苋菜', '小白菜', '大白菜', '卷心菜', '包菜', '上海青', '小青菜', '菜心'],
            '根茎': ['土豆', '胡萝卜', '白萝卜', '洋葱', '大蒜', '生姜', '山药', '莲藕', '芋头', '红薯', '紫薯', '马蹄', '地瓜', '大葱', '萝卜', '红萝卜'],
            '瓜果': ['西红柿', '黄瓜', '茄子', '辣椒', '南瓜', '冬瓜', '丝瓜', '苦瓜', '西葫芦', '角瓜', '佛手瓜', '瓠瓜', '豆角', '豇豆', '四季豆', '青椒', '彩椒'],
            '菌菇': ['香菇', '平菇', '金针菇', '杏鲍菇', '口蘑', '茶树菇', '猴头菇', '竹荪', '草菇', '滑子菇', '牛肝菌', '羊肚菌', '蘑菇', '木耳', '银耳']
        };
        
        const categoryId = categoryIdMap[category];
        const keywords = categoryKeywords[category] || [];
        
        console.log(`[FreshProduce] 过滤分类: ${category}, 商品总数: ${products.length}`);
        
        if (!categoryId && keywords.length === 0) {
            return products; // 如果没有分类ID和关键词，返回所有商品
        }
        
        // 根据商品数据匹配分类
        const filtered = products.filter(product => {
            // 优先检查 subcategory_id 字段
            if (categoryId) {
                const subId = product.subcategory_id || product.subcategoryId;
                if (subId === categoryId) {
                    return true;
                }
            }
            
            // 检查 subcategory 或 subcategoryName 字段（支持中文名称直接匹配）
            const subcategory = product.subcategory || product.subcategoryName || product.subcategory_name || '';
            if (subcategory) {
                // 直接匹配中文分类名称
                if (subcategory === category || subcategory.includes(category)) {
                    return true;
                }
                // 也支持小写匹配
                if (subcategory.toLowerCase().includes(category.toLowerCase())) {
                    return true;
                }
            }
            
            // 如果有关键词，检查商品名称或描述中是否包含分类关键词
            if (keywords.length > 0) {
                const name = (product.name || '').toLowerCase();
                const desc = (product.description || '').toLowerCase();
                
                const matched = keywords.some(keyword => {
                    const keywordLower = keyword.toLowerCase();
                    return name.includes(keywordLower) || desc.includes(keywordLower);
                });
                
                if (matched) {
                    return true;
                }
            }
            
            return false;
        });
        
        console.log(`[FreshProduce] 过滤后商品数: ${filtered.length}`);
        return filtered;
    }
    
    // 刷新商品数据
    async refreshData() {
        console.log('刷新果蔬商品数据...');
        await this.loadCategoryData(this.currentCategory);
        console.log('果蔬商品数据刷新完成');
    }
    
    renderProducts(products) {
        const grid = document.getElementById('produce-grid');
        
        // 如果没有商品，显示提示信息
        if (!products || products.length === 0) {
            grid.innerHTML = `<div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 40px; color: #999;">
                <p style="font-size: 16px; margin-bottom: 10px;">暂无${this.currentCategory}类商品</p>
                <p style="font-size: 14px;">请尝试其他分类或稍后再试</p>
            </div>`;
            return;
        }
        
        grid.innerHTML = products.map(product => {
            // 处理图片路径 - 支持Base64图片和普通URL
            let imageSrc = product.image || 'src/shengxian.png';
            
            // 检查是否为Base64图片
            const isBase64 = imageSrc.startsWith('data:image/');
            
            // 如果是普通图片URL，确保路径正确
            if (!isBase64) {
                if (!imageSrc.startsWith('src/') && !imageSrc.startsWith('http://') && !imageSrc.startsWith('https://')) {
                    // 如果是相对路径且不是以src/开头，添加src/前缀
                    imageSrc = 'src/' + imageSrc;
                }
                // 移除时间戳，避免每次渲染时图片重新加载导致闪烁
                // 只在图片路径中已包含时间戳时才保留
            }
            
            return `
            <div class="product-card produce-card" data-id="${product.id}">
                <div class="product-image">
                    <img src="${imageSrc}" alt="${product.name}" onerror="this.onerror=null;this.src='src/shengxian.png'" loading="lazy">
                    <div class="harvest-date-tag">采摘日期: ${product.harvestDate}</div>
                </div>
                <div class="product-info">
                    <h4>${product.name}</h4>
                    <p class="product-description">每日新鲜采购，保证品质</p>
                    <div class="product-meta">
                        <span class="price">¥${product.price}/斤</span>
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

        // 渲染完成后派发事件，供滚动揭示绑定
        requestAnimationFrame(() => {
            const event = new CustomEvent('produce:rendered');
            document.dispatchEvent(event);
        });
    }

    // 模块标题增加季节光晕动画
    addSeasonalGlow() {
        const container = document.getElementById('fresh-produce');
        if (!container) return;
        let halo = container.querySelector('.seasonal-halo');
        if (!halo) {
            halo = document.createElement('div');
            halo.className = 'seasonal-halo';
            Object.assign(halo.style, {
                position: 'absolute',
                inset: '-20px',
                borderRadius: '16px',
                background: 'radial-gradient(circle at 30% 30%, rgba(76,175,80,0.18), transparent 45%), radial-gradient(circle at 70% 60%, rgba(33,150,243,0.16), transparent 50%)',
                zIndex: 0,
                opacity: '0.2',
                transform: 'scale(0.9)'
            });
            container.style.position = 'relative';
            container.prepend(halo);
            
            // 使用JavaScript实现光环脉冲动画（透明度+缩放变化）
            let startTime = null;
            const animate = (timestamp) => {
                if (!startTime) startTime = timestamp;
                const progress = ((timestamp - startTime) % 6000) / 6000;
                const opacity = 0.2 + Math.sin(progress * Math.PI * 2) * 0.3;
                const scale = 0.9 + Math.sin(progress * Math.PI * 2) * 0.1;
                halo.style.opacity = opacity;
                halo.style.transform = `scale(${scale})`;
                requestAnimationFrame(animate);
            };
            requestAnimationFrame(animate);
        }
    }

    // 标签点击水波反馈
    enableTabRipple() {
        const handler = (e) => {
            const btn = e.target.closest('.tab-button, .sort-button');
            if (!btn) return;
            const ripple = document.createElement('span');
            ripple.className = 'tab-ripple';
            const rect = btn.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            Object.assign(ripple.style, {
                position: 'absolute',
                width: `${size}px`,
                height: `${size}px`,
                borderRadius: '50%',
                left: `${e.clientX - rect.left - size / 2}px`,
                top: `${e.clientY - rect.top - size / 2}px`,
                background: 'rgba(76,175,80,0.25)',
                pointerEvents: 'none',
                transform: 'scale(0)',
                transition: 'transform 0.35s ease, opacity 0.55s ease',
                opacity: '0.9'
            });
            btn.style.position = 'relative';
            btn.appendChild(ripple);
            requestAnimationFrame(() => { ripple.style.transform = 'scale(1)'; ripple.style.opacity = '0'; });
            setTimeout(() => ripple.remove(), 600);
        };
        document.addEventListener('click', handler);
    }

    // 商品卡片滚动揭示
    setupGridReveal() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('produce-revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        const attach = () => {
            document.querySelectorAll('#produce-grid .product-card').forEach((card, idx) => {
                card.style.transitionDelay = `${idx * 50}ms`;
                observer.observe(card);
            });
        };

        // 初始绑定及每次渲染后绑定
        requestAnimationFrame(attach);
        document.addEventListener('produce:rendered', attach);
    }

    // 背景流动条纹，增强层次
    injectMovingStripes() {
        const container = document.getElementById('fresh-produce');
        if (!container || container.querySelector('.moving-stripes')) return;
        const stripes = document.createElement('div');
        stripes.className = 'moving-stripes';
        Object.assign(stripes.style, {
            position: 'absolute',
            inset: 0,
            background: 'repeating-linear-gradient(135deg, rgba(76,175,80,0.08) 0, rgba(76,175,80,0.08) 12px, rgba(255,255,255,0) 12px, rgba(255,255,255,0) 24px)',
            backgroundPosition: '0 0',
            pointerEvents: 'none',
            zIndex: 0
        });
        container.style.position = 'relative';
        container.prepend(stripes);
        
        // 使用JavaScript实现条纹移动动画（背景位置循环移动）
        let startTime = null;
        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = ((timestamp - startTime) % 12000) / 12000;
            const x = progress * 140; // 移动140px距离后循环
            stripes.style.backgroundPosition = `${x}px 0`;
            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
        
        // CSS动画已移除，由JavaScript实现
    }

    // 卡片轻微倾斜效果
    enableCardTilt() {
        const grid = document.getElementById('produce-grid');
        if (!grid) return;
        const bind = () => {
            grid.querySelectorAll('.produce-card').forEach((card) => {
                card.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
                card.addEventListener('mousemove', (e) => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const rx = ((y / rect.height) - 0.5) * -5;
                    const ry = ((x / rect.width) - 0.5) * 5;
                    card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
                    card.style.boxShadow = '0 12px 26px rgba(76,175,80,0.18)';
                });
                card.addEventListener('mouseleave', () => {
                    card.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0)';
                    card.style.boxShadow = '';
                });
            });
        };
        bind();
        document.addEventListener('produce:rendered', bind);
    }

    // 标题轻微跳动，吸引视线
    addHeaderBounce() {
        const header = document.querySelector('#fresh-produce .module-header h2');
        if (!header) return;
        header.style.display = 'inline-block';
        // 使用JavaScript实现标题弹跳动画（上下弹跳效果）
        let startTime = null;
        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = ((timestamp - startTime) % 2800) / 2800;
            let y = 0;
            if (progress < 0.3) {
                y = (progress / 0.3) * -6; // 向上移动
            } else if (progress < 0.6) {
                y = -6 + ((progress - 0.3) / 0.3) * 6; // 向下恢复
            }
            header.style.transform = `translateY(${y}px)`;
            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }
    
    sortCurrentData() {
        const grid = document.getElementById('produce-grid');
        const cards = Array.from(grid.querySelectorAll('.produce-card'));
        
        // 根据排序方式重新排列
        cards.sort((a, b) => {
            if (this.sortOrder === 'price') {
                const priceA = Number.parseFloat(a.querySelector('.price').textContent.replace('¥', ''));
                const priceB = Number.parseFloat(b.querySelector('.price').textContent.replace('¥', ''));
                    return priceA - priceB;
            }
            if (this.sortOrder === 'popularity') {
                const ratingA = Number.parseFloat(a.querySelector('.rating').textContent.replace('⭐', ''));
                const ratingB = Number.parseFloat(b.querySelector('.rating').textContent.replace('⭐', ''));
                    return ratingB - ratingA; // 评分高的在前
            }
            return 0; // arrival 默认顺序
        });
        
        // 重新插入元素实现排序
        cards.forEach(card => grid.appendChild(card));
        
        // 添加排序动画
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
        const cards = document.querySelectorAll('.produce-card');
        
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

// 采摘日期高亮特效
class HarvestDateHighlight {
    constructor() {
        this.today = new Date().toISOString().split('T')[0];
        this.init();
    }
    
    init() {
        // 监听DOM变化，为新添加的元素也应用效果
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // 元素节点
                        this.processNode(node);
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // 处理现有元素
        this.processExistingElements();
    }
    
    processExistingElements() {
        const dateTags = document.querySelectorAll('.harvest-date-tag');
        dateTags.forEach(tag => this.highlightFreshDate(tag));
    }
    
    processNode(node) {
        if (node.classList?.contains('harvest-date-tag')) {
            this.highlightFreshDate(node);
        }
        
        // 检查子元素
        const dateTags = node.querySelectorAll?.('.harvest-date-tag');
        dateTags?.forEach(tag => this.highlightFreshDate(tag));
    }
    
    highlightFreshDate(element) {
        const text = element.textContent;
        const dateMatch = text.match(/\d{4}-\d{2}-\d{2}/);
        
        if (dateMatch) {
            const dateStr = dateMatch[0];
            const date = new Date(dateStr);
            const today = new Date(this.today);
            
            // 计算日期差
            const diffTime = Math.abs(today - date);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            // 根据新鲜程度设置CSS类
            element.className = 'harvest-date-tag';
            
            if (diffDays === 0) {
                // 今天采摘，最新鲜
                element.classList.add('today');
                
                // 添加闪烁动画
                element.animate([
                    { opacity: 1 },
                    { opacity: 0.7 },
                    { opacity: 1 }
                ], {
                    duration: 2000,
                    iterations: Infinity
                });
            } else if (diffDays <= 1) {
                // 昨天采摘
                element.classList.add('yesterday');
            } else if (diffDays <= 2) {
                // 前天采摘
                element.classList.add('two-days-ago');
            } else {
                // 更早采摘
                element.classList.add('earlier');
            }
        }
    }
}

// 到库时间排序特效（增强版）
class AdvancedSortingSystem {
    constructor() {
        this.init();
        this.sortHistory = []; // 保存排序历史记录
        this.sortDirection = 'asc'; // 默认升序
        this.lastSortTime = 0; // 最后排序时间，用于防抖动
    }
    
    init() {
        // 监听排序按钮点击事件
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('sort-button') && !e.target.classList.contains('active')) {
                const sortType = e.target.dataset.sort;
                this.recordSortHistory(sortType);
                this.showSortingIndicator();
            } else if (e.target.classList.contains('sort-button') && e.target.classList.contains('active')) {
                // 点击已激活的排序按钮，切换排序方向
                this.toggleSortDirection();
            }
        });
    }
    
    showSortingIndicator() {
        // 清除所有现有指示器
        document.querySelectorAll('.sorting-indicator').forEach(indicator => indicator.remove());
        
        // 在排序按钮旁边显示指示器
        const activeSortButton = document.querySelector('.sort-button.active');
        if (activeSortButton) {
            const indicator = document.createElement('span');
            indicator.className = 'sorting-indicator';
            indicator.textContent = ' ↻';
            activeSortButton.appendChild(indicator);
            
            // 2秒后移除指示器
            setTimeout(() => {
                indicator.remove();
            }, 2000);
        }
    }
    
    toggleSortDirection() {
        // 切换排序方向
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        
        // 更新方向指示器
        this.updateDirectionIndicator();
        
        // 触发重新排序
        this.triggerReSorting();
    }
    
    updateDirectionIndicator() {
        // 清除所有现有方向指示器
        document.querySelectorAll('.sort-direction-indicator').forEach(indicator => indicator.remove());
        
        const activeSortButton = document.querySelector('.sort-button.active');
        if (activeSortButton) {
            const indicator = document.createElement('span');
            indicator.className = 'sort-direction-indicator';
            indicator.textContent = this.sortDirection === 'asc' ? ' ↑' : ' ↓';
            activeSortButton.appendChild(indicator);
        }
    }
    
    triggerReSorting() {
        // 模拟重新排序
        const grid = document.getElementById('produce-grid');
        const cards = Array.from(grid.querySelectorAll('.produce-card'));
        
        // 重新排序
        cards.sort((a, b) => {
            const activeSort = document.querySelector('.sort-button.active')?.dataset.sort;
            if (activeSort === 'price') {
                const valueA = Number.parseFloat(a.querySelector('.price').textContent.replace('¥', '').replace('/斤', ''));
                const valueB = Number.parseFloat(b.querySelector('.price').textContent.replace('¥', '').replace('/斤', ''));
                return this.sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
            }
            if (activeSort === 'popularity') {
                const valueA = Number.parseFloat(a.querySelector('.rating').textContent.replace('⭐', ''));
                const valueB = Number.parseFloat(b.querySelector('.rating').textContent.replace('⭐', ''));
            return this.sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
            }
            return 0;
        });
        
        // 重新插入元素
        cards.forEach(card => grid.appendChild(card));
        
        // 添加动画效果
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
    
    recordSortHistory(sortType) {
        // 记录排序历史
        const timestamp = new Date().toLocaleTimeString();
        this.sortHistory.unshift({ type: sortType, timestamp });
        
        // 限制历史记录长度
        if (this.sortHistory.length > 5) {
            this.sortHistory = this.sortHistory.slice(0, 5);
        }
    }
}

// 新鲜果蔬模块主类 - 供ModuleManager调用
class FreshProduceModule {
    constructor() {
        this.init();
    }
    
    init() {
        // 初始化分类标签
        this.tabs = new ProduceCategoryTabs();
        
        // 初始化采摘日期高亮
        this.harvestHighlight = new HarvestDateHighlight();
        
        // 初始化增强版排序系统
        const sortingSystem = new AdvancedSortingSystem();
        
        // 增强ProduceCategoryTabs类的sortCurrentData方法以支持排序系统
        const originalSortCurrentData = ProduceCategoryTabs.prototype.sortCurrentData;
        ProduceCategoryTabs.prototype.sortCurrentData = function() {
            originalSortCurrentData.call(this);
            sortingSystem.showSortingIndicator();
        };
        
        // 为按钮添加特效
        this.addButtonEffects();
        
        // 添加价格范围筛选功能
        this.addPriceFilter();
    }
    
    // 添加价格范围筛选功能
    addPriceFilter() {
        const freshProduceSection = document.getElementById('fresh-produce');
        if (freshProduceSection) {
            // 先计算商品的最大价格，动态设置拖动条范围
            this.calculatePriceRange().then(({ minPrice, maxPrice }) => {
            const filterSection = document.createElement('div');
            filterSection.className = 'price-filter-section';
            filterSection.innerHTML = `
                <div class="filter-header">
                    <h4>价格筛选</h4>
                        <button class="reset-price-filter" id="reset-price-filter">重置</button>
                </div>
                <div class="price-slider-container">
                    <div class="price-range-labels">
                        <span class="min-price">¥${minPrice.toFixed(2)}</span>
                        <span class="max-price">¥${maxPrice.toFixed(2)}</span>
                    </div>
                    <div class="slider-wrapper" style="position: relative; width: 100%; padding: 10px 0; cursor: pointer;">
                        <input type="range" id="price-slider" min="${minPrice}" max="${maxPrice}" step="0.5" value="${maxPrice}" style="width: 100%; cursor: pointer;">
                    </div>
                    <div class="price-value">
                        <span>最高价格: </span>
                        <span id="price-display">¥${maxPrice.toFixed(2)}</span>
                    </div>
                </div>
            `;
            
            // 将筛选器添加到页面
            const sortOptions = freshProduceSection.querySelector('.sort-options');
            if (sortOptions) {
                sortOptions.after(filterSection);
            }
            
            // 初始化价格筛选功能
                this.initPriceFilter(minPrice, maxPrice);
            }).catch(() => {
                // 如果计算失败，使用默认值
                const filterSection = document.createElement('div');
                filterSection.className = 'price-filter-section';
                filterSection.innerHTML = `
                    <div class="filter-header">
                        <h4>价格筛选</h4>
                        <button class="reset-price-filter" id="reset-price-filter">重置</button>
                    </div>
                    <div class="price-slider-container">
                        <div class="price-range-labels">
                            <span class="min-price">¥0</span>
                            <span class="max-price">¥100</span>
                        </div>
                        <div class="slider-wrapper" style="position: relative; width: 100%; padding: 10px 0; cursor: pointer;">
                            <input type="range" id="price-slider" min="0" max="100" step="0.5" value="100" style="width: 100%; cursor: pointer;">
                        </div>
                        <div class="price-value">
                            <span>最高价格: </span>
                            <span id="price-display">¥100.00</span>
                        </div>
                    </div>
                `;
                
                const sortOptions = freshProduceSection.querySelector('.sort-options');
                if (sortOptions) {
                    sortOptions.after(filterSection);
                }
                
                this.initPriceFilter(0, 100);
            });
        }
    }
    
    // 计算商品价格范围
    async calculatePriceRange() {
        return new Promise((resolve) => {
            // 等待商品渲染完成
            setTimeout(() => {
                const products = document.querySelectorAll('#produce-grid .produce-card');
                let minPrice = Infinity;
                let maxPrice = 0;
                
                products.forEach(product => {
                    const priceElement = product.querySelector('.price');
                    if (priceElement) {
                        const priceText = priceElement.textContent;
                        const price = Number.parseFloat(priceText.replace('¥', '').replace('/斤', '').trim()) || 0;
                        if (price > 0) {
                            minPrice = Math.min(minPrice, price);
                            maxPrice = Math.max(maxPrice, price);
                        }
                    }
                });
                
                // 如果没找到商品，使用默认值
                if (minPrice === Infinity || maxPrice === 0) {
                    resolve({ minPrice: 0, maxPrice: 100 });
                } else {
                    // 向上取整，让范围更友好
                    minPrice = Math.floor(minPrice);
                    maxPrice = Math.ceil(maxPrice * 1.1); // 增加10%的缓冲
                    resolve({ minPrice, maxPrice });
                }
            }, 500);
        });
    }
    
    // 初始化价格筛选功能（至少15行）
    initPriceFilter(minPrice, maxPrice) {
        const priceSlider = document.getElementById('price-slider');
        const priceDisplay = document.getElementById('price-display');
        const resetBtn = document.getElementById('reset-price-filter');
        const sliderWrapper = priceSlider?.parentElement;
        
        if (!priceSlider || !priceDisplay) return;
        
        // 如果已经初始化过，先移除旧的事件监听器
        if (priceSlider._priceFilterInitialized) {
            if (priceSlider._cleanupPriceFilter) {
                priceSlider._cleanupPriceFilter();
            }
        }
        priceSlider._priceFilterInitialized = true;
        
        let isDragging = false;
        let updateTimeout = null;
        
        // 更新价格显示
        const updatePriceDisplay = (value) => {
            const price = Number.parseFloat(value);
            if (Number.isNaN(price)) return;
            priceDisplay.textContent = `¥${price.toFixed(2)}`;
            
            // 更新拖动条的视觉反馈
            const percentage = ((price - minPrice) / (maxPrice - minPrice)) * 100;
            priceSlider.style.setProperty('--slider-progress', `${percentage}%`);
        };
        
        // 防抖筛选函数
        const debouncedFilter = (value) => {
            if (updateTimeout) {
                clearTimeout(updateTimeout);
            }
            updateTimeout = setTimeout(() => {
                this.filterProducts(Number.parseFloat(value));
            }, 150);
        };
        
        // 根据点击位置计算并设置值
        const setValueFromPosition = (clientX) => {
            const rect = priceSlider.getBoundingClientRect();
            const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
            const value = minPrice + percent * (maxPrice - minPrice);
            const clampedValue = Math.max(minPrice, Math.min(maxPrice, value));
            
            priceSlider.value = clampedValue;
            updatePriceDisplay(clampedValue);
            this.filterProducts(clampedValue);
        };
        
        // 停止拖动
        const stopDragging = () => {
            if (isDragging) {
                isDragging = false;
                priceSlider.style.cursor = 'pointer';
                const value = priceSlider.value;
                this.filterProducts(Number.parseFloat(value));
            }
        };
        
        // input事件 - 拖动时实时更新（这是最可靠的事件）
        const handleInput = (e) => {
            const value = e.target.value;
            updatePriceDisplay(value);
            debouncedFilter(value);
        };
        
        // change事件 - 拖动结束时
        const handleChange = (e) => {
            const value = e.target.value;
            updatePriceDisplay(value);
            this.filterProducts(Number.parseFloat(value));
        };
        
        // 点击事件 - 点击进度条任意位置设置值（绑定到容器）
        const handleContainerClick = (e) => {
            // 如果点击的是重置按钮，不处理
            if (e.target === resetBtn || e.target.closest('.reset-price-filter')) {
                return;
            }
            // 如果是在拖动过程中，不处理点击
            if (isDragging) {
                return;
            }
            // 点击拖动条容器时设置值
            if (e.target === priceSlider || e.target === sliderWrapper || sliderWrapper?.contains(e.target)) {
                setValueFromPosition(e.clientX);
            }
        };
        
        // mousedown - 开始拖动
        const handleMouseDown = (e) => {
            // 如果点击的是拖动条，开始拖动
            if (e.target === priceSlider) {
                e.preventDefault();
                e.stopPropagation();
                isDragging = true;
                priceSlider.style.cursor = 'grabbing';
                // 立即设置值
                setValueFromPosition(e.clientX);
            }
        };
        
        // 全局mouseup - 结束拖动（绑定到document确保即使鼠标移出也能捕获）
        const handleMouseUp = () => {
            stopDragging();
        };
        
        // 全局mousemove - 拖动过程中（绑定到document确保即使鼠标移出也能捕获）
        const handleMouseMove = (e) => {
            if (!isDragging) return;
            
            setValueFromPosition(e.clientX);
        };
        
        // 触摸事件支持（移动端）
        const handleTouchStart = (e) => {
            if (e.target === priceSlider || sliderWrapper?.contains(e.target)) {
                e.preventDefault();
                isDragging = true;
                const touch = e.touches[0];
                setValueFromPosition(touch.clientX);
            }
        };
        
        const handleTouchEnd = () => {
            stopDragging();
        };
        
        const handleTouchMove = (e) => {
            if (!isDragging) return;
            e.preventDefault();
            
            const touch = e.touches[0];
            setValueFromPosition(touch.clientX);
        };
        
        // 绑定事件监听器
        priceSlider.addEventListener('input', handleInput);
        priceSlider.addEventListener('change', handleChange);
        if (sliderWrapper) {
            sliderWrapper.addEventListener('click', handleContainerClick);
        } else {
            priceSlider.addEventListener('click', handleContainerClick);
        }
        priceSlider.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('mousemove', handleMouseMove);
        if (sliderWrapper) {
            sliderWrapper.addEventListener('touchstart', handleTouchStart, { passive: false });
        } else {
            priceSlider.addEventListener('touchstart', handleTouchStart, { passive: false });
        }
        document.addEventListener('touchend', handleTouchEnd);
        if (sliderWrapper) {
            sliderWrapper.addEventListener('touchmove', handleTouchMove, { passive: false });
        } else {
            priceSlider.addEventListener('touchmove', handleTouchMove, { passive: false });
        }
        
        // 鼠标离开拖动条时也停止拖动
        priceSlider.addEventListener('mouseleave', () => {
            if (isDragging) {
                stopDragging();
            }
        });
        
        // 重置按钮
        if (resetBtn) {
            resetBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                priceSlider.value = maxPrice;
                updatePriceDisplay(maxPrice);
                this.filterProducts(maxPrice);
            });
        }
        
        // 初始化显示
        updatePriceDisplay(priceSlider.value);
        
        // 保存清理函数，以便后续需要时移除事件监听器
        priceSlider._cleanupPriceFilter = () => {
            priceSlider.removeEventListener('input', handleInput);
            priceSlider.removeEventListener('change', handleChange);
            if (sliderWrapper) {
                sliderWrapper.removeEventListener('click', handleContainerClick);
                sliderWrapper.removeEventListener('touchstart', handleTouchStart);
                sliderWrapper.removeEventListener('touchmove', handleTouchMove);
            } else {
                priceSlider.removeEventListener('click', handleContainerClick);
            }
            priceSlider.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('touchend', handleTouchEnd);
            priceSlider.removeEventListener('mouseleave', stopDragging);
            priceSlider._priceFilterInitialized = false;
        };
    }
    
    // 筛选产品
    filterProducts(maxPrice) {
        // 数据验证：确保maxPrice是有效的数值
        const validMaxPrice = Number.isNaN(maxPrice) || maxPrice <= 0 ? 999999 : maxPrice;
        
        const allProducts = document.querySelectorAll('#produce-grid .produce-card');
        let visibleCount = 0;
        
        allProducts.forEach((product, index) => {
            const priceElement = product.querySelector('.price');
            if (!priceElement) {
                product.style.display = 'none';
                return;
            }
            
            const priceText = priceElement.textContent;
            // 数据验证：确保价格转换为有效的数值
            const price = Number.parseFloat(priceText.replace('¥', '').replace('/斤', '').trim()) || 0;
            
            if (price <= validMaxPrice) {
                // 如果商品已经可见，不重新设置动画，避免闪烁
                if (product.style.display === 'none') {
                    product.style.display = 'block';
                    visibleCount++;
                    // 只在从隐藏变为显示时添加淡入动画
                    product.style.animation = 'none';
                    product.getBoundingClientRect(); // 触发重排
                    product.style.animation = `productFadeIn 0.3s ease-out ${index * 0.02}s`;
                } else {
                    visibleCount++;
                }
            } else {
                product.style.display = 'none';
            }
        });
        
        // 如果没有可见商品，显示提示
        const grid = document.getElementById('produce-grid');
        if (grid && visibleCount === 0) {
            let noProductsMsg = grid.querySelector('.no-products-message');
            if (!noProductsMsg) {
                noProductsMsg = document.createElement('div');
                noProductsMsg.className = 'no-products-message';
                noProductsMsg.style.cssText = 'grid-column: 1/-1; text-align: center; padding: 40px; color: #999;';
                noProductsMsg.textContent = `暂无价格在 ¥${validMaxPrice.toFixed(2)} 以下的商品`;
                grid.appendChild(noProductsMsg);
            }
        } else {
            const noProductsMsg = grid?.querySelector('.no-products-message');
            if (noProductsMsg) {
                noProductsMsg.remove();
            }
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
    
    // 果蔬生长动画特效：显示果蔬生长的动态效果（至少15行）
    addGrowthAnimationEffect() {
        // 延迟执行，确保DOM已加载
        setTimeout(() => {
            const cards = document.querySelectorAll('.produce-card');
            cards.forEach((card, index) => {
                const img = card.querySelector('.product-image img, .produce-image img');
                if (!img) return;
                
                // 创建生长指示器
                const growthIndicator = document.createElement('div');
                growthIndicator.className = 'growth-indicator';
                growthIndicator.style.position = 'absolute';
                growthIndicator.style.top = '10px';
                growthIndicator.style.left = '10px';
                growthIndicator.style.width = '50px';
                growthIndicator.style.height = '50px';
                growthIndicator.style.borderRadius = '50%';
                growthIndicator.style.background = 'radial-gradient(circle, rgba(76,175,80,0.7), rgba(76,175,80,0.2))';
                growthIndicator.style.border = '2px solid rgba(76,175,80,0.8)';
                growthIndicator.style.zIndex = '10';
                growthIndicator.style.display = 'flex';
                growthIndicator.style.alignItems = 'center';
                growthIndicator.style.justifyContent = 'center';
                growthIndicator.style.fontSize = '20px';
                growthIndicator.textContent = '🌱';
                
                const imgContainer = img.parentElement;
                if (imgContainer) {
                    imgContainer.style.position = 'relative';
                    imgContainer.appendChild(growthIndicator);
                }
                
                // 生长动画
                let startTime = null;
                const animate = (timestamp) => {
                    if (!startTime) startTime = timestamp;
                    const elapsed = timestamp - startTime;
                    const progress = (elapsed % 4000) / 4000;
                    
                    // 生长缩放效果
                    const scale = 0.8 + Math.sin(progress * Math.PI * 2) * 0.2;
                    const rotation = progress * 360;
                    const opacity = 0.6 + Math.sin(progress * Math.PI * 2) * 0.3;
                    
                    growthIndicator.style.transform = `scale(${scale}) rotate(${rotation}deg)`;
                    growthIndicator.style.opacity = opacity;
                    
                    requestAnimationFrame(animate);
                };
                requestAnimationFrame(animate);
            });
        }, 500);
    }
    
    // 新鲜度扫描特效：扫描线从左到右移动显示新鲜度（至少15行）
    addFreshnessScanEffect() {
        // 延迟执行，确保DOM已加载
        setTimeout(() => {
            const cards = document.querySelectorAll('.produce-card');
            cards.forEach((card) => {
                const img = card.querySelector('.product-image img, .produce-image img');
                if (!img) return;
                
                // 创建扫描线容器
                const scanContainer = document.createElement('div');
                scanContainer.className = 'freshness-scan';
                scanContainer.style.position = 'absolute';
                scanContainer.style.top = '0';
                scanContainer.style.left = '0';
                scanContainer.style.width = '100%';
                scanContainer.style.height = '100%';
                scanContainer.style.pointerEvents = 'none';
                scanContainer.style.zIndex = '9';
                scanContainer.style.overflow = 'hidden';
                
                const imgContainer = img.parentElement;
                if (imgContainer) {
                    imgContainer.style.position = 'relative';
                    imgContainer.appendChild(scanContainer);
                }
                
                // 创建扫描线
                const scanLine = document.createElement('div');
                scanLine.style.position = 'absolute';
                scanLine.style.width = '3px';
                scanLine.style.height = '100%';
                scanLine.style.background = 'linear-gradient(to bottom, transparent, rgba(76,175,80,0.8), transparent)';
                scanLine.style.left = '0';
                scanLine.style.top = '0';
                scanLine.style.boxShadow = '0 0 20px rgba(76,175,80,0.6)';
                scanContainer.appendChild(scanLine);
                
                // 扫描动画
                let startTime = null;
                const animate = (timestamp) => {
                    if (!startTime) startTime = timestamp;
                    const elapsed = timestamp - startTime;
                    const progress = (elapsed % 3000) / 3000;
                    
                    // 扫描线从左到右移动
                    const xPosition = progress * 100;
                    scanLine.style.left = `${xPosition}%`;
                    
                    // 透明度变化
                    const opacity = Math.sin(progress * Math.PI) * 0.8;
                    scanLine.style.opacity = opacity;
                    
                    requestAnimationFrame(animate);
                };
                requestAnimationFrame(animate);
            });
        }, 500);
    }
}

// 导出到全局作用域，供ModuleManager使用
globalThis.FreshProduceModule = FreshProduceModule;

// 仅通过ModuleManager初始化，移除传统初始化方式
// 避免与ModuleManager的初始化逻辑冲突