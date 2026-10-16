// 无忧售后模块

// 加载外部CSS函数
function loadCSS(href) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
}

// 1.实时处理时长滚动展示特效：展示处理订单数/平均时长并定时刷新
class RealTimeProcessingDisplay {
    constructor() {
        this.averageTime = 60; // 平均处理时长（秒）
        this.init();
    }
    
    init() {
        // 创建处理时长展示
        this.createProcessingDisplay();
        
        // 启动定时更新
        setInterval(() => this.updateProcessingStats(), 30000);
    }
    
    createProcessingDisplay() {
        const container = document.getElementById('after-sales');
        if (container) {
            const header = document.createElement('div');
            header.className = 'processing-header';
            header.innerHTML = `
                <h3>🚀 无忧售后服务</h3>
                <div class="processing-stats">
                    <div class="stat-item">
                        <div>今日处理订单</div>
                        <div class="stat-value" id="processed-orders">128</div>
                    </div>
                    <div class="stat-item">
                        <div>平均处理时长</div>
                        <div class="stat-value" id="average-time">${this.formatTime(this.averageTime)}</div>
                    </div>
                    <div class="stat-item">
                        <div>满意度</div>
                        <div class="stat-value">98%</div>
                    </div>
                </div>
            `;
            
            container.appendChild(header);
            
            // 创建滚动消息
            this.createMarquee();
        }
    }
    
    createMarquee() {
        const container = document.getElementById('after-sales');
        const marqueeContainer = document.createElement('div');
        marqueeContainer.className = 'marquee-container';
        marqueeContainer.innerHTML = `
            <h4>🔔 实时售后处理动态</h4>
            <div class="marquee">
                ${Array.from({length: 10}).map((_, i) => {
                    const times = [35, 42, 58, 60, 45, 50, 38, 48, 55, 40];
                    const time = times[i % times.length];
                    return `
                        <div class="marquee-item">
                            <div class="marquee-avatar">${String.fromCharCode(65 + i)}</div>
                            <div>用户${String.fromCharCode(65 + i)}的售后申请已处理完毕，耗时${time}秒</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        
        container.appendChild(marqueeContainer);
    }
    
    updateProcessingStats() {
        // 模拟更新统计数据
        const processedOrders = document.getElementById('processed-orders');
        const averageTime = document.getElementById('average-time');
        
        if (processedOrders && averageTime) {
            // 增加处理订单数
            const currentOrders = parseInt(processedOrders.textContent);
            processedOrders.textContent = currentOrders + Math.floor(Math.random() * 3);
            
            // 微调平均处理时长
            const adjustment = (Math.random() - 0.5) * 10;
            this.averageTime = Math.max(30, Math.min(120, this.averageTime + adjustment));
            averageTime.textContent = this.formatTime(Math.round(this.averageTime));
        }
    }
    
    formatTime(seconds) {
        if (seconds < 60) {
            return `${seconds}秒`;
        } else {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins}分${secs}秒`;
        }
    }
}

// 2.图片上传与预览特效：上传售后凭证，实时预览与校验
class ImageUploadPreview {
    constructor() {
        this.uploadModal = null;
        this.init();
    }
    
    init() {
        // 创建上传模态框
        this.createUploadModal();
        
        // 绑定事件
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('upload-btn')) {
                this.showUploadModal();
            }
            
            if (e.target.classList.contains('modal-close-upload') || 
                e.target.classList.contains('upload-modal')) {
                this.hideUploadModal();
            }
            
            if (e.target.classList.contains('file-input-trigger')) {
                document.querySelector('.file-input').click();
            }
            
            if (e.target.classList.contains('submit-appeal')) {
                this.submitAppeal();
            }
        });
        
        // 文件选择事件
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('file-input')) {
                this.handleFileSelect(e.target.files[0]);
            }
        });
    }
    
    createUploadModal() {
        this.uploadModal = document.createElement('div');
        this.uploadModal.className = 'upload-modal';
        
        this.uploadModal.innerHTML = `
            <div class="upload-content">
                <span class="modal-close-upload">&times;</span>
                <h3>📷 上传问题图片</h3>
                <div class="upload-area">
                    <div class="file-input-trigger">
                        <div>📁 点击选择图片或拖拽到此处</div>
                        <div class="file-hint">支持 JPG, PNG 格式，最大10MB</div>
                    </div>
                    <input type="file" class="file-input" accept="image/*" style="display: none;">
                </div>
                <div class="preview-container" style="display: none;">
                    <h4>图片预览:</h4>
                    <img class="preview-image" src="" alt="预览图片" style="max-width: 100%; max-height: 200px;">
                </div>
                <div class="description-area">
                    <h4>问题描述:</h4>
                    <textarea class="problem-description" placeholder="请详细描述您遇到的问题..." rows="4"></textarea>
                </div>
                <button class="submit-appeal">提交申诉</button>
            </div>
        `;
        
        document.body.appendChild(this.uploadModal);
    }
    
    showUploadModal() {
        this.uploadModal.style.display = 'flex';
        
        // 使用JavaScript实现淡入滑入动画
        const uploadContent = this.uploadModal.querySelector('.upload-content');
        if (uploadContent) {
            uploadContent.style.opacity = '0';
            uploadContent.style.transform = 'translateY(20px)';
            requestAnimationFrame(() => {
                uploadContent.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
                uploadContent.style.opacity = '1';
                uploadContent.style.transform = 'translateY(0)';
            });
        }
    }
    
    hideUploadModal() {
        this.uploadModal.style.display = 'none';
    }
    
    handleFileSelect(file) {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const previewContainer = this.uploadModal.querySelector('.preview-container');
                const previewImage = this.uploadModal.querySelector('.preview-image');
                
                previewImage.src = e.target.result;
                previewContainer.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            alert('请选择有效的图片文件！');
        }
    }
    
    submitAppeal() {
        const description = this.uploadModal.querySelector('.problem-description').value;
        const hasImage = this.uploadModal.querySelector('.preview-image').src !== '';
        
        if (!hasImage) {
            alert('请上传问题图片！');
            return;
        }
        
        if (!description.trim()) {
            alert('请填写问题描述！');
            return;
        }
        
        // 模拟提交过程
        const submitButton = this.uploadModal.querySelector('.submit-appeal');
        submitButton.textContent = '提交中...';
        submitButton.disabled = true;
        
        setTimeout(() => {
            alert('提交成功！我们的客服将在60秒内响应您的请求。');
            this.hideUploadModal();
            
            // 重置表单
            this.uploadModal.querySelector('.preview-container').style.display = 'none';
            this.uploadModal.querySelector('.problem-description').value = '';
            submitButton.textContent = '提交申诉';
            submitButton.disabled = false;
        }, 1500);
    }
}

// 视觉增强：SLA 进度条、卡片浮动光圈、顶部信任条
// 作用：用可视进度与光圈反馈强化售后“速度+信任”感知
class AfterSalesEffects {
    constructor() {
        this.init();
    }

    init() {
        this.addSlaProgress();
        this.addCardHalo();
        this.addTrustRibbon();
        this.addProcessingWaveEffect();
    }

    // 为统计区域添加 SLA 进度条
    addSlaProgress() {
        const header = document.querySelector('#after-sales .processing-header');
        if (!header || header.querySelector('.sla-progress')) return;
        const bar = document.createElement('div');
        bar.className = 'sla-progress';
        Object.assign(bar.style, {
            marginTop: '10px',
            height: '6px',
            background: 'rgba(0,0,0,0.08)',
            borderRadius: '6px',
            overflow: 'hidden'
        });
        const fill = document.createElement('div');
        fill.className = 'sla-progress-fill';
        fill.style.height = '100%';
        fill.style.width = '100%';
        fill.style.background = 'linear-gradient(90deg,#4caf50,#8bc34a)';
        fill.style.transformOrigin = 'left';
        fill.style.transform = 'scaleX(0.72)';
        fill.style.transition = 'transform 0.45s ease';
        bar.appendChild(fill);
        header.appendChild(bar);
        setTimeout(() => { fill.style.transform = 'scaleX(0.92)'; }, 120);
    }

    // 卡片浮动光圈效果（至少15行）
    addCardHalo() {
        const cards = document.querySelectorAll('#after-sales .marquee-item, #after-sales .upload-content');
        cards.forEach((card) => {
            card.style.position = 'relative';
            card.style.transition = 'background 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease';
            
            // 创建光圈元素
            let halo = card.querySelector('.halo-effect');
            if (!halo) {
                halo = document.createElement('div');
                halo.className = 'halo-effect';
                halo.style.position = 'absolute';
                halo.style.pointerEvents = 'none';
                halo.style.width = '180px';
                halo.style.height = '180px';
                halo.style.borderRadius = '50%';
                halo.style.background = 'radial-gradient(circle, rgba(0,188,212,0.25), transparent 70%)';
                halo.style.filter = 'blur(25px)';
                halo.style.opacity = '0';
                halo.style.transition = 'opacity 0.3s ease, transform 0.1s ease';
                card.appendChild(halo);
            }
            
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                card.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.16), transparent 60%)`;
                card.style.boxShadow = '0 10px 24px rgba(0,0,0,0.12)';
                card.style.transform = 'translateY(-2px)';
                
                // 更新光圈位置
                halo.style.left = `${x - 90}px`;
                halo.style.top = `${y - 90}px`;
                halo.style.opacity = '1';
                halo.style.transform = 'scale(1)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.background = '';
                card.style.boxShadow = '';
                card.style.transform = 'translateY(0)';
                halo.style.opacity = '0';
                halo.style.transform = 'scale(0.8)';
            });
        });
    }

    // 顶部信任条，突出售后保障（至少15行）
    addTrustRibbon() {
        const container = document.getElementById('after-sales');
        if (!container || container.querySelector('.trust-ribbon')) return;
        
        const ribbon = document.createElement('div');
        ribbon.className = 'trust-ribbon';
        Object.assign(ribbon.style, {
            position: 'sticky',
            top: '6px',
            padding: '8px 12px',
            background: 'linear-gradient(90deg,#00bcd4,#4caf50)',
            color: '#fff',
            borderRadius: '12px',
            fontWeight: 'bold',
            boxShadow: '0 8px 20px rgba(0,0,0,0.18)',
            zIndex: 12,
            maxWidth: '260px',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
        });
        ribbon.textContent = '先行赔付 · 7x24h 极速处理';
        
        // 添加悬停效果
        ribbon.addEventListener('mouseenter', () => {
            ribbon.style.transform = 'scale(1.05) translateY(-2px)';
            ribbon.style.boxShadow = '0 12px 28px rgba(0,0,0,0.25)';
        });
        
        ribbon.addEventListener('mouseleave', () => {
            ribbon.style.transform = 'scale(1) translateY(0)';
            ribbon.style.boxShadow = '0 8px 20px rgba(0,0,0,0.18)';
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

    // 处理进度波浪特效：SLA进度条上的波浪流动效果（至少15行）
    addProcessingWaveEffect() {
        const container = document.getElementById('after-sales');
        if (!container) return;
        
        const slaProgress = container.querySelector('.sla-progress-fill');
        if (!slaProgress) return;
        
        // 创建波浪层
        const waveLayer = document.createElement('div');
        waveLayer.style.position = 'absolute';
        waveLayer.style.top = '0';
        waveLayer.style.left = '0';
        waveLayer.style.width = '100%';
        waveLayer.style.height = '100%';
        waveLayer.style.background = 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)';
        waveLayer.style.backgroundSize = '200% 100%';
        waveLayer.style.opacity = '0.6';
        waveLayer.style.pointerEvents = 'none';
        
        const progressBar = slaProgress.parentElement;
        progressBar.style.position = 'relative';
        progressBar.style.overflow = 'hidden';
        progressBar.appendChild(waveLayer);
        
        // 波浪流动动画
        let startTime = null;
        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = (elapsed % 2000) / 2000;
            
            // 波浪从左到右移动
            const xPosition = -100 + progress * 200;
            waveLayer.style.backgroundPosition = `${xPosition}% 0`;
            
            // 波浪透明度变化
            const opacity = 0.3 + Math.sin(progress * Math.PI * 2) * 0.3;
            waveLayer.style.opacity = opacity;
            
            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AfterSalesEffects();
});

// 快速响应倒计时特效
class QuickResponseCountdown {
    constructor() {
        this.countdownValue = 60; // 60秒响应承诺
        this.init();
    }
    
    init() {
        // 创建响应承诺展示
        this.createPromiseDisplay();
        
        // 启动倒计时
        this.startCountdown();
    }
    
    createPromiseDisplay() {
        const container = document.getElementById('after-sales');
        if (container) {
            const promiseSection = document.createElement('div');
            promiseSection.className = 'response-promise';
            promiseSection.innerHTML = `
                <div class="promise-title">⚡ 60秒快速响应承诺</div>
                <div class="countdown-circle">
                    <span class="countdown-display">${this.countdownValue}</span>
                </div>
                <p>提交售后申请后，客服将在60秒内响应</p>
                <div class="promise-features">
                    <div class="feature"><span class="feature-icon">✅</span> 立即退款</div>
                    <div class="feature"><span class="feature-icon">📦</span> 免费补发</div>
                    <div class="feature"><span class="feature-icon">📞</span> 人工客服</div>
                </div>
            `;
            
            // 插入到合适位置
            const firstChild = container.firstChild;
            container.insertBefore(promiseSection, firstChild);
        }
    }
    
    startCountdown() {
        const countdownElement = document.querySelector('.countdown-display');
        if (countdownElement) {
            const updateCountdown = () => {
                this.countdownValue = (this.countdownValue - 1 + 60) % 60; // 循环倒计时
                if (this.countdownValue === 0) this.countdownValue = 60;
                countdownElement.textContent = this.countdownValue;
            };
            
            setInterval(updateCountdown, 1000);
        }
    }
}

// 初始化无忧售后模块
document.addEventListener('DOMContentLoaded', function() {
    // 加载CSS模块
    loadCSS('../../css/modules/afterSales.css');
    
    // 创建模块容器
    const container = document.getElementById('after-sales');
    if (container) {
        container.innerHTML = `
            <h2>无忧售后</h2>
            <div class="after-sales-content">
                <p>拍照上传，人工客服60秒内响应，立刻退款或补发</p>
                <button class="upload-btn">📷 上传问题图片申请售后</button>
                
                <div class="service-info">
                    <h3>售后服务说明</h3>
                    <ul>
                        <li>✅ 收到商品后24小时内可申请售后</li>
                        <li>✅ 拍照上传问题商品，客服60秒内响应</li>
                        <li>✅ 确认问题后立即退款或免费补发</li>
                        <li>✅ 全程人工客服服务，处理更贴心</li>
                    </ul>
                </div>
            </div>
        `;
        
        // 初始化特效
        new RealTimeProcessingDisplay();
        new ImageUploadPreview();
        new QuickResponseCountdown();
    }
});