# 冷鲜/冷冻 Tab 切换特效 关键代码（带详细注释）

## 核心类定义：MeatTemperatureTabs
```javascript
// 冷鲜/冷冻 Tab 切换特效核心类
class MeatTemperatureTabs {
    // 构造函数：初始化对象状态
    constructor() {
        this.currentTab = 'chilled'; // 当前选中的标签: 'chilled'表示冷鲜, 'frozen'表示冷冻
        this.currentProducts = [];   // 存储当前加载的商品数据，用于后续筛选和排序
        this.init();                 // 调用初始化方法
    }
    
    // 初始化方法：设置界面、绑定事件、加载数据和特效
    init() {
        this.createTabInterface();   // 创建 Tab 切换界面的 DOM 结构
        this.bindEvents();           // 绑定所有交互事件
        
        // 使用双重 requestAnimationFrame 确保 DOM 完全渲染后再初始化特效
        // 这样可以避免找不到 DOM 元素的错误
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const tabsContainer = document.querySelector('.temperature-tabs');
                if (tabsContainer) {
                    this.addTemperatureBar();      // 添加温度示意条特效
                    this.addThermometerNeedle();   // 添加温度计指针摆动特效
                    
                    // 确保默认激活的标签正确显示
                    document.querySelectorAll('.temp-tab').forEach(btn => {
                        const isActive = btn.getAttribute('data-tab') === this.currentTab;
                        btn.classList.toggle('active', isActive);
                    });
                } else {
                    // 如果容器还未准备好，延迟 100ms 后重试
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
        
        this.loadData(this.currentTab); // 加载默认标签的商品数据
    }
    
    // 创建 Tab 切换界面的 DOM 结构
    createTabInterface() {
        this.sortOrder = 'default'; // 默认排序方式: 默认排序
        
        const container = document.getElementById('meat-poultry');
        // 设置容器的 HTML 内容，包含模块标题、温度标签、分类标签、排序选项和商品网格
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
                <!-- 商品将在此处通过 JavaScript 动态加载 -->
            </div>
        `;
    }
    
    // 绑定所有交互事件
    bindEvents() {
        // 使用事件委托监听整个文档的点击事件
        document.addEventListener('click', (e) => {
            // 温度标签切换事件
            if (e.target.classList.contains('temp-tab')) {
                const tab = e.target.getAttribute('data-tab');
                this.switchTab(tab);
            }
            
            // 分类标签筛选事件
            if (e.target.classList.contains('category-tag')) {
                const type = e.target.getAttribute('data-type');
                this.filterByType(type);
            }
            
            // 排序选项切换事件
            if (e.target.classList.contains('sort-button')) {
                const sort = e.target.getAttribute('data-sort');
                this.changeSortOrder(sort);
            }
        });
    }
    
    // 核心方法：切换温度标签
    switchTab(tab) {
        this.currentTab = tab; // 更新当前选中标签
        
        // 更新标签按钮的激活状态
        document.querySelectorAll('.temp-tab').forEach(btn => {
            const isActive = btn.getAttribute('data-tab') === tab;
            btn.classList.toggle('active', isActive);
        });
        
        // 更新温度条进度和颜色
        const fill = document.querySelector('.temp-progress-fill');
        if (fill) {
            fill.style.width = tab === 'chilled' ? '48%' : '90%';
            fill.style.background = tab === 'chilled'
                ? 'linear-gradient(90deg,#e0f2fe,#bae6fd)'
                : 'linear-gradient(90deg,#bae6fd,#7dd3fc)';
        }
        
        // 更新温度计指针位置
        const needle = document.querySelector('.temp-needle');
        if (needle) {
            needle.style.transform = tab === 'chilled' ? 'rotate(-25deg)' : 'rotate(25deg)';
            needle.style.background = tab === 'chilled'
                ? 'rgba(14, 165, 233, 0.15)'
                : 'rgba(14, 165, 233, 0.2)';
        }
        
        this.loadData(tab); // 加载新标签对应的商品数据
    }
    
    // 添加温度示意条特效：展示冷鲜/冷冻状态的渐变进度条
    addTemperatureBar() {
        const tabs = document.querySelector('.temperature-tabs');
        if (!tabs) return; // 如果找不到容器，直接返回
        
        // 移除已存在的温度条，避免重复创建
        const existingBar = tabs.querySelector('.temp-progress');
        if (existingBar) {
            existingBar.remove();
        }
        
        // 创建温度条容器
        const bar = document.createElement('div');
        bar.className = 'temp-progress';
        // 设置温度条的 CSS 样式
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
        
        // 创建温度条填充部分
        const fill = document.createElement('div');
        fill.className = 'temp-progress-fill';
        fill.style.height = '100%';
        fill.style.width = '50%';
        fill.style.transition = 'width 0.35s ease, background 0.35s ease'; // 添加平滑过渡效果
        fill.style.background = 'linear-gradient(90deg,#e0f2fe,#bae6fd)'; // 默认背景渐变
        bar.appendChild(fill);
        
        tabs.style.position = 'relative'; // 设置容器为相对定位，使温度条的绝对定位生效
        tabs.appendChild(bar);
        
        // 定义温度条移动的函数
        const move = (tab) => {
            fill.style.width = tab === 'chilled' ? '48%' : '90%';
            fill.style.background = tab === 'chilled'
                ? 'linear-gradient(90deg,#e0f2fe,#bae6fd)'
                : 'linear-gradient(90deg,#bae6fd,#7dd3fc)';
        };
        
        move(this.currentTab); // 初始化时应用当前标签的设置
        
        // 监听标签点击事件，实时更新温度条
        document.addEventListener('click', (e) => {
            const t = e.target.closest('.temp-tab');
            if (t) {
                move(t.getAttribute('data-tab'));
            }
        });
    }
}
```

## 关键实现分析
- **核心功能**：实现冷鲜/冷冻商品的标签切换，并通过视觉特效反馈给用户
- **交互效果**：点击标签时，会同时更新标签激活状态、温度条进度、温度计指针位置
- **动画处理**：所有状态变化都使用 CSS transition 实现平滑过渡
- **DOM 操作**：动态创建和更新界面元素，确保功能完整性
- **数据加载**：切换标签时自动加载对应类别的商品数据