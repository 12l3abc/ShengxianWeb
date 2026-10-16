const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// 连接数据库 - 修复路径，确保正确连接到db目录下的数据库
const dbPath = path.join(__dirname, '../../db/shengxianda.db');
const db = new sqlite3.Database(dbPath);

class Database {
    constructor() {
        // 确保数据库表已经创建
        this.initTables();
    }

    initTables() {
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
                // 插入默认管理员用户（如果不存在）
                const stmt = db.prepare("INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)");
                stmt.run('admin', '123456', 'admin', function(err) {
                    if (err) {
                        console.error('插入默认管理员失败:', err.message);
                    }
                    stmt.finalize();
                });
            }
        });

        // 创建商品分类表
        db.run(`CREATE TABLE IF NOT EXISTS product_categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            parent_id INTEGER DEFAULT NULL,
            level INTEGER NOT NULL,
            description TEXT,
            sort_order INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (parent_id) REFERENCES product_categories(id) ON DELETE CASCADE
        )`, (err) => {
            if (err) {
                console.error('创建 product_categories 表失败:', err.message);
            } else {
                console.log('product_categories 表创建成功或已存在');
                // 插入初始分类数据
                const stmt = db.prepare(`INSERT OR IGNORE INTO product_categories (id, name, parent_id, level, description, sort_order) VALUES (?, ?, ?, ?, ?, ?)`);
                
                // 一级分类
                const categoryData = [
                    // 一级分类
                    [1, 'freshProduce', null, 1, '新鲜果蔬', 1],
                    [2, 'meatPoultry', null, 1, '肉禽蛋品', 2],
                    [3, 'seafood', null, 1, '水产海鲜', 3],
                    [4, 'dairyBakery', null, 1, '乳品面点', 4],
                    [5, 'beanProducts', null, 1, '豆制品', 5],
                    [6, 'readyMeals', null, 1, '速食净菜', 6],
                    // 二级分类 - 新鲜果蔬
                    [11, '叶菜', 1, 2, '叶菜类蔬菜', 1],
                    [12, '根茎', 1, 2, '根茎类蔬菜', 2],
                    [13, '瓜果', 1, 2, '瓜果类蔬菜', 3],
                    [14, '菌菇', 1, 2, '菌菇类', 4],
                    // 二级分类 - 肉禽蛋品
                    [21, '肉类', 2, 2, '各类肉类', 1],
                    [22, '禽类', 2, 2, '各类禽类', 2],
                    [23, '蛋类', 2, 2, '各类蛋类', 3],
                    // 二级分类 - 水产海鲜
                    [31, '鱼类', 3, 2, '各类鱼类', 1],
                    [32, '虾类', 3, 2, '各类虾类', 2],
                    [33, '贝类', 3, 2, '各类贝类', 3],
                    // 二级分类 - 乳品面点
                    [41, '乳制品', 4, 2, '各类乳制品', 1],
                    [42, '面包', 4, 2, '各类面包', 2],
                    [43, '糕点', 4, 2, '各类糕点', 3],
                    // 二级分类 - 豆制品
                    [51, '豆腐', 5, 2, '各类豆腐', 1],
                    [52, '豆皮', 5, 2, '各类豆皮', 2],
                    [53, '腐竹', 5, 2, '各类腐竹', 3],
                    // 二级分类 - 速食净菜
                    [61, '半成品', 6, 2, '各类半成品', 1],
                    [62, '即食菜', 6, 2, '各类即食菜', 2],
                    [63, '净菜', 6, 2, '各类净菜', 3]
                ];
                
                // 使用IIFE创建独立作用域
                (function() {
                    let count = 0;
                    const total = categoryData.length;
                    
                    categoryData.forEach(data => {
                        stmt.run(...data, function(err) {
                            if (err) {
                                console.error('插入分类数据失败:', err.message);
                            }
                            
                            count++;
                            if (count === total) {
                                stmt.finalize();
                            }
                        });
                    });
                })();
            }
        });
        
        // 创建商品表
        db.run(`CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            price REAL NOT NULL,
            image TEXT,
            video_url TEXT,
            description TEXT,
            is_special_offer BOOLEAN DEFAULT FALSE,
            is_flash_sale BOOLEAN DEFAULT FALSE,
            flash_sale_end_time DATETIME,
            stock INTEGER DEFAULT 0,
            subcategory TEXT,
            temperature TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error('创建 products 表失败:', err.message);
            } else {
                console.log('products 表创建成功或已存在');
                
                // 添加category_id和subcategory_id字段（SQLite不支持IF NOT EXISTS，所以使用try-catch）
                db.run(`ALTER TABLE products ADD COLUMN category_id INTEGER`, (err) => {
                    if (err) {
                        console.log('category_id字段可能已存在，跳过添加');
                    } else {
                        console.log('category_id字段添加成功');
                    }
                    
                    // 添加subcategory_id字段
                    db.run(`ALTER TABLE products ADD COLUMN subcategory_id INTEGER`, (err) => {
                        if (err) {
                            console.log('subcategory_id字段可能已存在，跳过添加');
                        } else {
                            console.log('subcategory_id字段添加成功');
                        }
                        
                        // 更新现有数据，将category字段值转换为category_id
                        db.all(`SELECT DISTINCT category FROM products`, (err, rows) => {
                            if (err) {
                                console.error('获取不同分类失败:', err.message);
                            } else {
                                // 分类映射
                                const categoryMap = {
                                    'freshProduce': 1,
                                    'meatPoultry': 2,
                                    'seafood': 3,
                                    'dairyBakery': 4,
                                    'beanProducts': 5,
                                    'readyMeals': 6
                                };
                                
                                // 批量更新分类ID
                                rows.forEach(row => {
                                    const categoryName = row.category;
                                    const categoryId = categoryMap[categoryName];
                                    if (categoryId) {
                                        db.run(`UPDATE products SET category_id = ? WHERE category = ?`, [categoryId, categoryName], (err) => {
                                            if (err) {
                                                console.error(`更新分类${categoryName}失败:`, err.message);
                                            } else {
                                                console.log(`更新分类${categoryName}成功`);
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    });
                });
                
                // 插入示例商品数据（如果不存在）
                const stmt = db.prepare(`INSERT OR IGNORE INTO products 
                    (id, name, category, price, image, video_url, description, is_special_offer, is_flash_sale, stock) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
                
                // 插入数据的数组
                const productData = [
                    // 普通商品
                    [1, '新鲜菠菜', 'freshProduce', 5.99, 'src/shengxian.png', null, '新鲜采摘的菠菜', 0, 0, 100],
                    [3, '鲜活大虾', 'seafood', 35.99, 'src/shengxian.png', null, '新鲜捕捞的海虾', 0, 1, 30],
                    // 特价商品
                    [2, '优质牛肉', 'meatPoultry', 45.99, 'src/shengxian.png', null, '精选优质牛肉', 1, 0, 50],
                    [4, '有机苹果', 'freshProduce', 8.99, 'src/fruit.png', null, '纯天然有机苹果，营养丰富', 1, 0, 80],
                    [5, '进口牛奶', 'dairyBakery', 6.99, 'src/shengxian.png', null, '新西兰进口全脂牛奶', 1, 0, 120],
                    [6, '新鲜鸡蛋', 'meatPoultry', 12.99, 'src/shengxian.png', null, '农家散养土鸡蛋', 1, 0, 60],
                    [7, '有机蔬菜套装', 'freshProduce', 19.99, 'src/shengxian.png', null, '精选有机蔬菜组合', 1, 0, 40],
                    // 乳品面点示例数据
                    [8, '光明纯牛奶', 'dairyBakery', 15.80, 'https://via.placeholder.com/200x200/4CAF50/white?text=光明纯牛奶', null, '优质奶源，营养丰富', 0, 0, 100],
                    [9, '伊利高蛋白酸奶', 'dairyBakery', 18.50, 'https://via.placeholder.com/200x200/2196F3/white?text=伊利酸奶', null, '益生菌发酵，口感醇厚', 0, 0, 100],
                    [10, '达利园切片吐司', 'dairyBakery', 12.90, 'https://via.placeholder.com/200x200/FF9800/white?text=切片吐司', null, '松软可口，早餐首选', 0, 0, 100],
                    [11, '老面馒头', 'dairyBakery', 8.50, 'https://via.placeholder.com/200x200/795548/white?text=老面馒头', null, '传统工艺，口感香甜', 0, 0, 100],
                    // 肉禽蛋品示例数据
                    [12, '新鲜猪肉', 'meatPoultry', 28.90, 'https://via.placeholder.com/200x200/FF5722/white?text=新鲜猪肉', null, '精选新鲜猪肉', 0, 0, 100],
                    [13, '新鲜鸡肉', 'meatPoultry', 19.90, 'https://via.placeholder.com/200x200/FF9800/white?text=新鲜鸡肉', null, '农家散养鸡肉', 0, 0, 100],
                    [14, '新鲜鸭肉', 'meatPoultry', 22.50, 'https://via.placeholder.com/200x200/795548/white?text=新鲜鸭肉', null, '精选新鲜鸭肉', 0, 0, 100],
                    [15, '新鲜牛肉', 'meatPoultry', 58.50, 'https://via.placeholder.com/200x200/4CAF50/white?text=新鲜牛肉', null, '精选优质牛肉', 0, 0, 100],
                    // 豆制品示例数据
                    [16, '嫩豆腐', 'beanProducts', 5.50, 'https://via.placeholder.com/200x200/FFEB3B/white?text=嫩豆腐', null, '新鲜嫩豆腐', 0, 0, 100],
                    [17, '老豆腐', 'beanProducts', 6.50, 'https://via.placeholder.com/200x200/8BC34A/white?text=老豆腐', null, '传统老豆腐', 0, 0, 100],
                    [18, '豆皮', 'beanProducts', 8.50, 'https://via.placeholder.com/200x200/CDDC39/white?text=豆皮', null, '优质豆皮', 0, 0, 100],
                    [19, '腐竹', 'beanProducts', 12.50, 'https://via.placeholder.com/200x200/4CAF50/white?text=腐竹', null, '精选腐竹', 0, 0, 100]
                ];
                
                // 使用IIFE创建独立作用域
                (function() {
                    let count = 0;
                    const total = productData.length;
                    
                    productData.forEach(data => {
                        stmt.run(...data, function(err) {
                            if (err) {
                                console.error('插入商品数据失败:', err.message);
                            }
                            
                            count++;
                            if (count === total) {
                                // 所有数据插入完成后关闭预处理语句
                                stmt.finalize();
                            }
                        });
                    });
                })();
            }
        });
        
        // 添加外键约束（SQLite需要在单独的语句中添加）
        db.run(`PRAGMA foreign_keys = ON`, (err) => {
            if (err) {
                console.error('启用外键约束失败:', err.message);
            } else {
                console.log('外键约束已启用');
            }
        });
        
        // 创建产地表
        db.run(`CREATE TABLE IF NOT EXISTS provinces (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            discount INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error('创建 provinces 表失败:', err.message);
            } else {
                console.log('provinces 表创建成功或已存在');
                // 插入示例产地数据
                const stmt = db.prepare(`INSERT OR IGNORE INTO provinces (id, name, description, discount) VALUES (?, ?, ?, ?)`);
                
                // 插入数据的数组
                const provinceData = [
                    [1, '北京', '北京市，中国首都', 15],
                    [2, '上海', '上海市，中国经济中心', 10],
                    [3, '广东', '广东省，中国南方沿海省份', 20],
                    [4, '山东', '山东省，中国东部沿海省份', 25],
                    [5, '四川', '四川省，中国西南省份', 18],
                    [6, '云南', '云南省，中国西南省份', 22],
                    [7, '新疆', '新疆维吾尔自治区，中国西北边陲', 30],
                    [8, '海南', '海南省，中国最南端省份', 28]
                ];
                
                // 使用IIFE创建独立作用域
                (function() {
                    let count = 0;
                    const total = provinceData.length;
                    
                    provinceData.forEach(data => {
                        stmt.run(...data, function(err) {
                            if (err) {
                                console.error('插入产地数据失败:', err.message);
                            }
                            
                            count++;
                            if (count === total) {
                                // 所有数据插入完成后关闭预处理语句
                                stmt.finalize();
                            }
                        });
                    });
                })();
            }
        });
        
        // 创建地方特产表
        db.run(`CREATE TABLE IF NOT EXISTS local_products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            province_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            original_price REAL,
            description TEXT,
            image TEXT,
            is_seasonal BOOLEAN DEFAULT FALSE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (province_id) REFERENCES provinces(id) ON DELETE CASCADE
        )`, (err) => {
            if (err) {
                console.error('创建 local_products 表失败:', err.message);
            } else {
                console.log('local_products 表创建成功或已存在');
                // 插入示例地方特产数据
                const stmt = db.prepare(`INSERT OR IGNORE INTO local_products 
                    (id, province_id, name, price, original_price, description, image, is_seasonal) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
                
                // 插入数据的数组
                const localProductData = [
                    // 北京特产
                    [1, 1, '北京白菜', 3.50, 4.50, '北京特产白菜', 'https://via.placeholder.com/200x200/FFEB3B/white?text=北京白菜', 0],
                    [2, 1, '京西稻', 12.80, 16.80, '北京特产大米', 'https://via.placeholder.com/200x200/8BC34A/white?text=京西稻', 0],
                    [3, 1, '平谷大桃', 18.50, 22.50, '北京平谷特产桃子', 'https://via.placeholder.com/200x200/FF9800/white?text=平谷大桃', 1],
                    // 上海特产
                    [4, 2, '崇明大米', 15.80, 19.80, '上海崇明特产大米', 'https://via.placeholder.com/200x200/4CAF50/white?text=崇明大米', 0],
                    [5, 2, '南汇水蜜桃', 25.80, 32.80, '上海南汇特产水蜜桃', 'https://via.placeholder.com/200x200/FF5722/white?text=南汇水蜜桃', 1],
                    // 广东特产
                    [6, 3, '增城丝苗米', 18.80, 24.80, '广东增城特产大米', 'https://via.placeholder.com/200x200/8BC34A/white?text=增城丝苗米', 0],
                    [7, 3, '从化荔枝', 38.80, 48.80, '广东从化特产荔枝', 'https://via.placeholder.com/200x200/FF9800/white?text=从化荔枝', 1],
                    // 新疆特产
                    [8, 7, '新疆和田骏枣', 48.00, 68.00, '来自新疆和田的优质骏枣', 'https://via.placeholder.com/200x200/FF5722/white?text=和田骏枣', 0],
                    [9, 7, '新疆香梨', 58.00, 78.00, '新疆特产香梨', 'https://via.placeholder.com/200x200/2196F3/white?text=新疆香梨', 1]
                ];
                
                // 使用IIFE创建独立作用域
                (function() {
                    let count = 0;
                    const total = localProductData.length;
                    
                    localProductData.forEach(data => {
                        stmt.run(...data, function(err) {
                            if (err) {
                                console.error('插入地方特产数据失败:', err.message);
                            }
                            
                            count++;
                            if (count === total) {
                                // 所有数据插入完成后关闭预处理语句
                                stmt.finalize();
                            }
                        });
                    });
                })();
            }
        });
    }

    // 用户相关方法
    findUser(username, password) {
        console.log('===== 数据库用户查询开始 =====');
        console.log('[Database] 查询用户:', { username });
        return new Promise((resolve, reject) => {
            // 首先查询用户是否存在（不检查密码）
            db.get("SELECT * FROM users WHERE username = ?", [username], (err, userRow) => {
                if (err) {
                    console.error('[Database] 查询用户存在性出错:', err);
                    reject(err);
                    return;
                }
                
                console.log('[Database] 用户存在性检查结果:', userRow ? {
                    id: userRow.id,
                    username: userRow.username,
                    passwordStored: !!userRow.password,
                    passwordLength: userRow.password ? userRow.password.length : 0,
                    role: userRow.role
                } : '用户不存在');
                
                // 如果用户存在，再执行密码匹配
                if (userRow) {
                    const storedPassword = userRow.password;
                    const inputPassword = password;
                    
                    console.log('[Database] 密码比较: 输入密码长度=' + inputPassword.length + 
                        ', 存储密码长度=' + (storedPassword ? storedPassword.length : 0));
                    console.log('[Database] 密码是否相同: ' + (storedPassword === inputPassword));
                    
                    // 执行完整的密码匹配查询
                    db.get("SELECT * FROM users WHERE username = ? AND password = ?", [username, password], (err, row) => {
                        if (err) {
                            console.error('[Database] 密码匹配查询出错:', err);
                            reject(err);
                        } else {
                            console.log('[Database] 完整查询结果:', row ? '找到用户并密码匹配' : '密码不匹配');
                            resolve(row);
                        }
                    });
                } else {
                    console.log('[Database] 完整查询结果: 用户不存在');
                    resolve(null);
                }
            });
        });
    }

    findUserByUsername(username) {
        console.log('[Database] 检查用户名是否存在:', { username });
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
                if (err) {
                    console.error('[Database] 检查用户名出错:', err);
                    reject(err);
                } else {
                    console.log('[Database] 用户名检查结果:', row ? '用户名已存在' : '用户名可用');
                    resolve(row);
                }
            });
        });
    }

    addUser(username, password, role = 'user') {
        console.log('[Database] 添加新用户:', { username, role });
        return new Promise((resolve, reject) => {
            const stmt = db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)");
            stmt.run([username, password, role], function(err) {
                if (err) {
                    console.error('[Database] 添加用户出错:', err);
                    reject(err);
                } else {
                    console.log('[Database] 用户添加成功:', { id: this.lastID, username });
                    // 返回用户信息，但不包含密码
                    resolve({ id: this.lastID, username, role });
                }
            });
            stmt.finalize();
        });
    }

    // 商品分类相关方法
    getAllCategories() {
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM product_categories ORDER BY sort_order, id", (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }
    
    getCategoriesByLevel(level) {
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM product_categories WHERE level = ? ORDER BY sort_order, id", [level], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }
    
    getSubcategoriesByParentId(parentId) {
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM product_categories WHERE parent_id = ? ORDER BY sort_order, id", [parentId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }
    
    getCategoryById(id) {
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM product_categories WHERE id = ?", [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }
    
    addCategory(category) {
        return new Promise((resolve, reject) => {
            const stmt = db.prepare(`INSERT INTO product_categories (name, parent_id, level, description, sort_order) VALUES (?, ?, ?, ?, ?)`);
            stmt.run([
                category.name,
                category.parent_id || null,
                category.level,
                category.description || '',
                category.sort_order || 0
            ], function(err) {
                stmt.finalize();
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, ...category });
                }
            });
        });
    }
    
    updateCategory(id, category) {
        return new Promise((resolve, reject) => {
            const stmt = db.prepare(`UPDATE product_categories SET name = ?, parent_id = ?, level = ?, description = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
            stmt.run([
                category.name,
                category.parent_id || null,
                category.level,
                category.description || '',
                category.sort_order || 0,
                id
            ], function(err) {
                stmt.finalize();
                if (err) {
                    reject(err);
                } else {
                    if (this.changes > 0) {
                        resolve({ id: parseInt(id), ...category });
                    } else {
                        resolve(null);
                    }
                }
            });
        });
    }
    
    deleteCategory(id) {
        return new Promise((resolve, reject) => {
            const stmt = db.prepare("DELETE FROM product_categories WHERE id = ?");
            stmt.run([id], function(err) {
                stmt.finalize();
                if (err) {
                    reject(err);
                } else {
                    if (this.changes > 0) {
                        resolve({ id: parseInt(id) });
                    } else {
                        resolve(null);
                    }
                }
            });
        });
    }
    
    // 商品相关方法
    getAllProducts() {
        return new Promise((resolve, reject) => {
            db.all(`SELECT p.*, c.name AS category_name, sc.name AS subcategory_name FROM products p 
                    LEFT JOIN product_categories c ON p.category_id = c.id 
                    LEFT JOIN product_categories sc ON p.subcategory_id = sc.id`, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    // 转换布尔值字段
                    const products = rows.map(product => ({
                        ...product,
                        isSpecialOffer: product.is_special_offer === 1,
                        isFlashSale: product.is_flash_sale === 1,
                        // 添加分类名称
                        categoryName: product.category_name,
                        subcategoryName: product.subcategory_name,
                        temperature: product.temperature,
                        videoUrl: product.video_url
                    }));
                    resolve(products);
                }
            });
        });
    }

    getProductsByCategoryId(categoryId) {
        return new Promise((resolve, reject) => {
            db.all(`SELECT p.*, c.name AS category_name, sc.name AS subcategory_name FROM products p 
                    LEFT JOIN product_categories c ON p.category_id = c.id 
                    LEFT JOIN product_categories sc ON p.subcategory_id = sc.id 
                    WHERE p.category_id = ?`, [categoryId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    // 转换布尔值字段
                    const products = rows.map(product => ({
                        ...product,
                        isSpecialOffer: product.is_special_offer === 1,
                        isFlashSale: product.is_flash_sale === 1,
                        // 添加分类名称
                        categoryName: product.category_name,
                        subcategoryName: product.subcategory_name,
                        temperature: product.temperature,
                        videoUrl: product.video_url
                    }));
                    resolve(products);
                }
            });
        });
    }
    
    // 兼容旧接口，根据分类名称获取商品
    getProductsByCategory(categoryName) {
        return new Promise((resolve, reject) => {
            console.log(`[Database] getProductsByCategory 调用，分类名称: ${categoryName}`);
            
            // 分类映射，用于快速转换分类名称为分类ID
            const categoryMap = {
                'freshProduce': 1,
                'meatPoultry': 2,
                'seafood': 3,
                'dairyBakery': 4,
                'beanProducts': 5,
                'readyMeals': 6,
                'specialOffers': 7
            };
            
            let categoryId;
            
            // 首先尝试使用映射直接获取分类ID
            if (categoryMap[categoryName]) {
                console.log(`[Database] 使用映射直接获取分类ID: ${categoryMap[categoryName]}`);
                categoryId = categoryMap[categoryName];
                // 直接根据分类ID获取商品
                this.getProductsByCategoryId(categoryId)
                    .then(products => {
                        console.log(`[Database] 根据分类ID ${categoryId} 获取到 ${products.length} 个商品`);
                        resolve(products);
                    })
                    .catch(err => reject(err));
            } 
            // 否则尝试根据分类名称查询
            else {
                console.log(`[Database] 尝试根据分类名称查询: ${categoryName}`);
                // 先根据分类名称获取分类ID
                db.get("SELECT id FROM product_categories WHERE name = ?", [categoryName], (err, category) => {
                    if (err) {
                        console.error(`[Database] 查询分类出错: ${err.message}`);
                        reject(err);
                        return;
                    }
                    
                    if (!category) {
                        console.log(`[Database] 未找到分类: ${categoryName}`);
                        // 尝试使用旧的查询方式，直接根据商品表的category字段查询
                        console.log(`[Database] 尝试直接查询商品表的category字段: ${categoryName}`);
                        db.all(`SELECT p.*, c.name AS category_name, sc.name AS subcategory_name FROM products p 
                                LEFT JOIN product_categories c ON p.category_id = c.id 
                                LEFT JOIN product_categories sc ON p.subcategory_id = sc.id 
                                WHERE p.category = ?`, [categoryName], (err, rows) => {
                            if (err) {
                                console.error(`[Database] 直接查询商品表出错: ${err.message}`);
                                reject(err);
                                return;
                            }
                            
                            console.log(`[Database] 直接查询商品表获取到 ${rows.length} 个商品`);
                            // 转换布尔值字段
                            const products = rows.map(product => ({
                                ...product,
                                isSpecialOffer: product.is_special_offer === 1,
                                isFlashSale: product.is_flash_sale === 1,
                                // 添加分类名称
                                categoryName: product.category_name,
                                subcategoryName: product.subcategory_name,
                                temperature: product.temperature,
                                videoUrl: product.video_url
                            }));
                            resolve(products);
                        });
                        return;
                    }
                    
                    console.log(`[Database] 找到分类: ${categoryName}，ID: ${category.id}`);
                    
                    // 然后根据分类ID获取商品
                    this.getProductsByCategoryId(category.id)
                        .then(products => {
                            console.log(`[Database] 根据分类ID ${category.id} 获取到 ${products.length} 个商品`);
                            resolve(products);
                        })
                        .catch(err => reject(err));
                });
            }
        });
    }

    getProductById(id) {
        return new Promise((resolve, reject) => {
            db.get(`SELECT p.*, c.name AS category_name, sc.name AS subcategory_name FROM products p 
                    LEFT JOIN product_categories c ON p.category_id = c.id 
                    LEFT JOIN product_categories sc ON p.subcategory_id = sc.id 
                    WHERE p.id = ?`, [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    if (row) {
                        // 转换布尔值字段
                        const product = {
                            ...row,
                            isSpecialOffer: row.is_special_offer === 1,
                            isFlashSale: row.is_flash_sale === 1,
                            // 添加分类名称
                            categoryName: row.category_name,
                            subcategoryName: row.subcategory_name,
                            temperature: row.temperature,
                            videoUrl: row.video_url
                        };
                        resolve(product);
                    } else {
                        resolve(null);
                    }
                }
            });
        });
    }

    addProduct(product) {
        return new Promise((resolve, reject) => {
            const stmt = db.prepare(`INSERT INTO products 
                (name, category, category_id, subcategory, subcategory_id, price, image, video_url, description, is_special_offer, is_flash_sale, flash_sale_end_time, stock, temperature) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
            
            // 处理字段名转换，支持前端传递的下划线格式和后端使用的驼峰格式
            // 直接检查字段是否存在，使用适当的默认值
            const isSpecialOffer = product.isSpecialOffer !== undefined ? product.isSpecialOffer : product.is_special_offer;
            const isFlashSale = product.isFlashSale !== undefined ? product.isFlashSale : product.is_flash_sale;
            const flashSaleEndTime = product.flashSaleEndTime !== undefined ? product.flashSaleEndTime : product.flash_sale_end_time;
            
            stmt.run([
                product.name,
                product.category || product.category_id.toString(),
                product.category_id,
                product.subcategory || product.subcategory_id?.toString() || null,
                product.subcategory_id || null,
                product.price,
                product.image,
                product.videoUrl || product.video_url || null,
                product.description,
                isSpecialOffer ? 1 : 0,
                isFlashSale ? 1 : 0,
                flashSaleEndTime || null,
                product.stock || 0,
                product.temperature || null
            ], function(err) {
                stmt.finalize(); // 移动到回调函数内部
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, ...product });
                }
            });
        });
    }

    updateProduct(id, updatedProduct) {
        return new Promise((resolve, reject) => {
            console.log('[Database] 准备更新商品:', { id, updatedProduct });
            const stmt = db.prepare(`UPDATE products SET 
                name = ?, category = ?, category_id = ?, subcategory = ?, subcategory_id = ?, price = ?, image = ?, video_url = ?, description = ?, 
                is_special_offer = ?, is_flash_sale = ?, flash_sale_end_time = ?, stock = ?, 
                temperature = ? 
                WHERE id = ?`);
            
            // 处理字段名转换，支持前端传递的下划线格式和后端使用的驼峰格式
            // 直接检查字段是否存在，使用适当的默认值
            console.log('[DEBUG] 检查updatedProduct对象中的特价字段:');
            console.log('[DEBUG] - isSpecialOffer (驼峰):', updatedProduct.isSpecialOffer);
            console.log('[DEBUG] - is_special_offer (下划线):', updatedProduct.is_special_offer);
            
            // 修复：直接检查两个字段是否都存在，使用正确的值
            const isSpecialOffer = updatedProduct.hasOwnProperty('is_special_offer') ? updatedProduct.is_special_offer : 
                                  (updatedProduct.hasOwnProperty('isSpecialOffer') ? updatedProduct.isSpecialOffer : 0);
            const isFlashSale = updatedProduct.hasOwnProperty('is_flash_sale') ? updatedProduct.is_flash_sale : 
                               (updatedProduct.hasOwnProperty('isFlashSale') ? updatedProduct.isFlashSale : 0);
            const flashSaleEndTime = updatedProduct.hasOwnProperty('flash_sale_end_time') ? updatedProduct.flash_sale_end_time : 
                                    (updatedProduct.hasOwnProperty('flashSaleEndTime') ? updatedProduct.flashSaleEndTime : null);
            
            console.log('[DEBUG] 计算后的特价字段值:');
            console.log('[DEBUG] - isSpecialOffer:', isSpecialOffer);
            console.log('[DEBUG] - isFlashSale:', isFlashSale);
            
            stmt.run([
                updatedProduct.name,
                updatedProduct.category || updatedProduct.category_id.toString(),
                updatedProduct.category_id,
                updatedProduct.subcategory || updatedProduct.subcategory_id?.toString() || null,
                updatedProduct.subcategory_id || null,
                updatedProduct.price,
                updatedProduct.image,
                updatedProduct.videoUrl || updatedProduct.video_url || null,
                updatedProduct.description,
                isSpecialOffer ? 1 : 0,
                isFlashSale ? 1 : 0,
                flashSaleEndTime || null,
                updatedProduct.stock || 0,
                updatedProduct.temperature || null,
                id
            ], function(err) {
                stmt.finalize(); // 移动到回调函数内部
                if (err) {
                    console.error('[Database] 更新商品出错:', err);
                    reject(err);
                } else {
                    console.log('[Database] 更新影响行数:', this.changes);
                    if (this.changes > 0) {
                        resolve({ id: parseInt(id), ...updatedProduct });
                    } else {
                        resolve(null);
                    }
                }
            });
        });
    }

    deleteProduct(id) {
        return new Promise((resolve, reject) => {
            console.log('[Database] 准备删除商品:', { id });
            const stmt = db.prepare("DELETE FROM products WHERE id = ?");
            stmt.run([id], function(err) {
                stmt.finalize(); // 移动到回调函数内部
                if (err) {
                    console.error('[Database] 删除商品出错:', err);
                    reject(err);
                } else {
                    console.log('[Database] 删除影响行数:', this.changes);
                    if (this.changes > 0) {
                        resolve({ id: parseInt(id) });
                    } else {
                        resolve(null);
                    }
                }
            });
        });
    }

    // 获取特价商品
    getSpecialOfferProducts() {
        return new Promise((resolve, reject) => {
            db.all(`SELECT p.*, c.name AS category_name, sc.name AS subcategory_name FROM products p 
                    LEFT JOIN product_categories c ON p.category_id = c.id 
                    LEFT JOIN product_categories sc ON p.subcategory_id = sc.id 
                    WHERE p.is_special_offer = 1`, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    // 转换布尔值字段
                    const products = rows.map(product => ({
                        ...product,
                        isSpecialOffer: product.is_special_offer === 1,
                        isFlashSale: product.is_flash_sale === 1,
                        // 添加分类名称
                        categoryName: product.category_name,
                        subcategoryName: product.subcategory_name,
                        temperature: product.temperature,
                        videoUrl: product.video_url
                    }));
                    resolve(products);
                }
            });
        });
    }
    
    // 获取秒杀商品
    getFlashSaleProducts() {
        return new Promise((resolve, reject) => {
            db.all(`SELECT p.*, c.name AS category_name, sc.name AS subcategory_name FROM products p 
                    LEFT JOIN product_categories c ON p.category_id = c.id 
                    LEFT JOIN product_categories sc ON p.subcategory_id = sc.id 
                    WHERE p.is_flash_sale = 1`, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    // 转换布尔值字段
                    const products = rows.map(product => ({
                        ...product,
                        isSpecialOffer: product.is_special_offer === 1,
                        isFlashSale: product.is_flash_sale === 1,
                        // 添加分类名称
                        categoryName: product.category_name,
                        subcategoryName: product.subcategory_name,
                        temperature: product.temperature,
                        videoUrl: product.video_url
                    }));
                    resolve(products);
                }
            });
        });
    }
    
    // 产地直采相关方法
    // 获取所有省份
    getAllProvinces() {
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM provinces ORDER BY name", (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }
    
    // 添加省份
    addProvince(province) {
        return new Promise((resolve, reject) => {
            const stmt = db.prepare("INSERT INTO provinces (name, description, discount) VALUES (?, ?, ?)");
            stmt.run([
                province.name,
                province.description || '',
                province.discount || 0
            ], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, ...province });
                }
            });
            stmt.finalize();
        });
    }
    
    // 更新省份
    updateProvince(id, province) {
        return new Promise((resolve, reject) => {
            const stmt = db.prepare("UPDATE provinces SET name = ?, description = ?, discount = ? WHERE id = ?");
            stmt.run([
                province.name,
                province.description,
                province.discount,
                id
            ], function(err) {
                if (err) {
                    reject(err);
                } else {
                    if (this.changes > 0) {
                        resolve({ id: parseInt(id), ...province });
                    } else {
                        resolve(null);
                    }
                }
            });
            stmt.finalize();
        });
    }
    
    // 删除省份
    deleteProvince(id) {
        return new Promise((resolve, reject) => {
            const stmt = db.prepare("DELETE FROM provinces WHERE id = ?");
            stmt.run([id], function(err) {
                if (err) {
                    reject(err);
                } else {
                    if (this.changes > 0) {
                        resolve({ id: parseInt(id) });
                    } else {
                        resolve(null);
                    }
                }
            });
            stmt.finalize();
        });
    }
    
    // 获取省份的特产
    getProvinceProducts(provinceId) {
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM local_products WHERE province_id = ?", [provinceId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    // 转换字段名和布尔值
                    const products = rows.map(product => ({
                        ...product,
                        image: product.image, // 使用正确的字段名image
                        isSeasonal: product.is_seasonal === 1, // 将is_seasonal转换为isSeasonal
                        originalPrice: product.original_price || product.price // 添加originalPrice字段
                    }));
                    resolve(products);
                }
            });
        });
    }
    
    // 添加地方特产
    addLocalProduct(provinceId, product) {
        return new Promise((resolve, reject) => {
            const stmt = db.prepare("INSERT INTO local_products (province_id, name, price, original_price, description, image, is_seasonal) VALUES (?, ?, ?, ?, ?, ?, ?)");
            stmt.run([
                provinceId,
                product.name,
                product.price,
                product.originalPrice || product.price,
                product.description || '',
                product.image || '',
                product.isSeasonal ? 1 : 0
            ], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, ...product, provinceId, image: product.image });
                }
            });
            stmt.finalize();
        });
    }
    
    // 更新地方特产
    updateLocalProduct(provinceId, productId, product) {
        return new Promise((resolve, reject) => {
            const stmt = db.prepare("UPDATE local_products SET name = ?, price = ?, original_price = ?, description = ?, image = ?, is_seasonal = ? WHERE id = ? AND province_id = ?");
            stmt.run([
                product.name,
                product.price,
                product.originalPrice || product.price,
                product.description,
                product.image,
                product.isSeasonal ? 1 : 0,
                productId,
                provinceId
            ], function(err) {
                if (err) {
                    reject(err);
                } else {
                    if (this.changes > 0) {
                        resolve({ id: parseInt(productId), ...product, provinceId, image: product.image });
                    } else {
                        resolve(null);
                    }
                }
            });
            stmt.finalize();
        });
    }
    
    // 删除地方特产
    deleteLocalProduct(provinceId, productId) {
        return new Promise((resolve, reject) => {
            const stmt = db.prepare("DELETE FROM local_products WHERE id = ? AND province_id = ?");
            stmt.run([productId, provinceId], function(err) {
                if (err) {
                    reject(err);
                } else {
                    if (this.changes > 0) {
                        resolve({ id: parseInt(productId), provinceId });
                    } else {
                        resolve(null);
                    }
                }
            });
            stmt.finalize();
        });
    }
    
    // 用户管理相关方法
    // 获取所有用户
    getAllUsers() {
        return new Promise((resolve, reject) => {
            db.all("SELECT id, username, role, created_at FROM users ORDER BY created_at DESC", (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }
    
    // 根据ID获取用户
    getUserById(id) {
        return new Promise((resolve, reject) => {
            db.get("SELECT id, username, role, created_at FROM users WHERE id = ?", [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row || null);
                }
            });
        });
    }
    
    // 根据用户名搜索用户
    searchUsers(keyword) {
        return new Promise((resolve, reject) => {
            const searchTerm = `%${keyword}%`;
            db.all("SELECT id, username, role, created_at FROM users WHERE username LIKE ? ORDER BY created_at DESC", [searchTerm], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }
    
    // 更新用户信息（角色等）
    updateUser(id, userData) {
        return new Promise((resolve, reject) => {
            const updates = [];
            const values = [];
            
            if (userData.role !== undefined) {
                updates.push('role = ?');
                values.push(userData.role);
            }
            
            if (userData.username !== undefined) {
                updates.push('username = ?');
                values.push(userData.username);
            }
            
            if (updates.length === 0) {
                resolve(null);
                return;
            }
            
            values.push(id);
            const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
            const stmt = db.prepare(sql);
            stmt.run(values, function(err) {
                stmt.finalize();
                if (err) {
                    reject(err);
                } else {
                    if (this.changes > 0) {
                        resolve({ id: parseInt(id), ...userData });
                    } else {
                        resolve(null);
                    }
                }
            });
        });
    }
    
    // 删除用户
    deleteUser(id) {
        return new Promise((resolve, reject) => {
            // 不能删除管理员账户
            db.get("SELECT role FROM users WHERE id = ?", [id], (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                if (!row) {
                    resolve(null);
                    return;
                }
                if (row.role === 'admin') {
                    reject(new Error('不能删除管理员账户'));
                    return;
                }
                
                const stmt = db.prepare("DELETE FROM users WHERE id = ?");
                stmt.run([id], function(err) {
                    stmt.finalize();
                    if (err) {
                        reject(err);
                    } else {
                        if (this.changes > 0) {
                            resolve({ id: parseInt(id) });
                        } else {
                            resolve(null);
                        }
                    }
                });
            });
        });
    }
}

// 创建数据库实例
const databaseInstance = new Database();

// 导出数据库实例
module.exports = databaseInstance;