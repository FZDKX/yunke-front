import request from "../utils/request";

// 页面加载时查询
export function doLoadPermList(pageNum, pageSize) {
    return request.get('/api/perm/' + `${pageNum}` + '/' + `${pageSize}`)
}

// 加载子节点
export function doLoadChildren(id) {
    return request.get('/api/perm/children/' + `${id}`)
}

// 加载所有权限
export function doLoadPermAll() {
    return request.get('/api/perm/all')
}

// 加载单个权限
export function doLoadPerm(id) {
    return request.get('/api/perm/' + `${id}`)
}

// 修改权限
export function doEditPerm(data) {
    return request.put('/api/perm', data)
}

// 新增权限
export function doAddPerm(data) {
    return request.post('/api/perm', data)
}

// 删除单个
export function doDel(id) {
    return request.delete('/api/perm/' + `${id}`)
}

// 批量删除
export function doBatchDel(ids) {
    return request.delete('/api/perm', {
        data: {
            ids
        }
    })
}