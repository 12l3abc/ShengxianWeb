// 修复脚本：完全清理 dairyBakery.js 中的重复函数并保留最新优化版
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'scripts', 'modules', 'dairyBakery.js');
let content = fs.readFileSync(filePath, 'utf8');

console.log('🔍 正在分析文件内容...');
console.log('📝 原始文件大小:', content.length, '字符');

// 定义要查找的重复函数模式
const milkSplashFuncPattern = /\/\/ 牛奶飞溅特效：.*\n.*addMilkSplashEffect\(\) \{[\s\S]*?\n\s*\}\s*\n/gi;

// 查找所有匹配的函数
const matches = [...content.matchAll(milkSplashFuncPattern)];
console.log('🎯 找到', matches.length, '个牛奶飞溅函数');

if (matches.length > 1) {
    console.log('⚡ 开始移除重复函数，仅保留第一个...');
    
    // 获取第一个函数作为保留的优化版
    const keepFunction = matches[0][0];
    console.log('✅ 保留的函数:', keepFunction.substring(0, 100) + '...');
    
    // 构建新内容：替换所有匹配为单一保留函数
    const newContent = content.replace(milkSplashFuncPattern, (match, index) => {
        // 只保留第一个匹配
        if (index === matches[0].index) {
            console.log('📌 保留第一个牛奶飞溅特效函数');
            return match;
        } else {
            console.log('❌ 删除重复的牛奶飞溅特效函数');
            return ''; // 删除重复函数
        }
    });
    
    // 写入修改后的文件
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('📝 文件更新完成，新大小:', newContent.length, '字符');
    console.log('✨ 牛奶飞溅特效已优化！成功删除', matches.length - 1, '个重复函数');
} else {
    console.log('✅ 牛奶飞溅特效函数已唯一，无需清理');
}

console.log('🎉 清理完成');