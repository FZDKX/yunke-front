import request from "../utils/request";

export function doAddTran(data) {
    return request.post('/api/tran', data);
}

export function doGetTranList(pageNum, pageSize) {
    return request.get("/api/tran/list", {
        params: {
            pageNum,
            pageSize
        }
    })
}

export function doGetTranHistory(tranId) {
    return request.get("/api/tran/history", {
        params: {
            tranId
        }
    })
}

export function doGetTran(id) {
    return request.get("/api/tran/" + `${id}`)
}

export function doUpdateTran(data) {
    return request.put('/api/tran', data);
}

export function doEditTran(data) {
    return request.put('/api/tran/edit', data);
}


export function doDelTran(id) {
    return request.delete('/api/tran/' + `${id}`);
}