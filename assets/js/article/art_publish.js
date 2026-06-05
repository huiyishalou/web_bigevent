$(function () {
    var form = layui.form
    var layer = layui.layer
    initCate()
    // 初始化富文本编辑器
    initEditor()
    // 图片裁剪
    // 1. 初始化图片裁剪器
    var $image = $('#image')

    // 2. 裁剪选项
    var options = {
        aspectRatio: 400 / 280,
        preview: '.img-preview'
    }

    // 3. 初始化裁剪区域
    $image.cropper(options)

    // 封面文件选择
    $('#upload_file').on('change', function (e) {
        var files = e.target.files
        if (files.length === 0) {
            return layer.msg('请选择上传图片！', { icon: 2 })
        }
        var file = files[0]
        var file_url = URL.createObjectURL(file)
        $image
            .cropper('destroy')
            .attr('src', file_url)
            .cropper(options)
    })
    $('.btn-select').on('click', function () {
        $('#upload_file').click()
    })

    // 加载文章分类
    function initCate() {
        $.ajax({
            method: 'GET',
            url: '/my/article/cates',
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg(res.message, { icon: 2 })
                }
                // 模板渲染分类列表
                var cate_htmlStr = template('tpl-artCate', res)
                $('select[name=cate_id]').html(cate_htmlStr)
                // 对动态插入的数据重新渲染
                form.render()
            }
        })
    }
    // 发布文章
    var art_status = '已发布' // 默认'已发布'，点击存为草稿按钮则修改为'草稿'
    $('#btn-save2').on('click', function () {
        art_status = '草稿'
    })
    // 表单提交
    $('#form-pub').on('submit', function (e) {
        e.preventDefault()
        var fd = new FormData($(this)[0])
        fd.append('state', art_status)
        // 将裁剪后的图片转换为base64串
        $image
            .cropper('getCroppedCanvas', { // 创建一个 Canvas 画布
                width: 400,
                height: 300
            })
            .toBlob(function (blob) {
                fd.append('cover_img', blob, 'cover.jpg')
                for (let [k,v] of fd.entries()) {
                    console.log(k,v)
                }
                publishArt(fd)
            }, 'image/jpeg', 0.9) // 将 Canvas 画布上的内容，转为文件对象，blob为返回的文件数据对象
    })
    // 发表文章
    function publishArt(fd) {
        $.ajax({
            method: 'POST',
            url: '/my/article/add',
            data: fd,
            processData: false,
            contentType: false,
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg(res.message, { icon: 2 })
                }
                layer.msg(res.message, { icon: 1 })
                // 返回文章列表页面
                location.href = '/article/art_list.html'
            }
        })
    }
})