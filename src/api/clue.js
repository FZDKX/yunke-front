import request from "../utils/request";

// 查询线索列表
export function doLoadCuleList(pageNum, pageSize) {
    return request.get("/api/clue/list", {
        params: {
            pageNum,
            pageSize
        }
    })
}

// 文件上传
export function doUploadExcel(data) {
    return request.post('/api/clue/upload', data);
}

// 获取单条线索数据
export function doLoadClue(id) {
    return request.get('/api/clue/' + `${id}`)
}

// 编辑
export function doEditClue(data) {
    return request.put('/api/clue' , data)
}

// 新增
export function doAddClue(data) {
    return request.post('/api/clue' , data)
}

// 删除
export function doDel(id) {
    return request.delete('/api/clue/' + `${id}`)
}