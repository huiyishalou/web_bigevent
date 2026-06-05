$(function () {
    var layer = layui.layer
    var form = layui.form
    initArticleList()
    var dialog_index = 0
    // 添加类别
    $('#btn_addCate').on('click', function () {
        dialog_index = layer.open({
            type: 1,
            area: ['500px', '300px'],
            title: '添加文章分类',
            content: $('#dialog-add').html()
        });
    })
    // 确认添加按钮
    // 由于采用脚本形式，因此在未点击添加类别按钮时，没有表单dom元素，因此采用代理添加事件
    $('body').on('submit', '#form-add', function (e) {
        e.preventDefault()
        $.ajax({
            method: 'POST',
            url: '/my/article/addCates',
            data: $(this).serialize(),
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg(res.message, { icon: 2 })
                }
                layer.msg(res.message, { icon: 1 })
                initArticleList()
                layer.close(dialog_index)
            }
        })
    })
    // 列编辑按钮
    var edit_index = 0
    $('tbody').on('click', '.btn-edit', function () {
        edit_index = layer.open({
            type: 1,
            area: ['500px', '300px'],
            title: '修改文章分类',
            content: $('#dialog-edit').html()
        })
        // 获取编辑行数据
        var curID = $(this).attr('data-id')
        $.ajax({
            method: 'GET',
            url: '/my/article/cates/' + curID,
            success: function (res) {
                if (res.status !== 0) {
                    layer.msg(res.message, { icon: 2 })
                }
                form.val('form-edit', res.data);
                // layer.msg(res.message, { icon: 1 })
            }
        })
    })
    // 确认修改按钮，body代理
    $('body').on('submit', '#form-edit', function (e) {
        e.preventDefault()
        $.ajax({
            method: 'POST',
            url: '/my/article/updatecate',
            data: $(this).serialize(),
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg(res.message, { icon: 2 })
                }
                layer.msg(res.message, { icon: 1 })
                layer.close(edit_index)
                initArticleList()
            }
        })
    })
    // 删除按钮
    $('tbody').on('click', '.btn-delete', function () {
        var Id = $(this).attr('data-id')
        var del_index = layer.confirm('确认删除?', { icon: 3, title: '提示' }, function (index) {
            layer.close(del_index);
        });
        $.ajax({
            method: 'GET',
            url: '/my/article/deletecate/' + Id,
            success: function (res) {
                if (res.status !== 0) {
                    layer.msg(res.message, { icon: 2 })
                }
                layer.msg(res.message, { icon: 1 })
            }
        })
    })
})
function initArticleList() {
    $.ajax({
        method: 'GET',
        url: '/my/article/cates',
        success: function (res) {
            if (res.status !== 0) {
                return layer.msg(res.message, { icon: 2 })
            }
            var htmlStr = template("tpl-table", res)
            $('.layui-table tbody').html(htmlStr)
        }
    })
}