import request from "../utils/request"

// 加载备注列表
export function doLoadCustomerRemarkList(id, pageNum, pageSize) {
    return request.get("/api/customerRemark/list/" + `${id}`, {
        params: {
            pageNum,
            pageSize
        }
    })
}

// 加载单个备注信息
export function doGetCustomerRemark(id) {
    return request.get("/api/customerRemark/" + `${id}`)
}

// 编辑
export function doEditCustomerRemark(data) {
    return request.put("/api/customerRemark", data)
}


// 新增
export function doAddCustomerRemark(data) {
    return request.post("/api/customerRemark", data)
}

// 删除
export function doDelCustomerRemark(id) {
    return request.delete("/api/customerRemark/" + `${id}`)
}
