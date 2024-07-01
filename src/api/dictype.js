import request from "../utils/request";
// 获取字典列表
export function doGetDictypeList(pageNum, pageSize) {
    return request.get("/api/dictype/list", {
        params: {
            pageNum,
            pageSize
        }
    })
}

export function doGetDictype(id) {
    return request.get("/api/dictype/" + `${id}`)
}


export function doEditDictype(data) {
    return request.put("/api/dictype", data)
}

export function doAddDictype(data) {
    return request.post("/api/dictype", data)
}

export function doDelDictype(id) {
    return request.delete("/api/dictype/" + `${id}`)
}

// 加载字典类型列表
export function doGetAllDicType() {
    return request.get("/api/dictype/all")
}
