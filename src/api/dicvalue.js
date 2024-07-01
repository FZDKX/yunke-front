import request from "../utils/request";
// 获取字典列表
export function doGetDicvalueList(pageNum, pageSize) {
    return request.get("/api/dicvalue/list", {
        params: {
            pageNum,
            pageSize
        }
    })
}

export function doGetDicvalue(id) {
    return request.get("/api/dicvalue/" + `${id}`)
}


export function doEditDicvalue(data) {
    return request.put("/api/dicvalue", data)
}

export function doAddDicvalue(data) {
    return request.post("/api/dicvalue", data)
}

export function doDelDicvalue(id) {
    return request.delete("/api/dicvalue/" + `${id}`)
}