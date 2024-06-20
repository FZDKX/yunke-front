import request from "../utils/request"

// 加载备注列表
export function doLoadRemarkList(id, pageNum, pageSize) {
    return request.get("/api/remark/list/" + `${id}`, {
        params: {
            pageNum,
            pageSize
        }
    })
}

// 加载单个备注信息
export function doGetRemark(id) {
    return request.get("/api/remark/" + `${id}`)
}

// 编辑
export function doEditRemark(data) {
    return request.put("/api/remark", data)
}


// 新增
export function doAddRemark(data) {
    return request.post("/api/remark", data)
}

// 删除
export function doDelRemark(id) {
    return request.delete("/api/remark/" + `${id}`)
}
