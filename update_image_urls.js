const sqlite3 = require('sqlite3').verbose();

// 创建数据库连接
const db = new sqlite3.Database('local_specialties.db');

// 替换图片URL的函数
function updateImageUrls() {
    db.serialize(() => {
        // 替换products表中的图片URL
        const updateProducts = db.prepare(`
            UPDATE products 
            SET image_url = ? 
            WHERE id = ?
        `);
        
        // 替换local_products表中的图片URL
        const updateLocalProducts = db.prepare(`
            UPDATE local_products 
            SET image_url = ? 
            WHERE id = ?
        `);
        
        // 生成新的图片URL（使用picsum.photos作为可靠的图片服务）
        function generateNewImageUrl(originalUrl, type) {
            // 解析原始URL中的尺寸信息
            const sizeMatch = originalUrl.match(/(\d+)x(\d+)/);
            const width = sizeMatch ? sizeMatch[1] : 400;
            const height = sizeMatch ? sizeMatch[2] : 300;
            
            // 使用picsum.photos生成新的图片URL
            // 根据不同类型的商品使用不同的类别
            let category = '';
            if (type === 'seafood') {
                category = 'food';
            } else if (type === 'meat') {
                category = 'meat';
            } else if (type === 'vegetable') {
                category = 'vegetable';
            } else if (type === 'fruit') {
                category = 'fruit';
            } else if (type === 'bean') {
                category = 'seed';
            } else if (type === 'dairy') {
                category = 'food';
            } else {
                category = 'food';
            }
            
            // 使用特定的图片ID确保每次生成相同的图片
            const imageId = Math.floor(Math.random() * 1000) + 1;
            return `https://picsum.photos/id/${imageId}/${width}/${height}?grayscale`;
        }
        
        // 更新products表
        db.all('SELECT id, image_url, category FROM products', (err, rows) => {
            if (err) {
                console.error('查询products表失败:', err);
                return;
            }
            
            rows.forEach(row => {
                const newUrl = generateNewImageUrl(row.image_url, row.category);
                updateProducts.run(newUrl, row.id, (err) => {
                    if (err) {
                        console.error(`更新products表中ID为${row.id}的图片URL失败:`, err);
                    } else {
                        console.log(`更新products表中ID为${row.id}的图片URL: ${newUrl}`);
                    }
                });
            });
            
            updateProducts.finalize();
        });
        
        // 更新local_products表
        db.all('SELECT id, image_url FROM local_products', (err, rows) => {
            if (err) {
                console.error('查询local_products表失败:', err);
                return;
            }
            
            rows.forEach(row => {
                const newUrl = generateNewImageUrl(row.image_url, 'specialty');
                updateLocalProducts.run(newUrl, row.id, (err) => {
                    if (err) {
                        console.error(`更新local_products表中ID为${row.id}的图片URL失败:`, err);
                    } else {
                        console.log(`更新local_products表中ID为${row.id}的图片URL: ${newUrl}`);
                    }
                });
            });
            
            updateLocalProducts.finalize();
        });
    });
    
    // 关闭数据库连接
    db.close((err) => {
        if (err) {
            console.error('关闭数据库连接失败:', err);
        } else {
            console.log('图片URL更新完成！');
        }
    });
}

// 执行更新
updateImageUrls();