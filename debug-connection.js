// 详细的连接调试脚本
const http = require('http');
const net = require('net');

console.log('开始调试连接问题...');

// 测试1: 使用net模块直接测试TCP连接
console.log('\n1. 测试TCP连接...');
const socket = net.createConnection({ port: 3001 }, () => {
    console.log('2. TCP连接成功！');
    socket.end();
});

socket.on('error', (e) => {
    console.error('2. TCP连接错误:', e.message);
    console.error('3. 错误代码:', e.code);
    console.error('4. 错误地址:', e.address);
    console.error('5. 错误端口:', e.port);
});

// 测试2: 使用http.request测试HTTP连接
setTimeout(() => {
    console.log('\n6. 测试HTTP连接...');
    
    const options = {
        hostname: 'localhost',
        port: 3001,
        path: '/api/products',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': 2
        }
    };
    
    console.log('7. 请求选项:', options);
    
    const req = http.request(options, (res) => {
        console.log('8. HTTP请求成功，状态码:', res.statusCode);
        res.on('data', (chunk) => {
            console.log('9. 响应数据:', chunk.toString());
        });
        res.on('end', () => {
            console.log('10. 响应结束');
        });
    });
    
    req.on('error', (e) => {
        console.error('11. HTTP请求错误:', e.message);
        console.error('12. 错误代码:', e.code);
        console.error('13. 错误栈:', e.stack);
    });
    
    req.on('socket', (socket) => {
        console.log('14. 套接字已分配:', socket);
        
        socket.on('connect', () => {
            console.log('15. 套接字已连接');
        });
        
        socket.on('error', (e) => {
            console.error('16. 套接字错误:', e.message);
        });
        
        socket.on('close', () => {
            console.log('17. 套接字已关闭');
        });
    });
    
    req.write('{}');
    req.end();
    
    console.log('18. 请求已发送');
}, 2000);
