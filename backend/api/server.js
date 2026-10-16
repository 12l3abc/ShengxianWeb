// products.js
const list = [
    { id: 1, name: 'iPhone',  category: 'digital', price: 5999, special: true,  flash: false },
    { id: 2, name: '牛奶',    category: 'food',    price: 10,   special: false, flash: true  },
];
let nextId = 3;

const api = {
    getAllProducts: () => list,
    getProductsByCategory: cate => list.filter(p => p.category === cate),
    getProductById: id => {
        const p = list.find(i => i.id === Number(id));
        if (!p) throw new Error('商品不存在');
        return p;
    },
    addProduct: product => {
        const p = { ...product, id: nextId++ };
        list.push(p);
        return p;
    },
    updateProduct: (id, product) => {
        const idx = list.findIndex(i => i.id === Number(id));
        if (idx === -1) throw new Error('商品不存在');
        list[idx] = { ...list[idx], ...product };
        return list[idx];
    },
    deleteProduct: id => {
        const idx = list.findIndex(i => i.id === Number(id));
        if (idx === -1) throw new Error('商品不存在');
        list.splice(idx, 1);
    },
    getSpecialOfferProducts: () => list.filter(p => p.special),
    getFlashSaleProducts:    () => list.filter(p => p.flash),
};

// 统一包一层 {success:true, product(s): ...}
Object.keys(api).forEach(fn => {
    const raw = api[fn];
    api[fn] = async (...args) => {
        const data = await raw(...args);
        if (fn.startsWith('get') && fn !== 'getProductById') return { success: true, products: data };
        return { success: true, ...(data.id ? { product: data } : {}) };
    };
});

module.exports = api;