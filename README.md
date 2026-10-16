# 生鲜达电商平台

## 项目简介

生鲜达电商平台是一个基于Web的生鲜购物平台，用户可以浏览商品、下单购买，管理员可以管理商品信息。

## 技术栈

- 前端: HTML, CSS, JavaScript
- 后端: Node.js
- 数据库: SQLite

## 功能特性

- 用户登录/注册
- 商品浏览和搜索
- 购物车功能
- 管理员后台管理

## 安装和运行

### 环境要求

- Node.js (版本 12 或更高)
- npm (通常随 Node.js 一起安装)

### 安装步骤

1. 克隆或下载项目代码到本地
2. 进入项目目录
3. 安装依赖包:
   ```
   npm install
   ```

### 运行项目

1. 启动服务器:
   ```
   npm start
   ```
   或者
   ```
   node server.js
   ```

2. 打开浏览器，访问 `http://localhost:3000`

### 默认账户

- 管理员账户: 
  - 用户名: admin
  - 密码: 123456

## 项目结构

```
.
├── backend/          # 后端代码
│   └── api/          # API接口
├── db/               # 数据库文件
├── scripts/          # 前端JavaScript代码
├── styles.css        # 样式文件
├── index.html        # 首页
├── login.html        # 登录页面
├── register.html     # 注册页面
├── admin.html        # 管理员页面
└── admin-login.html  # 管理员登录页面
```

## 数据持久化

项目使用 SQLite 数据库存储数据，数据库文件位于 `db/shengxianda.db`。当项目打包并解压到其他电脑上时，数据库文件会一同打包，数据会保留。

## 开发说明

- 前端代码位于 `scripts/` 目录下
- 后端API接口位于 `backend/api/` 目录下
- 数据库相关代码位于 `db/` 目录下

## 注意事项

1. 项目需要 Node.js 环境才能运行
2. 数据库文件会自动创建和初始化
3. 修改代码后可能需要重启服务器才能生效