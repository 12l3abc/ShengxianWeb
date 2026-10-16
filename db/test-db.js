const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// 连接到数据库
const dbPath = path.join(__dirname, 'shengxianda.db');
const db = new sqlite3.Database(dbPath);

console.log('连接到数据库:', dbPath);

// 测试查询用户表
db.all("SELECT * FROM users", (err, rows) => {
    if (err) {
        console.error('查询用户表失败:', err.message);
    } else {
        console.log('用户表数据:');
        console.log(rows);
    }
});

// 测试查询商品表
db.all("SELECT * FROM products", (err, rows) => {
    if (err) {
        console.error('查询商品表失败:', err.message);
    } else {
        console.log('商品表数据:');
        console.log(rows);
    }
});

// 测试插入新用户
const stmt = db.prepare("INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)");
stmt.run('testuser', 'testpass', 'user');
stmt.finalize();

// 测试插入新商品
const stmt2 = db.prepare(`INSERT OR IGNORE INTO products 
    (name, category, price, image, description, is_special_offer, is_flash_sale, stock) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);

stmt2.run('测试商品', 'testCategory', 29.99, 
    'https://via.placeholder.com/200x200/9C27B0/white?text=测试', 
    '这是一个测试商品', 1, 0, 20);
stmt2.finalize();

// 查询插入的数据
setTimeout(() => {
    console.log('\n--- 插入数据后 ---');
    
    db.all("SELECT * FROM users WHERE username = 'testuser'", (err, rows) => {
        if (err) {
            console.error('查询测试用户失败:', err.message);
        } else {
            console.log('测试用户:');
            console.log(rows);
        }
    });

    db.all("SELECT * FROM products WHERE name = '测试商品'", (err, rows) => {
        if (err) {
            console.error('查询测试商品失败:', err.message);
        } else {
            console.log('测试商品:');
            console.log(rows);
        }
    });
}, 1000);

// 关闭数据库连接
setTimeout(() => {
    db.close((err) => {
        if (err) {
            console.error('关闭数据库连接失败:', err.message);
        } else {
            console.log('数据库连接已关闭');
        }
    });
}, 2000);