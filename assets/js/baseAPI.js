// jq请求拦截函数，$.get()，$.post()，$.ajax()
// options：Ajax配置对象
$.ajaxPrefilter(function (options) {
    // console.log(options.url)
    // 给请求相对路径添加根路径
    options.url = 'http://localhost:3000' + options.url
    // 为需要权限的接口设置headers请求头
    if (options.url.indexOf('/my') > -1) {
        options.headers = {
            Authorization: localStorage.getItem('token') || ''
        }
    }
    options.complete = function (res) {
        var resp = res.responseJSON
        if (!resp||(resp.status === 1 && (resp.message === 'token认证失败！' || resp.message === 'token无效或已过期！'))) {
            localStorage.removeItem('token')
            return location.href = '/login.html'
        }
    }
})