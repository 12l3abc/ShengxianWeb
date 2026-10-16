# 商品信息与图片API文档

## 1. 概述

本API文档描述了商品信息和图片相关的RESTful接口，用于管理商品数据和商品图片。所有接口均返回标准化的JSON格式响应，包含成功状态、消息、数据和状态码。

## 2. 响应格式

所有API接口返回的响应格式统一为：

```json
{
    "success": true, // 请求是否成功
    "message": "请求成功的描述信息", // 响应消息
    "data": {}, // 响应数据，根据接口不同而变化
    "statusCode": 200 // HTTP状态码
}
```

## 3. 商品信息API

### 3.1 获取所有商品

**接口描述**：获取系统中所有商品的列表

**请求方法**：GET

**接口路径**：`/api/products`

**请求参数**：无

**响应示例**：

```json
{
    "success": true,
    "message": "获取商品列表成功",
    "data": {
        "products": [
            {
                "id": 1,
                "name": "新鲜菠菜",
                "category": "freshProduce",
                "price": 5.99,
                "image": "src/shengxian.png",
                "description": "新鲜采摘的菠菜",
                "isSpecialOffer": false,
                "isFlashSale": false,
                "stock": 100
            },
            // 更多商品...
        ]
    },
    "statusCode": 200
}
```

### 3.2 获取分类商品

**接口描述**：根据分类获取商品列表

**请求方法**：GET

**接口路径**：`/api/products/category/:category`

**请求参数**：

| 参数名 | 类型 | 位置 | 描述 |
| ------ | ---- | ---- | ---- |
| category | string | URL路径 | 商品分类名称 |

**响应示例**：

```json
{
    "success": true,
    "message": "获取meatPoultry分类商品成功",
    "data": {
        "products": [
            {
                "id": 2,
                "name": "优质牛肉",
                "category": "meatPoultry",
                "price": 45.99,
                "image": "src/shengxian.png",
                "description": "精选优质牛肉",
                "isSpecialOffer": true,
                "isFlashSale": false,
                "stock": 50
            },
            // 更多商品...
        ]
    },
    "statusCode": 200
}
```

### 3.3 获取商品详情

**接口描述**：根据商品ID获取商品详情

**请求方法**：GET

**接口路径**：`/api/products/:id`

**请求参数**：

| 参数名 | 类型 | 位置 | 描述 |
| ------ | ---- | ---- | ---- |
| id | integer | URL路径 | 商品ID |

**响应示例**：

```json
{
    "success": true,
    "message": "获取商品详情成功",
    "data": {
        "product": {
            "id": 1,
            "name": "新鲜菠菜",
            "category": "freshProduce",
            "price": 5.99,
            "image": "src/shengxian.png",
            "description": "新鲜采摘的菠菜",
            "isSpecialOffer": false,
            "isFlashSale": false,
            "stock": 100
        }
    },
    "statusCode": 200
}
```

### 3.4 添加商品

**接口描述**：添加新商品

**请求方法**：POST

**接口路径**：`/api/products`

**请求参数**：

| 参数名 | 类型 | 位置 | 描述 | 必填 |
| ------ | ---- | ---- | ---- | ---- |
| name | string | 请求体 | 商品名称 | 是 |
| category | string | 请求体 | 商品分类 | 是 |
| price | number | 请求体 | 商品价格 | 是 |
| image | string | 请求体 | 商品图片URL | 否 |
| description | string | 请求体 | 商品描述 | 否 |
| isSpecialOffer | boolean | 请求体 | 是否为特价商品 | 否 |
| isFlashSale | boolean | 请求体 | 是否为秒杀商品 | 否 |
| stock | integer | 请求体 | 商品库存 | 否 |

**请求示例**：

```json
{
    "name": "新鲜苹果",
    "category": "freshProduce",
    "price": 8.99,
    "description": "新鲜采摘的苹果",
    "stock": 200
}
```

**响应示例**：

```json
{
    "success": true,
    "message": "添加商品成功",
    "data": {
        "product": {
            "id": 20,
            "name": "新鲜苹果",
            "category": "freshProduce",
            "price": 8.99,
            "description": "新鲜采摘的苹果",
            "stock": 200,
            "isSpecialOffer": false,
            "isFlashSale": false,
            "image": null
        }
    },
    "statusCode": 201
}
```

### 3.5 更新商品

**接口描述**：更新商品信息

**请求方法**：PUT

**接口路径**：`/api/products/:id`

**请求参数**：

| 参数名 | 类型 | 位置 | 描述 | 必填 |
| ------ | ---- | ---- | ---- | ---- |
| id | integer | URL路径 | 商品ID | 是 |
| name | string | 请求体 | 商品名称 | 否 |
| category | string | 请求体 | 商品分类 | 否 |
| price | number | 请求体 | 商品价格 | 否 |
| image | string | 请求体 | 商品图片URL | 否 |
| description | string | 请求体 | 商品描述 | 否 |
| isSpecialOffer | boolean | 请求体 | 是否为特价商品 | 否 |
| isFlashSale | boolean | 请求体 | 是否为秒杀商品 | 否 |
| stock | integer | 请求体 | 商品库存 | 否 |

**请求示例**：

```json
{
    "price": 9.99,
    "stock": 150
}
```

**响应示例**：

```json
{
    "success": true,
    "message": "更新商品成功",
    "data": {
        "product": {
            "id": 1,
            "name": "新鲜菠菜",
            "category": "freshProduce",
            "price": 9.99,
            "image": "src/shengxian.png",
            "description": "新鲜采摘的菠菜",
            "isSpecialOffer": false,
            "isFlashSale": false,
            "stock": 150
        }
    },
    "statusCode": 200
}
```

### 3.6 删除商品

**接口描述**：删除商品

**请求方法**：DELETE

**接口路径**：`/api/products/:id`

**请求参数**：

| 参数名 | 类型 | 位置 | 描述 | 必填 |
| ------ | ---- | ---- | ---- | ---- |
| id | integer | URL路径 | 商品ID | 是 |

**响应示例**：

```json
{
    "success": true,
    "message": "删除商品成功",
    "data": {
        "product": {
            "id": 1
        }
    },
    "statusCode": 200
}
```

### 3.7 获取特价商品

**接口描述**：获取所有特价商品

**请求方法**：GET

**接口路径**：`/api/products/special-offers`

**请求参数**：无

**响应示例**：

```json
{
    "success": true,
    "message": "获取特价商品成功",
    "data": {
        "products": [
            {
                "id": 2,
                "name": "优质牛肉",
                "category": "meatPoultry",
                "price": 45.99,
                "image": "src/shengxian.png",
                "description": "精选优质牛肉",
                "isSpecialOffer": true,
                "isFlashSale": false,
                "stock": 50
            },
            // 更多特价商品...
        ]
    },
    "statusCode": 200
}
```

### 3.8 获取秒杀商品

**接口描述**：获取所有秒杀商品

**请求方法**：GET

**接口路径**：`/api/products/flash-sales`

**请求参数**：无

**响应示例**：

```json
{
    "success": true,
    "message": "获取秒杀商品成功",
    "data": {
        "products": [
            {
                "id": 3,
                "name": "鲜活大虾",
                "category": "seafood",
                "price": 35.99,
                "image": "src/shengxian.png",
                "description": "新鲜捕捞的海虾",
                "isSpecialOffer": false,
                "isFlashSale": true,
                "stock": 30
            },
            // 更多秒杀商品...
        ]
    },
    "statusCode": 200
}
```

### 3.9 获取特定分类商品

**接口描述**：获取特定分类的商品列表（快捷接口）

**请求方法**：GET

**接口路径**：
- 肉禽蛋品：`/api/products/meatPoultry`
- 水产海鲜：`/api/products/seafood`
- 乳品面点：`/api/products/dairy`
- 新鲜果蔬：`/api/products/freshProduce`
- 豆制品/杂粮：`/api/products/beanProducts`

**请求参数**：无

**响应示例**：

```json
{
    "success": true,
    "message": "获取meatPoultry分类商品成功",
    "data": {
        "products": [
            {
                "id": 2,
                "name": "优质牛肉",
                "category": "meatPoultry",
                "price": 45.99,
                "image": "src/shengxian.png",
                "description": "精选优质牛肉",
                "isSpecialOffer": true,
                "isFlashSale": false,
                "stock": 50
            },
            // 更多肉禽蛋品...
        ]
    },
    "statusCode": 200
}
```

## 4. 商品图片API

### 4.1 获取商品图片

**接口描述**：获取商品的图片信息

**请求方法**：GET

**接口路径**：`/api/products/:id/images`

**请求参数**：

| 参数名 | 类型 | 位置 | 描述 | 必填 |
| ------ | ---- | ---- | ---- | ---- |
| id | integer | URL路径 | 商品ID | 是 |

**响应示例**：

```json
{
    "success": true,
    "message": "获取商品图片成功",
    "data": {
        "id": 1,
        "name": "新鲜菠菜",
        "mainImage": "src/shengxian.png",
        "images": ["src/shengxian.png"]
    },
    "statusCode": 200
}
```

### 4.2 更新商品图片

**接口描述**：更新商品的图片

**请求方法**：PUT

**接口路径**：`/api/products/:id/images`

**请求参数**：

| 参数名 | 类型 | 位置 | 描述 | 必填 |
| ------ | ---- | ---- | ---- | ---- |
| id | integer | URL路径 | 商品ID | 是 |
| image | string | 请求体 | 商品图片URL | 是 |

**请求示例**：

```json
{
    "image": "uploads/new-image.png"
}
```

**响应示例**：

```json
{
    "success": true,
    "message": "更新商品图片成功",
    "data": {
        "product": {
            "id": 1,
            "name": "新鲜菠菜",
            "category": "freshProduce",
            "price": 5.99,
            "image": "uploads/new-image.png",
            "description": "新鲜采摘的菠菜",
            "isSpecialOffer": false,
            "isFlashSale": false,
            "stock": 100
        }
    },
    "statusCode": 200
}
```

### 4.3 删除商品图片

**接口描述**：删除商品的图片（恢复为默认图片）

**请求方法**：DELETE

**接口路径**：`/api/products/:id/images`

**请求参数**：

| 参数名 | 类型 | 位置 | 描述 | 必填 |
| ------ | ---- | ---- | ---- | ---- |
| id | integer | URL路径 | 商品ID | 是 |

**响应示例**：

```json
{
    "success": true,
    "message": "删除商品图片成功",
    "data": {
        "product": {
            "id": 1,
            "name": "新鲜菠菜",
            "category": "freshProduce",
            "price": 5.99,
            "image": "src/shengxian.png",
            "description": "新鲜采摘的菠菜",
            "isSpecialOffer": false,
            "isFlashSale": false,
            "stock": 100
        }
    },
    "statusCode": 200
}
```

## 5. 错误处理

所有API接口在发生错误时，返回的响应格式如下：

```json
{
    "success": false,
    "message": "错误描述信息",
    "error": "详细错误信息",
    "statusCode": 400 // HTTP状态码
}
```

**常见错误状态码**：

| 状态码 | 描述 |
| ------ | ---- |
| 400 | 请求参数错误 |
| 404 | 资源未找到 |
| 500 | 服务器内部错误 |

## 6. 测试示例

### 6.1 使用curl测试获取所有商品

```bash
curl -X GET http://localhost:3001/api/products
```

### 6.2 使用curl测试添加商品

```bash
curl -X POST -H "Content-Type: application/json" -d '{"name": "新鲜苹果", "category": "freshProduce", "price": 8.99}' http://localhost:3001/api/products
```

### 6.3 使用curl测试更新商品

```bash
curl -X PUT -H "Content-Type: application/json" -d '{"price": 9.99}' http://localhost:3001/api/products/1
```

### 6.4 使用curl测试获取商品图片

```bash
curl -X GET http://localhost:3001/api/products/1/images
```

### 6.5 使用curl测试更新商品图片

```bash
curl -X PUT -H "Content-Type: application/json" -d '{"image": "uploads/new-image.png"}' http://localhost:3001/api/products/1/images
```

## 7. 最佳实践

1. **请求频率限制**：请合理控制API请求频率，避免频繁请求导致服务器压力过大。
2. **错误处理**：客户端应妥善处理API返回的错误信息，向用户显示友好的错误提示。
3. **数据验证**：客户端在发送请求前应对数据进行验证，确保符合API要求。
4. **缓存策略**：对于不经常变化的数据，建议客户端进行缓存，减少API请求次数。
5. **安全考虑**：在生产环境中，建议使用HTTPS协议，确保数据传输安全。

## 8. 版本控制

当前API版本：v1

API版本可能会在未来进行更新，建议客户端在请求头中指定API版本，以便服务器能够返回兼容的响应。

## 9. 联系信息

如果您在使用API过程中遇到问题，请联系技术支持团队：

- 邮箱：support@example.com
- 电话：400-123-4567
- 文档：http://localhost:3001/API文档.md
