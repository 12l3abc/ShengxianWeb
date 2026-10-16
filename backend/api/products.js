// 商品管理API
const db = require('./database');

// 配置标志：是否显示商品信息
// 设置为true可以在用户界面和管理员界面中显示商品信息
const SHOW_PRODUCTS = true;

// 获取所有商品
async function getAllProducts() {
    try {
        if (!SHOW_PRODUCTS) {
            // 如果配置为不显示商品，返回空数组
            return {
                success: true,
                products: []
            };
        }
        const products = await db.getAllProducts();
        return {
            success: true,
            products: products
        };
    } catch (error) {
        return {
            success: false,
            message: '获取商品列表失败: ' + error.message
        };
    }
}

// 根据分类获取商品
async function getProductsByCategory(category) {
    try {
        if (!SHOW_PRODUCTS) {
            // 如果配置为不显示商品，返回空数组
            return {
                success: true,
                products: []
            };
        }
        const products = await db.getProductsByCategory(category);
        return {
            success: true,
            products: products
        };
    } catch (error) {
        return {
            success: false,
            message: '获取分类商品失败: ' + error.message
        };
    }
}

// 根据ID获取商品
async function getProductById(id) {
    try {
        if (!SHOW_PRODUCTS) {
            // 如果配置为不显示商品，返回商品未找到
            return {
                success: false,
                message: '商品未找到'
            };
        }
        const product = await db.getProductById(id);
        if (product) {
            return {
                success: true,
                product: product
            };
        } else {
            return {
                success: false,
                message: '商品未找到'
            };
        }
    } catch (error) {
        return {
            success: false,
            message: '获取商品详情失败: ' + error.message
        };
    }
}

// 添加商品
async function addProduct(productData) {
    try {
        const newProduct = await db.addProduct(productData);
        return {
            success: true,
            product: newProduct
        };
    } catch (error) {
        return {
            success: false,
            message: '添加商品失败: ' + error.message
        };
    }
}

// 更新商品
async function updateProduct(id, productData) {
    try {
        console.log('[Products API] 开始更新商品:', { id, productData });
        const updatedProduct = await db.updateProduct(id, productData);
        console.log('[Products API] 数据库更新结果:', updatedProduct);
        if (updatedProduct) {
            return {
                success: true,
                product: updatedProduct
            };
        } else {
            return {
                success: false,
                message: '商品未找到'
            };
        }
    } catch (error) {
        console.error('[Products API] 更新商品异常:', error);
        return {
            success: false,
            message: '更新商品失败: ' + error.message
        };
    }
}

// 删除商品
async function deleteProduct(id) {
    try {
        console.log('[Products API] 开始删除商品:', { id });
        const deletedProduct = await db.deleteProduct(id);
        console.log('[Products API] 数据库删除结果:', deletedProduct);
        if (deletedProduct) {
            return {
                success: true,
                product: deletedProduct
            };
        } else {
            return {
                success: false,
                message: '商品未找到'
            };
        }
    } catch (error) {
        console.error('[Products API] 删除商品异常:', error);
        return {
            success: false,
            message: '删除商品失败: ' + error.message
        };
    }
}

// 获取特价商品
async function getSpecialOfferProducts() {
    try {
        if (!SHOW_PRODUCTS) {
            // 如果配置为不显示商品，返回空数组
            return {
                success: true,
                products: []
            };
        }
        const products = await db.getSpecialOfferProducts();
        return {
            success: true,
            products: products
        };
    } catch (error) {
        return {
            success: false,
            message: '获取特价商品失败: ' + error.message
        };
    }
}

// 获取秒杀商品
async function getFlashSaleProducts() {
    try {
        if (!SHOW_PRODUCTS) {
            // 如果配置为不显示商品，返回空数组
            return {
                success: true,
                products: []
            };
        }
        const products = await db.getFlashSaleProducts();
        return {
            success: true,
            products: products
        };
    } catch (error) {
        return {
            success: false,
            message: '获取秒杀商品失败: ' + error.message
        };
    }
}

// 获取乳品面点类别商品
async function getDairyBakeryProducts() {
    try {
        if (!SHOW_PRODUCTS) {
            // 如果配置为不显示商品，返回空数组
            return {
                success: true,
                products: []
            };
        }
        const products = await db.getProductsByCategory('dairyBakery');
        return {
            success: true,
            products: products
        };
    } catch (error) {
        return {
            success: false,
            message: '获取乳品面点商品失败: ' + error.message
        };
    }
}

// 获取肉禽蛋品类别商品
async function getMeatPoultryProducts() {
    try {
        if (!SHOW_PRODUCTS) {
            // 如果配置为不显示商品，返回空数组
            return {
                success: true,
                products: []
            };
        }
        const products = await db.getProductsByCategory('meatPoultry');
        return {
            success: true,
            products: products
        };
    } catch (error) {
        return {
            success: false,
            message: '获取肉禽蛋品商品失败: ' + error.message
        };
    }
}

// 获取水产海鲜类别商品
async function getSeafoodProducts() {
    try {
        if (!SHOW_PRODUCTS) {
            // 如果配置为不显示商品，返回空数组
            return {
                success: true,
                products: []
            };
        }
        const products = await db.getProductsByCategory('seafood');
        return {
            success: true,
            products: products
        };
    } catch (error) {
        return {
            success: false,
            message: '获取水产海鲜商品失败: ' + error.message
        };
    }
}

// 获取新鲜蔬菜类别商品
async function getFreshProduceProducts() {
    try {
        if (!SHOW_PRODUCTS) {
            // 如果配置为不显示商品，返回空数组
            return {
                success: true,
                products: []
            };
        }
        const products = await db.getProductsByCategory('freshProduce');
        return {
            success: true,
            products: products
        };
    } catch (error) {
        return {
            success: false,
            message: '获取新鲜蔬菜商品失败: ' + error.message
        };
    }
}

// 获取豆制品/杂粮类别商品
async function getBeanProducts() {
    try {
        if (!SHOW_PRODUCTS) {
            // 如果配置为不显示商品，返回空数组
            return {
                success: true,
                products: []
            };
        }
        const products = await db.getProductsByCategory('beanProducts');
        return {
            success: true,
            products: products
        };
    } catch (error) {
        return {
            success: false,
            message: '获取豆制品/杂粮商品失败: ' + error.message
        };
    }
}

module.exports = {
    getAllProducts,
    getProductsByCategory,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct,
    getSpecialOfferProducts,
    getFlashSaleProducts,
    getDairyBakeryProducts,
    getMeatPoultryProducts,
    getSeafoodProducts,
    getFreshProduceProducts,
    getBeanProducts
};