@echo off
echo 正在启动生鲜达电商平台...
echo 请确保已安装 Node.js 环境

REM 检查 Node.js 是否已安装
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未检测到 Node.js 环境
    echo 请先安装 Node.js，然后重新运行此脚本
    pause
    exit /b 1
)

REM 检查 node_modules 是否存在
if not exist "node_modules" (
    echo 检测到首次运行，正在安装依赖...
    npm install
    if %errorlevel% neq 0 (
        echo 错误: 依赖安装失败
        pause
        exit /b 1
    )
)

echo 正在启动服务器...
echo 访问地址: http://localhost:3000
node server.js

pause