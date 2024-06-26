import request from "../utils/request";

// 查询线索字典
export function doLoadClueDic() {
    return request.get("/api/dic/clue")
}

// 加载线索备注字典
export function doLoadRemarkDic() {
    return request.get("/api/dic/remark")
}

// 加载产品列表
export function doLoadCustomerDic() {
    return request.get("/api/dic/customer")
}


export function doGetTranStageList() {
    return request.get("/api/dic/stage")
}