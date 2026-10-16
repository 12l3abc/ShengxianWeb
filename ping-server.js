// 简单的服务器ping测试脚本
const http = require('http');

console.log('正在测试连接到 http://localhost:3003...');

// 创建一个简单的GET请求
const req = http.get('http://localhost:3003/ping', (res) => {
  console.log(`服务器响应状态码: ${res.statusCode}`);
  res.on('data', (chunk) => {
    console.log(`响应数据: ${chunk}`);
  });
  res.on('end', () => {
    console.log('响应结束');
  });
});

req.on('error', (e) => {
  console.error(`请求错误: ${e.message}`);
  console.error(`错误类型: ${e.code}`);
  console.error(`错误栈: ${e.stack}`);
});

// 5秒后超时
setTimeout(() => {
  console.log('连接超时');
  req.destroy();
}, 5000);