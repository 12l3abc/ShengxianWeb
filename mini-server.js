// 极简HTTP服务器
const http = require('http');

const PORT = 3001;

const server = http.createServer((req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*'
    });
    res.end('Hello from Mini Server!');
    console.log(`收到请求: ${req.method} ${req.url}`);
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Mini Server运行在 http://0.0.0.0:${PORT}`);
});

// 监听服务器事件
server.on('connection', (socket) => {
    console.log(`新连接: ${socket.remoteAddress}:${socket.remotePort}`);
});

server.on('error', (err) => {
    console.error('服务器错误:', err);
});

console.log('服务器已创建，等待连接...');
