import request from "../utils/request"

// 加载备注列表
export function doLoadTranRemarkList(id, pageNum, pageSize) {
    return request.get("/api/tranRemark/list/" + `${id}`, {
        params: {
            pageNum,
            pageSize
        }
    })
}

// 加载单个备注信息
export function doGetTranRemark(id) {
    return request.get("/api/tranRemark/" + `${id}`)
}

// 编辑
export function doEditTranRemark(data) {
    return request.put("/api/tranRemark", data)
}


// 新增
export function doAddTranRemark(data) {
    return request.post("/api/tranRemark", data)
}

// 删除
export function doDelTranRemark(id) {
    return request.delete("/api/tranRemark/" + `${id}`)
}
