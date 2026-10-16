const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'scripts', 'modules', 'dairyBakery.js');

console.log('开始清理 dairyBakery.js 中的重复函数...');

fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        console.error('读取文件失败:', err);
        return;
    }

    console.log('文件读取成功，开始处理...');

    // 定义要清理的重复函数模式
    const duplicateFunctions = [];

    // 查找并记录所有 addMilkSplashEffect 函数的位置
    const searchPattern = /\/\/ 牛奶飞溅特效：点击卡片时产生牛奶飞溅效果.*?addMilkSplashEffect\(\) \{[\s\S]*?\}\n\s*\n/g;
    let matches;
    let allMatches = [];

    let regex = new RegExp(searchPattern.source, 'g');
    while ((matches = regex.exec(data)) !== null) {
        allMatches.push(matches[0]);
        console.log('找到 addMilkSplashEffect 函数，长度:', matches[0].length);
    }

    console.log('找到', allMatches.length, '个 addMilkSplashEffect 函数');

    // 只保留第一个函数，其他的都删除
    if (allMatches.length > 1) {
        console.log('开始删除重复函数...');
        
        // 第一次出现的函数保留，后续的出现都替换为空
        let cleanedContent = data;
        for (let i = 1; i < allMatches.length; i++) {
            cleanedContent = cleanedContent.replace(allMatches[i], '');
            console.log('已删除第', i + 1, '个重复函数');
        }

        // 写入清理后的文件
        fs.writeFile(filePath, cleanedContent, 'utf8', (writeErr) => {
            if (writeErr) {
                console.error('写入文件失败:', writeErr);
                return;
            }
            console.log('\n✅ 文件清理完成！');
            console.log('- 原始函数数量:', allMatches.length);
            console.log('- 保留函数数量:', 1);
            console.log('- 已删除重复:', allMatches.length - 1);
        });
    } else {
        console.log('✅ 没有重复函数需要删除');
    }
});
