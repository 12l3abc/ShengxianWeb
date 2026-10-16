// 水产海鲜模块

// 动态加载CSS文件
function loadCSS(href) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
    return link;
}

// 加载模块CSS文件
loadCSS('../../css/modules/seafood.css');

// 1.出水到店时长显示特效：根据出水小时数动态标记“最新鲜/较新鲜/一般”
class WaterToStoreTimer {
    constructor() {
        this.init();
    }
    
    init() {
        // 初始化时长显示
        this.updateTimeBadges();
        
        // 定期更新时长
        setInterval(() => this.updateTimeBadges(), 60000);
    }
    
    updateTimeBadges() {
        const seafoodCards = document.querySelectorAll('.seafood-card');
        
        seafoodCards.forEach(card => {
            const timeElement = card.querySelector('.water-time');
            if (timeElement) {
                const hours = Number.parseInt(timeElement.dataset.hours || '0', 10);
                const badge = timeElement.querySelector('.time-badge');
                
                // 根据时长设置样式
                if (hours < 6) {
                    badge.className = 'time-badge fresh pulse';
                    badge.textContent = '最新鲜';
                } else if (hours < 12) {
                    badge.className = 'time-badge medium';
                    badge.textContent = '较新鲜';
                } else {
                    badge.className = 'time-badge old';
                    badge.textContent = '一般';
                }
            }
        });
    }
}

// 2.宰杀去鳞服务选项特效：勾选加工服务并叠加费用
class ProcessingOptions {
    constructor() {
        this.init();
    }
    
    init() {
        // 为处理选项添加交互效果
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('processing-checkbox')) {
                this.handleProcessingChange(e.target);
            }
        });
    }
    
    handleProcessingChange(checkbox) {
        const option = checkbox.closest('.processing-option');
        
        if (checkbox.checked) {
            option.classList.add('selected');
        } else {
            option.classList.remove('selected');
        }
        
        // 更新总价
        this.updateTotalPrice(option.closest('.seafood-card'));
    }
    
    updateTotalPrice(card) {
        const basePrice = Number.parseFloat(card.querySelector('.price').dataset.basePrice || '0');
        const checkboxes = card.querySelectorAll('.processing-checkbox:checked');
        let additionalCost = 0;
        
        checkboxes.forEach(checkbox => {
            const price = Number.parseFloat(checkbox.dataset.price || '0');
            additionalCost += price;
        });
        
        const totalPrice = basePrice + additionalCost;
        const priceElement = card.querySelector('.total-price');
        if (priceElement) {
            priceElement.textContent = `¥${totalPrice.toFixed(2)}`;
        }
    }
}

// 3.卡片入场悬停特效：分批淡入并悬停提升
class SeafoodEntranceAnimation {
    constructor() {
        this.init();
    }
    
    init() {
        const seafoodCards = document.querySelectorAll('.seafood-card');
        
        // 添加入场动画
        seafoodCards.forEach((card, index) => {
            // 初始状态
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            // 添加动画
            setTimeout(() => {
                card.style.transition = 'all 0.5s ease-out';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
            
            // 添加悬停效果
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px)';
                card.style.boxShadow = '0 15px 30px rgba(0,0,0,0.15)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
                card.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
            });
        });
    }
}

// 4.冷链轨迹追踪特效：点击按钮弹出冷链追踪模态
class ColdChainTracking {
    trackingModal = null;
    constructor() {
        this.init();
    }
    
    init() {
        // 创建冷链追踪模态框
        this.createTrackingModal();
        
        // 绑定事件
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('track-chain-btn')) {
                const productId = e.target.closest('.seafood-card')?.dataset.id;
                this.showTracking(productId);
            }
            
            if (e.target.classList.contains('modal-close-tracking') || 
                e.target.classList.contains('tracking-modal')) {
                this.hideTracking();
            }
        });
    }
    
    createTrackingModal() {
        this.trackingModal = document.createElement('div');
        this.trackingModal.className = 'tracking-modal';
        
        this.trackingModal.innerHTML = `
            <div class="tracking-content">
                <span class="modal-close-tracking">&times;</span>
                <h3>冷链全程追踪</h3>
                <div class="tracking-steps">
                    <div class="tracking-step completed" data-step="1">
                        <div class="step-icon">🎣</div>
                        <div class="step-info">
                            <h4>捕捞出水</h4>
                            <p class="step-time">2025-04-01 06:30</p>
                            <p class="step-temp">温度: 4°C</p>
                        </div>
                    </div>
                    <div class="tracking-step completed" data-step="2">
                        <div class="step-icon">🚚</div>
                        <div class="step-info">
                            <h4>冷链运输</h4>
                            <p class="step-time">2025-04-01 08:15</p>
                            <p class="step-temp">温度: -2°C</p>
                        </div>
                    </div>
                    <div class="tracking-step active" data-step="3">
                        <div class="step-icon">🏪</div>
                        <div class="step-info">
                            <h4>门店到货</h4>
                            <p class="step-time">2025-04-01 12:45</p>
                            <p class="step-temp">温度: 0-4°C</p>
                        </div>
                    </div>
                    <div class="tracking-step" data-step="4">
                        <div class="step-icon">🛒</div>
                        <div class="step-info">
                            <h4>配送途中</h4>
                            <p class="step-time">预计 14:30</p>
                            <p class="step-temp">温度: 0-4°C</p>
                        </div>
                    </div>
                    <div class="tracking-step" data-step="5">
                        <div class="step-icon">🏠</div>
                        <div class="step-info">
                            <h4>送达手中</h4>
                            <p class="step-time">预计 15:00</p>
                            <p class="step-temp">温度: 保持冷链</p>
                        </div>
                    </div>
                </div>
                <div class="temperature-chart">
                    <h4>全程温度监控</h4>
                    <div class="chart-container">
                        <canvas id="tempChart" width="400" height="200"></canvas>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.trackingModal);
    }
    
    showTracking(productId) {
        this.trackingModal.style.display = 'flex';
        
        // 模拟绘制温度图表
        this.drawTemperatureChart();
    }
    
    hideTracking() {
        this.trackingModal.style.display = 'none';
    }
    
    drawTemperatureChart() {
        // 简化的温度图表模拟
        const chartContainer = this.trackingModal.querySelector('.chart-container');
        chartContainer.innerHTML = `
            <div class="temp-chart-simulation">
                <div class="chart-line">
                    <div class="chart-point" style="left: 0%; bottom: 20%;">出水</div>
                    <div class="chart-point" style="left: 25%; bottom: 10%;">运输</div>
                    <div class="chart-point" style="left: 50%; bottom: 15%;">到店</div>
                    <div class="chart-point" style="left: 75%; bottom: 12%;">配送</div>
                    <div class="chart-point" style="left: 100%; bottom: 18%;">到家</div>
                </div>
                <div class="temp-values">
                    <span>4°C</span>
                    <span>-2°C</span>
                    <span>2°C</span>
                    <span>3°C</span>
                    <span>1°C</span>
                </div>
            </div>
        `;
    }
}

// 额外海鲜可视化特效：波浪背景、卡片扫描光、顶部新鲜度条
// 作用：为海鲜模块增加明显的背景动效与卡片光效，强化“新鲜/冷链”感知
class SeafoodVisualEffects {
    constructor() {
        this.init();
    }

    init() {
        this.addWaveBackground();
        this.addCardScanGlow();
        this.addFreshRibbon();
        this.addWaterRippleEffect();
        this.addBubbleRisingEffect();
    }

    // 在模块容器添加流动波浪背景
    addWaveBackground() {
        const container = document.getElementById('seafood');
        if (!container || container.querySelector('.sea-wave-bg')) return;
        const wave = document.createElement('div');
        wave.className = 'sea-wave-bg';
        Object.assign(wave.style, {
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 20% 20%, rgba(33,150,243,0.12), transparent 45%), radial-gradient(circle at 80% 60%, rgba(0,188,212,0.12), transparent 55%)',
            transform: 'translateY(0)',
            pointerEvents: 'none',
            zIndex: 0
        });
        container.style.position = 'relative';
        container.prepend(wave);
        
        // 使用JavaScript实现海浪动画（上下浮动效果）
        let startTime = null;
        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = ((timestamp - startTime) % 12000) / 12000;
            const y = Math.sin(progress * Math.PI * 2) * -8;
            wave.style.transform = `translateY(${y}px)`;
            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }

    // 为卡片添加扫描光，随鼠标移动（至少15行）
    addCardScanGlow() {
        const cards = document.querySelectorAll('.seafood-card');
        cards.forEach((card) => {
            card.style.position = 'relative';
            card.style.transition = 'box-shadow 0.3s ease, background 0.3s ease';
            
            // 创建扫描光元素
            let scanLight = card.querySelector('.scan-light');
            if (!scanLight) {
                scanLight = document.createElement('div');
                scanLight.className = 'scan-light';
                scanLight.style.position = 'absolute';
                scanLight.style.pointerEvents = 'none';
                scanLight.style.borderRadius = '50%';
                scanLight.style.width = '200px';
                scanLight.style.height = '200px';
                scanLight.style.background = 'radial-gradient(circle, rgba(255,255,255,0.4), transparent 70%)';
                scanLight.style.filter = 'blur(20px)';
                scanLight.style.opacity = '0';
                scanLight.style.transition = 'opacity 0.3s ease, transform 0.1s ease';
                card.appendChild(scanLight);
            }
            
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                card.style.setProperty('--mx', `${x}px`);
                card.style.setProperty('--my', `${y}px`);
                card.style.boxShadow = '0 12px 30px rgba(0,150,200,0.28)';
                card.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.16), rgba(255,255,255,0))`;
                
                // 更新扫描光位置
                scanLight.style.left = `${x - 100}px`;
                scanLight.style.top = `${y - 100}px`;
                scanLight.style.opacity = '1';
                scanLight.style.transform = 'scale(1)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.boxShadow = '';
                card.style.background = '';
                scanLight.style.opacity = '0';
                scanLight.style.transform = 'scale(0.8)';
            });
        });
    }

    // 在顶部添加新鲜度胶带提示（至少15行）
    addFreshRibbon() {
        const container = document.getElementById('seafood');
        if (!container || container.querySelector('.fresh-ribbon')) return;
        
        const ribbon = document.createElement('div');
        ribbon.className = 'fresh-ribbon';
        Object.assign(ribbon.style, {
            position: 'sticky',
            top: '8px',
            padding: '8px 14px',
            background: 'linear-gradient(90deg,#00bcd4,#2196f3)',
            color: '#fff',
            fontWeight: 'bold',
            borderRadius: '12px',
            boxShadow: '0 8px 22px rgba(0,188,212,0.35)',
            zIndex: 10,
            maxWidth: '260px',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
        });
        ribbon.textContent = '冷链溯源 · 2小时内上架';
        
        // 添加悬停效果
        ribbon.addEventListener('mouseenter', () => {
            ribbon.style.transform = 'scale(1.05) translateY(-2px)';
            ribbon.style.boxShadow = '0 12px 28px rgba(0,188,212,0.45)';
        });
        
        ribbon.addEventListener('mouseleave', () => {
            ribbon.style.transform = 'scale(1) translateY(0)';
            ribbon.style.boxShadow = '0 8px 22px rgba(0,188,212,0.35)';
        });
        
        // 使用JavaScript实现点击脉冲动画
        ribbon.addEventListener('click', () => {
            let startTime = null;
            const duration = 500;
            const animate = (timestamp) => {
                if (!startTime) startTime = timestamp;
                const progress = Math.min((timestamp - startTime) / duration, 1);
                // 脉冲效果：先放大到1.1倍，然后恢复
                const scale = progress < 0.5 
                    ? 1 + (progress * 2) * 0.1
                    : 1 + (1 - (progress - 0.5) * 2) * 0.1;
                ribbon.style.transform = `scale(${scale}) translateY(-2px)`;
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    ribbon.style.transform = 'scale(1) translateY(0)';
                }
            };
            requestAnimationFrame(animate);
        });
        
        container.prepend(ribbon);
    }
    
    // 水波纹扩散特效：点击卡片时产生水波纹扩散效果（至少15行）
    addWaterRippleEffect() {
        // 延迟执行，确保DOM已加载
        setTimeout(() => {
            const cards = document.querySelectorAll('.seafood-card');
            cards.forEach((card) => {
                card.addEventListener('click', (e) => {
                    const rect = card.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const clickY = e.clientY - rect.top;
                    
                    // 创建水波纹
                    const ripple = document.createElement('div');
                    ripple.style.position = 'absolute';
                    ripple.style.left = clickX + 'px';
                    ripple.style.top = clickY + 'px';
                    ripple.style.width = '0';
                    ripple.style.height = '0';
                    ripple.style.borderRadius = '50%';
                    ripple.style.background = 'rgba(33,150,243,0.3)';
                    ripple.style.transform = 'translate(-50%, -50%)';
                    ripple.style.pointerEvents = 'none';
                    ripple.style.zIndex = '1000';
                    
                    const cardContent = card.querySelector('.card-content, .product-info');
                    if (cardContent) {
                        cardContent.style.position = 'relative';
                        cardContent.style.overflow = 'hidden';
                        cardContent.appendChild(ripple);
                    }
                    
                    // 水波纹扩散动画
                    let startTime = null;
                    const duration = 1000;
                    const maxSize = Math.max(rect.width, rect.height) * 2;
                    
                    const animate = (timestamp) => {
                        if (!startTime) startTime = timestamp;
                        const elapsed = timestamp - startTime;
                        const progress = elapsed / duration;
                        
                        if (progress < 1) {
                            const size = progress * maxSize;
                            const opacity = 1 - progress;
                            
                            ripple.style.width = size + 'px';
                            ripple.style.height = size + 'px';
                            ripple.style.opacity = opacity;
                            ripple.style.border = `${2 * (1 - progress)}px solid rgba(33,150,243,0.5)`;
                            
                            requestAnimationFrame(animate);
                        } else {
                            ripple.remove();
                        }
                    };
                    requestAnimationFrame(animate);
                });
            });
        }, 500);
    }
    
    // 气泡上升特效：背景气泡从底部上升（至少15行）
    addBubbleRisingEffect() {
        const container = document.getElementById('seafood');
        if (!container) return;
        
        // 创建气泡容器
        const bubbleContainer = document.createElement('div');
        bubbleContainer.className = 'bubble-container';
        bubbleContainer.style.position = 'absolute';
        bubbleContainer.style.top = '0';
        bubbleContainer.style.left = '0';
        bubbleContainer.style.width = '100%';
        bubbleContainer.style.height = '100%';
        bubbleContainer.style.pointerEvents = 'none';
        bubbleContainer.style.zIndex = '1';
        bubbleContainer.style.overflow = 'hidden';
        
        container.style.position = 'relative';
        container.appendChild(bubbleContainer);
        
        // 创建多个气泡
        for (let i = 0; i < 8; i++) {
            const bubble = document.createElement('div');
            const size = 10 + Math.random() * 20;
            bubble.style.position = 'absolute';
            bubble.style.width = size + 'px';
            bubble.style.height = size + 'px';
            bubble.style.borderRadius = '50%';
            bubble.style.background = 'rgba(255,255,255,0.2)';
            bubble.style.border = '1px solid rgba(255,255,255,0.3)';
            bubble.style.left = `${Math.random() * 100}%`;
            bubble.style.bottom = '-30px';
            
            bubbleContainer.appendChild(bubble);
            
            // 气泡上升动画
            let startTime = null;
            const delay = i * 500;
            const duration = 4000 + Math.random() * 2000;
            const animate = (timestamp) => {
                if (!startTime) startTime = timestamp;
                const elapsed = timestamp - startTime - delay;
                if (elapsed < 0) {
                    requestAnimationFrame(animate);
                    return;
                }
                
                const progress = elapsed / duration;
                if (progress < 1) {
                    const bottom = -30 + progress * (window.innerHeight + 60);
                    const xOffset = Math.sin(progress * Math.PI * 4) * 20;
                    const opacity = Math.min(1, progress * 2) * (1 - progress);
                    const scale = 0.5 + progress * 0.5;
                    
                    bubble.style.bottom = bottom + 'px';
                    bubble.style.transform = `translateX(${xOffset}px) scale(${scale})`;
                    bubble.style.opacity = opacity;
                    
                    requestAnimationFrame(animate);
                } else {
                    bubble.style.bottom = '-30px';
                    bubble.style.opacity = '0';
                    startTime = null;
                    requestAnimationFrame(animate);
                }
            };
            requestAnimationFrame(animate);
        }
    }
}

// 初始化附加特效
document.addEventListener('DOMContentLoaded', () => {
    globalThis.seafoodEffects = new SeafoodVisualEffects();
});
// 海鲜模块主类 - 供ModuleManager调用
class SeafoodModule {
    constructor() {
        this.init();
    }
    
    init() {
        const run = async () => {
        // 创建模块容器
        const container = document.getElementById('seafood');
            if (!container) return;
            try {
                // 显示加载状态
                container.innerHTML = `
                    <div class="module-header">
                        <h2>水产海鲜</h2>
                        <p>新鲜捕捞，全程冷链，保证鲜活品质</p>
                    </div>
                    <div class="seafood-grid" id="seafood-grid">
                        <div class="loading">加载中...</div>
                    </div>
                `;
                
                let seafoodVarieties;
                
                // 尝试从API获取数据
                try {
                    // 检查apiClient是否存在
                    const apiClient = globalThis.apiClient || window.apiClient;
                    if (!apiClient) {
                        console.log('[Seafood] apiClient未定义，使用备用数据');
                        seafoodVarieties = this.generateSeafoodFallbackProducts();
                    } else if (!apiClient.getProductsByCategory) {
                        console.log('[Seafood] apiClient.getProductsByCategory方法不存在，使用备用数据');
                        seafoodVarieties = this.generateSeafoodFallbackProducts();
                    } else {
                    const response = await apiClient.getProductsByCategory('seafood');
                    const products = response?.products;
                    if (response?.success && Array.isArray(products) && products.length > 0) {
                        seafoodVarieties = products;
                    } else {
                            console.log('[Seafood] API返回数据为空，使用备用数据');
                        seafoodVarieties = this.generateSeafoodFallbackProducts();
                        }
                    }
                } catch (error) {
                    console.error('[Seafood] 获取海鲜商品数据失败:', error);
                    seafoodVarieties = this.generateSeafoodFallbackProducts();
                }
                
                container.innerHTML = `
                    <div class="module-header">
                        <h2>水产海鲜</h2>
                        <p>新鲜捕捞，全程冷链，保证鲜活品质</p>
                    </div>
                    <div class="seafood-grid" id="seafood-grid">
                        ${seafoodVarieties.map((seafood, i) => {
                            // 处理图片路径，支持Base64图片
                            const seafoodImage = seafood.image || 'src/shengxian.png';
                            const isBase64 = seafoodImage.startsWith('data:image/');
                            const imageSrc = isBase64 ? seafoodImage : `${seafoodImage}?t=${Date.now()}`;
                            return `
                            <div class="product-card seafood-card" data-id="${seafood.id}">
                                <div class="product-image">
                                    <img src="${imageSrc}" alt="${seafood.name}" onerror="this.onerror=null;this.src='src/shengxian.png'" loading="lazy">
                                    <div class="fresh-seafood-badge">${seafood.badge || '鲜活'}</div>
                                </div>
                                <div class="product-info">
                                    <h4>${seafood.name}</h4>
                                    <p>${seafood.description || '精选优质水产海鲜'}</p>
                                    <div class="water-time" data-hours="${i*2 + 1}">
                                        出水到店时长: <span class="time-badge">计算中</span>
                                    </div>
                                    <div class="processing-options">
                                        <h4>处理选项:</h4>
                                        <label class="processing-option">
                                            <input type="checkbox" class="processing-checkbox" data-price="5">
                                            <div class="option-details">
                                                <div class="option-name">宰杀去鳞</div>
                                                <div class="option-desc">专业师傅处理，干净卫生</div>
                                            </div>
                                            <div class="option-price">¥5.00</div>
                                        </label>
                                        <label class="processing-option">
                                            <input type="checkbox" class="processing-checkbox" data-price="8">
                                            <div class="option-details">
                                                <div class="option-name">活氧到家</div>
                                                <div class="option-desc">全程活氧保鲜，保持鲜活</div>
                                            </div>
                                            <div class="option-price">¥8.00</div>
                                        </label>
                                    </div>
                                    <div class="product-meta">
                                        <span class="price" data-base-price="${seafood.price.toFixed(2)}">¥${seafood.price.toFixed(2)}</span>
                                        <span class="total-price">¥${seafood.price.toFixed(2)}</span>
                                        <button class="track-chain-btn action-btn">冷链追踪</button>
                                    </div>
                                    <button class="add-to-cart-btn">加入购物车</button>
                                </div>
                            </div>
                        `;}).join('')}
                    </div>
                `;
                
                // 初始化特效
                try {
                    new WaterToStoreTimer();
                    new ProcessingOptions();
                    new ColdChainTracking();
                    new SeafoodEntranceAnimation();
                    // 初始化可视化特效
                    new SeafoodVisualEffects();
                } catch (error) {
                    console.error('[Seafood] 初始化海鲜特效失败:', error);
                }
            } catch (error) {
                console.error('初始化海鲜模块失败:', error);
                // 即使在最外层捕获到错误，也要使用备用数据
                const seafoodVarieties = this.generateSeafoodFallbackProducts();
                container.innerHTML = `
                    <div class="module-header">
                        <h2>水产海鲜</h2>
                        <p>新鲜捕捞，全程冷链，保证鲜活品质</p>
                    </div>
                    <div class="seafood-grid" id="seafood-grid">
                        ${seafoodVarieties.map((seafood, i) => {
                            // 处理图片路径，支持Base64图片
                            const seafoodImage = seafood.image || 'src/shengxian.png';
                            const isBase64 = seafoodImage.startsWith('data:image/');
                            const imageSrc = isBase64 ? seafoodImage : `${seafoodImage}?t=${Date.now()}`;
                            return `
                            <div class="product-card seafood-card" data-id="${seafood.id}">
                                <div class="product-image">
                                    <img src="${imageSrc}" alt="${seafood.name}" onerror="this.onerror=null;this.src='src/shengxian.png'" loading="lazy">
                                    <div class="fresh-seafood-badge">${seafood.badge || '鲜活'}</div>
                                </div>
                                <div class="product-info">
                                    <h4>${seafood.name}</h4>
                                    <p>${seafood.description || '精选优质水产海鲜'}</p>
                                    <div class="product-meta">
                                        <span class="price">¥${seafood.price.toFixed(2)}</span>
                                    </div>
                                    <button class="add-to-cart-btn">加入购物车</button>
                                </div>
                            </div>
                        `;}).join('')}
                    </div>
                `;
                
                // 初始化特效（错误处理中也要初始化）
                try {
                    new WaterToStoreTimer();
                    new ProcessingOptions();
                    new ColdChainTracking();
                    new SeafoodEntranceAnimation();
                    // 初始化可视化特效
                    new SeafoodVisualEffects();
                } catch (error) {
                    console.error('[Seafood] 初始化海鲜特效失败:', error);
                }
            }
        };
        run();
    }
    
    // 生成海鲜备用数据
    generateSeafoodFallbackProducts() {
        return [
            {
                id: 'seafood1',
                name: '新鲜龙虾',
                description: '鲜活龙虾，肉质鲜美',
                price: 198,
                image: 'src/shengxian.png',
                badge: '鲜活',
                category: 'seafood'
            },
            {
                id: 'seafood2',
                name: '大闸蟹',
                description: '膏肥黄满，味道鲜美',
                price: 88,
                image: 'src/shengxian.png',
                badge: '鲜活',
                category: 'seafood'
            },
            {
                id: 'seafood3',
                name: '三文鱼',
                description: '新鲜三文鱼，富含Omega-3',
                price: 68,
                image: 'src/shengxian.png',
                badge: '冰鲜',
                category: 'seafood'
            },
            {
                id: 'seafood4',
                name: '鲍鱼',
                description: '优质鲍鱼，营养丰富',
                price: 128,
                image: 'src/shengxian.png',
                badge: '鲜活',
                category: 'seafood'
            },
            {
                id: 'seafood5',
                name: '基围虾',
                description: '新鲜基围虾，口感Q弹',
                price: 48,
                image: 'src/shengxian.png',
                badge: '鲜活',
                category: 'seafood'
            },
            {
                id: 'seafood6',
                name: '扇贝',
                description: '肥美扇贝，味道鲜美',
                price: 38,
                image: 'src/shengxian.png',
                badge: '鲜活',
                category: 'seafood'
            }
        ];
    }
}

// 导出到全局作用域，供ModuleManager使用
globalThis.SeafoodModule = SeafoodModule;

// 仅通过ModuleManager初始化，移除传统初始化方式
// 避免与ModuleManager的初始化逻辑冲突

// 导出到全局作用域，供ModuleManager使用
globalThis.SeafoodModule = SeafoodModule;

// 仅通过ModuleManager初始化，移除传统初始化方式
// 避免与ModuleManager的初始化逻辑冲突