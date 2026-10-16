const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 连接数据库
const dbPath = path.join(__dirname, 'db/shengxianda.db');
const db = new sqlite3.Database(dbPath);

console.log('开始添加商品数据...');
console.log(`连接到数据库: ${dbPath}`);

// 定义商品分类
const categories = [
    'freshProduce',
    'meatPoultry',
    'seafood',
    'dairyBakery',
    'beanProducts',
    'readyMeals'
];

// 真实商品数据
const productData = {
    freshProduce: [
        {
            name: '智利进口车厘子',
            category: 'freshProduce',
            price: 128.00,
            image: 'https://via.placeholder.com/200x200/FF5722/white?text=智利车厘子',
            description: '智利进口JJ级车厘子，新鲜采摘，果肉饱满，甜度高',
            isSpecialOffer: true,
            isFlashSale: false,
            stock: 50
        },
        {
            name: '泰国金枕榴莲',
            category: 'freshProduce',
            price: 89.90,
            image: 'https://via.placeholder.com/200x200/8BC34A/white?text=泰国榴莲',
            description: '泰国金枕榴莲，果肉金黄，香气浓郁，口感醇厚',
            isSpecialOffer: false,
            isFlashSale: true,
            flashSaleEndTime: new Date(Date.now() + 86400000).toISOString().slice(0, 19).replace('T', ' '),
            stock: 30
        },
        {
            name: '山东烟台红富士苹果',
            category: 'freshProduce',
            price: 35.80,
            image: 'https://via.placeholder.com/200x200/FF9800/white?text=红富士苹果',
            description: '山东烟台红富士苹果，脆甜多汁，果形端正',
            isSpecialOffer: false,
            isFlashSale: false,
            stock: 100
        },
        {
            name: '有机西兰花',
            category: 'freshProduce',
            price: 12.50,
            image: 'https://via.placeholder.com/200x200/4CAF50/white?text=有机西兰花',
            description: '有机种植西兰花，营养丰富，口感爽脆',
            isSpecialOffer: false,
            isFlashSale: false,
            stock: 80
        },
        {
            name: '广西砂糖橘',
            category: 'freshProduce',
            price: 25.80,
            image: 'https://via.placeholder.com/200x200/FFC107/white?text=砂糖橘',
            description: '广西砂糖橘，皮薄多汁，甜度高，无核',
            isSpecialOffer: true,
            isFlashSale: false,
            stock: 120
        }
    ],
    meatPoultry: [
        {
            name: '澳洲和牛M9雪花牛排',
            category: 'meatPoultry',
            price: 198.00,
            image: 'https://via.placeholder.com/200x200/F44336/white?text=和牛牛排',
            description: '澳洲进口和牛M9雪花牛排，大理石花纹，入口即化',
            isSpecialOffer: true,
            isFlashSale: false,
            stock: 20
        },
        {
            name: '农家散养土鸡肉',
            category: 'meatPoultry',
            price: 58.00,
            image: 'https://via.placeholder.com/200x200/2196F3/white?text=土鸡肉',
            description: '散养土鸡，肉质紧实，营养丰富',
            isSpecialOffer: false,
            isFlashSale: false,
            stock: 40
        },
        {
            name: '新鲜猪排骨',
            category: 'meatPoultry',
            price: 39.80,
            image: 'https://via.placeholder.com/200x200/795548/white?text=猪排骨',
            description: '新鲜猪排骨，适合煲汤、红烧',
            isSpecialOffer: false,
            isFlashSale: true,
            flashSaleEndTime: new Date(Date.now() + 86400000).toISOString().slice(0, 19).replace('T', ' '),
            stock: 60
        },
        {
            name: '柴鸡蛋',
            category: 'meatPoultry',
            price: 28.50,
            image: 'https://via.placeholder.com/200x200/FF5722/white?text=柴鸡蛋',
            description: '农家散养柴鸡蛋，蛋黄饱满，营养丰富',
            isSpecialOffer: false,
            isFlashSale: false,
            stock: 150
        },
        {
            name: '内蒙羔羊肉卷',
            category: 'meatPoultry',
            price: 89.90,
            image: 'https://via.placeholder.com/200x200/9C27B0/white?text=羔羊肉卷',
            description: '内蒙古羔羊肉卷，肉质鲜嫩，无膻味',
            isSpecialOffer: true,
            isFlashSale: false,
            stock: 50
        }
    ],
    seafood: [
        {
            name: '鲜活波士顿龙虾',
            category: 'seafood',
            price: 268.00,
            image: 'https://via.placeholder.com/200x200/00BCD4/white?text=波士顿龙虾',
            description: '鲜活波士顿龙虾，肉质饱满，口感鲜美',
            isSpecialOffer: false,
            isFlashSale: true,
            flashSaleEndTime: new Date(Date.now() + 86400000).toISOString().slice(0, 19).replace('T', ' '),
            stock: 15
        },
        {
            name: '挪威三文鱼',
            category: 'seafood',
            price: 138.00,
            image: 'https://via.placeholder.com/200x200/F44336/white?text=三文鱼',
            description: '挪威进口三文鱼，可生食，富含Omega-3',
            isSpecialOffer: true,
            isFlashSale: false,
            stock: 40
        },
        {
            name: '鲜活大闸蟹',
            category: 'seafood',
            price: 128.00,
            image: 'https://via.placeholder.com/200x200/8BC34A/white?text=大闸蟹',
            description: '阳澄湖大闸蟹，蟹黄饱满，肉质鲜美',
            isSpecialOffer: false,
            isFlashSale: false,
            stock: 30
        },
        {
            name: '皮皮虾',
            category: 'seafood',
            price: 68.00,
            image: 'https://via.placeholder.com/200x200/FFC107/white?text=皮皮虾',
            description: '新鲜皮皮虾，肉质饱满，适合椒盐',
            isSpecialOffer: false,
            isFlashSale: false,
            stock: 80
        },
        {
            name: '鲍鱼',
            category: 'seafood',
            price: 168.00,
            image: 'https://via.placeholder.com/200x200/3F51B5/white?text=鲍鱼',
            description: '鲜活鲍鱼，营养丰富，口感Q弹',
            isSpecialOffer: true,
            isFlashSale: false,
            stock: 25
        }
    ],
    dairyBakery: [
        {
            name: '明治醇壹牛奶',
            category: 'dairyBakery',
            price: 18.90,
            image: 'https://via.placeholder.com/200x200/2196F3/white?text=明治牛奶',
            description: '日本明治醇壹牛奶，口感醇厚，营养丰富',
            isSpecialOffer: false,
            isFlashSale: false,
            stock: 100
        },
        {
            name: '光明如实酸奶',
            category: 'dairyBakery',
            price: 25.80,
            image: 'https://via.placeholder.com/200x200/4CAF50/white?text=如实酸奶',
            description: '光明如实酸奶，无添加，健康选择',
            isSpecialOffer: true,
            isFlashSale: false,
            stock: 80
        },
        {
            name: '可颂面包',
            category: 'dairyBakery',
            price: 12.80,
            image: 'https://via.placeholder.com/200x200/FF9800/white?text=可颂面包',
            description: '新鲜烘焙可颂面包，外酥里嫩，奶香浓郁',
            isSpecialOffer: false,
            isFlashSale: false,
            stock: 60
        },
        {
            name: '芝士蛋糕',
            category: 'dairyBakery',
            price: 48.00,
            image: 'https://via.placeholder.com/200x200/FFC107/white?text=芝士蛋糕',
            description: '浓郁芝士蛋糕，口感细腻，甜而不腻',
            isSpecialOffer: false,
            isFlashSale: true,
            flashSaleEndTime: new Date(Date.now() + 86400000).toISOString().slice(0, 19).replace('T', ' '),
            stock: 30
        },
        {
            name: '老酸奶',
            category: 'dairyBakery',
            price: 9.90,
            image: 'https://via.placeholder.com/200x200/795548/white?text=老酸奶',
            description: '传统工艺老酸奶，凝固型，口感醇厚',
            isSpecialOffer: true,
            isFlashSale: false,
            stock: 150
        }
    ],
    beanProducts: [
        {
            name: '手工豆腐',
            category: 'beanProducts',
            price: 5.90,
            image: 'https://via.placeholder.com/200x200/8BC34A/white?text=手工豆腐',
            description: '传统手工豆腐，豆香浓郁，口感细腻',
            isSpecialOffer: false,
            isFlashSale: false,
            stock: 200
        },
        {
            name: '腐竹',
            category: 'beanProducts',
            price: 15.80,
            image: 'https://via.placeholder.com/200x200/F44336/white?text=腐竹',
            description: '优质黄豆制作，营养丰富，适合凉拌、煮汤',
            isSpecialOffer: true,
            isFlashSale: false,
            stock: 100
        },
        {
            name: '豆腐干',
            category: 'beanProducts',
            price: 6.50,
            image: 'https://via.placeholder.com/200x200/00BCD4/white?text=豆腐干',
            description: '五香豆腐干，口感筋道，适合即食',
            isSpecialOffer: false,
            isFlashSale: false,
            stock: 180
        },
        {
            name: '红豆',
            category: 'beanProducts',
            price: 10.80,
            image: 'https://via.placeholder.com/200x200/FF5722/white?text=红豆',
            description: '东北红豆，颗粒饱满，适合煮粥、做豆沙',
            isSpecialOffer: false,
            isFlashSale: false,
            stock: 120
        },
        {
            name: '绿豆',
            category: 'beanProducts',
            price: 9.80,
            image: 'https://via.placeholder.com/200x200/4CAF50/white?text=绿豆',
            description: '明绿豆，清热解暑，适合熬汤',
            isSpecialOffer: true,
            isFlashSale: false,
            stock: 150
        }
    ],
    readyMeals: [
        {
            name: '海底捞自热火锅',
            category: 'readyMeals',
            price: 29.90,
            image: 'https://via.placeholder.com/200x200/F44336/white?text=自热火锅',
            description: '海底捞自热火锅，方便快捷，味道正宗',
            isSpecialOffer: false,
            isFlashSale: true,
            flashSaleEndTime: new Date(Date.now() + 86400000).toISOString().slice(0, 19).replace('T', ' '),
            stock: 80
        },
        {
            name: '康师傅红烧牛肉面',
            category: 'readyMeals',
            price: 5.50,
            image: 'https://via.placeholder.com/200x200/FFC107/white?text=牛肉面',
            description: '经典红烧牛肉面，方便快捷，味道好',
            isSpecialOffer: false,
            isFlashSale: false,
            stock: 200
        },
        {
            name: '三全速冻饺子',
            category: 'readyMeals',
            price: 18.80,
            image: 'https://via.placeholder.com/200x200/3F51B5/white?text=速冻饺子',
            description: '三全速冻饺子，多种口味选择，方便快捷',
            isSpecialOffer: true,
            isFlashSale: false,
            stock: 150
        },
        {
            name: '湾仔码头汤圆',
            category: 'readyMeals',
            price: 22.80,
            image: 'https://via.placeholder.com/200x200/FF9800/white?text=汤圆',
            description: '湾仔码头汤圆，皮薄馅大，口感细腻',
            isSpecialOffer: false,
            isFlashSale: false,
            stock: 100
        },
        {
            name: '统一老坛酸菜面',
            category: 'readyMeals',
            price: 6.50,
            image: 'https://via.placeholder.com/200x200/2196F3/white?text=酸菜面',
            description: '统一老坛酸菜面，酸辣爽口，味道正宗',
            isSpecialOffer: true,
            isFlashSale: false,
            stock: 250
        }
    ]
};

// 清空现有商品数据
function clearExistingProducts() {
    return new Promise((resolve, reject) => {
        console.log('开始清空现有商品数据...');
        db.run("DELETE FROM products", (err) => {
            if (err) {
                console.error('清空商品数据失败:', err.message);
                reject(err);
                return;
            }
            console.log('现有商品数据已清空');
            resolve();
        });
    });
}

// 添加商品数据
function addProducts() {
    return new Promise((resolve, reject) => {
        console.log('开始添加新商品数据...');
        
        let addedCount = 0;
        let totalCount = 0;
        
        // 计算总商品数量
        categories.forEach(category => {
            totalCount += productData[category].length;
        });
        
        // 插入商品数据
        const stmt = db.prepare(`INSERT INTO products 
            (name, category, price, image, description, is_special_offer, is_flash_sale, flash_sale_end_time, stock) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
        
        // 遍历所有分类的商品数据
        categories.forEach(category => {
            productData[category].forEach(product => {
                stmt.run([
                    product.name,
                    product.category,
                    product.price,
                    product.image,
                    product.description,
                    product.isSpecialOffer ? 1 : 0,
                    product.isFlashSale ? 1 : 0,
                    product.flashSaleEndTime || null,
                    product.stock || 0
                ], function(err) {
                    if (err) {
                        console.error(`添加商品 ${product.name} 失败:`, err.message);
                    } else {
                        addedCount++;
                        console.log(`已添加商品 ${addedCount}/${totalCount}: ${product.name}`);
                    }
                    
                    // 所有商品添加完成
                    if (addedCount === totalCount) {
                        stmt.finalize();
                        console.log('\n所有商品数据添加完成');
                        resolve();
                    }
                });
            });
        });
    });
}

// 执行商品数据添加流程
async function executeAddProductData() {
    try {
        await clearExistingProducts();
        await addProducts();
        console.log('\n=== 商品数据添加成功 ===');
        console.log(`共添加了 ${Object.values(productData).reduce((sum, category) => sum + category.length, 0)} 件商品`);
        categories.forEach(category => {
            console.log(`- ${category}: ${productData[category].length} 件商品`);
        });
    } catch (err) {
        console.error('商品数据添加失败:', err.message);
    } finally {
        db.close();
    }
}

// 执行脚本
executeAddProductData();