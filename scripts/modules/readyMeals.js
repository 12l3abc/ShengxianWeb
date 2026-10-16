// 速食净菜模块

// 动态加载CSS文件
function loadCSS(href) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
    return link;
}

// 加载模块CSS文件
loadCSS('../../css/modules/readyMeals.css');

// 1.炒菜视频预览特效：点击按钮弹出视频模态并播放
class CookingVideoPreview {
    constructor() {
        this.videoModal = null;
        this.init();
    }
    
    init() {
        // 创建视频预览模态框
        this.createVideoModal();
        
        // 绑定事件
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('preview-video-btn')) {
                const productId = e.target.closest('.meal-card').getAttribute('data-id');
                const productName = e.target.closest('.meal-card').querySelector('h4').textContent;
                this.showVideoPreview(productId, productName);
            }
            
            if (e.target.classList.contains('modal-close-video') || 
                e.target.classList.contains('video-modal')) {
                this.hideVideoPreview();
            }
        });
    }
    
    createVideoModal() {
        this.videoModal = document.createElement('div');
        this.videoModal.className = 'video-modal';
        
        this.videoModal.innerHTML = `
            <div class="video-content">
                <span class="modal-close-video">&times;</span>
                <h3 id="video-product-name">菜品名称</h3>
                <div class="video-container">
                    <div class="video-placeholder">
                        <div class="play-icon">▶</div>
                        <p>15秒炒菜视频演示</p>
                    </div>
                    <video id="cooking-video" controls style="display:none; width:100%; max-width:500px;">
                        <source src="" type="video/mp4">
                        您的浏览器不支持视频播放。
                    </video>
                </div>
                <div class="video-controls">
                    <button class="play-btn">播放视频</button>
                    <button class="pause-btn" style="display:none;">暂停</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.videoModal);
        
        // 绑定视频控制事件
        this.bindVideoControlEvents();
    }
    
    bindVideoControlEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('play-btn')) {
                this.playVideo();
            }
            
            if (e.target.classList.contains('pause-btn')) {
                this.pauseVideo();
            }
            
            if (e.target.classList.contains('video-placeholder')) {
                this.playVideo();
            }
        });
    }
    
    showVideoPreview(productId, productName) {
        // 设置产品名称
        const nameElement = this.videoModal.querySelector('#video-product-name');
        nameElement.textContent = productName;
        
        // 显示模态框
        this.videoModal.style.display = 'flex';
        
        // 使用JavaScript实现视频模态框淡入滑入动画
        const videoContent = this.videoModal.querySelector('.video-content');
        if (videoContent) {
            videoContent.style.opacity = '0';
            videoContent.style.transform = 'translateY(20px)';
            requestAnimationFrame(() => {
                videoContent.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
                videoContent.style.opacity = '1';
                videoContent.style.transform = 'translateY(0)';
            });
        }
    }
    
    hideVideoPreview() {
        // 暂停视频
        const video = this.videoModal.querySelector('#cooking-video');
        video.pause();
        video.style.display = 'none';
        
        // 显示占位符
        const placeholder = this.videoModal.querySelector('.video-placeholder');
        placeholder.style.display = 'block';
        
        // 重置按钮
        this.videoModal.querySelector('.play-btn').style.display = 'inline-block';
        this.videoModal.querySelector('.pause-btn').style.display = 'none';
        
        // 隐藏模态框
        this.videoModal.style.display = 'none';
    }
    
    playVideo() {
        // 隐藏占位符
        const placeholder = this.videoModal.querySelector('.video-placeholder');
        placeholder.style.display = 'none';
        
        // 显示视频
        const video = this.videoModal.querySelector('#cooking-video');
        video.style.display = 'block';
        video.play();
        
        // 更新按钮
        this.videoModal.querySelector('.play-btn').style.display = 'none';
        this.videoModal.querySelector('.pause-btn').style.display = 'inline-block';
    }
    
    pauseVideo() {
        const video = this.videoModal.querySelector('#cooking-video');
        video.pause();
        
        // 更新按钮
        this.videoModal.querySelector('.play-btn').style.display = 'inline-block';
        this.videoModal.querySelector('.pause-btn').style.display = 'none';
    }
}

// 2.下班高峰期快速送达特效：高峰时段打“30分钟达”徽章并高亮
class FastDeliveryEffect {
    constructor() {
        this.init();
    }
    
    init() {
        // 初始化快速送达特效
        this.initializeFastDelivery();
        
        // 添加入场动画
        this.addEntranceAnimation();
    }
    
    initializeFastDelivery() {
        const mealCards = document.querySelectorAll('.meal-card');
        
        mealCards.forEach(card => {
            // 检查是否为下班高峰期（17:00-20:00）
            const now = new Date();
            const hour = now.getHours();
            
            if (hour >= 17 && hour <= 20) {
                // 添加快速送达徽章
                const deliveryBadge = document.createElement('div');
                deliveryBadge.className = 'delivery-badge';
                deliveryBadge.textContent = '30分钟达';
                card.appendChild(deliveryBadge);
                
                // 添加快速送达时间
                const timeElement = document.createElement('div');
                timeElement.className = 'delivery-time';
                timeElement.textContent = '下班高峰专享30分钟送达';
                card.querySelector('.product-meta').appendChild(timeElement);
                
                // 添加高亮效果
                card.classList.add('fast-delivery-highlight');
            }
        });
    }
    
    addEntranceAnimation() {
        const mealCards = document.querySelectorAll('.meal-card');
        
        mealCards.forEach((card, index) => {
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

// 3.视觉增强特效：蒸汽/热气、送达进度条、卡片折叠动效
//    强化“热乎速达”，突出即时配送和菜品新鲜
class ReadyMealsEffects {
    constructor() {
        this.init();
    }

    init() {
        this.addSteamOverlay();
        this.addDeliveryProgress();
        this.addCardFlipHover();
        this.addHeatWaveEffect();
        this.addCookingTimerAnimation();
        this.addIngredientFloatingEffect();
    }

    // 在卡片图片区域叠加蒸汽效果
    addSteamOverlay() {
        const cards = document.querySelectorAll('.meal-card .product-image');
        cards.forEach((img) => {
            if (img.querySelector('.steam-overlay')) return;
            const steam = document.createElement('div');
            steam.className = 'steam-overlay';
            Object.assign(steam.style, {
                position: 'absolute',
                inset: '0',
                background: 'radial-gradient(circle at 30% 70%, rgba(255,255,255,0.18), transparent 40%), radial-gradient(circle at 70% 30%, rgba(255,255,255,0.16), transparent 45%)',
                transform: 'translateY(6px)',
                pointerEvents: 'none',
                mixBlendMode: 'screen'
            });
            img.style.position = 'relative';
            img.appendChild(steam);
            
            // 使用JavaScript实现蒸汽移动动画（上下浮动效果）
            let startTime = null;
            const animate = (timestamp) => {
                if (!startTime) startTime = timestamp;
                const progress = ((timestamp - startTime) % 5000) / 5000;
                const y = 6 + Math.sin(progress * Math.PI * 2) * -12; // 在6px到-6px之间浮动
                steam.style.transform = `translateY(${y}px)`;
                requestAnimationFrame(animate);
            };
            requestAnimationFrame(animate);
        });
    }

    // 卡片底部送达进度条，强调“速达”
    addDeliveryProgress() {
        document.querySelectorAll('.meal-card').forEach((card) => {
            if (card.querySelector('.delivery-progress')) return;
            const bar = document.createElement('div');
            bar.className = 'delivery-progress';
            Object.assign(bar.style, {
                height: '6px',
                background: 'rgba(0,0,0,0.08)',
                borderRadius: '6px',
                overflow: 'hidden',
                marginTop: '8px'
            });
            const fill = document.createElement('div');
            fill.className = 'delivery-progress-fill';
            fill.style.height = '100%';
            fill.style.width = '100%';
            fill.style.background = 'linear-gradient(90deg,#ff9800,#ff5722)';
            fill.style.transformOrigin = 'left';
            fill.style.transform = 'scaleX(0.35)';
            fill.style.transition = 'transform 0.45s ease';
            bar.appendChild(fill);
            const meta = card.querySelector('.product-meta');
            if (meta) meta.appendChild(bar);
            setTimeout(() => { fill.style.transform = 'scaleX(1)'; }, 100);
        });
    }

    // 卡片悬停折叠/展开效果
    addCardFlipHover() {
        document.querySelectorAll('.meal-card').forEach((card) => {
            card.style.transition = 'transform 0.25s ease, box-shadow 0.25s ease';
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const rx = ((y / rect.height) - 0.5) * -5;
                const ry = ((x / rect.width) - 0.5) * 5;
                card.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg)`;
                card.style.boxShadow = '0 14px 32px rgba(0,0,0,0.16)';
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(700px) rotateX(0deg) rotateY(0deg)';
                card.style.boxShadow = '';
            });
        });
    }
    
    // 热浪扭曲特效：卡片悬停时产生热浪扭曲效果（至少15行）
    addHeatWaveEffect() {
        const cards = document.querySelectorAll('.meal-card');
        cards.forEach((card) => {
            const img = card.querySelector('.product-image img');
            if (!img) return;
            
            card.addEventListener('mouseenter', () => {
                let startTime = null;
                const animate = (timestamp) => {
                    if (!startTime) startTime = timestamp;
                    const elapsed = timestamp - startTime;
                    const progress = (elapsed % 2000) / 2000;
                    
                    // 创建热浪扭曲效果
                    const waveIntensity = Math.sin(progress * Math.PI * 2) * 0.02;
                    const waveOffset = Math.sin(progress * Math.PI * 4) * 2;
                    
                    // 使用filter实现扭曲效果
                    img.style.filter = `blur(${waveIntensity}px) brightness(${1 + waveIntensity * 0.1})`;
                    img.style.transform = `translateY(${waveOffset}px) scale(1.02)`;
                    
                    requestAnimationFrame(animate);
                };
                requestAnimationFrame(animate);
            });
            
            card.addEventListener('mouseleave', () => {
                img.style.filter = '';
                img.style.transform = '';
            });
        });
    }
    
    // 烹饪计时器动画：显示烹饪时间的动态计时器（至少15行）
    addCookingTimerAnimation() {
        const cards = document.querySelectorAll('.meal-card');
        cards.forEach((card) => {
            const timeElement = card.querySelector('.cooking-time, .time-badge');
            if (!timeElement) {
                // 创建时间显示元素
                const timeBadge = document.createElement('div');
                timeBadge.className = 'cooking-time-badge';
                timeBadge.textContent = '5分钟';
                timeBadge.style.position = 'absolute';
                timeBadge.style.top = '10px';
                timeBadge.style.right = '10px';
                timeBadge.style.background = 'rgba(255,87,34,0.9)';
                timeBadge.style.color = '#fff';
                timeBadge.style.padding = '6px 12px';
                timeBadge.style.borderRadius = '20px';
                timeBadge.style.fontSize = '12px';
                timeBadge.style.fontWeight = 'bold';
                timeBadge.style.zIndex = '10';
                
                const imgContainer = card.querySelector('.product-image');
                if (imgContainer) {
                    imgContainer.style.position = 'relative';
                    imgContainer.appendChild(timeBadge);
                }
                
                // 计时器数字跳动动画
                let startTime = null;
                const animate = (timestamp) => {
                    if (!startTime) startTime = timestamp;
                    const elapsed = timestamp - startTime;
                    const progress = (elapsed % 3000) / 3000;
                    
                    // 每0.5秒跳动一次
                    const beatProgress = (progress * 6) % 1;
                    const scale = 1 + Math.sin(beatProgress * Math.PI) * 0.15;
                    timeBadge.style.transform = `scale(${scale})`;
                    
                    requestAnimationFrame(animate);
                };
                requestAnimationFrame(animate);
            }
        });
    }
    
    // 食材浮动特效：食材图标在卡片上浮动（至少15行）
    addIngredientFloatingEffect() {
        const cards = document.querySelectorAll('.meal-card');
        cards.forEach((card, index) => {
            // 创建食材图标容器
            const ingredientContainer = document.createElement('div');
            ingredientContainer.className = 'ingredient-floating';
            ingredientContainer.style.position = 'absolute';
            ingredientContainer.style.top = '0';
            ingredientContainer.style.left = '0';
            ingredientContainer.style.width = '100%';
            ingredientContainer.style.height = '100%';
            ingredientContainer.style.pointerEvents = 'none';
            ingredientContainer.style.zIndex = '5';
            ingredientContainer.style.overflow = 'hidden';
            
            const imgContainer = card.querySelector('.product-image');
            if (imgContainer) {
                imgContainer.style.position = 'relative';
                imgContainer.appendChild(ingredientContainer);
            }
            
            // 创建3-5个食材图标
            const ingredients = ['🥕', '🥬', '🍄', '🌶️', '🧄'];
            const count = 3 + (index % 3);
            
            for (let i = 0; i < count; i++) {
                const icon = document.createElement('div');
                icon.textContent = ingredients[i % ingredients.length];
                icon.style.position = 'absolute';
                icon.style.fontSize = '24px';
                icon.style.opacity = '0.7';
                icon.style.left = `${20 + (i * 25)}%`;
                icon.style.top = `${30 + (i * 15)}%`;
                
                ingredientContainer.appendChild(icon);
                
                // 浮动动画
                let startTime = null;
                const delay = i * 200;
                const animate = (timestamp) => {
                    if (!startTime) startTime = timestamp;
                    const elapsed = timestamp - startTime - delay;
                    if (elapsed < 0) {
                        requestAnimationFrame(animate);
                        return;
                    }
                    
                    const progress = (elapsed % 3000) / 3000;
                    const y = Math.sin(progress * Math.PI * 2) * 15;
                    const x = Math.cos(progress * Math.PI * 2) * 10;
                    const rotation = progress * 360;
                    const opacity = 0.4 + Math.sin(progress * Math.PI * 2) * 0.3;
                    
                    icon.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg)`;
                    icon.style.opacity = opacity;
                    
                    requestAnimationFrame(animate);
                };
                requestAnimationFrame(animate);
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ReadyMealsEffects();
});

// 净菜处理步骤展示特效
class VegetableProcessingSteps {
    constructor() {
        this.stepsModal = null;
        this.init();
    }
    
    init() {
        // 创建处理步骤模态框
        this.createStepsModal();
        
        // 绑定事件
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('processing-steps-btn')) {
                const productId = e.target.closest('.meal-card').getAttribute('data-id');
                const productName = e.target.closest('.meal-card').querySelector('h4').textContent;
                this.showProcessingSteps(productId, productName);
            }
            
            if (e.target.classList.contains('modal-close-steps') || 
                e.target.classList.contains('steps-modal')) {
                this.hideProcessingSteps();
            }
        });
    }
    
    createStepsModal() {
        this.stepsModal = document.createElement('div');
        this.stepsModal.className = 'steps-modal';
        
        this.stepsModal.innerHTML = `
            <div class="steps-content">
                <span class="modal-close-steps">&times;</span>
                <h3 id="steps-product-name">菜品名称</h3>
                <div class="processing-steps">
                    <div class="step">
                        <div class="step-number">1</div>
                        <div class="step-content">
                            <h4>原料挑选</h4>
                            <p>精选优质新鲜蔬菜，去除老叶、黄叶</p>
                        </div>
                    </div>
                    <div class="step">
                        <div class="step-number">2</div>
                        <div class="step-content">
                            <h4>清洗处理</h4>
                            <p>多道清洗工序，去除泥沙杂质</p>
                        </div>
                    </div>
                    <div class="step">
                        <div class="step-number">3</div>
                        <div class="step-content">
                            <h4>切割配菜</h4>
                            <p>标准化切割，大小均匀便于烹饪</p>
                        </div>
                    </div>
                    <div class="step">
                        <div class="step-number">4</div>
                        <div class="step-content">
                            <h4>真空包装</h4>
                            <p>无菌真空包装，保证新鲜度</p>
                        </div>
                    </div>
                    <div class="step">
                        <div class="step-number">5</div>
                        <div class="step-content">
                            <h4>冷链配送</h4>
                            <p>全程冷链运输，确保食材新鲜</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.stepsModal);
    }
    
    showProcessingSteps(productId, productName) {
        // 设置产品名称
        const nameElement = this.stepsModal.querySelector('#steps-product-name');
        nameElement.textContent = productName;
        
        // 显示模态框
        this.stepsModal.style.display = 'flex';
        
        // 使用JavaScript实现步骤模态框淡入滑入动画
        const stepsContent = this.stepsModal.querySelector('.steps-content');
        if (stepsContent) {
            stepsContent.style.opacity = '0';
            stepsContent.style.transform = 'translateY(20px)';
            requestAnimationFrame(() => {
                stepsContent.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
                stepsContent.style.opacity = '1';
                stepsContent.style.transform = 'translateY(0)';
            });
        }
    }
    
    hideProcessingSteps() {
        this.stepsModal.style.display = 'none';
    }
}

// 速食净菜模块主类 - 供ModuleManager调用
class ReadyMealsModule {
    constructor() {
        this.init();
    }
    
    async init() {
        // 创建模块容器
        const container = document.getElementById('ready-meals');
        if (container) {
            try {
                // 从API获取速食净菜数据
                const response = await apiClient.getProductsByCategory('readyMeals');
                if (response.success && response.products) {
                    const readyMeals = response.products;
                
                    container.innerHTML = `
                        <div class="module-header">
                            <h2>速食净菜</h2>
                            <p>已洗已切已配，3分钟出锅，下班高峰30分钟达</p>
                        </div>
                        <div class="meals-grid" id="meals-grid">
                            ${readyMeals.map((meal, i) => {
                                // 随机生成烹饪时间（2-6分钟）
                                const prepTime = `${Math.floor(Math.random() * 5) + 2}分钟`;
                                
                                // 处理图片路径，支持Base64图片
                                const mealImage = meal.image || 'src/youji.jpg';
                                const isBase64 = mealImage.startsWith('data:image/');
                                const imageSrc = isBase64 ? mealImage : `${mealImage}?t=${Date.now()}`;
                                
                                return `
                                    <div class="product-card meal-card" data-id="meal-${i+1}">
                                        <div class="product-image">
                                            <img src="${imageSrc}" alt="${meal.name}" onerror="this.onerror=null;this.src='src/youji.jpg'">
                                            <div class="quick-meal-badge">快手套餐</div>
                                        </div>
                                        <div class="product-info">
                                            <h4>${meal.name}</h4>
                                            <p>${meal.description}</p>
                                            <div class="meal-features">
                                                <span class="feature-tag">已清洗</span>
                                                <span class="feature-tag">已切割</span>
                                                <span class="feature-tag">已搭配</span>
                                                <span class="feature-tag">${prepTime}出锅</span>
                                            </div>
                                            <div class="product-meta">
                                                <span class="price">¥${meal.price}</span>
                                                <div class="meal-actions">
                                                    <button class="preview-video-btn action-btn">查看做法</button>
                                                    <button class="processing-steps-btn action-btn">处理流程</button>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="product-actions">
                                            <button class="add-to-cart-btn">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                                    <path d="M3 6H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                                    <path d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                                </svg>
                                                加入购物车
                                            </button>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    `;
                
                    // 初始化特效
                    new CookingVideoPreview();
                    new FastDeliveryEffect();
                    new VegetableProcessingSteps();
                } else {
                    container.innerHTML = '<div class="error-message">加载商品数据失败</div>';
                }
            } catch (error) {
                console.error('获取速食净菜数据失败:', error);
                container.innerHTML = '<div class="error-message">加载商品数据失败</div>';
            }
        }
    }
}

// 导出到全局作用域，供ModuleManager使用
window.ReadyMealsModule = ReadyMealsModule;

// 仅通过ModuleManager初始化，移除传统初始化方式
// 避免与ModuleManager的初始化逻辑冲突