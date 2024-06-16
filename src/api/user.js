import request from "../utils/request";

// 用户分页查询
// 查所有
export function doLoadUsers(pageNum, pageSize) {
    return request.get('/api/user/list', {
        params: {
            pageNum,
            pageSize
        }
    })
}

// 查具体信息
export function doGetUserDetails(id) {
    return request.get('/api/user/details/' + `${id}`)
}

// 查单个
export function doGetUser(id) {
    return request.get('/api/user/' + `${id}`)
}

// 增
export function doAddUser(userInfo) {
    return request.post('/api/user', userInfo)
}

// 改
export function doEditUser(userInfo) {
    return request.put('/api/user', userInfo)
}

// 删
export function doDelUser(id) {
    return request.delete('/api/user/' + `${id}`)
}

// 批量删除
export function doBatchDel(ids) {
    return request.delete('/api/user/batch', {
        data: {
            ids
        }
    })
}