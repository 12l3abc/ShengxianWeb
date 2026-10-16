// 用户管理API处理函数
const db = require('./database');

// 标准化响应格式
function standardResponse(success, data, message = '', statusCode = 200) {
    if (data && typeof data === 'object') {
        return {
            success,
            message,
            ...data,
            statusCode
        };
    }
    return {
        success,
        message,
        data,
        statusCode
    };
}

// 错误处理
function handleError(error, defaultMessage = '操作失败') {
    console.error('Users API Error:', error);
    return standardResponse(false, null, `${defaultMessage}: ${error.message || error}`, 500);
}

// 获取所有用户
async function getAllUsers() {
    try {
        const users = await db.getAllUsers();
        return standardResponse(true, { users }, '获取用户列表成功');
    } catch (error) {
        return handleError(error, '获取用户列表失败');
    }
}

// 根据ID获取用户
async function getUserById(id) {
    try {
        const user = await db.getUserById(id);
        if (!user) {
            return standardResponse(false, null, '用户不存在', 404);
        }
        return standardResponse(true, { user }, '获取用户信息成功');
    } catch (error) {
        return handleError(error, '获取用户信息失败');
    }
}

// 搜索用户
async function searchUsers(keyword) {
    try {
        if (!keyword || keyword.trim() === '') {
            return getAllUsers();
        }
        const users = await db.searchUsers(keyword.trim());
        return standardResponse(true, { users }, '搜索用户成功');
    } catch (error) {
        return handleError(error, '搜索用户失败');
    }
}

// 更新用户信息
async function updateUser(id, userData) {
    try {
        // 验证用户是否存在
        const existingUser = await db.getUserById(id);
        if (!existingUser) {
            return standardResponse(false, null, '用户不存在', 404);
        }
        
        // 验证角色
        if (userData.role && !['user', 'admin'].includes(userData.role)) {
            return standardResponse(false, null, '无效的用户角色', 400);
        }
        
        // 如果更新用户名，检查是否重复
        if (userData.username && userData.username !== existingUser.username) {
            const searchResults = await db.searchUsers(userData.username);
            const exactMatch = searchResults.find(u => u.username === userData.username);
            if (exactMatch && exactMatch.id !== parseInt(id)) {
                return standardResponse(false, null, '用户名已存在', 400);
            }
        }
        
        const updatedUser = await db.updateUser(id, userData);
        if (!updatedUser) {
            return standardResponse(false, null, '更新失败', 500);
        }
        return standardResponse(true, { user: updatedUser }, '更新用户信息成功');
    } catch (error) {
        return handleError(error, '更新用户信息失败');
    }
}

// 删除用户
async function deleteUser(id) {
    try {
        const user = await db.getUserById(id);
        if (!user) {
            return standardResponse(false, null, '用户不存在', 404);
        }
        
        if (user.role === 'admin') {
            return standardResponse(false, null, '不能删除管理员账户', 403);
        }
        
        const result = await db.deleteUser(id);
        if (!result) {
            return standardResponse(false, null, '删除失败', 500);
        }
        return standardResponse(true, { id: result.id }, '删除用户成功');
    } catch (error) {
        return handleError(error, '删除用户失败');
    }
}

module.exports = {
    getAllUsers,
    getUserById,
    searchUsers,
    updateUser,
    deleteUser
};

