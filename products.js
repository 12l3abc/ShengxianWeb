// products.js
const list = [
  { id: 1, name: 'iPhone', category: 'digital', price: 5999, special: true, flash: false },
  { id: 2, name: '牛奶', category: 'food', price: 10, special: false, flash: true },
];
let nextId = 3;

function getAllProducts() {
  return { success: true, products: list };
}

function getProductsByCategory(category) {
  return { success: true, products: list.filter(p => p.category === category) };
}

function getProductById(id) {
  const p = list.find(i => i.id === Number(id));
  if (!p) throw new Error('商品不存在');
  return { success: true, product: p };
}

function addProduct(product) {
  const p = { ...product, id: nextId++ };
  list.push(p);
  return { success: true, product: p };
}

function updateProduct(id, product) {
  const idx = list.findIndex(i => i.id === Number(id));
  if (idx === -1) throw new Error('商品不存在');
  list[idx] = { ...list[idx], ...product };
  return { success: true, product: list[idx] };
}

function deleteProduct(id) {
  const idx = list.findIndex(i => i.id === Number(id));
  if (idx === -1) throw new Error('商品不存在');
  list.splice(idx, 1);
  return { success: true };
}

function getSpecialOfferProducts() {
  return { success: true, products: list.filter(p => p.special) };
}

function getFlashSaleProducts() {
  return { success: true, products: list.filter(p => p.flash) };
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
};