const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// 确保 db 目录存在
const dbDir = path.join(__dirname);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// 创建数据库连接
const dbPath = path.join(__dirname, 'shengxianda.db');
const db = new sqlite3.Database(dbPath);

// 初始化数据库表
db.serialize(() => {
    // 创建用户表
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) {
            console.error('创建 users 表失败:', err.message);
        } else {
            console.log('users 表创建成功或已存在');
            // 插入默认管理员用户
            const stmt = db.prepare("INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)");
            stmt.run('admin', '123456', 'admin');
            stmt.finalize();
        }
    });

    // 创建商品表
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        price REAL NOT NULL,
        image TEXT,
        description TEXT,
        is_special_offer BOOLEAN DEFAULT FALSE,
        is_flash_sale BOOLEAN DEFAULT FALSE,
        stock INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) {
            console.error('创建 products 表失败:', err.message);
        } else {
            console.log('products 表创建成功或已存在');
            // 插入一些示例商品数据
            const stmt = db.prepare(`INSERT OR IGNORE INTO products 
                (id, name, category, price, image, description, is_special_offer, is_flash_sale, stock) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);

            stmt.run(1, '新鲜菠菜', 'freshProduce', 5.99, 
                'https://via.placeholder.com/200x200/4CAF50/white?text=菠菜', 
                '新鲜采摘的菠菜', 0, 0, 100);
            
            stmt.run(2, '优质牛肉', 'meatPoultry', 45.99, 
                'https://via.placeholder.com/200x200/FF5722/white?text=牛肉', 
                '精选优质牛肉', 1, 0, 50);
            
            stmt.run(3, '鲜活大虾', 'seafood', 35.99, 
                'https://via.placeholder.com/200x200/2196F3/white?text=大虾', 
                '新鲜捕捞的海虾', 0, 1, 30);
            
            // 添加乳品面点分类商品
            stmt.run(4, '光明纯牛奶', 'dairyBakery', 15.80, 
                'https://via.placeholder.com/200x200/4CAF50/white?text=光明纯牛奶', 
                '优质奶源，营养丰富', 0, 0, 100);
            
            stmt.run(5, '伊利高蛋白酸奶', 'dairyBakery', 18.50, 
                'https://via.placeholder.com/200x200/2196F3/white?text=伊利酸奶', 
                '益生菌发酵，口感醇厚', 0, 0, 100);
            
            stmt.run(6, '达利园切片吐司', 'dairyBakery', 12.90, 
                'https://via.placeholder.com/200x200/FF9800/white?text=切片吐司', 
                '松软可口，早餐首选', 0, 0, 100);
            
            stmt.run(7, '老面馒头', 'dairyBakery', 8.50, 
                'https://via.placeholder.com/200x200/795548/white?text=老面馒头', 
                '传统工艺，口感香甜', 0, 0, 100);
            
            stmt.run(8, '明治醇壹牛奶', 'dairyBakery', 18.90, 
                'https://via.placeholder.com/200x200/2196F3/white?text=明治牛奶', 
                '日本明治醇壹牛奶，口感醇厚，营养丰富', 0, 0, 100);
            
            stmt.run(9, '光明如实酸奶', 'dairyBakery', 25.80, 
                'https://via.placeholder.com/200x200/4CAF50/white?text=如实酸奶', 
                '光明如实酸奶，无添加，健康选择', 1, 0, 80);
            
            stmt.run(10, '可颂面包', 'dairyBakery', 12.80, 
                'https://via.placeholder.com/200x200/FF9800/white?text=可颂面包', 
                '新鲜烘焙可颂面包，外酥里嫩，奶香浓郁', 0, 0, 60);
            
            stmt.run(11, '芝士蛋糕', 'dairyBakery', 48.00, 
                'https://via.placeholder.com/200x200/FFC107/white?text=芝士蛋糕', 
                '浓郁芝士蛋糕，口感细腻，甜而不腻', 0, 1, 30);
            
            stmt.run(12, '老酸奶', 'dairyBakery', 9.90, 
                'https://via.placeholder.com/200x200/795548/white?text=老酸奶', 
                '传统工艺老酸奶，凝固型，口感醇厚', 0, 0, 90);
            
            stmt.finalize();
        }
    });
});

// 导出数据库连接
module.exports = db;