const api = require('./api-server');

(async () => {
  // 注册 & 登录
  const reg = await api.handleRequest('POST', '/register', { username: 'tom', password: '123' });
  console.log('注册结果:', reg.body);

  const loginRes = await api.handleRequest('POST', '/login', { username: 'tom', password: '123' });
  console.log('登录结果:', loginRes.body);

  // 商品
  const list = await api.handleRequest('GET', '/api/products');
  console.log('所有商品:', list.body);

  const special = await api.handleRequest('GET', '/api/products/special-offers');
  console.log('特价商品:', special.body);

  const food = await api.handleRequest('GET', '/api/products/category/food');
  console.log('食品分类:', food.body);

  const single = await api.handleRequest('GET', '/api/products/1');
  console.log('单个商品:', single.body);

  // 更新
  const up = await api.handleRequest('PUT', '/api/products/1', { product: { price: 4999 } });
  console.log('更新后:', up.body);

  // 删除
  const del = await api.handleRequest('DELETE', '/api/products/2');
  console.log('删除结果:', del.body);
})();