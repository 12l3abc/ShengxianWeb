// 非常简单的测试脚本
const http = require('http');

console.log('测试连接到服务器...');

const options = {
    hostname: '127.0.0.1',  // 使用IP地址而不是localhost
    port: 3001,
    path: '/',
    method: 'GET'
};

const req = http.request(options, (res) => {
    console.log('✅ 连接成功！');
    console.log(`状态码: ${res.statusCode}`);
    res.on('data', (chunk) => {
        console.log('响应内容:', chunk.toString());
    });
});

req.on('error', (e) => {
    console.error('❌ 连接失败:', e.message);
    console.error('错误代码:', e.code);
});

req.end();
