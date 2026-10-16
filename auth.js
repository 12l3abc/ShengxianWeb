// auth.js
const users = {};          // username -> {username, password, id, role}
let idSeq = 1;

// 初始化管理员账户
users['admin'] = { id: idSeq++, username: 'admin', password: '123456', role: 'admin' };

async function login(username, password) {
  const u = users[username];
  if (!u) throw new Error('用户不存在');
  if (u.password !== password) throw new Error('密码错误');
  return { success: true, userId: u.id, token: 'fake-jwt-' + u.id, user: { id: u.id, username: u.username, role: u.role } };
}

async function register(username, password) {
  if (users[username]) throw new Error('用户已存在');
  const u = { id: idSeq++, username, password, role: 'user' };
  users[username] = u;
  return { success: true, userId: u.id };
}

async function getUserInfo(userId) {
  const u = Object.values(users).find(i => i.id === Number(userId));
  if (!u) throw new Error('用户不存在');
  return { success: true, user: { id: u.id, username: u.username, role: u.role } };
}

module.exports = { login, register, getUserInfo };