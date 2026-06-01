$(function () {
    // 点击切换登录/注册面板
    $('#link_reg').on('click', function () {
        $('.login-box').hide()
        $('.reg-box').show()
    })
    $('#link_login').on('click', function () {
        $('.reg-box').hide()
        $('.login-box').show()
    })
    // 引用layui.all.js内form验证方法
    var form = layui.form
    var layer = layui.layer
    // 自定义输入框校验规则
    form.verify({
        pwd: [
            /^[\S]{6,12}$/,
            '密码必须是6-12位，且不能有空格！'
        ],
        repwd: function (val) {
            // 确认密码是否和输入密码一致
            var enterpwd = $('.reg-box input[name=password]').val()
            if (val !== enterpwd) {
                return "确认密码和输入密码不一致！"
            }
        }
    })

    // 注册表单提交事件
    // var baseUrl = "http://localhost:3000"
    $('#form_reg').on('submit', function (e) {
        e.preventDefault()
        var parmObj = $('#form_reg').serializeArray().reduce(function (a, b) {
            a[b.name] = b.value;
            return a;
        }, {});
        $.post('/api/reguser', parmObj, function (res) {
            if (res.status !== 0) {
                return layer.msg(res.message, { icon: 2 });
            }
            layer.msg(res.message, { icon: 1 })
            $('#link_login').click()
        })
    })

    // 登录表单提交事件
    $('#form_login').on('submit', function (e) {
        e.preventDefault()
        $.ajax({
            method: 'POST',
            url: '/api/login',
            data: $('#form_login').serialize(),
            success: function (res) {
                if (res.status!==0) {
                    return layer.msg(res.message,{icon:2})
                }
                layer.msg(res.message, { icon: 1 })
                // 跳转主页
                localStorage.setItem('token',"Bearer "+res.token)
                location.href='index.html'
            }
        })
    })
})