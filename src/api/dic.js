import request from "../utils/request";

// 查询线索字典
export function doLoadClueDic() {
    return request.get("/api/dic/clue")
}

// 加载线索备注字典
export function doLoadClueRemarkDic() {
    return request.get("/api/dic/clueRemark")
}
