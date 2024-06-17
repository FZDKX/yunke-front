import request from "../utils/request";

export function doLoadRole(pageNum, pageSize) {
    return request.get("/api/role/list", {
        params: {
            pageNum,
            pageSize
        }
    })
}

// 加载角色所有权限，权限详情
export function doLoadRolePerm(id) {
    return request.get("/api/role/perm/" + `${id}`)
}

// 打开编辑页面
export function doLoadEdit(id) {
    return request.get("/api/role/detail/" + `${id}`)
}

// 编辑角色
export function doEditRolePerm(data) {
    return request.put("/api/role", data)
}

// 新增角色
export function doAddRole(data) {
    return request.post("/api/role", data)
}

// 删除单个
export function doDelRole(id) {
    return request.delete("/api/role/" + `${id}`)
}

// 批量删除
export function doDelBatchRole(ids) {
    return request.delete("/api/role/batch", {
        data: {
            ids
        }
    })
}

// 获取所有角色信息
export function doGetAllRoles() {
    return request.get("/api/role/all")
}