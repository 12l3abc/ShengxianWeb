const http = require('http');
const os = require('os');

console.log('开始创建服务器...');

// 创建HTTP服务器
const server = http.createServer((req, res) => {
    console.log(`收到请求: ${req.method} ${req.url}`);
    
    // 添加CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // 处理预检请求
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }
    
    // 简单的API响应
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: '服务器运行正常', url: req.url }));
});

// 启动服务器
const PORT = 3004;

// 获取本地IP地址
function getLocalIpAddress() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

const localIp = getLocalIpAddress();

server.listen(PORT, () => {
    console.log('====================================');
    console.log('服务器已成功启动!');
    console.log(`端口: ${PORT}`);
    console.log(`本地地址: http://localhost:${PORT}`);
    console.log(`网络地址: http://${localIp}:${PORT}`);
    console.log('====================================');
    console.log('等待请求...');
});

// 监听错误事件
server.on('error', (err) => {
    console.error('服务器错误:', err);
    console.error('错误代码:', err.code);
    console.error('错误地址:', err.address);
    console.error('错误端口:', err.port);
});

// 监听连接事件
server.on('connection', (socket) => {
    console.log('新连接:', socket.remoteAddress, socket.remotePort);
});

// 捕获所有未处理的异常
process.on('uncaughtException', (err) => {
    console.error('未捕获的异常:', err);
    console.error('堆栈跟踪:', err.stack);
});

// 捕获所有未处理的Promise拒绝
process.on('unhandledRejection', (reason, promise) => {
    console.error('未处理的Promise拒绝:', reason);
    console.error('Promise:', promise);
});

console.log('服务器创建完成，等待启动...');