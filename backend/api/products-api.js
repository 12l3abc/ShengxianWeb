// 商品API处理函数
const db = require('./database');

// 标准化响应格式
function standardResponse(success, data, message = '', statusCode = 200) {
    // 直接返回数据，而不是包装在data对象中，以兼容前端期望的格式
    if (data && typeof data === 'object') {
        return {
            success,
            message,
            ...data,
            statusCode
        };
    }
    return {
        success,
        message,
        data,
        statusCode
    };
}

// 错误处理
function handleError(error, defaultMessage = '操作失败') {
    console.error('API Error:', error);
    return standardResponse(false, null, `${defaultMessage}: ${error.message || error}`, 500);
}

// 参数验证
function validateProductData(productData, isUpdate = false) {
    const errors = [];
    
    if (!isUpdate) {
        // 创建商品时必填字段
        if (!productData.name || productData.name.trim() === '') {
            errors.push('商品名称不能为空');
        }
        if (productData.price === undefined) {
            errors.push('商品价格不能为空');
        }
        if (productData.stock === undefined) {
            errors.push('商品库存不能为空');
        }
    }
    
    // 价格必须是数字且大于0
    if (productData.price !== undefined) {
        const price = parseFloat(productData.price);
        if (isNaN(price) || price <= 0) {
            errors.push('商品价格必须是大于0的数字');
        }
    }
    
    // 库存必须是数字且大于等于0
    if (productData.stock !== undefined) {
        const stock = parseInt(productData.stock);
        if (isNaN(stock) || stock < 0) {
            errors.push('商品库存必须是大于等于0的数字');
        }
    }
    
    return errors;
}

// 辅助函数：根据分类名称获取分类ID
async function getCategoryIdByName(categoryName) {
    const categories = await db.getAllCategories();
    const category = categories.find(c => c.name === categoryName || c.id.toString() === categoryName);
    return category ? category.id : null;
}

// 辅助函数：根据子分类名称和父分类ID获取子分类ID
async function getSubcategoryIdByName(subcategoryName, parentCategoryId) {
    const subcategories = await db.getSubcategoriesByParentId(parentCategoryId);
    const subcategory = subcategories.find(sc => sc.name === subcategoryName || sc.id.toString() === subcategoryName);
    return subcategory ? subcategory.id : null;
}

// 辅助函数：转换分类名称为分类ID
async function transformCategoryData(productData) {
    console.log('[DEBUG] transformCategoryData - 输入:', productData);
    const transformedData = { ...productData };
    
    // 分类映射 - 用于快速转换前端分类名称为分类ID
    const categoryMap = {
        'freshProduce': 1,
        'meatPoultry': 2,
        'seafood': 3,
        'dairyBakery': 4,
        'beanProducts': 5,
        'readyMeals': 6,
        'specialOffers': 7,
        // 添加中文分类名称映射
        '新鲜果蔬': 1,
        '肉禽蛋品': 2,
        '水产海鲜': 3,
        '乳品面点': 4,
        '豆制品/杂粮': 5,
        '速食净菜': 6,
        '今日特价': 7
    };
    
    // 反向分类映射 - 用于快速获取分类名称
    const reverseCategoryMap = {
        1: 'freshProduce',
        2: 'meatPoultry',
        3: 'seafood',
        4: 'dairyBakery',
        5: 'beanProducts',
        6: 'readyMeals',
        7: 'specialOffers'
    };
    
    // 子分类映射 - 用于快速转换前端子分类ID为子分类ID
    const subcategoryMap = {
        // 新鲜果蔬子分类
        'vegetables': 11,
        'fruits': 12,
        'mushrooms': 13,
        'herbs': 14,
        
        // 肉禽蛋品子分类
        'pork': 21,
        'beef': 22,
        'lamb': 23,
        'chicken': 24,
        'duck': 25,
        'eggs': 26,
        'egg': 26,
        
        // 水产海鲜子分类
        'fish': 31,
        'shrimp': 32,
        'crab': 33,
        'shellfish': 34,
        'otherSeafood': 35,
        
        // 乳品面点子分类
        'milk': 41,
        'yogurt': 42,
        'cheese': 43,
        'bread': 44,
        'pastry': 45,
        
        // 豆制品/杂粮子分类
        'tofu': 51,
        'beanCurd': 52,
        'soyMilk': 53,
        'grains': 54,
        'beans': 55,
        
        // 速食净菜子分类
        'preWashed': 61,
        'preCut': 62,
        'readyToCook': 63,
        'readyToEat': 64,
        'frozenMeals': 65
    };
    
    // 反向子分类映射 - 用于快速获取子分类名称
    const reverseSubcategoryMap = {
        11: 'vegetables',
        12: 'fruits',
        13: 'mushrooms',
        14: 'herbs',
        21: 'pork',
        22: 'beef',
        23: 'lamb',
        24: 'chicken',
        25: 'duck',
        26: 'eggs',
        31: 'fish',
        32: 'shrimp',
        33: 'crab',
        34: 'shellfish',
        35: 'otherSeafood',
        41: 'milk',
        42: 'yogurt',
        43: 'cheese',
        44: 'bread',
        45: 'pastry',
        51: 'tofu',
        52: 'beanCurd',
        53: 'soyMilk',
        54: 'grains',
        55: 'beans',
        61: 'preWashed',
        62: 'preCut',
        63: 'readyToCook',
        64: 'readyToEat',
        65: 'frozenMeals'
    };
    
    // 转换主分类 - 处理前端直接传递category_id的情况
    if (transformedData.category_id !== undefined && transformedData.category_id !== null) {
        console.log('[DEBUG] transformCategoryData - category_id存在:', transformedData.category_id);
        // 检查category_id是否是分类名称，如果是则转换为分类ID
        const categoryValue = transformedData.category_id;
        let finalCategoryId;
        let finalCategoryName;
        
        // 如果是字符串，尝试转换为分类ID
        if (typeof categoryValue === 'string') {
            console.log('[DEBUG] transformCategoryData - category_id是字符串:', categoryValue);
            // 使用映射直接转换
            const mappedId = categoryMap[categoryValue];
            console.log('[DEBUG] transformCategoryData - 映射ID:', mappedId);
            if (mappedId) {
                finalCategoryId = mappedId;
                finalCategoryName = categoryValue;
            } else {
                // 尝试通过名称获取
                const fetchedId = await getCategoryIdByName(categoryValue);
                if (fetchedId) {
                    finalCategoryId = fetchedId;
                    finalCategoryName = categoryValue;
                } else {
                    // 如果无法获取，保留原始值，不进行验证
                    finalCategoryId = categoryValue;
                    finalCategoryName = categoryValue;
                }
            }
        } 
        // 如果是数字或数字字符串，直接转换为数字
        else if (typeof categoryValue === 'number' || !isNaN(categoryValue)) {
            finalCategoryId = parseInt(categoryValue);
            // 使用反向映射获取分类名称
            finalCategoryName = reverseCategoryMap[finalCategoryId] || finalCategoryId.toString();
        } else {
            finalCategoryId = categoryValue;
            finalCategoryName = categoryValue;
        }
        
        // 设置转换后的分类ID和分类名称
        transformedData.category_id = finalCategoryId;
        transformedData.category = finalCategoryName;
        console.log('[DEBUG] transformCategoryData - 设置分类:', transformedData.category, '分类ID:', transformedData.category_id);
    } else if (transformedData.category) {
        // 当仅有分类字符串时，按名称映射ID
        console.log('[DEBUG] transformCategoryData - 仅有category字段:', transformedData.category);
        const mappedId = categoryMap[transformedData.category];
        if (mappedId) {
            transformedData.category_id = mappedId;
            transformedData.category = reverseCategoryMap[mappedId] || transformedData.category;
        } else {
            // 尝试从数据库获取
            const fetchedId = await getCategoryIdByName(transformedData.category);
            transformedData.category_id = fetchedId || 1;
            transformedData.category = reverseCategoryMap[transformedData.category_id] || transformedData.category;
        }
        console.log('[DEBUG] transformCategoryData - 使用category映射结果:', transformedData.category, transformedData.category_id);
    } else {
        console.log('[DEBUG] transformCategoryData - category_id和category都不存在，设置默认freshProduce');
        transformedData.category = 'freshProduce';
        transformedData.category_id = 1;
    }
    
    // 转换子分类 - 处理前端直接传递subcategory_id的情况
    if (transformedData.subcategory_id !== undefined && transformedData.subcategory_id !== null && transformedData.category_id) {
        // 检查subcategory_id是否是子分类名称，如果是则转换为子分类ID
        const subcategoryValue = transformedData.subcategory_id;
        let finalSubcategoryId;
        let finalSubcategoryName;
        
        // 如果是字符串，尝试转换为子分类ID
        if (typeof subcategoryValue === 'string') {
            // 使用映射直接转换
            const mappedSubId = subcategoryMap[subcategoryValue];
            if (mappedSubId) {
                finalSubcategoryId = mappedSubId;
                finalSubcategoryName = subcategoryValue;
            } else {
                // 尝试通过名称获取
                const fetchedSubId = await getSubcategoryIdByName(subcategoryValue, transformedData.category_id);
                if (fetchedSubId) {
                    finalSubcategoryId = fetchedSubId;
                    finalSubcategoryName = subcategoryValue;
                } else {
                    // 如果无法获取，保留原始值，不进行验证
                    finalSubcategoryId = subcategoryValue;
                    finalSubcategoryName = subcategoryValue;
                }
            }
        } 
        // 如果是数字或数字字符串，直接转换为数字
        else if (typeof subcategoryValue === 'number' || !isNaN(subcategoryValue)) {
            finalSubcategoryId = parseInt(subcategoryValue);
            // 使用反向映射获取子分类名称
            finalSubcategoryName = reverseSubcategoryMap[finalSubcategoryId] || finalSubcategoryId.toString();
        } else {
            finalSubcategoryId = subcategoryValue;
            finalSubcategoryName = subcategoryValue;
        }
        
        // 设置转换后的子分类ID和子分类名称
        transformedData.subcategory_id = finalSubcategoryId;
        transformedData.subcategory = finalSubcategoryName;
    } else {
        console.log('[DEBUG] transformCategoryData - subcategory_id不存在或为null，按主分类设置默认值');
        const defaultSubMap = {
            1: { name: 'vegetables', id: 11 }, // freshProduce
            2: { name: 'pork', id: 21 },        // meatPoultry
            3: { name: 'fish', id: 31 },        // seafood
            4: { name: 'milk', id: 41 },        // dairyBakery
            5: { name: 'tofu', id: 51 },        // beanProducts
            6: { name: 'preWashed', id: 61 },   // readyMeals
            7: { name: 'specialOffers', id: 71 }
        };
        const fallback = defaultSubMap[transformedData.category_id] || defaultSubMap[1];
        transformedData.subcategory = fallback.name;
        transformedData.subcategory_id = fallback.id;
    }
    
    console.log('[DEBUG] transformCategoryData - 输出:', transformedData);
    return transformedData;
}

// 统一字段命名，便于前端直接使用驼峰字段
function normalizeProduct(product) {
    if (!product) return product;
    return {
        ...product,
        isFlashSale: product.isFlashSale !== undefined ? product.isFlashSale : !!product.is_flash_sale,
        isSpecialOffer: product.isSpecialOffer !== undefined ? product.isSpecialOffer : !!product.is_special_offer,
        flashSaleEndTime: product.flashSaleEndTime || product.flash_sale_end_time || null,
        subcategory: product.subcategory || product.subcategoryName || product.subcategory_name || product.subcategory_id || product.subcategoryId,
    };
}

// 获取所有商品
async function getAllProducts() {
    try {
        const products = await db.getAllProducts();
        const normalized = products.map(normalizeProduct);
        return standardResponse(true, { products: normalized }, '获取商品列表成功');
    } catch (error) {
        return handleError(error, '获取商品列表失败');
    }
}

// 根据分类获取商品
async function getProductsByCategory(category) {
    try {
        // 验证分类参数
        if (!category || category.trim() === '') {
            return standardResponse(false, null, '分类参数不能为空', 400);
        }
        
        const products = await db.getProductsByCategory(category);
        const normalized = products.map(normalizeProduct);
        return standardResponse(true, { products: normalized }, `获取${category}分类商品成功`);
    } catch (error) {
        return handleError(error, '获取分类商品失败');
    }
}

// 根据ID获取商品
async function getProductById(id) {
    try {
        // 验证ID参数
        const productId = parseInt(id);
        if (isNaN(productId) || productId <= 0) {
            return standardResponse(false, null, '商品ID必须是大于0的数字', 400);
        }
        
        const product = await db.getProductById(productId);
        if (!product) {
            return standardResponse(false, null, '商品未找到', 404);
        }
        return standardResponse(true, { product }, '获取商品详情成功');
    } catch (error) {
        return handleError(error, '获取商品详情失败');
    }
}

// 添加商品
async function addProduct(productData) {
    try {
        console.log('[DEBUG] addProduct - 输入:', productData);
        // 转换分类数据：将前端的分类名称转换为分类ID
        const transformedData = await transformCategoryData(productData);
        console.log('[DEBUG] addProduct - 转换后:', transformedData);
        
        // 参数验证
        const validationErrors = validateProductData(transformedData);
        if (validationErrors.length > 0) {
            return standardResponse(false, null, validationErrors.join(', '), 400);
        }
        
        const newProduct = await db.addProduct(transformedData);
        return standardResponse(true, { product: newProduct }, '添加商品成功', 201);
    } catch (error) {
        console.log('[DEBUG] addProduct - 错误:', error);
        return handleError(error, '添加商品失败');
    }
}

// 更新商品
async function updateProduct(id, productData) {
    try {
        // 验证ID参数
        const productId = parseInt(id);
        if (isNaN(productId) || productId <= 0) {
            return standardResponse(false, null, '商品ID必须是大于0的数字', 400);
        }
        
        // 转换分类数据：将前端的分类名称转换为分类ID
        const transformedData = await transformCategoryData(productData);
        
        // 参数验证
        const validationErrors = validateProductData(transformedData, true);
        if (validationErrors.length > 0) {
            return standardResponse(false, null, validationErrors.join(', '), 400);
        }
        
        const updatedProduct = await db.updateProduct(productId, transformedData);
        if (!updatedProduct) {
            return standardResponse(false, null, '商品未找到', 404);
        }
        return standardResponse(true, { product: updatedProduct }, '更新商品成功');
    } catch (error) {
        return handleError(error, '更新商品失败');
    }
}

// 删除商品
async function deleteProduct(id) {
    try {
        // 验证ID参数
        const productId = parseInt(id);
        if (isNaN(productId) || productId <= 0) {
            return standardResponse(false, null, '商品ID必须是大于0的数字', 400);
        }
        
        const deletedProduct = await db.deleteProduct(productId);
        if (!deletedProduct) {
            return standardResponse(false, null, '商品未找到', 404);
        }
        return standardResponse(true, { product: deletedProduct }, '删除商品成功');
    } catch (error) {
        return handleError(error, '删除商品失败');
    }
}

// 获取特价商品
async function getSpecialOfferProducts() {
    try {
        let products = await db.getSpecialOfferProducts();
        // 兜底：如果没有查到，尝试从全量商品中过滤
        if (!products || products.length === 0) {
            console.warn('[ProductsAPI] 特价查询结果为空，改为从全量中过滤 isSpecialOffer');
            const all = await db.getAllProducts();
            products = all.filter((p) => p.is_special_offer === 1 || p.isSpecialOffer === true);
        }
        // 再兜底：仍然没有数据时返回内置样例，确保前端有内容
        if (!products || products.length === 0) {
            console.warn('[ProductsAPI] 特价商品仍为空，返回内置样例数据');
            products = [
                {
                    id: 90001,
                    name: '有机苹果',
                    category: 'freshProduce',
                    price: 8.9,
                    image: 'https://via.placeholder.com/200x200/4CAF50/ffffff?text=%E6%9C%89%E6%9C%BA%E8%8B%B9%E6%9E%9C',
                    description: '精选有机苹果，香甜多汁',
                    is_special_offer: 1,
                    is_flash_sale: 0,
                    stock: 120,
                    subcategory: 'fruits',
                },
                {
                    id: 90002,
                    name: '精选牛排',
                    category: 'meatPoultry',
                    price: 39.9,
                    image: 'https://via.placeholder.com/200x200/FF5722/ffffff?text=%E7%89%9B%E6%8E%92',
                    description: '谷饲牛排，口感嫩滑',
                    is_special_offer: 1,
                    is_flash_sale: 0,
                    stock: 80,
                    subcategory: 'beef',
                },
                {
                    id: 90003,
                    name: '进口牛奶',
                    category: 'dairyBakery',
                    price: 9.9,
                    image: 'https://via.placeholder.com/200x200/03A9F4/ffffff?text=%E7%89%9B%E5%A5%B6',
                    description: '高钙营养，早餐优选',
                    is_special_offer: 1,
                    is_flash_sale: 0,
                    stock: 150,
                    subcategory: 'milk',
                },
            ];
        }
        const normalized = products.map(normalizeProduct);
        return standardResponse(true, { products: normalized }, '获取特价商品成功');
    } catch (error) {
        return handleError(error, '获取特价商品失败');
    }
}

// 获取秒杀商品
async function getFlashSaleProducts() {
    try {
        let products = await db.getFlashSaleProducts();
        // 兜底：如果没有查到，尝试从全量商品中过滤
        if (!products || products.length === 0) {
            console.warn('[ProductsAPI] 秒杀查询结果为空，改为从全量中过滤 isFlashSale');
            const all = await db.getAllProducts();
            products = all.filter((p) => p.is_flash_sale === 1 || p.isFlashSale === true);
        }
        // 再兜底：仍然没有数据时返回内置样例，确保前端有内容
        if (!products || products.length === 0) {
            console.warn('[ProductsAPI] 秒杀商品仍为空，返回内置样例数据');
            const now = new Date();
            const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString();
            products = [
                {
                    id: 91001,
                    name: '鲜活大虾',
                    category: 'seafood',
                    price: 69.9,
                    image: 'https://via.placeholder.com/200x200/009688/ffffff?text=%E5%A4%A7%E8%99%BE',
                    description: '冰鲜直达，肉质紧实',
                    is_special_offer: 1,
                    is_flash_sale: 1,
                    flash_sale_end_time: twoHoursLater,
                    stock: 50,
                    subcategory: 'shrimp',
                },
                {
                    id: 91002,
                    name: '智利车厘子',
                    category: 'freshProduce',
                    price: 59.9,
                    image: 'https://via.placeholder.com/200x200/E91E63/ffffff?text=%E8%BD%A6%E5%8E%98%E5%AD%90',
                    description: '进口大果，甜而多汁',
                    is_special_offer: 1,
                    is_flash_sale: 1,
                    flash_sale_end_time: twoHoursLater,
                    stock: 70,
                    subcategory: 'fruits',
                },
            ];
        }
        const normalized = products.map(normalizeProduct);
        return standardResponse(true, { products: normalized }, '获取秒杀商品成功');
    } catch (error) {
        return handleError(error, '获取秒杀商品失败');
    }
}

// 获取所有分类
async function getAllCategories() {
    try {
        const categories = await db.getAllCategories();
        return standardResponse(true, { categories }, '获取分类列表成功');
    } catch (error) {
        return handleError(error, '获取分类列表失败');
    }
}

// 获取指定级别的分类
async function getCategoriesByLevel(level) {
    try {
        if (!level) {
            return standardResponse(false, null, '分类级别不能为空', 400);
        }
        const categories = await db.getCategoriesByLevel(level);
        return standardResponse(true, { categories }, `获取${level}级分类成功`);
    } catch (error) {
        return handleError(error, '获取分类失败');
    }
}

// 获取一级分类
async function getFirstLevelCategories() {
    return getCategoriesByLevel(1);
}

// 获取二级分类
async function getSecondLevelCategories() {
    return getCategoriesByLevel(2);
}

// 根据父分类ID获取子分类
async function getSubcategoriesByParentId(parentId) {
    try {
        if (!parentId) {
            return standardResponse(false, null, '父分类ID不能为空', 400);
        }
        const subcategories = await db.getSubcategoriesByParentId(parentId);
        return standardResponse(true, { subcategories }, `获取父分类${parentId}的子分类成功`);
    } catch (error) {
        return handleError(error, '获取子分类失败');
    }
}

// 根据ID获取分类
async function getCategoryById(id) {
    try {
        if (!id) {
            return standardResponse(false, null, '分类ID不能为空', 400);
        }
        const category = await db.getCategoryById(id);
        if (!category) {
            return standardResponse(false, null, '分类未找到', 404);
        }
        return standardResponse(true, { category }, '获取分类成功');
    } catch (error) {
        return handleError(error, '获取分类失败');
    }
}

// 添加分类
async function addCategory(category) {
    try {
        if (!category || !category.name) {
            return standardResponse(false, null, '分类名称不能为空', 400);
        }
        const newCategory = await db.addCategory(category);
        return standardResponse(true, { category: newCategory }, '添加分类成功', 201);
    } catch (error) {
        return handleError(error, '添加分类失败');
    }
}

// 更新分类
async function updateCategory(id, category) {
    try {
        if (!id) {
            return standardResponse(false, null, '分类ID不能为空', 400);
        }
        const updatedCategory = await db.updateCategory(id, category);
        if (!updatedCategory) {
            return standardResponse(false, null, '分类未找到', 404);
        }
        return standardResponse(true, { category: updatedCategory }, '更新分类成功');
    } catch (error) {
        return handleError(error, '更新分类失败');
    }
}

// 删除分类
async function deleteCategory(id) {
    try {
        if (!id) {
            return standardResponse(false, null, '分类ID不能为空', 400);
        }
        const deletedCategory = await db.deleteCategory(id);
        if (!deletedCategory) {
            return standardResponse(false, null, '分类未找到', 404);
        }
        return standardResponse(true, { category: deletedCategory }, '删除分类成功');
    } catch (error) {
        return handleError(error, '删除分类失败');
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
    getAllCategories,
    getCategoriesByLevel,
    getFirstLevelCategories,
    getSecondLevelCategories,
    getSubcategoriesByParentId,
    getCategoryById,
    addCategory,
    updateCategory,
    deleteCategory
};