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
// 模拟文章分类数据库存储
const articleCates = [
    {
        Id: 1,
        name: "最新",
        alias: "ZuiXin",
        is_delete: 0
    },
    {
        Id: 2,
        name: "热门",
        alias: "ReMen",
        is_delete: 0
    },
    {
        Id: 3,
        name: "推荐",
        alias: "TuiJian",
        is_delete: 0
    }
];

/**
 * 获取文章分类列表接口
 * GET /my/article/cates
 * 需要token验证
 */
app.get('/my/article/cates/:id', verifyToken, (req, res) => {
    const id = parseInt(req.params.id);

    // 参数验证
    if (isNaN(id)) {
        return res.status(200).json({
            status: 1,
            message: '参数错误：ID必须是数字！'
        });
    }

    // 查找未删除的文章分类
    const category = articleCates.find(cate => cate.Id === id && cate.is_delete === 0);

    if (!category) {
        return res.status(200).json({
            status: 1,
            message: '获取文章分类数据失败！'
        });
    }

    console.log(`用户 ${req.user.username} 获取文章分类详情: ID=${id}, 名称=${category.name}`);

    // 返回成功响应
    res.status(200).json({
        status: 0,
        message: '获取文章分类数据成功！',
        data: category
    });
});
app.get('/my/article/cates', verifyToken, (req, res) => {
    // 查询未删除的文章分类（is_delete = 0）
    const activeCates = articleCates.filter(cate => cate.is_delete === 0);

    console.log(`用户 ${req.user.username} 获取文章分类列表，共 ${activeCates.length} 条记录`);

    // 返回成功响应
    res.status(200).json({
        status: 0,
        message: "获取文章分类列表成功！",
        data: activeCates
    });
});
app.post('/my/article/addCates', verifyToken, (req, res) => {
    const { name, alias } = req.body;

    // 参数验证
    if (!name || !name.trim()) {
        return res.status(200).json({
            status: 1,
            message: '分类名称不能为空！'
        });
    }

    if (!alias || !alias.trim()) {
        return res.status(200).json({
            status: 1,
            message: '分类别名不能为空！'
        });
    }

    // 检查分类名称是否已存在（未删除的）
    const existingName = articleCates.find(cate => cate.name === name && cate.is_delete === 0);
    if (existingName) {
        return res.status(200).json({
            status: 1,
            message: '分类名称已存在！'
        });
    }

    // 检查分类别名是否已存在（未删除的）
    const existingAlias = articleCates.find(cate => cate.alias === alias && cate.is_delete === 0);
    if (existingAlias) {
        return res.status(200).json({
            status: 1,
            message: '分类别名已存在！'
        });
    }

    // 创建新分类
    const newCategory = {
        Id: articleCates.length + 1,
        name: name.trim(),
        alias: alias.trim(),
        is_delete: 0,
        createdBy: req.user.username,
        createdAt: new Date().toISOString()
    };

    // 存储新分类
    articleCates.push(newCategory);

    console.log(`用户 ${req.user.username} 新增文章分类: ${name} (${alias})`);

    // 返回成功响应
    res.status(201).json({
        status: 0,
        message: '新增文章分类成功！'
    });
});
/**
 * 根据ID获取文章分类详情接口
 * GET /my/article/cates/:id
 * 需要token验证
 */
/**
 * 根据ID更新文章分类数据接口
 * POST /my/article/updatecate
 * 需要token验证
 */
app.post('/my/article/updatecate', verifyToken, (req, res) => {
    let { Id, name, alias } = req.body;
    Id = parseInt(Id)
    // 参数验证
    if (!Id) {
        return res.status(200).json({
            status: 1,
            message: '分类Id不能为空！'
        });
    }

    if (!name || !name.trim()) {
        return res.status(200).json({
            status: 1,
            message: '分类名称不能为空！'
        });
    }

    if (!alias || !alias.trim()) {
        return res.status(200).json({
            status: 1,
            message: '分类别名不能为空！'
        });
    }

    // 查找要更新的文章分类（包括已删除的，因为可能需要恢复？根据业务需求调整）
    const categoryIndex = articleCates.findIndex(cate => cate.Id === Id);

    if (categoryIndex === -1) {
        return res.status(200).json({
            status: 1,
            message: '文章分类不存在！'
        });
    }

    const category = articleCates[categoryIndex];

    // 检查分类名称是否已被其他分类使用（排除当前分类）
    const existingName = articleCates.find(cate => cate.name === name.trim() && cate.Id !== Id && cate.is_delete === 0);
    if (existingName) {
        return res.status(200).json({
            status: 1,
            message: '分类名称已存在！'
        });
    }

    // 检查分类别名是否已被其他分类使用（排除当前分类）
    const existingAlias = articleCates.find(cate => cate.alias === alias.trim() && cate.Id !== Id && cate.is_delete === 0);
    if (existingAlias) {
        return res.status(200).json({
            status: 1,
            message: '分类别名已存在！'
        });
    }

    // 保存旧数据用于日志
    const oldName = category.name;
    const oldAlias = category.alias;

    // 更新分类信息
    category.name = name.trim();
    category.alias = alias.trim();
    category.updatedBy = req.user.username;
    category.updatedAt = new Date().toISOString();

    console.log(`用户 ${req.user.username} 更新文章分类: ID=${Id}, 名称: ${oldName} -> ${name.trim()}, 别名: ${oldAlias} -> ${alias.trim()}`);

    // 返回成功响应
    res.status(200).json({
        status: 0,
        message: '更新分类信息成功！'
    });
});
/**
 * 根据ID删除文章分类接口（软删除）
 * GET /my/article/deletecate/:id
 * 需要token验证
 */
app.get('/my/article/deletecate/:id', verifyToken, (req, res) => {
    const id = parseInt(req.params.id);

    // 查找要删除的文章分类
    const categoryIndex = articleCates.findIndex(cate => cate.Id === id);

    if (categoryIndex === -1) {
        return res.status(200).json({
            status: 1,
            message: '文章分类不存在！'
        });
    }

    const category = articleCates[categoryIndex];

    // 检查是否已被删除
    if (category.is_delete === 1) {
        return res.status(200).json({
            status: 1,
            message: '文章分类已被删除！'
        });
    }

    // 软删除：将 is_delete 设置为 1
    category.is_delete = 1;
    category.deletedBy = req.user.username;
    category.deletedAt = new Date().toISOString();

    console.log(`用户 ${req.user.username} 删除文章分类: ID=${id}, 名称=${category.name}`);

    // 返回成功响应
    res.status(200).json({
        status: 0,
        message: '删除文章分类成功！'
    });
});
// ==================== 文章数据存储 ====================
// 模拟文章数据库存储
const articles = [
    {
        Id: 1,
        title: "Express.js 入门教程",
        pub_date: "2024-01-15 10:30:00",
        state: "已发布",
        cate_id: 1,
        cate_name: "最新",
        content: "这是Express.js的入门教程内容...",
        author: "admin",
        created_at: new Date().toISOString()
    },
    {
        Id: 2,
        title: "Node.js 异步编程",
        pub_date: "2024-01-20 14:20:00",
        state: "已发布",
        cate_id: 2,
        cate_name: "热门",
        content: "Node.js异步编程详解...",
        author: "admin",
        created_at: new Date().toISOString()
    },
    {
        Id: 3,
        title: "Vue3 新特性介绍",
        pub_date: "2024-01-25 09:15:00",
        state: "草稿",
        cate_id: 3,
        cate_name: "推荐",
        content: "Vue3的新特性介绍...",
        author: "admin",
        created_at: new Date().toISOString()
    },
    {
        Id: 4,
        title: "React Hooks 深入理解",
        pub_date: "2024-02-01 16:45:00",
        state: "已发布",
        cate_id: 1,
        cate_name: "最新",
        content: "React Hooks使用技巧...",
        author: "admin",
        created_at: new Date().toISOString()
    },
    {
        Id: 5,
        title: "MongoDB 数据库设计",
        pub_date: "2024-02-05 11:00:00",
        state: "草稿",
        cate_id: 2,
        cate_name: "热门",
        content: "MongoDB设计最佳实践...",
        author: "admin",
        created_at: new Date().toISOString()
    }
];

/**
 * 获取文章列表数据接口
 * GET /my/article/list
 * 需要token验证
 */
app.get('/my/article/list', verifyToken, (req, res) => {
    // 获取查询参数
    let { pagenum, pagesize, cate_id, state } = req.query;

    // 参数验证
    if (!pagenum) {
        return res.status(200).json({
            status: 1,
            message: '页码值不能为空！'
        });
    }

    if (!pagesize) {
        return res.status(200).json({
            status: 1,
            message: '每页显示条数不能为空！'
        });
    }

    // 转换数据类型
    pagenum = parseInt(pagenum);
    pagesize = parseInt(pagesize);

    if (isNaN(pagenum) || pagenum < 1) {
        return res.status(200).json({
            status: 1,
            message: '页码值必须是大于0的数字！'
        });
    }

    if (isNaN(pagesize) || pagesize < 1) {
        return res.status(200).json({
            status: 1,
            message: '每页显示条数必须是大于0的数字！'
        });
    }

    // 限制每页最大条数，防止恶意请求
    if (pagesize > 100) {
        return res.status(200).json({
            status: 1,
            message: '每页显示条数不能超过100条！'
        });
    }

    // 开始筛选数据
    let filteredArticles = [...articles];

    // 按分类ID筛选（如果提供了cate_id）
    if (cate_id) {
        const cateIdNum = parseInt(cate_id);
        if (!isNaN(cateIdNum)) {
            filteredArticles = filteredArticles.filter(article => article.cate_id === cateIdNum);
        }
    }

    // 按状态筛选（如果提供了state）
    if (state) {
        filteredArticles = filteredArticles.filter(article => article.state === state);
    }

    // 计算总数
    const totalCount = filteredArticles.length;

    // 计算分页
    const startIndex = (pagenum - 1) * pagesize;
    const endIndex = startIndex + pagesize;

    // 获取当前页数据
    const pageArticles = filteredArticles.slice(startIndex, endIndex);

    // 提取需要返回的字段（Id, title, pub_date, state, cate_name）
    const articleList = pageArticles.map(article => ({
        Id: article.Id,
        title: article.title,
        pub_date: article.pub_date,
        state: article.state,
        cate_name: article.cate_name
    }));

    console.log(`用户 ${req.user.username} 获取文章列表: 页码=${pagenum}, 每页=${pagesize}, 分类ID=${cate_id || '全部'}, 状态=${state || '全部'}, 总数=${totalCount}`);

    // 返回成功响应
    res.status(200).json({
        status: 0,
        message: '获取文章列表成功！',
        data: articleList,
        total: totalCount,
        pagenum: pagenum,
        pagesize: pagesize
    });
});
/**
 * 根据ID删除文章数据接口（物理删除版本）
 * GET /my/article/delete/:id
 * 需要token验证
 */
app.get('/my/article/delete/:id', verifyToken, (req, res) => {
    const id = parseInt(req.params.id);

    // 参数验证
    if (isNaN(id)) {
        return res.status(200).json({
            status: 1,
            message: '参数错误：ID必须是数字！'
        });
    }

    // 查找要删除的文章索引
    const articleIndex = articles.findIndex(article => article.Id === id);

    if (articleIndex === -1) {
        return res.status(200).json({
            status: 1,
            message: '文章不存在！'
        });
    }

    const deletedArticle = articles[articleIndex];

    // 物理删除：从数组中移除
    articles.splice(articleIndex, 1);

    console.log(`用户 ${req.user.username} 永久删除文章: ID=${id}, 标题=${deletedArticle.title}`);

    // 返回成功响应
    res.status(200).json({
        status: 0,
        message: '删除成功！'
    });
});
// ==================== 文件上传配置 ====================
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 确保上传目录存在
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置文件存储
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/') // 上传文件存储目录
    },
    filename: function (req, file, cb) {
        // 生成唯一文件名：时间戳 + 随机数 + 原文件扩展名
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'cover-' + uniqueSuffix + ext)
    }
});

// 文件类型过滤
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('只允许上传图片文件！'));
    }
};

// 创建 multer 实例
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024 // 限制文件大小 2MB
    },
    fileFilter: fileFilter
});

/**
 * 发布新文章接口
 * POST /my/article/add
 * 需要token验证，支持文件上传
 */
app.post('/my/article/add', verifyToken, upload.single('cover_img'), (req, res) => {
    const { title, cate_id, content, state } = req.body;
    const coverImg = req.file;

    // 参数验证
    if (!title || !title.trim()) {
        // 如果上传了文件但验证失败，删除已上传的文件
        if (coverImg) {
            fs.unlinkSync(coverImg.path);
        }
        return res.status(200).json({
            status: 1,
            message: '文章标题不能为空！'
        });
    }

    if (!cate_id) {
        if (coverImg) {
            fs.unlinkSync(coverImg.path);
        }
        return res.status(200).json({
            status: 1,
            message: '请选择文章分类！'
        });
    }

    if (!content || !content.trim()) {
        if (coverImg) {
            fs.unlinkSync(coverImg.path);
        }
        return res.status(200).json({
            status: 1,
            message: '文章内容不能为空！'
        });
    }

    if (!coverImg) {
        return res.status(200).json({
            status: 1,
            message: '请上传文章封面图片！'
        });
    }

    if (!state || !['已发布', '草稿'].includes(state)) {
        if (coverImg) {
            fs.unlinkSync(coverImg.path);
        }
        return res.status(200).json({
            status: 1,
            message: '文章状态必须为：已发布 或 草稿！'
        });
    }

    // 验证分类是否存在
    const cateIdNum = parseInt(cate_id);
    const category = articleCates.find(cate => cate.Id === cateIdNum && cate.is_delete === 0);

    if (!category) {
        // 分类不存在，删除已上传的文件
        if (coverImg) {
            fs.unlinkSync(coverImg.path);
        }
        return res.status(200).json({
            status: 1,
            message: '文章分类不存在！'
        });
    }

    // 构建封面图片URL（可根据实际域名修改）
    const coverImgUrl = `${req.protocol}://${req.get('host')}/uploads/${coverImg.filename}`;

    // 创建新文章
    const newArticle = {
        Id: articles.length + 1,
        title: title.trim(),
        content: content.trim(),
        cate_id: cateIdNum,
        cate_name: category.name,
        cover_img: coverImgUrl, // 存储封面图片URL
        state: state,
        pub_date: new Date().toLocaleString('zh-CN', { hour12: false }),
        author: req.user.username,
        author_id: req.user.id,
        is_delete: 0,
        created_at: new Date().toISOString()
    };

    // 存储文章
    articles.push(newArticle);

    console.log(`用户 ${req.user.username} 发布新文章: ${title}, 分类: ${category.name}, 状态: ${state}`);
    console.log(`封面图片已保存: ${coverImgUrl}`);

    // 返回成功响应
    res.status(201).json({
        status: 0,
        message: '发布文章成功！'
    });
});

// 静态文件服务，用于访问上传的图片
app.use('/uploads', express.static('uploads'));
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