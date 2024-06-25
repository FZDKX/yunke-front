
import request from "../utils/request";

export function doAddCustomer(data) {
    return request.post('/api/customer', data);
}

export function doLoadCustomerList(pageNum, pageSize) {
    return request.get('/api/customer/list', {
        params: {
            pageNum,
            pageSize
        }
    })
}

export function doGetCustomer(id) {
    return request.get('/api/customer/' + `${id}`)
}

export function doEditCustomer(data) {
    return request.put('/api/customer', data)
}


export function doDelCustomer(id) {
    return request.delete('/api/customer/' + `${id}`)
}

// 如果没有 data
// 那么这样写
/*
export function doExportExcel() {
    return request.post('/api/customer/exportSelect', {} , {
        responseType: 'blob'
    });
}

*/
export function doExportExcel(ids) {
    return request.post('/api/customer/exportExcel', ids, {
        responseType: 'blob'
    });
}

