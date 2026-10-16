const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 连接数据库
const dbPath = path.join(__dirname, 'db', 'shengxianda.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('连接数据库失败:', err.message);
        return;
    }
    console.log('成功连接到 SQLite 数据库');
});

// 定义各个模块的数据
const allProducts = [];

// 1. 水产海鲜数据
const seafoodProducts = [
    { name: '大闸蟹', price: 88.00, desc: '阳澄湖大闸蟹，蟹黄饱满', badge: '鲜活', category: 'seafood' },
    { name: '基围虾', price: 68.00, desc: '新鲜活虾，肉质鲜美', badge: '鲜活', category: 'seafood' },
    { name: '鲈鱼', price: 58.00, desc: '海捕鲈鱼，无刺少骨', badge: '海捕', category: 'seafood' },
    { name: '三文鱼', price: 98.00, desc: '挪威进口，可生食', badge: '进口', category: 'seafood' },
    { name: '小龙虾', price: 48.00, desc: '盱眙小龙虾，麻辣鲜香', badge: '鲜活', category: 'seafood' },
    { name: '多宝鱼', price: 78.00, desc: '肉质鲜嫩，营养丰富', badge: '活鲜', category: 'seafood' },
    { name: '帝王蟹', price: 298.00, desc: '进口帝王蟹，个大肉多', badge: '进口', category: 'seafood' },
    { name: '扇贝', price: 38.00, desc: '鲜活扇贝，蒜蓉蒸制最佳', badge: '鲜活', category: 'seafood' },
    { name: '黄花鱼', price: 45.00, desc: '野生黄花鱼，肉质细腻', badge: '海捕', category: 'seafood' },
    { name: '鲍鱼', price: 29.90, desc: '大连鲍，营养丰富', badge: '活鲜', category: 'seafood' },
    { name: '生蚝', price: 12.00, desc: '新鲜生蚝，可清蒸可生食', badge: '鲜活', category: 'seafood' },
    { name: '龙利鱼', price: 35.00, desc: '无刺无骨，适合老人小孩', badge: '冷冻', category: 'seafood' }
];

seafoodProducts.forEach(product => {
    allProducts.push({
        name: product.name,
        category: product.category,
        price: product.price,
        image: 'src/seafood.png',
        description: product.desc,
        is_special_offer: false,
        is_flash_sale: false,
        stock: 100
    });
});

// 2. 肉禽蛋品数据
const meatProducts = [
    { type: 'pork', name: '猪五花肉', price: 38.90, category: 'meatPoultry' },
    { type: 'pork', name: '猪里脊肉', price: 42.50, category: 'meatPoultry' },
    { type: 'pork', name: '猪排骨', price: 46.80, category: 'meatPoultry' },
    { type: 'pork', name: '猪后腿肉', price: 36.90, category: 'meatPoultry' },
    { type: 'beef', name: '牛里脊', price: 89.90, category: 'meatPoultry' },
    { type: 'beef', name: '牛腩肉', price: 68.90, category: 'meatPoultry' },
    { type: 'beef', name: '牛排', price: 98.00, category: 'meatPoultry' },
    { type: 'beef', name: '牛肉馅', price: 56.90, category: 'meatPoultry' },
    { type: 'chicken', name: '鸡胸肉', price: 28.90, category: 'meatPoultry' },
    { type: 'chicken', name: '鸡腿肉', price: 32.90, category: 'meatPoultry' },
    { type: 'chicken', name: '整鸡', price: 49.90, category: 'meatPoultry' },
    { type: 'chicken', name: '鸡翅中', price: 42.90, category: 'meatPoultry' },
    { type: 'duck', name: '鸭脖', price: 39.90, category: 'meatPoultry' },
    { type: 'duck', name: '鸭腿', price: 29.90, category: 'meatPoultry' },
    { type: 'duck', name: '整鸭', price: 69.90, category: 'meatPoultry' },
    { type: 'goose', name: '鹅胸肉', price: 58.90, category: 'meatPoultry' },
    { type: 'egg', name: '土鸡蛋', price: 29.90, category: 'meatPoultry' },
    { type: 'egg', name: '草鸡蛋', price: 32.90, category: 'meatPoultry' },
    { type: 'egg', name: '柴鸡蛋', price: 35.90, category: 'meatPoultry' },
    { type: 'egg', name: '散养鸡蛋', price: 38.90, category: 'meatPoultry' },
    { type: 'egg', name: '咸鸭蛋', price: 3.50, category: 'meatPoultry' },
    { type: 'egg', name: '松花蛋', price: 4.50, category: 'meatPoultry' }
];

meatProducts.forEach(product => {
    allProducts.push({
        name: product.name,
        category: product.category,
        price: product.price,
        image: 'src/shengxian.png',
        description: '优质肉禽蛋品，安全放心',
        is_special_offer: false,
        is_flash_sale: false,
        stock: 100
    });
});

// 3. 新鲜果蔬数据
const freshProduceProducts = {
    '叶菜': ['菠菜', '生菜', '油菜', '空心菜', '白菜', '油麦菜', '香菜', '韭菜', '芹菜', '茼蒿', '芥蓝', '娃娃菜'],
    '根茎': ['土豆', '胡萝卜', '白萝卜', '洋葱', '大蒜', '生姜', '山药', '莲藕', '芋头', '红薯', '紫薯', '马蹄'],
    '瓜果': ['西红柿', '黄瓜', '茄子', '辣椒', '南瓜', '冬瓜', '丝瓜', '苦瓜', '西葫芦', '角瓜', '佛手瓜', '瓠瓜'],
    '菌菇': ['香菇', '平菇', '金针菇', '杏鲍菇', '口蘑', '茶树菇', '猴头菇', '竹荪', '草菇', '滑子菇', '牛肝菌', '羊肚菌']
};

for (const [category, products] of Object.entries(freshProduceProducts)) {
    products.forEach(productName => {
        allProducts.push({
            name: productName,
            category: 'freshProduce',
            price: parseFloat((Math.random() * 20 + 5).toFixed(2)),
            image: 'src/fruit.png',
            description: '每日新鲜采购，保证品质',
            is_special_offer: false,
            is_flash_sale: false,
            stock: 100
        });
    });
}

// 4. 豆制品数据
const beanProducts = [
    { name: '豆腐', price: 3.50, desc: '新鲜卤水豆腐，质地细腻', category: 'beanProducts' },
    { name: '豆浆', price: 2.50, desc: '现磨豆浆，营养丰富', category: 'beanProducts' },
    { name: '豆腐干', price: 5.50, desc: '传统工艺制作，豆香浓郁', category: 'beanProducts' },
    { name: '豆腐皮', price: 8.50, desc: '薄如蝉翼，口感顺滑', category: 'beanProducts' },
    { name: '腐竹', price: 12.50, desc: '优质黄豆制作，营养丰富', category: 'beanProducts' },
    { name: '千张', price: 6.50, desc: '多层压制，韧性十足', category: 'beanProducts' },
    { name: '素鸡', price: 7.50, desc: '素中之荤，口感鲜嫩', category: 'beanProducts' },
    { name: '豆腐泡', price: 4.50, desc: '油炸豆腐泡，外酥里嫩', category: 'beanProducts' },
    { name: '豆芽', price: 2.00, desc: '新鲜发芽，脆嫩可口', category: 'beanProducts' },
    { name: '红豆', price: 9.50, desc: '优质红豆，颗粒饱满', category: 'beanProducts' },
    { name: '绿豆', price: 8.50, desc: '新鲜绿豆，清热解暑', category: 'beanProducts' },
    { name: '黄豆', price: 7.50, desc: '优质黄豆，营养丰富', category: 'beanProducts' }
];

beanProducts.forEach(product => {
    allProducts.push({
        name: product.name,
        category: product.category,
        price: product.price,
        image: 'src/shengxian.png',
        description: product.desc,
        is_special_offer: false,
        is_flash_sale: false,
        stock: 100
    });
});

// 5. 粮油干货数据
const grainProducts = [
    { name: '大米', price: 5.50, desc: '优质东北大米，口感软糯', category: 'beanProducts' },
    { name: '小米', price: 8.50, desc: '山西小米，色泽金黄', category: 'beanProducts' },
    { name: '面粉', price: 4.50, desc: '高筋面粉，适合烘焙', category: 'beanProducts' },
    { name: '玉米粉', price: 3.50, desc: '粗细均匀，口感细腻', category: 'beanProducts' },
    { name: '荞麦面', price: 9.50, desc: '低脂低糖，健康首选', category: 'beanProducts' },
    { name: '燕麦片', price: 12.50, desc: '即食燕麦片，营养早餐', category: 'beanProducts' },
    { name: '核桃', price: 25.50, desc: '薄皮核桃，果仁饱满', category: 'beanProducts' },
    { name: '杏仁', price: 22.50, desc: '原味杏仁，营养丰富', category: 'beanProducts' },
    { name: '红枣', price: 15.50, desc: '新疆红枣，香甜可口', category: 'beanProducts' },
    { name: '葡萄干', price: 18.50, desc: '无核葡萄干，酸甜适中', category: 'beanProducts' },
    { name: '枸杞', price: 35.50, desc: '宁夏枸杞，颗粒饱满', category: 'beanProducts' },
    { name: '桂圆', price: 28.50, desc: '福建桂圆，肉厚核小', category: 'beanProducts' }
];

grainProducts.forEach(product => {
    allProducts.push({
        name: product.name,
        category: 'beanProducts',
        price: product.price,
        image: 'src/shengxian.png',
        description: product.desc,
        is_special_offer: false,
        is_flash_sale: false,
        stock: 100
    });
});

// 6. 方便速食数据
const readyMeals = [
    { name: '方便米饭', price: 12.50, desc: '自热米饭，方便快捷', category: 'readyMeals' },
    { name: '泡面', price: 3.50, desc: '经典口味，随时享用', category: 'readyMeals' },
    { name: '速冻饺子', price: 15.50, desc: '手工包制，口感鲜美', category: 'readyMeals' },
    { name: '速冻汤圆', price: 12.50, desc: '芝麻馅，香甜可口', category: 'readyMeals' },
    { name: '手抓饼', price: 18.50, desc: '层层酥脆，营养早餐', category: 'readyMeals' },
    { name: '馄饨', price: 16.50, desc: '鲜肉馄饨，皮薄馅大', category: 'readyMeals' },
    { name: '包子', price: 8.50, desc: '早餐包子，多种口味', category: 'readyMeals' },
    { name: '粽子', price: 5.50, desc: '端午粽子，传统美味', category: 'readyMeals' },
    { name: '蛋炒饭', price: 10.50, desc: '经典蛋炒饭，香气四溢', category: 'readyMeals' },
    { name: '炒面', price: 9.50, desc: '中式炒面，口感丰富', category: 'readyMeals' },
    { name: '汉堡', price: 15.50, desc: '经典汉堡，美味便捷', category: 'readyMeals' },
    { name: '披萨', price: 25.50, desc: '意大利披萨，芝士浓郁', category: 'readyMeals' }
];

readyMeals.forEach(product => {
    allProducts.push({
        name: product.name,
        category: product.category,
        price: product.price,
        image: 'src/youji.jpg',
        description: product.desc,
        is_special_offer: false,
        is_flash_sale: false,
        stock: 100
    });
});

// 插入数据到数据库
function insertProducts() {
    const stmt = db.prepare(`INSERT OR IGNORE INTO products 
        (name, category, price, image, description, is_special_offer, is_flash_sale, stock) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
    
    let count = 0;
    
    allProducts.forEach((product, index) => {
        stmt.run(
            product.name,
            product.category,
            product.price,
            product.image,
            product.description,
            product.is_special_offer,
            product.is_flash_sale,
            product.stock,
            (err) => {
                if (err) {
                    console.error(`插入产品 ${product.name} 失败:`, err.message);
                } else {
                    count++;
                }
                
                // 当所有产品都处理完毕时，关闭数据库连接
                if (index === allProducts.length - 1) {
                    stmt.finalize(() => {
                        console.log(`成功插入 ${count} 个产品到数据库`);
                        db.close((err) => {
                            if (err) {
                                console.error('关闭数据库连接失败:', err.message);
                            } else {
                                console.log('成功关闭数据库连接');
                            }
                        });
                    });
                }
            }
        );
    });
}

// 执行插入操作
insertProducts();
