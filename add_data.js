const sqlite3 = require('sqlite3').verbose();

// 创建数据库连接
const db = new sqlite3.Database('local_specialties.db');

console.log('开始添加数据...');

// 使用事务确保数据一致性
db.serialize(() => {
    // 开始事务
    db.run('BEGIN TRANSACTION');
    
    // 创建 provinces 表（如果不存在）
    db.run(`
        CREATE TABLE IF NOT EXISTS provinces (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT
        )
    `);
    
    // 创建 local_products 表（如果不存在）
    db.run(`
        CREATE TABLE IF NOT EXISTS local_products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            province_id INTEGER NOT NULL,
            description TEXT,
            image_url TEXT,
            season TEXT,
            price REAL,
            discount REAL,
            FOREIGN KEY (province_id) REFERENCES provinces (id)
        )
    `);
    
    // 创建 products 表（如果不存在）
    db.run(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            price REAL NOT NULL,
            image_url TEXT,
            description TEXT
        )
    `);
    
    // 创建 users 表（如果不存在）
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        )
    `);
    
    // 插入省份数据
    const insertProvince = db.prepare('INSERT INTO provinces (name, description) VALUES (?, ?)');
    
    const provinces = [
        ['北京', '中国首都，拥有丰富的历史文化和传统美食'],
        ['四川', '中国西南地区省份，以川菜和丰富的自然资源闻名'],
        ['广东', '中国东南沿海省份，以粤菜和发达的经济著称'],
        ['浙江', '中国东部沿海省份，以江南水乡和龙井茶闻名'],
        ['山东', '中国东部沿海省份，以泰山和海鲜闻名'],
        ['新疆', '中国西北地区省份，以丰富的水果和少数民族文化闻名'],
        ['云南', '中国西南地区省份，以多样化的气候和民族文化闻名'],
        ['江苏', '中国东部沿海省份，以苏州园林和太湖银鱼闻名']
    ];
    
    provinces.forEach(province => {
        insertProvince.run(province[0], province[1]);
    });
    
    insertProvince.finalize();
    
    // 插入地方特产数据
    const insertLocalProduct = db.prepare(
        'INSERT INTO local_products (name, province_id, description, image_url, season, price, discount) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    
    // 使用picsum.photos作为图片源
    const generateImageUrl = (width, height, category) => {
        const imageId = Math.floor(Math.random() * 1000) + 1;
        return `https://picsum.photos/id/${imageId}/${width}/${height}?grayscale`;
    };
    
    const localProducts = [
        // 北京特产
        ['北京烤鸭', 1, '北京传统名菜，以烤制鸭子闻名', generateImageUrl(400, 300, 'food'), '全年', 298.00, 0.9],
        ['北京果脯', 1, '北京传统蜜饯食品，以水果为原料制作', generateImageUrl(400, 300, 'food'), '全年', 38.00, 0.8],
        ['北京二锅头', 1, '北京传统白酒，以高粱为原料酿制', generateImageUrl(400, 300, 'drink'), '全年', 88.00, 0.95],
        ['北京茯苓饼', 1, '北京传统小吃，以茯苓为主要原料', generateImageUrl(400, 300, 'food'), '全年', 25.00, 0.85],
        ['北京秋梨膏', 1, '北京传统药膳，以秋梨为主要原料', generateImageUrl(400, 300, 'medicine'), '秋季', 58.00, 0.8],
        
        // 四川特产
        ['四川火锅底料', 2, '四川特色调味品，用于制作火锅', generateImageUrl(400, 300, 'food'), '全年', 68.00, 0.8],
        ['四川豆瓣酱', 2, '四川传统调味品，用于制作川菜', generateImageUrl(400, 300, 'food'), '全年', 28.00, 0.85],
        ['四川腊肉', 2, '四川传统腌肉，以猪肉为原料腌制', generateImageUrl(400, 300, 'food'), '冬季', 98.00, 0.9],
        ['四川竹叶青', 2, '四川名茶，以峨眉山茶叶为原料', generateImageUrl(400, 300, 'drink'), '春季', 188.00, 0.85],
        ['四川张飞牛肉', 2, '四川传统牛肉干，以黄牛肉为原料', generateImageUrl(400, 300, 'food'), '全年', 78.00, 0.9],
        
        // 广东特产
        ['广东腊肠', 3, '广东传统腊味，以猪肉为原料腌制', generateImageUrl(400, 300, 'food'), '冬季', 88.00, 0.85],
        ['广东鸡仔饼', 3, '广东传统小吃，以面粉和猪肉为原料', generateImageUrl(400, 300, 'food'), '全年', 35.00, 0.8],
        ['广东陈皮', 3, '广东传统中药材，以柑橘皮为原料', generateImageUrl(400, 300, 'medicine'), '全年', 128.00, 0.9],
        ['广东荔枝干', 3, '广东传统干果，以荔枝为原料制作', generateImageUrl(400, 300, 'food'), '夏季', 68.00, 0.8],
        ['广东凉茶', 3, '广东传统饮品，具有清热解毒功效', generateImageUrl(400, 300, 'drink'), '夏季', 18.00, 0.95],
        
        // 浙江特产
        ['西湖龙井', 4, '浙江名茶，以龙井茶为原料', generateImageUrl(400, 300, 'drink'), '春季', 288.00, 0.85],
        ['杭州丝绸', 4, '浙江传统纺织品，以丝绸为原料', generateImageUrl(400, 300, 'fabric'), '全年', 388.00, 0.9],
        ['宁波汤圆', 4, '浙江传统小吃，以糯米和芝麻为原料', generateImageUrl(400, 300, 'food'), '冬季', 45.00, 0.8],
        ['绍兴黄酒', 4, '浙江传统黄酒，以糯米为原料酿制', generateImageUrl(400, 300, 'drink'), '全年', 158.00, 0.85],
        ['金华火腿', 4, '浙江传统腌肉，以猪肉为原料腌制', generateImageUrl(400, 300, 'food'), '冬季', 268.00, 0.9],
        
        // 山东特产
        ['烟台苹果', 5, '山东特产水果，以苹果为原料', generateImageUrl(400, 300, 'fruit'), '秋季', 88.00, 0.8],
        ['莱阳梨', 5, '山东特产水果，以梨为原料', generateImageUrl(400, 300, 'fruit'), '秋季', 78.00, 0.85],
        ['青岛啤酒', 5, '山东特产啤酒，以大麦和啤酒花为原料', generateImageUrl(400, 300, 'drink'), '全年', 68.00, 0.9],
        ['德州扒鸡', 5, '山东传统名菜，以鸡肉为原料制作', generateImageUrl(400, 300, 'food'), '全年', 98.00, 0.85],
        ['阿胶糕', 5, '山东传统保健品，以阿胶为原料', generateImageUrl(400, 300, 'medicine'), '全年', 168.00, 0.9]
    ];
    
    localProducts.forEach(product => {
        insertLocalProduct.run(
            product[0], product[1], product[2], product[3], product[4], product[5], product[6]
        );
    });
    
    insertLocalProduct.finalize();
    
    // 插入商品数据
    const insertProduct = db.prepare(
        'INSERT INTO products (name, category, price, image_url, description) VALUES (?, ?, ?, ?, ?)'
    );
    
    const categories = ['seafood', 'meat', 'vegetable', 'fruit', 'bean', 'dairy'];
    
    const products = [];
    
    // 海鲜类
    const seafoodNames = ['龙虾', '螃蟹', '扇贝', '鲍鱼', '海参', '三文鱼'];
    seafoodNames.forEach(name => {
        products.push([
            name, 'seafood', Math.random() * 200 + 50, 
            generateImageUrl(400, 300, 'seafood'), 
            `新鲜${name}，来自深海捕捞，营养丰富`
        ]);
    });
    
    // 肉禽蛋品类
    const meatNames = ['猪肉', '牛肉', '羊肉', '鸡肉', '鸭肉', '鸡蛋'];
    meatNames.forEach(name => {
        products.push([
            name, 'meat', Math.random() * 100 + 20, 
            generateImageUrl(400, 300, 'meat'), 
            `优质${name}，来自正规养殖场，安全放心`
        ]);
    });
    
    // 蔬菜类
    const vegetableNames = ['白菜', '萝卜', '黄瓜', '西红柿', '土豆', '茄子'];
    vegetableNames.forEach(name => {
        products.push([
            name, 'vegetable', Math.random() * 20 + 5, 
            generateImageUrl(400, 300, 'vegetable'), 
            `新鲜${name}，有机种植，无污染`
        ]);
    });
    
    // 水果类
    const fruitNames = ['苹果', '香蕉', '橙子', '草莓', '葡萄', '西瓜'];
    fruitNames.forEach(name => {
        products.push([
            name, 'fruit', Math.random() * 50 + 10, 
            generateImageUrl(400, 300, 'fruit'), 
            `新鲜${name}，当季水果，甜美多汁`
        ]);
    });
    
    // 豆品类
    const beanNames = ['黄豆', '绿豆', '红豆', '黑豆', '白豆', '芸豆'];
    beanNames.forEach(name => {
        products.push([
            name, 'bean', Math.random() * 30 + 10, 
            generateImageUrl(400, 300, 'seed'), 
            `优质${name}，颗粒饱满，营养丰富`
        ]);
    });
    
    // 乳品类
    const dairyNames = ['牛奶', '酸奶', '奶酪', '黄油', '奶粉', '冰淇淋'];
    dairyNames.forEach(name => {
        products.push([
            name, 'dairy', Math.random() * 50 + 15, 
            generateImageUrl(400, 300, 'food'), 
            `优质${name}，来自正规奶厂，新鲜美味`
        ]);
    });
    
    products.forEach(product => {
        insertProduct.run(
            product[0], product[1], product[2], product[3], product[4]
        );
    });
    
    insertProduct.finalize();
    
    // 插入用户数据
    const insertUser = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
    
    insertUser.run('admin', 'password123');
    insertUser.run('user', 'password456');
    
    insertUser.finalize();
    
    // 提交事务
    db.run('COMMIT', (err) => {
        if (err) {
            console.error('提交事务失败:', err);
            db.run('ROLLBACK');
        } else {
            console.log('数据添加完成！');
        }
    });
});

// 关闭数据库连接
db.close((err) => {
    if (err) {
        console.error('关闭数据库连接失败:', err);
    }
});
