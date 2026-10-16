// 产地直采API
const db = require('./database');

// 获取所有省份
async function getAllProvinces() {
    console.log('[Direct Sourcing API] 获取所有省份');
    try {
        // 从数据库获取所有省份
        const provinces = await db.getAllProvinces();
        
        // 同时获取每个省份的地方商品
        const provincesWithProducts = await Promise.all(
            provinces.map(async (province) => {
                try {
                    // 获取该省份的地方商品
                    const products = await db.getProvinceProducts(province.id);
                    return {
                        ...province,
                        products: products // 添加地方商品到省份对象
                    };
                } catch (error) {
                    console.error(`[Direct Sourcing API] 获取省份 ${province.name} 的商品失败:`, error);
                    return {
                        ...province,
                        products: [] // 即使出错也返回空数组
                    };
                }
            })
        );
        
        return { success: true, provinces: provincesWithProducts };
    } catch (error) {
        console.error('[Direct Sourcing API] 获取省份列表失败:', error);
        return { success: false, message: '获取省份列表失败' };
    }
}

// 添加省份
async function addProvince(province) {
    console.log('[Direct Sourcing API] 添加省份:', province);
    try {
        // 向数据库添加省份
        const newProvince = await db.addProvince({
            name: province.name,
            description: province.description || '',
            discount: province.discount || 0
        });
        
        return { success: true, province: newProvince };
    } catch (error) {
        console.error('[Direct Sourcing API] 添加省份失败:', error);
        return { success: false, message: '添加省份失败' };
    }
}

// 更新省份
async function updateProvince(id, province) {
    console.log('[Direct Sourcing API] 更新省份:', id, province);
    try {
        // 更新数据库中的省份
        const updatedProvince = await db.updateProvince(id, {
            name: province.name,
            description: province.description,
            discount: province.discount || 0
        });
        
        if (!updatedProvince) {
            return { success: false, message: '省份不存在' };
        }
        
        return { success: true, province: updatedProvince };
    } catch (error) {
        console.error('[Direct Sourcing API] 更新省份失败:', error);
        return { success: false, message: '更新省份失败' };
    }
}

// 删除省份
async function deleteProvince(id) {
    console.log('[Direct Sourcing API] 删除省份:', id);
    try {
        // 从数据库删除省份
        const deletedProvince = await db.deleteProvince(id);
        
        if (!deletedProvince) {
            return { success: false, message: '省份不存在' };
        }
        
        return { success: true, message: '删除成功' };
    } catch (error) {
        console.error('[Direct Sourcing API] 删除省份失败:', error);
        return { success: false, message: '删除省份失败' };
    }
}

// 获取省份的地方商品
async function getProvinceProducts(provinceId) {
    console.log('[Direct Sourcing API] 获取省份商品:', provinceId);
    try {
        // 从数据库获取省份商品
        const products = await db.getProvinceProducts(provinceId);
        return { success: true, products: products };
    } catch (error) {
        console.error('[Direct Sourcing API] 获取省份商品失败:', error);
        return { success: false, message: '获取省份商品失败' };
    }
}

// 添加地方商品
async function addLocalProduct(provinceId, product) {
    console.log('[Direct Sourcing API] 添加地方商品:', provinceId, product);
    try {
        // 向数据库添加地方商品
        const newProduct = await db.addLocalProduct(provinceId, {
            name: product.name,
            price: parseFloat(product.price),
            originalPrice: parseFloat(product.originalPrice) || parseFloat(product.price),
            description: product.description || '',
            image: product.image || 'https://picsum.photos/id/30/300/300',
            isSeasonal: product.isSeasonal || false
        });
        
        return { success: true, product: newProduct };
    } catch (error) {
        console.error('[Direct Sourcing API] 添加地方商品失败:', error);
        return { success: false, message: '添加地方商品失败' };
    }
}

// 更新地方商品
async function updateLocalProduct(provinceId, productId, product) {
    console.log('[Direct Sourcing API] 更新地方商品:', provinceId, productId, product);
    try {
        // 更新数据库中的地方商品
        const updatedProduct = await db.updateLocalProduct(provinceId, productId, {
            name: product.name,
            price: parseFloat(product.price),
            originalPrice: parseFloat(product.originalPrice) || parseFloat(product.price),
            description: product.description,
            image: product.image,
            isSeasonal: product.isSeasonal || false
        });
        
        if (!updatedProduct) {
            return { success: false, message: '商品不存在' };
        }
        
        return { success: true, product: updatedProduct };
    } catch (error) {
        console.error('[Direct Sourcing API] 更新地方商品失败:', error);
        return { success: false, message: '更新地方商品失败' };
    }
}

// 删除地方商品
async function deleteLocalProduct(provinceId, productId) {
    console.log('[Direct Sourcing API] 删除地方商品:', provinceId, productId);
    try {
        // 从数据库删除地方商品
        const result = await db.deleteLocalProduct(provinceId, productId);
        
        if (!result) {
            return { success: false, message: '商品不存在' };
        }
        
        return { success: true, message: '删除成功' };
    } catch (error) {
        console.error('[Direct Sourcing API] 删除地方商品失败:', error);
        return { success: false, message: '删除地方商品失败' };
    }
}

// 导出模块
module.exports = {
    getAllProvinces,
    addProvince,
    updateProvince,
    deleteProvince,
    getProvinceProducts,
    addLocalProduct,
    updateLocalProduct,
    deleteLocalProduct
};