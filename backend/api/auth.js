// 用户认证API
const db = require('./database');

// 登录接口
async function login(username, password) {
    console.log('===== 登录请求处理开始 =====');
    console.log('[Auth API] 登录请求:', { username });
    try {
        // 参数验证
        console.log('用户名:', username);
        console.log('密码存在:', !!password);
        
        if (!username || !password) {
            console.log('[Auth API] 验证失败: 用户名或密码不能为空');
            return {
                success: false,
                message: '用户名和密码不能为空'
            };
        }
        
        console.log('调用数据库查询用户...');
        const user = await db.findUser(username, password);
        
        console.log('数据库查询结果:', user ? {
            id: user.id,
            username: user.username,
            role: user.role,
            roleType: typeof user.role
        } : null);
        
        if (user) {
            console.log(`[Auth API] 登录成功: 用户${user.username} (ID:${user.id}) 角色:${user.role}`);
            return {
                success: true,
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role
                }
            };
        } else {
            console.log('[Auth API] 登录失败: 用户名或密码错误');
            return {
                success: false,
                message: '用户名或密码错误'
            };
        }
    } catch (error) {
        console.error('[Auth API] 登录过程中发生错误:', error);
        return {
            success: false,
            message: '登录失败，请稍后重试'
        };
    } finally {
        console.log('===== 登录请求处理结束 =====');
    }
}

// 注册接口
async function register(username, password) {
    console.log('[Auth API] 注册请求:', { username });
    try {
        // 参数验证
        if (!username || !password) {
            console.log('[Auth API] 注册失败: 用户名或密码不能为空');
            return {
                success: false,
                message: '用户名和密码不能为空'
            };
        }
        
        if (username.length < 3 || username.length > 20) {
            console.log('[Auth API] 注册失败: 用户名长度不符合要求');
            return {
                success: false,
                message: '用户名长度应在3-20个字符之间'
            };
        }
        
        if (password.length < 6) {
            console.log('[Auth API] 注册失败: 密码长度不符合要求');
            return {
                success: false,
                message: '密码长度至少为6个字符'
            };
        }
        
        // 检查用户名是否已存在
        const existingUser = await db.findUserByUsername(username);
        if (existingUser) {
            console.log('[Auth API] 注册失败: 用户名已存在');
            return {
                success: false,
                message: '用户名已存在'
            };
        }
        
        // 创建新用户
        const newUser = await db.addUser(username, password);
        console.log('[Auth API] 注册成功:', { userId: newUser.id });
        return {
            success: true,
            user: {
                id: newUser.id,
                username: newUser.username,
                role: newUser.role
            }
        };
    } catch (error) {
        console.error('[Auth API] 注册异常:', error);
        return {
            success: false,
            message: '注册过程中出现错误: ' + error.message
        };
    }
}

// 获取用户信息接口
async function getUserInfo(userId) {
    // 在实际应用中，应该从数据库获取用户信息
    // 这里简化处理，直接返回用户ID
    return {
        success: true,
        user: {
            id: userId,
            username: 'user' + userId,
            role: 'user'
        }
    };
}

module.exports = {
    login,
    register,
    getUserInfo
};