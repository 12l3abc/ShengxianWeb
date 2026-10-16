// 商品图片管理API - RESTful设计重构
const db = require('./database');
const fs = require('fs');
const path = require('path');

// 图片存储路径
const IMAGE_UPLOAD_PATH = path.join(__dirname, '../../uploads');

// 确保上传目录存在
if (!fs.existsSync(IMAGE_UPLOAD_PATH)) {
    fs.mkdirSync(IMAGE_UPLOAD_PATH, { recursive: true });
}

// 错误处理中间件
function handleError(error, message, statusCode = 500) {
    console.error(`[Product Images API Error] ${message}:`, error);
    return standardResponse(false, null, `${message}: ${error.message || error}`, statusCode);
}

// 参数验证
function validateImageData(imageData) {
    const errors = [];
    
    if (!imageData.productId) {
        errors.push('商品ID不能为空');
    }
    
    return errors;
}

// 标准化响应格式
function standardResponse(success, data, message = '', statusCode = 200) {
    return {
        success,
        message,
        data,
        statusCode
    };
}

// 获取商品图片
async function getProductImages(productId) {
    try {
        // 验证商品ID
        if (!productId || productId <= 0) {
            return standardResponse(false, null, '商品ID必须是大于0的数字', 400);
        }
        
        // 从数据库获取商品信息
        const product = await db.getProductById(productId);
        if (!product) {
            return standardResponse(false, null, '商品未找到', 404);
        }
        
        // 获取商品图片
        const images = {
            id: product.id,
            name: product.name,
            mainImage: product.image,
            // 目前只有主图，后续可以扩展为多图
            images: [product.image]
        };
        
        return standardResponse(true, images, '获取商品图片成功');
    } catch (error) {
        return handleError(error, '获取商品图片失败');
    }
}

// 更新商品图片
async function updateProductImage(productId, imageData) {
    try {
        // 验证参数
        const errors = validateImageData({ productId, ...imageData });
        if (errors.length > 0) {
            return standardResponse(false, null, errors.join(', '), 400);
        }
        
        // 验证商品ID
        if (!productId || productId <= 0) {
            return standardResponse(false, null, '商品ID必须是大于0的数字', 400);
        }
        
        // 检查商品是否存在
        const product = await db.getProductById(productId);
        if (!product) {
            return standardResponse(false, null, '商品未找到', 404);
        }
        
        // 更新商品图片
        const updatedProduct = await db.updateProduct(productId, {
            image: imageData.image
        });
        
        return standardResponse(true, { product: updatedProduct }, '更新商品图片成功');
    } catch (error) {
        return handleError(error, '更新商品图片失败');
    }
}

// 删除商品图片（恢复为默认图片）
async function deleteProductImage(productId) {
    try {
        // 验证商品ID
        if (!productId || productId <= 0) {
            return standardResponse(false, null, '商品ID必须是大于0的数字', 400);
        }
        
        // 检查商品是否存在
        const product = await db.getProductById(productId);
        if (!product) {
            return standardResponse(false, null, '商品未找到', 404);
        }
        
        // 删除商品图片（恢复为默认图片）
        const updatedProduct = await db.updateProduct(productId, {
            image: 'src/shengxian.png' // 默认图片路径
        });
        
        return standardResponse(true, { product: updatedProduct }, '删除商品图片成功');
    } catch (error) {
        return handleError(error, '删除商品图片失败');
    }
}

module.exports = {
    getProductImages,
    updateProductImage,
    deleteProductImage
};
