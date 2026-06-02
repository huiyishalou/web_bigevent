$(function () {
    var form = layui.form
    form.verify({
        pwd: [
            /^[\S]{6,12}$/
            , '密码必须6到12位，且不能出现空格'
        ],
        samePwd:function(val) {
            if (val===$('input[name=oldPwd]').val()) {
                return '新密码不能和原密码相同！'
            }
        },
        rePwd:function(val) {
            if (val!==$('[name=newPwd]').val()) {
                return "确认密码和新密码不一致！"
            }
        }
    })
    // 表单提交事件
    $('.layui-form').on('submit',function(e) {
        e.preventDefault()
        $.ajax({
            method:'POST',
            url:'/my/updatepwd',
            data:$(this).serialize(),
            success:function(res) {
                if (res.status!==0) {
                    return layui.layer.msg(res.message, { icon: 2 })
                }
                layui.layer.msg(res.message, { icon: 1 })
                $('.layui-form')[0].reset()
            }
        })
    })
})