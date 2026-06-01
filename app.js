// app.js - 主服务文件
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// JWT密钥（实际开发中应放在环境变量中）
const jwt = require('jsonwebtoken');
const JWT_SECRET_KEY = 'cg666';

// 中间件配置
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 请求日志中间件
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// 模拟数据库存储（实际开发中可替换为真实数据库）
const users = [];

// ==================== 辅助函数 ====================

/**
 * 生成JWT Token
 * @param {Object} user - 用户信息
 * @returns {string} JWT token
 */
function generateToken(user) {
    return jwt.sign(
        {
            id: user.id || Date.now(),
            username: user.username,
            registeredAt: user.createdAt || new Date().toISOString()
        },
        JWT_SECRET_KEY,
        { expiresIn: '24h' }
    );
}

/**
 * 验证JWT Token中间件
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件
 */
function verifyToken(req, res, next) {
    // 从请求头中获取token
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN格式

    if (!token) {
        return res.status(200).json({
            status: 1,
            message: 'token认证失败！'
        });
    }

    // 验证token
    jwt.verify(token, JWT_SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(200).json({
                status: 1,
                message: 'token无效或已过期！'
            });
        }
        // 将解码后的用户信息存入request，供后续使用
        req.user = decoded;
        next();
    });
}

// ==================== API 接口 ====================

/**
 * 用户注册接口
 * POST /api/reguser
 * 注册成功后直接返回token
 */
app.post('/api/reguser', (req, res) => {
    const { username, password } = req.body;

    // 参数验证
    if (!username || !password) {
        return res.status(400).json({
            status: 1,
            message: '用户名和密码不能为空！'
        });
    }

    // 检查用户名是否已存在
    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
        return res.status(200).json({
            status: 1,
            message: '用户名已存在！'
        });
    }

    // 创建新用户
    const newUser = {
        id: users.length + 1,
        username,
        password, // 注意：实际开发中应该使用 bcrypt 等加密
        createdAt: new Date()
    };

    // 存储用户信息
    users.push(newUser);

    // 注册成功后生成token
    // const token = generateToken(newUser);
    console.log(`新用户注册: ${username}`);
    // console.log(`用户：${username} token ${token}`)

    // 返回成功响应，包含token
    res.status(200).json({
        status: 0,
        message: '注册成功！',
        data: {
            id: newUser.id,
            username: newUser.username,
            createdAt: newUser.createdAt
        }
    });
});

/**
 * 用户登录接口
 * POST /api/login
 * 需要在请求头中携带注册时获取的token
 */
app.post('/api/login', (req, res) => {
    // const { username, password } = req.body;
    // 从请求头获取token
    // const authHeader = req.headers['authorization'];
    // const token = authHeader && authHeader.split(' ')[1];

    // 检查是否提供了token
    // if (!token) {
    //     return res.status(401).json({
    //         status: 1,
    //         message: '登录需要提供认证token！请先注册获取token。'
    //     });
    // }

    // 先验证token
    // jwt.verify(token, JWT_SECRET_KEY, (err, decoded) => {
    //     if (err) {
    //         return res.status(403).json({
    //             status: 1,
    //             message: 'token无效或已过期！请重新注册获取新token。'
    //         });
    //     }

    //     // token验证通过，验证用户名和密码
    //     const user = users.find(u => u.username === username && u.password === password);

    //     if (!user) {
    //         return res.status(200).json({
    //             status: 1,
    //             message: '用户名或密码错误！'
    //         });
    //     }

    //     // 验证token中的用户名是否与登录用户名匹配
    //     if (decoded.username !== username) {
    //         return res.status(403).json({
    //             status: 1,
    //             message: 'token与用户名不匹配！'
    //         });
    //     }

    //     // 登录成功，生成新的token（可选，为了安全可以刷新token）
    //     const newToken = generateToken(user);

    //     console.log(`用户登录成功: ${username}`);

    //     res.json({
    //         status: 0,
    //         message: '登录成功！',
    //         token: newToken, // 返回新token，保持会话续期
    //         data: {
    //             id: user.id,
    //             username: user.username,
    //             loginTime: new Date().toISOString()
    //         }
    //     });
    // });
    
    const { username, password } = req.body;
    // token验证通过，验证用户名和密码
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
        return res.status(200).json({
            status: 1,
            message: '用户名或密码错误！'
        });
    }
    // 登录成功，生成新的token（可选，为了安全可以刷新token）
    const token = generateToken(user);
    console.log(`用户登录成功: ${username}`);
    res.json({
        status: 0,
        message: '登录成功！',
        token: token,
        data: {
            id: user.id,
            username: user.username,
            loginTime: new Date().toISOString()
        }
    });
});

/**
 * 需要验证token的示例接口
 * GET /api/user/info
 * 演示如何在其他接口中使用token验证
 */
app.get('/my/userinfo', verifyToken, (req, res) => {
    // verifyToken中间件已经验证了token并将用户信息存入req.user
    const user = users.find(u => u.username === req.user.username);

    if (!user) {
        return res.status(200).json({
            status: 1,
            message: '用户不存在！'
        });
    }

    res.json({
        status: 0,
        data: {
            id: user.id,
            username: user.username,
            nickname:user.nickname || '',
            email:user.email|| '',
            user_pic:user.user_pic||''
        }
    });
});

/**
 * 健康检查接口（无需token验证）
 * GET /health
 */
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log(`用户注册接口: POST http://localhost:${PORT}/api/reguser`);
    console.log(`用户登录接口: POST http://localhost:${PORT}/api/login`);
    console.log(`用户信息接口: GET http://localhost:${PORT}/api/user/info (需要token验证)`);
});

// 导出app以便测试
module.exports = app;