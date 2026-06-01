$(function () {
    getUserInfo()
    $('#btn_logout').on('click', function () {
        layer.confirm('确定退出登录?', { icon: 3, title: '提示' }, function (index) {
            // 清空tokan
            localStorage.removeItem('token')
            // 返回登录界面
            location.href='/login.html'
            layer.close(index);
        })
    })
})
// 获取用户信息
function getUserInfo() {
    $.ajax({
        method: "GET",
        url: "/my/userinfo",
        success: function (res) {
            if (res.status !== 0) {
                return layui.layer.msg(res.message, { icon: 2 })
            }
            renderAvatar(res.data)
        }
    });
}
// 渲染头像
function renderAvatar(user) {
    var name = user.nickname || user.username
    $('#welcome').html(`欢迎 ${name}`)
    if (user.user_pic !== null && user.user_pic !== "") {
        $('.layui-nav-img').attr('src', user.user_pic).show()
        $('.text-avatar').hide()

    } else {
        $('.layui-nav-img').hide()
        $('.text-avatar').html(name[0].toUpperCase()).show()
    }
}
// 退出页面
function logOut() {

}

