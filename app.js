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
        message: '获取用户信息成功！',
        data: {
            id: user.id,
            username: user.username,
            nickname: user.nickname || '',
            email: user.email || '',
            user_pic: user.user_pic || ''
        }
    });
});
/**
 * 修改用户信息接口
 * POST /my/userinfo
 * 需要token验证
 */
app.post('/my/userinfo', verifyToken, (req, res) => {
    const { nickname, email } = req.body;

    // 参数验证
    if (!nickname && !email) {
        return res.status(200).json({
            status: 1,
            message: '昵称或邮箱不能为空！'
        });
    }

    // 查找当前用户
    const user = users.find(u => u.username === req.user.username);

    if (!user) {
        return res.status(200).json({
            status: 1,
            message: '用户不存在！'
        });
    }

    // 更新用户信息
    if (nickname) {
        user.nickname = nickname;
    }
    if (email) {
        user.email = email;
    }

    console.log(`用户信息修改成功: ${req.user.username}, 昵称: ${user.nickname}, 邮箱: ${user.email}`);

    // 返回成功响应
    res.status(200).json({
        status: 0,
        message: '修改用户信息成功！'
    });
});
/**
 * 修改用户密码接口
 * POST /my/updatepwd
 * 需要token验证
 */
app.post('/my/updatepwd', verifyToken, (req, res) => {
    const { oldPwd, newPwd } = req.body;

    // // 参数验证
    // if (!oldPwd || !newPwd) {
    //     return res.status(200).json({
    //         status: 1,
    //         message: '原密码和新密码不能为空！'
    //     });
    // }

    // // 验证新密码长度（可选，建议至少6位）
    // if (newPwd.length < 6) {
    //     return res.status(200).json({
    //         status: 1,
    //         message: '新密码长度不能少于6位！'
    //     });
    // }

    // 查找当前用户
    const user = users.find(u => u.username === req.user.username);

    if (!user) {
        return res.status(200).json({
            status: 1,
            message: '用户不存在！'
        });
    }

    // 验证原密码是否正确
    if (user.password !== oldPwd) {
        return res.status(200).json({
            status: 1,
            message: '原密码错误！'
        });
    }

    // 验证新密码是否与原密码相同
    if (oldPwd === newPwd) {
        return res.status(200).json({
            status: 1,
            message: '新密码不能与原密码相同！'
        });
    }

    // 更新密码
    user.password = newPwd;

    console.log(`用户密码修改成功: ${req.user.username}`);

    // 返回成功响应
    res.status(200).json({
        status: 0,
        message: '修改密码成功！'
    });
});
/**
 * 更新用户头像接口
 * POST /my/update/avatar
 * 需要token验证
 */
app.post('/my/update/avatar', verifyToken, (req, res) => {
    const { avatar } = req.body;

    // 参数验证
    if (!avatar) {
        return res.status(200).json({
            status: 1,
            message: '头像不能为空！'
        });
    }

    // 验证是否为base64格式（可选，基础验证）
    const base64Regex = /^data:image\/(png|jpg|jpeg|gif|bmp|webp);base64,/i;
    if (!base64Regex.test(avatar)) {
        return res.status(200).json({
            status: 1,
            message: '头像格式错误，请上传有效的base64格式图片！'
        });
    }

    // 验证base64大小（可选，限制头像大小，例如限制为2MB）
    // base64字符串长度约为原始数据的4/3，所以2MB图片的base64长度约为2.7MB
    const estimatedSize = Buffer.byteLength(avatar, 'utf8');
    const maxSize = 3 * 1024 * 1024; // 3MB限制

    if (estimatedSize > maxSize) {
        return res.status(200).json({
            status: 1,
            message: '头像大小不能超过2MB！'
        });
    }

    // 查找当前用户
    const user = users.find(u => u.username === req.user.username);

    if (!user) {
        return res.status(200).json({
            status: 1,
            message: '用户不存在！'
        });
    }

    // 更新用户头像（存储base64字符串）
    // 注意：在生产环境中，建议将图片保存到文件服务器或OSS，数据库中只存储路径
    user.user_pic = avatar;

    console.log(`用户头像更新成功: ${req.user.username}, 头像大小: ${(estimatedSize / 1024).toFixed(2)}KB`);

    // 返回成功响应
    res.status(200).json({
        status: 0,
        message: '更新头像成功！'
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