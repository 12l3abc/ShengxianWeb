const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const apiServer = require('./api-server');

// 创建日志目录
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

// 日志记录函数
function logToFile(message) {
    const now = new Date();
    const timestamp = now.toISOString().replace('T', ' ').substring(0, 19);
    const logMessage = `[${timestamp}] ${message}\n`;
    
    console.log(logMessage.trim());
}

// 捕获未处理的异常
process.on('uncaughtException', (err) => {
    logToFile(`[ERROR] 未处理的异常: ${err.message}`);
    logToFile(`[ERROR] 异常堆栈: ${err.stack}`);
    // 移除process.exit(1)调用，让服务器继续运行
});

// 捕获未处理的Promise拒绝
process.on('unhandledRejection', (reason, promise) => {
    logToFile(`[ERROR] 未处理的Promise拒绝: ${reason}`);
    logToFile(`[ERROR] Promise: ${promise}`);
    // 移除process.exit(1)调用，让服务器继续运行
});

// MIME类型映射
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.ico': 'image/x-icon'
};

// 创建HTTP服务器
logToFile('创建HTTP服务器...');
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    let pathname = parsedUrl.pathname;
    let method = req.method;

    // 为所有请求添加CORS头支持，而不仅限于特定路径
        // 添加完整的CORS头支持
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Max-Age', '86400'); // 24小时缓存预检请求
        
        // 处理预检请求
        if (method === 'OPTIONS') {
            res.writeHead(204);
            res.end();
            return;
        }
        
        // 处理API请求和登录请求
        if (pathname.startsWith('/api/') || pathname === '/login' || pathname === '/register') {
        
        logToFile(`[Server] 收到API请求: ${method} ${pathname}`);
        // 收集请求体数据
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            // 将异步逻辑移到这里
            (async () => {
                try {
                    let requestData = {};
                    if (body) {
                        requestData = JSON.parse(body);
                    }
                    
                    logToFile(`[Server] 原始请求体: ${body}`);
                    logToFile(`[Server] 请求数据: ${JSON.stringify(requestData)}`);

                    // 确保路径以斜杠开头，不移除/api前缀，直接传递给API服务器处理
                    const cleanApiPath = pathname.startsWith('/') ? pathname : '/' + pathname;
                    logToFile(`[Server] 原始API路径: ${pathname}`);
                    logToFile(`[Server] 清理后的路径: ${cleanApiPath}`);
                    logToFile(`[Server] 请求方法: ${method}`);
                    
                    logToFile(`[Server] 调用API处理函数: ${method} ${cleanApiPath} - 参数: ${JSON.stringify(requestData)}`);
                    const response = await apiServer.handleRequest(method, cleanApiPath, requestData);
                    logToFile(`[Server] API处理结果: ${JSON.stringify(response)}`);
                    logToFile(`[Server] 响应数据: ${JSON.stringify(response)}`);
                    
                    // 直接返回响应对象，不再包装
                    res.writeHead(200, { 
                        'Content-Type': 'application/json; charset=utf-8',
                        'Access-Control-Allow-Origin': '*' // 再次设置以确保响应包含CORS头
                    });
                    res.end(JSON.stringify(response));
                } catch (error) {
                    logToFile(`[Server] 处理API请求时出错: ${error.stack || error.message}`);
                    res.writeHead(500, { 
                        'Content-Type': 'application/json; charset=utf-8',
                        'Access-Control-Allow-Origin': '*'
                    });
                    res.end(JSON.stringify({ success: false, message: '服务器内部错误: ' + error.message }));
                }
            })();
        });
        return;
    }

    // 处理静态文件请求
    if (pathname === '/') {
        pathname = '/index.html';
    }

    const filePath = path.join(process.cwd(), pathname);
    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // 文件未找到
                fs.readFile(path.join(process.cwd(), '404.html'), (err, content404) => {
                    if (err) {
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        res.end('<h1>404 Not Found</h1>', 'utf-8');
                    } else {
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        res.end(content404, 'utf-8');
                    }
                });
            } else {
                // 服务器错误
                res.writeHead(500);
                res.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
            }
        } else {
                // 成功读取文件
                // 获取文件扩展名
                const extname = path.extname(filePath);
                // 设置默认内容类型
                let contentType = 'application/octet-stream';
                // 根据扩展名设置内容类型
                if (mimeTypes[extname]) {
                    contentType = mimeTypes[extname];
                    // 为文本类型添加charset=utf-8
                    if (contentType.startsWith('text/') || contentType === 'application/json') {
                        contentType += '; charset=utf-8';
                    }
                }
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            }
    });
});

// 配置
const PORT = process.env.PORT || 3001;

// 初始化应用
async function initializeApp() {
    try {
        logToFile('====================================');
        logToFile('开始初始化应用...');
        
        // 启动服务器
        logToFile(`尝试在端口 ${PORT} 上启动服务器...`);
        logToFile(`服务器对象: ${server}`);
        logToFile(`服务器监听方法: ${typeof server.listen}`);
        
        server.listen(PORT, '0.0.0.0', () => {
            logToFile(`[Server] 服务器正在运行，端口: ${PORT}`);
            logToFile(`[Server] 访问地址: http://localhost:${PORT}`);
            logToFile(`[Server] 绑定地址: 0.0.0.0`);
            logToFile('====================================');
        });
        
        // 监听服务器连接事件
        server.on('connection', (socket) => {
            logToFile(`[Connection] 新连接: ${socket.remoteAddress}:${socket.remotePort}`);
            socket.on('close', () => {
                logToFile(`[Connection] 连接关闭: ${socket.remoteAddress}:${socket.remotePort}`);
            });
            socket.on('error', (err) => {
                logToFile(`[Connection] 连接错误: ${err.message}`);
            });
        });
        
        // 检查服务器地址
        setTimeout(() => {
            const address = server.address();
            logToFile(`[Debug] 服务器地址信息: ${JSON.stringify(address)}`);
        }, 1000);
        
        // 监听服务器错误
        server.on('error', (err) => {
            logToFile(`[ERROR] 服务器错误: ${err.message}`);
            logToFile(`[ERROR] 错误代码: ${err.code}`);
            logToFile(`[ERROR] 错误地址: ${err.address}`);
            logToFile(`[ERROR] 错误端口: ${err.port}`);
            // 移除process.exit(1)调用，让服务器继续运行
        });
        
        // 定期检查服务器状态
        setInterval(() => {
            logToFile(`[Server] 服务器状态检查: 服务器仍在运行`);
        }, 5000);
        
    } catch (error) {
        logToFile(`[ERROR] 应用初始化失败: ${error.message}`);
        logToFile(`[ERROR] 错误堆栈: ${error.stack}`);
        // 移除process.exit(1)调用，让服务器继续运行
    }
}

// 启动应用
initializeApp();