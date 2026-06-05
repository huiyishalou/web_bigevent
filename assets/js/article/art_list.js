$(function () {
    var layer = layui.layer
    var form = layui.form
    var laypage = layui.laypage
    // 查询参数对象
    var q = {
        pagenum: 1, // 页码值
        pagesize: 2, // 每页显示数据数
        cate_id: '', // 文章分类id
        state: '' // 文章发布状态
    }

    initTable()
    initCate()

    // 数字补零
    function padZero(n, m) {
        let str = String(n);
        while (str.length < m) {
            str = "0" + str;
        }
        return str;
    }

    // 时间格式化过滤器
    template.defaults.imports.dataFormater = function (date) {
        const dt = new Date(date)
        var y = dt.getFullYear()
        var m = padZero(dt.getMonth() + 1, 2)
        var d = padZero(dt.getDate(), 2)

        var hh = padZero(dt.getHours(), 2)
        var mm = padZero(dt.getMinutes(), 2)
        var ss = padZero(dt.getSeconds(), 2)
        return y + '-' + m + '-' + d + ' ' + hh + ':' + mm + ':' + ss
    }

    // 初始化文章列表数据
    function initTable() {
        $.ajax({
            method: 'GET',
            url: '/my/article/list',
            data: q,
            success: function (res) {
                if (res.status !== 0) {
                    layer.msg(res.message, { icon: 2 })
                }
                // 模板引擎渲染数据
                var table_htmlStr = template('tpl-table', res)
                $('.layui-table tbody').html(table_htmlStr)
                // layer.msg(res.message, { icon: 1 })
                // 调用渲染分页，根据总数据量渲染分页数量
                renderPage(res.total)
            }
        })
    }

    // 初始化文章分类
    function initCate() {
        $.ajax({
            method: 'GET',
            url: '/my/article/cates',
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg(res.message, { icon: 2 })
                }
                // 模板渲染分类列表
                var cate_htmlStr = template('tpl-cate', res)
                $('select[name=cate_id]').html(cate_htmlStr)
                // 对动态插入的数据重新渲染
                form.render()
            }
        })
    }
    // 筛选表单
    $('#form-search').on('submit', function (e) {
        e.preventDefault()
        var cate_id = $('[name=cate_id]').val()
        var state = $('[name=state]').val()
        q.cate_id = cate_id
        q.state = state
        initTable()
    })
    // 渲染分页
    // 注：renderPage的jump方法调用时机：1.主动切换页码;2.laypage.render实例化同样会调用jump
    function renderPage(total) {
        //执行一个laypage实例
        laypage.render({
            elem: 'pageBox' // 注意，这里的 test1 是 ID，不用加 # 号
            , count: total, // 数据总数，从服务端得到
            limit: q.pagesize, // 每页显示数据量
            curr: q.pagenum, // 当前处于第几页
            // 分页触发事件
            // first：代表jump方式是实例化触发的(true)，还是点击页码触发的(undefined)
            jump: function (obj, first) {
                q.pagenum = obj.curr
                q.pagesize = obj.limit
                // initTable() // 这里直接调用初始化方法会死循环
                if (!first) {
                    initTable() // 这里标识只有点击页码才会重新渲染列表
                }
            },
            layout: ['prev', 'page', 'next', 'count', 'limit', 'refresh', 'skip'],
            limits: [2, 4, 8, 10, 12]
        });
    }
    // 删除文章按钮
    $('.layui-table tbody').on('click', '.btn-delete', function () {
        // 获取剩余删除按钮数，决定删除完毕是否加载上一页数据
        var del_btn_num = $('.btn-delete').length
        var id = $(this).attr('data-id')
        var del_index = layer.confirm('确定删除?', { icon: 3, title: '提示' }, function (index) {
            $.ajax({
                method: 'GET',
                url: '/my/article/delete/' + id,
                success: function (res) {
                    if (res.status !== 0) {
                        return layer.msg(res.message, { icon: 2 })
                    }
                    layer.msg(res.message, { icon: 1 })
                    // 判断当前页码是否还有数据，否则加载上一页数据
                    if (del_btn_num === 1 && q.pagenum !== 1) {
                        q.pagenum = q.pagenum - 1
                    }
                    initTable()
                }
            })
            layer.close(del_index);
        });
    })
})
