$(function () {
    var layer = layui.layer
    // 1.1 获取裁剪区域的 DOM 元素
    var $image = $('#image')
    // 1.2 配置选项
    const options = {
        // 纵横比
        // aspectRatio:16:9,
        aspectRatio: 1,
        // 指定预览区域
        preview: '.img-preview'
    }

    // 1.3 创建裁剪区域
    $image.cropper(options)
    // 上传图片
    $('#btn_upload').on('click', function (e) {
        e.preventDefault()
        $('#file').click()
    })
    // 更换图片
    $('#file').on('change', function (e) {
        var files = e.target.files
        if (files.length === 0) {
            return layer.msg("请选择图片！", { icon: 2 })
        }
        // 1.获取用户选择的文件
        var file = files[0]
        // 2.将文件转化为URL路径
        var file_url = URL.createObjectURL(file)
        // 3.重新初始化裁剪区
        $image
            .cropper('destroy') // 销毁旧裁剪区
            .attr('src', file_url) // 重新设置图片路径
            .cropper(options) // 重载配置项
        // 确定按钮
        $('#btn_ok').on('click', function (e) {
            e.preventDefault()
            // 将裁剪后的图片转换为base64串
            var dataURL = $image
                .cropper('getCroppedCanvas', { // 创建一个 Canvas 画布
                    width: 100,
                    height: 100
                })
                .toDataURL('image/png')       // 将 Canvas 画布上的内容，转化为 base64 格式的字符串
            $.ajax({
                method: 'POST',
                url: '/my/update/avatar',
                data: {
                    avatar: dataURL
                },
                success: function (res) {
                    if (res.status !== 0) {
                        return layer.msg(res.message, { icon: 2 })
                    }
                    layer.msg(res.message, { icon: 1 })
                    window.parent.getUserInfo()
                }
            })
        })
    })

})