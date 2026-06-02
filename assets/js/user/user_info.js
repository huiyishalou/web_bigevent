$(function() {
    // 自定义表单验证规则
    var form = layui.form
    form.verify({
        nickname:function(val) {
            if (!(val.length>=1&&val.length<=6)) {
                return "昵称长度必须在 1~6 个字符之间！"
            }
        }
    })
    initUserInfo()
    $('#btn_reset').on('click',function(e) {
        e.preventDefault()
        // layui.form.val('userText',{
        //     nickname:'',
        //     email:''
        // })
        initUserInfo()
    })
})
// 初始化用户信息
function initUserInfo(){
    $.ajax({
        method:'GET',
        url:'/my/userinfo',
        success: function (res) {
            if (res.status!==0) {
                return layui.layer.msg(res.message, { icon: 2 })
            }
            // 表单赋值
            layui.form.val('userText', res.data);
        }
    });
}
// 监听表单提交事件
$('.layui-form').on('submit',function(e) {
    e.preventDefault()
    $.ajax({
        method:'POST',
        url:'/my/userinfo',
        data:$(this).serialize(),
        success:function(res) {
            if (res.status!==0) {
                return layui.layer.msg(res.message, { icon: 2 })
            }
            layui.layer.msg(res.message, { icon: 1 })
            initUserInfo()
            // 更新主页用户信息
            window.parent.getUserInfo()
        }
    })
})