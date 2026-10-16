//API客户端
class SimpleApiClient {
    constructor() {
        // API服务器地址 - 确保指向正确的端口
        this.baseUrl = 'http://localhost:3001';
        console.log('[SimpleApiClient] 初始化，baseUrl设置为:', this.baseUrl);
    }
    
    // 简化的HTTP请求方法
    async request(method, url, data = null) {
        const fullUrl = this.baseUrl + url;
        console.log(`[SimpleAPI] 请求URL: ${fullUrl}`);
        console.log(`[SimpleAPI] 请求方法: ${method}`);
        
        // 构建请求选项
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            mode: 'cors', // 明确设置为cors模式
            cache: 'no-cache'
        };
        
        if (data) {
            options.body = JSON.stringify(data);
            console.log(`[SimpleAPI] 请求数据:`, { ...data, password: data.password ? '***' : undefined });
        }
        
        try {
            // 发送请求
            const response = await fetch(fullUrl, options);
            console.log(`[SimpleAPI] 响应状态: ${response.status} ${response.statusText}`);
            
            // 解析响应
            const responseData = await response.json();
            console.log(`[SimpleAPI] 响应数据:`, responseData);
            
            return responseData;
        } catch (error) {
            console.error(`[SimpleAPI] 请求失败:`, error);
            return {
                success: false,
                message: '网络请求失败: ' + error.message
            };
        }
    }
    
    // 登录方法
    async login(username, password) {
        console.log(`[SimpleAPI] 登录调用，用户名: ${username}`);
        return this.request('POST', '/login', { username, password });
    }
    
    // 注册方法
    async register(username, password) {
        console.log(`[SimpleAPI] 注册调用，用户名: ${username}`);
        return this.request('POST', '/register', { username, password });
    }
}

// 创建API客户端实例
const simpleApiClient = new SimpleApiClient();

// 导出API客户端
window.simpleApiClient = simpleApiClient;