// jq请求拦截函数，$.get()，$.post()，$.ajax()
// options：Ajax配置对象
$.ajaxPrefilter(function(options) {
    // console.log(options.url)
    // 给请求相对路径添加根路径
    options.url='http://localhost:3000'+options.url
})