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