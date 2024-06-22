import request from "../utils/request"

// 加载备注列表
export function doLoadClueRemarkList(id, pageNum, pageSize) {
    return request.get("/api/clueRemark/list/" + `${id}`, {
        params: {
            pageNum,
            pageSize
        }
    })
}

// 加载单个备注信息
export function doGetClueRemark(id) {
    return request.get("/api/clueRemark/" + `${id}`)
}

// 编辑
export function doEditClueRemark(data) {
    return request.put("/api/clueRemark", data)
}


// 新增
export function doAddClueRemark(data) {
    return request.post("/api/clueRemark", data)
}

// 删除
export function doDelClueRemark(id) {
    return request.delete("/api/clueRemark/" + `${id}`)
}
